-- Habilitar extensão de UUID se não estiver ativa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Estoque
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'un',
  expiration_date DATE,
  min_quantity DECIMAL(10,2),
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Habilitar Segurança (RLS)
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Criar política de acesso para usuários autenticados
CREATE POLICY "Permitir tudo para autenticados em estoque" 
ON inventory_items FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
