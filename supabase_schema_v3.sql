-- SCHEMA v3: Alumbrar - Integración Stripe
-- Corre este SQL en el Editor SQL de Supabase DESPUÉS del schema v1 y v2.

-- 1. Agregar columnas de Stripe a la tabla subscriptions
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Índices para búsquedas rápidas del webhook
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON public.subscriptions(stripe_subscription_id);

-- 2. Agregar tabla user_snippets si no existe
CREATE TABLE IF NOT EXISTS public.user_snippets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  source TEXT DEFAULT 'Guía Espiritual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_snippets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own snippets" ON public.user_snippets;
CREATE POLICY "Users can manage their own snippets" ON public.user_snippets
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Política para que el service role (webhook) pueda escribir suscripciones
--    sin necesitar un JWT de usuario
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- NOTA: La política anterior permite al service role escribir.
-- La política de usuarios (solo ven la suya) sigue siendo la principal para el cliente.

-- 4. user_favorites: asegurar que tiene gema_id como texto también (por si se usa con DB gems)
--    (sin cambios al schema existente, solo documental)

-- 5. Resumen de variables de entorno necesarias:
--
-- En Supabase Dashboard > Settings > Edge Functions > Secrets:
--   STRIPE_SECRET_KEY          -> sk_live_xxxx  (o sk_test_xxxx para pruebas)
--   STRIPE_WEBHOOK_SECRET      -> whsec_xxxx   (del dashboard de Stripe Webhooks)
--   SITE_URL                   -> https://alumbrar.com.ar
--   SUPABASE_SERVICE_ROLE_KEY  -> (ya disponible automáticamente en Edge Functions)
--
-- En .env.local (frontend):
--   VITE_STRIPE_PUBLISHABLE_KEY   -> pk_live_xxxx
--   VITE_STRIPE_PRICE_MONTHLY     -> price_xxxx  (ID del precio mensual en Stripe)
--   VITE_STRIPE_PRICE_ANNUAL      -> price_xxxx  (ID del precio anual en Stripe)
--
-- En Stripe Dashboard > Webhooks:
--   Endpoint URL: https://<tu-proyecto>.supabase.co/functions/v1/stripe-webhook
--   Eventos a escuchar:
--     - customer.subscription.created
--     - customer.subscription.updated
--     - customer.subscription.deleted
--     - checkout.session.completed
--     - invoice.payment_failed
