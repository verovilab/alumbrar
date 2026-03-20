import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export function useGemini(apiKey: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (userText: string, currentMessages: Message[]) => {
    if (!userText || isTyping) return;

    const newMsg: Message = { role: 'user', text: userText, timestamp: Date.now() };
    setMessages(prev => [...prev, newMsg]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI(apiKey);
      const model = ai.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: "Eres 'El Guía' de Camino a UCDM. Tu tono es profesional, poético y profundo, pero no hables como si fueras un guia sino sólo trasnmite información. Responde siempre basándote en Un Curso de Milagros. Ayuda al usuario a perdonar y encontrar paz."
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
        setMessages(prev => [...prev, { role: 'model', text: replyText, timestamp: Date.now() }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: "La sabiduría fluye, pero hubo un silencio en la conexión.", timestamp: Date.now() }]);
      }
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Asegúrate de tener tu API_KEY configurada para conectar con el Guía.", timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return { messages, setMessages, isTyping, sendMessage };
}
