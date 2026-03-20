import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// No inicializamos si faltan las claves para evitar el crash (White Screen)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: Falta configurar VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en las variables de entorno.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);
