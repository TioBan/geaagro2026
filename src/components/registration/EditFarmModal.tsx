import React, { useState, useEffect } from 'react';
import { X, Save, Building2, MapPin } from 'lucide-react';
import { Farm, RuralProducer, Agronomist, Company } from '../../types/agronomy';
import { BRAZIL_STATES } from '../../data/brazilStates';

interface EditFarmModalProps {
  isOpen: boolean;
  farm: Farm | null;
  producers: RuralProducer[];
  agronomists: Agronomist[];
  companies: Company[];
  onSave: (updatedFarm: Farm) => void;
  onClose: () => void;
}

export const EditFarmModal: React.FC<EditFarmModalProps> = ({
  isOpen,
  farm,
  producers,
  agronomists,
  companies,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('MT');
  const [totalAreaHa, setTotalAreaHa] = useState<number>(0);
  const [cultivatedAreaHa, setCultivatedAreaHa] = useState<number>(0);
  const [carRegister, setCarRegister] = useState('');
  const [soilGeneralType, setSoilGeneralType] = useState('');
  const [cropHistoryStr, setCropHistoryStr] = useState('');
  const [producerId, setProducerId] = useState('');
  const [agronomistId, setAgronomistId] = useState('');
  const [companyId, setCompanyId] = useState('');

  useEffect(() => {
    if (farm) {
      setName(farm.name || '');
      setCity(farm.city || '');
      setState(farm.state || 'MT');
      setTotalAreaHa(farm.totalAreaHa || 0);
      setCultivatedAreaHa(farm.cultivatedAreaHa || 0);
      setCarRegister(farm.carRegister || '');
      setSoilGeneralType(farm.soilGeneralType || '');
      setCropHistoryStr((farm.cropHistory || []).join(' -> '));
      setProducerId(farm.producerId || '');
      setAgronomistId(farm.agronomistId || '');
      setCompanyId(farm.companyId || companies[0]?.id || '');
    }
  }, [farm, producers, agronomists, companies]);

  if (!isOpen || !farm) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: Farm = {
      ...farm,
      name: name.trim(),
      city: city.trim(),
      state,
      totalAreaHa: Number(totalAreaHa) || 0,
      cultivatedAreaHa: Number(cultivatedAreaHa) || 0,
      carRegister: carRegister.trim(),
      soilGeneralType: soilGeneralType.trim(),
      cropHistory: cropHistoryStr
        ? cropHistoryStr.split('->').map((s) => s.trim()).filter(Boolean)
        : [],
      producerId,
      agronomistId,
      companyId,
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Editar Propriedade Rural
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Atualize os parâmetros cadastrais da fazenda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
              Nome da Fazenda *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Município
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                UF
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              >
                {BRAZIL_STATES.map((st) => (
                  <option key={st.uf} value={st.uf}>
                    {st.uf} - {st.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Área Total (ha)
              </label>
              <input
                type="number"
                step="0.1"
                value={totalAreaHa}
                onChange={(e) => setTotalAreaHa(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Área Cultivada (ha)
              </label>
              <input
                type="number"
                step="0.1"
                value={cultivatedAreaHa}
                onChange={(e) => setCultivatedAreaHa(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Produtor Proprietário
              </label>
              <select
                value={producerId}
                onChange={(e) => setProducerId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              >
                <option value="">Não vinculado</option>
                {(producers || []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.document ? `(${p.document})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Responsável Técnico (RT)
              </label>
              <select
                value={agronomistId}
                onChange={(e) => setAgronomistId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              >
                <option value="">Não vinculado</option>
                {(agronomists || []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} • {a.profession || 'Eng. Agrônomo'} ({a.councilType || 'CREA'}-{a.creaState || 'MT'} {a.crea})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Empresa / Consultoria
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              >
                <option value="">Não vinculada</option>
                {(companies || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Registro CAR
              </label>
              <input
                type="text"
                placeholder="Código do CAR"
                value={carRegister}
                onChange={(e) => setCarRegister(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
              Tipo Geral de Solo
            </label>
            <input
              type="text"
              placeholder="Ex: Latossolo Vermelho Distrófico (opcional)"
              value={soilGeneralType}
              onChange={(e) => setSoilGeneralType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
              Histórico de Culturas (separar por {'"->"'})
            </label>
            <input
              type="text"
              value={cropHistoryStr}
              onChange={(e) => setCropHistoryStr(e.target.value)}
              placeholder="Ex: Soja 2024/25 -> Milho Safrinha 2025"
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
