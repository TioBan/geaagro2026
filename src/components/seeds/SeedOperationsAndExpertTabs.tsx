import React, { useMemo, useState } from 'react';
import {
  Sprout,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Printer,
  Download,
  Camera,
  RotateCcw,
} from 'lucide-react';
import {
  SeedLot,
  RegulatoryProfileId,
  ProfileThresholds,
  SeedPathogenRecord,
  SeedTreatmentRecord,
  SeedPhotoRecord,
  StorageRecord,
} from '../../types/seedAnalysis';
import {
  SEED_SPECIES_RAS_CATALOG,
  REGULATORY_PROFILES,
  calculateIQS,
  getLotPathogenMaxIncidence,
} from '../../data/seedAnalysisData';

interface SeedOperationsAndExpertTabsProps {
  mode:
    | 'sanidade'
    | 'tratamento'
    | 'armazenamento'
    | 'banco_imagens'
    | 'biblioteca_tecnologia'
    | 'sistema_especialista'
    | 'certificados';
  currentLot: SeedLot | null;
  selectedProfile: RegulatoryProfileId;
  isCustomized: boolean;
  thresholds: ProfileThresholds;
  onProfileChange: (profile: RegulatoryProfileId) => void;
  onThresholdChange: (key: keyof ProfileThresholds, value: number) => void;
  onUpdateLot: (updated: SeedLot, message?: string) => void;
  onOpenNewLotModal: () => void;
}

const INPUT_CLASS =
  'w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500';
const LABEL_CLASS = 'block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1';

