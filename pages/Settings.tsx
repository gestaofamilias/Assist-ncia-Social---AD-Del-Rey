import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../constants';

export const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, logout, families } = useAppContext();

  const handleLogout = () => {
      logout();
      navigate('/login');
  };

  const exportToCSV = () => {
    if (families.length === 0) {
      alert("Não há famílias cadastradas para exportar.");
      return;
    }
    const headers = ["ID","Codigo","Nome da Familia","Responsavel","Status","Telefone","WhatsApp","Bairro","Endereco","Qtd Membros","Membro Igreja","Congregacao","Necessidade Principal"];
    const csvRows = [headers.join(",")];
    families.forEach(f => {
      const values = [f.id, f.code, `"${f.name}"`, `"${f.responsibleName}"`, f.status, `"${f.phone}"`, `"${f.whatsapp || ""}"`, `"${f.neighborhood || ""}"`, `"${f.address}"`, f.members.length, f.churchMember ? "Sim" : "Não", `"${f.congregation || ""}"`, `"${f.mainNeed || ""}"` ];
      csvRows.push(values.join(","));
    });
    const blob = new Blob(["\ufeff" + csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `familias_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-800 dark:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold">Ajustes</h1>
      </div>

      <div className="p-4 space-y-6 max-w-lg mx-auto w-full pb-20">
        
        {/* Connection Status */}
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 p-3 rounded-xl flex items-center gap-3">
            <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">Conectado ao Cloud Database</p>
        </div>

        <section className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center">
            <img src="https://ui-avatars.com/api/?name=Admin&background=EAB308&color=fff" alt="User" className="size-20 rounded-full border-4 border-slate-50 dark:border-gray-700 mb-3" />
            <h2 className="text-xl font-bold">Administrador</h2>
            <p className="text-sm text-slate-500">Gestor de Assistência Social</p>
        </section>

        <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase px-2">Preferências</h3>
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400">dark_mode</span>
                        <p className="font-medium">Modo Escuro</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                </div>
                <button onClick={exportToCSV} className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                    <span className="material-symbols-outlined text-slate-400">download</span>
                    <span className="font-medium flex-1">Backup de Famílias (CSV)</span>
                    <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                </button>
            </div>
        </section>

        <div className="pt-4">
             <button onClick={handleLogout} className="w-full p-4 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-600 font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                <span className="material-symbols-outlined">logout</span>
                Sair
             </button>
             <p className="text-center text-[10px] text-slate-400 mt-6 uppercase font-bold tracking-widest">Vercel Production Build • 2024</p>
        </div>
      </div>
    </div>
  );
};