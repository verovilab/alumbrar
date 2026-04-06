export type GemaCategory = 'Calma' | 'Perdón' | 'Percepción' | 'Confianza' | 'Relaciones' | 'Presencia';

export interface Gema {
  id: number | string;
  phrase: string;
  idea: string;
  action: string;
  mantra: string;
  category: GemaCategory | string;
  author?: string;
  is_daily?: boolean;
  created_at?: string;
}

export interface Lesson {
  number: number;
  title: string;
  content: string;
  created_at?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface Feeling {
  id: string;
  name: string;
  display_name: string;
  emoji: string;
  category: 'expansivo' | 'neutro' | 'contractivo';
  color_hex: string;
  color_name: string;
  sort_order: number;
}

export interface DailyReflection {
  id: string;
  user_id: string;
  lesson_number: number;
  feeling_id: string;
  user_input: string | null;
  reflection_text: string;
  practice_text: string;
  date: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'canceled' | 'incomplete';
  plan_id: string;
  current_period_end: string | null;
  created_at: string;
  isPremium: boolean;
}
