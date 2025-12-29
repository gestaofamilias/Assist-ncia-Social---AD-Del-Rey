import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../constants';
import { Status, FamilyMember, Family } from '../types';

export const EditFamily = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { families, updateFamily } = useAppContext();
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
      familyName: '',
      responsibleName: '',
      address: '',
      neighborhood: '',
      phone: '',
      whatsapp: '',
      churchMember: false,
      congregation: '',
      socialClass: '',
      income: '',
      professionalStatus: '',
      mainNeed: '',
      observations: '',
      status: Status.Active,
      statusDescription: ''
  });

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [tempMember, setTempMember] = useState<{
      name: string;
      role: string;
      age: string;
      ageType: 'Years' | 'Months';
      tags: string;
  }>({
      name: '',
      role: '',
      age: '',
      ageType: 'Years',
      tags: ''
  });

  useEffect(() => {
    const family = families.find(f => f.id === id);
    if (family) {
        setFormData({
            familyName: family.name,
            responsibleName: family.responsibleName,
            address: family.address,
            neighborhood: family.neighborhood || '',
            phone: family.phone,
            whatsapp: family.whatsapp || '',
            churchMember: family.churchMember,
            congregation: family.congregation || '',
            socialClass: family.socialClass || '',
            income: family.income || '',
            professionalStatus: family.professionalStatus || '',
            mainNeed: family.mainNeed || '',
            observations: family.observations || '',
            status: family.status,
            statusDescription: family.statusDescription || ''
        });
        setMembers(family.members);
        setLoading(false);
    } else {
        alert("Família não encontrada!");
        navigate('/families');
    }
  }, [id, families, navigate]);

  const handleAddMember = (e: React.MouseEvent) => {
      e.preventDefault();
      if (!tempMember.name || !tempMember.role) return;
      
      const newMember: FamilyMember = {
          id: Math.random().toString(36).substr(2, 9),
          name: tempMember.name,
          role: tempMember.role,
          age: Number(tempMember.age) || 0,
          ageType: tempMember.ageType,
          tags: tempMember.tags ? tempMember.tags.split(',').map(t => t.trim()).filter(t => t !== '') : []
      };

      setMembers([...members, newMember]);
      setTempMember({ name: '', role: '', age: '', ageType: 'Years', tags: '' });
  };

  const handleRemoveMember = (id: string) => {
      setMembers(members.filter(m => m.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const existingFamily = families.find(f => f.id === id);
      if (!existingFamily) return;

      const updatedFamily: Family = {
          ...existingFamily,
          name: formData.familyName,
          responsibleName: formData.responsibleName,
          address: formData.address,
          neighborhood: formData.neighborhood,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          income: formData.income,
          socialClass: formData.socialClass,
          professionalStatus: formData.professionalStatus,
          mainNeed: formData.mainNeed,
          observations: formData.observations,
          status: formData.status,
          statusDescription: formData.statusDescription,
          members: members,
          churchMember: formData.churchMember,
          congregation: formData.congregation
      };
      
      await updateFamily(updatedFamily);
      navigate(`/families/${id}`);
  };

  if (loading) return null;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-background-dark">
      <div className="sticky top-0 z-50 flex items-center bg-white dark:bg-surface-dark px-4 py-4 justify-between border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-800 dark:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-medium">Cancelar</span>
        </button>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Editar Família</h2>
        <div className="w-[70px]"></div>
      </div>

      <form className="flex-1 p-4 pb-32 overflow-y-auto max-w-lg mx-auto w-full space-y-6" onSubmit={handleSubmit}>
         
         <section className="space-y-3">
             <h3 className="text-base font-bold text-slate-900 dark:text-white px-1">Status e Situação</h3>
             <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                 <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status Geral</label>
                     <select 
                        value={formData.status} 
                        onChange={e => setFormData({...formData, status: e.target.value as Status})}
                        className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-3 font-bold text-primary outline-none"
                     >
                        <option value={Status.Active}>Ativo (Normal)</option>
                        <option value={Status.Critical}>Crítico (Urgente)</option>
                        <option value={Status.Archived}>Arquivado (Inativo)</option>
                     </select>
                 </div>
                 <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Resumo da Situação Atual</label>
                     <input 
                        type="text" 
                        value={formData.statusDescription}
                        onChange={e => setFormData({...formData, statusDescription: e.target.value})}
                        className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4 outline-none font-medium"
                        placeholder="Ex: Aguardando visita técnica" 
                     />
                 </div>
             </div>
         </section>

         <section className="space-y-3">
             <h3 className="text-base font-bold text-slate-900 dark:text-white px-1">Identificação</h3>
             <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                 <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome de Referência da Família</label>
                     <input 
                        required
                        type="text" 
                        value={formData.familyName}
                        onChange={e => setFormData({...formData, familyName: e.target.value})}
                        className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                     />
                 </div>

                 <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome do Responsável</label>
                     <input 
                        required
                        type="text" 
                        value={formData.responsibleName}
                        onChange={e => setFormData({...formData, responsibleName: e.target.value})}
                        className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                     />
                 </div>
             </div>
         </section>

         <section className="space-y-3">
             <div className="flex items-center justify-between px-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Composição Familiar</h3>
             </div>
             <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                 <div className="space-y-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Novo Membro</label>
                        <input type="text" value={tempMember.name} onChange={e => setTempMember({...tempMember, name: e.target.value})} className="w-full h-10 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-background-dark px-3 text-sm" placeholder="Nome" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <select value={tempMember.role} onChange={e => setTempMember({...tempMember, role: e.target.value})} className="h-10 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-background-dark px-3 text-sm">
                            <option value="">Parentesco</option>
                            <option value="Cônjuge">Cônjuge</option>
                            <option value="Filho(a)">Filho(a)</option>
                            <option value="Outro">Outro</option>
                        </select>
                        <div className="flex gap-2">
                            <input type="number" value={tempMember.age} onChange={e => setTempMember({...tempMember, age: e.target.value})} className="flex-1 h-10 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-background-dark px-3 text-sm" placeholder="Idade" />
                            <select value={tempMember.ageType} onChange={e => setTempMember({...tempMember, ageType: e.target.value as 'Years' | 'Months'})} className="w-18 h-10 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-background-dark px-1 text-xs">
                                <option value="Years">Anos</option>
                                <option value="Months">Meses</option>
                            </select>
                        </div>
                    </div>
                    <button type="button" onClick={handleAddMember} className="w-full h-10 bg-slate-100 dark:bg-slate-800 text-primary font-bold rounded-lg text-sm flex items-center justify-center gap-2"><span className="material-symbols-outlined">add</span> Adicionar Membro</button>
                 </div>
                 <div className="space-y-2">
                    {members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-background-dark rounded-xl border border-slate-100 dark:border-gray-700">
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{member.name}</p>
                                <p className="text-xs text-slate-500">{member.role} • {member.age} {member.ageType === 'Months' ? 'meses' : 'anos'}</p>
                            </div>
                            <button type="button" onClick={() => handleRemoveMember(member.id)} className="p-1.5 text-slate-400 hover:text-red-500"><span className="material-symbols-outlined text-lg">delete</span></button>
                        </div>
                    ))}
                 </div>
             </div>
         </section>

         <section className="space-y-3">
             <h3 className="text-base font-bold text-slate-900 dark:text-white px-1">Contato e Endereço</h3>
             <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Telefone</label>
                     <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4" />
                 </div>
                 <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Endereço</label>
                     <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4" />
                 </div>
                 <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bairro</label>
                     <input type="text" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4" />
                 </div>
             </div>
         </section>

         <section className="space-y-3">
             <h3 className="text-base font-bold text-slate-900 dark:text-white px-1">Observações</h3>
             <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                 <textarea rows={4} value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} className="w-full p-4 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark text-slate-900 dark:text-white outline-none resize-none" placeholder="Observações extras..." />
             </div>
         </section>
      </form>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 p-4 pb-safe z-50 md:pl-64">
          <div className="max-w-lg mx-auto">
            <button onClick={handleSubmit} className="w-full h-12 bg-primary hover:bg-yellow-600 text-white font-bold rounded-full shadow-lg active:scale-[0.98] transition-all">
                Salvar Alterações
            </button>
          </div>
      </div>
    </div>
  );
};