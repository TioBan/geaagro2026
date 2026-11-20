import React, { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Layers,
  ArrowUpRight,
  Sliders,
} from 'lucide-react';
import { PropriedadeRural, TalhaoRural, ConfigCulturaIntegrada } from '../../types/gestaoRural';

interface GestaoAdministracaoPropriedadeProps {
  propriedade: PropriedadeRural;
  talhoes: TalhaoRural[];
  configCultura?: ConfigCulturaIntegrada;
  onOpenConfigCultura?: () => void;
  onUpdatePropriedade: (updated: PropriedadeRural) => void;
  onAddTalhao: (newTalhao: TalhaoRural) => void;
  onDeleteTalhao: (id: string) => void;
  onNavigateToRegister?: () => void;
  onNavigate?: (tab: string, subTab?: string) => void;
}

const INPUT_CLASS =
  'w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500';

const LABEL_CLASS = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const GestaoAdministracaoPropriedade: React.FC<GestaoAdministracaoPropriedadeProps> = ({
  propriedade,
  talhoes,
  configCultura,
  onOpenConfigCultura,
  onUpdatePropriedade,
  onAddTalhao,
  onDeleteTalhao,
  onNavigateToRegister,
}) => {
  const [isEditingPropriedade, setIsEditingPropriedade] = useState(false);
  const [propForm, setPropForm] = useState<PropriedadeRural>(propriedade);
  const [showAddTalhaoModal, setShowAddTalhaoModal] = useState(false);

  useEffect(() => {
    if (!showAddTalhaoModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAddTalhaoModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showAddTalhaoModal]);

  const syncCentralFarmsStorage = (transformFarm: (farm: Record<string, any>) => Record<string, any>) => {
    try {
      const centralFarmsStr = localStorage.getItem('geaagro_farms');
      if (!centralFarmsStr) return;
      const centralFarms = JSON.parse(centralFarmsStr);
      if (!Array.isArray(centralFarms) || centralFarms.length === 0) return;

      const updatedFarms = centralFarms.map((f: Record<string, any>) => {
        if (f.id === propriedade.id || f.name === propriedade.nome || centralFarms.length === 1) {
          return transformFarm(f);
        }
        return f;
      });
      localStorage.setItem('geaagro_farms', JSON.stringify(updatedFarms));
    } catch (err) {
      console.warn('Sync to central farms storage failed:', err);
    }
  };

  const [newTalhao, setNewTalhao] = useState<Partial<TalhaoRural>>({
    codigo: `TL-0${talhoes.length + 1}`,
    nome: '',
    areaHa: 50,
    tipoSolo: 'Latossolo Vermelho Eutrófico',
    texturaSolo: 'argiloso',
    teorArgilaPct: 48,
    historicoUso: 'Rotação Soja / Milho Safrinha',
    culturaAtual: configCultura?.cultura || 'Soja',
    culturaAnterior: 'Milho Safrinha',
    sistemaCultivo: 'Plantio Direto',
    irrigado: false,
    altitudeMeters: 620,
    declividadePct: 3.5,
    observacoes: '',
  });

  const handleSavePropriedade = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...propForm, updatedAt: new Date().toISOString() };
    onUpdatePropriedade(updated);
    setIsEditingPropriedade(false);

    syncCentralFarmsStorage(f => ({
      ...f,
      name: updated.nome,
      owner: updated.proprietario,
      document: updated.documento,
      stateRegistration: updated.inscricaoEstadual,
      city: updated.municipio,
      state: updated.estado,
      totalAreaHa: updated.areaTotalHa,
      arableAreaHa: updated.areaAgricolaHa,
      irrigatedAreaHa: updated.areaIrrigadaHa,
    }));
  };

  const handleSaveNewTalhao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTalhao.nome || !newTalhao.areaHa) return;

    const created: TalhaoRural = {
      id: `tal-360-${Date.now()}`,
      propriedadeId: propriedade.id,
      codigo: newTalhao.codigo || `TL-0${talhoes.length + 1}`,
      nome: newTalhao.nome,
      areaHa: Number(newTalhao.areaHa) || 0,
      coordenadasGPS: [
        { lat: propriedade.latitude, lng: propriedade.longitude },
        { lat: propriedade.latitude - 0.005, lng: propriedade.longitude + 0.005 },
        { lat: propriedade.latitude - 0.008, lng: propriedade.longitude + 0.002 },
      ],
      tipoSolo: newTalhao.tipoSolo || 'Latossolo Vermelho',
      texturaSolo: newTalhao.texturaSolo || 'argiloso',
      teorArgilaPct: Number(newTalhao.teorArgilaPct) || 45,
      historicoUso: newTalhao.historicoUso || '',
      culturaAtual: newTalhao.culturaAtual || configCultura?.cultura || 'Soja',
      culturaAnterior: newTalhao.culturaAnterior || 'Milho',
      sistemaCultivo: newTalhao.sistemaCultivo || 'Plantio Direto',
      irrigado: Boolean(newTalhao.irrigado),
      tipoSistemaIrrigacao: newTalhao.irrigado ? 'Pivô Central' : undefined,
      altitudeMeters: Number(newTalhao.altitudeMeters) || 620,
      declividadePct: Number(newTalhao.declividadePct) || 3.0,
      fotosUrls: [],
      observacoes: newTalhao.observacoes || '',
    };

    onAddTalhao(created);

    const newCentralPlot = {
      id: created.id,
      name: created.nome,
      areaHa: created.areaHa,
      crop: created.culturaAtual,
      soilTexture:
        created.texturaSolo === 'argiloso' || created.texturaSolo === 'muito_argiloso'
          ? 'ARGILOSO'
          : created.texturaSolo === 'arenoso'
          ? 'ARENOSO'
          : 'MEDIO',
      clayPercentage: created.teorArgilaPct,
      irrigation: created.irrigado,
    };
    syncCentralFarmsStorage(f => ({
      ...f,
      plots: [newCentralPlot, ...(Array.isArray(f.plots) ? f.plots : [])],
    }));

    setShowAddTalhaoModal(false);
    setNewTalhao({
      codigo: `TL-0${talhoes.length + 2}`,
      nome: '',
      areaHa: 50,
      tipoSolo: 'Latossolo Vermelho Eutrófico',
      texturaSolo: 'argiloso',
      teorArgilaPct: 48,
      historicoUso: 'Rotação Soja / Milho Safrinha',
      culturaAtual: configCultura?.cultura || 'Soja',
      culturaAnterior: 'Milho Safrinha',
      sistemaCultivo: 'Plantio Direto',
      irrigado: false,
      altitudeMeters: 620,
      declividadePct: 3.5,
      observacoes: '',
    });
  };

  const handleDeleteTalhaoWithSync = (id: string) => {
    onDeleteTalhao(id);
    syncCentralFarmsStorage(f => ({
      ...f,
      plots: (Array.isArray(f.plots) ? f.plots : []).filter((p: any) => p.id !== id && p.name !== id),
    }));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* PROPRIEDADE & CULTURA SUMMARY */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Cadastro da Propriedade Rural</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Dados sincronizados com o Cadastro Técnico Central
              {propriedade.codigoIbge ? ` · IBGE ${propriedade.codigoIbge}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onNavigateToRegister && (
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Cadastro Central</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (!isEditingPropriedade) {
                  setPropForm(propriedade);
                }
                setIsEditingPropriedade(!isEditingPropriedade);
              }}
              className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                isEditingPropriedade
                  ? 'border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isEditingPropriedade ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
              <span>{isEditingPropriedade ? 'Cancelar' : 'Editar Propriedade'}</span>
            </button>
          </div>
        </div>

        {isEditingPropriedade ? (
          <form onSubmit={handleSavePropriedade} className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div>
              <label className={LABEL_CLASS}>Nome da Fazenda</label>
              <input
                type="text"
                value={propForm.nome}
                onChange={e => setPropForm({ ...propForm, nome: e.target.value })}
                className={INPUT_CLASS}
                required
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Proprietário</label>
              <input
                type="text"
                value={propForm.proprietario}
                onChange={e => setPropForm({ ...propForm, proprietario: e.target.value })}
                className={INPUT_CLASS}
                required
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>CPF / CNPJ</label>
              <input
                type="text"
                value={propForm.documento}
                onChange={e => setPropForm({ ...propForm, documento: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Inscrição Estadual</label>
              <input
                type="text"
                value={propForm.inscricaoEstadual}
                onChange={e => setPropForm({ ...propForm, inscricaoEstadual: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className={LABEL_CLASS}>Município</label>
              <input
                type="text"
                value={propForm.municipio}
                onChange={e => setPropForm({ ...propForm, municipio: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Estado (UF)</label>
              <input
                type="text"
                value={propForm.estado}
                onChange={e => setPropForm({ ...propForm, estado: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Responsável Técnico</label>
              <input
                type="text"
                value={propForm.responsavelTecnico}
                onChange={e => setPropForm({ ...propForm, responsavelTecnico: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Código IBGE</label>
              <input
                type="text"
                value={propForm.codigoIbge}
                onChange={e => setPropForm({ ...propForm, codigoIbge: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className={LABEL_CLASS}>Área Total (ha)</label>
              <input
                type="number"
                step="0.1"
                value={propForm.areaTotalHa}
                onChange={e => setPropForm({ ...propForm, areaTotalHa: Number(e.target.value) || 0 })}
                className={`${INPUT_CLASS} tabular-nums`}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Área Agrícola (ha)</label>
              <input
                type="number"
                step="0.1"
                value={propForm.areaAgricolaHa}
                onChange={e => setPropForm({ ...propForm, areaAgricolaHa: Number(e.target.value) || 0 })}
                className={`${INPUT_CLASS} tabular-nums`}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Área Irrigada (ha)</label>
              <input
                type="number"
                step="0.1"
                value={propForm.areaIrrigadaHa}
                onChange={e => setPropForm({ ...propForm, areaIrrigadaHa: Number(e.target.value) || 0 })}
                className={`${INPUT_CLASS} tabular-nums`}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Reserva Legal (ha)</label>
              <input
                type="number"
                step="0.1"
                value={propForm.reservaLegalHa}
                onChange={e => setPropForm({ ...propForm, reservaLegalHa: Number(e.target.value) || 0 })}
                className={`${INPUT_CLASS} tabular-nums`}
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsEditingPropriedade(false)}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800 border-b border-slate-200/80 dark:border-zinc-800">
              <div className="p-4">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Fazenda</span>
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 mt-0.5 block">
                  {propriedade.nome || '—'}
                </span>
              </div>
              <div className="p-4">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Proprietário</span>
                <span className="text-xs font-medium text-slate-800 dark:text-zinc-200 mt-0.5 block">
                  {propriedade.proprietario || '—'}
                </span>
              </div>
              <div className="p-4">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                  {propriedade.tipoDocumento} / IE
                </span>
                <span className="text-xs font-medium text-slate-800 dark:text-zinc-200 mt-0.5 block tabular-nums">
                  {propriedade.documento || '—'}
                  {propriedade.inscricaoEstadual ? ` · IE ${propriedade.inscricaoEstadual}` : ''}
                </span>
              </div>
              <div className="p-4">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Localização</span>
                <span className="text-xs font-medium text-slate-800 dark:text-zinc-200 mt-0.5 block">
                  {propriedade.municipio || propriedade.estado
                    ? `${propriedade.municipio || '—'}${propriedade.estado ? ` - ${propriedade.estado}` : ''}`
                    : '—'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800">
              <div className="p-4">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Área Total</span>
                <span className="text-base font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                  {propriedade.areaTotalHa || 0} ha
                </span>
              </div>
              <div className="p-4">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Área Agrícola</span>
                <span className="text-base font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {propriedade.areaAgricolaHa || 0} ha
                </span>
              </div>
              <div className="p-4">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Área Irrigada</span>
                <span className="text-base font-semibold text-sky-700 dark:text-sky-400 tabular-nums">
                  {propriedade.areaIrrigadaHa || 0} ha
                </span>
              </div>
              <div className="p-4">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Reserva Legal + APP</span>
                <span className="text-base font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                  {(propriedade.reservaLegalHa || 0) + (propriedade.appHa || 0)} ha
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CULTURA INTEGRADA STRIP */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Cultura Ativa: {configCultura?.cultura || 'Banana'}
              {configCultura?.variedade ? (
                <span className="font-normal text-slate-500 dark:text-zinc-400"> · {configCultura.variedade}</span>
              ) : null}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Parâmetros comerciais e unidades usados em safras, produtividade e vendas
            </p>
          </div>
          {onOpenConfigCultura && (
            <button
              type="button"
              onClick={onOpenConfigCultura}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Ajustar Cultura</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800">
          <div className="p-4">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Unidade Principal</span>
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {configCultura?.unidadeComercializacaoPrincipal || 'cx'} ({configCultura?.pesoPorUnidadeKg || 20} kg)
            </span>
          </div>
          <div className="p-4">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Unidades Habilitadas</span>
            <span className="text-sm font-medium text-slate-900 dark:text-zinc-100">
              {configCultura?.unidadesHabilitadas?.join(', ') || 'cx, sc, kg, ton'}
            </span>
          </div>
          <div className="p-4">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Preço Referência</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
              R$ {(configCultura?.precoReferenciaUnitarioR$ ?? 68).toFixed(2)} / {configCultura?.unidadeComercializacaoPrincipal || 'cx'}
            </span>
          </div>
          <div className="p-4">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Meta Produtividade</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
              {(configCultura?.metaProdutividadePadraoHa || 1500).toLocaleString('pt-BR')} {configCultura?.unidadeComercializacaoPrincipal || 'cx'}/ha
            </span>
          </div>
        </div>
      </div>

      {/* TALHÕES TABLE / CARDS */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Talhões Cadastrados ({talhoes.length})</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Divisão de áreas, solo, textura e sistema de irrigação sincronizados
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddTalhaoModal(true)}
            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Talhão</span>
          </button>
        </div>

        {talhoes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/40">
                  <th className="py-2.5 px-4">Código / Talhão</th>
                  <th className="py-2.5 px-4 text-right">Área</th>
                  <th className="py-2.5 px-4">Cultura Atual</th>
                  <th className="py-2.5 px-4">Solo &amp; Textura</th>
                  <th className="py-2.5 px-4">Irrigação</th>
                  <th className="py-2.5 px-4 text-right">Relevo</th>
                  <th className="py-2.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {talhoes.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-zinc-100">{t.nome}</div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">{t.codigo}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                      {t.areaHa} ha
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-emerald-700 dark:text-emerald-400">{t.culturaAtual}</span>
                      <span className="block text-[11px] text-slate-400 dark:text-zinc-500">{t.sistemaCultivo}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-zinc-300">
                      <div>{t.tipoSolo}</div>
                      <div className="text-[11px] text-slate-400 dark:text-zinc-500 capitalize tabular-nums">
                        {t.texturaSolo.replace('_', ' ')} · {t.teorArgilaPct}% argila
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-zinc-300">
                      {t.irrigado ? (
                        <span className="text-sky-700 dark:text-sky-400 font-medium">
                          {t.tipoSistemaIrrigacao || 'Irrigado'}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-zinc-500">Sequeiro</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-zinc-300 tabular-nums">
                      {t.declividadePct}% · {t.altitudeMeters}m
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteTalhaoWithSync(t.id)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Excluir talhão"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            Nenhum talhão cadastrado. Clique em <strong className="font-medium text-slate-700 dark:text-zinc-200">Novo Talhão</strong> para mapear as áreas da propriedade.
          </div>
        )}
      </div>

      {/* ADD TALHÃO MODAL */}
      {showAddTalhaoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setShowAddTalhaoModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Cadastrar Novo Talhão</h3>
              <button
                type="button"
                onClick={() => setShowAddTalhaoModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewTalhao} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={LABEL_CLASS}>Código</label>
                <input
                  type="text"
                  value={newTalhao.codigo}
                  onChange={e => setNewTalhao({ ...newTalhao, codigo: e.target.value })}
                  className={INPUT_CLASS}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Nome do Talhão</label>
                <input
                  type="text"
                  placeholder="Ex: Talhão Pivô Leste"
                  value={newTalhao.nome}
                  onChange={e => setNewTalhao({ ...newTalhao, nome: e.target.value })}
                  className={INPUT_CLASS}
                  required
                />
              </div>

              <div>
                <label className={LABEL_CLASS}>Área (ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newTalhao.areaHa}
                  onChange={e => setNewTalhao({ ...newTalhao, areaHa: Number(e.target.value) })}
                  className={`${INPUT_CLASS} tabular-nums`}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Cultura Atual</label>
                <input
                  type="text"
                  value={newTalhao.culturaAtual}
                  onChange={e => setNewTalhao({ ...newTalhao, culturaAtual: e.target.value })}
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className={LABEL_CLASS}>Tipo de Solo</label>
                <input
                  type="text"
                  value={newTalhao.tipoSolo}
                  onChange={e => setNewTalhao({ ...newTalhao, tipoSolo: e.target.value })}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Textura do Solo</label>
                <select
                  value={newTalhao.texturaSolo}
                  onChange={e => setNewTalhao({ ...newTalhao, texturaSolo: e.target.value as TalhaoRural['texturaSolo'] })}
                  className={INPUT_CLASS}
                >
                  <option value="arenoso">Arenoso (&lt;15%)</option>
                  <option value="medio">Médio (15-35%)</option>
                  <option value="argiloso">Argiloso (35-60%)</option>
                  <option value="muito_argiloso">Muito Argiloso (&gt;60%)</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="talhao-irrigado"
                  checked={Boolean(newTalhao.irrigado)}
                  onChange={e => setNewTalhao({ ...newTalhao, irrigado: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 cursor-pointer"
                />
                <label htmlFor="talhao-irrigado" className="text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer">
                  Possui sistema de irrigação instalado
                </label>
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddTalhaoModal(false)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                >
                  Cadastrar Talhão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
