import { supabase } from './supabase';

export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, plan_id')
    .eq('user_id', userId)
    .maybeSingle(); // Usar maybeSingle para evitar errores si no hay suscripción

  if (error || !data) return { isPremium: false, plan: 'free' };
  
  return { 
    isPremium: data.status === 'active', 
    plan: data.plan_id 
  };
}

export async function getMessageCount(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  // chat_messages no tiene user_id directamente, hay que unir con chat_sessions
  const { count, error } = await supabase
    .from('chat_messages')
    .select('id, chat_sessions!inner(user_id)', { count: 'exact', head: true })
    .eq('chat_sessions.user_id', userId)
    .gte('created_at', today);

  if (error) {
    console.error("Error fetching message count:", error);
    return 0;
  }

  return count || 0;
}
