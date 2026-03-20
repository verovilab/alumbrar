import { supabase } from './supabase';

export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, plan_id')
    .eq('user_id', userId)
    .single();

  if (error || !data) return { isPremium: false, plan: 'free' };
  
  return { 
    isPremium: data.status === 'active', 
    plan: data.plan_id 
  };
}

export async function getMessageCount(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const { count } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', today);

  return count || 0;
}
