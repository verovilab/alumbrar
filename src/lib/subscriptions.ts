import { supabase } from './supabase';

export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, plan_id, current_period_end, stripe_customer_id, stripe_subscription_id')
    .eq('user_id', userId)
    .single();

  if (error || !data) return { isPremium: false, plan: 'free', currentPeriodEnd: null };

  return {
    isPremium: data.status === 'active',
    plan: data.plan_id,
    currentPeriodEnd: data.current_period_end,
    stripeCustomerId: data.stripe_customer_id,
    stripeSubscriptionId: data.stripe_subscription_id,
  };
}

// Cuenta los mensajes del usuario de hoy (via chat_sessions join)
export async function getMessageCount(userId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Traer los IDs de sesiones del usuario
  const { data: sessions } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('user_id', userId);

  if (!sessions || sessions.length === 0) return 0;

  const sessionIds = sessions.map((s: any) => s.id);

  const { count } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .in('session_id', sessionIds)
    .eq('role', 'user')
    .gte('created_at', today.toISOString());

  return count || 0;
}

export const FREE_MESSAGE_LIMIT = 5;
