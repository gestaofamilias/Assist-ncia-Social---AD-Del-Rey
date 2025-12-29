import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../constants';
import { Status, FamilyMember } from '../types';

export const NewFamily = () => {
  const navigate = useNavigate();
  const { addFamily } = useAppContext();
  
  // State for the main family data
  const [formData, setFormData] = useState({
      familyName: '', // New field for custom display name
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
  });

  // State for the list of members being added
  const [members, setMembers] = useState<FamilyMember[]>([]);
  
  // State for the temporary member form inputs
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

  const handleAddMember = (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent form submission
      
      if (!tempMember.name || !tempMember.role) {
          alert("Nome e Parentesco são obrigatórios para adicionar um membro.");
          return;
      }

      // Validation for months
      if (tempMember.ageType === 'Months' && Number(tempMember.age) > 11) {
          alert("Para bebês, a idade em meses deve ser entre 0 e 11. Para 12 meses ou mais, selecione 'Anos'.");
          return;
      }

      const newMember: FamilyMember = {
          id: Math.random().toString(36).substr(2, 9),
          name: tempMember.name,
          role: tempMember.role,
          age: Number(tempMember.age) || 0,
          ageType: tempMember.ageType,
          tags: tempMember.tags ? tempMember.tags.split(',').map(t => t.trim()).filter(t => t !== '') : []
      };

      setMembers([...members, newMember]);
      setTempMember({ name: '', role: '', age: '', ageType: 'Years', tags: '' }); // Reset fields
  };

  const handleRemoveMember = (id: string) => {
      setMembers(members.filter(m => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Use custom family name or fallback to auto-generation
      const finalFamilyName = formData.familyName.trim() 
        ? formData.familyName 
        : `Família ${formData.responsibleName.split(' ').pop() || ''}`;

      // Robust ID Generation (UUID)
      const generateId = () => {
          if (typeof crypto !== 'undefined' && crypto.randomUUID) {
              return crypto.randomUUID();
          }
          return Date.now().toString(36) + Math.random().toString(36).substr(2);
      };

      const newFamily = {
          id: generateId(),
          code: `#FAM-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          name: finalFamilyName,
          responsibleName: formData.responsibleName,
          avatarUrl: `https://picsum.photos/seed/${Math.random()}/200/200`,
          status: Status.Active,
          statusDescription: formData.mainNeed || 'Em análise',
          address: formData.address,
          neighborhood: formData.neighborhood,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          income: formData.income,
          socialClass: formData.socialClass,
          professionalStatus: formData.professionalStatus,
          mainNeed: formData.mainNeed,
          observations: formData.observations,
          members: members, // Include the added members
          history: [],
          churchMember: formData.churchMember,
          congregation: formData.congregation
      };
      
      addFamily(newFamily);
      navigate('/dashboard');
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = (Number(value) / 100).toFixed(2).replace(".", ",");
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setFormData({ ...formData, income: value });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center bg-white dark:bg-surface-dark px-4 py-4 justify-between border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-800 dark:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-medium">Voltar</span>
        </button>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Novo Cadastro</h2>
        <div className="w-[70px]"></div> {/* Spacer for alignment */}
      </div>

      <form className="flex-1 p-4 pb-32 overflow-y-auto max-w-lg mx-auto w-full space-y-6" onSubmit={handleSubmit}>
         
         {/* Generated ID Card */}
         <div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[28px]">fingerprint</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Código da Família</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">#FAM-2024-XXX</p>
                    </div>
                </div>
                <div className="size-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
            </div>
         </div>

         {/* Identification Data */}
         <section className="space-y-3">
             <h3 className="text-base font-bold text-slate-900 dark:text-white px-1">Identificação</h3>
             <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                 
                 {/* Nome de Referência (Novo Campo) */}
                 <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome de Referência da Família <span className="text-red-500">*</span></label>
                     <input 
                        required
                        type="text" 
                        value={formData.familyName}
                        onChange={e => setFormData({...formData, familyName: e.target.value})}
                        className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium"
                        placeholder="Ex: Família Silva (Jd. Esperança)" 
                     />
                     <p className="text-[11px] text-slate-400">Este é o nome principal que será usado na busca.</p>
                 </div>

                 <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome do Responsável</label>
                     <input 
                        required
                        type="text" 
                        value={formData.responsibleName}
                        onChange={e => {
                            const val = e.target.value;
                            // Auto-fill family name if it's empty
                            const updates = { responsibleName: val };
                            if (!formData.familyName && val.trim().length > 3) {
                                // Logic handled in submit or just let user type. 
                                // Better UX: Don't overwrite if user typed, but maybe suggest?
                                // We keep it manual to avoid annoyance, user must fill Reference Name.
                            }
                            setFormData(prev => ({...prev, ...updates}));
                        }}
                        className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                        placeholder="Ex: Maria da Silva" 
                     />
                 </div>
                 
                 <div className="flex items-center justify-between pt-1">
                     <div className="pr-4">
                        <p className="font-medium text-slate-900 dark:text-white text-sm">Membro da Igreja</p>
                        <p className="text-xs text-slate-500">A pessoa frequenta os cultos?</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.churchMember} onChange={e => setFormData({...formData, churchMember: e.target.checked})} className="sr-only peer" />
                        <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                     </label>
                 </div>

                 {formData.churchMember && (
                    <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Congregação / Responsável</label>
                        <input 
                            type="text"
                            value={formData.congregation}
                            onChange={e => setFormData({...formData, congregation: e.target.value})}
                            className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                            placeholder="Ex: Sede - Pr. João" 
                        />
                    </div>
                 )}
             </div>
         </section>

         {/* Family Members Composition */}
         <section className="space-y-3">
             <div className="flex items-center justify-between px-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Composição Familiar</h3>
                <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md">{members.length} adicionados</span>
             </div>
             
             <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                 
                 {/* Input Fields for New Member */}
                 <div className="space-y-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome do Membro</label>
                        <input 
                            type="text" 
                            value={tempMember.name}
                            onChange={e => setTempMember({...tempMember, name: e.target.value})}
                            className="w-full h-10 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-background-dark px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            placeholder="Nome completo" 
                        />
                    </div>
                    {/* Alterado para grid-cols-1 no mobile e grid-cols-2 apenas no tablet/desktop (sm:) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Parentesco</label>
                            <select 
                                value={tempMember.role}
                                onChange={e => setTempMember({...tempMember, role: e.target.value})}
                                className="w-full h-10 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-background-dark px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            >
                                <option value="">Selecione</option>
                                <option value="Cônjuge">Cônjuge</option>
                                <option value="Filho(a)">Filho(a)</option>
                                <option value="Pai/Mãe">Pai/Mãe</option>
                                <option value="Irmão(ã)">Irmão(ã)</option>
                                <option value="Neto(a)">Neto(a)</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Idade</label>
                            <div className="flex gap-2">
                                <input 
                                    type="number" 
                                    value={tempMember.age}
                                    onChange={e => setTempMember({...tempMember, age: e.target.value})}
                                    className="flex-1 h-10 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-background-dark px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    placeholder={tempMember.ageType === 'Months' ? "0-11" : "Anos"}
                                    min="0"
                                    max={tempMember.ageType === 'Months' ? 11 : 120}
                                />
                                <select
                                    value={tempMember.ageType}
                                    onChange={e => setTempMember({...tempMember, ageType: e.target.value as 'Years' | 'Months'})}
                                    className="w-24 h-10 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-background-dark px-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                >
                                    <option value="Years">Anos</option>
                                    <option value="Months">Meses</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tags <span className="text-slate-400 font-normal">(Opcional)</span></label>
                        <input 
                            type="text" 
                            value={tempMember.tags}
                            onChange={e => setTempMember({...tempMember, tags: e.target.value})}
                            className="w-full h-10 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-background-dark px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            placeholder="Ex: Estuda, Desempregado, PCD (separe por vírgula)" 
                        />
                    </div>
                    
                    <button 
                        type="button"
                        onClick={handleAddMember}
                        className="w-full h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Adicionar Membro
                    </button>
                 </div>

                 {/* List of Added Members */}
                 <div className="space-y-2">
                    {members.length === 0 ? (
                        <p className="text-center text-sm text-slate-400 py-2">Nenhum membro adicionado ainda.</p>
                    ) : (
                        members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-background-dark rounded-xl border border-slate-100 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{member.name}</p>
                                        <p className="text-xs text-slate-500">
                                            {member.role} • {member.age} {member.ageType === 'Months' ? 'meses' : 'anos'}
                                        </p>
                                        {member.tags && member.tags.length > 0 && (
                                            <div className="flex gap-1 mt-1">
                                                {member.tags.map(tag => (
                                                    <span key={tag} className="text-[9px] bg-white dark:bg-surface-dark border border-slate-200 dark:border-gray-600 px-1.5 rounded-sm text-slate-600 dark:text-slate-400">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        ))
                    )}
                 </div>
             </div>
         </section>

         {/* Contact */}
         <section className="space-y-3">
             <h3 className="text-base font-bold text-slate-900 dark:text-white px-1">Contato e Endereço</h3>
             <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Telefone Principal</label>
                     <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">call</span>
                        <input 
                            type="tel" 
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                            className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark pl-11 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                            placeholder="(00) 00000-0000" 
                        />
                     </div>
                 </div>

                 <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">WhatsApp / Secundário</label>
                     <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">chat</span>
                        <input 
                            type="tel" 
                            value={formData.whatsapp}
                            onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                            className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark pl-11 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                            placeholder="(00) 00000-0000" 
                        />
                     </div>
                 </div>

                 <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Endereço Completo</label>
                     <input 
                        type="text" 
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                        placeholder="Rua, Número, Complemento" 
                     />
                 </div>

                 <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bairro</label>
                     <input 
                        type="text" 
                        value={formData.neighborhood}
                        onChange={e => setFormData({...formData, neighborhood: e.target.value})}
                        className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                        placeholder="Nome do Bairro" 
                     />
                 </div>
             </div>
         </section>

         {/* Socioeconomic */}
         <section className="space-y-3">
             <h3 className="text-base font-bold text-slate-900 dark:text-white px-1">Perfil Socioeconômico</h3>
             <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Classe Social</label>
                        <select 
                            value={formData.socialClass}
                            onChange={e => setFormData({...formData, socialClass: e.target.value})}
                            className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-white"
                        >
                            <option value="">Selecione</option>
                            <option value="Baixa">Baixa</option>
                            <option value="Média-Baixa">Média-Baixa</option>
                            <option value="Média">Média</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Renda Familiar</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">R$</span>
                            <input 
                                type="text"
                                value={formData.income}
                                onChange={handleCurrencyChange}
                                className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                placeholder="0,00" 
                            />
                        </div>
                    </div>
                 </div>

                 <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Situação Profissional</label>
                     <select 
                        value={formData.professionalStatus}
                        onChange={e => setFormData({...formData, professionalStatus: e.target.value})}
                        className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-white"
                     >
                        <option value="">Selecione a situação</option>
                        <option value="Empregado (CLT)">Empregado (CLT)</option>
                        <option value="Autônomo">Autônomo</option>
                        <option value="Desempregado">Desempregado</option>
                        <option value="Aposentado">Aposentado</option>
                        <option value="Bico / Informal">Bico / Informal</option>
                     </select>
                 </div>

                 <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Necessidade Principal</label>
                     <select 
                        value={formData.mainNeed}
                        onChange={e => setFormData({...formData, mainNeed: e.target.value})}
                        className="w-full h-11 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-white"
                     >
                        <option value="">Selecione o tipo de ajuda</option>
                        <option value="Alimentação (Cesta Básica)">Alimentação (Cesta Básica)</option>
                        <option value="Medicamentos">Medicamentos</option>
                        <option value="Emprego">Emprego</option>
                        <option value="Moradia">Moradia</option>
                        <option value="Espiritual">Espiritual</option>
                     </select>
                 </div>
             </div>
         </section>

         {/* Additional Details */}
         <section className="space-y-3">
             <h3 className="text-base font-bold text-slate-900 dark:text-white px-1">Detalhes Adicionais</h3>
             <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                 <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Observações Gerais</label>
                     <textarea 
                        rows={4}
                        value={formData.observations}
                        onChange={e => setFormData({...formData, observations: e.target.value})}
                        className="w-full p-4 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 resize-none"
                        placeholder="Descreva aqui detalhes importantes sobre a família, histórico ou outras necessidades..." 
                     />
                 </div>
             </div>
         </section>

      </form>
      
      {/* Sticky Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 p-4 pb-safe z-50 md:pl-64">
          <div className="max-w-lg mx-auto">
            <button onClick={handleSubmit} className="w-full h-12 bg-primary hover:bg-yellow-600 text-white font-bold rounded-full shadow-lg shadow-yellow-500/30 active:scale-[0.98] transition-all text-base">
                Salvar Cadastro
            </button>
          </div>
      </div>
    </div>
  );
};