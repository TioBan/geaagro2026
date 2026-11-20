import React, { useState, useEffect } from 'react';
import { X, Check, Sliders } from 'lucide-react';
import {
  ConfigCulturaIntegrada,
  UnidadeComercializacao,
} from '../../types/gestaoRural';
import {
  CROP_COMMERCIALIZATION_PRESETS,
  UNIDADE_DESCRICOES,
  CropPresetDefinition,
} from '../../data/cropCommercializationPresets';

interface GestaoCulturaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: ConfigCulturaIntegrada;
  onSaveConfig: (newConfig: ConfigCulturaIntegrada) => void;
}

const ALL_UNITS: UnidadeComercializacao[] = ['cx', 'sc', 'kg', 'ton', '@', 'un', 'bandeja', 'cacho', 'litros'];

const INPUT_CLASS =
  'w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500';

const LABEL_CLASS = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const GestaoCulturaSelectorModal: React.FC<GestaoCulturaSelectorModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSaveConfig,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [culturaNome, setCulturaNome] = useState(currentConfig.cultura);
  const [variedade, setVariedade] = useState(currentConfig.variedade || '');
  const [unidadePrincipal, setUnidadePrincipal] = useState<UnidadeComercializacao>(
    currentConfig.unidadeComercializacaoPrincipal
  );
  const [unidadesHabilitadas, setUnidadesHabilitadas] = useState<UnidadeComercializacao[]>(
    currentConfig.unidadesHabilitadas || ['cx', 'sc', 'kg', 'ton']
  );
  const [pesoPorUnidadeKg, setPesoPorUnidadeKg] = useState<number>(currentConfig.pesoPorUnidadeKg || 20);
  const [precoReferencia, setPrecoReferencia] = useState<number>(currentConfig.precoReferenciaUnitarioR$ || 68);
  const [metaProdutividade, setMetaProdutividade] = useState<number>(currentConfig.metaProdutividadePadraoHa || 1500);

  useEffect(() => {
    if (!isOpen) return;
    setCulturaNome(currentConfig.cultura);
    setVariedade(currentConfig.variedade || '');
    setUnidadePrincipal(currentConfig.unidadeComercializacaoPrincipal);
    setUnidadesHabilitadas(currentConfig.unidadesHabilitadas || ['cx', 'sc', 'kg', 'ton']);
    setPesoPorUnidadeKg(currentConfig.pesoPorUnidadeKg || 20);
    setPrecoReferencia(currentConfig.precoReferenciaUnitarioR$ || 68);
    setMetaProdutividade(currentConfig.metaProdutividadePadraoHa || 1500);

    const matched = CROP_COMMERCIALIZATION_PRESETS.find(
      p => p.cultura.toLowerCase() === currentConfig.cultura.toLowerCase()
    );
    setSelectedPresetId(matched?.id || 'custom');
  }, [isOpen, currentConfig]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: CropPresetDefinition) => {
    setSelectedPresetId(preset.id);
    setCulturaNome(preset.cultura);
    setVariedade(preset.variedade || '');
    setUnidadePrincipal(preset.unidadeComercializacaoPrincipal);
    setUnidadesHabilitadas([...preset.unidadesHabilitadas]);
    setPesoPorUnidadeKg(preset.pesoPorUnidadeKg);
    setPrecoReferencia(preset.precoReferenciaUnitarioR$);
    setMetaProdutividade(preset.metaProdutividadePadraoHa);
  };

  const handleToggleUnit = (unit: UnidadeComercializacao) => {
    setUnidadesHabilitadas(prev => {
      if (prev.includes(unit)) {
        if (prev.length === 1) return prev;
        const filtered = prev.filter(u => u !== unit);
        if (unit === unidadePrincipal) {
          setUnidadePrincipal(filtered[0]);
        }
        return filtered;
      }
      return [...prev, unit];
    });
  };

  const handleChangePrincipalUnit = (unit: UnidadeComercializacao) => {
    setUnidadePrincipal(unit);
    if (!unidadesHabilitadas.includes(unit)) {
      setUnidadesHabilitadas(prev => [unit, ...prev]);
    }
    const info = UNIDADE_DESCRICOES[unit];
    if (info) {
      setPesoPorUnidadeKg(info.pesoPadraoKg);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const nomeUnidade = UNIDADE_DESCRICOES[unidadePrincipal]?.nome || unidadePrincipal;
    onSaveConfig({
      cultura: culturaNome.trim() || 'Banana',
      variedade: variedade.trim() || undefined,
      unidadeComercializacaoPrincipal: unidadePrincipal,
      unidadesHabilitadas: unidadesHabilitadas.length > 0 ? unidadesHabilitadas : [unidadePrincipal],
      pesoPorUnidadeKg: Number(pesoPorUnidadeKg) || 20,
      apelidoUnidade: `${nomeUnidade} (${pesoPorUnidadeKg} kg)`,
      precoReferenciaUnitarioR$: Number(precoReferencia) || 0,
      metaProdutividadePadraoHa: Number(metaProdutividade) || 0,
      descricaoComercializacao: `Cultura ${culturaNome} comercializada principalmente em ${unidadePrincipal} (${pesoPorUnidadeKg} kg). Unidades habilitadas: ${unidadesHabilitadas.join(', ')}.`,
    });
    onClose();
  };

  const activePreset = CROP_COMMERCIALIZATION_PRESETS.find(p => p.id === selectedPresetId);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* HEADER */}
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Cultura Integrada &amp; Unidades Comerciais
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Defina a cultura padrão, unidade principal e parâmetros de referência
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSave} className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* PRESET GRID */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Cultura Predefinida
              </span>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                {CROP_COMMERCIALIZATION_PRESETS.length} culturas disponíveis
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {CROP_COMMERCIALIZATION_PRESETS.map(preset => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-2.5 py-2 rounded-lg border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-500 text-emerald-900 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="text-xs font-semibold truncate">{preset.cultura}</div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 tabular-nums">
                      {preset.unidadeComercializacaoPrincipal} · {preset.pesoPorUnidadeKg} kg
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CROP NAME & VARIETY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <div>
              <label className={LABEL_CLASS}>Nome da Cultura</label>
              <input
                type="text"
                value={culturaNome}
                onChange={e => {
                  setCulturaNome(e.target.value);
                  setSelectedPresetId('custom');
                }}
                placeholder="Ex: Banana, Soja, Café..."
                className={INPUT_CLASS}
                required
              />
            </div>

            <div>
              <label className={LABEL_CLASS}>Variedade / Cultivar</label>
              <input
                type="text"
                value={variedade}
                onChange={e => setVariedade(e.target.value)}
                placeholder="Ex: Prata Anã, Nanica, BMX Potência..."
                className={INPUT_CLASS}
              />
              {activePreset && activePreset.exemplosVariedades.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {activePreset.exemplosVariedades.slice(0, 5).map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVariedade(v)}
                      className="text-[10px] px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* UNITS CONFIGURATION */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <div>
              <label className={LABEL_CLASS}>Unidade Principal de Comercialização</label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_UNITS.map(u => {
                  const isMain = unidadePrincipal === u;
                  return (
                    <button
                      key={u}
                      type="button"
                      onClick={() => handleChangePrincipalUnit(u)}
                      className={`h-7 px-2.5 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                        isMain
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {u}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={LABEL_CLASS}>Unidades Habilitadas nas Vendas</label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_UNITS.map(u => {
                  const active = unidadesHabilitadas.includes(u);
                  return (
                    <button
                      key={u}
                      type="button"
                      onClick={() => handleToggleUnit(u)}
                      className={`h-7 px-2.5 rounded-md border text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer ${
                        active
                          ? 'border-emerald-500/60 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
                      }`}
                    >
                      {active && <Check className="w-3 h-3" />}
                      <span>{u}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              <div>
                <label className={LABEL_CLASS}>Peso por {unidadePrincipal} (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={pesoPorUnidadeKg}
                  onChange={e => setPesoPorUnidadeKg(Number(e.target.value))}
                  className={`${INPUT_CLASS} tabular-nums`}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Preço Referência (R$/{unidadePrincipal})</label>
                <input
                  type="number"
                  step="0.01"
                  value={precoReferencia}
                  onChange={e => setPrecoReferencia(Number(e.target.value))}
                  className={`${INPUT_CLASS} tabular-nums`}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Meta Produtividade ({unidadePrincipal}/ha)</label>
                <input
                  type="number"
                  step="1"
                  value={metaProdutividade}
                  onChange={e => setMetaProdutividade(Number(e.target.value))}
                  className={`${INPUT_CLASS} tabular-nums`}
                  required
                />
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="pt-3 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Aplicar Cultura</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
