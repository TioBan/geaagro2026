import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Car,
  UserCheck,
  Sparkles,
  Lock,
} from 'lucide-react';
import {
  SwineBiosecurityLog,
} from '../../types/swine';

interface SwineBiosecurityViewProps {
  checks: SwineBiosecurityLog[];
  onAddCheck: (check: SwineBiosecurityLog) => void;
  onUpdateCheck: (check: SwineBiosecurityLog) => void;
}

export const SwineBiosecurityView: React.FC<SwineBiosecurityViewProps> = ({
  checks,
  onAddCheck,
  onUpdateCheck,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [type, setType] = useState<SwineBiosecurityLog['type']>('Acesso de Visitante');
  const [description, setDescription] = useState('Desinfecção de Caminhão no Arco e troca de botas');
  const [responsibleName, setResponsibleName] = useState('Danilo Duarte (Inspetor de Granja)');
  const [status, setStatus] = useState<SwineBiosecurityLog['status']>('Conforme');
  const [downtimeHours, setDowntimeHours] = useState(72);
  const [showerTaken, setShowerTaken] = useState(true);
  const [vehicleDisinfected, setVehicleDisinfected] = useState(true);
  const [notes, setNotes] = useState('Aspersão completa com glutaraldeído + amônia quaternária 1:500');

  const conformingCount = checks.filter(c => c.status === 'Conforme').length;
  const compliancePct = (checks || []).length > 0 ? ((conformingCount / (checks || []).length) * 100).toFixed(1) : '100';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newCheck: SwineBiosecurityLog = {
      id: `bio_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type,
      description,
      responsibleName,
      status,
      downtimeHoursObserved: downtimeHours,
      showerTakenAndBootsChanged: showerTaken,
      vehicleDisinfected,
      notes,
    };

    onAddCheck(newCheck);
    setIsModalOpen(false);
  };

  const handleToggle = (item: SwineBiosecurityLog) => {
    onUpdateCheck({
      ...item,
      status: item.status === 'Conforme' ? 'Não Conforme / Advertência' : 'Conforme',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>Biosseguridade & Barreiras Sanitárias</span>
          </h2>
          <p className="text-xs text-gray-500">
            Controle de acesso, rodolúvio, arco de desinfecção, vazio sanitário de visitantes (72h), cerca perimetral e quarentenário.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Auditoria de Biossegurança</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Índice de Conformidade</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{compliancePct}%</div>
          <span className="text-[11px] text-emerald-600 font-medium">Nível Excelente (&gt; 95%)</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Vazio Sanitário Visitantes</span>
          <div className="text-2xl font-black text-gray-900 mt-1">72 Horas</div>
          <span className="text-[11px] text-gray-500 font-medium">Livre de contato prévio</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Rodolúvio & Arco</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">Ativos</div>
          <span className="text-[11px] text-emerald-600 font-medium">Concentração 1:500</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Quarentena de Reposição</span>
          <div className="text-2xl font-black text-pink-600 mt-1">30 Dias</div>
          <span className="text-[11px] text-gray-500 font-medium">Sorologia negativa</span>
        </div>
      </div>

      {/* Checklist Cards */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Auditoria de Barreiras e Procedimentos Operacionais Padrão (POP)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checks.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                item.status === 'Conforme' ? 'bg-white border-gray-200' : 'bg-red-50/50 border-red-200'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                    {item.type}
                  </span>
                  <span className="text-[11px] text-gray-500">{item.date}</span>
                </div>
                <h4 className="text-sm font-bold text-gray-900">{item.description}</h4>
                {item.notes && <p className="text-xs text-gray-600">{item.notes}</p>}
                <span className="text-[11px] text-gray-500 block">Auditor: {item.responsibleName}</span>
              </div>

              <button
                onClick={() => handleToggle(item)}
                className={`p-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors ${
                  item.status === 'Conforme'
                    ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                    : 'bg-red-100 hover:bg-red-200 text-red-800'
                }`}
              >
                {item.status === 'Conforme' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{item.status}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-gray-900">Nova Auditoria de Biosseguridade</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tipo de Evento *</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
                >
                  <option value="Acesso de Visitante">Acesso de Visitante (Vazio 72h)</option>
                  <option value="Caminhão de Ração">Caminhão de Ração (Arco Desinfecção)</option>
                  <option value="Caminhão de Carga / Animais">Caminhão de Carga / Animais</option>
                  <option value="Vazio Sanitário">Vazio Sanitário de Galpão</option>
                  <option value="Controle de Roedores / Moscas">Controle de Roedores e Pragas</option>
                  <option value="Destino de Carcaças / Compostagem">Destino de Carcaças / Compostagem</option>
                  <option value="Quarentena de Reposição">Quarentena de Reposição</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Descrição do Evento *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Observações Técnicas</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Auditor / Responsável</label>
                  <input
                    type="text"
                    value={responsibleName}
                    onChange={e => setResponsibleName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
                  >
                    <option value="Conforme">Conforme</option>
                    <option value="Não Conforme / Advertência">Não Conforme / Advertência</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
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
