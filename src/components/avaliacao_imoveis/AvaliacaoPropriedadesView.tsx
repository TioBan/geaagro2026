import React, { useState, useEffect, useRef } from 'react';
import { PropriedadeRuralAvaliacao, GlebaSetor } from '../../types/avaliacaoImoveis';
import {
  Building,
  Save,
  Plus,
  Trash2,
  MapPin,
  FileText,
  CheckCircle2,
  Layers,
  Truck
} from 'lucide-react';

interface Props {
  propriedade: PropriedadeRuralAvaliacao;
  onSalvarPropriedade: (prop: PropriedadeRuralAvaliacao) => void;
}

export const AvaliacaoPropriedadesView: React.FC<Props> = ({ propriedade, onSalvarPropriedade }) => {
  const [form, setForm] = useState<PropriedadeRuralAvaliacao>({ ...propriedade });
  const [mensagemSucesso, setMensagemSucesso] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setForm({ ...propriedade });
  }, [propriedade]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvarPropriedade(form);
    setMensagemSucesso(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMensagemSucesso(false), 3000);
  };

  const handleAddGleba = () => {
    const novaGleba: GlebaSetor = {
      id: `gleba-${Date.now()}`,
      nome: '',
      areaHa: 0,
      tipoUso: '',
      topografia: '',
      soloPredominante: ''
    };
    setForm({
      ...form,
      territorial: {
        ...form.territorial,
        glebas: [...form.territorial.glebas, novaGleba]
      }
    });
  };

  const handleRemoveGleba = (id: string) => {
    setForm({
      ...form,
      territorial: {
        ...form.territorial,
        glebas: form.territorial.glebas.filter((g) => g.id !== id)
      }
    });
  };

  const somaGlebasHa = form.territorial.glebas.reduce((acc, g) => acc + (Number(g.areaHa) || 0), 0);

  return (
    <form onSubmit={handleSalvar} className="space-y-6">
      {/* Barra de Ação Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Cadastro & Caracterização do Imóvel Rural
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Identificação registral, cartorial, territorial e logística conforme NBR 14653-3
          </p>
        </div>

        <div className="flex items-center gap-3">
          {mensagemSucesso && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Dados salvos!
            </span>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" /> Salvar Alterações
          </button>
        </div>
      </div>

      {/* 1. Identificação Geral & Registral */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
          <FileText className="w-4 h-4 text-emerald-500" />
          1. Identificação Registral e Notarial
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nome da Propriedade / Fazenda *
            </label>
            <input
              type="text"
              required
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Código Interno do Laudo
            </label>
            <input
              type="text"
              value={form.codigoInterno}
              onChange={(e) => setForm({ ...form, codigoInterno: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Área Total Registrada (Hectares) *
            </label>
            <input
              type="number"
              step="0.0001"
              required
              value={form.areaTotalHa}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setForm({
                  ...form,
                  areaTotalHa: val,
                  territorial: { ...form.territorial, areaTotalHa: val }
                });
              }}
              className="w-full px-3 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Proprietário(s) Titular(es)
            </label>
            <input
              type="text"
              value={form.proprietarioNome}
              onChange={(e) => setForm({ ...form, proprietarioNome: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              CPF ou CNPJ do Proprietário
            </label>
            <input
              type="text"
              value={form.proprietarioCpfCnpj}
              onChange={(e) => setForm({ ...form, proprietarioCpfCnpj: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Contato (Telefone / E-mail)
            </label>
            <input
              type="text"
              value={form.proprietarioContato}
              onChange={(e) => setForm({ ...form, proprietarioContato: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Matrícula Imobiliária
            </label>
            <input
              type="text"
              value={form.numeroMatricula}
              onChange={(e) => setForm({ ...form, numeroMatricula: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Cartório de Registro de Imóveis (CRI)
            </label>
            <input
              type="text"
              value={form.cartorioRegistro}
              onChange={(e) => setForm({ ...form, cartorioRegistro: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Número do CAR (Cadastro Ambiental Rural)
            </label>
            <input
              type="text"
              value={form.numeroCar}
              onChange={(e) => setForm({ ...form, numeroCar: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Código CCIR (INCRA)
            </label>
            <input
              type="text"
              value={form.numeroCcir}
              onChange={(e) => setForm({ ...form, numeroCcir: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Número ITR (NIRF)
            </label>
            <input
              type="text"
              value={form.numeroItr}
              onChange={(e) => setForm({ ...form, numeroItr: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Responsável Técnico & CREA
            </label>
            <input
              type="text"
              value={`${form.responsavelTecnicoNome} (${form.responsavelTecnicoCrea})`}
              onChange={(e) => setForm({ ...form, responsavelTecnicoNome: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 2. Localização & Coordenadas GPS */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
          <MapPin className="w-4 h-4 text-emerald-500" />
          2. Localização e Georreferenciamento
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Município *
            </label>
            <input
              type="text"
              required
              value={form.municipio}
              onChange={(e) => setForm({ ...form, municipio: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              UF *
            </label>
            <input
              type="text"
              required
              maxLength={2}
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Latitude Sede (Graus Decimais)
            </label>
            <input
              type="number"
              step="0.000001"
              value={form.coordenadasGps.latitude}
              onChange={(e) =>
                setForm({
                  ...form,
                  coordenadasGps: { ...form.coordenadasGps, latitude: parseFloat(e.target.value) || 0 }
                })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Longitude Sede (Graus Decimais)
            </label>
            <input
              type="number"
              step="0.000001"
              value={form.coordenadasGps.longitude}
              onChange={(e) =>
                setForm({
                  ...form,
                  coordenadasGps: { ...form.coordenadasGps, longitude: parseFloat(e.target.value) || 0 }
                })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Roteiro de Acesso / Endereço Completo
            </label>
            <input
              type="text"
              value={form.endereco}
              onChange={(e) => setForm({ ...form, endereco: e.target.value })}
              placeholder="Ex: Rodovia MT-242 Km 34 à direita, vicinal municipal..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 3. Caracterização Territorial & Uso do Solo */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            3. Balanço e Zoneamento de Áreas (Hectares)
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Total Cadastrado: <strong className="text-slate-800 dark:text-slate-200">{form.areaTotalHa} ha</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Lavouras (ha)
            </label>
            <input
              type="number"
              step="0.1"
              value={form.territorial.areaLavourasHa}
              onChange={(e) =>
                setForm({
                  ...form,
                  territorial: {
                    ...form.territorial,
                    areaLavourasHa: parseFloat(e.target.value) || 0
                  }
                })
              }
              className="w-full px-2.5 py-1.5 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Pastagens (ha)
            </label>
            <input
              type="number"
              step="0.1"
              value={form.territorial.areaPastagensHa}
              onChange={(e) =>
                setForm({
                  ...form,
                  territorial: {
                    ...form.territorial,
                    areaPastagensHa: parseFloat(e.target.value) || 0
                  }
                })
              }
              className="w-full px-2.5 py-1.5 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Reserva Legal (ha)
            </label>
            <input
              type="number"
              step="0.1"
              value={form.territorial.areaReservaLegalHa}
              onChange={(e) =>
                setForm({
                  ...form,
                  territorial: {
                    ...form.territorial,
                    areaReservaLegalHa: parseFloat(e.target.value) || 0
                  }
                })
              }
              className="w-full px-2.5 py-1.5 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              APP (ha)
            </label>
            <input
              type="number"
              step="0.1"
              value={form.territorial.areaAppHa}
              onChange={(e) =>
                setForm({
                  ...form,
                  territorial: {
                    ...form.territorial,
                    areaAppHa: parseFloat(e.target.value) || 0
                  }
                })
              }
              className="w-full px-2.5 py-1.5 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Irrigada / Pivô (ha)
            </label>
            <input
              type="number"
              step="0.1"
              value={form.territorial.areaIrrigadaHa}
              onChange={(e) =>
                setForm({
                  ...form,
                  territorial: {
                    ...form.territorial,
                    areaIrrigadaHa: parseFloat(e.target.value) || 0
                  }
                })
              }
              className="w-full px-2.5 py-1.5 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Sede / Infra (ha)
            </label>
            <input
              type="number"
              step="0.1"
              value={form.territorial.areaInfraestruturaHa}
              onChange={(e) =>
                setForm({
                  ...form,
                  territorial: {
                    ...form.territorial,
                    areaInfraestruturaHa: parseFloat(e.target.value) || 0
                  }
                })
              }
              className="w-full px-2.5 py-1.5 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Divisão em Glebas & Talhões */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Glebas, Talhões e Unidades Produtivas ({form.territorial.glebas.length} cadastradas • Total: {somaGlebasHa.toFixed(1)} ha)
            </h4>
            <button
              type="button"
              onClick={handleAddGleba}
              className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded flex items-center gap-1 font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Gleba / Talhão
            </button>
          </div>

          <div className="space-y-2">
            {form.territorial.glebas.map((g, idx) => (
              <div
                key={g.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/80 dark:border-slate-700 items-center text-xs"
              >
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={g.nome}
                    placeholder="Identificação da Gleba"
                    onChange={(e) => {
                      const updated = [...form.territorial.glebas];
                      updated[idx].nome = e.target.value;
                      setForm({ ...form, territorial: { ...form.territorial, glebas: updated } });
                    }}
                    className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="number"
                    step="0.1"
                    value={g.areaHa}
                    placeholder="Área (ha)"
                    onChange={(e) => {
                      const updated = [...form.territorial.glebas];
                      updated[idx].areaHa = parseFloat(e.target.value) || 0;
                      setForm({ ...form, territorial: { ...form.territorial, glebas: updated } });
                    }}
                    className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={g.tipoUso}
                    placeholder="Uso (ex: Soja pivot)"
                    onChange={(e) => {
                      const updated = [...form.territorial.glebas];
                      updated[idx].tipoUso = e.target.value;
                      setForm({ ...form, territorial: { ...form.territorial, glebas: updated } });
                    }}
                    className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={g.topografia}
                    placeholder="Topografia"
                    onChange={(e) => {
                      const updated = [...form.territorial.glebas];
                      updated[idx].topografia = e.target.value;
                      setForm({ ...form, territorial: { ...form.territorial, glebas: updated } });
                    }}
                    className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemoveGleba(g.id)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Caracterização Regional & Logística */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
          <Truck className="w-4 h-4 text-emerald-500" />
          4. Logística Regional e Acessos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Microrregião Geográfica
            </label>
            <input
              type="text"
              value={form.regional.microrregiao}
              onChange={(e) =>
                setForm({
                  ...form,
                  regional: { ...form.regional, microrregiao: e.target.value }
                })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Distância do Centro Urbano (km)
            </label>
            <input
              type="number"
              step="0.1"
              value={form.regional.distanciaCentroUrbanoKm}
              onChange={(e) =>
                setForm({
                  ...form,
                  regional: { ...form.regional, distanciaCentroUrbanoKm: parseFloat(e.target.value) || 0 }
                })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Distância Armazém / Cooperativa (km)
            </label>
            <input
              type="number"
              step="0.1"
              value={form.regional.distanciaCooperativaArmazemKm}
              onChange={(e) =>
                setForm({
                  ...form,
                  regional: { ...form.regional, distanciaCooperativaArmazemKm: parseFloat(e.target.value) || 0 }
                })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tipo de Acesso Rodoviário
            </label>
            <select
              value={form.regional.acessoRodoviario}
              onChange={(e: any) =>
                setForm({
                  ...form,
                  regional: { ...form.regional, acessoRodoviario: e.target.value }
                })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="Pavimentado">Pavimentado (Asfalto até a porteira)</option>
              <option value="Terra com cascalho">Terra com cascalho (Trafegabilidade o ano todo)</option>
              <option value="Terra sem conservação">Terra sem conservação (Dificuldade em chuvas)</option>
              <option value="Misto">Misto (Asfalto + trecho vicinal)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Disponibilidade de Energia Elétrica
            </label>
            <select
              value={form.regional.disponibilidadeEnergia}
              onChange={(e: any) =>
                setForm({
                  ...form,
                  regional: { ...form.regional, disponibilidadeEnergia: e.target.value }
                })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="Trifásica">Trifásica (Apta para motores industriais e pivôs)</option>
              <option value="Monofásica">Monofásica (Uso doméstico/básico)</option>
              <option value="Solar fotovoltaica">Solar fotovoltaica / Gerador próprio</option>
              <option value="Inexistente">Inexistente</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Condições das Estradas Regionais
            </label>
            <select
              value={form.regional.condicoesEstradas}
              onChange={(e: any) =>
                setForm({
                  ...form,
                  regional: { ...form.regional, condicoesEstradas: e.target.value }
                })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="Ótima">Ótima</option>
              <option value="Boa">Boa</option>
              <option value="Regular">Regular</option>
              <option value="Ruim">Ruim</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  );
};
