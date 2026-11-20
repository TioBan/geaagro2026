import React, { useState, useEffect } from 'react';
import { AreaDegradadaItem, AnaliseSoloItem } from '../../types/recupera';
import {
  calcularCalagemRecupera,
  calcularGessagemRecupera,
  calcularAdubacaoRecupera,
  calcularSementesRecupera,
  calcularMudasRecupera
} from '../../utils/recuperaCalculos';
import {
  Calculator,
  Sparkles,
  Layers,
  FlaskConical,
  Sprout,
  TreePine,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

interface Props {
  areaAtiva?: AreaDegradadaItem;
  analises: AnaliseSoloItem[];
}

interface MemoriaCalculoData {
  titulo: string;
  formula?: string;
  passosCalculo: string[];
  referenciaBibliografica?: string;
}

const INPUT_CLASS =
  'w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 tabular-nums';

const LABEL_CLASS =
  'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

const MemoriaCalculoCard: React.FC<{
  memoria: MemoriaCalculoData;
  mostrarDetalhesCompletos?: boolean;
}> = ({ memoria, mostrarDetalhesCompletos = false }) => (
  <div className="p-3.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800 text-xs space-y-2">
    <p className="font-semibold text-slate-900 dark:text-zinc-100">{memoria.titulo}</p>
    {mostrarDetalhesCompletos && memoria.formula && (
      <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-md border border-slate-200/80 dark:border-zinc-800">
        {memoria.formula}
      </p>
    )}
    <div className="space-y-1 text-[11px] text-slate-600 dark:text-zinc-400 pt-0.5 leading-relaxed tabular-nums">
      {memoria.passosCalculo.map((p, idx) => (
        <p key={idx}>{p}</p>
      ))}
    </div>
    {mostrarDetalhesCompletos && memoria.referenciaBibliografica && (
      <p className="text-[10px] text-slate-400 dark:text-zinc-500 pt-2 border-t border-slate-200/70 dark:border-zinc-800">
        Ref: {memoria.referenciaBibliografica}
      </p>
    )}
  </div>
);

type TipoCalculadora = 'calagem' | 'gessagem' | 'adubacao' | 'sementes' | 'mudas';

const CALCULADORAS: { key: TipoCalculadora; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'calagem', label: 'Calagem', icon: Sparkles },
  { key: 'gessagem', label: 'Gessagem', icon: Layers },
  { key: 'adubacao', label: 'Adubação NPK', icon: FlaskConical },
  { key: 'sementes', label: 'Sementes VC%', icon: Sprout },
  { key: 'mudas', label: 'Mudas Nativas', icon: TreePine }
];

