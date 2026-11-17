import React, { useEffect, useRef, useState } from 'react';
import { AreaDegradadaItem, PropriedadeRecupera, PontoInteresseGps } from '../../types/recupera';
import { useTimedValue } from './useTimedFlag';
import {
  MapPin,
  Navigation,
  Plus,
  Trash2,
  Compass,
  CheckCircle2
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  areaAtiva?: AreaDegradadaItem;
  propriedade?: PropriedadeRecupera;
  areasDisponiveis?: AreaDegradadaItem[];
  onSelecionarArea?: (id: string) => void;
  pontosGps: PontoInteresseGps[];
  onSalvarPontosGps: (pontos: PontoInteresseGps[]) => void;
}

export const RecuperaMapasView: React.FC<Props> = ({
  areaAtiva,
  propriedade,
  areasDisponiveis = [],
  onSelecionarArea,
  pontosGps,
  onSalvarPontosGps
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [novoPontoTitulo, setNovoPontoTitulo] = useState('');
  const [novoPontoTipo, setNovoPontoTipo] = useState<PontoInteresseGps['tipo']>('erosao');
  const [novoPontoLat, setNovoPontoLat] = useState<string>(
    areaAtiva?.coordenadasCentroid?.latitude ? String(areaAtiva.coordenadasCentroid.latitude) : ''
  );
  const [novoPontoLng, setNovoPontoLng] = useState<string>(
    areaAtiva?.coordenadasCentroid?.longitude ? String(areaAtiva.coordenadasCentroid.longitude) : ''
  );
  const [gpsBuscando, setGpsBuscando] = useState(false);
  const [statusMsg, mostrarStatus] = useTimedValue<string>(4000);

  // Atualiza campos somente se o usuário selecionar explicitamente um talhão com coordenadas válidas
  useEffect(() => {
    if (areaAtiva?.coordenadasCentroid?.latitude && areaAtiva?.coordenadasCentroid?.longitude) {
      setNovoPontoLat(String(areaAtiva.coordenadasCentroid.latitude));
      setNovoPontoLng(String(areaAtiva.coordenadasCentroid.longitude));
    } else if (!areaAtiva) {
      setNovoPontoLat('');
      setNovoPontoLng('');
    }
  }, [areaAtiva?.id]);

  // Inicialização do Leaflet Map (sem coordenadas hardcoded de propriedade)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const hasAreaCoords = Boolean(areaAtiva?.coordenadasCentroid?.latitude && areaAtiva?.coordenadasCentroid?.longitude);
      const hasSedeCoords = Boolean(propriedade?.coordenadasSede?.latitude && propriedade?.coordenadasSede?.longitude);

      const initialLat = hasAreaCoords
        ? areaAtiva!.coordenadasCentroid.latitude
        : hasSedeCoords
          ? propriedade!.coordenadasSede.latitude
          : -15.7801;
      const initialLng = hasAreaCoords
        ? areaAtiva!.coordenadasCentroid.longitude
        : hasSedeCoords
          ? propriedade!.coordenadasSede.longitude
          : -47.9292;
      const initialZoom = hasAreaCoords || hasSedeCoords ? 14 : 4;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: initialZoom,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | GeaAgro Recupera',
        maxZoom: 19
      }).addTo(map);

      map.on('click', (ev: L.LeafletMouseEvent) => {
        const lat = Number(ev.latlng.lat.toFixed(6));
        const lng = Number(ev.latlng.lng.toFixed(6));
        setNovoPontoLat(String(lat));
        setNovoPontoLng(String(lng));
        mostrarStatus(`Coordenadas capturadas no mapa: Lat ${lat}, Lng ${lng}`, 4000);
      });

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      layerGroupRef.current = null;
    };
  }, []);

  // Atualização de Marcadores e Polígonos
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    const bounds: [number, number][] = [];

    // 1. Marcador da Sede da Fazenda (apenas se cadastrada com nome e coordenadas reais)
    if (propriedade?.nome && propriedade.coordenadasSede?.latitude && propriedade.coordenadasSede?.longitude) {
      const sedeIcon = L.divIcon({
        className: 'custom-pin-sede',
        html: `<div style="background-color: #0f172a; color: white; padding: 4px 8px; border-radius: 8px; font-weight: bold; font-size: 10px; border: 2px solid #10b981; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 4px;">🏢 Sede: ${propriedade.nome}</div>`,
        iconSize: [120, 30],
        iconAnchor: [60, 15]
      });

      L.marker([propriedade.coordenadasSede.latitude, propriedade.coordenadasSede.longitude], { icon: sedeIcon })
        .addTo(layerGroup)
        .bindPopup(`<b>Sede da Propriedade</b><br/>${propriedade.nome}`);

      bounds.push([propriedade.coordenadasSede.latitude, propriedade.coordenadasSede.longitude]);
    }

    // 2. Marcador do Centróide do Talhão Degradado Ativo (somente se selecionado)
    if (areaAtiva?.coordenadasCentroid?.latitude && areaAtiva?.coordenadasCentroid?.longitude) {
      const areaIcon = L.divIcon({
        className: 'custom-pin-area',
        html: `<div style="background-color: #e11d48; color: white; padding: 4px 8px; border-radius: 8px; font-weight: bold; font-size: 10px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">📍 ${areaAtiva.nomeTalhao} (${areaAtiva.areaHa} ha)</div>`,
        iconSize: [140, 30],
        iconAnchor: [70, 15]
      });

      L.marker([areaAtiva.coordenadasCentroid.latitude, areaAtiva.coordenadasCentroid.longitude], { icon: areaIcon })
        .addTo(layerGroup)
        .bindPopup(`<b>Área Alvo de Recuperação</b><br/>${areaAtiva.nomeTalhao}<br/>Degradação: ${areaAtiva.tipoDegradacao}<br/>Severidade: ${areaAtiva.grauSeveridade}`);

      bounds.push([areaAtiva.coordenadasCentroid.latitude, areaAtiva.coordenadasCentroid.longitude]);
    }

    // 3. Polígono da Área Degradada (se houver vértices no talhão selecionado)
    if (areaAtiva?.verticesPoligono && areaAtiva.verticesPoligono.length >= 3) {
      const coords = areaAtiva.verticesPoligono.map(v => [v.latitude, v.longitude] as [number, number]);
      L.polygon(coords, {
        color: '#e11d48',
        fillColor: '#f43f5e',
        fillOpacity: 0.25,
        weight: 2,
        dashArray: '4, 4'
      }).addTo(layerGroup).bindPopup(`<b>Polígono Delimitado: ${areaAtiva.nomeTalhao}</b><br/>Área: ${areaAtiva.areaHa} ha`);

      coords.forEach(c => bounds.push(c));
    }

    // 4. Marcadores de Pontos de Interesse (Erosão, Voçoroca, Amostras)
    pontosGps.forEach(p => {
      const cor = p.tipo === 'vocoroca' ? '#b91c1c' : p.tipo === 'erosao' ? '#ea580c' : p.tipo === 'nascente' ? '#0284c7' : '#059669';
      const iconePonto = L.circleMarker([p.latitude, p.longitude], {
        radius: 7,
        fillColor: cor,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(layerGroup);

      iconePonto.bindPopup(`<b>${p.titulo}</b><br/>Tipo: ${p.tipo.toUpperCase()}<br/>Data: ${p.dataRegistro}`);
      bounds.push([p.latitude, p.longitude]);
    });

    if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 16 });
    } else {
      mapInstanceRef.current.setView([-15.7801, -47.9292], 4);
    }
  }, [areaAtiva, propriedade, pontosGps]);

  const handleCapturarGpsDispositivo = () => {
    if ('geolocation' in navigator) {
      setGpsBuscando(true);
      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          setNovoPontoLat(String(lat));
          setNovoPontoLng(String(lng));
          setGpsBuscando(false);
          mostrarStatus(`GPS Atual Obtido: Lat ${lat}, Lng ${lng} (Precisão: ${pos.coords.accuracy?.toFixed(0) || 5}m)`, 5000);

          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], 16);
          }
        },
        err => {
          setGpsBuscando(false);
          mostrarStatus(`Erro ao obter GPS: ${err.message}`, 5000);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      mostrarStatus('Geolocalização não disponível no navegador.', 4000);
    }
  };

  const handleAdicionarPonto = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(novoPontoLat);
    const lng = parseFloat(novoPontoLng);
    if (!novoPontoTitulo.trim() || Number.isNaN(lat) || Number.isNaN(lng)) {
      mostrarStatus('Informe o título e coordenadas válidas (ou clique no mapa / use Capturar GPS).', 4000);
      return;
    }

    const novo: PontoInteresseGps = {
      id: `poi-${Date.now()}`,
      tipo: novoPontoTipo,
      titulo: novoPontoTitulo.trim(),
      latitude: lat,
      longitude: lng,
      dataRegistro: new Date().toISOString().split('T')[0]
    };

    onSalvarPontosGps([...pontosGps, novo]);
    setNovoPontoTitulo('');
    mostrarStatus('Ponto de interesse inserido no mapa!', 3000);
  };

  const handleRemoverPonto = (id: string) => {
    onSalvarPontosGps(pontosGps.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Fase 5 • Cartografia, GPS & Georreferenciamento
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-600" />
            <span>
              {areaAtiva ? `Mapa Técnico de Recuperação: ${areaAtiva.nomeTalhao}` : 'Mapa Técnico de Recuperação & Georreferenciamento'}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            OpenStreetMap interativo: clique no mapa para capturar coordenadas ou vincule um talhão cadastrado
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {onSelecionarArea && (
            <select
              value={areaAtiva?.id || ''}
              onChange={e => onSelecionarArea(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white max-w-[220px]"
              title="Selecionar talhão no mapa"
            >
              <option value="">Nenhum talhão selecionado</option>
              {areasDisponiveis.map(a => (
                <option key={a.id} value={a.id}>
                  {a.nomeTalhao} ({a.areaHa} ha)
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={handleCapturarGpsDispositivo}
            disabled={gpsBuscando}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-2 disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 ${gpsBuscando ? 'animate-spin' : ''}`} />
            <span>{gpsBuscando ? 'Obtendo GPS...' : 'Capturar Minha Posição'}</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Grid: Mapa Leaflet (Esquerda) e Painel de POIs e Coordenadas (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Container do Mapa (8 colunas) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs relative">
          <div ref={mapContainerRef} className="w-full h-[480px] z-0" />
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Dica: clique em qualquer ponto do mapa para preencher latitude e longitude automaticamente.</span>
            <span className="font-bold text-emerald-600">OpenStreetMap Oficial</span>
          </div>
        </div>

        {/* Painel de Pontos de Interesse & Coordenadas (4 colunas) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Adicionar Ponto GPS */}
          <form onSubmit={handleAdicionarPonto} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Marcar Ponto de Campo</span>
            </h3>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Título do Ponto</label>
              <input
                type="text"
                value={novoPontoTitulo}
                onChange={e => setNovoPontoTitulo(e.target.value)}
                placeholder="Ex: Cabeceira de voçoroca 01"
                required
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Tipo de Feição</label>
              <select
                value={novoPontoTipo}
                onChange={e => setNovoPontoTipo(e.target.value as PontoInteresseGps['tipo'])}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                <option value="erosao">Sulco de Erosão</option>
                <option value="vocoroca">Voçoroca / Ravina</option>
                <option value="amostra_solo">Ponto de Amostragem de Solo</option>
                <option value="nascente">Nascente / Olho d'Água</option>
                <option value="monitoramento">Marco de Monitoramento</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={novoPontoLat}
                  onChange={e => setNovoPontoLat(e.target.value)}
                  placeholder="Ex: -20.4715"
                  required
                  className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={novoPontoLng}
                  onChange={e => setNovoPontoLng(e.target.value)}
                  placeholder="Ex: -54.6225"
                  required
                  className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-[11px]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Inserir Marcador no Mapa</span>
            </button>
          </form>

          {/* Lista de Pontos Cadastrados */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Pontos Registrados no Mapa ({pontosGps.length})
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-thin">
              {pontosGps.length === 0 ? (
                <p className="text-slate-400 text-center py-4 text-[11px]">Nenhum ponto registrado.</p>
              ) : (
                pontosGps.map(p => (
                  <div key={p.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{p.titulo}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{p.tipo} • Lat {p.latitude.toFixed(4)}°, Lng {p.longitude.toFixed(4)}°</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoverPonto(p.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
