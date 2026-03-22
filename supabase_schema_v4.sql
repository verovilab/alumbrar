-- ============================================
-- ALUMBRAR - SISTEMA DE REFLEXIONES PERSONALIZADAS (V4)
-- Compatible con tabla lessons existente
-- ============================================

-- 1. CREAR TABLA DE SENTIMIENTOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.feelings (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10),
  category VARCHAR(20) NOT NULL CHECK (category IN ('expansivo', 'neutro', 'contractivo')),
  color_hex VARCHAR(7) NOT NULL,
  color_name VARCHAR(20),
  sort_order INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_feelings_category ON public.feelings(category);
CREATE INDEX IF NOT EXISTS idx_feelings_name ON public.feelings(name);

-- 2. INSERTAR LOS 18 SENTIMIENTOS
-- ============================================

INSERT INTO public.feelings (name, display_name, emoji, category, color_hex, color_name, sort_order)
VALUES 
  -- EXPANSIVOS (6)
  ('paz', 'Paz', '🕊️', 'expansivo', '#10b981', 'green', 1),
  ('gratitud', 'Gratitud', '🙏', 'expansivo', '#10b981', 'green', 2),
  ('confianza', 'Confianza', '✨', 'expansivo', '#10b981', 'green', 3),
  ('amor', 'Amor', '❤️', 'expansivo', '#10b981', 'green', 4),
  ('esperanza', 'Esperanza', '🌟', 'expansivo', '#10b981', 'green', 5),
  ('alegria', 'Alegría', '😊', 'expansivo', '#10b981', 'green', 6),
  
  -- NEUTROS (6)
  ('confusion', 'Confusión', '🌫️', 'neutro', '#f59e0b', 'amber', 7),
  ('incertidumbre', 'Incertidumbre', '🤔', 'neutro', '#f59e0b', 'amber', 8),
  ('vacio', 'Vacío', '🌑', 'neutro', '#f59e0b', 'amber', 9),
  ('cansancio', 'Cansancio', '😴', 'neutro', '#f59e0b', 'amber', 10),
  ('ansiedad', 'Ansiedad', '😰', 'neutro', '#f59e0b', 'amber', 11),
  ('soledad', 'Soledad', '😞', 'neutro', '#f59e0b', 'amber', 12),
  
  -- CONTRACTIVOS (6)
  ('miedo', 'Miedo', '😨', 'contractivo', '#ef4444', 'red', 13),
  ('tristeza', 'Tristeza', '😢', 'contractivo', '#ef4444', 'red', 14),
  ('ira', 'Ira', '😠', 'contractivo', '#ef4444', 'red', 15),
  ('culpa', 'Culpa', '😔', 'contractivo', '#ef4444', 'red', 16),
  ('frustracion', 'Frustración', '😤', 'contractivo', '#ef4444', 'red', 17),
  ('resentimiento', 'Resentimiento', '😒', 'contractivo', '#ef4444', 'red', 18)
ON CONFLICT (name) DO NOTHING;

-- 3. CREAR TABLA DE REFLEXIONES PRE-GENERADAS (OPCIONAL/CACHE)
-- ============================================

CREATE TABLE IF NOT EXISTS public.lesson_reflections (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  lesson_number INT NOT NULL,
  feeling_id UUID NOT NULL,
  reflection TEXT NOT NULL,
  practice TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  
  -- Foreign keys
  CONSTRAINT fk_lesson 
    FOREIGN KEY (lesson_number) 
    REFERENCES public.lessons(number) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_feeling 
    FOREIGN KEY (feeling_id) 
    REFERENCES public.feelings(id) 
    ON DELETE CASCADE,
  
  -- Única reflexión por lección + sentimiento
  CONSTRAINT unique_lesson_feeling 
    UNIQUE(lesson_number, feeling_id)
);

-- 4. CREAR TABLA DE REGISTRO DIARIO DE USUARIOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.daily_reflections (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL,
  lesson_number INT NOT NULL,
  feeling_id UUID NOT NULL,
  user_input TEXT,
  reflection_text TEXT NOT NULL,
  practice_text TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  
  CONSTRAINT fk_user 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_daily_lesson 
    FOREIGN KEY (lesson_number) 
    REFERENCES public.lessons(number) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_daily_feeling 
    FOREIGN KEY (feeling_id) 
    REFERENCES public.feelings(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT unique_user_date 
    UNIQUE(user_id, date)
);

-- 5. CREAR VISTA PARA MAPA DE CALOR
-- ============================================

CREATE OR REPLACE VIEW user_emotion_heatmap AS
SELECT 
  dr.user_id,
  dr.date,
  EXTRACT(DOW FROM dr.date)::INT as day_of_week,
  EXTRACT(WEEK FROM dr.date)::INT as week_number,
  EXTRACT(MONTH FROM dr.date)::INT as month_number,
  EXTRACT(YEAR FROM dr.date)::INT as year_number,
  f.display_name as feeling,
  f.category,
  f.color_hex,
  f.emoji,
  l.number as lesson_number,
  l.title as lesson_title,
  dr.user_input,
  dr.created_at
FROM daily_reflections dr
JOIN feelings f ON dr.feeling_id = f.id
JOIN lessons l ON dr.lesson_number = l.number
ORDER BY dr.date DESC;

-- 6. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.feelings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Feelings are viewable by everyone" ON public.feelings FOR SELECT USING (true);

ALTER TABLE public.lesson_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lesson reflections are viewable by everyone" ON public.lesson_reflections FOR SELECT USING (true);

ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own daily reflections" ON public.daily_reflections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily reflections" ON public.daily_reflections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily reflections" ON public.daily_reflections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily reflections" ON public.daily_reflections FOR DELETE USING (auth.uid() = user_id);
