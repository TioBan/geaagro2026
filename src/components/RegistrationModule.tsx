import React, { useEffect, useRef, useState } from 'react';
import {
  Building2,
  UserCheck,
  Users,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import {
  Company,
  Agronomist,
  RuralProducer,
  Farm,
  FieldPlot,
} from '../types/agronomy';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import type { DeleteTargetPayload } from './registration/FarmsPlotsTab';

const FarmsPlotsTab = lazyWithRetry(() =>
  import('./registration/FarmsPlotsTab').then(m => ({ default: m.FarmsPlotsTab }))
);
const ProducersTab = lazyWithRetry(() =>
  import('./registration/ProducersTab').then(m => ({ default: m.ProducersTab }))
);
const AgronomistsTab = lazyWithRetry(() =>
  import('./registration/AgronomistsTab').then(m => ({ default: m.AgronomistsTab }))
);
const CompaniesTab = lazyWithRetry(() =>
  import('./registration/CompaniesTab').then(m => ({ default: m.CompaniesTab }))
);

const ConfirmDeleteModal = lazyWithRetry(() =>
  import('./registration/ConfirmDeleteModal').then(m => ({ default: m.ConfirmDeleteModal }))
);
const EditFarmModal = lazyWithRetry(() =>
  import('./registration/EditFarmModal').then(m => ({ default: m.EditFarmModal }))
);
const EditPlotModal = lazyWithRetry(() =>
  import('./registration/EditPlotModal').then(m => ({ default: m.EditPlotModal }))
);
const EditProducerModal = lazyWithRetry(() =>
  import('./registration/EditProducerModal').then(m => ({ default: m.EditProducerModal }))
);
const EditAgronomistModal = lazyWithRetry(() =>
  import('./registration/EditAgronomistModal').then(m => ({ default: m.EditAgronomistModal }))
);
const EditCompanyModal = lazyWithRetry(() =>
  import('./registration/EditCompanyModal').then(m => ({ default: m.EditCompanyModal }))
);

const TabLoadingFallback: React.FC = () => (
  <div className="bg-white dark:bg-zinc-950 rounded-xl p-8 border border-slate-200 dark:border-zinc-800 shadow-xs text-center text-xs text-slate-500 dark:text-zinc-400">
    Carregando módulo de cadastro...
  </div>
);

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
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Modals state for Editing
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [editingPlot, setEditingPlot] = useState<FieldPlot | null>(null);
  const [editingProducer, setEditingProducer] = useState<RuralProducer | null>(null);
  const [editingAgronomist, setEditingAgronomist] = useState<Agronomist | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Modal state for Confirmation of Deletion
  const [deleteTarget, setDeleteTarget] = useState<DeleteTargetPayload | null>(null);

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  const showNotification = (msg: string) => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    setNotification(msg);
    notificationTimerRef.current = setTimeout(() => {
      setNotification(null);
      notificationTimerRef.current = null;
    }, 3500);
  };

  const selectedFarm = (farms || []).find(f => f?.id === selectedFarmId) || farms?.[0];

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

  const deleteTypeLabel =
    deleteTarget?.type === 'farm'
      ? 'Fazenda'
      : deleteTarget?.type === 'plot'
      ? 'Talhão'
      : deleteTarget?.type === 'producer'
      ? 'Produtor Rural'
      : deleteTarget?.type === 'agronomist'
      ? 'Agrônomo RT'
      : 'Empresa';

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

      {/* Lazy-loaded Active Sub-Tab */}
      <React.Suspense fallback={<TabLoadingFallback />}>
        {subTab === 'fazendas' && (
          <FarmsPlotsTab
            farms={farms}
            setFarms={setFarms}
            producers={producers}
            agronomists={agronomists}
            companies={companies}
            selectedFarmId={selectedFarmId}
            setSelectedFarmId={setSelectedFarmId}
            selectedFarm={selectedFarm}
            setActiveTab={setActiveTab}
            setActiveSubTab={setActiveSubTab}
            onEditFarm={setEditingFarm}
            onEditPlot={setEditingPlot}
            onRequestDelete={setDeleteTarget}
            onNotify={showNotification}
          />
        )}

        {subTab === 'produtores' && (
          <ProducersTab
            producers={producers}
            setProducers={setProducers}
            farms={farms}
            onEditProducer={setEditingProducer}
            onRequestDelete={setDeleteTarget}
            onNotify={showNotification}
          />
        )}

        {subTab === 'agronomos' && (
          <AgronomistsTab
            agronomists={agronomists}
            setAgronomists={setAgronomists}
            farms={farms}
            companies={companies}
            setActiveTab={setActiveTab}
            setActiveSubTab={setActiveSubTab}
            onEditAgronomist={setEditingAgronomist}
            onRequestDelete={setDeleteTarget}
            onNotify={showNotification}
          />
        )}

        {subTab === 'empresas' && (
          <CompaniesTab
            companies={companies}
            setCompanies={setCompanies}
            farms={farms}
            onEditCompany={setEditingCompany}
            onRequestDelete={setDeleteTarget}
            onNotify={showNotification}
          />
        )}
      </React.Suspense>

      {/* Lazy-loaded Edit & Delete Modals (mounted only when open) */}
      <React.Suspense fallback={null}>
        {editingFarm && (
          <EditFarmModal
            isOpen
            farm={editingFarm}
            producers={producers}
            agronomists={agronomists}
            companies={companies}
            onSave={handleSaveEditFarm}
            onClose={() => setEditingFarm(null)}
          />
        )}

        {editingPlot && (
          <EditPlotModal
            isOpen
            plot={editingPlot}
            onSave={handleSaveEditPlot}
            onClose={() => setEditingPlot(null)}
          />
        )}

        {editingProducer && (
          <EditProducerModal
            isOpen
            producer={editingProducer}
            companies={companies}
            onSave={handleSaveEditProducer}
            onClose={() => setEditingProducer(null)}
          />
        )}

        {editingAgronomist && (
          <EditAgronomistModal
            isOpen
            agronomist={editingAgronomist}
            companies={companies}
            onSave={handleSaveEditAgronomist}
            onClose={() => setEditingAgronomist(null)}
          />
        )}

        {editingCompany && (
          <EditCompanyModal
            isOpen
            company={editingCompany}
            onSave={handleSaveEditCompany}
            onClose={() => setEditingCompany(null)}
          />
        )}

        {deleteTarget && (
          <ConfirmDeleteModal
            isOpen
            title={`Excluir ${deleteTypeLabel}`}
            itemName={deleteTarget.name}
            itemType={deleteTypeLabel}
            warningText={deleteTarget.warningText}
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </React.Suspense>
    </div>
  );
};

export default RegistrationModule;
