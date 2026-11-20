import React, { useState, useEffect, useRef } from 'react';
import {
  CaracterizacaoSoloTopografia,
  AptidaoCapacidadeUsoInfo,
  ClasseCapacidadeUso,
  AptidaoAgricolaEmbrapa
} from '../../types/avaliacaoImoveis';
import { Shovel, Save, CheckCircle2, Sprout, Mountain } from 'lucide-react';

interface Props {
  solosTopografia: CaracterizacaoSoloTopografia;
  aptidao: AptidaoCapacidadeUsoInfo;
  onSalvar: (solos: CaracterizacaoSoloTopografia, aptidao: AptidaoCapacidadeUsoInfo) => void;
}

const CLASSES_CAPACIDADE_USO: { classe: ClasseCapacidadeUso; descricao: string }[] = [
  { classe: 'Classe I', descricao: 'Terras cultiváveis, aparentemente sem limitações para lavouras anuais.' },
  { classe: 'Classe II', descricao: 'Terras cultiváveis com limitações moderadas de manejo ou conservação.' },
  { classe: 'Classe III', descricao: 'Terras cultiváveis com severas limitações que exigem práticas complexas.' },
  { classe: 'Classe IV', descricao: 'Terras adaptáveis apenas a cultivos ocasionais ou pastagens/silvicultura.' },
  { classe: 'Classe V', descricao: 'Terras adaptadas para pastagens ou silvicultura, sem riscos graves de erosão.' },
  { classe: 'Classe VI', descricao: 'Terras com limitações severas, adequadas a pastagens e florestas protetoras.' },
  { classe: 'Classe VII', descricao: 'Terras com limitações muito severas, adequadas apenas para vegetação florestal.' },
  { classe: 'Classe VIII', descricao: 'Terras imprestáveis para cultura, pastagem ou silvicultura; conservação total.' }
];

const APTIDOES_EMBRAPA: { aptidao: AptidaoAgricolaEmbrapa; desc: string }[] = [
  { aptidao: '1 - Boa para Lavouras', desc: 'Aptidão agrícola plena para culturas de ciclo curto e perenes com alta tecnologia.' },
  { aptidao: '2 - Regular para Lavouras', desc: 'Aptidão moderada, suscetível a veranicos ou restrições físico-químicas contornáveis.' },
  { aptidao: '3 - Restrita para Lavouras', desc: 'Aptidão marginal para lavouras, recomendando-se rotação com pastagens.' },
  { aptidao: '4 - Apta para Pastagem Plantada', desc: 'Ideal para gramíneas forrageiras e pecuária de corte/leite intensiva.' },
  { aptidao: '5 - Apta para Silvicultura', desc: 'Vocação para eucalipto, pinus, teca ou mogno africano.' },
  { aptidao: '6 - Preservação da Fauna e Flora', desc: 'Áreas de preservação permanente e refúgio ecológico.' }
];

const inputCls =
  'w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500';
