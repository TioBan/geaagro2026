import React, { useState, useEffect } from 'react';
import { X, Save, UserCheck } from 'lucide-react';
import { Agronomist, Company, TechnicalProfession } from '../../types/agronomy';
import { BRAZIL_STATES } from '../../data/brazilStates';

interface EditAgronomistModalProps {
  isOpen: boolean;
  agronomist: Agronomist | null;
  companies: Company[];
  onSave: (updatedAgronomist: Agronomist) => void;
  onClose: () => void;
}

const PROFESSIONS_LIST: {
  role: TechnicalProfession;
  defaultCouncil: 'CREA' | 'CRMV' | 'CFTA' | 'CFT' | 'CRBio' | 'Outro';
  short: string;
}[] = [
  { role: 'Engenheiro Agrônomo', defaultCouncil: 'CREA', short: 'Eng. Agr.' },
  { role: 'Médica Veterinária', defaultCouncil: 'CRMV', short: 'Méd. Vet.' },
  { role: 'Médico Veterinário', defaultCouncil: 'CRMV', short: 'Méd. Vet.' },
  { role: 'Zootecnista', defaultCouncil: 'CRMV', short: 'Zoot.' },
  { role: 'Engenheiro Florestal', defaultCouncil: 'CREA', short: 'Eng. Flor.' },
  { role: 'Engenheiro Ambiental', defaultCouncil: 'CREA', short: 'Eng. Amb.' },
  { role: 'Técnico Agropecuário', defaultCouncil: 'CFTA', short: 'Téc. Agr.' },
  { role: 'Outro', defaultCouncil: 'CREA', short: 'RT' },
];

export const EditAgronomistModal: React.FC<EditAgronomistModalProps> = ({
  isOpen,
  agronomist,
  companies,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [profession, setProfession] = useState<string>('Engenheiro Agrônomo');
  const [councilType, setCouncilType] = useState<string>('CREA');
  const [crea, setCrea] = useState('');
  const [creaState, setCreaState] = useState('MT');
  const [rnp, setRnp] = useState('');
  const [cpf, setCpf] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [signatureText, setSignatureText] = useState('');
  const [hasDigitalSignature, setHasDigitalSignature] = useState(false);
  const [companyId, setCompanyId] = useState('');

  useEffect(() => {
    if (agronomist) {
      setName(agronomist.name || '');
      setProfession(agronomist.profession || 'Engenheiro Agrônomo');
      setCouncilType(agronomist.councilType || 'CREA');
      setCrea(agronomist.crea || '');
      setCreaState(agronomist.creaState || 'MT');
      setRnp(agronomist.rnp || '');
      setCpf(agronomist.cpf || '');
      setSpecialty(agronomist.specialty || '');
      setEmail(agronomist.email || '');
      setPhone(agronomist.phone || '');
      setAddress(agronomist.address || agronomist.clinicAddress || '');
      setSignatureText(agronomist.signatureText || '');
      setHasDigitalSignature(!!agronomist.hasDigitalSignature);
      setCompanyId(agronomist.companyId || companies[0]?.id || '');
    }
  }, [agronomist, companies]);

  if (!isOpen || !agronomist) return null;

  const handleProfessionChange = (newRole: string) => {
    setProfession(newRole);
    const found = PROFESSIONS_LIST.find((p) => p.role === newRole);
    if (found) {
      setCouncilType(found.defaultCouncil);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !crea.trim()) return;

    const prefix =
      PROFESSIONS_LIST.find((p) => p.role === profession)?.short || 'RT';

    const defaultSignature = `${name.trim()} - ${prefix} ${councilType}-${creaState} ${crea.trim()}`;

    const updated: Agronomist = {
      ...agronomist,
      name: name.trim(),
      profession,
      councilType,
      crea: crea.trim(),
      councilNumber: crea.trim(),
      creaState,
      rnp: rnp.trim() || agronomist.rnp,
      cpf: cpf.trim() || agronomist.cpf,
      specialty: specialty.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      clinicAddress: address.trim(),
      signatureText: signatureText.trim() || defaultSignature,
      hasDigitalSignature,
      legalSignatureHash:
        hasDigitalSignature && !agronomist.legalSignatureHash
          ? `SHA256-${Date.now().toString(16).toUpperCase()}-${Math.floor(
              Math.random() * 1000000
            )}`
          : agronomist.legalSignatureHash,
      legalSignatureDate: hasDigitalSignature
        ? agronomist.legalSignatureDate || new Date().toISOString()
        : undefined,
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
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Editar Responsável Técnico (RT)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Dados profissionais, conselho de classe e assinatura técnica
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
              Nome Completo do Profissional *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Profissão / Categoria *
              </label>
              <select
                value={profession}
                onChange={(e) => handleProfessionChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              >
                {PROFESSIONS_LIST.map((p) => (
                  <option key={p.role} value={p.role}>
                    {p.role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Conselho Profissional *
              </label>
              <select
                value={councilType}
                onChange={(e) => setCouncilType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              >
                <option value="CREA">CREA (Engenharia e Agronomia)</option>
                <option value="CRMV">CRMV (Veterinária e Zootecnia)</option>
                <option value="CFTA">CFTA (Técnicos Agrícolas)</option>
                <option value="CFT">CFT (Técnicos Industriais/Agro)</option>
                <option value="CRBio">CRBio (Biólogos)</option>
                <option value="Outro">Outro Conselho</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Registro no {councilType || 'Conselho'} *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 145.892/D"
                value={crea}
                onChange={(e) => setCrea(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                UF {councilType || 'Conselho'}
              </label>
              <select
                value={creaState}
                onChange={(e) => setCreaState(e.target.value)}
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
                Registro Nacional (RNP / CFMV / CFTA)
              </label>
              <input
                type="text"
                value={rnp}
                onChange={(e) => setRnp(e.target.value)}
                placeholder="Ex: RNP-000000000"
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                CPF
              </label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
              Especialidade / Foco de Atuação
            </label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Ex: Fertilidade de Solos & Nutrição Vegetal"
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                Celular / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
              Endereço da Clínica / Consultório / Domicílio Profissional
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Av. dos Produtores Rurais, 1420 - Centro Clínico Veterinário"
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
              Texto Padrão da Assinatura Técnica
            </label>
            <input
              type="text"
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              placeholder={`Ex: Nome - ${profession} ${councilType}-${creaState}`}
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-mono text-[11px]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1 pb-1">
            <input
              type="checkbox"
              id="editAgroSig"
              checked={hasDigitalSignature}
              onChange={(e) => setHasDigitalSignature(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <label
              htmlFor="editAgroSig"
              className="text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer"
            >
              Habilitar Assinatura Digital (e-CPF/A1)
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
