import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Check,
  Compass,
  Layers,
  FileText,
  Camera,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ArrowUpRight,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { PropriedadeRural, TalhaoRural } from '../../types/gestaoRural';

interface GestaoAdministracaoPropriedadeProps {
  propriedade: PropriedadeRural;
  talhoes: TalhaoRural[];
  onUpdatePropriedade: (updated: PropriedadeRural) => void;
  onAddTalhao: (newTalhao: TalhaoRural) => void;
  onDeleteTalhao: (id: string) => void;
  onNavigateToRegister?: () => void;
  onNavigate?: (tab: string, subTab?: string) => void;
}

export const GestaoAdministracaoPropriedade: React.FC<GestaoAdministracaoPropriedadeProps> = ({
  propriedade,
  talhoes,
  onUpdatePropriedade,
  onAddTalhao,
  onDeleteTalhao,
  onNavigateToRegister,
  onNavigate,
}) => {
  const [isEditingPropriedade, setIsEditingPropriedade] = useState(false);
  const [propForm, setPropForm] = useState<PropriedadeRural>(propriedade);
  const [showAddTalhaoModal, setShowAddTalhaoModal] = useState(false);

  const [newTalhao, setNewTalhao] = useState<Partial<TalhaoRural>>({
    codigo: `TL-0${talhoes.length + 1}`,
    nome: '',
    areaHa: 50,
    tipoSolo: 'Latossolo Vermelho Eutrófico',
    texturaSolo: 'argiloso',
    teorArgilaPct: 48,
    historicoUso: 'Rotação Soja / Milho Safrinha',
    culturaAtual: 'Soja',
    culturaAnterior: 'Milho Safrinha',
    sistemaCultivo: 'Plantio Direto',
    irrigado: false,
    altitudeMeters: 620,
    declividadePct: 3.5,
    observacoes: '',
  });

  const handleSavePropriedade = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...propForm, updatedAt: new Date().toISOString() };
    onUpdatePropriedade(updated);
    setIsEditingPropriedade(false);

    // Sync to Central Registration localStorage
    try {
      const centralFarmsStr = localStorage.getItem('geaagro_farms');
      if (centralFarmsStr) {
        const centralFarms = JSON.parse(centralFarmsStr);
        if (Array.isArray(centralFarms) && centralFarms.length > 0) {
          const updatedFarms = centralFarms.map((f: any) => {
            if (f.id === updated.id || f.name === updated.nome || centralFarms.length === 1) {
              return {
                ...f,
                name: updated.nome,
                owner: updated.proprietario,
                document: updated.documento,
                stateRegistration: updated.inscricaoEstadual,
                city: updated.municipio,
                state: updated.estado,
                totalAreaHa: updated.areaTotalHa,
                arableAreaHa: updated.areaAgricolaHa,
                irrigatedAreaHa: updated.areaIrrigadaHa,
              };
            }
            return f;
          });
          localStorage.setItem('geaagro_farms', JSON.stringify(updatedFarms));
        }
      }
    } catch (err) {
      console.warn('Sync to central farms storage failed:', err);
    }
  };

  const handleSaveNewTalhao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTalhao.nome || !newTalhao.areaHa) return;

    const created: TalhaoRural = {
      id: `tal-360-${Date.now()}`,
      propriedadeId: propriedade.id,
      codigo: newTalhao.codigo || `TL-0${talhoes.length + 1}`,
      nome: newTalhao.nome,
      areaHa: Number(newTalhao.areaHa) || 0,
      coordenadasGPS: [
        { lat: propriedade.latitude, lng: propriedade.longitude },
        { lat: propriedade.latitude - 0.005, lng: propriedade.longitude + 0.005 },
        { lat: propriedade.latitude - 0.008, lng: propriedade.longitude + 0.002 },
      ],
      tipoSolo: newTalhao.tipoSolo || 'Latossolo Vermelho',
      texturaSolo: newTalhao.texturaSolo || 'argiloso',
      teorArgilaPct: Number(newTalhao.teorArgilaPct) || 45,
      historicoUso: newTalhao.historicoUso || '',
      culturaAtual: newTalhao.culturaAtual || 'Soja',
      culturaAnterior: newTalhao.culturaAnterior || 'Milho',
      sistemaCultivo: newTalhao.sistemaCultivo || 'Plantio Direto',
      irrigado: Boolean(newTalhao.irrigado),
      tipoSistemaIrrigacao: newTalhao.irrigado ? 'Pivô Central' : undefined,
      altitudeMeters: Number(newTalhao.altitudeMeters) || 620,
      declividadePct: Number(newTalhao.declividadePct) || 3.0,
      fotosUrls: [],
      observacoes: newTalhao.observacoes || '',
    };

    onAddTalhao(created);

    // Sync new plot to Central Registration localStorage 'geaagro_farms'
    try {
      const centralFarmsStr = localStorage.getItem('geaagro_farms');
      if (centralFarmsStr) {
        const centralFarms = JSON.parse(centralFarmsStr);
        if (Array.isArray(centralFarms) && centralFarms.length > 0) {
          const newCentralPlot = {
            id: created.id,
            name: created.nome,
            areaHa: created.areaHa,
            crop: created.culturaAtual,
            soilTexture: created.texturaSolo === 'argiloso' ? 'ARGILOSO' : created.texturaSolo === 'arenoso' ? 'ARENOSO' : 'MEDIO',
            clayPercentage: created.teorArgilaPct,
            irrigation: created.irrigado,
          };
          const updatedFarms = centralFarms.map((f: any) => {
            if (f.id === propriedade.id || f.name === propriedade.nome || centralFarms.length === 1) {
              const currentPlots = Array.isArray(f.plots) ? f.plots : [];
              return {
                ...f,
                plots: [newCentralPlot, ...currentPlots],
              };
            }
            return f;
          });
          localStorage.setItem('geaagro_farms', JSON.stringify(updatedFarms));
        }
      }
    } catch (err) {
      console.warn('Sync plot to central farms storage failed:', err);
    }

    setShowAddTalhaoModal(false);
    setNewTalhao({
      codigo: `TL-0${talhoes.length + 2}`,
      nome: '',
      areaHa: 50,
      tipoSolo: 'Latossolo Vermelho Eutrófico',
      texturaSolo: 'argiloso',
      teorArgilaPct: 48,
      historicoUso: 'Rotação Soja / Milho Safrinha',
      culturaAtual: 'Soja',
      culturaAnterior: 'Milho Safrinha',
      sistemaCultivo: 'Plantio Direto',
      irrigado: false,
      altitudeMeters: 620,
      declividadePct: 3.5,
      observacoes: '',
    });
  };

  const handleDeleteTalhaoWithSync = (id: string) => {
    onDeleteTalhao(id);
    try {
      const centralFarmsStr = localStorage.getItem('geaagro_farms');
      if (centralFarmsStr) {
        const centralFarms = JSON.parse(centralFarmsStr);
        if (Array.isArray(centralFarms) && centralFarms.length > 0) {
          const updatedFarms = centralFarms.map((f: any) => {
            if (f.id === propriedade.id || f.name === propriedade.nome || centralFarms.length === 1) {
              const currentPlots = Array.isArray(f.plots) ? f.plots : [];
              return {
                ...f,
                plots: currentPlots.filter((p: any) => p.id !== id && p.name !== id),
              };
            }
            return f;
          });
          localStorage.setItem('geaagro_farms', JSON.stringify(updatedFarms));
        }
      }
    } catch (err) {
      console.warn('Sync plot delete to central farms storage failed:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase text-[10px] tracking-wider">
            <Building2 className="w-4 h-4" />
            Módulo 1 • Cadastro Técnico Integrado ao Cadastro Central
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Administração da Fazenda e Mapeamento de Talhões
          </h2>
          <p className="text-slate-500">
            Ficha cadastral unificada, divisão agronômica de áreas, polígonos GPS e aptidão do solo
          </p>
        </div>

        <button
          onClick={() => setIsEditingPropriedade(!isEditingPropriedade)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0"
        >
          <Edit2 className="w-4 h-4" />
          <span>{isEditingPropriedade ? 'Cancelar Edição' : 'Editar Propriedade'}</span>
        </button>
      </div>

      {/* INTEGRATION BANNER WITH CENTRAL CADASTRO TÉCNICO */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-5 border border-emerald-600/40 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-400/30 text-emerald-300 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-black text-[10px] uppercase tracking-wider">
                Integrado ao Cadastro Técnico Central
              </span>
              <span className="text-emerald-200 text-xs font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Sincronização em Tempo Real
              </span>
            </div>
            <h3 className="text-base font-black text-white">
              Centralização dos Dados da Propriedade, Produtor e RT
            </h3>
            <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed">
              Todos os registros cadastrais desta fazenda, proprietário, responsável técnico e talhões estão unificados com o módulo central de <strong>Cadastro Técnico (Gestão de Cadastros)</strong>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto justify-end">
          {onNavigateToRegister && (
            <button
              onClick={onNavigateToRegister}
              className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
              title="Abrir Módulo Central de Cadastro Técnico"
            >
              <Building2 className="w-4 h-4" />
              <span>Abrir Cadastro Técnico Central</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* PROPRIEDADE FORM / DETAILS CARD */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-6">
        <h3 className="font-black text-sm text-slate-900 dark:text-white border-b pb-3 flex items-center justify-between">
          <span>Informações Gerais da Propriedade Rural</span>
          <span className="text-xs text-emerald-600 font-bold">
            Código IBGE: {propriedade.codigoIbge}
          </span>
        </h3>

        {isEditingPropriedade ? (
          <form onSubmit={handleSavePropriedade} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Nome da Fazenda
              </label>
              <input
                type="text"
                value={propForm.nome}
                onChange={e => setPropForm({ ...propForm, nome: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Proprietário
              </label>
              <input
                type="text"
                value={propForm.proprietario}
                onChange={e => setPropForm({ ...propForm, proprietario: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                CPF / CNPJ
              </label>
              <input
                type="text"
                value={propForm.documento}
                onChange={e => setPropForm({ ...propForm, documento: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Inscrição Estadual
              </label>
              <input
                type="text"
                value={propForm.inscricaoEstadual}
                onChange={e => setPropForm({ ...propForm, inscricaoEstadual: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Município
              </label>
              <input
                type="text"
                value={propForm.municipio}
                onChange={e => setPropForm({ ...propForm, municipio: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Estado (UF)
              </label>
              <input
                type="text"
                value={propForm.estado}
                onChange={e => setPropForm({ ...propForm, estado: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Área Total (ha)
              </label>
              <input
                type="number"
                value={propForm.areaTotalHa}
                onChange={e =>
                  setPropForm({ ...propForm, areaTotalHa: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Área Agrícola (ha)
              </label>
              <input
                type="number"
                value={propForm.areaAgricolaHa}
                onChange={e =>
                  setPropForm({ ...propForm, areaAgricolaHa: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
              />
            </div>

            <div className="md:col-span-4 flex justify-end gap-2 mt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-700 dark:text-zinc-300">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Nome da Fazenda
              </span>
              <span className="font-black text-slate-900 dark:text-white text-sm">
                {propriedade.nome}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Proprietário
              </span>
              <span className="font-bold">{propriedade.proprietario}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {propriedade.tipoDocumento}
              </span>
              <span className="font-bold">{propriedade.documento}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Localização
              </span>
              <span className="font-bold">
                {propriedade.municipio} - {propriedade.estado}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Área Total
              </span>
              <span className="text-base font-black text-slate-900 dark:text-white">
                {propriedade.areaTotalHa} ha
              </span>
            </div>
            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">
                Área Agrícola
              </span>
              <span className="text-base font-black text-emerald-800 dark:text-emerald-200">
                {propriedade.areaAgricolaHa} ha
              </span>
            </div>
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-800/40">
              <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 block">
                Área Irrigada
              </span>
              <span className="text-base font-black text-blue-800 dark:text-blue-200">
                {propriedade.areaIrrigadaHa} ha
              </span>
            </div>
            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
              <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 block">
                Reserva Legal + APP
              </span>
              <span className="text-base font-black text-amber-800 dark:text-amber-200">
                {propriedade.reservaLegalHa + propriedade.appHa} ha
              </span>
            </div>
          </div>
        )}
      </div>

      {/* TALHÕES LIST & MANAGEMENT */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider border border-emerald-300 dark:border-emerald-800/80">
                Sincronizado com Cadastro Técnico Central
              </span>
            </div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Mapeamento de Talhões ({talhoes.length} Cadastrados & Centralizados)
            </h3>
            <p className="text-[11px] text-slate-500">
              Divisão geográfica com solo, textura, irrigação e aptidão agronômica sincronizados no repositório central
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onNavigateToRegister && (
              <button
                onClick={onNavigateToRegister}
                className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/60 font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors text-xs"
                title="Ir para Cadastro Técnico Central de Talhões"
              >
                <Building2 className="w-4 h-4" />
                <span>Gerenciar no Cadastro Técnico</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setShowAddTalhaoModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5 text-xs shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Novo Talhão</span>
            </button>
          </div>
        </div>

        {/* TALHÕES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {talhoes.map(t => (
            <div
              key={t.id}
              className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3 relative group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-md">
                    {t.codigo}
                  </span>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white mt-1">
                    {t.nome}
                  </h4>
                </div>
                <button
                  onClick={() => handleDeleteTalhaoWithSync(t.id)}
                  className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                  title="Excluir Talhão"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-zinc-300">
                <div>
                  <span className="block text-slate-400 font-bold">Área Total:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{t.areaHa} ha</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold">Cultura Atual:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {t.culturaAtual}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold">Tipo de Solo:</span>
                  <span>{t.tipoSolo}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold">Textura / Argila:</span>
                  <span>
                    {t.texturaSolo} ({t.teorArgilaPct}%)
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold">Irrigado:</span>
                  <span>{t.irrigado ? `Sim (${t.tipoSistemaIrrigacao})` : 'Não (Sequeiro)'}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold">Declividade / Alt:</span>
                  <span>
                    {t.declividadePct}% | {t.altitudeMeters}m
                  </span>
                </div>
              </div>

              {t.observacoes && (
                <p className="text-[10px] text-slate-500 border-t pt-2 italic">
                  &ldquo;{t.observacoes}&rdquo;
                </p>
              )}
            </div>
          ))}
          {talhoes.length === 0 && (
            <div className="col-span-full p-8 text-center bg-slate-50 dark:bg-zinc-800/20 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 text-slate-500 dark:text-zinc-400">
              Nenhum talhão cadastrado. Clique no botão &ldquo;Novo Talhão&rdquo; acima para cadastrar os talhões da sua propriedade.
            </div>
          )}
        </div>
      </div>

      {/* ADD TALHÃO MODAL */}
      {showAddTalhaoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-black text-base text-slate-900 dark:text-white border-b pb-2">
              Cadastrar Novo Talhão
            </h3>

            <form onSubmit={handleSaveNewTalhao} className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Código</label>
                <input
                  type="text"
                  value={newTalhao.codigo}
                  onChange={e => setNewTalhao({ ...newTalhao, codigo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                  required
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Nome do Talhão</label>
                <input
                  type="text"
                  placeholder="Ex: Talhão Pivô Leste"
                  value={newTalhao.nome}
                  onChange={e => setNewTalhao({ ...newTalhao, nome: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Área (ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newTalhao.areaHa}
                  onChange={e => setNewTalhao({ ...newTalhao, areaHa: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                  required
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Tipo de Solo</label>
                <input
                  type="text"
                  value={newTalhao.tipoSolo}
                  onChange={e => setNewTalhao({ ...newTalhao, tipoSolo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Textura</label>
                <select
                  value={newTalhao.texturaSolo}
                  onChange={e =>
                    setNewTalhao({ ...newTalhao, texturaSolo: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                >
                  <option value="arenoso">Arenoso (&lt;15%)</option>
                  <option value="medio">Médio (15-35%)</option>
                  <option value="argiloso">Argiloso (35-60%)</option>
                  <option value="muito_argiloso">Muito Argiloso (&gt;60%)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Cultura Atual</label>
                <input
                  type="text"
                  value={newTalhao.culturaAtual}
                  onChange={e => setNewTalhao({ ...newTalhao, culturaAtual: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                />
              </div>

              <div className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="irrigado"
                  checked={newTalhao.irrigado}
                  onChange={e => setNewTalhao({ ...newTalhao, irrigado: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                />
                <label htmlFor="irrigado" className="font-bold cursor-pointer">
                  Possui Sistema de Irrigação
                </label>
              </div>

              <div className="col-span-2 flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddTalhaoModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 cursor-pointer"
                >
                  Cadastrar Talhão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
