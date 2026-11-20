import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  BookOpen,
  X,
  Syringe,
  Stethoscope,
  Pill,
  FileText,
  FlaskConical,
} from 'lucide-react';
import {
  EquineAnimal,
  EquineHealthRecord,
  EquineExamRecord,
  EquineHealthType,
} from '../../types/equine';

interface Props {
  animals: EquineAnimal[];
  healthRecords: EquineHealthRecord[];
  examRecords: EquineExamRecord[];
  onAddHealth: (record: EquineHealthRecord) => void;
  onAddExam: (record: EquineExamRecord) => void;
  onNavigateTab: (tabId: string) => void;
}

const inputCls =
  'w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500';
const labelCls = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const EquineHealthSanityView: React.FC<Props> = ({
  animals,
  healthRecords,
  examRecords,
  onAddHealth,
  onAddExam,
  onNavigateTab,
}) => {
  const safeAnimals = useMemo(() => (animals || []).filter(a => a && a.id), [animals]);
  const safeHealth = useMemo(() => (healthRecords || []).filter(h => h && h.id), [healthRecords]);
  const safeExams = useMemo(() => (examRecords || []).filter(e => e && e.id), [examRecords]);

  const [selectedTab, setSelectedTab] = useState<'all' | 'vacinas' | 'exames_mapa' | 'vermifugacao' | 'clinico' | 'laudos'>('all');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('all');
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<EquineHealthRecord>>({
    animalId: safeAnimals[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    type: 'Vacinação',
    title: 'Vacina Influenza Equina + Tétano',
    productOrDrug: 'Fluvac Innovator EWT',
    dose: '1 ml',
    route: 'Intramuscular (IM)',
    veterinarian: '',
    status: 'Concluído',
    costBrl: 120,
    nextDueDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    notes: '',
  });

  const [examForm, setExamForm] = useState<Partial<EquineExamRecord>>({
    animalId: safeAnimals[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    title: 'Laudo Oficial AIE + Mormo',
    examType: 'AIE (Coggins - MAPA)',
    laboratory: '',
    veterinarian: '',
    resultSummary: 'Negativo / Apto para Trânsito (GTA)',
    isNormal: true,
    costBrl: 220,
    notes: '',
  });

  const handleSaveHealth = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = formData.animalId || safeAnimals[0]?.id;
    if (!targetId || !formData.title?.trim()) return;

    const newRecord: EquineHealthRecord = {
      id: `hlth-${Date.now()}`,
      animalId: targetId,
      date: formData.date || new Date().toISOString().split('T')[0],
      type: (formData.type as EquineHealthType) || 'Vacinação',
      title: formData.title.trim(),
      productOrDrug: formData.productOrDrug?.trim() || 'Protocolo Clínico',
      dose: formData.dose?.trim() || 'Conforme prescrição',
      route: (formData.route as EquineHealthRecord['route']) || 'Intramuscular (IM)',
      veterinarian: formData.veterinarian?.trim() || 'Médico Veterinário Responsável',
      nextDueDate: formData.nextDueDate,
      costBrl: Number(formData.costBrl) || 0,
      status: formData.status || 'Concluído',
      notes: formData.notes,
    };

    onAddHealth(newRecord);
    setIsHealthModalOpen(false);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = examForm.animalId || safeAnimals[0]?.id;
    if (!targetId || !examForm.title?.trim()) return;

    const newExam: EquineExamRecord = {
      id: `exm-${Date.now()}`,
      animalId: targetId,
      date: examForm.date || new Date().toISOString().split('T')[0],
      title: examForm.title.trim(),
      examType: (examForm.examType as EquineExamRecord['examType']) || 'AIE (Coggins - MAPA)',
      laboratory: examForm.laboratory?.trim() || 'Laboratório Credenciado MAPA',
      veterinarian: examForm.veterinarian?.trim() || 'Médico Veterinário Responsável',
      resultSummary: examForm.resultSummary?.trim() || 'Negativo / Dentro da normalidade',
      isNormal: examForm.isNormal ?? true,
      costBrl: Number(examForm.costBrl) || 0,
      notes: examForm.notes,
    };

    onAddExam(newExam);
    setIsExamModalOpen(false);
  };

  const filteredHealth = safeHealth.filter(h => {
    if (selectedAnimalId !== 'all' && h.animalId !== selectedAnimalId) return false;
    if (selectedTab === 'vacinas') return h.type === 'Vacinação';
    if (selectedTab === 'exames_mapa') return h.type === 'Exame Laboratorial' || h.type === 'Exame de Imagem';
    if (selectedTab === 'vermifugacao') return h.type === 'Vermifugação';
    if (selectedTab === 'clinico') {
      return (
        h.type === 'Tratamento Clínico' ||
        h.type === 'Internação' ||
        h.type === 'Procedimento Cirúrgico' ||
        h.type === 'Tratamento de Lesão' ||
        h.type === 'Curativo / Fisioterapia'
      );
    }
    return true;
  });

  const filteredExams = safeExams.filter(
    ex => selectedAnimalId === 'all' || ex.animalId === selectedAnimalId
  );

  const vaccineCount = safeHealth.filter(h => h.type === 'Vacinação').length;
  const mapaCount = safeHealth.filter(h => h.type === 'Exame Laboratorial').length + safeExams.length;
  const dewormCount = safeHealth.filter(h => h.type === 'Vermifugação').length;
  const scheduledCount = safeHealth.filter(h => h.status !== 'Concluído').length;

  const getTypeIcon = (type: EquineHealthType) => {
    if (type === 'Vacinação') return <Syringe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    if (type === 'Vermifugação') return <Pill className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    if (type === 'Exame Laboratorial' || type === 'Exame de Imagem') {
      return <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
    }
    return <Stethoscope className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Sanidade, Vacinas & Exames MAPA</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Calendário vacinal, exames obrigatórios (AIE / Mormo), vermifugação e histórico clínico
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab('diseases_bank')}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Guia de Enfermidades</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExamModalOpen(true)}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FlaskConical className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Novo Laudo</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHealthModalOpen(true)}
            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Manejo</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Vacinações</span>
            <span className="mt-1 text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums block">
              {vaccineCount}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Exames & Laudos MAPA</span>
            <span className="mt-1 text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums block">
              {mapaCount}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Vermifugações</span>
            <span className="mt-1 text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums block">
              {dewormCount}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Pendentes / Em Curso</span>
            <span className="mt-1 text-lg font-semibold text-amber-700 dark:text-amber-400 tabular-nums block">
              {scheduledCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {[
            { id: 'all', label: `Todos (${safeHealth.length})` },
            { id: 'vacinas', label: 'Vacinas' },
            { id: 'exames_mapa', label: 'Exames' },
            { id: 'vermifugacao', label: 'Vermifugação' },
            { id: 'clinico', label: 'Clínico' },
            { id: 'laudos', label: `Laudos Lab (${safeExams.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
              className={`h-8 px-3 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                selectedTab === tab.id
                  ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                  : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          value={selectedAnimalId}
          onChange={e => setSelectedAnimalId(e.target.value)}
          className="h-8 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">Todos os cavalos</option>
          {safeAnimals.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* Records List */}
      {selectedTab === 'laudos' ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          {filteredExams.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhum laudo laboratorial cadastrado ainda.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-zinc-800">
              {filteredExams.map(ex => {
                const animal = safeAnimals.find(a => a.id === ex.animalId);
                return (
                  <div key={ex.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <FlaskConical className="w-4 h-4 mt-0.5 text-sky-600 dark:text-sky-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                          {ex.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          {animal?.name || 'Animal'} · {ex.examType} · Lab: {ex.laboratory} · Vet: {ex.veterinarian}
                        </div>
                        <div className="text-xs text-slate-700 dark:text-zinc-300 mt-1">
                          Resultado: <span className="font-medium">{ex.resultSummary}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 tabular-nums">
                      <div
                        className={`text-xs font-medium ${
                          ex.isNormal ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {ex.isNormal ? 'Normal / Negativo' : 'Alterado'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {new Date(ex.date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          {filteredHealth.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhum registro sanitário encontrado para o filtro selecionado.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-zinc-800">
              {filteredHealth.map(rec => {
                const animal = safeAnimals.find(a => a.id === rec.animalId);
                return (
                  <div key={rec.id} className="p-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="mt-0.5 shrink-0">{getTypeIcon(rec.type)}</div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                            {rec.title}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                            {animal?.name || 'Animal'} · {rec.type} · {new Date(rec.date).toLocaleDateString('pt-BR')} · Vet: {rec.veterinarian}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 tabular-nums text-xs">
                        {rec.nextDueDate && (
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                            Próximo: <strong className="text-slate-700 dark:text-zinc-200">{new Date(rec.nextDueDate).toLocaleDateString('pt-BR')}</strong>
                          </span>
                        )}
                        <span
                          className={`text-[11px] font-medium ${
                            rec.status === 'Concluído'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </div>
                    </div>

                    {(rec.productOrDrug || rec.dose || rec.notes) && (
                      <div className="pl-6.5 text-xs text-slate-600 dark:text-zinc-400 flex flex-wrap gap-x-4 gap-y-1">
                        {rec.productOrDrug && <span>Produto: <strong className="text-slate-800 dark:text-zinc-200">{rec.productOrDrug}</strong></span>}
                        {rec.dose && <span>Dose: <strong className="text-slate-800 dark:text-zinc-200">{rec.dose}</strong> ({rec.route})</span>}
                        {rec.costBrl ? <span className="tabular-nums">Custo: R$ {rec.costBrl.toFixed(2)}</span> : null}
                        {rec.notes && <span className="w-full text-[11px]">{rec.notes}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: New Health Record */}
      {isHealthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl max-w-lg w-full">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Registrar Manejo Sanitário
              </h3>
              <button
                type="button"
                onClick={() => setIsHealthModalOpen(false)}
                className="h-7 w-7 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHealth} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Animal *</label>
                  <select
                    value={formData.animalId || safeAnimals[0]?.id || ''}
                    onChange={e => setFormData({ ...formData, animalId: e.target.value })}
                    className={inputCls}
                  >
                    {safeAnimals.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.registrationNumber})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Tipo de Procedimento</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as EquineHealthType })}
                    className={inputCls}
                  >
                    <option value="Vacinação">Vacinação</option>
                    <option value="Vermifugação">Vermifugação</option>
                    <option value="Exame Laboratorial">Exame Laboratorial (AIE / Mormo)</option>
                    <option value="Exame de Imagem">Exame de Imagem</option>
                    <option value="Tratamento Clínico">Tratamento Clínico</option>
                    <option value="Procedimento Cirúrgico">Procedimento Cirúrgico</option>
                    <option value="Curativo / Fisioterapia">Curativo / Fisioterapia</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Data</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div className="col-span-2">
                  <label className={labelCls}>Descrição / Título *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Produto / Fármaco</label>
                  <input
                    type="text"
                    value={formData.productOrDrug || ''}
                    onChange={e => setFormData({ ...formData, productOrDrug: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Dosagem</label>
                  <input
                    type="text"
                    value={formData.dose || ''}
                    onChange={e => setFormData({ ...formData, dose: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Via de Administração</label>
                  <select
                    value={formData.route}
                    onChange={e => setFormData({ ...formData, route: e.target.value as EquineHealthRecord['route'] })}
                    className={inputCls}
                  >
                    <option value="Intramuscular (IM)">Intramuscular (IM)</option>
                    <option value="Intravenosa (IV)">Intravenosa (IV)</option>
                    <option value="Subcutânea (SC)">Subcutânea (SC)</option>
                    <option value="Oral">Oral</option>
                    <option value="Tópico / Dérmico">Tópico / Dérmico</option>
                    <option value="Intra-articular">Intra-articular</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Próximo Reforço</label>
                  <input
                    type="date"
                    value={formData.nextDueDate || ''}
                    onChange={e => setFormData({ ...formData, nextDueDate: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div className="col-span-2">
                  <label className={labelCls}>Médico Veterinário</label>
                  <input
                    type="text"
                    value={formData.veterinarian || ''}
                    onChange={e => setFormData({ ...formData, veterinarian: e.target.value })}
                    placeholder="Nome / CRMV"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Observações Clínicas</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsHealthModalOpen(false)}
                  className="h-8 px-3.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Laboratory Exam */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl max-w-lg w-full">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Registrar Laudo / Exame Laboratorial
              </h3>
              <button
                type="button"
                onClick={() => setIsExamModalOpen(false)}
                className="h-7 w-7 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Animal *</label>
                  <select
                    value={examForm.animalId || safeAnimals[0]?.id || ''}
                    onChange={e => setExamForm({ ...examForm, animalId: e.target.value })}
                    className={inputCls}
                  >
                    {safeAnimals.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className={labelCls}>Tipo de Exame</label>
                  <select
                    value={examForm.examType}
                    onChange={e => setExamForm({ ...examForm, examType: e.target.value as EquineExamRecord['examType'] })}
                    className={inputCls}
                  >
                    <option value="AIE (Coggins - MAPA)">AIE (Coggins - MAPA)</option>
                    <option value="Mormo (Fixação de Complemento / ELISA)">Mormo (FC / ELISA - MAPA)</option>
                    <option value="Hemograma Completo">Hemograma Completo</option>
                    <option value="Bioquímica Sérica (GGT, AST, CK, Creatinina, Ureia)">Bioquímica Sérica</option>
                    <option value="Ultrassonografia Tendínea / Articular">Ultrassonografia Tendínea / Articular</option>
                    <option value="Radiografia (Raio-X de Membros / Casco)">Radiografia de Membros / Casco</option>
                    <option value="Exame Coprológico (OPG - Ovos por Grama)">Exame Coprológico (OPG)</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Data do Laudo</label>
                  <input
                    type="date"
                    value={examForm.date}
                    onChange={e => setExamForm({ ...examForm, date: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Situação</label>
                  <select
                    value={examForm.isNormal ? 'normal' : 'alterado'}
                    onChange={e => setExamForm({ ...examForm, isNormal: e.target.value === 'normal' })}
                    className={inputCls}
                  >
                    <option value="normal">Normal / Negativo</option>
                    <option value="alterado">Alterado / Positivo</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Laboratório</label>
                  <input
                    type="text"
                    value={examForm.laboratory || ''}
                    onChange={e => setExamForm({ ...examForm, laboratory: e.target.value })}
                    placeholder="Nome do laboratório"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Veterinário Solicitante</label>
                  <input
                    type="text"
                    value={examForm.veterinarian || ''}
                    onChange={e => setExamForm({ ...examForm, veterinarian: e.target.value })}
                    placeholder="Nome / CRMV"
                    className={inputCls}
                  />
                </div>

                <div className="col-span-2">
                  <label className={labelCls}>Resumo do Resultado *</label>
                  <input
                    type="text"
                    required
                    value={examForm.resultSummary || ''}
                    onChange={e => setExamForm({ ...examForm, resultSummary: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="h-8 px-3.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar Laudo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
