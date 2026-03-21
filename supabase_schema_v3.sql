-- TABLA PARA GUARDAR LAS PRÁCTICAS DIARIAS DE LOS USUARIOS
create table public.user_practices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  situacion text,
  interpretacion text,
  reinterpretacion text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (RLS)
alter table public.user_practices enable row level security;

-- Políticas de Seguridad
create policy "Users can view their own practices" on public.user_practices
  for select using (auth.uid() = user_id);

create policy "Users can insert their own practices" on public.user_practices
  for insert with check (auth.uid() = user_id);

-- Opcional: Permitir eliminar si se desea
create policy "Users can delete their own practices" on public.user_practices
  for delete using (auth.uid() = user_id);
