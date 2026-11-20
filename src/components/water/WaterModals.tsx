import React, { useEffect, useState } from 'react';
import { X, Save, MapPin, Crosshair, Info } from 'lucide-react';
import {
  CollectionPoint,
  CollectionPointType,
  WaterAnalysisRecord,
  WaterPurpose,
} from '../../types/waterAnalysis';
import {
  calculateWaterIndices,
  DEFAULT_BLANK_ANALYSIS,
  generateWaterCorrectionPlan,
} from '../../data/waterAnalysisData';
import {
  COLLECTION_POINT_TYPE_LABELS,
  REFERENCE_STANDARD_LABELS,
  WATER_PURPOSE_OPTIONS,
} from './waterConstants';

interface WaterAnalysisModalProps {
  isOpen: boolean;
  editingRecord: WaterAnalysisRecord | null;
  initialPointId?: string;
  collectionPoints: CollectionPoint[];
  onClose: () => void;
  onSave: (record: WaterAnalysisRecord, isEdit: boolean) => void;
}

interface WaterCollectionPointModalProps {
  isOpen: boolean;
  editingPoint: CollectionPoint | null;
  onClose: () => void;
  onSave: (point: CollectionPoint, isEdit: boolean) => void;
}

const INPUT_CLASS =
  'w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 tabular-nums';

