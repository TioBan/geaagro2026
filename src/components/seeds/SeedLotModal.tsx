import React, { useState, useEffect } from 'react';
import { X, Sprout, AlertTriangle } from 'lucide-react';
import { SeedClass } from '../../types/seedAnalysis';
import { SEED_SPECIES_RAS_CATALOG, NewSeedLotInput } from '../../data/seedAnalysisData';

interface SeedLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: NewSeedLotInput) => void;
}

const SEED_CLASSES: SeedClass[] = ['Genética', 'Básica', 'C1', 'C2', 'S1', 'S2'];

export const SeedLotModal: React.FC<SeedLotModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [lotNumber, setLotNumber] = useState('');
  const [speciesId, setSpeciesId] = useState('soja');
  const [cultivar, setCultivar] = useState('');
  const [seedClass, setSeedClass] = useState<SeedClass>('C1');
  const [cropSeason, setCropSeason] = useState('2025/2026');
  const [client, setClient] = useState('');
  const [farm, setFarm] = useState('');
  const [technicalResponsible, setTechnicalResponsible] = useState('');
  const [totalWeightKg, setTotalWeightKg] = useState('20000');
  const [bagWeightKg, setBagWeightKg] = useState('40');
  const [germinationPct, setGerminationPct] = useState('88');
  const [vigorTzPct, setVigorTzPct] = useState('84');
  const [purityPct, setPurityPct] = useState('99.2');
  const [moisturePct, setMoisturePct] = useState('11.8');
  const [mechanicalDamagePct, setMechanicalDamagePct] = useState('2.5');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSpeciesSelect = (nextSpeciesId: string) => {
    setSpeciesId(nextSpeciesId);
    const sp = SEED_SPECIES_RAS_CATALOG.find((s) => s.id === nextSpeciesId);
    if (sp) {
      setGerminationPct(String(Math.min(95, sp.minGerminationOfficialPct + 6)));
      setPurityPct(String(Math.min(99.8, sp.minPurityOfficialPct + 1)));
      setMoisturePct(String(Math.max(8, Number((sp.maxMoistureOfficialPct - 0.6).toFixed(1)))));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lotNumber.trim()) {
      setError('Informe a identificação ou número do lote.');
      return;
    }
    if (!cultivar.trim()) {
      setError('Informe a cultivar ou híbrido.');
      return;
    }

    onCreate({
      lotNumber: lotNumber.trim(),
      speciesId,
      cultivar: cultivar.trim(),
      seedClass,
      cropSeason: cropSeason.trim() || '2025/2026',
      client: client.trim(),
      farm: farm.trim(),
      technicalResponsible: technicalResponsible.trim(),
      totalWeightKg: Math.max(0, Number(totalWeightKg) || 0),
      bagWeightKg: Math.max(1, Number(bagWeightKg) || 40),
      germinationPct: Math.min(100, Math.max(0, Number(germinationPct) || 0)),
      vigorTzPct: Math.min(100, Math.max(0, Number(vigorTzPct) || 0)),
      purityPct: Math.min(100, Math.max(0, Number(purityPct) || 0)),
      moisturePct: Math.min(40, Math.max(0, Number(moisturePct) || 0)),
      mechanicalDamagePct: Math.min(100, Math.max(0, Number(mechanicalDamagePct) || 0)),
    });

    setLotNumber('');
    setCultivar('');
    setClient('');
    setFarm('');
    onClose();
  };

  const inputClass =
    'w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500';
  const labelClass = 'block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-seed-lot-title"
    >
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h3 id="new-seed-lot-title" className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
              Cadastrar Lote de Sementes
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="h-7 w-7 rounded-md inline-flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-5">
          {error && (
            <div className="px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-3">
              Identificação e Origem
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass} htmlFor="lot-number">
                  Número do Lote *
                </label>
                <input
                  id="lot-number"
                  type="text"
                  placeholder="Ex: L-2026-041"
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="lot-species">
                  Espécie (RAS)
                </label>
                <select
                  id="lot-species"
                  value={speciesId}
                  onChange={(e) => handleSpeciesSelect(e.target.value)}
                  className={inputClass}
                >
                  {SEED_SPECIES_RAS_CATALOG.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.commonName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="lot-cultivar">
                  Cultivar / Híbrido *
                </label>
                <input
                  id="lot-cultivar"
                  type="text"
                  placeholder="Ex: M 6410 IPRO"
                  value={cultivar}
                  onChange={(e) => setCultivar(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="lot-class">
                  Categoria / Classe
                </label>
                <select
                  id="lot-class"
                  value={seedClass}
                  onChange={(e) => setSeedClass(e.target.value as SeedClass)}
                  className={inputClass}
                >
                  {SEED_CLASSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="lot-season">
                  Safra
                </label>
                <input
                  id="lot-season"
                  type="text"
                  value={cropSeason}
                  onChange={(e) => setCropSeason(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="lot-weight">
                  Peso Total (kg)
                </label>
                <input
                  id="lot-weight"
                  type="number"
                  min="0"
                  step="10"
                  value={totalWeightKg}
                  onChange={(e) => setTotalWeightKg(e.target.value)}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="lot-client">
                  Cliente / Produtor
                </label>
                <input
                  id="lot-client"
                  type="text"
                  placeholder="Ex: Sementes Planalto"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="lot-farm">
                  Fazenda / Origem
                </label>
                <input
                  id="lot-farm"
                  type="text"
                  placeholder="Ex: Fazenda Boa Vista"
                  value={farm}
                  onChange={(e) => setFarm(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="lot-rt">
                  Responsável Técnico
                </label>
                <input
                  id="lot-rt"
                  type="text"
                  placeholder="Nome e CREA"
                  value={technicalResponsible}
                  onChange={(e) => setTechnicalResponsible(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
            <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">
              Parâmetros Iniciais de Qualidade (cálculo automático do IQS)
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">
              Estes valores podem ser refinados nas abas de Pureza, Germinação, Tetrazólio e Umidade.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div>
                <label className={labelClass} htmlFor="lot-germ">
                  Germinação (%)
                </label>
                <input
                  id="lot-germ"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={germinationPct}
                  onChange={(e) => setGerminationPct(e.target.value)}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="lot-vigor">
                  Vigor TZ (%)
                </label>
                <input
                  id="lot-vigor"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={vigorTzPct}
                  onChange={(e) => setVigorTzPct(e.target.value)}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="lot-purity">
                  Pureza (%)
                </label>
                <input
                  id="lot-purity"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={purityPct}
                  onChange={(e) => setPurityPct(e.target.value)}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="lot-moisture">
                  Umidade (%)
                </label>
                <input
                  id="lot-moisture"
                  type="number"
                  min="0"
                  max="35"
                  step="0.1"
                  value={moisturePct}
                  onChange={(e) => setMoisturePct(e.target.value)}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="lot-damage">
                  Dano Mec. (%)
                </label>
                <input
                  id="lot-damage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={mechanicalDamagePct}
                  onChange={(e) => setMechanicalDamagePct(e.target.value)}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="lot-bag">
                  Peso Saca (kg)
                </label>
                <input
                  id="lot-bag"
                  type="number"
                  min="1"
                  step="1"
                  value={bagWeightKg}
                  onChange={(e) => setBagWeightKg(e.target.value)}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Salvar lote
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ConfirmDeleteLotDialogProps {
  lot: { id: string; lotNumber: string; cultivar: string } | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteLotDialog: React.FC<ConfirmDeleteLotDialogProps> = ({
  lot,
  onCancel,
  onConfirm,
}) => {
  if (!lot) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-lot-title"
    >
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl w-full max-w-md p-5 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 id="delete-lot-title" className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Excluir lote {lot.lotNumber}?
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Todos os dados de qualidade física, germinação, tetrazólio, sanidade e histórico da cultivar{' '}
              <strong className="font-medium text-slate-700 dark:text-zinc-200">{lot.cultivar}</strong> serão removidos permanentemente.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onCancel}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-8 px-3.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium cursor-pointer"
          >
            Excluir lote
          </button>
        </div>
      </div>
    </div>
  );
};
