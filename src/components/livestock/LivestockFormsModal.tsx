import React, { useState } from 'react';
import { Animal, AnimalCategory, AnimalPurpose, Paddock } from '../../types/livestock';
import { X } from 'lucide-react';

interface AddAnimalModalProps {
  paddocks: Paddock[];
  onClose: () => void;
  onSave: (animal: Animal) => Promise<void>;
}

const BREED_OPTIONS = ['Nelore', 'Angus', 'Brangus', 'Senepol', 'Brahman', 'Girolando', 'Holandesa', 'Gir Leiteiro', 'Jersey', 'Tabapuã', 'Mestiço'];
const CATEGORY_OPTIONS: AnimalCategory[] = ['Bezerro(a)', 'Novilha', 'Garrote', 'Vaca', 'Touro', 'Boi Magro', 'Boi Gordo'];

export const AddAnimalModal: React.FC<AddAnimalModalProps> = ({ paddocks, onClose, onSave }) => {
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('Nelore');
  const [sex, setSex] = useState<'M' | 'F'>('F');
  const [category, setCategory] = useState<AnimalCategory>('Novilha');
  const [purpose, setPurpose] = useState<AnimalPurpose>('Corte');
  const [batch, setBatch] = useState('Lote 01');
  const [bloodDegree, setBloodDegree] = useState('PO');
  const [birthDate, setBirthDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentWeight, setCurrentWeight] = useState(350);
  const [paddockId, setPaddockId] = useState(paddocks[0]?.id || 'piquete-01');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!number.trim() || !name.trim()) return;
    setSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const newAnimal: Animal = {
        id: `anim-${Date.now()}`,
        rfid: `840003${Math.floor(100000000 + Math.random() * 900000000)}`,
        name: name.trim(),
        number: number.trim(),
        species: 'Bovina',
        breed,
        sex,
        birthDate,
        category,
        purpose,
        batch: batch.trim() || 'Lote Geral',
        origin: 'Fazenda',
        paddockId,
        bloodDegree: bloodDegree.trim() || 'Comercial',
        birthWeight: 32,
        currentWeight: Number(currentWeight) || 0,
        photos: [],
        weightHistory: [
          {
            id: `w-${Date.now()}`,
            date: today,
            weight: Number(currentWeight) || 0,
            bodyConditionScore: 3.5,
          },
        ],
        healthHistory: [],
        reproHistory: [],
        milkHistory: [],
      };
      await onSave(newAnimal);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500';

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full shadow-lg my-6 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Cadastrar Novo Bovino
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="h-7 w-7 inline-flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                Nº do Brinco *
              </label>
              <input
                type="text"
                required
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Ex: 5020"
                className={`${inputCls} tabular-nums`}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                Nome / Identificação *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Estrela FIV, Boi 5020"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Raça</label>
              <select value={breed} onChange={(e) => setBreed(e.target.value)} className={inputCls}>
                {BREED_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Sexo</label>
              <select value={sex} onChange={(e) => setSex(e.target.value as 'M' | 'F')} className={inputCls}>
                <option value="F">Fêmea</option>
                <option value="M">Macho</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AnimalCategory)}
                className={inputCls}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Aptidão</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as AnimalPurpose)}
                className={inputCls}
              >
                <option value="Corte">Corte</option>
                <option value="Leite">Leite</option>
                <option value="Misto">Misto</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Peso Atual (kg)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(Number(e.target.value))}
                className={`${inputCls} tabular-nums`}
              />
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Data Nascimento</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Lote</label>
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="Ex: Recria 01"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Grau de Sangue</label>
              <input
                type="text"
                value={bloodDegree}
                onChange={(e) => setBloodDegree(e.target.value)}
                placeholder="PO, 1/2, 3/4"
                className={inputCls}
              />
            </div>
          </div>

          {paddocks.length > 0 && (
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Piquete Atual</label>
              <select value={paddockId} onChange={(e) => setPaddockId(e.target.value)} className={inputCls}>
                {paddocks.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.areaHa} ha · {p.forageSpecies})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : 'Salvar Animal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AddPaddockModalProps {
  onClose: () => void;
  onSave: (paddock: Paddock) => Promise<void>;
}

export const AddPaddockModal: React.FC<AddPaddockModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [areaHa, setAreaHa] = useState(20);
  const [forageSpecies, setForageSpecies] = useState('Urochloa brizantha');
  const [cultivar, setCultivar] = useState('Marandu');
  const [currentHeightCm, setCurrentHeightCm] = useState(25);
  const [targetHeightCm, setTargetHeightCm] = useState(30);
  const [currentBiomassKgHa, setCurrentBiomassKgHa] = useState(2800);
  const [stockingRateAU, setStockingRateAU] = useState(1.8);
  const [restDays, setRestDays] = useState(28);
  const [occupationDays, setOccupationDays] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const newPaddock: Paddock = {
        id: `piquete-${Date.now()}`,
        name: name.trim(),
        areaHa: Math.max(0.1, Number(areaHa)),
        forageSpecies: forageSpecies.trim() || 'Brachiaria brizantha',
        cultivar: cultivar.trim() || 'Marandu',
        currentHeightCm: Number(currentHeightCm) || 0,
        targetHeightCm: Number(targetHeightCm) || 30,
        currentBiomassKgHa: Number(currentBiomassKgHa) || 0,
        stockingRateAU: Number(stockingRateAU) || 0,
        restDays: Number(restDays) || 0,
        occupationDays: Number(occupationDays) || 0,
        history: [],
      };
      await onSave(newPaddock);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500';

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full shadow-lg my-6 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Cadastrar Novo Piquete
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="h-7 w-7 inline-flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                Nome / Identificação *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Piquete 04 - Rotacionado"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Área (ha)</label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                value={areaHa}
                onChange={(e) => setAreaHa(Number(e.target.value))}
                className={`${inputCls} tabular-nums`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Espécie Forrageira</label>
              <input
                type="text"
                value={forageSpecies}
                onChange={(e) => setForageSpecies(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Cultivar</label>
              <input
                type="text"
                value={cultivar}
                onChange={(e) => setCultivar(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Altura Atual (cm)</label>
              <input
                type="number"
                value={currentHeightCm}
                onChange={(e) => setCurrentHeightCm(Number(e.target.value))}
                className={`${inputCls} tabular-nums`}
              />
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Altura Meta (cm)</label>
              <input
                type="number"
                value={targetHeightCm}
                onChange={(e) => setTargetHeightCm(Number(e.target.value))}
                className={`${inputCls} tabular-nums`}
              />
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Biomassa (kg/ha)</label>
              <input
                type="number"
                step="100"
                value={currentBiomassKgHa}
                onChange={(e) => setCurrentBiomassKgHa(Number(e.target.value))}
                className={`${inputCls} tabular-nums`}
              />
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Lotação (UA/ha)</label>
              <input
                type="number"
                step="0.1"
                value={stockingRateAU}
                onChange={(e) => setStockingRateAU(Number(e.target.value))}
                className={`${inputCls} tabular-nums`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Dias de Descanso</label>
              <input
                type="number"
                min="0"
                value={restDays}
                onChange={(e) => setRestDays(Number(e.target.value))}
                className={`${inputCls} tabular-nums`}
              />
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Dias de Ocupação</label>
              <input
                type="number"
                min="0"
                value={occupationDays}
                onChange={(e) => setOccupationDays(Number(e.target.value))}
                className={`${inputCls} tabular-nums`}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : 'Salvar Piquete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
