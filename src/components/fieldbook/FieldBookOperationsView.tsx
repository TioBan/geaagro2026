import React, { useState } from 'react';
import {
  Activity,
  Boxes,
  Calendar,
  CheckCircle2,
  Droplets,
  FileText,
  FlaskConical,
  Flower2,
  Leaf,
  Plus,
  Search,
  ShieldCheck,
  Sprout,
} from 'lucide-react';
import { Field, FieldOperation } from '../../types/fieldbook';

interface FieldBookOperationsViewProps {
  operations: FieldOperation[];
  fields: Field[];
  onOpenNewOperation: () => void;
}

export const FieldBookOperationsView: React.FC<FieldBookOperationsViewProps> = ({
  operations,
  fields,
  onOpenNewOperation,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredOperations = operations.filter(op => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const fieldName = fields.find(f => f.id === op.fieldId)?.name?.toLowerCase() || '';
    const opTypeStr = op.type.toLowerCase();
    const machine = (op.details.machine || '').toLowerCase();
    const product = (op.details.product || '').toLowerCase();
    const resp = (op.responsible || '').toLowerCase();
    return (
      fieldName.includes(term) ||
      opTypeStr.includes(term) ||
      machine.includes(term) ||
      product.includes(term) ||
      resp.includes(term)
    );
  });

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm min-h-[400px]">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Todas as Operações ({operations.length})</h3>
          <p className="text-xs text-slate-500">Histórico de intervenções agronômicas e registros de campo</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar operação, talhão..."
              className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={onOpenNewOperation}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Operação</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-zinc-800 text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              <th className="pb-3 font-semibold pl-2">Data</th>
              <th className="pb-3 font-semibold">Talhão</th>
              <th className="pb-3 font-semibold">Operação</th>
              <th className="pb-3 font-semibold">Detalhes</th>
              <th className="pb-3 font-semibold">Responsável</th>
              <th className="pb-3 font-semibold text-right pr-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
            {operations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-zinc-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Calendar className="w-8 h-8 text-slate-400 dark:text-zinc-600" />
                    <p className="font-semibold text-sm text-slate-700 dark:text-zinc-300">Nenhum lançamento encontrado</p>
                    <p className="text-xs text-slate-400">
                      Clique em "Nova Operação" acima para registrar intervenções no caderno.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOperations.map(op => (
                <tr key={op.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="py-3 pl-2 text-sm text-slate-700 dark:text-zinc-300 whitespace-nowrap font-mono">
                    {new Date(op.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 text-sm text-slate-900 dark:text-white font-bold">
                    {fields.find(f => f.id === op.fieldId)?.name || 'Talhão Geral'}
                  </td>
                  <td className="py-3 text-slate-700 dark:text-zinc-300 uppercase tracking-wide text-xs font-bold">
                    {op.type === 'soil_prep' && 'Preparo do Solo'}
                    {op.type === 'planting' && 'Plantio'}
                    {op.type === 'nursery_transplant' && (
                      <span className="text-teal-600 dark:text-teal-400 flex items-center gap-1">
                        <Flower2 className="w-3.5 h-3.5" /> Transplante Viveiro
                      </span>
                    )}
                    {op.type === 'nursery_sowing' && (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Leaf className="w-3.5 h-3.5" /> Semeadura Viveiro
                      </span>
                    )}
                    {op.type === 'nursery_hardening' && (
                      <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Boxes className="w-3.5 h-3.5" /> Rustificação
                      </span>
                    )}
                    {op.type === 'hydroponics_planting' && (
                      <span className="text-teal-600 dark:text-teal-400 flex items-center gap-1">
                        <Sprout className="w-3.5 h-3.5" /> Transplante Hidropônico
                      </span>
                    )}
                    {op.type === 'hydroponics_nutrient' && (
                      <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5" /> Solução Nutritiva / Correção
                      </span>
                    )}
                    {op.type === 'hydroponics_harvest' && (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Colheita Hidropônica
                      </span>
                    )}
                    {op.type === 'hydroponics_ph_ec' && (
                      <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5" /> Medição pH / CE
                      </span>
                    )}
                    {op.type === 'hydroponics_sanitation' && (
                      <span className="text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Sanitização Perfis
                      </span>
                    )}
                    {op.type === 'hydroponics_diary' && (
                      <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> Diário Hidropônico
                      </span>
                    )}
                    {op.type === 'tankmix_application' && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <FlaskConical className="w-3.5 h-3.5" /> Aplicação TankMix (Calda)
                      </span>
                    )}
                    {op.type === 'buffalo_milking' && (
                      <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                        🐃 Búfalos: C. Leiteiro
                      </span>
                    )}
                    {op.type === 'buffalo_sanitary' && (
                      <span className="text-sky-700 dark:text-sky-400 font-bold flex items-center gap-1">
                        🛡️ Búfalos: Sanitário
                      </span>
                    )}
                    {op.type === 'caprine_vaccination' && (
                      <span className="text-red-700 dark:text-red-400 font-bold flex items-center gap-1">
                        🐐 Caprinos: Vacinação
                      </span>
                    )}
                    {op.type === 'caprine_milk' && (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                        🥛 Caprinos: C. Leiteiro
                      </span>
                    )}
                    {op.type === 'equine_farriery' && (
                      <span className="text-orange-700 dark:text-orange-400 font-bold flex items-center gap-1">
                        🐴 Equinos: Casqueamento
                      </span>
                    )}
                    {op.type === 'equine_vaccination' && (
                      <span className="text-indigo-700 dark:text-indigo-400 font-bold flex items-center gap-1">
                        🏥 Equinos: Vacina/Exame
                      </span>
                    )}
                    {op.type === 'swine_weaning' && (
                      <span className="text-pink-700 dark:text-pink-400 font-bold flex items-center gap-1">
                        🐖 Suínos: Desmame
                      </span>
                    )}
                    {op.type === 'swine_feeding' && (
                      <span className="text-yellow-700 dark:text-yellow-500 font-bold flex items-center gap-1">
                        🌽 Suínos: Alimentação
                      </span>
                    )}
                    {op.type === 'spraying' && 'Pulverização'}
                    {op.type === 'fertility' && 'Adubação'}
                    {op.type === 'irrigation' && 'Irrigação'}
                    {op.type === 'harvest' && 'Colheita'}
                    {op.type === 'monitoring' && 'Monitoramento'}
                    {op.type === 'other' && 'Outros'}
                  </td>
                  <td className="py-3 text-sm text-slate-600 dark:text-zinc-400">
                    {op.details.sprayOrderCode ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                          <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-mono">
                            Ordem #{op.details.sprayOrderCode}
                          </span>
                          <span>{op.details.product || 'Calda TankMix'}</span>
                        </span>
                        {op.details.tankMixProducts && op.details.tankMixProducts.length > 0 && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            {op.details.tankMixProducts.length} defensivos • pH {op.details.waterPh ?? '--'} • {op.details.volume || 0} L total
                          </span>
                        )}
                        {op.notes && <span className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-1 italic">"{op.notes}"</span>}
                      </div>
                    ) : op.details.benchCode ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-300 font-bold text-xs">
                          <span className="bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                            {op.details.benchCode}
                          </span>
                          <span>
                            {op.details.crop || 'Cultivo'} {op.details.variety ? `(${op.details.variety})` : ''}
                          </span>
                        </span>
                        {(op.details.phMeasured !== undefined || op.details.ecMeasured !== undefined) && (
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                            {op.details.phMeasured !== undefined && `pH: ${op.details.phMeasured}`}
                            {op.details.phMeasured !== undefined && op.details.ecMeasured !== undefined && ' • '}
                            {op.details.ecMeasured !== undefined && `CE: ${op.details.ecMeasured} mS/cm`}
                          </span>
                        )}
                        {op.notes && <span className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-1 italic">"{op.notes}"</span>}
                      </div>
                    ) : op.details.nurseryBatchId ? (
                      <span className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-300 font-semibold text-xs">
                        Lote {op.details.nurseryBatchId} ({op.details.seedlingCount?.toLocaleString() || 0} mudas)
                      </span>
                    ) : (
                      op.details.machine || op.details.product || op.details.crop || op.notes || 'N/A'
                    )}
                  </td>
                  <td className="py-3 text-sm text-slate-600 dark:text-zinc-400 font-medium">{op.responsible}</td>
                  <td className="py-3 pr-2 text-right">
                    <span
                      className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        op.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                          : op.status === 'planned'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                      }`}
                    >
                      {op.status === 'completed' ? 'CONCLUÍDO' : op.status === 'planned' ? 'PLANEJADO' : 'EM ANDAMENTO'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FieldBookOperationsView;
