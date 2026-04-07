import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Lesson } from '../types';

export function useLessons(apiKey: string) {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [lessonContent, setLessonContent] = useState<string | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);

  const loadLesson = async (num: number) => {
    setSelectedLesson(num);
    setLessonContent(null);
    setIsLoadingLesson(true);
    
    try {
      // 1. Intentar cargar desde Supabase
      const { data: dbLesson, error: dbError } = await supabase
        .from('lessons')
        .select('content')
        .eq('number', num)
        .single();

      // Si el contenido existe y es suficientemente largo (no es un placeholder)
      if (dbLesson && !dbError && dbLesson.content.length > 300) {
        setLessonContent(dbLesson.content);
        return;
      }

      // 2. Generar con IA si no hay o es muy corto
      if (!apiKey) {
        throw new Error("Clave de API de Gemini no configurada.");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-3-flash' });
      const prompt = `Actúa como un maestro experto y profundo en Un Curso de Milagros. Proporciona un resumen inspirador de la Lección ${num}. Estructúralo con: 1. El concepto central. 2. Una explicación profunda para la vida diaria. 3. Una práctica concreta para hoy. Usa un tono que transmita paz y verdad. Evita introducciones genéricas, ve directo a la esencia.`;
      
      const result = await model.generateContent(prompt);
      const fullContent = (await result.response).text() || "La Verdad espera tu reconocimiento silencioso.";
      
      setLessonContent(fullContent);

      // 3. Auto-llenado: Guardar en la DB para la próxima vez
      const { error: upsertError } = await supabase
        .from('lessons')
        .upsert({ 
          number: num, 
          title: `Lección ${num}`, 
          content: fullContent 
        }, { onConflict: 'number' });

      if (upsertError) {
        console.error("Supabase SAVE Error (RLS?):", upsertError);
      }

    } catch (e: any) {
      console.error("Lesson Error:", e);
      setLessonContent(`Disculpa, hubo un problema al sintonizar la lección. ${e.message || ""}`);
    } finally {
      setIsLoadingLesson(false);
    }
  };

  return {
    selectedLesson,
    setSelectedLesson,
    lessonContent,
    isLoadingLesson,
    loadLesson
  };
}
