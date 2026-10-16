import React, { useState, useMemo } from 'react';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  Scale,
  Plus,
  Trash2,
  HelpCircle,
  BarChart3,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { Pericia, PericiaCalculoDanos } from '../../types/pericia';

interface PericiaSubmoduleCalculosProps {
  pericia: Pericia;
  onUpdatePericia: (updated: Pericia) => void;
}

export const PericiaSubmoduleCalculos: React.FC<PericiaSubmoduleCalculosProps> = ({
  pericia,
  onUpdatePericia,
}) => {
  const [activeTab, setActiveTab] = useState<'fontes' | 'calculadora' | 'sintese'>('calculadora');

  const calc = pericia.calculosDanos;

  // Calculadora Interativa State
  const [areaHa, setAreaHa] = useState<number>(calc?.areaTotalAfetadaHa || pericia.objetoDescricao?.areaAfetadaHa || 50);
  const [prodEsperadaSacas, setProdEsperadaSacas] = useState<number>(
    calc?.produtividadeEsperadaSacasHa || (pericia.analiseTecnica?.caracterizacaoCultura?.produtividadeEsperadaKgHa || 3600) / 60
  );
  const [prodObtidaSacas, setProdObtidaSacas] = useState<number>(
    calc?.produtividadeObtidaSacasHa || (pericia.analiseTecnica?.caracterizacaoCultura?.produtividadeObservadaKgHa || 1200) / 60
  );
  const [precoSacaBrl, setPrecoSacaBrl] = useState<number>(calc?.precoUnitarioSacaBrl || 135.0);

  const [custosAdicionaisBrl, setCustosAdicionaisBrl] = useState<number>(calc?.custosAdicionaisBrl || 15000);
  const [custoReimplantioBrl, setCustoReimplantioBrl] = useState<number>(calc?.custoReimplantioBrl || 0);

  // Dynamic Math
  const perdaSacasPorHa = Math.max(0, prodEsperadaSacas - prodObtidaSacas);
  const perdaTotalSacas = perdaSacasPorHa * areaHa;
  const valorPerdaProducaoBrl = perdaTotalSacas * precoSacaBrl; // Lucros Cessantes / Perda de Receita

  const danoEmergenteTotalBrl = custoReimplantioBrl + custosAdicionaisBrl;
  const perdaFinanceiraTotalBrl = valorPerdaProducaoBrl + danoEmergenteTotalBrl;

  // Save Calculated Values
  const handleSaveCalculos = () => {
    const updatedCalculos: PericiaCalculoDanos = {
      ...calc,
      areaTotalAfetadaHa: areaHa,
      produtividadeEsperadaSacasHa: prodEsperadaSacas,
      produtividadeObtidaSacasHa: prodObtidaSacas,
      precoUnitarioSacaBrl: precoSacaBrl,
      perdaTotalSacas,
      valorPerdaProducaoBrl,
      custoReimplantioBrl,
      custosAdicionaisBrl,
      danoEmergenteTotalBrl,
      lucrosCessantesTotalBrl: valorPerdaProducaoBrl,
      perdaFinanceiraTotalBrl,
      memoriaCalculoTexto: `CÁLCULO OFICIAL GEAAGRO:\n• Área Afetada: ${areaHa} ha\n• Quebra de Produtividade: ${perdaSacasPorHa.toFixed(1)} sc/ha\n• Total Sacas Perdidas: ${perdaTotalSacas.toLocaleString('pt-BR')} sc\n• Preço da Saca (Fonte: CEPEA/B3): R$ ${precoSacaBrl.toFixed(2)}\n• Perda da Receita Bruta (Lucros Cessantes): R$ ${valorPerdaProducaoBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n• Danos Emergentes (Reimplantio + Custos Extra): R$ ${danoEmergenteTotalBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n• TOTAL DA VALORAÇÃO: R$ ${perdaFinanceiraTotalBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    };

    onUpdatePericia({
      ...pericia,
      calculosDanos: updatedCalculos,
      status: pericia.status === 'em_analise' ? 'em_calculo' : pericia.status,
      atualizadoEm: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Submodule Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl border border-slate-200 dark:border-zinc-700 text-xs">
        <button
          onClick={() => setActiveTab('calculadora')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'calculadora'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          4.2 Calculadora & Memória de Cálculo
        </button>

        <button
          onClick={() => setActiveTab('fontes')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'fontes'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          4.1 Fontes de Preços (CEPEA / CONAB)
        </button>

        <button
          onClick={() => setActiveTab('sintese')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'sintese'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          4.8 Síntese Financeira
        </button>
      </div>

      {/* 4.2 CALCULADORA DE VALORAÇÃO */}
      {activeTab === 'calculadora' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              4.2 Motor de Cálculo e Memória Apurada do Dano
            </h3>
            <button
              onClick={handleSaveCalculos}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Gravar Memória no Processo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Parameters Panel */}
            <div className="p-5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Parâmetros de Produção e Perda
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Área Afetada (ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={areaHa}
                    onChange={e => setAreaHa(Number(e.target.value))}
                    className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Prod. Esperada (sc/ha)</label>
                    <input
                      type="number"
                      value={prodEsperadaSacas}
                      onChange={e => setProdEsperadaSacas(Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Prod. Obtida (sc/ha)</label>
                    <input
                      type="number"
                      value={prodObtidaSacas}
                      onChange={e => setProdObtidaSacas(Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-amber-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Preço do Produto (R$ / Saca)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={precoSacaBrl}
                    onChange={e => setPrecoSacaBrl(Number(e.target.value))}
                    className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Dano Reimplantio (R$)</label>
                    <input
                      type="number"
                      value={custoReimplantioBrl}
                      onChange={e => setCustoReimplantioBrl(Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Custos Adicionais (R$)</label>
                    <input
                      type="number"
                      value={custosAdicionaisBrl}
                      onChange={e => setCustosAdicionaisBrl(Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results Live Calculation Card */}
            <div className="p-6 bg-gradient-to-br from-slate-900 to-zinc-950 text-white rounded-2xl border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full font-mono text-[10px] font-bold">
                  APURAÇÃO OFICIAL DE DANOS
                </span>

                <div className="border-b border-slate-800 pb-3 space-y-1">
                  <p className="text-xs text-slate-400">Lucros Cessantes (Perda de Produção)</p>
                  <p className="text-2xl font-black text-emerald-400 font-mono">
                    R$ {valorPerdaProducaoBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {perdaTotalSacas.toLocaleString('pt-BR')} sacas perdidas × R$ {precoSacaBrl.toFixed(2)}
                  </p>
                </div>

                <div className="border-b border-slate-800 pb-3 space-y-1">
                  <p className="text-xs text-slate-400">Danos Emergentes (Custos Extras / Reimplantio)</p>
                  <p className="text-xl font-black text-amber-400 font-mono">
                    R$ {danoEmergenteTotalBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Valoração Final do Dano Apurado</p>
                <p className="text-3xl font-black text-white font-mono mt-1">
                  R$ {perdaFinanceiraTotalBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4.1 FONTES DE PREÇO */}
      {activeTab === 'fontes' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              4.1 Fontes de Preços e Referências de Mercado Utilizadas
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl space-y-1 border border-slate-200 dark:border-zinc-700">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">CEPEA / ESALQ</span>
              <p className="text-slate-600 dark:text-zinc-300 font-medium">Indicador de Soja Paranaguá/Praça Regional</p>
              <p className="font-mono text-[11px] text-slate-400">Data de Referência: Fev/2026</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl space-y-1 border border-slate-200 dark:border-zinc-700">
              <span className="font-bold text-blue-700 dark:text-blue-400 text-xs">CONAB</span>
              <p className="text-slate-600 dark:text-zinc-300 font-medium">Série Histórica de Preços Recebidos pelos Produtores</p>
              <p className="font-mono text-[11px] text-slate-400">Boletim de Safras 2025/2026</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl space-y-1 border border-slate-200 dark:border-zinc-700">
              <span className="font-bold text-purple-700 dark:text-purple-400 text-xs">B3 / Futuros</span>
              <p className="text-slate-600 dark:text-zinc-300 font-medium">Cotações Futuras de Milho e Soja (B3)</p>
              <p className="font-mono text-[11px] text-slate-400">Contrato de Liquidação de Safra</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl space-y-1 border border-slate-200 dark:border-zinc-700">
              <span className="font-bold text-amber-700 dark:text-amber-400 text-xs">Notas Fiscais Locais</span>
              <p className="text-slate-600 dark:text-zinc-300 font-medium">Comprovantes de Compra de Insumos e Sementes</p>
              <p className="font-mono text-[11px] text-slate-400">Anexo Vistoria</p>
            </div>
          </div>
        </div>
      )}

      {/* 4.8 SÍNTESE FINANCEIRA */}
      {activeTab === 'sintese' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              4.8 Quadro de Síntese Financeira de Valoração do Dano
            </h3>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-3 text-xs">
            <p className="whitespace-pre-line font-mono text-slate-800 dark:text-zinc-200 text-xs">
              {calc?.memoriaCalculoTexto || 'Nenhuma memória gravada ainda. Clique em "Gravar Memória no Processo" na aba Calculadora.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
