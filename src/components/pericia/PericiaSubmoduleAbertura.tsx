import React, { useState, useMemo, useRef } from 'react';
import {
  FileText,
  Users,
  Target,
  HelpCircle,
  FolderOpen,
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  Calendar,
  Building2,
  MapPin,
  Shield,
  FileCheck,
  AlertCircle,
  UserCheck,
  Scale,
  CloudSun,
  Landmark,
  Camera,
  Image,
  Upload,
  Eye,
  RefreshCw,
  X,
  Video,
  ImagePlus,
  Maximize2,
  Loader2,
  FileCode,
} from 'lucide-react';
import {
  Pericia,
  PericiaParteEnvolvida,
  PericiaQuesito,
  PericiaDocumentoInicial,
  TipoPericia,
  PericiaStatus,
  PericiaGeorreferenciamento,
} from '../../types/pericia';
import { TIPO_PERICIA_LABELS, STATUS_LABELS } from './PericiaDashboard';
import { Agronomist } from '../../types/agronomy';
import { PericiaSubmoduleDadosRegiao } from './PericiaSubmoduleDadosRegiao';
import { PericiaSubmoduleAvaliacaoImovel } from './PericiaSubmoduleAvaliacaoImovel';
import { PericiaKmlImporterModal } from './PericiaKmlImporterModal';

interface PericiaSubmoduleAberturaProps {
  pericia: Pericia;
  onUpdatePericia: (updated: Pericia) => void;
}

