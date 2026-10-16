import React, { useState, useMemo } from 'react';
import { Search, Plus, BookOpen, AlertTriangle, Syringe, Sparkles, X, Camera, Check, Info, Bell, Calendar, Clock, Trash2 } from 'lucide-react';

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
    notes: 'Aplicar vacina polivalente contra linfadenite caseosa em todos os animais sadios. Isolar os reagentes.',
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
    notes: 'Limpeza profunda e aplicação de solução clorada para eliminar resíduos do vírus altamente resistente.',
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
    notes: 'Coleta de sangue para exame diagnóstico sorológico. Animais reagentes devem ser apartados de imediato.',
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
    notes: 'Realizar casqueamento preventivo e forçar passagem de 5-10 minutos pelo pedilúvio de sulfato de zinco a 10%.',
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
    notes: 'Administrar dose única oral preventiva de Toltrazuril 5% para evitar surto de diarreia negra com sangue.',
    completed: false
  }
];

const INITIAL_DISEASES: Disease[] = [
  {
    id: 'dis-1',
    name: 'Linfadenite Caseosa (Mal do Caroço)',
    category: 'Bacteriana',
    etiology: 'Causada pela bactéria Corynebacterium pseudotuberculosis. Altamente resistente no ambiente, penetra através de ferimentos na pele causados por farpas, cercas, tosquia ou instalações.',
    symptoms: [
      'Aparecimento de abscessos (caroços) firmes nos linfonodos superficiais (pescoço, abaixo da orelha, paleta, flanco).',
      'Pus espesso, pastoso e de coloração esverdeada em camadas concêntricas ("em cebola") ao romper.',
      'Perda de peso progressiva (síndrome da cabra magra) quando afeta linfonodos internos (pulmões, fígado).',
      'Redução severa na produção de leite e taxa de fertilidade do rebanho.'
    ],
    products: [
      'Tintura de Iodo 10% (para cauterização do abscesso após drenagem cirúrgica).',
      'Desinfetantes à base de Amônia Quaternária ou Cloro Ativo (para higienização rigorosa das instalações).',
      'Antibióticos injetáveis de amplo espectro (como Oxitetraciclina de Longa Ação ou Penicilina Benzatina) sob orientação médica.',
      'Vacina polivalente contra Linfadenite Caseosa (prevenção anual).'
    ],
    photoUrl: '/diseases/linfadenite_caseosa.jpg',
    prevention: 'Isolar imediatamente animais com abscessos antes que se rompam. Realizar a drenagem cirúrgica em local isolado ("sala de cura"), coletando e queimando o pus. Desinfetar instrumentos de tosquia e casqueamento.'
  },
  {
    id: 'dis-2',
    name: 'Ectima Contagioso (Boqueira / Sarna Labial)',
    category: 'Viral',
    etiology: 'Doença infectocontagiosa causada por um Parapoxvirus (família Poxviridae). É uma zoonose (pode ser transmitida a humanos que fabriquem ou manipulem os animais sem proteção). Altamente persistente no solo.',
    symptoms: [
      'Formação de pápulas e vesículas que progridem para crostas espessas, escuras e doloridas ao redor dos lábios e narinas.',
      'Lesões semelhantes podem aparecer no úbere das matrizes (transmitidas pelos cabritos ao mamar) e na coroa do casco.',
      'Animais jovens recusam-se a mamar ou se alimentar devido à dor intensa, levando à desidratação e desnutrição.',
      'Infecções bacterianas secundárias nas lesões, piorando o quadro clínico.'
    ],
    products: [
      'Glicerina Iodada a 10% ou Solução de Alume (para amolecer e cicatrizar as crostas secas).',
      'Pomadas cicatrizantes e anti-inflamatórias à base de óxido de zinco e sulfato de neomicina.',
      'Antibióticos spray (como Oxitetraciclina aerosol) para evitar contaminação bacteriana secundária.',
      'Vacina de vírus ativo atenuado (aplicada na face interna da coxa ou cauda em plantéis endêmicos).'
    ],
    photoUrl: '/diseases/ectima_contagioso.jpg',
    prevention: 'Evitar introdução de animais de fontes desconhecidas. Isolar lotes afetados. Utilizar luvas descartáveis para manejar animais com boqueira. Vacinar cabritos recém-nascidos em propriedades com histórico.'
  },
  {
    id: 'dis-3',
    name: 'Artrite Encefalite Caprina (CAE)',
    category: 'Viral',
    etiology: 'Infecção crônica multissistêmica causada por um Lentivírus (família Retroviridae). A principal via de transmissão é a ingestão de colostro e leite cru de cabras infectadas, ou contato direto com secreções respiratórias.',
    symptoms: [
      'Artrite crônica progressiva, principalmente nas articulações carporais ("joelhos inchados"), causando claudicação severa.',
      'Encefalite em cabritos de 2 a 4 meses de idade, manifestando-se por incoordenação motora, tremores e paralisia progressiva.',
      'Úbere endurecido na parição (mamite crônica indurativa) com secreção láctea reduzida ou nula, sem sinais inflamatórios agudos.',
      'Pneumonia crônica intersticial com tosse seca e dificuldade respiratória em animais adultos.'
    ],
    products: [
      'Não existe vacina ou tratamento curativo contra o lentivírus da CAE.',
      'Anti-inflamatórios não esteroidais (Aine) como Flunixina Meglumina ou Cetoprofeno para alívio da dor articular em matrizes valiosas.',
      'Kits de teste diagnóstico sorológico ELISA (para triagem periódica semestral de todo o rebanho).',
      'Suplementos minerais e vitamínicos de alta qualidade para reforço imunológico.'
    ],
    photoUrl: '/diseases/cae_arthritis.jpg',
    prevention: 'Separar imediatamente os cabritos das matrizes reagentes positivas logo ao nascimento. Alimentar os filhotes apenas com colostro e leite pasteurizado (aquecido a 56°C por 60 minutos) ou leite de vacas livres de CAE. Descartar animais soropositivos.'
  },
  {
    id: 'dis-4',
    name: 'Pododermatite Infecciosa (Podridão dos Cascos / Footrot)',
    category: 'Bacteriana',
    etiology: 'Infecção sinérgica entre duas bactérias anaeróbicas principais: Dichelobacter nodosus e Fusobacterium necrophorum. Favorecida por solos úmidos, lama, acúmulo de esterco e falta de casqueamento corretivo.',
    symptoms: [
      'Claudicação (manqueira) progressiva e severa; o animal frequentemente pasta de joelhos para aliviar o peso.',
      'Inflamação, vermelhidão e odor extremamente fétido característico na região interdigital.',
      'Descolamento progressivo da sola córnea e parede do casco com acúmulo de material necrótico acinzentado.',
      'Febre, perda de apetite rápida e emagrecimento severo devido ao estresse doloroso.'
    ],
    products: [
      'Pedilúvio com Sulfato de Cobre a 10% ou Sulfato de Zinco a 10% (banho de cascos semanal).',
      'Antibióticos injetáveis específicos (como Florfenicol, Ceftiofur ou Penicilina associada à Estreptomicina).',
      'Oxitetraciclina Spray Aerossol de aplicação tópica direta após limpeza e casqueamento das feridas.',
      'Cicatrizantes e repelentes tópicos para evitar miíases (bicheiras) nos cascos expostos.'
    ],
    photoUrl: '/diseases/pododermatite_casco.jpg',
    prevention: 'Realizar casqueamento preventivo e corretivo duas a quatro vezes ao ano. Manter os apriscos secos, limpos e bem drenados. Passar os animais recém-nascidos ou recém-adquiridos pelo pedilúvio de quarentena.'
  },
  {
    id: 'dis-5',
    name: 'Coccidiose (Eimeriose)',
    category: 'Parasitária',
    etiology: 'Infeção intestinal causada por protozoários do gênero Eimeria. Ocorre pela ingestão de oocistos esporulados presentes na água, solo, pastagens ou camas contaminadas por fezes.',
    symptoms: [
      'Diarreia escura, pastosa ou líquida, frequentemente contendo estrias de sangue, muco e odor desagradável.',
      'Desidratação acentuada, fraqueza, apatia extrema e pelos ásperos e arrepiados.',
      'Cólicas abdominais, tenesmo (esforço constante para defecar) e anemia visível nas mucosas.',
      'Atraso permanente no crescimento de cabritos desmamados e alta taxa de mortalidade.'
    ],
    products: [
      'Toltrazuril 5% (Coccidicida de dose única oral altamente eficaz para caprinos).',
      'Amprólio ou Sulfonamidas (como Sulfadiazina + Trimetoprima) administrados via oral ou água.',
      'Soluções eletrolíticas reidratantes (soro oral) para recuperação de fluidos e eletrólitos perdidos.',
      'Coccidiostáticos preventivos (como Lasalocida ou Monensina Sódica) adicionados na ração sob controle.'
    ],
    photoUrl: '/diseases/coccidiose_cabrito.jpg',
    prevention: 'Evitar superlotação nas baias de recria. Manter comedouros e bebedouros elevados para evitar contaminação fecal. Limpar e trocar a cama dos apriscos semanalmente. Administrar preventivo aos cabritos no desmame.'
  }
];

