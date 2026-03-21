import { supabase } from './supabase';

export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// Price IDs de Stripe – actualizar con los IDs reales del dashboard
export const PRICE_IDS = {
  premium_monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_premium_monthly',
  premium_annual: import.meta.env.VITE_STRIPE_PRICE_ANNUAL || 'price_premium_annual',
} as const;

export type PlanType = keyof typeof PRICE_IDS;

export async function createCheckoutSession(
  priceId: string,
  planType: PlanType = 'premium_monthly'
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Debes iniciar sesión para suscribirte.');
  }

  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { priceId, planType },
  });

  if (error) {
    throw new Error(error.message || 'Error al crear la sesión de pago.');
  }

  if (!data?.url) {
    throw new Error('No se recibió la URL de pago.');
  }

  // Redirigir a Stripe Checkout
  window.location.href = data.url;
}

// Abre el portal de Stripe para gestionar/cancelar la suscripción
export async function openCustomerPortal(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No autenticado.');

  const { data, error } = await supabase.functions.invoke('customer-portal', {
    body: {},
  });

  if (error || !data?.url) {
    throw new Error('No se pudo abrir el portal de gestión.');
  }

  window.location.href = data.url;
}