const LABEL_CLASS = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const WaterAnalysisModal: React.FC<WaterAnalysisModalProps> = ({
  isOpen,
  editingRecord,
  initialPointId,
  collectionPoints,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'id' | 'phys_chem' | 'bio'>('id');

  const [sampleCode, setSampleCode] = useState('');
  const [collectionDate, setCollectionDate] = useState('');
  const [collectionTime, setCollectionTime] = useState('08:00');
  const [clientName, setClientName] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [technician, setTechnician] = useState('');
  const [creaCrq, setCreaCrq] = useState('');
  const [collectionPointId, setCollectionPointId] = useState('');
  const [referenceStandard, setReferenceStandard] =
    useState<WaterAnalysisRecord['referenceStandard']>('FAO_29');
  const [purposes, setPurposes] = useState<WaterPurpose[]>(['irrigacao']);

  // Physical & Chemical
  const [ph, setPh] = useState('7.0');
  const [ecMicroS, setEcMicroS] = useState('450');
  const [tds, setTds] = useState('290');
  const [turbidity, setTurbidity] = useState('2.5');
  const [waterTemp, setWaterTemp] = useState('24');
  const [bicarbonates, setBicarbonates] = useState('60');
  const [alkalinity, setAlkalinity] = useState('50');
  const [hardness, setHardness] = useState('80');
  const [calcium, setCalcium] = useState('28');
  const [magnesium, setMagnesium] = useState('12');
  const [sodium, setSodium] = useState('18');
  const [chlorides, setChlorides] = useState('22');
  const [sulfates, setSulfates] = useState('15');
  const [nitrate, setNitrate] = useState('4.5');
  const [iron, setIron] = useState('0.1');
  const [manganese, setManganese] = useState('0.03');
  const [boron, setBoron] = useState('0.1');
  const [potassium, setPotassium] = useState('4');
  const [phosphorus, setPhosphorus] = useState('0.2');
  const [dissolvedOxygen, setDissolvedOxygen] = useState('6.8');
  const [bod5, setBod5] = useState('2.0');

  // Biological & Notes
  const [totalColiforms, setTotalColiforms] = useState('0');
  const [ecoli, setEcoli] = useState('0');
  const [algaeDetected, setAlgaeDetected] = useState(false);
  const [salmonellaPresent, setSalmonellaPresent] = useState(false);
  const [technicalNotes, setTechnicalNotes] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('id');
    if (editingRecord) {
      setSampleCode(editingRecord.sampleCode);
      setCollectionDate(editingRecord.collectionDate);
      setCollectionTime(editingRecord.collectionTime || '08:00');
      setClientName(editingRecord.clientName);
      setPropertyName(editingRecord.propertyName);
      setTechnician(editingRecord.responsibleTechnician);
      setCreaCrq(editingRecord.creaCrq);
      setCollectionPointId(editingRecord.collectionPointId);
      setReferenceStandard(editingRecord.referenceStandard);
      setPurposes(editingRecord.purposes.length > 0 ? editingRecord.purposes : ['irrigacao']);

      setPh(String(editingRecord.chemical.ph));
      setEcMicroS(String(editingRecord.physical.electricalConductivityMicroS));
      setTds(String(editingRecord.physical.totalDissolvedSolidsMgL));
      setTurbidity(String(editingRecord.physical.turbidityNtu));
      setWaterTemp(String(editingRecord.physical.waterTempCelsius));
      setBicarbonates(String(editingRecord.chemical.bicarbonatesHco3MgL));
      setAlkalinity(String(editingRecord.chemical.totalAlkalinityMgCaCO3));
      setHardness(String(editingRecord.chemical.totalHardnessMgCaCO3));
      setCalcium(String(editingRecord.chemical.calciumCaMgL));
      setMagnesium(String(editingRecord.chemical.magnesiumMgL));
      setSodium(String(editingRecord.chemical.sodiumNaMgL));
      setChlorides(String(editingRecord.chemical.chloridesClMgL));
      setSulfates(String(editingRecord.chemical.sulfatesSo4MgL));
      setNitrate(String(editingRecord.chemical.nitrateNo3MgL));
      setIron(String(editingRecord.chemical.ironFeMgL));
      setManganese(String(editingRecord.chemical.manganeseMnMgL));
      setBoron(String(editingRecord.chemical.boronBMgL));
      setPotassium(String(editingRecord.chemical.potassiumKMgL));
      setPhosphorus(String(editingRecord.chemical.phosphorusPMgL));
      setDissolvedOxygen(String(editingRecord.chemical.dissolvedOxygenMgL));
      setBod5(String(editingRecord.chemical.bod5MgL));

      setTotalColiforms(String(editingRecord.biological.totalColiformsNmp100ml));
      setEcoli(String(editingRecord.biological.escherichiaColiNmp100ml));
      setAlgaeDetected(editingRecord.biological.algaeDetected);
      setSalmonellaPresent(editingRecord.biological.salmonellaPresent);
      setTechnicalNotes(editingRecord.technicalNotes);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const randomNum = Math.floor(100 + Math.random() * 900);
      setSampleCode(`AG-${new Date().getFullYear()}-${randomNum}`);
      setCollectionDate(today);
      setCollectionTime('08:30');
      setClientName('');
      const defaultPoint =
        collectionPoints.find((p) => p.id === initialPointId) ?? collectionPoints[0];
      setPropertyName(defaultPoint?.propertyName || '');
      setTechnician('');
      setCreaCrq('');
      setCollectionPointId(defaultPoint?.id || '');
      setReferenceStandard('FAO_29');
      setPurposes(['irrigacao']);

      setPh('7.0');
      setEcMicroS('450');
      setTds('288');
      setTurbidity('2.0');
      setWaterTemp('24');
      setBicarbonates('65');
      setAlkalinity('55');
      setHardness('80');
      setCalcium('25');
      setMagnesium('10');
      setSodium('18');
      setChlorides('22');
      setSulfates('15');
      setNitrate('4.5');
      setIron('0.1');
      setManganese('0.03');
      setBoron('0.1');
      setPotassium('4');
      setPhosphorus('0.2');
      setDissolvedOxygen('6.8');
      setBod5('2.0');

      setTotalColiforms('0');
      setEcoli('0');
      setAlgaeDetected(false);
      setSalmonellaPresent(false);
      setTechnicalNotes('');
    }
  }, [isOpen, editingRecord, initialPointId, collectionPoints]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const togglePurpose = (purpose: WaterPurpose) => {
    setPurposes((prev) =>
      prev.includes(purpose) ? prev.filter((p) => p !== purpose) : [...prev, purpose]
    );
  };

  const num = (val: string, fallback = 0) => {
    const parsed = parseFloat(val.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ecVal = num(ecMicroS, 450);
    const tdsVal = num(tds, Math.round(ecVal * 0.64));
    const nitrateVal = num(nitrate, 0);

    const base = editingRecord ?? DEFAULT_BLANK_ANALYSIS;

    const physical = {
      ...base.physical,
      waterTempCelsius: num(waterTemp, 24),
      turbidityNtu: num(turbidity, 0),
      electricalConductivityMicroS: ecVal,
      totalDissolvedSolidsMgL: tdsVal,
      salinityPpt: Math.round((ecVal / 1000) * 0.64 * 100) / 100,
    };

    const chemical = {
      ...base.chemical,
      ph: num(ph, 7.0),
      totalAlkalinityMgCaCO3: num(alkalinity, 50),
      totalHardnessMgCaCO3: num(hardness, 80),
      bicarbonatesHco3MgL: num(bicarbonates, 60),
      chloridesClMgL: num(chlorides, 20),
      sulfatesSo4MgL: num(sulfates, 15),
      nitrateNo3MgL: nitrateVal,
      totalNitrogenMgL: Math.round(nitrateVal * 0.226 * 100) / 100,
      phosphorusPMgL: num(phosphorus, 0),
      potassiumKMgL: num(potassium, 0),
      calciumCaMgL: num(calcium, 25),
      magnesiumMgL: num(magnesium, 10),
      sodiumNaMgL: num(sodium, 15),
      ironFeMgL: num(iron, 0.1),
      manganeseMnMgL: num(manganese, 0.03),
      boronBMgL: num(boron, 0.1),
      dissolvedOxygenMgL: num(dissolvedOxygen, 6.5),
      bod5MgL: num(bod5, 2.0),
    };

    const biological = {
      ...base.biological,
      totalColiformsNmp100ml: num(totalColiforms, 0),
      escherichiaColiNmp100ml: num(ecoli, 0),
      algaeDetected,
      salmonellaPresent,
    };

    const calculated = calculateWaterIndices(chemical, physical, biological);
    const correctionPlan = generateWaterCorrectionPlan(chemical, physical, biological, calculated);

    const record: WaterAnalysisRecord = {
      ...base,
      id: editingRecord ? editingRecord.id : `water-${Date.now()}`,
      sampleCode: sampleCode.trim() || `AG-${Date.now().toString().slice(-4)}`,
      collectionDate: collectionDate || new Date().toISOString().split('T')[0],
      collectionTime: collectionTime || '08:00',
      clientName: clientName.trim() || 'Produtor Rural',
      propertyName: propertyName.trim() || 'Propriedade Principal',
      responsibleTechnician: technician.trim() || 'Eng. Agrônomo Responsável',
      creaCrq: creaCrq.trim(),
      collectionPointId: collectionPointId || collectionPoints[0]?.id || '',
      purposes: purposes.length > 0 ? purposes : ['irrigacao'],
      referenceStandard,
      physical,
      chemical,
      biological,
      calculated,
      correctionPlan,
      technicalNotes: technicalNotes.trim(),
      status: 'concluido',
    };

    onSave(record, Boolean(editingRecord));
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={editingRecord ? 'Editar Análise de Água' : 'Nova Análise de Água'}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {editingRecord ? 'Editar Análise de Água' : 'Nova Análise de Água'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Os índices IGA, RAS, Langelier, CONAMA 357 e FAO 29 são recalculados automaticamente.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="h-7 w-7 rounded-md text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-center gap-1 overflow-x-auto">
          {(
            [
              { id: 'id', label: '1. Identificação e Local' },
              { id: 'phys_chem', label: '2. Físico-Química' },
              { id: 'bio', label: '3. Biológico e Notas' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`h-7 px-3 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === t.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-zinc-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'id' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Código da Amostra *</label>
                  <input
                    type="text"
                    required
                    value={sampleCode}
                    onChange={(e) => setSampleCode(e.target.value)}
                    placeholder="AG-2025-001"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Data da Coleta *</label>
                  <input
                    type="date"
                    required
                    value={collectionDate}
                    onChange={(e) => setCollectionDate(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Hora da Coleta</label>
                  <input
                    type="time"
                    value={collectionTime}
                    onChange={(e) => setCollectionTime(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Ponto de Coleta / Manancial</label>
                  <select
                    value={collectionPointId}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      setCollectionPointId(nextId);
                      const matched = collectionPoints.find((p) => p.id === nextId);
                      if (matched && !propertyName) {
                        setPropertyName(matched.propertyName);
                      }
                    }}
                    className={INPUT_CLASS}
                  >
                    <option value="">Selecionar ponto cadastrado...</option>
                    {collectionPoints.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.code} — {pt.name} ({COLLECTION_POINT_TYPE_LABELS[pt.type]})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Norma de Referência</label>
                  <select
                    value={referenceStandard}
                    onChange={(e) =>
                      setReferenceStandard(
                        e.target.value as WaterAnalysisRecord['referenceStandard']
                      )
                    }
                    className={INPUT_CLASS}
                  >
                    {(
                      Object.keys(REFERENCE_STANDARD_LABELS) as Array<
                        WaterAnalysisRecord['referenceStandard']
                      >
                    ).map((key) => (
                      <option key={key} value={key}>
                        {REFERENCE_STANDARD_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Cliente / Produtor</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Nome do produtor ou empresa"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Propriedade / Fazenda</label>
                  <input
                    type="text"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    placeholder="Ex: Fazenda Boa Vista"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Responsável Técnico</label>
                  <input
                    type="text"
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    placeholder="Eng. Agrônomo / Químico"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>CREA / CRQ</label>
                  <input
                    type="text"
                    value={creaCrq}
                    onChange={(e) => setCreaCrq(e.target.value)}
                    placeholder="Registro profissional"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div>
                <label className={LABEL_CLASS}>Finalidades da Água</label>
                <div className="flex flex-wrap gap-1.5">
                  {WATER_PURPOSE_OPTIONS.map((opt) => {
                    const checked = purposes.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => togglePurpose(opt.value)}
                        className={`h-7 px-2.5 rounded-md border text-[11px] font-medium transition-colors cursor-pointer ${
                          checked
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'phys_chem' && (
            <div className="space-y-3.5">
              <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-2.5 flex items-start gap-2 text-[11px] text-slate-600 dark:text-zinc-400">
                <Info className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <span>
                  Informe a Condutividade Elétrica em <strong>µS/cm</strong> (1 dS/m = 1.000 µS/cm).
                  Cálcio, Magnésio, Sódio e Bicarbonatos determinam automaticamente RAS e Langelier.
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className={LABEL_CLASS}>pH</label>
                  <input type="number" step="0.01" value={ph} onChange={(e) => setPh(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>CE (µS/cm)</label>
                  <input type="number" step="1" value={ecMicroS} onChange={(e) => setEcMicroS(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>TDS (mg/L)</label>
                  <input type="number" step="1" value={tds} onChange={(e) => setTds(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Turbidez (NTU)</label>
                  <input type="number" step="0.1" value={turbidity} onChange={(e) => setTurbidity(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Temperatura (°C)</label>
                  <input type="number" step="0.5" value={waterTemp} onChange={(e) => setWaterTemp(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Bicarbonatos HCO₃⁻ (mg/L)</label>
                  <input type="number" step="1" value={bicarbonates} onChange={(e) => setBicarbonates(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Alcalinidade (mg CaCO₃/L)</label>
                  <input type="number" step="1" value={alkalinity} onChange={(e) => setAlkalinity(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Dureza Total (mg CaCO₃/L)</label>
                  <input type="number" step="1" value={hardness} onChange={(e) => setHardness(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Cálcio Ca²⁺ (mg/L)</label>
                  <input type="number" step="0.1" value={calcium} onChange={(e) => setCalcium(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Magnésio Mg²⁺ (mg/L)</label>
                  <input type="number" step="0.1" value={magnesium} onChange={(e) => setMagnesium(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Sódio Na⁺ (mg/L)</label>
                  <input type="number" step="0.1" value={sodium} onChange={(e) => setSodium(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Cloretos Cl⁻ (mg/L)</label>
                  <input type="number" step="0.1" value={chlorides} onChange={(e) => setChlorides(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Sulfatos SO₄²⁻ (mg/L)</label>
                  <input type="number" step="0.1" value={sulfates} onChange={(e) => setSulfates(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Nitrato NO₃⁻ (mg/L)</label>
                  <input type="number" step="0.1" value={nitrate} onChange={(e) => setNitrate(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Ferro Fe (mg/L)</label>
                  <input type="number" step="0.01" value={iron} onChange={(e) => setIron(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Manganês Mn (mg/L)</label>
                  <input type="number" step="0.01" value={manganese} onChange={(e) => setManganese(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Boro B (mg/L)</label>
                  <input type="number" step="0.01" value={boron} onChange={(e) => setBoron(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Potássio K (mg/L)</label>
                  <input type="number" step="0.1" value={potassium} onChange={(e) => setPotassium(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Fósforo P (mg/L)</label>
                  <input type="number" step="0.01" value={phosphorus} onChange={(e) => setPhosphorus(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Oxigênio Dissolvido (mg/L)</label>
                  <input type="number" step="0.1" value={dissolvedOxygen} onChange={(e) => setDissolvedOxygen(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>DBO₅ (mg/L)</label>
                  <input type="number" step="0.1" value={bod5} onChange={(e) => setBod5(e.target.value)} className={INPUT_CLASS} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bio' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Coliformes Totais (NMP/100mL)</label>
                  <input
                    type="number"
                    min="0"
                    value={totalColiforms}
                    onChange={(e) => setTotalColiforms(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Escherichia coli (NMP/100mL)</label>
                  <input
                    type="number"
                    min="0"
                    value={ecoli}
                    onChange={(e) => setEcoli(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={algaeDetected}
                    onChange={(e) => setAlgaeDetected(e.target.checked)}
                    className="rounded border-slate-300 dark:border-zinc-700 accent-emerald-600"
                  />
                  Presença de algas / biofilme no manancial
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={salmonellaPresent}
                    onChange={(e) => setSalmonellaPresent(e.target.checked)}
                    className="rounded border-slate-300 dark:border-zinc-700 accent-emerald-600"
                  />
                  Presença de Salmonella spp.
                </label>
              </div>

              <div>
                <label className={LABEL_CLASS}>Observações e Parecer Técnico</label>
                <textarea
                  rows={4}
                  value={technicalNotes}
                  onChange={(e) => setTechnicalNotes(e.target.value)}
                  placeholder="Condições da coleta, aspecto visual, recomendações de manejo..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {editingRecord ? 'Salvar Alterações' : 'Salvar Análise'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const WaterCollectionPointModal: React.FC<WaterCollectionPointModalProps> = ({
  isOpen,
  editingPoint,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<CollectionPointType>('poco_artesiano');
  const [propertyName, setPropertyName] = useState('');
  const [latitude, setLatitude] = useState('0');
  const [longitude, setLongitude] = useState('0');
  const [altitudeMeters, setAltitudeMeters] = useState('0');
  const [notes, setNotes] = useState('');
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setGpsStatus(null);
    if (editingPoint) {
      setName(editingPoint.name);
      setCode(editingPoint.code);
      setType(editingPoint.type);
      setPropertyName(editingPoint.propertyName);
      setLatitude(String(editingPoint.latitude));
      setLongitude(String(editingPoint.longitude));
      setAltitudeMeters(String(editingPoint.altitudeMeters));
      setNotes(editingPoint.notes ?? '');
    } else {
      setName('');
      setCode(`PT-${Math.floor(100 + Math.random() * 900)}`);
      setType('poco_artesiano');
      setPropertyName('');
      setLatitude('0');
      setLongitude('0');
      setAltitudeMeters('0');
      setNotes('');
    }
  }, [isOpen, editingPoint]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocalização não suportada neste navegador.');
      return;
    }
    setGpsStatus('Obtendo coordenadas...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        if (pos.coords.altitude !== null) {
          setAltitudeMeters(String(Math.round(pos.coords.altitude)));
        }
        setGpsStatus('Coordenadas capturadas.');
      },
      () => {
        setGpsStatus('Não foi possível obter a localização atual.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const point: CollectionPoint = {
      id: editingPoint ? editingPoint.id : `pt-${Date.now()}`,
      name: name.trim() || 'Ponto de Coleta',
      code: code.trim() || `PT-${Date.now().toString().slice(-3)}`,
      type,
      propertyName: propertyName.trim() || 'Propriedade Principal',
      latitude: parseFloat(latitude.replace(',', '.')) || 0,
      longitude: parseFloat(longitude.replace(',', '.')) || 0,
      altitudeMeters: parseFloat(altitudeMeters.replace(',', '.')) || 0,
      notes: notes.trim() || undefined,
    };
    onSave(point, Boolean(editingPoint));
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={editingPoint ? 'Editar Ponto de Coleta' : 'Novo Ponto de Coleta'}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col"
      >
        <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {editingPoint ? 'Editar Ponto de Coleta' : 'Novo Ponto de Coleta'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="h-7 w-7 rounded-md text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS}>Nome do Manancial *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Poço Artesiano Pivô 02"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Código *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="PT-001"
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Tipo de Manancial</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CollectionPointType)}
                className={INPUT_CLASS}
              >
                {(Object.keys(COLLECTION_POINT_TYPE_LABELS) as CollectionPointType[]).map((key) => (
                  <option key={key} value={key}>
                    {COLLECTION_POINT_TYPE_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Propriedade / Fazenda</label>
              <input
                type="text"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                placeholder="Nome da propriedade"
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                Coordenadas Geográficas (GPS)
              </span>
              <button
                type="button"
                onClick={handleCaptureGps}
                className="h-6 px-2 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1 cursor-pointer"
              >
                <Crosshair className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Capturar GPS
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={LABEL_CLASS}>Latitude</label>
                <input type="number" step="0.000001" value={latitude} onChange={(e) => setLatitude(e.target.value)} className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Longitude</label>
                <input type="number" step="0.000001" value={longitude} onChange={(e) => setLongitude(e.target.value)} className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Altitude (m)</label>
                <input type="number" step="1" value={altitudeMeters} onChange={(e) => setAltitudeMeters(e.target.value)} className={INPUT_CLASS} />
              </div>
            </div>
            {gpsStatus && (
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">{gpsStatus}</p>
            )}
          </div>

          <div>
            <label className={LABEL_CLASS}>Observações</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Profundidade, vazão estimada, sistema de bombeamento..."
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="px-4 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {editingPoint ? 'Salvar Ponto' : 'Cadastrar Ponto'}
          </button>
        </div>
      </form>
    </div>
  );
};
