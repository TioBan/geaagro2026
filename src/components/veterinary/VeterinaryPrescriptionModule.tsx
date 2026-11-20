import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Printer,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  User,
  Syringe,
  Pill,
  BookOpen,
  Sparkles,
  Check,
  X,
  ShieldCheck,
  Stethoscope,
  Copy,
  RefreshCw,
  HardDrive,
} from 'lucide-react';
import {
  VeterinaryProduct,
  VeterinaryPrescription,
  PrescriptionItem,
  PrescriptionType,
  PrescriptionStatus,
  ClinicalProtocolTemplate,
} from '../../types/veterinaryBulario';
import { Farm, RuralProducer, Agronomist, Company } from '../../types/agronomy';
import {
  ALL_VETERINARY_PRODUCTS,
  PRODUCT_CATEGORIES,
  calculateProductDose,
} from '../../data/veterinaryBularioDatabase';
import { CLINICAL_PROTOCOLS } from '../../data/veterinaryProtocols';
import { VeterinaryPrescriptionPrintModal } from './VeterinaryPrescriptionPrintModal';

export type PrescriptionSubView = 'emitir' | 'historico' | 'protocolos';

export interface VeterinaryPrescriptionModuleProps {
  isDarkMode?: boolean;
  companies?: Company[];
  farms?: Farm[];
  producers?: RuralProducer[];
  agronomists?: Agronomist[];
  setAgronomists?: React.Dispatch<React.SetStateAction<Agronomist[]>>;
  initialProductToPrescribe?: VeterinaryProduct | null;
  onClearInitialProduct?: () => void;
  onNavigateToBulario?: () => void;
  onNavigateToCadastros?: () => void;
  activeSubView?: PrescriptionSubView;
  onSubViewChange?: (view: PrescriptionSubView) => void;
}

const STORAGE_KEY = 'agronutri_vet_prescriptions';

const generateRxNumber = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `RX-VET-${year}-${randomNum}`;
};

const defaultValidDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
};

const PRESCRIPTION_TYPES: {
  id: PrescriptionType;
  title: string;
  desc: string;
  tag: string;
}[] = [
  {
    id: 'simples',
    title: 'Receituário Simples',
    desc: 'Medicamentos gerais, vacinas, suplementos e antiparasitários.',
    tag: 'Via Única',
  },
  {
    id: 'controle_especial',
    title: 'Controle Especial (2 Vias)',
    desc: 'Antimicrobianos, antibióticos, anestésicos e controlados.',
    tag: '1ª Via Farmácia · 2ª Via Produtor',
  },
  {
    id: 'notificacao_receita',
    title: 'Notificação de Receita',
    desc: 'Entorpecentes e psicotrópicos veterinários (Portaria 344/98).',
    tag: 'Retenção Obrigatória',
  },
  {
    id: 'orientacao_manejo',
    title: 'Guia de Orientação / Manejo',
    desc: 'Protocolos preventivos de vacinação, vermifugação e biossegurança.',
    tag: 'Planejamento Sanitário',
  },
];

const inputClass =
  'w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500';

const textareaClass =
  'w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500';

