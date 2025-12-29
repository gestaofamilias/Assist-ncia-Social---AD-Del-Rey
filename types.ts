export enum Status {
  Active = 'Active',
  Critical = 'Critical',
  Archived = 'Archived'
}

export enum AidType {
  FoodBasket = 'Cesta Básica',
  Clothes = 'Roupas',
  Medicine = 'Medicamentos',
  Financial = 'Financeiro',
  Spiritual = 'Apoio Espiritual',
  Gas = 'Gás',
  Other = 'Outros'
}

export enum TransactionType {
  Income = 'Income',
  Expense = 'Expense'
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  responsible: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  age: number;
  ageType?: 'Years' | 'Months';
  tags?: string[];
  avatarUrl?: string;
}

export interface HistoryRecord {
  id: string;
  date: string;
  type: 'Visit' | 'Aid' | 'Update';
  title: string;
  description: string;
  responsible: string;
}

export interface Family {
  id: string;
  code: string;
  name: string;
  responsibleName: string;
  avatarUrl: string;
  status: Status;
  statusDescription: string;
  address: string;
  neighborhood?: string;
  phone: string;
  whatsapp?: string;
  members: FamilyMember[];
  history: HistoryRecord[];
  needs?: string[];
  churchMember: boolean;
  congregation?: string;
  income?: string;
  socialClass?: string;
  professionalStatus?: string;
  mainNeed?: string;
  observations?: string;
}

export interface DashboardStats {
  totalFamilies: number;
  criticalFamilies: number;
  monthlyAid: { name: string; value: number; fill: string }[];
}