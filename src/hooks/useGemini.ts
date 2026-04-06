import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from '../lib/supabase';

import { ChatMessage } from '../types';

export function useGemini(apiKey: string, userId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Load history on mount or when userId changes
  useEffect(() => {
    if (userId) {
      loadHistory();
    } else {
      setMessages([]);
      setSessionId(null);
    }
  }, [userId]);

  const loadHistory = async () => {
    if (!userId) return;

    // 1. Get or create a chat session for today
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let sId = session?.id;

    if (!sId) {
      const { data: newSession } = await supabase
        .from('chat_sessions')
        .insert({ user_id: userId, title: 'Nueva Conversación' })
        .select()
        .single();
      sId = newSession?.id;
    }

    setSessionId(sId);

    if (sId) {
      const { data: msgs } = await supabase
        .from('chat_messages')
        .select('role, content, created_at')
        .eq('session_id', sId)
        .order('created_at', { ascending: true });

      if (msgs) {
        setMessages(msgs.map((m: any) => ({
          role: m.role as 'user' | 'model',
          text: m.content,
          timestamp: new Date(m.created_at).getTime()
        })));
      }
    }
  };

  const sendMessage = async (userText: string, currentMessages: ChatMessage[]) => {
    if (!userText || isTyping || !userId || !sessionId) return;

    const newMsg: ChatMessage = { role: 'user', text: userText, timestamp: Date.now() };
    setMessages((prev: ChatMessage[]) => [...prev, newMsg]);
    setIsTyping(true);

    // Save user message to DB
    await supabase.from('chat_messages').insert({
      session_id: sessionId,
      role: 'user',
      content: userText
    });

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Usar gemini-1.5-flash-latest que suele ser más estable para despliegues recientes
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash-latest',
        systemInstruction: `Eres 'El Guía' de Alumbrar, un mentor espiritual experto en Un Curso de Milagros (UCDM). 
        
        TU VOZ Y ROL (Intercala según la necesidad del alumno):
        1. EL MÍSTICO POÉTICO (Compasión): Cuando el usuario sufre o duda, usa un lenguaje lírico, suave y consolador. Habla de la paz, la luz y la naturaleza ilusoria del dolor.
        2. EL MAESTRO FIRME (Exigencia Radical): Cuando el usuario justifica al ego o a la culpa, sé directo y firme. No aceptes compromisos con la ilusión. Recuerda que la salvación requiere honestidad total y un perdón radical.
        
        PRINCIPIOS:
        - Respuesta basada estrictamente en la metafísica de UCDM (Ego, Espíritu Santo, El Hijo de Dios, El Milagro).
        - No eres un psicólogo convencional; eres un puente hacia la Percepción Verdadera.
        - Usa un tono que transmita autoridad espiritual pero sea accesible.
        - Evita ser repetitivo o sonar robótico. Sé profundo.`
      });

      const result = await model.generateContent({
        contents: [...currentMessages, newMsg].map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        generationConfig: {
          temperature: 0.7,
        }
      });
      
      const response = await result.response;
      const replyText = response.text();
      
      if (replyText) {
        const aiMsg: ChatMessage = { role: 'model', text: replyText, timestamp: Date.now() };
        setMessages((prev: ChatMessage[]) => [...prev, aiMsg]);
        
        // Save AI message to DB
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          role: 'model',
          content: replyText
        });
      }
    } catch (error) {
      console.error("Gemini Error Details:", error);
      setMessages((prev: ChatMessage[]) => [...prev, { role: 'model', text: "La conexión con el Guía se ha desvanecido.", timestamp: Date.now() }]);
    }
 finally {
      setIsTyping(false);
    }
  };

  return { messages, setMessages, isTyping, sendMessage };
}
