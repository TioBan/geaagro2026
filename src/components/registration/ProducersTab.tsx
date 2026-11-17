import React, { useMemo, useState } from 'react';
import { Users, Plus, Pencil, Trash2, Save, RotateCcw } from 'lucide-react';
import { Farm, RuralProducer } from '../../types/agronomy';
import { BRAZIL_STATES } from '../../data/brazilStates';
import { SearchFilterBar } from './SearchFilterBar';
import type { DeleteTargetPayload } from './FarmsPlotsTab';

interface ProducersTabProps {
  producers: RuralProducer[];
  setProducers: React.Dispatch<React.SetStateAction<RuralProducer[]>>;
  farms: Farm[];
  onEditProducer: (producer: RuralProducer) => void;
  onRequestDelete: (target: DeleteTargetPayload) => void;
  onNotify: (msg: string) => void;
}

export const ProducersTab: React.FC<ProducersTabProps> = ({
  producers,
  setProducers,
  farms,
  onEditProducer,
  onRequestDelete,
  onNotify,
}) => {
  const [newProdName, setNewProdName] = useState('');
  const [newProdDoc, setNewProdDoc] = useState('');
  const [newProdStateRegistration, setNewProdStateRegistration] = useState('');
  const [newProdPhone, setNewProdPhone] = useState('');
  const [newProdEmail, setNewProdEmail] = useState('');
  const [newProdCity, setNewProdCity] = useState('');
  const [newProdState, setNewProdState] = useState('');
  const [newProdCompanyId, setNewProdCompanyId] = useState('');

  const [producerSearchTerm, setProducerSearchTerm] = useState('');
  const [producerFilterId, setProducerFilterId] = useState('ALL');

  const validProducers = useMemo(() => (producers || []).filter(p => p && p.id), [producers]);

  const filteredProducers = useMemo(() => {
    let list = validProducers;
    if (producerFilterId !== 'ALL') {
      list = list.filter(p => p.id === producerFilterId);
    }
    if (producerSearchTerm.trim()) {
      const term = producerSearchTerm.toLowerCase().trim();
      list = list.filter(
        p =>
          (p.name && p.name.toLowerCase().includes(term)) ||
          (p.document && p.document.toLowerCase().includes(term)) ||
          (p.stateRegistration && p.stateRegistration.toLowerCase().includes(term)) ||
          (p.city && p.city.toLowerCase().includes(term)) ||
          (p.state && p.state.toLowerCase().includes(term)) ||
          (p.email && p.email.toLowerCase().includes(term)) ||
          (p.phone && p.phone.toLowerCase().includes(term))
      );
    }
    return list;
  }, [validProducers, producerFilterId, producerSearchTerm]);

  const resetProducerForm = () => {
    setNewProdName('');
    setNewProdDoc('');
    setNewProdStateRegistration('');
    setNewProdPhone('');
    setNewProdEmail('');
    setNewProdCity('');
    setNewProdState('');
    setNewProdCompanyId('');
  };

  const handleAddProducer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;

    const prod: RuralProducer = {
      id: `prod-${Date.now()}`,
      name: newProdName.trim(),
      document: newProdDoc.trim() || '000.000.000-00',
      documentType: (newProdDoc || '').length > 14 ? 'CNPJ' : 'CPF',
      stateRegistration: newProdStateRegistration.trim() || 'Isento',
      phone: newProdPhone.trim(),
      email: newProdEmail.trim(),
      address: 'Zona Rural',
      city: newProdCity.trim() || 'Sorriso',
      state: newProdState || 'MT',
      companyId: newProdCompanyId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setProducers(prev => [...prev, prod]);
    resetProducerForm();
    onNotify(`Produtor "${prod.name}" cadastrado com sucesso!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
              Produtores Rurais Cadastrados
            </h3>
          </div>
          <span className="text-[11px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold px-2.5 py-1 rounded-full w-fit">
            {validProducers.length} cadastrado(s)
          </span>
        </div>

        <SearchFilterBar
          searchTerm={producerSearchTerm}
          onSearchTermChange={setProducerSearchTerm}
          searchPlaceholder="Buscar por nome, CPF/CNPJ, IE, cidade..."
          filterId={producerFilterId}
          onFilterIdChange={setProducerFilterId}
          filterAriaLabel="Lista suspensa de produtores rurais"
          allOptionLabel={`📋 Todos os Produtores (${validProducers.length})`}
          options={validProducers.map(p => ({
            value: p.id,
            label: `👤 ${p.name} ${p.city ? `(${p.city}/${p.state})` : ''}`,
          }))}
          filteredCount={filteredProducers.length}
          totalCount={validProducers.length}
          entityPluralLabel="produtores"
          onClearFilters={() => {
            setProducerSearchTerm('');
            setProducerFilterId('ALL');
          }}
        />

        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          {validProducers.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-xs space-y-1">
              <p className="font-semibold text-slate-600 dark:text-zinc-400">Nenhum produtor rural cadastrado</p>
              <p>Preencha o formulário abaixo para registrar os dados do primeiro produtor.</p>
            </div>
          ) : filteredProducers.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-xs space-y-2">
              <p className="font-semibold text-slate-600 dark:text-zinc-300">Nenhum produtor encontrado com os filtros aplicados</p>
              <p className="text-[11px]">Tente outros termos de busca ou selecione "Todos os Produtores" na lista suspensa.</p>
              <button
                type="button"
                onClick={() => {
                  setProducerSearchTerm('');
                  setProducerFilterId('ALL');
                }}
                className="mt-1 px-3 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold rounded text-xs transition-colors cursor-pointer"
              >
                Limpar pesquisa
              </button>
            </div>
          ) : (
            filteredProducers.map(p => (
              <div
                key={p.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80 last:border-0 hover:bg-slate-50/60 dark:hover:bg-zinc-900/40 p-2.5 rounded-lg transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{p.name}</h4>
                    {p.document && (
                      <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-1.5 py-0.5 rounded font-mono font-medium border border-slate-200 dark:border-zinc-700">
                        {p.documentType}: {p.document}
                      </span>
                    )}
                    {p.stateRegistration && (
                      <span className="text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-mono font-medium border border-blue-200 dark:border-blue-900">
                        IE: {p.stateRegistration}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    {p.city ? `${p.city}/${p.state}` : p.state || 'Localidade não informada'}
                    {p.phone ? ` • 📞 ${p.phone}` : ''}
                    {p.email ? ` • ✉️ ${p.email}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start shrink-0">
                  <span className="text-[11px] bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-semibold border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                    {(farms || []).filter(f => f?.producerId === p.id).length} fazenda(s)
                  </span>
                  <button
                    type="button"
                    onClick={() => onEditProducer(p)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer"
                    title="Editar produtor"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const linkedFarmsCount = (farms || []).filter(f => f?.producerId === p.id).length;
                      onRequestDelete({
                        type: 'producer',
                        id: p.id,
                        name: p.name,
                        warningText:
                          linkedFarmsCount > 0
                            ? `${linkedFarmsCount} fazenda(s) cadastrada(s) estão vinculadas a este produtor.`
                            : undefined,
                      });
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer"
                    title="Excluir produtor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Producer Form */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 shadow-xs transition-colors">
        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Novo Produtor Rural
        </h3>
        <form onSubmit={handleAddProducer} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Nome Completo / Razão Social *</label>
              <input
                type="text"
                required
                placeholder="Ex: João da Silva / Agropecuária Santos"
                value={newProdName}
                onChange={e => setNewProdName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">CPF ou CNPJ</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={newProdDoc}
                onChange={e => setNewProdDoc(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Inscrição Estadual (IE)</label>
              <input
                type="text"
                placeholder="Ex: 13.555.444-1 ou Isento"
                value={newProdStateRegistration}
                onChange={e => setNewProdStateRegistration(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Telefone</label>
              <input
                type="text"
                placeholder="(00) 00000-0000"
                value={newProdPhone}
                onChange={e => setNewProdPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">E-mail</label>
              <input
                type="email"
                placeholder="email@fazenda.com"
                value={newProdEmail}
                onChange={e => setNewProdEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Município</label>
              <input
                type="text"
                placeholder="Ex: Sorriso"
                value={newProdCity}
                onChange={e => setNewProdCity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">UF</label>
              <select
                aria-label="UF do Produtor"
                value={newProdState}
                onChange={e => setNewProdState(e.target.value)}
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
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetProducerForm}
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
              Cadastrar Produtor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProducersTab;
