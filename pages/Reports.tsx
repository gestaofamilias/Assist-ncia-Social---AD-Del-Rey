import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { useAppContext } from '../constants';
import { AidType, TransactionType } from '../types';

export const Reports = () => {
  const navigate = useNavigate();
  const { families, transactions } = useAppContext();

  // --- State for Filters ---
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth())); // 0-11
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const [reportView, setReportView] = useState<'all' | 'aid' | 'financial'>('all');

  // --- Data Processing ---
  
  // 1. Filter Aid Records
  const filteredAid = useMemo(() => {
    const allAid = families.flatMap(family => 
        family.history
            .filter(record => record.type === 'Aid')
            .map(record => ({
                ...record,
                familyId: family.id,
                familyName: family.name,
                familyAvatar: family.avatarUrl,
                familyCode: family.code,
                reportCategory: 'Assistência Social'
            }))
    );

    return allAid.filter(record => {
        const [rYear, rMonth] = record.date.split('-').map(Number);
        return (rMonth - 1) === Number(selectedMonth) && rYear === Number(selectedYear);
    });
  }, [families, selectedMonth, selectedYear]);

  // 2. Filter Financial Transactions
  const filteredFinancial = useMemo(() => {
    return transactions.filter(t => {
        const [tYear, tMonth] = t.date.split('-').map(Number);
        return (tMonth - 1) === Number(selectedMonth) && tYear === Number(selectedYear);
    });
  }, [transactions, selectedMonth, selectedYear]);

  // 3. Financial Stats
  const financialStats = useMemo(() => {
    const income = filteredFinancial.filter(t => t.type === TransactionType.Income).reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredFinancial.filter(t => t.type === TransactionType.Expense).reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filteredFinancial]);

  // 4. Combined Records for Table
  const combinedRecords = useMemo(() => {
    const list = [];
    if (reportView === 'all' || reportView === 'aid') {
        list.push(...filteredAid.map(a => ({
            id: a.id,
            date: a.date,
            type: 'Doação',
            title: a.title,
            description: a.description,
            target: a.familyName,
            responsible: a.responsible,
            amount: null,
            isFinancial: false
        })));
    }
    if (reportView === 'all' || reportView === 'financial') {
        list.push(...filteredFinancial.map(f => ({
            id: f.id,
            date: f.date,
            type: f.type === TransactionType.Income ? 'Entrada' : 'Saída',
            title: f.category,
            description: f.description,
            target: f.type === TransactionType.Income ? 'Igreja (Receita)' : 'Despesa Social',
            responsible: f.responsible,
            amount: f.amount,
            isFinancial: true,
            financialType: f.type
        })));
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredAid, filteredFinancial, reportView]);

  const exportToCSV = () => {
    const headers = ["Data", "Tipo de Registro", "Categoria/Item", "Descricao", "Valor (R$)", "Destino/Origem", "Responsavel"];
    const csvRows = [headers.join(",")];

    combinedRecords.forEach(r => {
      const amountStr = r.amount !== null ? r.amount.toFixed(2).replace('.', ',') : "";
      const row = [
        r.date.split('-').reverse().join('/'),
        r.type,
        `"${r.title.replace(/"/g, '""')}"`,
        `"${(r.description || "").replace(/"/g, '""')}"`,
        `"${amountStr}"`,
        `"${r.target.replace(/"/g, '""')}"`,
        `"${r.responsible.replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob(["\ufeff" + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_geral_${selectedYear}_${Number(selectedMonth)+1}.csv`;
    link.click();
  };

  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const years = ['2023', '2024', '2025', '2026'];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-background-dark overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-800 dark:text-white transition-colors">
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Relatórios Consolidados</h1>
        </div>
        <button 
            onClick={exportToCSV}
            className="bg-primary hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
            <span className="material-symbols-outlined">download</span>
            <span className="hidden sm:inline">Exportar CSV</span>
        </button>
      </header>

      <div className="p-4 space-y-6 max-w-5xl mx-auto w-full pb-32">
        
        {/* Period & View Filter */}
        <section className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Período</label>
                    <div className="flex gap-2">
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-background-dark px-3 text-sm font-bold outline-none text-primary"
                        >
                            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-28 h-11 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-background-dark px-3 text-sm font-bold outline-none"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Filtrar por Tipo</label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button onClick={() => setReportView('all')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${reportView === 'all' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500'}`}>Tudo</button>
                        <button onClick={() => setReportView('aid')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${reportView === 'aid' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500'}`}>Ações</button>
                        <button onClick={() => setReportView('financial')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${reportView === 'financial' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500'}`}>Caixa</button>
                    </div>
                </div>
            </div>
        </section>

        {/* Financial Summary */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Entradas (Mês)</span>
                    <span className="material-symbols-outlined text-green-500">trending_up</span>
                </div>
                <p className="text-xl font-black text-green-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financialStats.income)}
                </p>
            </div>
            <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Saídas (Mês)</span>
                    <span className="material-symbols-outlined text-red-500">trending_down</span>
                </div>
                <p className="text-xl font-black text-red-500">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financialStats.expense)}
                </p>
            </div>
            <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Resultado Social</span>
                    <span className="material-symbols-outlined text-primary">analytics</span>
                </div>
                <p className={`text-xl font-black ${financialStats.balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financialStats.balance)}
                </p>
            </div>
        </section>

        {/* Detailed Consolidated Table */}
        <section className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider">Histórico Consolidado de {months[Number(selectedMonth)]}</h3>
                <span className="text-xs font-bold text-slate-400">{combinedRecords.length} lançamentos</span>
            </div>
            
            {combinedRecords.length === 0 ? (
                <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-5xl opacity-20">folder_off</span>
                    <p>Sem dados no período filtrado.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/30 text-slate-500 uppercase text-[10px] font-bold">
                                <th className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">Data</th>
                                <th className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">Tipo</th>
                                <th className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">Item / Categoria</th>
                                <th className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">Descrição</th>
                                <th className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {combinedRecords.map((r) => (
                                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                    <td className="px-4 py-4 whitespace-nowrap text-xs font-medium text-slate-500">
                                        {r.date.split('-').reverse().join('/')}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            r.type === 'Entrada' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            r.type === 'Saída' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                            {r.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{r.title}</p>
                                        <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{r.target}</p>
                                    </td>
                                    <td className="px-4 py-4 text-xs text-slate-500 italic max-w-xs truncate">
                                        {r.description || '—'}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        {r.amount !== null ? (
                                            <span className={`font-black ${r.financialType === TransactionType.Income ? 'text-green-600' : 'text-red-500'}`}>
                                                {r.financialType === TransactionType.Income ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.amount)}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300 font-bold">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
      </div>
    </div>
  );
};
