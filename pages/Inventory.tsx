import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../constants';
import { InventoryCategory, InventoryItem } from '../types';

export const Inventory = () => {
  const navigate = useNavigate();
  const { inventory, removeInventoryItem, updateInventoryItem } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | 'All'>('All');

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Object.values(InventoryCategory);

  const getCategoryIcon = (category: InventoryCategory) => {
    switch (category) {
      case InventoryCategory.Food: return 'restaurant';
      case InventoryCategory.Hygiene: return 'clean_hands';
      case InventoryCategory.Medicine: return 'medical_services';
      case InventoryCategory.Furniture: return 'chair';
      case InventoryCategory.Other: return 'category';
      default: return 'inventory_2';
    }
  };

  const getCategoryColor = (category: InventoryCategory) => {
    switch (category) {
      case InventoryCategory.Food: return 'text-orange-500 bg-orange-100 dark:bg-orange-900/20';
      case InventoryCategory.Hygiene: return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20';
      case InventoryCategory.Medicine: return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      case InventoryCategory.Furniture: return 'text-amber-600 bg-amber-100 dark:bg-amber-900/20';
      case InventoryCategory.Other: return 'text-slate-500 bg-slate-100 dark:bg-slate-800';
      default: return 'text-primary bg-primary/10';
    }
  };

  const handleQuantityChange = (item: InventoryItem, delta: number) => {
    const newQuantity = Math.max(0, item.quantity + delta);
    if (newQuantity !== item.quantity) {
      updateInventoryItem({ ...item, quantity: newQuantity });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Estoque</h1>
            <p className="text-sm text-slate-500">Gerencie os itens da igreja</p>
          </div>
          <button 
            onClick={() => navigate('/new-inventory-item')}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-yellow-600 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            <span className="hidden sm:inline">Novo Item</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              type="text" 
              placeholder="Buscar itens..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedCategory === 'All' 
                  ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' 
                  : 'bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-gray-700'
              }`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' 
                    : 'bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-slate-400">inventory_2</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Nenhum item encontrado</h3>
            <p className="text-slate-500 text-sm max-w-[250px]">
              {searchTerm || selectedCategory !== 'All' 
                ? 'Tente ajustar os filtros de busca.' 
                : 'Comece adicionando itens ao estoque da igreja.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => {
              const isLowStock = item.minQuantity !== undefined && item.quantity <= item.minQuantity;
              
              return (
                <div key={item.id} className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-slate-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                  {isLowStock && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                      Estoque Baixo
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${getCategoryColor(item.category)}`}>
                      <span className="material-symbols-outlined">{getCategoryIcon(item.category)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate pr-6">{item.name}</h3>
                      <p className="text-xs text-slate-500 mb-3">{item.category}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-background-dark rounded-lg p-1 border border-slate-100 dark:border-gray-700">
                          <button 
                            onClick={() => handleQuantityChange(item, -1)}
                            className="size-8 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-surface-dark text-slate-600 dark:text-slate-300 shadow-sm transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                          <span className="text-sm font-bold text-slate-900 dark:text-white w-8 text-center">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => handleQuantityChange(item, 1)}
                            className="size-8 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-surface-dark text-slate-600 dark:text-slate-300 shadow-sm transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                          {item.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {item.expirationDate && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-gray-800 flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="material-symbols-outlined text-[14px]">event</span>
                      <span>Validade: {new Date(item.expirationDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => {
                      if(confirm('Tem certeza que deseja excluir este item?')) {
                        removeInventoryItem(item.id);
                      }
                    }}
                    className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
