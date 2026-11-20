import React from 'react';
import { Calculator, CheckCircle2, Dna, Activity } from 'lucide-react';
import { Farm, SoilSample } from '../../types/agronomy';

export interface SoilSampleFormState {
  code: string;
  plotId: string;
  depth: '0-20' | '20-40' | '0-40';
  date: string;
  lab: string;
  protocol: string;
  ph: number | string;
  phH2O: number | string;
  phSmp: number | string;
  mo: number | string;
  al: number | string;
  hAl: number | string;
  p: number | string;
  pMehlich3: number | string;
  pResina: number | string;
  pRem: number | string;
  pRem3: number | string;
  k: number | string;
  ca: number | string;
  mg: number | string;
  s: number | string;
  b: number | string;
  cu: number | string;
  fe: number | string;
  mn: number | string;
  zn: number | string;
  molibdenio: number | string;
  si: number | string;
  co: number | string;
  ni: number | string;
  se: number | string;
  na: number | string;
  clay: number | string;
  sand: number | string;
  silt: number | string;
  hasBioAS: boolean;
  arylsulfatase: number | string;
  betaGlucosidase: number | string;
  acidPhosphatase: number | string;
  iqsBio: number | string;
  bioasHealthClass: string;
  bioasInterpretation: string;
  notes: string;
}

