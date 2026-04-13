import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../constants';
import { InventoryCategory, InventoryItem } from '../types';

export const NewInventoryItem = () => {
  const navigate = useNavigate();
  const { addInventoryItem, showAlert } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: '',
    category: InventoryCategory.Food,
    quantity: '',
    unit: 'un',
    expirationDate: '',
    minQuantity: '',
    observations: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.quantity) {
      showAlert('Campos Obrigatórios', 'Preencha os campos obrigatórios.', 'warning');
      return;
    }

    const generateId = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          return crypto.randomUUID();
      }
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    const newItem: InventoryItem = {
      id: generateId(),
      name: formData.name,
      category: formData.category,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      expirationDate: formData.expirationDate || undefined,
      minQuantity: formData.minQuantity ? Number(formData.minQuantity) : undefined,
      observations: formData.observations
    };

    await addInventoryItem(newItem);
    navigate('/inventory');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center bg-white dark:bg-surface-dark px-4 py-4 justify-between border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <button onClick={() => navigate('/inventory')} className="flex items-center gap-1 p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-800 dark:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-medium">Voltar</span>
        </button>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Novo Item</h2>
        <div className="w-[70px]"></div>
      </div>

      <form className="flex-1 p-4 pb-32 overflow-y-auto max-w-lg mx-auto w-full space-y-6" onSubmit={handleSubmit}>
         
         <section className="space-y-3">
             <h3 className="text-base font-bold text-slate-900 dark:text-white px-1">Detalhes do Item</h3>
             <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                 
                 <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome do Item <span className="text-red-500">*</span></label>
                     <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium"
                        placeholder="Ex: Arroz 5kg, Cadeira de Plástico" 
                     />
                 </div>

                 <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Categoria <span className="text-red-500">*</span></label>
                     <select 
                        required
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value as InventoryCategory})}
                        className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-white"
                     >
                        {Object.values(InventoryCategory).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                     </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Quantidade <span className="text-red-500">*</span></label>
                        <input 
                            required
                            type="number"
                            min="0"
                            value={formData.quantity}
                            onChange={e => setFormData({...formData, quantity: e.target.value})}
                            className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                            placeholder="0" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Unidade de Medida</label>
                        <select 
                            value={formData.unit}
                            onChange={e => setFormData({...formData, unit: e.target.value})}
                            className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-white"
                        >
                            <option value="un">Unidade (un)</option>
                            <option value="kg">Quilograma (kg)</option>
                            <option value="g">Grama (g)</option>
                            <option value="L">Litro (L)</option>
                            <option value="ml">Mililitro (ml)</option>
                            <option value="cx">Caixa (cx)</option>
                            <option value="pct">Pacote (pct)</option>
                        </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Validade <span className="text-slate-400 font-normal">(Opcional)</span></label>
                        <input 
                            type="date"
                            value={formData.expirationDate}
                            onChange={e => setFormData({...formData, expirationDate: e.target.value})}
                            className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-white"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Estoque Mínimo <span className="text-slate-400 font-normal">(Opcional)</span></label>
                        <input 
                            type="number"
                            min="0"
                            value={formData.minQuantity}
                            onChange={e => setFormData({...formData, minQuantity: e.target.value})}
                            className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                            placeholder="Alerta se menor que" 
                        />
                    </div>
                 </div>

                 <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Observações</label>
                     <textarea 
                        rows={3}
                        value={formData.observations}
                        onChange={e => setFormData({...formData, observations: e.target.value})}
                        className="w-full p-4 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 resize-none"
                        placeholder="Detalhes sobre marca, localização, etc..." 
                     />
                 </div>
             </div>
         </section>

      </form>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 p-4 pb-safe z-[100] md:pl-64">
          <div className="max-w-lg mx-auto">
            <button 
              type="button"
              onClick={handleSubmit} 
              className="w-full h-12 bg-primary hover:bg-yellow-600 text-white font-bold rounded-full shadow-lg shadow-yellow-500/30 active:scale-[0.98] transition-all text-base flex items-center justify-center"
            >
                Salvar Item
            </button>
          </div>
      </div>
    </div>
  );
};
