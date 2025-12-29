import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../constants';
import { Status } from '../types';

export const FamilyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { families, removeFamily } = useAppContext();
  const family = families.find(f => f.id === id);
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'history'>('info');

  if (!family) return <div className="p-4">Família não encontrada</div>;

  // Helpers for Action Buttons
  const cleanNumber = (num: string) => num.replace(/\D/g, '');
  
  const phoneDigits = cleanNumber(family.phone);
  
  // Use specific whatsapp number if available, otherwise fallback to main phone
  const waDigits = family.whatsapp ? cleanNumber(family.whatsapp) : phoneDigits;
  // Assuming Brazil country code (55). 
  const waLink = waDigits ? `https://wa.me/55${waDigits}` : '';
  
  const addressQuery = encodeURIComponent(`${family.address}, ${family.neighborhood || ''}`);
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;

  const handleDelete = () => {
      if (window.confirm(`ATENÇÃO: Deseja realmente excluir o cadastro da ${family.name}? Essa ação não poderá ser desfeita.`)) {
          removeFamily(family.id);
          navigate('/families');
      }
  };

  const handleEdit = () => {
      navigate(`/edit-family/${family.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface-light dark:bg-surface-dark shadow-sm px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 py-2 pr-3 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-900 dark:text-white transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="text-sm font-medium">Voltar</span>
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-[50%]">{family.name}</h1>
        <div className="flex items-center gap-2">
            <button 
                onClick={handleDelete}
                className="flex size-10 items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition-colors"
                title="Excluir Família"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
            <button 
                onClick={handleEdit}
                className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-primary"
                title="Editar Família"
            >
              <span className="material-symbols-outlined">edit</span>
            </button>
        </div>
      </header>

      {/* Profile Header */}
      <div className="bg-surface-light dark:bg-surface-dark pt-6 pb-2 px-4 flex flex-col items-center border-b border-gray-100 dark:border-gray-800">
         <div className="relative mb-3">
            <img src={family.avatarUrl} alt={family.name} className="size-24 rounded-full object-cover border-4 border-slate-50 dark:border-gray-700 shadow-md" />
            <div className={`absolute bottom-0 right-0 size-7 rounded-full border-2 border-white dark:border-surface-dark flex items-center justify-center ${family.status === Status.Critical ? 'bg-red-500' : 'bg-green-500'}`}>
                <span className="material-symbols-outlined text-white text-xs">{family.status === Status.Critical ? 'warning' : 'check'}</span>
            </div>
         </div>
         <h2 className="text-xl font-bold text-slate-900 dark:text-white">{family.name}</h2>
         <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{family.code}</p>
         
         <div className="grid grid-cols-3 gap-3 w-full max-w-xs mt-6 mb-4">
             <QuickAction 
                icon="call" 
                label="Ligar" 
                href={phoneDigits ? `tel:${phoneDigits}` : undefined} 
             />
             <QuickAction 
                icon="chat" 
                label="WhatsApp" 
                href={waLink || undefined}
                target="_blank"
                color="text-green-600 bg-green-50 dark:bg-green-900/20" 
             />
             <QuickAction 
                icon="map" 
                label="Mapa" 
                href={mapLink}
                target="_blank"
                color="text-purple-600 bg-purple-50 dark:bg-purple-900/20" 
             />
         </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[60px] z-30 bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 flex">
        <TabButton label="Dados" active={activeTab === 'info'} onClick={() => setActiveTab('info')} />
        <TabButton label="Membros" active={activeTab === 'members'} onClick={() => setActiveTab('members')} />
        <TabButton label="Histórico" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-4">
        {activeTab === 'info' && (
            <>
                <div className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
                    <h3 className="font-bold text-slate-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Situação Atual</h3>
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/20">
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-bold mb-1">{family.status === Status.Critical ? 'SITUAÇÃO CRÍTICA' : 'SITUAÇÃO NORMAL'}</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{family.statusDescription}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
                    <h3 className="font-bold text-slate-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Contato e Endereço</h3>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <span className="material-symbols-outlined text-slate-400">location_on</span>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{family.address}</p>
                                <p className="text-xs text-slate-500">{family.neighborhood || 'Bairro não informado'}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="material-symbols-outlined text-slate-400">phone</span>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{family.phone}</p>
                                {family.whatsapp && <p className="text-xs text-slate-500">Zap: {family.whatsapp}</p>}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="material-symbols-outlined text-slate-400">church</span>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{family.congregation || 'Não informado'}</p>
                                <p className="text-xs text-slate-500">{family.churchMember ? 'Membro' : 'Visitante'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {family.observations && (
                  <div className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 space-y-2">
                      <h3 className="font-bold text-slate-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Observações</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 italic">{family.observations}</p>
                  </div>
                )}
            </>
        )}

        {activeTab === 'members' && (
            <div className="flex flex-col gap-3">
                {family.members.length === 0 ? (
                  <p className="text-center text-slate-400 py-10">Nenhum membro cadastrado.</p>
                ) : (
                  family.members.map(member => (
                    <div key={member.id} className="bg-white dark:bg-surface-dark p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                         <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                             <span className="material-symbols-outlined">person</span>
                         </div>
                         <div className="flex-1">
                             <h4 className="font-bold text-slate-900 dark:text-white text-sm">{member.name}</h4>
                             <p className="text-xs text-slate-500 dark:text-slate-400">
                                {member.role} • {member.age} {member.ageType === 'Months' ? 'meses' : 'anos'}
                             </p>
                         </div>
                         <div className="flex gap-1">
                            {member.tags?.map(tag => (
                                <span key={tag} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md">{tag}</span>
                            ))}
                         </div>
                    </div>
                  ))
                )}
            </div>
        )}

        {activeTab === 'history' && (
            <div className="space-y-6 pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
                {family.history.length === 0 ? (
                  <p className="text-center text-slate-400 py-10">Nenhum histórico disponível.</p>
                ) : (
                  family.history.map((record, index) => (
                    <div key={record.id} className="relative pl-6">
                        <div className={`absolute -left-[21px] top-1 size-4 rounded-full border-4 border-background-light dark:border-background-dark ${
                            record.type === 'Aid' ? 'bg-orange-500' : 'bg-primary'
                        }`}></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 block">{record.date.split('-').reverse().join('/')}</span>
                        <div className="bg-white dark:bg-surface-dark p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`material-symbols-outlined text-sm ${record.type === 'Aid' ? 'text-orange-500' : 'text-primary'}`}>
                                    {record.type === 'Aid' ? 'inventory_2' : 'history'}
                                </span>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{record.title}</h4>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{record.description}</p>
                            <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">Resp: {record.responsible}</p>
                        </div>
                    </div>
                  ))
                )}
            </div>
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-20 right-6 z-40 md:hidden">
         <button onClick={() => navigate('/new-record')} className="bg-primary hover:bg-yellow-600 text-white rounded-full p-4 shadow-lg shadow-yellow-500/30 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
            <span className="material-symbols-outlined">edit_calendar</span>
            <span className="text-sm font-bold pr-1">Registrar</span>
         </button>
      </div>
    </div>
  );
};

interface QuickActionProps {
    icon: string;
    label: string;
    href?: string;
    color?: string;
    target?: string;
}

const QuickAction = ({ icon, label, href, color = 'text-primary bg-primary/10', target }: QuickActionProps) => (
    <a 
        href={href} 
        target={target}
        rel={target === '_blank' ? "noopener noreferrer" : undefined}
        className={`flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer ${!href ? 'opacity-50 pointer-events-none grayscale' : ''}`}
    >
        <div className={`size-10 rounded-full flex items-center justify-center ${color}`}>
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
    </a>
);

const TabButton = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`flex-1 pb-3 pt-4 text-sm font-bold tracking-wide border-b-[3px] transition-colors ${
            active 
            ? 'border-primary text-slate-900 dark:text-white' 
            : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-primary'
        }`}
    >
        {label}
    </button>
);