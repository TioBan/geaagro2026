// @ts-nocheck
import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  Truck,
  Building,
} from 'lucide-react';
import {
  SwineAnimal,
  SwineBatch,
  FarrowingLitter,
  SwineIESScore,
} from '../../types/swine';

interface SwineReportsViewProps {
  animals: SwineAnimal[];
  batches: SwineBatch[];
  litters: FarrowingLitter[];
  iesScore: SwineIESScore;
}

export const SwineReportsView: React.FC<SwineReportsViewProps> = ({
  animals,
  batches,
  litters,
  iesScore,
}) => {
  const [reportType, setReportType] = useState<'executive' | 'gta_slaughter' | 'reproductive' | 'batch_closure'>('executive');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-pink-600" />
            <span>Relatórios Executivos & Emissão de Documentos</span>
          </h2>
          <p className="text-xs text-gray-500">
            Geração de laudos zootécnicos, fechamento de lotes, espelho reprodutivo e checklist pré-GTA para abate.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'executive', label: '1. Relatório Zootécnico Executivo & IES' },
          { id: 'gta_slaughter', label: '2. Checklist Pré-GTA & Embarque Frigorífico' },
          { id: 'reproductive', label: '3. Mapa Reprodutivo de Matrizes' },
          { id: 'batch_closure', label: '4. Fechamento Zootécnico de Lote' },
        ].map(r => (
          <button
            key={r.id}
            onClick={() => setReportType(r.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              reportType === r.id
                ? 'bg-pink-600 text-white shadow-xs'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Printable Report Sheet Layout */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6 max-w-4xl mx-auto">
        {/* Farm Header */}
        <div className="flex items-start justify-between border-b border-gray-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-600 text-white flex items-center justify-center font-black text-lg">
              🐷
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">GRANJA VALE DAS MATRIZES LTDA</h3>
              <p className="text-xs text-gray-500">
                Sistema GeaAgro Suinocultura • Cadastro Técnico Oficial MAPA / SIF
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-gray-500">
            <span className="block font-bold text-gray-900">Emissão: {new Date().toLocaleDateString('pt-BR')}</span>
            <span>Documento Técnico Auditado</span>
          </div>
        </div>

        {/* 1. Executive Report */}
        {reportType === 'executive' && (
          <div className="space-y-6">
            <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-pink-950">Índice de Eficiência Suinícola (IES)</h4>
                <p className="text-xs text-pink-800">Classificação: {iesScore.classification}</p>
              </div>
              <div className="text-3xl font-black text-pink-700">{iesScore.overallScore} pts</div>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-gray-900 uppercase">Resumo Zootécnico Consolidado</h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block">Total de Animais:</span>
                  <span className="font-bold text-gray-900">865 suínos</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block">Matrizes Ativas:</span>
                  <span className="font-bold text-gray-900">182 matrizes</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block">Conversão Granja:</span>
                  <span className="font-bold text-emerald-700">2.35 kg/kg</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block">Mortalidade Geral:</span>
                  <span className="font-bold text-emerald-700">2.8%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Slaughter GTA Checklist */}
        {reportType === 'gta_slaughter' && (
          <div className="space-y-4 text-xs">
            <h4 className="text-sm font-black text-gray-900">
              Checklist de Rastreabilidade & Carência Pré-GTA
            </h4>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Status de Carência: Liberado para Abate</span>
              </div>
              <p className="text-xs">
                Nenhum animal do lote LOTE-TERM-2026-03 recebeu antibióticos ou promotores nos últimos 28 dias.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span>Lote Alvo:</span>
                <span className="font-bold">LOTE-TERM-2026-03</span>
              </div>
              <div className="flex justify-between">
                <span>Total de Suínos para Embarque:</span>
                <span className="font-bold">346 cabeças</span>
              </div>
              <div className="flex justify-between">
                <span>Peso Médio Estimado:</span>
                <span className="font-bold">114.2 kg</span>
              </div>
              <div className="flex justify-between">
                <span>Jejum Hídrico / Alimentar:</span>
                <span className="font-bold text-emerald-700">12 Horas Cumprido</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Reproductive */}
        {reportType === 'reproductive' && (
          <div className="space-y-4 text-xs">
            <h4 className="text-sm font-black text-gray-900">Espelho Reprodutivo do Plantel</h4>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b text-gray-600 font-bold">
                  <tr>
                    <th className="p-3">Matriz</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Partos</th>
                    <th className="p-3 text-center">Nasc. Vivos Méd.</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {animals.map(a => (
                    <tr key={a.id}>
                      <td className="p-3 font-bold">{a.code} ({a.breed})</td>
                      <td className="p-3">{a.status}</td>
                      <td className="p-3 text-center">4 partos</td>
                      <td className="p-3 text-center font-bold text-amber-700">14.8</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Batch Closure */}
        {reportType === 'batch_closure' && (
          <div className="space-y-4 text-xs">
            <h4 className="text-sm font-black text-gray-900">Fechamento Zootécnico de Lote de Creche</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl border">
                <span className="text-gray-500 block">Lote:</span>
                <span className="font-bold">LOTE-CR-2026-04</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border">
                <span className="text-gray-500 block">Conversão Alimentar:</span>
                <span className="font-bold text-emerald-700">1.25 kg/kg</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border">
                <span className="text-gray-500 block">GMD Médio:</span>
                <span className="font-bold">440 g/dia</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border">
                <span className="text-gray-500 block">Mortalidade:</span>
                <span className="font-bold text-emerald-700">1.4%</span>
              </div>
            </div>
          </div>
        )}

        {/* Signatures */}
        <div className="pt-8 border-t border-gray-200 grid grid-cols-2 gap-8 text-center text-xs text-gray-500">
          <div>
            <div className="border-b border-gray-300 w-48 mx-auto mb-2" />
            <span className="font-bold text-gray-800">Médico Veterinário Responsável</span>
            <span className="block text-[11px]">CRMV-RS 14.892</span>
          </div>
          <div>
            <div className="border-b border-gray-300 w-48 mx-auto mb-2" />
            <span className="font-bold text-gray-800">Gerente Técnico da Granja</span>
            <span className="block text-[11px]">Responsável Zootécnico</span>
          </div>
        </div>
      </div>
    </div>
  );
};
