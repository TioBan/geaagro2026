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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shovel className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Classificação Pedológica, Relevo & Aptidão Agrícola
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Diagnóstico do solo, topografia, capacidade de uso (USDA) e aptidão agrícola (Embrapa)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {sucesso && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Dados salvos!
            </span>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" /> Salvar Diagnóstico
          </button>
        </div>
      </div>

      {/* 1. Atributos do Solo & Topografia */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
          <Mountain className="w-4 h-4 text-emerald-500" />
          1. Atributos Físicos e Químicos do Solo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Classe de Solo (SiBCS - Embrapa)
            </label>
            <input
              type="text"
              value={solosForm.classeSolo}
              onChange={(e) => setSolosForm({ ...solosForm, classeSolo: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Textura do Solo
            </label>
            <select
              value={solosForm.textura}
              onChange={(e: any) => setSolosForm({ ...solosForm, textura: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="Muito Argilosa (>60%)">Muito Argilosa (&gt;60% argila)</option>
              <option value="Argilosa (35-60%)">Argilosa (35-60% argila)</option>
              <option value="Média (15-35%)">Textura Média (15-35% argila)</option>
              <option value="Arenosa (<15%)">Arenosa (&lt;15% argila)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Profundidade Efetiva do Solo
            </label>
            <select
              value={solosForm.profundidadeEfetiva}
              onChange={(e: any) => setSolosForm({ ...solosForm, profundidadeEfetiva: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="Muito profunda (>2m)">Muito profunda (&gt;2,0 m)</option>
              <option value="Profunda (1-2m)">Profunda (1,0 a 2,0 m)</option>
              <option value="Moderada (0.5-1m)">Moderadamente profunda (0,5 a 1,0 m)</option>
              <option value="Rasa (<0.5m)">Rasa (&lt;0,5 m)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Fertilidade Química Natural
            </label>
            <select
              value={solosForm.fertilidadeQuimica}
              onChange={(e: any) => setSolosForm({ ...solosForm, fertilidadeQuimica: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="Alta">Alta (Eutrófico)</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa (Distrófico / Álico)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Relevo Predominante
            </label>
            <select
              value={solosForm.relevo}
              onChange={(e: any) => setSolosForm({ ...solosForm, relevo: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="Plano (0-3%)">Plano (0 a 3% declividade)</option>
              <option value="Suave Ondulado (3-8%)">Suave Ondulado (3 a 8% declividade)</option>
              <option value="Ondulado (8-20%)">Ondulado (8 a 20% declividade)</option>
              <option value="Forte Ondulado (20-45%)">Forte Ondulado (20 a 45% declividade)</option>
              <option value="Montanhoso (>45%)">Montanhoso (&gt;45% declividade)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Aptidão à Mecanização Agrícola
            </label>
            <select
              value={solosForm.mecanizacaoAptidao}
              onChange={(e: any) => setSolosForm({ ...solosForm, mecanizacaoAptidao: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold text-emerald-600 dark:text-emerald-400"
            >
              <option value="Totalmente mecanizável">Totalmente mecanizável</option>
              <option value="Parcialmente mecanizável">Parcialmente mecanizável</option>
              <option value="Não mecanizável">Não mecanizável</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Capacidade de Uso & Aptidão Agrícola */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
          <Sprout className="w-4 h-4 text-emerald-500" />
          2. Classificação de Capacidade de Uso (USDA) & Aptidão (Embrapa)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Classe de Capacidade de Uso do Solo
            </label>
            <select
              value={aptidaoForm.classeCapacidadeUso}
              onChange={(e: any) => setAptidaoForm({ ...aptidaoForm, classeCapacidadeUso: e.target.value })}
              className="w-full px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            >
              {CLASSES_CAPACIDADE_USO.map((c) => (
                <option key={c.classe} value={c.classe}>
                  {c.classe} - {c.descricao}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Aptidão Agrícola das Terras (Sistema Embrapa)
            </label>
            <select
              value={aptidaoForm.aptidaoAgricolaEmbrapa}
              onChange={(e: any) => setAptidaoForm({ ...aptidaoForm, aptidaoAgricolaEmbrapa: e.target.value })}
              className="w-full px-3 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            >
              {APTIDOES_EMBRAPA.map((a) => (
                <option key={a.aptidao} value={a.aptidao}>
                  {a.aptidao} ({a.desc.slice(0, 45)}...)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Potencial para Irrigação
            </label>
            <select
              value={aptidaoForm.potencialIrrigacao}
              onChange={(e: any) => setAptidaoForm({ ...aptidaoForm, potencialIrrigacao: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="Alto">Alto (Mananciais perenes com vazão outorgável)</option>
              <option value="Médio">Médio (Requer represamento ou poços profundos)</option>
              <option value="Baixo">Baixo (Disponibilidade restrita na estiagem)</option>
              <option value="Inexistente">Inexistente</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Práticas Conservacionistas Adotadas
            </label>
            <input
              type="text"
              value={aptidaoForm.praticasConservacionistas}
              onChange={(e) => setAptidaoForm({ ...aptidaoForm, praticasConservacionistas: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
