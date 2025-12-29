import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../constants';
import { AidType, HistoryRecord } from '../types';

export const NewRecord = () => {
  const navigate = useNavigate();
  const { families, addHistoryRecord } = useAppContext();
  const [selectedFamilyId, setSelectedFamilyId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today YYYY-MM-DD
  const [recordType, setRecordType] = useState<'Aid' | 'Visit'>('Aid');
  const [aidType, setAidType] = useState<AidType | ''>(AidType.FoodBasket);
  const [customAidDetail, setCustomAidDetail] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
      const finalAidType = aidType === AidType.Other ? customAidDetail : aidType;
      
      const newRecord: HistoryRecord = {
          id: Math.random().toString(36).substr(2, 9),
          date: date,
          type: recordType,
          title: recordType === 'Visit' ? 'Visita Pastoral' : (finalAidType || 'Doação'),
          description: description,
          responsible: 'Administrador' // Hardcoded for demo
      };

      addHistoryRecord(selectedFamilyId, newRecord);
      
      alert('Registro salvo com sucesso!');
      navigate('/dashboard');
  }

  const selectedFamily = families.find(f => f.id === selectedFamilyId);

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
        {/* Header */}
        <div className="sticky top-0 z-50 flex items-center bg-white dark:bg-surface-dark px-4 py-3 justify-between border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1 p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-800 dark:text-white transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span className="text-sm font-medium">Voltar</span>
                </button>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Novo Atendimento</h2>
            </div>
        </div>

        <div className="flex-1 p-4 pb-32 overflow-y-auto max-w-lg mx-auto w-full space-y-6">
            
            {/* Family Selector */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Família Atendida</label>
                <select 
                    value={selectedFamilyId}
                    onChange={(e) => setSelectedFamilyId(e.target.value)}
                    className="w-full h-14 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white px-4 outline-none focus:ring-2 focus:ring-primary/50"
                >
                    <option value="">Selecione uma família...</option>
                    {families.map(f => (
                        <option key={f.id} value={f.id}>{f.name} - {f.responsibleName}</option>
                    ))}
                </select>
                {selectedFamily && (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-900/20 mt-1">
                        <img src={selectedFamily.avatarUrl} className="size-10 rounded-full" alt="" />
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedFamily.name}</p>
                            <p className="text-xs text-slate-500">{selectedFamily.address}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Date Picker */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Data do Atendimento</label>
                <div className="relative">
                    <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white px-4 outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                    />
                     {/* Calendar Icon for better UX since native date picker icons vary */}
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">calendar_month</span>
                </div>
            </div>

            {/* Record Type Toggle */}
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex">
                <button 
                    onClick={() => setRecordType('Aid')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${recordType === 'Aid' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    Doação / Ajuda
                </button>
                <button 
                    onClick={() => setRecordType('Visit')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${recordType === 'Visit' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    Visita
                </button>
            </div>

            {/* Aid Specifics */}
            {recordType === 'Aid' && (
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Tipo de Ajuda</label>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.values(AidType).map((type) => (
                            <button
                                key={type}
                                onClick={() => setAidType(type)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                    aidType === type 
                                    ? 'border-primary bg-primary/5 text-primary' 
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                            >
                                <span className="material-symbols-outlined mb-1">
                                    {type === AidType.FoodBasket ? 'shopping_basket' : 
                                     type === AidType.Financial ? 'payments' : 
                                     type === AidType.Medicine ? 'medication' : 
                                     type === AidType.Clothes ? 'checkroom' : 
                                     type === AidType.Gas ? 'propane' :
                                     type === AidType.Spiritual ? 'volunteer_activism' :
                                     type === AidType.Other ? 'more_horiz' :
                                     'card_giftcard'}
                                </span>
                                <span className="text-xs font-bold">{type}</span>
                            </button>
                        ))}
                    </div>

                    {/* Custom Input for 'Outros' */}
                    {aidType === AidType.Other && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200 pt-1">
                             <label className="text-xs font-medium text-slate-500 ml-1 mb-1 block">Especifique o tipo de ajuda:</label>
                             <input 
                                type="text"
                                value={customAidDetail}
                                onChange={(e) => setCustomAidDetail(e.target.value)}
                                className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
                                placeholder="Ex: Móveis, Transporte, Pagamento de Luz..."
                                autoFocus
                             />
                        </div>
                    )}
                </div>
            )}

            {/* Details */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Observações</label>
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva detalhes sobre a visita ou itens entregues..."
                    className="w-full min-h-[120px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                ></textarea>
            </div>

        </div>

        {/* Footer Action */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 p-4 pb-8 z-40 md:pl-64">
            <button 
                onClick={handleSave}
                disabled={!selectedFamilyId || (recordType === 'Aid' && aidType === AidType.Other && !customAidDetail)}
                className="w-full flex items-center justify-center gap-2 bg-primary disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed hover:bg-yellow-600 text-white font-bold h-12 rounded-xl transition-colors shadow-lg shadow-yellow-500/20"
            >
                <span className="material-symbols-outlined">save</span>
                <span>Salvar Registro</span>
            </button>
        </div>
    </div>
  );
};