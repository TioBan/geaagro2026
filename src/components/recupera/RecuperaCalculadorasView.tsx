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

const MemoriaCalculoCard: React.FC<{ memoria: MemoriaCalculoData; mostrarDetalhesCompletos?: boolean }> = ({
  memoria,
  mostrarDetalhesCompletos = false
}) => (
  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
    <p className="font-bold text-slate-900 dark:text-white">{memoria.titulo}</p>
    {mostrarDetalhesCompletos && memoria.formula && (
      <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
        {memoria.formula}
      </p>
    )}
    <div className="space-y-1 text-slate-600 dark:text-slate-400 pt-1">
      {memoria.passosCalculo.map((p, idx) => (
        <p key={idx}>{p}</p>
      ))}
    </div>
    {mostrarDetalhesCompletos && memoria.referenciaBibliografica && (
      <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
        Ref: {memoria.referenciaBibliografica}
      </p>
    )}
  </div>
);

export const RecuperaCalculadorasView: React.FC<Props> = ({
  areaAtiva,
  analises
}) => {
  const [calcAtiva, setCalcAtiva] = useState<'calagem' | 'gessagem' | 'adubacao' | 'sementes' | 'mudas'>('calagem');
  const [areaHaInput, setAreaHaInput] = useState<string>(() =>
    areaAtiva?.areaHa ? String(areaAtiva.areaHa) : ''
  );

  useEffect(() => {
    if (areaAtiva?.areaHa) {
      setAreaHaInput(String(areaAtiva.areaHa));
    } else {
      setAreaHaInput('');
    }
  }, [areaAtiva?.id]);

  const ultimaAnalise = areaAtiva
    ? analises.find(a => a.areaId === areaAtiva.id)
    : analises[0];

  // 1. Estado da Calagem (sem valores pré-preenchidos)
  const [ctcCalagem, setCtcCalagem] = useState<string>('');
  const [vAtualCalagem, setVAtualCalagem] = useState<string>('');
  const [vDesejadoCalagem, setVDesejadoCalagem] = useState<string>('');
  const [prntCalagem, setPrntCalagem] = useState<string>('');
  const [profundidadeCalagem, setProfundidadeCalagem] = useState<string>('');
  const [custoTonCalcario, setCustoTonCalcario] = useState<string>('');

  // 2. Estado da Gessagem (sem valores pré-preenchidos)
  const [argilaGessagem, setArgilaGessagem] = useState<string>('');
  const [finalidadeGessagem, setFinalidadeGessagem] = useState<'pastagem' | 'cultura_anual' | 'reflorestamento' | ''>('');
  const [custoTonGesso, setCustoTonGesso] = useState<string>('');

  // 3. Estado da Adubação (sem valores pré-preenchidos)
  const [pDisponivel, setPDisponivel] = useState<string>('');
  const [kDisponivel, setKDisponivel] = useState<string>('');
  const [argilaAdubacao, setArgilaAdubacao] = useState<string>('');

  // 4. Estado de Sementes (sem valores pré-preenchidos)
  const [especieSemente, setEspecieSemente] = useState<string>('');
  const [purezaSemente, setPurezaSemente] = useState<string>('');
  const [germinacaoSemente, setGerminacaoSemente] = useState<string>('');
  const [taxaPadraoKgHa, setTaxaPadraoKgHa] = useState<string>('');
  const [custoSementeKg, setCustoSementeKg] = useState<string>('');

  // 5. Estado de Mudas (sem valores pré-preenchidos)
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

  // Verificações de preenchimento por calculadora
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

  const resCalagem = calcAtiva === 'calagem' && calagemPronta
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

  const resGessagem = calcAtiva === 'gessagem' && gessagemPronta
    ? calcularGessagemRecupera({
        argilaPct: toNum(argilaGessagem),
        areaHa: areaHaVal,
        finalidade: finalidadeGessagem as 'pastagem' | 'cultura_anual' | 'reflorestamento',
        custoPorToneladaR$: toNum(custoTonGesso)
      })
    : null;

  const resAdubacao = calcAtiva === 'adubacao' && adubacaoPronta
    ? calcularAdubacaoRecupera({
        areaHa: areaHaVal,
        tipoRecuperacao: 'pastagem_reforma',
        teorFosforoMgDm3: toNum(pDisponivel),
        teorPotassioCmolcDm3: toNum(kDisponivel),
        teorArgilaPct: toNum(argilaAdubacao)
      })
    : null;

  const resSementes = calcAtiva === 'sementes' && sementesPronta
    ? calcularSementesRecupera({
        especieCultivar: especieSemente.trim() || 'Forrageira / Cobertura',
        purezaPct: toNum(purezaSemente),
        germinacaoPct: toNum(germinacaoSemente),
        taxaPadrãoRecomendadaKgHa: toNum(taxaPadraoKgHa),
        areaHa: areaHaVal,
        custoSementePorKgR$: toNum(custoSementeKg)
      })
    : null;

  const resMudas = calcAtiva === 'mudas' && mudasPronta
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
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Fase 3 • Engenharia & Cálculos Agronômicos
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            <span>Calculadoras Especializadas de Recuperação</span>
          </h2>
          <p className="text-xs text-slate-500">
            Dimensionamento auditável com memória de cálculo, fórmulas e referências técnicas
            {areaAtiva ? ` (${areaAtiva.nomeTalhao} - ${areaAtiva.areaHa} ha)` : ''}
          </p>
        </div>

        {/* Abas das Calculadoras */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs overflow-x-auto max-w-full">
          {[
            { key: 'calagem', label: 'Calagem', icon: Sparkles },
            { key: 'gessagem', label: 'Gessagem', icon: Layers },
            { key: 'adubacao', label: 'Adubação NPK', icon: FlaskConical },
            { key: 'sementes', label: 'Sementes VC%', icon: Sprout },
            { key: 'mudas', label: 'Mudas Nativas', icon: TreePine }
          ].map(c => {
            const Icon = c.icon;
            const isAtiva = calcAtiva === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCalcAtiva(c.key as any)}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${
                  isAtiva
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Principal: Parâmetros de Entrada (Esquerda) e Resultado com Memória (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lado Esquerdo: Parâmetros (5 colunas) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Parâmetros de Entrada da Calculadora
            </h3>
            {ultimaAnalise && (
              <button
                type="button"
                onClick={handleImportarUltimaAnalise}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-100 transition"
              >
                <FileSpreadsheet className="w-3 h-3" />
                <span>Usar Análise de Solo</span>
              </button>
            )}
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
              Área de Aplicação (ha) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={areaHaInput}
              onChange={e => setAreaHaInput(e.target.value)}
              placeholder="Ex: 25.0"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
            />
          </div>

          {calcAtiva === 'calagem' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  CTC a pH 7.0 (T em cmolc/dm³) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={ctcCalagem}
                  onChange={e => setCtcCalagem(e.target.value)}
                  placeholder="Ex: 6.5"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">V% Atual (V1) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={vAtualCalagem}
                    onChange={e => setVAtualCalagem(e.target.value)}
                    placeholder="Ex: 35"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">V% Desejado (V2) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={vDesejadoCalagem}
                    onChange={e => setVDesejadoCalagem(e.target.value)}
                    placeholder="Ex: 65"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">PRNT do Calcário (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="150"
                    value={prntCalagem}
                    onChange={e => setPrntCalagem(e.target.value)}
                    placeholder="Ex: 85"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Profundidade (cm) *</label>
                  <input
                    type="number"
                    min="1"
                    value={profundidadeCalagem}
                    onChange={e => setProfundidadeCalagem(e.target.value)}
                    placeholder="Ex: 20"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Preço Calcário (R$/tonelada)</label>
                <input
                  type="number"
                  min="0"
                  value={custoTonCalcario}
                  onChange={e => setCustoTonCalcario(e.target.value)}
                  placeholder="Ex: 190"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {calcAtiva === 'gessagem' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Teor de Argila do Subsolo (%) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={argilaGessagem}
                  onChange={e => setArgilaGessagem(e.target.value)}
                  placeholder="Ex: 40"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Finalidade da Área *</label>
                <select
                  value={finalidadeGessagem}
                  onChange={e => setFinalidadeGessagem(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">Selecione a finalidade...</option>
                  <option value="pastagem">Pastagens (Fator 35 × Argila%)</option>
                  <option value="cultura_anual">Culturas Anuais / ILPF (Fator 50 × Argila%)</option>
                  <option value="reflorestamento">Reflorestamento / PRAD (Fator 60 × Argila%)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Preço Gesso Agrícola (R$/tonelada)</label>
                <input
                  type="number"
                  min="0"
                  value={custoTonGesso}
                  onChange={e => setCustoTonGesso(e.target.value)}
                  placeholder="Ex: 280"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {calcAtiva === 'adubacao' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Fósforo P (mg/dm³) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={pDisponivel}
                    onChange={e => setPDisponivel(e.target.value)}
                    placeholder="Ex: 4.0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Potássio K (cmolc/dm³) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={kDisponivel}
                    onChange={e => setKDisponivel(e.target.value)}
                    placeholder="Ex: 0.15"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Teor de Argila (%) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={argilaAdubacao}
                  onChange={e => setArgilaAdubacao(e.target.value)}
                  placeholder="Ex: 40"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                O cálculo recomenda a dosagem de N, P₂O₅ e K₂O conforme tabelas da SBCS e converte para adubo formulado comercial.
              </p>
            </div>
          )}

          {calcAtiva === 'sementes' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Espécie / Cultivar</label>
                <input
                  type="text"
                  value={especieSemente}
                  onChange={e => setEspecieSemente(e.target.value)}
                  placeholder="Ex: Brachiaria brizantha cv. Marandu"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Pureza (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={purezaSemente}
                    onChange={e => setPurezaSemente(e.target.value)}
                    placeholder="Ex: 95"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Germinação (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={germinacaoSemente}
                    onChange={e => setGerminacaoSemente(e.target.value)}
                    placeholder="Ex: 80"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Taxa Padrão (kg/ha VC 100%) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={taxaPadraoKgHa}
                    onChange={e => setTaxaPadraoKgHa(e.target.value)}
                    placeholder="Ex: 6.0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Preço Semente (R$/kg)</label>
                  <input
                    type="number"
                    min="0"
                    value={custoSementeKg}
                    onChange={e => setCustoSementeKg(e.target.value)}
                    placeholder="Ex: 45"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {calcAtiva === 'mudas' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Espécies / Consórcio Florestal</label>
                <input
                  type="text"
                  value={especieMuda}
                  onChange={e => setEspecieMuda(e.target.value)}
                  placeholder="Ex: Consórcio de Espécies Nativas da Mata Ciliar"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Espaçamento Entre Linhas (m) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={espacamentoLinha}
                    onChange={e => setEspacamentoLinha(e.target.value)}
                    placeholder="Ex: 3.0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Espaçamento Entre Plantas (m) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={espacamentoPlanta}
                    onChange={e => setEspacamentoPlanta(e.target.value)}
                    placeholder="Ex: 2.0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Custo Médio da Muda (R$/unidade)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={custoMudaUnitario}
                  onChange={e => setCustoMudaUnitario(e.target.value)}
                  placeholder="Ex: 6.50"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Lado Direito: Resultados & Memória de Cálculo Auditável (7 colunas) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Resultado & Memória de Cálculo Agronômica</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              Auditável
            </span>
          </div>

          {calcAtiva === 'calagem' && (
            resCalagem ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 block">Dose Corrigida</span>
                    <p className="text-xl font-extrabold text-emerald-800 dark:text-emerald-200">
                      {resCalagem.doseCalcarioCorrigidaTHa} <span className="text-xs">t/ha</span>
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-semibold text-slate-500 block">Volume Total ({areaHaVal} ha)</span>
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {resCalagem.quantidadeTotalToneladas} <span className="text-xs">ton</span>
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-semibold text-slate-500 block">Investimento Estimado</span>
                    <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                      R$ {resCalagem.custoEstimadoTotalR$.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                <MemoriaCalculoCard memoria={resCalagem.memoria} mostrarDetalhesCompletos />
              </div>
            ) : (
              <div className="p-10 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                Preencha a área (ha), CTC, V% atual, V% desejado, PRNT e profundidade ao lado para calcular a calagem.
              </div>
            )
          )}

          {calcAtiva === 'gessagem' && (
            resGessagem ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 block">Dose Gesso</span>
                    <p className="text-xl font-extrabold text-emerald-800 dark:text-emerald-200">
                      {resGessagem.doseGessoKgHa} <span className="text-xs">kg/ha</span>
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-semibold text-slate-500 block">Volume Total ({areaHaVal} ha)</span>
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {resGessagem.quantidadeTotalToneladas} <span className="text-xs">ton</span>
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-semibold text-slate-500 block">Investimento Estimado</span>
                    <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                      R$ {resGessagem.custoEstimadoTotalR$.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                <MemoriaCalculoCard memoria={resGessagem.memoria} mostrarDetalhesCompletos />
              </div>
            ) : (
              <div className="p-10 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                Preencha a área (ha), o teor de argila (%) e selecione a finalidade da área para calcular a gessagem.
              </div>
            )
          )}

          {calcAtiva === 'adubacao' && (
            resAdubacao ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 block">Formulado Recomendado</span>
                    <p className="text-sm font-extrabold text-emerald-800 dark:text-emerald-200 mt-1">
                      {resAdubacao.formuladoSugerido}
                    </p>
                    <p className="text-xs font-bold text-emerald-600">{resAdubacao.doseFormuladoKgHa} kg/ha</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-semibold text-slate-500 block">Total do Adubo ({areaHaVal} ha)</span>
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {(resAdubacao.quantidadeTotalAduboKg / 1000).toFixed(1)} <span className="text-xs">ton</span>
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-semibold text-slate-500 block">Investimento Estimado</span>
                    <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                      R$ {resAdubacao.custoAdubacaoTotalR$.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                <MemoriaCalculoCard memoria={resAdubacao.memoria} />
              </div>
            ) : (
              <div className="p-10 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                Preencha a área (ha), fósforo (P), potássio (K) e teor de argila (%) para calcular a adubação NPK.
              </div>
            )
          )}

          {calcAtiva === 'sementes' && (
            resSementes ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 block">Valor Cultural (VC%)</span>
                    <p className="text-xl font-extrabold text-emerald-800 dark:text-emerald-200">
                      {resSementes.valorCulturalPct}%
                    </p>
                    <span className="text-[10px] text-emerald-600 font-semibold">{resSementes.taxaSemeaduraAjustadaKgHa} kg/ha ajustado</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-semibold text-slate-500 block">Sementes Totais ({areaHaVal} ha)</span>
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {resSementes.quantidadeTotalSementesKg} <span className="text-xs">kg</span>
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-semibold text-slate-500 block">Investimento Estimado</span>
                    <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                      R$ {resSementes.custoEstimadoR$.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                <MemoriaCalculoCard memoria={resSementes.memoria} />
              </div>
            ) : (
              <div className="p-10 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                Preencha a área (ha), pureza (%), germinação (%) e taxa padrão (kg/ha) para calcular a taxa real por VC%.
              </div>
            )
          )}

          {calcAtiva === 'mudas' && (
            resMudas ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 block">Densidade por Hectare</span>
                    <p className="text-xl font-extrabold text-emerald-800 dark:text-emerald-200">
                      {resMudas.densidadeMudasHa} <span className="text-xs">mudas/ha</span>
                    </p>
                    <span className="text-[10px] text-emerald-600 font-semibold">{espacamentoLinha}m × {espacamentoPlanta}m</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-semibold text-slate-500 block">Total de Mudas (+15% replantio)</span>
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {resMudas.quantidadeTotalMudas.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-semibold text-slate-500 block">Investimento Estimado</span>
                    <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                      R$ {resMudas.custoEstimadoR$.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                <MemoriaCalculoCard memoria={resMudas.memoria} />
              </div>
            ) : (
              <div className="p-10 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                Preencha a área (ha) e os espaçamentos entre linhas e plantas (m) para calcular o quantitativo de mudas.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
