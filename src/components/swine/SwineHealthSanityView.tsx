// @ts-nocheck
import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  AlertTriangle,
  Clock,
  Pill,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import {
  SwineAnimal,
  SwineHealthRecord,
} from '../../types/swine';

interface SwineHealthSanityViewProps {
  animals: SwineAnimal[];
  onAddHealthRecordToAnimal: (animalId: string, record: SwineHealthRecord) => void;
}

export const SwineHealthSanityView: React.FC<SwineHealthSanityViewProps> = ({
  animals,
  onAddHealthRecordToAnimal,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [selectedAnimalId, setSelectedAnimalId] = useState(animals[0]?.id || '');
  const [healthType, setHealthType] = useState<SwineHealthRecord['type']>('Vacinação');
  const [productName, setProductName] = useState('Vacina Parvovirose + Leptospirose + Erisipela (Farrowsure)');
  const [activeIngredient, setActiveIngredient] = useState('Vírus Inativado + Bacterina');
  const [dosage, setDosage] = useState('2.0 mL');
  const [route, setRoute] = useState<SwineHealthRecord['route']>('Intramuscular (IM)');
  const [withdrawalDays, setWithdrawalDays] = useState(0);
  const [vetName, setVetName] = useState('Dr. Rodrigo Albuquerque CRMV-RS');
  const [notes, setNotes] = useState('');

  // Collect all health logs across animals
  const allLogs: { animalCode: string; animalId: string; record: SwineHealthRecord }[] = [];
  animals.forEach(a => {
    a.healthHistory.forEach(h => {
      allLogs.push({
        animalCode: a.code,
        animalId: a.id,
        record: h,
      });
    });
  });

  allLogs.sort((a, b) => new Date(b.record.date).getTime() - new Date(a.record.date).getTime());

  // Count active withdrawals
  const activeWithdrawals = allLogs.filter(l => {
    if (l.record.withdrawalDays === 0) return false;
    const treatTime = new Date(l.record.date).getTime();
    const endTime = treatTime + l.record.withdrawalDays * 86400000;
    return Date.now() < endTime;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimalId) return;

    const newRecord: SwineHealthRecord = {
      id: `hlth_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: healthType,
      productName,
      activeIngredient,
      dosage,
      route,
      withdrawalDays: Number(withdrawalDays),
      veterinarianOrOperator: vetName,
      status: 'Concluído',
      notes: notes.trim() || undefined,
    };

    onAddHealthRecordToAnimal(selectedAnimalId, newRecord);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Sanidade Suína, Vacinômetro & Controle de Carência</span>
          </h2>
          <p className="text-xs text-gray-500">
            Cronograma vacinal obrigatório, registro de tratamentos veterinários e segurança para abate (Carência Zero).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Manejo Sanitário</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Total de Aplicações</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{(allLogs || []).length}</div>
          <span className="text-[11px] text-gray-500 font-medium">registros auditados</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Animais em Carência</span>
          <div className={`text-2xl font-black mt-1 ${(activeWithdrawals || []).length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {(activeWithdrawals || []).length}
          </div>
          <span className="text-[11px] text-gray-500 font-medium">
            {(activeWithdrawals || []).length > 0 ? 'Bloqueados para abate' : 'Nenhum bloqueio'}
          </span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Conformidade Vacinal</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">98.5%</div>
          <span className="text-[11px] text-emerald-600 font-medium">Protocolo em dia</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Vacinas Críticas</span>
          <div className="text-2xl font-black text-gray-900 mt-1">PCV2 + Myco</div>
          <span className="text-[11px] text-emerald-600 font-medium">100% Cobertura</span>
        </div>
      </div>

      {/* Health History Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Livro de Registro Sanitário & Carência Medicamentosa
        </h3>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Animal</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Medicamento / Vacina</th>
                <th className="p-3 text-center">Dose / Via</th>
                <th className="p-3 text-center">Carência (Dias)</th>
                <th className="p-3">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allLogs.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/60">
                  <td className="p-3 font-medium text-gray-900">{item.record.date}</td>
                  <td className="p-3 font-bold text-pink-700">{item.animalCode}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full font-bold text-[10px] text-gray-700">
                      {item.record.type}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-gray-900">{item.record.productName}</td>
                  <td className="p-3 text-center text-gray-600">{item.record.dosage} ({item.record.route})</td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.record.withdrawalDays === 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.record.withdrawalDays === 0 ? 'Zero (Livre)' : `${item.record.withdrawalDays} dias`}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">{item.record.veterinarianOrOperator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-gray-900">Registrar Aplicação Sanitária</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Suíno / Matriz *</label>
                <select
                  value={selectedAnimalId}
                  onChange={e => setSelectedAnimalId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
                >
                  {animals.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.code} - {a.breed} ({a.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Tipo de Manejo</label>
                  <select
                    value={healthType}
                    onChange={e => setHealthType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
                  >
                    <option value="Vacinação">Vacinação</option>
                    <option value="Tratamento Antibiótico">Tratamento Antibiótico</option>
                    <option value="Suplementação de Ferro (Maternidade)">Suplementação de Ferro (Fe)</option>
                    <option value="Desverminação / Antiparasitário">Desverminação</option>
                    <option value="Anti-inflamatório">Anti-inflamatório</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Via de Aplicação</label>
                  <select
                    value={route}
                    onChange={e => setRoute(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
                  >
                    <option value="Intramuscular (IM)">Intramuscular (IM)</option>
                    <option value="Subcutânea (SC)">Subcutânea (SC)</option>
                    <option value="Oral">Oral</option>
                    <option value="Água de Bebida">Água de Bebida</option>
                    <option value="Ração">Ração</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Dose Aplicada</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={e => setDosage(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Período de Carência (Dias)</label>
                  <input
                    type="number"
                    value={withdrawalDays}
                    onChange={e => setWithdrawalDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Veterinário / Aplicador</label>
                <input
                  type="text"
                  value={vetName}
                  onChange={e => setVetName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Salvar Aplicação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
