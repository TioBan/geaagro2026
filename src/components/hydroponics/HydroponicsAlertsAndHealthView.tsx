import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Check,
  Plus,
  Search,
  ShieldCheck,
} from 'lucide-react';
import {
  HydroponicAlert,
  NutrientSolutionReservoir,
} from '../../types/hydroponics';
import {
  hydroponicPestDiseaseCatalog,
  hydroponicTechnicalLibrary,
} from '../../data/hydroponicsData';
import { HYDRO_INPUT_CLASS, HYDRO_LABEL_CLASS } from './hydroponicsUi';

interface HydroponicsAlertsAndHealthViewProps {
  mode: 'alertas' | 'fitossanidade' | 'biblioteca';
  alerts: HydroponicAlert[];
  reservoirs: NutrientSolutionReservoir[];
  onResolveAlert: (id: string) => void;
  onAddAlert: (alert: Omit<HydroponicAlert, 'id' | 'timestamp' | 'resolved'>) => void;
}

const PEST_CATEGORY_LABELS: Record<string, string> = {
  doenca_radicular: 'Doença Radicular',
  doenca_foliar: 'Doença Foliar',
  praga: 'Praga',
  fisiopatia_nutricional: 'Fisiopatia / Manejo',
};

const LIB_CATEGORY_LABELS: Record<string, string> = {
  sistemas: 'Sistemas',
  nutricao: 'Nutrição',
  sanidade: 'Sanidade',
  manejo: 'Manejo',
};

export const HydroponicsAlertsAndHealthView: React.FC<
  HydroponicsAlertsAndHealthViewProps
