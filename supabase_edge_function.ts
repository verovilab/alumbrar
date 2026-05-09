import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de peticiones CORS desde el navegador
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, prompt, messages, systemInstruction } = await req.json()
    
    // Obtenemos la llave secreta desde Supabase Secrets (¡nunca desde el frontend!)
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!apiKey) {
      throw new Error("La clave GEMINI_API_KEY no está configurada en los Secrets de Supabase.")
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    
    const modelConfig: any = { model: 'gemini-2.5-flash' }
    if (systemInstruction) {
      modelConfig.systemInstruction = systemInstruction
    }
    
    const model = genAI.getGenerativeModel(modelConfig)

    let textResponse = ""

    // Procesamos dependiendo de qué parte de tu app hace la llamada
    if (action === 'chat') {
      const result = await model.generateContent({ contents: messages })
      textResponse = await result.response.text()
    } 
    else if (action === 'lesson' || action === 'practice') {
      const result = await model.generateContent(prompt)
      textResponse = await result.response.text()
    } else {
      throw new Error("Acción no válida solicitada a la Edge Function.")
    }

    // Devolvemos el texto generado a la app de React
    return new Response(JSON.stringify({ text: textResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Error en Edge Function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
