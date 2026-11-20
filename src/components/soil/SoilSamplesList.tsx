import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  Search,
  Edit3,
  Calculator,
  Trash2,
  Camera,
  Plus,
  Upload,
  Dna,
  X,
} from 'lucide-react';
import { Farm, SoilSample } from '../../types/agronomy';

interface SoilSamplesListProps {
  samples: SoilSample[];
  selectedFarm: Farm;
  filterPlotId: string;
  setFilterPlotId: (id: string) => void;
  filterDepth: string;
  setFilterDepth: (depth: string) => void;
  onEdit: (sample: SoilSample) => void;
  onDelete: (id: string) => void;
  onSelectForRecommendation?: (sample: SoilSample) => void;
  onNavigateView: (view: 'ocr' | 'manual' | 'import') => void;
}

const formatNum = (val: number | undefined | null, decimals = 1): string => {
  if (val == null || Number.isNaN(val)) return '—';
  return val.toFixed(decimals);
};

export const SoilSamplesList: React.FC<SoilSamplesListProps> = ({
  samples,
  selectedFarm,
  filterPlotId,
  setFilterPlotId,
  filterDepth,
  setFilterDepth,
  onEdit,
  onDelete,
  onSelectForRecommendation,
  onNavigateView,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const visibleSamples = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return samples;
    return samples.filter((s) => {
      const plotName =
        selectedFarm?.plots?.find((p) => p?.id === s.plotId)?.name?.toLowerCase() || '';
      return (
        s.sampleCode.toLowerCase().includes(q) ||
        (s.labName || '').toLowerCase().includes(q) ||
        (s.labProtocol || '').toLowerCase().includes(q) ||
        plotName.includes(q)
      );
    });
  }, [samples, searchQuery, selectedFarm?.plots]);

  return (
    <div className="space-y-4">
      {/* Barra de Filtros Compacta */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar código, laboratório ou talhão..."
              aria-label="Buscar amostras de solo"
              className="w-full h-8 pl-8 pr-7 text-xs border border-slate-200 dark:border-zinc-700 rounded-md bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            aria-label="Filtrar por Talhão"
            value={filterPlotId}
            onChange={(e) => setFilterPlotId(e.target.value)}
            className="h-8 px-2.5 text-xs border border-slate-200 dark:border-zinc-700 rounded-md bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 cursor-pointer focus:outline-none focus:border-emerald-500"
          >
            <option value="all">
              Todos os talhões ({(selectedFarm?.plots || []).length})
            </option>
            {(selectedFarm?.plots || []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar por Profundidade"
            value={filterDepth}
            onChange={(e) => setFilterDepth(e.target.value)}
            className="h-8 px-2.5 text-xs border border-slate-200 dark:border-zinc-700 rounded-md bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 cursor-pointer focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todas as camadas</option>
            <option value="0-20">0-20 cm (Arável)</option>
            <option value="20-40">20-40 cm (Subsolo)</option>
            <option value="0-40">0-40 cm (Perfil)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums whitespace-nowrap">
          <span className="font-semibold text-slate-900 dark:text-zinc-100">
            {visibleSamples.length}
          </span>{' '}
          {visibleSamples.length === 1 ? 'amostra' : 'amostras'}
        </div>
      </div>

      {/* Estado Vazio */}
      {visibleSamples.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-6 py-10 text-center space-y-3">
          <FlaskConical className="w-8 h-8 text-slate-300 dark:text-zinc-700 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Nenhuma análise de solo encontrada
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
              Envie uma foto ou PDF do laudo para extração automática, importe uma planilha CSV ou realize o cadastro manual.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onNavigateView('ocr')}
              className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Extrair Foto / PDF</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateView('manual')}
              className="h-8 px-3 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-md text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastro Manual</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateView('import')}
              className="h-8 px-3 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-md text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importar CSV</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleSamples.map((sample) => {
            const plot = selectedFarm?.plots?.find((p) => p?.id === sample.plotId);
            const hasBio = Boolean(
              sample.hasBioAS ||
                sample.arylsulfataseMgPnpKgH != null ||
                sample.betaGlucosidaseMgPnpKgH != null ||
                sample.acidPhosphataseMgPnpKgH != null
            );
            const hasBeneficial =
              sample.siMgDm3 != null ||
              sample.coMgDm3 != null ||
              sample.niMgDm3 != null ||
              sample.seMgDm3 != null ||
              sample.naCmolcDm3 != null;
            const kMg =
              sample.kMgDm3 != null
                ? sample.kMgDm3
                : Number(((sample.kCmolcDm3 || 0) * 391).toFixed(0));

            return (
              <div
                key={sample.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 space-y-3.5 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
              >
                {/* Cabeçalho da Amostra */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <h4 className="font-mono font-semibold text-sm text-slate-900 dark:text-zinc-100">
                        {sample.sampleCode}
                      </h4>
                      <span className="text-slate-300 dark:text-zinc-700" aria-hidden="true">
                        ·
                      </span>
                      <span className="font-medium text-slate-700 dark:text-zinc-300">
                        {plot?.name || 'Talhão Geral'}
                      </span>
                      <span className="text-slate-300 dark:text-zinc-700" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-slate-600 dark:text-zinc-400 tabular-nums">
                        {sample.depth} cm
                      </span>
                      {hasBio && (
                        <>
                          <span className="text-slate-300 dark:text-zinc-700" aria-hidden="true">
                            ·
                          </span>
                          <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
                            <Dna className="w-3 h-3" />
                            BioAS
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                      Coleta {sample.collectionDate || '—'}
                      {sample.labName ? ` · ${sample.labName}` : ''}
                      {sample.labProtocol ? ` · Protocolo ${sample.labProtocol}` : ''}
                    </p>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEdit(sample)}
                      className="h-8 px-2.5 text-xs font-medium rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                      <span>Editar</span>
                    </button>

                    {onSelectForRecommendation && (
                      <button
                        type="button"
                        onClick={() => onSelectForRecommendation(sample)}
                        className="h-8 px-3 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Recomendações</span>
                      </button>
                    )}

                    {confirmDeleteId === sample.id ? (
                      <div className="inline-flex items-center gap-1 pl-1">
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(sample.id);
                            setConfirmDeleteId(null);
                          }}
                          className="h-8 px-2.5 text-xs font-semibold rounded-md bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-colors whitespace-nowrap"
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="h-8 px-2 text-xs font-medium rounded-md border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        aria-label="Excluir amostra"
                        onClick={() => setConfirmDeleteId(sample.id)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-transparent hover:border-rose-200 dark:hover:border-rose-900 text-slate-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                        title="Excluir amostra"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Faixa de Índices Principais */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 tabular-nums">
                  <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md px-2.5 py-2">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                      Sat. Bases (V%)
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        (sample.vPercent ?? 0) >= 60
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : (sample.vPercent ?? 0) >= 45
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {formatNum(sample.vPercent, 1)}%
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md px-2.5 py-2">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                      CTC Total (T)
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      {formatNum(sample.ctcTotal, 2)} <span className="text-[10px] font-normal text-slate-400">cmolc</span>
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md px-2.5 py-2">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                      Soma Bases (SB)
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      {formatNum(sample.sb, 2)} <span className="text-[10px] font-normal text-slate-400">cmolc</span>
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md px-2.5 py-2">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                      Sat. Alumínio (m%)
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        (sample.mPercent ?? 0) > 15
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-900 dark:text-zinc-100'
                      }`}
                    >
                      {formatNum(sample.mPercent, 1)}%
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md px-2.5 py-2">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                      Relação Ca:Mg
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      {formatNum(sample.caMgRatio, 1)} : 1
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md px-2.5 py-2">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                      Argila / Areia / Silte
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      {sample.clayPercent ?? 0}/{sample.sandPercent ?? 0}/{sample.siltPercent ?? 0}%
                    </span>
                  </div>
                </div>

                {/* Tabela Compacta de Atributos Químicos */}
                <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-md">
                  <table className="w-full text-xs text-left tabular-nums">
                    <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-[10px] font-semibold text-slate-500 dark:text-zinc-400">
                      <tr>
                        <th className="py-1.5 px-2.5">pH CaCl2</th>
                        <th className="py-1.5 px-2.5">H2O / SMP</th>
                        <th className="py-1.5 px-2.5">M.O.</th>
                        <th className="py-1.5 px-2.5">P M-1</th>
                        <th className="py-1.5 px-2.5">P Res / M-3</th>
                        <th className="py-1.5 px-2.5">P-Rem / R3</th>
                        <th className="py-1.5 px-2.5">K (cmolc / mg)</th>
                        <th className="py-1.5 px-2.5">Ca</th>
                        <th className="py-1.5 px-2.5">Mg</th>
                        <th className="py-1.5 px-2.5">Al³⁺</th>
                        <th className="py-1.5 px-2.5">H+Al</th>
                        <th className="py-1.5 px-2.5">S-SO4</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">
                      <tr>
                        <td className="py-2 px-2.5 font-semibold">{formatNum(sample.phCaCl2, 2)}</td>
                        <td className="py-2 px-2.5 text-slate-600 dark:text-zinc-400">
                          {formatNum(sample.phH2O, 1)} / {formatNum(sample.phSmp, 1)}
                        </td>
                        <td className="py-2 px-2.5">{formatNum(sample.organicMatterGdm3, 1)}</td>
                        <td className="py-2 px-2.5 font-semibold text-amber-700 dark:text-amber-400">
                          {formatNum(sample.pMehlich1MgDm3, 1)}
                        </td>
                        <td className="py-2 px-2.5 text-slate-600 dark:text-zinc-400">
                          {formatNum(sample.pResinaMgDm3, 1)} / {formatNum(sample.pMehlich3MgDm3, 1)}
                        </td>
                        <td className="py-2 px-2.5 text-slate-600 dark:text-zinc-400">
                          {formatNum(sample.pRemanescenteMgL, 1)} / {formatNum(sample.pRemanescente3MgL, 1)}
                        </td>
                        <td className="py-2 px-2.5">
                          <span className="font-semibold">{formatNum(sample.kCmolcDm3, 2)}</span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 ml-1">
                            ({kMg.toFixed(0)})
                          </span>
                        </td>
                        <td className="py-2 px-2.5 font-medium">{formatNum(sample.caCmolcDm3, 2)}</td>
                        <td className="py-2 px-2.5 font-medium">{formatNum(sample.mgCmolcDm3, 2)}</td>
                        <td
                          className={`py-2 px-2.5 font-medium ${
                            (sample.alCmolcDm3 ?? 0) > 0.3
                              ? 'text-rose-600 dark:text-rose-400'
                              : ''
                          }`}
                        >
                          {formatNum(sample.alCmolcDm3, 2)}
                        </td>
                        <td className="py-2 px-2.5">{formatNum(sample.hAlCmolcDm3, 2)}</td>
                        <td className="py-2 px-2.5">{formatNum(sample.sSO4MgDm3, 1)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Micronutrientes & Benéficos (Linha Compacta) */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-zinc-400 tabular-nums">
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">
                    Micros (mg/dm³):
                  </span>
                  <span>
                    B <strong className="text-slate-900 dark:text-zinc-100">{formatNum(sample.bMgDm3, 2)}</strong>
                  </span>
                  <span>
                    Cu <strong className="text-slate-900 dark:text-zinc-100">{formatNum(sample.cuMgDm3, 2)}</strong>
                  </span>
                  <span>
                    Fe <strong className="text-slate-900 dark:text-zinc-100">{formatNum(sample.feMgDm3, 1)}</strong>
                  </span>
                  <span>
                    Mn <strong className="text-slate-900 dark:text-zinc-100">{formatNum(sample.mnMgDm3, 1)}</strong>
                  </span>
                  <span>
                    Zn <strong className="text-slate-900 dark:text-zinc-100">{formatNum(sample.znMgDm3, 2)}</strong>
                  </span>
                  <span>
                    Mo <strong className="text-slate-900 dark:text-zinc-100">{formatNum(sample.moMgDm3, 2)}</strong>
                  </span>

                  {hasBeneficial && (
                    <>
                      <span className="text-slate-300 dark:text-zinc-700" aria-hidden="true">
                        |
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-zinc-300">
                        Benéficos:
                      </span>
                      {sample.siMgDm3 != null && (
                        <span>
                          Si <strong className="text-slate-900 dark:text-zinc-100">{sample.siMgDm3}</strong>
                        </span>
                      )}
                      {sample.coMgDm3 != null && (
                        <span>
                          Co <strong className="text-slate-900 dark:text-zinc-100">{sample.coMgDm3}</strong>
                        </span>
                      )}
                      {sample.niMgDm3 != null && (
                        <span>
                          Ni <strong className="text-slate-900 dark:text-zinc-100">{sample.niMgDm3}</strong>
                        </span>
                      )}
                      {sample.seMgDm3 != null && (
                        <span>
                          Se <strong className="text-slate-900 dark:text-zinc-100">{sample.seMgDm3}</strong>
                        </span>
                      )}
                      {sample.naCmolcDm3 != null && (
                        <span>
                          Na <strong className="text-slate-900 dark:text-zinc-100">{sample.naCmolcDm3}</strong>
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* BioAS (quando presente) */}
                {hasBio && (
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 rounded-md p-3 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-emerald-900 dark:text-emerald-300 inline-flex items-center gap-1.5">
                        <Dna className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Bioanálise de Solo (BioAS — Embrapa)</span>
                      </span>
                      {sample.bioasHealthClass && (
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                          Saúde Biológica: {sample.bioasHealthClass}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 tabular-nums">
                      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded px-2.5 py-1.5">
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">IQS Bio</span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {sample.iqsBioScore != null
                            ? `${sample.iqsBioScore.toFixed(2)} (${(sample.iqsBioScore * 100).toFixed(0)}%)`
                            : '—'}
                        </span>
                      </div>
                      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded px-2.5 py-1.5">
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">IQS Químico</span>
                        <span className="font-semibold text-slate-900 dark:text-zinc-100">
                          {sample.iqsChemicalScore != null
                            ? `${sample.iqsChemicalScore.toFixed(2)} (${(sample.iqsChemicalScore * 100).toFixed(0)}%)`
                            : '—'}
                        </span>
                      </div>
                      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded px-2.5 py-1.5">
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">IQS Fertbio</span>
                        <span className="font-semibold text-slate-900 dark:text-zinc-100">
                          {sample.iqsFertbioScore != null
                            ? `${sample.iqsFertbioScore.toFixed(2)} (${(sample.iqsFertbioScore * 100).toFixed(0)}%)`
                            : '—'}
                        </span>
                      </div>
                      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded px-2.5 py-1.5">
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Arilsulfatase</span>
                        <span className="font-semibold text-slate-900 dark:text-zinc-100">
                          {sample.arylsulfataseMgPnpKgH != null ? `${sample.arylsulfataseMgPnpKgH}` : '—'}
                        </span>
                      </div>
                      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded px-2.5 py-1.5">
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Beta-glicosidase</span>
                        <span className="font-semibold text-slate-900 dark:text-zinc-100">
                          {sample.betaGlucosidaseMgPnpKgH != null ? `${sample.betaGlucosidaseMgPnpKgH}` : '—'}
                        </span>
                      </div>
                      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded px-2.5 py-1.5">
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Fosfatase Ácida</span>
                        <span className="font-semibold text-slate-900 dark:text-zinc-100">
                          {sample.acidPhosphataseMgPnpKgH != null ? `${sample.acidPhosphataseMgPnpKgH}` : '—'}
                        </span>
                      </div>
                    </div>

                    {sample.bioasInterpretation && (
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 pt-1 border-t border-emerald-200/60 dark:border-emerald-900/50">
                        {sample.bioasInterpretation}
                      </p>
                    )}
                  </div>
                )}

                {sample.notes && (
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800">
                    <span className="font-medium text-slate-700 dark:text-zinc-300">Observações: </span>
                    {sample.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
