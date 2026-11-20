import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import {
  PestField,
  PestInspection,
  PestManagement,
  PestStage,
  Trap,
  TrapType,
} from '../../types/pests';
import { PEST_SPECIES_CATALOG } from '../../data/pestsData';

export interface MipConfirmDialogState {
  title: string;
  message: string;
  confirmLabel: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
}

const CROP_OPTIONS = ['Soja', 'Milho', 'Algodão', 'Feijão', 'Trigo', 'Café', 'Cana-de-açúcar', 'Pastagem'];

const PHENOLOGY_SUGGESTIONS: Record<string, string[]> = {
  Soja: ['VE', 'V2', 'V4', 'V6', 'R1', 'R2', 'R3', 'R4', 'R5.1', 'R5.5', 'R6', 'R7', 'R8'],
  Milho: ['VE', 'V2', 'V4', 'V6', 'V8', 'V10', 'VT', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6'],
  Algodão: ['VE', 'V2', 'V4', 'B1', 'B3', 'F1', 'C1', 'M1'],
  Feijão: ['V0', 'V2', 'V4', 'R5', 'R6', 'R7', 'R8', 'R9'],
};

const INPUT_CLASS =
  'w-full h-9 px-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500';

const LABEL_CLASS = 'block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1';

interface MipModalsProps {
  showFieldModal: boolean;
  onCloseFieldModal: () => void;
  onCreateField: (field: PestField) => void;

  showInspectionModal: boolean;
  onCloseInspectionModal: () => void;
  activeField: PestField | null;
  defaultPestId?: string;
  onCreateInspection: (inspection: PestInspection) => void;

  showTrapModal: boolean;
  onCloseTrapModal: () => void;
  onCreateTrap: (trap: Trap) => void;

  showManagementModal: boolean;
  onCloseManagementModal: () => void;
  onCreateManagement: (management: PestManagement) => void;

  confirmDialog: MipConfirmDialogState | null;
  onCloseConfirmDialog: () => void;
}

export const MipModals: React.FC<MipModalsProps> = ({
  showFieldModal,
  onCloseFieldModal,
  onCreateField,
  showInspectionModal,
  onCloseInspectionModal,
  activeField,
  defaultPestId,
  onCreateInspection,
  showTrapModal,
  onCloseTrapModal,
  onCreateTrap,
  showManagementModal,
  onCloseManagementModal,
  onCreateManagement,
  confirmDialog,
  onCloseConfirmDialog,
}) => {
  const today = new Date().toISOString().split('T')[0];

  // Field form
  const [farmName, setFarmName] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [crop, setCrop] = useState('Soja');
  const [cultivar, setCultivar] = useState('');
  const [areaHa, setAreaHa] = useState<string>('50');
  const [plantingDate, setPlantingDate] = useState(today);
  const [phenologyStage, setPhenologyStage] = useState('R3');

  // Inspection form
  const [inspDate, setInspDate] = useState(today);
  const [inspPoint, setInspPoint] = useState('P01');
  const [inspResponsible, setInspResponsible] = useState('');
  const [inspPestId, setInspPestId] = useState(defaultPestId || PEST_SPECIES_CATALOG[0]?.id || '');
  const [inspStage, setInspStage] = useState<PestStage>('Adulto');
  const [inspQty, setInspQty] = useState<string>('2');
  const [inspPlants, setInspPlants] = useState<string>('20');
  const [inspInfestation, setInspInfestation] = useState<string>('10');
  const [inspSeverity, setInspSeverity] = useState<'Baixa' | 'Média' | 'Alta'>('Média');
  const [inspNotes, setInspNotes] = useState('');

  // Trap form
  const [trapCode, setTrapCode] = useState('ARM-01');
  const [trapType, setTrapType] = useState<TrapType>('Feromônio');
  const [trapGps, setTrapGps] = useState('');
  const [trapHeight, setTrapHeight] = useState<string>('120');
  const [trapDate, setTrapDate] = useState(today);
  const [trapPestId, setTrapPestId] = useState(PEST_SPECIES_CATALOG[0]?.id || '');
  const [trapCaptured, setTrapCaptured] = useState<string>('0');

  // Management form
  const [mgmtDate, setMgmtDate] = useState(today);
  const [mgmtType, setMgmtType] = useState<PestManagement['type']>('Biológico');
  const [mgmtProduct, setMgmtProduct] = useState('');
  const [mgmtDose, setMgmtDose] = useState('');
  const [mgmtEquipment, setMgmtEquipment] = useState('Pulverizador autopropelido');
  const [mgmtClimate, setMgmtClimate] = useState('T 24°C · UR 68% · Vento 6 km/h');

  useEffect(() => {
    if (showInspectionModal) {
      const nextNum = (activeField?.inspections.length || 0) + 1;
      setInspPoint(`P${String(nextNum).padStart(2, '0')}`);
      if (defaultPestId) setInspPestId(defaultPestId);
    }
  }, [showInspectionModal, activeField?.inspections.length, defaultPestId]);

  useEffect(() => {
    if (showTrapModal) {
      const nextNum = (activeField?.traps.length || 0) + 1;
      setTrapCode(`ARM-${String(nextNum).padStart(2, '0')}`);
    }
  }, [showTrapModal, activeField?.traps.length]);

  const handleFieldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim()) return;
    const newField: PestField = {
      id: `mip-field-${Date.now()}`,
      farmName: farmName.trim() || 'Propriedade Principal',
      fieldName: fieldName.trim(),
      areaHa: Math.max(0.1, Number(areaHa) || 1),
      crop,
      cultivar: cultivar.trim() || 'Não informada',
      plantingDate: plantingDate || today,
      currentPhenologicalStage: phenologyStage.trim() || 'V4',
      inspections: [],
      traps: [],
      managements: [],
    };
    onCreateField(newField);
    setFieldName('');
    setCultivar('');
    onCloseFieldModal();
  };

  const handleInspectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeField || !inspPestId) return;
    const qty = Math.max(0, Number(inspQty) || 0);
    const plants = Math.max(1, Number(inspPlants) || 1);
    const pct = Math.min(100, Math.max(0, Number(inspInfestation) || 0));

    const record: PestInspection = {
      id: `mip-insp-${Date.now()}`,
      date: inspDate || today,
      fieldId: activeField.id,
      pointCode: inspPoint.trim() || 'P01',
      responsible: inspResponsible.trim() || 'Técnico de Campo',
      pestId: inspPestId,
      stage: inspStage,
      quantityObserved: qty,
      plantsEvaluated: plants,
      infestationPercentage: pct,
      severity: inspSeverity,
      notes: inspNotes.trim(),
      photos: [],
    };
    onCreateInspection(record);
    setInspNotes('');
    onCloseInspectionModal();
  };

  const handleTrapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeField || !trapCode.trim()) return;
    const record: Trap = {
      id: `mip-trap-${Date.now()}`,
      code: trapCode.trim(),
      fieldId: activeField.id,
      type: trapType,
      gpsLocation: trapGps.trim() || 'Bordadura Norte',
      heightCm: Math.max(0, Number(trapHeight) || 100),
      installationDate: trapDate || today,
      lastReplacementDate: trapDate || today,
      targetPestId: trapPestId || undefined,
      totalCaptured: Math.max(0, Number(trapCaptured) || 0),
    };
    onCreateTrap(record);
    setTrapGps('');
    setTrapCaptured('0');
    onCloseTrapModal();
  };

  const handleManagementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeField || !mgmtProduct.trim()) return;
    const record: PestManagement = {
      id: `mip-mgmt-${Date.now()}`,
      date: mgmtDate || today,
      fieldId: activeField.id,
      type: mgmtType,
      product: mgmtProduct.trim(),
      dose: mgmtDose.trim() || 'Conforme bula',
      equipment: mgmtEquipment.trim() || 'Pulverizador',
      climateConditions: mgmtClimate.trim() || 'Condições adequadas',
    };
    onCreateManagement(record);
    setMgmtProduct('');
    setMgmtDose('');
    onCloseManagementModal();
  };

  const stageSuggestions = PHENOLOGY_SUGGESTIONS[crop] || ['VE', 'V4', 'R1', 'R3', 'R5'];

  return (
    <>
      {/* Modal: Novo Talhão */}
      {showFieldModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mip-modal-field-title"
        >
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 id="mip-modal-field-title" className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Cadastrar talhão monitorado
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Defina cultura e estágio fenológico para ativar o radar de risco.
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseFieldModal}
                aria-label="Fechar"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFieldSubmit} className="p-5 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Fazenda / Propriedade</label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="Ex: Fazenda Boa Vista"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Nome do talhão *</label>
                  <input
                    type="text"
                    required
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder="Ex: Talhão 04 - Pivô Sul"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Cultura</label>
                  <select
                    value={crop}
                    onChange={(e) => {
                      const nextCrop = e.target.value;
                      setCrop(nextCrop);
                      const firstStage = PHENOLOGY_SUGGESTIONS[nextCrop]?.[0];
                      if (firstStage) setPhenologyStage(firstStage);
                    }}
                    className={INPUT_CLASS}
                  >
                    {CROP_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Área (ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={areaHa}
                    onChange={(e) => setAreaHa(e.target.value)}
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Data de plantio</label>
                  <input
                    type="date"
                    value={plantingDate}
                    onChange={(e) => setPlantingDate(e.target.value)}
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Cultivar / Híbrido</label>
                  <input
                    type="text"
                    value={cultivar}
                    onChange={(e) => setCultivar(e.target.value)}
                    placeholder="Ex: M6410 IPRO"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Estádio fenológico atual</label>
                  <input
                    type="text"
                    list="mip-stage-suggestions"
                    value={phenologyStage}
                    onChange={(e) => setPhenologyStage(e.target.value)}
                    placeholder="Ex: R3, V6, B1"
                    className={INPUT_CLASS}
                  />
                  <datalist id="mip-stage-suggestions">
                    {stageSuggestions.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseFieldModal}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer whitespace-nowrap"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer whitespace-nowrap"
                >
                  Salvar talhão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nova Inspeção */}
      {showInspectionModal && activeField && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mip-modal-insp-title"
        >
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 id="mip-modal-insp-title" className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Registrar inspeção de campo
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {activeField.farmName} · {activeField.fieldName} ({activeField.crop} · {activeField.currentPhenologicalStage})
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseInspectionModal}
                aria-label="Fechar"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInspectionSubmit} className="p-5 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Data</label>
                  <input
                    type="date"
                    required
                    value={inspDate}
                    onChange={(e) => setInspDate(e.target.value)}
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Ponto amostral</label>
                  <input
                    type="text"
                    required
                    value={inspPoint}
                    onChange={(e) => setInspPoint(e.target.value)}
                    placeholder="P01"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Responsável</label>
                  <input
                    type="text"
                    value={inspResponsible}
                    onChange={(e) => setInspResponsible(e.target.value)}
                    placeholder="Ex: Eng. João"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Espécie observada</label>
                  <select
                    value={inspPestId}
                    onChange={(e) => setInspPestId(e.target.value)}
                    className={INPUT_CLASS}
                  >
                    {PEST_SPECIES_CATALOG.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.commonName} ({p.scientificName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Estágio da praga</label>
                  <select
                    value={inspStage}
                    onChange={(e) => setInspStage(e.target.value as PestStage)}
                    className={INPUT_CLASS}
                  >
                    {(['Ovo', 'Ninfa', 'Larva', 'Pupa', 'Adulto'] as PestStage[]).map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Qtd. observada</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={inspQty}
                    onChange={(e) => {
                      setInspQty(e.target.value);
                      const q = Number(e.target.value);
                      const pl = Number(inspPlants);
                      if (!isNaN(q) && !isNaN(pl) && pl > 0) {
                        const calc = Math.min(100, Math.round((q / pl) * 100));
                        setInspInfestation(String(calc));
                        setInspSeverity(calc >= 20 ? 'Alta' : calc >= 10 ? 'Média' : 'Baixa');
                      }
                    }}
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Plantas / panos</label>
                  <input
                    type="number"
                    min="1"
                    value={inspPlants}
                    onChange={(e) => setInspPlants(e.target.value)}
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Infestação (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={inspInfestation}
                    onChange={(e) => setInspInfestation(e.target.value)}
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Severidade</label>
                  <select
                    value={inspSeverity}
                    onChange={(e) => setInspSeverity(e.target.value as 'Baixa' | 'Média' | 'Alta')}
                    className={INPUT_CLASS}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={LABEL_CLASS}>Observações de campo</label>
                <textarea
                  rows={2}
                  value={inspNotes}
                  onChange={(e) => setInspNotes(e.target.value)}
                  placeholder="Ex: Reboleira na bordadura leste, presença de ovos e ninfas no terço médio..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseInspectionModal}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer whitespace-nowrap"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer whitespace-nowrap"
                >
                  Salvar inspeção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nova Armadilha */}
      {showTrapModal && activeField && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mip-modal-trap-title"
        >
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 id="mip-modal-trap-title" className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Cadastrar armadilha de monitoramento
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {activeField.farmName} · {activeField.fieldName}
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseTrapModal}
                aria-label="Fechar"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTrapSubmit} className="p-5 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Código *</label>
                  <input
                    type="text"
                    required
                    value={trapCode}
                    onChange={(e) => setTrapCode(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Tipo</label>
                  <select
                    value={trapType}
                    onChange={(e) => setTrapType(e.target.value as TrapType)}
                    className={INPUT_CLASS}
                  >
                    {(['Feromônio', 'Adesiva', 'Cromática', 'Luminosa', 'Alimentar'] as TrapType[]).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Instalação</label>
                  <input
                    type="date"
                    value={trapDate}
                    onChange={(e) => setTrapDate(e.target.value)}
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Praga-alvo</label>
                  <select
                    value={trapPestId}
                    onChange={(e) => setTrapPestId(e.target.value)}
                    className={INPUT_CLASS}
                  >
                    {PEST_SPECIES_CATALOG.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.commonName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Localização / GPS</label>
                  <input
                    type="text"
                    value={trapGps}
                    onChange={(e) => setTrapGps(e.target.value)}
                    placeholder="Ex: -13.0582, -55.9041 ou Bordadura Sul"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Altura (cm)</label>
                  <input
                    type="number"
                    min="0"
                    value={trapHeight}
                    onChange={(e) => setTrapHeight(e.target.value)}
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Capturas registradas</label>
                  <input
                    type="number"
                    min="0"
                    value={trapCaptured}
                    onChange={(e) => setTrapCaptured(e.target.value)}
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseTrapModal}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer whitespace-nowrap"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer whitespace-nowrap"
                >
                  Salvar armadilha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Novo Manejo */}
      {showManagementModal && activeField && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mip-modal-mgmt-title"
        >
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 id="mip-modal-mgmt-title" className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Registrar aplicação ou manejo MIP
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {activeField.farmName} · {activeField.fieldName}
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseManagementModal}
                aria-label="Fechar"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManagementSubmit} className="p-5 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Data da ação</label>
                  <input
                    type="date"
                    required
                    value={mgmtDate}
                    onChange={(e) => setMgmtDate(e.target.value)}
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Tipo de controle</label>
                  <select
                    value={mgmtType}
                    onChange={(e) => setMgmtType(e.target.value as PestManagement['type'])}
                    className={INPUT_CLASS}
                  >
                    <option value="Biológico">Biológico</option>
                    <option value="Químico">Químico</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Mecânico">Mecânico</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS}>Produto / Agente biológico *</label>
                  <input
                    type="text"
                    required
                    value={mgmtProduct}
                    onChange={(e) => setMgmtProduct(e.target.value)}
                    placeholder="Ex: Telenomus podisi ou Clorantraniliprole"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Dose / Taxa</label>
                  <input
                    type="text"
                    value={mgmtDose}
                    onChange={(e) => setMgmtDose(e.target.value)}
                    placeholder="Ex: 150 mL/ha"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Equipamento / Método</label>
                  <input
                    type="text"
                    value={mgmtEquipment}
                    onChange={(e) => setMgmtEquipment(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Condições climáticas</label>
                  <input
                    type="text"
                    value={mgmtClimate}
                    onChange={(e) => setMgmtClimate(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseManagementModal}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer whitespace-nowrap"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer whitespace-nowrap"
                >
                  Salvar manejo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmação */}
      {confirmDialog && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  confirmDialog.variant === 'danger'
                    ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  {confirmDialog.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={onCloseConfirmDialog}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                  onCloseConfirmDialog();
                }}
                className={`h-8 px-3.5 rounded-lg text-xs font-medium text-white cursor-pointer whitespace-nowrap ${
                  confirmDialog.variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