export const RecuperaCalculadorasView: React.FC<Props> = ({
  areaAtiva,
  analises
}) => {
  const [calcAtiva, setCalcAtiva] = useState<TipoCalculadora>('calagem');
  const [areaHaInput, setAreaHaInput] = useState<string>(() =>
    areaAtiva?.areaHa ? String(areaAtiva.areaHa) : ''
  );

  useEffect(() => {
    if (areaAtiva?.areaHa) {
      setAreaHaInput(String(areaAtiva.areaHa));
    } else {
      setAreaHaInput('');
    }
  }, [areaAtiva?.id, areaAtiva?.areaHa]);

  const ultimaAnalise = areaAtiva
    ? analises.find(a => a.areaId === areaAtiva.id)
    : analises[0];

  // 1. Calagem
  const [ctcCalagem, setCtcCalagem] = useState<string>('');
  const [vAtualCalagem, setVAtualCalagem] = useState<string>('');
  const [vDesejadoCalagem, setVDesejadoCalagem] = useState<string>('');
  const [prntCalagem, setPrntCalagem] = useState<string>('');
  const [profundidadeCalagem, setProfundidadeCalagem] = useState<string>('');
  const [custoTonCalcario, setCustoTonCalcario] = useState<string>('');

  // 2. Gessagem
  const [argilaGessagem, setArgilaGessagem] = useState<string>('');
  const [finalidadeGessagem, setFinalidadeGessagem] = useState<'pastagem' | 'cultura_anual' | 'reflorestamento' | ''>('');
  const [custoTonGesso, setCustoTonGesso] = useState<string>('');

  // 3. Adubação
  const [pDisponivel, setPDisponivel] = useState<string>('');
  const [kDisponivel, setKDisponivel] = useState<string>('');
  const [argilaAdubacao, setArgilaAdubacao] = useState<string>('');

  // 4. Sementes
  const [especieSemente, setEspecieSemente] = useState<string>('');
  const [purezaSemente, setPurezaSemente] = useState<string>('');
  const [germinacaoSemente, setGerminacaoSemente] = useState<string>('');
  const [taxaPadraoKgHa, setTaxaPadraoKgHa] = useState<string>('');
  const [custoSementeKg, setCustoSementeKg] = useState<string>('');

  // 5. Mudas
  const [especieMuda, setEspecieMuda] = useState<string>('');
  const [espacamentoLinha, setEspacamentoLinha] = useState<string>('');
  const [espacamentoPlanta, setEspacamentoPlanta] = useState<string>('');
  const [custoMudaUnitario, setCustoMudaUnitario] = useState<string>('');

  const handleImportarUltimaAnalise = () => {
    if (!ultimaAnalise) return;
    if (ultimaAnalise.ctcPh7T) setCtcCalagem(String(ultimaAnalise.ctcPh7T));
    if (ultimaAnalise.saturacaoBasesVpct) setVAtualCalagem(String(ultimaAnalise.saturacaoBasesVpct));
    if (ultimaAnalise.argilaPct) {
      setArgilaGessagem(String(ultimaAnalise.argilaPct));
      setArgilaAdubacao(String(ultimaAnalise.argilaPct));
    }
    if (ultimaAnalise.pResinaMgDm3) setPDisponivel(String(ultimaAnalise.pResinaMgDm3));
    if (ultimaAnalise.kCmolcDm3) setKDisponivel(String(ultimaAnalise.kCmolcDm3));
  };

  const toNum = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  const areaHaVal = toNum(areaHaInput);

  const calagemPronta =
    ctcCalagem !== '' &&
    vAtualCalagem !== '' &&
    vDesejadoCalagem !== '' &&
    toNum(prntCalagem) > 0 &&
    toNum(profundidadeCalagem) > 0 &&
    areaHaVal > 0;

  const gessagemPronta =
    toNum(argilaGessagem) > 0 &&
    finalidadeGessagem !== '' &&
    areaHaVal > 0;

  const adubacaoPronta =
    pDisponivel !== '' &&
    kDisponivel !== '' &&
    argilaAdubacao !== '' &&
    areaHaVal > 0;

  const sementesPronta =
    toNum(purezaSemente) > 0 &&
    toNum(germinacaoSemente) > 0 &&
    toNum(taxaPadraoKgHa) > 0 &&
    areaHaVal > 0;

  const mudasPronta =
    toNum(espacamentoLinha) > 0 &&
    toNum(espacamentoPlanta) > 0 &&
    areaHaVal > 0;

  const resCalagem =
    calcAtiva === 'calagem' && calagemPronta
      ? calcularCalagemRecupera({
          ctcPh7T: toNum(ctcCalagem),
          vAtualPct: toNum(vAtualCalagem),
          vDesejadoPct: toNum(vDesejadoCalagem),
          prntPct: toNum(prntCalagem),
          profundidadeCm: toNum(profundidadeCalagem),
          areaHa: areaHaVal,
          custoPorToneladaR$: toNum(custoTonCalcario)
        })
      : null;

  const resGessagem =
    calcAtiva === 'gessagem' && gessagemPronta
      ? calcularGessagemRecupera({
          argilaPct: toNum(argilaGessagem),
          areaHa: areaHaVal,
          finalidade: finalidadeGessagem as 'pastagem' | 'cultura_anual' | 'reflorestamento',
          custoPorToneladaR$: toNum(custoTonGesso)
        })
      : null;

  const resAdubacao =
    calcAtiva === 'adubacao' && adubacaoPronta
      ? calcularAdubacaoRecupera({
          areaHa: areaHaVal,
          tipoRecuperacao: 'pastagem_reforma',
          teorFosforoMgDm3: toNum(pDisponivel),
          teorPotassioCmolcDm3: toNum(kDisponivel),
          teorArgilaPct: toNum(argilaAdubacao)
        })
      : null;

  const resSementes =
    calcAtiva === 'sementes' && sementesPronta
      ? calcularSementesRecupera({
          especieCultivar: especieSemente.trim() || 'Forrageira / Cobertura',
          purezaPct: toNum(purezaSemente),
          germinacaoPct: toNum(germinacaoSemente),
          taxaPadrãoRecomendadaKgHa: toNum(taxaPadraoKgHa),
          areaHa: areaHaVal,
          custoSementePorKgR$: toNum(custoSementeKg)
        })
      : null;

  const resMudas =
    calcAtiva === 'mudas' && mudasPronta
      ? calcularMudasRecupera({
          especieNome: especieMuda.trim() || 'Espécies Nativas',
          grupoEcologico: 'pioneira',
          espacamentoLinhaM: toNum(espacamentoLinha),
          espacamentoEntrePlantasM: toNum(espacamentoPlanta),
          areaHa: areaHaVal,
          custoPorMudaR$: toNum(custoMudaUnitario)
        })
      : null;

  return (
    <div className="space-y-4">
      {/* Cabeçalho e Abas das Calculadoras */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-200/80 dark:border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Fase 3 • Engenharia & Cálculos Agronômicos
          </span>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2 mt-0.5">
            <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Calculadoras Especializadas de Recuperação</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
            Dimensionamento auditável com memória de cálculo, fórmulas e referências técnicas
            {areaAtiva ? ` (${areaAtiva.nomeTalhao} — ${areaAtiva.areaHa} ha)` : ''}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-zinc-950/60 p-1 rounded-lg border border-slate-200/70 dark:border-zinc-800 overflow-x-auto max-w-full">
          {CALCULADORAS.map(c => {
            const Icon = c.icon;
            const isAtiva = calcAtiva === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCalcAtiva(c.key)}
                className={`h-8 px-2.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  isAtiva
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Parâmetros de Entrada */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-200/80 dark:border-zinc-800 space-y-3.5">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 dark:border-zinc-800 pb-2.5">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              Parâmetros de Entrada
            </h3>
            {ultimaAnalise && (
              <button
                type="button"
                onClick={handleImportarUltimaAnalise}
                className="h-7 px-2.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 font-medium text-[11px] flex items-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 transition whitespace-nowrap"
              >
                <FileSpreadsheet className="w-3 h-3" />
                <span>Usar Análise de Solo</span>
              </button>
            )}
          </div>

          <div>
            <label className={LABEL_CLASS}>Área de Aplicação (ha) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={areaHaInput}
              onChange={e => setAreaHaInput(e.target.value)}
              placeholder="Ex: 25.0"
              className={`${INPUT_CLASS} font-semibold`}
            />
          </div>

          {calcAtiva === 'calagem' && (
            <div className="space-y-3">
              <div>
                <label className={LABEL_CLASS}>CTC a pH 7.0 (T em cmolc/dm³) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={ctcCalagem}
                  onChange={e => setCtcCalagem(e.target.value)}
                  placeholder="Ex: 6.5"
                  className={INPUT_CLASS}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>V% Atual (V1) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={vAtualCalagem}
                    onChange={e => setVAtualCalagem(e.target.value)}
                    placeholder="Ex: 35"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>V% Desejado (V2) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={vDesejadoCalagem}
                    onChange={e => setVDesejadoCalagem(e.target.value)}
                    placeholder="Ex: 65"
                    className={`${INPUT_CLASS} font-semibold text-emerald-700 dark:text-emerald-400`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>PRNT do Calcário (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="150"
                    value={prntCalagem}
                    onChange={e => setPrntCalagem(e.target.value)}
                    placeholder="Ex: 85"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Profundidade (cm) *</label>
                  <input
                    type="number"
                    min="1"
                    value={profundidadeCalagem}
                    onChange={e => setProfundidadeCalagem(e.target.value)}
                    placeholder="Ex: 20"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div>
                <label className={LABEL_CLASS}>Preço Calcário (R$/tonelada)</label>
                <input
                  type="number"
                  min="0"
                  value={custoTonCalcario}
                  onChange={e => setCustoTonCalcario(e.target.value)}
                  placeholder="Ex: 190"
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          )}

          {calcAtiva === 'gessagem' && (
            <div className="space-y-3">
              <div>
                <label className={LABEL_CLASS}>Teor de Argila do Subsolo (%) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={argilaGessagem}
                  onChange={e => setArgilaGessagem(e.target.value)}
                  placeholder="Ex: 40"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Finalidade da Área *</label>
                <select
                  value={finalidadeGessagem}
                  onChange={e => setFinalidadeGessagem(e.target.value as 'pastagem' | 'cultura_anual' | 'reflorestamento' | '')}
                  className={INPUT_CLASS}
                >
                  <option value="">Selecione a finalidade...</option>
                  <option value="pastagem">Pastagens (Fator 35 × Argila%)</option>
                  <option value="cultura_anual">Culturas Anuais / ILPF (Fator 50 × Argila%)</option>
                  <option value="reflorestamento">Reflorestamento / PRAD (Fator 60 × Argila%)</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Preço Gesso Agrícola (R$/tonelada)</label>
                <input
                  type="number"
                  min="0"
                  value={custoTonGesso}
                  onChange={e => setCustoTonGesso(e.target.value)}
                  placeholder="Ex: 280"
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          )}

          {calcAtiva === 'adubacao' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Fósforo P (mg/dm³) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={pDisponivel}
                    onChange={e => setPDisponivel(e.target.value)}
                    placeholder="Ex: 4.0"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Potássio K (cmolc/dm³) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={kDisponivel}
                    onChange={e => setKDisponivel(e.target.value)}
                    placeholder="Ex: 0.15"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div>
                <label className={LABEL_CLASS}>Teor de Argila (%) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={argilaAdubacao}
                  onChange={e => setArgilaAdubacao(e.target.value)}
                  placeholder="Ex: 40"
                  className={INPUT_CLASS}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                O cálculo recomenda a dosagem de N, P₂O₅ e K₂O conforme tabelas da SBCS e converte para adubo formulado comercial.
              </p>
            </div>
          )}

          {calcAtiva === 'sementes' && (
            <div className="space-y-3">
              <div>
                <label className={LABEL_CLASS}>Espécie / Cultivar</label>
                <input
                  type="text"
                  value={especieSemente}
                  onChange={e => setEspecieSemente(e.target.value)}
                  placeholder="Ex: Brachiaria brizantha cv. Marandu"
                  className={INPUT_CLASS}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Pureza (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={purezaSemente}
                    onChange={e => setPurezaSemente(e.target.value)}
                    placeholder="Ex: 95"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Germinação (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={germinacaoSemente}
                    onChange={e => setGerminacaoSemente(e.target.value)}
                    placeholder="Ex: 80"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Taxa Padrão (kg/ha VC 100%) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={taxaPadraoKgHa}
                    onChange={e => setTaxaPadraoKgHa(e.target.value)}
                    placeholder="Ex: 6.0"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Preço Semente (R$/kg)</label>
                  <input
                    type="number"
                    min="0"
                    value={custoSementeKg}
                    onChange={e => setCustoSementeKg(e.target.value)}
                    placeholder="Ex: 45"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          )}

          {calcAtiva === 'mudas' && (
            <div className="space-y-3">
              <div>
                <label className={LABEL_CLASS}>Espécies / Consórcio Florestal</label>
                <input
                  type="text"
                  value={especieMuda}
                  onChange={e => setEspecieMuda(e.target.value)}
                  placeholder="Ex: Consórcio de Espécies Nativas da Mata Ciliar"
                  className={INPUT_CLASS}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Espaçamento Entre Linhas (m) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={espacamentoLinha}
                    onChange={e => setEspacamentoLinha(e.target.value)}
                    placeholder="Ex: 3.0"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Espaçamento Entre Plantas (m) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={espacamentoPlanta}
                    onChange={e => setEspacamentoPlanta(e.target.value)}
                    placeholder="Ex: 2.0"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div>
                <label className={LABEL_CLASS}>Custo Médio da Muda (R$/unidade)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={custoMudaUnitario}
                  onChange={e => setCustoMudaUnitario(e.target.value)}
                  placeholder="Ex: 6.50"
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          )}
        </div>

        {/* Resultados & Memória de Cálculo Auditável */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-200/80 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 dark:border-zinc-800 pb-2.5">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Resultado & Memória de Cálculo Agronômica</span>
            </h3>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
              Auditável
            </span>
          </div>

          {calcAtiva === 'calagem' && (
            resCalagem ? (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800">
                  <div className="p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                      Dose Corrigida
                    </span>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 tabular-nums mt-0.5">
                      {resCalagem.doseCalcarioCorrigidaTHa} <span className="text-xs font-medium">t/ha</span>
                    </p>
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 block tabular-nums">
                      Volume Total ({areaHaVal} ha)
                    </span>
                    <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
                      {resCalagem.quantidadeTotalToneladas} <span className="text-xs font-medium">ton</span>
                    </p>
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                      Investimento Estimado
                    </span>
                    <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
                      R$ {resCalagem.custoEstimadoTotalR$.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                <MemoriaCalculoCard memoria={resCalagem.memoria} mostrarDetalhesCompletos />
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/50 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800">
                Preencha a área (ha), CTC, V% atual, V% desejado, PRNT e profundidade ao lado para calcular a calagem.
              </div>
            )
          )}

          {calcAtiva === 'gessagem' && (
            resGessagem ? (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800">
                  <div className="p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                      Dose Gesso
                    </span>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 tabular-nums mt-0.5">
                      {resGessagem.doseGessoKgHa} <span className="text-xs font-medium">kg/ha</span>
                    </p>
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 block tabular-nums">
                      Volume Total ({areaHaVal} ha)
                    </span>
                    <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
                      {resGessagem.quantidadeTotalToneladas} <span className="text-xs font-medium">ton</span>
                    </p>
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                      Investimento Estimado
                    </span>
                    <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
                      R$ {resGessagem.custoEstimadoTotalR$.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                <MemoriaCalculoCard memoria={resGessagem.memoria} mostrarDetalhesCompletos />
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/50 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800">
                Preencha a área (ha), o teor de argila (%) e selecione a finalidade da área para calcular a gessagem.
              </div>
            )
          )}

          {calcAtiva === 'adubacao' && (
            resAdubacao ? (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800">
                  <div className="p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                      Formulado Recomendado
                    </span>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {resAdubacao.formuladoSugerido}
                    </p>
                    <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {resAdubacao.doseFormuladoKgHa} kg/ha
                    </p>
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 block tabular-nums">
                      Total do Adubo ({areaHaVal} ha)
                    </span>
                    <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
                      {(resAdubacao.quantidadeTotalAduboKg / 1000).toFixed(1)} <span className="text-xs font-medium">ton</span>
                    </p>
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                      Investimento Estimado
                    </span>
                    <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
                      R$ {resAdubacao.custoAdubacaoTotalR$.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                <MemoriaCalculoCard memoria={resAdubacao.memoria} />
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/50 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800">
                Preencha a área (ha), fósforo (P), potássio (K) e teor de argila (%) para calcular a adubação NPK.
              </div>
            )
          )}

          {calcAtiva === 'sementes' && (
            resSementes ? (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800">
                  <div className="p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                      Valor Cultural (VC%)
                    </span>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 tabular-nums mt-0.5">
                      {resSementes.valorCulturalPct}%
                    </p>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">
                      {resSementes.taxaSemeaduraAjustadaKgHa} kg/ha ajustado
                    </span>
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 block tabular-nums">
                      Sementes Totais ({areaHaVal} ha)
                    </span>
                    <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
                      {resSementes.quantidadeTotalSementesKg} <span className="text-xs font-medium">kg</span>
                    </p>
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                      Investimento Estimado
                    </span>
                    <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
                      R$ {resSementes.custoEstimadoR$.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                <MemoriaCalculoCard memoria={resSementes.memoria} />
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/50 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800">
                Preencha a área (ha), pureza (%), germinação (%) e taxa padrão (kg/ha) para calcular a taxa real por VC%.
              </div>
            )
          )}

          {calcAtiva === 'mudas' && (
            resMudas ? (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800">
                  <div className="p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                      Densidade por Hectare
                    </span>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 tabular-nums mt-0.5">
                      {resMudas.densidadeMudasHa} <span className="text-xs font-medium">mudas/ha</span>
                    </p>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">
                      {espacamentoLinha}m × {espacamentoPlanta}m
                    </span>
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                      Total (+15% replantio)
                    </span>
                    <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
                      {resMudas.quantidadeTotalMudas.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                      Investimento Estimado
                    </span>
                    <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
                      R$ {resMudas.custoEstimadoR$.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                <MemoriaCalculoCard memoria={resMudas.memoria} />
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/50 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800">
                Preencha a área (ha) e os espaçamentos entre linhas e plantas (m) para calcular o quantitativo de mudas.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
