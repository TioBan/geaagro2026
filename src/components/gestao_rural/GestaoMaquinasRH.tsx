import React, { useState } from 'react';
import {
  Tractor,
  Users,
  Wrench,
  ShieldCheck,
  Plus,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import {
  MaquinaImplementoRecord,
  ManutencaoPreventivaRecord,
  FuncionarioRuralRecord,
} from '../../types/gestaoRural';

interface GestaoMaquinasRHProps {
  maquinas: MaquinaImplementoRecord[];
  manutencoes: ManutencaoPreventivaRecord[];
  funcionarios: FuncionarioRuralRecord[];
  onAddMaquina: (maquina: MaquinaImplementoRecord) => void;
  onAddFuncionario: (func: FuncionarioRuralRecord) => void;
  onAddManutencao: (manut: ManutencaoPreventivaRecord) => void;
}

export const GestaoMaquinasRH: React.FC<GestaoMaquinasRHProps> = ({
  maquinas,
  manutencoes,
  funcionarios,
  onAddMaquina,
  onAddFuncionario,
  onAddManutencao,
}) => {
  const [activeTab, setActiveTab] = useState<'maquinas' | 'rh' | 'manutencoes'>('maquinas');
  const [showAddMaqModal, setShowAddMaquinaModal] = useState(false);
  const [showAddFuncModal, setShowAddFuncionarioModal] = useState(false);

  const [newMaq, setNewMaq] = useState<Partial<MaquinaImplementoRecord>>({
    codigo: `TR-0${maquinas.length + 1}`,
    nome: '',
    tipo: 'Trator',
    marcaModelo: '',
    anoFabricacao: new Date().getFullYear(),
    horimetroOuKmAtual: 0,
    consumoMedioLitersHour: 0,
    status: 'ativo',
    proximaManutencaoHorimetro: 0,
    custoManutencaoAcumuladoR$: 0,
    observacoes: '',
  });

  const [newFunc, setNewFunc] = useState<Partial<FuncionarioRuralRecord>>({
    nome: '',
    cpf: '',
    cargoFuncao: 'Operador de Máquinas',
    salarioBaseR$: 0,
    dataAdmissao: new Date().toISOString().split('T')[0],
    treinamentosEPIs: [],
    jornadaHorasDiarias: 8,
    horasExtrasMes: 0,
    status: 'ativo',
  });

  const handleSaveMaquina = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaq.nome) return;

    const created: MaquinaImplementoRecord = {
      id: `maq-${Date.now()}`,
      codigo: newMaq.codigo || `MAQ-${Date.now()}`,
      nome: newMaq.nome,
      tipo: (newMaq.tipo as any) || 'Trator',
      marcaModelo: newMaq.marcaModelo || 'Geral',
      anoFabricacao: Number(newMaq.anoFabricacao) || 2022,
      horimetroOuKmAtual: Number(newMaq.horimetroOuKmAtual) || 0,
      consumoMedioLitersHour: Number(newMaq.consumoMedioLitersHour) || 15,
      status: (newMaq.status as any) || 'ativo',
      proximaManutencaoHorimetro: Number(newMaq.proximaManutencaoHorimetro) || 500,
      custoManutencaoAcumuladoR$: Number(newMaq.custoManutencaoAcumuladoR$) || 0,
      observacoes: newMaq.observacoes || '',
    };

    onAddMaquina(created);
    setShowAddMaquinaModal(false);
  };

  const handleSaveFuncionario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFunc.nome) return;

    const created: FuncionarioRuralRecord = {
      id: `func-${Date.now()}`,
      nome: newFunc.nome,
      cpf: newFunc.cpf || '000.000.000-00',
      cargoFuncao: newFunc.cargoFuncao || 'Operador',
      salarioBaseR$: Number(newFunc.salarioBaseR$) || 3000,
      dataAdmissao: newFunc.dataAdmissao || new Date().toISOString().split('T')[0],
      treinamentosEPIs: newFunc.treinamentosEPIs || ['NR-31'],
      episEntregues: [
        { item: 'Botina de Segurança', dataEntrega: new Date().toISOString().split('T')[0], validade: '2027-01-01' },
      ],
      jornadaHorasDiarias: 8,
      horasExtrasMes: Number(newFunc.horasExtrasMes) || 0,
      status: 'ativo',
      talhoesAtribuidos: [],
    };

    onAddFuncionario(created);
    setShowAddFuncionarioModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase text-[10px] tracking-wider">
            <Tractor className="w-4 h-4" />
            Módulos 8 & 9 • Frotas, Máquinas & Recursos Humanos Rural
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Gestão de Maquinário, Manutenções & Equipe
          </h2>
          <p className="text-slate-500">
            Controle de horímetro, consumo de combustível, planos preventivos, EPIs e folhas de pagamento
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddMaquinaModal(true)}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <Tractor className="w-4 h-4" />
            <span>Nova Máquina</span>
          </button>
          <button
            onClick={() => setShowAddFuncionarioModal(true)}
            className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>Novo Funcionário</span>
          </button>
        </div>
      </div>

      {/* NAVIGATION SUB-TABS */}
      <div className="flex items-center gap-2 border-b pb-2">
        <button
          onClick={() => setActiveTab('maquinas')}
          className={`px-4 py-2 font-bold rounded-xl cursor-pointer ${
            activeTab === 'maquinas'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
          }`}
        >
          Frota de Máquinas ({maquinas.length})
        </button>
        <button
          onClick={() => setActiveTab('rh')}
          className={`px-4 py-2 font-bold rounded-xl cursor-pointer ${
            activeTab === 'rh'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
          }`}
        >
          Equipe & RH ({funcionarios.length})
        </button>
        <button
          onClick={() => setActiveTab('manutencoes')}
          className={`px-4 py-2 font-bold rounded-xl cursor-pointer ${
            activeTab === 'manutencoes'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
          }`}
        >
          Histórico de Manutenções ({manutencoes.length})
        </button>
      </div>

      {/* MÁQUINAS TAB */}
      {activeTab === 'maquinas' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {maquinas.map(m => {
            const horasParaManut = m.proximaManutencaoHorimetro - m.horimetroOuKmAtual;
            return (
              <div
                key={m.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                      {m.codigo} • {m.tipo}
                    </span>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white mt-1">
                      {m.nome}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] uppercase">
                    {m.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-zinc-300 border-y py-2">
                  <div>
                    <span className="block text-slate-400 font-bold">Modelo / Ano:</span>
                    <span>
                      {m.marcaModelo} ({m.anoFabricacao})
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-bold">Horímetro Atual:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {m.horimetroOuKmAtual} h
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-bold">Consumo Médio:</span>
                    <span>{m.consumoMedioLitersHour} L/h</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-bold">Manutenção em:</span>
                    <span className="font-bold text-amber-600">{horasParaManut} h</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-bold">Custo Acumulado:</span>
                  <span className="font-black text-slate-900 dark:text-white font-mono">
                    R$ {m.custoManutencaoAcumuladoR$.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RH TAB */}
      {activeTab === 'rh' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {funcionarios.map(f => (
            <div
              key={f.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-2xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">{f.nome}</h4>
                  <span className="text-[11px] text-emerald-600 font-bold block">
                    {f.cargoFuncao} • CPF: {f.cpf}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] uppercase">
                  {f.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] border-y py-2">
                <div>
                  <span className="block text-slate-400 font-bold">Salário Base:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    R$ {f.salarioBaseR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold">Admissão:</span>
                  <span>{f.dataAdmissao}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Treinamentos & Normas Regulamentadoras
                </span>
                <div className="flex flex-wrap gap-1">
                  {f.treinamentosEPIs.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-md text-[10px] font-bold"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {maquinas.length === 0 && (
            <div className="col-span-full p-8 text-center bg-slate-50 dark:bg-zinc-800/20 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 text-slate-500 dark:text-zinc-400">
              Nenhuma máquina ou implemento cadastrado. Clique em &ldquo;Cadastrar Máquina&rdquo; para adicionar.
            </div>
          )}
        </div>
      )}

      {/* ADD MÁQUINA MODAL */}
      {showAddMaqModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-lg w-full space-y-4">
            <h3 className="font-black text-base border-b pb-2">Cadastrar Nova Máquina</h3>
            <form onSubmit={handleSaveMaquina} className="space-y-3">
              <div>
                <label className="block font-bold">Nome do Equipamento</label>
                <input
                  type="text"
                  placeholder="Ex: Trator MF 4707"
                  value={newMaq.nome}
                  onChange={e => setNewMaq({ ...newMaq, nome: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold">Tipo</label>
                  <select
                    value={newMaq.tipo}
                    onChange={e => setNewMaq({ ...newMaq, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                  >
                    <option value="Trator">Trator</option>
                    <option value="Pulverizador">Pulverizador</option>
                    <option value="Plantadeira">Plantadeira</option>
                    <option value="Colheitadeira">Colheitadeira</option>
                    <option value="Caminhão">Caminhão</option>
                    <option value="Implemento">Implemento</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold">Horímetro Atual</label>
                  <input
                    type="number"
                    value={newMaq.horimetroOuKmAtual}
                    onChange={e =>
                      setNewMaq({ ...newMaq, horimetroOuKmAtual: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddMaquinaModal(false)}
                  className="px-4 py-2 bg-slate-200 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
                >
                  Salvar Máquina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD FUNCIONÁRIO MODAL */}
      {showAddFuncModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-lg w-full space-y-4">
            <h3 className="font-black text-base border-b pb-2">Cadastrar Funcionário Rural</h3>
            <form onSubmit={handleSaveFuncionario} className="space-y-3">
              <div>
                <label className="block font-bold">Nome Completo</label>
                <input
                  type="text"
                  value={newFunc.nome}
                  onChange={e => setNewFunc({ ...newFunc, nome: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold">Cargo / Função</label>
                  <input
                    type="text"
                    value={newFunc.cargoFuncao}
                    onChange={e => setNewFunc({ ...newFunc, cargoFuncao: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                  />
                </div>
                <div>
                  <label className="block font-bold">Salário Base (R$)</label>
                  <input
                    type="number"
                    value={newFunc.salarioBaseR$}
                    onChange={e =>
                      setNewFunc({ ...newFunc, salarioBaseR$: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddFuncionarioModal(false)}
                  className="px-4 py-2 bg-slate-200 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                >
                  Salvar Funcionário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