const labelClass = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const VeterinaryPrescriptionModule: React.FC<VeterinaryPrescriptionModuleProps> = ({
  companies = [],
  farms = [],
  producers = [],
  agronomists = [],
  setAgronomists,
  initialProductToPrescribe,
  onClearInitialProduct,
  onNavigateToBulario,
  onNavigateToCadastros,
  activeSubView,
  onSubViewChange,
}) => {
  const [internalView, setInternalView] = useState<PrescriptionSubView>(activeSubView || 'emitir');
  const activeView = activeSubView || internalView;

  useEffect(() => {
    if (activeSubView) {
      setInternalView(activeSubView);
    }
  }, [activeSubView]);

  const setActiveView = (view: PrescriptionSubView) => {
    setInternalView(view);
    if (onSubViewChange) onSubViewChange(view);
  };

  // Stored Prescriptions History
  const [prescriptions, setPrescriptions] = useState<VeterinaryPrescription[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading prescriptions from localStorage', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prescriptions));
    } catch (e) {
      console.error('Error saving prescriptions to localStorage', e);
    }
  }, [prescriptions]);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    () => farms[0]?.companyId || companies[0]?.id || ''
  );

  const currentCompany = useMemo(() => {
    return (
      companies.find((c) => c.id === selectedCompanyId) ||
      (farms[0]?.companyId ? companies.find((c) => c.id === farms[0].companyId) : undefined) ||
      companies[0]
    );
  }, [companies, selectedCompanyId, farms]);

  // Active Prescription Form State
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<string | null>(null);
  const [prescriptionType, setPrescriptionType] = useState<PrescriptionType>('simples');
  const [prescriptionNumber, setPrescriptionNumber] = useState<string>(generateRxNumber);
  const [prescriptionDate, setPrescriptionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [validUntilDate, setValidUntilDate] = useState<string>(defaultValidDate);

  // Prescriber (Veterinarian)
  const [selectedVetId, setSelectedVetId] = useState<string>('');
  const [vetName, setVetName] = useState<string>('Dra. Mariana Costa Silva');
  const [vetCrmv, setVetCrmv] = useState<string>('18.420');
  const [vetCrmvState, setVetCrmvState] = useState<string>('MG');
  const [vetCpf, setVetCpf] = useState<string>('084.921.346-52');
  const [vetPhone, setVetPhone] = useState<string>('(31) 99876-5432');
  const [vetEmail, setVetEmail] = useState<string>('mariana.vet@consultoriaagro.com.br');
  const [clinicAddress, setClinicAddress] = useState<string>(
    'Av. dos Produtores Rurais, 1420 - Centro Clínico Veterinário'
  );

  // Farm & Producer Context
  const [selectedFarmId, setSelectedFarmId] = useState<string>(farms[0]?.id || '');
  const [farmName, setFarmName] = useState<string>(farms[0]?.name || 'Fazenda Santa Maria');
  const [producerName, setProducerName] = useState<string>(
    producers[0]?.name || 'Antônio Carlos Ribeiro'
  );
  const [producerCpfCnpj, setProducerCpfCnpj] = useState<string>(
    producers[0]?.document || '123.456.789-00'
  );
  const [producerPhone, setProducerPhone] = useState<string>(
    producers[0]?.phone || '(34) 99123-4567'
  );
  const [location, setLocation] = useState<string>(
    farms[0]?.city ? `${farms[0].city}/${farms[0].state}` : 'Uberaba/MG'
  );

  // Animal / Herd
  const [species, setSpecies] = useState<string>('Bovinos');
  const [breed, setBreed] = useState<string>('Nelore / Holandês');
  const [animalIdentifier, setAnimalIdentifier] = useState<string>('Lote de Lactação #03 / Brinco 402');
  const [estimatedWeightKg, setEstimatedWeightKg] = useState<number>(450);
  const [animalCount, setAnimalCount] = useState<number>(1);
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState<string>(
    'Mastite Clínica / Terapia Antimicrobiana e Analgésica'
  );
  const [anamneseNotes, setAnamneseNotes] = useState<string>(
    'Animal apresentando febre (39.8°C), edema do quarto anterior direito e grumos na prova do fundo escuro.'
  );

  const [items, setItems] = useState<PrescriptionItem[]>([]);

  // Special Control (Comprador)
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerDocument, setBuyerDocument] = useState<string>('');
  const [buyerAddress, setBuyerAddress] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [generalInstructions, setGeneralInstructions] = useState<string>(
    'Respeitar rigorosamente o período de carência legal de carne e leite. Manter os medicamentos em local seco, fresco (15°C a 30°C) e ao abrigo da luz solar direta.'
  );

  // Product Selection Modal
  const [productSearchModalOpen, setProductSearchModalOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSearchCategory, setProductSearchCategory] = useState('all');
  const [productSearchManufacturer, setProductSearchManufacturer] = useState('all');

  // Customize Item Modal
  const [tempProduct, setTempProduct] = useState<VeterinaryProduct | null>(null);
  const [tempDose, setTempDose] = useState('');
  const [tempRoute, setTempRoute] = useState('');
  const [tempFrequency, setTempFrequency] = useState('A cada 24 horas');
  const [tempDuration, setTempDuration] = useState(3);
  const [tempQuantity, setTempQuantity] = useState('1 frasco');
  const [tempInstructions, setTempInstructions] = useState('');

  // Print Modal & UI Feedback
  const [printModalPrescription, setPrintModalPrescription] = useState<VeterinaryPrescription | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Sync with registered Veterinarians / RTs
  useEffect(() => {
    if (!agronomists || agronomists.length === 0) return;

    if (selectedVetId) {
      const current = agronomists.find((a) => a.id === selectedVetId);
      if (current) {
        setVetName(current.name);
        setVetCrmv(current.crea || current.councilNumber || '');
        setVetCrmvState(current.creaState || 'MT');
        if (current.cpf) setVetCpf(current.cpf);
        if (current.phone) setVetPhone(current.phone);
        if (current.email) setVetEmail(current.email);
        if (current.clinicAddress || current.address) {
          setClinicAddress(current.clinicAddress || current.address || '');
        }
        return;
      }
    }

    const vetRTs = agronomists.filter(
      (a) =>
        a.profession?.toLowerCase().includes('veterin') ||
        a.councilType === 'CRMV' ||
        a.specialty?.toLowerCase().includes('veterin')
    );

    const targetVet = vetRTs.length > 0 ? vetRTs[0] : agronomists[0];
    if (targetVet && !selectedVetId) {
      setSelectedVetId(targetVet.id);
      setVetName(targetVet.name);
      setVetCrmv(targetVet.crea || targetVet.councilNumber || '');
      setVetCrmvState(targetVet.creaState || 'MT');
      if (targetVet.cpf) setVetCpf(targetVet.cpf);
      if (targetVet.phone) setVetPhone(targetVet.phone);
      if (targetVet.email) setVetEmail(targetVet.email);
      if (targetVet.clinicAddress || targetVet.address) {
        setClinicAddress(targetVet.clinicAddress || targetVet.address || '');
      }
    }
  }, [agronomists, selectedVetId]);

  const handleSelectRT = (id: string) => {
    setSelectedVetId(id);
    if (!id) return;
    const vet = agronomists.find((a) => a.id === id);
    if (vet) {
      setVetName(vet.name);
      setVetCrmv(vet.crea || vet.councilNumber || '');
      setVetCrmvState(vet.creaState || 'MT');
      setVetCpf(vet.cpf || '');
      setVetPhone(vet.phone || '');
      setVetEmail(vet.email || '');
      setClinicAddress(vet.clinicAddress || vet.address || clinicAddress);
      showToast(`Dados de ${vet.name} importados do Cadastro Técnico.`);
    }
  };

  const handleSaveToRT = () => {
    if (!setAgronomists) return;
    if (!vetName.trim()) {
      setValidationError('Preencha o nome do Médico Veterinário antes de salvar no Cadastro Técnico.');
      return;
    }

    setAgronomists((prev) => {
      const existingIndex = prev.findIndex((a) => a.id === selectedVetId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          name: vetName.trim(),
          crea: vetCrmv.trim(),
          councilNumber: vetCrmv.trim(),
          creaState: vetCrmvState.trim(),
          cpf: vetCpf.trim(),
          phone: vetPhone.trim(),
          email: vetEmail.trim(),
          address: clinicAddress.trim(),
          clinicAddress: clinicAddress.trim(),
        };
        return updated;
      }

      const newId = `vet-${Date.now()}`;
      setSelectedVetId(newId);
      const newVet: Agronomist = {
        id: newId,
        name: vetName.trim(),
        profession: 'Médico Veterinário',
        councilType: 'CRMV',
        crea: vetCrmv.trim(),
        councilNumber: vetCrmv.trim(),
        creaState: vetCrmvState.trim(),
        rnp: `CRMV-${vetCrmvState}-${vetCrmv.trim()}`,
        cpf: vetCpf.trim() || '000.000.000-00',
        email: vetEmail.trim(),
        phone: vetPhone.trim(),
        address: clinicAddress.trim(),
        clinicAddress: clinicAddress.trim(),
        companyId: '',
        specialty: 'Sanidade Animal, Clínica & Reprodução',
        signatureText: `${vetName.trim()} - Méd. Vet. CRMV-${vetCrmvState} ${vetCrmv.trim()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      return [...prev, newVet];
    });

    setValidationError(null);
    showToast('Dados do Médico Veterinário sincronizados com o Cadastro Técnico.');
  };

  // Sync farm changes
  useEffect(() => {
    if (!selectedFarmId) return;
    const f = farms.find((farm) => farm.id === selectedFarmId);
    if (!f) return;
    setFarmName(f.name);
    setLocation(`${f.city || ''}/${f.state || ''}`);
    const p = producers.find((prod) => prod.id === f.producerId);
    if (p) {
      setProducerName(p.name);
      setProducerCpfCnpj(p.document || '');
      setProducerPhone(p.phone || '');
    }
  }, [selectedFarmId, farms, producers]);

  // Open product customization modal
  const handleSelectProductToAdd = (prod: VeterinaryProduct) => {
    setTempProduct(prod);
    const calculated = calculateProductDose(prod, species, estimatedWeightKg);
    setTempDose(calculated ? calculated.doseFormatted : prod.dosage || 'Conforme indicação');
    setTempRoute(prod.administrationRoute || 'Intramuscular profunda (IM)');
    setTempFrequency('A cada 24 horas');
    setTempDuration(3);
    setTempQuantity(`01 ${prod.presentation || 'Frasco'}`);
    setTempInstructions(
      `Administrar com agulha e seringa estéreis. Carência: Abate (${prod.gracePeriodMeat || 'N/A'}), Leite (${prod.gracePeriodMilk || 'N/A'}).`
    );
  };

  // Handle incoming product from Bulário or Calculator
  useEffect(() => {
    if (initialProductToPrescribe) {
      setActiveView('emitir');
      handleSelectProductToAdd(initialProductToPrescribe);
      if (onClearInitialProduct) onClearInitialProduct();
    }
  }, [initialProductToPrescribe]);

  const handleConfirmAddItem = () => {
    if (!tempProduct) return;
    const newItem: PrescriptionItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      productId: tempProduct.id,
      productName: tempProduct.name,
      activeIngredient: `${tempProduct.activeIngredient}${tempProduct.concentration ? ` (${tempProduct.concentration})` : ''}`,
      presentation: tempProduct.presentation,
      manufacturer: tempProduct.manufacturer,
      targetSpecies: species,
      bodyWeightKg: estimatedWeightKg,
      calculatedDose: tempDose,
      route: tempRoute,
      frequency: tempFrequency,
      durationDays: tempDuration,
      totalQuantityNeeded: tempQuantity,
      instructions: tempInstructions,
      meatGracePeriod: tempProduct.gracePeriodMeat || 'N/A',
      milkGracePeriod: tempProduct.gracePeriodMilk || 'N/A',
      eggsGracePeriod: tempProduct.gracePeriodEggs || 'N/A',
    };

    setItems((prev) => [...prev, newItem]);
    setTempProduct(null);
    setProductSearchModalOpen(false);
    setValidationError(null);
    showToast(`"${tempProduct.name}" adicionado à receita.`);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApplyProtocol = (proto: ClinicalProtocolTemplate) => {
    setPrescriptionType(proto.prescriptionType);
    setClinicalDiagnosis(proto.suggestedDiagnosis);
    setAnamneseNotes(proto.description);
    if ((proto.targetSpecies || []).length > 0) {
      setSpecies(proto.targetSpecies[0]);
    }
    const mappedItems: PrescriptionItem[] = (proto.items || []).map((item, idx) => ({
      ...item,
      id: `proto-item-${Date.now()}-${idx}`,
      bodyWeightKg: item.bodyWeightKg || estimatedWeightKg,
    }));
    setItems(mappedItems);
    if (proto.generalNotes) {
      setGeneralInstructions(proto.generalNotes);
    }
    setValidationError(null);
    setActiveView('emitir');
    showToast(`Protocolo "${proto.title}" carregado.`);
  };

  const summaryGracePeriods = useMemo(() => {
    const meat = items
      .map((it) => it.meatGracePeriod)
      .filter((g) => g && g !== 'N/A' && g !== 'Zero dias' && g !== 'Zero horas')
      .join(' | ');
    const milk = items
      .map((it) => it.milkGracePeriod)
      .filter((g) => g && g !== 'N/A' && g !== 'Zero dias' && g !== 'Zero horas')
      .join(' | ');
    return {
      meat: meat || 'Sem restrições / Descarte Zero',
      milk: milk || 'Sem restrições / Descarte Zero',
    };
  }, [items]);

  const handleSavePrescription = (status: PrescriptionStatus = 'emitida') => {
    if (items.length === 0) {
      setValidationError('Adicione pelo menos um medicamento à receita antes de salvar ou emitir.');
      return;
    }

    if (!vetName.trim() || !vetCrmv.trim()) {
      setValidationError('Preencha o Nome e o número do CRMV do Médico Veterinário.');
      return;
    }

    setValidationError(null);

    const prescriptionPayload: VeterinaryPrescription = {
      id: editingPrescriptionId || `vet-rx-${Date.now()}`,
      prescriptionNumber,
      date: prescriptionDate,
      validUntil: validUntilDate,
      prescriptionType,
      status,
      veterinarianName: vetName.trim(),
      veterinarianCpf: vetCpf.trim(),
      crmvNumber: vetCrmv.trim(),
      crmvState: vetCrmvState.trim(),
      veterinarianPhone: vetPhone.trim(),
      veterinarianEmail: vetEmail.trim(),
      clinicAddress: clinicAddress.trim(),
      companyId: currentCompany?.id,
      companyName: currentCompany?.tradingName || currentCompany?.name,
      companyLogoUrl: currentCompany?.logoUrl,
      farmId: selectedFarmId,
      farmName: farmName.trim(),
      producerName: producerName.trim(),
      producerCpfCnpj: producerCpfCnpj.trim(),
      producerPhone: producerPhone.trim(),
      location: location.trim(),
      cityState: location.trim(),
      species,
      breed: breed.trim(),
      animalIdentifier: animalIdentifier.trim(),
      estimatedWeightKg,
      animalCount,
      clinicalDiagnosis: clinicalDiagnosis.trim(),
      anamneseNotes: anamneseNotes.trim(),
      items,
      meatGracePeriodSummary: summaryGracePeriods.meat,
      milkGracePeriodSummary: summaryGracePeriods.milk,
      generalInstructions: generalInstructions.trim(),
      buyerName: buyerName.trim() || producerName.trim(),
      buyerDocument: buyerDocument.trim() || producerCpfCnpj.trim(),
      buyerAddress: buyerAddress.trim() || location.trim(),
      buyerPhone: buyerPhone.trim() || producerPhone.trim(),
      createdAt: editingPrescriptionId
        ? prescriptions.find((p) => p.id === editingPrescriptionId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingPrescriptionId) {
      setPrescriptions((prev) =>
        prev.map((p) => (p.id === editingPrescriptionId ? prescriptionPayload : p))
      );
      showToast('Receituário atualizado com sucesso.');
    } else {
      setPrescriptions((prev) => [prescriptionPayload, ...prev]);
      showToast('Receituário salvo no histórico.');
    }

    if (status === 'emitida') {
      setPrintModalPrescription(prescriptionPayload);
    }
  };

  const handleNewPrescription = () => {
    setEditingPrescriptionId(null);
    setPrescriptionNumber(generateRxNumber());
    setPrescriptionDate(new Date().toISOString().split('T')[0]);
    setValidUntilDate(defaultValidDate());
    setItems([]);
    setClinicalDiagnosis('Tratamento Terapêutico Veterinário');
    setAnamneseNotes('');
    setAnimalIdentifier('Lote / Animal #01');
    setValidationError(null);
    setActiveView('emitir');
    showToast('Novo receituário iniciado.');
  };

  const handleEditPrescription = (rx: VeterinaryPrescription) => {
    setEditingPrescriptionId(rx.id);
    setPrescriptionNumber(rx.prescriptionNumber);
    setPrescriptionDate(rx.date);
    setValidUntilDate(rx.validUntil);
    setPrescriptionType(rx.prescriptionType);
    setVetName(rx.veterinarianName);
    setVetCrmv(rx.crmvNumber);
    setVetCrmvState(rx.crmvState);
    if (rx.veterinarianCpf) setVetCpf(rx.veterinarianCpf);
    if (rx.veterinarianPhone) setVetPhone(rx.veterinarianPhone);
    if (rx.veterinarianEmail) setVetEmail(rx.veterinarianEmail);
    if (rx.clinicAddress) setClinicAddress(rx.clinicAddress);
    if (rx.companyId) setSelectedCompanyId(rx.companyId);
    setFarmName(rx.farmName);
    setProducerName(rx.producerName);
    if (rx.producerCpfCnpj) setProducerCpfCnpj(rx.producerCpfCnpj);
    if (rx.producerPhone) setProducerPhone(rx.producerPhone);
    setLocation(rx.location || rx.cityState);
    setSpecies(rx.species);
    if (rx.breed) setBreed(rx.breed);
    setAnimalIdentifier(rx.animalIdentifier);
    if (rx.estimatedWeightKg) setEstimatedWeightKg(rx.estimatedWeightKg);
    if (rx.animalCount) setAnimalCount(rx.animalCount);
    setClinicalDiagnosis(rx.clinicalDiagnosis);
    if (rx.anamneseNotes) setAnamneseNotes(rx.anamneseNotes);
    setItems(rx.items || []);
    if (rx.generalInstructions) setGeneralInstructions(rx.generalInstructions);
    if (rx.buyerName) setBuyerName(rx.buyerName);
    if (rx.buyerDocument) setBuyerDocument(rx.buyerDocument);
    if (rx.buyerAddress) setBuyerAddress(rx.buyerAddress);
    if (rx.buyerPhone) setBuyerPhone(rx.buyerPhone);
    setValidationError(null);
    setActiveView('emitir');
    showToast(`Editando ${rx.prescriptionNumber}.`);
  };

  const handleDuplicatePrescription = (rx: VeterinaryPrescription) => {
    handleEditPrescription(rx);
    setEditingPrescriptionId(null);
    setPrescriptionNumber(generateRxNumber());
    setPrescriptionDate(new Date().toISOString().split('T')[0]);
    showToast('Receita duplicada como nova emissão.');
  };

  const handleDeletePrescription = (id: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
    setConfirmDeleteId(null);
    showToast('Receituário removido do histórico.');
  };

  const distinctManufacturers = useMemo(() => {
    const set = new Set<string>();
    for (const p of ALL_VETERINARY_PRODUCTS) {
      if (p.manufacturer) set.add(p.manufacturer.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
  }, []);

  const modalFilteredProducts = useMemo(() => {
    const q = productSearchQuery.trim().toLowerCase();
    return ALL_VETERINARY_PRODUCTS.filter((p) => {
      if (productSearchCategory !== 'all' && p.category !== productSearchCategory) return false;
      if (
        productSearchManufacturer !== 'all' &&
        p.manufacturer.toLowerCase() !== productSearchManufacturer.toLowerCase()
      ) {
        return false;
      }
      if (q) {
        return (
          p.name.toLowerCase().includes(q) ||
          p.activeIngredient.toLowerCase().includes(q) ||
          p.indications.toLowerCase().includes(q) ||
          p.manufacturer.toLowerCase().includes(q)
        );
      }
      return true;
    }).slice(0, 80);
  }, [productSearchQuery, productSearchCategory, productSearchManufacturer]);

  const showBuyerFields =
    prescriptionType === 'controle_especial' || prescriptionType === 'notificacao_receita';

  return (
    <div className="space-y-4">
      {/* Subtle Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 dark:bg-zinc-800 text-white border border-slate-700 px-3.5 py-2 rounded-lg shadow-lg flex items-center gap-2 text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Compact Sub-View Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Receituário Veterinário Oficial (CFMV / MAPA)
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Prescrição simples, controle especial em 2 vias, protocolos clínicos e histórico arquivado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setActiveView('emitir')}
              className={`h-7 px-2.5 rounded-md font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                activeView === 'emitir'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 shadow-2xs border border-slate-200 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Emitir
            </button>
            <button
              type="button"
              onClick={() => setActiveView('protocolos')}
              className={`h-7 px-2.5 rounded-md font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap tabular-nums ${
                activeView === 'protocolos'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 shadow-2xs border border-slate-200 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Protocolos ({CLINICAL_PROTOCOLS.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveView('historico')}
              className={`h-7 px-2.5 rounded-md font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap tabular-nums ${
                activeView === 'historico'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 shadow-2xs border border-slate-200 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Histórico ({prescriptions.length})
            </button>
          </div>

          {onNavigateToBulario && (
            <button
              type="button"
              onClick={onNavigateToBulario}
              className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Bulário
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: EMITIR RECEITUÁRIO */}
      {activeView === 'emitir' && (
        <div className="space-y-4">
          {validationError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {validationError}
              </span>
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 1. Modalidade e Datas */}
          <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                01. Modalidade e Identificação do Documento
              </span>
              <span className="text-xs font-mono font-semibold text-slate-700 dark:text-zinc-300 tabular-nums">
                Nº {prescriptionNumber}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {PRESCRIPTION_TYPES.map((type) => {
                const active = prescriptionType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setPrescriptionType(type.id)}
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                      active
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 text-slate-900 dark:text-zinc-100'
                        : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold flex items-center justify-between gap-1 text-slate-900 dark:text-zinc-100">
                        <span>{type.title}</span>
                        {active && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-snug">
                        {type.desc}
                      </p>
                    </div>
                    <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                      {type.tag}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className={labelClass}>Data de Emissão</label>
                <input
                  type="date"
                  value={prescriptionDate}
                  onChange={(e) => setPrescriptionDate(e.target.value)}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className={labelClass}>Validade (padrão 30 dias)</label>
                <input
                  type="date"
                  value={validUntilDate}
                  onChange={(e) => setValidUntilDate(e.target.value)}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                    Empresa / Consultoria Emissora
                  </label>
                  {onNavigateToCadastros && (
                    <button
                      type="button"
                      onClick={onNavigateToCadastros}
                      className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Gerenciar
                    </button>
                  )}
                </div>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className={inputClass}
                >
                  {companies.length > 0 ? (
                    companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.cnpj ? `(${c.cnpj})` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="">Nenhuma empresa cadastrada</option>
                  )}
                </select>
              </div>
            </div>
          </section>

          {/* 2 & 3. Prescritor e Propriedade */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Médico Veterinário */}
            <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 inline-flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  02. Médico Veterinário Prescritor (CRMV)
                </span>
                {onNavigateToCadastros && (
                  <button
                    type="button"
                    onClick={onNavigateToCadastros}
                    className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Cadastro Técnico
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center gap-1.5 flex-1">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={selectedVetId}
                    onChange={(e) => handleSelectRT(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Selecionar Responsável Técnico...</option>
                    {agronomists.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.councilType || 'CRMV'}/{a.creaState || 'UF'} {a.crea || a.councilNumber || ''})
                      </option>
                    ))}
                  </select>
                </div>
                {setAgronomists && (
                  <button
                    type="button"
                    onClick={handleSaveToRT}
                    className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center justify-center gap-1 shrink-0 cursor-pointer whitespace-nowrap"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Salvar RT
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Nome Completo *</label>
                  <input
                    type="text"
                    value={vetName}
                    onChange={(e) => setVetName(e.target.value)}
                    placeholder="Ex: Dr. Carlos Eduardo de Paula"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>CRMV / UF *</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={vetCrmv}
                      onChange={(e) => setVetCrmv(e.target.value)}
                      placeholder="14589"
                      className={`${inputClass} w-2/3 tabular-nums`}
                    />
                    <input
                      type="text"
                      value={vetCrmvState}
                      onChange={(e) => setVetCrmvState(e.target.value.toUpperCase())}
                      maxLength={2}
                      placeholder="UF"
                      className={`${inputClass} w-1/3 text-center uppercase`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className={labelClass}>CPF</label>
                  <input
                    type="text"
                    value={vetCpf}
                    onChange={(e) => setVetCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className={`${inputClass} tabular-nums`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={vetPhone}
                    onChange={(e) => setVetPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className={`${inputClass} tabular-nums`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Endereço Profissional / Clínica</label>
                <input
                  type="text"
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                  placeholder="Rua, Número, Bairro, Cidade - UF"
                  className={inputClass}
                />
              </div>
            </section>

            {/* Produtor & Propriedade */}
            <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 inline-flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  03. Produtor Rural &amp; Propriedade
                </span>
                {farms.length > 0 && (
                  <select
                    value={selectedFarmId}
                    onChange={(e) => setSelectedFarmId(e.target.value)}
                    className="h-7 px-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-md text-[11px] text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                  >
                    {farms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.city}/{f.state})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className={labelClass}>Fazenda / Propriedade</label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="Ex: Fazenda Boa Esperança"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Município / UF</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Uberlândia/MG"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className={labelClass}>Produtor / Proprietário</label>
                  <input
                    type="text"
                    value={producerName}
                    onChange={(e) => setProducerName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>CPF / CNPJ</label>
                  <input
                    type="text"
                    value={producerCpfCnpj}
                    onChange={(e) => setProducerCpfCnpj(e.target.value)}
                    placeholder="000.000.000-00"
                    className={`${inputClass} tabular-nums`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Telefone do Produtor</label>
                <input
                  type="text"
                  value={producerPhone}
                  onChange={(e) => setProducerPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className={`${inputClass} tabular-nums`}
                />
              </div>

              {showBuyerFields && (
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className={labelClass}>Comprador (Controle Especial)</label>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="Se diferente do produtor"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>CPF / RG Comprador</label>
                    <input
                      type="text"
                      value={buyerDocument}
                      onChange={(e) => setBuyerDocument(e.target.value)}
                      placeholder="000.000.000-00"
                      className={`${inputClass} tabular-nums`}
                    />
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* 4. Paciente / Lote & Diagnóstico */}
          <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="pb-2.5 border-b border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 inline-flex items-center gap-1.5">
                <Syringe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                04. Identificação dos Animais e Diagnóstico Clínico
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              <div>
                <label className={labelClass}>Espécie Alvo</label>
                <select value={species} onChange={(e) => setSpecies(e.target.value)} className={inputClass}>
                  <option value="Bovinos">Bovinos</option>
                  <option value="Bezerros">Bezerros / Bezerras</option>
                  <option value="Equinos">Equinos / Muares</option>
                  <option value="Bubalinos">Bubalinos</option>
                  <option value="Suínos">Suínos</option>
                  <option value="Ovinos">Ovinos</option>
                  <option value="Caprinos">Caprinos</option>
                  <option value="Aves">Aves</option>
                  <option value="Cães">Cães</option>
                  <option value="Gatos">Gatos</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Identificação (Brinco / Lote)</label>
                <input
                  type="text"
                  value={animalIdentifier}
                  onChange={(e) => setAnimalIdentifier(e.target.value)}
                  placeholder="Ex: Brinco 1024 / Lote 02"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Raça / Categoria</label>
                <input
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="Ex: Girolando / Nelore"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Qtd. Animais</label>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={animalCount}
                  onChange={(e) => setAnimalCount(Math.max(1, Number(e.target.value) || 1))}
                  className={`${inputClass} tabular-nums`}
                />
              </div>

              <div>
                <label className={labelClass}>Peso Médio (kg)</label>
                <input
                  type="number"
                  min={1}
                  max={2000}
                  value={estimatedWeightKg}
                  onChange={(e) => setEstimatedWeightKg(Math.max(1, Number(e.target.value) || 1))}
                  className={`${inputClass} tabular-nums font-semibold`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className={labelClass}>Diagnóstico Clínico / Suspeita *</label>
                <input
                  type="text"
                  value={clinicalDiagnosis}
                  onChange={(e) => setClinicalDiagnosis(e.target.value)}
                  placeholder="Ex: Mastite Aguda / Broncopneumonia"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Sinais Clínicos / Anamnese</label>
                <input
                  type="text"
                  value={anamneseNotes}
                  onChange={(e) => setAnamneseNotes(e.target.value)}
                  placeholder="Ex: Pirexia, claudicação, secreção nasal..."
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* 5. Medicamentos Prescritos */}
          <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 inline-flex items-center gap-1.5 tabular-nums">
                <Pill className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                05. Medicamentos Prescritos ({items.length})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView('protocolos')}
                  className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 cursor-pointer whitespace-nowrap"
                >
                  Carregar Protocolo
                </button>
                <button
                  type="button"
                  onClick={() => setProductSearchModalOpen(true)}
                  className="h-7 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar do Bulário
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg space-y-2">
                <Pill className="w-6 h-6 text-slate-300 dark:text-zinc-600 mx-auto" />
                <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                  Nenhum medicamento adicionado a esta receita.
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                  Pesquise diretamente nos {ALL_VETERINARY_PRODUCTS.length.toLocaleString('pt-BR')} produtos do bulário ou aplique um protocolo clínico pronto.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {items.map((item, index) => (
                  <div key={item.id || index} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                        <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                          {String(index + 1).padStart(2, '0')}.
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-zinc-100">
                          {item.productName}
                        </span>
                        {item.manufacturer && (
                          <span className="text-slate-500 dark:text-zinc-400">· {item.manufacturer}</span>
                        )}
                        <span className="text-slate-500 dark:text-zinc-400">
                          · Qtd: <strong className="text-slate-800 dark:text-zinc-200">{item.totalQuantityNeeded}</strong>
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {item.activeIngredient}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-700 dark:text-zinc-300 tabular-nums">
                        <span>
                          Dose: <strong className="text-emerald-700 dark:text-emerald-400">{item.calculatedDose}</strong>
                        </span>
                        <span>Via: {item.route}</span>
                        <span>Frequência: {item.frequency}</span>
                        <span>Duração: {item.durationDays}d</span>
                      </div>

                      {item.instructions && (
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 italic">
                          {item.instructions}
                        </p>
                      )}

                      {(item.meatGracePeriod || item.milkGracePeriod) && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                          Carência: Abate ({item.meatGracePeriod || 'Zero'}) · Leite ({item.milkGracePeriod || 'Zero'})
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center text-slate-400 shrink-0 cursor-pointer"
                      title="Remover item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 6. Carência & Instruções */}
          <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="pb-2.5 border-b border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                06. Carência Consolidada e Instruções Gerais
              </span>
            </div>

            <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 text-amber-900 dark:text-amber-200">
              <div>
                <span className="font-semibold">Abate / Carne:</span> {summaryGracePeriods.meat}
              </div>
              <div>
                <span className="font-semibold">Leite / Ordenha:</span> {summaryGracePeriods.milk}
              </div>
            </div>

            <div>
              <label className={labelClass}>Instruções de Manejo, Conservação e Descarte</label>
              <textarea
                value={generalInstructions}
                onChange={(e) => setGeneralInstructions(e.target.value)}
                rows={2}
                className={textareaClass}
              />
            </div>
          </section>

          {/* Action Footer */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={handleNewPrescription}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Limpar / Nova Receita
            </button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={() => handleSavePrescription('em_tratamento')}
                className="h-8 px-3.5 rounded-lg border border-emerald-600/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <HardDrive className="w-3.5 h-3.5" />
                Salvar Rascunho
              </button>
              <button
                type="button"
                onClick={() => handleSavePrescription('emitida')}
                className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Emitir &amp; Imprimir A4
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PROTOCOLOS CLÍNICOS */}
      {activeView === 'protocolos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CLINICAL_PROTOCOLS.map((proto) => (
            <article
              key={proto.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col justify-between gap-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <span className="font-medium text-emerald-700 dark:text-emerald-400">{proto.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {proto.prescriptionType === 'controle_especial' ? 'Controle Especial' : 'Receita Simples'}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">
                      {proto.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {proto.description}
                </p>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950/70 border border-slate-100 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400 block">
                    Medicamentos ({(proto.items || []).length})
                  </span>
                  {(proto.items || []).map((it, i) => (
                    <div key={i} className="text-xs text-slate-800 dark:text-zinc-200 flex items-center justify-between gap-2">
                      <span className="font-medium truncate">{it.productName}</span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 shrink-0 tabular-nums">
                        {it.calculatedDose}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  Espécies: {(proto.targetSpecies || []).join(', ')}
                </span>
                <button
                  type="button"
                  onClick={() => handleApplyProtocol(proto)}
                  className="h-7 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Usar no Receituário
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* VIEW 3: HISTÓRICO */}
      {activeView === 'historico' && (
        <div className="space-y-3">
          {prescriptions.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center space-y-2.5">
              <FileText className="w-7 h-7 text-slate-300 dark:text-zinc-600 mx-auto" />
              <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                Nenhuma receita emitida até o momento.
              </p>
              <button
                type="button"
                onClick={() => setActiveView('emitir')}
                className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
              >
                Emitir Primeira Receita
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl divide-y divide-slate-100 dark:divide-zinc-800">
              {prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                      <span className="font-mono font-semibold text-slate-900 dark:text-zinc-100">
                        {rx.prescriptionNumber}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                        {rx.prescriptionType === 'controle_especial'
                          ? 'Controle Especial'
                          : rx.prescriptionType === 'notificacao_receita'
                          ? 'Notificação de Receita'
                          : rx.prescriptionType === 'orientacao_manejo'
                          ? 'Orientação / Manejo'
                          : 'Receita Simples'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{rx.date}</span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      {rx.clinicalDiagnosis}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-zinc-400">
                      {rx.farmName} ({rx.producerName}) · {rx.animalIdentifier} ({rx.species}) · {rx.veterinarianName}{' '}
                      (CRMV-{rx.crmvState} {rx.crmvNumber})
                    </p>

                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                      Itens ({(rx.items || []).length}): {(rx.items || []).map((it) => it.productName).join(', ')}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPrintModalPrescription(rx)}
                      className="h-7 px-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Imprimir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditPrescription(rx)}
                      className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicatePrescription(rx)}
                      className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Duplicar
                    </button>
                    {confirmDeleteId === rx.id ? (
                      <button
                        type="button"
                        onClick={() => handleDeletePrescription(rx.id)}
                        className="h-7 px-2.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium cursor-pointer"
                      >
                        Confirmar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(rx.id)}
                        className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400 inline-flex items-center justify-center text-slate-500 dark:text-zinc-400 cursor-pointer"
                        title="Excluir receita"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: BUSCA INTEGRADA AO BULÁRIO */}
      {productSearchModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setProductSearchModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Adicionar Medicamento do Bulário
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Importa princípio ativo, posologia e carência automaticamente.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProductSearchModalOpen(false)}
                className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800 space-y-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  placeholder="Buscar produto, princípio ativo ou indicação..."
                  className={`${inputClass} pl-8`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={productSearchManufacturer}
                  onChange={(e) => setProductSearchManufacturer(e.target.value)}
                  className={inputClass}
                >
                  <option value="all">Todos os laboratórios</option>
                  {distinctManufacturers.map((lab) => (
                    <option key={lab} value={lab}>
                      {lab}
                    </option>
                  ))}
                </select>
                <select
                  value={productSearchCategory}
                  onChange={(e) => setProductSearchCategory(e.target.value)}
                  className={inputClass}
                >
                  <option value="all">Todas as categorias</option>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800">
              {modalFilteredProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
                  Nenhum produto encontrado.
                </div>
              ) : (
                modalFilteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectProductToAdd(prod)}
                    className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-800/40 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 text-xs">
                        <span className="font-semibold text-slate-900 dark:text-zinc-100">{prod.name}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 dark:text-zinc-400">{prod.manufacturer}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-emerald-700 dark:text-emerald-400">{prod.category}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                        {prod.activeIngredient} ({prod.concentration}) — {prod.indications}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectProductToAdd(prod);
                      }}
                      className="h-7 px-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Selecionar
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              <span>Exibindo {modalFilteredProducts.length} medicamentos compatíveis</span>
              <button
                type="button"
                onClick={() => setProductSearchModalOpen(false)}
                className="h-7 px-3 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AJUSTAR POSOLOGIA DO ITEM */}
      {tempProduct && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setTempProduct(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Ajustar Posologia e Quantidade
              </h3>
              <button
                type="button"
                onClick={() => setTempProduct(null)}
                className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">{tempProduct.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {tempProduct.activeIngredient} · {tempProduct.manufacturer}
                </p>
              </div>

              <div>
                <label className={labelClass}>Dose Calculada / Posologia ({estimatedWeightKg} kg)</label>
                <input
                  type="text"
                  value={tempDose}
                  onChange={(e) => setTempDose(e.target.value)}
                  className={`${inputClass} font-semibold text-emerald-700 dark:text-emerald-400`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className={labelClass}>Via de Administração</label>
                  <input
                    type="text"
                    value={tempRoute}
                    onChange={(e) => setTempRoute(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Frequência</label>
                  <input
                    type="text"
                    value={tempFrequency}
                    onChange={(e) => setTempFrequency(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className={labelClass}>Duração (dias)</label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={tempDuration}
                    onChange={(e) => setTempDuration(Math.max(1, Number(e.target.value) || 1))}
                    className={`${inputClass} tabular-nums`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Quantidade Total a Aviar</label>
                  <input
                    type="text"
                    value={tempQuantity}
                    onChange={(e) => setTempQuantity(e.target.value)}
                    placeholder="Ex: 02 frascos de 100 mL"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Instruções ao Produtor</label>
                <textarea
                  value={tempInstructions}
                  onChange={(e) => setTempInstructions(e.target.value)}
                  rows={2}
                  className={textareaClass}
                />
              </div>

              {(tempProduct.gracePeriodMeat || tempProduct.gracePeriodMilk) && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  Carência: Abate ({tempProduct.gracePeriodMeat || 'N/A'}) · Leite ({tempProduct.gracePeriodMilk || 'N/A'})
                </p>
              )}
            </div>

            <div className="px-4 py-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setTempProduct(null)}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAddItem}
                className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar à Receita
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: IMPRESSÃO OFICIAL A4 */}
      {printModalPrescription && (
        <VeterinaryPrescriptionPrintModal
          prescription={printModalPrescription}
          companies={companies}
          currentCompany={currentCompany}
          onClose={() => setPrintModalPrescription(null)}
        />
      )}
    </div>
  );
};
