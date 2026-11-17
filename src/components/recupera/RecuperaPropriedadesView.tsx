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

  const mostrarGpsMsg = (tipo: 'sucesso' | 'erro', texto: string) => {
    setGpsMsg({ tipo, texto });
  };

  const handleChange = (campo: keyof PropriedadeRecupera, valor: any) => {
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
        (pos) => {
          setForm(prev => ({
            ...prev,
            coordenadasSede: {
              latitude: Number(pos.coords.latitude.toFixed(6)),
              longitude: Number(pos.coords.longitude.toFixed(6)),
              altitude: pos.coords.altitude ? Number(pos.coords.altitude.toFixed(0)) : prev.coordenadasSede.altitude,
              precisaoM: pos.coords.accuracy ? Number(pos.coords.accuracy.toFixed(1)) : 5
            }
          }));
          mostrarGpsMsg('sucesso', `GPS capturado: Lat ${pos.coords.latitude.toFixed(6)}, Lng ${pos.coords.longitude.toFixed(6)}`);
        },
        (err) => {
          mostrarGpsMsg('erro', `Não foi possível capturar o GPS: ${err.message}`);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      mostrarGpsMsg('erro', 'Geolocalização não suportada neste dispositivo.');
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span>Cadastro Técnico da Propriedade Rural</span>
          </h2>
          <p className="text-xs text-slate-500">
            Identificação territorial, registros ambientais (CAR, CCIR), produtor e coordenadas
          </p>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-2 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Alterações</span>
        </button>
      </div>

      {salvo && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Dados da propriedade rural salvos com sucesso no armazenamento local!</span>
        </div>
      )}

      {/* Grid de Formulários */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bloco 1: Identificação Básica & Produtor */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>1. Identificação do Imóvel & Produtor</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome da Propriedade / Fazenda *
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={e => handleChange('nome', e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                placeholder="Ex: Fazenda Santa Maria"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Município *
                </label>
                <input
                  type="text"
                  value={form.municipio}
                  onChange={e => handleChange('municipio', e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estado (UF) *
                </label>
                <input
                  type="text"
                  value={form.estado}
                  onChange={e => handleChange('estado', e.target.value.toUpperCase())}
                  maxLength={2}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Produtor Rural
                </label>
                <input
                  type="text"
                  value={form.produtorNome}
                  onChange={e => handleChange('produtorNome', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  CPF / CNPJ
                </label>
                <input
                  type="text"
                  value={form.produtorCpfCnpj}
                  onChange={e => handleChange('produtorCpfCnpj', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Número do CAR
                </label>
                <input
                  type="text"
                  value={form.carNumero}
                  onChange={e => handleChange('carNumero', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  placeholder="UF-0000000-..."
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  CCIR / INCRA
                </label>
                <input
                  type="text"
                  value={form.ccirNumero}
                  onChange={e => handleChange('ccirNumero', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Matrícula Cartório
                </label>
                <input
                  type="text"
                  value={form.matricula}
                  onChange={e => handleChange('matricula', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 2: Áreas Territoriais & Coordenadas GPS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>2. Território & Coordenadas Geográficas</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Área Total da Propriedade (ha) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.areaTotalHa}
                  onChange={e => handleChange('areaTotalHa', parseFloat(e.target.value) || 0)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Área Produtiva Consolidada (ha)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.areaProdutivaHa}
                  onChange={e => handleChange('areaProdutivaHa', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Área de APP (ha)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.areaPreservacaoPermanenteHa}
                  onChange={e => handleChange('areaPreservacaoPermanenteHa', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Área de Reserva Legal (ha)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.areaReservaLegalHa}
                  onChange={e => handleChange('areaReservaLegalHa', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* GPS da Sede */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Coordenadas da Sede (WGS84)
                </span>
                <button
                  type="button"
                  onClick={handleCapturarGpsAtual}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Capturar GPS Atual</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={form.coordenadasSede.latitude}
                    onChange={e => handleCoordenadasChange('latitude', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={form.coordenadasSede.longitude}
                    onChange={e => handleCoordenadasChange('longitude', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Altitude (m)</label>
                  <input
                    type="number"
                    value={form.coordenadasSede.altitude || 0}
                    onChange={e => handleCoordenadasChange('altitude', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {gpsMsg && (
                <div className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 ${
                  gpsMsg.tipo === 'sucesso'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}>
                  {gpsMsg.tipo === 'sucesso' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                  <span>{gpsMsg.texto}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bloco 3: Responsável Técnico & Documentação */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>3. Responsabilidade Técnica (CREA / ART)</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome do Engenheiro Agrônomo / Florestal Responsável
              </label>
              <input
                type="text"
                value={form.responsavelTecnico}
                onChange={e => handleChange('responsavelTecnico', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                placeholder="Ex: Dr. Lucas Mendes - Eng. Agrônomo"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Número do CREA
                </label>
                <input
                  type="text"
                  value={form.creaNumero}
                  onChange={e => handleChange('creaNumero', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  placeholder="CREA 00000/D"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Número da ART de Recuperação
                </label>
                <input
                  type="text"
                  value={form.artNumero}
                  onChange={e => handleChange('artNumero', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  placeholder="ART-2025-00000"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Histórico Geral de Utilização do Solo
              </label>
              <textarea
                value={form.historicoGeral}
                onChange={e => handleChange('historicoGeral', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 resize-none"
                placeholder="Histórico de lavouras anteriores, pastoreio, queimadas, adubações prévias e degradação..."
              />
            </div>
          </div>
        </div>

        {/* Bloco 4: Fotografias e Observações Gerais */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>4. Galeria de Fotos da Propriedade</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex gap-2">
              <input
                type="url"
                value={novaFotoUrl}
                onChange={e => setNovaFotoUrl(e.target.value)}
                placeholder="Cole a URL de uma foto (https://...)"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAdicionarFoto}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 min-h-24 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              {(!form.fotografias || form.fotografias.length === 0) ? (
                <div className="col-span-3 py-6 text-center text-slate-400">
                  Nenhuma fotografia anexada ainda.
                </div>
              ) : (
                form.fotografias.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video">
                    <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoverFoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Observações Gerais
              </label>
              <textarea
                value={form.observacoes}
                onChange={e => handleChange('observacoes', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 resize-none"
                placeholder="Anotações gerais e condicionantes de acesso..."
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
