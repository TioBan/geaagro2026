import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  BookOpen,
  AlertTriangle,
  Syringe,
  Sparkles,
  X,
  Camera,
  Check,
  Info,
  Bell,
  Calendar,
  Clock,
  Trash2,
  Repeat
} from 'lucide-react';

interface Disease {
  id: string;
  name: string;
  category: 'Bacteriana' | 'Viral' | 'Parasitária' | 'Fúngica' | 'Metabólica';
  etiology: string;
  symptoms: string[];
  products: string[];
  photoUrl: string;
  prevention: string;
}

interface SanitaryReminder {
  id: string;
  diseaseId: string;
  diseaseName: string;
  title: string;
  type: 'Vacinação' | 'Tratamento' | 'Exame' | 'Manejo';
  date: string;
  repeat: 'Único' | 'Mensal' | 'Semestral' | 'Anual';
  targetGroup: string;
  notes: string;
  completed: boolean;
}

const DEFAULT_REMINDERS: SanitaryReminder[] = [
  {
    id: 'rem-1',
    diseaseId: 'dis-1',
    diseaseName: 'Linfadenite Caseosa (Mal do Caroço)',
    title: 'Vacinação Anual do Plantel',
    type: 'Vacinação',
    date: '2026-10-15',
    repeat: 'Anual',
    targetGroup: 'Todo o rebanho a partir de 3 meses',
    notes:
      'Aplicar vacina polivalente contra linfadenite caseosa em todos os animais sadios. Isolar os reagentes.',
    completed: false
  },
  {
    id: 'rem-2',
    diseaseId: 'dis-2',
    diseaseName: 'Ectima Contagioso (Boqueira / Sarna Labial)',
    title: 'Monitoramento & Desinfecção de Cochos',
    type: 'Manejo',
    date: '2026-09-25',
    repeat: 'Mensal',
    targetGroup: 'Cochos de alimentação e bebedouros',
    notes:
      'Limpeza profunda e aplicação de solução clorada para eliminar resíduos do vírus altamente resistente.',
    completed: false
  },
  {
    id: 'rem-3',
    diseaseId: 'dis-3',
    diseaseName: 'Artrite Encefalite Caprina (CAE)',
    title: 'Triagem Sorológica Semestral (ELISA)',
    type: 'Exame',
    date: '2026-11-10',
    repeat: 'Semestral',
    targetGroup: 'Matrizes e Reprodutores adultos',
    notes:
      'Coleta de sangue para exame diagnóstico sorológico. Animais reagentes devem ser apartados de imediato.',
    completed: false
  },
  {
    id: 'rem-4',
    diseaseId: 'dis-4',
    diseaseName: 'Pododermatite Infecciosa (Podridão dos Cascos / Footrot)',
    title: 'Casqueamento Preventivo e Pedilúvio',
    type: 'Manejo',
    date: '2026-09-30',
    repeat: 'Mensal',
    targetGroup: 'Lote de confinamento e produção de leite',
    notes:
      'Realizar casqueamento preventivo e passagem de 5 a 10 minutos pelo pedilúvio de sulfato de zinco a 10%.',
    completed: false
  },
  {
    id: 'rem-5',
    diseaseId: 'dis-5',
    diseaseName: 'Coccidiose (Eimeriose)',
    title: 'Dosagem Preventiva de Toltrazuril',
    type: 'Tratamento',
    date: '2026-10-05',
    repeat: 'Mensal',
    targetGroup: 'Cabritos recém-desmamados (30-60 dias)',
    notes:
      'Administrar dose única oral preventiva de Toltrazuril 5% para evitar surto de diarreia negra com sangue.',
    completed: false
  }
];