const labelCls = 'block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const AvaliacaoAptidaoSolosView: React.FC<Props> = ({
  solosTopografia,
  aptidao,
  onSalvar
}) => {
  const [solosForm, setSolosForm] = useState<CaracterizacaoSoloTopografia>({ ...solosTopografia });
  const [aptidaoForm, setAptidaoForm] = useState<AptidaoCapacidadeUsoInfo>({ ...aptidao });
  const [sucesso, setSucesso] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSolosForm({ ...solosTopografia });
    setAptidaoForm({ ...aptidao });
  }, [solosTopografia, aptidao]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvar(solosForm, aptidaoForm);
    setSucesso(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSucesso(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Shovel className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Classificação Pedológica, Relevo & Aptidão Agrícola
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Diagnóstico do solo, topografia, capacidade de uso (USDA) e aptidão agrícola (Embrapa)
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {sucesso && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Dados salvos
            </span>
          )}
          <button
            type="submit"
            className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> Salvar Diagnóstico
          </button>
        </div>
      </div>

      {/* 1. Atributos do Solo & Topografia */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-4">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
          <Mountain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          1. Atributos Físicos e Químicos do Solo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Classe de Solo (SiBCS - Embrapa)</label>
            <input
              type="text"
              value={solosForm.classeSolo}
              onChange={(e) => setSolosForm({ ...solosForm, classeSolo: e.target.value })}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Textura do Solo</label>
            <select
              value={solosForm.textura}
              onChange={(e) =>
                setSolosForm({
                  ...solosForm,
                  textura: e.target.value as CaracterizacaoSoloTopografia['textura']
                })
              }
              className={inputCls}
            >
              <option value="Muito Argilosa (>60%)">Muito Argilosa (&gt;60% argila)</option>
              <option value="Argilosa (35-60%)">Argilosa (35-60% argila)</option>
              <option value="Média (15-35%)">Textura Média (15-35% argila)</option>
              <option value="Arenosa (<15%)">Arenosa (&lt;15% argila)</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Profundidade Efetiva do Solo</label>
            <select
              value={solosForm.profundidadeEfetiva}
              onChange={(e) =>
                setSolosForm({
                  ...solosForm,
                  profundidadeEfetiva: e.target.value as CaracterizacaoSoloTopografia['profundidadeEfetiva']
                })
              }
              className={inputCls}
            >
              <option value="Muito profunda (>2m)">Muito profunda (&gt;2,0 m)</option>
              <option value="Profunda (1-2m)">Profunda (1,0 a 2,0 m)</option>
              <option value="Moderada (0.5-1m)">Moderadamente profunda (0,5 a 1,0 m)</option>
              <option value="Rasa (<0.5m)">Rasa (&lt;0,5 m)</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Fertilidade Química Natural</label>
            <select
              value={solosForm.fertilidadeQuimica}
              onChange={(e) =>
                setSolosForm({
                  ...solosForm,
                  fertilidadeQuimica: e.target.value as CaracterizacaoSoloTopografia['fertilidadeQuimica']
                })
              }
              className={inputCls}
            >
              <option value="Alta">Alta (Eutrófico)</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa (Distrófico / Álico)</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Relevo Predominante</label>
            <select
              value={solosForm.relevo}
              onChange={(e) =>
                setSolosForm({
                  ...solosForm,
                  relevo: e.target.value as CaracterizacaoSoloTopografia['relevo']
                })
              }
              className={inputCls}
            >
              <option value="Plano (0-3%)">Plano (0 a 3% declividade)</option>
              <option value="Suave Ondulado (3-8%)">Suave Ondulado (3 a 8% declividade)</option>
              <option value="Ondulado (8-20%)">Ondulado (8 a 20% declividade)</option>
              <option value="Forte Ondulado (20-45%)">Forte Ondulado (20 a 45% declividade)</option>
              <option value="Montanhoso (>45%)">Montanhoso (&gt;45% declividade)</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Aptidão à Mecanização Agrícola</label>
            <select
              value={solosForm.mecanizacaoAptidao}
              onChange={(e) =>
                setSolosForm({
                  ...solosForm,
                  mecanizacaoAptidao: e.target.value as CaracterizacaoSoloTopografia['mecanizacaoAptidao']
                })
              }
              className={`${inputCls} font-semibold text-emerald-700 dark:text-emerald-400`}
            >
              <option value="Totalmente mecanizável">Totalmente mecanizável</option>
              <option value="Parcialmente mecanizável">Parcialmente mecanizável</option>
              <option value="Não mecanizável">Não mecanizável</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Capacidade de Uso & Aptidão Agrícola */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-4">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
          <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          2. Classificação de Capacidade de Uso (USDA) & Aptidão (Embrapa)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Classe de Capacidade de Uso do Solo</label>
            <select
              value={aptidaoForm.classeCapacidadeUso}
              onChange={(e) =>
                setAptidaoForm({
                  ...aptidaoForm,
                  classeCapacidadeUso: e.target.value as ClasseCapacidadeUso
                })
              }
              className={`${inputCls} font-medium`}
            >
              {CLASSES_CAPACIDADE_USO.map((c) => (
                <option key={c.classe} value={c.classe}>
                  {c.classe} - {c.descricao}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Aptidão Agrícola das Terras (Sistema Embrapa)</label>
            <select
              value={aptidaoForm.aptidaoAgricolaEmbrapa}
              onChange={(e) =>
                setAptidaoForm({
                  ...aptidaoForm,
                  aptidaoAgricolaEmbrapa: e.target.value as AptidaoAgricolaEmbrapa
                })
              }
              className={`${inputCls} font-semibold text-emerald-700 dark:text-emerald-400`}
            >
              {APTIDOES_EMBRAPA.map((a) => (
                <option key={a.aptidao} value={a.aptidao}>
                  {a.aptidao} ({a.desc.slice(0, 45)}...)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Potencial para Irrigação</label>
            <select
              value={aptidaoForm.potencialIrrigacao}
              onChange={(e) =>
                setAptidaoForm({
                  ...aptidaoForm,
                  potencialIrrigacao: e.target.value as AptidaoCapacidadeUsoInfo['potencialIrrigacao']
                })
              }
              className={inputCls}
            >
              <option value="Alto">Alto (Mananciais perenes com vazão outorgável)</option>
              <option value="Médio">Médio (Requer represamento ou poços profundos)</option>
              <option value="Baixo">Baixo (Disponibilidade restrita na estiagem)</option>
              <option value="Inexistente">Inexistente</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Práticas Conservacionistas Adotadas</label>
            <input
              type="text"
              value={aptidaoForm.praticasConservacionistas}
              onChange={(e) =>
                setAptidaoForm({ ...aptidaoForm, praticasConservacionistas: e.target.value })
              }
              className={inputCls}
            />
          </div>
        </div>
      </div>
    </form>
  );
};
