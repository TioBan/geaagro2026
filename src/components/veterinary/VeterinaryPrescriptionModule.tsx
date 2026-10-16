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
  Calendar,
  Sparkles,
  Layers,
  Check,
  X,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Copy,
  Download,
  Share2,
  HelpCircle,
  Eye,
  Activity,
  Tag,
  Filter,
  RefreshCw,
  QrCode,
  HardDrive,
  Info,
} from 'lucide-react';
import {
  VeterinaryProduct,
  VeterinaryPrescription,
  PrescriptionItem,
  PrescriptionType,
  PrescriptionStatus,
  VeterinarySpecies,
  ClinicalProtocolTemplate,
} from '../../types/veterinaryBulario';
import { Farm, RuralProducer, Agronomist, Company } from '../../types/agronomy';
import { ALL_VETERINARY_PRODUCTS, calculateProductDose } from '../../data/veterinaryBularioDatabase';
import { CLINICAL_PROTOCOLS } from '../../data/veterinaryProtocols';

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
}

const STORAGE_KEY = 'agronutri_vet_prescriptions';

export const VeterinaryPrescriptionModule: React.FC<VeterinaryPrescriptionModuleProps> = ({
  isDarkMode = false,
  companies = [],
  farms = [],
  producers = [],
  agronomists = [],
  setAgronomists,
  initialProductToPrescribe,
  onClearInitialProduct,
  onNavigateToBulario,
  onNavigateToCadastros,
}) => {
  // Navigation inside Prescription Module
  const [activeView, setActiveView] = useState<'emitir' | 'historico' | 'protocolos'>('emitir');

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

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prescriptions));
    } catch (e) {
      console.error('Error saving prescriptions to localStorage', e);
    }
  }, [prescriptions]);

  // Company selection state
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

  // Form State for Active Prescription
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<string | null>(null);
  const [prescriptionType, setPrescriptionType] = useState<PrescriptionType>('simples');
  const [prescriptionNumber, setPrescriptionNumber] = useState<string>(() => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `RX-VET-${year}-${randomNum}`;
  });
  const [prescriptionDate, setPrescriptionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [validUntilDate, setValidUntilDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

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

  // Farm and Producer Context
  const [selectedFarmId, setSelectedFarmId] = useState<string>(farms[0]?.id || '');
  const [farmName, setFarmName] = useState<string>(farms[0]?.name || 'Fazenda Santa Maria');
  const [producerName, setProducerName] = useState<string>(
    producers[0]?.name || 'Antônio Carlos Ribeiro'
  );
  const [producerCpfCnpj, setProducerCpfCnpj] = useState<string>(
    producers[0]?.document || (producers[0] as any)?.cpfCnpj || '123.456.789-00'
  );
  const [producerPhone, setProducerPhone] = useState<string>(producers[0]?.phone || '(34) 99123-4567');
  const [location, setLocation] = useState<string>(farms[0]?.city ? `${farms[0].city}/${farms[0].state}` : 'Uberaba/MG');

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

  // Items List
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

  // Selected item being customized before adding to prescription
  const [tempProduct, setTempProduct] = useState<VeterinaryProduct | null>(null);
  const [tempDose, setTempDose] = useState('');
  const [tempRoute, setTempRoute] = useState('');
  const [tempFrequency, setTempFrequency] = useState('A cada 24 horas');
  const [tempDuration, setTempDuration] = useState(3);
  const [tempQuantity, setTempQuantity] = useState('1 frasco');
  const [tempInstructions, setTempInstructions] = useState('');

  // Print Preview Modal
  const [printModalPrescription, setPrintModalPrescription] = useState<VeterinaryPrescription | null>(null);
  const [printViaMode, setPrintViaMode] = useState<'todas' | 'via1' | 'via2'>('todas');

  // Feedback Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync with available Veterinarians from system RTs if available
  useEffect(() => {
    if (!agronomists || (agronomists || []).length === 0) return;

    // Check if current selected vet exists in agronomists
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

    // Auto-select veterinarian if none is selected
    const vetRTs = (agronomists || []).filter(
      (a) =>
        a.profession?.toLowerCase().includes('veterin') ||
        a.councilType === 'CRMV' ||
        a.specialty?.toLowerCase().includes('veterin')
    );

    const targetVet = (vetRTs || []).length > 0 ? vetRTs[0] : (agronomists || [])[0];
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

  // Handler to pull full RT data when selected from dropdown
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
      showToast(`Dados de "${vet.name}" (${vet.councilType || 'CRMV'}-${vet.creaState}) importados do Cadastro Técnico!`);
    }
  };

  // Handler to save current form back to RT in system state
  const handleSaveToRT = () => {
    if (!setAgronomists) return;
    if (!vetName.trim()) {
      showToast('Preencha o nome do Médico Veterinário antes de salvar.');
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
      } else {
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
      }
    });

    showToast('Dados do Médico Veterinário salvos e sincronizados com o Cadastro Técnico!');
  };

  // Sync farm changes
  useEffect(() => {
    if (selectedFarmId) {
      const f = farms.find((farm) => farm.id === selectedFarmId);
      if (f) {
        setFarmName(f.name);
        setLocation(`${f.city || ''}/${f.state || ''}`);
        const p = producers.find((prod) => prod.id === f.producerId);
        if (p) {
          setProducerName(p.name);
          setProducerCpfCnpj(p.document || (p as any).cpfCnpj || '');
          setProducerPhone(p.phone || '');
        }
      }
    }
  }, [selectedFarmId, farms, producers]);

  // Handle incoming product passed from Bulário or Calculator
  useEffect(() => {
    if (initialProductToPrescribe) {
      handleSelectProductToAdd(initialProductToPrescribe);
      if (onClearInitialProduct) onClearInitialProduct();
    }
  }, [initialProductToPrescribe]);

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
      `Administrar com agulha e seringa estéreis. Respeitar carência: Abate (${prod.gracePeriodMeat || 'N/A'}), Leite (${prod.gracePeriodMilk || 'N/A'}).`
    );
  };

  // Confirm item into active prescription
  const handleConfirmAddItem = () => {
    if (!tempProduct) return;
    const newItem: PrescriptionItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: tempProduct.id,
      productName: tempProduct.name,
      activeIngredient: `${tempProduct.activeIngredient} (${tempProduct.concentration || ''})`,
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
    showToast(`Medicamento "${tempProduct.name}" adicionado à receita!`);
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Load Protocol Template
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
    setActiveView('emitir');
    showToast(`Protocolo "${proto.title}" carregado com sucesso!`);
  };

  // Calculate maximum grace periods for the whole prescription
  const summaryGracePeriods = useMemo(() => {
    const meat = (items || [])
      .map((it) => it.meatGracePeriod)
      .filter((g) => g && g !== 'N/A' && g !== 'Zero dias' && g !== 'Zero horas')
      .join(' | ');
    const milk = (items || [])
      .map((it) => it.milkGracePeriod)
      .filter((g) => g && g !== 'N/A' && g !== 'Zero dias' && g !== 'Zero horas')
      .join(' | ');
    return {
      meat: meat || 'Sem restrições / Descarte Zero',
      milk: milk || 'Sem restrições / Descarte Zero',
    };
  }, [items]);

  // Save or Update Prescription
  const handleSavePrescription = (status: PrescriptionStatus = 'emitida') => {
    if ((items || []).length === 0) {
      alert('Por favor, adicione pelo menos um medicamento à receita antes de salvar.');
      return;
    }

    if (!vetName.trim() || !vetCrmv.trim()) {
      alert('Por favor, preencha o Nome e o número do CRMV do Médico Veterinário.');
      return;
    }

    const prescriptionPayload: VeterinaryPrescription = {
      id: editingPrescriptionId || `vet-rx-${Date.now()}`,
      prescriptionNumber,
      date: prescriptionDate,
      validUntil: validUntilDate,
      prescriptionType,
      status,
      veterinarianName: vetName,
      veterinarianCpf: vetCpf,
      crmvNumber: vetCrmv,
      crmvState: vetCrmvState,
      veterinarianPhone: vetPhone,
      veterinarianEmail: vetEmail,
      clinicAddress,
      companyId: currentCompany?.id,
      companyName: currentCompany?.tradingName || currentCompany?.name,
      companyLogoUrl: currentCompany?.logoUrl,
      farmId: selectedFarmId,
      farmName,
      producerName,
      producerCpfCnpj,
      producerPhone,
      location,
      cityState: location,
      species,
      breed,
      animalIdentifier,
      estimatedWeightKg,
      animalCount,
      clinicalDiagnosis,
      anamneseNotes,
      items,
      meatGracePeriodSummary: summaryGracePeriods.meat,
      milkGracePeriodSummary: summaryGracePeriods.milk,
      generalInstructions,
      buyerName: buyerName || producerName,
      buyerDocument: buyerDocument || producerCpfCnpj,
      buyerAddress: buyerAddress || location,
      buyerPhone: buyerPhone || producerPhone,
      createdAt: editingPrescriptionId
        ? prescriptions.find((p) => p.id === editingPrescriptionId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingPrescriptionId) {
      setPrescriptions((prev) =>
        prev.map((p) => (p.id === editingPrescriptionId ? prescriptionPayload : p))
      );
      showToast('Receituário atualizado com sucesso!');
    } else {
      setPrescriptions((prev) => [prescriptionPayload, ...prev]);
      showToast('Receituário emitido e gravado no histórico!');
    }

    // Open print preview automatically
    setPrintModalPrescription(prescriptionPayload);
  };

  // Reset form for a fresh prescription
  const handleNewPrescription = () => {
    setEditingPrescriptionId(null);
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setPrescriptionNumber(`RX-VET-${year}-${randomNum}`);
    setPrescriptionDate(new Date().toISOString().split('T')[0]);
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setValidUntilDate(d.toISOString().split('T')[0]);
    setItems([]);
    setClinicalDiagnosis('Tratamento Terapêutico Veterinário');
    setAnamneseNotes('');
    setAnimalIdentifier('Lote / Animal #01');
    setActiveView('emitir');
    showToast('Novo receituário iniciado!');
  };

  // Edit existing prescription
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
    setActiveView('emitir');
    showToast(`Editando Receituário ${rx.prescriptionNumber}`);
  };

  // Duplicate
  const handleDuplicatePrescription = (rx: VeterinaryPrescription) => {
    handleEditPrescription(rx);
    setEditingPrescriptionId(null);
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setPrescriptionNumber(`RX-VET-${year}-${randomNum}`);
    setPrescriptionDate(new Date().toISOString().split('T')[0]);
    showToast('Receita duplicada como nova emissão!');
  };

  // Delete
  const handleDeletePrescription = (id: string) => {
    if (confirm('Deseja realmente excluir este receituário do histórico?')) {
      setPrescriptions((prev) => prev.filter((p) => p.id !== id));
      showToast('Receituário removido do histórico.');
    }
  };

  // Filtered Products in the Search Modal
  const modalFilteredProducts = useMemo(() => {
    return ALL_VETERINARY_PRODUCTS.filter((p) => {
      if (productSearchCategory !== 'all' && p.category !== productSearchCategory) return false;
      if (productSearchManufacturer !== 'all') {
        const mfg = p.manufacturer.toLowerCase();
        const target = productSearchManufacturer.toLowerCase();
        if (!mfg.includes(target)) return false;
      }
      if (productSearchQuery.trim()) {
        const q = productSearchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.activeIngredient.toLowerCase().includes(q) ||
          p.indications.toLowerCase().includes(q) ||
          p.manufacturer.toLowerCase().includes(q)
        );
      }
      return true;
    }).slice(0, 100); // Limit to top 100 for instant UI responsiveness
  }, [productSearchQuery, productSearchCategory, productSearchManufacturer]);

  // Distinct manufacturers list for modal
  const distinctManufacturers = useMemo(() => {
    const labs = [
      'Alere',
      'Avert',
      'Bayer',
      'Bimeda',
      'Biofarm',
      'Biogénesis',
      'Bionatural',
      'Biosyn',
      'Biovet',
      'Boehringer',
      'Calbos',
      'Ceva',
      'Champion',
      'Chemitec',
      'Clarion',
      'Dechra',
      'Ibasa',
      'MSD',
      'Ourofino',
      'Syntec',
      'Vetbras',
      'Vetnil',
      'Virbac',
      'Zoetis',
    ];
    return labs.sort();
  }, []);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs Header */}
      <div
        className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Módulo de Receituário Veterinário</span>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Padrão CFMV / MAPA
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Emissão oficial de prescrições, controle especial em 2 vias, carência sanitária e integração ao bulário.
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveView('emitir')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'emitir'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Emitir Receita</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('protocolos')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'protocolos'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Protocolos Clínicos ({(CLINICAL_PROTOCOLS || []).length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('historico')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'historico'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Histórico ({(prescriptions || []).length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: EMITIR RECEITUÁRIO */}
      {activeView === 'emitir' && (
        <div className="space-y-6">
          {/* Top Configuration & Type of Prescription */}
          <div
            className={`p-5 rounded-2xl border space-y-4 ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                  1. Modalidade e Dados do Documento
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 dark:text-zinc-400">Nº da Receita:</span>
                <span className="font-mono font-bold px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200">
                  {prescriptionNumber}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Type 1: Simples */}
              <button
                type="button"
                onClick={() => setPrescriptionType('simples')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  prescriptionType === 'simples'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                    : isDarkMode
                    ? 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
                    : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center justify-between">
                    <span>Receituário Simples</span>
                    {prescriptionType === 'simples' && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <p className="text-[11px] mt-1 text-slate-500 dark:text-zinc-400">
                    Medicamentos gerais, vacinas, suplementos e antiparasitários comuns.
                  </p>
                </div>
                <span className="mt-2 inline-block text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                  Via Única
                </span>
              </button>

              {/* Type 2: Controle Especial */}
              <button
                type="button"
                onClick={() => setPrescriptionType('controle_especial')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  prescriptionType === 'controle_especial'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-950 dark:text-purple-200 ring-2 ring-purple-500/20'
                    : isDarkMode
                    ? 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
                    : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center justify-between">
                    <span>Controle Especial (2 Vias)</span>
                    {prescriptionType === 'controle_especial' && (
                      <Check className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <p className="text-[11px] mt-1 text-slate-500 dark:text-zinc-400">
                    Antimicrobianos, antibióticos, anestésicos e substâncias controladas.
                  </p>
                </div>
                <span className="mt-2 inline-block text-[10px] font-semibold text-purple-700 dark:text-purple-300">
                  1ª Via Farmácia • 2ª Via Produtor
                </span>
              </button>

              {/* Type 3: Notificação de Receita */}
              <button
                type="button"
                onClick={() => setPrescriptionType('notificacao_receita')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  prescriptionType === 'notificacao_receita'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20'
                    : isDarkMode
                    ? 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
                    : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center justify-between">
                    <span>Notificação de Receita</span>
                    {prescriptionType === 'notificacao_receita' && (
                      <Check className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <p className="text-[11px] mt-1 text-slate-500 dark:text-zinc-400">
                    Entorpecentes e psicotrópicos veterinários (Portaria SVS/MS 344/98).
                  </p>
                </div>
                <span className="mt-2 inline-block text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                  Retenção Obrigatória
                </span>
              </button>

              {/* Type 4: Orientação e Profilaxia */}
              <button
                type="button"
                onClick={() => setPrescriptionType('orientacao_manejo')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  prescriptionType === 'orientacao_manejo'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 ring-2 ring-blue-500/20'
                    : isDarkMode
                    ? 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
                    : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center justify-between">
                    <span>Guia de Orientação / Manejo</span>
                    {prescriptionType === 'orientacao_manejo' && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <p className="text-[11px] mt-1 text-slate-500 dark:text-zinc-400">
                    Protocolos preventivos de vacinação, vermifugação em lote e biossegurança.
                  </p>
                </div>
                <span className="mt-2 inline-block text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                  Planejamento Sanitário
                </span>
              </button>
            </div>

            {/* Dates row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                  Data de Emissão da Receita:
                </label>
                <input
                  type="date"
                  value={prescriptionDate}
                  onChange={(e) => setPrescriptionDate(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    isDarkMode
                      ? 'bg-zinc-950 border-zinc-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
              </div>
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                  Validade do Receituário (padrão 30 dias):
                </label>
                <input
                  type="date"
                  value={validUntilDate}
                  onChange={(e) => setValidUntilDate(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    isDarkMode
                      ? 'bg-zinc-950 border-zinc-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* 1. Empresa / Consultoria Emissora (Logotipo nos Laudos e Receitas) */}
          <div
            className={`p-5 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 border-slate-200 dark:border-zinc-800 gap-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                  1. Empresa / Consultoria Emissora (Logotipo no Receituário)
                </span>
              </div>
              {onNavigateToCadastros && (
                <button
                  type="button"
                  onClick={onNavigateToCadastros}
                  className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 underline cursor-pointer"
                  title="Gerenciar Empresas e Logotipos"
                >
                  + Gerenciar Empresas / Logotipo
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Logo Preview */}
              <div className="flex items-center gap-3 shrink-0">
                {currentCompany?.logoUrl ? (
                  <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 dark:border-zinc-700 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                    <img
                      src={currentCompany.logoUrl}
                      alt={currentCompany.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0">
                    {(currentCompany?.name || 'EM').slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Selector & Details */}
              <div className="flex-1 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 shrink-0">
                    Empresa Emissora:
                  </label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="flex-1 text-xs font-semibold p-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    {companies && (companies || []).length > 0 ? (
                      companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.cnpj ? `(CNPJ: ${c.cnpj})` : ''} {c.logoUrl ? '✓ [Com Logo]' : ''}
                        </option>
                      ))
                    ) : (
                      <option value="">Nenhuma empresa cadastrada</option>
                    )}
                  </select>
                </div>
                {currentCompany && (
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex flex-wrap gap-x-3 gap-y-0.5">
                    {currentCompany.cnpj && <span>CNPJ: <strong>{currentCompany.cnpj}</strong></span>}
                    {currentCompany.creaRegister && <span>Registro: <strong>{currentCompany.creaRegister}</strong></span>}
                    {currentCompany.city && <span>Localização: <strong>{currentCompany.city}/{currentCompany.state}</strong></span>}
                    {currentCompany.logoUrl && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ Logotipo personalizado ativo na impressão
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Prescriber & Farm Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 2. Médico Veterinário Prescritor */}
            <div
              className={`p-5 rounded-2xl border space-y-4 ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 border-slate-200 dark:border-zinc-800 gap-2">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    2. Médico Veterinário Prescritor (CRMV)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    Integrado ao Cadastro Técnico
                  </span>
                  {onNavigateToCadastros && (
                    <button
                      type="button"
                      onClick={onNavigateToCadastros}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 underline cursor-pointer"
                      title="Ir para Cadastro Técnico de Responsáveis Técnicos"
                    >
                      + Cadastrar no Cadastro Técnico
                    </button>
                  )}
                </div>
              </div>

              {/* RT Selector bar */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 shrink-0">
                    Selecionar RT:
                  </label>
                  <select
                    value={selectedVetId}
                    onChange={(e) => handleSelectRT(e.target.value)}
                    className="flex-1 text-[11px] font-semibold py-1 px-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Selecione ou Preencha Manualmente --</option>
                    {agronomists && (agronomists || []).length > 0 ? (
                      agronomists.map((a) => {
                        const isVet =
                          a.profession?.toLowerCase().includes('veterin') ||
                          a.councilType === 'CRMV' ||
                          a.specialty?.toLowerCase().includes('veterin');
                        return (
                          <option key={a.id} value={a.id}>
                            {isVet ? '🩺 ' : '👤 '} {a.name} ({a.profession || 'RT'} - {a.councilType || 'CRMV'}/{a.creaState || 'UF'} Nº {a.crea || a.councilNumber || '-'})
                          </option>
                        );
                      })
                    ) : (
                      <option disabled>Nenhum RT cadastrado no sistema</option>
                    )}
                  </select>
                </div>
                {setAgronomists && (
                  <button
                    type="button"
                    onClick={handleSaveToRT}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-colors shrink-0 flex items-center gap-1 shadow-xs"
                    title="Salvar dados do formulário no cadastro do Responsável Técnico"
                  >
                    <Check className="w-3 h-3" />
                    <span>Salvar no Cadastro</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                    Nome Completo do Médico Veterinário: *
                  </label>
                  <input
                    type="text"
                    value={vetName}
                    onChange={(e) => setVetName(e.target.value)}
                    placeholder="Ex: Dr. Carlos Eduardo de Paula"
                    className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                      isDarkMode
                        ? 'bg-zinc-950 border-zinc-700 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                    CRMV / UF: *
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={vetCrmv}
                      onChange={(e) => setVetCrmv(e.target.value)}
                      placeholder="14589"
                      className={`w-2/3 p-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                        isDarkMode
                          ? 'bg-zinc-950 border-zinc-700 text-white'
                          : 'bg-slate-50 border-slate-300 text-slate-800'
                      }`}
                    />
                    <input
                      type="text"
                      value={vetCrmvState}
                      onChange={(e) => setVetCrmvState(e.target.value.toUpperCase())}
                      maxLength={2}
                      placeholder="UF"
                      className={`w-1/3 p-2.5 text-center uppercase rounded-xl border text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                        isDarkMode
                          ? 'bg-zinc-950 border-zinc-700 text-white'
                          : 'bg-slate-50 border-slate-300 text-slate-800'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                    CPF / Documento:
                  </label>
                  <input
                    type="text"
                    value={vetCpf}
                    onChange={(e) => setVetCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                      isDarkMode
                        ? 'bg-zinc-950 border-zinc-700 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                    Telefone de Contato / WhatsApp:
                  </label>
                  <input
                    type="text"
                    value={vetPhone}
                    onChange={(e) => setVetPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                      isDarkMode
                        ? 'bg-zinc-950 border-zinc-700 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                  Endereço da Clínica / Consultório / Domicílio Profissional:
                </label>
                <input
                  type="text"
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                  placeholder="Rua, Número, Bairro, Cidade - UF"
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    isDarkMode
                      ? 'bg-zinc-950 border-zinc-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
              </div>
            </div>

            {/* 3. Produtor & Propriedade */}
            <div
              className={`p-5 rounded-2xl border space-y-4 ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    3. Produtor Rural & Propriedade
                  </span>
                </div>
                {farms && (farms || []).length > 0 && (
                  <select
                    value={selectedFarmId}
                    onChange={(e) => setSelectedFarmId(e.target.value)}
                    className="text-[11px] font-semibold py-1 px-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200"
                  >
                    {farms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.city}/{f.state})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                    Nome da Fazenda / Propriedade:
                  </label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="Ex: Fazenda Boa Esperança"
                    className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                      isDarkMode
                        ? 'bg-zinc-950 border-zinc-700 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                    Município / UF:
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Uberlândia/MG"
                    className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                      isDarkMode
                        ? 'bg-zinc-950 border-zinc-700 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                    Nome do Produtor / Proprietário:
                  </label>
                  <input
                    type="text"
                    value={producerName}
                    onChange={(e) => setProducerName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                      isDarkMode
                        ? 'bg-zinc-950 border-zinc-700 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                    CPF / CNPJ do Produtor:
                  </label>
                  <input
                    type="text"
                    value={producerCpfCnpj}
                    onChange={(e) => setProducerCpfCnpj(e.target.value)}
                    placeholder="000.000.000-00"
                    className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                      isDarkMode
                        ? 'bg-zinc-950 border-zinc-700 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                  Telefone / Contato do Produtor:
                </label>
                <input
                  type="text"
                  value={producerPhone}
                  onChange={(e) => setProducerPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    isDarkMode
                      ? 'bg-zinc-950 border-zinc-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* 4. Paciente / Animal / Lote & Diagnóstico */}
          <div
            className={`p-5 rounded-2xl border space-y-4 ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 border-b pb-3 border-slate-200 dark:border-zinc-800">
              <Syringe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                4. Identificação dos Animais e Diagnóstico Clínico
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                  Espécie Alvo:
                </label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    isDarkMode
                      ? 'bg-zinc-950 border-zinc-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                >
                  <option value="Bovinos">Bovinos (Corte / Leite)</option>
                  <option value="Bezerros">Bezerros / Bezerras</option>
                  <option value="Equinos">Equinos / Muares</option>
                  <option value="Suínos">Suínos</option>
                  <option value="Ovinos">Ovinos</option>
                  <option value="Caprinos">Caprinos</option>
                  <option value="Bubalinos">Bubalinos</option>
                  <option value="Aves">Aves (Frangos / Poedeiras)</option>
                  <option value="Cães">Cães</option>
                  <option value="Gatos">Gatos</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                  Identificação (Brinco / Lote / Nome):
                </label>
                <input
                  type="text"
                  value={animalIdentifier}
                  onChange={(e) => setAnimalIdentifier(e.target.value)}
                  placeholder="Ex: Brinco 1024 / Lote 02"
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    isDarkMode
                      ? 'bg-zinc-950 border-zinc-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                  Raça / Categoria:
                </label>
                <input
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="Ex: Girolando / Nelore"
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    isDarkMode
                      ? 'bg-zinc-950 border-zinc-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                  Peso Médio Estimado (kg):
                </label>
                <input
                  type="number"
                  min={1}
                  max={2000}
                  value={estimatedWeightKg}
                  onChange={(e) => setEstimatedWeightKg(Number(e.target.value))}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    isDarkMode
                      ? 'bg-zinc-950 border-zinc-700'
                      : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                  Diagnóstico Clínico / Suspeita Patológica: *
                </label>
                <input
                  type="text"
                  value={clinicalDiagnosis}
                  onChange={(e) => setClinicalDiagnosis(e.target.value)}
                  placeholder="Ex: Mastite Aguda / Broncopneumonia / Tristeza Parasitária"
                  className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    isDarkMode
                      ? 'bg-zinc-950 border-zinc-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
              </div>
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                  Sinais Clínicos / Anamnese / Justificativa do Tratamento:
                </label>
                <input
                  type="text"
                  value={anamneseNotes}
                  onChange={(e) => setAnamneseNotes(e.target.value)}
                  placeholder="Ex: Pirexia, claudicação, secreção nasal purulenta..."
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    isDarkMode
                      ? 'bg-zinc-950 border-zinc-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* 5. Medicamentos Prescritos (Itens da Receita) */}
          <div
            className={`p-5 rounded-2xl border space-y-4 ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                  5. Medicamentos Prescritos ({(items || []).length} itens)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Add from Bulário Button */}
                <button
                  type="button"
                  onClick={() => setProductSearchModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar do Bulário (1.600+ Produtos)</span>
                </button>
              </div>
            </div>

            {/* List of Added Prescription Items */}
            {(items || []).length === 0 ? (
              <div className="py-10 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                <Pill className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-slate-700 dark:text-zinc-300">
                  Nenhum medicamento adicionado a esta receita
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-500 max-w-md mx-auto mt-1 mb-4">
                  Clique no botão acima para pesquisar e incluir antibióticos, anti-inflamatórios, vacinas ou suplementos diretamente do bulário.
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setProductSearchModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer"
                  >
                    Buscar no Bulário
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('protocolos')}
                    className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Ver Protocolos Prontos
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`p-4 rounded-xl border transition-all ${
                      isDarkMode
                        ? 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                        : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {item.productName}
                          </h4>
                          {item.manufacturer && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                              {item.manufacturer}
                            </span>
                          )}
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            Qtd: {item.totalQuantityNeeded}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-zinc-400">
                          <strong>Princípio Ativo:</strong> {item.activeIngredient}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">POSOLOGIA:</span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-300">{item.calculatedDose}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">VIA & FREQUÊNCIA:</span>
                            <span className="font-medium text-slate-800 dark:text-zinc-200">{item.route} • {item.frequency}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">DURAÇÃO:</span>
                            <span className="font-medium text-slate-800 dark:text-zinc-200">{item.durationDays} dias</span>
                          </div>
                        </div>

                        {item.instructions && (
                          <p className="text-[11px] text-slate-600 dark:text-zinc-400 italic">
                            💬 <strong>Instruções:</strong> {item.instructions}
                          </p>
                        )}

                        {/* Carência Alert */}
                        {(item.meatGracePeriod || item.milkGracePeriod) && (
                          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Carência: Abate ({item.meatGracePeriod || 'Zero'})</span>
                            <span>• Leite ({item.milkGracePeriod || 'Zero'})</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Remover medicamento da receita"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. Prazos de Carência Sanitária e Observações Finais */}
          <div
            className={`p-5 rounded-2xl border space-y-4 ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 border-b pb-3 border-slate-200 dark:border-zinc-800">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                6. Prazos Legais de Carência e Recomendações
              </span>
            </div>

            {/* Summary Banner of Withholding Period */}
            <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>DECLARAÇÃO DE PERÍODOS DE CARÊNCIA OBRIGATÓRIA (MAPA / CFMV):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-amber-900 dark:text-amber-200 pt-1">
                <div>
                  <strong>Carência para Carne / Abate:</strong> {summaryGracePeriods.meat}
                </div>
                <div>
                  <strong>Carência para Leite / Ordenha:</strong> {summaryGracePeriods.milk}
                </div>
              </div>
            </div>

            <div className="text-xs">
              <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                Instruções Gerais de Manejo, Conservação e Descarte de Frascos:
              </label>
              <textarea
                value={generalInstructions}
                onChange={(e) => setGeneralInstructions(e.target.value)}
                rows={3}
                className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                  isDarkMode
                    ? 'bg-zinc-950 border-zinc-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Action Bar (Save / Print / Reset) */}
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-20 shadow-xl ${
              isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={handleNewPrescription}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Limpar / Nova Receita</span>
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleSavePrescription('em_tratamento')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <HardDrive className="w-4 h-4" />
                <span>Salvar Rascunho / Histórico</span>
              </button>

              <button
                type="button"
                onClick={() => handleSavePrescription('emitida')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Emitir & Visualizar Impressão A4</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PROTOCOLOS CLÍNICOS PRONTOS */}
      {activeView === 'protocolos' && (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-2xl border ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Modelos de Protocolos Veterinários Prontos para Uso</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Selecione um protocolo terapêutico validado para preencher automaticamente o receituário com medicamentos, dosagens e carências recomendadas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CLINICAL_PROTOCOLS.map((proto) => (
              <div
                key={proto.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isDarkMode
                    ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    : 'bg-white border-slate-200 hover:border-emerald-300 shadow-2xs'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {proto.category}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1.5">
                        {proto.title}
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 shrink-0">
                      {proto.prescriptionType === 'controle_especial'
                        ? 'Controle Especial'
                        : 'Receita Simples'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-zinc-400">
                    {proto.description}
                  </p>

                  <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Medicamentos Incluídos ({(proto.items || []).length}):
                    </span>
                    {(proto.items || []).map((it, i) => (
                      <div key={i} className="text-xs text-slate-800 dark:text-zinc-200 flex items-center justify-between">
                        <span className="font-semibold">• {it.productName}</span>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400">{it.calculatedDose}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Espécies: {(proto.targetSpecies || []).join(', ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleApplyProtocol(proto)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Usar no Receituário</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: HISTÓRICO DE RECEITUÁRIOS */}
      {activeView === 'historico' && (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Histórico de Prescrições Emitidas ({(prescriptions || []).length})</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Arquivo digital de todos os receituários veterinários gerados na plataforma.
              </p>
            </div>
            <button
              type="button"
              onClick={handleNewPrescription}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Receita</span>
            </button>
          </div>

          {(prescriptions || []).length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
              <FileText className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-2" />
              <h4 className="font-bold text-slate-700 dark:text-zinc-300 text-sm">
                Nenhuma receita emitida até o momento
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
                As receitas emitidas ficarão salvas com segurança no armazenamento local para reimpressão e consulta a qualquer momento.
              </p>
              <button
                type="button"
                onClick={() => setActiveView('emitir')}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 cursor-pointer"
              >
                Emitir Primeira Receita
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {(prescriptions || []).map((rx) => (
                <div
                  key={rx.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDarkMode
                      ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700">
                          {rx.prescriptionNumber}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {rx.prescriptionType === 'controle_especial'
                            ? 'Controle Especial (2 Vias)'
                            : rx.prescriptionType === 'notificacao_receita'
                            ? 'Notificação de Receita'
                            : 'Receituário Simples'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-zinc-400">
                          📅 {rx.date}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {rx.clinicalDiagnosis}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-zinc-400">
                        <div>
                          <strong>Propriedade:</strong> {rx.farmName} ({rx.producerName})
                        </div>
                        <div>
                          <strong>Animal / Lote:</strong> {rx.animalIdentifier} ({rx.species})
                        </div>
                        <div>
                          <strong>Veterinário:</strong> {rx.veterinarianName} (CRMV-{rx.crmvState} {rx.crmvNumber})
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-950 p-2 rounded-lg">
                        <strong>Medicamentos ({(rx.items || []).length}):</strong>{' '}
                        {(rx.items || []).map((it) => it.productName).join(' • ')}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                      <button
                        type="button"
                        onClick={() => setPrintModalPrescription(rx)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir A4</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditPrescription(rx)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicatePrescription(rx)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Duplicar receita"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Duplicar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePrescription(rx.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Excluir do histórico"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: BUSCA E SELEÇÃO DE MEDICAMENTOS DO BULÁRIO */}
      {productSearchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border overflow-hidden ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Header */}
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="font-bold text-sm">Pesquisa Integrada ao Bulário Veterinário</h3>
                  <p className="text-[11px] text-emerald-100">
                    Selecione um produto para importar automaticamente princípio ativo, posologia e carências
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProductSearchModalOpen(false)}
                className="p-1 text-emerald-200 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  placeholder="Buscar por nome (ex: Masticina, Draxxin, Terramicina, Enrofloxacino, Meloxicam)..."
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    isDarkMode
                      ? 'bg-zinc-950 border border-zinc-700 text-white'
                      : 'bg-slate-50 border border-slate-300 text-slate-800'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <select
                  value={productSearchManufacturer}
                  onChange={(e) => setProductSearchManufacturer(e.target.value)}
                  className={`p-2 rounded-xl border text-xs font-semibold focus:outline-none ${
                    isDarkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                >
                  <option value="all">Laboratório: Todos os Fabricantes</option>
                  {distinctManufacturers.map((lab) => (
                    <option key={lab} value={lab}>
                      {lab}
                    </option>
                  ))}
                </select>

                <select
                  value={productSearchCategory}
                  onChange={(e) => setProductSearchCategory(e.target.value)}
                  className={`p-2 rounded-xl border text-xs font-semibold focus:outline-none ${
                    isDarkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                >
                  <option value="all">Categoria: Todas as Categorias</option>
                  <option value="Antimicrobiano">Antimicrobiano / Antibiótico</option>
                  <option value="Anti-inflamatório">Anti-inflamatório</option>
                  <option value="Antiparasitário">Antiparasitário / Endectocida</option>
                  <option value="Hormônio Reprodutivo">Hormônio Reprodutivo</option>
                  <option value="Anestésico / Sedativo">Anestésico / Sedativo</option>
                  <option value="Suplemento / Vitamínico">Suplemento / Vitamínico</option>
                  <option value="Vacina / Biológico">Vacina / Biológico</option>
                  <option value="Tópico / Dermatológico">Tópico / Dermatológico</option>
                </select>
              </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[50vh]">
              {(modalFilteredProducts || []).length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Nenhum produto encontrado para os termos pesquisados.
                </div>
              ) : (
                (modalFilteredProducts || []).map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectProductToAdd(prod)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDarkMode
                        ? 'bg-zinc-950/60 border-zinc-800 hover:border-emerald-500 hover:bg-zinc-900'
                        : 'bg-slate-50/60 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {prod.name}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                          {prod.manufacturer}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium">
                          {prod.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        <strong>Princípio Ativo:</strong> {prod.activeIngredient} ({prod.concentration})
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-1">
                        <strong>Indicações:</strong> {prod.indications}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectProductToAdd(prod);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Selecionar</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div
              className={`p-3 border-t flex items-center justify-between text-xs ${
                isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <span>Exibindo os primeiros {(modalFilteredProducts || []).length} medicamentos compatíveis.</span>
              <button
                type="button"
                onClick={() => setProductSearchModalOpen(false)}
                className="px-4 py-1.5 rounded-lg border font-semibold hover:bg-slate-200 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CUSTOMIZAR DOSAGEM DO ITEM ANTES DE INCLUIR NA RECEITA */}
      {tempProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`rounded-2xl max-w-lg w-full shadow-2xl border overflow-hidden ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-sm">Ajustar Posologia & Quantidade</h3>
              </div>
              <button
                type="button"
                onClick={() => setTempProduct(null)}
                className="p-1 text-emerald-200 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
                  Produto Selecionado:
                </span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {tempProduct.name}
                </span>
                <span className="block text-slate-600 dark:text-zinc-400 text-[11px] mt-0.5">
                  {tempProduct.activeIngredient} • {tempProduct.manufacturer}
                </span>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                  Posologia Indicada / Dose Calculada para {estimatedWeightKg} kg:
                </label>
                <input
                  type="text"
                  value={tempDose}
                  onChange={(e) => setTempDose(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none ${
                    isDarkMode ? 'bg-zinc-950 border-zinc-700' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                    Via de Administração:
                  </label>
                  <input
                    type="text"
                    value={tempRoute}
                    onChange={(e) => setTempRoute(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none ${
                      isDarkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                    Frequência:
                  </label>
                  <input
                    type="text"
                    value={tempFrequency}
                    onChange={(e) => setTempFrequency(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none ${
                      isDarkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                    Duração do Tratamento (dias):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={tempDuration}
                    onChange={(e) => setTempDuration(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none ${
                      isDarkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                    Quantidade Total a Aviar:
                  </label>
                  <input
                    type="text"
                    value={tempQuantity}
                    onChange={(e) => setTempQuantity(e.target.value)}
                    placeholder="Ex: 02 frascos de 100 mL"
                    className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none ${
                      isDarkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-zinc-300">
                  Instruções Especiais ao Produtor:
                </label>
                <textarea
                  value={tempInstructions}
                  onChange={(e) => setTempInstructions(e.target.value)}
                  rows={2}
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none ${
                    isDarkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              {(tempProduct.gracePeriodMeat || tempProduct.gracePeriodMilk) && (
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[11px]">
                  <strong>Carência Legal:</strong> Abate: {tempProduct.gracePeriodMeat || 'N/A'} | Leite: {tempProduct.gracePeriodMilk || 'N/A'}
                </div>
              )}
            </div>

            <div
              className={`p-4 border-t flex items-center justify-end gap-2 ${
                isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setTempProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAddItem}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar à Receita</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: IMPRESSÃO TÉCNICA OFICIAL A4 DO RECEITUÁRIO */}
      {printModalPrescription && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[95vh]">
            {/* Top Toolbar (Not Printed) */}
            <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm">Visualização de Impressão Oficial A4</h3>
                  <p className="text-[11px] text-slate-400">
                    Receituário Técnico nº {printModalPrescription.prescriptionNumber}
                  </p>
                </div>
              </div>

              {printModalPrescription.prescriptionType === 'controle_especial' && (
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setPrintViaMode('todas')}
                    className={`px-2.5 py-1 rounded-md font-semibold ${
                      printViaMode === 'todas' ? 'bg-purple-600 text-white' : 'text-slate-300'
                    }`}
                  >
                    As 2 Vias
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintViaMode('via1')}
                    className={`px-2.5 py-1 rounded-md font-semibold ${
                      printViaMode === 'via1' ? 'bg-purple-600 text-white' : 'text-slate-300'
                    }`}
                  >
                    1ª Via (Farmácia)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintViaMode('via2')}
                    className={`px-2.5 py-1 rounded-md font-semibold ${
                      printViaMode === 'via2' ? 'bg-purple-600 text-white' : 'text-slate-300'
                    }`}
                  >
                    2ª Via (Produtor)
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Salvar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintModalPrescription(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* A4 Printable Document Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
              {(() => {
                const targetCompany = printModalPrescription.companyId
                  ? companies.find((c) => c.id === printModalPrescription.companyId)
                  : currentCompany;
                const targetLogoUrl =
                  printModalPrescription.companyLogoUrl ||
                  targetCompany?.logoUrl ||
                  currentCompany?.logoUrl;
                const targetCompanyName =
                  printModalPrescription.companyName ||
                  targetCompany?.tradingName ||
                  targetCompany?.name ||
                  currentCompany?.tradingName ||
                  currentCompany?.name;

                return (
                  <div className="w-full max-w-2xl space-y-8">
                    {/* VIA 1 */}
                    {(printViaMode === 'todas' || printViaMode === 'via1') && (
                      <div
                        id="prescription-page-via-1"
                        className="bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-slate-300 text-slate-900 font-sans space-y-6 text-xs"
                        style={{ minHeight: '840px' }}
                      >
                        {/* Header with Title and Identification */}
                        <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {targetLogoUrl ? (
                              <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                                <img
                                  src={targetLogoUrl}
                                  alt={targetCompanyName || 'Logotipo da Empresa'}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold text-lg shrink-0">
                                {(targetCompanyName || 'GA').slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 block">
                                {targetCompanyName || 'CONSELHO REGIONAL DE MEDICINA VETERINÁRIA'}
                              </span>
                              <h1 className="text-lg font-black uppercase text-slate-900 tracking-tight mt-0.5">
                                {printModalPrescription.prescriptionType === 'controle_especial'
                                  ? 'RECEITUÁRIO DE CONTROLE ESPECIAL'
                                  : printModalPrescription.prescriptionType === 'notificacao_receita'
                                  ? 'NOTIFICAÇÃO DE RECEITA VETERINÁRIA'
                                  : 'RECEITUÁRIO VETERINÁRIO'}
                              </h1>
                              <p className="text-[11px] text-slate-600 font-medium">
                                {printModalPrescription.prescriptionType === 'controle_especial'
                                  ? '1ª VIA - RETENÇÃO DA FARMÁCIA / ESTABELECIMENTO VETERINÁRIO'
                                  : 'VIA ÚNICA DO PRODUTOR / ORIENTAÇÃO TÉCNICA'}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-slate-500 block font-semibold">NÚMERO OFICIAL:</span>
                            <span className="text-sm font-mono font-black text-slate-900 block">
                              {printModalPrescription.prescriptionNumber}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Data: {printModalPrescription.date}
                            </span>
                          </div>
                        </div>

                    {/* Prescriber & Farm Box */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px]">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          MÉDICO VETERINÁRIO EMITENTE:
                        </span>
                        <div className="font-bold text-slate-900 text-xs">
                          {printModalPrescription.veterinarianName}
                        </div>
                        <div className="font-semibold text-emerald-900">
                          CRMV-{printModalPrescription.crmvState} nº {printModalPrescription.crmvNumber}
                        </div>
                        {printModalPrescription.veterinarianCpf && (
                          <div className="text-slate-600">CPF: {printModalPrescription.veterinarianCpf}</div>
                        )}
                        {printModalPrescription.clinicAddress && (
                          <div className="text-slate-500 text-[10px]">{printModalPrescription.clinicAddress}</div>
                        )}
                      </div>

                      <div className="space-y-1 border-l pl-4 border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          PROPRIEDADE & PRODUTOR:
                        </span>
                        <div className="font-bold text-slate-900 text-xs">
                          {printModalPrescription.farmName}
                        </div>
                        <div className="text-slate-700">
                          Produtor: <strong>{printModalPrescription.producerName}</strong>
                        </div>
                        {printModalPrescription.producerCpfCnpj && (
                          <div className="text-slate-600">CPF/CNPJ: {printModalPrescription.producerCpfCnpj}</div>
                        )}
                        <div className="text-slate-500 text-[10px]">
                          Município: {printModalPrescription.location || printModalPrescription.cityState}
                        </div>
                      </div>
                    </div>

                    {/* Animal / Herd & Diagnosis */}
                    <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Espécie / Categoria:</span>
                        <span className="font-bold text-slate-900">{printModalPrescription.species}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Identificação / Brinco:</span>
                        <span className="font-bold text-slate-900">{printModalPrescription.animalIdentifier}</span>
                      </div>
                      <div className="sm:col-span-1 col-span-2">
                        <span className="text-slate-500 block text-[10px]">Diagnóstico / Indicação:</span>
                        <span className="font-bold text-emerald-950">{printModalPrescription.clinicalDiagnosis}</span>
                      </div>
                    </div>

                    {/* Prescribed Items (Rx) */}
                    <div className="space-y-3">
                      <div className="border-b border-slate-800 pb-1 flex items-center justify-between">
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                          PRESCRIÇÃO TERAPÊUTICA (USO VETERINÁRIO)
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {(printModalPrescription.items || []).length} medicamento(s)
                        </span>
                      </div>

                      <div className="space-y-3">
                        {(printModalPrescription.items || []).map((it, idx) => (
                          <div key={idx} className="border-b border-slate-100 pb-2.5 last:border-0">
                            <div className="flex items-start justify-between font-bold text-xs">
                              <span className="text-slate-900">
                                {idx + 1}. {it.productName} ({it.activeIngredient})
                              </span>
                              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                Qtd: {it.totalQuantityNeeded}
                              </span>
                            </div>

                            <div className="mt-1 text-[11px] text-slate-700 space-y-0.5">
                              <div>
                                • <strong>Posologia:</strong> {it.calculatedDose} por via {it.route}, {it.frequency} durante {it.durationDays} dias consecutivos.
                              </div>
                              {it.instructions && (
                                <div className="text-[10px] text-slate-600 italic">
                                  • {it.instructions}
                                </div>
                              )}
                              {(it.meatGracePeriod || it.milkGracePeriod) && (
                                <div className="text-[10px] font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1 inline-block">
                                  Carência: Abate: {it.meatGracePeriod || 'Zero'} | Leite: {it.milkGracePeriod || 'Zero'}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Grace Period & Sanitary Declaration Box */}
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-300 text-[10px] text-amber-950 space-y-1">
                      <div className="font-bold uppercase tracking-wider">
                        DECLARAÇÃO OBRIGATÓRIA DE CARÊNCIA SANITÁRIA (MAPA):
                      </div>
                      <div>
                        <strong>Carne / Abate:</strong> {printModalPrescription.meatGracePeriodSummary || 'Respeitar bula'} | <strong>Leite / Ordenha:</strong> {printModalPrescription.milkGracePeriodSummary || 'Respeitar bula'}
                      </div>
                      <div className="text-[9px] text-amber-800">
                        O produtor declara estar ciente de que os produtos de origem animal tratados não poderão ser destinados ao consumo humano antes do cumprimento total dos prazos de carência.
                      </div>
                    </div>

                    {/* Footer / Signature Box */}
                    <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-6 items-end text-center">
                      <div className="text-left space-y-1">
                        <div className="flex items-center gap-2">
                          <QrCode className="w-12 h-12 text-slate-800" />
                          <div className="text-[9px] text-slate-500 leading-tight">
                            Autenticidade digital verificável.<br />
                            Padrão MAPA / CFMV.<br />
                            Válido até: <strong>{printModalPrescription.validUntil}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="border-b border-slate-400 w-48 mx-auto"></div>
                        <div className="font-bold text-xs text-slate-900">
                          {printModalPrescription.veterinarianName}
                        </div>
                        <div className="text-[10px] text-slate-600 font-semibold">
                          Médico(a) Veterinário(a) • CRMV-{printModalPrescription.crmvState} nº {printModalPrescription.crmvNumber}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIA 2 (If Controle Especial) */}
                {printModalPrescription.prescriptionType === 'controle_especial' &&
                  (printViaMode === 'todas' || printViaMode === 'via2') && (
                    <div
                      id="prescription-page-via-2"
                      className="bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-purple-300 text-slate-900 font-sans space-y-6 text-xs"
                      style={{ minHeight: '840px' }}
                    >
                      {/* Header with Title and Identification */}
                      <div className="border-b-2 border-purple-900 pb-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {targetLogoUrl ? (
                            <div className="w-16 h-16 rounded-xl bg-white border border-purple-200 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                              <img
                                src={targetLogoUrl}
                                alt={targetCompanyName || 'Logotipo da Empresa'}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-purple-900 text-white flex items-center justify-center font-bold text-lg shrink-0">
                              {(targetCompanyName || 'GA').slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-800 block">
                              {targetCompanyName || 'CONSELHO REGIONAL DE MEDICINA VETERINÁRIA'}
                            </span>
                            <h1 className="text-lg font-black uppercase text-purple-950 tracking-tight mt-0.5">
                              RECEITUÁRIO DE CONTROLE ESPECIAL
                            </h1>
                            <p className="text-[11px] text-purple-700 font-bold">
                              2ª VIA - ORIENTAÇÃO DO PRODUTOR RURAL / TUTOR (NÃO RETER NA FARMÁCIA)
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-500 block font-semibold">NÚMERO OFICIAL:</span>
                          <span className="text-sm font-mono font-black text-slate-900 block">
                            {printModalPrescription.prescriptionNumber}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Data: {printModalPrescription.date}
                          </span>
                        </div>
                      </div>

                      {/* Prescriber & Farm Box */}
                      <div className="grid grid-cols-2 gap-4 bg-purple-50/50 p-4 rounded-xl border border-purple-200 text-[11px]">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                            MÉDICO VETERINÁRIO EMITENTE:
                          </span>
                          <div className="font-bold text-slate-900 text-xs">
                            {printModalPrescription.veterinarianName}
                          </div>
                          <div className="font-semibold text-purple-950">
                            CRMV-{printModalPrescription.crmvState} nº {printModalPrescription.crmvNumber}
                          </div>
                          {printModalPrescription.veterinarianCpf && (
                            <div className="text-slate-600">CPF: {printModalPrescription.veterinarianCpf}</div>
                          )}
                        </div>

                        <div className="space-y-1 border-l pl-4 border-purple-200">
                          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                            PROPRIEDADE & PRODUTOR:
                          </span>
                          <div className="font-bold text-slate-900 text-xs">
                            {printModalPrescription.farmName}
                          </div>
                          <div className="text-slate-700">
                            Produtor: <strong>{printModalPrescription.producerName}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Prescribed Items (Rx) */}
                      <div className="space-y-3">
                        <div className="border-b border-purple-900 pb-1 flex items-center justify-between">
                          <span className="font-bold text-xs uppercase tracking-wider text-purple-950">
                            PRESCRIÇÃO TERAPÊUTICA (INSTRUÇÕES AO PRODUTOR)
                          </span>
                        </div>

                        <div className="space-y-3">
                          {(printModalPrescription.items || []).map((it, idx) => (
                            <div key={idx} className="border-b border-slate-100 pb-2.5 last:border-0">
                              <div className="flex items-start justify-between font-bold text-xs">
                                <span className="text-slate-900">
                                  {idx + 1}. {it.productName} ({it.activeIngredient})
                                </span>
                                <span className="font-mono bg-purple-100 text-purple-900 px-2 py-0.5 rounded text-[11px]">
                                  Qtd: {it.totalQuantityNeeded}
                                </span>
                              </div>

                              <div className="mt-1 text-[11px] text-slate-700 space-y-0.5">
                                <div>
                                  • <strong>Posologia:</strong> {it.calculatedDose} por via {it.route}, {it.frequency} durante {it.durationDays} dias.
                                </div>
                                {it.instructions && (
                                  <div className="text-[10px] text-slate-600 italic">
                                    • {it.instructions}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Identificação do Comprador / Farmácia Dispensa */}
                      <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 space-y-2 text-[10px]">
                        <span className="font-bold uppercase tracking-wider text-slate-800 block">
                          IDENTIFICAÇÃO DO COMPRADOR / DISPENSAÇÃO NA FARMÁCIA:
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>Nome do Comprador: ___________________________</div>
                          <div>CPF/RG: ___________________________</div>
                          <div>Endereço: ___________________________________</div>
                          <div>Telefone: ___________________________</div>
                        </div>
                      </div>

                      {/* Footer / Signature Box */}
                      <div className="pt-6 border-t-2 border-purple-900 grid grid-cols-2 gap-6 items-end text-center">
                        <div className="text-left space-y-1">
                          <div className="text-[9px] text-slate-500">
                            Guarde esta via na fazenda para comprovação em fiscalizações sanitárias e rastreabilidade GlobalG.A.P.
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="border-b border-slate-400 w-48 mx-auto"></div>
                          <div className="font-bold text-xs text-slate-900">
                            {printModalPrescription.veterinarianName}
                          </div>
                          <div className="text-[10px] text-slate-600 font-semibold">
                            Médico(a) Veterinário(a) • CRMV-{printModalPrescription.crmvState} nº {printModalPrescription.crmvNumber}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
                );
              })()}
            </div>

            {/* Bottom Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs print:hidden">
              <span className="text-slate-500">Documento pronto para impressão em papel A4 padrão</span>
              <button
                type="button"
                onClick={() => setPrintModalPrescription(null)}
                className="px-4 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
