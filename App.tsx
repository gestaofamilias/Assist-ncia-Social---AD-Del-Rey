
import { useState, useEffect, ReactNode } from 'react';
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
import { Inventory } from './pages/Inventory';
import { NewInventoryItem } from './pages/NewInventoryItem';
import { Family, HistoryRecord, Status, Transaction, TransactionType, InventoryItem, InventoryCategory } from './types';
import { AppContext, useAppContext } from './constants';
import { auth, db } from './src/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, getDocFromServer } from 'firebase/firestore';

import { MessageModal } from './components/MessageModal';
import { ConfirmModal } from './components/ConfirmModal';

// --- Mappers ---
const mapFamilyFromDB = (id: string, row: any): Family => ({
  id: id,
  code: row.code,
  name: row.name,
  responsibleName: row.responsibleName,
  avatarUrl: row.avatarUrl,
  status: row.status as Status,
  statusDescription: row.statusDescription,
  address: row.address,
  neighborhood: row.neighborhood,
  phone: row.phone,
  whatsapp: row.whatsapp,
  churchMember: row.churchMember,
  congregation: row.congregation,
  income: row.income,
  socialClass: row.socialClass,
  professionalStatus: row.professionalStatus,
  mainNeed: row.mainNeed, 
  observations: row.observations,
  members: Array.isArray(row.members) ? row.members : [],
  history: Array.isArray(row.history) ? row.history : []
});

const mapTransactionFromDB = (id: string, row: any): Transaction => ({
  id: id,
  date: row.date,
  type: row.type as TransactionType,
  category: row.category,
  amount: Number(row.amount),
  description: row.description || '',
  responsible: row.responsible || 'Sistema'
});

const mapInventoryItemFromDB = (id: string, row: any): InventoryItem => ({
  id: id,
  name: row.name,
  category: row.category as InventoryCategory,
  quantity: Number(row.quantity),
  unit: row.unit,
  expirationDate: row.expirationDate,
  minQuantity: row.minQuantity ? Number(row.minQuantity) : undefined,
  observations: row.observations
});

// --- Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
};

