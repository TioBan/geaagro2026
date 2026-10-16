import React, { useState, useMemo } from 'react';
import {
  Building2,
  UserCheck,
  Users,
  MapPin,
  Plus,
  Trash2,
  Layers,
  Save,
  CheckCircle2,
  FileText,
  Pencil,
  Stethoscope,
  Upload,
  Image as ImageIcon,
  X as CloseIcon,
  Search,
  Filter,
  RotateCcw,
} from 'lucide-react';
import {
  Company,
  Agronomist,
  RuralProducer,
  Farm,
  FieldPlot,
  SoilTexture,
  TechnicalProfession,
} from '../types/agronomy';
import { ConfirmDeleteModal } from './registration/ConfirmDeleteModal';
import { EditFarmModal } from './registration/EditFarmModal';
import { EditPlotModal } from './registration/EditPlotModal';
import { EditProducerModal } from './registration/EditProducerModal';
import { EditAgronomistModal } from './registration/EditAgronomistModal';
import { EditCompanyModal } from './registration/EditCompanyModal';
import { BRAZIL_STATES } from '../data/brazilStates';

const TECHNICAL_PROFESSIONS: {
  role: TechnicalProfession;
  label: string;
  defaultCouncil: 'CREA' | 'CRMV' | 'CFTA' | 'CFT' | 'CRBio' | 'Outro';
  short: string;
  defaultSpecialty: string;
}[] = [
  {
    role: 'Engenheiro Agrônomo',
    label: 'Engenheiro(a) Agrônomo(a)',
    defaultCouncil: 'CREA',
    short: 'Eng. Agr.',
    defaultSpecialty: 'Fertilidade de Solos & Nutrição Vegetal',
  },
  {
    role: 'Médica Veterinária',
    label: 'Médica Veterinária',
    defaultCouncil: 'CRMV',
    short: 'Méd. Vet.',
    defaultSpecialty: 'Sanidade Animal, Clínica & Reprodução de Ruminantes',
  },
  {
    role: 'Médico Veterinário',
    label: 'Médico Veterinário',
    defaultCouncil: 'CRMV',
    short: 'Méd. Vet.',
    defaultSpecialty: 'Sanidade Animal, Clínica & Reprodução de Ruminantes',
  },
  {
    role: 'Zootecnista',
    label: 'Zootecnista',
    defaultCouncil: 'CRMV',
    short: 'Zoot.',
    defaultSpecialty: 'Nutrição Animal, Pastagens & Confinamento Bovino',
  },
  {
    role: 'Engenheiro Florestal',
    label: 'Engenheiro(a) Florestal',
    defaultCouncil: 'CREA',
    short: 'Eng. Flor.',
    defaultSpecialty: 'Silvicultura, Manejo Florestal & Restauração Ecológica',
  },
  {
    role: 'Engenheiro Ambiental',
    label: 'Engenheiro(a) Ambiental',
    defaultCouncil: 'CREA',
    short: 'Eng. Amb.',
    defaultSpecialty: 'Licenciamento Ambiental, CAR & Gestão de Recursos Hídricos',
  },
  {
    role: 'Técnico Agropecuário',
    label: 'Técnico(a) Agropecuário(a) / Agrícola',
    defaultCouncil: 'CFTA',
    short: 'Téc. Agr.',
    defaultSpecialty: 'Assistência Técnica, Operações de Campo & Extensão Rural',
  },
  {
    role: 'Outro',
    label: 'Outro Especialista / RT',
    defaultCouncil: 'CREA',
    short: 'RT',
    defaultSpecialty: 'Consultoria Agropecuária',
  },
];

interface RegistrationModuleProps {
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  agronomists: Agronomist[];
  setAgronomists: React.Dispatch<React.SetStateAction<Agronomist[]>>;
  producers: RuralProducer[];
  setProducers: React.Dispatch<React.SetStateAction<RuralProducer[]>>;
  farms: Farm[];
  setFarms: React.Dispatch<React.SetStateAction<Farm[]>>;
  selectedFarmId: string;
  setSelectedFarmId: (id: string) => void;
  setActiveTab?: (tab: string) => void;
  setActiveSubTab?: (subTab: string) => void;
}

