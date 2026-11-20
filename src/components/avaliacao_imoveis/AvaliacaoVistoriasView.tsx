import React, { useState, useEffect, useRef } from 'react';
import {
  VistoriaTecnica,
  PontoInteresseVistoria,
  VistoriaChecklistItem
} from '../../types/avaliacaoImoveis';
import {
  ClipboardCheck,
  Save,
  Plus,
  Trash2,
  MapPin,
  CheckCircle2,
  Download,
  FileCode,
  Compass
} from 'lucide-react';
import {
  exportarPontosVistoriaParaGeoJSON,
  exportarPontosParaKML,
  exportarPontosParaGPX,
  downloadArquivoTexto
} from '../../utils/geoFormatsParser';

interface Props {
  vistoria: VistoriaTecnica;
  propriedadeNome: string;
  onSalvarVistoria: (vistoria: VistoriaTecnica) => void;
}

const inputCls =
  'w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500';
const cellInputCls =
  'w-full h-8 px-2.5 text-xs rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500';
const labelCls = 'block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const AvaliacaoVistoriasView: React.FC<Props> = ({
  vistoria,
  propriedadeNome,
  onSalvarVistoria
}) => {
  const [form, setForm] = useState<VistoriaTecnica>({ ...vistoria });
  const [sucesso, setSucesso] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setForm({ ...vistoria });
  }, [vistoria]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvarVistoria(form);
    setSucesso(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSucesso(false), 3000);
  };

  const handleAddPonto = () => {
    const novoPonto: PontoInteresseVistoria = {
      id: `pt-${Date.now()}`,
      nome: `Ponto GPS ${form.pontosInteresse.length + 1}`,
      descricao: 'Vértice ou benfeitoria vistoriada in loco',
      coordenadas: {
        latitude: -12.5432,
        longitude: -55.7214,
        altitude: 360
      },
      categoria: 'limite'
    };
    setForm({
      ...form,
      pontosInteresse: [...form.pontosInteresse, novoPonto]
    });
  };

  const handleUpdatePonto = (id: string, patch: Partial<PontoInteresseVistoria>) => {
    setForm({
      ...form,
      pontosInteresse: form.pontosInteresse.map((p) => (p.id === id ? { ...p, ...patch } : p))
    });
  };

  const handleUpdatePontoCoord = (id: string, field: 'latitude' | 'longitude', val: number) => {
    setForm({
      ...form,
      pontosInteresse: form.pontosInteresse.map((p) =>
        p.id === id ? { ...p, coordenadas: { ...p.coordenadas, [field]: val } } : p
      )
    });
  };

  const handleRemovePonto = (id: string) => {
    setForm({
      ...form,
      pontosInteresse: form.pontosInteresse.filter((p) => p.id !== id)
    });
  };

  const handleAddChecklist = () => {
    const novoItem: VistoriaChecklistItem = {
      id: `chk-${Date.now()}`,
      categoria: 'terras',
      item: 'Novo item pericial de inspeção',
      status: 'conforme',
      observacao: 'Verificação em campo realizada'
    };
    setForm({
      ...form,
      checklist: [...form.checklist, novoItem]
    });
  };

  const handleUpdateChecklist = (id: string, patch: Partial<VistoriaChecklistItem>) => {
    setForm({
      ...form,
      checklist: form.checklist.map((c) => (c.id === id ? { ...c, ...patch } : c))
    });
  };

  const handleRemoveChecklist = (id: string) => {
    setForm({
      ...form,
      checklist: form.checklist.filter((c) => c.id !== id)
    });
  };

  const handleExportGeoJSON = () => {
    const geojson = exportarPontosVistoriaParaGeoJSON(form.pontosInteresse, propriedadeNome);
    downloadArquivoTexto(geojson, `Vistoria_${(propriedadeNome || 'Imovel').replace(/\s+/g, '_')}.geojson`);
  };

  const handleExportKML = () => {
    const kml = exportarPontosParaKML(form.pontosInteresse, propriedadeNome);
    downloadArquivoTexto(
      kml,
      `Vistoria_${(propriedadeNome || 'Imovel').replace(/\s+/g, '_')}.kml`,
      'application/vnd.google-earth.kml+xml'
    );
  };

  const handleExportGPX = () => {
    const gpx = exportarPontosParaGPX(form.pontosInteresse, propriedadeNome);
    downloadArquivoTexto(
      gpx,
      `Vistoria_${(propriedadeNome || 'Imovel').replace(/\s+/g, '_')}.gpx`,
      'application/gpx+xml'
    );
  };

  return (
    <form onSubmit={handleSalvar} className="space-y-5">
      {/* Barra de Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Vistoria Técnica Pericial & Pontos GPS
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Registro de constatações in loco, georreferenciamento de vértices, clima e exportação espacial
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {sucesso && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mr-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Salvo
            </span>
          )}
          <button
            type="button"
            onClick={handleExportGeoJSON}
            className="h-8 px-2.5 text-xs bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 rounded-lg flex items-center gap-1 font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> GeoJSON
          </button>
          <button
            type="button"
            onClick={handleExportKML}
            className="h-8 px-2.5 text-xs bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 rounded-lg flex items-center gap-1 font-medium transition-colors"
          >
            <FileCode className="w-3.5 h-3.5" /> KML
          </button>
          <button
            type="button"
            onClick={handleExportGPX}
            className="h-8 px-2.5 text-xs bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 rounded-lg flex items-center gap-1 font-medium transition-colors"
          >
            <Compass className="w-3.5 h-3.5" /> GPX
          </button>
          <button
            type="submit"
            className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> Salvar Vistoria
          </button>
        </div>
      </div>

      {/* Dados Gerais da Vistoria */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-4">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
          <ClipboardCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Condições e Realização da Vistoria
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Data da Vistoria *</label>
            <input
              type="date"
              required
              value={form.dataVistoria}
              onChange={(e) => setForm({ ...form, dataVistoria: e.target.value })}
              className={`${inputCls} tabular-nums`}
            />
          </div>

          <div>
            <label className={labelCls}>Horário / Período</label>
            <input
              type="text"
              value={form.horaVistoria}
              onChange={(e) => setForm({ ...form, horaVistoria: e.target.value })}
              placeholder="Ex: 08:00 às 17:30"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Nome do Vistoriador / Perito *</label>
            <input
              type="text"
              required
              value={form.vistoriadorNome}
              onChange={(e) => setForm({ ...form, vistoriadorNome: e.target.value })}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>CREA do Vistoriador</label>
            <input
              type="text"
              value={form.vistoriadorCrea}
              onChange={(e) => setForm({ ...form, vistoriadorCrea: e.target.value })}
              className={`${inputCls} tabular-nums`}
            />
          </div>

          <div className="md:col-span-4">
            <label className={labelCls}>
              Condições Climáticas & Acessibilidade Durante a Vistoria
            </label>
            <input
              type="text"
              value={form.condicoesClimaticas}
              onChange={(e) => setForm({ ...form, condicoesClimaticas: e.target.value })}
              placeholder="Ex: Tempo ensolarado, 30°C, visibilidade total, sem restrições de trânsito interno"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Checklist Técnico em Campo */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5 flex-wrap">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Checklist de Conformidade ({form.checklist.length} itens)
          </h3>
          <button
            type="button"
            onClick={handleAddChecklist}
            className="h-8 px-2.5 text-xs bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200/80 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg flex items-center gap-1 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Item
          </button>
        </div>

        {form.checklist.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 dark:text-zinc-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg">
            Nenhum item de checklist registrado.
          </div>
        ) : (
          <div className="space-y-2">
            {form.checklist.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/80 dark:border-zinc-800 items-center text-xs"
              >
                <div className="sm:col-span-2">
                  <select
                    value={item.categoria}
                    onChange={(e) =>
                      handleUpdateChecklist(item.id, {
                        categoria: e.target.value as VistoriaChecklistItem['categoria']
                      })
                    }
                    className={`${cellInputCls} uppercase font-medium text-[11px]`}
                  >
                    <option value="terras">Terras</option>
                    <option value="benfeitorias">Benfeitorias</option>
                    <option value="ambiental">Ambiental</option>
                    <option value="recursos_hidricos">Recursos Hídricos</option>
                    <option value="acessos">Acessos</option>
                    <option value="conflitos">Conflitos/Posse</option>
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={item.item}
                    onChange={(e) => handleUpdateChecklist(item.id, { item: e.target.value })}
                    placeholder="Descrição do item verificado"
                    className={cellInputCls}
                  />
                </div>

                <div className="sm:col-span-2">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleUpdateChecklist(item.id, {
                        status: e.target.value as VistoriaChecklistItem['status']
                      })
                    }
                    className={`w-full h-8 px-2 rounded-md border font-medium text-xs ${
                      item.status === 'conforme'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60'
                        : item.status === 'atencao'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60'
                        : item.status === 'critico'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60'
                        : 'bg-white text-slate-700 border-slate-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    <option value="conforme">Conforme</option>
                    <option value="atencao">Atenção</option>
                    <option value="critico">Crítico</option>
                    <option value="nao_aplicavel">N/A</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={item.observacao}
                    onChange={(e) => handleUpdateChecklist(item.id, { observacao: e.target.value })}
                    placeholder="Observações do perito"
                    className={cellInputCls}
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklist(item.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Remover item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pontos de Interesse GPS & Vértices */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5 flex-wrap">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Pontos de Interesse Georreferenciados ({form.pontosInteresse.length} waypoints)
          </h3>
          <button
            type="button"
            onClick={handleAddPonto}
            className="h-8 px-2.5 text-xs bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200/80 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg flex items-center gap-1 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Ponto GPS
          </button>
        </div>

        {form.pontosInteresse.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 dark:text-zinc-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg">
            Nenhum waypoint GPS registrado.
          </div>
        ) : (
          <div className="space-y-2">
            {form.pontosInteresse.map((pt) => (
              <div
                key={pt.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/80 dark:border-zinc-800 items-center text-xs"
              >
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={pt.nome}
                    onChange={(e) => handleUpdatePonto(pt.id, { nome: e.target.value })}
                    placeholder="Nome do Ponto"
                    className={`${cellInputCls} font-medium`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <select
                    value={pt.categoria}
                    onChange={(e) =>
                      handleUpdatePonto(pt.id, {
                        categoria: e.target.value as PontoInteresseVistoria['categoria']
                      })
                    }
                    className={cellInputCls}
                  >
                    <option value="limite">Vértice / Limite</option>
                    <option value="benfeitoria">Benfeitoria / Sede</option>
                    <option value="nascente">Nascente / Hídrico</option>
                    <option value="solo_erosao">Solo / Trincheira</option>
                    <option value="acesso">Entrada / Acesso</option>
                    <option value="ponto_foto">Ponto Fotográfico</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="number"
                    step="0.000001"
                    value={pt.coordenadas.latitude}
                    onChange={(e) =>
                      handleUpdatePontoCoord(pt.id, 'latitude', parseFloat(e.target.value) || 0)
                    }
                    placeholder="Latitude"
                    className={`${cellInputCls} font-mono tabular-nums`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="number"
                    step="0.000001"
                    value={pt.coordenadas.longitude}
                    onChange={(e) =>
                      handleUpdatePontoCoord(pt.id, 'longitude', parseFloat(e.target.value) || 0)
                    }
                    placeholder="Longitude"
                    className={`${cellInputCls} font-mono tabular-nums`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={pt.descricao}
                    onChange={(e) => handleUpdatePonto(pt.id, { descricao: e.target.value })}
                    placeholder="Detalhes / Descrição"
                    className={cellInputCls}
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemovePonto(pt.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Remover waypoint"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
};
