import React, { useEffect, useRef, useState } from 'react';
import {
  PropriedadeRuralAvaliacao,
  PontoInteresseVistoria,
  ImovelComparativoMercado
} from '../../types/avaliacaoImoveis';
import {
  MapPin,
  Search,
  Navigation,
  Layers,
  Maximize2,
  CheckCircle2,
  Info
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  propriedade: PropriedadeRuralAvaliacao;
  pontosVistoria: PontoInteresseVistoria[];
  comparativos: ImovelComparativoMercado[];
  onAtualizarCoordenadas?: (lat: number, lng: number) => void;
}

const DEFAULT_BR_CENTER: [number, number] = [-14.235, -51.925];
const DEFAULT_BR_ZOOM = 4;

const hasValidCoords = (lat?: number, lng?: number): boolean => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    (Math.abs(lat) > 0.0001 || Math.abs(lng) > 0.0001)
  );
};

const formatCidadeInicial = (municipio?: string, estado?: string): string => {
  const m = (municipio || '').trim();
  const e = (estado || '').trim();
  if (m && e) return `${m}, ${e}`;
  return m || e || '';
};

export const AvaliacaoMapaInteligenteView: React.FC<Props> = ({
  propriedade,
  pontosVistoria,
  comparativos,
  onAtualizarCoordenadas
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  const [buscaCidade, setBuscaCidade] = useState(() =>
    formatCidadeInicial(propriedade.municipio, propriedade.estado)
  );
  const [buscando, setBuscando] = useState(false);
  const [gpsAtivo, setGpsAtivo] = useState(false);
  const [camadaAtiva, setCamadaAtiva] = useState<
    'todos' | 'propriedade' | 'talhoes' | 'comparativos'
  >('todos');
  const [statusMsg, setStatusMsg] = useState<string>('');
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchAbortRef = useRef<AbortController | null>(null);

  const showTempStatus = (msg: string, ms = 4000) => {
    setStatusMsg(msg);
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    statusTimerRef.current = setTimeout(() => setStatusMsg(''), ms);
  };

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      if (fetchAbortRef.current) fetchAbortRef.current.abort();
    };
  }, []);

  const propTemCoords = hasValidCoords(
    propriedade.coordenadasGps?.latitude,
    propriedade.coordenadasGps?.longitude
  );

  const glebasValidas = (propriedade.territorial?.glebas || []).filter(
    (g) => g.nome.trim() !== '' || g.areaHa > 0
  );

  const pontosValidos = pontosVistoria.filter((pt) =>
    hasValidCoords(pt.coordenadas?.latitude, pt.coordenadas?.longitude)
  );

  const comparativosValidos = comparativos.filter((comp) =>
    hasValidCoords(comp.coordenadas?.latitude, comp.coordenadas?.longitude)
  );

  useEffect(() => {
    setBuscaCidade(formatCidadeInicial(propriedade.municipio, propriedade.estado));
  }, [propriedade.id, propriedade.municipio, propriedade.estado]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = propTemCoords
        ? [propriedade.coordenadasGps.latitude, propriedade.coordenadasGps.longitude]
        : DEFAULT_BR_CENTER;
      const initialZoom = propTemCoords ? 13 : DEFAULT_BR_ZOOM;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | GeaAgro Avaliação Rural',
        maxZoom: 19
      }).addTo(map);

      layersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layersGroupRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (propTemCoords) {
      const centerLat = propriedade.coordenadasGps.latitude;
      const centerLng = propriedade.coordenadasGps.longitude;

      if (camadaAtiva === 'todos' || camadaAtiva === 'propriedade') {
        const sedeIcon = L.divIcon({
          html: `<div style="background-color:#10b981; width:28px; height:28px; border-radius:50%; border:3px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.3);"><span style="color:white; font-size:14px; font-weight:bold;">S</span></div>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const markerSede = L.marker([centerLat, centerLng], { icon: sedeIcon });
        markerSede.bindPopup(`
          <div style="font-family:sans-serif; font-size:12px; line-height:1.4;">
            <strong style="color:#0f172a; font-size:13px;">${propriedade.nome || 'Imóvel Avaliado'}</strong><br/>
            <span style="color:#10b981; font-weight:bold;">Sede da Propriedade Avaliada</span><br/>
            Área Total: ${propriedade.areaTotalHa || 0} ha<br/>
            Município: ${propriedade.municipio || '-'} ${propriedade.estado ? `- ${propriedade.estado}` : ''}<br/>
            Matrícula: ${propriedade.numeroMatricula || 'Não informada'}
          </div>
        `);
        group.addLayer(markerSede);

        if (propriedade.areaTotalHa > 0) {
          const ladoKm = Math.sqrt(propriedade.areaTotalHa * 0.01);
          const delta = Math.max(0.002, Math.min(0.05, (ladoKm / 111) * 0.5));
          const farmPolygonCoords: [number, number][] = [
            [centerLat - delta, centerLng - delta],
            [centerLat - delta, centerLng + delta],
            [centerLat + delta, centerLng + delta],
            [centerLat + delta, centerLng - delta],
            [centerLat - delta, centerLng - delta]
          ];

          const farmPolygon = L.polygon(farmPolygonCoords, {
            color: '#10b981',
            weight: 2,
            fillColor: '#10b981',
            fillOpacity: 0.15
          });
          farmPolygon.bindPopup(
            `<strong>${propriedade.nome || 'Imóvel Avaliado'}</strong><br/>Área Total Cadastrada: ${propriedade.areaTotalHa.toLocaleString('pt-BR')} ha`
          );
          group.addLayer(farmPolygon);
        }
      }

      if ((camadaAtiva === 'todos' || camadaAtiva === 'talhoes') && glebasValidas.length > 0) {
        glebasValidas.forEach((g, idx) => {
          const offsetLat = (idx % 2 === 0 ? 1 : -1) * 0.005 * (idx + 1);
          const offsetLng = (idx > 2 ? 1 : -1) * 0.006;
          const talhaoCoords: [number, number][] = [
            [centerLat + offsetLat - 0.003, centerLng + offsetLng - 0.004],
            [centerLat + offsetLat - 0.003, centerLng + offsetLng + 0.004],
            [centerLat + offsetLat + 0.003, centerLng + offsetLng + 0.004],
            [centerLat + offsetLat + 0.003, centerLng + offsetLng - 0.004]
          ];

          const talhaoPoly = L.polygon(talhaoCoords, {
            color: '#06b6d4',
            weight: 1.5,
            fillColor: '#06b6d4',
            fillOpacity: 0.25,
            dashArray: '4, 4'
          });
          talhaoPoly.bindPopup(`
            <strong>${g.nome || `Talhão ${idx + 1}`}</strong><br/>
            Área: ${g.areaHa || 0} ha<br/>
            Uso: ${g.tipoUso || '-'}<br/>
            Solo: ${g.soloPredominante || '-'}
          `);
          group.addLayer(talhaoPoly);
        });
      }
    }

    if (camadaAtiva === 'todos' || camadaAtiva === 'propriedade') {
      pontosValidos.forEach((pt) => {
        const ptIcon = L.divIcon({
          html: `<div style="background-color:#6366f1; width:20px; height:20px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 1px 4px rgba(0,0,0,0.3);"><span style="color:white; font-size:10px; font-weight:bold;">GPS</span></div>`,
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const ptMarker = L.marker([pt.coordenadas.latitude, pt.coordenadas.longitude], {
          icon: ptIcon
        });
        ptMarker.bindPopup(`
          <strong>${pt.nome}</strong><br/>
          Categoria: ${pt.categoria}<br/>
          ${pt.descricao}<br/>
          Lat: ${pt.coordenadas.latitude.toFixed(5)} | Lon: ${pt.coordenadas.longitude.toFixed(5)}
        `);
        group.addLayer(ptMarker);
      });
    }

    if (camadaAtiva === 'todos' || camadaAtiva === 'comparativos') {
      comparativosValidos.forEach((comp) => {
        const isAtivo = comp.statusInclusao === 'incluido';
        const cor = isAtivo ? '#f59e0b' : '#94a3b8';

        const compIcon = L.divIcon({
          html: `<div style="background-color:${cor}; width:22px; height:22px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 1px 4px rgba(0,0,0,0.3);"><span style="color:white; font-size:10px; font-weight:bold;">$</span></div>`,
          className: '',
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const compMarker = L.marker([comp.coordenadas.latitude, comp.coordenadas.longitude], {
          icon: compIcon
        });
        const vHomog = comp.fatores?.valorHomogeneizadoPorHaR$ || comp.precoPorHectareR$;
        compMarker.bindPopup(`
          <div style="font-family:sans-serif; font-size:12px;">
            <strong style="color:#0f172a;">${comp.codigo} - ${comp.identificacao}</strong><br/>
            Município: ${comp.municipio} - ${comp.estado}<br/>
            Área: ${comp.areaTotalHa} ha<br/>
            Preço Informado: R$ ${comp.precoPorHectareR$.toLocaleString('pt-BR')}/ha<br/>
            <strong>Preço Homogeneizado: R$ ${vHomog.toLocaleString('pt-BR')}/ha</strong><br/>
            Status: <span style="font-weight:bold; color:${isAtivo ? '#10b981' : '#ef4444'};">${comp.statusInclusao}</span>
          </div>
        `);
        group.addLayer(compMarker);
      });
    }
  }, [propriedade, pontosVistoria, comparativos, camadaAtiva, propTemCoords]);

  const handleBuscarCidade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buscaCidade.trim()) return;

    if (fetchAbortRef.current) fetchAbortRef.current.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    setBuscando(true);
    setStatusMsg('Buscando localização no OpenStreetMap...');

    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          buscaCidade + ', Brasil'
        )}&limit=1`,
        { signal: controller.signal }
      );
      const data = await resp.json();

      if (controller.signal.aborted) return;

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 12, { duration: 1.5 });
        }
        showTempStatus(`Cidade localizada: ${data[0].display_name.slice(0, 60)}...`);
        if (onAtualizarCoordenadas) {
          onAtualizarCoordenadas(lat, lon);
        }
      } else {
        showTempStatus('Cidade não encontrada. Tente incluir UF (ex: Município, UF)');
      }
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === 'AbortError') return;
      console.error(err);
      showTempStatus('Erro de conexão ao buscar no OpenStreetMap');
    } finally {
      if (!controller.signal.aborted) {
        setBuscando(false);
      }
    }
  };

  const handleUsarGpsLocal = () => {
    if (!navigator.geolocation) {
      showTempStatus('Geolocalização não suportada pelo navegador.', 4000);
      return;
    }

    setGpsAtivo(true);
    setStatusMsg('Capturando sinal de satélite GPS...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1.5 });
        }

        setGpsAtivo(false);
        if (onAtualizarCoordenadas) {
          onAtualizarCoordenadas(lat, lng);
        }
        showTempStatus(`GPS fixado: Lat ${lat.toFixed(5)}, Lon ${lng.toFixed(5)}`, 4000);
      },
      (err) => {
        console.warn('Erro ao obter GPS:', err);
        setGpsAtivo(false);
        showTempStatus('Acesso ao GPS negado ou sinal indisponível', 4000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCentralizarFazenda = () => {
    if (!propTemCoords) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(DEFAULT_BR_CENTER, DEFAULT_BR_ZOOM, { duration: 1.0 });
      }
      showTempStatus(
        'Nenhuma coordenada cadastrada para a sede. Pesquise o município, capture via GPS ou informe na aba Imóvel Rural.',
        4500
      );
      return;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [propriedade.coordenadasGps.latitude, propriedade.coordenadasGps.longitude],
        13,
        { duration: 1.2 }
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Controles e Busca */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Mapa Interativo Territorial & Mercado (OpenStreetMap)
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Georreferenciamento da propriedade, talhões, pontos de vistoria e amostras
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleBuscarCidade} className="flex items-center gap-1.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={buscaCidade}
                onChange={(e) => setBuscaCidade(e.target.value)}
                placeholder="Município / UF..."
                className="h-8 pl-8 pr-2.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 w-44 sm:w-56 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={buscando}
              className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {buscando ? 'Buscando...' : 'Localizar'}
            </button>
          </form>

          <button
            type="button"
            onClick={handleUsarGpsLocal}
            disabled={gpsAtivo}
            className="h-8 px-2.5 text-xs bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 hover:bg-sky-100/80 dark:hover:bg-sky-950/70 rounded-lg flex items-center gap-1 font-medium transition-colors"
            title="Localizar posição atual pelo GPS"
          >
            <Navigation className="w-3.5 h-3.5" />
            {gpsAtivo ? 'GPS...' : 'GPS Atual'}
          </button>

          <button
            type="button"
            onClick={handleCentralizarFazenda}
            className="h-8 px-2.5 text-xs bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 rounded-lg flex items-center gap-1 font-medium transition-colors"
            title="Centralizar na Fazenda"
          >
            <Maximize2 className="w-3.5 h-3.5" /> Sede
          </button>
        </div>
      </div>

      {!propTemCoords && glebasValidas.length === 0 && comparativosValidos.length === 0 && !statusMsg && (
        <div className="p-3 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          Nenhum talhão, sede ou amostra georreferenciada cadastrada. Pesquise o município, capture via GPS ou informe as coordenadas na aba Imóvel Rural.
        </div>
      )}

      {statusMsg && (
        <div className="p-3 text-xs rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Controles de Camadas */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-zinc-400 mr-1">
            <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Camadas:
          </span>

          {(
            [
              { id: 'todos', label: 'Todos' },
              { id: 'propriedade', label: 'Sede & Perímetro' },
              { id: 'talhoes', label: `Talhões (${glebasValidas.length})` },
              { id: 'comparativos', label: `Mercado (${comparativosValidos.length})` }
            ] as const
          ).map((camada) => (
            <button
              key={camada.id}
              type="button"
              onClick={() => setCamadaAtiva(camada.id)}
              className={`h-7 px-2.5 rounded-md text-xs font-medium transition-colors tabular-nums ${
                camadaAtiva === camada.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-zinc-700'
              }`}
            >
              {camada.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Sede
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" /> Talhões
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" /> Vistoria GPS
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> Mercado
          </span>
        </div>
      </div>

      {/* Container do Mapa Leaflet */}
      <div className="rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden relative">
        <div ref={mapContainerRef} className="w-full h-[500px] z-10" />
      </div>
    </div>
  );
};
