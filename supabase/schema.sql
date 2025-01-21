-- Reset database
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca de texto
CREATE EXTENSION IF NOT EXISTS "pgjwt";   -- Para tokens JWT

-- Basic schema permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT USAGE ON SCHEMA auth TO anon, authenticated;

-- Configuração de segurança
ALTER DATABASE postgres SET timezone TO 'America/Sao_Paulo';

-- Tabela de perfis
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  auth_id UUID UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student',
  points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de módulos
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  pdf_url TEXT NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 100,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de seções
CREATE TABLE IF NOT EXISTS public.sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES public.modules ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  section_id UUID REFERENCES public.sections ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de progresso
CREATE TABLE IF NOT EXISTS public.progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.modules ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES public.sections ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  score INTEGER NOT NULL DEFAULT 0,
  last_position INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, module_id, section_id)
);

-- Tabela de conquistas
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  requirement_data JSONB NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de conquistas do usuário
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, achievement_id)
);

-- Tabela de tópicos do fórum
CREATE TABLE IF NOT EXISTS public.forum_topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES public.modules ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de respostas do fórum
CREATE TABLE IF NOT EXISTS public.forum_replies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  topic_id UUID REFERENCES public.forum_topics ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Políticas de segurança RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

-- Políticas para perfis
CREATE POLICY "Perfis são visíveis para todos os usuários autenticados"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Usuários podem atualizar seus próprios perfis"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Políticas para módulos
CREATE POLICY "Módulos são visíveis para todos os usuários autenticados"
  ON public.modules FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Apenas administradores podem gerenciar módulos"
  ON public.modules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Políticas para seções
CREATE POLICY "Seções são visíveis para todos os usuários autenticados"
  ON public.sections FOR SELECT
  TO authenticated
  USING (TRUE);

-- Políticas para quizzes
CREATE POLICY "Quizzes são visíveis para todos os usuários autenticados"
  ON public.quizzes FOR SELECT
  TO authenticated
  USING (TRUE);

-- Políticas para progresso
CREATE POLICY "Usuários podem ver seu próprio progresso"
  ON public.progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seu próprio progresso"
  ON public.progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio progresso"
  ON public.progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para conquistas
CREATE POLICY "Conquistas são visíveis para todos os usuários autenticados"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (TRUE);

-- Políticas para conquistas do usuário
CREATE POLICY "Usuários podem ver suas próprias conquistas"
  ON public.user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para fórum
CREATE POLICY "Tópicos do fórum são visíveis para todos os usuários autenticados"
  ON public.forum_topics FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Usuários autenticados podem criar tópicos"
  ON public.forum_topics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem editar seus próprios tópicos"
  ON public.forum_topics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Respostas do fórum são visíveis para todos os usuários autenticados"
  ON public.forum_replies FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Usuários autenticados podem criar respostas"
  ON public.forum_replies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Funções e triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, auth_id, email, name, role)
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_achievement_earned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_points INTEGER;
  current_points INTEGER;
BEGIN
  -- Busca pontos da conquista
  SELECT points_reward INTO achievement_points
  FROM public.achievements
  WHERE id = NEW.achievement_id;

  -- Busca pontos atuais do usuário
  SELECT points INTO current_points
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Atualiza pontos do usuário
  UPDATE public.profiles
  SET
    points = current_points + achievement_points,
    level = FLOOR(SQRT((current_points + achievement_points) / 100)) + 1
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Trigger para criar perfil quando um novo usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger para atualizar pontos quando uma conquista é obtida
CREATE TRIGGER on_achievement_earned
  AFTER INSERT ON public.user_achievements
  FOR EACH ROW EXECUTE PROCEDURE public.handle_achievement_earned();

-- Inserir conquistas padrão
INSERT INTO public.achievements (title, description, type, requirement_data, points_reward)
VALUES
  ('Primeiro Módulo', 'Complete seu primeiro módulo', 'completion', '{"modules_required": 1}', 50),
  ('Estudante Dedicado', 'Complete 5 módulos', 'completion', '{"modules_required": 5}', 100),
  ('Mestre do Conhecimento', 'Complete 10 módulos', 'completion', '{"modules_required": 10}', 200),
  ('Pontuação Inicial', 'Alcance 500 pontos', 'score', '{"points_required": 500}', 100),
  ('Alta Pontuação', 'Alcance 1000 pontos', 'score', '{"points_required": 1000}', 200),
  ('Sequência de Estudos', 'Estude por 3 dias seguidos', 'streak', '{"days_required": 3}', 75),
  ('Primeira Pergunta', 'Faça sua primeira pergunta no fórum', 'special', '{"type": "first_forum_post"}', 50),
  ('Ajudante', 'Responda 5 perguntas no fórum', 'special', '{"type": "help_others", "replies_required": 5}', 100)
ON CONFLICT DO NOTHING;

-- Grant necessary privileges
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
