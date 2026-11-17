import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  Wheat,
  Scale,
} from 'lucide-react';
import { ConfigCulturaIntegrada, UnidadeComercializacao } from '../../types/gestaoRural';
import {
  CROP_COMMERCIALIZATION_PRESETS,
  UNIDADE_DESCRICOES,
  CropPresetDefinition,
  DEFAULT_CONFIG_CULTURA
} from '../../data/cropCommercializationPresets';

interface GestaoCulturaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig?: ConfigCulturaIntegrada;
  onSaveConfig: (newConfig: ConfigCulturaIntegrada) => void;
}

export const GestaoCulturaSelectorModal: React.FC<GestaoCulturaSelectorModalProps> = ({
  isOpen,
  onClose,
  currentConfig = DEFAULT_CONFIG_CULTURA,
  onSaveConfig,
}) => {
  const [selectedCropPreset, setSelectedCropPreset] = useState<string>(() => {
    const match = CROP_COMMERCIALIZATION_PRESETS.find(
      p => p.cultura.toLowerCase() === (currentConfig.cultura || '').toLowerCase()
    );
    return match ? match.id : 'banana';
  });

  const [formConfig, setFormConfig] = useState<ConfigCulturaIntegrada>({
    cultura: currentConfig.cultura || 'Banana',
    variedade: currentConfig.variedade || 'Prata Anã',
    unidadeComercializacaoPrincipal: currentConfig.unidadeComercializacaoPrincipal || 'cx',
    unidadesHabilitadas: currentConfig.unidadesHabilitadas || ['cx', 'sc', 'kg', 'ton'],
    pesoPorUnidadeKg: currentConfig.pesoPorUnidadeKg || 20,
    apelidoUnidade: currentConfig.apelidoUnidade || 'Caixa (20 kg)',
    precoReferenciaUnitarioR$: currentConfig.precoReferenciaUnitarioR$ || 68.0,
    metaProdutividadePadraoHa: currentConfig.metaProdutividadePadraoHa || 1500,
    descricaoComercializacao: currentConfig.descricaoComercializacao || '',
  });

  const [isCustomMode, setIsCustomMode] = useState<boolean>(() => {
    const match = CROP_COMMERCIALIZATION_PRESETS.some(
      p => p.cultura.toLowerCase() === (currentConfig.cultura || '').toLowerCase()
    );
    return !match;
  });

  if (!isOpen) return null;

  const handleSelectPreset = (preset: CropPresetDefinition) => {
    setSelectedCropPreset(preset.id);
    setIsCustomMode(false);
    setFormConfig({
      cultura: preset.cultura,
      variedade: preset.variedade || '',
      unidadeComercializacaoPrincipal: preset.unidadeComercializacaoPrincipal,
      unidadesHabilitadas: [...preset.unidadesHabilitadas],
      pesoPorUnidadeKg: preset.pesoPorUnidadeKg,
      apelidoUnidade: preset.apelidoUnidade || `${preset.unidadeComercializacaoPrincipal} (${preset.pesoPorUnidadeKg} kg)`,
      precoReferenciaUnitarioR$: preset.precoReferenciaUnitarioR$,
      metaProdutividadePadraoHa: preset.metaProdutividadePadraoHa,
      descricaoComercializacao: preset.descricaoComercializacao || '',
    });
  };

  const handleToggleUnidade = (unit: UnidadeComercializacao) => {
    const currentList = formConfig.unidadesHabilitadas || [];
    let updated: UnidadeComercializacao[];
    
    if (currentList.includes(unit)) {
      // Impede desmarcar a unidade principal
      if (unit === formConfig.unidadeComercializacaoPrincipal) {
        return;
      }
      updated = currentList.filter(u => u !== unit);
    } else {
      updated = [...currentList, unit];
    }

    setFormConfig({
      ...formConfig,
      unidadesHabilitadas: updated
    });
  };

  const handleChangePrincipalUnit = (unit: UnidadeComercializacao) => {
    const currentList = formConfig.unidadesHabilitadas || [];
    const updatedHabilitadas = currentList.includes(unit) ? currentList : [...currentList, unit];
    const defaultWeight = UNIDADE_DESCRICOES[unit]?.pesoPadraoKg || formConfig.pesoPorUnidadeKg;

    setFormConfig({
      ...formConfig,
      unidadeComercializacaoPrincipal: unit,
      unidadesHabilitadas: updatedHabilitadas,
      pesoPorUnidadeKg: defaultWeight,
      apelidoUnidade: `${UNIDADE_DESCRICOES[unit]?.nome || unit} (${defaultWeight} kg)`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formConfig);
    onClose();
  };

  const allAvailableUnits: UnidadeComercializacao[] = ['cx', 'sc', 'kg', 'ton', '@', 'un', 'cacho', 'bandeja'];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 max-w-3xl w-full shadow-2xl my-6 space-y-6 max-h-[92vh] overflow-y-auto text-xs">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 text-white flex items-center justify-center text-2xl shadow-sm shrink-0">
              🌱
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Integração de Cultura &amp; Comercialização</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Escolher Cultura &amp; Ajustar Unidades de Comercialização
              </h2>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Personalize a cultura ativa (ex: <strong>Banana, Soja, Milho, Café</strong>) e como a colheita é comercializada (<strong>cx, sc, kg, tonelada</strong>).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. SELEÇÃO DA CULTURA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Wheat className="w-4 h-4 text-emerald-600" />
                <span>1. Selecione a Cultura Agrícola</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomMode(!isCustomMode);
                  if (!isCustomMode) {
                    setSelectedCropPreset('custom');
                  }
                }}
                className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
              >
                {isCustomMode ? '← Ver culturas predefinidas' : '+ Adicionar outra cultura'}
              </button>
            </div>

            {!isCustomMode ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {CROP_COMMERCIALIZATION_PRESETS.map((preset) => {
                  const isSelected = !isCustomMode && selectedCropPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs ring-2 ring-emerald-500/30'
                          : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="text-2xl">{preset.icon}</span>
                      <span className="font-extrabold text-[11px] leading-tight block truncate w-full">{preset.cultura}</span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                        {preset.unidadeComercializacaoPrincipal}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                  Defina o Nome da sua Cultura Personalizada:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Nome da Cultura:</label>
                    <input
                      type="text"
                      value={formConfig.cultura}
                      onChange={(e) => setFormConfig({ ...formConfig, cultura: e.target.value })}
                      placeholder="Ex: Banana Nanica, Pimenta-do-reino, Manga..."
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Variedade / Cultivar:</label>
                    <input
                      type="text"
                      value={formConfig.variedade || ''}
                      onChange={(e) => setFormConfig({ ...formConfig, variedade: e.target.value })}
                      placeholder="Ex: Prata, Nanica, Híbrido..."
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. AJUSTAR UNIDADES DE COMERCIALIZAÇÃO (EXEMPLO: BANANA -> cx, sc, kg, ton) */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-500/5 via-slate-50 to-emerald-500/5 dark:from-zinc-850 dark:via-zinc-900 dark:to-zinc-850 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-black uppercase text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-500" />
                  <span>2. Como a {formConfig.cultura} é Comercializada na Fazenda?</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Selecione todas as unidades de venda aceitas (ex: <strong>caixa (cx), saco (sc), kg, tonelada (ton)</strong>) e defina a principal.
                </p>
              </div>
            </div>

            {/* Unidade Principal */}
            <div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1.5">
                Unidade Principal de Faturamento &amp; Produtividade:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {allAvailableUnits.slice(0, 6).map((unit) => {
                  const isMain = formConfig.unidadeComercializacaoPrincipal === unit;
                  const desc = UNIDADE_DESCRICOES[unit];
                  return (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => handleChangePrincipalUnit(unit)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isMain
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 shadow-xs ring-2 ring-emerald-500/30'
                          : 'border-slate-200 dark:border-zinc-700 hover:border-slate-300 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      <div>
                        <span className="font-black text-xs block">{desc?.nome || unit}</span>
                        <span className="text-[10px] text-slate-500">Sigla: <strong>{unit}</strong></span>
                      </div>
                      {isMain && (
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Unidades Habilitadas na Comercialização */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block">
                Habilitar Opções de Unidade para Venda &amp; Contratos:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {allAvailableUnits.map((unit) => {
                  const isChecked = formConfig.unidadesHabilitadas?.includes(unit);
                  const isMain = formConfig.unidadeComercializacaoPrincipal === unit;
                  const desc = UNIDADE_DESCRICOES[unit];
                  return (
                    <label
                      key={unit}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all select-none cursor-pointer ${
                        isChecked
                          ? 'border-teal-500/60 bg-teal-50/50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200'
                          : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 text-slate-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleUnidade(unit)}
                        disabled={isMain}
                        className="rounded accent-emerald-600 w-4 h-4 cursor-pointer"
                      />
                      <div className="leading-tight">
                        <span className="font-bold text-xs block">{unit}</span>
                        <span className="text-[10px] text-slate-500 block truncate">{desc?.nome}</span>
                      </div>
                      {isMain && (
                        <span className="ml-auto text-[9px] font-black uppercase text-emerald-600">Principal</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Peso e Conversões */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200/60 dark:border-zinc-800">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Peso em Kg por 1 {formConfig.unidadeComercializacaoPrincipal}:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formConfig.pesoPorUnidadeKg}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormConfig({
                        ...formConfig,
                        pesoPorUnidadeKg: val,
                        apelidoUnidade: `${UNIDADE_DESCRICOES[formConfig.unidadeComercializacaoPrincipal]?.nome || formConfig.unidadeComercializacaoPrincipal} (${val} kg)`
                      });
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white pr-8"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">kg</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Ex: Banana ~ 20kg/cx, Soja = 60kg/sc
                </span>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Preço de Referência (R$ / {formConfig.unidadeComercializacaoPrincipal}):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formConfig.precoReferenciaUnitarioR$}
                    onChange={(e) => setFormConfig({ ...formConfig, precoReferenciaUnitarioR$: Number(e.target.value) })}
                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">R$</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Cotação base para projeção de receita
                </span>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Meta de Produtividade ({formConfig.unidadeComercializacaoPrincipal} / ha):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={formConfig.metaProdutividadePadraoHa}
                    onChange={(e) => setFormConfig({ ...formConfig, metaProdutividadePadraoHa: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">/ha</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Estimativa de safra média por hectare
                </span>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md cursor-pointer transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Aplicar Cultura &amp; Ajustar Unidades</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
