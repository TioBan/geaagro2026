import React, { useState, useEffect, useRef } from 'react';
import { VistoriaTecnica, PontoInteresseVistoria, VistoriaChecklistItem } from '../../types/avaliacaoImoveis';
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

  const handleRemoveChecklist = (id: string) => {
    setForm({
      ...form,
      checklist: form.checklist.filter((c) => c.id !== id)
    });
  };

  const handleExportGeoJSON = () => {
    const geojson = exportarPontosVistoriaParaGeoJSON(form.pontosInteresse, propriedadeNome);
    downloadArquivoTexto(geojson, `Vistoria_${propriedadeNome.replace(/\s+/g, '_')}.geojson`);
  };

  const handleExportKML = () => {
    const kml = exportarPontosParaKML(form.pontosInteresse, propriedadeNome);
    downloadArquivoTexto(kml, `Vistoria_${propriedadeNome.replace(/\s+/g, '_')}.kml`, 'application/vnd.google-earth.kml+xml');
  };

  const handleExportGPX = () => {
    const gpx = exportarPontosParaGPX(form.pontosInteresse, propriedadeNome);
    downloadArquivoTexto(gpx, `Vistoria_${propriedadeNome.replace(/\s+/g, '_')}.gpx`, 'application/gpx+xml');
  };

  return (
    <form onSubmit={handleSalvar} className="space-y-6">
      {/* Barra de Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Vistoria Técnica Pericial & Pontos GPS
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registro de constatações in loco, georreferenciamento de vértices, clima e exportação de dados espaciais
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sucesso && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mr-2">
              <CheckCircle2 className="w-4 h-4" /> Vistoria salva!
            </span>
          )}
          <button
            type="button"
            onClick={handleExportGeoJSON}
            className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> GeoJSON
          </button>
          <button
            type="button"
            onClick={handleExportKML}
            className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
          >
            <FileCode className="w-3.5 h-3.5" /> KML
          </button>
          <button
            type="button"
            onClick={handleExportGPX}
            className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
          >
            <Compass className="w-3.5 h-3.5" /> GPX
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" /> Salvar Vistoria
          </button>
        </div>
      </div>

      {/* Dados Gerais da Vistoria */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
          <ClipboardCheck className="w-4 h-4 text-emerald-500" />
          Condições e Realização da Vistoria
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Data da Vistoria *
            </label>
            <input
              type="date"
              required
              value={form.dataVistoria}
              onChange={(e) => setForm({ ...form, dataVistoria: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Horário / Período
            </label>
            <input
              type="text"
              value={form.horaVistoria}
              onChange={(e) => setForm({ ...form, horaVistoria: e.target.value })}
              placeholder="Ex: 08:00 às 17:30"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nome do Vistoriador / Perito *
            </label>
            <input
              type="text"
              required
              value={form.vistoriadorNome}
              onChange={(e) => setForm({ ...form, vistoriadorNome: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              CREA do Vistoriador
            </label>
            <input
              type="text"
              value={form.vistoriadorCrea}
              onChange={(e) => setForm({ ...form, vistoriadorCrea: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Condições Climáticas & Acessibilidade Durante a Vistoria
            </label>
            <input
              type="text"
              value={form.condicoesClimaticas}
              onChange={(e) => setForm({ ...form, condicoesClimaticas: e.target.value })}
              placeholder="Ex: Tempo ensolarado, temperatura 30°C, visibilidade total, sem restrições de trânsito interno"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Checklist Técnico em Campo */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-500" />
            Checklist de Conformidade Técnica da Vistoria ({form.checklist.length} itens)
          </h3>
          <button
            type="button"
            onClick={handleAddChecklist}
            className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded flex items-center gap-1 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Item de Vistoria
          </button>
        </div>

        <div className="space-y-2">
          {form.checklist.map((item, idx) => (
            <div
              key={item.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/80 dark:border-slate-700 items-center text-xs"
            >
              <div className="sm:col-span-2">
                <select
                  value={item.categoria}
                  onChange={(e: any) => {
                    const updated = [...form.checklist];
                    updated[idx].categoria = e.target.value;
                    setForm({ ...form, checklist: updated });
                  }}
                  className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-semibold text-[10px]"
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
                  onChange={(e) => {
                    const updated = [...form.checklist];
                    updated[idx].item = e.target.value;
                    setForm({ ...form, checklist: updated });
                  }}
                  placeholder="Descrição do item verificado"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <select
                  value={item.status}
                  onChange={(e: any) => {
                    const updated = [...form.checklist];
                    updated[idx].status = e.target.value;
                    setForm({ ...form, checklist: updated });
                  }}
                  className={`w-full px-2 py-1.5 rounded border font-semibold text-xs ${
                    item.status === 'conforme'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : item.status === 'atencao'
                      ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400'
                      : item.status === 'critico'
                      ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-400'
                      : 'bg-slate-50 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                  }`}
                >
                  <option value="conforme">Conforme</option>
                  <option value="atencao">Atenção</option>
                  <option value="critico">Crítico / Não Conforme</option>
                  <option value="nao_aplicavel">Não Aplicável</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <input
                  type="text"
                  value={item.observacao}
                  onChange={(e) => {
                    const updated = [...form.checklist];
                    updated[idx].observacao = e.target.value;
                    setForm({ ...form, checklist: updated });
                  }}
                  placeholder="Observações do perito"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-1 text-right">
                <button
                  type="button"
                  onClick={() => handleRemoveChecklist(item.id)}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pontos de Interesse GPS & Vértices */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500" />
            Pontos de Interesse Georreferenciados (GPS) ({form.pontosInteresse.length} waypoints)
          </h3>
          <button
            type="button"
            onClick={handleAddPonto}
            className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded flex items-center gap-1 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Ponto GPS
          </button>
        </div>

        <div className="space-y-2">
          {form.pontosInteresse.map((pt, idx) => (
            <div
              key={pt.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/80 dark:border-slate-700 items-center text-xs"
            >
              <div className="sm:col-span-3">
                <input
                  type="text"
                  value={pt.nome}
                  onChange={(e) => {
                    const updated = [...form.pontosInteresse];
                    updated[idx].nome = e.target.value;
                    setForm({ ...form, pontosInteresse: updated });
                  }}
                  placeholder="Nome do Ponto"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <select
                  value={pt.categoria}
                  onChange={(e: any) => {
                    const updated = [...form.pontosInteresse];
                    updated[idx].categoria = e.target.value;
                    setForm({ ...form, pontosInteresse: updated });
                  }}
                  className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-[11px]"
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
                  onChange={(e) => {
                    const updated = [...form.pontosInteresse];
                    updated[idx].coordenadas.latitude = parseFloat(e.target.value) || 0;
                    setForm({ ...form, pontosInteresse: updated });
                  }}
                  placeholder="Latitude"
                  className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              <div className="sm:col-span-2">
                <input
                  type="number"
                  step="0.000001"
                  value={pt.coordenadas.longitude}
                  onChange={(e) => {
                    const updated = [...form.pontosInteresse];
                    updated[idx].coordenadas.longitude = parseFloat(e.target.value) || 0;
                    setForm({ ...form, pontosInteresse: updated });
                  }}
                  placeholder="Longitude"
                  className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={pt.descricao}
                  onChange={(e) => {
                    const updated = [...form.pontosInteresse];
                    updated[idx].descricao = e.target.value;
                    setForm({ ...form, pontosInteresse: updated });
                  }}
                  placeholder="Detalhes / Descrição"
                  className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-[11px]"
                />
              </div>

              <div className="sm:col-span-1 text-right">
                <button
                  type="button"
                  onClick={() => handleRemovePonto(pt.id)}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};
