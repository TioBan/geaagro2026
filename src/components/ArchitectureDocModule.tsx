import React, { useState } from 'react';
import {
  Cpu,
  Database,
  GitBranch,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';

export const ArchitectureDocModule: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'architecture' | 'datamodel' | 'importflow' | 'math' | 'mvp'>('architecture');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Engenharia de Software & Agronômica
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">• Especificação Técnica Completa</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100 mt-1 flex items-center gap-2">
            <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Arquitetura do Sistema, Modelo de Dados & Lógica</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-0.5">
            Documento arquitetural detalhando camadas, entidades, fluxo de importação CSV (50 amostras), fórmulas de conversão e roadmap do MVP.
          </p>
        </div>

        {/* Sub-nav with scroll on mobile */}
        <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg text-xs font-semibold overflow-x-auto max-w-full border border-slate-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveSection('architecture')}
            className={`px-3 py-1.5 min-h-[36px] rounded-md flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'architecture' ? 'bg-white dark:bg-black text-emerald-800 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            1. Arquitetura Geral
          </button>
          <button
            onClick={() => setActiveSection('datamodel')}
            className={`px-3 py-1.5 min-h-[36px] rounded-md flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'datamodel' ? 'bg-white dark:bg-black text-emerald-800 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            2. Modelo de Dados (ER)
          </button>
          <button
            onClick={() => setActiveSection('importflow')}
            className={`px-3 py-1.5 min-h-[36px] rounded-md flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'importflow' ? 'bg-white dark:bg-black text-emerald-800 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            3. Fluxo de Importação
          </button>
          <button
            onClick={() => setActiveSection('math')}
            className={`px-3 py-1.5 min-h-[36px] rounded-md flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'math' ? 'bg-white dark:bg-black text-emerald-800 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            4. Matemática das 3 Unidades
          </button>
          <button
            onClick={() => setActiveSection('mvp')}
            className={`px-3 py-1.5 min-h-[36px] rounded-md flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'mvp' ? 'bg-white dark:bg-black text-emerald-800 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            5. Telas & MVP
          </button>
        </div>
      </div>

      {/* SECTION 1: ARQUITETURA GERAL */}
      {activeSection === 'architecture' && (
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs p-4 sm:p-6 space-y-6 transition-colors">
          <div className="border-b border-slate-200 dark:border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">1. Arquitetura Geral do Sistema (Modular / Clean Architecture)</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
              Visão macro das camadas de apresentação, motores de regras de negócio agronômicas, validação de dados e persistência.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Camada de Apresentação (Frontend SPA)</h4>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                Interface responsiva (Web, Tablet & Mobile) construída em React + TypeScript + Tailwind CSS com AMOLED Dark Mode nativo.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Motor de Validação de Lotes (CSV Engine)</h4>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                Processador síncrono com tolerância a delimitadores, limite de até 50 amostras, detecção de outliers e validação química cruzada.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Motor de Cálculo e Recomendação</h4>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                Algoritmos agronômicos oficiais (IAC, Embrapa Cerrados, CFSEMG) para Calagem, Gessagem e Adubação N-P-K e Foliar com conversor triplo.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 flex items-center justify-center font-bold">
                4
              </div>
              <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Camada de Persistência & Auditoria</h4>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                Modelo estruturado com rastreabilidade completa por Fazenda, Talhão, Responsável Técnico (CREA) e histórico de safras (ART).
              </p>
            </div>
          </div>

          {/* Architecture Pipeline Diagram */}
          <div className="bg-slate-900 dark:bg-black text-white rounded-xl p-4 sm:p-5 space-y-3 font-mono text-xs border border-slate-800 dark:border-zinc-800">
            <p className="text-emerald-400 font-bold tracking-wider uppercase text-[11px]">
              Pipeline de Execução de Dados
            </p>
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center">
              <div className="bg-slate-800 dark:bg-zinc-900 p-3 rounded-lg border border-slate-700 dark:border-zinc-800 w-full">
                <span className="text-slate-400 dark:text-zinc-400 text-[10px] block">ENTRADA</span>
                <span className="font-bold text-white">Planilha CSV Lab (≤50 amostras)</span>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-400 shrink-0 hidden md:block" />
              <div className="bg-slate-800 dark:bg-zinc-900 p-3 rounded-lg border border-slate-700 dark:border-zinc-800 w-full">
                <span className="text-slate-400 dark:text-zinc-400 text-[10px] block">VALIDADOR</span>
                <span className="font-bold text-emerald-400">Parse + Limites Físico-Químicos</span>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-400 shrink-0 hidden md:block" />
              <div className="bg-slate-800 dark:bg-zinc-900 p-3 rounded-lg border border-slate-700 dark:border-zinc-800 w-full">
                <span className="text-slate-400 dark:text-zinc-400 text-[10px] block">MOTOR AGRONÔMICO</span>
                <span className="font-bold text-amber-300">Calagem / Gessagem / NPK</span>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-400 shrink-0 hidden md:block" />
              <div className="bg-slate-800 dark:bg-zinc-900 p-3 rounded-lg border border-slate-700 dark:border-zinc-800 w-full">
                <span className="text-slate-400 dark:text-zinc-400 text-[10px] block">SAÍDA OFICIAL</span>
                <span className="font-bold text-cyan-300">3 Unidades + Laudo com ART</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: MODELO DE DADOS */}
      {activeSection === 'datamodel' && (
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs p-4 sm:p-6 space-y-6 transition-colors">
          <div className="border-b border-slate-200 dark:border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">2. Modelo de Dados Entidade-Relacionamento (ER)</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
              Estruturas relacionais com tipagem estrita no TypeScript garantindo integridade referencial entre empresa, RT, produtor e talhões.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Entidades de Cadastro</span>
              <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Company, Agronomist, Producer & Farm</h4>
              <ul className="space-y-1 text-slate-700 dark:text-zinc-300">
                <li>• <strong>Company:</strong> CNPJ, Razão Social, Registro CREA-PJ, Endereço.</li>
                <li>• <strong>Agronomist:</strong> CPF, Nome, CREA, UF, RNP, Assinatura Técnica (RT).</li>
                <li>• <strong>RuralProducer:</strong> CPF/CNPJ, Inscrição Estadual, Telefone, Fazendas.</li>
                <li>• <strong>Farm:</strong> Município, CAR, Área Total, Histórico de Manejo.</li>
                <li>• <strong>FieldPlot:</strong> Textura, % Argila, Espaçamento Linhas x Plantas, População.</li>
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">Entidades de Amostragem & Diagnóstico</span>
              <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">SoilSample & LeafSample</h4>
              <ul className="space-y-1 text-slate-700 dark:text-zinc-300">
                <li>• <strong>SoilSample:</strong> 0-20cm / 20-40cm, pH CaCl2, M.O., P, K, Ca, Mg, Al, H+Al, Micronutrientes, CTC, V%, m%.</li>
                <li>• <strong>LeafSample:</strong> Estádio Fenológico, Órgão Amostrado, N, P, K, Ca, Mg, S, B, Cu, Fe, Mn, Zn.</li>
                <li>• <strong>CropNutritionalTarget:</strong> V% Alvo, Necessidades de Extração e Exportação por tonelada colhida.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: FLUXO DE IMPORTAÇÃO */}
      {activeSection === 'importflow' && (
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs p-4 sm:p-6 space-y-6 transition-colors">
          <div className="border-b border-slate-200 dark:border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">3. Fluxo de Importação & Validação em Lote (Até 50 Amostras)</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
              Garantia de integridade para planilhas de laudos laboratoriais antes do salvamento na base de dados.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800">
              <h4 className="font-bold text-slate-900 dark:text-zinc-100 mb-1">Passo 1: Download do Modelo Padrão</h4>
              <p className="text-slate-600 dark:text-zinc-400">O sistema gera um arquivo CSV com cabeçalhos normalizados com unidades oficiais (cmolc/dm³, mg/dm³, %, g/dm³).</p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800">
              <h4 className="font-bold text-slate-900 dark:text-zinc-100 mb-1">Passo 2: Verificação do Limite de 50 Linhas</h4>
              <p className="text-slate-600 dark:text-zinc-400">Se o arquivo ultrapassar 50 linhas de amostras, o parser bloqueia a importação e instrui o fatiamento dos lotes.</p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800">
              <h4 className="font-bold text-slate-900 dark:text-zinc-100 mb-1">Passo 3: Validação Físico-Química Cruzada</h4>
              <p className="text-slate-600 dark:text-zinc-400">Verifica se pH está entre 3.0 e 9.0, se teores de K, Ca e Mg são positivos e calcula automaticamente SB, CTC e V% para cada amostra válida.</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: MATEMÁTICA DAS 3 UNIDADES */}
      {activeSection === 'math' && (
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs p-4 sm:p-6 space-y-6 transition-colors">
          <div className="border-b border-slate-200 dark:border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">4. Equações Agronômicas & Conversor das 3 Unidades Oficiais</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
              Fórmulas para conversão simultânea em kg/ha, g/planta e g/metro linear.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 block text-sm">1. Dose em Área Total (kg/ha)</span>
              <p className="text-slate-700 dark:text-zinc-300 font-mono bg-white dark:bg-black p-2 rounded border border-emerald-200 dark:border-emerald-800">
                NC (t/ha) = (V2 - V1) × CTC / (10 × PRNT)
              </p>
              <p className="text-slate-600 dark:text-zinc-400">Base agronômica por hectare aplicada via distribuidor a lanço ou calcareadora.</p>
            </div>

            <div className="bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800 space-y-2">
              <span className="font-bold text-blue-900 dark:text-blue-300 block text-sm">2. Dose por Planta (g/planta)</span>
              <p className="text-slate-700 dark:text-zinc-300 font-mono bg-white dark:bg-black p-2 rounded border border-blue-200 dark:border-blue-800">
                g/planta = (Dose_kg_ha × 1000) / População_pl_ha
              </p>
              <p className="text-slate-600 dark:text-zinc-400">Indispensável para culturas perenes/frutíferas ou adubação em covas.</p>
            </div>

            <div className="bg-purple-50/50 dark:bg-purple-950/30 p-4 rounded-xl border border-purple-200 dark:border-purple-800 space-y-2">
              <span className="font-bold text-purple-900 dark:text-purple-300 block text-sm">3. Dose Linear (g/metro)</span>
              <p className="text-slate-700 dark:text-zinc-300 font-mono bg-white dark:bg-black p-2 rounded border border-purple-200 dark:border-purple-800">
                g/m = (Dose_kg_ha × Espaçamento_Linhas_m) / 10
              </p>
              <p className="text-slate-600 dark:text-zinc-400">Utilizada para calibração das roscas e dosadores da semeadora-adubadora no sulco.</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: TELAS & MVP */}
      {activeSection === 'mvp' && (
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs p-4 sm:p-6 space-y-6 transition-colors">
          <div className="border-b border-slate-200 dark:border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">5. Estrutura do MVP & Conformidade com Requisitos</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
              Todos os requisitos agronômicos e técnicos solicitados implementados de forma integral.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-zinc-100">4 Cadastros Obrigatórios</span>
                <p className="text-slate-600 dark:text-zinc-400">Fazendas com talhões e histórico, Produtores, Agrônomos RT e Empresas.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-zinc-100">Planilha Modelo & Importação de 50 Amostras</span>
                <p className="text-slate-600 dark:text-zinc-400">Download de CSV padrão e validação química e de lote.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-zinc-100">Recomendações nas 3 Unidades Oficiais</span>
                <p className="text-slate-600 dark:text-zinc-400">Calagem, Gessagem e Adubação com cálculo simultâneo em kg/ha, g/planta e g/metro.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-zinc-100">Histórico, Comparativo & Diagnose Foliar</span>
                <p className="text-slate-600 dark:text-zinc-400">Gráficos de evolução temporal, faixas de suficiência e laudos com validade técnica (ART).</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
