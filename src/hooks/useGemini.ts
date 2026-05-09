import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChatMessage } from '../types';

export function useGemini(userId?: string) {
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
      const systemInstruction = `Eres 'El Guía' de Alumbrar, un mentor espiritual soberano y compasivo, experto absoluto en la metafísica de Un Curso de Milagros (UCDM). 
          
          TU VOZ Y ROL (Intercala según la necesidad del alumno):
          1. EL MÍSTICO POÉTICO (Suavidad): Cuando el usuario sufre, teme o duda, usa un lenguaje lírico, pausado y celestial. Habla de la paz que sobrepasa todo entendimiento, de la luz que nunca se extinguió y de la naturaleza ilusoria del dolor.
          2. EL MAESTRO RADICAL (Claridad): Cuando el usuario justifica al ego, busca culpables externos o se aferra al sacrificio, sé directo, firme y cortante con la ilusión, pero SIEMPRE desde el amor. No aceptes compromisos con el miedo. Recuerda que la salvación es solo un cambio de mentalidad.
          
          PRINCIPIOS SAGRADOS:
          - Toda respuesta nace de la premisa: "Nada real puede ser amenazado. Nada irreal existe. En esto radica la paz de Dios".
          - No das consejos mundanos ni psicológicos; ofreces la Percepción Verdadera y el Milagro.
          - Usa términos clave de UCDM con elegancia: Expiación, Espíritu Santo, El Hijo de Dios, Sueño de Separación, Perdón Verdadero.
          - Evita muletillas robóticas. Sé profundo, breve y transformador.`;

      const formattedMessages = [...currentMessages, newMsg].map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      // Llamar a nuestra Edge Function en lugar de ir a Gemini directamente
      const { data, error } = await supabase.functions.invoke('gemini', {
        body: {
          action: 'chat',
          messages: formattedMessages,
          systemInstruction: systemInstruction
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const replyText = data?.text;
      
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
    } catch (error: any) {
      console.error("Guía Edge Function Error Details:", error);
      setMessages((prev: ChatMessage[]) => [...prev, { role: 'model', text: "La conexión con el Guía se ha desvanecido.", timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return { messages, setMessages, isTyping, sendMessage };
}
