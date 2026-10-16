import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Pencil,
  Trash2,
  ArrowRight,
  Bug,
  Sprout,
  FlaskConical,
  Microscope,
  MapPin,
  Calendar,
  Activity,
  FileText,
  Camera,
  Layers,
  Download,
  Upload,
  Printer,
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Check,
  RotateCcw,
  TrendingUp,
  Droplets,
  Thermometer,
  Eye,
  Info,
  X,
  ChevronRight,
  Gauge,
  Building,
  ClipboardList,
  FileCheck2,
  FileSpreadsheet,
  Paperclip,
  Leaf,
} from 'lucide-react';

export interface StandardPathogenCatalogItem {
  id: string;
  pathogenName: string;
  commonName: string;
  category: 'Nematoide' | 'Fungo' | 'Bactéria';
  defaultUnit: 'Espécimes / 100cm³' | 'Propágulos / g' | 'UFC/g de solo' | 'Ovos / 10g raiz' | 'UFC / ml';
  thresholdLow: number;
  thresholdMed: number;
  thresholdHigh: number;
  referenceDescription: string;
  managementNote: string;
}

export const STANDARD_PATHOGEN_CATALOG: StandardPathogenCatalogItem[] = [
  // Nematoides
  {
    id: 'pratylenchus-brachyurus',
    pathogenName: 'Pratylenchus brachyurus',
    commonName: 'Nematoide das Lesões Radiculares',
    category: 'Nematoide',
    defaultUnit: 'Espécimes / 100cm³',
    thresholdLow: 200,
    thresholdMed: 500,
    thresholdHigh: 1000,
    referenceDescription: 'Baixo: < 200 | Médio: 200-500 | Alto: 500-1.000 | Crítico: > 1.000 esp/100cm³',
    managementNote: 'Bioinsumos: Bacillus velezensis, Pochonia chlamydosporia. Rotação: Crotalaria spectabilis.',
  },
  {
    id: 'meloidogyne-javanica',
    pathogenName: 'Meloidogyne javanica',
    commonName: 'Nematoide das Galhas (Javanica)',
    category: 'Nematoide',
    defaultUnit: 'Espécimes / 100cm³',
    thresholdLow: 100,
    thresholdMed: 300,
    thresholdHigh: 600,
    referenceDescription: 'Baixo: < 100 | Médio: 100-300 | Alto: 300-600 | Crítico: > 600 esp/100cm³',
    managementNote: 'Bioinsumos: Purpureocillium lilacinum, Bacillus subtilis. Evitar plantas hospedeiras.',
  },
  {
    id: 'meloidogyne-incognita',
    pathogenName: 'Meloidogyne incognita',
    commonName: 'Nematoide das Galhas (Incognita)',
    category: 'Nematoide',
    defaultUnit: 'Espécimes / 100cm³',
    thresholdLow: 100,
    thresholdMed: 300,
    thresholdHigh: 600,
    referenceDescription: 'Baixo: < 100 | Médio: 100-300 | Alto: 300-600 | Crítico: > 600 esp/100cm³',
    managementNote: 'Bioinsumos: Bacillus firmus, Purpureocillium lilacinum. Rotação com gramíneas não hospedeiras.',
  },
  {
    id: 'heterodera-glycines',
    pathogenName: 'Heterodera glycines',
    commonName: 'Nematoide do Cisto da Soja',
    category: 'Nematoide',
    defaultUnit: 'Espécimes / 100cm³',
    thresholdLow: 50,
    thresholdMed: 200,
    thresholdHigh: 500,
    referenceDescription: 'Baixo: < 50 | Médio: 50-200 | Alto: 200-500 | Crítico: > 500 cistos/ovos por 100cm³',
    managementNote: 'Uso de cultivares resistentes para a raça. Bioinsumo: Pochonia chlamydosporia.',
  },
  {
    id: 'rotylenchulus-reniformis',
    pathogenName: 'Rotylenchulus reniformis',
    commonName: 'Nematoide Reniforme',
    category: 'Nematoide',
    defaultUnit: 'Espécimes / 100cm³',
    thresholdLow: 250,
    thresholdMed: 600,
    thresholdHigh: 1200,
    referenceDescription: 'Baixo: < 250 | Médio: 250-600 | Alto: 600-1.200 | Crítico: > 1.200 esp/100cm³',
    managementNote: 'Comum em solos pesados/argilosos. Rotação com milho ou braquiária reduz população.',
  },
  {
    id: 'scutellonema-brachyurus',
    pathogenName: 'Scutellonema brachyurus',
    commonName: 'Nematoide Espiralado / Escutelonema',
    category: 'Nematoide',
    defaultUnit: 'Espécimes / 100cm³',
    thresholdLow: 300,
    thresholdMed: 700,
    thresholdHigh: 1500,
    referenceDescription: 'Baixo: < 300 | Médio: 300-700 | Alto: 700-1.500 | Crítico: > 1.500 esp/100cm³',
    managementNote: 'Endoparasita facultativo em expansão. Tratamento biológico no sulco de plantio.',
  },
  {
    id: 'tubixaba-tuxaua',
    pathogenName: 'Tubixaba tuxaua',
    commonName: 'Nematoide Tubixaba',
    category: 'Nematoide',
    defaultUnit: 'Espécimes / 100cm³',
    thresholdLow: 20,
    thresholdMed: 60,
    thresholdHigh: 150,
    referenceDescription: 'Baixo: < 20 | Médio: 20-60 | Alto: 60-150 | Crítico: > 150 esp/100cm³',
    managementNote: 'Espécie altamente agressiva em soja. Nível de dano severo mesmo em baixas densidades.',
  },

  // Fungos do Solo
  {
    id: 'macrophomina-phaseolina',
    pathogenName: 'Macrophomina phaseolina',
    commonName: 'Podridão Cinzenta da Raiz / Carvão',
    category: 'Fungo',
    defaultUnit: 'Propágulos / g',
    thresholdLow: 100,
    thresholdMed: 250,
    thresholdHigh: 500,
    referenceDescription: 'Baixo: < 100 | Médio: 100-250 | Alto: 250-500 | Crítico: > 500 microescleródios/g',
    managementNote: 'Favorecido por veranico e estresse hídrico. Trichoderma asperellum + palhada espessa.',
  },
  {
    id: 'rhizoctonia-solani',
    pathogenName: 'Rhizoctonia solani',
    commonName: 'Rizoctoniose / Podridão Radicular e Colo',
    category: 'Fungo',
    defaultUnit: 'Propágulos / g',
    thresholdLow: 80,
    thresholdMed: 200,
    thresholdHigh: 400,
    referenceDescription: 'Baixo: < 80 | Médio: 80-200 | Alto: 200-400 | Crítico: > 400 propágulos/g',
    managementNote: 'Trichoderma harzianum no sulco + tratamento de sementes específico.',
  },
  {
    id: 'fusarium-oxysporum',
    pathogenName: 'Fusarium oxysporum',
    commonName: 'Fusariose / Murcha de Fusarium',
    category: 'Fungo',
    defaultUnit: 'UFC/g de solo',
    thresholdLow: 150,
    thresholdMed: 350,
    thresholdHigh: 700,
    referenceDescription: 'Baixo: < 150 | Médio: 150-350 | Alto: 350-700 | Crítico: > 700 UFC/g de solo',
    managementNote: 'Descompactação de solo, correção de acidez (pH > 6.0) e consórcio de Bacillus + Trichoderma.',
  },
  {
    id: 'fusarium-solani',
    pathogenName: 'Fusarium solani f. sp. glycines',
    commonName: 'Síndrome da Morte Súbita (SMS)',
    category: 'Fungo',
    defaultUnit: 'UFC/g de solo',
    thresholdLow: 100,
    thresholdMed: 250,
    thresholdHigh: 500,
    referenceDescription: 'Baixo: < 100 | Médio: 100-250 | Alto: 250-500 | Crítico: > 500 UFC/g de solo',
    managementNote: 'Controle de nematoides associados (P. brachyurus e Heterodera) reduz severidade.',
  },
  {
    id: 'sclerotinia-sclerotiorum',
    pathogenName: 'Sclerotinia sclerotiorum',
    commonName: 'Mofo Branco / Podridão de Esclerotinia',
    category: 'Fungo',
    defaultUnit: 'Propágulos / g',
    thresholdLow: 10,
    thresholdMed: 30,
    thresholdHigh: 80,
    referenceDescription: 'Baixo: < 10 | Médio: 10-30 | Alto: 30-80 | Crítico: > 80 escleródios/m² ou propágulos/g',
    managementNote: 'Trichoderma harzianum em pré-plantio e floração + dessecação para formar palha densa de Brachiaria.',
  },
  {
    id: 'phytophthora-sojae',
    pathogenName: 'Phytophthora sojae',
    commonName: 'Podridão Radicular de Fitóftora',
    category: 'Fungo',
    defaultUnit: 'Propágulos / g',
    thresholdLow: 50,
    thresholdMed: 150,
    thresholdHigh: 350,
    referenceDescription: 'Baixo: < 50 | Médio: 50-150 | Alto: 150-350 | Crítico: > 350 oósporos/g',
    managementNote: 'Melhorar drenagem do solo, evitar compactação e usar cultivares com genes Rps de resistência.',
  },
  {
    id: 'corynespora-cassiicola',
    pathogenName: 'Corynespora cassiicola',
    commonName: 'Podridão Radicular e Mancha Alvo',
    category: 'Fungo',
    defaultUnit: 'Propágulos / g',
    thresholdLow: 80,
    thresholdMed: 200,
    thresholdHigh: 450,
    referenceDescription: 'Baixo: < 80 | Médio: 80-200 | Alto: 200-450 | Crítico: > 450 propágulos/g',
    managementNote: 'Sobrevive em restos culturais e sementes. Rotação com milheto ou crotalária.',
  },
  {
    id: 'colletotrichum-truncatum',
    pathogenName: 'Colletotrichum truncatum',
    commonName: 'Antracnose / Podridão de Plântulas',
    category: 'Fungo',
    defaultUnit: 'Propágulos / g',
    thresholdLow: 100,
    thresholdMed: 300,
    thresholdHigh: 600,
    referenceDescription: 'Baixo: < 100 | Médio: 100-300 | Alto: 300-600 | Crítico: > 600 conídios/g',
    managementNote: 'Tratamento de sementes e manejo de fertilidade (Potássio e Cálcio balanceados).',
  },
  {
    id: 'pythium-ultimum',
    pathogenName: 'Pythium spp.',
    commonName: 'Tombamento / Damping-off',
    category: 'Fungo',
    defaultUnit: 'Propágulos / g',
    thresholdLow: 80,
    thresholdMed: 180,
    thresholdHigh: 380,
    referenceDescription: 'Baixo: < 80 | Médio: 80-180 | Alto: 180-380 | Crítico: > 380 propágulos/g',
    managementNote: 'Evitar plantio em solos frios e encharcados. Inoculação com Trichoderma viride.',
  },

  // Bactérias do Solo
  {
    id: 'ralstonia-solanacearum',
    pathogenName: 'Ralstonia solanacearum',
    commonName: 'Murcha Bacteriana',
    category: 'Bactéria',
    defaultUnit: 'UFC/g de solo',
    thresholdLow: 100,
    thresholdMed: 500,
    thresholdHigh: 1500,
    referenceDescription: 'Baixo: < 100 | Médio: 100-500 | Alto: 500-1.500 | Crítico: > 1.500 UFC/g',
    managementNote: 'Manejo de pH, adubação verde com brássicas (biofumigação) e rotação de culturas.',
  },
  {
    id: 'pectobacterium-carotovorum',
    pathogenName: 'Pectobacterium carotovorum',
    commonName: 'Podridão Mole Bacteriana',
    category: 'Bactéria',
    defaultUnit: 'UFC/g de solo',
    thresholdLow: 200,
    thresholdMed: 600,
    thresholdHigh: 1800,
    referenceDescription: 'Baixo: < 200 | Médio: 200-600 | Alto: 600-1.800 | Crítico: > 1.800 UFC/g',
    managementNote: 'Evitar injúrias radiculares, solarização e aplicação de Bacillus amyloliquefaciens.',
  },
];

export function calculatePathogenRisk(
  value: number,
  catalogItem?: StandardPathogenCatalogItem
): 'Baixo' | 'Médio' | 'Alto' | 'Crítico' {
  if (!catalogItem) {
    if (value > 800) return 'Crítico';
    if (value > 400) return 'Alto';
    if (value > 150) return 'Médio';
    return 'Baixo';
  }
  if (value > catalogItem.thresholdHigh) return 'Crítico';
  if (value > catalogItem.thresholdMed) return 'Alto';
  if (value > catalogItem.thresholdLow) return 'Médio';
  return 'Baixo';
}

export interface PathogenQuantification {
  id: string;
  catalogId?: string;
  pathogenName: string;
  commonName: string;
  category: 'Fungo' | 'Nematoide' | 'Bactéria';
  valueDetected: number;
  unit: 'UFC/g de solo' | 'Espécimes / 100cm³' | 'Propágulos / g' | 'Ovos / 10g raiz' | 'UFC / ml';
  thresholdLow: number;
  thresholdHigh: number;
  referenceDescription?: string;
  managementNote?: string;
  riskLevel: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
}

export interface SoilLabSamplingReport {
  id: string;
  labProtocol: string;
  labName: string;
  propertyId: string;
  propertyName: string;
  fieldId: string;
  fieldName: string;
  sampleDate: string;
  reportDate: string;
  crop: string;
  cultivar: string;
  agronomist: string;
  crea: string;
  labFileAttached?: string;
  overallRiskLevel: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  pathogens: PathogenQuantification[];
  labInterpretation: string;
  controlRecommendations: {
    biological: string[];
    cultural: string[];
    chemical: string[];
  };
}

const INITIAL_LAB_REPORTS: SoilLabSamplingReport[] = [];


import {
  SoilDisease,
  SymptomItem,
  SoilProperty,
  SoilField,
  FieldSampleCollection,
  SoilDiseaseOccurrence,
  SoilChemicalParams,
  DiagnosticMethod,
  OccurrenceSeverity,
} from '../types/soilDiseases';

import {
  NATIONAL_SOIL_DISEASES,
  SOIL_SYMPTOMS_BANK,
  INITIAL_PROPERTIES,
  INITIAL_FIELDS,
  INITIAL_OCCURRENCES,
} from '../data/soilDiseasesDatabase';

import {
  matchDiseasesFromSymptoms,
  calculateIgssScore,
  interpretSoilPredisposingFactors,
  calculateWeatherRiskAlerts,
  loadPropertiesFromStorage,
  savePropertiesToStorage,
  loadFieldsFromStorage,
  saveFieldsToStorage,
  loadOccurrencesFromStorage,
  saveOccurrencesToStorage,
  printSoilDiseaseReport,
} from '../utils/soilDiseasesEngine';

import { SoilPathogenEvolutionChart } from './SoilPathogenEvolutionChart';

interface SoilDiseasesModuleProps {
  activeSubTab?: string;
  setActiveSubTab?: (subTab: string) => void;
  selectedFarmId?: string;
  setActiveTab?: (tab: string) => void;
  onNavigateToBackup?: () => void;
}