const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [families, setFamilies] = useState<Family[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = checking
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; isDanger: boolean }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDanger: false
  });

  const showAlert = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setAlertConfig({ isOpen: true, title, message, type });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, isDanger: boolean = false) => {
    setConfirmConfig({ isOpen: true, title, message, onConfirm, isDanger });
  };

  useEffect(() => {
    // Test connection to Firestore
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
          setError('Erro de conexão com o Firebase. Verifique a configuração.');
        }
      }
    };
    testConnection();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        // Listen to Families
        const qFamilies = query(collection(db, 'families'), orderBy('name'));
        const unsubFamilies = onSnapshot(qFamilies, (snapshot) => {
          setFamilies(snapshot.docs.map(doc => mapFamilyFromDB(doc.id, doc.data())));
        }, (err) => {
          console.error('Error fetching families:', err);
          setError('Erro ao carregar famílias.');
        });

        // Listen to Transactions
        const qTransactions = query(collection(db, 'financial_records'), orderBy('date', 'desc'));
        const unsubTransactions = onSnapshot(qTransactions, (snapshot) => {
          setTransactions(snapshot.docs.map(doc => mapTransactionFromDB(doc.id, doc.data())));
        }, (err) => {
          console.error('Error fetching transactions:', err);
          setError('Erro ao carregar financeiro.');
        });

        // Listen to Inventory
        const qInventory = query(collection(db, 'inventory_items'), orderBy('name'));
        const unsubInventory = onSnapshot(qInventory, (snapshot) => {
          setInventory(snapshot.docs.map(doc => mapInventoryItemFromDB(doc.id, doc.data())));
        }, (err) => {
          console.error('Error fetching inventory:', err);
          setError('Erro ao carregar estoque.');
        });

        return () => {
          unsubFamilies();
          unsubTransactions();
          unsubInventory();
        };
      } else {
        setFamilies([]);
        setTransactions([]);
        setInventory([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const addTransaction = async (transaction: Transaction) => {
    if (!auth.currentUser) {
      showAlert('Erro de Acesso', 'Você precisa estar logado para salvar dados.', 'error');
      return;
    }
    try {
      const { id, ...data } = transaction;
      await addDoc(collection(db, 'financial_records'), {
        ...data,
        userId: auth.currentUser.uid
      });
      showAlert('Sucesso', 'Lançamento financeiro salvo com sucesso!', 'success');
    } catch (err) {
      const errInfo = handleFirestoreError(err, OperationType.CREATE, 'financial_records');
      showAlert('Erro ao Salvar', `Não foi possível salvar o lançamento: ${errInfo.error}`, 'error');
    }
  };

  const removeTransaction = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'financial_records', id));
      showAlert('Sucesso', 'Lançamento removido com sucesso!', 'success');
    } catch (err) {
      const errInfo = handleFirestoreError(err, OperationType.DELETE, `financial_records/${id}`);
      showAlert('Erro ao Remover', `Não foi possível remover o lançamento: ${errInfo.error}`, 'error');
    }
  };

  const addFamily = async (family: Family) => {
    if (!auth.currentUser) {
      showAlert('Erro de Acesso', 'Você precisa estar logado para salvar dados.', 'error');
      return;
    }
    try {
      const { id, ...data } = family;
      await addDoc(collection(db, 'families'), {
        ...data,
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });
      showAlert('Sucesso', 'Família cadastrada com sucesso!', 'success');
    } catch (err) {
      const errInfo = handleFirestoreError(err, OperationType.CREATE, 'families');
      showAlert('Erro ao Salvar', `Não foi possível cadastrar a família: ${errInfo.error}`, 'error');
    }
  };

  const updateFamily = async (family: Family) => {
    try {
      const { id, ...data } = family;
      await updateDoc(doc(db, 'families', id), data);
      showAlert('Sucesso', 'Dados da família atualizados!', 'success');
    } catch (err) {
      const errInfo = handleFirestoreError(err, OperationType.UPDATE, `families/${family.id}`);
      showAlert('Erro ao Atualizar', `Não foi possível atualizar os dados: ${errInfo.error}`, 'error');
    }
  };

  const removeFamily = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'families', id));
      showAlert('Sucesso', 'Família removida com sucesso!', 'success');
    } catch (err) {
      const errInfo = handleFirestoreError(err, OperationType.DELETE, `families/${id}`);
      showAlert('Erro ao Remover', `Não foi possível remover a família: ${errInfo.error}`, 'error');
    }
  };

  const addInventoryItem = async (item: InventoryItem) => {
    if (!auth.currentUser) {
      showAlert('Erro de Acesso', 'Você precisa estar logado para salvar dados.', 'error');
      return;
    }
    try {
      const { id, ...data } = item;
      await addDoc(collection(db, 'inventory_items'), {
        ...data,
        userId: auth.currentUser.uid
      });
      showAlert('Sucesso', 'Item adicionado ao estoque!', 'success');
    } catch (err) {
      const errInfo = handleFirestoreError(err, OperationType.CREATE, 'inventory_items');
      showAlert('Erro ao Salvar', `Não foi possível adicionar o item: ${errInfo.error}`, 'error');
    }
  };

  const updateInventoryItem = async (item: InventoryItem) => {
    try {
      const { id, ...data } = item;
      await updateDoc(doc(db, 'inventory_items', id), data);
      showAlert('Sucesso', 'Estoque atualizado!', 'success');
    } catch (err) {
      const errInfo = handleFirestoreError(err, OperationType.UPDATE, `inventory_items/${item.id}`);
      showAlert('Erro ao Atualizar', `Não foi possível atualizar o estoque: ${errInfo.error}`, 'error');
    }
  };

  const removeInventoryItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'inventory_items', id));
      showAlert('Sucesso', 'Item removido do estoque!', 'success');
    } catch (err) {
      const errInfo = handleFirestoreError(err, OperationType.DELETE, `inventory_items/${id}`);
      showAlert('Erro ao Remover', `Não foi possível remover o item: ${errInfo.error}`, 'error');
    }
  };

  const addHistoryRecord = async (familyId: string, record: HistoryRecord) => {
    const family = families.find(f => f.id === familyId);
    if (!family) return;
    const newHistory = [record, ...family.history];
    try {
      await updateDoc(doc(db, 'families', familyId), { history: newHistory });
      showAlert('Sucesso', 'Atendimento registrado com sucesso!', 'success');
    } catch (err) {
      const errInfo = handleFirestoreError(err, OperationType.UPDATE, `families/${familyId}`);
      showAlert('Erro ao Registrar', `Não foi possível registrar o atendimento: ${errInfo.error}`, 'error');
    }
  };

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (isAuthenticated === null) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-6 text-center">
              <span className="material-symbols-outlined animate-spin text-primary text-5xl mb-4">progress_activity</span>
              <p className="text-slate-500 font-medium animate-pulse">Autenticando acesso...</p>
          </div>
      );
  }

  return (
    <AppContext.Provider value={{ 
        families, transactions, inventory, error, addFamily, updateFamily, removeFamily, 
        addHistoryRecord, addTransaction, removeTransaction,
        addInventoryItem, updateInventoryItem, removeInventoryItem,
        isAuthenticated: !!isAuthenticated, login: () => {}, logout, theme, toggleTheme,
        showAlert, showConfirm
    }}>
      {children}
      <MessageModal
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
      />
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        isDanger={confirmConfig.isDanger}
        onConfirm={() => {
          confirmConfig.onConfirm();
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </AppContext.Provider>
  );
};

const ProtectedRoute = ({ children }: { children?: ReactNode }) => {
    const { isAuthenticated } = useAppContext();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children?: ReactNode }) => {
    const { isAuthenticated } = useAppContext();
    return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const Layout = ({ children }: { children?: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { error } = useAppContext();
  const isActive = (path: string) => location.pathname === path;

  // Hide bottom nav on form pages so it doesn't overlap with sticky save buttons
  const hideBottomNav = ['/new-family', '/edit-family', '/new-record', '/new-inventory-item'].some(path => location.pathname.includes(path));

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      {error && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white px-4 py-2 text-center text-sm font-bold shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        </div>
      )}
      <div className={`flex-1 ${hideBottomNav ? 'pb-0' : 'pb-24'} md:pb-0 md:pl-64 ${error ? 'pt-10' : ''}`}>{children}</div>
      
      <nav className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-800 z-50">
        <div className="p-6 flex items-center gap-3">
           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined">diversity_3</span>
           </div>
           <h1 className="text-xl font-bold text-slate-800 dark:text-white">Gestão Social</h1>
        </div>
        <div className="flex-1 px-4 space-y-2 overflow-y-auto">
            <SidebarItem icon="dashboard" label="Visão Geral" active={isActive('/dashboard')} onClick={() => navigate('/dashboard')} />
            <SidebarItem icon="groups" label="Famílias" active={isActive('/families')} onClick={() => navigate('/families')} />
            <SidebarItem icon="account_balance_wallet" label="Caixa" active={isActive('/financial')} onClick={() => navigate('/financial')} />
            <SidebarItem icon="inventory_2" label="Estoque" active={isActive('/inventory')} onClick={() => navigate('/inventory')} />
            <SidebarItem icon="bar_chart" label="Relatórios" active={isActive('/reports')} onClick={() => navigate('/reports')} />
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
           <SidebarItem icon="settings" label="Configurações" active={isActive('/settings')} onClick={() => navigate('/settings')} />
        </div>
      </nav>

      {!hideBottomNav && (
        <nav className="md:hidden fixed bottom-0 w-full bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-6 z-50">
          <div className="flex justify-between items-center max-w-lg mx-auto h-16">
            <NavItem icon="dashboard" label="Início" active={isActive('/dashboard')} onClick={() => navigate('/dashboard')} />
            <NavItem icon="diversity_3" label="Famílias" active={isActive('/families')} onClick={() => navigate('/families')} />
            <div className="relative -top-6">
              <button onClick={() => navigate('/new-family')} className="size-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-90"><span className="material-symbols-outlined text-3xl">add</span></button>
            </div>
            <NavItem icon="inventory_2" label="Estoque" active={isActive('/inventory')} onClick={() => navigate('/inventory')} />
            <NavItem icon="settings" label="Ajustes" active={isActive('/settings')} onClick={() => navigate('/settings')} />
          </div>
        </nav>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 w-12 transition-colors ${active ? 'text-primary font-bold' : 'text-slate-400'}`}>
    <span className="material-symbols-outlined">{icon}</span>
    <span className="text-[10px]">{label}</span>
  </button>
);

const SidebarItem = ({ icon, label, active, onClick }: any) => (
    <button onClick={onClick} className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${active ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
      <span className="material-symbols-outlined">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
);

const App = () => (
  <AppProvider>
    <HashRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/families" element={<ProtectedRoute><Layout><FamilyList /></Layout></ProtectedRoute>} />
        <Route path="/families/:id" element={<ProtectedRoute><Layout><FamilyDetails /></Layout></ProtectedRoute>} />
        <Route path="/financial" element={<ProtectedRoute><Layout><Financial /></Layout></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Layout><Inventory /></Layout></ProtectedRoute>} />
        <Route path="/new-inventory-item" element={<ProtectedRoute><Layout><NewInventoryItem /></Layout></ProtectedRoute>} />
        <Route path="/new-family" element={<ProtectedRoute><Layout><NewFamily /></Layout></ProtectedRoute>} />
        <Route path="/edit-family/:id" element={<ProtectedRoute><Layout><EditFamily /></Layout></ProtectedRoute>} />
        <Route path="/new-record" element={<ProtectedRoute><Layout><NewRecord /></Layout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  </AppProvider>
);

export default App;
