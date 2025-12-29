import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../constants';
import { Status } from '../types';

export const FamilyList = () => {
  const navigate = useNavigate();
  const { families } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<Status | 'All'>('All');
  
  // States for Age Filter
  const [showAgeFilter, setShowAgeFilter] = useState(false);
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [babiesOnly, setBabiesOnly] = useState(false);

  const filteredFamilies = families.filter(family => {
    // 1. Text Search
    const matchesSearch = family.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          family.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          family.responsibleName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Status Filter
    const matchesStatus = filterStatus === 'All' || family.status === filterStatus;

    // 3. Age/Children Filter
    let matchesAge = true;
    
    if (showAgeFilter) {
        if (babiesOnly) {
            // Filter strictly for babies (AgeType 'Months' or calculated < 1 year)
            matchesAge = family.members.some(member => member.ageType === 'Months' || member.age < 1);
        } else if (minAge !== '' || maxAge !== '') {
            const min = minAge !== '' ? parseInt(minAge) : 0;
            const max = maxAge !== '' ? parseInt(maxAge) : 100;
            
            // Normalize age to years for comparison
            // If AgeType is Months, it counts as 0 years (or fraction) for integer comparison logic usually, 
            // but here we simply treat months as < 1 year.
            matchesAge = family.members.some(member => {
                const ageInYears = member.ageType === 'Months' ? member.age / 12 : member.age;
                return ageInYears >= min && ageInYears <= max;
            });
        }
    }

    return matchesSearch && matchesStatus && matchesAge;
  });

  const clearAgeFilter = () => {
      setMinAge('');
      setMaxAge('');
      setBabiesOnly(false);
      setShowAgeFilter(false);
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1 p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-800 dark:text-white transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span className="text-sm font-medium">Voltar</span>
                </button>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">Famílias</h1>
            </div>
            <button 
                onClick={() => navigate('/new-family')}
                className="text-primary font-semibold text-sm hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors"
            >
                Adicionar
            </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col gap-3">
            <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar família..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-background-dark border-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 outline-none"
                />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <FilterChip label="Todas" active={filterStatus === 'All'} onClick={() => setFilterStatus('All')} />
                <FilterChip label="Críticas" active={filterStatus === Status.Critical} onClick={() => setFilterStatus(Status.Critical)} count={families.filter(f => f.status === Status.Critical).length} />
                <FilterChip label="Ativas" active={filterStatus === Status.Active} onClick={() => setFilterStatus(Status.Active)} />
                
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                
                <button 
                    onClick={() => setShowAgeFilter(!showAgeFilter)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors border flex items-center gap-1 ${
                        showAgeFilter || minAge || maxAge || babiesOnly
                        ? 'bg-primary/10 text-primary border-primary/20' 
                        : 'bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800'
                    }`}
                >
                    <span className="material-symbols-outlined text-sm">child_care</span>
                    Filhos/Idade
                </button>
            </div>

            {/* Expanded Age Filter */}
            {showAgeFilter && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    
                    <div className="flex items-center gap-3 mb-3">
                         <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={babiesOnly}
                                onChange={(e) => {
                                    setBabiesOnly(e.target.checked);
                                    if(e.target.checked) {
                                        setMinAge('');
                                        setMaxAge('');
                                    }
                                }}
                                className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            Apenas Bebês (0-11 meses)
                         </label>
                    </div>

                    {!babiesOnly && (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 flex-1">
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Mín (Anos)</label>
                                    <input 
                                        type="number" 
                                        value={minAge}
                                        onChange={(e) => setMinAge(e.target.value)}
                                        placeholder="0"
                                        className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-600 px-2 text-sm bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div className="pt-4 text-slate-400">-</div>
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Máx (Anos)</label>
                                    <input 
                                        type="number" 
                                        value={maxAge}
                                        onChange={(e) => setMaxAge(e.target.value)}
                                        placeholder="18"
                                        className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-600 px-2 text-sm bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {(minAge || maxAge || babiesOnly) && (
                        <div className="flex justify-end mt-2">
                             <button onClick={clearAgeFilter} className="text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors">
                                Limpar Filtro
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
        {filteredFamilies.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-20 text-slate-400">
                <span className="material-symbols-outlined text-6xl mb-4 text-slate-300 dark:text-slate-700">search_off</span>
                <p>Nenhuma família encontrada.</p>
                {(minAge || maxAge || babiesOnly) && <p className="text-xs mt-2 text-primary">Tente ajustar o filtro de idade.</p>}
            </div>
        ) : (
            filteredFamilies.map(family => (
                <div 
                    key={family.id}
                    onClick={() => navigate(`/families/${family.id}`)}
                    className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm active:scale-[0.99] transition-transform cursor-pointer flex items-center gap-4"
                >
                    <div className="relative">
                        <img src={family.avatarUrl} alt={family.name} className="size-14 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" />
                        {family.status === Status.Critical && (
                            <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-0.5 border-2 border-white dark:border-surface-dark">
                                <span className="material-symbols-outlined text-[14px] block">warning</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                             <h3 className="font-bold text-slate-900 dark:text-white truncate">{family.name}</h3>
                             <span className="text-xs text-slate-400 font-mono">{family.code}</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{family.address}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                             <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">person</span>
                                {family.responsibleName}
                             </span>
                             {/* Show child count badge if filter is active or generally informative */}
                             <span className="text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-500 border border-slate-100 dark:border-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">child_care</span>
                                {family.members.filter(m => {
                                    const ageInYears = m.ageType === 'Months' ? m.age / 12 : m.age;
                                    return ageInYears <= 18;
                                }).length}
                             </span>
                             {/* Explicit Baby Badge if babies exist */}
                             {family.members.some(m => m.ageType === 'Months') && (
                                <span className="text-[10px] bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 px-2 py-0.5 rounded-full font-bold">
                                    Tem Bebê
                                </span>
                             )}
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600">chevron_right</span>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

const FilterChip = ({ label, active, onClick, count }: { label: string, active: boolean, onClick: () => void, count?: number }) => (
    <button 
        onClick={onClick}
        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            active 
            ? 'bg-primary text-white border-primary' 
            : 'bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800'
        }`}
    >
        {label} {count !== undefined && <span className={`ml-1 text-xs opacity-80 ${active ? 'bg-white/20 px-1.5 rounded-full' : ''}`}>({count})</span>}
    </button>
);
