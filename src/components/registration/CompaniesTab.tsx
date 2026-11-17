import React, { useMemo, useState } from 'react';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Save,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  X as CloseIcon,
  RotateCcw,
} from 'lucide-react';
import { Company, Farm } from '../../types/agronomy';
import { BRAZIL_STATES } from '../../data/brazilStates';
import { SearchFilterBar } from './SearchFilterBar';
import type { DeleteTargetPayload } from './FarmsPlotsTab';

interface CompaniesTabProps {
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  farms: Farm[];
  onEditCompany: (company: Company) => void;
  onRequestDelete: (target: DeleteTargetPayload) => void;
  onNotify: (msg: string) => void;
}

export const CompaniesTab: React.FC<CompaniesTabProps> = ({
  companies,
  setCompanies,
  farms,
  onEditCompany,
  onRequestDelete,
  onNotify,
}) => {
  const [newCompName, setNewCompName] = useState('');
  const [newCompTrading, setNewCompTrading] = useState('');
  const [newCompCnpj, setNewCompCnpj] = useState('');
  const [newCompCrea, setNewCompCrea] = useState('');
  const [newCompCity, setNewCompCity] = useState('');
  const [newCompState, setNewCompState] = useState('');
  const [newCompLogo, setNewCompLogo] = useState('');
  const [newCompLogoError, setNewCompLogoError] = useState<string | null>(null);
  const [newCompHasSignature, setNewCompHasSignature] = useState(false);

  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [companyFilterId, setCompanyFilterId] = useState('ALL');

  const validCompanies = useMemo(() => (companies || []).filter(c => c && c.id), [companies]);

  const filteredCompanies = useMemo(() => {
    let list = validCompanies;
    if (companyFilterId !== 'ALL') {
      list = list.filter(c => c.id === companyFilterId);
    }
    if (companySearchTerm.trim()) {
      const term = companySearchTerm.toLowerCase().trim();
      list = list.filter(
        c =>
          (c.name && c.name.toLowerCase().includes(term)) ||
          (c.tradingName && c.tradingName.toLowerCase().includes(term)) ||
          (c.cnpj && c.cnpj.toLowerCase().includes(term)) ||
          (c.creaRegister && c.creaRegister.toLowerCase().includes(term)) ||
          (c.city && c.city.toLowerCase().includes(term)) ||
          (c.state && c.state.toLowerCase().includes(term)) ||
          (c.address && c.address.toLowerCase().includes(term)) ||
          (c.email && c.email.toLowerCase().includes(term)) ||
          (c.phone && c.phone.toLowerCase().includes(term)) ||
          (c.stateRegistration && c.stateRegistration.toLowerCase().includes(term)) ||
          (c.mapaRegister && c.mapaRegister.toLowerCase().includes(term))
      );
    }
    return list;
  }, [validCompanies, companyFilterId, companySearchTerm]);

  const resetCompanyForm = () => {
    setNewCompName('');
    setNewCompTrading('');
    setNewCompCnpj('');
    setNewCompCrea('');
    setNewCompCity('');
    setNewCompState('');
    setNewCompLogo('');
    setNewCompLogoError(null);
    setNewCompHasSignature(false);
  };

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName) return;

    const comp: Company = {
      id: `comp-${Date.now()}`,
      name: newCompName,
      tradingName: newCompTrading || newCompName,
      cnpj: newCompCnpj || '00.000.000/0001-00',
      stateRegistration: 'Isento',
      creaRegister: newCompCrea || 'CREA-MT PJ-000',
      address: 'Rodovia BR-163 Km 740',
      city: newCompCity || 'Sinop',
      state: newCompState || 'MT',
      phone: '(66) 3500-0000',
      email: 'contato@empresa.com',
      logoUrl: newCompLogo.trim() || '',
      hasDigitalSignature: newCompHasSignature,
      legalSignatureHash: newCompHasSignature
        ? `ICP-BRASIL-${Date.now().toString(16).toUpperCase()}-${Math.floor(Math.random() * 1000000)}`
        : undefined,
      legalSignatureDate: newCompHasSignature ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCompanies(prev => [...prev, comp]);
    resetCompanyForm();
    onNotify(`Empresa "${comp.name}" cadastrada com sucesso!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
              Empresas & Consultorias Agronômicas
            </h3>
          </div>
          <span className="text-[11px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold px-2.5 py-1 rounded-full w-fit">
            {validCompanies.length} empresa(s)
          </span>
        </div>

        <SearchFilterBar
          searchTerm={companySearchTerm}
          onSearchTermChange={setCompanySearchTerm}
          searchPlaceholder="Buscar por Razão Social, Nome Fantasia, CNPJ, CREA PJ, cidade..."
          filterId={companyFilterId}
          onFilterIdChange={setCompanyFilterId}
          filterAriaLabel="Lista suspensa de empresas e consultorias"
          allOptionLabel={`📋 Todas as Empresas/Consultorias (${validCompanies.length})`}
          options={validCompanies.map(c => ({
            value: c.id,
            label: `🏢 ${c.name} ${c.tradingName ? `(${c.tradingName})` : ''} - ${c.city || 'S/M'}/${c.state || 'UF'}`,
          }))}
          filteredCount={filteredCompanies.length}
          totalCount={validCompanies.length}
          entityPluralLabel="empresas"
          onClearFilters={() => {
            setCompanySearchTerm('');
            setCompanyFilterId('ALL');
          }}
        />

        <div className="space-y-3">
          {validCompanies.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-xs space-y-1">
              <p className="font-semibold text-slate-600 dark:text-zinc-400">Nenhuma empresa/consultoria cadastrada</p>
              <p>Preencha o formulário abaixo para registrar os dados cadastrais da empresa e fazer o upload do logotipo oficial.</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-xs space-y-2">
              <p className="font-semibold text-slate-600 dark:text-zinc-300">
                Nenhuma empresa ou consultoria encontrada com os filtros aplicados
              </p>
              <p className="text-[11px]">
                Tente outros termos de busca ou selecione "Todas as Empresas/Consultorias" na lista suspensa.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCompanySearchTerm('');
                  setCompanyFilterId('ALL');
                }}
                className="mt-1 px-3 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold rounded text-xs transition-colors cursor-pointer"
              >
                Limpar pesquisa
              </button>
            </div>
          ) : (
            filteredCompanies.map(c => (
              <div
                key={c.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors space-y-2 relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {c.logoUrl ? (
                      <div className="w-12 h-12 rounded-lg bg-white p-1 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                        <img src={c.logoUrl} alt={c.name} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black text-sm shrink-0 border border-emerald-200 dark:border-emerald-800/80">
                        {c.name ? c.name.slice(0, 2).toUpperCase() : 'CO'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{c.name}</h4>
                        {c.logoUrl && (
                          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.2 rounded">
                            Com Logo
                          </span>
                        )}
                      </div>
                      {c.tradingName && (
                        <p className="text-xs text-slate-600 dark:text-zinc-400">Nome Fantasia: {c.tradingName}</p>
                      )}
                      <p className="text-xs text-slate-600 dark:text-zinc-400 font-mono">
                        {c.cnpj ? `CNPJ: ${c.cnpj}` : ''} {c.creaRegister ? `• Registro CREA PJ: ${c.creaRegister}` : ''}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {[c.address, c.city && c.state ? `${c.city}/${c.state}` : c.city || c.state, c.phone]
                          .filter(Boolean)
                          .join(' • ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEditCompany(c)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer"
                      title="Editar empresa"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const linkedFarmsCount = (farms || []).filter(f => f?.companyId === c.id).length;
                        onRequestDelete({
                          type: 'company',
                          id: c.id,
                          name: c.name,
                          warningText:
                            linkedFarmsCount > 0
                              ? `${linkedFarmsCount} fazenda(s) cadastrada(s) associadas a esta empresa.`
                              : undefined,
                        });
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer"
                      title="Excluir empresa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {c.hasDigitalSignature && (
                  <div className="mt-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded p-1.5 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                        Assinatura Digital (e-CNPJ) Habilitada
                      </p>
                      <p className="text-[9px] text-emerald-600/80 dark:text-emerald-500/80 font-mono">
                        {c.legalSignatureHash}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Company Form */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 shadow-xs transition-colors">
        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Nova Empresa / Consultoria
        </h3>
        <form onSubmit={handleAddCompany} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Razão Social *</label>
              <input
                type="text"
                required
                placeholder="Ex: AgroConsultoria Planejamento Ltda"
                value={newCompName}
                onChange={e => setNewCompName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Nome Fantasia</label>
              <input
                type="text"
                placeholder="Ex: AgroConsult"
                value={newCompTrading}
                onChange={e => setNewCompTrading(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">CNPJ</label>
              <input
                type="text"
                placeholder="00.000.000/0001-00"
                value={newCompCnpj}
                onChange={e => setNewCompCnpj(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Registro CREA PJ</label>
              <input
                type="text"
                placeholder="CREA-MT PJ-000"
                value={newCompCrea}
                onChange={e => setNewCompCrea(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Município</label>
              <input
                type="text"
                value={newCompCity}
                onChange={e => setNewCompCity(e.target.value)}
                placeholder="Ex: Cuiabá"
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">UF</label>
              <select
                aria-label="UF da Empresa"
                value={newCompState}
                onChange={e => setNewCompState(e.target.value)}
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

          <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Logotipo da Empresa / Consultoria</span>
              </label>
              {newCompLogo && (
                <button
                  type="button"
                  onClick={() => {
                    setNewCompLogo('');
                    setNewCompLogoError(null);
                  }}
                  className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CloseIcon className="w-3 h-3" />
                  Remover Logo
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              O logotipo será inserido no cabeçalho oficial de{' '}
              <strong>laudos técnicos, relatórios agronômicos e receituários veterinários</strong> emitidos.
            </p>

            {newCompLogo ? (
              <div className="flex items-center gap-3 p-2.5 bg-white dark:bg-zinc-950 rounded-lg border border-emerald-300 dark:border-emerald-800/80">
                <div className="w-16 h-16 rounded-md bg-slate-50 dark:bg-zinc-900 p-1 border border-slate-200 dark:border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                  <img src={newCompLogo} alt="Pré-visualização do logotipo" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Logotipo carregado</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                    Pronto para emissão de laudos e receituários
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-lg bg-white dark:bg-zinc-950 cursor-pointer transition-colors text-center group">
                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mb-1 transition-colors" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                    Clique ou arraste a imagem do logotipo
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    PNG, JPG, SVG ou WebP (recomendado fundo transparente)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 4 * 1024 * 1024) {
                          setNewCompLogoError('Por favor, selecione uma imagem com menos de 4MB.');
                          e.target.value = '';
                          return;
                        }
                        setNewCompLogoError(null);
                        const reader = new FileReader();
                        reader.onload = event => {
                          if (typeof event.target?.result === 'string') {
                            setNewCompLogo(event.target.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                      e.target.value = '';
                    }}
                  />
                </label>

                {newCompLogoError && (
                  <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1.5">
                    {newCompLogoError}
                  </p>
                )}

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Ou URL:</span>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/logo.png"
                    value={newCompLogo}
                    onChange={e => {
                      setNewCompLogoError(null);
                      setNewCompLogo(e.target.value);
                    }}
                    className="flex-1 px-2.5 py-1 text-[11px] border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="compSig"
                checked={newCompHasSignature}
                onChange={e => setNewCompHasSignature(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="compSig" className="text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer">
                Habilitar Assinatura Digital Jurídica (e-CNPJ)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetCompanyForm}
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
                Cadastrar Empresa
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompaniesTab;