export const SoilDiseasesModule: React.FC<SoilDiseasesModuleProps> = ({
  activeSubTab = 'dashboard',
  setActiveSubTab,
  setActiveTab,
  onNavigateToBackup,
}) => {
  const [currentSubTab, setCurrentSubTab] = useState<string>(activeSubTab);

  useEffect(() => {
    if (activeSubTab) {
      setCurrentSubTab(activeSubTab);
    }
  }, [activeSubTab]);

  const handleSubTabChange = (tab: string) => {
    setCurrentSubTab(tab);
    if (setActiveSubTab) {
      setActiveSubTab(tab);
    }
  };

  // State
  const [properties, setProperties] = useState<SoilProperty[]>(() => {
    const loaded = loadPropertiesFromStorage();
    return loaded.length > 0 ? loaded : INITIAL_PROPERTIES;
  });

  const [fields, setFields] = useState<SoilField[]>(() => {
    const loaded = loadFieldsFromStorage();
    return loaded.length > 0 ? loaded : INITIAL_FIELDS;
  });

  const [occurrences, setOccurrences] = useState<SoilDiseaseOccurrence[]>(() => {
    const loaded = loadOccurrencesFromStorage();
    return loaded;
  });

  // Save changes to localStorage
  useEffect(() => {
    savePropertiesToStorage(properties);
  }, [properties]);

  useEffect(() => {
    saveFieldsToStorage(fields);
  }, [fields]);

  useEffect(() => {
    saveOccurrencesToStorage(occurrences);
  }, [occurrences]);

  // Modals & UI Selection States
  const [selectedDisease, setSelectedDisease] = useState<SoilDisease | null>(null);
  const [selectedOccurrence, setSelectedOccurrence] = useState<SoilDiseaseOccurrence | null>(null);
  const [selectedFieldForMap, setSelectedFieldForMap] = useState<SoilField | null>(null);

  // Property Modal State
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [newProp, setNewProp] = useState<Partial<SoilProperty>>({
    farmName: '',
    owner: '',
    technicalResponsible: '',
    crea: '',
    municipality: '',
    state: 'PR',
    gpsLatitude: -24.9555,
    gpsLongitude: -53.4552,
    totalAreaHa: 0,
    cultivatedAreaHa: 0,
    notes: '',
  });

  // Field Modal State
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [newField, setNewField] = useState<Partial<SoilField>>({
    propertyId: properties[0]?.id || '',
    code: '',
    name: '',
    areaHa: 0,
    currentCrop: 'Soja',
    cultivar: '',
    season: '',
    croppingSystem: 'Plantio Direto',
    soilType: 'Latossolo Vermelho',
    texturalClass: 'Argilosa',
    latitude: -24.9570,
    longitude: -53.4570,
    cropHistory: [],
  });

  // Diário Fotográfico Modal State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const [selectedOccForPhoto, setSelectedOccForPhoto] = useState<string | null>(null);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [photoDayLabel, setPhotoDayLabel] = useState<string>('');
  const [photoNotes, setPhotoNotes] = useState<string>('');
  const [photoSeverityPct, setPhotoSeverityPct] = useState<number>(15);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  const cameraInputRef = React.useRef<HTMLInputElement | null>(null);
  const galleryInputRef = React.useRef<HTMLInputElement | null>(null);

  // Sample Collection Wizard State (5 Steps)
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [sampleForm, setSampleForm] = useState<Partial<FieldSampleCollection>>({
    propertyId: properties[0]?.id || '',
    fieldId: fields[0]?.id || '',
    crop: fields[0]?.currentCrop || 'Soja',
    date: new Date().toISOString().split('T')[0],
    time: '08:30',
    responsible: '',
    gpsPoint: { lat: -24.9560, lng: -53.4560 },
    sampleNumber: '',
    depth: '0-20 cm',
    sampleType: 'Planta Completa',
    quantityCollected: '',
    photos: {},
    selectedSymptoms: [],
    environmentalData: {
      soilMoisturePct: 0,
      temperatureC: 0,
      recentIrrigation: false,
      recentRainfallMm: 0,
      managementType: 'Plantio Direto',
      cropRotation: '',
    },
  });

  // Confirmed Diagnosis Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Laudo de Amostragem State
  const [labReports, setLabReports] = useState<SoilLabSamplingReport[]>(() => {
    try {
      const raw = localStorage.getItem('geaagro_soil_disease_lab_reports_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading lab reports', e);
    }
    return INITIAL_LAB_REPORTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('geaagro_soil_disease_lab_reports_v1', JSON.stringify(labReports));
    } catch (e) {
      console.error('Error saving lab reports', e);
    }
  }, [labReports]);

  const [selectedLabReport, setSelectedLabReport] = useState<SoilLabSamplingReport | null>(null);
  const [isLabReportModalOpen, setIsLabReportModalOpen] = useState<boolean>(false);
  const [labSearchTerm, setLabSearchTerm] = useState<string>('');
  const [labFilterRisk, setLabFilterRisk] = useState<string>('Todos');

  // Form for New Lab Report
  const [newLabReport, setNewLabReport] = useState<Partial<SoilLabSamplingReport>>({
    labProtocol: '',
    labName: '',
    propertyId: properties[0]?.id || '',
    propertyName: properties[0]?.farmName || '',
    fieldId: fields[0]?.id || '',
    fieldName: fields[0]?.name || '',
    sampleDate: new Date().toISOString().split('T')[0],
    reportDate: new Date().toISOString().split('T')[0],
    crop: fields[0]?.currentCrop || 'Soja',
    cultivar: fields[0]?.cultivar || '',
    agronomist: '',
    crea: '',
    labFileAttached: '',
    overallRiskLevel: 'Baixo',
    labInterpretation: '',
    controlRecommendations: {
      biological: [],
      cultural: [],
      chemical: [],
    },
  });

  // Reference Parameter Guide Modal state
  const [isReferenceGuideOpen, setIsReferenceGuideOpen] = useState(false);
  const [referenceGuideSearch, setReferenceGuideSearch] = useState('');
  const [referenceGuideCategory, setReferenceGuideCategory] = useState<'TODOS' | 'Nematoide' | 'Fungo' | 'Bactéria'>('TODOS');

  // Pathogens state inside modal
  const [modalPathogens, setModalPathogens] = useState<PathogenQuantification[]>([]);

  const handleOpenNewLabReportModal = (targetFieldId?: string, targetPropertyId?: string) => {
    const targetProp = properties.find((p) => p.id === targetPropertyId) || properties[0];
    const targetField = fields.find((f) => f.id === targetFieldId) || fields[0];

    setNewLabReport({
      labProtocol: `LAUDO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      labName: '',
      propertyId: targetProp?.id || '',
      propertyName: targetProp?.farmName || '',
      fieldId: targetField?.id || '',
      fieldName: targetField?.name || '',
      sampleDate: new Date().toISOString().split('T')[0],
      reportDate: new Date().toISOString().split('T')[0],
      crop: targetField?.currentCrop || 'Soja',
      cultivar: targetField?.cultivar || '',
      agronomist: '',
      crea: '',
      labFileAttached: '',
      overallRiskLevel: 'Baixo',
      labInterpretation: '',
      controlRecommendations: {
        biological: [],
        cultural: [],
        chemical: [],
      },
    });

    const defaultCatalog = STANDARD_PATHOGEN_CATALOG[0];
    if (defaultCatalog) {
      setModalPathogens([
        {
          id: `p-${Date.now()}`,
          catalogId: defaultCatalog.id,
          pathogenName: defaultCatalog.pathogenName,
          commonName: defaultCatalog.commonName,
          category: defaultCatalog.category,
          valueDetected: 0,
          unit: defaultCatalog.defaultUnit,
          thresholdLow: defaultCatalog.thresholdLow,
          thresholdHigh: defaultCatalog.thresholdHigh,
          referenceDescription: defaultCatalog.referenceDescription,
          managementNote: defaultCatalog.managementNote,
          riskLevel: 'Baixo',
        },
      ]);
    } else {
      setModalPathogens([]);
    }
    setIsLabReportModalOpen(true);
  };

  const handleSelectCatalogPathogen = (idx: number, catalogId: string) => {
    const updated = [...modalPathogens];
    if (catalogId === 'custom') {
      updated[idx] = {
        ...updated[idx],
        catalogId: 'custom',
        pathogenName: 'Novo Patógeno',
        commonName: 'Nome Popular',
        category: 'Nematoide',
        unit: 'Espécimes / 100cm³',
        thresholdLow: 100,
        thresholdHigh: 300,
        referenceDescription: 'Parâmetro de referência personalizado definido pelo laboratório.',
        managementNote: 'Consultar recomendação agronômica para a espécie.',
      };
    } else {
      const catalogItem = STANDARD_PATHOGEN_CATALOG.find((c) => c.id === catalogId);
      if (catalogItem) {
        const risk = calculatePathogenRisk(updated[idx].valueDetected, catalogItem);
        updated[idx] = {
          ...updated[idx],
          catalogId: catalogItem.id,
          pathogenName: catalogItem.pathogenName,
          commonName: catalogItem.commonName,
          category: catalogItem.category,
          unit: catalogItem.defaultUnit,
          thresholdLow: catalogItem.thresholdLow,
          thresholdHigh: catalogItem.thresholdHigh,
          referenceDescription: catalogItem.referenceDescription,
          managementNote: catalogItem.managementNote,
          riskLevel: risk,
        };
      }
    }
    setModalPathogens(updated);
  };

  const handleAddPathogenRow = () => {
    const existingIds = new Set(modalPathogens.map((p) => p.catalogId || p.pathogenName));
    const nextItem = STANDARD_PATHOGEN_CATALOG.find((c) => !existingIds.has(c.id)) || STANDARD_PATHOGEN_CATALOG[1] || STANDARD_PATHOGEN_CATALOG[0];

    const initialVal = nextItem.thresholdLow || 150;
    const newP: PathogenQuantification = {
      id: `p-${Date.now()}`,
      catalogId: nextItem.id,
      pathogenName: nextItem.pathogenName,
      commonName: nextItem.commonName,
      category: nextItem.category,
      valueDetected: initialVal,
      unit: nextItem.defaultUnit,
      thresholdLow: nextItem.thresholdLow,
      thresholdHigh: nextItem.thresholdHigh,
      referenceDescription: nextItem.referenceDescription,
      managementNote: nextItem.managementNote,
      riskLevel: calculatePathogenRisk(initialVal, nextItem),
    };
    setModalPathogens([...modalPathogens, newP]);
  };

  const handleRemovePathogenRow = (id: string) => {
    setModalPathogens(modalPathogens.filter((p) => p.id !== id));
  };

  const handleSaveLabReport = (e: React.FormEvent) => {
    e.preventDefault();
    const propObj = properties.find((p) => p.id === newLabReport.propertyId);
    const fieldObj = fields.find((f) => f.id === newLabReport.fieldId);

    // Calculate overall risk automatically based on all pathogens
    const hasCritical = modalPathogens.some((p) => p.riskLevel === 'Crítico');
    const hasHigh = modalPathogens.some((p) => p.riskLevel === 'Alto');
    const hasMedium = modalPathogens.some((p) => p.riskLevel === 'Médio');
    const calculatedOverall = hasCritical ? 'Crítico' : hasHigh ? 'Alto' : hasMedium ? 'Médio' : 'Baixo';

    const createdReport: SoilLabSamplingReport = {
      id: `laudo-${Date.now()}`,
      labProtocol: newLabReport.labProtocol || `LAUDO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      labName: newLabReport.labName || 'Laboratório Fitopatológico',
      propertyId: newLabReport.propertyId || properties[0]?.id || 'prop-01',
      propertyName: propObj?.farmName || 'Fazenda Principal',
      fieldId: newLabReport.fieldId || fields[0]?.id || 'fld-01',
      fieldName: fieldObj?.name || 'Talhão 01',
      sampleDate: newLabReport.sampleDate || new Date().toISOString().split('T')[0],
      reportDate: newLabReport.reportDate || new Date().toISOString().split('T')[0],
      crop: newLabReport.crop || 'Soja',
      cultivar: newLabReport.cultivar || 'Cultivar Registrada',
      agronomist: newLabReport.agronomist || 'Eng. Agrônomo',
      crea: newLabReport.crea || 'CREA-PR 12345/D',
      labFileAttached: newLabReport.labFileAttached || 'Laudo_Anexado.pdf',
      overallRiskLevel: calculatedOverall as 'Baixo' | 'Médio' | 'Alto' | 'Crítico',
      pathogens: modalPathogens,
      labInterpretation: newLabReport.labInterpretation || 'Análise de patógenos concluída com recomendações registradas.',
      controlRecommendations: newLabReport.controlRecommendations || {
        biological: ['Manejo biológico com Trichoderma harzianum'],
        cultural: ['Rotação de cultura com Crotalaria'],
        chemical: ['Tratamento de semente com nematicida quimico'],
      },
    };

    setLabReports([createdReport, ...labReports]);
    setIsLabReportModalOpen(false);
  };

  const handleDeleteLabReport = (id: string) => {
    if (confirm('Deseja realmente remover este laudo de amostragem?')) {
      setLabReports(labReports.filter((r) => r.id !== id));
      if (selectedLabReport?.id === id) {
        setSelectedLabReport(null);
      }
    }
  };
  const [occToConfirm, setOccToConfirm] = useState<SoilDiseaseOccurrence | null>(null);
  const [labForm, setLabForm] = useState({
    laboratory: 'Laboratório Central de Fitopatologia',
    result: 'Confirmada Infecção',
    pathogenIdentified: 'Fusarium tucumaniae',
    method: 'PCR' as DiagnosticMethod,
    reportNumber: `LAUDO-${Math.floor(10000 + Math.random() * 90000)}`,
    confirmationDate: new Date().toISOString().split('T')[0],
    notes: 'Laudo de laboratório anexado confirmando diagnóstico de triagem.',
  });

  // Chemical params state for soil analysis tab
  const [soilChem, setSoilChem] = useState<SoilChemicalParams>({
    phH2o: 5.3,
    phCacl2: 4.8,
    organicMatterGdm3: 21,
    organicMatterPct: 2.1,
    clayPct: 42,
    caCmolc: 1.8,
    mgCmolc: 0.9,
    alCmolc: 0.6,
    baseSaturationVpct: 52,
    aluminumSaturationMpct: 12,
    // Macronutrientes
    kCmolc: 0.22,
    pMgdm3: 14,
    sMgdm3: 8.5,
    // Micronutrientes
    bMgdm3: 0.24,
    cuMgdm3: 0.65,
    mnMgdm3: 3.8,
    znMgdm3: 1.2,
    feMgdm3: 18.0,
    siMgdm3: 4.5,
  });

  // Weather state
  const [weatherData, setWeatherData] = useState({
    tempC: 28,
    rainfallMm: 42,
    humidityPct: 84,
  });

  // Library Search & Filter
  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('TODOS');
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('TODOS');

  // Symptom Bank Filter
  const [symptomSearch, setSymptomSearch] = useState('');
  const [selectedOrganFilter, setSelectedOrganFilter] = useState<string>('TODOS');

  // Calculate IGSS
  const igssResult = calculateIgssScore({
    occurrencesCount: occurrences.length,
    highSeverityCount: occurrences.filter((o) => o.severity === 'Alta' || o.severity === 'Crítica').length,
    organicMatterGdm3: soilChem.organicMatterGdm3,
    phH2o: soilChem.phH2o,
    cropRotationHistoryCount: 3,
    usesBiologicals: true,
    hasGoodDrainage: true,
    tillageSystem: 'Plantio Direto',
  });

  // Pre-calculated metrics for dashboard
  const totalMonitoredFields = fields.length;
  const totalAffectedAreaHa = occurrences.reduce((acc, curr) => acc + curr.affectedAreaHa, 0);
  const activeOccurrencesCount = occurrences.filter((o) => o.status === 'Ativa' || o.status === 'Em Monitoramento').length;

  // Handlers
  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProp.farmName) return;
    const createdProp: SoilProperty = {
      id: `prop-${Date.now()}`,
      farmName: newProp.farmName || 'Fazenda GeaAgro',
      owner: newProp.owner || 'Produtor Rural',
      technicalResponsible: newProp.technicalResponsible || 'Eng. Agrônomo',
      crea: newProp.crea,
      municipality: newProp.municipality || 'Município',
      state: newProp.state || 'PR',
      gpsLatitude: newProp.gpsLatitude || -24.9555,
      gpsLongitude: newProp.gpsLongitude || -53.4552,
      totalAreaHa: newProp.totalAreaHa || 500,
      cultivatedAreaHa: newProp.cultivatedAreaHa || 400,
      notes: newProp.notes,
      createdAt: new Date().toISOString(),
    };
    setProperties([...properties, createdProp]);
    setIsPropertyModalOpen(false);
  };

  const handleCreateField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newField.name) return;
    const createdField: SoilField = {
      id: `fld-${Date.now()}`,
      propertyId: newField.propertyId || properties[0]?.id || 'prop-01',
      code: newField.code || 'T-00',
      name: newField.name,
      areaHa: newField.areaHa || 50,
      currentCrop: newField.currentCrop || 'Soja',
      cultivar: newField.cultivar || 'Padrão',
      season: newField.season || 'Safra 2025/2026',
      croppingSystem: newField.croppingSystem || 'Plantio Direto',
      soilType: newField.soilType || 'Latossolo Vermelho',
      texturalClass: newField.texturalClass || 'Argilosa',
      latitude: newField.latitude || -24.9560,
      longitude: newField.longitude || -53.4560,
      cropHistory: newField.cropHistory || ['Soja', 'Milho'],
    };
    setFields([...fields, createdField]);
    setIsFieldModalOpen(false);
  };

  const handleFinishCollectionWizard = () => {
    // Perform deterministic symptom matching
    const matched = matchDiseasesFromSymptoms(sampleForm.selectedSymptoms || [], sampleForm.crop);

    const targetField = fields.find((f) => f.id === sampleForm.fieldId) || fields[0];

    const newOcc: SoilDiseaseOccurrence = {
      id: `occ-${Date.now()}`,
      propertyId: sampleForm.propertyId || properties[0]?.id || 'prop-01',
      fieldId: sampleForm.fieldId || targetField.id,
      fieldName: targetField.name,
      crop: sampleForm.crop || targetField.currentCrop,
      cultivar: targetField.cultivar || 'Variedade Local',
      date: sampleForm.date || new Date().toISOString().split('T')[0],
      stage: 'TRIAGEM',
      severity: matched[0]?.confidence === 'Alta' ? 'Alta' : 'Média',
      affectedAreaHa: Math.round(targetField.areaHa * 0.12),
      incidencePct: matched[0]?.compatibilityScore ? Math.round(matched[0].compatibilityScore * 0.3) : 15,
      symptoms: sampleForm.selectedSymptoms || [],
      suspectedDiseases: matched,
      photos: sampleForm.photos || {},
      photoTimeline: [
        {
          id: `pt-${Date.now()}`,
          dayLabel: 'Dia 1',
          date: sampleForm.date || new Date().toISOString().split('T')[0],
          photoUrl: sampleForm.photos?.root || 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?auto=format&fit=crop&w=600&q=80',
          notes: 'Inspeção de campo inicial e coleta de amostras.',
          severityPct: 15,
        },
      ],
      status: 'Ativa',
      gpsPoint: sampleForm.gpsPoint || { lat: -24.9560, lng: -53.4560 },
    };

    setOccurrences([newOcc, ...occurrences]);
    setWizardStep(1);
    handleSubTabChange('triagem_diagnostico');
  };

  const handleConfirmDiagnosisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!occToConfirm) return;

    const updated = occurrences.map((occ) => {
      if (occ.id === occToConfirm.id) {
        return {
          ...occ,
          stage: 'DIAGNOSTICO_CONFIRMADO' as const,
          confirmedDiagnosis: {
            laboratory: labForm.laboratory,
            result: labForm.result,
            pathogenIdentified: labForm.pathogenIdentified,
            method: labForm.method,
            reportNumber: labForm.reportNumber,
            confirmationDate: labForm.confirmationDate,
            notes: labForm.notes,
          },
        };
      }
      return occ;
    });

    setOccurrences(updated);
    setIsConfirmModalOpen(false);
    setOccToConfirm(null);
  };

  const handleAddOrEditTimelinePhoto = (
    occId: string,
    photoId: string | null,
    dayLabel: string,
    photoUrl: string,
    notes: string,
    severityPct?: number
  ) => {
    const updated = occurrences.map((occ) => {
      if (occ.id === occId) {
        if (photoId) {
          // Editar foto existente
          const updatedTimeline = occ.photoTimeline.map((item) => {
            if (item.id === photoId) {
              return {
                ...item,
                dayLabel,
                photoUrl: photoUrl || item.photoUrl,
                notes: notes || item.notes,
                severityPct: severityPct ?? item.severityPct,
              };
            }
            return item;
          });
          return { ...occ, photoTimeline: updatedTimeline };
        } else {
          // Criar nova foto
          const newEntry = {
            id: `pt-${Date.now()}`,
            dayLabel,
            date: new Date().toISOString().split('T')[0],
            photoUrl: photoUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?auto=format&fit=crop&w=600&q=80',
            notes: notes || 'Acompanhamento do diário fotográfico.',
            severityPct: severityPct ?? Math.max(5, occ.incidencePct - 5),
          };
          return {
            ...occ,
            photoTimeline: [...occ.photoTimeline, newEntry],
          };
        }
      }
      return occ;
    });
    setOccurrences(updated);
    saveOccurrencesToStorage(updated);
  };

  const handleDeleteTimelinePhoto = (occId: string, photoId: string) => {
    if (!window.confirm('Tem certeza de que deseja remover esta foto do diário fotográfico?')) return;
    const updated = occurrences.map((occ) => {
      if (occ.id === occId) {
        return {
          ...occ,
          photoTimeline: occ.photoTimeline.filter((p) => p.id !== photoId),
        };
      }
      return occ;
    });
    setOccurrences(updated);
    saveOccurrencesToStorage(updated);
  };

  const handleOpenPhotoModal = (occId: string, currentTimelineLength: number) => {
    setSelectedOccForPhoto(occId);
    setEditingPhotoId(null);
    setPhotoDayLabel(`Dia ${currentTimelineLength * 7 + 1}`);
    setPhotoNotes('Acompanhamento visual da evolução de sintomas no talhão.');
    setPhotoSeverityPct(15);
    setPhotoPreviewUrl(null);
    setIsPhotoModalOpen(true);
  };

  const handleOpenEditPhotoModal = (
    occId: string,
    photoItem: { id: string; dayLabel: string; photoUrl: string; notes: string; severityPct: number }
  ) => {
    setSelectedOccForPhoto(occId);
    setEditingPhotoId(photoItem.id);
    setPhotoDayLabel(photoItem.dayLabel);
    setPhotoNotes(photoItem.notes);
    setPhotoSeverityPct(photoItem.severityPct);
    setPhotoPreviewUrl(photoItem.photoUrl);
    setIsPhotoModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhotoModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOccForPhoto) return;
    handleAddOrEditTimelinePhoto(
      selectedOccForPhoto,
      editingPhotoId,
      photoDayLabel || 'Nova Foto',
      photoPreviewUrl || '',
      photoNotes || 'Foto de acompanhamento',
      photoSeverityPct
    );
    setIsPhotoModalOpen(false);
  };

  // Filtered Library
  const filteredDiseases = NATIONAL_SOIL_DISEASES.filter((d) => {
    const matchesSearch =
      d.commonName.toLowerCase().includes(librarySearch.toLowerCase()) ||
      d.scientificName.toLowerCase().includes(librarySearch.toLowerCase());
    const matchesGroup = selectedGroupFilter === 'TODOS' || d.group === selectedGroupFilter;
    const matchesCrop = selectedCropFilter === 'TODOS' || d.hosts.includes(selectedCropFilter);
    return matchesSearch && matchesGroup && matchesCrop;
  });

  // Filtered Symptom Bank
  const filteredSymptoms = SOIL_SYMPTOMS_BANK.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(symptomSearch.toLowerCase()) ||
      s.description.toLowerCase().includes(symptomSearch.toLowerCase());
    const matchesOrgan = selectedOrganFilter === 'TODOS' || s.organ === selectedOrganFilter;
    return matchesSearch && matchesOrgan;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 p-3 sm:p-6 transition-colors">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2D5A27] via-[#3B7233] to-[#4E3629] rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden space-y-5">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 backdrop-blur-3xl skew-x-12 pointer-events-none" />
        
        {/* Top Section: Title & Description */}
        <div className="relative z-10 flex items-start sm:items-center gap-4">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner flex items-center justify-center shrink-0 relative">
            <Microscope className="w-8 h-8 text-emerald-300" />
            <Sprout className="w-4 h-4 text-emerald-100 absolute -bottom-1 -right-1 bg-[#2D5A27] rounded-full p-0.5 border border-emerald-400/40" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Doenças do Solo & Fitopatologia
            </h1>
            <p className="text-emerald-100/90 text-sm max-w-3xl mt-1 leading-relaxed">
              Plataforma para monitoramento, triagem de campo, diagnóstico laboratorial, biblioteca técnica e interpretação da sanidade do solo (IGSS).
            </p>
          </div>
        </div>

        {/* Bottom Section: Action Buttons */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleSubTabChange('coleta_amostras')}
            className="h-11 px-5 bg-white hover:bg-emerald-50 text-[#2D5A27] text-xs sm:text-sm font-black rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/80 active:scale-95"
          >
            <Plus className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Nova Inspeção de Campo</span>
          </button>
          <button
            onClick={() => handleSubTabChange('igss_calculadora')}
            className="h-11 px-5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs sm:text-sm font-extrabold rounded-xl border border-white/25 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Gauge className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>IGSS: {igssResult.overallScore}/100</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: DASHBOARD INICIAL */}
      {currentSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* MD3 Indicator Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block uppercase">Doenças Cadastradas</span>
              <div className="text-2xl font-black text-[#2D5A27] dark:text-emerald-400 mt-1">{NATIONAL_SOIL_DISEASES.length}</div>
              <span className="text-[10px] text-slate-400">Banco Nacional</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block uppercase">Talhões Monitorados</span>
              <div className="text-2xl font-black text-slate-800 dark:text-zinc-100 mt-1">{totalMonitoredFields}</div>
              <span className="text-[10px] text-slate-400">Talhões na Fazenda</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block uppercase">Área Afetada (ha)</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{totalAffectedAreaHa} ha</div>
              <span className="text-[10px] text-slate-400">Área sob vigilância</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block uppercase">Ocorrências Ativas</span>
              <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{activeOccurrencesCount}</div>
              <span className="text-[10px] text-slate-400">Em acompanhamento</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block uppercase">Última Inspeção</span>
              <div className="text-base font-bold text-slate-700 dark:text-zinc-200 mt-1.5">
                {occurrences[0]?.date ? new Date(occurrences[0].date).toLocaleDateString('pt-BR') : 'Hoje'}
              </div>
              <span className="text-[10px] text-slate-400">Coleta recente</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block uppercase">Alertas Climáticos</span>
              <div className="text-2xl font-black text-amber-500 mt-1">2 Favoráveis</div>
              <span className="text-[10px] text-slate-400">Risco em alta</span>
            </div>

            <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-xl p-4 shadow-md col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-emerald-200 block uppercase">Índice IGSS</span>
              <div className="text-2xl font-black text-emerald-300 mt-0.5">{igssResult.overallScore}/100</div>
              <span className="text-xs font-extrabold uppercase bg-emerald-700/60 text-emerald-100 px-2 py-0.5 rounded inline-block mt-1">
                {igssResult.classification}
              </span>
            </div>
          </div>

          {/* Graphical Analytics & Risk Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ocorrências Recentes e Triagem */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-600" />
                  Ocorrências e Triagens de Solo Recentes
                </h3>
                <button
                  onClick={() => handleSubTabChange('triagem_diagnostico')}
                  className="text-xs text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                >
                  Ver Todas ({occurrences.length}) →
                </button>
              </div>

              <div className="space-y-3">
                {occurrences.length === 0 ? (
                  <div className="border border-dashed border-slate-300 dark:border-zinc-800 rounded-xl p-8 text-center space-y-2">
                    <ShieldAlert className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-600 dark:text-zinc-400">Nenhuma ocorrência registrada</p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500">Inicie uma nova inspeção e coleta de amostra no campo para registrar ocorrências.</p>
                    <button
                      onClick={() => handleSubTabChange('coleta_amostras')}
                      className="mt-2 bg-[#2D5A27] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition hover:bg-[#23471f] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Nova Inspeção de Campo
                    </button>
                  </div>
                ) : (
                  occurrences.map((occ) => {
                    const disease = occ.suspectedDiseases[0];
                    return (
                      <div
                        key={occ.id}
                        onClick={() => setSelectedOccurrence(occ)}
                        className="border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 hover:bg-slate-50 dark:hover:bg-zinc-850 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={occ.photos.root || 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?auto=format&fit=crop&w=600&q=80'}
                            alt={occ.fieldName}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-zinc-100">{occ.fieldName}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  occ.stage === 'DIAGNOSTICO_CONFIRMADO'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                              >
                                {occ.stage === 'DIAGNOSTICO_CONFIRMADO' ? 'CONFIRMADO LAB' : 'TRIAGEM CAMPO'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium mt-0.5">
                              Suspeita: <strong className="text-slate-800 dark:text-zinc-100">{disease?.diseaseName || 'Murcha / Podridão'}</strong> ({disease?.compatibilityScore || 80}% compatibilidade)
                            </p>
                            <span className="text-[11px] text-slate-400 block mt-1">
                              {occ.crop} ({occ.cultivar}) • {occ.affectedAreaHa} ha afetados • Data: {new Date(occ.date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                              occ.severity === 'Alta' || occ.severity === 'Crítica'
                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {occ.severity}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Painel do Índice IGSS e Fatores de Risco */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-emerald-600" />
                Sanidade de Solo (IGSS)
              </h3>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-center">
                <div className="text-3xl font-black text-[#2D5A27] dark:text-emerald-400">{igssResult.overallScore} / 100</div>
                <div className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 uppercase mt-1">
                  Classificação: {igssResult.classification}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-2">
                  Avaliado com base em histórico sanitário, matéria orgânica, pH, rotação de culturas e uso de biológicos.
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-2">Recomendações Prioritárias:</span>
                <div className="space-y-2">
                  {igssResult.recommendations.map((rec, idx) => (
                    <div key={idx} className="text-xs bg-slate-50 dark:bg-zinc-800 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: LAUDO DE AMOSTRAGEM */}
      {currentSubTab === 'laudo_amostragem' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div>
              <h2 className="font-extrabold text-xl text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
                <FileCheck2 className="w-6 h-6 text-emerald-600" /> Laudos de Amostragem Laboratorial
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Análise de patógenos do solo, quantificação de nematóides e fungos com parâmetros de referência oficiais e prescrição de controle biológico e manejo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsReferenceGuideOpen(true)}
                className="bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-750 text-slate-800 dark:text-zinc-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 shadow-2xs transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-emerald-600" /> Catálogo & Parâmetros
              </button>
              <button
                type="button"
                onClick={() => handleOpenNewLabReportModal()}
                className="bg-[#2D5A27] hover:bg-[#23481f] text-white text-xs font-extrabold px-4.5 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4" /> Anexar Novo Laudo
              </button>
            </div>
          </div>

          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Total de Laudos</span>
              <div className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">{labReports.length}</div>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Laudos Registrados</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Nível Crítico / Alto</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {labReports.filter((r) => r.overallRiskLevel === 'Alto' || r.overallRiskLevel === 'Crítico').length}
              </div>
              <span className="text-[10px] text-rose-500 font-bold block mt-0.5">Exige Manejo Imediato</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Nematoides Detectados</span>
              <div className="text-2xl font-black text-[#2D5A27] dark:text-emerald-400 mt-1">
                {labReports.reduce((acc, r) => acc + r.pathogens.filter((p) => p.category === 'Nematoide').length, 0)}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Espécies Identificadas</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Fungos do Solo</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {labReports.reduce((acc, r) => acc + r.pathogens.filter((p) => p.category === 'Fungo').length, 0)}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Gêneros Mapeados</span>
            </div>
          </div>

          {/* Gráfico de Evolução Comparativa de Patógenos ao Longo do Tempo por Talhão */}
          <SoilPathogenEvolutionChart
            labReports={labReports}
            fields={fields}
            properties={properties}
            onAddNewReportForField={(fieldId, propertyId) => handleOpenNewLabReportModal(fieldId, propertyId)}
            onSelectReport={(report) => setSelectedLabReport(report)}
          />

          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por protocolo, fazenda, talhão ou patógeno..."
                value={labSearchTerm}
                onChange={(e) => setLabSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 shrink-0">Filtrar Risco:</span>
              <select
                value={labFilterRisk}
                onChange={(e) => setLabFilterRisk(e.target.value)}
                className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-zinc-200 cursor-pointer"
              >
                <option value="Todos">Todos os Riscos</option>
                <option value="Crítico">Crítico</option>
                <option value="Alto">Alto</option>
                <option value="Médio">Médio</option>
                <option value="Baixo">Baixo</option>
              </select>
            </div>
          </div>

          {/* List of Sampling Reports */}
          <div className="space-y-4">
            {labReports
              .filter((report) => {
                const matchesSearch =
                  report.labProtocol.toLowerCase().includes(labSearchTerm.toLowerCase()) ||
                  report.propertyName.toLowerCase().includes(labSearchTerm.toLowerCase()) ||
                  report.fieldName.toLowerCase().includes(labSearchTerm.toLowerCase()) ||
                  report.pathogens.some((p) => p.pathogenName.toLowerCase().includes(labSearchTerm.toLowerCase()));

                const matchesRisk = labFilterRisk === 'Todos' || report.overallRiskLevel === labFilterRisk;
                return matchesSearch && matchesRisk;
              }).length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border border-dashed border-slate-300 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 dark:text-zinc-200 text-sm">
                    {labReports.length === 0
                      ? 'Nenhum laudo de amostragem cadastrado'
                      : 'Nenhum laudo encontrado para os filtros selecionados'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                    {labReports.length === 0
                      ? 'Anexe os laudos laboratoriais das análises fitopatológicas e nematológicas de solo para quantificar patógenos e gerar recomendações de manejo.'
                      : 'Tente alterar os termos de busca ou remover o filtro de nível de risco.'}
                  </p>
                  {labReports.length === 0 && (
                    <button
                      type="button"
                      onClick={() => handleOpenNewLabReportModal()}
                      className="bg-[#2D5A27] hover:bg-[#23481f] text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Anexar Primeiro Laudo
                    </button>
                  )}
                </div>
              ) : (
                labReports
                  .filter((report) => {
                    const matchesSearch =
                      report.labProtocol.toLowerCase().includes(labSearchTerm.toLowerCase()) ||
                      report.propertyName.toLowerCase().includes(labSearchTerm.toLowerCase()) ||
                      report.fieldName.toLowerCase().includes(labSearchTerm.toLowerCase()) ||
                      report.pathogens.some((p) => p.pathogenName.toLowerCase().includes(labSearchTerm.toLowerCase()));

                    const matchesRisk = labFilterRisk === 'Todos' || report.overallRiskLevel === labFilterRisk;
                    return matchesSearch && matchesRisk;
                  })
                  .map((report) => (
                <div
                  key={report.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-800 transition space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <FileCheck2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            {report.labProtocol}
                          </span>
                          <span className="text-xs text-slate-400">• {report.labName}</span>
                        </div>
                        <h3 className="font-extrabold text-slate-900 dark:text-zinc-100 text-base mt-0.5">
                          {report.propertyName} — {report.fieldName}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Risco Global:</span>
                      <span
                        className={`text-xs font-black px-3 py-1 rounded-full border ${
                          report.overallRiskLevel === 'Crítico'
                            ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                            : report.overallRiskLevel === 'Alto'
                            ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                            : report.overallRiskLevel === 'Médio'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {report.overallRiskLevel}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-200/80 dark:border-zinc-700/80">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Data da Coleta:</span>
                      <strong className="text-slate-800 dark:text-zinc-200 font-bold">{report.sampleDate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Data do Laudo:</span>
                      <strong className="text-slate-800 dark:text-zinc-200 font-bold">{report.reportDate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Cultura / Cultivar:</span>
                      <strong className="text-slate-800 dark:text-zinc-200 font-bold">
                        {report.crop} ({report.cultivar})
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Resp. Técnico / CREA:</span>
                      <strong className="text-slate-800 dark:text-zinc-200 font-bold">
                        {report.agronomist} ({report.crea})
                      </strong>
                    </div>
                  </div>

                  {/* Quantified Pathogens Table */}
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 mb-2 flex items-center gap-1.5">
                      <Microscope className="w-4 h-4 text-emerald-600" />
                      Patógenos Quantificados & Parâmetros de Referência:
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-bold border-b border-slate-200 dark:border-zinc-700">
                          <tr>
                            <th className="p-2.5">Agente Patogênico</th>
                            <th className="p-2.5">Categoria</th>
                            <th className="p-2.5">Quantificação</th>
                            <th className="p-2.5">Parâmetro de Referência</th>
                            <th className="p-2.5">Risco</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300">
                          {report.pathogens.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40">
                              <td className="p-2.5">
                                <span className="font-bold text-slate-900 dark:text-zinc-100 block italic">
                                  {p.pathogenName}
                                </span>
                                <span className="text-[11px] text-slate-400">{p.commonName}</span>
                              </td>
                              <td className="p-2.5">
                                <span className="font-bold text-xs">{p.category}</span>
                              </td>
                              <td className="p-2.5">
                                <span className="font-black text-[#2D5A27] dark:text-emerald-400 text-sm">
                                  {p.valueDetected.toLocaleString('pt-BR')}
                                </span>{' '}
                                <span className="text-[11px] text-slate-500 font-medium block">{p.unit}</span>
                              </td>
                              <td className="p-2.5 max-w-xs">
                                <span className="text-[11px] text-slate-600 dark:text-zinc-400 block font-medium">
                                  {p.referenceDescription || 'Critério padrão estabelecido pelo laudo.'}
                                </span>
                              </td>
                              <td className="p-2.5">
                                <span
                                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-full inline-block ${
                                    p.riskLevel === 'Crítico'
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                      : p.riskLevel === 'Alto'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                      : p.riskLevel === 'Médio'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
                                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  }`}
                                >
                                  {p.riskLevel}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Lab Interpretation & Recommendations Summary */}
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 rounded-xl p-3.5 space-y-2">
                    <span className="text-xs font-black text-[#2D5A27] dark:text-emerald-300 block">
                      Parecer e Interpretação do Laboratório:
                    </span>
                    <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                      {report.labInterpretation}
                    </p>

                    {/* Controls Badges */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-emerald-200/50 dark:border-emerald-800/50 text-[11px]">
                      <div>
                        <span className="font-extrabold text-emerald-900 dark:text-emerald-300 block mb-1">
                          🌿 Controle Biológico:
                        </span>
                        <ul className="space-y-1 text-slate-700 dark:text-zinc-300">
                          {report.controlRecommendations.biological.map((bio, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{bio}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="font-extrabold text-emerald-900 dark:text-emerald-300 block mb-1">
                          🚜 Manejo Cultural / Rotação:
                        </span>
                        <ul className="space-y-1 text-slate-700 dark:text-zinc-300">
                          {report.controlRecommendations.cultural.map((cult, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{cult}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="font-extrabold text-emerald-900 dark:text-emerald-300 block mb-1">
                          🧪 Controle Químico / Sementes:
                        </span>
                        <ul className="space-y-1 text-slate-700 dark:text-zinc-300">
                          {report.controlRecommendations.chemical.map((chem, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{chem}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                    <div className="flex items-center gap-2">
                      {report.labFileAttached && (
                        <span className="text-xs text-slate-500 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Anexo: {report.labFileAttached}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedLabReport(report)}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-emerald-600" /> Visualizar Laudo Completo
                      </button>

                      <button
                        onClick={() => handleDeleteLabReport(report.id)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                        title="Remover Laudo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: INSPEÇÃO & COLETA DE AMOSTRAS (5 STEPS WIZARD) */}
      {currentSubTab === 'coleta_amostras' && (
        <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-md space-y-6">
          <div className="border-b border-slate-200 dark:border-zinc-800 pb-4">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-emerald-600" /> Fluxo de Coleta e Inspeção de Campo
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Registro padronizado de ocorrência para triagem de sintomas de doenças do solo.
            </p>

            {/* Stepper Header */}
            <div className="grid grid-cols-5 gap-2 mt-4">
              {[
                '1. Identificação',
                '2. Amostra GPS',
                '3. Fotos',
                '4. Sintomas',
                '5. Ambiente',
              ].map((stepLabel, idx) => {
                const stepNum = idx + 1;
                const isCurrent = wizardStep === stepNum;
                const isDone = wizardStep > stepNum;
                return (
                  <button
                    key={idx}
                    onClick={() => setWizardStep(stepNum)}
                    className={`text-xs font-bold py-2 rounded-lg text-center transition cursor-pointer ${
                      isCurrent
                        ? 'bg-[#2D5A27] text-white shadow'
                        : isDone
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'
                    }`}
                  >
                    {stepLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 1: IDENTIFICAÇÃO */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200 uppercase tracking-wider">Etapa 1 — Identificação da Ocorrência</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Propriedade</label>
                  <select
                    value={sampleForm.propertyId}
                    onChange={(e) => setSampleForm({ ...sampleForm, propertyId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.farmName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Talhão de Coleta</label>
                  <select
                    value={sampleForm.fieldId}
                    onChange={(e) => setSampleForm({ ...sampleForm, fieldId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                  >
                    {fields.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.code} - {f.name} ({f.currentCrop})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Cultura / Cultivar</label>
                  <input
                    type="text"
                    value={sampleForm.crop}
                    onChange={(e) => setSampleForm({ ...sampleForm, crop: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                    placeholder="Ex: Soja TMG 7063"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Responsável Técnico</label>
                  <input
                    type="text"
                    value={sampleForm.responsible}
                    onChange={(e) => setSampleForm({ ...sampleForm, responsible: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Data da Coleta</label>
                  <input
                    type="date"
                    value={sampleForm.date}
                    onChange={(e) => setSampleForm({ ...sampleForm, date: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Hora da Coleta</label>
                  <input
                    type="time"
                    value={sampleForm.time}
                    onChange={(e) => setSampleForm({ ...sampleForm, time: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LOCAL DA AMOSTRA */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200 uppercase tracking-wider">Etapa 2 — Local da Amostra & Ponto GPS</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Número da Amostra</label>
                  <input
                    type="text"
                    value={sampleForm.sampleNumber}
                    onChange={(e) => setSampleForm({ ...sampleForm, sampleNumber: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Profundidade de Coleta</label>
                  <select
                    value={sampleForm.depth}
                    onChange={(e) => setSampleForm({ ...sampleForm, depth: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                  >
                    <option value="0-20 cm">0 - 20 cm (Camada Superficial)</option>
                    <option value="20-40 cm">20 - 40 cm (Subsuperfície)</option>
                    <option value="0-40 cm">0 - 40 cm (Perfil Integrado)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Tipo de Amostra</label>
                  <select
                    value={sampleForm.sampleType}
                    onChange={(e) => setSampleForm({ ...sampleForm, sampleType: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                  >
                    <option value="Planta Completa">Planta Completa (Raiz + Colo + Haste)</option>
                    <option value="Sistema Radicular">Sistema Radicular + Solo de Rizosfera</option>
                    <option value="Colo / Hastes">Colo / Teclados da Base</option>
                    <option value="Solo">Solo Deformado</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Coordenadas GPS (Lat / Lng)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.0001"
                      value={sampleForm.gpsPoint?.lat}
                      onChange={(e) =>
                        setSampleForm({
                          ...sampleForm,
                          gpsPoint: { lat: parseFloat(e.target.value) || 0, lng: sampleForm.gpsPoint?.lng || 0 },
                        })
                      }
                      className="w-1/2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={sampleForm.gpsPoint?.lng}
                      onChange={(e) =>
                        setSampleForm({
                          ...sampleForm,
                          gpsPoint: { lat: sampleForm.gpsPoint?.lat || 0, lng: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-1/2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FOTOGRAFIAS */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200 uppercase tracking-wider">Etapa 3 — Fotografias dos Órgãos Afetados</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-2">Foto da Raiz</span>
                  <img
                    src={sampleForm.photos?.root || 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?auto=format&fit=crop&w=600&q=80'}
                    alt="Raiz"
                    className="w-full h-32 object-cover rounded-lg border border-slate-200 mb-2"
                  />
                  <input
                    type="text"
                    value={sampleForm.photos?.root}
                    onChange={(e) => setSampleForm({ ...sampleForm, photos: { ...sampleForm.photos, root: e.target.value } })}
                    className="w-full text-xs p-2 bg-slate-50 border rounded"
                    placeholder="URL ou arquivo de imagem"
                  />
                </div>

                <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-2">Foto do Colo/Caule</span>
                  <img
                    src={sampleForm.photos?.collar || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80'}
                    alt="Colo"
                    className="w-full h-32 object-cover rounded-lg border border-slate-200 mb-2"
                  />
                  <input
                    type="text"
                    value={sampleForm.photos?.collar}
                    onChange={(e) => setSampleForm({ ...sampleForm, photos: { ...sampleForm.photos, collar: e.target.value } })}
                    className="w-full text-xs p-2 bg-slate-50 border rounded"
                    placeholder="URL ou arquivo de imagem"
                  />
                </div>

                <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-2">Foto do Solo/Área</span>
                  <img
                    src={sampleForm.photos?.soil || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80'}
                    alt="Solo"
                    className="w-full h-32 object-cover rounded-lg border border-slate-200 mb-2"
                  />
                  <input
                    type="text"
                    value={sampleForm.photos?.soil}
                    onChange={(e) => setSampleForm({ ...sampleForm, photos: { ...sampleForm.photos, soil: e.target.value } })}
                    className="w-full text-xs p-2 bg-slate-50 border rounded"
                    placeholder="URL ou arquivo de imagem"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CHECKLIST DE SINTOMAS */}
          {wizardStep === 4 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200 uppercase tracking-wider">Etapa 4 — Checklist de Sintomas (150+ Sintomas)</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto p-2 border border-slate-200 rounded-xl">
                {SOIL_SYMPTOMS_BANK.map((symptom) => {
                  const isChecked = sampleForm.selectedSymptoms?.includes(symptom.name);
                  return (
                    <label
                      key={symptom.id}
                      className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 cursor-pointer transition ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold dark:bg-emerald-950 dark:text-emerald-200'
                          : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const current = sampleForm.selectedSymptoms || [];
                          if (e.target.checked) {
                            setSampleForm({ ...sampleForm, selectedSymptoms: [...current, symptom.name] });
                          } else {
                            setSampleForm({
                              ...sampleForm,
                              selectedSymptoms: current.filter((s) => s !== symptom.name),
                            });
                          }
                        }}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="block">{symptom.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{symptom.organ} • {symptom.description}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: CONDIÇÕES AMBIENTAIS */}
          {wizardStep === 5 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200 uppercase tracking-wider">Etapa 5 — Condições Ambientais e Manejo</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Umidade do Solo (%)</label>
                  <input
                    type="number"
                    value={sampleForm.environmentalData?.soilMoisturePct}
                    onChange={(e) =>
                      setSampleForm({
                        ...sampleForm,
                        environmentalData: {
                          ...sampleForm.environmentalData!,
                          soilMoisturePct: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Temperatura (°C)</label>
                  <input
                    type="number"
                    value={sampleForm.environmentalData?.temperatureC}
                    onChange={(e) =>
                      setSampleForm({
                        ...sampleForm,
                        environmentalData: {
                          ...sampleForm.environmentalData!,
                          temperatureC: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Chuva Recente Acumulada (mm)</label>
                  <input
                    type="number"
                    value={sampleForm.environmentalData?.recentRainfallMm}
                    onChange={(e) =>
                      setSampleForm({
                        ...sampleForm,
                        environmentalData: {
                          ...sampleForm.environmentalData!,
                          recentRainfallMm: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Sistema de Manejo</label>
                  <input
                    type="text"
                    value={sampleForm.environmentalData?.managementType}
                    onChange={(e) =>
                      setSampleForm({
                        ...sampleForm,
                        environmentalData: {
                          ...sampleForm.environmentalData!,
                          managementType: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg p-2.5 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex justify-between items-center border-t border-slate-200 dark:border-zinc-800 pt-4">
            <button
              disabled={wizardStep === 1}
              onClick={() => setWizardStep(wizardStep - 1)}
              className="bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 text-slate-700 dark:text-zinc-200 text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-50 cursor-pointer"
            >
              Voltar
            </button>

            {wizardStep < 5 ? (
              <button
                onClick={() => setWizardStep(wizardStep + 1)}
                className="bg-[#2D5A27] hover:bg-emerald-800 text-white text-xs font-bold px-5 py-2 rounded-lg cursor-pointer flex items-center gap-1"
              >
                Próximo Passo →
              </button>
            ) : (
              <button
                onClick={handleFinishCollectionWizard}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Finalizar & Executar Triagem
              </button>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: TRIAGEM & DIAGNÓSTICO CONFIRMADO */}
      {currentSubTab === 'triagem_diagnostico' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-lg text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-600" />
              Níveis de Diagnóstico: Triagem de Campo x Confirmação Laboratorial
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {occurrences.length === 0 ? (
                <div className="col-span-full border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl p-10 text-center space-y-2">
                  <ShieldAlert className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">Nenhum diagnóstico ou triagem para exibir</p>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">Realize a coleta e inspeção no talhão para registrar triagens de sintomas.</p>
                  <button
                    onClick={() => handleSubTabChange('coleta_amostras')}
                    className="mt-2 bg-[#2D5A27] text-white text-xs font-bold px-4 py-2 rounded-xl transition hover:bg-[#23471f] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Iniciar Coleta no Campo
                  </button>
                </div>
              ) : (
                occurrences.map((occ) => {
                const disease = occ.suspectedDiseases[0];
                return (
                  <div key={occ.id} className="border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3 bg-slate-50/50 dark:bg-zinc-850/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            occ.stage === 'DIAGNOSTICO_CONFIRMADO'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {occ.stage === 'DIAGNOSTICO_CONFIRMADO' ? 'DIAGNÓSTICO CONFIRMADO (LAB)' : 'TRIAGEM (CAMPO)'}
                        </span>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-zinc-100 mt-2">{occ.fieldName}</h3>
                        <p className="text-xs text-slate-500">{occ.crop} ({occ.cultivar}) • Data: {new Date(occ.date).toLocaleDateString('pt-BR')}</p>
                      </div>

                      <button
                        onClick={() => printSoilDiseaseReport(occ, properties[0], fields.find((f) => f.id === occ.fieldId))}
                        className="bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-700 transition cursor-pointer text-slate-700 dark:text-zinc-200"
                        title="Imprimir Laudo PDF"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Suspeita de Campo */}
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs">
                      <span className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Suspeita de Doença Compatível:</span>
                      <div className="text-sm font-extrabold text-[#2D5A27] dark:text-emerald-400">
                        {disease?.diseaseName || 'Murcha de Fusarium'}
                      </div>
                      <p className="text-[11px] text-slate-500 italic">Scientific: {disease?.scientificName || 'Fusarium spp.'}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          {disease?.compatibilityScore || 85}% Compatível
                        </span>
                        <span className="text-[11px] text-slate-500">Confiança: <strong>{disease?.confidence || 'Alta'}</strong></span>
                      </div>
                    </div>

                    {/* Detalhes de Confirmação se existir */}
                    {occ.confirmedDiagnosis ? (
                      <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 p-3 rounded-xl text-xs space-y-1">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 block">Laudo Laboratorial Confirmado:</span>
                        <p className="text-slate-700 dark:text-zinc-200">
                          <b>Lab:</b> {occ.confirmedDiagnosis.laboratory} | <b>Método:</b> {occ.confirmedDiagnosis.method}
                        </p>
                        <p className="text-slate-700 dark:text-zinc-200">
                          <b>Nº Laudo:</b> {occ.confirmedDiagnosis.reportNumber} | <b>Patógeno:</b> {occ.confirmedDiagnosis.pathogenIdentified}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setOccToConfirm(occ);
                          setIsConfirmModalOpen(true);
                        }}
                        className="w-full bg-[#2D5A27] hover:bg-emerald-800 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FlaskConical className="w-4 h-4" /> Registrar Diagnóstico Confirmado de Laboratório
                      </button>
                    )}
                  </div>
                );
              })
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: BIBLIOTECA NACIONAL DE DOENÇAS DO SOLO */}
      {currentSubTab === 'biblioteca' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-lg text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" /> Biblioteca Nacional de Doenças do Solo
                </h2>
                <p className="text-xs text-slate-500">
                  Banco técnico offline contendo patógenos de solo organizados por cultura e grupo.
                </p>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    placeholder="Buscar por nome comum ou científico..."
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs font-medium"
                  />
                </div>

                <select
                  value={selectedGroupFilter}
                  onChange={(e) => setSelectedGroupFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value="TODOS">Todos os Grupos</option>
                  <option value="Fungo">Fungo</option>
                  <option value="Bactéria">Bactéria</option>
                  <option value="Nematoide">Nematoide</option>
                  <option value="Oomiceto">Oomiceto</option>
                </select>
              </div>
            </div>

            {/* Disease Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDiseases.map((disease) => (
                <div
                  key={disease.id}
                  onClick={() => setSelectedDisease(disease)}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-40 bg-slate-100 dark:bg-zinc-800">
                      <img
                        src={disease.photos.root || disease.photos.adultPlant || 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?auto=format&fit=crop&w=600&q=80'}
                        alt={disease.commonName}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                        {disease.group}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-zinc-100">{disease.commonName}</h3>
                      <p className="text-xs text-slate-500 italic">{disease.scientificName}</p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {disease.hosts.map((host, idx) => (
                          <span key={idx} className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                            {host}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 mt-2">
                        {disease.technicalInfo.symptomsDescription}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-850 p-3 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <span>Ver Ficha Técnica Completa</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: BANCO DE SINTOMAS (150+) */}
      {currentSubTab === 'banco_sintomas' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-lg text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Search className="w-5 h-5 text-emerald-600" /> Banco de Sintomas por Órgão Afeccionado
                </h2>
                <p className="text-xs text-slate-500">Catálogo técnico de sintomas associados a patógenos de solo.</p>
              </div>

              <div className="flex items-center gap-2">
                {['TODOS', 'Raiz', 'Colo', 'Caule', 'Folha', 'Plântula'].map((organ) => (
                  <button
                    key={organ}
                    onClick={() => setSelectedOrganFilter(organ)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      selectedOrganFilter === organ
                        ? 'bg-[#2D5A27] text-white'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                    }`}
                  >
                    {organ}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSymptoms.map((symptom) => (
                <div key={symptom.id} className="border border-slate-200 dark:border-zinc-800 p-4 rounded-xl space-y-2 bg-slate-50/50 dark:bg-zinc-850/50">
                  <div className="flex justify-between items-start">
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded">
                      Órgão: {symptom.organ}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100">{symptom.name}</h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">{symptom.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 7: INTEGRAÇÃO SOLO, CLIMA E NUTRIÇÃO */}
      {currentSubTab === 'analise_clima' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Banner de Apresentação da Integração */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-850 to-teal-900 text-white p-5 rounded-2xl shadow-sm border border-emerald-800/80 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/20 backdrop-blur-md rounded-xl border border-emerald-400/30">
                <FlaskConical className="w-5 h-5 text-emerald-300" />
              </div>
              <h2 className="font-extrabold text-base text-emerald-50">
                Integração Agronômica: Solo, Clima & Nutrição (Macro e Micronutrientes)
              </h2>
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed max-w-4xl">
              Análise correlacional entre parâmetros físico-químicos, balanço nutricional de macronutrientes (N, P, K, Ca, Mg, S) e micronutrientes (B, Cu, Mn, Zn, Si) e microclima, determinando o nível de suscetibilidade radicular a fitopatógenos do solo.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Bloco 1: Análise do Solo (Química, Física e Nutricional) */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-emerald-600" />
                    Parâmetros Físico-Químicos e Nutricionais
                  </h3>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                    Análise do Solo
                  </span>
                </div>

                {/* Seção 1: Físico-Química Básico */}
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
                    1. Atributos Físico-Químicos Básicos
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1 h-4 flex items-center">
                        pH em H₂O
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={soilChem.phH2o}
                        onChange={(e) => setSoilChem({ ...soilChem, phH2o: parseFloat(e.target.value) || 0 })}
                        className="w-full h-9 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1 h-4 flex items-center truncate" title="Matéria Orgânica (g/dm³)">
                        M. Orgânica (g/dm³)
                      </label>
                      <input
                        type="number"
                        value={soilChem.organicMatterGdm3}
                        onChange={(e) => setSoilChem({ ...soilChem, organicMatterGdm3: parseFloat(e.target.value) || 0 })}
                        className="w-full h-9 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1 h-4 flex items-center">
                        Argila (%)
                      </label>
                      <input
                        type="number"
                        value={soilChem.clayPct}
                        onChange={(e) => setSoilChem({ ...soilChem, clayPct: parseFloat(e.target.value) || 0 })}
                        className="w-full h-9 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1 h-4 flex items-center truncate" title="Sat. por Alumínio (m%)">
                        Sat. Alumínio (m%)
                      </label>
                      <input
                        type="number"
                        value={soilChem.aluminumSaturationMpct}
                        onChange={(e) => setSoilChem({ ...soilChem, aluminumSaturationMpct: parseFloat(e.target.value) || 0 })}
                        className="w-full h-9 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção 2: Macronutrientes */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-extrabold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
                    2. Macronutrientes (cmolc/dm³ ou mg/dm³)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-1 h-4 flex items-center">
                        Ca (cmolc)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={soilChem.caCmolc}
                        onChange={(e) => setSoilChem({ ...soilChem, caCmolc: parseFloat(e.target.value) || 0 })}
                        className="w-full h-9 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-1 h-4 flex items-center">
                        Mg (cmolc)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={soilChem.mgCmolc}
                        onChange={(e) => setSoilChem({ ...soilChem, mgCmolc: parseFloat(e.target.value) || 0 })}
                        className="w-full h-9 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-1 h-4 flex items-center">
                        K (cmolc)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={soilChem.kCmolc ?? 0.22}
                        onChange={(e) => setSoilChem({ ...soilChem, kCmolc: parseFloat(e.target.value) || 0 })}
                        className="w-full h-9 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-1 h-4 flex items-center">
                        P (mg/dm³)
                      </label>
                      <input
                        type="number"
                        value={soilChem.pMgdm3 ?? 14}
                        onChange={(e) => setSoilChem({ ...soilChem, pMgdm3: parseFloat(e.target.value) || 0 })}
                        className="w-full h-9 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-1 h-4 flex items-center">
                        S (mg/dm³)
                      </label>
                      <input
                        type="number"
                        value={soilChem.sMgdm3 ?? 8.5}
                        onChange={(e) => setSoilChem({ ...soilChem, sMgdm3: parseFloat(e.target.value) || 0 })}
                        className="w-full h-9 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção 3: Micronutrientes & Silício */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-extrabold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
                    3. Micronutrientes & Benéficos (mg/dm³)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-1 h-4 flex items-center">
                        Boro (B)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={soilChem.bMgdm3 ?? 0.24}
                        onChange={(e) => setSoilChem({ ...soilChem, bMgdm3: parseFloat(e.target.value) || 0 })}
                        className="w-full h-9 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-1 h-4 flex items-center">
                        Manganês (Mn)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={soilChem.mnMgdm3 ?? 3.8}
                        onChange={(e) => setSoilChem({ ...soilChem, mnMgdm3: parseFloat(e.target.value) || 0 })}
                        className="w-full h-9 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-1 h-4 flex items-center">
                        Cobre (Cu)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={soilChem.cuMgdm3 ?? 0.65}
                        onChange={(e) => setSoilChem({ ...soilChem, cuMgdm3: parseFloat(e.target.value) || 0 })}
                        className="w-full h-9 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-1 h-4 flex items-center">
                        Zinco (Zn)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={soilChem.znMgdm3 ?? 1.2}
                        onChange={(e) => setSoilChem({ ...soilChem, znMgdm3: parseFloat(e.target.value) || 0 })}
                        className="w-full h-9 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-1 h-4 flex items-center">
                        Silício (Si)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={soilChem.siMgdm3 ?? 4.5}
                        onChange={(e) => setSoilChem({ ...soilChem, siMgdm3: parseFloat(e.target.value) || 0 })}
                        className="w-full h-9 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnóstico de Riscos Nutricionais e Químicos */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl space-y-2 mt-2">
                <span className="text-xs font-extrabold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" /> Diagnóstico de Riscos e Fatores Predisponentes do Solo:
                </span>
                <div className="space-y-1.5">
                  {interpretSoilPredisposingFactors(soilChem).map((factor, idx) => (
                    <p key={idx} className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed font-medium">
                      • {factor}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Bloco 2: Alertas de Risco Climático e Microclima */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-emerald-600" />
                    Condições Meteorológicas e Microclima
                  </h3>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
                    Estação de Campo
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1 h-4 flex items-center">
                      Temperatura (°C)
                    </label>
                    <input
                      type="number"
                      value={weatherData.tempC}
                      onChange={(e) => setWeatherData({ ...weatherData, tempC: parseFloat(e.target.value) || 0 })}
                      className="w-full h-9 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1 h-4 flex items-center truncate" title="Chuva Acumulada (mm)">
                      Chuva Acum. (mm)
                    </label>
                    <input
                      type="number"
                      value={weatherData.rainfallMm}
                      onChange={(e) => setWeatherData({ ...weatherData, rainfallMm: parseFloat(e.target.value) || 0 })}
                      className="w-full h-9 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1 h-4 flex items-center">
                      Umidade (%)
                    </label>
                    <input
                      type="number"
                      value={weatherData.humidityPct}
                      onChange={(e) => setWeatherData({ ...weatherData, humidityPct: parseFloat(e.target.value) || 0 })}
                      className="w-full h-9 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-extrabold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
                    Alertas Ativos de Risco Climático de Infeção
                  </span>

                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {calculateWeatherRiskAlerts(weatherData.tempC, weatherData.rainfallMm, weatherData.humidityPct)
                      .slice(0, 4)
                      .map((alert, idx) => (
                        <div key={idx} className="p-3 bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-2xl text-xs space-y-1.5 shadow-2xs">
                          <div className="font-extrabold text-red-900 dark:text-red-300 flex justify-between items-center">
                            <span className="text-xs">{alert.diseaseName}</span>
                            <span className="bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wide">
                              {alert.riskLevel}
                            </span>
                          </div>
                          {alert.reasons.map((r, rIdx) => (
                            <p key={rIdx} className="text-slate-700 dark:text-zinc-300 text-[11px] font-medium leading-relaxed">
                              • {r}
                            </p>
                          ))}
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl text-[11px] text-slate-600 dark:text-zinc-400">
                💡 <span className="font-bold">Diretriz Agronômica:</span> A saturação hídrica prolongada combinada com temperaturas na faixa de 22°C a 28°C estimula a zoosporogênese de oomicetos (*Pythium/Phytophthora*) e eclosão de juvenis de nematóides.
              </div>
            </div>
          </div>

          {/* CARD TÉCNICO EXPLICATIVO: INTEGRAÇÃO MACRO E MICRO NUTRIENTES X DOENÇAS */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-emerald-600" />
                  Mecanismos Fisiológicos: Relação Nutricional (Macro & Micro) x Fitossanidade
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Fundamentação científica de como a nutrição equilibrada ativa barreira mecânica e defesas bioquímicas radiculares.
                </p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full whitespace-nowrap">
                Fisiologia Vegetal Aplicada
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Pilar 1 */}
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-extrabold text-emerald-900 dark:text-emerald-300 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>1. Parede Celular & Lamela Média</span>
                </div>
                <div className="text-[11px] text-slate-700 dark:text-zinc-300 space-y-1.5 leading-relaxed">
                  <p>
                    <strong className="text-emerald-800 dark:text-emerald-400">Cálcio (Ca) & Boro (B):</strong> O Ca liga compostos de pectina formando pectatos de cálcio rígidos na lamela média.
                  </p>
                  <p>
                    Torna o tecido radicular resistente ao ataque de enzimas de maceramento (*poligalacturonases*) secretadas por <em className="italic">Pythium</em>, <em className="italic">Rhizoctonia</em> e <em className="italic">Fusarium</em>. A falta de Boro causa microfissuras celulares por onde nematoides penetram.
                  </p>
                </div>
              </div>

              {/* Pilar 2 */}
              <div className="p-4 bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-extrabold text-teal-900 dark:text-teal-300 text-xs">
                  <FlaskConical className="w-4 h-4 text-teal-600" />
                  <span>2. Lignificação & Fitoalexinas</span>
                </div>
                <div className="text-[11px] text-slate-700 dark:text-zinc-300 space-y-1.5 leading-relaxed">
                  <p>
                    <strong className="text-teal-800 dark:text-teal-400">Manganês (Mn), Cobre (Cu) & Enxofre (S):</strong> O Mn é cofator da rota dos fenilpropanoides para acúmulo de suberina e lignina na casca da raiz.
                  </p>
                  <p>
                    Cobre ativa a polifenoloxidase para cicatrização. Enxofre é precursor de aminoácidos sulfurados (cisteína/metionina) essenciais para a síntese de fitoalexinas fúngicas.
                  </p>
                </div>
              </div>

              {/* Pilar 3 */}
              <div className="p-4 bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-extrabold text-sky-900 dark:text-sky-300 text-xs">
                  <Bug className="w-4 h-4 text-sky-600" />
                  <span>3. Barreira Mecânica Amorfizada</span>
                </div>
                <div className="text-[11px] text-slate-700 dark:text-zinc-300 space-y-1.5 leading-relaxed">
                  <p>
                    <strong className="text-sky-800 dark:text-sky-400">Silício (Si):</strong> Acumula-se logo abaixo da epiderme e endoderme radicular formando uma camada polimerizada de sílica-celulose.
                  </p>
                  <p>
                    Esta barreira rígida gasta e bloqueia mecanicamente o estilete alimentador de nematoides das galhas e lesões (<em className="italic">Meloidogyne</em> e <em className="italic">Pratylenchus</em>) e hifas fúngicas.
                  </p>
                </div>
              </div>

              {/* Pilar 4 */}
              <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-extrabold text-amber-900 dark:text-amber-300 text-xs">
                  <Activity className="w-4 h-4 text-amber-600" />
                  <span>4. Exsudatos & Quimiotaxia</span>
                </div>
                <div className="text-[11px] text-slate-700 dark:text-zinc-300 space-y-1.5 leading-relaxed">
                  <p>
                    <strong className="text-amber-800 dark:text-amber-400">Potássio (K), Nitrogênio (N) & Mg:</strong> O equilíbrio da relação N/K previne o extravasamento de açúcares solúveis e aminoácidos.
                  </p>
                  <p>
                    Excesso de Nitrogênio associado a baixo Potássio altera a pressão osmótica radicular e atrai zooásporos de patógenos por quimiotaxia na rizosfera.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 8: DIÁRIO FOTOGRÁFICO INTELIGENTE */}
      {currentSubTab === 'diario_fotografico' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h2 className="font-bold text-lg text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" /> Diário Fotográfico de Evolução da Doença
            </h2>

            {occurrences.length === 0 ? (
              <div className="border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl p-10 text-center space-y-2">
                <Camera className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">Nenhum diário fotográfico ativo</p>
                <p className="text-xs text-slate-400 dark:text-zinc-500">Cadastre ocorrências de campo para iniciar o acompanhamento fotográfico temporal.</p>
                <button
                  onClick={() => handleSubTabChange('coleta_amostras')}
                  className="mt-2 bg-[#2D5A27] text-white text-xs font-bold px-4 py-2 rounded-xl transition hover:bg-[#23471f] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Nova Inspeção de Campo
                </button>
              </div>
            ) : (
              occurrences.map((occ) => (
                <div key={occ.id} className="border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3 bg-slate-50/40 dark:bg-zinc-850/40">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-zinc-100">{occ.fieldName}</h3>
                      <p className="text-xs text-slate-500">{occ.crop} • Evolução temporal de severidade</p>
                    </div>
                    <button
                      onClick={() => handleOpenPhotoModal(occ.id, occ.photoTimeline.length)}
                      className="bg-[#2D5A27] hover:bg-[#23471f] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-300" /> Adicionar Fotos
                    </button>
                  </div>

                  {/* Timeline Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {occ.photoTimeline.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-xs flex flex-col justify-between shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-800 transition"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5 border-b border-slate-100 dark:border-zinc-800 pb-1.5">
                            <span className="font-extrabold text-emerald-800 dark:text-emerald-300">
                              {item.dayLabel} ({new Date(item.date).toLocaleDateString('pt-BR')})
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditPhotoModal(occ.id, item)}
                                className="p-1 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                                title="Editar foto do diário"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTimelinePhoto(occ.id, item.id)}
                                className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition cursor-pointer"
                                title="Excluir foto do diário"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-900 mb-2">
                            <img
                              src={item.photoUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?auto=format&fit=crop&w=600&q=80'}
                              alt={item.dayLabel}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?auto=format&fit=crop&w=600&q=80';
                              }}
                              className="w-full h-32 object-cover"
                            />
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-zinc-300 font-medium leading-relaxed">
                            {item.notes}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 mt-2 flex justify-between items-center">
                          <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md">
                            Severidade: {item.severityPct}%
                          </span>
                          <div className="flex gap-1.5 text-[10px]">
                            <button
                              type="button"
                              onClick={() => handleOpenEditPhotoModal(occ.id, item)}
                              className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                            >
                              Editar
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteTimelinePhoto(occ.id, item.id)}
                              className="text-slate-400 hover:text-red-600 font-bold hover:underline cursor-pointer"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 9: MAPA INTELIGENTE OFFLINE */}
      {currentSubTab === 'mapa_offline' && (
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Mapa Inteligente de Ocorrências
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
              GPS Ativo
            </span>
          </div>

          {/* Canvas SIMULATED MAP DISPLAY */}
          <div className="relative w-full h-96 bg-emerald-950/90 rounded-2xl overflow-hidden border border-emerald-800 p-6 flex flex-col justify-between">
            {/* Grid Pattern overlay */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#2D5A27_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 flex justify-between items-start text-white text-xs">
              <div>
                <span className="font-bold text-emerald-300 block">Cascavel - PR (Fazenda Santa Maria)</span>
                <span className="text-[10px] text-slate-300">Modo Offline • Lat -24.9555, Lng -53.4552</span>
              </div>
              <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Ocorrência Alta / Crítica
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Ocorrência Média
                </div>
              </div>
            </div>

            {/* Simulated Pins */}
            {occurrences.length === 0 ? (
              <div className="relative z-10 text-center my-auto p-6 bg-black/40 backdrop-blur-md rounded-2xl max-w-sm mx-auto border border-emerald-500/20">
                <MapPin className="w-8 h-8 text-emerald-400/60 mx-auto mb-2" />
                <p className="text-xs font-bold text-emerald-100">Nenhum ponto de ocorrência com GPS registrado</p>
                <p className="text-[11px] text-emerald-300/70 mt-1">Conforme novas amostras e triagens forem cadastradas, os pontos com coordenadas aparecerão aqui.</p>
              </div>
            ) : (
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-6 my-auto">
                {occurrences.map((occ) => (
                  <div
                    key={occ.id}
                    onClick={() => setSelectedOccurrence(occ)}
                    className="bg-black/80 backdrop-blur-md border border-emerald-500/40 p-3 rounded-xl text-white hover:scale-105 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${occ.severity === 'Alta' ? 'bg-red-500 animate-pulse' : 'bg-amber-400'}`} />
                      <span className="font-bold text-xs text-emerald-200">{occ.fieldName}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      {occ.suspectedDiseases[0]?.diseaseName || 'Murcha de Fusarium'}
                    </p>
                    <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                      GPS: {occ.gpsPoint.lat}, {occ.gpsPoint.lng}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="relative z-10 text-[11px] text-emerald-200/80 text-center">
              Apenas dados vetoriais armazenados localmente no IndexedDB / LocalStorage. Não requer conexão com a internet.
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 10: CALCULADORA IGSS */}
      {currentSubTab === 'igss_calculadora' && (
        <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md space-y-6">
          <div className="border-b border-slate-200 dark:border-zinc-800 pb-4">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Gauge className="w-6 h-6 text-emerald-600" />
              Calculadora do Índice GeaAgro de Sanidade do Solo (IGSS)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Avaliação ponderada da saúde do solo considerando microbiologia, física, química e histórico sanitário.
            </p>
          </div>

          <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 p-6 rounded-2xl text-white text-center shadow-lg">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">Pontuação Atual do IGSS</span>
            <div className="text-5xl font-black text-emerald-200 my-2">{igssResult.overallScore} / 100</div>
            <span className="bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-extrabold uppercase">
              Classificação: {igssResult.classification}
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-zinc-300">
              Detalhamento dos 6 Eixos de Sanidade:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 flex justify-between items-center">
                <span>Histórico Sanitário de Patógenos</span>
                <strong className="text-emerald-700 dark:text-emerald-400 text-sm">{igssResult.breakdown.sanitaryHistoryScore} / 30 pts</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 flex justify-between items-center">
                <span>Teor de Matéria Orgânica</span>
                <strong className="text-emerald-700 dark:text-emerald-400 text-sm">{igssResult.breakdown.organicMatterScore} / 20 pts</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 flex justify-between items-center">
                <span>Equilíbrio Químico & pH</span>
                <strong className="text-emerald-700 dark:text-emerald-400 text-sm">{igssResult.breakdown.chemicalBalanceScore} / 15 pts</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 flex justify-between items-center">
                <span>Estrutura & Drenagem</span>
                <strong className="text-emerald-700 dark:text-emerald-400 text-sm">{igssResult.breakdown.drainageStructureScore} / 10 pts</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 flex justify-between items-center">
                <span>Diversidade & Rotação</span>
                <strong className="text-emerald-700 dark:text-emerald-400 text-sm">{igssResult.breakdown.cropDiversityScore} / 15 pts</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 flex justify-between items-center">
                <span>Uso de Bioinsumos Biológicos</span>
                <strong className="text-emerald-700 dark:text-emerald-400 text-sm">{igssResult.breakdown.managementBiologicalsScore} / 10 pts</strong>
              </div>
            </div>
          </div>

          {/* EXPLICAÇÃO DETALHADA DO CÁLCULO E METODOLOGIA DO IGSS */}
          <div className="p-5 bg-slate-50 dark:bg-zinc-850/80 border border-slate-200 dark:border-zinc-700/80 rounded-2xl space-y-4 text-xs">
            <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-zinc-100 text-sm border-b border-slate-200 dark:border-zinc-700 pb-3">
              <Info className="w-5 h-5 text-emerald-600" />
              <span>Como Funciona o Cálculo do Índice IGSS?</span>
            </div>

            <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
              O <strong>Índice GeaAgro de Sanidade do Solo (IGSS)</strong> é uma métrica agronômica ponderada (0 a 100 pontos) que quantifica o nível de <strong>supressividade biológica</strong> do solo contra patógenos radiculares (fungos de solo, oomicetos, bactérias e nematoides). O cálculo integra 6 eixos determinantes:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                <span className="font-extrabold text-emerald-800 dark:text-emerald-400 block">1. Histórico Sanitário (Até 30 pts)</span>
                <p className="text-[11px] text-slate-500">
                  Pontuação máxima inicial (30 pts). Penaliza -8 pts por ocorrência de severidade alta e -3 pts por registro de contaminação ativa no talhão.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                <span className="font-extrabold text-emerald-800 dark:text-emerald-400 block">2. Teor de Matéria Orgânica (Até 20 pts)</span>
                <p className="text-[11px] text-slate-500">
                  Mede a biomassa e o reservatório de microrganismos antagônicos. MO ≥ 35 g/dm³ = 20 pts; 25–34 g/dm³ = 16 pts; 18–24 g/dm³ = 12 pts; &lt; 12 g/dm³ = 5 pts.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                <span className="font-extrabold text-emerald-800 dark:text-emerald-400 block">3. Equilíbrio Químico & pH (Até 15 pts)</span>
                <p className="text-[11px] text-slate-500">
                  pH em H₂O ideal (6.0–6.8) confere 15 pts. Solos ácidos (&lt; 5.2 = 4 pts) estimulam estruturas de resistência de <i>Fusarium</i> e <i>Phytophthora</i>.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                <span className="font-extrabold text-emerald-800 dark:text-emerald-400 block">4. Diversidade & Rotação (Até 15 pts)</span>
                <p className="text-[11px] text-slate-500">
                  Avalia a quebra do ciclo de patógenos hospedeiros-específicos. Rotação com ≥ 4 culturas = 15 pts; 2–3 culturas = 10 pts; monocultivo = 5 pts.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                <span className="font-extrabold text-emerald-800 dark:text-emerald-400 block">5. Drenagem & Aerocidade (Até 10 pts)</span>
                <p className="text-[11px] text-slate-500">
                  Solo bem drenado e estruturado = 10 pts. Solos compactados com acúmulo de água livre = 3 pts (favorecem zoósporos flagelados de <i>Pythium</i>).
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                <span className="font-extrabold text-emerald-800 dark:text-emerald-400 block">6. Uso de Bioinsumos (Até 10 pts)</span>
                <p className="text-[11px] text-slate-500">
                  Aplicações regulares de <i>Trichoderma</i>, <i>Bacillus spp.</i> ou nematicidas microbiológicos conferem 10 pts (sem bioinsumos = 3 pts).
                </p>
              </div>
            </div>

            <div className="p-3 bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-1 mt-2">
              <span className="font-extrabold text-emerald-900 dark:text-emerald-300 block text-[11px]">
                Escala de Interpretação e Tomada de Decisão:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-700 dark:text-zinc-300 font-medium">
                <div className="bg-white dark:bg-zinc-900 p-2 rounded-lg border text-center">
                  <strong className="text-emerald-700 dark:text-emerald-400 block">85 - 100 pts</strong>
                  <span>Excelente (Supressivo)</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-2 rounded-lg border text-center">
                  <strong className="text-teal-700 dark:text-teal-400 block">70 - 84 pts</strong>
                  <span>Boa (Risco Baixo)</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-2 rounded-lg border text-center">
                  <strong className="text-amber-700 dark:text-amber-400 block">50 - 69 pts</strong>
                  <span>Atenção (Vulnerável)</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-2 rounded-lg border text-center">
                  <strong className="text-rose-700 dark:text-rose-400 block">&lt; 50 pts</strong>
                  <span>Alto Risco (Condutivo)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 11: RELATÓRIOS FITOSSANITÁRIOS PDF */}
      {currentSubTab === 'relatorios_backup' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="font-extrabold text-lg text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Emissão de Laudos & Relatórios Fitossanitários em PDF
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gere laudos técnicos oficiais com diagnóstico de campo, fotos geotagged, laudos de laboratório e recomendações técnicas para impressão ou compartilhamento em PDF.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Impressão PDF com Logotipo GeaAgro
                </span>
              </div>
            </div>

            {/* Grid de Ocorrências com Emissão de Laudo PDF */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                Ocorrências de Campo Prontas para Emissão de Laudo ({occurrences.length}):
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {occurrences.map((occ) => {
                  const disease = occ.suspectedDiseases[0];
                  const field = fields.find((f) => f.id === occ.fieldId);
                  const prop = properties[0];

                  return (
                    <div
                      key={occ.id}
                      className="p-4 bg-slate-50 dark:bg-zinc-850/60 border border-slate-200 dark:border-zinc-700/80 rounded-2xl flex flex-col justify-between gap-4 hover:border-emerald-500/50 transition shadow-2xs"
                    >
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between items-start">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                              occ.stage === 'DIAGNOSTICO_CONFIRMADO'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {occ.stage === 'DIAGNOSTICO_CONFIRMADO' ? 'Laudo Confirmado (Lab)' : 'Triagem de Campo'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {new Date(occ.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">{occ.fieldName}</h4>
                          <p className="text-slate-500 text-[11px]">
                            {occ.crop} ({occ.cultivar}) • Área Afetada: <strong>{occ.affectedAreaHa} ha</strong>
                          </p>
                        </div>

                        <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
                          <span className="text-[10px] text-slate-400 font-bold block">Patógeno Suspeito / Confirmado:</span>
                          <span className="font-bold text-emerald-800 dark:text-emerald-400">
                            {occ.confirmedDiagnosis?.pathogenIdentified || disease?.diseaseName || 'Murcha de Fusarium'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => printSoilDiseaseReport(occ, prop, field)}
                        className="w-full bg-[#2D5A27] hover:bg-[#23471f] text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                      >
                        <Printer className="w-4 h-4" /> Gerar & Imprimir Laudo Fitossanitário PDF
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FICHA TÉCNICA DA DOENÇA */}
      {selectedDisease && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                    Grupo: {selectedDisease.group}
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    📷 Fotos Reais (100% Offline)
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">{selectedDisease.commonName}</h2>
                <p className="text-xs text-slate-500 italic font-medium">{selectedDisease.scientificName}</p>
              </div>
              <button onClick={() => setSelectedDisease(null)} className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Offline Photo Gallery */}
            <div className="space-y-2">
              <span className="font-bold text-xs text-slate-800 dark:text-zinc-200 block">
                Galeria Fotográfica Técnica (Funcionamento Offline sem Internet):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {selectedDisease.photos.root && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 h-28">
                    <img src={selectedDisease.photos.root} alt="Sintomas em Raiz" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Raiz
                    </span>
                  </div>
                )}
                {selectedDisease.photos.collar && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 h-28">
                    <img src={selectedDisease.photos.collar} alt="Sintomas no Colo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Colo
                    </span>
                  </div>
                )}
                {(selectedDisease.photos.stem || selectedDisease.photos.adultPlant) && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 h-28">
                    <img src={selectedDisease.photos.stem || selectedDisease.photos.adultPlant} alt="Sintomas no Caule/Folha" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Caule / Folha
                    </span>
                  </div>
                )}
                {selectedDisease.photos.soil && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 h-28">
                    <img src={selectedDisease.photos.soil} alt="Sintomas no Solo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Solo / Rizosfera
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Etiologia Section */}
            {selectedDisease.technicalInfo.etiology && (
              <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-4 rounded-2xl space-y-2 text-xs">
                <span className="font-extrabold text-amber-900 dark:text-amber-300 block text-sm flex items-center gap-1.5">
                  <Microscope className="w-4 h-4 text-amber-600" /> Etiologia do Patógeno de Solo
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-zinc-300">
                  <div>
                    <span className="font-bold block text-slate-900 dark:text-zinc-100">Agente Causal & Classificação:</span>
                    <p>{selectedDisease.technicalInfo.etiology.agentType}</p>
                  </div>
                  <div>
                    <span className="font-bold block text-slate-900 dark:text-zinc-100">Estruturas de Reprodução:</span>
                    <p>{selectedDisease.technicalInfo.etiology.structures}</p>
                  </div>
                  <div>
                    <span className="font-bold block text-slate-900 dark:text-zinc-100">Faixa Térmica Ótima:</span>
                    <p>{selectedDisease.technicalInfo.etiology.thermalOptimum}</p>
                  </div>
                  <div>
                    <span className="font-bold block text-slate-900 dark:text-zinc-100">Mecanismo de Sobrevivência no Solo:</span>
                    <p>{selectedDisease.technicalInfo.etiology.survivalMechanism}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Hosts & Environmental Conditions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 bg-slate-50 dark:bg-zinc-850 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
                <span className="font-bold text-slate-800 dark:text-zinc-200 block">Culturas Hospedeiras Principais:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDisease.hosts.map((h, i) => (
                    <span key={i} className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 px-2.5 py-0.5 rounded-lg font-bold text-[11px]">
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 bg-slate-50 dark:bg-zinc-850 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
                <span className="font-bold text-slate-800 dark:text-zinc-200 block">Condições Favoráveis de Desenvolvimento:</span>
                <p className="text-slate-600 dark:text-zinc-400 space-y-1">
                  <span>Temp. Ideal: <b>{selectedDisease.technicalInfo.favorableConditions.tempIdeal}</b></span><br/>
                  <span>Umidade: <b>{selectedDisease.technicalInfo.favorableConditions.humidityIdeal}</b></span><br/>
                  <span>Faixa de pH: <b>{selectedDisease.technicalInfo.favorableConditions.phRange}</b></span>
                </p>
              </div>
            </div>

            {/* Descrição dos Sintomas */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-800 dark:text-zinc-200 block text-sm">
                Descrição Completa dos Sintomas:
              </span>
              <p className="text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-850 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 leading-relaxed font-medium">
                {selectedDisease.technicalInfo.symptomsDescription}
              </p>
            </div>

            {/* Manejo de Controle (Químico, Físico, Biológico, Cultural) */}
            <div className="space-y-3 pt-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 block">
                Estratégias Integradas de Manejo & Controle:
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Controle Químico */}
                <div className="bg-red-50/70 dark:bg-red-950/40 p-3.5 rounded-2xl border border-red-200 dark:border-red-900/60 space-y-1.5">
                  <span className="font-extrabold text-red-900 dark:text-red-300 flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-red-600" /> Controle Químico (Tratamento Sementes & Sulco)
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-zinc-300">
                    {(selectedDisease.technicalInfo.controls?.chemicalControl || selectedDisease.technicalInfo.chemicalManagement).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Controle Biológico */}
                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 space-y-1.5">
                  <span className="font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Leaf className="w-4 h-4 text-emerald-600" /> Controle Biológico & Bioinsumos
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-zinc-300">
                    {(selectedDisease.technicalInfo.controls?.biologicalControl || selectedDisease.technicalInfo.biologicalManagement).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Controle Físico */}
                <div className="bg-blue-50/70 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900/60 space-y-1.5">
                  <span className="font-extrabold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" /> Controle Físico (Solarização, Drenagem, Descompactação)
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-zinc-300">
                    {(selectedDisease.technicalInfo.controls?.physicalControl || ['Descompactação mecânica do solo e drenagem superficial.']).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Controle Cultural */}
                <div className="bg-amber-50/70 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/60 space-y-1.5">
                  <span className="font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Sprout className="w-4 h-4 text-amber-600" /> Controle Cultural & Manejo do Solo
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-zinc-300">
                    {(selectedDisease.technicalInfo.controls?.culturalControl || selectedDisease.technicalInfo.preventiveManagement).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DIAGNÓSTICO CONFIRMADO FORM */}
      {isConfirmModalOpen && occToConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleConfirmDiagnosisSubmit} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-emerald-600" />
                Registrar Laudo de Laboratório
              </h3>
              <button type="button" onClick={() => setIsConfirmModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Laboratório Oficial</label>
                <input
                  type="text"
                  required
                  value={labForm.laboratory}
                  onChange={(e) => setLabForm({ ...labForm, laboratory: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border p-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Patógeno Identificado</label>
                <input
                  type="text"
                  required
                  value={labForm.pathogenIdentified}
                  onChange={(e) => setLabForm({ ...labForm, pathogenIdentified: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border p-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Método Diagnóstico</label>
                  <select
                    value={labForm.method}
                    onChange={(e) => setLabForm({ ...labForm, method: e.target.value as DiagnosticMethod })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border p-2 rounded-lg"
                  >
                    <option value="PCR">PCR (Reação em Cadeia da Polimerase)</option>
                    <option value="Isolamento Microbiológico">Isolamento Microbiológico</option>
                    <option value="Microscopia Óptica">Microscopia Óptica</option>
                    <option value="Sorologia">Sorologia / ELISA</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Número do Laudo</label>
                  <input
                    type="text"
                    required
                    value={labForm.reportNumber}
                    onChange={(e) => setLabForm({ ...labForm, reportNumber: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border p-2 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 text-xs font-bold bg-slate-200 dark:bg-zinc-800 text-slate-700 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Salvar Diagnóstico
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CADASTRO PROPRIEDADE */}
      {isPropertyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateProperty} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-zinc-100">Nova Propriedade</h3>
              <button type="button" onClick={() => setIsPropertyModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Nome da Fazenda / Propriedade</label>
                <input
                  type="text"
                  required
                  value={newProp.farmName}
                  onChange={(e) => setNewProp({ ...newProp, farmName: e.target.value })}
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Proprietário</label>
                <input
                  type="text"
                  required
                  value={newProp.owner}
                  onChange={(e) => setNewProp({ ...newProp, owner: e.target.value })}
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Município</label>
                  <input
                    type="text"
                    value={newProp.municipality}
                    onChange={(e) => setNewProp({ ...newProp, municipality: e.target.value })}
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Estado (UF)</label>
                  <input
                    type="text"
                    value={newProp.state}
                    onChange={(e) => setNewProp({ ...newProp, state: e.target.value })}
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={() => setIsPropertyModalOpen(false)} className="px-4 py-2 text-xs font-bold bg-slate-200 rounded-lg">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg">
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CADASTRO TALHÃO */}
      {isFieldModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateField} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-zinc-100">Novo Talhão</h3>
              <button type="button" onClick={() => setIsFieldModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold mb-1">Código</label>
                  <input
                    type="text"
                    required
                    value={newField.code}
                    onChange={(e) => setNewField({ ...newField, code: e.target.value })}
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold mb-1">Nome do Talhão</label>
                  <input
                    type="text"
                    required
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Área (ha)</label>
                  <input
                    type="number"
                    required
                    value={newField.areaHa}
                    onChange={(e) => setNewField({ ...newField, areaHa: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Cultura Atual</label>
                  <input
                    type="text"
                    required
                    value={newField.currentCrop}
                    onChange={(e) => setNewField({ ...newField, currentCrop: e.target.value })}
                    className="w-full bg-slate-50 border p-2 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={() => setIsFieldModalOpen(false)} className="px-4 py-2 text-xs font-bold bg-slate-200 rounded-lg">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg">
                Salvar Talhão
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADICIONAR FOTO DE ACOMPANHAMENTO DA DOENÇA */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                {editingPhotoId ? 'Editar Foto no Diário de Evolução' : 'Adicionar Foto ao Diário de Evolução'}
              </h3>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePhotoModal} className="space-y-4 text-xs">
              {/* Inputs Ocultos para Câmera e Galeria de Arquivos */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageFileChange}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFileChange}
              />

              {/* Botões Principais de Seleção: Câmera x Galeria */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-zinc-300">
                  Capturar / Selecionar Foto:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-emerald-900 dark:text-emerald-300 font-extrabold cursor-pointer transition shadow-2xs"
                  >
                    <Camera className="w-6 h-6 text-emerald-600" />
                    <span>Usar Câmera do Dispositivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="p-3.5 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-800 dark:text-zinc-200 font-extrabold cursor-pointer transition shadow-2xs"
                  >
                    <Upload className="w-6 h-6 text-emerald-600" />
                    <span>Escolher da Galeria de Fotos</span>
                  </button>
                </div>
              </div>

              {/* Preview da Imagem Selecionada */}
              {photoPreviewUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-900">
                  <img
                    src={photoPreviewUrl}
                    alt="Preview de campo"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoPreviewUrl(null)}
                    className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-black transition cursor-pointer"
                    title="Remover Imagem"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-2xl text-center text-slate-400 bg-slate-50/50 dark:bg-zinc-850/50">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Nenhuma foto anexada ainda.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Clique em um dos botões acima para tirar uma foto ou escolher da galeria.</p>
                </div>
              )}

              {/* Campos do Formulário */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Rótulo do Período:
                  </label>
                  <input
                    type="text"
                    required
                    value={photoDayLabel}
                    onChange={(e) => setPhotoDayLabel(e.target.value)}
                    placeholder="Ex: Dia 1, Dia 7..."
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-2.5 rounded-xl text-slate-900 dark:text-zinc-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Severidade Estimada (%):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={photoSeverityPct}
                    onChange={(e) => setPhotoSeverityPct(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-2.5 rounded-xl text-slate-900 dark:text-zinc-100 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Observações de Campo:
                </label>
                <textarea
                  rows={2}
                  value={photoNotes}
                  onChange={(e) => setPhotoNotes(e.target.value)}
                  placeholder="Sintomas observados nas raízes, colo da planta, murcha foliar..."
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-2.5 rounded-xl text-slate-900 dark:text-zinc-100 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-[#2D5A27] hover:bg-[#23471f] text-white rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Salvar no Diário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CADASTRAR / ANEXAR NOVO LAUDO DE AMOSTRAGEM */}
      {isLabReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-zinc-100 text-lg flex items-center gap-2">
                <FileCheck2 className="w-6 h-6 text-emerald-600" />
                Anexar Laudo de Amostragem Laboratorial (Doenças do Solo)
              </h3>
              <button
                type="button"
                onClick={() => setIsLabReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLabReport} className="space-y-4 text-xs">
              {/* Header Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Nome do Laboratório / Entidade:
                  </label>
                  <input
                    type="text"
                    required
                    value={newLabReport.labName}
                    onChange={(e) => setNewLabReport({ ...newLabReport, labName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-2.5 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Nº do Laudo / Protocolo:
                  </label>
                  <input
                    type="text"
                    required
                    value={newLabReport.labProtocol}
                    onChange={(e) => setNewLabReport({ ...newLabReport, labProtocol: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-2.5 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Property & Field */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Propriedade / Fazenda:
                  </label>
                  <select
                    value={newLabReport.propertyId}
                    onChange={(e) => setNewLabReport({ ...newLabReport, propertyId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-2.5 rounded-xl font-medium cursor-pointer"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.farmName} — {p.municipality}/{p.state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Talhão / Unidade de Manejo:
                  </label>
                  <select
                    value={newLabReport.fieldId}
                    onChange={(e) => setNewLabReport({ ...newLabReport, fieldId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-2.5 rounded-xl font-medium cursor-pointer"
                  >
                    {fields
                      .filter((f) => f.propertyId === newLabReport.propertyId)
                      .map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.code} - {f.name} ({f.areaHa} ha)
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Dates & Crop */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Data da Coleta:
                  </label>
                  <input
                    type="date"
                    required
                    value={newLabReport.sampleDate}
                    onChange={(e) => setNewLabReport({ ...newLabReport, sampleDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-2.5 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Data do Laudo:
                  </label>
                  <input
                    type="date"
                    required
                    value={newLabReport.reportDate}
                    onChange={(e) => setNewLabReport({ ...newLabReport, reportDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-2.5 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Cultura:
                  </label>
                  <input
                    type="text"
                    required
                    value={newLabReport.crop}
                    onChange={(e) => setNewLabReport({ ...newLabReport, crop: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-2.5 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Cultivar / Variedade:
                  </label>
                  <input
                    type="text"
                    value={newLabReport.cultivar}
                    onChange={(e) => setNewLabReport({ ...newLabReport, cultivar: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-2.5 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Responsável & Arquivo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Responsável Técnico:
                  </label>
                  <input
                    type="text"
                    value={newLabReport.agronomist}
                    onChange={(e) => setNewLabReport({ ...newLabReport, agronomist: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-2.5 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Registro CREA:
                  </label>
                  <input
                    type="text"
                    value={newLabReport.crea}
                    onChange={(e) => setNewLabReport({ ...newLabReport, crea: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-2.5 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Nome do Arquivo PDF (Anexo):
                  </label>
                  <input
                    type="text"
                    value={newLabReport.labFileAttached}
                    onChange={(e) => setNewLabReport({ ...newLabReport, labFileAttached: e.target.value })}
                    placeholder="Ex: Laudo_Analise_Solo_T01.pdf"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-2.5 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Dynamic Pathogens Quantified Table */}
              <div className="border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-850/50 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <span className="font-extrabold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 text-sm">
                      <Microscope className="w-4 h-4 text-emerald-600" />
                      Patógenos Identificados & Quantificados:
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Selecione a espécie da lista padronizada para carregar parâmetros de referência e calcular o risco automaticamente.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPathogenRow}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Patógeno
                  </button>
                </div>

                <div className="space-y-3">
                  {modalPathogens.map((p, idx) => {
                    const catalogItem = STANDARD_PATHOGEN_CATALOG.find((c) => c.id === p.catalogId || c.pathogenName === p.pathogenName);
                    const isCustom = p.catalogId === 'custom' || (!catalogItem && p.catalogId !== undefined);

                    return (
                      <div
                        key={p.id}
                        className="bg-white dark:bg-zinc-850 p-4 rounded-2xl border border-slate-200 dark:border-zinc-750 space-y-3 shadow-2xs"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                          {/* Pathogen Selection */}
                          <div className="sm:col-span-5">
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1">
                              Patógeno Padronizado (Catálogo):
                            </label>
                            <select
                              value={p.catalogId || catalogItem?.id || 'custom'}
                              onChange={(e) => handleSelectCatalogPathogen(idx, e.target.value)}
                              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 p-2 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-100 cursor-pointer focus:ring-2 focus:ring-emerald-500"
                            >
                              <optgroup label="🪱 Nematoides do Solo">
                                {STANDARD_PATHOGEN_CATALOG.filter((c) => c.category === 'Nematoide').map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.pathogenName} — {item.commonName}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="🍄 Fungos e Oomicetos Radiculares">
                                {STANDARD_PATHOGEN_CATALOG.filter((c) => c.category === 'Fungo').map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.pathogenName} — {item.commonName}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="🦠 Bactérias do Solo">
                                {STANDARD_PATHOGEN_CATALOG.filter((c) => c.category === 'Bactéria').map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.pathogenName} — {item.commonName}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="✏️ Personalizado">
                                <option value="custom">✏️ Outro Patógeno / Inserir Manualmente</option>
                              </optgroup>
                            </select>

                            {/* Custom inputs if chosen */}
                            {isCustom && (
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Nome científico..."
                                  value={p.pathogenName}
                                  onChange={(e) => {
                                    const updated = [...modalPathogens];
                                    updated[idx].pathogenName = e.target.value;
                                    setModalPathogens(updated);
                                  }}
                                  className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 p-1.5 rounded-lg text-xs font-bold italic"
                                />
                                <input
                                  type="text"
                                  placeholder="Nome popular..."
                                  value={p.commonName || ''}
                                  onChange={(e) => {
                                    const updated = [...modalPathogens];
                                    updated[idx].commonName = e.target.value;
                                    setModalPathogens(updated);
                                  }}
                                  className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 p-1.5 rounded-lg text-xs"
                                />
                              </div>
                            )}
                          </div>

                          {/* Category Badge / Selector */}
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1">
                              Categoria:
                            </label>
                            {isCustom ? (
                              <select
                                value={p.category}
                                onChange={(e) => {
                                  const updated = [...modalPathogens];
                                  updated[idx].category = e.target.value as 'Fungo' | 'Nematoide' | 'Bactéria';
                                  setModalPathogens(updated);
                                }}
                                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 p-2 rounded-xl text-xs font-bold"
                              >
                                <option value="Nematoide">Nematoide</option>
                                <option value="Fungo">Fungo</option>
                                <option value="Bactéria">Bactéria</option>
                              </select>
                            ) : (
                              <div className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    p.category === 'Nematoide'
                                      ? 'bg-amber-500'
                                      : p.category === 'Fungo'
                                      ? 'bg-emerald-500'
                                      : 'bg-indigo-500'
                                  }`}
                                />
                                {p.category}
                              </div>
                            )}
                          </div>

                          {/* Value Detected */}
                          <div className="sm:col-span-3">
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1">
                              Quant. Detectada:
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                value={p.valueDetected}
                                onChange={(e) => {
                                  const updated = [...modalPathogens];
                                  const val = parseFloat(e.target.value) || 0;
                                  updated[idx].valueDetected = val;

                                  // Auto recalculate risk strictly based on catalog reference parameters
                                  const item = STANDARD_PATHOGEN_CATALOG.find((c) => c.id === p.catalogId || c.pathogenName === p.pathogenName);
                                  updated[idx].riskLevel = calculatePathogenRisk(val, item);

                                  setModalPathogens(updated);
                                }}
                                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 p-2 rounded-xl text-xs font-black text-[#2D5A27] dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                              <span className="block text-[10px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5 truncate">
                                {p.unit}
                              </span>
                            </div>
                          </div>

                          {/* Risk Level (Automatic Based on Reference Parameters) */}
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
                              <span>Classificação:</span>
                              <span className="text-[9px] font-extrabold uppercase px-1 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded">
                                Auto
                              </span>
                            </label>
                            <div className="flex items-center gap-1.5">
                              <div
                                className={`w-full py-2 px-2.5 rounded-xl text-xs font-black border flex items-center justify-center gap-1.5 shadow-2xs select-none transition ${
                                  p.riskLevel === 'Crítico'
                                    ? 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/70 dark:border-rose-800 dark:text-rose-300'
                                    : p.riskLevel === 'Alto'
                                    ? 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/70 dark:border-amber-800 dark:text-amber-300'
                                    : p.riskLevel === 'Médio'
                                    ? 'bg-yellow-50 border-yellow-300 text-yellow-800 dark:bg-yellow-950/70 dark:border-yellow-800 dark:text-yellow-300'
                                    : 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/70 dark:border-emerald-800 dark:text-emerald-300'
                                }`}
                                title={`Classificação calculada automaticamente com base nos parâmetros oficiais: ${p.referenceDescription || 'Faixa de risco fitossanitário'}`}
                              >
                                <span className="text-xs">
                                  {p.riskLevel === 'Crítico'
                                    ? '🔴'
                                    : p.riskLevel === 'Alto'
                                    ? '🟠'
                                    : p.riskLevel === 'Médio'
                                    ? '🟡'
                                    : '🟢'}
                                </span>
                                <span>{p.riskLevel}</span>
                              </div>

                              {modalPathogens.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemovePathogenRow(p.id)}
                                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl cursor-pointer transition shrink-0"
                                  title="Remover Patógeno"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Reference Parameter & Recommended Management Guidelines */}
                        {(p.referenceDescription || p.managementNote) && (
                          <div className="bg-slate-50 dark:bg-zinc-900/70 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-[11px] space-y-1.5">
                            {p.referenceDescription && (
                              <div className="flex items-start gap-2 text-slate-700 dark:text-zinc-300">
                                <span className="font-extrabold text-[#2D5A27] dark:text-emerald-400 shrink-0">
                                  📊 Parâmetro de Referência:
                                </span>
                                <span>{p.referenceDescription}</span>
                              </div>
                            )}
                            {p.managementNote && (
                              <div className="flex items-start gap-2 text-slate-600 dark:text-zinc-400">
                                <span className="font-bold text-amber-700 dark:text-amber-400 shrink-0">
                                  💡 Diretriz de Manejo:
                                </span>
                                <span>{p.managementNote}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lab Interpretation */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Parecer e Interpretação Técnica do Laboratório:
                </label>
                <textarea
                  rows={2}
                  value={newLabReport.labInterpretation}
                  onChange={(e) => setNewLabReport({ ...newLabReport, labInterpretation: e.target.value })}
                  placeholder="Descreva as conclusões do laudo..."
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-2.5 rounded-xl font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsLabReportModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-[#2D5A27] hover:bg-[#23471f] text-white rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Salvar Laudo no Sistema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VISUALIZAR LAUDO COMPLETO E IMPRESSÃO */}
      {selectedLabReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <FileCheck2 className="w-7 h-7 text-emerald-700 dark:text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                    {selectedLabReport.labProtocol}
                  </span>
                  <h2 className="font-black text-xl text-slate-900 dark:text-zinc-100 mt-1">
                    Laudo Fitopatológico & Nematológico de Solo
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{selectedLabReport.labName}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLabReport(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Document Body */}
            <div className="space-y-5 text-xs">
              {/* Properties Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700">
                <div>
                  <span className="text-slate-400 block text-[11px] font-bold">Propriedade:</span>
                  <strong className="text-slate-900 dark:text-zinc-100 font-extrabold text-sm">{selectedLabReport.propertyName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-bold">Talhão:</span>
                  <strong className="text-slate-900 dark:text-zinc-100 font-extrabold text-sm">{selectedLabReport.fieldName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-bold">Cultura / Cultivar:</span>
                  <strong className="text-slate-900 dark:text-zinc-100 font-bold">{selectedLabReport.crop} ({selectedLabReport.cultivar})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-bold">Data de Emissão:</span>
                  <strong className="text-slate-900 dark:text-zinc-100 font-bold">{selectedLabReport.reportDate}</strong>
                </div>
              </div>

              {/* Pathogens Table */}
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-zinc-100 text-sm mb-2 flex items-center gap-2">
                  <Microscope className="w-4 h-4 text-emerald-600" /> Resultados Analíticos de Laboratório & Parâmetros
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-extrabold border-b border-slate-200 dark:border-zinc-700">
                      <tr>
                        <th className="p-3">Agente Patogênico</th>
                        <th className="p-3">Categoria</th>
                        <th className="p-3">Quantidade Detectada</th>
                        <th className="p-3">Parâmetro de Referência</th>
                        <th className="p-3">Classificação de Risco</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {selectedLabReport.pathogens.map((p) => (
                        <tr key={p.id}>
                          <td className="p-3">
                            <span className="font-extrabold italic text-slate-900 dark:text-zinc-100 block">{p.pathogenName}</span>
                            <span className="text-[11px] text-slate-400">{p.commonName}</span>
                          </td>
                          <td className="p-3 font-bold text-slate-700 dark:text-zinc-300">{p.category}</td>
                          <td className="p-3">
                            <span className="font-black text-emerald-700 dark:text-emerald-400 text-base">
                              {p.valueDetected.toLocaleString('pt-BR')}
                            </span>{' '}
                            <span className="text-slate-500 font-medium block text-[11px]">{p.unit}</span>
                          </td>
                          <td className="p-3 max-w-xs">
                            <span className="text-[11px] text-slate-600 dark:text-zinc-400 block font-medium">
                              {p.referenceDescription || 'Faixa de risco padrão da literatura agronômica.'}
                            </span>
                            {p.managementNote && (
                              <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-semibold mt-0.5">
                                💡 {p.managementNote}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <span
                              className={`font-black px-3 py-1 rounded-full text-xs border inline-block ${
                                p.riskLevel === 'Crítico'
                                  ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                                  : p.riskLevel === 'Alto'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                                  : p.riskLevel === 'Médio'
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {p.riskLevel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lab Interpretation */}
              <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-1">
                <span className="font-black text-[#2D5A27] dark:text-emerald-400 text-xs block">
                  Parecer Técnico e Interpretação Agronômica:
                </span>
                <p className="text-slate-700 dark:text-zinc-300 leading-relaxed text-xs">
                  {selectedLabReport.labInterpretation}
                </p>
              </div>

              {/* Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-3.5 rounded-2xl space-y-2">
                  <span className="font-extrabold text-emerald-900 dark:text-emerald-300 text-xs block">🌿 Controle Biológico Prescrito</span>
                  <ul className="space-y-1">
                    {selectedLabReport.controlRecommendations.biological.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-3.5 rounded-2xl space-y-2">
                  <span className="font-extrabold text-emerald-900 dark:text-emerald-300 text-xs block">🚜 Manejo Cultural & Rotação</span>
                  <ul className="space-y-1">
                    {selectedLabReport.controlRecommendations.cultural.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-3.5 rounded-2xl space-y-2">
                  <span className="font-extrabold text-emerald-900 dark:text-emerald-300 text-xs block">🧪 Controle Químico & Sementes</span>
                  <ul className="space-y-1">
                    {selectedLabReport.controlRecommendations.chemical.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Responsible Sign block */}
              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-end">
                <div>
                  <p className="text-slate-400 text-[11px]">Responsável Técnico Habilitado:</p>
                  <p className="font-bold text-slate-800 dark:text-zinc-200">{selectedLabReport.agronomist}</p>
                  <p className="text-slate-500 text-[10px]">{selectedLabReport.crea}</p>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-[#2D5A27] hover:bg-[#23481f] text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Imprimir / Imprimir Laudo PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GUIA DE CATÁLOGO & PARÂMETROS DE REFERÊNCIA OFICIAIS */}
      {isReferenceGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-5xl w-full p-6 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <BookOpen className="w-7 h-7 text-emerald-700 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="font-black text-xl text-slate-900 dark:text-zinc-100">
                    Catálogo de Patógenos & Parâmetros de Referência
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Tabela oficial de faixas de risco fitossanitário para nematoides, fungos e bactérias de solo com diretrizes de manejo.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReferenceGuideOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-slate-200 dark:border-zinc-700">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {(['TODOS', 'Nematoide', 'Fungo', 'Bactéria'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setReferenceGuideCategory(cat)}
                    className={`text-xs font-extrabold px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                      referenceGuideCategory === cat
                        ? 'bg-[#2D5A27] text-white shadow-2xs'
                        : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 border border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    {cat === 'TODOS' ? 'Todos os Agentes' : cat === 'Nematoide' ? '🪱 Nematoides' : cat === 'Fungo' ? '🍄 Fungos de Solo' : '🦠 Bactérias'}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar agente, doença ou diretriz..."
                  value={referenceGuideSearch}
                  onChange={(e) => setReferenceGuideSearch(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STANDARD_PATHOGEN_CATALOG.filter((item) => {
                const matchesCategory = referenceGuideCategory === 'TODOS' || item.category === referenceGuideCategory;
                const matchesSearch =
                  item.pathogenName.toLowerCase().includes(referenceGuideSearch.toLowerCase()) ||
                  item.commonName.toLowerCase().includes(referenceGuideSearch.toLowerCase()) ||
                  item.referenceDescription.toLowerCase().includes(referenceGuideSearch.toLowerCase()) ||
                  item.managementNote.toLowerCase().includes(referenceGuideSearch.toLowerCase());
                return matchesCategory && matchesSearch;
              }).map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 rounded-2xl p-4 shadow-2xs space-y-3 hover:border-emerald-400 dark:hover:border-emerald-700 transition"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">Unid.: {item.defaultUnit}</span>
                      </div>
                      <h3 className="font-black italic text-slate-900 dark:text-zinc-100 text-sm mt-1">
                        {item.pathogenName}
                      </h3>
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">{item.commonName}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsReferenceGuideOpen(false);
                        setIsLabReportModalOpen(true);
                      }}
                      className="text-[11px] font-bold text-[#2D5A27] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 cursor-pointer shrink-0"
                    >
                      Inserir no Laudo
                    </button>
                  </div>

                  {/* Thresholds breakdown */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block">
                      Faixas de Risco Fitossanitário:
                    </span>
                    <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <span className="font-black text-emerald-700 dark:text-emerald-400 block">🟢 Baixo</span>
                        <span className="text-slate-600 dark:text-zinc-400 font-medium">&lt; {item.thresholdLow}</span>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-950/40 p-1.5 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <span className="font-black text-yellow-700 dark:text-yellow-400 block">🟡 Médio</span>
                        <span className="text-slate-600 dark:text-zinc-400 font-medium">{item.thresholdLow} - {item.thresholdMed}</span>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                        <span className="font-black text-amber-700 dark:text-amber-400 block">🟠 Alto</span>
                        <span className="text-slate-600 dark:text-zinc-400 font-medium">{item.thresholdMed} - {item.thresholdHigh}</span>
                      </div>
                      <div className="bg-rose-50 dark:bg-rose-950/40 p-1.5 rounded-lg border border-rose-200 dark:border-rose-800">
                        <span className="font-black text-rose-700 dark:text-rose-400 block">🔴 Crítico</span>
                        <span className="text-slate-600 dark:text-zinc-400 font-medium">&gt; {item.thresholdHigh}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reference Guideline */}
                  <div className="bg-slate-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-750 text-[11px] space-y-1">
                    <div className="text-slate-700 dark:text-zinc-300">
                      <strong className="text-slate-900 dark:text-zinc-100 font-bold">Parâmetro: </strong>
                      {item.referenceDescription}
                    </div>
                    <div className="text-slate-600 dark:text-zinc-400">
                      <strong className="text-amber-700 dark:text-amber-400 font-bold">Manejo Sugerido: </strong>
                      {item.managementNote}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsReferenceGuideOpen(false)}
                className="px-5 py-2 text-xs font-extrabold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 rounded-xl transition cursor-pointer"
              >
                Fechar Guia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
