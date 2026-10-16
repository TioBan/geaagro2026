import React from 'react';
import {
  Sparkles,
  Layers,
  ArrowRight,
  Droplets,
  Wheat,
  Activity,
  DollarSign,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

interface SwineGeaSuiteIntegrationViewProps {
  onNavigateToTankMix?: () => void;
  onNavigateToPoultry?: () => void;
  onNavigateToBuffalo?: () => void;
}

export const SwineGeaSuiteIntegrationView: React.FC<SwineGeaSuiteIntegrationViewProps> = ({
  onNavigateToTankMix,
  onNavigateToPoultry,
  onNavigateToBuffalo,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ecossistema Integrado GeaAgro</span>
        </div>
        <h2 className="text-xl font-black text-gray-900">
          Sinergias & Conectividade com a Suíte GeaAgro
        </h2>
        <p className="text-xs text-gray-500 mt-1 max-w-3xl">
          Conecte a produção suinícola aos módulos de fertirrigação agronômica (TankMix), avicultura de corte/postura, bubalinocultura de leite, pastagens e gestão financeira agropecuária.
        </p>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. TankMix Synergy: Dejetos Líquidos de Suínos (DLS) & Fertirrigação */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-4 hover:border-pink-300 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold">
              🧪
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">Módulo TankMix • Fertirrigação com DLS</h3>
              <p className="text-xs text-gray-500">Compatibilidade & Aplicação de Dejetos Líquidos de Suínos</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Utilize os efluentes e dejetos suínos tratados em biodigestores e esterqueiras para nutrição de lavouras de milho e soja. Calcule a taxa de diluição, compatibilidade em caldas e dosagem de N-P-K orgânico por hectare.
          </p>

          <div className="p-3 bg-emerald-50 rounded-xl text-xs space-y-1 text-emerald-950 font-medium">
            <div className="flex justify-between">
              <span>Produção Diária de Dejeto:</span>
              <span className="font-bold">4.2 m³ / dia</span>
            </div>
            <div className="flex justify-between">
              <span>Economia Adubação Química:</span>
              <span className="font-bold text-emerald-700">R$ 18.500 / safra</span>
            </div>
          </div>

          {onNavigateToTankMix && (
            <button
              onClick={onNavigateToTankMix}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              <span>Abrir TankMix Fertirrigação</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 2. Poultry Synergy: Fábrica de Ração Compartilhada */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-4 hover:border-pink-300 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold">
              🐔
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">Módulo Avicultura • Fábrica de Ração</h3>
              <p className="text-xs text-gray-500">Poder de Compra em Escala de Milho & Soja</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Integração do consumo de matérias-primas entre granjas avícolas e suinícolas da propriedade. Otimize compras de milho a granel, farelo de soja 46% e núcleos minerais, reduzindo o custo por tonelada processada.
          </p>

          <div className="p-3 bg-amber-50 rounded-xl text-xs space-y-1 text-amber-950 font-medium">
            <div className="flex justify-between">
              <span>Demanda Conjunta de Milho:</span>
              <span className="font-bold">140 ton / mês</span>
            </div>
            <div className="flex justify-between">
              <span>Redução de Custo Médio:</span>
              <span className="font-bold text-amber-700">-6.5% por saca</span>
            </div>
          </div>

          {onNavigateToPoultry && (
            <button
              onClick={onNavigateToPoultry}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              <span>Abrir Módulo Avicultura</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 3. Buffalo Synergy: Agroindústria de Embutidos & Queijos */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-4 hover:border-pink-300 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-stone-700 to-stone-900 text-white flex items-center justify-center font-bold">
              🐃
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">Módulo Bubalinocultura • Agroindústria</h3>
              <p className="text-xs text-gray-500">Agregação de Valor em Charcutaria Artesanal</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Sinergia no processamento agroindustrial de carnes e laticínios nobres (mozzarella di bufala e linguiças premium suínas/bubalinas com certificação artesanal).
          </p>

          {onNavigateToBuffalo && (
            <button
              onClick={onNavigateToBuffalo}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl transition-colors"
            >
              <span>Abrir Módulo Bubalinos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 4. Financial & Zootecnic ROI */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-4 hover:border-pink-300 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-800 text-white flex items-center justify-center font-bold">
              💰
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">Gestão de Margem & Custo / Suíno</h3>
              <p className="text-xs text-gray-500">Rentabilidade por Ciclo Produtivo</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Controle de custo por suíno terminado (Ração 72%, Leitão 14%, Mão de Obra 6%, Sanidade 4%, Energia/Água 4%). Cálculo automático do ponto de equilíbrio (Break-even R$/kg vivo).
          </p>

          <div className="p-3 bg-pink-50 rounded-xl text-xs space-y-1 text-pink-950 font-medium">
            <div className="flex justify-between">
              <span>Custo Médio Produção:</span>
              <span className="font-bold">R$ 5.95 / kg vivo</span>
            </div>
            <div className="flex justify-between">
              <span>Preço Médio Venda:</span>
              <span className="font-bold text-pink-700">R$ 7.40 / kg vivo (+24.3% Margem)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
