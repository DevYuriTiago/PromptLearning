-- Atualizar tabela de módulos
ALTER TABLE modules ADD COLUMN IF NOT EXISTS
  category TEXT,
  thumbnail_url TEXT,
  description TEXT,
  estimated_time INTEGER,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  requirements TEXT[],
  learning_objectives TEXT[];

-- Criar tabela de categorias
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de materiais complementares
CREATE TABLE supplementary_materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('video', 'audio', 'document', 'link')),
  url TEXT NOT NULL,
  description TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de trilhas de aprendizado
CREATE TABLE learning_paths (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de relação entre trilhas e módulos
CREATE TABLE learning_path_modules (
  learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  order_index INTEGER,
  PRIMARY KEY (learning_path_id, module_id)
);

-- Criar tabela de notas e anotações
CREATE TABLE notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  page_number INTEGER,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de favoritos
CREATE TABLE favorites (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (user_id, module_id)
);

-- Criar tabela de avaliações
CREATE TABLE ratings (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (user_id, module_id)
);

-- Criar tabela de sessões de estudo
CREATE TABLE study_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- em segundos
  pages_viewed INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Atualizar tabela de conquistas com mais detalhes
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS
  title TEXT,
  description TEXT,
  icon TEXT,
  criteria JSONB,
  xp_points INTEGER DEFAULT 0;

-- Criar função para calcular média de avaliações
CREATE OR REPLACE FUNCTION update_module_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE modules
  SET rating = (
    SELECT AVG(rating)::DECIMAL(3,2)
    FROM ratings
    WHERE module_id = NEW.module_id
  )
  WHERE id = NEW.module_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar avaliação do módulo
CREATE TRIGGER update_module_rating_trigger
AFTER INSERT OR UPDATE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_module_rating();

-- Políticas de segurança para as novas tabelas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplementary_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para as novas tabelas
CREATE POLICY "Público pode ver categorias" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin pode gerenciar categorias" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Público pode ver materiais complementares" ON supplementary_materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin pode gerenciar materiais complementares" ON supplementary_materials FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Público pode ver trilhas" ON learning_paths FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin pode gerenciar trilhas" ON learning_paths FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Usuários podem gerenciar suas notas" ON notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem gerenciar seus favoritos" ON favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem gerenciar suas avaliações" ON ratings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem ver suas sessões de estudo" ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Sistema pode criar sessões de estudo" ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
