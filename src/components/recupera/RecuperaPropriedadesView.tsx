import React, { useState, useEffect } from 'react';
import { PropriedadeRecupera } from '../../types/recupera';
import { criarPropriedadeVaziaRecupera } from '../../utils/recuperaStorage';
import { useTimedFlag, useTimedValue } from './useTimedFlag';
import {
  Building2,
  Save,
  MapPin,
  User,
  Shield,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Plus,
  Trash2
} from 'lucide-react';

interface Props {
  propriedade?: PropriedadeRecupera;
  onSalvarPropriedade: (propriedadeAtualizada: PropriedadeRecupera) => void;
}

const INPUT_CLASS =
  'w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition';

const TEXTAREA_CLASS =
  'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition resize-none';

export const RecuperaPropriedadesView: React.FC<Props> = ({
  propriedade,
  onSalvarPropriedade
}) => {
  const [form, setForm] = useState<PropriedadeRecupera>(() =>
    propriedade ? { ...propriedade } : criarPropriedadeVaziaRecupera()
  );
  const [salvo, dispararSalvo, limparSalvo] = useTimedFlag(3000);
  const [novaFotoUrl, setNovaFotoUrl] = useState('');
  const [gpsMsg, setGpsMsg] = useTimedValue<{ tipo: 'sucesso' | 'erro'; texto: string }>(5000);

  useEffect(() => {
    setForm(propriedade ? { ...propriedade } : criarPropriedadeVaziaRecupera());
  }, [propriedade]);

  const handleChange = <K extends keyof PropriedadeRecupera>(campo: K, valor: PropriedadeRecupera[K]) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    limparSalvo();
  };

  const handleCoordenadasChange = (campo: 'latitude' | 'longitude' | 'altitude', valor: number) => {
    setForm(prev => ({
      ...prev,
      coordenadasSede: {
        ...prev.coordenadasSede,
        [campo]: valor
      }
    }));
    limparSalvo();
  };

  const handleCapturarGpsAtual = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setForm(prev => ({
            ...prev,
            coordenadasSede: {
              latitude: Number(pos.coords.latitude.toFixed(6)),
              longitude: Number(pos.coords.longitude.toFixed(6)),
              altitude: pos.coords.altitude ? Number(pos.coords.altitude.toFixed(0)) : prev.coordenadasSede.altitude,
              precisaoM: pos.coords.accuracy ? Number(pos.coords.accuracy.toFixed(1)) : 5
            }
          }));
          setGpsMsg({
            tipo: 'sucesso',
            texto: `GPS capturado: Lat ${pos.coords.latitude.toFixed(6)}, Lng ${pos.coords.longitude.toFixed(6)}`
          });
        },
        err => {
          setGpsMsg({ tipo: 'erro', texto: `Não foi possível capturar o GPS: ${err.message}` });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setGpsMsg({ tipo: 'erro', texto: 'Geolocalização não suportada neste dispositivo.' });
    }
  };

  const handleAdicionarFoto = () => {
    if (!novaFotoUrl.trim()) return;
    setForm(prev => ({
      ...prev,
      fotografias: [...(prev.fotografias || []), novaFotoUrl.trim()]
    }));
    setNovaFotoUrl('');
    limparSalvo();
  };

  const handleRemoverFoto = (idx: number) => {
    setForm(prev => ({
      ...prev,
      fotografias: (prev.fotografias || []).filter((_, i) => i !== idx)
    }));
    limparSalvo();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvarPropriedade(form);
    dispararSalvo();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Cadastro Técnico da Propriedade Rural</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Identificação territorial, registros ambientais (CAR, CCIR), produtor e coordenadas
          </p>
        </div>

        <button
          type="submit"
          className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition inline-flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Salvar Alterações</span>
        </button>
      </div>

      {salvo && (
        <div className="px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70 rounded-lg text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Dados da propriedade rural salvos com sucesso.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Bloco 1: Identificação Básica & Produtor */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
            <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>1. Identificação do Imóvel & Produtor</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Nome da Propriedade / Fazenda *
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={e => handleChange('nome', e.target.value)}
                required
                className={INPUT_CLASS}
                placeholder="Ex: Fazenda Santa Maria"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">Município *</label>
                <input
                  type="text"
                  value={form.municipio}
                  onChange={e => handleChange('municipio', e.target.value)}
                  required
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">Estado (UF) *</label>
                <input
                  type="text"
                  value={form.estado}
                  onChange={e => handleChange('estado', e.target.value.toUpperCase())}
                  maxLength={2}
                  required
                  className={`${INPUT_CLASS} uppercase`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">Nome do Produtor Rural</label>
                <input
                  type="text"
                  value={form.produtorNome}
                  onChange={e => handleChange('produtorNome', e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">CPF / CNPJ</label>
                <input
                  type="text"
                  value={form.produtorCpfCnpj}
                  onChange={e => handleChange('produtorCpfCnpj', e.target.value)}
                  className={`${INPUT_CLASS} tabular-nums`}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">Número do CAR</label>
                <input
                  type="text"
                  value={form.carNumero}
                  onChange={e => handleChange('carNumero', e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="UF-0000000-..."
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">CCIR / INCRA</label>
                <input
                  type="text"
                  value={form.ccirNumero}
                  onChange={e => handleChange('ccirNumero', e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">Matrícula Cartório</label>
                <input
                  type="text"
                  value={form.matricula}
                  onChange={e => handleChange('matricula', e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 2: Áreas Territoriais & Coordenadas GPS */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
            <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>2. Território & Coordenadas Geográficas</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Área Total (ha) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.areaTotalHa}
                  onChange={e => handleChange('areaTotalHa', parseFloat(e.target.value) || 0)}
                  required
                  className={`${INPUT_CLASS} font-semibold tabular-nums`}
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Área Produtiva (ha)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.areaProdutivaHa}
                  onChange={e => handleChange('areaProdutivaHa', parseFloat(e.target.value) || 0)}
                  className={`${INPUT_CLASS} tabular-nums`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">Área de APP (ha)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.areaPreservacaoPermanenteHa}
                  onChange={e => handleChange('areaPreservacaoPermanenteHa', parseFloat(e.target.value) || 0)}
                  className={`${INPUT_CLASS} tabular-nums`}
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Reserva Legal (ha)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.areaReservaLegalHa}
                  onChange={e => handleChange('areaReservaLegalHa', parseFloat(e.target.value) || 0)}
                  className={`${INPUT_CLASS} tabular-nums`}
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/80 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-slate-700 dark:text-zinc-300">
                  Coordenadas da Sede (WGS84)
                </span>
                <button
                  type="button"
                  onClick={handleCapturarGpsAtual}
                  className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md text-[11px] transition inline-flex items-center gap-1 whitespace-nowrap"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Capturar GPS</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-0.5">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={form.coordenadasSede.latitude}
                    onChange={e => handleCoordenadasChange('latitude', parseFloat(e.target.value) || 0)}
                    className="w-full h-8 px-2 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-0.5">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={form.coordenadasSede.longitude}
                    onChange={e => handleCoordenadasChange('longitude', parseFloat(e.target.value) || 0)}
                    className="w-full h-8 px-2 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-0.5">Altitude (m)</label>
                  <input
                    type="number"
                    value={form.coordenadasSede.altitude || 0}
                    onChange={e => handleCoordenadasChange('altitude', parseFloat(e.target.value) || 0)}
                    className="w-full h-8 px-2 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>

              {gpsMsg && (
                <div
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium flex items-center gap-1.5 border ${
                    gpsMsg.tipo === 'sucesso'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/70'
                  }`}
                >
                  {gpsMsg.tipo === 'sucesso' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="tabular-nums">{gpsMsg.texto}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bloco 3: Responsável Técnico & Documentação */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>3. Responsabilidade Técnica (CREA / ART)</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Nome do Engenheiro Agrônomo / Florestal Responsável
              </label>
              <input
                type="text"
                value={form.responsavelTecnico}
                onChange={e => handleChange('responsavelTecnico', e.target.value)}
                className={INPUT_CLASS}
                placeholder="Ex: Dr. Lucas Mendes - Eng. Agrônomo"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">Número do CREA</label>
                <input
                  type="text"
                  value={form.creaNumero}
                  onChange={e => handleChange('creaNumero', e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="CREA 00000/D"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Número da ART
                </label>
                <input
                  type="text"
                  value={form.artNumero}
                  onChange={e => handleChange('artNumero', e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="ART-2025-00000"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Histórico Geral de Utilização do Solo
              </label>
              <textarea
                value={form.historicoGeral}
                onChange={e => handleChange('historicoGeral', e.target.value)}
                rows={3}
                className={TEXTAREA_CLASS}
                placeholder="Histórico de lavouras anteriores, pastoreio, queimadas, adubações prévias e degradação..."
              />
            </div>
          </div>
        </div>

        {/* Bloco 4: Fotografias e Observações Gerais */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
            <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>4. Galeria de Fotos da Propriedade</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex gap-2">
              <input
                type="url"
                value={novaFotoUrl}
                onChange={e => setNovaFotoUrl(e.target.value)}
                placeholder="Cole a URL de uma foto (https://...)"
                className={`${INPUT_CLASS} flex-1`}
              />
              <button
                type="button"
                onClick={handleAdicionarFoto}
                className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition inline-flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 min-h-24 p-2 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800">
              {!form.fotografias || form.fotografias.length === 0 ? (
                <div className="col-span-3 py-6 text-center text-slate-400 dark:text-zinc-500">
                  Nenhuma fotografia anexada ainda.
                </div>
              ) : (
                form.fotografias.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    className="relative group rounded-md overflow-hidden border border-slate-200 dark:border-zinc-700 aspect-video"
                  >
                    <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoverFoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition"
                      aria-label="Remover foto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Observações Gerais
              </label>
              <textarea
                value={form.observacoes}
                onChange={e => handleChange('observacoes', e.target.value)}
                rows={2}
                className={TEXTAREA_CLASS}
                placeholder="Anotações gerais e condicionantes de acesso..."
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
