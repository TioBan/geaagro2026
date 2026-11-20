import React, { useState } from 'react';
import {
  FileText,
  Save,
  CheckCircle2,
  Building2,
  Trash2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Printer,
} from 'lucide-react';
import { PesticideProduct } from '../../types/pesticideLeaflet';
import { Farm, RuralProducer } from '../../types/agronomy';

interface BularioReceituarioTabProps {
  recipes: any[];
  activeFarm?: Farm;
  farms?: Farm[];
  producers?: RuralProducer[];
  selectedFarmId?: string;
  setSelectedFarmId?: (id: string) => void;
  setActiveTab?: (tab: string) => void;

  recCompanyName: string;
  setRecCompanyName: (v: string) => void;
  recCompanyCNPJ: string;
  setRecCompanyCNPJ: (v: string) => void;
  recCompanyCREA: string;
  setRecCompanyCREA: (v: string) => void;
  recCompanyAddress: string;
  setRecCompanyAddress: (v: string) => void;
  recCompanyContact: string;
  setRecCompanyContact: (v: string) => void;

  recRtName: string;
  setRecRtName: (v: string) => void;
  recRtCREA: string;
  setRecRtCREA: (v: string) => void;
  recRtCPF: string;
  setRecRtCPF: (v: string) => void;
  recRtEmail: string;
  setRecRtEmail: (v: string) => void;
  recRtPhone: string;
  setRecRtPhone: (v: string) => void;

  recFarmNameForm: string;
  setRecFarmNameForm: (v: string) => void;
  recFarmLocation: string;
  setRecFarmLocation: (v: string) => void;
  recFarmOwner: string;
  setRecFarmOwner: (v: string) => void;
  recFarmCPF: string;
  setRecFarmCPF: (v: string) => void;
  syncNotification: string | null;
  onSaveToCadastroTecnico: () => void;

  recSelectedProduct: string;
  setRecSelectedProduct: (v: string) => void;
  recSelectedCrop: string;
  setRecSelectedCrop: (v: string) => void;
  recSelectedDosage: string;
  setRecSelectedDosage: (v: string) => void;
  recApplicationEpoch: string;
  setRecApplicationEpoch: (v: string) => void;
  recReturnLocation: string;
  setRecReturnLocation: (v: string) => void;
  recNotesForm: string;
  setRecNotesForm: (v: string) => void;
  recProducerName: string;
  setRecProducerName: (v: string) => void;

  recPurchasedQty: number;
  setRecPurchasedQty: (v: number) => void;
  recWaterVolumeLha: number;
  setRecWaterVolumeLha: (v: number) => void;
  selectedIndicationUnit: string;
  setSelectedIndicationDosage: (v: number) => void;
  setSelectedIndicationUnit: (v: string) => void;
  computedHectares: number;
  computedTotalWater: number;

  activeProductObj: PesticideProduct | null;
  filteredProductSuggestions: PesticideProduct[];
  showProductDropdown: boolean;
  setShowProductDropdown: (v: boolean) => void;
  isCustomCropMode: boolean;
  setIsCustomCropMode: (v: boolean) => void;

  canvasProducerRef: React.RefObject<HTMLCanvasElement | null>;
  canvasRTRef: React.RefObject<HTMLCanvasElement | null>;
  startDrawing: (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    isRT: boolean
  ) => void;
  draw: (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    isRT: boolean
  ) => void;
  stopDrawing: (isRT: boolean) => void;
  clearCanvas: (isRT: boolean) => void;

  onSaveRecipe: (e: React.FormEvent) => void;
  onViewRecipe: (recipe: any) => void;
  onDeleteRecipe: (id: string) => void;
}

const INPUT_CLASS =
  'w-full h-9 px-3 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors';

