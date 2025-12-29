import React, { useState, useEffect, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { FamilyList } from './pages/FamilyList';
import { FamilyDetails } from './pages/FamilyDetails';
import { NewFamily } from './pages/NewFamily';
import { EditFamily } from './pages/EditFamily';
import { NewRecord } from './pages/NewRecord';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Financial } from './pages/Financial';
import { Family, HistoryRecord, Status, Transaction, TransactionType } from './types';
import { AppContext, useAppContext } from './constants';
import { supabase } from './supabaseClient';

// --- Mappers ---
const mapFamilyFromDB = (row: any): Family => ({
  id: row.id,
  code: row.code,
  name: row.name,
  responsibleName: row.responsible_name,
  avatarUrl: row.avatar_url,
  status: row.status as Status,
  statusDescription: row.status_description,
  address: row.address,
  neighborhood: row.neighborhood,
  phone: row.phone,
  whatsapp: row.whatsapp,
  churchMember: row.church_member,
  congregation: row.congregation,
  income: row.income,
  socialClass: row.social_class,
  professionalStatus: row.professional_status,
  mainNeed: row.main_need,
  observations: row.observations,
  members: Array.isArray(row.members) ? row.members : [],
  history: Array.isArray(row.history) ? row.history : []
});

const mapTransactionFromDB = (row: any): Transaction => ({
  id: row.id,
  date: row.date,
  type: row.type as TransactionType,
  category: row.category,
  amount: Number(row.amount),
  description: row.description || '',
  responsible: row.responsible || 'Sistema'
});

