import React, { useState, useEffect } from 'react';
import { X, Save, Building2, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Company } from '../../types/agronomy';
import { BRAZIL_STATES } from '../../data/brazilStates';

interface EditCompanyModalProps {
  isOpen: boolean;
  company: Company | null;
  onSave: (updatedCompany: Company) => void;
  onClose: () => void;
}

export const EditCompanyModal: React.FC<EditCompanyModalProps> = ({
  isOpen,
  company,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [tradingName, setTradingName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [creaRegister, setCreaRegister] = useState('');
  const [stateRegistration, setStateRegistration] = useState('Isento');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('MT');
  const [logoUrl, setLogoUrl] = useState('');
  const [hasDigitalSignature, setHasDigitalSignature] = useState(false);

  useEffect(() => {
    if (company) {
      setName(company.name || '');
      setTradingName(company.tradingName || '');
      setCnpj(company.cnpj || '');
      setCreaRegister(company.creaRegister || '');
      setStateRegistration(company.stateRegistration || 'Isento');
      setPhone(company.phone || '');
      setEmail(company.email || '');
      setAddress(company.address || '');
      setCity(company.city || '');
      setState(company.state || 'MT');
      setLogoUrl(company.logoUrl || '');
      setHasDigitalSignature(!!company.hasDigitalSignature);
    }
  }, [company]);

  if (!isOpen || !company) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: Company = {
      ...company,
      name: name.trim(),
      tradingName: tradingName.trim() || name.trim(),
      cnpj: cnpj.trim(),
      creaRegister: creaRegister.trim(),
      stateRegistration: stateRegistration.trim() || 'Isento',
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      state,
      logoUrl: logoUrl.trim(),
      hasDigitalSignature,
      legalSignatureHash:
        hasDigitalSignature && !company.legalSignatureHash
          ? `ICP-BRASIL-${Date.now().toString(16).toUpperCase()}-${Math.floor(
              Math.random() * 1000000
            )}`
          : company.legalSignatureHash,
      legalSignatureDate: hasDigitalSignature
        ? company.legalSignatureDate || new Date().toISOString()
        : undefined,
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
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Editar Empresa / Consultoria
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Dados cadastrais, registro no CREA e identificação fiscal
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
              Razão Social *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
              Nome Fantasia
            </label>
            <input
              type="text"
              value={tradingName}
              onChange={(e) => setTradingName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                CNPJ
              </label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Registro CREA PJ
              </label>
              <input
                type="text"
                value={creaRegister}
                onChange={(e) => setCreaRegister(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Telefone
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
              Endereço
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
            />
          </div>

          {/* Logotipo da Empresa */}
          <div className="p-3 bg-slate-50 dark:bg-zinc-950/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Logotipo da Empresa / Consultoria</span>
              </label>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Remover Logo
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Aparecerá nos cabeçalhos de laudos agronômicos, receituários veterinários e relatórios emitidos.
            </p>

            {logoUrl ? (
              <div className="flex items-center gap-3 p-2 bg-white dark:bg-zinc-900 rounded-lg border border-emerald-300 dark:border-emerald-800/80">
                <div className="w-14 h-14 rounded-md bg-slate-50 dark:bg-zinc-950 p-1 border border-slate-200 dark:border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src={logoUrl}
                    alt="Logotipo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Logotipo configurado</p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">Clique em remover para trocar por outro arquivo</p>
                </div>
              </div>
            ) : (
              <div>
                <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-lg bg-white dark:bg-zinc-900 cursor-pointer transition-colors text-center group">
                  <Upload className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mb-1 transition-colors" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                    Clique ou arraste para atualizar o logotipo
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    PNG, JPG, SVG ou WebP (máx. 4MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 4 * 1024 * 1024) {
                          alert('Selecione uma imagem menor que 4MB.');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (typeof event.target?.result === 'string') {
                            setLogoUrl(event.target.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Ou URL:</span>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-[11px] border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1 pb-1">
            <input
              type="checkbox"
              id="editCompSig"
              checked={hasDigitalSignature}
              onChange={(e) => setHasDigitalSignature(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <label
              htmlFor="editCompSig"
              className="text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer"
            >
              Habilitar Assinatura Digital Jurídica (e-CNPJ)
            </label>
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