export const BularioReceituarioTab: React.FC<BularioReceituarioTabProps> = ({
  recipes,
  activeFarm,
  farms,
  producers,
  selectedFarmId,
  setSelectedFarmId,
  setActiveTab,
  recCompanyName,
  setRecCompanyName,
  recCompanyCNPJ,
  setRecCompanyCNPJ,
  recCompanyCREA,
  setRecCompanyCREA,
  recCompanyAddress,
  setRecCompanyAddress,
  recCompanyContact,
  setRecCompanyContact,
  recRtName,
  setRecRtName,
  recRtCREA,
  setRecRtCREA,
  recRtCPF,
  setRecRtCPF,
  recRtEmail,
  setRecRtEmail,
  recRtPhone,
  setRecRtPhone,
  recFarmNameForm,
  setRecFarmNameForm,
  recFarmLocation,
  setRecFarmLocation,
  recFarmOwner,
  setRecFarmOwner,
  recFarmCPF,
  setRecFarmCPF,
  syncNotification,
  onSaveToCadastroTecnico,
  recSelectedProduct,
  setRecSelectedProduct,
  recSelectedCrop,
  setRecSelectedCrop,
  recSelectedDosage,
  setRecSelectedDosage,
  recApplicationEpoch,
  setRecApplicationEpoch,
  recReturnLocation,
  setRecReturnLocation,
  recNotesForm,
  setRecNotesForm,
  recProducerName,
  setRecProducerName,
  recPurchasedQty,
  setRecPurchasedQty,
  recWaterVolumeLha,
  setRecWaterVolumeLha,
  selectedIndicationUnit,
  setSelectedIndicationDosage,
  setSelectedIndicationUnit,
  computedHectares,
  computedTotalWater,
  activeProductObj,
  filteredProductSuggestions,
  showProductDropdown,
  setShowProductDropdown,
  isCustomCropMode,
  setIsCustomCropMode,
  canvasProducerRef,
  canvasRTRef,
  startDrawing,
  draw,
  stopDrawing,
  clearCanvas,
  onSaveRecipe,
  onViewRecipe,
  onDeleteRecipe,
}) => {
  const [showEmitenteConfig, setShowEmitenteConfig] = useState(false);

  const purchasedUnitLabel =
    selectedIndicationUnit.toLowerCase().includes('kg') ||
    selectedIndicationUnit.toLowerCase().includes('g') ||
    selectedIndicationUnit.toLowerCase().includes('wp')
      ? 'kg'
      : 'L';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start text-xs">
      {/* Formulário de Emissão */}
      <form
        onSubmit={onSaveRecipe}
        className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-zinc-800"
      >
        {/* Cabeçalho */}
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Emissão de Receituário Agronômico
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Prescrição técnica fitossanitária com assinatura digital e impressão conforme Lei nº 7.802/89.
          </p>
        </div>

        {/* 1. Emitente & RT (recolhível) */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                1. Emitente e Responsável Técnico
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                {recCompanyName} · {recRtName} ({recRtCREA})
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowEmitenteConfig((prev) => !prev)}
              className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-[11px] font-medium inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{showEmitenteConfig ? 'Ocultar dados' : 'Editar emitente'}</span>
              {showEmitenteConfig ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {showEmitenteConfig && (
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 block">
                  Empresa emitente
                </span>
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400">Razão social</label>
                  <input type="text" value={recCompanyName} onChange={(e) => setRecCompanyName(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400">CNPJ</label>
                    <input type="text" value={recCompanyCNPJ} onChange={(e) => setRecCompanyCNPJ(e.target.value)} className={`${INPUT_CLASS} font-mono`} />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400">CREA PJ</label>
                    <input type="text" value={recCompanyCREA} onChange={(e) => setRecCompanyCREA(e.target.value)} className={INPUT_CLASS} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400">Endereço</label>
                  <input type="text" value={recCompanyAddress} onChange={(e) => setRecCompanyAddress(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400">Contato</label>
                  <input type="text" value={recCompanyContact} onChange={(e) => setRecCompanyContact(e.target.value)} className={INPUT_CLASS} />
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 block">
                  Responsável Técnico (RT)
                </span>
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400">Engenheiro Agrônomo</label>
                  <input type="text" value={recRtName} onChange={(e) => setRecRtName(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400">CREA</label>
                    <input type="text" value={recRtCREA} onChange={(e) => setRecRtCREA(e.target.value)} className={INPUT_CLASS} />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400">CPF</label>
                    <input type="text" value={recRtCPF} onChange={(e) => setRecRtCPF(e.target.value)} className={`${INPUT_CLASS} font-mono`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400">E-mail</label>
                  <input type="email" value={recRtEmail} onChange={(e) => setRecRtEmail(e.target.value)} className={INPUT_CLASS} />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400">Telefone</label>
                  <input type="text" value={recRtPhone} onChange={(e) => setRecRtPhone(e.target.value)} className={INPUT_CLASS} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Propriedade e Produtor */}
        <div className="p-5 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              2. Propriedade e produtor
            </h3>

            <div className="flex flex-wrap items-center gap-1.5">
              {farms && farms.length > 0 && setSelectedFarmId && (
                <select
                  aria-label="Carregar fazenda do Cadastro Técnico"
                  value={selectedFarmId || activeFarm?.id || ''}
                  onChange={(e) => {
                    const farmId = e.target.value;
                    setSelectedFarmId(farmId);
                    const foundFarm = farms.find((f) => f.id === farmId);
                    if (foundFarm) {
                      setRecFarmNameForm(foundFarm.name);
                      const coords =
                        foundFarm.latitude && foundFarm.longitude
                          ? `Coordenadas: ${foundFarm.latitude}, ${foundFarm.longitude} - `
                          : '';
                      setRecFarmLocation(`${coords}${foundFarm.city || ''}/${foundFarm.state || ''}`);

                      const foundProducer = producers?.find((p) => p.id === foundFarm.producerId);
                      if (foundProducer) {
                        setRecFarmOwner(foundProducer.name);
                        setRecFarmCPF(foundProducer.document);
                        setRecProducerName(foundProducer.name);
                      }
                    }
                  }}
                  className="h-7 px-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-[11px] font-medium text-slate-700 dark:text-zinc-200 max-w-[220px]"
                >
                  <option value="">Carregar fazenda...</option>
                  {farms.map((f) => {
                    const p = producers?.find((prod) => prod.id === f.producerId);
                    return (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.city}/{f.state}) — {p?.name || 'Produtor'}
                      </option>
                    );
                  })}
                </select>
              )}

              <button
                type="button"
                onClick={onSaveToCadastroTecnico}
                className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-[11px] font-medium inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
              >
                <Save className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Sincronizar</span>
              </button>

              {setActiveTab && (
                <button
                  type="button"
                  onClick={() => setActiveTab('cadastros')}
                  className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-[11px] font-medium inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  <Building2 className="w-3 h-3" />
                  <span>Cadastros</span>
                </button>
              )}
            </div>
          </div>

          {syncNotification && (
            <div className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-[11px] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{syncNotification}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="block font-medium text-slate-700 dark:text-zinc-300">
                Propriedade / Fazenda *
              </label>
              <input
                type="text"
                required
                value={recFarmNameForm}
                onChange={(e) => setRecFarmNameForm(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>

            <div className="space-y-1">
              <label className="block font-medium text-slate-700 dark:text-zinc-300">
                Localização / Coordenadas *
              </label>
              <input
                type="text"
                required
                value={recFarmLocation}
                onChange={(e) => setRecFarmLocation(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>

            <div className="space-y-1">
              <label className="block font-medium text-slate-700 dark:text-zinc-300">
                Proprietário / Produtor *
              </label>
              <input
                type="text"
                required
                value={recFarmOwner}
                onChange={(e) => setRecFarmOwner(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>

            <div className="space-y-1">
              <label className="block font-medium text-slate-700 dark:text-zinc-300">
                CPF / CNPJ *
              </label>
              <input
                type="text"
                required
                value={recFarmCPF}
                onChange={(e) => setRecFarmCPF(e.target.value)}
                className={`${INPUT_CLASS} font-mono`}
              />
            </div>
          </div>
        </div>

        {/* 3. Receita Técnica e Logística */}
        <div className="p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
            3. Prescrição técnica e logística de calda
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="relative space-y-1">
              <label className="block font-medium text-slate-700 dark:text-zinc-300">
                Produto comercial *
              </label>
              <input
                type="text"
                required
                placeholder="Digite para buscar..."
                value={recSelectedProduct}
                onChange={(e) => {
                  setRecSelectedProduct(e.target.value);
                  setShowProductDropdown(true);
                  setIsCustomCropMode(false);
                }}
                onFocus={() => setShowProductDropdown(true)}
                className={INPUT_CLASS}
              />

              {showProductDropdown && filteredProductSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-56 overflow-y-auto z-40 divide-y divide-slate-100 dark:divide-zinc-800">
                  {filteredProductSuggestions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setRecSelectedProduct(p.productName);
                        setShowProductDropdown(false);
                        if (p.indications && p.indications.length > 0) {
                          const ind = p.indications[0];
                          setRecSelectedCrop(ind.cropName);
                          setRecSelectedDosage(`${ind.recommendedDosage} ${ind.dosageUnit}`);
                          setSelectedIndicationDosage(ind.recommendedDosage);
                          setSelectedIndicationUnit(ind.dosageUnit);
                          setRecWaterVolumeLha(ind.recommendedSprayVolumeLha || 150);
                          if (ind.applicationPhase) {
                            setRecApplicationEpoch(ind.applicationPhase);
                          }
                          if (ind.targetOrganism) {
                            setRecNotesForm(
                              `Utilizar EPIs obrigatórios. Alvo principal registrado: ${ind.targetOrganism}. Carência: ${ind.gracePeriodDays} dias.`
                            );
                          }
                        }
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {p.productName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          MAPA {p.registrationNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                        {p.manufacturer} · {p.agrochemicalClass}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {activeProductObj && (
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  {activeProductObj.manufacturer} · MAPA {activeProductObj.registrationNumber}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-medium text-slate-700 dark:text-zinc-300">
                  Cultura alvo *
                </label>
                {activeProductObj && activeProductObj.indications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCropMode(!isCustomCropMode);
                      setRecSelectedCrop('');
                    }}
                    className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
                  >
                    {isCustomCropMode ? 'Selecionar da bula' : 'Digitar'}
                  </button>
                )}
              </div>

              {activeProductObj && activeProductObj.indications.length > 0 && !isCustomCropMode ? (
                <select
                  required
                  value={recSelectedCrop}
                  onChange={(e) => {
                    const cropVal = e.target.value;
                    setRecSelectedCrop(cropVal);
                    const ind = activeProductObj.indications.find((i) => i.cropName === cropVal);
                    if (ind) {
                      setRecSelectedDosage(`${ind.recommendedDosage} ${ind.dosageUnit}`);
                      setSelectedIndicationDosage(ind.recommendedDosage);
                      setSelectedIndicationUnit(ind.dosageUnit);
                      setRecWaterVolumeLha(ind.recommendedSprayVolumeLha || 150);
                      setRecApplicationEpoch(
                        ind.applicationPhase || 'Fase pós-emergência inicial da cultura.'
                      );
                      if (ind.targetOrganism) {
                        setRecNotesForm(
                          `Utilizar EPIs obrigatórios. Alvo principal registrado: ${ind.targetOrganism}. Período de carência: ${ind.gracePeriodDays} dias.`
                        );
                      }
                    }
                  }}
                  className={INPUT_CLASS}
                >
                  <option value="">Selecionar cultura...</option>
                  {activeProductObj.indications.map((ind) => (
                    <option key={ind.id || ind.cropName} value={ind.cropName}>
                      {ind.cropName} ({ind.targetOrganism})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  placeholder="Ex: Soja, Milho"
                  value={recSelectedCrop}
                  onChange={(e) => setRecSelectedCrop(e.target.value)}
                  className={INPUT_CLASS}
                />
              )}
            </div>

            <div className="space-y-1">
              <label className="block font-medium text-slate-700 dark:text-zinc-300">
                Dosagem recomendada *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 0.5 L/ha"
                value={recSelectedDosage}
                onChange={(e) => {
                  setRecSelectedDosage(e.target.value);
                  const match = e.target.value.match(/([\d.,]+)\s*([a-zA-Zá-úÁ-Ú%\/0-9]+)/);
                  if (match) {
                    const parsedDosage = parseFloat(match[1].replace(',', '.'));
                    if (!isNaN(parsedDosage)) {
                      setSelectedIndicationDosage(parsedDosage);
                    }
                    setSelectedIndicationUnit(match[2]);
                  }
                }}
                className={`${INPUT_CLASS} tabular-nums`}
              />
            </div>
          </div>

          {/* Barra Plana de Rendimento & Calda */}
          <div className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden divide-y divide-slate-200 dark:divide-zinc-800">
            <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/70 dark:bg-zinc-950/50">
              <div className="space-y-1">
                <label className="block font-medium text-slate-700 dark:text-zinc-300">
                  Quantidade comprada <span className="text-slate-400 font-normal">({purchasedUnitLabel})</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  required
                  value={recPurchasedQty}
                  onChange={(e) => setRecPurchasedQty(parseFloat(e.target.value) || 0)}
                  className={`${INPUT_CLASS} tabular-nums`}
                />
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-slate-700 dark:text-zinc-300">
                  Volume de calda <span className="text-slate-400 font-normal">(L/ha)</span>
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  required
                  value={recWaterVolumeLha}
                  onChange={(e) => setRecWaterVolumeLha(parseInt(e.target.value, 10) || 0)}
                  className={`${INPUT_CLASS} tabular-nums`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-200/70 dark:bg-zinc-800 tabular-nums">
              <div className="bg-white dark:bg-zinc-900 px-3.5 py-2.5">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                  Rendimento estimado
                </span>
                <strong className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
                  {computedHectares > 0
                    ? `${computedHectares.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ha`
                    : '—'}
                </strong>
              </div>
              <div className="bg-white dark:bg-zinc-900 px-3.5 py-2.5">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                  Volume total de calda
                </span>
                <strong className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                  {computedTotalWater > 0
                    ? `${Math.round(computedTotalWater).toLocaleString('pt-BR')} L`
                    : '—'}
                </strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="block font-medium text-slate-700 dark:text-zinc-300">
                Época de aplicação *
              </label>
              <input
                type="text"
                required
                value={recApplicationEpoch}
                onChange={(e) => setRecApplicationEpoch(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>

            <div className="space-y-1">
              <label className="block font-medium text-slate-700 dark:text-zinc-300">
                Local de devolução de embalagens *
              </label>
              <input
                type="text"
                required
                value={recReturnLocation}
                onChange={(e) => setRecReturnLocation(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-slate-700 dark:text-zinc-300">
              Instruções de segurança e observações
            </label>
            <textarea
              rows={2}
              value={recNotesForm}
              onChange={(e) => setRecNotesForm(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* 4. Assinaturas */}
        <div className="p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
            4. Assinaturas digitais
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-medium text-slate-700 dark:text-zinc-300">
                  Produtor / Proprietário
                </label>
                <button
                  type="button"
                  onClick={() => clearCanvas(false)}
                  className="text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Limpar
                </button>
              </div>
              <canvas
                ref={canvasProducerRef}
                width={400}
                height={110}
                onMouseDown={(e) => startDrawing(e, false)}
                onMouseMove={(e) => draw(e, false)}
                onMouseUp={() => stopDrawing(false)}
                onMouseLeave={() => stopDrawing(false)}
                onTouchStart={(e) => startDrawing(e, false)}
                onTouchMove={(e) => draw(e, false)}
                onTouchEnd={() => stopDrawing(false)}
                className="w-full h-[110px] bg-slate-50 dark:bg-zinc-950 border border-dashed border-slate-300 dark:border-zinc-700 rounded-lg cursor-crosshair"
              />
              <input
                type="text"
                placeholder="Nome por extenso"
                value={recProducerName}
                onChange={(e) => setRecProducerName(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-medium text-slate-700 dark:text-zinc-300">
                  Responsável Técnico (CREA)
                </label>
                <button
                  type="button"
                  onClick={() => clearCanvas(true)}
                  className="text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Limpar
                </button>
              </div>
              <canvas
                ref={canvasRTRef}
                width={400}
                height={110}
                onMouseDown={(e) => startDrawing(e, true)}
                onMouseMove={(e) => draw(e, true)}
                onMouseUp={() => stopDrawing(true)}
                onMouseLeave={() => stopDrawing(true)}
                onTouchStart={(e) => startDrawing(e, true)}
                onTouchMove={(e) => draw(e, true)}
                onTouchEnd={() => stopDrawing(true)}
                className="w-full h-[110px] bg-slate-50 dark:bg-zinc-950 border border-dashed border-emerald-300 dark:border-emerald-800 rounded-lg cursor-crosshair"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nome do RT"
                  value={recRtName}
                  onChange={(e) => setRecRtName(e.target.value)}
                  className={INPUT_CLASS}
                />
                <input
                  type="text"
                  placeholder="CREA / UF"
                  value={recRtCREA}
                  onChange={(e) => setRecRtCREA(e.target.value)}
                  className={`${INPUT_CLASS} font-mono`}
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Recomendação emitida conforme o Artigo 13 da Lei nº 7.802/89, vinculando o registro CREA do responsável técnico com código de verificação.
            </span>
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-zinc-950/60 flex items-center justify-end">
          <button
            type="submit"
            className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Emitir e assinar receita</span>
          </button>
        </div>
      </form>

      {/* Histórico Lateral de Receitas */}
      <aside className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
            Histórico de receitas
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            {recipes.length} {recipes.length === 1 ? 'emitida' : 'emitidas'}
          </span>
        </div>

        {recipes.length === 0 ? (
          <div className="p-8 text-center space-y-1.5">
            <FileText className="w-5 h-5 text-slate-400 dark:text-zinc-500 mx-auto" />
            <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
              Nenhuma receita emitida
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Preencha o formulário ao lado para gerar a primeira prescrição.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800 max-h-[680px] overflow-y-auto">
            {recipes.map((r) => (
              <div key={r.id} className="p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-mono text-slate-400 dark:text-zinc-500 truncate">
                    {r.verificationCode}
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium shrink-0">
                    Assinada
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs truncate">
                    {r.productName}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                    {r.crop} · {r.dosage}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                    {r.farmName} · {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => onViewRecipe(r)}
                    className="flex-1 h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-[11px] font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Visualizar / Imprimir</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRecipe(r.id)}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 inline-flex items-center justify-center transition-colors cursor-pointer"
                    title="Excluir receita"
                    aria-label="Excluir receita"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
};
