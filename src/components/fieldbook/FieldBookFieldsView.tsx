import React from 'react';
import { Building2, Flower2, MapPin, Plus } from 'lucide-react';
import { Field, FieldBookSubTab, FieldOperation } from '../../types/fieldbook';
import { ProductionBatch } from '../../types/nursery';

interface FieldBookFieldsViewProps {
  fields: Field[];
  operations: FieldOperation[];
  batches: ProductionBatch[];
  onSetActiveTab: (tab: FieldBookSubTab) => void;
  onOpenNewOperation: (fieldId?: string) => void;
  onNavigateToRegister: () => void;
  onOpenTransplantForField: (batch: ProductionBatch, fieldId: string) => void;
}

export const FieldBookFieldsView: React.FC<FieldBookFieldsViewProps> = ({
  fields,
  operations,
  batches,
  onSetActiveTab,
  onOpenNewOperation,
  onNavigateToRegister,
  onOpenTransplantForField,
}) => {
  const totalArea = (fields || []).reduce((sum, f) => sum + (f?.areaHa || 0), 0);
  const nurseryFields = (fields || []).filter(f => f?.activeNurseryBatchId || f?.seedlingTransplantDate);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Talhões &amp; Áreas da Fazenda ({(fields || []).length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Mapeamento de área produtiva, cultivares instaladas e rastreabilidade de transplante de viveiro
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSetActiveTab('producao_mudas')}
            className="px-3.5 py-2 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 hover:bg-teal-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Flower2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Ver Viveiro &amp; Mudas</span>
          </button>
          <button
            onClick={() => onOpenNewOperation()}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Operação</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Área Total Mapeada</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalArea.toFixed(1)}</span>
            <span className="text-xs font-bold text-slate-500">hectares</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">{(fields || []).length} talhões cadastrados</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Talhões com Mudas de Viveiro</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-teal-600 dark:text-teal-400">{nurseryFields.length}</span>
            <span className="text-xs font-bold text-slate-500">de {(fields || []).length} talhões</span>
          </div>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold block mt-1">Rastreabilidade RENASEM ativa</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Total de Operações Registradas</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{operations.length}</span>
            <span className="text-xs font-bold text-slate-500">apontamentos</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">Sincronizados com o Caderno Digital</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {fields.length === 0 ? (
          <div className="col-span-full py-12 px-6 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              <MapPin className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white text-base">Nenhum talhão cadastrado</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
              Cadastre os talhões e divisões de plantio da sua fazenda para habilitar o rastreamento, apontamentos e laudos agronômicos.
            </p>
            <button
              onClick={onNavigateToRegister}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Cadastrar Talhões na Fazenda</span>
            </button>
          </div>
        ) : (
          fields.map(f => {
            const fieldOps = operations.filter(op => op.fieldId === f.id);
            const hasNursery = Boolean(f.activeNurseryBatchId || f.seedlingTransplantDate);

            return (
              <div
                key={f.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded">
                          {f.code || f.id}
                        </span>
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{f.name}</h4>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-zinc-400 block mt-0.5">
                        {f.areaHa} ha • Solo {f.soilType}
                      </span>
                    </div>

                    <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black rounded-lg">
                      {f.crop}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl space-y-1.5 text-xs text-slate-600 dark:text-zinc-400 border border-slate-100 dark:border-zinc-800">
                    <div className="flex justify-between">
                      <span className="font-medium">Variedade / Híbrido:</span>
                      <span className="font-bold text-slate-800 dark:text-white">{f.variety || 'N/D'}</span>
                    </div>
                    {f.plantingDate && (
                      <div className="flex justify-between">
                        <span className="font-medium">Data de Plantio:</span>
                        <span className="font-mono">{new Date(f.plantingDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Operações no Talhão:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{fieldOps.length} registros</span>
                    </div>
                  </div>

                  {hasNursery ? (
                    <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1">
                          <Flower2 className="w-3.5 h-3.5 text-teal-600" />
                          Origem: Viveiro de Mudas
                        </span>
                        <span className="text-[10px] bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-200 font-mono font-bold px-2 py-0.5 rounded">
                          {f.activeNurseryBatchId}
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 dark:text-zinc-300 space-y-1">
                        {f.seedlingCount && (
                          <p className="flex items-center justify-between">
                            <span className="text-slate-500">Mudas Transplantadas:</span>
                            <strong className="text-slate-900 dark:text-white">{(f.seedlingCount ?? 0).toLocaleString()} mudas</strong>
                          </p>
                        )}
                        {f.seedlingTransplantDate && (
                          <p className="flex items-center justify-between">
                            <span className="text-slate-500">Data Transplante:</span>
                            <span className="font-mono text-slate-800 dark:text-white">{new Date(f.seedlingTransplantDate).toLocaleDateString('pt-BR')}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/20 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-center">
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500">Sem lote de viveiro vinculado</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      const batch = batches.find(b => b.status === 'pronto_expedicao' || b.status === 'aclimatacao') || batches[0];
                      if (batch) {
                        onOpenTransplantForField(batch, f.id);
                      }
                    }}
                    className="flex-1 py-2 px-2.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Flower2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Transplantar</span>
                  </button>

                  <button
                    onClick={() => onOpenNewOperation(f.id)}
                    className="flex-1 py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Apontar</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FieldBookFieldsView;
