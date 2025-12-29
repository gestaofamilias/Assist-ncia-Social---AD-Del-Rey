import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AID_STATS_COLORS, useAppContext } from '../constants';
import { AidType, TransactionType } from '../types';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { families, transactions } = useAppContext();

  const totalFamilies = families.length;
  const criticalCount = families.filter(f => f.status === 'Critical').length;

  const financeStats = useMemo(() => {
    const totalBalance = transactions.reduce((acc, t) => t.type === TransactionType.Income ? acc + t.amount : acc - t.amount, 0);
    return { totalBalance };
  }, [transactions]);

  // Calculate Chart Data Dynamically
  const aidStats = useMemo(() => {
      const counts: Record<string, number> = {
          [AidType.FoodBasket]: 0,
          [AidType.Clothes]: 0,
          [AidType.Medicine]: 0,
          [AidType.Gas]: 0,
          [AidType.Financial]: 0,
          [AidType.Spiritual]: 0,
      };

      families.forEach(family => {
          family.history.forEach(record => {
              if (record.type === 'Aid') {
                  const title = record.title;
                  if (counts[title] !== undefined) counts[title]++;
                  else counts[title] = 1;
              }
          });
      });

      return Object.keys(counts)
          .map(key => {
              const isStandard = Object.values(AidType).includes(key as AidType);
              let color = isStandard ? AID_STATS_COLORS[key as AidType] : (AID_STATS_COLORS[AidType.Other] || '#cbd5e1');
              return { name: key, value: counts[key], fill: color };
          })
          .sort((a, b) => b.value - a.value);
  }, [families]);

  return (
    <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto w-full">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">church</span>
            </div>
            <div>
                <h1 className="text-lg font-bold leading-tight dark:text-white">Visão Geral</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Assistência Social</p>
            </div>
        </div>
        <button onClick={() => navigate('/settings')} className="relative size-10 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm">
            <img alt="User" className="size-full object-cover" src="https://ui-avatars.com/api/?name=Admin&background=EAB308&color=fff" />
        </button>
      </header>

      {/* Finance Widget */}
      <section 
        onClick={() => navigate('/financial')}
        className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-primary/15 transition-all"
      >
        <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">account_balance_wallet</span>
            <div>
                <p className="text-[10px] uppercase font-bold text-primary/80 tracking-widest">Saldo do Caixa</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financeStats.totalBalance)}
                </h3>
            </div>
        </div>
        <span className="material-symbols-outlined text-primary/50">chevron_right</span>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-slate-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined text-primary text-[28px]">groups</span></div>
            <p className="text-slate-500 text-xs font-medium uppercase">Total de Famílias</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{totalFamilies}</h3>
        </div>
        <div className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-slate-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined text-red-500 text-[28px]">warning</span></div>
            <p className="text-slate-500 text-xs font-medium uppercase">Situação Crítica</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{criticalCount}</h3>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ActionCard icon="person_add" title="Cadastrar" subtitle="Nova Família" colorClass="bg-primary text-white" iconBgClass="bg-white/20" onClick={() => navigate('/new-family')} hasArrow />
            <ActionCard icon="edit_document" title="Atendimento" subtitle="Registrar visita/ajuda" colorClass="bg-white dark:bg-surface-dark text-slate-900 dark:text-white border border-slate-100 dark:border-gray-800" iconBgClass="bg-green-100 text-green-600" onClick={() => navigate('/new-record')} />
            <ActionCard icon="add_card" title="Financeiro" subtitle="Lançar movimento" colorClass="bg-white dark:bg-surface-dark text-slate-900 dark:text-white border border-slate-100 dark:border-gray-800" iconBgClass="bg-blue-100 text-blue-600" onClick={() => navigate('/financial')} />
        </div>
      </section>

      {/* Chart Section */}
      <section>
        <h2 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Distribuição de Ajuda</h2>
        {aidStats.every(s => s.value === 0) ? (
            <div className="bg-white dark:bg-surface-dark rounded-xl p-8 text-center border border-slate-100 dark:border-gray-800">
                 <p className="text-slate-500">Nenhum atendimento registrado.</p>
            </div>
        ) : (
            <div className="bg-white dark:bg-surface-dark rounded-xl p-5 border border-slate-100 dark:border-gray-800 min-h-[256px]">
                 <ResponsiveContainer width="100%" height={250}>
                    <BarChart layout="vertical" data={aidStats}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={110} tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {aidStats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                        </Bar>
                    </BarChart>
                 </ResponsiveContainer>
            </div>
        )}
      </section>
    </div>
  );
};

const ActionCard: React.FC<any> = ({ icon, title, subtitle, colorClass, iconBgClass, onClick, hasArrow }) => (
    <button onClick={onClick} className={`flex items-center gap-4 p-4 rounded-xl shadow-sm active:scale-[0.98] transition-all text-left group ${colorClass}`}>
        <div className={`p-2 rounded-lg flex items-center justify-center ${iconBgClass}`}><span className="material-symbols-outlined">{icon}</span></div>
        <div>
            <span className="block font-semibold">{title}</span>
            <span className="block text-xs opacity-80">{subtitle}</span>
        </div>
        {hasArrow && <span className="material-symbols-outlined ml-auto">chevron_right</span>}
    </button>
);