export const RegistrationModule: React.FC<RegistrationModuleProps> = ({
  companies,
  setCompanies,
  agronomists,
  setAgronomists,
  producers,
  setProducers,
  farms,
  setFarms,
  selectedFarmId,
  setSelectedFarmId,
  setActiveTab,
  setActiveSubTab,
}) => {
  const [subTab, setSubTab] = useState<'fazendas' | 'produtores' | 'agronomos' | 'empresas'>('fazendas');
  const [notification, setNotification] = useState<string | null>(null);

  // Modals state for Editing
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [editingPlot, setEditingPlot] = useState<FieldPlot | null>(null);
  const [editingProducer, setEditingProducer] = useState<RuralProducer | null>(null);
  const [editingAgronomist, setEditingAgronomist] = useState<Agronomist | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Modal state for Confirmation of Deletion
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'farm' | 'plot' | 'producer' | 'agronomist' | 'company';
    id: string;
    name: string;
    extraId?: string;
    warningText?: string;
  } | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // State for new Farm form
  const [newFarmName, setNewFarmName] = useState('');
  const [newFarmCity, setNewFarmCity] = useState('');
  const [newFarmState, setNewFarmState] = useState('');
  const [newFarmTotalArea, setNewFarmTotalArea] = useState<number | ''>('');
  const [newFarmCultivatedArea, setNewFarmCultivatedArea] = useState<number | ''>('');
  const [newFarmCar, setNewFarmCar] = useState('');
  const [newFarmSoilType, setNewFarmSoilType] = useState('');
  const [newFarmHistory, setNewFarmHistory] = useState('');
  const [newFarmProducerId, setNewFarmProducerId] = useState('');
  const [newFarmAgronomistId, setNewFarmAgronomistId] = useState('');
  const [newFarmCompanyId, setNewFarmCompanyId] = useState('');

  // State for new Plot form
  const [newPlotName, setNewPlotName] = useState('');
  const [newPlotArea, setNewPlotArea] = useState<number | ''>('');
  const [newPlotTexture, setNewPlotTexture] = useState<SoilTexture>('argiloso');
  const [newPlotClay, setNewPlotClay] = useState<number | ''>('');
  const [newPlotCrop, setNewPlotCrop] = useState('');
  const [newPlotRowSpacing, setNewPlotRowSpacing] = useState<number | ''>('');
  const [newPlotPlantSpacing, setNewPlotPlantSpacing] = useState<number | ''>('');
  const [newPlotIrrigationType, setNewPlotIrrigationType] = useState<'sequeiro' | 'pivo_central' | 'gotejamento' | 'aspersao'>('sequeiro');

  // State for new Producer form
  const [newProdName, setNewProdName] = useState('');
  const [newProdDoc, setNewProdDoc] = useState('');
  const [newProdStateRegistration, setNewProdStateRegistration] = useState('');
  const [newProdPhone, setNewProdPhone] = useState('');
  const [newProdEmail, setNewProdEmail] = useState('');
  const [newProdCity, setNewProdCity] = useState('');
  const [newProdState, setNewProdState] = useState('');
  const [newProdCompanyId, setNewProdCompanyId] = useState('');

  // Producer search & dropdown filter states
  const [producerSearchTerm, setProducerSearchTerm] = useState('');
  const [producerFilterId, setProducerFilterId] = useState('ALL');

  const filteredProducers = useMemo(() => {
    let list = (producers || []).filter(p => p && p.id);
    if (producerFilterId !== 'ALL') {
      list = list.filter(p => p.id === producerFilterId);
    }
    if (producerSearchTerm.trim()) {
      const term = producerSearchTerm.toLowerCase().trim();
      list = list.filter(p =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.document && p.document.toLowerCase().includes(term)) ||
        (p.stateRegistration && p.stateRegistration.toLowerCase().includes(term)) ||
        (p.city && p.city.toLowerCase().includes(term)) ||
        (p.state && p.state.toLowerCase().includes(term)) ||
        (p.email && p.email.toLowerCase().includes(term)) ||
        (p.phone && p.phone.toLowerCase().includes(term))
      );
    }
    return list;
  }, [producers, producerFilterId, producerSearchTerm]);

  // State for new Technical Responsible (RT) form
  const [newAgroName, setNewAgroName] = useState('');
  const [newAgroProfession, setNewAgroProfession] = useState<TechnicalProfession>('Engenheiro Agrônomo');
  const [newAgroCouncilType, setNewAgroCouncilType] = useState('CREA');
  const [newAgroCrea, setNewAgroCrea] = useState('');
  const [newAgroCreaState, setNewAgroCreaState] = useState('');
  const [newAgroRnp, setNewAgroRnp] = useState('');
  const [newAgroCpf, setNewAgroCpf] = useState('');
  const [newAgroSpecialty, setNewAgroSpecialty] = useState('');
  const [newAgroEmail, setNewAgroEmail] = useState('');
  const [newAgroPhone, setNewAgroPhone] = useState('');
  const [newAgroAddress, setNewAgroAddress] = useState('');
  const [newAgroHasSignature, setNewAgroHasSignature] = useState(false);

  // Agronomist search & dropdown filter states
  const [agronomistSearchTerm, setAgronomistSearchTerm] = useState('');
  const [agronomistFilterId, setAgronomistFilterId] = useState('ALL');

  const filteredAgronomists = useMemo(() => {
    let list = (agronomists || []).filter(a => a && a.id);
    if (agronomistFilterId !== 'ALL') {
      list = list.filter(a => a.id === agronomistFilterId);
    }
    if (agronomistSearchTerm.trim()) {
      const term = agronomistSearchTerm.toLowerCase().trim();
      list = list.filter(a =>
        (a.name && a.name.toLowerCase().includes(term)) ||
        (a.crea && a.crea.toLowerCase().includes(term)) ||
        (a.councilType && a.councilType.toLowerCase().includes(term)) ||
        (a.profession && a.profession.toLowerCase().includes(term)) ||
        (a.specialty && a.specialty.toLowerCase().includes(term)) ||
        (a.cpf && a.cpf.toLowerCase().includes(term)) ||
        (a.rnp && a.rnp.toLowerCase().includes(term)) ||
        (a.email && a.email.toLowerCase().includes(term)) ||
        (a.phone && a.phone.toLowerCase().includes(term)) ||
        (a.creaState && a.creaState.toLowerCase().includes(term)) ||
        (a.clinicAddress && a.clinicAddress.toLowerCase().includes(term)) ||
        (a.address && a.address.toLowerCase().includes(term))
      );
    }
    return list;
  }, [agronomists, agronomistFilterId, agronomistSearchTerm]);

  const handleNewAgroProfessionChange = (role: TechnicalProfession) => {
    setNewAgroProfession(role);
    const item = TECHNICAL_PROFESSIONS.find(p => p.role === role);
    if (item) {
      setNewAgroCouncilType(item.defaultCouncil);
      setNewAgroSpecialty(item.defaultSpecialty);
    }
  };

  // State for new Company form
  const [newCompName, setNewCompName] = useState('');
  const [newCompTrading, setNewCompTrading] = useState('');
  const [newCompCnpj, setNewCompCnpj] = useState('');
  const [newCompCrea, setNewCompCrea] = useState('');
  const [newCompCity, setNewCompCity] = useState('');
  const [newCompState, setNewCompState] = useState('');
  const [newCompLogo, setNewCompLogo] = useState('');
  const [newCompHasSignature, setNewCompHasSignature] = useState(false);

  // Reset form handlers
  const resetFarmForm = () => {
    setNewFarmName('');
    setNewFarmCity('');
    setNewFarmState('');
    setNewFarmTotalArea('');
    setNewFarmCultivatedArea('');
    setNewFarmCar('');
    setNewFarmSoilType('');
    setNewFarmHistory('');
    setNewFarmProducerId('');
    setNewFarmAgronomistId('');
    setNewFarmCompanyId('');
  };

  const resetPlotForm = () => {
    setNewPlotName('');
    setNewPlotArea('');
    setNewPlotTexture('argiloso');
    setNewPlotClay('');
    setNewPlotCrop('');
    setNewPlotRowSpacing('');
    setNewPlotPlantSpacing('');
    setNewPlotIrrigationType('sequeiro');
  };

  const resetProducerForm = () => {
    setNewProdName('');
    setNewProdDoc('');
    setNewProdStateRegistration('');
    setNewProdPhone('');
    setNewProdEmail('');
    setNewProdCity('');
    setNewProdState('');
    setNewProdCompanyId('');
  };

  const resetAgronomistForm = () => {
    setNewAgroName('');
    setNewAgroProfession('Engenheiro Agrônomo');
    setNewAgroCouncilType('CREA');
    setNewAgroCrea('');
    setNewAgroCreaState('');
    setNewAgroRnp('');
    setNewAgroCpf('');
    setNewAgroSpecialty('');
    setNewAgroEmail('');
    setNewAgroPhone('');
    setNewAgroAddress('');
    setNewAgroHasSignature(false);
  };

  const resetCompanyForm = () => {
    setNewCompName('');
    setNewCompTrading('');
    setNewCompCnpj('');
    setNewCompCrea('');
    setNewCompCity('');
    setNewCompState('');
    setNewCompLogo('');
    setNewCompHasSignature(false);
  };

  // Company search & dropdown filter states
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [companyFilterId, setCompanyFilterId] = useState('ALL');

  const filteredCompanies = useMemo(() => {
    let list = (companies || []).filter(c => c && c.id);
    if (companyFilterId !== 'ALL') {
      list = list.filter(c => c.id === companyFilterId);
    }
    if (companySearchTerm.trim()) {
      const term = companySearchTerm.toLowerCase().trim();
      list = list.filter(c =>
        (c.name && c.name.toLowerCase().includes(term)) ||
        (c.tradingName && c.tradingName.toLowerCase().includes(term)) ||
        (c.cnpj && c.cnpj.toLowerCase().includes(term)) ||
        (c.creaRegister && c.creaRegister.toLowerCase().includes(term)) ||
        (c.city && c.city.toLowerCase().includes(term)) ||
        (c.state && c.state.toLowerCase().includes(term)) ||
        (c.address && c.address.toLowerCase().includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        (c.phone && c.phone.toLowerCase().includes(term)) ||
        (c.stateRegistration && c.stateRegistration.toLowerCase().includes(term)) ||
        (c.mapaRegister && c.mapaRegister.toLowerCase().includes(term))
      );
    }
    return list;
  }, [companies, companyFilterId, companySearchTerm]);

  const selectedFarm = (farms || []).find(f => f?.id === selectedFarmId) || farms?.[0];

  const handleAddFarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmName) return;

    const totalHa = Number(newFarmTotalArea) || 0;
    const cultHa = Number(newFarmCultivatedArea) || 0;
    const historyList = newFarmHistory.trim()
      ? newFarmHistory.split('->').map(s => s.trim()).filter(Boolean)
      : [];

    const newFarm: Farm = {
      id: `farm-${Date.now()}`,
      name: newFarmName,
      producerId: newFarmProducerId || '',
      agronomistId: newFarmAgronomistId || '',
      companyId: newFarmCompanyId || companies[0]?.id || '',
      carRegister: newFarmCar,
      totalAreaHa: totalHa,
      cultivatedAreaHa: cultHa,
      city: newFarmCity,
      state: newFarmState,
      soilGeneralType: newFarmSoilType,
      cropHistory: historyList,
      plots: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    setFarms(prev => [...prev, newFarm]);
    setSelectedFarmId(newFarm.id);
    setNewFarmName('');
    setNewFarmCity('');
    setNewFarmTotalArea('');
    setNewFarmCultivatedArea('');
    setNewFarmCar('');
    setNewFarmSoilType('');
    setNewFarmHistory('');
    setNewFarmProducerId('');
    setNewFarmAgronomistId('');
    showNotification(`Fazenda "${newFarm.name}" cadastrada com sucesso!`);
  };

  const handleAddPlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlotName || !selectedFarm) return;

    const area = Number(newPlotArea) || 0;
    const clay = Number(newPlotClay) || 0;
    const safeRow = Number(newPlotRowSpacing) || 0;
    const safePlant = Number(newPlotPlantSpacing) || 0;
    const population = safeRow > 0 && safePlant > 0 ? Math.round(10000 / (safeRow * safePlant)) : 0;
    const linearMeters = safeRow > 0 ? Math.round(10000 / safeRow) : 0;

    const newPlot: FieldPlot = {
      id: `plot-${Date.now()}`,
      name: newPlotName.trim(),
      farmId: selectedFarm.id,
      areaHa: area,
      texture: newPlotTexture,
      clayPercentage: clay,
      currentCrop: newPlotCrop.trim() || 'Não informada',
      spacingBetweenRowsMeters: safeRow,
      spacingBetweenPlantsMeters: safePlant,
      plantPopulationPerHa: population,
      linearMetersPerHa: linearMeters,
      irrigationType: newPlotIrrigationType,
    };

    setFarms(prev =>
      prev.map(f =>
        f?.id === selectedFarm.id
          ? { ...f, plots: [...(f.plots || []), newPlot] }
          : f
      )
    );

    setNewPlotName('');
    setNewPlotArea('');
    setNewPlotClay('');
    setNewPlotCrop('');
    setNewPlotRowSpacing('');
    setNewPlotPlantSpacing('');
    setNewPlotIrrigationType('sequeiro');
    showNotification(`Talhão "${newPlot.name}" adicionado à ${selectedFarm.name}!`);
  };

  // Edit Handlers
  const handleSaveEditFarm = (updated: Farm) => {
    setFarms(prev => prev.map(f => (f?.id === updated.id ? updated : f)));
    setEditingFarm(null);
    showNotification(`Fazenda "${updated.name}" atualizada com sucesso!`);
  };

  const handleSaveEditPlot = (updated: FieldPlot) => {
    const targetFarmId = updated.farmId || selectedFarm?.id;
    if (!targetFarmId) return;
    setFarms(prev =>
      prev.map(f =>
        f?.id === targetFarmId
          ? { ...f, plots: (f.plots || []).map(p => (p?.id === updated.id ? updated : p)) }
          : f
      )
    );
    setEditingPlot(null);
    showNotification(`Talhão "${updated.name}" atualizado com sucesso!`);
  };

  const handleSaveEditProducer = (updated: RuralProducer) => {
    setProducers(prev => prev.map(p => (p?.id === updated.id ? updated : p)));
    setEditingProducer(null);
    showNotification(`Produtor "${updated.name}" atualizado com sucesso!`);
  };

  const handleSaveEditAgronomist = (updated: Agronomist) => {
    setAgronomists(prev => prev.map(a => (a?.id === updated.id ? updated : a)));
    setEditingAgronomist(null);
    showNotification(`Agrônomo RT "${updated.name}" atualizado com sucesso!`);
  };

  const handleSaveEditCompany = (updated: Company) => {
    setCompanies(prev => prev.map(c => (c?.id === updated.id ? updated : c)));
    setEditingCompany(null);
    showNotification(`Empresa "${updated.name}" atualizada com sucesso!`);
  };

  // Delete Confirmation Handler
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'farm') {
      const remainingFarms = farms.filter(f => f?.id !== deleteTarget.id);
      setFarms(remainingFarms);
      if (selectedFarmId === deleteTarget.id) {
        setSelectedFarmId(remainingFarms[0]?.id || '');
      }
      showNotification(`Fazenda "${deleteTarget.name}" excluída com sucesso.`);
    } else if (deleteTarget.type === 'plot') {
      const targetFarmId = deleteTarget.extraId || selectedFarm?.id;
      if (targetFarmId) {
        setFarms(prev =>
          prev.map(f =>
            f?.id === targetFarmId
              ? { ...f, plots: (f.plots || []).filter(p => p?.id !== deleteTarget.id) }
              : f
          )
        );
      }
      showNotification(`Talhão "${deleteTarget.name}" excluído com sucesso.`);
    } else if (deleteTarget.type === 'producer') {
      setProducers(prev => prev.filter(p => p?.id !== deleteTarget.id));
      showNotification(`Produtor "${deleteTarget.name}" excluído com sucesso.`);
    } else if (deleteTarget.type === 'agronomist') {
      setAgronomists(prev => prev.filter(a => a?.id !== deleteTarget.id));
      showNotification(`Agrônomo RT "${deleteTarget.name}" excluído com sucesso.`);
    } else if (deleteTarget.type === 'company') {
      setCompanies(prev => prev.filter(c => c?.id !== deleteTarget.id));
      showNotification(`Empresa "${deleteTarget.name}" excluída com sucesso.`);
    }

    setDeleteTarget(null);
  };

  const handleAddProducer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;

    const prod: RuralProducer = {
      id: `prod-${Date.now()}`,
      name: newProdName.trim(),
      document: newProdDoc.trim() || '000.000.000-00',
      documentType: (newProdDoc || '').length > 14 ? 'CNPJ' : 'CPF',
      stateRegistration: newProdStateRegistration.trim() || 'Isento',
      phone: newProdPhone.trim(),
      email: newProdEmail.trim(),
      address: 'Zona Rural',
      city: newProdCity.trim() || 'Sorriso',
      state: newProdState || 'MT',
      companyId: newProdCompanyId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setProducers(prev => [...prev, prod]);
    setNewProdName('');
    setNewProdDoc('');
    setNewProdStateRegistration('');
    setNewProdPhone('');
    setNewProdEmail('');
    setNewProdCity('');
    showNotification(`Produtor "${prod.name}" cadastrado com sucesso!`);
  };

  const handleAddAgronomist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgroName || !newAgroCrea) return;

    const item = TECHNICAL_PROFESSIONS.find((p) => p.role === newAgroProfession);
    const prefix = item?.short || 'RT';
    const sigText = `${newAgroName} - ${prefix} ${newAgroCouncilType}-${newAgroCreaState} ${newAgroCrea}`;

    const agro: Agronomist = {
      id: `agro-${Date.now()}`,
      name: newAgroName,
      profession: newAgroProfession,
      councilType: newAgroCouncilType,
      crea: newAgroCrea,
      councilNumber: newAgroCrea,
      creaState: newAgroCreaState,
      rnp: newAgroRnp.trim() || `RNP-${Math.floor(100000000 + Math.random() * 900000000)}`,
      cpf: newAgroCpf.trim() || '000.000.000-00',
      email: newAgroEmail,
      phone: newAgroPhone,
      address: newAgroAddress.trim(),
      clinicAddress: newAgroAddress.trim(),
      companyId: companies[0]?.id || '',
      specialty: newAgroSpecialty,
      signatureText: sigText,
      hasDigitalSignature: newAgroHasSignature,
      legalSignatureHash: newAgroHasSignature
        ? `SHA256-${Date.now().toString(16).toUpperCase()}-${Math.floor(
            Math.random() * 1000000
          )}`
        : undefined,
      legalSignatureDate: newAgroHasSignature
        ? new Date().toISOString()
        : undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setAgronomists((prev) => [...prev, agro]);
    setNewAgroName('');
    setNewAgroCrea('');
    setNewAgroRnp('');
    setNewAgroCpf('');
    setNewAgroEmail('');
    setNewAgroPhone('');
    setNewAgroAddress('');
    setNewAgroHasSignature(false);
    showNotification(
      `Responsável Técnico "${agro.name}" (${newAgroProfession}) cadastrado!`
    );
  };

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName) return;

    const comp: Company = {
      id: `comp-${Date.now()}`,
      name: newCompName,
      tradingName: newCompTrading || newCompName,
      cnpj: newCompCnpj || '00.000.000/0001-00',
      stateRegistration: 'Isento',
      creaRegister: newCompCrea || 'CREA-MT PJ-000',
      address: 'Rodovia BR-163 Km 740',
      city: newCompCity || 'Sinop',
      state: newCompState || 'MT',
      phone: '(66) 3500-0000',
      email: 'contato@empresa.com',
      logoUrl: newCompLogo.trim() || '',
      hasDigitalSignature: newCompHasSignature,
      legalSignatureHash: newCompHasSignature ? `ICP-BRASIL-${Date.now().toString(16).toUpperCase()}-${Math.floor(Math.random() * 1000000)}` : undefined,
      legalSignatureDate: newCompHasSignature ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCompanies(prev => [...prev, comp]);
    setNewCompName('');
    setNewCompTrading('');
    setNewCompCnpj('');
    setNewCompCrea('');
    setNewCompCity('');
    setNewCompLogo('');
    setNewCompHasSignature(false);
    showNotification(`Empresa "${comp.name}" cadastrada com sucesso!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="bg-emerald-800 dark:bg-emerald-950 text-white px-4 py-2.5 rounded-lg shadow-xs flex items-center gap-2 text-sm font-medium border border-emerald-700 dark:border-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4 sm:space-y-5 transition-colors">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Cadastro Técnico & Cadastros Fundamentais</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1">
            Gestão integrada de Empresas, Responsáveis Técnicos (Agrônomos, Veterinários, Zootecnistas, Eng. Florestais/Ambientais e Técnicos Agropecuários), Produtores e Fazendas com Talhões.
          </p>
        </div>

        {/* Sub-tabs selector as professional interactive icon cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 w-full">
          {[
            {
              id: 'fazendas' as const,
              label: 'Fazendas & Talhões',
              count: (farms || []).length,
              icon: MapPin,
            },
            {
              id: 'produtores' as const,
              label: 'Produtores',
              count: (producers || []).length,
              icon: Users,
            },
            {
              id: 'agronomos' as const,
              label: 'Responsáveis Técnicos',
              count: (agronomists || []).length,
              icon: UserCheck,
            },
            {
              id: 'empresas' as const,
              label: 'Empresas',
              count: (companies || []).length,
              icon: Building2,
            },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`subtab-${tab.id}`}
                type="button"
                onClick={() => setSubTab(tab.id)}
                className={`group relative p-3 sm:p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                    : 'bg-slate-50/80 dark:bg-zinc-900/80 border-slate-200/80 dark:border-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    isActive
                      ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs'
                      : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className={`block font-bold text-xs sm:text-sm truncate transition-colors ${
                      isActive
                        ? 'text-emerald-900 dark:text-emerald-200'
                        : 'text-slate-700 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-zinc-100'
                    }`}
                  >
                    {tab.label}
                  </span>
                  <span
                    className={`inline-flex items-center text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                      isActive
                        ? 'bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 font-bold'
                        : 'bg-slate-200/70 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    {tab.count} {tab.count === 1 ? 'registro' : 'registros'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: FAZENDAS & TALHÕES */}
      {subTab === 'fazendas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: List of Farms & Form */}
          <div className="lg:col-span-5 space-y-6">
            {/* Registered Farms List */}
            <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 shadow-xs transition-colors">
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Fazendas Cadastradas
              </h3>
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {(farms || []).filter(f => f && f.id).length === 0 ? (
                  <div className="p-5 border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg text-center text-slate-400 dark:text-zinc-500 text-xs space-y-1">
                    <p className="font-semibold text-slate-600 dark:text-zinc-400">Nenhuma fazenda cadastrada</p>
                    <p>Preencha o formulário abaixo para registrar sua primeira propriedade rural.</p>
                  </div>
                ) : (
                  (farms || []).filter(f => f && f.id).map(f => {
                    const prod = (producers || []).find(p => p?.id === f?.producerId);
                  const isSelected = f?.id === selectedFarmId;
                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFarmId(f.id)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{f.name}</p>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">
                            {f.city}/{f.state} • {f.totalAreaHa} ha totais ({f.cultivatedAreaHa} ha agrícolas)
                          </p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                            Produtor: {prod?.name || 'Não vinculado'} {prod?.document ? `(CPF/CNPJ: ${prod.document})` : ''}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingFarm(f);
                              }}
                              className="p-1 rounded text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                              title="Editar fazenda"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget({
                                  type: 'farm',
                                  id: f.id,
                                  name: f.name,
                                  warningText: `Esta ação excluirá a fazenda e todos os seus ${f.plots?.length || 0} talhões mapeados.`,
                                });
                              }}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              title="Excluir fazenda"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[11px] bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded font-semibold border border-slate-200 dark:border-zinc-700">
                              {f.plots?.length || 0} talhões
                            </span>
                          </div>
                          {setActiveTab && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFarmId(f.id);
                                setActiveTab('bulario');
                                if (setActiveSubTab) setActiveSubTab('receituario');
                              }}
                              className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 px-2 py-1 rounded-md border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              title="Emitir Receituário Agronômico para esta fazenda"
                            >
                              <FileText className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Receituário</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }))}
              </div>
            </div>

            {/* New Farm Form */}
            <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 shadow-xs transition-colors">
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Nova Propriedade Rural
              </h3>
              <form onSubmit={handleAddFarm} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Nome da Fazenda *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Fazenda Santa Cruz"
                    value={newFarmName}
                    onChange={e => setNewFarmName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Município</label>
                    <input
                      type="text"
                      placeholder="Ex: Sorriso"
                      value={newFarmCity}
                      onChange={e => setNewFarmCity(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">UF</label>
                    <select
                      aria-label="UF da Fazenda"
                      value={newFarmState}
                      onChange={e => setNewFarmState(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                    >
                      {BRAZIL_STATES.map(st => (
                        <option key={st.uf} value={st.uf}>{st.uf} - {st.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Área Total (ha)</label>
                    <input
                      type="number"
                      placeholder="Ex: 500"
                      value={newFarmTotalArea}
                      onChange={e => setNewFarmTotalArea(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Área Cultivada (ha)</label>
                    <input
                      type="number"
                      placeholder="Ex: 450"
                      value={newFarmCultivatedArea}
                      onChange={e => setNewFarmCultivatedArea(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Produtor Proprietário (opcional)</label>
                  <select
                    aria-label="Produtor Proprietário"
                    value={newFarmProducerId}
                    onChange={e => setNewFarmProducerId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                  >
                    <option value="">Não vinculado (opcional)</option>
                    {(producers || []).filter(p => p && p.id).map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.document})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Responsável Técnico (RT) (opcional)</label>
                  <select
                    aria-label="Responsável Técnico da Fazenda"
                    value={newFarmAgronomistId}
                    onChange={e => setNewFarmAgronomistId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                  >
                    <option value="">Não vinculado (opcional)</option>
                    {(agronomists || []).filter(a => a && a.id).map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} • {a.profession || 'Eng. Agrônomo'} ({a.councilType || 'CREA'}-{a.creaState || 'MT'} {a.crea})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Registro CAR (opcional)</label>
                  <input
                    type="text"
                    placeholder="Código CAR da propriedade"
                    value={newFarmCar}
                    onChange={e => setNewFarmCar(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Tipo Geral de Solo</label>
                  <input
                    type="text"
                    placeholder="Ex: Latossolo Vermelho Distrófico (opcional)"
                    value={newFarmSoilType}
                    onChange={e => setNewFarmSoilType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Histórico de Culturas</label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Soja 2024/25 -> Milho Safrinha 2025 (opcional)"
                    value={newFarmHistory}
                    onChange={e => setNewFarmHistory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={resetFarmForm}
                    className="px-3.5 py-2.5 min-h-[42px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-semibold text-xs rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Limpar campos preenchidos deste formulário"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 min-h-[42px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Salvar Cadastro da Fazenda
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Selected Farm Details & Field Plots Manager */}
          <div className="lg:col-span-7 space-y-6">
            {selectedFarm ? (
              <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6 transition-colors">
                {/* Farm Summary Header */}
                <div className="border-b border-slate-200 dark:border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      Propriedade Selecionada
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1">{selectedFarm.name}</h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400">
                      {selectedFarm.city} - {selectedFarm.state} • Tipo de Solo: <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedFarm.soilGeneralType}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-500 dark:text-zinc-400">Área Mapeada</p>
                      <p className="text-base font-bold text-slate-800 dark:text-zinc-200">
                        {(selectedFarm?.plots || []).reduce((acc, p) => acc + (p?.areaHa || 0), 0)} ha / {selectedFarm?.cultivatedAreaHa || 0} ha
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setEditingFarm(selectedFarm)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg border border-slate-300 dark:border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        title="Editar dados da fazenda"
                      >
                        <Pencil className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            type: 'farm',
                            id: selectedFarm.id,
                            name: selectedFarm.name,
                            warningText: `Todos os ${selectedFarm.plots?.length || 0} talhões desta fazenda também serão removidos.`,
                          })
                        }
                        className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900/50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        title="Excluir fazenda"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Field Plots Table */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Talhões e Parâmetros de Plantio
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-zinc-400">
                      {(selectedFarm?.plots || []).length} talhões
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-lg">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-zinc-800 text-xs">
                      <thead className="bg-slate-50 dark:bg-zinc-900 font-semibold text-slate-700 dark:text-zinc-300">
                        <tr>
                          <th className="px-3 py-2 text-left">Talhão</th>
                          <th className="px-3 py-2 text-right">Área</th>
                          <th className="px-3 py-2 text-left">Textura</th>
                          <th className="px-3 py-2 text-left">Cultura</th>
                          <th className="px-3 py-2 text-center">Espaçamento</th>
                          <th className="px-3 py-2 text-right">População</th>
                          <th className="px-3 py-2 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                        {(selectedFarm?.plots || []).filter(plot => plot && plot.id).map(plot => (
                          <tr key={plot.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                            <td className="px-3 py-2.5 font-semibold text-slate-900 dark:text-zinc-100">{plot.name}</td>
                            <td className="px-3 py-2.5 text-right font-medium text-slate-700 dark:text-zinc-300">{plot?.areaHa || 0} ha</td>
                            <td className="px-3 py-2.5">
                              <span className="capitalize font-medium text-slate-800 dark:text-zinc-200">{plot.texture}</span>
                              <span className="text-[11px] text-slate-500 dark:text-zinc-400 ml-1">({plot.clayPercentage}%)</span>
                            </td>
                            <td className="px-3 py-2.5 text-slate-700 dark:text-zinc-300">{plot.currentCrop || 'Não definida'}</td>
                            <td className="px-3 py-2.5 text-center font-mono text-slate-600 dark:text-zinc-400">
                              {plot.spacingBetweenRowsMeters > 0 && plot.spacingBetweenPlantsMeters > 0
                                ? `${plot.spacingBetweenRowsMeters}m x ${plot.spacingBetweenPlantsMeters}m`
                                : '-'}
                            </td>
                            <td className="px-3 py-2.5 text-right font-semibold text-emerald-800 dark:text-emerald-400">
                              {plot.plantPopulationPerHa > 0
                                ? `${plot.plantPopulationPerHa.toLocaleString('pt-BR')} pl/ha`
                                : '-'}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  aria-label="Editar talhão"
                                  onClick={() => setEditingPlot(plot)}
                                  className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors p-1.5 rounded cursor-pointer"
                                  title="Editar talhão"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Remover talhão"
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: 'plot',
                                      id: plot.id,
                                      name: plot.name,
                                      extraId: selectedFarm.id,
                                      warningText: `Área de ${plot.areaHa} ha com cultura ${plot.currentCrop || 'não definida'}.`,
                                    })
                                  }
                                  className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors p-1.5 rounded cursor-pointer"
                                  title="Remover talhão"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add New Plot Inline Form */}
                <div className="bg-slate-50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800/80 space-y-4 shadow-2xs">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Adicionar Novo Talhão à Fazenda
                  </h4>

                  <form onSubmit={handleAddPlot} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Identificação do Talhão *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Talhão 04 - Pivô Sul"
                        value={newPlotName}
                        onChange={e => setNewPlotName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Cultura Planejada / Atual</label>
                      <input
                        type="text"
                        value={newPlotCrop}
                        onChange={e => setNewPlotCrop(e.target.value)}
                        placeholder="Ex: Soja, Milho, Café"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Área (ha)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Ex: 50"
                        value={newPlotArea}
                        onChange={e => setNewPlotArea(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Argila (%)</label>
                      <input
                        type="number"
                        placeholder="Ex: 42"
                        value={newPlotClay}
                        onChange={e => setNewPlotClay(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Textura</label>
                      <select
                        aria-label="Textura do Solo"
                        value={newPlotTexture}
                        onChange={e => setNewPlotTexture(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="arenoso">Arenoso (&lt;15%)</option>
                        <option value="medio">Médio (15-35%)</option>
                        <option value="argiloso">Argiloso (35-60%)</option>
                        <option value="muito_argiloso">Muito Argiloso (&gt;60%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Sistema de Irrigação</label>
                      <select
                        aria-label="Sistema de Irrigação"
                        value={newPlotIrrigationType}
                        onChange={e => setNewPlotIrrigationType(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="sequeiro">Sequeiro (sem irrigação)</option>
                        <option value="pivo_central">Pivô Central</option>
                        <option value="gotejamento">Gotejamento</option>
                        <option value="aspersao">Aspersão Convencional</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Espaçamento Linhas (m)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 0.50"
                        value={newPlotRowSpacing}
                        onChange={e => setNewPlotRowSpacing(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Espaçamento Plantas (m)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 0.07"
                        value={newPlotPlantSpacing}
                        onChange={e => setNewPlotPlantSpacing(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div className="sm:col-span-2 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-emerald-800 dark:text-emerald-300">Cálculo Automático de Estande:</p>
                      <div className="flex justify-between text-slate-700 dark:text-zinc-300">
                        <span>População Estimada:</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                          {Number(newPlotRowSpacing) > 0 && Number(newPlotPlantSpacing) > 0
                            ? `${Math.round(10000 / (Number(newPlotRowSpacing) * Number(newPlotPlantSpacing))).toLocaleString('pt-BR')} pl/ha`
                            : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-700 dark:text-zinc-300">
                        <span>Metros Lineares:</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200 font-mono">
                          {Number(newPlotRowSpacing) > 0
                            ? `${Math.round(10000 / Number(newPlotRowSpacing)).toLocaleString('pt-BR')} m/ha`
                            : '-'}
                        </span>
                      </div>
                    </div>

                    <div className="sm:col-span-2 md:col-span-4 flex justify-end pt-2 border-t border-slate-100 dark:border-zinc-800/60">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors hover:shadow-sm cursor-pointer min-h-[40px]"
                      >
                        <Plus className="w-4 h-4 text-emerald-400" />
                        Adicionar Talhão à Fazenda
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-950 rounded-xl p-8 border border-dashed border-slate-200 dark:border-zinc-800 shadow-xs text-center text-slate-400 dark:text-zinc-500 space-y-2">
                <MapPin className="w-10 h-10 mx-auto text-emerald-500/60" />
                <h4 className="font-bold text-sm text-slate-700 dark:text-zinc-300">Nenhuma fazenda selecionada</h4>
                <p className="text-xs max-w-sm mx-auto">
                  Cadastre uma propriedade rural no formulário ao lado ou selecione uma existente para gerenciar seus talhões e culturas agrícolas.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUTORES */}
      {subTab === 'produtores' && (
        <div className="space-y-6">
          {/* Card 1: Produtores Rurais Cadastrados */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 shadow-xs transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                  Produtores Rurais Cadastrados
                </h3>
              </div>
              <span className="text-[11px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold px-2.5 py-1 rounded-full w-fit">
                {(producers || []).filter(p => p && p.id).length} cadastrado(s)
              </span>
            </div>

            {/* Controls: Search Bar & Dropdown Select */}
            {(producers || []).filter(p => p && p.id).length > 0 && (
              <div className="space-y-2.5 mb-4 p-3 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 rounded-lg text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  {/* Search bar */}
                  <div className="sm:col-span-7 relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={producerSearchTerm}
                      onChange={(e) => setProducerSearchTerm(e.target.value)}
                      placeholder="Buscar por nome, CPF/CNPJ, IE, cidade..."
                      className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-md text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {producerSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setProducerSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                        title="Limpar busca"
                      >
                        <CloseIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown Selector (Lista Suspensa) */}
                  <div className="sm:col-span-5 relative">
                    <select
                      aria-label="Lista suspensa de produtores rurais"
                      value={producerFilterId}
                      onChange={(e) => setProducerFilterId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-md text-xs text-slate-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate"
                    >
                      <option value="ALL">📋 Todos os Produtores ({(producers || []).filter(p => p && p.id).length})</option>
                      {(producers || []).filter(p => p && p.id).map(p => (
                        <option key={p.id} value={p.id}>
                          👤 {p.name} {p.city ? `(${p.city}/${p.state})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {(producerSearchTerm || producerFilterId !== 'ALL') && (
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-zinc-400">
                    <span>
                      Exibindo <strong className="text-slate-800 dark:text-zinc-200">{filteredProducers.length}</strong> de {(producers || []).filter(p => p && p.id).length} produtores
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setProducerSearchTerm('');
                        setProducerFilterId('ALL');
                      }}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                    >
                      Limpar filtros
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {(producers || []).filter(p => p && p.id).length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-xs space-y-1">
                  <p className="font-semibold text-slate-600 dark:text-zinc-400">Nenhum produtor rural cadastrado</p>
                  <p>Preencha o formulário abaixo para registrar os dados do primeiro produtor.</p>
                </div>
              ) : filteredProducers.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-xs space-y-2">
                  <p className="font-semibold text-slate-600 dark:text-zinc-300">Nenhum produtor encontrado com os filtros aplicados</p>
                  <p className="text-[11px]">Tente outros termos de busca ou selecione "Todos os Produtores" na lista suspensa.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setProducerSearchTerm('');
                      setProducerFilterId('ALL');
                    }}
                    className="mt-1 px-3 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold rounded text-xs transition-colors cursor-pointer"
                  >
                    Limpar pesquisa
                  </button>
                </div>
              ) : (
                filteredProducers.map(p => (
                <div key={p.id} className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80 last:border-0 hover:bg-slate-50/60 dark:hover:bg-zinc-900/40 p-2.5 rounded-lg transition-colors">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{p.name}</h4>
                      {p.document && (
                        <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-1.5 py-0.5 rounded font-mono font-medium border border-slate-200 dark:border-zinc-700">
                          {p.documentType}: {p.document}
                        </span>
                      )}
                      {p.stateRegistration && (
                        <span className="text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-mono font-medium border border-blue-200 dark:border-blue-900">
                          IE: {p.stateRegistration}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                      {p.city ? `${p.city}/${p.state}` : p.state || 'Localidade não informada'}
                      {p.phone ? ` • 📞 ${p.phone}` : ''}
                      {p.email ? ` • ✉️ ${p.email}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start shrink-0">
                    <span className="text-[11px] bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-semibold border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                      {(farms || []).filter(f => f?.producerId === p.id).length} fazenda(s)
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingProducer(p)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer"
                      title="Editar produtor"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const linkedFarmsCount = (farms || []).filter(f => f?.producerId === p.id).length;
                        setDeleteTarget({
                          type: 'producer',
                          id: p.id,
                          name: p.name,
                          warningText:
                            linkedFarmsCount > 0
                              ? `${linkedFarmsCount} fazenda(s) cadastrada(s) estão vinculadas a este produtor.`
                              : undefined,
                        });
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer"
                      title="Excluir produtor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )))}
            </div>
          </div>

          {/* Card 2: Novo Produtor Rural (Abaixo de Produtores Cadastrados) */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 shadow-xs transition-colors">
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Novo Produtor Rural
            </h3>
            <form onSubmit={handleAddProducer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Nome Completo / Razão Social *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva / Agropecuária Santos"
                    value={newProdName}
                    onChange={e => setNewProdName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">CPF ou CNPJ</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={newProdDoc}
                    onChange={e => setNewProdDoc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Inscrição Estadual (IE)</label>
                  <input
                    type="text"
                    placeholder="Ex: 13.555.444-1 ou Isento"
                    value={newProdStateRegistration}
                    onChange={e => setNewProdStateRegistration(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Telefone</label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={newProdPhone}
                    onChange={e => setNewProdPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="email@fazenda.com"
                    value={newProdEmail}
                    onChange={e => setNewProdEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Município</label>
                  <input
                    type="text"
                    placeholder="Ex: Sorriso"
                    value={newProdCity}
                    onChange={e => setNewProdCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">UF</label>
                  <select
                    aria-label="UF do Produtor"
                    value={newProdState}
                    onChange={e => setNewProdState(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {BRAZIL_STATES.map(st => (
                      <option key={st.uf} value={st.uf}>{st.uf} - {st.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetProducerForm}
                  className="px-4 py-2.5 min-h-[42px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-semibold text-xs rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Limpar campos deste formulário"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Limpar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 min-h-[42px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Cadastrar Produtor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: RESPONSÁVEIS TÉCNICOS */}
      {subTab === 'agronomos' && (
        <div className="space-y-6">
          {/* Card 1: Responsáveis Técnicos Habilitados */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 shadow-xs transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                  Responsáveis Técnicos Habilitados
                </h3>
              </div>
              <span className="text-[11px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold px-2.5 py-1 rounded-full w-fit">
                {(agronomists || []).filter(a => a && a.id).length} profissional(is)
              </span>
            </div>

            {/* Controls: Search Bar & Dropdown Select */}
            {(agronomists || []).filter(a => a && a.id).length > 0 && (
              <div className="space-y-2.5 mb-4 p-3 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 rounded-lg text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  {/* Search bar */}
                  <div className="sm:col-span-7 relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={agronomistSearchTerm}
                      onChange={(e) => setAgronomistSearchTerm(e.target.value)}
                      placeholder="Buscar por nome, CREA/CRMV, profissão, especialidade..."
                      className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-md text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {agronomistSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setAgronomistSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                        title="Limpar busca"
                      >
                        <CloseIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown Selector (Lista Suspensa) */}
                  <div className="sm:col-span-5 relative">
                    <select
                      aria-label="Lista suspensa de responsáveis técnicos"
                      value={agronomistFilterId}
                      onChange={(e) => setAgronomistFilterId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-md text-xs text-slate-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate"
                    >
                      <option value="ALL">📋 Todos os Profissionais ({(agronomists || []).filter(a => a && a.id).length})</option>
                      {(agronomists || []).filter(a => a && a.id).map(a => (
                        <option key={a.id} value={a.id}>
                          🎓 {a.name} ({a.councilType || 'CREA'}-{a.creaState || 'MT'} | {a.profession || 'Eng. Agrônomo'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {(agronomistSearchTerm || agronomistFilterId !== 'ALL') && (
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-zinc-400">
                    <span>
                      Exibindo <strong className="text-slate-800 dark:text-zinc-200">{filteredAgronomists.length}</strong> de {(agronomists || []).filter(a => a && a.id).length} profissionais
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAgronomistSearchTerm('');
                        setAgronomistFilterId('ALL');
                      }}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                    >
                      Limpar filtros
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              {(agronomists || []).filter(a => a && a.id).length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-xs space-y-1">
                  <p className="font-semibold text-slate-600 dark:text-zinc-400">Nenhum responsável técnico cadastrado</p>
                  <p>Preencha o formulário abaixo para registrar Agrônomos, Veterinários ou Zootecnistas para emissão de laudos e receituários.</p>
                </div>
              ) : filteredAgronomists.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-xs space-y-2">
                  <p className="font-semibold text-slate-600 dark:text-zinc-300">Nenhum profissional encontrado com os filtros aplicados</p>
                  <p className="text-[11px]">Tente outros termos de busca ou selecione "Todos os Profissionais" na lista suspensa.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setAgronomistSearchTerm('');
                      setAgronomistFilterId('ALL');
                    }}
                    className="mt-1 px-3 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold rounded text-xs transition-colors cursor-pointer"
                  >
                    Limpar pesquisa
                  </button>
                </div>
              ) : (
                filteredAgronomists.map(a => {
                const isVet = a.profession?.toLowerCase().includes('veterin') || a.councilType === 'CRMV';
                return (
                  <div key={a.id} className="p-4 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{a.name}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            isVet
                              ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                              : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          }`}>
                            {a.profession || 'Engenheiro Agrônomo'}
                          </span>
                          {isVet && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                              <Stethoscope className="w-3 h-3" />
                              Prescritor Habilitado (CRMV)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                          {a.councilType || 'CREA'}-{a.creaState}: {a.crea} {a.rnp ? `• RNP/Reg.: ${a.rnp}` : ''}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-zinc-400 pt-1">
                          {a.cpf && <div><strong>CPF:</strong> {a.cpf}</div>}
                          {a.phone && <div><strong>Tel/Whats:</strong> {a.phone}</div>}
                          {a.email && <div><strong>E-mail:</strong> {a.email}</div>}
                          {(a.clinicAddress || a.address) && (
                            <div className="sm:col-span-2 lg:col-span-3 text-slate-500 dark:text-zinc-400">
                              <strong>Endereço Clínico/Profissional:</strong> {a.clinicAddress || a.address}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 pt-0.5">
                          <strong>Especialidade:</strong> {a.specialty}
                        </p>
                        {a.signatureText && (
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                            Assinatura: {a.signatureText}
                          </p>
                        )}

                        {isVet && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (setActiveTab) setActiveTab('bulario_vet');
                                if (setActiveSubTab) setActiveSubTab('receituario');
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Emitir Receituário Veterinário com este RT</span>
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 self-start shrink-0">
                        <span className="text-[10px] bg-slate-900 dark:bg-zinc-800 text-slate-100 px-2 py-0.5 rounded font-mono whitespace-nowrap">
                          RT Ativo
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingAgronomist(a)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer"
                          title="Editar Responsável Técnico"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const linkedFarmsCount = (farms || []).filter(f => f?.agronomistId === a.id).length;
                            setDeleteTarget({
                              type: 'agronomist',
                              id: a.id,
                              name: a.name,
                              warningText:
                                linkedFarmsCount > 0
                                  ? `${linkedFarmsCount} fazenda(s) cadastrada(s) contam com este profissional como Responsável Técnico.`
                                  : undefined,
                            });
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer"
                          title="Excluir Responsável Técnico"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {a.hasDigitalSignature && (
                      <div className="mt-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded p-1.5 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Assinatura Digital Válida</p>
                          <p className="text-[9px] text-emerald-600/80 dark:text-emerald-500/80 font-mono">{a.legalSignatureHash}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }))}
            </div>
          </div>

          {/* Card 2: Novo Responsável Técnico (RT) (Abaixo de Habilitados) */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 shadow-xs transition-colors">
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Novo Responsável Técnico (RT)
            </h3>
            <form onSubmit={handleAddAgronomist} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Nome Completo do Profissional *</label>
                  <input
                    type="text"
                    required
                    placeholder={newAgroProfession.toLowerCase().includes('veterin') ? "Ex: Dra. Juliana Menezes" : "Ex: Carlos Eduardo Silveira"}
                    value={newAgroName}
                    onChange={e => setNewAgroName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Profissão / Categoria *</label>
                  <select
                    aria-label="Profissão do Responsável Técnico"
                    value={newAgroProfession}
                    onChange={e => handleNewAgroProfessionChange(e.target.value as TechnicalProfession)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {TECHNICAL_PROFESSIONS.map(p => (
                      <option key={p.role} value={p.role}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Conselho de Classe *</label>
                  <select
                    aria-label="Conselho de Classe"
                    value={newAgroCouncilType}
                    onChange={e => setNewAgroCouncilType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="CREA">CREA (Engenharia & Agronomia)</option>
                    <option value="CRMV">CRMV (Veterinária & Zootecnia)</option>
                    <option value="CFTA">CFTA (Técnicos Agrícolas)</option>
                    <option value="CFT">CFT (Técnicos Industriais/Agro)</option>
                    <option value="CRBio">CRBio (Biólogos)</option>
                    <option value="Outro">Outro Conselho</option>
                  </select>
                </div>
              </div>

              {/* Informative integration banner for veterinarians */}
              {(newAgroProfession.toLowerCase().includes('veterin') || newAgroCouncilType === 'CRMV') && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-2.5">
                  <Stethoscope className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-blue-900 dark:text-blue-200 leading-normal">
                    <strong>Integração com Receituário Veterinário:</strong> Ao cadastrar este Médico Veterinário, o CRMV, CPF, telefone e endereço clínico serão sincronizados automaticamente nas prescrições e receituários oficiais.
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Registro no {newAgroCouncilType || 'Conselho'} *</label>
                  <input
                    type="text"
                    required
                    placeholder={newAgroCouncilType === 'CRMV' ? "Ex: 12.845/VP" : "Ex: 145.892/D"}
                    value={newAgroCrea}
                    onChange={e => setNewAgroCrea(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">UF {newAgroCouncilType || 'Conselho'}</label>
                  <select
                    aria-label="UF do Conselho"
                    value={newAgroCreaState}
                    onChange={e => setNewAgroCreaState(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {BRAZIL_STATES.map(st => (
                      <option key={st.uf} value={st.uf}>{st.uf} - {st.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">RNP / Reg. Nacional</label>
                  <input
                    type="text"
                    placeholder="RNP ou código federal"
                    value={newAgroRnp}
                    onChange={e => setNewAgroRnp(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">CPF / Documento</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={newAgroCpf}
                    onChange={e => setNewAgroCpf(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Especialidade / Área de Foco</label>
                  <input
                    type="text"
                    value={newAgroSpecialty}
                    onChange={e => setNewAgroSpecialty(e.target.value)}
                    placeholder="Ex: Sanidade Animal, Clínica Veterinária & Reprodução"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Celular / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={newAgroPhone}
                    onChange={e => setNewAgroPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="profissional@consultoria.com.br"
                    value={newAgroEmail}
                    onChange={e => setNewAgroEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                    Endereço da Clínica / Consultório / Domicílio Profissional
                  </label>
                  <input
                    type="text"
                    placeholder={
                      newAgroProfession.toLowerCase().includes('veterin')
                        ? "Ex: Av. dos Produtores Rurais, 1420 - Centro Clínico Veterinário"
                        : "Ex: Av. Agrícola, 500 - Sala 302"
                    }
                    value={newAgroAddress}
                    onChange={e => setNewAgroAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="agroSig"
                    checked={newAgroHasSignature}
                    onChange={(e) => setNewAgroHasSignature(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="agroSig" className="text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer">
                    Habilitar Assinatura Digital (e-CPF/A1)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetAgronomistForm}
                    className="px-4 py-2.5 min-h-[42px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-semibold text-xs rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Limpar campos deste formulário"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 min-h-[42px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Cadastrar Responsável Técnico
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: EMPRESAS */}
      {subTab === 'empresas' && (
        <div className="space-y-6">
          {/* Card 1: Empresas & Consultorias Agronômicas */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 shadow-xs transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                  Empresas & Consultorias Agronômicas
                </h3>
              </div>
              <span className="text-[11px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold px-2.5 py-1 rounded-full w-fit">
                {(companies || []).filter(c => c && c.id).length} empresa(s)
              </span>
            </div>

            {/* Controls: Search Bar & Dropdown Select */}
            {(companies || []).filter(c => c && c.id).length > 0 && (
              <div className="space-y-2.5 mb-4 p-3 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 rounded-lg text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  {/* Search bar */}
                  <div className="sm:col-span-7 relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={companySearchTerm}
                      onChange={(e) => setCompanySearchTerm(e.target.value)}
                      placeholder="Buscar por Razão Social, Nome Fantasia, CNPJ, CREA PJ, cidade..."
                      className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-md text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {companySearchTerm && (
                      <button
                        type="button"
                        onClick={() => setCompanySearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                        title="Limpar busca"
                      >
                        <CloseIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown Selector (Lista Suspensa) */}
                  <div className="sm:col-span-5 relative">
                    <select
                      aria-label="Lista suspensa de empresas e consultorias"
                      value={companyFilterId}
                      onChange={(e) => setCompanyFilterId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-md text-xs text-slate-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate"
                    >
                      <option value="ALL">📋 Todas as Empresas/Consultorias ({(companies || []).filter(c => c && c.id).length})</option>
                      {(companies || []).filter(c => c && c.id).map(c => (
                        <option key={c.id} value={c.id}>
                          🏢 {c.name} {c.tradingName ? `(${c.tradingName})` : ''} - {c.city || 'S/M'}/{c.state || 'UF'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {(companySearchTerm || companyFilterId !== 'ALL') && (
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-zinc-400">
                    <span>
                      Exibindo <strong className="text-slate-800 dark:text-zinc-200">{filteredCompanies.length}</strong> de {(companies || []).filter(c => c && c.id).length} empresas
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCompanySearchTerm('');
                        setCompanyFilterId('ALL');
                      }}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                    >
                      Limpar filtros
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              {(companies || []).filter(c => c && c.id).length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-xs space-y-1">
                  <p className="font-semibold text-slate-600 dark:text-zinc-400">Nenhuma empresa/consultoria cadastrada</p>
                  <p>Preencha o formulário abaixo para registrar os dados cadastrais da empresa e fazer o upload do logotipo oficial.</p>
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-xs space-y-2">
                  <p className="font-semibold text-slate-600 dark:text-zinc-300">Nenhuma empresa ou consultoria encontrada com os filtros aplicados</p>
                  <p className="text-[11px]">Tente outros termos de busca ou selecione "Todas as Empresas/Consultorias" na lista suspensa.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setCompanySearchTerm('');
                      setCompanyFilterId('ALL');
                    }}
                    className="mt-1 px-3 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold rounded text-xs transition-colors cursor-pointer"
                  >
                    Limpar pesquisa
                  </button>
                </div>
              ) : (
                filteredCompanies.map(c => (
                <div key={c.id} className="p-4 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors space-y-2 relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {c.logoUrl ? (
                        <div className="w-12 h-12 rounded-lg bg-white p-1 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                          <img
                            src={c.logoUrl}
                            alt={c.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black text-sm shrink-0 border border-emerald-200 dark:border-emerald-800/80">
                          {c.name ? c.name.slice(0, 2).toUpperCase() : 'CO'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{c.name}</h4>
                          {c.logoUrl && (
                            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.2 rounded">
                              Com Logo
                            </span>
                          )}
                        </div>
                        {c.tradingName && (
                          <p className="text-xs text-slate-600 dark:text-zinc-400">Nome Fantasia: {c.tradingName}</p>
                        )}
                        <p className="text-xs text-slate-600 dark:text-zinc-400 font-mono">
                          {c.cnpj ? `CNPJ: ${c.cnpj}` : ''} {c.creaRegister ? `• Registro CREA PJ: ${c.creaRegister}` : ''}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          {[c.address, c.city && c.state ? `${c.city}/${c.state}` : c.city || c.state, c.phone].filter(Boolean).join(' • ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingCompany(c)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer"
                        title="Editar empresa"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const linkedFarmsCount = (farms || []).filter(f => f?.companyId === c.id).length;
                          setDeleteTarget({
                            type: 'company',
                            id: c.id,
                            name: c.name,
                            warningText:
                              linkedFarmsCount > 0
                                ? `${linkedFarmsCount} fazenda(s) cadastrada(s) associadas a esta empresa.`
                                : undefined,
                          });
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer"
                        title="Excluir empresa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  {c.hasDigitalSignature && (
                    <div className="mt-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded p-1.5 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Assinatura Digital (e-CNPJ) Habilitada</p>
                        <p className="text-[9px] text-emerald-600/80 dark:text-emerald-500/80 font-mono">{c.legalSignatureHash}</p>
                      </div>
                    </div>
                  )}
                </div>
              )))}
            </div>
          </div>

          {/* Card 2: Nova Empresa / Consultoria (Abaixo de Empresas Cadastradas) */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 shadow-xs transition-colors">
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Nova Empresa / Consultoria
            </h3>
            <form onSubmit={handleAddCompany} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Razão Social *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: AgroConsultoria Planejamento Ltda"
                    value={newCompName}
                    onChange={e => setNewCompName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    placeholder="Ex: AgroConsult"
                    value={newCompTrading}
                    onChange={e => setNewCompTrading(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">CNPJ</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={newCompCnpj}
                    onChange={e => setNewCompCnpj(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Registro CREA PJ</label>
                  <input
                    type="text"
                    placeholder="CREA-MT PJ-000"
                    value={newCompCrea}
                    onChange={e => setNewCompCrea(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Município</label>
                  <input
                    type="text"
                    value={newCompCity}
                    onChange={e => setNewCompCity(e.target.value)}
                    placeholder="Ex: Cuiabá"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">UF</label>
                  <select
                    aria-label="UF da Empresa"
                    value={newCompState}
                    onChange={e => setNewCompState(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {BRAZIL_STATES.map(st => (
                      <option key={st.uf} value={st.uf}>{st.uf} - {st.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Logotipo da Empresa / Consultoria */}
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Logotipo da Empresa / Consultoria</span>
                  </label>
                  {newCompLogo && (
                    <button
                      type="button"
                      onClick={() => setNewCompLogo('')}
                      className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CloseIcon className="w-3 h-3" />
                      Remover Logo
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  O logotipo será inserido no cabeçalho oficial de <strong>laudos técnicos, relatórios agronômicos e receituários veterinários</strong> emitidos.
                </p>

                {newCompLogo ? (
                  <div className="flex items-center gap-3 p-2.5 bg-white dark:bg-zinc-950 rounded-lg border border-emerald-300 dark:border-emerald-800/80">
                    <div className="w-16 h-16 rounded-md bg-slate-50 dark:bg-zinc-900 p-1 border border-slate-200 dark:border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={newCompLogo}
                        alt="Pré-visualização do logotipo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Logotipo carregado</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                        Pronto para emissão de laudos e receituários
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-lg bg-white dark:bg-zinc-950 cursor-pointer transition-colors text-center group">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mb-1 transition-colors" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                        Clique ou arraste a imagem do logotipo
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        PNG, JPG, SVG ou WebP (recomendado fundo transparente)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 4 * 1024 * 1024) {
                              alert('Por favor, selecione uma imagem com menos de 4MB.');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (typeof event.target?.result === 'string') {
                                setNewCompLogo(event.target.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    {/* URL Option input fallback */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Ou URL:</span>
                      <input
                        type="url"
                        placeholder="https://exemplo.com/logo.png"
                        value={newCompLogo}
                        onChange={(e) => setNewCompLogo(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-[11px] border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="compSig"
                    checked={newCompHasSignature}
                    onChange={(e) => setNewCompHasSignature(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="compSig" className="text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer">
                    Habilitar Assinatura Digital Jurídica (e-CNPJ)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetCompanyForm}
                    className="px-4 py-2.5 min-h-[42px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-semibold text-xs rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Limpar campos deste formulário"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 min-h-[42px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Cadastrar Empresa
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Farm Modal */}
      <EditFarmModal
        isOpen={!!editingFarm}
        farm={editingFarm}
        producers={producers}
        agronomists={agronomists}
        companies={companies}
        onSave={handleSaveEditFarm}
        onClose={() => setEditingFarm(null)}
      />

      {/* Edit Plot Modal */}
      <EditPlotModal
        isOpen={!!editingPlot}
        plot={editingPlot}
        onSave={handleSaveEditPlot}
        onClose={() => setEditingPlot(null)}
      />

      {/* Edit Producer Modal */}
      <EditProducerModal
        isOpen={!!editingProducer}
        producer={editingProducer}
        companies={companies}
        onSave={handleSaveEditProducer}
        onClose={() => setEditingProducer(null)}
      />

      {/* Edit Agronomist Modal */}
      <EditAgronomistModal
        isOpen={!!editingAgronomist}
        agronomist={editingAgronomist}
        companies={companies}
        onSave={handleSaveEditAgronomist}
        onClose={() => setEditingAgronomist(null)}
      />

      {/* Edit Company Modal */}
      <EditCompanyModal
        isOpen={!!editingCompany}
        company={editingCompany}
        onSave={handleSaveEditCompany}
        onClose={() => setEditingCompany(null)}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title={`Excluir ${
          deleteTarget?.type === 'farm'
            ? 'Fazenda'
            : deleteTarget?.type === 'plot'
            ? 'Talhão'
            : deleteTarget?.type === 'producer'
            ? 'Produtor Rural'
            : deleteTarget?.type === 'agronomist'
            ? 'Agrônomo RT'
            : 'Empresa'
        }`}
        itemName={deleteTarget?.name || ''}
        itemType={
          deleteTarget?.type === 'farm'
            ? 'Fazenda'
            : deleteTarget?.type === 'plot'
            ? 'Talhão'
            : deleteTarget?.type === 'producer'
            ? 'Produtor Rural'
            : deleteTarget?.type === 'agronomist'
            ? 'Agrônomo RT'
            : 'Empresa'
        }
        warningText={deleteTarget?.warningText}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
