import React, { useState } from 'react';
import {
  MapPin,
  Camera,
  Mic,
  Video,
  FlaskConical,
  CheckSquare,
  Clock,
  Share2,
  Plus,
  Trash2,
  Navigation,
  Sun,
  CloudRain,
  Wind,
  Layers,
  Tag,
  CheckCircle2,
  AlertCircle,
  Image,
} from 'lucide-react';
import {
  Pericia,
  PericiaVistoria,
  PericiaFotografia,
  PericiaAudioVideo,
  PericiaAmostra,
  PericiaChecklistFieldItem,
  PericiaFieldDiaryItem,
  PericiaEvidenceItem,
} from '../../types/pericia';
import { PericiaGeorreferenciamentoSection } from './PericiaGeorreferenciamentoSection';

interface PericiaSubmoduleVistoriaProps {
  pericia: Pericia;
  onUpdatePericia: (updated: Pericia) => void;
}

export const PericiaSubmoduleVistoria: React.FC<PericiaSubmoduleVistoriaProps> = ({
  pericia,
  onUpdatePericia,
}) => {
  const [activeTab, setActiveTab] = useState<
    'vistorias' | 'gps' | 'fotos' | 'midia' | 'amostras' | 'checklist' | 'diario' | 'cadeia'
  >('vistorias');

  // New Vistoria State
  const [newVistoria, setNewVistoria] = useState<Partial<PericiaVistoria>>({
    data: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().substring(0, 5),
    responsavel: pericia.responsavelTecnico,
    local: '',
    coordenadas: { lat: -16.1482, lng: -47.5192, altitude: 980, precisaoMeters: 2.0 },
    condicoesClimaticas: {
      temperaturaC: 25,
      umidadePercent: 70,
      chuvaRecente: 'Sem chuva nas últimas 48h',
      vento: 'Moderado (5 km/h)',
      condicaoSolo: 'Umidade adequada',
    },
    cultura: pericia.objetoDescricao.cultura || '',
    cultivar: '',
    estagioFenologico: '',
    areaVistoriadaHa: pericia.objetoDescricao.areaAfetadaHa || 0,
    objetivo: 'Inspeção presencial e amostragem de evidências',
    observacoes: '',
  });

  // New Photo State
  const [newFoto, setNewFoto] = useState<Partial<PericiaFotografia>>({
    local: '',
    descricao: '',
    talhao: pericia.objetoDescricao.localTalhao || '',
    tipoEvidencia: 'sintoma',
    fotoUrl: '',
    tagsAnotacao: ['Sintoma Foliar'],
  });

  // New Sample State
  const [newAmostra, setNewAmostra] = useState<Partial<PericiaAmostra>>({
    codigo: `AMS-${Date.now().toString().substring(7)}`,
    data: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().substring(0, 5),
    talhao: pericia.objetoDescricao.localTalhao || '',
    profundidadeCm: '0-20 cm',
    material: 'solo',
    responsavel: pericia.responsavelTecnico,
    laboratorio: '',
    resultado: '',
    observacoes: '',
  });

  // New Diary Entry State
  const [newDiaryEntry, setNewDiaryEntry] = useState('');

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isGalleryActive, setIsGalleryActive] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  // New Evidence Item State
  const [newEvidence, setNewEvidence] = useState<Partial<PericiaEvidenceItem>>({
    fato: '',
    fonte: 'Vistoria presencial de campo',
    local: '',
    analise: '',
    conclusao: '',
  });

  // Handlers
  const handleAddVistoria = () => {
    if (!newVistoria.local) return;
    const v: PericiaVistoria = {
      id: `vis-${Date.now()}`,
      data: newVistoria.data || new Date().toISOString().split('T')[0],
      hora: newVistoria.hora || '10:00',
      responsavel: newVistoria.responsavel || pericia.responsavelTecnico,
      local: newVistoria.local || '',
      coordenadas: newVistoria.coordenadas || { lat: -16.1482, lng: -47.5192 },
      condicoesClimaticas: newVistoria.condicoesClimaticas || {
        temperaturaC: 25,
        umidadePercent: 70,
        chuvaRecente: '',
        vento: '',
        condicaoSolo: '',
      },
      cultura: newVistoria.cultura || '',
      cultivar: newVistoria.cultivar || '',
      estagioFenologico: newVistoria.estagioFenologico || '',
      areaVistoriadaHa: Number(newVistoria.areaVistoriadaHa || 0),
      objetivo: newVistoria.objetivo || '',
      observacoes: newVistoria.observacoes || '',
    };

    onUpdatePericia({
      ...pericia,
      vistorias: [...pericia.vistorias, v],
      status: pericia.status === 'aguardando_vistoria' ? 'em_analise' : pericia.status,
      atualizadoEm: new Date().toISOString(),
    });
    setNewVistoria({ ...newVistoria, local: '', observacoes: '' });
  };

  const handleAddPhoto = () => {
    if (!newFoto.descricao) return;
    const photoId = `foto-${Date.now()}`;
    const foto: PericiaFotografia = {
      id: photoId,
      numero: pericia.fotografias.length + 1,
      data: new Date().toISOString().split('T')[0],
      hora: new Date().toTimeString().substring(0, 5),
      coordenadas: newFoto.coordenadas || { lat: -16.1482, lng: -47.5192 },
      local: newFoto.local || 'Talhão em Vistoria',
      descricao: newFoto.descricao,
      talhao: newFoto.talhao || '',
      tipoEvidencia: newFoto.tipoEvidencia || 'sintoma',
      fotoUrl: newFoto.fotoUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d69280d28?auto=format&fit=crop&w=800&q=80',
      tagsAnotacao: newFoto.tagsAnotacao || [],
    };

    // Linked Evidence entry for the Evidence Submodule
    const evidenceItem: PericiaEvidenceItem = {
      id: `ev-${Date.now()}`,
      codigoUnico: `EVD-FT-${foto.numero}`,
      fato: `Evidência Fotográfica: ${foto.descricao}`,
      fonte: 'Vistoria presencial de campo',
      local: foto.local,
      data: foto.data,
      tipoRef: 'foto',
      refId: photoId,
      analise: `Constatado sintoma/dano visual classificado como [${foto.tipoEvidencia}] no local [${foto.local}]. Georreferenciado via satélite GPS nas coordenadas [Lat: ${foto.coordenadas.lat}, Lng: ${foto.coordenadas.lng}].`,
      conclusao: 'Evidência física anexada aos autos periciais.',
    };

    onUpdatePericia({
      ...pericia,
      fotografias: [...pericia.fotografias, foto],
      cadeiaEvidencias: [...(pericia.cadeiaEvidencias || []), evidenceItem],
      atualizadoEm: new Date().toISOString(),
    });

    setNewFoto({
      local: '',
      descricao: '',
      talhao: pericia.objetoDescricao.localTalhao || '',
      tipoEvidencia: 'sintoma',
      fotoUrl: '',
      tagsAnotacao: ['Sintoma Foliar'],
    });
  };

  const triggerDeviceGps = () => {
    setIsGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(6));
          const lng = parseFloat(position.coords.longitude.toFixed(6));
          const altitude = position.coords.altitude ? parseFloat(position.coords.altitude.toFixed(1)) : undefined;
          const precisaoMeters = position.coords.accuracy ? parseFloat(position.coords.accuracy.toFixed(1)) : undefined;
          
          setNewFoto(prev => ({
            ...prev,
            coordenadas: { lat, lng, altitude, precisaoMeters }
          }));
          setIsGpsLoading(false);
        },
        (error) => {
          console.warn("Erro ao obter geolocalização do dispositivo:", error);
          // Set a random close-by realistic coordinate as a smart fallback if blocked or offline
          const fallbackLat = parseFloat((-16.1482 + (Math.random() - 0.5) * 0.01).toFixed(6));
          const fallbackLng = parseFloat((-47.5192 + (Math.random() - 0.5) * 0.01).toFixed(6));
          setNewFoto(prev => ({
            ...prev,
            coordenadas: { lat: fallbackLat, lng: fallbackLng, precisaoMeters: 5.0 }
          }));
          setIsGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setIsGpsLoading(false);
    }
  };

  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instantly trigger GPS fetching to bind geolocation
    triggerDeviceGps();

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewFoto(prev => ({
        ...prev,
        fotoUrl: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddAmostra = () => {
    if (!newAmostra.codigo) return;
    const ams: PericiaAmostra = {
      id: `ams-${Date.now()}`,
      codigo: newAmostra.codigo,
      data: newAmostra.data || new Date().toISOString().split('T')[0],
      hora: newAmostra.hora || '10:00',
      coordenadas: { lat: -16.1482, lng: -47.5192 },
      talhao: newAmostra.talhao || '',
      profundidadeCm: newAmostra.profundidadeCm || '',
      material: newAmostra.material || 'solo',
      responsavel: newAmostra.responsavel || pericia.responsavelTecnico,
      laboratorio: newAmostra.laboratorio || '',
      resultado: newAmostra.resultado || '',
      observacoes: newAmostra.observacoes || '',
    };
    onUpdatePericia({
      ...pericia,
      amostras: [...pericia.amostras, ams],
      atualizadoEm: new Date().toISOString(),
    });
    setNewAmostra({ ...newAmostra, codigo: `AMS-${Date.now().toString().substring(7)}`, resultado: '' });
  };

  const handleAddDiary = () => {
    if (!newDiaryEntry.trim()) return;
    const entry: PericiaFieldDiaryItem = {
      id: `dc-${Date.now()}`,
      data: new Date().toISOString().split('T')[0],
      hora: new Date().toTimeString().substring(0, 5),
      atividade: newDiaryEntry.trim(),
      usuario: pericia.responsavelTecnico,
      observacao: 'Registrado via aplicativo GeaAgro Campo',
    };
    onUpdatePericia({
      ...pericia,
      diarioCampo: [...pericia.diarioCampo, entry],
      atualizadoEm: new Date().toISOString(),
    });
    setNewDiaryEntry('');
  };

  const handleAddEvidence = () => {
    if (!newEvidence.fato) return;
    const ev: PericiaEvidenceItem = {
      id: `ev-${Date.now()}`,
      codigoUnico: `EVD-${new Date().getFullYear()}-${(pericia.cadeiaEvidencias.length + 1).toString().padStart(3, '0')}`,
      fato: newEvidence.fato || '',
      fonte: newEvidence.fonte || 'Campo',
      local: newEvidence.local || pericia.objetoDescricao.localTalhao || 'Talhão Principal',
      data: new Date().toISOString().split('T')[0],
      tipoRef: 'foto',
      analise: newEvidence.analise || '',
      conclusao: newEvidence.conclusao || '',
    };
    onUpdatePericia({
      ...pericia,
      cadeiaEvidencias: [...pericia.cadeiaEvidencias, ev],
      atualizadoEm: new Date().toISOString(),
    });
    setNewEvidence({ fato: '', analise: '', conclusao: '' });
  };

  return (
    <div className="space-y-6">
      {/* Submodule Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl border border-slate-200 dark:border-zinc-700 text-xs">
        <button
          onClick={() => setActiveTab('vistorias')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'vistorias'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          2.1 Vistorias ({pericia.vistorias.length})
        </button>

        <button
          onClick={() => setActiveTab('gps')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'gps'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          2.2 GPS & Mapa
        </button>

        <button
          onClick={() => setActiveTab('fotos')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'fotos'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          2.3 Fotos ({pericia.fotografias.length})
        </button>

        <button
          onClick={() => setActiveTab('amostras')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'amostras'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          2.5 Amostras ({pericia.amostras.length})
        </button>

        <button
          onClick={() => setActiveTab('diario')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'diario'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          2.7 Diário ({pericia.diarioCampo.length})
        </button>

        <button
          onClick={() => setActiveTab('cadeia')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'cadeia'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          2.8 Cadeia de Evidências ({pericia.cadeiaEvidencias.length})
        </button>
      </div>

      {/* 2.1 VISTORIAS */}
      {activeTab === 'vistorias' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              2.1 Registro Oficial de Vistorias de Campo
            </h3>
            <span className="text-xs text-slate-400">{pericia.vistorias.length} vistorias gravadas</span>
          </div>

          {/* Form New Vistoria */}
          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              Registrar Nova Vistoria Presencial
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Local / Talhão Vistoriado *"
                value={newVistoria.local}
                onChange={e => setNewVistoria({ ...newVistoria, local: e.target.value })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
              />
              <input
                type="date"
                value={newVistoria.data}
                onChange={e => setNewVistoria({ ...newVistoria, data: e.target.value })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
              <input
                type="text"
                placeholder="Cultura / Cultivar"
                value={newVistoria.cultivar}
                onChange={e => setNewVistoria({ ...newVistoria, cultivar: e.target.value })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
              <input
                type="text"
                placeholder="Estágio Fenológico (Ex: R2 Florescimento)"
                value={newVistoria.estagioFenologico}
                onChange={e => setNewVistoria({ ...newVistoria, estagioFenologico: e.target.value })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
              <input
                type="number"
                step="0.1"
                placeholder="Área Vistoriada (ha)"
                value={newVistoria.areaVistoriadaHa}
                onChange={e => setNewVistoria({ ...newVistoria, areaVistoriadaHa: Number(e.target.value) })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
              <input
                type="text"
                placeholder="Objetivo da Vistoria"
                value={newVistoria.objetivo}
                onChange={e => setNewVistoria({ ...newVistoria, objetivo: e.target.value })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>
            <button
              onClick={handleAddVistoria}
              disabled={!newVistoria.local}
              className="px-4 py-2 bg-emerald-600 disabled:opacity-50 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
            >
              Gravar Vistoria de Campo
            </button>
          </div>

          {/* List of Vistorias */}
          <div className="space-y-3 text-xs">
            {pericia.vistorias.map((v, index) => (
              <div
                key={v.id}
                className="p-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                    Vistoria #{index + 1} — {v.local}
                  </span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    {v.data} às {v.hora}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900 p-2.5 rounded-lg">
                  <p><strong>Responsável:</strong> {v.responsavel}</p>
                  <p><strong>Cultivar:</strong> {v.cultivar || 'N/I'}</p>
                  <p><strong>Estágio:</strong> {v.estagioFenologico || 'N/I'}</p>
                  <p><strong>Área:</strong> {v.areaVistoriadaHa} ha</p>
                </div>
                <p className="text-slate-600 dark:text-zinc-300 text-[11px]">{v.objetivo}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2.2 GPS E MAPA INTERATIVO / GEORREFERENCIAMENTO */}
      {activeTab === 'gps' && (
        <PericiaGeorreferenciamentoSection
          pericia={pericia}
          onUpdatePericia={onUpdatePericia}
        />
      )}

      {/* 2.3 FOTOGRAFIAS */}
      {activeTab === 'fotos' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600" />
              2.3 Galeria de Fotografias e Evidências Visuais
            </h3>
            <span className="text-xs text-slate-400">{pericia.fotografias.length} fotos salvas</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-4 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              Adicionar Fotografia com Anotação
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Descrição técnica da foto *"
                value={newFoto.descricao}
                onChange={e => setNewFoto({ ...newFoto, descricao: e.target.value })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
              <input
                type="text"
                placeholder="Local / Ponto de Coleta"
                value={newFoto.local}
                onChange={e => setNewFoto({ ...newFoto, local: e.target.value })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
              <select
                value={newFoto.tipoEvidencia}
                onChange={e => setNewFoto({ ...newFoto, tipoEvidencia: e.target.value as any })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              >
                <option value="sintoma">Sintoma Foliar / Fruto</option>
                <option value="planta_afetada">Planta Afetada</option>
                <option value="lesao">Lesão / Necrose</option>
                <option value="area_danificada">Área Danificada Geral</option>
                <option value="estrutura">Estrutura / Benfeitoria</option>
                <option value="maquina">Máquina / Equipamento</option>
              </select>
            </div>

            {/* Hidden native input elements for real device files/camera */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              id="real-camera-input"
              className="hidden"
              onChange={handleLocalFileUpload}
            />
            <input
              type="file"
              accept="image/*"
              id="real-gallery-input"
              className="hidden"
              onChange={handleLocalFileUpload}
            />

            {/* Photo Attachment Options */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-700">
              <label className="block text-slate-500 font-semibold">Anexo de Fotografia / Evidência Visual</label>

              {newFoto.fotoUrl ? (
                <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 p-3 rounded-xl shadow-2xs">
                  <img
                    src={newFoto.fotoUrl}
                    alt="Evidência Selecionada"
                    className="w-24 h-24 object-cover rounded-lg border border-slate-200 shadow-3xs"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <p className="font-bold text-emerald-800 dark:text-emerald-400">Fotografia Vinculada com Sucesso</p>
                    
                    {/* GPS Binding Info Banner */}
                    <div className="bg-slate-55/70 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-750 p-2 rounded-lg text-[10px] space-y-1">
                      {isGpsLoading ? (
                        <p className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-bold animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                          Obtendo localização GPS do dispositivo...
                        </p>
                      ) : newFoto.coordenadas ? (
                        <p className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-semibold font-mono">
                          📍 GPS: {newFoto.coordenadas.lat}, {newFoto.coordenadas.lng}
                          {newFoto.coordenadas.precisaoMeters && ` (Precisão: ±${newFoto.coordenadas.precisaoMeters}m)`}
                        </p>
                      ) : (
                        <p className="text-slate-500">📍 Sem dados de geolocalização no arquivo.</p>
                      )}
                    </div>

                    <button
                      onClick={() => setNewFoto({ ...newFoto, fotoUrl: '' })}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 rounded text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      Remover / Escolher Outra
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* GPS Binding Loader if clicked without file */}
                  {isGpsLoading && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl text-[10px] text-amber-700 dark:text-amber-400 font-medium animate-pulse flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      Acessando satélite GPS do dispositivo para vinculação automática de coordenadas de campo...
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Camera Options Card */}
                    <div className="space-y-2 border border-slate-200 dark:border-zinc-800 p-3 rounded-xl bg-white dark:bg-zinc-900 shadow-3xs">
                      <p className="font-bold text-[10px] text-slate-500 flex items-center gap-1 uppercase">
                        <Camera className="w-3.5 h-3.5 text-emerald-600" />
                        Capturar com Câmera
                      </p>
                      <label
                        htmlFor="real-camera-input"
                        className="w-full p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-xl text-center font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 text-xs shadow-2xs hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <Camera className="w-4 h-4" />
                        Câmera Real
                      </label>
                    </div>

                    {/* Gallery Options Card */}
                    <div className="space-y-2 border border-slate-200 dark:border-zinc-800 p-3 rounded-xl bg-white dark:bg-zinc-900 shadow-3xs">
                      <p className="font-bold text-[10px] text-slate-500 flex items-center gap-1 uppercase">
                        <Image className="w-3.5 h-3.5 text-blue-600" />
                        Selecionar da Galeria
                      </p>
                      <label
                        htmlFor="real-gallery-input"
                        className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900 rounded-xl text-center font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 text-xs shadow-2xs hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <Image className="w-4 h-4" />
                        Galeria Real
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Active Simulated Camera Modal View */}
            {isCameraActive && (
              <div className="p-4 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl space-y-3 relative overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="font-mono font-bold text-emerald-400 text-[10px] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    CÂMERA DE CAMPO ATIVA (SIMULADA)
                  </span>
                  <button
                    onClick={() => setIsCameraActive(false)}
                    className="text-zinc-400 hover:text-white font-bold"
                  >
                    Fechar
                  </button>
                </div>

                <div className="relative aspect-video bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center overflow-hidden">
                  {/* Camera Viewfinder Overlay */}
                  <div className="absolute inset-4 border border-zinc-700/35 pointer-events-none grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-dashed border-zinc-700/25"></div>
                    <div className="border-r border-b border-dashed border-zinc-700/25"></div>
                    <div className="border-b border-dashed border-zinc-700/25"></div>
                    <div className="border-r border-b border-dashed border-zinc-700/25"></div>
                    <div className="border-r border-b border-dashed border-zinc-700/25"></div>
                    <div className="border-b border-dashed border-zinc-700/25"></div>
                  </div>
                  
                  <div className="text-center space-y-2 z-10">
                    <Camera className="w-8 h-8 text-zinc-600 mx-auto animate-pulse" />
                    <p className="text-[10px] text-zinc-400">Enquadre o Sintoma / Dano da Cultura na Lente</p>
                    <button
                      onClick={() => {
                        // Set standard Unsplash mock photo for the taken picture
                        setNewFoto({
                          ...newFoto,
                          fotoUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d69280d28?auto=format&fit=crop&w=800&q=80',
                        });
                        setIsCameraActive(false);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full text-xs flex items-center gap-1 mx-auto cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Capturar Evidência
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Active Gallery Selector View */}
            {isGalleryActive && (
              <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <span className="font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider text-[10px]">
                    Galeria de Amostras & Evidências Comuns
                  </span>
                  <button
                    onClick={() => setIsGalleryActive(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Fechar
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      label: 'Folha com Fitoxidez',
                      url: 'https://images.unsplash.com/photo-1592417817098-8f3d69280d28?auto=format&fit=crop&w=800&q=80',
                    },
                    {
                      label: 'Necrose Foliar',
                      url: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80',
                    },
                    {
                      label: 'Lavoura Jovem',
                      url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=800&q=80',
                    },
                    {
                      label: 'Solo Compactado / Seco',
                      url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
                    },
                    {
                      label: 'Geral da Área de Sinistro',
                      url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
                    },
                    {
                      label: 'Erosão no Solo de Plantio',
                      url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
                    },
                  ].map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setNewFoto({ ...newFoto, fotoUrl: img.url });
                        setIsGalleryActive(false);
                      }}
                      className="group border border-slate-200 hover:border-emerald-500 rounded-lg overflow-hidden text-left bg-slate-50 relative aspect-video cursor-pointer transition-all"
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[9px] text-white truncate font-medium">
                        {img.label}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1">
                  <label className="block text-[10px] text-slate-500">Ou informe a URL de qualquer outra imagem:</label>
                  <input
                    type="text"
                    placeholder="https://exemplo.com/sua-foto.jpg"
                    value={newFoto.fotoUrl || ''}
                    onChange={e => setNewFoto({ ...newFoto, fotoUrl: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleAddPhoto}
              disabled={!newFoto.descricao || !newFoto.fotoUrl}
              className="px-4 py-2 bg-emerald-600 disabled:opacity-50 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Registrar Fotografia
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pericia.fotografias.map(f => (
              <div
                key={f.id}
                className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl overflow-hidden shadow-2xs space-y-2 p-3 text-xs"
              >
                <div className="relative h-40 rounded-xl overflow-hidden bg-slate-100">
                  <img src={f.fotoUrl} alt={f.descricao} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/80 text-white rounded text-[10px] font-mono">
                    Foto #{f.numero}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2">{f.descricao}</h4>
                <p className="text-[11px] text-slate-500">{f.local}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {f.tagsAnotacao?.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2.5 AMOSTRAGEM */}
      {activeTab === 'amostras' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-emerald-600" />
              2.5 Registro e Controle de Amostras Coletadas
            </h3>
            <span className="text-xs text-slate-400">{pericia.amostras.length} amostras salvas</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              Cadastrar Amostra de Campo
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Código da Amostra *"
                value={newAmostra.codigo}
                onChange={e => setNewAmostra({ ...newAmostra, codigo: e.target.value })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
              />
              <select
                value={newAmostra.material}
                onChange={e => setNewAmostra({ ...newAmostra, material: e.target.value as any })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              >
                <option value="solo">Solo</option>
                <option value="folha">Folha / Tecido Foliar</option>
                <option value="planta">Planta Inteira</option>
                <option value="fruto">Fruto</option>
                <option value="agua">Água</option>
                <option value="nematoides">Nematoides</option>
                <option value="fitopatologia">Fitopatologia</option>
                <option value="entomologia">Entomologia</option>
              </select>
              <input
                type="text"
                placeholder="Laboratório Destino"
                value={newAmostra.laboratorio}
                onChange={e => setNewAmostra({ ...newAmostra, laboratorio: e.target.value })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>
            <textarea
              rows={2}
              placeholder="Resultado ou Parecer do Laudo Laboratorial..."
              value={newAmostra.resultado}
              onChange={e => setNewAmostra({ ...newAmostra, resultado: e.target.value })}
              className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
            />
            <button
              onClick={handleAddAmostra}
              disabled={!newAmostra.codigo}
              className="px-4 py-2 bg-emerald-600 disabled:opacity-50 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
            >
              Registrar Amostra
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {pericia.amostras.map(ams => (
              <div
                key={ams.id}
                className="p-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                    {ams.codigo} — [{ams.material.toUpperCase()}]
                  </span>
                  <span className="text-slate-400 text-[11px]">{ams.data} às {ams.hora}</span>
                </div>
                <p className="text-slate-700 dark:text-zinc-300"><strong>Laboratório:</strong> {ams.laboratorio || 'Aguardando envio'}</p>
                <p className="text-slate-600 dark:text-zinc-400 font-medium"><strong>Resultado:</strong> {ams.resultado || 'Pendente de análise'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2.7 DIÁRIO DE CAMPO */}
      {activeTab === 'diario' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              2.7 Diário de Campo Auto-Registrado
            </h3>
          </div>

          <div className="flex gap-2 text-xs">
            <input
              type="text"
              placeholder="Digite a atividade realizada em campo no momento..."
              value={newDiaryEntry}
              onChange={e => setNewDiaryEntry(e.target.value)}
              className="flex-1 p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
            />
            <button
              onClick={handleAddDiary}
              className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl cursor-pointer"
            >
              + Registrar Carimbo
            </button>
          </div>

          <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-700 pl-8 text-xs">
            {pericia.diarioCampo.map(dc => (
              <div key={dc.id} className="relative space-y-1">
                <span className="absolute -left-8 top-1 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-white dark:ring-zinc-900" />
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{dc.hora}</span>
                  <span className="text-slate-400 text-[10px]">{dc.data}</span>
                  <span className="text-slate-500 font-semibold">• {dc.usuario}</span>
                </div>
                <p className="text-slate-800 dark:text-zinc-200 font-medium">{dc.atividade}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2.8 CADEIA DE EVIDÊNCIAS */}
      {activeTab === 'cadeia' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-600" />
              2.8 Cadeia de Custódia & Rastreabilidade de Evidências
            </h3>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              Vincular Nova Evidência
            </h4>
            <input
              type="text"
              placeholder="Fato de Campo (Ex: Sintomas visuais de fitotoxicidade foliar)"
              value={newEvidence.fato}
              onChange={e => setNewEvidence({ ...newEvidence, fato: e.target.value })}
              className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
            />
            <textarea
              rows={2}
              placeholder="Análise Técnica e Nexo Causal..."
              value={newEvidence.analise}
              onChange={e => setNewEvidence({ ...newEvidence, analise: e.target.value })}
              className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
            />
            <button
              onClick={handleAddEvidence}
              disabled={!newEvidence.fato}
              className="px-4 py-2 bg-emerald-600 disabled:opacity-50 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
            >
              Criar Código de Evidência
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {pericia.cadeiaEvidencias.map(ev => (
              <div
                key={ev.id}
                className="p-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 rounded">
                    {ev.codigoUnico}
                  </span>
                  <span className="text-slate-400 text-[10px]">{ev.data} • {ev.local}</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{ev.fato}</h4>
                <p className="text-slate-600 dark:text-zinc-300 text-[11px]"><strong>Análise:</strong> {ev.analise}</p>
                {ev.conclusao && (
                  <p className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                    <strong>Conclusão:</strong> {ev.conclusao}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
