import React, { useState } from 'react';
import {
  WaterQualityAnalysis,
  IrrigationDiaryEntry,
  IrrigationSystemRecord,
  WaterQualityRiskLevel,
} from '../../types/irrigation';
import { Droplets, Camera, Plus, Upload, X } from 'lucide-react';
import {
  formatBrDate,
  IRRIGATION_INPUT_CLASS,
  IRRIGATION_LABEL_CLASS,
} from './irrigationUi';

interface Props {
  waterQuality: WaterQualityAnalysis[];
  diary: IrrigationDiaryEntry[];
  systems: IrrigationSystemRecord[];
  onAddWaterQuality: (wq: WaterQualityAnalysis) => void;
  onAddDiaryEntry: (entry: IrrigationDiaryEntry) => void;
}

function classifyEcRisk(ec: number): WaterQualityRiskLevel {
  if (ec < 0.7) return 'Baixo / Excelente';
  if (ec <= 3.0) return 'Moderado';
  return 'Severo / Restritivo';
}

function classifySarRisk(sar: number): WaterQualityRiskLevel {
  if (sar < 3.0) return 'Baixo / Excelente';
  if (sar <= 9.0) return 'Moderado';
  return 'Severo / Restritivo';
}

function riskTextClass(risk: WaterQualityRiskLevel): string {
  if (risk === 'Baixo / Excelente') return 'text-emerald-700 dark:text-emerald-400';
  if (risk === 'Moderado') return 'text-amber-700 dark:text-amber-400';
  return 'text-rose-700 dark:text-rose-400';
}

