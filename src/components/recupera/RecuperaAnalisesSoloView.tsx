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

const INPUT_CLASS =
  'w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition';

const INPUT_WHITE_CLASS =
  'w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition';

export const RecuperaAnalisesSoloView: React.FC<Props> = ({
  areaAtiva,
  analises,
  onSalvarAnalises
}) => {
  const analisesDaArea = analises.filter(a => a.areaId === areaAtiva.id);
  const [salvo, dispararSalvo] = useTimedFlag(3000);
  const [confirmandoExcluirId, setConfirmandoExcluirId] = useState<string | null>(null);

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
    setFormNova(prev => {
      const sb = prev.caCmolcDm3 + prev.mgCmolcDm3 + prev.kCmolcDm3;
      const tEfetiva = sb + prev.alCmolcDm3;
      const tPh7 = sb + prev.hAlCmolcDm3;
      const v = tPh7 > 0 ? (sb / tPh7) * 100 : 0;
      const m = tEfetiva > 0 ? (prev.alCmolcDm3 / tEfetiva) * 100 : 0;

      return {
        ...prev,
        sbCmolcDm3: Number(sb.toFixed(2)),
        ctcEfetivaT: Number(tEfetiva.toFixed(2)),
        ctcPh7T: Number(tPh7.toFixed(2)),
        saturacaoBasesVpct: Math.round(v),
        saturacaoAluminioMpct: Math.round(m)
      };
    });
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

  const handleConfirmarExcluir = (id: string) => {
    onSalvarAnalises(analises.filter(a => a.id !== id));
    setConfirmandoExcluirId(null);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Análises de Solo & Fertilidade: {areaAtiva.nomeTalhao}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Registro de laudos analíticos em camadas (0-20 cm e 20-40 cm), nutrientes e CTC
          </p>
        </div>

        <button
          type="button"
          onClick={handleCalcularSomas}
          className="h-9 px-3.5 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 font-medium text-xs rounded-lg transition inline-flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap"
        >
          <FlaskConical className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Calcular CTC & V%</span>
        </button>
      </div>

      {salvo && (
        <div className="px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70 rounded-lg text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Análise de solo cadastrada com sucesso.</span>
        </div>
      )}

      {/* Formulário de Registro de Laudo */}
      <form
        onSubmit={handleAdicionarAnalise}
        className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 space-y-4 text-xs"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
          <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Registrar Novo Laudo Laboratorial de Solo</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Data da Coleta</label>
            <input
              type="date"
              value={formNova.dataColeta}
              onChange={e => setFormNova(prev => ({ ...prev, dataColeta: e.target.value }))}
              className={`${INPUT_CLASS} tabular-nums`}
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Laboratório</label>
            <input
              type="text"
              value={formNova.laboratorio}
              onChange={e => setFormNova(prev => ({ ...prev, laboratorio: e.target.value }))}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Nº do Laudo</label>
            <input
              type="text"
              value={formNova.numeroLaudo}
              onChange={e => setFormNova(prev => ({ ...prev, numeroLaudo: e.target.value }))}
              className={`${INPUT_CLASS} font-mono`}
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Profundidade</label>
            <select
              value={formNova.profundidade}
              onChange={e =>
                setFormNova(prev => ({ ...prev, profundidade: e.target.value as AnaliseSoloItem['profundidade'] }))
              }
              className={`${INPUT_CLASS} font-medium`}
            >
              <option value="0-20 cm">0-20 cm (Camada Arável)</option>
              <option value="20-40 cm">20-40 cm (Subsuperficial / Gessagem)</option>
              <option value="40-60 cm">40-60 cm (Perfil Profundo)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">pH em Água</label>
            <input
              type="number"
              step="0.1"
              value={formNova.phAgua}
              onChange={e => setFormNova(prev => ({ ...prev, phAgua: parseFloat(e.target.value) || 0 }))}
              className={`${INPUT_CLASS} font-semibold tabular-nums`}
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">M.O. (g/dm³)</label>
            <input
              type="number"
              value={formNova.materiaOrganicaGDm3}
              onChange={e => setFormNova(prev => ({ ...prev, materiaOrganicaGDm3: parseFloat(e.target.value) || 0 }))}
              className={`${INPUT_CLASS} tabular-nums`}
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">P (mg/dm³)</label>
            <input
              type="number"
              step="0.1"
              value={formNova.pResinaMgDm3}
              onChange={e => setFormNova(prev => ({ ...prev, pResinaMgDm3: parseFloat(e.target.value) || 0 }))}
              className={`${INPUT_CLASS} tabular-nums`}
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">K (cmolc/dm³)</label>
            <input
              type="number"
              step="0.01"
              value={formNova.kCmolcDm3}
              onChange={e => setFormNova(prev => ({ ...prev, kCmolcDm3: parseFloat(e.target.value) || 0 }))}
              className={`${INPUT_CLASS} tabular-nums`}
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Ca (cmolc/dm³)</label>
            <input
              type="number"
              step="0.1"
              value={formNova.caCmolcDm3}
              onChange={e => setFormNova(prev => ({ ...prev, caCmolcDm3: parseFloat(e.target.value) || 0 }))}
              className={`${INPUT_CLASS} tabular-nums`}
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Mg (cmolc/dm³)</label>
            <input
              type="number"
              step="0.1"
              value={formNova.mgCmolcDm3}
              onChange={e => setFormNova(prev => ({ ...prev, mgCmolcDm3: parseFloat(e.target.value) || 0 }))}
              className={`${INPUT_CLASS} tabular-nums`}
            />
          </div>
        </div>

        {/* Acidez & CTC Calculada */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/70 dark:border-emerald-900/60">
          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Al³⁺ (cmolc/dm³)</label>
            <input
              type="number"
              step="0.1"
              value={formNova.alCmolcDm3}
              onChange={e => setFormNova(prev => ({ ...prev, alCmolcDm3: parseFloat(e.target.value) || 0 }))}
              className={`${INPUT_WHITE_CLASS} tabular-nums`}
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">H+Al (cmolc/dm³)</label>
            <input
              type="number"
              step="0.1"
              value={formNova.hAlCmolcDm3}
              onChange={e => setFormNova(prev => ({ ...prev, hAlCmolcDm3: parseFloat(e.target.value) || 0 }))}
              className={`${INPUT_WHITE_CLASS} tabular-nums`}
            />
          </div>
          <div>
            <label className="block text-emerald-700 dark:text-emerald-400 font-semibold mb-1">CTC a pH 7 (T)</label>
            <input
              type="number"
              step="0.01"
              value={formNova.ctcPh7T}
              readOnly
              className="w-full h-9 px-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/80 dark:bg-emerald-950/50 text-xs font-semibold text-emerald-900 dark:text-emerald-200 tabular-nums"
            />
          </div>
          <div>
            <label className="block text-emerald-700 dark:text-emerald-400 font-semibold mb-1">Saturação Bases V%</label>
            <input
              type="number"
              value={formNova.saturacaoBasesVpct}
              readOnly
              className="w-full h-9 px-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/80 dark:bg-emerald-950/50 text-xs font-semibold text-emerald-900 dark:text-emerald-200 tabular-nums"
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Argila (%)</label>
            <input
              type="number"
              value={formNova.argilaPct}
              onChange={e => setFormNova(prev => ({ ...prev, argilaPct: parseFloat(e.target.value) || 0 }))}
              className={`${INPUT_WHITE_CLASS} font-semibold tabular-nums`}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs inline-flex items-center gap-1.5 transition whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Adicionar ao Histórico do Solo</span>
          </button>
        </div>
      </form>

      {/* Lista de Análises Cadastradas */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="tabular-nums">Laudos Históricos do Talhão ({analisesDaArea.length})</span>
        </h3>

        {analisesDaArea.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-xs">
            Nenhuma análise de solo cadastrada para este talhão ainda. Cadastre acima para alimentar as calculadoras de calagem e gessagem.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analisesDaArea.map(a => {
              const isConfirmando = confirmandoExcluirId === a.id;
              return (
                <div
                  key={a.id}
                  className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-200/80 dark:border-zinc-800 text-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                      {a.numeroLaudo} • {a.profundidade}
                    </span>

                    {isConfirmando ? (
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className="text-rose-600 dark:text-rose-400 font-medium">Excluir?</span>
                        <button
                          type="button"
                          onClick={() => handleConfirmarExcluir(a.id)}
                          className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium"
                        >
                          Sim
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmandoExcluirId(null)}
                          className="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded font-medium"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmandoExcluirId(a.id)}
                        className="h-7 w-7 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        aria-label="Excluir análise"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-slate-500 dark:text-zinc-400 tabular-nums">
                    Coleta: {a.dataColeta} • Lab: {a.laboratorio}
                  </p>

                  <div className="grid grid-cols-4 gap-2 pt-2.5 border-t border-slate-100 dark:border-zinc-800 tabular-nums">
                    <div>
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">pH</span>
                      <strong className="font-semibold text-slate-900 dark:text-zinc-100">{a.phAgua}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">V%</span>
                      <strong className="font-semibold text-slate-900 dark:text-zinc-100">{a.saturacaoBasesVpct}%</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">CTC</span>
                      <strong className="font-semibold text-slate-900 dark:text-zinc-100">{a.ctcPh7T}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">Argila</span>
                      <strong className="font-semibold text-slate-900 dark:text-zinc-100">{a.argilaPct}%</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