interface SoilSampleFormProps {
  formData: SoilSampleFormState;
  setFormData: React.Dispatch<React.SetStateAction<SoilSampleFormState>>;
  kUnit: 'cmolc' | 'mg';
  onKUnitChange: (unit: 'cmolc' | 'mg') => void;
  liveIndices: Partial<SoilSample>;
  selectedFarm: Farm;
  extractedFields?: Set<string>;
  editingSampleId?: string | null;
  submitLabel: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const INPUT_CLASS =
  'w-full h-8 px-2.5 text-xs border border-slate-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 tabular-nums transition-colors';

const SELECT_CLASS =
  'w-full h-8 px-2.5 text-xs border border-slate-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 cursor-pointer transition-colors';

const LABEL_CLASS =
  'flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const SoilSampleForm: React.FC<SoilSampleFormProps> = ({
  formData,
  setFormData,
  kUnit,
  onKUnitChange,
  liveIndices,
  selectedFarm,
  extractedFields,
  editingSampleId,
  submitLabel,
  onSubmit,
  onCancel,
}) => {
  const isAi = (field: string) => Boolean(extractedFields?.has(field));

  const updateField = <K extends keyof SoilSampleFormState>(
    field: K,
    value: SoilSampleFormState[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderLabel = (text: string, fieldKey?: string) => (
    <label className={LABEL_CLASS}>
      <span className="truncate">{text}</span>
      {fieldKey && isAi(fieldKey) && (
        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 ml-1">
          IA
        </span>
      )}
    </label>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Identificação */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
          <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
            Identificação do Laudo e Talhão
          </h4>
          {editingSampleId && (
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
              Editando registro existente
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2">
            {renderLabel('Código da Amostra *', 'code')}
            <input
              type="text"
              required
              placeholder="Ex: T01-SOLO-2026"
              value={formData.code}
              onChange={(e) => updateField('code', e.target.value)}
              className={`${INPUT_CLASS} font-mono font-semibold`}
            />
          </div>

          <div className="lg:col-span-2">
            {renderLabel('Talhão da Fazenda')}
            <select
              value={formData.plotId}
              onChange={(e) => updateField('plotId', e.target.value)}
              className={SELECT_CLASS}
            >
              {(selectedFarm?.plots || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.areaHa} ha)
                </option>
              ))}
            </select>
          </div>

          <div>
            {renderLabel('Profundidade', 'depth')}
            <select
              value={formData.depth}
              onChange={(e) =>
                updateField('depth', e.target.value as '0-20' | '20-40' | '0-40')
              }
              className={SELECT_CLASS}
            >
              <option value="0-20">0-20 cm (Arável)</option>
              <option value="20-40">20-40 cm (Subsolo)</option>
              <option value="0-40">0-40 cm (Perfil)</option>
            </select>
          </div>

          <div>
            {renderLabel('Data da Coleta', 'date')}
            <input
              type="date"
              value={formData.date}
              onChange={(e) => updateField('date', e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="sm:col-span-1 lg:col-span-3">
            {renderLabel('Laboratório Emissor', 'lab')}
            <input
              type="text"
              placeholder="Nome do laboratório"
              value={formData.lab}
              onChange={(e) => updateField('lab', e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="sm:col-span-1 lg:col-span-3">
            {renderLabel('Protocolo / Número do Laudo', 'protocol')}
            <input
              type="text"
              placeholder="Ex: LAU-2026-001"
              value={formData.protocol}
              onChange={(e) => updateField('protocol', e.target.value)}
              className={`${INPUT_CLASS} font-mono`}
            />
          </div>
        </div>
      </div>

      {/* Complexo Químico Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Acidez & Matéria Orgânica */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              Acidez e Matéria Orgânica
            </h4>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500">pH · M.O. · H+Al</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              {renderLabel('pH CaCl2', 'ph')}
              <input
                type="number"
                step="0.01"
                placeholder="5.20"
                value={formData.ph}
                onChange={(e) => updateField('ph', e.target.value)}
                className={`${INPUT_CLASS} font-semibold`}
              />
            </div>
            <div>
              {renderLabel('pH H2O', 'phH2O')}
              <input
                type="number"
                step="0.01"
                placeholder="5.80"
                value={formData.phH2O}
                onChange={(e) => updateField('phH2O', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              {renderLabel('pH SMP', 'phSmp')}
              <input
                type="number"
                step="0.01"
                placeholder="5.60"
                value={formData.phSmp}
                onChange={(e) => updateField('phSmp', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              {renderLabel('M.O. (g/dm³)', 'mo')}
              <input
                type="number"
                step="0.1"
                placeholder="25.0"
                value={formData.mo}
                onChange={(e) => updateField('mo', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              {renderLabel('Al³⁺ (cmolc/dm³)', 'al')}
              <input
                type="number"
                step="0.01"
                placeholder="0.15"
                value={formData.al}
                onChange={(e) => updateField('al', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              {renderLabel('H+Al (cmolc/dm³)', 'hAl')}
              <input
                type="number"
                step="0.01"
                placeholder="3.50"
                value={formData.hAl}
                onChange={(e) => updateField('hAl', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </div>

        {/* Macronutrientes */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              Macronutrientes
            </h4>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500">P · K · Ca · Mg · S</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              {renderLabel('P Mehlich-1 (mg/dm³)', 'p')}
              <input
                type="number"
                step="0.1"
                placeholder="12.0"
                value={formData.p}
                onChange={(e) => updateField('p', e.target.value)}
                className={`${INPUT_CLASS} font-semibold`}
              />
            </div>
            <div>
              {renderLabel('P Resina (mg/dm³)', 'pResina')}
              <input
                type="number"
                step="0.1"
                placeholder="15.0"
                value={formData.pResina}
                onChange={(e) => updateField('pResina', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              {renderLabel('P Mehlich-3 (mg/dm³)', 'pMehlich3')}
              <input
                type="number"
                step="0.1"
                placeholder="14.0"
                value={formData.pMehlich3}
                onChange={(e) => updateField('pMehlich3', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              {renderLabel('P-Rem (mg/L)', 'pRem')}
              <input
                type="number"
                step="0.1"
                placeholder="22.0"
                value={formData.pRem}
                onChange={(e) => updateField('pRem', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              {renderLabel('Rem-3 (mg/L)', 'pRem3')}
              <input
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData.pRem3}
                onChange={(e) => updateField('pRem3', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              {renderLabel('S-SO4 (mg/dm³)', 's')}
              <input
                type="number"
                step="0.1"
                placeholder="6.0"
                value={formData.s}
                onChange={(e) => updateField('s', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>

            {/* Potássio com seletor de unidade */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1 gap-2">
                <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                  <span>{kUnit === 'cmolc' ? 'K (cmolc/dm³)' : 'K (mg/dm³)'}</span>
                  {isAi('k') && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      IA
                    </span>
                  )}
                </label>
                <div className="inline-flex items-center rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 p-0.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => onKUnitChange('cmolc')}
                    className={`px-1.5 py-0.5 rounded-sm font-medium transition-colors cursor-pointer ${
                      kUnit === 'cmolc'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    cmolc
                  </button>
                  <button
                    type="button"
                    onClick={() => onKUnitChange('mg')}
                    className={`px-1.5 py-0.5 rounded-sm font-medium transition-colors cursor-pointer ${
                      kUnit === 'mg'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    mg/dm³
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step={kUnit === 'cmolc' ? '0.01' : '1'}
                  placeholder={kUnit === 'cmolc' ? '0.22' : '86'}
                  value={formData.k}
                  onChange={(e) => updateField('k', e.target.value)}
                  className={INPUT_CLASS}
                />
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 whitespace-nowrap tabular-nums">
                  {kUnit === 'cmolc'
                    ? `${(Number(formData.k || 0) * 391).toFixed(0)} mg/dm³`
                    : `${(Number(formData.k || 0) / 391).toFixed(2)} cmolc`}
                </span>
              </div>
            </div>

            <div>
              {renderLabel('Ca (cmolc/dm³)', 'ca')}
              <input
                type="number"
                step="0.01"
                placeholder="2.80"
                value={formData.ca}
                onChange={(e) => updateField('ca', e.target.value)}
                className={`${INPUT_CLASS} font-semibold`}
              />
            </div>
            <div>
              {renderLabel('Mg (cmolc/dm³)', 'mg')}
              <input
                type="number"
                step="0.01"
                placeholder="0.90"
                value={formData.mg}
                onChange={(e) => updateField('mg', e.target.value)}
                className={`${INPUT_CLASS} font-semibold`}
              />
            </div>
          </div>
        </div>

        {/* Micronutrientes & Granulometria */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              Micronutrientes e Granulometria
            </h4>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500">mg/dm³ · %</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              {renderLabel('Boro (B)', 'b')}
              <input
                type="number"
                step="0.01"
                placeholder="0.35"
                value={formData.b}
                onChange={(e) => updateField('b', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              {renderLabel('Cobre (Cu)', 'cu')}
              <input
                type="number"
                step="0.01"
                placeholder="1.20"
                value={formData.cu}
                onChange={(e) => updateField('cu', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              {renderLabel('Ferro (Fe)', 'fe')}
              <input
                type="number"
                step="0.1"
                placeholder="45.0"
                value={formData.fe}
                onChange={(e) => updateField('fe', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              {renderLabel('Manganês (Mn)', 'mn')}
              <input
                type="number"
                step="0.1"
                placeholder="18.0"
                value={formData.mn}
                onChange={(e) => updateField('mn', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              {renderLabel('Zinco (Zn)', 'zn')}
              <input
                type="number"
                step="0.01"
                placeholder="2.40"
                value={formData.zn}
                onChange={(e) => updateField('zn', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              {renderLabel('Molibdênio (Mo)', 'molibdenio')}
              <input
                type="number"
                step="0.01"
                placeholder="0.10"
                value={formData.molibdenio}
                onChange={(e) => updateField('molibdenio', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-2">
              Fração Física / Granulometria (%)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                {renderLabel('Argila (%)', 'clay')}
                <input
                  type="number"
                  step="0.1"
                  placeholder="38"
                  value={formData.clay}
                  onChange={(e) => updateField('clay', e.target.value)}
                  className={`${INPUT_CLASS} text-right font-semibold`}
                />
              </div>
              <div>
                {renderLabel('Areia (%)', 'sand')}
                <input
                  type="number"
                  step="0.1"
                  placeholder="42"
                  value={formData.sand}
                  onChange={(e) => updateField('sand', e.target.value)}
                  className={`${INPUT_CLASS} text-right`}
                />
              </div>
              <div>
                {renderLabel('Silte (%)', 'silt')}
                <input
                  type="number"
                  step="0.1"
                  placeholder="20"
                  value={formData.silt}
                  onChange={(e) => updateField('silt', e.target.value)}
                  className={`${INPUT_CLASS} text-right`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Elementos Benéficos & Observações */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              Elementos Benéficos e Funcionais (Opcionais)
            </h4>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500">Si · Co · Ni · Se · Na</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div>
              {renderLabel('Si (mg/dm³)', 'si')}
              <input
                type="number"
                step="0.1"
                placeholder="15.0"
                value={formData.si}
                onChange={(e) => updateField('si', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              {renderLabel('Co (mg/dm³)', 'co')}
              <input
                type="number"
                step="0.01"
                placeholder="0.15"
                value={formData.co}
                onChange={(e) => updateField('co', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              {renderLabel('Ni (mg/dm³)', 'ni')}
              <input
                type="number"
                step="0.01"
                placeholder="0.25"
                value={formData.ni}
                onChange={(e) => updateField('ni', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              {renderLabel('Se (mg/dm³)', 'se')}
              <input
                type="number"
                step="0.01"
                placeholder="0.08"
                value={formData.se}
                onChange={(e) => updateField('se', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              {renderLabel('Na (cmolc)', 'na')}
              <input
                type="number"
                step="0.01"
                placeholder="0.03"
                value={formData.na}
                onChange={(e) => updateField('na', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              Observações do Laudo
            </h4>
            {isAi('notes') && (
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                IA
              </span>
            )}
          </div>
          <textarea
            rows={2}
            placeholder="Anotações agronômicas, condições da coleta ou observações laboratoriais..."
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>
      </div>

      {/* BioAS (Bioanálise de Solo Embrapa) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Dna className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                Bioanálise de Solo (BioAS — Embrapa)
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Enzimas bioindicadoras de ciclagem de Enxofre, Carbono e Fósforo.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={formData.hasBioAS}
            onClick={() => updateField('hasBioAS', !formData.hasBioAS)}
            className={`h-8 px-3 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              formData.hasBioAS
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            {formData.hasBioAS ? 'BioAS habilitada' : 'Incluir BioAS'}
          </button>
        </div>

        {formData.hasBioAS && (
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                {renderLabel('Arilsulfatase (mg PNP/kg/h)', 'arylsulfatase')}
                <input
                  type="number"
                  step="0.1"
                  placeholder="280.0"
                  value={formData.arylsulfatase}
                  onChange={(e) => updateField('arylsulfatase', e.target.value)}
                  className={INPUT_CLASS}
                />
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 block">
                  Ciclo S · Ref. Alta: &gt; 350
                </span>
              </div>

              <div>
                {renderLabel('Beta-glicosidase (mg PNP/kg/h)', 'betaGlucosidase')}
                <input
                  type="number"
                  step="0.1"
                  placeholder="145.0"
                  value={formData.betaGlucosidase}
                  onChange={(e) => updateField('betaGlucosidase', e.target.value)}
                  className={INPUT_CLASS}
                />
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 block">
                  Ciclo C · Ref. Alta: &gt; 170
                </span>
              </div>

              <div>
                {renderLabel('Fosfatase Ácida (mg PNP/kg/h)', 'acidPhosphatase')}
                <input
                  type="number"
                  step="0.1"
                  placeholder="580.0"
                  value={formData.acidPhosphatase}
                  onChange={(e) => updateField('acidPhosphatase', e.target.value)}
                  className={INPUT_CLASS}
                />
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 block">
                  Ciclo P · Ref. Alta: &gt; 600
                </span>
              </div>

              <div>
                {renderLabel('IQS Bio Laudo (0 a 1.0)', 'iqsBio')}
                <input
                  type="number"
                  step="0.01"
                  placeholder="Automático"
                  value={formData.iqsBio}
                  onChange={(e) => updateField('iqsBio', e.target.value)}
                  className={INPUT_CLASS}
                />
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 block">
                  Opcional · calculado automaticamente
                </span>
              </div>
            </div>

            {liveIndices.bioasHealthClass && (
              <div className="p-3 rounded-md bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex items-start gap-2.5 text-xs">
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-semibold text-emerald-900 dark:text-emerald-200 tabular-nums">
                    Diagnóstico BioAS: Classe {liveIndices.bioasHealthClass}
                    {liveIndices.iqsBioScore != null
                      ? ` · IQS Bio ${liveIndices.iqsBioScore.toFixed(2)}`
                      : ''}
                  </div>
                  {liveIndices.bioasInterpretation && (
                    <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed">
                      {liveIndices.bioasInterpretation}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Índices Calculados em Tempo Real */}
      <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-200">
          <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Índices Calculados em Tempo Real</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 tabular-nums">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Soma de Bases (SB)</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {(liveIndices.sb ?? 0).toFixed(2)} cmolc
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">CTC Total (T)</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {(liveIndices.ctcTotal ?? 0).toFixed(2)} cmolc
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Sat. Bases (V%)</span>
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {(liveIndices.vPercent ?? 0).toFixed(1)}%
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Sat. Alumínio (m%)</span>
            <span
              className={`text-sm font-semibold ${
                (liveIndices.mPercent ?? 0) > 15
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-900 dark:text-zinc-100'
              }`}
            >
              {(liveIndices.mPercent ?? 0).toFixed(1)}%
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Relação Ca:Mg</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {(liveIndices.caMgRatio ?? 0).toFixed(1)} : 1
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md px-3 py-2">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Relação Ca:K</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {(liveIndices.caKRatio ?? 0).toFixed(1)} : 1
            </span>
          </div>
        </div>
      </div>

      {/* Ações do Formulário */}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-3.5 text-xs font-medium rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer whitespace-nowrap"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="h-9 px-4 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{submitLabel}</span>
        </button>
      </div>
    </form>
  );
};