const INITIAL_DISEASES: Disease[] = [
  {
    id: 'dis-1',
    name: 'Linfadenite Caseosa (Mal do Caroço)',
    category: 'Bacteriana',
    etiology:
      'Causada pela bactéria Corynebacterium pseudotuberculosis. Altamente resistente no ambiente, penetra através de ferimentos na pele causados por farpas, cercas, tosquia ou instalações.',
    symptoms: [
      'Aparecimento de abscessos (caroços) firmes nos linfonodos superficiais (pescoço, abaixo da orelha, paleta, flanco).',
      'Pus espesso, pastoso e de coloração esverdeada em camadas concêntricas ("em cebola") ao romper.',
      'Perda de peso progressiva (síndrome da cabra magra) quando afeta linfonodos internos (pulmões, fígado).',
      'Redução severa na produção de leite e taxa de fertilidade do rebanho.'
    ],
    products: [
      'Tintura de Iodo 10% (cauterização do abscesso após drenagem cirúrgica).',
      'Desinfetantes à base de Amônia Quaternária ou Cloro Ativo (higienização das instalações).',
      'Antibióticos injetáveis de amplo espectro (Oxitetraciclina LA ou Penicilina Benzatina) sob orientação veterinária.',
      'Vacina polivalente contra Linfadenite Caseosa (prevenção anual).'
    ],
    photoUrl: '/diseases/linfadenite_caseosa.jpg',
    prevention:
      'Isolar imediatamente animais com abscessos antes que se rompam. Realizar a drenagem cirúrgica em local isolado ("sala de cura"), coletando e queimando o pus. Desinfetar instrumentos de tosquia e casqueamento.'
  },
  {
    id: 'dis-2',
    name: 'Ectima Contagioso (Boqueira / Sarna Labial)',
    category: 'Viral',
    etiology:
      'Doença infectocontagiosa causada por um Parapoxvirus (família Poxviridae). É uma zoonose (pode ser transmitida a humanos durante o manejo sem proteção). Altamente persistente no solo.',
    symptoms: [
      'Formação de pápulas e vesículas que progridem para crostas espessas, escuras e doloridas ao redor dos lábios e narinas.',
      'Lesões semelhantes no úbere das matrizes (transmitidas pelos cabritos ao mamar) e na coroa do casco.',
      'Animais jovens recusam-se a mamar ou se alimentar devido à dor intensa, levando à desidratação.',
      'Infecções bacterianas secundárias nas lesões, agravando o quadro clínico.'
    ],
    products: [
      'Glicerina Iodada a 10% ou Solução de Alume (amolecimento e cicatrização das crostas).',
      'Pomadas cicatrizantes à base de óxido de zinco e sulfato de neomicina.',
      'Antibióticos spray (Oxitetraciclina aerossol) contra contaminação secundária.',
      'Vacina de vírus ativo atenuado em plantéis endêmicos.'
    ],
    photoUrl: '/diseases/ectima_contagioso.jpg',
    prevention:
      'Evitar introdução de animais de fontes desconhecidas. Isolar lotes afetados. Utilizar luvas descartáveis ao manejar animais com boqueira. Vacinar cabritos recém-nascidos em propriedades com histórico.'
  },
  {
    id: 'dis-3',
    name: 'Artrite Encefalite Caprina (CAE)',
    category: 'Viral',
    etiology:
      'Infecção crônica multissistêmica causada por um Lentivírus (família Retroviridae). A principal via de transmissão é a ingestão de colostro e leite cru de cabras infectadas ou contato com secreções respiratórias.',
    symptoms: [
      'Artrite crônica progressiva nas articulações carpais ("joelhos inchados"), causando claudicação severa.',
      'Encefalite em cabritos de 2 a 4 meses, com incoordenação motora, tremores e paralisia progressiva.',
      'Úbere endurecido na parição (mamite crônica indurativa) com secreção láctea reduzida ou nula.',
      'Pneumonia crônica intersticial com tosse seca e dificuldade respiratória em adultos.'
    ],
    products: [
      'Não existe vacina ou tratamento curativo contra o lentivírus da CAE.',
      'AINEs (Flunixina Meglumina ou Cetoprofeno) para alívio da dor articular em matrizes valiosas.',
      'Kits de diagnóstico sorológico ELISA para triagem periódica semestral.',
      'Suplementação mineral e vitamínica para suporte imunológico.'
    ],
    photoUrl: '/diseases/cae_arthritis.jpg',
    prevention:
      'Separar imediatamente os cabritos das matrizes reagentes positivas ao nascimento. Fornecer apenas colostro e leite pasteurizado (56°C por 60 minutos) ou sucedâneo livre de CAE. Segregar ou descartar animais soropositivos.'
  },
  {
    id: 'dis-4',
    name: 'Pododermatite Infecciosa (Podridão dos Cascos / Footrot)',
    category: 'Bacteriana',
    etiology:
      'Infecção sinérgica entre Dichelobacter nodosus e Fusobacterium necrophorum, favorecida por solos úmidos, lama, acúmulo de esterco e ausência de casqueamento corretivo.',
    symptoms: [
      'Claudicação (manqueira) progressiva; o animal frequentemente pasta de joelhos para aliviar o peso.',
      'Inflamação, vermelhidão e odor fétido característico na região interdigital.',
      'Descolamento progressivo da sola córnea e parede do casco com material necrótico acinzentado.',
      'Febre, perda de apetite rápida e emagrecimento devido ao estresse doloroso.'
    ],
    products: [
      'Pedilúvio com Sulfato de Cobre a 10% ou Sulfato de Zinco a 10% (banho semanal).',
      'Antibióticos injetáveis específicos (Florfenicol, Ceftiofur ou Penicilina + Estreptomicina).',
      'Oxitetraciclina Spray Aerossol de aplicação tópica após limpeza e casqueamento.',
      'Cicatrizantes e repelentes tópicos contra miíases.'
    ],
    photoUrl: '/diseases/pododermatite_casco.jpg',
    prevention:
      'Realizar casqueamento preventivo e corretivo duas a quatro vezes ao ano. Manter apriscos secos e drenados. Passar animais recém-adquiridos pelo pedilúvio de quarentena.'
  },
  {
    id: 'dis-5',
    name: 'Coccidiose (Eimeriose)',
    category: 'Parasitária',
    etiology:
      'Infecção intestinal causada por protozoários do gênero Eimeria, transmitida pela ingestão de oocistos esporulados presentes na água, solo, pastagens ou camas contaminadas por fezes.',
    symptoms: [
      'Diarreia escura, pastosa ou líquida, frequentemente com estrias de sangue e muco.',
      'Desidratação acentuada, fraqueza, apatia e pelos ásperos e arrepiados.',
      'Cólicas abdominais, tenesmo e anemia visível nas mucosas.',
      'Atraso no crescimento de cabritos desmamados e risco elevado de mortalidade.'
    ],
    products: [
      'Toltrazuril 5% (coccidicida de dose única oral).',
      'Amprólio ou Sulfonamidas (Sulfadiazina + Trimetoprima) via oral.',
      'Soluções eletrolíticas reidratantes (soro oral) para reposição hídrica.',
      'Coccidiostáticos preventivos na ração sob orientação técnica.'
    ],
    photoUrl: '/diseases/coccidiose_cabrito.jpg',
    prevention:
      'Evitar superlotação nas baias de recria. Manter comedouros e bebedouros elevados contra contaminação fecal. Higienizar a cama dos apriscos semanalmente e aplicar protocolo preventivo no desmame.'
  }
];

