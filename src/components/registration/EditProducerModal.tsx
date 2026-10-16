import React, { useState, useEffect } from 'react';
import { X, Save, Users } from 'lucide-react';
import { RuralProducer, Company } from '../../types/agronomy';
import { BRAZIL_STATES } from '../../data/brazilStates';

interface EditProducerModalProps {
  isOpen: boolean;
  producer: RuralProducer | null;
  companies: Company[];
  onSave: (updatedProducer: RuralProducer) => void;
  onClose: () => void;
}

export const EditProducerModal: React.FC<EditProducerModalProps> = ({
  isOpen,
  producer,
  companies,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [documentType, setDocumentType] = useState<'CPF' | 'CNPJ'>('CPF');
  const [stateRegistration, setStateRegistration] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('MT');
  const [companyId, setCompanyId] = useState('');

  useEffect(() => {
    if (producer) {
      setName(producer.name || '');
      setDocument(producer.document || '');
      setDocumentType(producer.documentType || ((producer.document || '').length > 14 ? 'CNPJ' : 'CPF'));
      setStateRegistration(producer.stateRegistration || '');
      setPhone(producer.phone || '');
      setEmail(producer.email || '');
      setAddress(producer.address || '');
      setCity(producer.city || '');
      setState(producer.state || 'MT');
      setCompanyId(producer.companyId || companies[0]?.id || '');
    }
  }, [producer, companies]);

  if (!isOpen || !producer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: RuralProducer = {
      ...producer,
      name: name.trim(),
      document: document.trim(),
      documentType,
      stateRegistration: stateRegistration.trim() || 'Isento',
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim() || 'Zona Rural',
      city: city.trim(),
      state,
      companyId,
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Editar Produtor Rural
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Dados pessoais, fiscais e de contato do produtor
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
              Nome Completo / Razão Social *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Tipo
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as 'CPF' | 'CNPJ')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              >
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Número do Documento (CPF / CNPJ)
              </label>
              <input
                type="text"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
              Inscrição Estadual (IE)
            </label>
            <input
              type="text"
              value={stateRegistration}
              onChange={(e) => setStateRegistration(e.target.value)}
              placeholder="Ex: Isento ou 13.555.444-1"
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Telefone / Celular
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
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

          <div>
            <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
              Endereço / Localização
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
              Empresa / Consultoria Vinculada
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
