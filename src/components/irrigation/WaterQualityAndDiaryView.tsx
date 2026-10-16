import React, { useState } from 'react';
import { WaterQualityAnalysis, IrrigationDiaryEntry, IrrigationSystemRecord } from '../../types/irrigation';
import { Droplets, ShieldAlert, Camera, Plus, CheckCircle2, AlertTriangle, FileText, Wrench } from 'lucide-react';

interface Props {
  waterQuality: WaterQualityAnalysis[];
  diary: IrrigationDiaryEntry[];
  systems: IrrigationSystemRecord[];
  onAddWaterQuality: (wq: WaterQualityAnalysis) => void;
  onAddDiaryEntry: (entry: IrrigationDiaryEntry) => void;
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
  const [sourceName, setSourceName] = useState('Poço Artesiano Profundo 02');
  const [ph, setPh] = useState(6.9);
  const [ec, setEc] = useState(0.45);
  const [sar, setSar] = useState(1.4);

  // Diary Form
  const [selectedSystemId, setSelectedSystemId] = useState(systems[0]?.id || '');
  const [diaryType, setDiaryType] = useState<IrrigationDiaryEntry['type']>('Inspeção de Rotina');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=400&q=80');

  const handleCreateWaterQuality = (e: React.FormEvent) => {
    e.preventDefault();
    const newWq: WaterQualityAnalysis = {
      id: `wq-${Date.now()}`,
      waterSourceName: sourceName,
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
      salinityRiskLevel: ec < 0.7 ? 'Baixo / Excelente' : 'Moderado',
      sodicityRiskLevel: sar < 3.0 ? 'Baixo / Excelente' : 'Moderado',
      cloggingRiskLevel: 'Baixo / Excelente',
      notes: 'Análise físico-química padrão.',
    };

    onAddWaterQuality(newWq);
  };

  const handleCreateDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;

    const newEntry: IrrigationDiaryEntry = {
      id: `diary-${Date.now()}`,
      systemId: selectedSystemId,
      date: new Date().toISOString().split('T')[0],
      type: diaryType,
      description,
      photoUrl,
      resolved: true,
    };

    onAddDiaryEntry(newEntry);
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navegação */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('water')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'water'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
          }`}
        >
          <Droplets className="w-4 h-4" /> Qualidade da Água de Irrigação ({waterQuality.length})
        </button>

        <button
          onClick={() => setActiveTab('diary')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'diary'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
          }`}
        >
          <Camera className="w-4 h-4" /> Diário de Campo & Foto-Ocorrências ({diary.length})
        </button>
      </div>

      {activeTab === 'water' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário de Análise de Água */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-600" /> Cadastrar Análise de Água
            </h4>

            <form onSubmit={handleCreateWaterQuality} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Fonte / Manancial</label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={e => setSourceName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">pH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ph}
                    onChange={e => setPh(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">CEw (dS/m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ec}
                    onChange={e => setEc(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">RAS (SAR)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sar}
                    onChange={e => setSar(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Salvar Análise de Água
              </button>
            </form>
          </div>

          {/* Cards de Análises Salvas */}
          <div className="lg:col-span-2 space-y-4">
            {waterQuality.map(wq => (
              <div
                key={wq.id}
                className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">{wq.waterSourceName}</h4>
                    <span className="text-xs text-slate-400">Coletado em {new Date(wq.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl text-xs font-bold">
                    Risco de Salinidade: {wq.salinityRiskLevel}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 font-bold block">pH da Água</span>
                    <strong className="text-slate-900 dark:text-white text-sm">{wq.ph}</strong>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 font-bold block">Condutividade CEw</span>
                    <strong className="text-slate-900 dark:text-white text-sm">{wq.electricalConductivityDsm} dS/m</strong>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 font-bold block">Razão RAS</span>
                    <strong className="text-slate-900 dark:text-white text-sm">{wq.sarRras}</strong>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 font-bold block">Entupimento</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 text-sm">{wq.cloggingRiskLevel}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'diary' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form de Diário */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-600" /> Registrar Ocorrência com Foto
            </h4>

            <form onSubmit={handleCreateDiary} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Sistema de Irrigação</label>
                <select
                  value={selectedSystemId}
                  onChange={e => setSelectedSystemId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  {systems.map(s => (
                    <option key={s.id} value={s.id}>{s.systemName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Tipo de Ocorrência</label>
                <select
                  value={diaryType}
                  onChange={e => setDiaryType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="Inspeção de Rotina">Inspeção de Rotina</option>
                  <option value="Vazamento">Vazamento na Tubulação</option>
                  <option value="Entupimento de Bico">Entupimento de Bico/Gotejador</option>
                  <option value="Manutenção Bomba">Manutenção do Conjunto Moto-Bomba</option>
                  <option value="Troca de Filtro">Troca de Filtro</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">Descrição do Evento</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva as condições encontradas na inspeção de campo..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Salvar Ocorrência no Diário
              </button>
            </form>
          </div>

          {/* Cards do Diário Fotográfico */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {diary.map(item => (
              <div
                key={item.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs space-y-3 p-4"
              >
                {item.photoUrl && (
                  <img
                    src={item.photoUrl}
                    alt="Foto da ocorrência"
                    className="w-full h-40 object-cover rounded-xl"
                  />
                )}
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-0.5 bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 rounded text-[10px] font-bold uppercase">
                    {item.type}
                  </span>
                  <span className="text-[10px] text-slate-400">{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
