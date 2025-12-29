import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../constants';

export const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, logout, families } = useAppContext();

  const handleLogout = () => {
      logout();
      navigate('/');
  };

  const exportToCSV = () => {
    if (families.length === 0) {
      alert("Não há famílias cadastradas para exportar.");
      return;
    }

    // Cabeçalhos do CSV
    const headers = [
      "ID",
      "Codigo",
      "Nome da Familia",
      "Responsavel",
      "Status",
      "Telefone",
      "WhatsApp",
      "Bairro",
      "Endereco",
      "Qtd Membros",
      "Membro Igreja",
      "Congregacao",
      "Necessidade Principal"
    ];

    // Mapeamento dos dados
    const csvRows = [headers.join(",")];

    families.forEach(f => {
      const values = [
        f.id,
        f.code,
        `"${f.name.replace(/"/g, '""')}"`,
        `"${f.responsibleName.replace(/"/g, '""')}"`,
        f.status,
        `"${f.phone}"`,
        `"${f.whatsapp || ""}"`,
        `"${(f.neighborhood || "").replace(/"/g, '""')}"`,
        `"${f.address.replace(/"/g, '""')}"`,
        f.members.length,
        f.churchMember ? "Sim" : "Não",
        `"${(f.congregation || "").replace(/"/g, '""')}"`,
        `"${(f.mainNeed || "").replace(/"/g, '""')}"`
      ];
      csvRows.push(values.join(","));
    });

    const csvString = csvRows.join("\n");
    
    // Criação do Blob com BOM para garantir acentuação correta no Excel
    const blob = new Blob(["\ufeff" + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    const fileName = `relatorio_familias_${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-800 dark:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-medium">Voltar</span>
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Ajustes e Preferências</h1>
      </div>

      <div className="p-4 space-y-6 max-w-lg mx-auto w-full">
        
        {/* User Profile */}
        <section className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-3">
                <img src="https://picsum.photos/id/1012/200/200" alt="User" className="size-24 rounded-full object-cover border-4 border-slate-50 dark:border-gray-700" />
                <button className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white dark:border-surface-dark shadow-sm">
                    <span className="material-symbols-outlined text-sm block">edit</span>
                </button>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Administrador</h2>
            <p className="text-sm text-slate-500">social@igreja.com</p>
            <span className="mt-2 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs font-bold rounded-full">Gestor Social</span>
        </section>

        {/* Settings Groups */}
        <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide px-2">Aplicativo</h3>
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                            <span className="material-symbols-outlined">dark_mode</span>
                        </div>
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">Modo Escuro</p>
                            <p className="text-xs text-slate-500">Alterar aparência do app</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                </div>
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                            <span className="material-symbols-outlined">notifications</span>
                        </div>
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">Notificações</p>
                            <p className="text-xs text-slate-500">Alertas de visitas e doações</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>
        </section>

        <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide px-2">Dados e Privacidade</h3>
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <button 
                  onClick={exportToCSV}
                  className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border-b border-gray-100 dark:border-gray-800"
                >
                    <span className="material-symbols-outlined text-slate-400">download</span>
                    <span className="font-medium text-slate-900 dark:text-white flex-1">Exportar Dados (CSV)</span>
                    <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                </button>
                 <button className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                    <span className="material-symbols-outlined text-slate-400">lock_reset</span>
                    <span className="font-medium text-slate-900 dark:text-white flex-1">Alterar Senha</span>
                    <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                </button>
            </div>
        </section>

        <div className="pt-4">
             <button 
                onClick={handleLogout}
                className="w-full p-4 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-600 font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
             >
                <span className="material-symbols-outlined">logout</span>
                Sair do Aplicativo
             </button>
             <p className="text-center text-xs text-slate-400 mt-4">Versão 1.0.0 • Build 2024</p>
        </div>

      </div>
    </div>
  );
};