export const SeedOperationsAndExpertTabs: React.FC<SeedOperationsAndExpertTabsProps> = ({
  mode,
  currentLot,
  selectedProfile,
  isCustomized,
  thresholds,
  onProfileChange,
  onThresholdChange,
  onUpdateLot,
  onOpenNewLotModal,
}) => {
  // Biblioteca RAS
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>(
    currentLot?.speciesId || 'soja'
  );

  // Sanidade form
  const [pathogenName, setPathogenName] = useState('');
  const [pathogenType, setPathogenType] = useState<SeedPathogenRecord['type']>('Fungo');
  const [pathogenMethod, setPathogenMethod] = useState<SeedPathogenRecord['method']>('Blotter Test');
  const [pathogenIncidence, setPathogenIncidence] = useState('2.5');
  const [pathogenSeverity, setPathogenSeverity] = useState<SeedPathogenRecord['severity']>('Baixa');
  const [pathogenNotes, setPathogenNotes] = useState('');

  // TSI form
  const [tsiProduct, setTsiProduct] = useState('');
  const [tsiCategory, setTsiCategory] = useState<SeedTreatmentRecord['targetCategory']>('Fungicida');
  const [tsiActive, setTsiActive] = useState('');
  const [tsiDose, setTsiDose] = useState('');
  const [tsiCalda, setTsiCalda] = useState('6');
  const [tsiUniformity, setTsiUniformity] = useState('96');
  const [tsiOperator, setTsiOperator] = useState('');

  // Photo log form
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCategory, setPhotoCategory] = useState<SeedPhotoRecord['category']>('Germinação (TPG)');
  const [photoNotes, setPhotoNotes] = useState('');

  const currentSpeciesRAS = useMemo(() => {
    return (
      SEED_SPECIES_RAS_CATALOG.find((s) => s.id === selectedSpeciesId) ||
      SEED_SPECIES_RAS_CATALOG[0]
    );
  }, [selectedSpeciesId]);

  const dynamicRules = useMemo(() => {
    if (!currentLot) return [];
    const lotMoisture = currentLot.moisture.moisturePct;
    const lotGermination = currentLot.germination.finalGerminationPct;
    const lotVigor = currentLot.vigor.tetrazoliumVigorPct;
    const lotPurity = currentLot.physicalQuality.purityPct;
    const lotMechanicalDamage = currentLot.physicalQuality.mechanicalDamageHypochloritePct;

    return [
      {
        id: 'rule-moisture',
        parameter: 'Teor de Umidade',
        condition: '≤',
        threshold: thresholds.moistureLimit,
        currentValue: lotMoisture,
        isTriggered: lotMoisture > thresholds.moistureLimit,
        severity: 'critical' as const,
        alertMessage: `Umidade (${lotMoisture}%) acima do limite do perfil (${thresholds.moistureLimit}%).`,
        recommendation:
          'Reduzir a umidade em secador estático para preservar integridade de membranas e conter fungos de armazenamento.',
      },
      {
        id: 'rule-germination',
        parameter: 'Taxa de Germinação (TPG)',
        condition: '≥',
        threshold: thresholds.minGermination,
        currentValue: lotGermination,
        isTriggered: lotGermination < thresholds.minGermination,
        severity: 'critical' as const,
        alertMessage: `Germinação (${lotGermination}%) abaixo do padrão do perfil (${thresholds.minGermination}%).`,
        recommendation:
          'Lote fora do padrão comercial para o perfil ativo. Avaliar rebeneficiamento em mesa densimétrica ou descarte.',
      },
      {
        id: 'rule-vigor',
        parameter: 'Índice de Vigor (Tetrazólio)',
        condition: '≥',
        threshold: thresholds.minVigor,
        currentValue: lotVigor,
        isTriggered: lotVigor < thresholds.minVigor,
        severity: 'warning' as const,
        alertMessage: `Vigor TZ (${lotVigor}%) inferior ao limiar recomendado (${thresholds.minVigor}%).`,
        recommendation:
          'Priorizar semeadura em solos com temperatura e umidade adequadas; evitar armazenamento prolongado.',
      },
      {
        id: 'rule-damage',
        parameter: 'Dano Mecânico (Hipoclorito)',
        condition: '≤',
        threshold: thresholds.maxMechanicalDamage,
        currentValue: lotMechanicalDamage,
        isTriggered: lotMechanicalDamage > thresholds.maxMechanicalDamage,
        severity: 'warning' as const,
        alertMessage: `Dano mecânico (${lotMechanicalDamage}%) acima da tolerância (${thresholds.maxMechanicalDamage}%).`,
        recommendation:
          'Revisar velocidade de correias, altura de queda nos elevadores de canecas e regulagem do cilindro trilhador.',
      },
      {
        id: 'rule-purity',
        parameter: 'Grau de Pureza Física',
        condition: '≥',
        threshold: thresholds.minPurity,
        currentValue: lotPurity,
        isTriggered: lotPurity < thresholds.minPurity,
        severity: 'critical' as const,
        alertMessage: `Pureza física (${lotPurity}%) inferior ao mínimo exigido (${thresholds.minPurity}%).`,
        recommendation:
          'Ajustar jogo de peneiras e aspiração de ar na máquina de limpeza da UBS para remoção de material inerte.',
      },
    ];
  }, [currentLot, thresholds]);

  // --- BIBLIOTECA RAS (Funciona mesmo sem lote cadastrado) ---
  if (mode === 'biblioteca_tecnologia') {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Biblioteca Botânica e Diretrizes RAS / MAPA
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Parâmetros morfológicos, substratos, temperaturas e tolerâncias oficiais offline.
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {SEED_SPECIES_RAS_CATALOG.map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => setSelectedSpeciesId(sp.id)}
                className={`h-7 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  selectedSpeciesId === sp.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                {sp.commonName}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Botânica e Morfologia
            </h4>
            <dl className="divide-y divide-slate-100 dark:divide-zinc-800">
              <div className="py-2 flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-zinc-400">Nome científico</dt>
                <dd className="font-medium italic text-slate-900 dark:text-zinc-100 text-right">
                  {currentSpeciesRAS.scientificName}
                </dd>
              </div>
              <div className="py-2 flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-zinc-400">Família / Tipo</dt>
                <dd className="font-medium text-slate-900 dark:text-zinc-100 text-right">
                  {currentSpeciesRAS.family} · {currentSpeciesRAS.seedType}
                </dd>
              </div>
              <div className="py-2 flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-zinc-400">Formato e cor</dt>
                <dd className="font-medium text-slate-900 dark:text-zinc-100 text-right">
                  {currentSpeciesRAS.shape} · {currentSpeciesRAS.color}
                </dd>
              </div>
              <div className="py-2 flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-zinc-400">PMS referência</dt>
                <dd className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                  {currentSpeciesRAS.defaultPmsG} g ({currentSpeciesRAS.avgWeightG} g/sem.)
                </dd>
              </div>
              <div className="py-2 flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-zinc-400">Longevidade média</dt>
                <dd className="font-medium text-slate-900 dark:text-zinc-100 text-right">
                  {currentSpeciesRAS.longevity}
                </dd>
              </div>
              <div className="py-2 space-y-1">
                <dt className="text-slate-500 dark:text-zinc-400">Morfologia</dt>
                <dd className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                  {currentSpeciesRAS.morphology}
                </dd>
              </div>
            </dl>
          </div>

          <div className="space-y-3 md:border-l md:border-slate-100 md:dark:border-zinc-800 md:pl-6">
            <h4 className="text-xs font-semibold text-teal-700 dark:text-teal-400">
              Protocolo Laboratorial RAS / MAPA
            </h4>
            <dl className="divide-y divide-slate-100 dark:divide-zinc-800">
              <div className="py-2 flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-zinc-400">Substrato indicado</dt>
                <dd className="font-medium text-slate-900 dark:text-zinc-100 text-right">
                  {currentSpeciesRAS.substrate}
                </dd>
              </div>
              <div className="py-2 flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-zinc-400">Temperatura</dt>
                <dd className="font-medium text-slate-900 dark:text-zinc-100 text-right">
                  {currentSpeciesRAS.temperatureC}
                </dd>
              </div>
              <div className="py-2 flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-zinc-400">1ª Contagem / Final</dt>
                <dd className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                  {currentSpeciesRAS.firstCountDays} dias / {currentSpeciesRAS.finalCountDays} dias
                </dd>
              </div>
              <div className="py-2 flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-zinc-400">Germinação mínima</dt>
                <dd className="font-medium text-emerald-700 dark:text-emerald-400 tabular-nums">
                  &ge; {currentSpeciesRAS.minGerminationOfficialPct}%
                </dd>
              </div>
              <div className="py-2 flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-zinc-400">Pureza / Umidade máx.</dt>
                <dd className="font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                  &ge; {currentSpeciesRAS.minPurityOfficialPct}% · &le; {currentSpeciesRAS.maxMoistureOfficialPct}%
                </dd>
              </div>
              <div className="py-2 space-y-1">
                <dt className="text-slate-500 dark:text-zinc-400">Quebra de dormência</dt>
                <dd className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                  {currentSpeciesRAS.dormancyMethods}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    );
  }

  if (!currentLot) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center">
        <Sprout className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3 opacity-80" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Nenhum lote selecionado
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
          Cadastre um lote de sementes para utilizar este módulo operacional e emitir relatórios.
        </p>
        <button
          type="button"
          onClick={onOpenNewLotModal}
          className="mt-4 h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar lote</span>
        </button>
      </div>
    );
  }

  // --- SANIDADE & PATOLOGIA ---
  if (mode === 'sanidade') {
    const handleAddPathogen = (e: React.FormEvent) => {
      e.preventDefault();
      if (!pathogenName.trim()) return;
      const record: SeedPathogenRecord = {
        id: `pat_${Date.now()}`,
        pathogenName: pathogenName.trim(),
        type: pathogenType,
        method: pathogenMethod,
        incidencePct: Math.min(100, Math.max(0, parseFloat(pathogenIncidence) || 0)),
        severity: pathogenSeverity,
        notes: pathogenNotes.trim() || 'Sem observações adicionais.',
      };
      onUpdateLot(
        {
          ...currentLot,
          sanitaryQuality: [record, ...currentLot.sanitaryQuality],
        },
        'Ocorrência fitopatológica registrada e IQS recalculado.'
      );
      setPathogenName('');
      setPathogenNotes('');
    };

    const handleRemovePathogen = (id: string) => {
      onUpdateLot(
        {
          ...currentLot,
          sanitaryQuality: currentLot.sanitaryQuality.filter((p) => p.id !== id),
        },
        'Registro de patógeno removido.'
      );
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Patologia e Sanidade de Sementes
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Maior incidência detectada: {getLotPathogenMaxIncidence(currentLot)}% (impacto direto no IQS)
              </p>
            </div>
            <span className="text-xs text-slate-400 dark:text-zinc-500 tabular-nums">
              {currentLot.sanitaryQuality.length} registro{currentLot.sanitaryQuality.length === 1 ? '' : 's'}
            </span>
          </div>

          {currentLot.sanitaryQuality.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhum patógeno registrado neste lote. Utilize o formulário ao lado para incluir resultados de Blotter Test, BDA ou PCR.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {currentLot.sanitaryQuality.map((pat) => (
                <div key={pat.id} className="px-5 py-3.5 flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-x-2">
                      <strong className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                        {pat.pathogenName}
                      </strong>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {pat.type} · {pat.method}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-zinc-300 tabular-nums">
                      Incidência: <strong className="font-semibold">{pat.incidencePct}%</strong> · Severidade:{' '}
                      <strong
                        className={`font-semibold ${
                          pat.severity === 'Severa' || pat.severity === 'Alta'
                            ? 'text-red-600 dark:text-red-400'
                            : pat.severity === 'Média'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {pat.severity}
                      </strong>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">{pat.notes}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePathogen(pat.id)}
                    aria-label={`Remover ${pat.pathogenName}`}
                    className="h-7 w-7 rounded-md inline-flex items-center justify-center text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-zinc-800 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={handleAddPathogen}
          className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-3 self-start"
        >
          <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Registrar Patógeno
          </h4>
          <div>
            <label className={LABEL_CLASS}>Agente / Patógeno *</label>
            <input
              type="text"
              placeholder="Ex: Fusarium spp., Cercospora kikuchii"
              value={pathogenName}
              onChange={(e) => setPathogenName(e.target.value)}
              className={INPUT_CLASS}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Tipo</label>
              <select
                value={pathogenType}
                onChange={(e) => setPathogenType(e.target.value as SeedPathogenRecord['type'])}
                className={INPUT_CLASS}
              >
                <option value="Fungo">Fungo</option>
                <option value="Bactéria">Bactéria</option>
                <option value="Nematóide">Nematóide</option>
                <option value="Vírus">Vírus</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Método</label>
              <select
                value={pathogenMethod}
                onChange={(e) => setPathogenMethod(e.target.value as SeedPathogenRecord['method'])}
                className={INPUT_CLASS}
              >
                <option value="Blotter Test">Blotter Test</option>
                <option value="Ágar BDA">Ágar BDA</option>
                <option value="Sementes Lavadas">Sementes Lavadas</option>
                <option value="PCR">PCR</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Incidência (%)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={pathogenIncidence}
                onChange={(e) => setPathogenIncidence(e.target.value)}
                className={`${INPUT_CLASS} tabular-nums`}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Severidade</label>
              <select
                value={pathogenSeverity}
                onChange={(e) => setPathogenSeverity(e.target.value as SeedPathogenRecord['severity'])}
                className={INPUT_CLASS}
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Severa">Severa</option>
              </select>
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS}>Observações / Recomendação</label>
            <textarea
              rows={2}
              placeholder="Indicação de tratamento fungicida ou restrição de lote..."
              value={pathogenNotes}
              onChange={(e) => setPathogenNotes(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-900 dark:text-zinc-100 resize-none"
            />
          </div>
          <button
            type="submit"
            className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar patógeno</span>
          </button>
        </form>
      </div>
    );
  }

  // --- TRATAMENTO INDUSTRIAL DE SEMENTES (TSI) ---
  if (mode === 'tratamento') {
    const handleAddTreatment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!tsiProduct.trim()) return;
      const today = new Date().toISOString().split('T')[0];
      const rec: SeedTreatmentRecord = {
        id: `tsi_${Date.now()}`,
        productName: tsiProduct.trim(),
        targetCategory: tsiCategory,
        activeIngredient: tsiActive.trim() || 'Não especificado',
        dosePer100kg: tsiDose.trim() || '200 mL/100 kg',
        caldaVolumeLPerTon: Math.max(0, parseFloat(tsiCalda) || 0),
        coverageUniformityPct: Math.min(100, Math.max(0, parseFloat(tsiUniformity) || 95)),
        dryingTimeHours: 2,
        curingTimeDays: 1,
        treatmentDate: today,
        operatorName: tsiOperator.trim() || currentLot.reception.technicalResponsible,
      };
      onUpdateLot(
        {
          ...currentLot,
          treatment: [rec, ...currentLot.treatment],
        },
        'Tratamento TSI registrado no lote.'
      );
      setTsiProduct('');
      setTsiActive('');
      setTsiDose('');
    };

    const handleRemoveTreatment = (id: string) => {
      onUpdateLot(
        {
          ...currentLot,
          treatment: currentLot.treatment.filter((t) => t.id !== id),
        },
        'Registro de TSI removido.'
      );
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Tratamento Industrial de Sementes (TSI)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Produtos aplicados, volume de calda, cobertura e controle de operação.
              </p>
            </div>
            <span className="text-xs text-slate-400 dark:text-zinc-500 tabular-nums">
              {currentLot.treatment.length} produto{currentLot.treatment.length === 1 ? '' : 's'}
            </span>
          </div>

          {currentLot.treatment.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhum produto TSI aplicado a este lote. Cadastre fungicidas, inseticidas, polímeros ou inoculantes ao lado.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {currentLot.treatment.map((t) => (
                <div key={t.id} className="px-5 py-3.5 flex items-start justify-between gap-3 text-xs">
                  <div className="min-w-0 space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2">
                      <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                        {t.productName}
                      </strong>
                      <span className="text-teal-700 dark:text-teal-400 font-medium">
                        {t.targetCategory}
                      </span>
                      <span className="text-slate-400 dark:text-zinc-500" aria-hidden="true">·</span>
                      <span className="text-slate-500 dark:text-zinc-400">{t.activeIngredient}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 dark:text-zinc-300 tabular-nums">
                      <span>Dose: <strong>{t.dosePer100kg}</strong></span>
                      <span>Calda: <strong>{t.caldaVolumeLPerTon} L/t</strong></span>
                      {t.coverageUniformityPct != null && (
                        <span>Uniformidade: <strong>{t.coverageUniformityPct}%</strong></span>
                      )}
                      <span>Data: {t.treatmentDate}</span>
                      <span>Operador: {t.operatorName}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTreatment(t.id)}
                    aria-label={`Remover ${t.productName}`}
                    className="h-7 w-7 rounded-md inline-flex items-center justify-center text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-zinc-800 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={handleAddTreatment}
          className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-3 self-start"
        >
          <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Adicionar Produto TSI
          </h4>
          <div>
            <label className={LABEL_CLASS}>Produto Comercial *</label>
            <input
              type="text"
              placeholder="Ex: Standak Top, Derosal Plus"
              value={tsiProduct}
              onChange={(e) => setTsiProduct(e.target.value)}
              className={INPUT_CLASS}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Categoria</label>
              <select
                value={tsiCategory}
                onChange={(e) => setTsiCategory(e.target.value as SeedTreatmentRecord['targetCategory'])}
                className={INPUT_CLASS}
              >
                <option value="Fungicida">Fungicida</option>
                <option value="Inseticida">Inseticida</option>
                <option value="Nematicida">Nematicida</option>
                <option value="Inoculante">Inoculante</option>
                <option value="Bioestimulante">Bioestimulante</option>
                <option value="Polímero">Polímero</option>
                <option value="Micronutriente">Micronutriente</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Dose / 100 kg</label>
              <input
                type="text"
                placeholder="Ex: 200 mL"
                value={tsiDose}
                onChange={(e) => setTsiDose(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS}>Princípio Ativo</label>
            <input
              type="text"
              placeholder="Ex: Piraclostrobina + Fipronil"
              value={tsiActive}
              onChange={(e) => setTsiActive(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className={LABEL_CLASS}>Calda (L/t)</label>
              <input
                type="number"
                step="0.5"
                value={tsiCalda}
                onChange={(e) => setTsiCalda(e.target.value)}
                className={`${INPUT_CLASS} tabular-nums`}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Cobertura (%)</label>
              <input
                type="number"
                max="100"
                value={tsiUniformity}
                onChange={(e) => setTsiUniformity(e.target.value)}
                className={`${INPUT_CLASS} tabular-nums`}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Operador</label>
              <input
                type="text"
                placeholder="Nome"
                value={tsiOperator}
                onChange={(e) => setTsiOperator(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>
          <button
            type="submit"
            className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar aplicação</span>
          </button>
        </form>
      </div>
    );
  }

  // --- ARMAZENAMENTO INTELIGENTE ---
  if (mode === 'armazenamento') {
    const st = currentLot.storage;
    const updateStorage = <K extends keyof StorageRecord>(key: K, value: StorageRecord[K]) => {
      onUpdateLot({
        ...currentLot,
        storage: { ...st, [key]: value },
      });
    };

    // Curva dinâmica de conservação baseada na soma T(°F) + UR% (Regra de Harrington)
    const tempF = st.temperatureC * 1.8 + 32;
    const harringtonSum = Math.round(tempF + st.relativeHumidityPct);
    const monthlyDecay = harringtonSum <= 100 ? 0.6 : harringtonSum <= 115 ? 1.4 : harringtonSum <= 130 ? 2.8 : 4.6;
    const baseVigor = currentLot.vigor.tetrazoliumVigorPct || 85;
    const projectionMonths = [1, 3, 6, 9, 12, 15].map((m) => ({
      month: m,
      vigor: Math.max(15, Math.round(baseVigor - m * monthlyDecay)),
    }));

    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Armazenamento e Conservação Fisiológica
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Monitoramento psicrométrico, empilhamento e projeção de vigor pela Regra de Harrington.
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium tabular-nums ${
                harringtonSum <= 115
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : harringtonSum <= 130
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400'
              }`}
            >
              Índice T(°F)+UR: {harringtonSum} ({harringtonSum <= 115 ? 'Seguro' : harringtonSum <= 130 ? 'Atenção' : 'Risco'})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={LABEL_CLASS}>Local / Câmara</label>
              <input
                type="text"
                value={st.locationName}
                onChange={(e) => updateStorage('locationName', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Tipo de Armazenamento</label>
              <select
                value={st.storageType}
                onChange={(e) => updateStorage('storageType', e.target.value as StorageRecord['storageType'])}
                className={INPUT_CLASS}
              >
                <option value="Câmara Fria Climatizada">Câmara Fria Climatizada</option>
                <option value="Galpão Convencional">Galpão Convencional</option>
                <option value="Silo Bag Climatizado">Silo Bag Climatizado</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Temperatura (°C)</label>
              <input
                type="number"
                step="0.5"
                value={st.temperatureC}
                onChange={(e) => updateStorage('temperatureC', parseFloat(e.target.value) || 0)}
                className={`${INPUT_CLASS} tabular-nums`}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Umidade Relativa (%)</label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={st.relativeHumidityPct}
                onChange={(e) => updateStorage('relativeHumidityPct', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                className={`${INPUT_CLASS} tabular-nums`}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Embalagem</label>
              <select
                value={st.packagingType}
                onChange={(e) => updateStorage('packagingType', e.target.value as StorageRecord['packagingType'])}
                className={INPUT_CLASS}
              >
                <option value="Big Bag Impermeável">Big Bag Impermeável</option>
                <option value="Sacos Papel Multifolhado 40kg">Sacos Papel Multifolhado 40kg</option>
                <option value="Sacos Ráfia 50kg">Sacos Ráfia 50kg</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Ventilação</label>
              <input
                type="text"
                value={st.ventilation}
                onChange={(e) => updateStorage('ventilation', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Camadas de Empilhamento</label>
              <input
                type="number"
                min="1"
                value={st.stackingLayers}
                onChange={(e) => updateStorage('stackingLayers', Math.max(1, parseInt(e.target.value) || 1))}
                className={`${INPUT_CLASS} tabular-nums`}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Previsão Nova Análise</label>
              <input
                type="date"
                value={st.nextAnalysisDate}
                onChange={(e) => updateStorage('nextAnalysisDate', e.target.value)}
                className={`${INPUT_CLASS} tabular-nums`}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                Projeção de Vigor em Armazenamento (base TZ atual: {baseVigor}%)
              </span>
              <span className="text-slate-500 dark:text-zinc-400 tabular-nums">
                Perda estimada: ~{monthlyDecay}% / mês
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2 items-end h-28 pt-2">
              {projectionMonths.map((item) => {
                const barColor =
                  item.vigor >= 80
                    ? 'bg-emerald-500'
                    : item.vigor >= 70
                      ? 'bg-teal-500'
                      : item.vigor >= 60
                        ? 'bg-amber-500'
                        : 'bg-red-500';
                return (
                  <div key={item.month} className="flex flex-col items-center gap-1 h-full justify-end">
                    <span className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 tabular-nums">
                      {item.vigor}%
                    </span>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-t h-16 flex items-end overflow-hidden">
                      <div
                        className={`w-full ${barColor} rounded-t transition-all`}
                        style={{ height: `${Math.min(100, item.vigor)}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                      Mês {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- BANCO DE IMAGENS / REGISTRO FOTOGRÁFICO REAL ---
  if (mode === 'banco_imagens') {
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string') return;
        const newPhoto: SeedPhotoRecord = {
          id: `img_${Date.now()}`,
          title: photoTitle.trim() || file.name.replace(/\.[^.]+$/, ''),
          category: photoCategory,
          date: new Date().toISOString().split('T')[0],
          notes: photoNotes.trim(),
          dataUrl: reader.result,
        };
        onUpdateLot(
          {
            ...currentLot,
            reception: {
              ...currentLot.reception,
              photos: [newPhoto, ...currentLot.reception.photos],
            },
          },
          'Registro fotográfico anexado ao lote.'
        );
        setPhotoTitle('');
        setPhotoNotes('');
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    };

    const handleDeletePhoto = (id: string) => {
      onUpdateLot(
        {
          ...currentLot,
          reception: {
            ...currentLot.reception,
            photos: currentLot.reception.photos.filter((p) => p.id !== id),
          },
        },
        'Imagem removida.'
      );
    };

    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Diário Fotográfico do Lote
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Anexe registros reais de germinação (TPG), coloração de tetrazólio, danos mecânicos ou sanidade.
            </p>
          </div>
          <span className="text-xs text-slate-400 dark:text-zinc-500 tabular-nums">
            {currentLot.reception.photos.length} foto{currentLot.reception.photos.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className={LABEL_CLASS}>Título do registro</label>
            <input
              type="text"
              placeholder="Ex: Leitura TZ 1-3"
              value={photoTitle}
              onChange={(e) => setPhotoTitle(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Categoria</label>
            <select
              value={photoCategory}
              onChange={(e) => setPhotoCategory(e.target.value as SeedPhotoRecord['category'])}
              className={INPUT_CLASS}
            >
              <option value="Recepção">Recepção</option>
              <option value="Dano Mecânico">Dano Mecânico</option>
              <option value="Germinação (TPG)">Germinação (TPG)</option>
              <option value="Tetrazólio (TZ)">Tetrazólio (TZ)</option>
              <option value="Patologia">Patologia</option>
              <option value="Armazenamento">Armazenamento</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Observação</label>
            <input
              type="text"
              placeholder="Anotação curta"
              value={photoNotes}
              onChange={(e) => setPhotoNotes(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 w-full cursor-pointer transition-colors">
              <Camera className="w-3.5 h-3.5" />
              <span>Anexar imagem</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {currentLot.reception.photos.length === 0 ? (
          <div className="py-8 text-center border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400">
            Nenhuma foto anexada ao lote {currentLot.lotNumber}. Selecione um arquivo de imagem acima para registrar evidências visuais.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {currentLot.reception.photos.map((photo) => (
              <div
                key={photo.id}
                className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-zinc-950"
              >
                <img
                  src={photo.dataUrl}
                  alt={photo.title}
                  className="w-full h-36 object-cover bg-slate-200 dark:bg-zinc-800"
                />
                <div className="p-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                      {photo.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                      {photo.category} · {photo.date}
                    </p>
                    {photo.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2">
                        {photo.notes}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(photo.id)}
                    aria-label={`Remover ${photo.title}`}
                    className="h-7 w-7 rounded-md inline-flex items-center justify-center text-slate-400 hover:text-red-600 dark:hover:text-red-400 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- SISTEMA ESPECIALISTA PARAMETRIZADO ---
  if (mode === 'sistema_especialista') {
    const triggeredCount = dynamicRules.filter((r) => r.isTriggered).length;

    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Sistema Especialista de Conformidade (Regras Parametrizadas)
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {REGULATORY_PROFILES[selectedProfile].description}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={selectedProfile}
                onChange={(e) => onProfileChange(e.target.value as RegulatoryProfileId)}
                className="h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-900 dark:text-zinc-100 cursor-pointer"
              >
                {Object.values(REGULATORY_PROFILES).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              {isCustomized && (
                <button
                  type="button"
                  onClick={() => onProfileChange(selectedProfile)}
                  className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 tabular-nums">
            {[
              {
                key: 'moistureLimit' as const,
                label: 'Umidade máx. (%)',
                step: '0.1',
                lotVal: currentLot.moisture.moisturePct,
                bad: currentLot.moisture.moisturePct > thresholds.moistureLimit,
              },
              {
                key: 'minGermination' as const,
                label: 'Germinação mín. (%)',
                step: '1',
                lotVal: currentLot.germination.finalGerminationPct,
                bad: currentLot.germination.finalGerminationPct < thresholds.minGermination,
              },
              {
                key: 'minVigor' as const,
                label: 'Vigor TZ mín. (%)',
                step: '1',
                lotVal: currentLot.vigor.tetrazoliumVigorPct,
                bad: currentLot.vigor.tetrazoliumVigorPct < thresholds.minVigor,
              },
              {
                key: 'maxMechanicalDamage' as const,
                label: 'Dano mec. máx. (%)',
                step: '0.1',
                lotVal: currentLot.physicalQuality.mechanicalDamageHypochloritePct,
                bad: currentLot.physicalQuality.mechanicalDamageHypochloritePct > thresholds.maxMechanicalDamage,
              },
              {
                key: 'minPurity' as const,
                label: 'Pureza mín. (%)',
                step: '0.1',
                lotVal: currentLot.physicalQuality.purityPct,
                bad: currentLot.physicalQuality.purityPct < thresholds.minPurity,
              },
            ].map((item) => (
              <div key={item.key} className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400">
                  {item.label}
                </label>
                <input
                  type="number"
                  step={item.step}
                  value={thresholds[item.key]}
                  onChange={(e) => onThresholdChange(item.key, parseFloat(e.target.value) || 0)}
                  className={INPUT_CLASS}
                />
                <div className="text-[11px] flex justify-between text-slate-500 dark:text-zinc-400">
                  <span>Lote atual</span>
                  <strong
                    className={
                      item.bad
                        ? 'font-semibold text-red-600 dark:text-red-400'
                        : 'font-semibold text-emerald-600 dark:text-emerald-400'
                    }
                  >
                    {item.lotVal}%
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900 dark:text-zinc-100">
              Diagnóstico das Regras ({currentLot.lotNumber})
            </span>
            <span className="text-slate-500 dark:text-zinc-400 tabular-nums">
              {triggeredCount === 0
                ? '5 de 5 em conformidade'
                : `${triggeredCount} alerta${triggeredCount === 1 ? '' : 's'} ativo${triggeredCount === 1 ? '' : 's'}`}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {dynamicRules.map((rule) => (
              <div key={rule.id} className="px-5 py-3.5 flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {rule.isTriggered ? (
                    rule.severity === 'critical' ? (
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    )
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                      {rule.isTriggered ? rule.alertMessage : `${rule.parameter}: em conformidade`}
                    </strong>
                    <span
                      className={`text-[11px] font-medium tabular-nums ${
                        rule.isTriggered
                          ? rule.severity === 'critical'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {rule.isTriggered ? (rule.severity === 'critical' ? 'Crítico' : 'Alerta') : 'Aprovado'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                    Meta: {rule.condition} {rule.threshold}% · Medido no lote: {rule.currentValue}%
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-300">
                    {rule.isTriggered
                      ? rule.recommendation
                      : 'Resultado dentro do padrão estabelecido para o perfil regulatório selecionado.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- CERTIFICADOS & BAS (BOLETIM DE ANÁLISE DE SEMENTES) ---
  const species =
    SEED_SPECIES_RAS_CATALOG.find((s) => s.id === currentLot.speciesId) || SEED_SPECIES_RAS_CATALOG[0];
  const iqs = calculateIQS({
    germinationPct: currentLot.germination.finalGerminationPct,
    vigorTzPct: currentLot.vigor.tetrazoliumVigorPct,
    purityPct: currentLot.physicalQuality.purityPct,
    moisturePct: currentLot.moisture.moisturePct,
    idealMoisturePct: species.maxMoistureOfficialPct - 0.5,
    stinkbugDamagePct: currentLot.physicalQuality.stinkbugDamagePct,
    mechanicalDamagePct: currentLot.physicalQuality.mechanicalDamageHypochloritePct,
    pathogenIncidencePct: getLotPathogenMaxIncidence(currentLot),
  });
  const criticalFails = dynamicRules.filter((r) => r.isTriggered && r.severity === 'critical').length;
  const valorCultural =
    Math.round(
      ((currentLot.physicalQuality.purityPct * currentLot.germination.finalGerminationPct) / 100) * 10
    ) / 10;

  const handleExportJson = () => {
    const payload = {
      boletim: 'BAS - Boletim de Análise de Sementes',
      geradoEm: new Date().toISOString(),
      perfilRegulatorio: REGULATORY_PROFILES[selectedProfile].label,
      parecer: criticalFails === 0 ? 'APROVADO' : 'RESTRIÇÃO / REPROVADO',
      iqs,
      valorCulturalPct: valorCultural,
      lote: currentLot,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BAS_${currentLot.lotNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-6">
        {/* Cabeçalho do Boletim */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
              Boletim de Análise de Sementes (BAS)
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
              Amostra {currentLot.reception.sampleNumber} · Passaporte {currentLot.internalCode} · Emitido em{' '}
              {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={handleExportJson}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar JSON</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>

        {/* Identificação */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-6 text-xs">
          <div>
            <span className="text-slate-500 dark:text-zinc-400 block">Lote / Classe</span>
            <strong className="font-semibold text-slate-900 dark:text-zinc-100">
              {currentLot.lotNumber} · {currentLot.seedClass}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 dark:text-zinc-400 block">Espécie / Cultivar</span>
            <strong className="font-semibold text-slate-900 dark:text-zinc-100">
              {currentLot.speciesName} — {currentLot.cultivar}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 dark:text-zinc-400 block">Cliente / Origem</span>
            <strong className="font-semibold text-slate-900 dark:text-zinc-100">
              {currentLot.reception.client} ({currentLot.reception.farm})
            </strong>
          </div>
          <div>
            <span className="text-slate-500 dark:text-zinc-400 block">Representatividade / Safra</span>
            <strong className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
              {currentLot.totalWeightKg.toLocaleString('pt-BR')} kg · {currentLot.cropSeason}
            </strong>
          </div>
        </div>

        {/* Resumo Analítico */}
        <div className="grid grid-cols-2 sm:grid-cols-5 border border-slate-200 dark:border-zinc-800 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 tabular-nums">
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Pureza Física</span>
            <strong className="text-base font-semibold text-slate-900 dark:text-zinc-100">
              {currentLot.physicalQuality.purityPct}%
            </strong>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Germinação (TPG)</span>
            <strong className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
              {currentLot.germination.finalGerminationPct}%
            </strong>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Vigor (Tetrazólio)</span>
            <strong className="text-base font-semibold text-teal-600 dark:text-teal-400">
              {currentLot.vigor.tetrazoliumVigorPct}%
            </strong>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Umidade / VC%</span>
            <strong className="text-base font-semibold text-slate-900 dark:text-zinc-100">
              {currentLot.moisture.moisturePct}% · VC {valorCultural}%
            </strong>
          </div>
          <div className="p-3.5 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Índice IQS</span>
            <strong className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
              {iqs.score}/100 ({iqs.classification})
            </strong>
          </div>
        </div>

        {/* Parecer e Assinatura */}
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-2">
            {criticalFails === 0 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            )}
            <div>
              <strong className="font-semibold text-slate-900 dark:text-zinc-100 block">
                Parecer ({REGULATORY_PROFILES[selectedProfile].shortLabel}):{' '}
                {criticalFails === 0 ? 'Aprovado para comercialização / semeadura' : 'Restrição técnica identificada'}
              </strong>
              <span className="text-slate-500 dark:text-zinc-400">
                PMS: {currentLot.physicalQuality.pmsG} g · Dano mecânico: {currentLot.physicalQuality.mechanicalDamageHypochloritePct}% · Patógenos: {currentLot.sanitaryQuality.length}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right text-slate-500 dark:text-zinc-400">
            <div className="font-medium text-slate-800 dark:text-zinc-200">
              {currentLot.reception.technicalResponsible}
            </div>
            <div className="text-[11px]">Responsável Técnico · RAS / MAPA</div>
          </div>
        </div>
      </div>
    </div>
  );
};
