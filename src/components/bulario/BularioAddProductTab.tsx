import React from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import {
  AgrochemicalClass,
  ToxicologicalClass,
  FormulationType,
  DosageUnit,
  PesticideProduct,
} from '../../types/pesticideLeaflet';

export interface NewIndicationDraft {
  cropName: string;
  recommendedDosage: number;
  dosageUnit: DosageUnit;
  targetOrganism: string;
  applicationPhase: string;
  gracePeriodDays: number;
  recommendedSprayVolumeLha: number;
}

interface CollisionResult {
  hasCollision: boolean;
  reason?: string;
  conflictingProduct?: PesticideProduct;
}

interface BularioAddProductTabProps {
  newProductName: string;
  setNewProductName: (v: string) => void;
  newRegNumber: string;
  setNewRegNumber: (v: string) => void;
  newManufacturer: string;
  setNewManufacturer: (v: string) => void;
  newActiveIngredient: string;
  setNewActiveIngredient: (v: string) => void;
  newChemicalGroup: string;
  setNewChemicalGroup: (v: string) => void;
  newClass: AgrochemicalClass;
  setNewClass: (v: AgrochemicalClass) => void;
  newToxicClass: ToxicologicalClass;
  setNewToxicClass: (v: ToxicologicalClass) => void;
  newFormulation: FormulationType;
  setNewFormulation: (v: FormulationType) => void;
  newReentryHours: number;
  setNewReentryHours: (v: number) => void;
  newPackageSizes: string;
  setNewPackageSizes: (v: string) => void;
  newModeOfAction: string;
  setNewModeOfAction: (v: string) => void;
  newNotes: string;
  setNewNotes: (v: string) => void;
  newIndications: NewIndicationDraft[];
  setNewIndications: React.Dispatch<React.SetStateAction<NewIndicationDraft[]>>;
  newProductCollision: CollisionResult | null;
  onAddIndicationRow: () => void;
  onRemoveIndicationRow: (index: number) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const INPUT_CLASS =
  'w-full h-9 px-3 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors';

export const BularioAddProductTab: React.FC<BularioAddProductTabProps> = ({
  newProductName,
  setNewProductName,
  newRegNumber,
  setNewRegNumber,
  newManufacturer,
  setNewManufacturer,
  newActiveIngredient,
  setNewActiveIngredient,
  newChemicalGroup,
  setNewChemicalGroup,
  newClass,
  setNewClass,
  newToxicClass,
  setNewToxicClass,
  newFormulation,
  setNewFormulation,
  newReentryHours,
  setNewReentryHours,
  newPackageSizes,
  setNewPackageSizes,
  newModeOfAction,
  setNewModeOfAction,
  newNotes,
  setNewNotes,
  newIndications,
  setNewIndications,
  newProductCollision,
  onAddIndicationRow,
  onRemoveIndicationRow,
  onCancel,
  onSubmit,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden text-xs divide-y divide-slate-200 dark:divide-zinc-800"
    >
      {/* Cabeçalho */}
      <div className="px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Cadastrar novo defensivo no bulário
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Registre os dados técnicos oficiais da bula e suas indicações de culturas e dosagens.
        </p>
      </div>

      {/* Alerta de Colisão */}
      {newProductCollision && newProductCollision.hasCollision && (
        <div className="px-5 py-3 bg-amber-50/70 dark:bg-amber-950/25 flex items-start gap-2.5 text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="font-semibold block">
              Possível duplicidade detectada no catálogo
            </strong>
            <p className="text-[11px] leading-relaxed">
              Já existe o produto{' '}
              <strong>{newProductCollision.conflictingProduct?.productName}</strong> (MAPA nº{' '}
              <strong>{newProductCollision.conflictingProduct?.registrationNumber}</strong>) de{' '}
              <strong>{newProductCollision.conflictingProduct?.manufacturer}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Seção 1: Identificação */}
      <div className="p-5 space-y-4">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
          1. Identificação do produto
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="space-y-1">
            <label className="block font-medium text-slate-700 dark:text-zinc-300">
              Nome comercial *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Fox Xpro, Premio..."
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-slate-700 dark:text-zinc-300">
              Registro MAPA *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: 02919"
              value={newRegNumber}
              onChange={(e) => setNewRegNumber(e.target.value)}
              className={`${INPUT_CLASS} font-mono tabular-nums`}
            />
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-slate-700 dark:text-zinc-300">
              Titular / Fabricante
            </label>
            <input
              type="text"
              placeholder="Ex: Bayer, Syngenta, FMC..."
              value={newManufacturer}
              onChange={(e) => setNewManufacturer(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="block font-medium text-slate-700 dark:text-zinc-300">
              Ingrediente ativo e concentração *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Protioconazol (175 g/L) + Trifloxistrobina (150 g/L)"
              value={newActiveIngredient}
              onChange={(e) => setNewActiveIngredient(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-slate-700 dark:text-zinc-300">
              Grupo químico
            </label>
            <input
              type="text"
              placeholder="Ex: Triazolintiona + Estrobilurina"
              value={newChemicalGroup}
              onChange={(e) => setNewChemicalGroup(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-slate-700 dark:text-zinc-300">
              Classe agronômica
            </label>
            <select
              value={newClass}
              onChange={(e) => setNewClass(e.target.value as AgrochemicalClass)}
              className={INPUT_CLASS}
            >
              <option value="Fungicida">Fungicida</option>
              <option value="Inseticida">Inseticida</option>
              <option value="Herbicida">Herbicida</option>
              <option value="Acaricida">Acaricida</option>
              <option value="Nematicida">Nematicida</option>
              <option value="Tratamento de Sementes">Tratamento de Sementes</option>
              <option value="Fisioativador">Fisioativador</option>
              <option value="Biológico">Biológico</option>
              <option value="Adjuvante">Adjuvante</option>
              <option value="Regulador de Crescimento">Regulador de Crescimento</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-slate-700 dark:text-zinc-300">
              Classe toxicológica
            </label>
            <select
              value={newToxicClass}
              onChange={(e) => setNewToxicClass(e.target.value as ToxicologicalClass)}
              className={INPUT_CLASS}
            >
              <option value="Classe I - Extremamente Tóxico">Classe I - Extremamente Tóxico</option>
              <option value="Classe II - Altamente Tóxico">Classe II - Altamente Tóxico</option>
              <option value="Classe III - Moderadamente Tóxico">Classe III - Moderadamente Tóxico</option>
              <option value="Classe IV - Pouco Tóxico">Classe IV - Pouco Tóxico</option>
              <option value="Classe V - Improvável de Causar Dano Agudo">
                Classe V - Improvável de Causar Dano Agudo
              </option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-slate-700 dark:text-zinc-300">
              Formulação
            </label>
            <select
              value={newFormulation}
              onChange={(e) => setNewFormulation(e.target.value as FormulationType)}
              className={INPUT_CLASS}
            >
              <option value="SC - Suspensão Concentrada">SC - Suspensão Concentrada</option>
              <option value="EC - Emulsão Concentrada">EC - Emulsão Concentrada</option>
              <option value="WG - Grânulos Dispersíveis em Água">WG - Grânulos Dispersíveis em Água</option>
              <option value="SL - Concentrado Solúvel">SL - Concentrado Solúvel</option>
              <option value="WP - Pó Molhável">WP - Pó Molhável</option>
              <option value="OD - Dispersão em Óleo">OD - Dispersão em Óleo</option>
              <option value="FS - Suspensão para Tratamento de Sementes">
                FS - Suspensão para Tratamento de Sementes
              </option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-slate-700 dark:text-zinc-300">
              Reentrada <span className="text-slate-400 font-normal">(horas)</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="24"
              value={newReentryHours}
              onChange={(e) => setNewReentryHours(Number(e.target.value))}
              className={`${INPUT_CLASS} tabular-nums`}
            />
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-slate-700 dark:text-zinc-300">
              Embalagens <span className="text-slate-400 font-normal">(L/kg separados por vírgula)</span>
            </label>
            <input
              type="text"
              placeholder="Ex: 1, 5, 20"
              value={newPackageSizes}
              onChange={(e) => setNewPackageSizes(e.target.value)}
              className={`${INPUT_CLASS} tabular-nums`}
            />
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-slate-700 dark:text-zinc-300">
              Modo de ação
            </label>
            <input
              type="text"
              placeholder="Ex: Sistêmico e mesostêmico"
              value={newModeOfAction}
              onChange={(e) => setNewModeOfAction(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
        </div>
      </div>

      {/* Seção 2: Culturas e Dosagens */}
      <div className="p-5 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              2. Culturas e dosagens recomendadas ({newIndications.length})
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Informe cada cultura homologada com dose, unidade, alvo e carência.
            </p>
          </div>
          <button
            type="button"
            onClick={onAddIndicationRow}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Adicionar cultura</span>
          </button>
        </div>

        <div className="border border-slate-200 dark:border-zinc-800 rounded-lg divide-y divide-slate-200 dark:divide-zinc-800">
          {newIndications.map((ind, index) => (
            <div key={index} className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  Cultura #{index + 1}
                </span>
                {newIndications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveIndicationRow(index)}
                    className="h-7 px-2 rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[11px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remover</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="block font-medium text-slate-700 dark:text-zinc-300">
                    Cultura *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Soja, Milho"
                    value={ind.cropName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewIndications((prev) =>
                        prev.map((item, i) => (i === index ? { ...item, cropName: val } : item))
                      );
                    }}
                    className={INPUT_CLASS}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-medium text-slate-700 dark:text-zinc-300">
                    Dosagem *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={ind.recommendedDosage}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNewIndications((prev) =>
                        prev.map((item, i) =>
                          i === index ? { ...item, recommendedDosage: val } : item
                        )
                      );
                    }}
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-medium text-slate-700 dark:text-zinc-300">
                    Unidade *
                  </label>
                  <select
                    value={ind.dosageUnit}
                    onChange={(e) => {
                      const val = e.target.value as DosageUnit;
                      setNewIndications((prev) =>
                        prev.map((item, i) => (i === index ? { ...item, dosageUnit: val } : item))
                      );
                    }}
                    className={INPUT_CLASS}
                  >
                    <option value="L/ha">L/ha</option>
                    <option value="mL/ha">mL/ha</option>
                    <option value="kg/ha">kg/ha</option>
                    <option value="g/ha">g/ha</option>
                    <option value="L/100L de água">L/100L de água</option>
                    <option value="mL/100L de água">mL/100L de água</option>
                    <option value="g/100L de água">g/100L de água</option>
                    <option value="L/100kg de semente">L/100kg semente (TS)</option>
                    <option value="mL/100kg de semente">mL/100kg semente (TS)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-medium text-slate-700 dark:text-zinc-300">
                    Carência <span className="text-slate-400 font-normal">(dias)</span> *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={ind.gracePeriodDays}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNewIndications((prev) =>
                        prev.map((item, i) =>
                          i === index ? { ...item, gracePeriodDays: val } : item
                        )
                      );
                    }}
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-medium text-slate-700 dark:text-zinc-300">
                    Alvo biológico
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Ferrugem-asiática (Phakopsora pachyrhizi)"
                    value={ind.targetOrganism}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewIndications((prev) =>
                        prev.map((item, i) =>
                          i === index ? { ...item, targetOrganism: val } : item
                        )
                      );
                    }}
                    className={INPUT_CLASS}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-medium text-slate-700 dark:text-zinc-300">
                    Época / fase
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Preventivo V8–R1"
                    value={ind.applicationPhase}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewIndications((prev) =>
                        prev.map((item, i) =>
                          i === index ? { ...item, applicationPhase: val } : item
                        )
                      );
                    }}
                    className={INPUT_CLASS}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-medium text-slate-700 dark:text-zinc-300">
                    Calda <span className="text-slate-400 font-normal">(L/ha)</span>
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={ind.recommendedSprayVolumeLha}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNewIndications((prev) =>
                        prev.map((item, i) =>
                          i === index ? { ...item, recommendedSprayVolumeLha: val } : item
                        )
                      );
                    }}
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seção 3: Observações */}
      <div className="p-5 space-y-1.5">
        <label className="block font-medium text-slate-700 dark:text-zinc-300">
          3. Instruções de adjuvantes, pH da água e tecnologia de aplicação
        </label>
        <textarea
          rows={2}
          placeholder="Ex: Adicionar óleo mineral a 0,25% v/v. Manter pH da calda entre 5,5 e 6,5."
          value={newNotes}
          onChange={(e) => setNewNotes(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
      </div>

      {/* Rodapé de Ações */}
      <div className="px-5 py-3.5 bg-slate-50 dark:bg-zinc-950/60 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Salvar defensivo</span>
        </button>
      </div>
    </form>
  );
};