export const CaprineDiseaseLibraryView: React.FC = () => {
  const [diseases, setDiseases] = useState<Disease[]>(() => {
    const saved = localStorage.getItem('caprine_disease_library');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((d: Disease) => {
          const initial = INITIAL_DISEASES.find(init => init.id === d.id);
          // Auto-upgrade vector images or outdated URLs to the new ultra-realistic offline photographic assets
          if (initial && (d.photoUrl.startsWith('data:image/svg') || d.photoUrl.startsWith('https://images.unsplash') || !d.photoUrl.startsWith('/diseases/'))) {
            return { ...d, photoUrl: initial.photoUrl };
          }
          return d;
        });
      } catch (err) {
        return INITIAL_DISEASES;
      }
    }
    return INITIAL_DISEASES;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reminders and alerts state
  const [reminders, setReminders] = useState<SanitaryReminder[]>(() => {
    const saved = localStorage.getItem('caprine_disease_reminders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        return DEFAULT_REMINDERS;
      }
    }
    return DEFAULT_REMINDERS;
  });

  // Form states for scheduling a new reminder
  const [isAddReminderExpanded, setIsAddReminderExpanded] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderType, setNewReminderType] = useState<'Vacinação' | 'Tratamento' | 'Exame' | 'Manejo'>('Vacinação');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderRepeat, setNewReminderRepeat] = useState<'Único' | 'Mensal' | 'Semestral' | 'Anual'>('Anual');
  const [newReminderTargetGroup, setNewReminderTargetGroup] = useState('Todo o rebanho');
  const [newReminderNotes, setNewReminderNotes] = useState('');

  const saveRemindersToStorage = (list: SanitaryReminder[]) => {
    localStorage.setItem('caprine_disease_reminders', JSON.stringify(list));
  };

  const handleToggleReminderCompleted = (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r);
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
    if (!newReminderTitle || !newReminderDate) {
      alert('Por favor, defina um título e uma data para o lembrete.');
      return;
    }

    const created: SanitaryReminder = {
      id: `rem-${Date.now()}`,
      diseaseId,
      diseaseName,
      title: newReminderTitle,
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

    // Reset Form
    setNewReminderTitle('');
    setNewReminderType('Vacinação');
    setNewReminderDate('');
    setNewReminderRepeat('Anual');
    setNewReminderTargetGroup('Todo o rebanho');
    setNewReminderNotes('');
    setIsAddReminderExpanded(false);
  };

  // Form states for new custom disease
  const [newDisease, setNewDisease] = useState<Partial<Disease>>({
    name: '',
    category: 'Bacteriana',
    etiology: '',
    symptoms: [''],
    products: [''],
    photoUrl: '',
    prevention: ''
  });

  const categories = ['Todos', 'Bacteriana', 'Viral', 'Parasitária', 'Fúngica', 'Metabólica'];

  const filteredDiseases = useMemo(() => {
    return diseases.filter(d => {
      const matchesCategory = selectedCategory === 'Todos' || d.category === selectedCategory;
      const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            d.etiology.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            d.symptoms.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [diseases, selectedCategory, searchTerm]);

  const saveToLocalStorage = (list: Disease[]) => {
    localStorage.setItem('caprine_disease_library', JSON.stringify(list));
  };

  const handleAddSymptomField = () => {
    setNewDisease(prev => ({
      ...prev,
      symptoms: [...(prev.symptoms || []), '']
    }));
  };

  const handleSymptomChange = (index: number, value: string) => {
    const updated = [...(newDisease.symptoms || [])];
    updated[index] = value;
    setNewDisease(prev => ({ ...prev, symptoms: updated }));
  };

  const handleRemoveSymptomField = (index: number) => {
    const updated = [...(newDisease.symptoms || [])];
    updated.splice(index, 1);
    setNewDisease(prev => ({ ...prev, symptoms: updated }));
  };

  const handleAddProductField = () => {
    setNewDisease(prev => ({
      ...prev,
      products: [...(prev.products || []), '']
    }));
  };

  const handleProductChange = (index: number, value: string) => {
    const updated = [...(newDisease.products || [])];
    updated[index] = value;
    setNewDisease(prev => ({ ...prev, products: updated }));
  };

  const handleRemoveProductField = (index: number) => {
    const updated = [...(newDisease.products || [])];
    updated.splice(index, 1);
    setNewDisease(prev => ({ ...prev, products: updated }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewDisease(prev => ({
          ...prev,
          photoUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisease.name || !newDisease.etiology) {
      alert('Por favor, preencha o nome da doença e a etiologia.');
      return;
    }

    const filteredSymptoms = (newDisease.symptoms || []).filter(s => s.trim() !== '');
    const filteredProducts = (newDisease.products || []).filter(p => p.trim() !== '');

    const created: Disease = {
      id: `dis-${Date.now()}`,
      name: newDisease.name,
      category: newDisease.category as any,
      etiology: newDisease.etiology,
      symptoms: filteredSymptoms.length > 0 ? filteredSymptoms : ['Sintomas não documentados.'],
      products: filteredProducts.length > 0 ? filteredProducts : ['Nenhum produto indicado registrado.'],
      photoUrl: newDisease.photoUrl || 'https://images.unsplash.com/photo-1524024414332-201a3cdad338?auto=format&fit=crop&w=800&q=80',
      prevention: newDisease.prevention || 'Medidas gerais de higiene e biosseguridade.'
    };

    const updatedList = [created, ...diseases];
    setDiseases(updatedList);
    saveToLocalStorage(updatedList);
    setIsModalOpen(false);

    // Reset form
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-500" />
            Biblioteca Veterinária de Patologias e Doenças Caprinas
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Consulta rápida de etiologias, sintomas característicos, tratamentos, produtos de controle recomendados e fotos clínicas para diagnóstico preventivo.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Nova Doença
        </button>
      </div>

      {/* Control Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Pesquisar por nome da patologia, etiologia, sintomas..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 text-xs shadow-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Category Selector Scrollable */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full md:max-w-md">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-zinc-800 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Disease Cards list */}
        <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {filteredDiseases.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 text-stone-400">
              <Info className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-xs font-bold">Nenhuma patologia encontrada com os filtros ativos.</p>
            </div>
          ) : (
            filteredDiseases.map(d => {
              const activeRemindersCount = reminders.filter(r => r.diseaseId === d.id && !r.completed).length;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDisease(d)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex gap-4 ${
                    selectedDisease?.id === d.id
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <img
                    src={d.photoUrl}
                    alt={d.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-lg object-cover bg-stone-100 dark:bg-zinc-800 flex-shrink-0"
                  />
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                        d.category === 'Bacteriana' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300' :
                        d.category === 'Viral' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300' :
                        d.category === 'Parasitária' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
                        d.category === 'Fúngica' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300' :
                        'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}>
                        {d.category}
                      </span>
                      {activeRemindersCount > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                          <Bell className="w-2.5 h-2.5" />
                          {activeRemindersCount} Lembrete{activeRemindersCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-stone-900 dark:text-white text-xs truncate">{d.name}</h3>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-2">{d.etiology}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Detailed Disease Reader panel */}
        <div className="lg:col-span-7">
          {selectedDisease ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden shadow-sm space-y-6">
              {/* Header Image Cover */}
              <div className="relative h-60 bg-stone-100 dark:bg-zinc-800">
                <img
                  src={selectedDisease.photoUrl}
                  alt={selectedDisease.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent flex items-end p-6">
                  <div className="space-y-1.5">
                    <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {selectedDisease.category}
                    </span>
                    <h2 className="text-xl font-black text-white">{selectedDisease.name}</h2>
                  </div>
                </div>
              </div>

              {/* Clinical Description Content */}
              <div className="p-6 space-y-5 text-xs">
                {/* Etiology (Etiologia) */}
                <div className="space-y-2">
                  <h4 className="font-black text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    Etiologia (Causa e Transmissão)
                  </h4>
                  <p className="text-stone-600 dark:text-stone-300 leading-relaxed font-bold">
                    {selectedDisease.etiology}
                  </p>
                </div>

                {/* Symptoms (Sintomas) */}
                <div className="space-y-2">
                  <h4 className="font-black text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Sintomas Característicos (Sinais Clínicos)
                  </h4>
                  <ul className="space-y-1.5 text-stone-600 dark:text-stone-300 font-bold">
                    {selectedDisease.symptoms.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Products and Control (Produtos de Controle) */}
                <div className="space-y-2">
                  <h4 className="font-black text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                    <Syringe className="w-4 h-4 text-blue-500" />
                    Produtos Indicados para Controle e Tratamento
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {selectedDisease.products.map((p, idx) => (
                      <div key={idx} className="bg-stone-50 dark:bg-zinc-800 p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700/60 flex items-center gap-2">
                        <div className="bg-emerald-500/10 text-emerald-600 p-1 rounded-md">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-stone-800 dark:text-stone-200 text-[11px] leading-tight">
                          {p}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prevention (Prevenção e Biosseguridade) */}
                <div className="bg-stone-50 dark:bg-zinc-800/40 border border-stone-200 dark:border-zinc-800 rounded-xl p-4 space-y-1.5">
                  <strong className="font-black text-stone-900 dark:text-white block">Prevenção e Biosseguridade do Rebanho:</strong>
                  <p className="text-stone-500 dark:text-stone-400 leading-relaxed text-[11px] font-bold">
                    {selectedDisease.prevention}
                  </p>
                </div>

                {/* Scheduled Reminders & Sanitary Control (Lembretes e Controle Sanitário Agendados) */}
                <div className="border-t border-stone-150 dark:border-zinc-800 pt-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-rose-500 animate-bounce" />
                      Lembretes & Controle Sanitário Agendado
                    </h4>
                    
                    <button
                      type="button"
                      onClick={() => setIsAddReminderExpanded(!isAddReminderExpanded)}
                      className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold rounded-lg text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                    >
                      {isAddReminderExpanded ? 'Fechar Form' : '+ Novo Alerta'}
                    </button>
                  </div>

                  {/* Form to Add New Reminder */}
                  {isAddReminderExpanded && (
                    <form 
                      onSubmit={(e) => handleAddReminder(e, selectedDisease.id, selectedDisease.name)}
                      className="bg-stone-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-stone-200 dark:border-zinc-800 space-y-3 shadow-inner text-xs"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Título do Alerta / Atividade *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Vacinação Polivalente, Banho de Casco"
                            value={newReminderTitle}
                            onChange={e => setNewReminderTitle(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-zinc-900 rounded-lg border border-stone-200 dark:border-zinc-850 font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Tipo de Controle *</label>
                          <select
                            value={newReminderType}
                            onChange={e => setNewReminderType(e.target.value as any)}
                            className="w-full p-2 bg-white dark:bg-zinc-900 rounded-lg border border-stone-200 dark:border-zinc-850 font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          >
                            <option value="Vacinação">Vacinação</option>
                            <option value="Tratamento">Tratamento</option>
                            <option value="Exame">Exame (Sorológico/Parasitológico)</option>
                            <option value="Manejo">Manejo Preventivo</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Data Agendada *</label>
                          <input
                            type="date"
                            required
                            value={newReminderDate}
                            onChange={e => setNewReminderDate(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-zinc-900 rounded-lg border border-stone-200 dark:border-zinc-850 font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Repetição</label>
                          <select
                            value={newReminderRepeat}
                            onChange={e => setNewReminderRepeat(e.target.value as any)}
                            className="w-full p-2 bg-white dark:bg-zinc-900 rounded-lg border border-stone-200 dark:border-zinc-850 font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          >
                            <option value="Único">Único / Sem repetição</option>
                            <option value="Mensal">Mensal</option>
                            <option value="Semestral">Semestral</option>
                            <option value="Anual">Anual</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Lote / Grupo Alvo</label>
                          <input
                            type="text"
                            placeholder="Ex: Cabritos, Matrizes, Todo o rebanho"
                            value={newReminderTargetGroup}
                            onChange={e => setNewReminderTargetGroup(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-zinc-900 rounded-lg border border-stone-200 dark:border-zinc-850 font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Notas / Observações Veterinárias</label>
                        <textarea
                          rows={2}
                          placeholder="Dosagem recomendada, via de aplicação, carência pós-tratamento, etc..."
                          value={newReminderNotes}
                          onChange={e => setNewReminderNotes(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-zinc-900 rounded-lg border border-stone-200 dark:border-zinc-850 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddReminderExpanded(false)}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-stone-200 rounded-lg font-bold"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                        >
                          Agendar Alerta
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of Scheduled Reminders for the Selected Disease */}
                  <div className="space-y-2.5">
                    {reminders.filter(r => r.diseaseId === selectedDisease.id).length === 0 ? (
                      <div className="bg-stone-50 dark:bg-zinc-800/20 border border-dashed border-stone-200 dark:border-zinc-800 p-5 rounded-xl text-center text-stone-400">
                        <Calendar className="w-5 h-5 mx-auto text-stone-300 dark:text-zinc-700 mb-1" />
                        <span className="text-[10px] font-bold block">Nenhum alerta configurado para esta patologia.</span>
                        <p className="text-[9px] text-stone-500 mt-0.5">Use o botão acima para agendar vacinas, dosagens de vermífugos ou triagens sorológicas periódicas.</p>
                      </div>
                    ) : (
                      reminders
                        .filter(r => r.diseaseId === selectedDisease.id)
                        .map(r => (
                          <div 
                            key={r.id} 
                            className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                              r.completed 
                                ? 'bg-stone-50/70 dark:bg-zinc-900/40 border-stone-150 dark:border-zinc-800/60 opacity-65' 
                                : 'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 hover:border-stone-300'
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              {/* Icon Indicator based on completed */}
                              <button
                                type="button"
                                onClick={() => handleToggleReminderCompleted(r.id)}
                                className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                  r.completed 
                                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                                    : 'border-stone-300 dark:border-zinc-700 hover:border-emerald-500'
                                }`}
                              >
                                {r.completed && <Check className="w-3 h-3 stroke-[3px]" />}
                              </button>

                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <strong className={`text-[11px] leading-tight ${r.completed ? 'text-stone-400 line-through' : 'text-stone-900 dark:text-white font-extrabold'}`}>
                                    {r.title}
                                  </strong>
                                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                                    r.type === 'Vacinação' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300' :
                                    r.type === 'Tratamento' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300' :
                                    r.type === 'Exame' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300' :
                                    'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                  }`}>
                                    {r.type}
                                  </span>
                                  {r.repeat !== 'Único' && (
                                    <span className="bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-stone-400 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md">
                                      🔄 {r.repeat}
                                    </span>
                                  )}
                                </div>

                                {r.notes && (
                                  <p className="text-[10px] text-stone-500 dark:text-stone-400 font-bold leading-normal">
                                    {r.notes}
                                  </p>
                                )}

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-stone-400 font-bold">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-stone-400" />
                                    Data: {new Date(r.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-stone-400" />
                                    Grupo: {r.targetGroup}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleReminderCompleted(r.id)}
                                className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition-all ${
                                  r.completed 
                                    ? 'bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-zinc-800 text-stone-400' 
                                    : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs'
                                }`}
                              >
                                {r.completed ? 'Reabrir' : 'Concluir'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveReminder(r.id)}
                                className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-zinc-800 rounded-lg transition-all"
                                title="Excluir Lembrete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-12 text-center text-stone-400 shadow-xs h-full flex flex-col items-center justify-center space-y-3">
              <BookOpen className="w-12 h-12 text-stone-300 dark:text-zinc-700" />
              <div>
                <strong className="text-sm text-stone-700 dark:text-stone-300 block font-black">Nenhuma Patologia Selecionada</strong>
                <p className="text-xs text-stone-500 max-w-sm mt-1">Selecione uma patologia veterinária na lista à esquerda para consultar a etiologia detalhada, sintomas clínicos completos e tratamentos recomendados.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Add Custom Disease */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-200 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2 text-sm">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                Cadastrar Nova Doença na Biblioteca
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Nome da Patologia *</label>
                  <input
                    type="text"
                    required
                    value={newDisease.name || ''}
                    onChange={e => setNewDisease({ ...newDisease, name: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold"
                    placeholder="Ex: Ceratoconjuntivite Infecciosa"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Categoria de Patógeno *</label>
                  <select
                    value={newDisease.category || 'Bacteriana'}
                    onChange={e => setNewDisease({ ...newDisease, category: e.target.value as any })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold"
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
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Etiologia (Origem e Transmissão) *</label>
                <textarea
                  rows={2}
                  required
                  value={newDisease.etiology || ''}
                  onChange={e => setNewDisease({ ...newDisease, etiology: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  placeholder="Descreva o patógeno causador, fatores ambientais favoráveis e formas de contágio do animal..."
                />
              </div>

              {/* Dynamic Symptoms inputs */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block font-bold text-stone-700 dark:text-stone-300">Sintomas Clínicos *</label>
                  <button
                    type="button"
                    onClick={handleAddSymptomField}
                    className="text-emerald-600 hover:text-emerald-500 font-bold text-[10px] flex items-center gap-1"
                  >
                    + Adicionar Sintoma
                  </button>
                </div>
                <div className="space-y-1.5">
                  {(newDisease.symptoms || []).map((symptom, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={symptom}
                        onChange={e => handleSymptomChange(idx, e.target.value)}
                        className="flex-1 p-2 bg-stone-50 dark:bg-zinc-800 rounded-lg border border-stone-200 dark:border-zinc-700 font-bold"
                        placeholder="Ex: Febre alta ou manchas avermelhadas..."
                      />
                      {(newDisease.symptoms || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSymptomField(idx)}
                          className="text-red-500 hover:text-red-600 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Products and Treatments inputs */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block font-bold text-stone-700 dark:text-stone-300">Produtos ou Princípios Ativos Indicados</label>
                  <button
                    type="button"
                    onClick={handleAddProductField}
                    className="text-emerald-600 hover:text-emerald-500 font-bold text-[10px] flex items-center gap-1"
                  >
                    + Adicionar Produto
                  </button>
                </div>
                <div className="space-y-1.5">
                  {(newDisease.products || []).map((product, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={product}
                        onChange={e => handleProductChange(idx, e.target.value)}
                        className="flex-1 p-2 bg-stone-50 dark:bg-zinc-800 rounded-lg border border-stone-200 dark:border-zinc-700 font-bold"
                        placeholder="Ex: Sulfato de Zinco 10% ou Colírio com Neomicina..."
                      />
                      {(newDisease.products || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveProductField(idx)}
                          className="text-red-500 hover:text-red-600 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Medidas de Prevenção e Biosseguridade</label>
                <textarea
                  rows={2}
                  value={newDisease.prevention || ''}
                  onChange={e => setNewDisease({ ...newDisease, prevention: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  placeholder="Ex: Fazer quarentena de novos animais e vacinar cabritos no desmame..."
                />
              </div>

              {/* Photo Upload with camera and gallery */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Foto da Patologia / Lesão</label>
                {newDisease.photoUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 h-32 group">
                    <img 
                      src={newDisease.photoUrl} 
                      alt="Preview" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setNewDisease(prev => ({ ...prev, photoUrl: '' }))}
                        className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold shadow-md text-[10px] flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Remover
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div 
                      onClick={() => document.getElementById('disease-file-input')?.click()}
                      className="border border-dashed border-stone-300 dark:border-zinc-700 rounded-xl p-4 text-center hover:bg-stone-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-all space-y-1"
                    >
                      <Camera className="w-6 h-6 text-emerald-500 mx-auto" />
                      <strong className="text-stone-800 dark:text-stone-200 block text-[10px]">
                        Capturar com Câmera ou selecionar da Galeria
                      </strong>
                    </div>

                    <div className="flex items-center gap-2 text-stone-400 text-[8px] font-bold">
                      <div className="h-px bg-stone-200 dark:bg-zinc-800 flex-1"></div>
                      <span>OU LINK DE IMAGEM</span>
                      <div className="h-px bg-stone-200 dark:bg-zinc-800 flex-1"></div>
                    </div>

                    <input
                      type="text"
                      value={newDisease.photoUrl || ''}
                      onChange={e => setNewDisease({ ...newDisease, photoUrl: e.target.value })}
                      className="w-full p-2 bg-stone-50 dark:bg-zinc-800 rounded-lg border border-stone-200 dark:border-zinc-700 text-[10px]"
                      placeholder="https://exemplo.com/doenca.jpg"
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

              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-stone-200 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer"
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
