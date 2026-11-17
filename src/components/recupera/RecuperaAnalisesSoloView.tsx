import React, { useState, useEffect } from 'react';
import { AreaDegradadaItem, AnaliseSoloItem } from '../../types/recupera';
import { useTimedFlag } from './useTimedFlag';
import {
  FlaskConical,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

interface Props {
  areaAtiva: AreaDegradadaItem;
  analises: AnaliseSoloItem[];
  onSalvarAnalises: (analisesAtualizadas: AnaliseSoloItem[]) => void;
}

export const RecuperaAnalisesSoloView: React.FC<Props> = ({
  areaAtiva,
  analises,
  onSalvarAnalises
}) => {
  const analisesDaArea = analises.filter(a => a.areaId === areaAtiva.id);
  const [salvo, dispararSalvo] = useTimedFlag(3000);

  const [formNova, setFormNova] = useState<AnaliseSoloItem>({
    id: `analise-${Date.now()}`,
    areaId: areaAtiva.id,
    dataColeta: new Date().toISOString().split('T')[0],
    laboratorio: 'Laboratório de Solos Oficial',
    numeroLaudo: `LAUDO-${Math.floor(1000 + Math.random() * 9000)}`,
    profundidade: '0-20 cm',
    texturaSolo: 'argilosa',
    argilaPct: 45,
    siltePct: 15,
    areiaPct: 40,
    phAgua: 5.1,
    phCacl2: 4.5,
    materiaOrganicaGDm3: 18,
    pResinaMgDm3: 4.5,
    pMehlichMgDm3: 3.8,
    kCmolcDm3: 0.15,
    caCmolcDm3: 1.8,
    mgCmolcDm3: 0.6,
    alCmolcDm3: 0.4,
    hAlCmolcDm3: 4.2,
    sbCmolcDm3: 2.55,
    ctcEfetivaT: 2.95,
    ctcPh7T: 6.75,
    saturacaoBasesVpct: 38,
    saturacaoAluminioMpct: 14,
    enxofreS: 5.2,
    boroB: 0.25,
    cobreCu: 0.8,
    ferroFe: 28,
    manganesMn: 12,
    zincoZn: 1.1,
    densidadeSoloGcm3: 1.35,
    resistenciaPenetracaoMpa: 2.5,
    observacoes: 'Amostra composta representativa de 15 pontos subamostrais.'
  });

  const handleCalcularSomas = () => {
    const sb = formNova.caCmolcDm3 + formNova.mgCmolcDm3 + formNova.kCmolcDm3;
    const tEfetiva = sb + formNova.alCmolcDm3;
    const tPh7 = sb + formNova.hAlCmolcDm3;
    const v = tPh7 > 0 ? (sb / tPh7) * 100 : 0;
    const m = tEfetiva > 0 ? (formNova.alCmolcDm3 / tEfetiva) * 100 : 0;

    setFormNova(prev => ({
      ...prev,
      sbCmolcDm3: Number(sb.toFixed(2)),
      ctcEfetivaT: Number(tEfetiva.toFixed(2)),
      ctcPh7T: Number(tPh7.toFixed(2)),
      saturacaoBasesVpct: Math.round(v),
      saturacaoAluminioMpct: Math.round(m)
    }));
  };

  useEffect(() => {
    setFormNova(prev => ({ ...prev, areaId: areaAtiva.id }));
  }, [areaAtiva.id]);

  const handleAdicionarAnalise = (e: React.FormEvent) => {
    e.preventDefault();
    const novaLista = [...analises, { ...formNova, areaId: areaAtiva.id, id: `analise-${Date.now()}` }];
    onSalvarAnalises(novaLista);
    dispararSalvo();
  };

  const handleRemoverAnalise = (id: string) => {
    if (window.confirm('Deseja excluir este laudo de análise de solo?')) {
      const novaLista = analises.filter(a => a.id !== id);
      onSalvarAnalises(novaLista);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-emerald-600" />
            <span>Análises de Solo & Fertilidade: {areaAtiva.nomeTalhao}</span>
          </h2>
          <p className="text-xs text-slate-500">
            Registro de laudos analíticos em camadas (0-20 cm e 20-40 cm), nutrientes e CTC
          </p>
        </div>

        <button
          type="button"
          onClick={handleCalcularSomas}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition flex items-center gap-2 self-start sm:self-auto"
        >
          <FlaskConical className="w-4 h-4 text-emerald-600" />
          <span>Calcular CTC & V%</span>
        </button>
      </div>

      {salvo && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Análise de solo cadastrada com sucesso!</span>
        </div>
      )}

      {/* Formulário de Registro de Laudo */}
      <form onSubmit={handleAdicionarAnalise} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <Plus className="w-4 h-4 text-emerald-600" />
          <span>Registrar Novo Laudo Laboratorial de Solo</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Data da Coleta</label>
            <input
              type="date"
              value={formNova.dataColeta}
              onChange={e => setFormNova({ ...formNova, dataColeta: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Laboratório</label>
            <input
              type="text"
              value={formNova.laboratorio}
              onChange={e => setFormNova({ ...formNova, laboratorio: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Nº do Laudo</label>
            <input
              type="text"
              value={formNova.numeroLaudo}
              onChange={e => setFormNova({ ...formNova, numeroLaudo: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Profundidade</label>
            <select
              value={formNova.profundidade}
              onChange={e => setFormNova({ ...formNova, profundidade: e.target.value as any })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            >
              <option value="0-20 cm">0-20 cm (Camada Arável)</option>
              <option value="20-40 cm">20-40 cm (Subsuperficial / Gessagem)</option>
              <option value="40-60 cm">40-60 cm (Perfil Profundo)</option>
            </select>
          </div>
        </div>

        {/* Químicos Básicos */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">pH em Água</label>
            <input
              type="number"
              step="0.1"
              value={formNova.phAgua}
              onChange={e => setFormNova({ ...formNova, phAgua: parseFloat(e.target.value) || 0 })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">M.O. (g/dm³)</label>
            <input
              type="number"
              value={formNova.materiaOrganicaGDm3}
              onChange={e => setFormNova({ ...formNova, materiaOrganicaGDm3: parseFloat(e.target.value) || 0 })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">P (mg/dm³)</label>
            <input
              type="number"
              step="0.1"
              value={formNova.pResinaMgDm3}
              onChange={e => setFormNova({ ...formNova, pResinaMgDm3: parseFloat(e.target.value) || 0 })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">K (cmolc/dm³)</label>
            <input
              type="number"
              step="0.01"
              value={formNova.kCmolcDm3}
              onChange={e => setFormNova({ ...formNova, kCmolcDm3: parseFloat(e.target.value) || 0 })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Ca (cmolc/dm³)</label>
            <input
              type="number"
              step="0.1"
              value={formNova.caCmolcDm3}
              onChange={e => setFormNova({ ...formNova, caCmolcDm3: parseFloat(e.target.value) || 0 })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Mg (cmolc/dm³)</label>
            <input
              type="number"
              step="0.1"
              value={formNova.mgCmolcDm3}
              onChange={e => setFormNova({ ...formNova, mgCmolcDm3: parseFloat(e.target.value) || 0 })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
        </div>

        {/* Acidez & CTC Calculada */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Al³⁺ (cmolc/dm³)</label>
            <input
              type="number"
              step="0.1"
              value={formNova.alCmolcDm3}
              onChange={e => setFormNova({ ...formNova, alCmolcDm3: parseFloat(e.target.value) || 0 })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">H+Al (cmolc/dm³)</label>
            <input
              type="number"
              step="0.1"
              value={formNova.hAlCmolcDm3}
              onChange={e => setFormNova({ ...formNova, hAlCmolcDm3: parseFloat(e.target.value) || 0 })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="block text-emerald-800 dark:text-emerald-300 font-bold mb-1">CTC a pH 7 (T)</label>
            <input
              type="number"
              step="0.01"
              value={formNova.ctcPh7T}
              readOnly
              className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-100/50 dark:bg-emerald-900/40 font-bold text-emerald-900 dark:text-emerald-200"
            />
          </div>
          <div>
            <label className="block text-emerald-800 dark:text-emerald-300 font-bold mb-1">Saturação Bases V%</label>
            <input
              type="number"
              value={formNova.saturacaoBasesVpct}
              readOnly
              className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-100/50 dark:bg-emerald-900/40 font-bold text-emerald-900 dark:text-emerald-200"
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Argila (%)</label>
            <input
              type="number"
              value={formNova.argilaPct}
              onChange={e => setFormNova({ ...formNova, argilaPct: parseFloat(e.target.value) || 0 })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow"
          >
            <Save className="w-4 h-4" />
            <span>Adicionar ao Histórico do Solo</span>
          </button>
        </div>
      </form>

      {/* Lista de Análises Cadastradas */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Laudos Históricos do Talhão ({analisesDaArea.length})</span>
        </h3>

        {analisesDaArea.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            Nenhuma análise de solo cadastrada para este talhão ainda. Cadastre acima para alimentar as calculadoras de calagem e gessagem.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analisesDaArea.map(a => (
              <div key={a.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-600">{a.numeroLaudo} • {a.profundidade}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoverAnalise(a.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-slate-500">Coleta: {a.dataColeta} • Lab: {a.laboratorio}</p>
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div><span>pH:</span> <strong>{a.phAgua}</strong></div>
                  <div><span>V%:</span> <strong>{a.saturacaoBasesVpct}%</strong></div>
                  <div><span>CTC:</span> <strong>{a.ctcPh7T}</strong></div>
                  <div><span>Argila:</span> <strong>{a.argilaPct}%</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
