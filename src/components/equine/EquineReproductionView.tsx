import React, { useState } from 'react';
import {
  Heart,
  Calendar,
  Plus,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  X,
  Droplet,
  ShieldCheck,
  User,
  Scale,
} from 'lucide-react';
import {
  EquineAnimal,
  EquineReproductionRecord,
  EquineReproductionType,
} from '../../types/equine';

interface Props {
  animals: EquineAnimal[];
  reproductionRecords: EquineReproductionRecord[];
  onAddReproduction: (record: EquineReproductionRecord) => void;
  onUpdateReproduction: (record: EquineReproductionRecord) => void;
  onNavigateTab: (tabId: string, animalId?: string) => void;
}

export const EquineReproductionView: React.FC<Props> = ({
  animals,
  reproductionRecords,
  onAddReproduction,
  onUpdateReproduction,
  onNavigateTab,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'gestantes' | 'ia_te' | 'semen'>('all');

  // Form states
  const [formData, setFormData] = useState<Partial<EquineReproductionRecord>>({
    femaleId: animals.find(a => a.sex === 'Égua')?.id || '',
    maleId: animals.find(a => a.sex === 'Garanhão')?.id || '',
    type: 'Inseminação Artificial (IA) Sêmen Fresco',
    date: new Date().toISOString().split('T')[0],
    outcome: 'Aguardando DG',
    veterinarian: 'Dra. Camila Repro - CRMV 19482',
    costBrl: 1200,
    semenMotilityPct: 80,
    semenConcentrationMillionMl: 150,
    notes: '',
  });

  const mares = animals.filter(a => a.sex === 'Égua');
  const stallions = animals.filter(a => a.sex === 'Garanhão');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.femaleId || !formData.maleId) return;

    // Calculate expected foaling date (~340 days)
    const breedDate = new Date(formData.date || new Date());
    const foalingDate = new Date(breedDate);
    foalingDate.setDate(foalingDate.getDate() + 340);

    const newRecord: EquineReproductionRecord = {
      ...(formData as EquineReproductionRecord),
      id: `rep-${Date.now()}`,
      expectedFoalingDate: foalingDate.toISOString().split('T')[0],
    };

    onAddReproduction(newRecord);
    setIsModalOpen(false);
  };

  const filteredRecords = reproductionRecords.filter(r => {
    if (selectedTab === 'gestantes') return r.outcome === 'Gestante Confirmada';
    if (selectedTab === 'ia_te') return r.type.includes('Inseminação') || r.type.includes('Transferência');
    if (selectedTab === 'semen') return r.type.includes('Sêmen');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-[10px] font-black uppercase text-rose-900 tracking-wider flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-600" /> Centro de Reprodução Equina & Biotecnologias
          </div>
          <h2 className="text-xl font-black text-stone-900">
            Manejo Reprodutivo, IA, TE & Maternidade
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Controle de coberturas, coletas de sêmen, diagnósticos de gestação (DG) e previsão de partos
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Evento Reprodutivo</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">Matrizes & Doadoras</span>
          <span className="text-2xl font-black text-stone-900">{mares.length}</span>
          <span className="text-[11px] text-stone-500 block mt-0.5">Éguas ativas no plantel</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-rose-700 font-bold uppercase block">Gestantes Confirmadas</span>
          <span className="text-2xl font-black text-rose-950">
            {reproductionRecords.filter(r => r.outcome === 'Gestante Confirmada').length}
          </span>
          <span className="text-[11px] text-rose-700 block mt-0.5">DG positivo com feto viável</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-blue-700 font-bold uppercase block">Garanhões Reprodutores</span>
          <span className="text-2xl font-black text-blue-950">{stallions.length}</span>
          <span className="text-[11px] text-blue-700 block mt-0.5">Coletas periódicas e sêmen</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-emerald-700 font-bold uppercase block">Taxa de Prenhez (DG 28d)</span>
          <span className="text-2xl font-black text-emerald-950">87.5%</span>
          <span className="text-[11px] text-emerald-700 block mt-0.5">Eficiência reprodutiva</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setSelectedTab('all')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
            selectedTab === 'all' ? 'bg-rose-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          Todos os Registros ({reproductionRecords.length})
        </button>
        <button
          onClick={() => setSelectedTab('gestantes')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
            selectedTab === 'gestantes' ? 'bg-rose-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          Éguas Gestantes
        </button>
        <button
          onClick={() => setSelectedTab('ia_te')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
            selectedTab === 'ia_te' ? 'bg-rose-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          Biotecnologias (IA & TE)
        </button>
        <button
          onClick={() => setSelectedTab('semen')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
            selectedTab === 'semen' ? 'bg-rose-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          Banco de Sêmen & Coletas
        </button>
      </div>

      {/* Records Listing */}
      <div className="space-y-4">
        {(filteredRecords || []).filter(r => r && r.id).map(record => {
          const female = (animals || []).find(a => a?.id === record?.femaleId);
          const male = (animals || []).find(a => a?.id === record?.maleId);

          return (
            <div
              key={record.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-rose-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-xl font-bold">
                    ❤️
                  </div>
                  <div>
                    <h3 className="font-black text-stone-900 text-sm">{record.type}</h3>
                    <div className="text-xs text-stone-500 font-medium">
                      Data da Cobertura/IA: <strong>{new Date(record.date).toLocaleDateString('pt-BR')}</strong> • Vet: {record.veterinarian}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black px-3 py-1 rounded-full ${
                    record.outcome === 'Gestante Confirmada' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                    record.outcome === 'Parto Concluído' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {record.outcome}
                  </span>
                </div>
              </div>

              {/* Parents details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
                  <span className="text-[10px] text-rose-800 font-bold uppercase block">Fêmea / Égua</span>
                  <strong className="text-stone-900 block mt-0.5">{female?.name || 'Égua'}</strong>
                  <span className="text-[10px] text-stone-500">{female?.registrationNumber}</span>
                </div>

                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                  <span className="text-[10px] text-blue-800 font-bold uppercase block">Macho / Garanhão</span>
                  <strong className="text-stone-900 block mt-0.5">{male?.name || 'Garanhão'}</strong>
                  <span className="text-[10px] text-stone-500">{male?.registrationNumber}</span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Previsão de Parto (340d)</span>
                  <strong className="text-stone-900 block mt-0.5 font-mono">
                    {record.expectedFoalingDate ? new Date(record.expectedFoalingDate).toLocaleDateString('pt-BR') : 'N/A'}
                  </strong>
                  <span className="text-[10px] text-amber-800 font-bold">Maternidade 01</span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Qualidade do Sêmen</span>
                  <strong className="text-stone-900 block mt-0.5 font-mono">
                    {record.semenMotilityPct ? `${record.semenMotilityPct}% motilidade` : 'N/A'}
                  </strong>
                  <span className="text-[10px] text-stone-500">
                    {record.semenConcentrationMillionMl ? `${record.semenConcentrationMillionMl} mi/mL` : 'Fresco'}
                  </span>
                </div>
              </div>

              {/* Ultrasound DG Timeline (if any) */}
              {record.pregnancyDiagnoses && record.pregnancyDiagnoses.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider block mb-1.5">
                    Histórico de Diagnósticos Ultrassonográficos (DG):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {record.pregnancyDiagnoses.map(dg => (
                      <div key={dg.id} className="p-2 bg-stone-50 rounded-lg border border-stone-200 text-[11px]">
                        <div className="flex justify-between font-bold text-stone-800">
                          <span>DG {dg.daysPostBreeding} dias</span>
                          <span className="text-emerald-700">{dg.result}</span>
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5">{dg.notes}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {record.notes && (
                <div className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                  <strong>Observações:</strong> {record.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: New Reproduction Record */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-rose-950 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">❤️</span>
                <h3 className="font-black text-sm">Registrar Cobertura / IA / TE</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs text-stone-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Égua / Matriz *</label>
                  <select
                    value={formData.femaleId}
                    onChange={e => setFormData({ ...formData, femaleId: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  >
                    {mares.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.registrationNumber})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Garanhão Reprodutor *</label>
                  <select
                    value={formData.maleId}
                    onChange={e => setFormData({ ...formData, maleId: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  >
                    {stallions.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.registrationNumber})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Tipo de Procedimento</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as EquineReproductionType })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    <option value="Monta Natural">Monta Natural</option>
                    <option value="Inseminação Artificial (IA) Sêmen Fresco">IA - Sêmen Fresco</option>
                    <option value="Inseminação Artificial (IA) Sêmen Refrigerado">IA - Sêmen Refrigerado</option>
                    <option value="Inseminação Artificial (IA) Sêmen Congelado">IA - Sêmen Congelado</option>
                    <option value="Transferência de Embrião (TE)">Transferência de Embrião (TE)</option>
                    <option value="Coleta de Sêmen">Coleta de Sêmen</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Data do Procedimento</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Status do Diagnóstico (DG)</label>
                  <select
                    value={formData.outcome}
                    onChange={e => setFormData({ ...formData, outcome: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  >
                    <option value="Aguardando DG">Aguardando DG (14 dias)</option>
                    <option value="Gestante Confirmada">Gestante Confirmada</option>
                    <option value="Vazia">Vazia</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Médico(a) Veterinário(a)</label>
                  <input
                    type="text"
                    value={formData.veterinarian || ''}
                    onChange={e => setFormData({ ...formData, veterinarian: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Observações Reprodutivas</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Detalhes sobre ovulação, protocolo de sincronização ou lavagem..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl shadow-md cursor-pointer"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
