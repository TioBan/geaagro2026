import { TechnicalProfession } from '../../types/agronomy';

export interface TechnicalProfessionConfig {
  role: TechnicalProfession;
  label: string;
  defaultCouncil: 'CREA' | 'CRMV' | 'CFTA' | 'CFT' | 'CRBio' | 'Outro';
  short: string;
  defaultSpecialty: string;
}

export const TECHNICAL_PROFESSIONS: TechnicalProfessionConfig[] = [
  {
    role: 'Engenheiro Agrônomo',
    label: 'Engenheiro(a) Agrônomo(a)',
    defaultCouncil: 'CREA',
    short: 'Eng. Agr.',
    defaultSpecialty: 'Fertilidade de Solos & Nutrição Vegetal',
  },
  {
    role: 'Médica Veterinária',
    label: 'Médica Veterinária',
    defaultCouncil: 'CRMV',
    short: 'Méd. Vet.',
    defaultSpecialty: 'Sanidade Animal, Clínica & Reprodução de Ruminantes',
  },
  {
    role: 'Médico Veterinário',
    label: 'Médico Veterinário',
    defaultCouncil: 'CRMV',
    short: 'Méd. Vet.',
    defaultSpecialty: 'Sanidade Animal, Clínica & Reprodução de Ruminantes',
  },
  {
    role: 'Zootecnista',
    label: 'Zootecnista',
    defaultCouncil: 'CRMV',
    short: 'Zoot.',
    defaultSpecialty: 'Nutrição Animal, Pastagens & Confinamento Bovino',
  },
  {
    role: 'Engenheiro Florestal',
    label: 'Engenheiro(a) Florestal',
    defaultCouncil: 'CREA',
    short: 'Eng. Flor.',
    defaultSpecialty: 'Silvicultura, Manejo Florestal & Restauração Ecológica',
  },
  {
    role: 'Engenheiro Ambiental',
    label: 'Engenheiro(a) Ambiental',
    defaultCouncil: 'CREA',
    short: 'Eng. Amb.',
    defaultSpecialty: 'Licenciamento Ambiental, CAR & Gestão de Recursos Hídricos',
  },
  {
    role: 'Técnico Agropecuário',
    label: 'Técnico(a) Agropecuário(a) / Agrícola',
    defaultCouncil: 'CFTA',
    short: 'Téc. Agr.',
    defaultSpecialty: 'Assistência Técnica, Operações de Campo & Extensão Rural',
  },
  {
    role: 'Outro',
    label: 'Outro Especialista / RT',
    defaultCouncil: 'CREA',
    short: 'RT',
    defaultSpecialty: 'Consultoria Agropecuária',
  },
];
