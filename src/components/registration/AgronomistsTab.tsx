import React, { useMemo, useState } from 'react';
import {
  UserCheck,
  Plus,
  Pencil,
  Trash2,
  Save,
  CheckCircle2,
  FileText,
  Stethoscope,
  RotateCcw,
} from 'lucide-react';
import { Agronomist, Company, Farm, TechnicalProfession } from '../../types/agronomy';
import { BRAZIL_STATES } from '../../data/brazilStates';
import { TECHNICAL_PROFESSIONS } from './registrationConstants';
import { SearchFilterBar } from './SearchFilterBar';
import type { DeleteTargetPayload } from './FarmsPlotsTab';

interface AgronomistsTabProps {
  agronomists: Agronomist[];
  setAgronomists: React.Dispatch<React.SetStateAction<Agronomist[]>>;
  farms: Farm[];
  companies: Company[];
  setActiveTab?: (tab: string) => void;
  setActiveSubTab?: (subTab: string) => void;
  onEditAgronomist: (agronomist: Agronomist) => void;
  onRequestDelete: (target: DeleteTargetPayload) => void;
  onNotify: (msg: string) => void;
}

export const AgronomistsTab: React.FC<AgronomistsTabProps> = ({
  agronomists,
  setAgronomists,
  farms,
  companies,
  setActiveTab,
  setActiveSubTab,
  onEditAgronomist,
  onRequestDelete,
  onNotify,
}) => {
  const [newAgroName, setNewAgroName] = useState('');
  const [newAgroProfession, setNewAgroProfession] = useState<TechnicalProfession>('Engenheiro Agrônomo');
  const [newAgroCouncilType, setNewAgroCouncilType] = useState('CREA');
  const [newAgroCrea, setNewAgroCrea] = useState('');
  const [newAgroCreaState, setNewAgroCreaState] = useState('');
  const [newAgroRnp, setNewAgroRnp] = useState('');
  const [newAgroCpf, setNewAgroCpf] = useState('');
  const [newAgroSpecialty, setNewAgroSpecialty] = useState('');
  const [newAgroEmail, setNewAgroEmail] = useState('');
  const [newAgroPhone, setNewAgroPhone] = useState('');
  const [newAgroAddress, setNewAgroAddress] = useState('');
  const [newAgroHasSignature, setNewAgroHasSignature] = useState(false);

  const [agronomistSearchTerm, setAgronomistSearchTerm] = useState('');
  const [agronomistFilterId, setAgronomistFilterId] = useState('ALL');

  const validAgronomists = useMemo(() => (agronomists || []).filter(a => a && a.id), [agronomists]);

  const filteredAgronomists = useMemo(() => {
    let list = validAgronomists;
    if (agronomistFilterId !== 'ALL') {
      list = list.filter(a => a.id === agronomistFilterId);
    }
    if (agronomistSearchTerm.trim()) {
      const term = agronomistSearchTerm.toLowerCase().trim();
      list = list.filter(
        a =>
          (a.name && a.name.toLowerCase().includes(term)) ||
          (a.crea && a.crea.toLowerCase().includes(term)) ||
          (a.councilType && a.councilType.toLowerCase().includes(term)) ||
          (a.profession && a.profession.toLowerCase().includes(term)) ||
          (a.specialty && a.specialty.toLowerCase().includes(term)) ||
          (a.cpf && a.cpf.toLowerCase().includes(term)) ||
          (a.rnp && a.rnp.toLowerCase().includes(term)) ||
          (a.email && a.email.toLowerCase().includes(term)) ||
          (a.phone && a.phone.toLowerCase().includes(term)) ||
          (a.creaState && a.creaState.toLowerCase().includes(term)) ||
          (a.clinicAddress && a.clinicAddress.toLowerCase().includes(term)) ||
          (a.address && a.address.toLowerCase().includes(term))
      );
    }
    return list;
  }, [validAgronomists, agronomistFilterId, agronomistSearchTerm]);

  const handleNewAgroProfessionChange = (role: TechnicalProfession) => {
    setNewAgroProfession(role);
    const item = TECHNICAL_PROFESSIONS.find(p => p.role === role);
    if (item) {
      setNewAgroCouncilType(item.defaultCouncil);
      setNewAgroSpecialty(item.defaultSpecialty);
    }
  };

  const resetAgronomistForm = () => {
    setNewAgroName('');
    setNewAgroProfession('Engenheiro Agrônomo');
    setNewAgroCouncilType('CREA');
    setNewAgroCrea('');
    setNewAgroCreaState('');
    setNewAgroRnp('');
    setNewAgroCpf('');
    setNewAgroSpecialty('');
    setNewAgroEmail('');
    setNewAgroPhone('');
    setNewAgroAddress('');
    setNewAgroHasSignature(false);
  };

  const handleAddAgronomist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgroName || !newAgroCrea) return;

    const item = TECHNICAL_PROFESSIONS.find(p => p.role === newAgroProfession);
    const prefix = item?.short || 'RT';
    const sigText = `${newAgroName} - ${prefix} ${newAgroCouncilType}-${newAgroCreaState} ${newAgroCrea}`;

    const agro: Agronomist = {
      id: `agro-${Date.now()}`,
      name: newAgroName,
      profession: newAgroProfession,
      councilType: newAgroCouncilType,
      crea: newAgroCrea,
      councilNumber: newAgroCrea,
      creaState: newAgroCreaState,
      rnp: newAgroRnp.trim() || `RNP-${Math.floor(100000000 + Math.random() * 900000000)}`,
      cpf: newAgroCpf.trim() || '000.000.000-00',
      email: newAgroEmail,
      phone: newAgroPhone,
      address: newAgroAddress.trim(),
      clinicAddress: newAgroAddress.trim(),
      companyId: companies[0]?.id || '',
      specialty: newAgroSpecialty,
      signatureText: sigText,
      hasDigitalSignature: newAgroHasSignature,
      legalSignatureHash: newAgroHasSignature
        ? `SHA256-${Date.now().toString(16).toUpperCase()}-${Math.floor(Math.random() * 1000000)}`
        : undefined,
      legalSignatureDate: newAgroHasSignature ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setAgronomists(prev => [...prev, agro]);
    resetAgronomistForm();
    onNotify(`Responsável Técnico "${agro.name}" (${agro.profession}) cadastrado!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
              Responsáveis Técnicos Habilitados
            </h3>
          </div>
          <span className="text-[11px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold px-2.5 py-1 rounded-full w-fit">
            {validAgronomists.length} profissional(is)
          </span>
        </div>

        <SearchFilterBar
          searchTerm={agronomistSearchTerm}
          onSearchTermChange={setAgronomistSearchTerm}
          searchPlaceholder="Buscar por nome, CREA/CRMV, profissão, especialidade..."
          filterId={agronomistFilterId}
          onFilterIdChange={setAgronomistFilterId}
          filterAriaLabel="Lista suspensa de responsáveis técnicos"
          allOptionLabel={`📋 Todos os Profissionais (${validAgronomists.length})`}
          options={validAgronomists.map(a => ({
            value: a.id,
            label: `🎓 ${a.name} (${a.councilType || 'CREA'}-${a.creaState || 'MT'} | ${a.profession || 'Eng. Agrônomo'})`,
          }))}
          filteredCount={filteredAgronomists.length}
          totalCount={validAgronomists.length}
          entityPluralLabel="profissionais"
          onClearFilters={() => {
            setAgronomistSearchTerm('');
            setAgronomistFilterId('ALL');
          }}
        />

        <div className="space-y-3">
          {validAgronomists.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-xs space-y-1">
              <p className="font-semibold text-slate-600 dark:text-zinc-400">Nenhum responsável técnico cadastrado</p>
              <p>Preencha o formulário abaixo para registrar Agrônomos, Veterinários ou Zootecnistas para emissão de laudos e receituários.</p>
            </div>
          ) : filteredAgronomists.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-xs space-y-2">
              <p className="font-semibold text-slate-600 dark:text-zinc-300">Nenhum profissional encontrado com os filtros aplicados</p>
              <p className="text-[11px]">Tente outros termos de busca ou selecione "Todos os Profissionais" na lista suspensa.</p>
              <button
                type="button"
                onClick={() => {
                  setAgronomistSearchTerm('');
                  setAgronomistFilterId('ALL');
                }}
                className="mt-1 px-3 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold rounded text-xs transition-colors cursor-pointer"
              >
                Limpar pesquisa
              </button>
            </div>
          ) : (
            filteredAgronomists.map(a => {
              const isVet = a.profession?.toLowerCase().includes('veterin') || a.councilType === 'CRMV';
              return (
                <div
                  key={a.id}
                  className="p-4 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{a.name}</h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            isVet
                              ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                              : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          }`}
                        >
                          {a.profession || 'Engenheiro Agrônomo'}
                        </span>
                        {isVet && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                            <Stethoscope className="w-3 h-3" />
                            Prescritor Habilitado (CRMV)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                        {a.councilType || 'CREA'}-{a.creaState}: {a.crea} {a.rnp ? `• RNP/Reg.: ${a.rnp}` : ''}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-zinc-400 pt-1">
                        {a.cpf && (
                          <div>
                            <strong>CPF:</strong> {a.cpf}
                          </div>
                        )}
                        {a.phone && (
                          <div>
                            <strong>Tel/Whats:</strong> {a.phone}
                          </div>
                        )}
                        {a.email && (
                          <div>
                            <strong>E-mail:</strong> {a.email}
                          </div>
                        )}
                        {(a.clinicAddress || a.address) && (
                          <div className="sm:col-span-2 lg:col-span-3 text-slate-500 dark:text-zinc-400">
                            <strong>Endereço Clínico/Profissional:</strong> {a.clinicAddress || a.address}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 pt-0.5">
                        <strong>Especialidade:</strong> {a.specialty}
                      </p>
                      {a.signatureText && (
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                          Assinatura: {a.signatureText}
                        </p>
                      )}

                      {isVet && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (setActiveTab) setActiveTab('bulario_vet');
                              if (setActiveSubTab) setActiveSubTab('receituario');
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Emitir Receituário Veterinário com este RT</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 self-start shrink-0">
                      <span className="text-[10px] bg-slate-900 dark:bg-zinc-800 text-slate-100 px-2 py-0.5 rounded font-mono whitespace-nowrap">
                        RT Ativo
                      </span>
                      <button
                        type="button"
                        onClick={() => onEditAgronomist(a)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer"
                        title="Editar Responsável Técnico"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const linkedFarmsCount = (farms || []).filter(f => f?.agronomistId === a.id).length;
                          onRequestDelete({
                            type: 'agronomist',
                            id: a.id,
                            name: a.name,
                            warningText:
                              linkedFarmsCount > 0
                                ? `${linkedFarmsCount} fazenda(s) cadastrada(s) contam com este profissional como Responsável Técnico.`
                                : undefined,
                          });
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer"
                        title="Excluir Responsável Técnico"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {a.hasDigitalSignature && (
                    <div className="mt-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded p-1.5 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                          Assinatura Digital Válida
                        </p>
                        <p className="text-[9px] text-emerald-600/80 dark:text-emerald-500/80 font-mono">
                          {a.legalSignatureHash}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* New Agronomist Form */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 shadow-xs transition-colors">
        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Novo Responsável Técnico (RT)
        </h3>
        <form onSubmit={handleAddAgronomist} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Nome Completo do Profissional *</label>
              <input
                type="text"
                required
                placeholder={
                  newAgroProfession.toLowerCase().includes('veterin')
                    ? 'Ex: Dra. Juliana Menezes'
                    : 'Ex: Carlos Eduardo Silveira'
                }
                value={newAgroName}
                onChange={e => setNewAgroName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Profissão / Categoria *</label>
              <select
                aria-label="Profissão do Responsável Técnico"
                value={newAgroProfession}
                onChange={e => handleNewAgroProfessionChange(e.target.value as TechnicalProfession)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {TECHNICAL_PROFESSIONS.map(p => (
                  <option key={p.role} value={p.role}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Conselho de Classe *</label>
              <select
                aria-label="Conselho de Classe"
                value={newAgroCouncilType}
                onChange={e => setNewAgroCouncilType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="CREA">CREA (Engenharia & Agronomia)</option>
                <option value="CRMV">CRMV (Veterinária & Zootecnia)</option>
                <option value="CFTA">CFTA (Técnicos Agrícolas)</option>
                <option value="CFT">CFT (Técnicos Industriais/Agro)</option>
                <option value="CRBio">CRBio (Biólogos)</option>
                <option value="Outro">Outro Conselho</option>
              </select>
            </div>
          </div>

          {(newAgroProfession.toLowerCase().includes('veterin') || newAgroCouncilType === 'CRMV') && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-2.5">
              <Stethoscope className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-blue-900 dark:text-blue-200 leading-normal">
                <strong>Integração com Receituário Veterinário:</strong> Ao cadastrar este Médico Veterinário, o CRMV, CPF, telefone e endereço clínico serão sincronizados automaticamente nas prescrições e receituários oficiais.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Registro no {newAgroCouncilType || 'Conselho'} *
              </label>
              <input
                type="text"
                required
                placeholder={newAgroCouncilType === 'CRMV' ? 'Ex: 12.845/VP' : 'Ex: 145.892/D'}
                value={newAgroCrea}
                onChange={e => setNewAgroCrea(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                UF {newAgroCouncilType || 'Conselho'}
              </label>
              <select
                aria-label="UF do Conselho"
                value={newAgroCreaState}
                onChange={e => setNewAgroCreaState(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">Selecione UF</option>
                {BRAZIL_STATES.map(st => (
                  <option key={st.uf} value={st.uf}>
                    {st.uf} - {st.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">RNP / Reg. Nacional</label>
              <input
                type="text"
                placeholder="RNP ou código federal"
                value={newAgroRnp}
                onChange={e => setNewAgroRnp(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">CPF / Documento</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={newAgroCpf}
                onChange={e => setNewAgroCpf(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Especialidade / Área de Foco</label>
              <input
                type="text"
                value={newAgroSpecialty}
                onChange={e => setNewAgroSpecialty(e.target.value)}
                placeholder="Ex: Sanidade Animal, Clínica Veterinária & Reprodução"
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Celular / WhatsApp</label>
              <input
                type="text"
                placeholder="(00) 00000-0000"
                value={newAgroPhone}
                onChange={e => setNewAgroPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">E-mail</label>
              <input
                type="email"
                placeholder="profissional@consultoria.com.br"
                value={newAgroEmail}
                onChange={e => setNewAgroEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Endereço da Clínica / Consultório / Domicílio Profissional
              </label>
              <input
                type="text"
                placeholder={
                  newAgroProfession.toLowerCase().includes('veterin')
                    ? 'Ex: Av. dos Produtores Rurais, 1420 - Centro Clínico Veterinário'
                    : 'Ex: Av. Agrícola, 500 - Sala 302'
                }
                value={newAgroAddress}
                onChange={e => setNewAgroAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="agroSig"
                checked={newAgroHasSignature}
                onChange={e => setNewAgroHasSignature(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="agroSig" className="text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer">
                Habilitar Assinatura Digital (e-CPF/A1)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetAgronomistForm}
                className="px-4 py-2.5 min-h-[42px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-semibold text-xs rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Limpar campos deste formulário"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpar
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 min-h-[42px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4" />
                Cadastrar Responsável Técnico
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgronomistsTab;