export const WaterQualityAndDiaryView: React.FC<Props> = ({
  waterQuality,
  diary,
  systems,
  onAddWaterQuality,
  onAddDiaryEntry,
}) => {
  const [activeTab, setActiveTab] = useState<'water' | 'diary'>('water');

  // Water Quality Form
  const [sourceName, setSourceName] = useState('');
  const [ph, setPh] = useState(6.9);
  const [ec, setEc] = useState(0.45);
  const [sar, setSar] = useState(1.4);

  // Diary Form (local optional image upload, no hardcoded external URL)
  const [selectedSystemId, setSelectedSystemId] = useState(systems[0]?.id || '');
  const [diaryType, setDiaryType] = useState<IrrigationDiaryEntry['type']>('Inspeção de Rotina');
  const [description, setDescription] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(undefined);

  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateWaterQuality = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName.trim()) return;

    const newWq: WaterQualityAnalysis = {
      id: `wq-${Date.now()}`,
      waterSourceName: sourceName.trim(),
      date: new Date().toISOString().split('T')[0],
      ph,
      electricalConductivityDsm: ec,
      sarRras: sar,
      sodiumMeql: 0.9,
      chlorideMeql: 0.7,
      bicarbonatesMeql: 1.2,
      carbonatesMeql: 0.0,
      ironPpm: 0.1,
      manganesePpm: 0.01,
      hardnessPpm: 40,
      salinityRiskLevel: classifyEcRisk(ec),
      sodicityRiskLevel: classifySarRisk(sar),
      cloggingRiskLevel: ph > 7.8 ? 'Moderado' : 'Baixo / Excelente',
      notes: 'Análise físico-química para manejo de irrigação.',
    };

    onAddWaterQuality(newWq);
    setSourceName('');
  };

  const handleCreateDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newEntry: IrrigationDiaryEntry = {
      id: `diary-${Date.now()}`,
      systemId: selectedSystemId || systems[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      type: diaryType,
      description: description.trim(),
      photoUrl: photoDataUrl,
      resolved: true,
    };

    onAddDiaryEntry(newEntry);
    setDescription('');
    setPhotoDataUrl(undefined);
  };

  return (
    <div className="space-y-4">
      {/* Sub-Navigation */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2 flex items-center gap-1 self-start">
        <button
          type="button"
          onClick={() => setActiveTab('water')}
          className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'water'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          Qualidade da Água ({waterQuality.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('diary')}
          className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'diary'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          Diário de Campo ({diary.length})
        </button>
      </div>

      {activeTab === 'water' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3.5">
            <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
              <Droplets className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              Cadastrar Análise de Água
            </h4>

            <form onSubmit={handleCreateWaterQuality} className="space-y-3">
              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Fonte / Manancial *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Poço Artesiano 02 ou Represa"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className={IRRIGATION_INPUT_CLASS}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>pH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ph}
                    onChange={(e) => setPh(Number(e.target.value))}
                    className={IRRIGATION_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>CEw (dS/m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ec}
                    onChange={(e) => setEc(Number(e.target.value))}
                    className={IRRIGATION_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>RAS (SAR)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sar}
                    onChange={(e) => setSar(Number(e.target.value))}
                    className={IRRIGATION_INPUT_CLASS}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Salvar Análise
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 space-y-3">
            {waterQuality.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center">
                <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  Nenhuma análise de água cadastrada
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Informe pH, CEw e RAS ao lado para classificar riscos de salinidade, sodicidade e entupimento.
                </p>
              </div>
            ) : (
              waterQuality.map((wq) => (
                <div
                  key={wq.id}
                  className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-zinc-100">
                        {wq.waterSourceName}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                        Coletado em {formatBrDate(wq.date)}
                      </span>
                    </div>
                    <span className={`text-xs font-medium ${riskTextClass(wq.salinityRiskLevel)}`}>
                      Salinidade: {wq.salinityRiskLevel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs tabular-nums">
                    <div className="bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800">
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">pH</span>
                      <strong className="text-slate-900 dark:text-zinc-100">{wq.ph}</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800">
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">CEw</span>
                      <strong className="text-slate-900 dark:text-zinc-100">
                        {wq.electricalConductivityDsm} dS/m
                      </strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800">
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">RAS</span>
                      <strong className="text-slate-900 dark:text-zinc-100">{wq.sarRras}</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800">
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Entupimento</span>
                      <strong className={riskTextClass(wq.cloggingRiskLevel)}>
                        {wq.cloggingRiskLevel}
                      </strong>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'diary' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3.5">
            <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
              <Camera className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              Registrar Ocorrência de Campo
            </h4>

            <form onSubmit={handleCreateDiary} className="space-y-3">
              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Sistema de Irrigação</label>
                <select
                  value={selectedSystemId}
                  onChange={(e) => setSelectedSystemId(e.target.value)}
                  disabled={systems.length === 0}
                  className={IRRIGATION_INPUT_CLASS}
                >
                  {systems.length === 0 ? (
                    <option value="">Geral / Sem sistema vinculado</option>
                  ) : (
                    systems.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.systemName}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Tipo de Ocorrência</label>
                <select
                  value={diaryType}
                  onChange={(e) => setDiaryType(e.target.value as IrrigationDiaryEntry['type'])}
                  className={IRRIGATION_INPUT_CLASS}
                >
                  <option value="Inspeção de Rotina">Inspeção de Rotina</option>
                  <option value="Vazamento">Vazamento na Tubulação</option>
                  <option value="Entupimento de Bico">Entupimento de Bico / Emissor</option>
                  <option value="Manutenção Bomba">Manutenção Motobomba</option>
                  <option value="Troca de Filtro">Troca de Filtro</option>
                  <option value="Teste de Pressão">Teste de Pressão</option>
                </select>
              </div>

              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Descrição do Evento *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva as condições encontradas na inspeção..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Foto da Ocorrência (Opcional)</label>
                {photoDataUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800">
                    <img
                      src={photoDataUrl}
                      alt="Pré-visualização da ocorrência"
                      className="w-full h-28 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoDataUrl(undefined)}
                      aria-label="Remover foto"
                      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-md bg-zinc-900/80 text-white inline-flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="h-8 px-3 rounded-lg border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-600 dark:text-zinc-300 inline-flex items-center justify-center gap-1.5 w-full cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    Anexar imagem local
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFile}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <button
                type="submit"
                className="w-full h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Salvar Ocorrência
              </button>
            </form>
          </div>

          <div className="lg:col-span-8">
            {diary.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center">
                <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  Nenhuma ocorrência registrada no diário
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Registre inspeções, vazamentos, trocas de filtros ou manutenções de campo ao lado.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {diary.map((item) => {
                  const sysName = systems.find((s) => s.id === item.systemId)?.systemName;
                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden p-3.5 space-y-2.5"
                    >
                      {item.photoUrl && (
                        <img
                          src={item.photoUrl}
                          alt={`Ocorrência: ${item.type}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-36 object-cover rounded-lg border border-slate-200 dark:border-zinc-800"
                        />
                      )}
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-semibold text-sky-700 dark:text-sky-400">
                          {item.type}
                        </span>
                        <span className="text-slate-500 dark:text-zinc-400 tabular-nums">
                          {formatBrDate(item.date)}
                        </span>
                      </div>
                      {sysName && (
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                          Sistema: <strong className="text-slate-700 dark:text-zinc-300">{sysName}</strong>
                        </div>
                      )}
                      <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WaterQualityAndDiaryView;