const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [families, setFamilies] = useState<Family[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
      setLoading(true);
      try {
          const familiesRes = await supabase.from('families').select('*').order('name');
          if (familiesRes.error) {
              console.warn('Erro ao carregar famílias:', familiesRes.error.message);
          } else {
              setFamilies(familiesRes.data.map(mapFamilyFromDB));
          }

          const transactionsRes = await supabase.from('financial_records').select('*').order('date', { ascending: false });
          if (transactionsRes.error) {
              console.warn('Erro financeiro:', transactionsRes.error.message);
          } else {
              setTransactions(transactionsRes.data.map(mapTransactionFromDB));
          }
      } catch (err) {
          console.error('Erro geral de conexão:', err);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        setIsAuthenticated(!!session);
        if (session) fetchData();
        else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
        if (session) fetchData();
        else {
            setFamilies([]);
            setTransactions([]);
            setLoading(false);
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  const addTransaction = async (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    try {
        const { error } = await supabase.from('financial_records').insert([{
            id: transaction.id,
            date: transaction.date,
            type: transaction.type,
            category: transaction.category,
            amount: transaction.amount,
            description: transaction.description,
            responsible: transaction.responsible
        }]);
        if (error) {
            setTransactions(prev => prev.filter(t => t.id !== transaction.id));
            alert(`Erro ao salvar no banco: ${error.message}`);
        }
    } catch (err: any) {
        setTransactions(prev => prev.filter(t => t.id !== transaction.id));
    }
  };

  const removeTransaction = async (id: string) => {
    const backup = transactions.find(t => t.id === id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    const { error } = await supabase.from('financial_records').delete().eq('id', id);
    if (error && backup) {
        setTransactions(prev => [backup, ...prev]);
        alert('Erro ao remover: ' + error.message);
    }
  };

  const addFamily = async (family: Family) => {
    setFamilies(prev => [family, ...prev]);
    const { error } = await supabase.from('families').insert([{
        id: family.id,
        code: family.code,
        name: family.name,
        responsible_name: family.responsibleName,
        status: family.status,
        status_description: family.statusDescription,
        address: family.address,
        neighborhood: family.neighborhood,
        phone: family.phone,
        whatsapp: family.whatsapp,
        church_member: family.churchMember,
        congregation: family.congregation,
        income: family.income,
        social_class: family.socialClass,
        professional_status: family.professionalStatus,
        main_need: family.mainNeed,
        observations: family.observations,
        members: family.members,
        history: family.history
    }]);
    if (error) {
        setFamilies(prev => prev.filter(f => f.id !== family.id));
        alert('Erro ao salvar família: ' + error.message);
    }
  };

  const updateFamily = async (family: Family) => {
    setFamilies(prev => prev.map(f => f.id === family.id ? family : f));
    const { error } = await supabase.from('families').update({
        name: family.name,
        responsible_name: family.responsibleName,
        status: family.status,
        status_description: family.statusDescription,
        address: family.address,
        neighborhood: family.neighborhood,
        phone: family.phone,
        whatsapp: family.whatsapp,
        church_member: family.churchMember,
        congregation: family.congregation,
        income: family.income,
        social_class: family.socialClass,
        professional_status: family.professionalStatus,
        main_need: family.mainNeed,
        observations: family.observations,
        members: family.members
    }).eq('id', family.id);

    if (error) {
        fetchData(); // Recarrega para manter consistência
        alert('Erro ao atualizar família: ' + error.message);
    }
  };

  const removeFamily = async (id: string) => {
    const backup = families.find(f => f.id === id);
    setFamilies(prev => prev.filter(f => f.id !== id));
    const { error } = await supabase.from('families').delete().eq('id', id);
    if (error && backup) {
        setFamilies(prev => [backup, ...prev]);
        alert('Erro ao remover família: ' + error.message);
    }
  };

  const addHistoryRecord = async (familyId: string, record: HistoryRecord) => {
    const family = families.find(f => f.id === familyId);
    if (!family) return;
    const newHistory = [record, ...family.history];
    setFamilies(prev => prev.map(f => f.id === familyId ? { ...f, history: newHistory } : f));
    const { error } = await supabase.from('families').update({ history: newHistory }).eq('id', familyId);
    if (error) alert('Erro ao atualizar histórico: ' + error.message);
  };

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
              <div className="flex flex-col items-center gap-4">
                  <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
                  <p className="text-slate-500 font-medium animate-pulse">Carregando...</p>
              </div>
          </div>
      );
  }

  return (
    <AppContext.Provider value={{ 
        families, transactions, addFamily, updateFamily, removeFamily, 
        addHistoryRecord, addTransaction, removeTransaction,
        isAuthenticated, login: () => {}, logout, theme, toggleTheme 
    }}>
      {children}
    </AppContext.Provider>
  );
};

const Layout = ({ children }: { children?: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <div className="flex-1 pb-24 md:pb-0 md:pl-64">{children}</div>
      
      <nav className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-800 z-50">
        <div className="p-6 flex items-center gap-3">
           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined">diversity_3</span>
           </div>
           <h1 className="text-xl font-bold text-slate-800 dark:text-white">Gestão Social</h1>
        </div>
        <div className="flex-1 px-4 space-y-2">
            <SidebarItem icon="dashboard" label="Visão Geral" active={isActive('/dashboard')} onClick={() => navigate('/dashboard')} />
            <SidebarItem icon="groups" label="Famílias" active={isActive('/families')} onClick={() => navigate('/families')} />
            <SidebarItem icon="account_balance_wallet" label="Caixa" active={isActive('/financial')} onClick={() => navigate('/financial')} />
            <SidebarItem icon="bar_chart" label="Relatórios" active={isActive('/reports')} onClick={() => navigate('/reports')} />
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
           <SidebarItem icon="settings" label="Configurações" active={isActive('/settings')} onClick={() => navigate('/settings')} />
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 w-full bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-6 z-50">
        <div className="flex justify-between items-center max-w-lg mx-auto h-16">
          <NavItem icon="dashboard" label="Início" active={isActive('/dashboard')} onClick={() => navigate('/dashboard')} />
          <NavItem icon="diversity_3" label="Famílias" active={isActive('/families')} onClick={() => navigate('/families')} />
          <div className="relative -top-6">
            <button onClick={() => navigate('/new-family')} className="size-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center"><span className="material-symbols-outlined text-3xl">add</span></button>
          </div>
          <NavItem icon="account_balance_wallet" label="Caixa" active={isActive('/financial')} onClick={() => navigate('/financial')} />
          <NavItem icon="settings" label="Ajustes" active={isActive('/settings')} onClick={() => navigate('/settings')} />
        </div>
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 w-12 ${active ? 'text-primary' : 'text-slate-400'}`}>
    <span className="material-symbols-outlined">{icon}</span>
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const SidebarItem = ({ icon, label, active, onClick }: any) => (
    <button onClick={onClick} className={`flex items-center gap-3 w-full p-3 rounded-lg ${active ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
      <span className="material-symbols-outlined">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
);

const App = () => (
  <AppProvider>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/families" element={<Layout><FamilyList /></Layout>} />
        <Route path="/families/:id" element={<Layout><FamilyDetails /></Layout>} />
        <Route path="/financial" element={<Layout><Financial /></Layout>} />
        <Route path="/new-family" element={<Layout><NewFamily /></Layout>} />
        <Route path="/edit-family/:id" element={<Layout><EditFamily /></Layout>} />
        <Route path="/new-record" element={<Layout><NewRecord /></Layout>} />
        <Route path="/reports" element={<Layout><Reports /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
      </Routes>
    </HashRouter>
  </AppProvider>
);

export default App;