export const PericiaSubmoduleAbertura: React.FC<PericiaSubmoduleAberturaProps> = ({
  pericia,
  onUpdatePericia,
}) => {
  // Fetch registered agronomists from local storage + standard fallbacks
  const registeredAgronomists = useMemo(() => {
    let list: Agronomist[] = [];
    try {
      const saved = localStorage.getItem('agronutri_agronomists');
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {
      console.warn(e);
    }
    return Array.isArray(list) ? list : [];
  }, []);

  const [activeTab, setActiveTab] = useState<
    'identificacao' | 'dados_regiao' | 'partes' | 'objeto' | 'imovel_avaliado' | 'avaliacao_imovel' | 'quesitos' | 'documentos' | 'checklist'
  >('identificacao');

  // New Party State
  const [newParte, setNewParte] = useState<Partial<PericiaParteEnvolvida>>({
    nome: '',
    cpfCnpj: '',
    contato: '',
    endereco: '',
    papel: 'contratante',
    observacoes: '',
  });

  // New Quesito State
  const [newQuesito, setNewQuesito] = useState<{ pergunta: string; observacoes: string }>({
    pergunta: '',
    observacoes: '',
  });

  // New Document State
  const [newDoc, setNewDoc] = useState<Partial<PericiaDocumentoInicial>>({
    nome: '',
    tipo: 'contrato',
    data: new Date().toISOString().split('T')[0],
    fonte: '',
    descricao: '',
  });

  // New Checklist Item State
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // Camera & Gallery Refs and State
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [isKmlModalOpen, setIsKmlModalOpen] = useState(false);

  // Compress image to ensure crisp resolution while preventing localStorage quotas from exceeding
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (!result) return resolve('');
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const maxDim = 1600;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(result);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => resolve(result);
        img.src = result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Handler to apply imported KML/KMZ perimeter coordinates
  const handleApplyKmlImport = (data: {
    pontos: any[];
    areaHa: number;
    areaM2: number;
    perimetroM: number;
    centroide: { lat: number; lng: number };
    nomeArquivo: string;
    tipoArquivo: 'kml' | 'kmz' | 'geojson' | 'gpx';
    syncAreaTotal: boolean;
    syncAreaAfetada: boolean;
    syncCoordsCentrais: boolean;
    syncDocumentoAnexo: boolean;
  }) => {
    const updated: Pericia = {
      ...pericia,
      imovelAvaliado: {
        ...pericia.imovelAvaliado,
        imovelNome: pericia.imovelAvaliado?.imovelNome || pericia.imovelNome || '',
        matricula: pericia.imovelAvaliado?.matricula || '',
        areaTotal: data.syncAreaTotal ? data.areaHa : pericia.imovelAvaliado?.areaTotal || 0,
        areaAgricultavel: pericia.imovelAvaliado?.areaAgricultavel || 0,
        acesso: pericia.imovelAvaliado?.acesso || '',
        indicePluviometrico: pericia.imovelAvaliado?.indicePluviometrico || '',
        topografia: pericia.imovelAvaliado?.topografia || '',
        caracteristicasSolo: pericia.imovelAvaliado?.caracteristicasSolo || '',
        aptidao: pericia.imovelAvaliado?.aptidao || '',
        infraestrutura: pericia.imovelAvaliado?.infraestrutura || '',
        produtividadeCulturas: pericia.imovelAvaliado?.produtividadeCulturas || '',
        benfeitorias: pericia.imovelAvaliado?.benfeitorias || '',
      },
      objetoDescricao: {
        ...pericia.objetoDescricao,
        areaAfetadaHa: data.syncAreaAfetada ? data.areaHa : pericia.objetoDescricao.areaAfetadaHa,
      },
      georreferenciamento: {
        sistemaReferencia: pericia.georreferenciamento?.sistemaReferencia || 'SIRGAS 2000 (WGS 84)',
        pontos: data.pontos,
        areaCalculadaHa: data.areaHa,
        perimetroCalculadoMeters: data.perimetroM,
        arquivoImportadoNome: data.nomeArquivo,
        arquivoImportadoTipo: data.tipoArquivo,
        centroide: data.centroide,
      },
      documentosIniciais: data.syncDocumentoAnexo
        ? [
            ...pericia.documentosIniciais,
            {
              id: `doc-kml-${Date.now()}`,
              nome: `Perímetro Vetorial (${data.nomeArquivo})`,
              tipo: 'mapa',
              data: new Date().toISOString().split('T')[0],
              fonte: 'Upload KML/KMZ',
              descricao: `Perímetro e vértices processados: ${data.pontos.length} vértices, área ${data.areaHa.toFixed(2)} ha.`,
            },
          ]
        : pericia.documentosIniciais,
    };

    onUpdatePericia(updated);
  };

  const addImagesToImovel = (newImages: string[]) => {
    if (newImages.length === 0) return;
    const currentImovel = pericia.imovelAvaliado || {
      imovelNome: pericia.imovelNome || '',
      matricula: '',
      areaTotal: 0,
      areaAgricultavel: 0,
      fotoAreaUrl: '',
      fotosAdicionais: [],
      acesso: '',
      indicePluviometrico: '',
      topografia: '',
      caracteristicasSolo: '',
      aptidao: '',
      infraestrutura: '',
      produtividadeCulturas: '',
      benfeitorias: '',
    };

    let newFotoAreaUrl = currentImovel.fotoAreaUrl;
    let newFotosAdicionais = [...(currentImovel.fotosAdicionais || [])];

    if (!newFotoAreaUrl) {
      newFotoAreaUrl = newImages[0];
      if (newImages.length > 1) {
        newFotosAdicionais.push(...newImages.slice(1));
      }
    } else {
      newFotosAdicionais.push(...newImages);
    }

    onUpdatePericia({
      ...pericia,
      imovelAvaliado: {
        ...currentImovel,
        fotoAreaUrl: newFotoAreaUrl,
        fotosAdicionais: newFotosAdicionais,
      },
      atualizadoEm: new Date().toISOString(),
    });
  };

  const handleImageFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingImage(true);
    try {
      const processed: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const dataUrl = await compressImage(files[i]);
        if (dataUrl) processed.push(dataUrl);
      }
      if (processed.length > 0) {
        addImagesToImovel(processed);
      }
    } catch (err) {
      console.error("Erro ao carregar fotos:", err);
    } finally {
      setIsProcessingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const startLiveCamera = async (facing: 'environment' | 'user' = cameraFacingMode) => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch {
          throw new Error("Dispositivo de câmera não disponível.");
        }
      }
      setCameraStream(stream);
      setIsLiveCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err: any) {
      console.warn("Live camera access failed, falling back to system camera input:", err);
      cameraInputRef.current?.click();
    }
  };

  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsLiveCameraOpen(false);
  };

  const toggleLiveCameraFacing = () => {
    const nextFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextFacing);
    if (isLiveCameraOpen) {
      startLiveCamera(nextFacing);
    }
  };

  const captureFromLiveCamera = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        addImagesToImovel([dataUrl]);
      }
      stopLiveCamera();
    }
  };

  const handleRemoveMainPhoto = () => {
    const currentImovel = pericia.imovelAvaliado;
    if (!currentImovel) return;
    const additional = currentImovel.fotosAdicionais || [];
    let nextMain = '';
    let nextAdditional: string[] = [];
    if (additional.length > 0) {
      nextMain = additional[0];
      nextAdditional = additional.slice(1);
    }
    onUpdatePericia({
      ...pericia,
      imovelAvaliado: {
        ...currentImovel,
        fotoAreaUrl: nextMain,
        fotosAdicionais: nextAdditional,
      },
      atualizadoEm: new Date().toISOString(),
    });
  };

  const handleRemoveAdditionalPhoto = (index: number) => {
    const currentImovel = pericia.imovelAvaliado;
    if (!currentImovel) return;
    const additional = [...(currentImovel.fotosAdicionais || [])];
    additional.splice(index, 1);
    onUpdatePericia({
      ...pericia,
      imovelAvaliado: {
        ...currentImovel,
        fotosAdicionais: additional,
      },
      atualizadoEm: new Date().toISOString(),
    });
  };

  const handleSetAsMainPhoto = (index: number) => {
    const currentImovel = pericia.imovelAvaliado;
    if (!currentImovel) return;
    const additional = [...(currentImovel.fotosAdicionais || [])];
    const selected = additional[index];
    const oldMain = currentImovel.fotoAreaUrl;
    additional.splice(index, 1);
    if (oldMain) additional.unshift(oldMain);

    onUpdatePericia({
      ...pericia,
      imovelAvaliado: {
        ...currentImovel,
        fotoAreaUrl: selected,
        fotosAdicionais: additional,
      },
      atualizadoEm: new Date().toISOString(),
    });
  };

  // Handlers for Updating Main Pericia Info
  const handleMainInfoChange = (field: keyof Pericia, value: any) => {
    onUpdatePericia({
      ...pericia,
      [field]: value,
      atualizadoEm: new Date().toISOString(),
    });
  };

  const handleObjetoChange = (field: string, value: any) => {
    onUpdatePericia({
      ...pericia,
      objetoDescricao: {
        ...pericia.objetoDescricao,
        [field]: value,
      },
      atualizadoEm: new Date().toISOString(),
    });
  };

  const handleImovelAvaliadoChange = (field: string, value: any) => {
    const currentImovel = pericia.imovelAvaliado || {
      imovelNome: pericia.imovelNome || '',
      matricula: '',
      areaTotal: 0,
      areaAgricultavel: 0,
      fotoAreaUrl: '',
      acesso: '',
      indicePluviometrico: '',
      topografia: '',
      caracteristicasSolo: '',
      aptidao: '',
      infraestrutura: '',
      produtividadeCulturas: '',
      benfeitorias: '',
    };
    onUpdatePericia({
      ...pericia,
      imovelAvaliado: {
        ...currentImovel,
        [field]: value,
      },
      atualizadoEm: new Date().toISOString(),
    });
  };

  // Add Parte Envolvida
  const handleAddParte = () => {
    if (!newParte.nome) return;
    const parte: PericiaParteEnvolvida = {
      id: `parte-${Date.now()}`,
      nome: newParte.nome || '',
      cpfCnpj: newParte.cpfCnpj || '',
      contato: newParte.contato || '',
      endereco: newParte.endereco || '',
      papel: newParte.papel || 'contratante',
      observacoes: newParte.observacoes || '',
    };
    onUpdatePericia({
      ...pericia,
      partesEnvolvidas: [...pericia.partesEnvolvidas, parte],
      atualizadoEm: new Date().toISOString(),
    });
    setNewParte({ nome: '', cpfCnpj: '', contato: '', endereco: '', papel: 'contratante', observacoes: '' });
  };

  const handleRemoveParte = (id: string) => {
    onUpdatePericia({
      ...pericia,
      partesEnvolvidas: pericia.partesEnvolvidas.filter(p => p.id !== id),
      atualizadoEm: new Date().toISOString(),
    });
  };

  // Add Quesito
  const handleAddQuesito = () => {
    if (!newQuesito.pergunta) return;
    const q: PericiaQuesito = {
      id: `q-${Date.now()}`,
      numero: pericia.quesitos.length + 1,
      pergunta: newQuesito.pergunta,
      resposta: '',
      observacoes: newQuesito.observacoes,
      respondido: false,
    };
    onUpdatePericia({
      ...pericia,
      quesitos: [...pericia.quesitos, q],
      atualizadoEm: new Date().toISOString(),
    });
    setNewQuesito({ pergunta: '', observacoes: '' });
  };

  const handleRemoveQuesito = (id: string) => {
    onUpdatePericia({
      ...pericia,
      quesitos: pericia.quesitos.filter(q => q.id !== id),
      atualizadoEm: new Date().toISOString(),
    });
  };

  // Add Documento
  const handleAddDocumento = () => {
    if (!newDoc.nome) return;
    const doc: PericiaDocumentoInicial = {
      id: `doc-${Date.now()}`,
      nome: newDoc.nome || '',
      tipo: newDoc.tipo || 'contrato',
      data: newDoc.data || new Date().toISOString().split('T')[0],
      fonte: newDoc.fonte || '',
      descricao: newDoc.descricao || '',
    };
    onUpdatePericia({
      ...pericia,
      documentosIniciais: [...pericia.documentosIniciais, doc],
      atualizadoEm: new Date().toISOString(),
    });
    setNewDoc({ nome: '', tipo: 'contrato', data: new Date().toISOString().split('T')[0], fonte: '', descricao: '' });
  };

  const handleRemoveDocumento = (id: string) => {
    onUpdatePericia({
      ...pericia,
      documentosIniciais: pericia.documentosIniciais.filter(d => d.id !== id),
      atualizadoEm: new Date().toISOString(),
    });
  };

  // Toggle Checklist
  const handleToggleChecklist = (id: string) => {
    onUpdatePericia({
      ...pericia,
      checklistPreliminar: pericia.checklistPreliminar.map(item =>
        item.id === id ? { ...item, checado: !item.checado } : item
      ),
      atualizadoEm: new Date().toISOString(),
    });
  };

  const handleAddChecklist = () => {
    if (!newChecklistItem.trim()) return;
    onUpdatePericia({
      ...pericia,
      checklistPreliminar: [
        ...pericia.checklistPreliminar,
        { id: `ckp-${Date.now()}`, item: newChecklistItem.trim(), checado: false },
      ],
      atualizadoEm: new Date().toISOString(),
    });
    setNewChecklistItem('');
  };

  return (
    <div className="space-y-6">
      {/* Submodule Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl border border-slate-200 dark:border-zinc-700">
        <button
          onClick={() => setActiveTab('identificacao')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'identificacao'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          1.1 Identificação
        </button>

        <button
          onClick={() => setActiveTab('dados_regiao')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'dados_regiao'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <CloudSun className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          1.1.2 Dados da Região
        </button>

        <button
          onClick={() => setActiveTab('partes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'partes'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          1.2 Partes Envolvidas ({pericia.partesEnvolvidas.length})
        </button>

        <button
          onClick={() => setActiveTab('objeto')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'objeto'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          1.3 Objeto
        </button>

        <button
          onClick={() => setActiveTab('imovel_avaliado')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'imovel_avaliado'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Landmark className="w-3.5 h-3.5 text-blue-500" />
          1.3.2 Do Imóvel Avaliado
        </button>

        <button
          onClick={() => setActiveTab('avaliacao_imovel')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'avaliacao_imovel'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Landmark className="w-3.5 h-3.5 text-emerald-500" />
          1.3.3 Avaliação do Imóvel ({pericia.avaliacaoImovel?.precificacaoTerraNua?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('quesitos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'quesitos'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          1.4 Quesitos ({pericia.quesitos.length})
        </button>

        <button
          onClick={() => setActiveTab('documentos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'documentos'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          1.5 Documentos ({pericia.documentosIniciais.length})
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'checklist'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          1.6 Checklist Preliminar
        </button>
      </div>

      {/* 1.1.2 DADOS DA REGIÃO */}
      {activeTab === 'dados_regiao' && (
        <PericiaSubmoduleDadosRegiao pericia={pericia} onUpdatePericia={onUpdatePericia} />
      )}

      {/* 1.1 IDENTIFICAÇÃO DA PERÍCIA */}
      {activeTab === 'identificacao' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              1.1 Dados Gerais de Identificação e Cadastro
            </h3>
            <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">
              {pericia.codigoPericia}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Nome da Perícia</label>
              <input
                type="text"
                value={pericia.nome}
                onChange={e => handleMainInfoChange('nome', e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Código Oficial / Processo</label>
              <input
                type="text"
                value={pericia.codigoPericia}
                onChange={e => handleMainInfoChange('codigoPericia', e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Número Interno</label>
              <input
                type="text"
                value={pericia.numeroInterno}
                onChange={e => handleMainInfoChange('numeroInterno', e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Tipo de Perícia</label>
              <select
                value={pericia.tipo}
                onChange={e => handleMainInfoChange('tipo', e.target.value as TipoPericia)}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
              >
                {Object.entries(TIPO_PERICIA_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Status do Processo</label>
              <select
                value={pericia.status}
                onChange={e => handleMainInfoChange('status', e.target.value as PericiaStatus)}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
              >
                {Object.entries(STATUS_LABELS).map(([key, info]) => (
                  <option key={key} value={key}>{info.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Contratante Principal</label>
              <input
                type="text"
                value={pericia.contratanteNome}
                onChange={e => handleMainInfoChange('contratanteNome', e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Imóvel / Propriedade Rural</label>
              <input
                type="text"
                value={pericia.imovelNome}
                onChange={e => handleMainInfoChange('imovelNome', e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Município / UF</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Município"
                  value={pericia.municipio}
                  onChange={e => handleMainInfoChange('municipio', e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                />
                <input
                  type="text"
                  placeholder="UF"
                  maxLength={2}
                  value={pericia.uf}
                  onChange={e => handleMainInfoChange('uf', e.target.value.toUpperCase())}
                  className="w-16 p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-center uppercase font-bold"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-500 font-semibold">Responsável Técnico (Cadastro Técnico)</label>
                {(pericia.responsavelTecnico || pericia.crea || pericia.artNumero) && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdatePericia({
                        ...pericia,
                        responsavelTecnico: '',
                        crea: '',
                        artNumero: '',
                        atualizadoEm: new Date().toISOString(),
                      });
                    }}
                    className="text-[11px] text-rose-600 hover:text-rose-700 dark:text-rose-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    Limpar dados do RT
                  </button>
                )}
              </div>
              <select
                value={pericia.responsavelTecnico}
                onChange={e => {
                  const selectedName = e.target.value;
                  const selected = registeredAgronomists.find(a => a.name === selectedName);
                  if (selected) {
                    onUpdatePericia({
                      ...pericia,
                      responsavelTecnico: selected.name,
                      crea: selected.crea,
                      atualizadoEm: new Date().toISOString(),
                    });
                  } else {
                    handleMainInfoChange('responsavelTecnico', selectedName);
                  }
                }}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
              >
                <option value="">-- Selecionar RT ou Digitar Manualmente --</option>
                {registeredAgronomists.map(a => (
                  <option key={a.id} value={a.name}>
                    {a.name} ({a.crea})
                  </option>
                ))}
                {registeredAgronomists.length === 0 && (
                  <option value="" disabled>
                    Nenhum profissional cadastrado no Cadastro Técnico
                  </option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Confirmar Nome do RT</label>
              <input
                type="text"
                value={pericia.responsavelTecnico}
                onChange={e => handleMainInfoChange('responsavelTecnico', e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-emerald-700 dark:text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">CREA</label>
              <input
                type="text"
                value={pericia.crea}
                onChange={e => handleMainInfoChange('crea', e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Número de ART (Anotação de Resp. Técnica)</label>
              <input
                type="text"
                value={pericia.artNumero}
                onChange={e => handleMainInfoChange('artNumero', e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Data de Abertura / Prazo</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={pericia.dataAbertura}
                  onChange={e => handleMainInfoChange('dataAbertura', e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                />
                <input
                  type="date"
                  value={pericia.prazoFinal}
                  onChange={e => handleMainInfoChange('prazoFinal', e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs pt-2">
            {/* Dados Judiciais / Processuais for Cover */}
            <div className="border border-slate-150 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 p-4 rounded-xl space-y-3">
              <h4 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Scale className="w-4 h-4 text-emerald-600" />
                Dados Judiciais / Processuais (Capa do Laudo)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Número do Processo</label>
                  <input
                    type="text"
                    value={pericia.numeroProcesso || ''}
                    onChange={e => handleMainInfoChange('numeroProcesso', e.target.value)}
                    placeholder="Ex: 5012938-42.2026.8.09.0051"
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Autor (Requerente)</label>
                  <input
                    type="text"
                    value={pericia.autor || ''}
                    onChange={e => handleMainInfoChange('autor', e.target.value)}
                    placeholder="Nome do Autor"
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Réu (Requerido)</label>
                  <input
                    type="text"
                    value={pericia.reu || ''}
                    onChange={e => handleMainInfoChange('reu', e.target.value)}
                    placeholder="Nome do Réu"
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Objetivo Geral da Perícia</label>
              <textarea
                rows={2}
                value={pericia.objetivo}
                onChange={e => handleMainInfoChange('objetivo', e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Descrição Inicial dos Fatos</label>
              <textarea
                rows={3}
                value={pericia.descricaoInicial}
                onChange={e => handleMainInfoChange('descricaoInicial', e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* 1.2 PARTES ENVOLVIDAS */}
      {activeTab === 'partes' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              1.2 Cadastro de Partes Envolvidas no Processo
            </h3>
            <span className="text-xs text-slate-400">{pericia.partesEnvolvidas.length} partes cadastradas</span>
          </div>

          {/* Form to Add New Party */}
          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              Adicionar Nova Parte
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nome completo ou Razão Social *"
                value={newParte.nome}
                onChange={e => setNewParte({ ...newParte, nome: e.target.value })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
              <input
                type="text"
                placeholder="CPF ou CNPJ"
                value={newParte.cpfCnpj}
                onChange={e => setNewParte({ ...newParte, cpfCnpj: e.target.value })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono"
              />
              <select
                value={newParte.papel}
                onChange={e => setNewParte({ ...newParte, papel: e.target.value as any })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              >
                <option value="contratante">Contratante</option>
                <option value="proprietario">Proprietário</option>
                <option value="produtor">Produtor Rural</option>
                <option value="causador">Possível Causador do Dano</option>
                <option value="seguradora">Seguradora</option>
                <option value="banco">Instituição Financeira</option>
                <option value="parte_autora">Parte Autora (Autor)</option>
                <option value="parte_rea">Parte Ré (Réu)</option>
                <option value="assistente_tecnico">Assistente Técnico</option>
                <option value="testemunha">Testemunha / Depoente</option>
                <option value="outros">Outros</option>
              </select>
              <input
                type="text"
                placeholder="Telefone / E-mail de contato"
                value={newParte.contato}
                onChange={e => setNewParte({ ...newParte, contato: e.target.value })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
              <input
                type="text"
                placeholder="Endereço residencial / profissional"
                value={newParte.endereco}
                onChange={e => setNewParte({ ...newParte, endereco: e.target.value })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl md:col-span-2"
              />
            </div>
            <button
              onClick={handleAddParte}
              disabled={!newParte.nome}
              className="px-4 py-2 bg-emerald-600 disabled:opacity-50 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
            >
              Cadastrar Parte Envolvida
            </button>
          </div>

          {/* List of Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {pericia.partesEnvolvidas.map(parte => (
              <div
                key={parte.id}
                className="p-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-2 relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded font-bold uppercase text-[10px]">
                      {parte.papel.replace('_', ' ')}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white mt-1 text-sm">{parte.nome}</h4>
                    <p className="font-mono text-slate-500 text-[11px]">{parte.cpfCnpj || 'Sem CPF/CNPJ'}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveParte(parte.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-slate-600 dark:text-zinc-400 space-y-0.5 text-[11px]">
                  <p><strong>Contato:</strong> {parte.contato || 'Não informado'}</p>
                  <p><strong>Endereço:</strong> {parte.endereco || 'Não informado'}</p>
                  {parte.observacoes && <p className="italic text-slate-500">{parte.observacoes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1.3 OBJETO DA PERÍCIA */}
      {activeTab === 'objeto' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              1.3 Caracterização Detalhada do Objeto da Perícia
            </h3>
            <button
              type="button"
              onClick={() => setIsKmlModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-600" />
              <span>Importar Área do Talhão (KML / KMZ)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block text-slate-500 font-semibold mb-1">O que está sendo periciado?</label>
              <textarea
                rows={2}
                value={pericia.objetoDescricao.oQueEstaSendoPericiado}
                onChange={e => handleObjetoChange('oQueEstaSendoPericiado', e.target.value)}
                placeholder="Ex: Lavoura de Tomate Híbrido em fase de florescimento pleno..."
                className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Qual o problema/sinistro relatado?</label>
              <textarea
                rows={2}
                value={pericia.objetoDescricao.qualOProblema}
                onChange={e => handleObjetoChange('qualOProblema', e.target.value)}
                placeholder="Ex: Deriva de herbicida, necrose foliar e abortamento floral..."
                className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Finalidade da Análise</label>
              <textarea
                rows={2}
                value={pericia.objetoDescricao.finalidade}
                onChange={e => handleObjetoChange('finalidade', e.target.value)}
                placeholder="Ex: Apuração do dano emergente e instrução de ação judicial..."
                className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Período Envolvido</label>
              <input
                type="text"
                value={pericia.objetoDescricao.periodoEnvolvido}
                onChange={e => handleObjetoChange('periodoEnvolvido', e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Local / Talhão Específico</label>
              <input
                type="text"
                value={pericia.objetoDescricao.localTalhao}
                onChange={e => handleObjetoChange('localTalhao', e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Cultura Agrícola</label>
              <input
                type="text"
                value={pericia.objetoDescricao.cultura}
                onChange={e => handleObjetoChange('cultura', e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Área Afetada (Hectares)</label>
              <input
                type="number"
                step="0.1"
                value={pericia.objetoDescricao.areaAfetadaHa}
                onChange={e => handleObjetoChange('areaAfetadaHa', Number(e.target.value))}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-500 font-semibold mb-1">Evento Relacionado / Causalidade</label>
              <input
                type="text"
                value={pericia.objetoDescricao.eventoRelacionado}
                onChange={e => handleObjetoChange('eventoRelacionado', e.target.value)}
                placeholder="Ex: Pulverização aérea realizada em 08/02/2026..."
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* 1.3.2 DO IMÓVEL AVALIADO */}
      {activeTab === 'imovel_avaliado' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-600 animate-pulse" />
                1.3.2 Do Imóvel Avaliado
              </h3>
              <span className="text-[11px] text-slate-400">Dados cadastrais e técnicos do imóvel rural</span>
            </div>
            <button
              type="button"
              onClick={() => setIsKmlModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs w-fit"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-600" />
              <span>Importar Perímetro do Imóvel (KML / KMZ)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Column 1: Dados Gerais da Área */}
            <div className="space-y-4 border border-slate-100 dark:border-zinc-800 p-4 rounded-xl bg-slate-50/40 dark:bg-zinc-900/50">
              <h4 className="font-bold text-slate-800 dark:text-zinc-200 border-b border-slate-100 pb-1 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <Landmark className="w-4 h-4 text-emerald-600" />
                Dados do Imóvel & Áreas
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-500 font-semibold mb-1">Nome do Imóvel</label>
                  <input
                    type="text"
                    value={pericia.imovelAvaliado?.imovelNome || pericia.imovelNome || ''}
                    onChange={e => handleImovelAvaliadoChange('imovelNome', e.target.value)}
                    placeholder="Ex: Fazenda Boa Esperança"
                    className="w-full p-2 bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-500 font-semibold mb-1">Matrícula (Registro de Imóveis)</label>
                  <input
                    type="text"
                    value={pericia.imovelAvaliado?.matricula || ''}
                    onChange={e => handleImovelAvaliadoChange('matricula', e.target.value)}
                    placeholder="Ex: Matrícula nº 14.892, Livro 2, Registro de Imóveis"
                    className="w-full p-2 bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Área Total (Hectares)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pericia.imovelAvaliado?.areaTotal || ''}
                    onChange={e => handleImovelAvaliadoChange('areaTotal', parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 350.5"
                    className="w-full p-2 bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Área Agricultável (Hectares)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pericia.imovelAvaliado?.areaAgricultavel || ''}
                    onChange={e => handleImovelAvaliadoChange('areaAgricultavel', parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 280.0"
                    className="w-full p-2 bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              {/* Photo Upload / Attachment Area */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 dark:text-zinc-200 font-bold text-xs uppercase tracking-wide">
                    Fotografia Aérea / Croqui do Imóvel
                  </label>
                  {(pericia.imovelAvaliado?.fotoAreaUrl || (pericia.imovelAvaliado?.fotosAdicionais && pericia.imovelAvaliado.fotosAdicionais.length > 0)) && (
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      {(pericia.imovelAvaliado?.fotoAreaUrl ? 1 : 0) + (pericia.imovelAvaliado?.fotosAdicionais?.length || 0)} foto(s) anexada(s)
                    </span>
                  )}
                </div>

                {/* Hidden native input elements for real camera and gallery file picker */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleImageFileInput}
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageFileInput}
                />

                {isProcessingImage && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Otimizando e processando fotografia em alta resolução...</span>
                  </div>
                )}

                {pericia.imovelAvaliado?.fotoAreaUrl ? (
                  <div className="space-y-3">
                    {/* Primary Photo Card */}
                    <div className="relative group border border-slate-200 dark:border-zinc-700 rounded-xl overflow-hidden aspect-video bg-slate-100 dark:bg-zinc-850 shadow-sm">
                      <img
                        src={pericia.imovelAvaliado.fotoAreaUrl}
                        alt="Croqui / Foto Principal do Imóvel"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 bg-emerald-700/90 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                        Foto Principal / Croqui
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity p-2">
                        <button
                          type="button"
                          onClick={() => setPreviewModalUrl(pericia.imovelAvaliado?.fotoAreaUrl || null)}
                          className="px-2.5 py-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-transform hover:scale-105"
                          title="Visualizar em tamanho real"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-700" />
                          Ampliar
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveMainPhoto}
                          className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-transform hover:scale-105"
                          title="Remover foto principal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remover
                        </button>
                      </div>
                    </div>

                    {/* Additional Photos Grid if present */}
                    {pericia.imovelAvaliado.fotosAdicionais && pericia.imovelAvaliado.fotosAdicionais.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Outras Imagens / Croquis ({pericia.imovelAvaliado.fotosAdicionais.length})
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {pericia.imovelAvaliado.fotosAdicionais.map((url, idx) => (
                            <div key={idx} className="relative group border border-slate-200 dark:border-zinc-700 rounded-lg overflow-hidden aspect-video bg-slate-100 dark:bg-zinc-800">
                              <img
                                src={url}
                                alt={`Foto adicional ${idx + 1}`}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => setPreviewModalUrl(url)}
                                  className="p-1 bg-white/90 text-slate-800 rounded hover:bg-white cursor-pointer"
                                  title="Ampliar"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSetAsMainPhoto(idx)}
                                  className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                                  title="Definir como principal"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAdditionalPhoto(idx)}
                                  className="p-1 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                                  title="Remover"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action buttons to add more photos or replace */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-600" />
                        Tirar com Câmera
                      </button>
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Image className="w-3.5 h-3.5 text-blue-600" />
                        Abrir Galeria
                      </button>
                      <button
                        type="button"
                        onClick={() => startLiveCamera('environment')}
                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Video className="w-3.5 h-3.5 text-purple-600" />
                        Webcam ao Vivo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl p-5 text-center space-y-3 bg-white dark:bg-zinc-800/20">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 mx-auto flex items-center justify-center text-slate-400">
                      <Image className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Nenhuma foto do imóvel anexada ainda.</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Capture pelo celular, anexe fotos aéreas/croquis da galeria ou utilize a webcam.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer text-emerald-800 dark:text-emerald-300 transition-all hover:scale-102"
                      >
                        <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Tirar com Câmera
                      </button>
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer text-blue-800 dark:text-blue-300 transition-all hover:scale-102"
                      >
                        <Image className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Abrir Galeria
                      </button>
                      <button
                        type="button"
                        onClick={() => startLiveCamera('environment')}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-zinc-200 transition-all"
                      >
                        <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        Webcam ao Vivo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Características Técnicas e Geográficas */}
            <div className="space-y-4 border border-slate-100 dark:border-zinc-800 p-4 rounded-xl bg-slate-50/40 dark:bg-zinc-900/50">
              <h4 className="font-bold text-slate-800 dark:text-zinc-200 border-b border-slate-100 pb-1 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <CloudSun className="w-4 h-4 text-amber-500" />
                Características Agronômicas & Infraestrutura
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Acesso (Vias de Escoamento e Conservação)</label>
                  <input
                    type="text"
                    value={pericia.imovelAvaliado?.acesso || ''}
                    onChange={e => handleImovelAvaliadoChange('acesso', e.target.value)}
                    placeholder="Ex: Acesso pela BR-060, km 22, seguido de 4 km de estrada de terra cascalhada..."
                    className="w-full p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Índice Pluviométrico (Média Anual)</label>
                  <input
                    type="text"
                    value={pericia.imovelAvaliado?.indicePluviometrico || ''}
                    onChange={e => handleImovelAvaliadoChange('indicePluviometrico', e.target.value)}
                    placeholder="Ex: 1.600 mm a 1.800 mm anuais, com chuvas concentradas..."
                    className="w-full p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Topografia do Relevo</label>
                  <input
                    type="text"
                    value={pericia.imovelAvaliado?.topografia || ''}
                    onChange={e => handleImovelAvaliadoChange('topografia', e.target.value)}
                    placeholder="Ex: Predominantemente plana (0 a 3% de declividade), altamente mecanizável..."
                    className="w-full p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Características do Solo</label>
                  <input
                    type="text"
                    value={pericia.imovelAvaliado?.caracteristicasSolo || ''}
                    onChange={e => handleImovelAvaliadoChange('caracteristicasSolo', e.target.value)}
                    placeholder="Ex: Solo Latossolo Vermelho distrófico, argiloso (45% argila)..."
                    className="w-full p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Aptidão Agrícola</label>
                  <input
                    type="text"
                    value={pericia.imovelAvaliado?.aptidao || ''}
                    onChange={e => handleImovelAvaliadoChange('aptidao', e.target.value)}
                    placeholder="Ex: Excelente aptidão para grãos (soja e milho safrinha)..."
                    className="w-full p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Infraestrutura Externa e Conectividade</label>
                  <input
                    type="text"
                    value={pericia.imovelAvaliado?.infraestrutura || ''}
                    onChange={e => handleImovelAvaliadoChange('infraestrutura', e.target.value)}
                    placeholder="Ex: Energia elétrica trifásica instalada, cobertura de internet móvel 4G/5G..."
                    className="w-full p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Produtividade Histórica: Culturas e Períodos</label>
                  <textarea
                    rows={2}
                    value={pericia.imovelAvaliado?.produtividadeCulturas || ''}
                    onChange={e => handleImovelAvaliadoChange('produtividadeCulturas', e.target.value)}
                    placeholder="Ex: Soja (safra de verão, média de 72 sc/ha); Milho Safrinha..."
                    className="w-full p-2 bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Benfeitorias Identificadas</label>
                  <textarea
                    rows={2}
                    value={pericia.imovelAvaliado?.benfeitorias || ''}
                    onChange={e => handleImovelAvaliadoChange('benfeitorias', e.target.value)}
                    placeholder="Ex: Poço artesiano, galpão metálico, cercas de arame liso..."
                    className="w-full p-2 bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SUBMÓDULO DE AVALIAÇÃO DO IMÓVEL & PRECIFICAÇÃO DA TERRA NUA */}
          <div className="border-t border-slate-200 dark:border-zinc-800 pt-6">
            <PericiaSubmoduleAvaliacaoImovel pericia={pericia} onUpdatePericia={onUpdatePericia} />
          </div>
        </div>
      )}

      {/* 1.3.3 AVALIAÇÃO DO IMÓVEL TAB */}
      {activeTab === 'avaliacao_imovel' && (
        <div className="space-y-6">
          <PericiaSubmoduleAvaliacaoImovel pericia={pericia} onUpdatePericia={onUpdatePericia} />
        </div>
      )}

      {/* 1.4 QUESITOS MATRIZ */}
      {activeTab === 'quesitos' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              1.4 Quesitos Técnicos do Processo
            </h3>
            <span className="text-xs text-slate-400">
              {pericia.quesitos.filter(q => q.respondido).length} de {pericia.quesitos.length} respondidos
            </span>
          </div>

          {/* Add Quesito Form */}
          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              Cadastrar Novo Quesito
            </h4>
            <textarea
              rows={2}
              placeholder="Digite a Pergunta Técnica do Quesito..."
              value={newQuesito.pergunta}
              onChange={e => setNewQuesito({ ...newQuesito, pergunta: e.target.value })}
              className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
            />
            <button
              onClick={handleAddQuesito}
              disabled={!newQuesito.pergunta}
              className="px-4 py-2 bg-emerald-600 disabled:opacity-50 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
            >
              Adicionar Quesito
            </button>
          </div>

          {/* List of Quesitos */}
          <div className="space-y-3 text-xs">
            {pericia.quesitos.map(q => (
              <div
                key={q.id}
                className="p-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 font-bold flex items-center justify-center text-xs">
                      Q{q.numero}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{q.pergunta}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        q.respondido ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {q.respondido ? ' Respondido' : ' Pendente'}
                    </span>
                    <button
                      onClick={() => handleRemoveQuesito(q.id)}
                      className="text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 font-semibold mb-1">Resposta do Perito</label>
                  <textarea
                    rows={2}
                    value={q.resposta}
                    onChange={e => {
                      const updatedQuesitos = pericia.quesitos.map(item =>
                        item.id === q.id
                          ? { ...item, resposta: e.target.value, respondido: !!e.target.value.trim() }
                          : item
                      );
                      onUpdatePericia({ ...pericia, quesitos: updatedQuesitos });
                    }}
                    placeholder="Escreva a fundamentação técnica da resposta..."
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1.5 DOCUMENTOS INICIAIS */}
      {activeTab === 'documentos' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-emerald-600" />
              1.5 Anexo de Documentos Iniciais do Processo
            </h3>
            <span className="text-xs text-slate-400">{pericia.documentosIniciais.length} anexos</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              Anexar Novo Documento
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nome do Documento (Ex: Nota Fiscal de Sementes)"
                value={newDoc.nome}
                onChange={e => setNewDoc({ ...newDoc, nome: e.target.value })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
              <select
                value={newDoc.tipo}
                onChange={e => setNewDoc({ ...newDoc, tipo: e.target.value as any })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              >
                <option value="contrato">Contrato</option>
                <option value="nota_fiscal">Nota Fiscal</option>
                <option value="receita_agronomica">Receita Agronômica</option>
                <option value="mapa">Mapa / Cartografia</option>
                <option value="doc_imovel">Documento do Imóvel</option>
                <option value="analise_lab">Análise Laboratorial</option>
                <option value="laudo_anterior">Laudo Anterior</option>
                <option value="seguro">Apólice de Seguro</option>
                <option value="outro">Outro Documento</option>
              </select>
              <input
                type="text"
                placeholder="Fonte / Emissor"
                value={newDoc.fonte}
                onChange={e => setNewDoc({ ...newDoc, fonte: e.target.value })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>
            <button
              onClick={handleAddDocumento}
              disabled={!newDoc.nome}
              className="px-4 py-2 bg-emerald-600 disabled:opacity-50 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
            >
              Anexar Documento
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {pericia.documentosIniciais.map(doc => (
              <div
                key={doc.id}
                className="p-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-2 relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold uppercase text-[10px]">
                      {doc.tipo}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white mt-1">{doc.nome}</h4>
                  </div>
                  <button
                    onClick={() => handleRemoveDocumento(doc.id)}
                    className="text-slate-400 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-slate-500 text-[11px]">{doc.descricao || 'Sem descrição'}</p>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Fonte: {doc.fonte || 'N/I'}</span>
                  <span>Data: {doc.data}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1.6 CHECKLIST PRELIMINAR */}
      {activeTab === 'checklist' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              1.6 Checklist de Planejamento e Pré-Vistoria
            </h3>
            <span className="text-xs text-slate-400">
              {pericia.checklistPreliminar.filter(c => c.checado).length} de {pericia.checklistPreliminar.length} concluídos
            </span>
          </div>

          <div className="flex gap-2 text-xs">
            <input
              type="text"
              placeholder="Adicionar novo item ao checklist preliminar..."
              value={newChecklistItem}
              onChange={e => setNewChecklistItem(e.target.value)}
              className="flex-1 p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
            />
            <button
              onClick={handleAddChecklist}
              className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl cursor-pointer"
            >
              + Adicionar
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {pericia.checklistPreliminar.map(item => (
              <div
                key={item.id}
                onClick={() => handleToggleChecklist(item.id)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  item.checado
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-slate-900 dark:text-white'
                    : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      item.checado
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-zinc-600'
                    }`}
                  >
                    {item.checado && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </span>
                  <span className={item.checado ? 'line-through opacity-80 font-medium' : 'font-medium'}>
                    {item.item}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Camera Modal */}
      {isLiveCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4 p-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Câmera ao Vivo / Fotografia do Imóvel</h3>
              </div>
              <button
                type="button"
                onClick={stopLiveCamera}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/50 text-[10px] font-mono px-2 py-0.5 rounded text-white/80">
                Visualização ao vivo
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={toggleLiveCameraFacing}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-slate-200"
              >
                <RefreshCw className="w-4 h-4 text-slate-400" />
                Inverter Câmera
              </button>

              <button
                type="button"
                onClick={captureFromLiveCamera}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/50 hover:scale-102 transition-all text-white"
              >
                <Camera className="w-4 h-4" />
                Capturar Foto
              </button>

              <button
                type="button"
                onClick={() => {
                  stopLiveCamera();
                  cameraInputRef.current?.click();
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300 cursor-pointer"
                title="Abrir app de câmera do sistema"
              >
                App Câmera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview Modal */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-transparent rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black text-white rounded-full cursor-pointer z-10"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewModalUrl}
              alt="Ampliação do Croqui / Foto"
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}

      {/* Advanced KML / KMZ Importer Modal */}
      {isKmlModalOpen && (
        <PericiaKmlImporterModal
          isOpen={isKmlModalOpen}
          onClose={() => setIsKmlModalOpen(false)}
          pericia={pericia}
          onApplyImport={handleApplyKmlImport}
        />
      )}
    </div>
  );
};