> = ({ mode, alerts, reservoirs, onResolveAlert, onAddAlert }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewAlertForm, setShowNewAlertForm] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDesc, setAlertDesc] = useState('');
  const [alertTarget, setAlertTarget] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<HydroponicAlert['severity']>('moderado');
  const [alertType, setAlertType] = useState<HydroponicAlert['type']>('ph_fora');

  // Auto-derived diagnostics from real reservoir parameters
  const autoDiagnostics = useMemo(() => {
    const items: { id: string; title: string; detail: string; severity: 'moderado' | 'critico' }[] = [];
    for (const r of reservoirs) {
      if (r.currentPH < r.targetPHMin || r.currentPH > r.targetPHMax) {
        items.push({
          id: `auto-ph-${r.id}`,
          title: `pH fora da faixa — ${r.name}`,
          detail: `Leitura atual ${r.currentPH.toFixed(2)} (faixa alvo ${r.targetPHMin}–${r.targetPHMax}).`,
          severity: 'moderado',
        });
      }
      if (r.currentEC < r.targetECMin || r.currentEC > r.targetECMax) {
        items.push({
          id: `auto-ec-${r.id}`,
          title: `CE fora da faixa — ${r.name}`,
          detail: `Leitura atual ${r.currentEC.toFixed(2)} mS/cm (alvo ${r.targetECMin}–${r.targetECMax}).`,
          severity: 'moderado',
        });
      }
      if (r.solutionTempC > 25) {
        items.push({
          id: `auto-temp-${r.id}`,
          title: `Temperatura elevada na solução — ${r.name}`,
          detail: `Solução em ${r.solutionTempC.toFixed(1)} °C eleva risco de Pythium e reduz O₂ dissolvido.`,
          severity: 'critico',
        });
      }
      if (r.dissolvedOxygenPpm > 0 && r.dissolvedOxygenPpm < 5) {
        items.push({
          id: `auto-o2-${r.id}`,
          title: `Oxigenação baixa — ${r.name}`,
          detail: `O₂ dissolvido em ${r.dissolvedOxygenPpm.toFixed(1)} mg/L (recomendado >6,0 mg/L).`,
          severity: 'critico',
        });
      }
      if (r.capacityLiters > 0 && r.currentVolumeLiters / r.capacityLiters < 0.25) {
        items.push({
          id: `auto-vol-${r.id}`,
          title: `Nível crítico de reservatório — ${r.name}`,
          detail: `Volume em ${r.currentVolumeLiters} L (${Math.round((r.currentVolumeLiters / r.capacityLiters) * 100)}% da capacidade).`,
          severity: 'critico',
        });
      }
    }
    return items;
  }, [reservoirs]);

  if (mode === 'alertas') {
    const handleCreateAlert = (e: React.FormEvent) => {
      e.preventDefault();
      if (!alertTitle.trim()) return;
      onAddAlert({
        type: alertType,
        severity: alertSeverity,
        title: alertTitle.trim(),
        description: alertDesc.trim() || 'Ocorrência operacional registrada manualmente.',
        targetEntity: alertTarget.trim() || 'Estufa Principal',
      });
      setAlertTitle('');
      setAlertDesc('');
      setAlertTarget('');
      setShowNewAlertForm(false);
    };

    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Central de Alertas &amp; Diagnósticos
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Alertas automáticos por desvio nos reservatórios e ocorrências operacionais registradas.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNewAlertForm((v) => !v)}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Registrar Alerta
            </button>
          </div>

          {showNewAlertForm && (
            <form
              onSubmit={handleCreateAlert}
              className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-3.5 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={HYDRO_LABEL_CLASS}>Título do Alerta *</label>
                  <input
                    type="text"
                    required
                    value={alertTitle}
                    onChange={(e) => setAlertTitle(e.target.value)}
                    placeholder="Ex: Bomba auxiliar com ruído"
                    className={HYDRO_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={HYDRO_LABEL_CLASS}>Severidade</label>
                  <select
                    value={alertSeverity}
                    onChange={(e) =>
                      setAlertSeverity(e.target.value as HydroponicAlert['severity'])
                    }
                    className={HYDRO_INPUT_CLASS}
                  >
                    <option value="baixo">Baixo</option>
                    <option value="moderado">Moderado</option>
                    <option value="critico">Crítico</option>
                  </select>
                </div>
                <div>
                  <label className={HYDRO_LABEL_CLASS}>Tipo</label>
                  <select
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value as HydroponicAlert['type'])}
                    className={HYDRO_INPUT_CLASS}
                  >
                    <option value="ph_fora">pH fora da faixa</option>
                    <option value="ce_fora">CE fora da faixa</option>
                    <option value="agua_baixa">Nível de água baixo</option>
                    <option value="bomba_off">Bomba parada</option>
                    <option value="temp_solucao_alta">Temperatura solução alta</option>
                    <option value="colheita_proxima">Colheita próxima</option>
                    <option value="falha_eletrica">Falha elétrica</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={HYDRO_LABEL_CLASS}>Local / Equipamento</label>
                  <input
                    type="text"
                    value={alertTarget}
                    onChange={(e) => setAlertTarget(e.target.value)}
                    placeholder="Ex: Reservatório 01"
                    className={HYDRO_INPUT_CLASS}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={HYDRO_LABEL_CLASS}>Descrição</label>
                  <input
                    type="text"
                    value={alertDesc}
                    onChange={(e) => setAlertDesc(e.target.value)}
                    placeholder="Detalhes da anomalia ou ação necessária..."
                    className={HYDRO_INPUT_CLASS}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewAlertForm(false)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar Alerta
                </button>
              </div>
            </form>
          )}

          {/* Auto diagnostics from reservoirs */}
          {autoDiagnostics.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
                Desvios detectados nos reservatórios ({autoDiagnostics.length})
              </span>
              {autoDiagnostics.map((d) => (
                <div
                  key={d.id}
                  className={`rounded-lg border p-3 flex items-start gap-2.5 text-xs ${
                    d.severity === 'critico'
                      ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20'
                      : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20'
                  }`}
                >
                  <AlertTriangle
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      d.severity === 'critico'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  />
                  <div>
                    <strong className="text-slate-900 dark:text-zinc-100 block">{d.title}</strong>
                    <p className="text-slate-600 dark:text-zinc-400 mt-0.5">{d.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Manual alerts list */}
          {alerts.length === 0 && autoDiagnostics.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/60 p-8 text-center space-y-1.5">
              <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                Nenhum alerta ativo ou registrado
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Desvios de pH, CE, temperatura ou nível dos tanques aparecerão automaticamente aqui.
              </p>
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
                Ocorrências registradas ({alerts.length})
              </span>
              {alerts.map((alt) => (
                <div
                  key={alt.id}
                  className={`rounded-lg border p-3 flex items-start justify-between gap-3 text-xs ${
                    alt.resolved
                      ? 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 opacity-65'
                      : alt.severity === 'critico'
                      ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20'
                      : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <strong className="text-slate-900 dark:text-zinc-100">{alt.title}</strong>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        · {alt.targetEntity} · {alt.timestamp}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400">{alt.description}</p>
                  </div>

                  {alt.resolved ? (
                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 shrink-0">
                      Resolvido
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onResolveAlert(alt.id)}
                      className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-emerald-500 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      Resolver
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (mode === 'fitossanidade') {
    const q = searchTerm.trim().toLowerCase();
    const filteredGuides = hydroponicPestDiseaseCatalog.filter(
      (g) =>
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.scientificName.toLowerCase().includes(q) ||
        g.affectedCrops.some((c) => c.toLowerCase().includes(q))
    );

    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Fitossanidade &amp; Manejo Preventivo
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Diagnóstico de doenças radiculares, distúrbios fisiológicos e ajustes recomendados na solução.
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar patógeno ou cultura..."
              className={`${HYDRO_INPUT_CLASS} pl-8`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGuides.map((guide) => (
            <div
              key={guide.id}
              className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 p-4 space-y-3"
            >
              <div className="pb-2 border-b border-slate-200/70 dark:border-zinc-800">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    {guide.name}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  <span className="italic">{guide.scientificName}</span>
                  <span aria-hidden="true">·</span>
                  <span>{PEST_CATEGORY_LABELS[guide.category] || guide.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{guide.affectedCrops.join(', ')}</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                    Sintomas Típicos
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-zinc-400 list-disc list-inside leading-relaxed">
                    {guide.symptoms.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                    Ações Preventivas &amp; Corretivas
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-zinc-400 list-disc list-inside leading-relaxed">
                    {guide.preventiveMeasures.slice(0, 2).map((m, i) => (
                      <li key={`p-${i}`}>{m}</li>
                    ))}
                    {guide.correctiveActions.slice(0, 2).map((c, i) => (
                      <li key={`c-${i}`}>{c.replace(/\*/g, '')}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5">
                  <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 block">
                    Ajuste na Solução Nutritiva
                  </span>
                  <p className="text-[11px] text-slate-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                    {guide.solutionAdjustmentTip}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* MODE: BIBLIOTECA TÉCNICA */
  const qLib = searchTerm.trim().toLowerCase();
  const filteredLib = hydroponicTechnicalLibrary.filter(
    (entry) =>
      !qLib ||
      entry.title.toLowerCase().includes(qLib) ||
      entry.summary.toLowerCase().includes(qLib)
  );

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Biblioteca Técnica de Hidroponia
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Referências de dimensionamento de sistemas, sanitização e equilíbrio químico.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar guia técnico..."
            className={`${HYDRO_INPUT_CLASS} pl-8`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredLib.map((entry) => (
          <div
            key={entry.id}
            className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 p-3.5 flex flex-col justify-between gap-3"
          >
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 block">
                {LIB_CATEGORY_LABELS[entry.category]}
              </span>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                {entry.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                {entry.summary}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/70 dark:border-zinc-800 text-[11px] font-mono text-slate-500 dark:text-zinc-400">
              {entry.keyParameter}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
