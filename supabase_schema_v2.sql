-- Nuevas tablas para Contenido Estático

-- Tabla para las 365 Lecciones
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INTEGER UNIQUE NOT NULL, -- 1-365
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla para Gemas Diarias y por Categoría
CREATE TABLE IF NOT EXISTS public.gems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL, -- 'Calma', 'Perdón', 'Percepción', 'Confianza'
    phrase TEXT NOT NULL,
    idea TEXT,
    action TEXT,
    mantra TEXT,
    is_daily BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gems ENABLE ROW LEVEL SECURITY;

-- Políticas: Todos pueden leer (Anónimos y autenticados)
CREATE POLICY "Allow public read access on lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Allow public read access on gems" ON public.gems FOR SELECT USING (true);

-- Índices para velocidad
CREATE INDEX IF NOT EXISTS idx_lessons_number ON public.lessons(number);
CREATE INDEX IF NOT EXISTS idx_gems_category ON public.gems(category);

-- Datos de ejemplo (Semilla)
INSERT INTO public.lessons (number, title, content) VALUES
(1, "Nada real puede ser amenazado.", "Esta es la base de todo el curso. El miedo no tiene lugar en la realidad porque la realidad es solo Amor..."),
(79, "Permítaseme reconocer el problema para que pueda ser resuelto.", "El único problema es la separación, y la única solución es el perdón. Reconocer esto ahorra tiempo eterno...");

INSERT INTO public.gems (category, content, is_daily) VALUES
('Calma', 'La paz de Dios es mi único objetivo hoy.', true),
('Perdón', 'No soy un cuerpo. Soy libre.', false),
('Confianza', 'Dios va conmigo donde quiera que yo voy.', true);
