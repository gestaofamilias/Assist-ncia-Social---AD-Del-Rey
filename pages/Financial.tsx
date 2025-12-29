
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { useAppContext } from '../constants';
import { TransactionType, Transaction } from '../types';

export const Financial = () => {
  const { transactions, addTransaction, removeTransaction } = useAppContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Período selecionado
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [filterType, setFilterType] = useState<'All' | TransactionType>('All');

  // Form State
  const [formData, setFormData] = useState({
    type: TransactionType.Income,
    category: 'Dízimos',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const years = [2023, 2024, 2025, 2026];

  const stats = useMemo(() => {
    // Filtrar transações pelo período selecionado
    const periodTransactions = transactions.filter(t => {
        const d = new Date(t.date + 'T00:00:00'); 
        return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    });

    const income = periodTransactions.filter(t => t.type === TransactionType.Income).reduce((acc, t) => acc + t.amount, 0);
    const expense = periodTransactions.filter(t => t.type === TransactionType.Expense).reduce((acc, t) => acc + t.amount, 0);
    const totalBalance = transactions.reduce((acc, t) => t.type === TransactionType.Income ? acc + t.amount : acc - t.amount, 0);

    // Agrupamento por categoria
    const categories: Record<string, { income: number, expense: number }> = {};
    periodTransactions.forEach(t => {
        if (!categories[t.category]) categories[t.category] = { income: 0, expense: 0 };
        if (t.type === TransactionType.Income) categories[t.category].income += t.amount;
        else categories[t.category].expense += t.amount;
    });

    const chartData = [
        { name: 'Entradas', value: income, fill: '#22c55e' },
        { name: 'Saídas', value: expense, fill: '#ef4444' }
    ];

    return { income, expense, totalBalance, periodTransactions, chartData, categories };
  }, [transactions, viewMonth, viewYear]);

  const filteredTransactions = stats.periodTransactions.filter(t => filterType === 'All' || t.type === filterType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const amountStr = formData.amount.replace(',', '.');
    const amount = parseFloat(amountStr);
    
    if (isNaN(amount) || amount <= 0) return alert('Insira um valor válido');

    setIsSubmitting(true);
    try {
        const newTransaction: Transaction = {
            id: crypto.randomUUID(),
            date: formData.date,
            type: formData.type,
            category: formData.category,
            amount: amount,
            description: formData.description,
            responsible: 'Administrador'
        };

        await addTransaction(newTransaction);
        setShowAddModal(false);
        setFormData({ ...formData, amount: '', description: '' });
    } catch (err) {
        console.error('Erro ao enviar:', err);
    } finally {
        setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-background-dark overflow-y-auto">
      <header className="sticky top-0 z-20 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Fluxo de Caixa</h1>
        <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
            <span className="material-symbols-outlined">add_card</span>
            Novo Lançamento
        </button>
      </header>

      <div className="p-4 space-y-6 max-w-5xl mx-auto w-full pb-32">
        
        {/* Period Selector */}
        <section className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase">
                <span className="material-symbols-outlined">calendar_today</span>
                Filtrar Mês:
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <select 
                    value={viewMonth}
                    onChange={e => setViewMonth(Number(e.target.value))}
                    className="flex-1 sm:w-40 h-10 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-background-dark px-3 text-sm outline-none font-bold text-primary"
                >
                    {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
                <select 
                    value={viewYear}
                    onChange={e => setViewYear(Number(e.target.value))}
                    className="flex-1 sm:w-28 h-10 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-background-dark px-3 text-sm outline-none font-bold"
                >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard label="Saldo Geral (Total)" value={stats.totalBalance} color="text-slate-900 dark:text-white" icon="account_balance" />
            <SummaryCard label={`Entradas em ${months[viewMonth]}`} value={stats.income} color="text-green-600" icon="trending_up" />
            <SummaryCard label={`Saídas em ${months[viewMonth]}`} value={stats.expense} color="text-red-500" icon="trending_down" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-6">Comparativo Mensal</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <YAxis hide />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                                {stats.chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Total por Categoria</h3>
                <div className="space-y-3 overflow-y-auto max-h-64 pr-2">
                    {Object.entries(stats.categories).length === 0 ? (
                        <p className="text-center text-slate-400 py-10">Nenhum movimento registrado.</p>
                    ) : (
                        (Object.entries(stats.categories) as [string, { income: number; expense: number }][]).map(([cat, val]) => (
                            <div key={cat} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-100 dark:border-gray-800">
                                <span className="text-sm font-bold dark:text-white">{cat}</span>
                                <div className="text-right">
                                    {val.income > 0 && <p className="text-xs font-bold text-green-600">+{formatCurrency(val.income)}</p>}
                                    {val.expense > 0 && <p className="text-xs font-bold text-red-500">-{formatCurrency(val.expense)}</p>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

        {/* List */}
        <section className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider">Histórico de {months[viewMonth]}</h3>
                <div className="flex gap-2">
                    <button onClick={() => setFilterType('All')} className={`text-[10px] font-bold px-2 py-1 rounded ${filterType === 'All' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>TUDO</button>
                    <button onClick={() => setFilterType(TransactionType.Income)} className={`text-[10px] font-bold px-2 py-1 rounded ${filterType === TransactionType.Income ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'}`}>ENTRADAS</button>
                    <button onClick={() => setFilterType(TransactionType.Expense)} className={`text-[10px] font-bold px-2 py-1 rounded ${filterType === TransactionType.Expense ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-500'}`}>SAÍDAS</button>
                </div>
            </div>
            {filteredTransactions.length === 0 ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-4xl">inventory_2</span>
                    <p>Nenhum lançamento encontrado.</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {filteredTransactions.map(t => (
                        <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className={`size-10 rounded-full flex items-center justify-center ${t.type === TransactionType.Income ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                    <span className="material-symbols-outlined text-lg">{t.type === TransactionType.Income ? 'trending_up' : 'trending_down'}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{t.category}</p>
                                    <p className="text-xs text-slate-500">{t.date.split('-').reverse().join('/')} {t.description && `• ${t.description}`}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`font-black ${t.type === TransactionType.Income ? 'text-green-600' : 'text-red-500'}`}>
                                    {t.type === TransactionType.Income ? '+' : '-'} {formatCurrency(t.amount)}
                                </span>
                                <button 
                                    onClick={() => { if(confirm('Excluir este lançamento permanentemente?')) removeTransaction(t.id)}} 
                                    className="p-2 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                                    title="Excluir"
                                >
                                    <span className="material-symbols-outlined text-xl">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
      </div>

      {/* Add Modal */}
      {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                      <h2 className="text-xl font-bold dark:text-white">Novo Lançamento</h2>
                      <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600" disabled={isSubmitting}><span className="material-symbols-outlined">close</span></button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                          <button type="button" onClick={() => setFormData({...formData, type: TransactionType.Income, category: 'Dízimos'})} className={`py-2 rounded-lg text-sm font-bold transition-all ${formData.type === TransactionType.Income ? 'bg-white dark:bg-surface-dark text-green-600 shadow-sm' : 'text-slate-500'}`}>Entrada</button>
                          <button type="button" onClick={() => setFormData({...formData, type: TransactionType.Expense, category: 'Ajuda Social'})} className={`py-2 rounded-lg text-sm font-bold transition-all ${formData.type === TransactionType.Expense ? 'bg-white dark:bg-surface-dark text-red-500 shadow-sm' : 'text-slate-500'}`}>Saída</button>
                      </div>

                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Categoria</label>
                          <select 
                            value={formData.category} 
                            onChange={e => setFormData({...formData, category: e.target.value})}
                            className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-3 text-sm font-bold outline-none"
                            disabled={isSubmitting}
                          >
                              {formData.type === TransactionType.Income ? (
                                  <>
                                    <option>Dízimos</option>
                                    <option>Ofertas</option>
                                    <option>Doação</option>
                                    <option>Venda de Eventos</option>
                                    <option>Outros</option>
                                  </>
                              ) : (
                                  <>
                                    <option>Ajuda Social</option>
                                    <option>Contas (Luz/Água)</option>
                                    <option>Manutenção</option>
                                    <option>Material de Limpeza</option>
                                    <option>Combustível</option>
                                    <option>Outros</option>
                                  </>
                              )}
                          </select>
                      </div>

                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Valor (R$)</label>
                          <input 
                            required 
                            type="text" 
                            placeholder="0,00"
                            value={formData.amount}
                            onChange={e => setFormData({...formData, amount: e.target.value})}
                            className="w-full h-12 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4 text-lg font-black text-primary outline-none"
                            disabled={isSubmitting}
                          />
                      </div>

                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Data</label>
                          <input 
                            type="date" 
                            value={formData.date}
                            onChange={e => setFormData({...formData, date: e.target.value})}
                            className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4 outline-none font-bold"
                            disabled={isSubmitting}
                          />
                      </div>

                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Descrição (Opcional)</label>
                          <input 
                            type="text" 
                            placeholder="Ex: Oferta de Missões"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4 outline-none"
                            disabled={isSubmitting}
                          />
                      </div>

                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`w-full h-14 text-white font-bold rounded-xl shadow-lg mt-4 active:scale-95 transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-yellow-600'}`}
                      >
                          {isSubmitting ? (
                              <span className="material-symbols-outlined animate-spin">progress_activity</span>
                          ) : 'Salvar Lançamento'}
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, value, color, icon }: any) => (
    <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            <span className={`material-symbols-outlined text-slate-200`}>{icon}</span>
        </div>
        <div className={`text-2xl font-black ${color}`}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
        </div>
    </div>
);