const CATEGORIES = ['Todos', 'Bacteriana', 'Viral', 'Parasitária', 'Fúngica', 'Metabólica'];

export const CaprineDiseaseLibraryView: React.FC = () => {
  const [diseases, setDiseases] = useState<Disease[]>(() => {
    const saved = localStorage.getItem('caprine_disease_library');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Disease[];
        return parsed.map(d => {
          const initial = INITIAL_DISEASES.find(init => init.id === d.id);
          if (
            initial &&
            (d.photoUrl.startsWith('data:image/svg') ||
              d.photoUrl.startsWith('https://images.unsplash') ||
              !d.photoUrl.startsWith('/diseases/'))
          ) {
            return { ...d, photoUrl: initial.photoUrl };
          }
          return d;
        });
      } catch {
        return INITIAL_DISEASES;
      }
    }
    return INITIAL_DISEASES;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string>(INITIAL_DISEASES[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState('');
  const [reminderError, setReminderError] = useState('');

  const [reminders, setReminders] = useState<SanitaryReminder[]>(() => {
    const saved = localStorage.getItem('caprine_disease_reminders');
    if (saved) {
      try {
        return JSON.parse(saved) as SanitaryReminder[];
      } catch {
        return DEFAULT_REMINDERS;
      }
    }
    return DEFAULT_REMINDERS;
  });

  const [isAddReminderExpanded, setIsAddReminderExpanded] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderType, setNewReminderType] = useState<SanitaryReminder['type']>('Vacinação');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderRepeat, setNewReminderRepeat] = useState<SanitaryReminder['repeat']>('Anual');
  const [newReminderTargetGroup, setNewReminderTargetGroup] = useState('Todo o rebanho');
  const [newReminderNotes, setNewReminderNotes] = useState('');

  const [newDisease, setNewDisease] = useState<Partial<Disease>>({
    name: '',
    category: 'Bacteriana',
    etiology: '',
    symptoms: [''],
    products: [''],
    photoUrl: '',
    prevention: ''
  });

  const filteredDiseases = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return diseases.filter(d => {
      const matchesCategory = selectedCategory === 'Todos' || d.category === selectedCategory;
      const matchesSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.etiology.toLowerCase().includes(q) ||
        d.symptoms.some(s => s.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [diseases, selectedCategory, searchTerm]);

  const selectedDisease =
    filteredDiseases.find(d => d.id === selectedDiseaseId) || filteredDiseases[0] || null;

  const saveRemindersToStorage = (list: SanitaryReminder[]) => {
    localStorage.setItem('caprine_disease_reminders', JSON.stringify(list));
  };

  const saveDiseasesToStorage = (list: Disease[]) => {
    localStorage.setItem('caprine_disease_library', JSON.stringify(list));
  };

  const handleToggleReminderCompleted = (id: string) => {
    const updated = reminders.map(r => (r.id === id ? { ...r, completed: !r.completed } : r));
    setReminders(updated);
    saveRemindersToStorage(updated);
  };

  const handleRemoveReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    saveRemindersToStorage(updated);
  };

  const handleAddReminder = (e: React.FormEvent, diseaseId: string, diseaseName: string) => {
    e.preventDefault();
    if (!newReminderTitle.trim() || !newReminderDate) {
      setReminderError('Defina um título e uma data para o alerta.');
      return;
    }

    const created: SanitaryReminder = {
      id: `rem-${Date.now()}`,
      diseaseId,
      diseaseName,
      title: newReminderTitle.trim(),
      type: newReminderType,
      date: newReminderDate,
      repeat: newReminderRepeat,
      targetGroup: newReminderTargetGroup || 'Geral',
      notes: newReminderNotes,
      completed: false
    };

    const updated = [...reminders, created];
    setReminders(updated);
    saveRemindersToStorage(updated);

    setNewReminderTitle('');
    setNewReminderType('Vacinação');
    setNewReminderDate('');
    setNewReminderRepeat('Anual');
    setNewReminderTargetGroup('Todo o rebanho');
    setNewReminderNotes('');
    setReminderError('');
    setIsAddReminderExpanded(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewDisease(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisease.name?.trim() || !newDisease.etiology?.trim()) {
      setModalError('Preencha o nome da patologia e a etiologia.');
      return;
    }

    const filteredSymptoms = (newDisease.symptoms || []).filter(s => s.trim() !== '');
    const filteredProducts = (newDisease.products || []).filter(p => p.trim() !== '');

    const created: Disease = {
      id: `dis-${Date.now()}`,
      name: newDisease.name.trim(),
      category: (newDisease.category as Disease['category']) || 'Bacteriana',
      etiology: newDisease.etiology.trim(),
      symptoms: filteredSymptoms.length > 0 ? filteredSymptoms : ['Sintomas não documentados.'],
      products:
        filteredProducts.length > 0 ? filteredProducts : ['Nenhum produto indicado registrado.'],
      photoUrl:
        newDisease.photoUrl ||
        'https://images.unsplash.com/photo-1524024414332-201a3cdad338?auto=format&fit=crop&w=800&q=80',
      prevention: newDisease.prevention || 'Medidas gerais de higiene e biosseguridade.'
    };

    const updatedList = [created, ...diseases];
    setDiseases(updatedList);
    saveDiseasesToStorage(updatedList);
    setSelectedDiseaseId(created.id);
    setIsModalOpen(false);
    setModalError('');

    setNewDisease({
      name: '',
      category: 'Bacteriana',
      etiology: '',
      symptoms: [''],
      products: [''],
      photoUrl: '',
      prevention: ''
    });
  };

  const getCategoryTone = (cat: Disease['category']) => {
    switch (cat) {
      case 'Bacteriana':
        return 'text-sky-700 dark:text-sky-400';
      case 'Viral':
        return 'text-violet-700 dark:text-violet-400';
      case 'Parasitária':
        return 'text-amber-700 dark:text-amber-400';
      case 'Fúngica':
        return 'text-yellow-700 dark:text-yellow-400';
      default:
        return 'text-rose-700 dark:text-rose-400';
    }
  };

  const inputCls =
    'w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500';

  const selectedDiseaseReminders = selectedDisease
    ? reminders.filter(r => r.diseaseId === selectedDisease.id)
    : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            Biblioteca de Patologias &amp; Doenças Caprinas
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Etiologias, sinais clínicos, protocolos de controle e agendamentos sanitários preventivos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setModalError('');
            setIsModalOpen(true);
          }}
          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Nova Patologia
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar patologia, agente ou sintoma..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-8 pl-8 pr-3 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`h-8 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-50 dark:bg-zinc-950 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Master-Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left List */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden self-start">
          {filteredDiseases.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-zinc-400 space-y-1.5">
              <Info className="w-5 h-5 mx-auto text-slate-400" />
              <p className="text-xs font-medium">Nenhuma patologia encontrada com os filtros ativos.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800 max-h-[620px] overflow-y-auto">
              {filteredDiseases.map(d => {
                const activeCount = reminders.filter(
                  r => r.diseaseId === d.id && !r.completed
                ).length;
                const isSelected = selectedDisease?.id === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDiseaseId(d.id)}
                    className={`w-full p-3.5 text-left flex gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/25 border-l-2 border-l-emerald-600'
                        : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <img
                      src={d.photoUrl}
                      alt={d.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-lg object-cover bg-slate-100 dark:bg-zinc-800 shrink-0 border border-slate-200 dark:border-zinc-700"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] font-medium ${getCategoryTone(d.category)}`}>
                          {d.category}
                        </span>
                        {activeCount > 0 && (
                          <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 inline-flex items-center gap-1 tabular-nums shrink-0">
                            <Bell className="w-3 h-3" />
                            {activeCount}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                        {d.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2">
                        {d.etiology}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Detail Panel */}
        <div className="lg:col-span-7">
          {selectedDisease ? (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
              {/* Cover Image */}
              <div className="relative h-48 bg-slate-100 dark:bg-zinc-800">
                <img
                  src={selectedDisease.photoUrl}
                  alt={selectedDisease.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/30 to-transparent flex items-end p-5">
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-emerald-300">
                      {selectedDisease.category}
                    </span>
                    <h2 className="text-base font-semibold text-white">{selectedDisease.name}</h2>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5 text-xs">
                {/* Etiology */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Etiologia e Transmissão
                  </h4>
                  <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {selectedDisease.etiology}
                  </p>
                </div>

                {/* Symptoms */}
                <div className="space-y-1.5 pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Sinais Clínicos
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 dark:text-zinc-300">
                    {selectedDisease.symptoms.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Products */}
                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Syringe className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    Produtos e Condutas de Controle
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedDisease.products.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 flex items-start gap-2"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-slate-700 dark:text-zinc-300 leading-snug">
                          {p}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prevention */}
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 space-y-1">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    Prevenção e Biosseguridade
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                    {selectedDisease.prevention}
                  </p>
                </div>

                {/* Sanitary Reminders */}
                <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      Lembretes &amp; Controle Sanitário Agendado
                    </h4>

                    <button
                      type="button"
                      onClick={() => {
                        setReminderError('');
                        setIsAddReminderExpanded(!isAddReminderExpanded);
                      }}
                      className="h-7 px-2.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-[11px] font-medium cursor-pointer transition-colors"
                    >
                      {isAddReminderExpanded ? 'Fechar' : '+ Novo Alerta'}
                    </button>
                  </div>

                  {isAddReminderExpanded && (
                    <form
                      onSubmit={e =>
                        handleAddReminder(e, selectedDisease.id, selectedDisease.name)
                      }
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 space-y-3"
                    >
                      {reminderError && (
                        <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-[11px]">
                          {reminderError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                            Título do Alerta *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Vacinação Polivalente"
                            value={newReminderTitle}
                            onChange={e => setNewReminderTitle(e.target.value)}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                            Tipo *
                          </label>
                          <select
                            value={newReminderType}
                            onChange={e =>
                              setNewReminderType(e.target.value as SanitaryReminder['type'])
                            }
                            className={inputCls}
                          >
                            <option value="Vacinação">Vacinação</option>
                            <option value="Tratamento">Tratamento</option>
                            <option value="Exame">Exame (Sorológico/Parasitológico)</option>
                            <option value="Manejo">Manejo Preventivo</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                            Data Agendada *
                          </label>
                          <input
                            type="date"
                            required
                            value={newReminderDate}
                            onChange={e => setNewReminderDate(e.target.value)}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                            Repetição
                          </label>
                          <select
                            value={newReminderRepeat}
                            onChange={e =>
                              setNewReminderRepeat(e.target.value as SanitaryReminder['repeat'])
                            }
                            className={inputCls}
                          >
                            <option value="Único">Único</option>
                            <option value="Mensal">Mensal</option>
                            <option value="Semestral">Semestral</option>
                            <option value="Anual">Anual</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                            Grupo Alvo
                          </label>
                          <input
                            type="text"
                            value={newReminderTargetGroup}
                            onChange={e => setNewReminderTargetGroup(e.target.value)}
                            className={inputCls}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                          Observações Veterinárias
                        </label>
                        <textarea
                          rows={2}
                          value={newReminderNotes}
                          onChange={e => setNewReminderNotes(e.target.value)}
                          placeholder="Dosagem, via de aplicação ou carência..."
                          className="w-full p-2 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddReminderExpanded(false)}
                          className="h-7 px-3 rounded-lg bg-slate-200/70 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="h-7 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                        >
                          Agendar Alerta
                        </button>
                      </div>
                    </form>
                  )}

                  {selectedDiseaseReminders.length === 0 ? (
                    <div className="p-5 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-center text-[11px] text-slate-500 dark:text-zinc-400">
                      Nenhum lembrete agendado para esta patologia.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                      {selectedDiseaseReminders.map(r => (
                        <div
                          key={r.id}
                          className={`p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            r.completed ? 'opacity-60 bg-slate-50/50 dark:bg-zinc-950/40' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => handleToggleReminderCompleted(r.id)}
                              className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                                r.completed
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-300 dark:border-zinc-700 hover:border-emerald-500'
                              }`}
                            >
                              {r.completed && <Check className="w-2.5 h-2.5" />}
                            </button>

                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`text-xs font-semibold ${
                                    r.completed
                                      ? 'line-through text-slate-400'
                                      : 'text-slate-900 dark:text-zinc-100'
                                  }`}
                                >
                                  {r.title}
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                                  {r.type}
                                </span>
                                {r.repeat !== 'Único' && (
                                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 inline-flex items-center gap-1">
                                    <Repeat className="w-3 h-3" />
                                    {r.repeat}
                                  </span>
                                )}
                              </div>

                              {r.notes && (
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                  {r.notes}
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400">
                                <span className="inline-flex items-center gap-1 tabular-nums">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(r.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {r.targetGroup}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleReminderCompleted(r.id)}
                              className={`h-7 px-2.5 rounded-lg text-[11px] font-medium cursor-pointer transition-colors ${
                                r.completed
                                  ? 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {r.completed ? 'Reabrir' : 'Concluir'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveReminder(r.id)}
                              className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                              title="Excluir lembrete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-10 text-center text-xs text-slate-500 dark:text-zinc-400">
              Selecione uma patologia na lista ao lado para visualizar o protocolo completo.
            </div>
          )}
        </div>
      </div>

      {/* Add Custom Disease Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full border border-slate-200 dark:border-zinc-800 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-white dark:bg-zinc-900">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Cadastrar Nova Patologia
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              {modalError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300">
                  {modalError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Nome da Patologia *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDisease.name || ''}
                    onChange={e => setNewDisease({ ...newDisease, name: e.target.value })}
                    className={inputCls}
                    placeholder="Ex: Ceratoconjuntivite Infecciosa"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={newDisease.category || 'Bacteriana'}
                    onChange={e =>
                      setNewDisease({
                        ...newDisease,
                        category: e.target.value as Disease['category']
                      })
                    }
                    className={inputCls}
                  >
                    <option value="Bacteriana">Bacteriana</option>
                    <option value="Viral">Viral</option>
                    <option value="Parasitária">Parasitária</option>
                    <option value="Fúngica">Fúngica</option>
                    <option value="Metabólica">Metabólica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Etiologia e Transmissão *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newDisease.etiology || ''}
                  onChange={e => setNewDisease({ ...newDisease, etiology: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Agente causador, fatores ambientais e formas de contágio..."
                />
              </div>

              {/* Dynamic Symptoms */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                    Sintomas Clínicos
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setNewDisease(prev => ({ ...prev, symptoms: [...(prev.symptoms || []), ''] }))
                    }
                    className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium cursor-pointer hover:underline"
                  >
                    + Adicionar sintoma
                  </button>
                </div>
                {(newDisease.symptoms || []).map((symptom, idx) => (
                  <div key={idx} className="flex gap-1.5 items-center">
                    <input
                      type="text"
                      value={symptom}
                      onChange={e => {
                        const updated = [...(newDisease.symptoms || [])];
                        updated[idx] = e.target.value;
                        setNewDisease(prev => ({ ...prev, symptoms: updated }));
                      }}
                      className={inputCls}
                      placeholder="Descreva o sinal clínico..."
                    />
                    {(newDisease.symptoms || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(newDisease.symptoms || [])];
                          updated.splice(idx, 1);
                          setNewDisease(prev => ({ ...prev, symptoms: updated }));
                        }}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Dynamic Products */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                    Produtos / Princípios Ativos
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setNewDisease(prev => ({ ...prev, products: [...(prev.products || []), ''] }))
                    }
                    className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium cursor-pointer hover:underline"
                  >
                    + Adicionar produto
                  </button>
                </div>
                {(newDisease.products || []).map((product, idx) => (
                  <div key={idx} className="flex gap-1.5 items-center">
                    <input
                      type="text"
                      value={product}
                      onChange={e => {
                        const updated = [...(newDisease.products || [])];
                        updated[idx] = e.target.value;
                        setNewDisease(prev => ({ ...prev, products: updated }));
                      }}
                      className={inputCls}
                      placeholder="Ex: Sulfato de Zinco 10%"
                    />
                    {(newDisease.products || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(newDisease.products || [])];
                          updated.splice(idx, 1);
                          setNewDisease(prev => ({ ...prev, products: updated }));
                        }}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Prevenção e Biosseguridade
                </label>
                <textarea
                  rows={2}
                  value={newDisease.prevention || ''}
                  onChange={e => setNewDisease({ ...newDisease, prevention: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Foto Clínica
                </label>
                {newDisease.photoUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800 h-28">
                    <img
                      src={newDisease.photoUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setNewDisease(prev => ({ ...prev, photoUrl: '' }))}
                      className="absolute top-2 right-2 h-7 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      Remover
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => document.getElementById('disease-file-input')?.click()}
                      className="w-full border border-dashed border-slate-300 dark:border-zinc-700 rounded-lg p-3.5 text-center hover:bg-slate-50 dark:hover:bg-zinc-800/40 cursor-pointer flex flex-col items-center gap-1"
                    >
                      <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                        Capturar foto ou selecionar da galeria
                      </span>
                    </button>
                    <input
                      type="text"
                      value={newDisease.photoUrl || ''}
                      onChange={e => setNewDisease({ ...newDisease, photoUrl: e.target.value })}
                      className={inputCls}
                      placeholder="Ou informe a URL da imagem (https://...)"
                    />
                  </div>
                )}
                <input
                  type="file"
                  id="disease-file-input"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Salvar Patologia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
