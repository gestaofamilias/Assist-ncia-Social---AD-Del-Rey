-- ===============================================================
-- SCRIPT DE CONFIGURAÇÃO COMPLETO - SUPABASE
-- ===============================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Famílias
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  responsible_name TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'Stable',
  status_description TEXT,
  address TEXT,
  neighborhood TEXT,
  phone TEXT,
  whatsapp TEXT,
  church_member BOOLEAN DEFAULT false,
  congregation TEXT,
  income DECIMAL(10,2),
  social_class TEXT,
  professional_status TEXT,
  main_need TEXT,
  observations TEXT,
  members JSONB DEFAULT '[]',
  history JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- 3. Tabela de Registros Financeiros (Caixa)
CREATE TABLE IF NOT EXISTS financial_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL, -- 'Income' ou 'Expense'
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  responsible TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- 4. Tabela de Estoque
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

-- 5. Habilitar Segurança (RLS) em todas as tabelas
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- 6. Criar Políticas de Acesso (Permitir tudo para usuários autenticados)
-- Nota: Em um cenário real, você pode querer restringir para que cada usuário veja apenas seus dados,
-- mas para uma igreja, geralmente todos os voluntários compartilham a mesma base.

CREATE POLICY "Acesso total para autenticados em familias" 
ON families FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Acesso total para autenticados em financeiro" 
ON financial_records FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Acesso total para autenticados em estoque" 
ON inventory_items FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
