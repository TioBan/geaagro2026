/**
 * Biblioteca Offline de Fotos e Ilustrações Clínicas de Doenças de Bubalinos (Bubalus bubalis)
 * 100% Funcional Offline (sem requisições externas à internet).
 * Contém Fotografias Clínicas Reais de Campo e Atlas Diagnóstico Vet-HD.
 */

import buffaloMastitisReal from '../assets/images/buf_mastitis.jpg';
import buffaloPododermatitisReal from '../assets/images/buf_pododerm.jpg';
import buffaloBrucellaReal from '../assets/images/buf_brucella.jpg';
import buffaloPasteurellosisReal from '../assets/images/buf_pasteur.jpg';
import buffaloLiceReal from '../assets/images/buf_lice.jpg';
import buffaloCalfDiarrheaReal from '../assets/images/buf_diarrhea.jpg';
import buffaloFasciolaReal from '../assets/images/buf_fasciola.jpg';
import buffaloBlacklegReal from '../assets/images/buf_blackleg.jpg';
import buffaloHeatStressReal from '../assets/images/buf_heat.jpg';
import buffaloTbReal from '../assets/images/buf_tb.jpg';
import buffaloTpbReal from '../assets/images/buf_tpb.jpg';
import buffaloLeptoReal from '../assets/images/buf_lepto.jpg';
import buffaloCocciReal from '../assets/images/buf_cocci.jpg';

function svgToDataUri(svgString: string): string {
  const cleaned = svgString
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleaned)}`;
}

export interface BuffaloDiseasePhoto {
  id: string;
  title: string;
  description: string;
  stageOrLesion: string;
  anatomicalSite: string;
  imageDataUri: string;
  isRealPhoto?: boolean;
}

/**
 * Gera imagens de Mastite Clínica em Úbere de Búfala
 */
export function getMastitisPhoto(): BuffaloDiseasePhoto[] {
  const svg1 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs>
      <radialGradient id="bgGrad" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </radialGradient>
      <radialGradient id="udderSkin" cx="45%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#334155"/>
        <stop offset="50%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#090d16"/>
      </radialGradient>
      <radialGradient id="inflamedQuarter" cx="40%" cy="45%" r="55%">
        <stop offset="0%" stop-color="#dc2626" stop-opacity="0.9"/>
        <stop offset="30%" stop-color="#991b1b" stop-opacity="0.8"/>
        <stop offset="70%" stop-color="#450a0a" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </radialGradient>
      <radialGradient id="teatGrad" cx="40%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#e11d48"/>
        <stop offset="40%" stop-color="#881337"/>
        <stop offset="100%" stop-color="#1c1917"/>
      </radialGradient>
      <linearGradient id="milkPus" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="50%" stop-color="#fde047"/>
        <stop offset="100%" stop-color="#ca8a04"/>
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.6"/>
      </filter>
    </defs>

    <!-- Fundo de Sala de Ordenha / Contenção -->
    <rect width="800" height="600" fill="url(#bgGrad)"/>
    <path d="M0,480 Q400,460 800,490 L800,600 L0,600 Z" fill="#0b0f19" opacity="0.8"/>

    <!-- Região Pélvica e Úbere de Búfala Murrah (Pele Escura / Pigmentada) -->
    <g filter="url(#shadow)">
      <!-- Corpo posterior -->
      <path d="M 120 100 Q 280 80 400 90 Q 550 85 680 120 Q 720 280 660 380 Q 600 440 540 430 Q 400 480 260 430 Q 180 390 140 280 Z" fill="url(#udderSkin)" stroke="#475569" stroke-width="2"/>
      
      <!-- Quarto Mamário Esquerdo Edemaciado e Hiperêmico (Inflamação Severa) -->
      <ellipse cx="320" cy="310" rx="140" ry="110" fill="url(#inflamedQuarter)"/>
      <path d="M 230 250 Q 280 230 360 260 Q 410 320 370 380 Q 260 410 210 340 Z" fill="#b91c1c" opacity="0.45"/>
      
      <!-- Vasos Sanguíneos Ingurgitados e Edema -->
      <path d="M 240 270 Q 290 290 320 340 T 360 380" stroke="#f87171" stroke-width="3.5" fill="none" opacity="0.85" stroke-linecap="round"/>
      <path d="M 300 250 Q 320 280 340 330" stroke="#f87171" stroke-width="2.5" fill="none" opacity="0.75"/>
      <path d="M 270 330 Q 290 360 300 390" stroke="#fca5a5" stroke-width="2" fill="none" opacity="0.7"/>

      <!-- Teto Anterior Esquerdo - Dilatado, Eritematoso com Fibrina no Esfíncter -->
      <path d="M 290 380 C 285 430 280 490 300 520 C 315 535 345 535 355 520 C 375 490 370 430 365 380 Z" fill="url(#teatGrad)" stroke="#f43f5e" stroke-width="1.5"/>
      
      <!-- Fibrina e Grumos de Pus saindo do orifício do teto -->
      <path d="M 320 525 Q 328 555 324 580 Q 332 585 336 575 Q 335 550 332 525 Z" fill="url(#milkPus)" stroke="#854d0e" stroke-width="1"/>
      <circle cx="326" cy="585" r="4" fill="#fef08a"/>
      
      <!-- Teto Direito Saudável para Comparação -->
      <path d="M 480 370 C 480 410 485 460 495 480 C 505 490 525 490 535 480 C 545 460 550 410 550 370 Z" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
    </g>

    <!-- Marcadores de Diagnóstico Clínico na Imagem -->
    <g font-family="Arial, sans-serif">
      <rect x="30" y="30" width="310" height="75" rx="10" fill="#0f172a" fill-opacity="0.9" stroke="#ef4444" stroke-width="1.5"/>
      <text x="45" y="55" fill="#fca5a5" font-size="14" font-weight="bold">CASO CLÍNICO: Mastite Aguda</text>
      <text x="45" y="75" fill="#e2e8f0" font-size="11">Hiperemia, edema e aumento de volume</text>
      <text x="45" y="92" fill="#cbd5e1" font-size="10">Exsudato grumoso com fibrina e piócitos</text>

      <!-- Linhas de chamada -->
      <line x1="180" y1="310" x2="100" y2="280" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,4"/>
      <circle cx="180" cy="310" r="4" fill="#ef4444"/>
      <rect x="20" y="260" width="130" height="30" rx="6" fill="#7f1d1d" stroke="#ef4444" stroke-width="1"/>
      <text x="30" y="280" fill="#fee2e2" font-size="10" font-weight="bold">Quarto Inflamado</text>

      <line x1="330" y1="540" x2="420" y2="550" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4,4"/>
      <circle cx="330" cy="540" r="4" fill="#eab308"/>
      <rect x="425" y="535" width="160" height="30" rx="6" fill="#713f12" stroke="#eab308" stroke-width="1"/>
      <text x="435" y="555" fill="#fef08a" font-size="10" font-weight="bold">Grumo de Pus / Fibrina</text>
    </g>
  </svg>
  `;

  return [
    {
      id: 'photo-mastitis-real',
      title: 'Fotografia Clínica Real: Mastite Aguda em Búfala Leiteira',
      description: 'Quarto mamário severamente inflamado e edemaciado com presença de grumos e fibrina no leite, teste CMT positivo.',
      stageOrLesion: 'Inflamação aguda com calor local, dor e queda abrupta da lactação',
      anatomicalSite: 'Glândula mamária e teto',
      imageDataUri: buffaloMastitisReal,
      isRealPhoto: true,
    },
    {
      id: 'photo-mastitis-1',
      title: 'Esquema Vet-HD: Fisiopatologia da Mastite e Exsudato',
      description: 'Edema acentuado, hiperemia e secreção grumosa amarelada pós-ordenha com presença de Staphylococcus aureus.',
      stageOrLesion: 'Quarto posterior esquerdo com aumento térmico de 2.8°C e dor à palpação',
      anatomicalSite: 'Glândula mamária e esfíncter do teto',
      imageDataUri: svgToDataUri(svg1),
      isRealPhoto: false,
    },
  ];
}

/**
 * Gera imagem de Pododermatite (Gabarro / Necrobacilose Podal)
 */
export function getFootRotPhoto(): BuffaloDiseasePhoto[] {
  const svg1 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs>
      <radialGradient id="clawSkin" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#334155"/>
        <stop offset="70%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#020617"/>
      </radialGradient>
      <radialGradient id="hornHoof" cx="30%" cy="40%" r="70%">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="60%" stop-color="#090d16"/>
        <stop offset="100%" stop-color="#000000"/>
      </radialGradient>
      <radialGradient id="lesionNecrosis" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="#ef4444"/>
        <stop offset="35%" stop-color="#991b1b"/>
        <stop offset="70%" stop-color="#450a0a"/>
        <stop offset="100%" stop-color="#172554"/>
      </radialGradient>
    </defs>

    <rect width="800" height="600" fill="#0f172a"/>

    <!-- Membro Locomotor e Boleto do Búfalo -->
    <path d="M 280 40 L 290 220 Q 300 280 260 350 L 230 460 Q 230 500 260 520 L 370 540 L 390 400 L 410 400 L 430 540 L 540 520 Q 570 500 570 460 L 540 350 Q 500 280 510 220 L 520 40 Z" fill="url(#clawSkin)" stroke="#475569" stroke-width="2"/>

    <!-- Coroa do Casco Edemaciada e avermelhada -->
    <path d="M 240 350 Q 400 320 560 350 Q 570 385 540 400 Q 400 370 260 400 Q 230 380 240 350 Z" fill="#b91c1c" opacity="0.6"/>

    <!-- Unha Lateral Esquerda do Casco -->
    <path d="M 240 390 Q 290 380 380 390 L 370 540 Q 260 560 220 500 Q 210 450 240 390 Z" fill="url(#hornHoof)" stroke="#334155" stroke-width="2"/>

    <!-- Unha Lateral Direita do Casco -->
    <path d="M 420 390 Q 510 380 560 390 Q 590 450 580 500 Q 540 560 430 540 L 420 390 Z" fill="url(#hornHoof)" stroke="#334155" stroke-width="2"/>

    <!-- Fissura Interdigital Ulcerada e Necrótica com Exsudato Fétido -->
    <g>
      <path d="M 370 370 Q 400 360 430 370 Q 440 440 425 500 Q 400 520 375 500 Q 360 440 370 370 Z" fill="url(#lesionNecrosis)"/>
      <ellipse cx="400" cy="440" rx="22" ry="45" fill="#f87171" opacity="0.75"/>
      <path d="M 390 410 Q 405 450 395 480" stroke="#fef08a" stroke-width="4" stroke-linecap="round" fill="none"/>
      <circle cx="402" cy="460" r="5" fill="#fde047"/>
      <circle cx="395" cy="435" r="4" fill="#fef08a"/>
    </g>

    <!-- Callouts e Legendas -->
    <g font-family="Arial, sans-serif">
      <rect x="30" y="30" width="340" height="75" rx="10" fill="#020617" fill-opacity="0.9" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="45" y="55" fill="#fde68a" font-size="14" font-weight="bold">PODODERMATITE / GABARRO</text>
      <text x="45" y="75" fill="#e2e8f0" font-size="11">Necrose Interdigital por Fusobacterium necrophorum</text>
      <text x="45" y="92" fill="#cbd5e1" font-size="10">Exsudato fétido, hiperqueratose e claudicação grau 4</text>

      <line x1="400" y1="450" x2="620" y2="440" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,4"/>
      <circle cx="400" cy="450" r="4" fill="#f59e0b"/>
      <rect x="625" y="420" width="150" height="40" rx="6" fill="#78350f" stroke="#f59e0b" stroke-width="1"/>
      <text x="635" y="438" fill="#fef3c7" font-size="10" font-weight="bold">Úlcera Interdigital</text>
      <text x="635" y="452" fill="#fde68a" font-size="9">Necrose liquefativa</text>
    </g>
  </svg>
  `;

  return [
    {
      id: 'photo-footrot-real',
      title: 'Fotografia Clínica Real: Pododermatite e Úlcera de Casco',
      description: 'Exame podológico em búfalo com fissura interdigital profunda, necrose liquefativa fétida e manqueira grau 4.',
      stageOrLesion: 'Lesão ativa com descolamento córneo e edema de coroa',
      anatomicalSite: 'Espaço interdigital e talões do casco',
      imageDataUri: buffaloPododermatitisReal,
      isRealPhoto: true,
    },
    {
      id: 'photo-footrot-1',
      title: 'Esquema Vet-HD: Anatomia Podal e Necrose de Fenda',
      description: 'Fissura e ulceração severa no espaço interdigital do casco pélvico com necrose tecidual e corrimento fétido.',
      stageOrLesion: 'Lesão ativa com desprendimento da sola córnea e edema na banda coronária',
      anatomicalSite: 'Espaço interdigital e talões do casco',
      imageDataUri: svgToDataUri(svg1),
      isRealPhoto: false,
    },
  ];
}

/**
 * Gera imagem de Toxocara vitulorum (Verminose em Bezerro Bubalino)
 */
export function getToxocaraPhoto(): BuffaloDiseasePhoto[] {
  const svg1 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs>
      <radialGradient id="gutWall" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="#fda4af"/>
        <stop offset="60%" stop-color="#f43f5e"/>
        <stop offset="100%" stop-color="#881337"/>
      </radialGradient>
      <linearGradient id="wormBody" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="30%" stop-color="#fef08a"/>
        <stop offset="70%" stop-color="#fef9c3"/>
        <stop offset="100%" stop-color="#cbd5e1"/>
      </linearGradient>
    </defs>

    <rect width="800" height="600" fill="#0f172a"/>

    <!-- Luz do Intestino Delgado do Bezerro -->
    <path d="M 50 100 Q 400 60 750 120 L 750 500 Q 400 540 50 480 Z" fill="url(#gutWall)" stroke="#e11d48" stroke-width="3"/>
    
    <!-- Vilosidades e Mucosa Inflamada -->
    <path d="M 50 120 Q 200 160 400 130 T 750 140" stroke="#be123c" stroke-width="8" fill="none" opacity="0.6"/>
    <path d="M 50 460 Q 300 420 500 450 T 750 440" stroke="#be123c" stroke-width="8" fill="none" opacity="0.6"/>

    <!-- Emaranhado de Vermes Adultos Toxocara vitulorum (20 a 30 cm) -->
    <g stroke="#94a3b8" stroke-width="1.5">
      <!-- Verme 1 -->
      <path d="M 120 220 C 180 140, 290 320, 420 200 C 520 120, 620 280, 680 230" fill="none" stroke="url(#wormBody)" stroke-width="14" stroke-linecap="round"/>
      <!-- Verme 2 -->
      <path d="M 160 380 C 260 220, 340 420, 480 310 C 580 230, 640 410, 710 330" fill="none" stroke="url(#wormBody)" stroke-width="16" stroke-linecap="round"/>
      <!-- Verme 3 enrolado -->
      <path d="M 280 280 C 350 200, 450 230, 420 360 C 380 440, 260 380, 310 290" fill="none" stroke="url(#wormBody)" stroke-width="12" stroke-linecap="round"/>
      <!-- Verme 4 -->
      <path d="M 320 160 C 440 310, 520 190, 610 360" fill="none" stroke="url(#wormBody)" stroke-width="13" stroke-linecap="round"/>
    </g>

    <!-- Fezes mucosas e gases no intestino -->
    <ellipse cx="220" cy="430" rx="60" ry="25" fill="#ca8a04" opacity="0.6"/>
    <ellipse cx="560" cy="220" rx="40" ry="18" fill="#ca8a04" opacity="0.5"/>

    <!-- Informações do Caso -->
    <g font-family="Arial, sans-serif">
      <rect x="30" y="30" width="370" height="75" rx="10" fill="#020617" fill-opacity="0.9" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="45" y="55" fill="#7dd3fc" font-size="14" font-weight="bold">TOXOCARÍASE NEONATAL BUBALINA</text>
      <text x="45" y="75" fill="#e2e8f0" font-size="11">Obstrução intestinal por Toxocara vitulorum</text>
      <text x="45" y="92" fill="#cbd5e1" font-size="10">Bezerro de 28 dias: diarréia fétida com odor butírico e ascite</text>

      <line x1="450" y1="310" x2="620" y2="480" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4,4"/>
      <circle cx="450" cy="310" r="4" fill="#38bdf8"/>
      <rect x="580" y="490" width="190" height="40" rx="6" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1"/>
      <text x="590" y="508" fill="#e0f2fe" font-size="10" font-weight="bold">Nematoides Adultos (25cm)</text>
      <text x="590" y="522" fill="#7dd3fc" font-size="9">Oclusão da luz jejunal</text>
    </g>
  </svg>
  `;

  return [
    {
      id: 'photo-toxocara-real',
      title: 'Fotografia Clínica Real: Toxocarose Neonatal em Bezerro Bubalino',
      description: 'Bezerro com diarreia profusa, desidratação, distensão abdominal ("barriga d\'água") e eliminação de vermes Toxocara.',
      stageOrLesion: 'Enterite catarral severa e prostração neonatal',
      anatomicalSite: 'Intestino Delgado e Trato Gastrointestinal',
      imageDataUri: buffaloCalfDiarrheaReal,
      isRealPhoto: true,
    },
    {
      id: 'photo-toxocara-1',
      title: 'Esquema Vet-HD: Toxocara vitulorum no Intestino Delgado',
      description: 'Presença massiva de nematóides adultos cilíndricos na luz intestinal de bezerro bubalino com diarreia profusa.',
      stageOrLesion: 'Enterite catarral severa com emaranhado parasitário obstrutivo',
      anatomicalSite: 'Jejuno e íleo (Intestino Delgado)',
      imageDataUri: svgToDataUri(svg1),
      isRealPhoto: false,
    },
  ];
}

/**
 * Gera imagem de Infestação por Piolho do Búfalo (Haematopinus quadripertusus)
 */
export function getLousePhoto(): BuffaloDiseasePhoto[] {
  const svg1 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs>
      <radialGradient id="buffaloSkin" cx="40%" cy="40%" r="70%">
        <stop offset="0%" stop-color="#475569"/>
        <stop offset="60%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#020617"/>
      </radialGradient>
      <radialGradient id="louseBody" cx="40%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#78716c"/>
        <stop offset="60%" stop-color="#44403c"/>
        <stop offset="100%" stop-color="#1c1917"/>
      </radialGradient>
    </defs>

    <rect width="800" height="600" fill="url(#buffaloSkin)"/>

    <!-- Pelos Escassos da Pele do Búfalo com Lêndeas Aderidas -->
    <g stroke="#0f172a" stroke-width="3" stroke-linecap="round" opacity="0.8">
      <path d="M 50 150 Q 150 180 260 140"/>
      <path d="M 120 280 Q 220 340 380 290"/>
      <path d="M 400 120 Q 520 220 680 180"/>
      <path d="M 320 420 Q 480 490 640 430"/>
    </g>

    <!-- Lêndeas brancas aderidas aos folículos -->
    <g fill="#f8fafc" stroke="#94a3b8" stroke-width="1">
      <ellipse cx="140" cy="170" rx="6" ry="12" transform="rotate(25 140 170)"/>
      <ellipse cx="155" cy="176" rx="6" ry="12" transform="rotate(25 155 176)"/>
      <ellipse cx="250" cy="310" rx="6" ry="12" transform="rotate(-15 250 310)"/>
      <ellipse cx="265" cy="306" rx="6" ry="12" transform="rotate(-15 265 306)"/>
      <ellipse cx="460" cy="170" rx="6" ry="12" transform="rotate(40 460 170)"/>
    </g>

    <!-- Piolho Gigante Adulto em Detalhe Macro (Haematopinus quadripertusus) -->
    <g transform="translate(380, 280) scale(1.1)">
      <!-- Pernas preênsoras fortes adaptadas a pelos grossos -->
      <path d="M -50 -40 L -120 -80 L -140 -60" stroke="#292524" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M -50 0 L -130 10 L -145 35" stroke="#292524" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M -50 40 L -120 90 L -130 120" stroke="#292524" stroke-width="8" stroke-linecap="round" fill="none"/>

      <path d="M 50 -40 L 120 -80 L 140 -60" stroke="#292524" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M 50 0 L 130 10 L 145 35" stroke="#292524" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M 50 40 L 120 90 L 130 120" stroke="#292524" stroke-width="8" stroke-linecap="round" fill="none"/>

      <!-- Abdômen Globoso e Segmentado -->
      <ellipse cx="0" cy="40" rx="75" ry="95" fill="url(#louseBody)" stroke="#1c1917" stroke-width="3"/>
      <!-- Segmentação -->
      <line x1="-65" y1="0" x2="65" y2="0" stroke="#292524" stroke-width="2"/>
      <line x1="-70" y1="30" x2="70" y2="30" stroke="#292524" stroke-width="2"/>
      <line x1="-70" y1="60" x2="70" y2="60" stroke="#292524" stroke-width="2"/>
      <line x1="-60" y1="90" x2="60" y2="90" stroke="#292524" stroke-width="2"/>

      <!-- Tórax -->
      <rect x="-35" y="-60" width="70" height="50" rx="15" fill="#44403c" stroke="#1c1917" stroke-width="3"/>

      <!-- Cabeça afilada com peças bucais sugadoras cravadas na derme -->
      <path d="M -20 -60 L 0 -110 L 20 -60 Z" fill="#292524" stroke="#1c1917" stroke-width="2"/>
      <line x1="0" y1="-110" x2="0" y2="-135" stroke="#ef4444" stroke-width="3"/>
    </g>

    <!-- Crostas e Escoriações por Prurido e Fricção -->
    <path d="M 180 430 Q 250 400 320 440 Q 300 480 210 470 Z" fill="#7f1d1d" opacity="0.65"/>

    <!-- Informações do Caso -->
    <g font-family="Arial, sans-serif">
      <rect x="30" y="30" width="370" height="75" rx="10" fill="#020617" fill-opacity="0.9" stroke="#a855f7" stroke-width="1.5"/>
      <text x="45" y="55" fill="#d8b4fe" font-size="14" font-weight="bold">PIOLHO SUGADOR DO BÚFALO</text>
      <text x="45" y="75" fill="#e2e8f0" font-size="11">Haematopinus quadripertusus (Macro 25x)</text>
      <text x="45" y="92" fill="#cbd5e1" font-size="10">Infestação periocular e na cauda com prurido intenso e anemia</text>
    </g>
  </svg>
  `;

  return [
    {
      id: 'photo-louse-real',
      title: 'Fotografia Macro Real: Piolho Sugador (Haematopinus) e Alopecia',
      description: 'Pele espessa de búfalo com infestação maciça de Haematopinus tuberculatus, perda focal de pelos e crostas.',
      stageOrLesion: 'Dermatite ectoparasitária e prurido intenso',
      anatomicalSite: 'Pele, base da cauda e períneo',
      imageDataUri: buffaloLiceReal,
      isRealPhoto: true,
    },
    {
      id: 'photo-louse-1',
      title: 'Esquema Vet-HD: Morfologia do Piolho do Búfalo',
      description: 'Piolho sugador gigante adaptado ao tegumento espesso de búfalos, causando alopecia, crostas e escoriações por fricção.',
      stageOrLesion: 'Colônia ativa com fêmeas adultas hematófagas e cachos de lêndeas',
      anatomicalSite: 'Região perineal, base dos chifres e vassoura da cauda',
      imageDataUri: svgToDataUri(svg1),
      isRealPhoto: false,
    },
  ];
}

/**
 * Gera imagem de Septicemia Hemorrágica / Pasteurelose (Barbone)
 */
export function getPasteurellosisPhoto(): BuffaloDiseasePhoto[] {
  const svg1 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs>
      <radialGradient id="neckSkin" cx="40%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#334155"/>
        <stop offset="70%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#020617"/>
      </radialGradient>
      <radialGradient id="edemaDewlap" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="#e11d48"/>
        <stop offset="40%" stop-color="#9f1239"/>
        <stop offset="80%" stop-color="#4c0519"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </radialGradient>
    </defs>

    <rect width="800" height="600" fill="#0b0f19"/>

    <!-- Cabeça e Pescoço do Búfalo -->
    <path d="M 100 240 Q 200 180 320 200 L 480 180 Q 650 140 750 200 L 780 480 L 520 540 Q 380 560 220 500 L 100 380 Z" fill="url(#neckSkin)" stroke="#475569" stroke-width="2"/>
    
    <!-- Olho e Focinho -->
    <ellipse cx="210" cy="280" rx="14" ry="9" fill="#000" stroke="#334155"/>
    <path d="M 100 320 Q 90 380 130 400 L 160 380 Z" fill="#090d16"/>
    <!-- Salivação espumosa por disfagia / dispneia -->
    <path d="M 130 395 Q 120 460 145 520 Q 155 525 150 470 Z" fill="#f8fafc" opacity="0.9"/>
    <circle cx="140" cy="510" r="5" fill="#f8fafc"/>
    <circle cx="148" cy="530" r="4" fill="#f8fafc"/>

    <!-- Edema Gelatinoso Submandibular e de Barbela (Lesão Patognomônica de Barbone) -->
    <ellipse cx="360" cy="420" rx="150" ry="85" fill="url(#edemaDewlap)"/>
    <path d="M 240 370 Q 360 330 480 370 Q 520 460 460 510 Q 340 540 250 480 Z" fill="#fda4af" opacity="0.35"/>

    <!-- Sufusões Hemorrágicas e Petéquias na Pele do Pescoço -->
    <circle cx="320" cy="400" r="8" fill="#e11d48"/>
    <circle cx="350" cy="430" r="10" fill="#be123c"/>
    <circle cx="390" cy="410" r="7" fill="#e11d48"/>
    <circle cx="410" cy="445" r="9" fill="#9f1239"/>
    <circle cx="280" cy="420" r="6" fill="#be123c"/>

    <!-- Legenda e Detalhes -->
    <g font-family="Arial, sans-serif">
      <rect x="30" y="30" width="390" height="75" rx="10" fill="#020617" fill-opacity="0.9" stroke="#f43f5e" stroke-width="1.5"/>
      <text x="45" y="55" fill="#fda4af" font-size="14" font-weight="bold">SEPTICEMIA HEMORRÁGICA (BARBONE)</text>
      <text x="45" y="75" fill="#e2e8f0" font-size="11">Pasteurella multocida tipo B/E (Altíssima letalidade)</text>
      <text x="45" y="92" fill="#cbd5e1" font-size="10">Edema gelatinoso de barbela, cianose de mucosas e asfixia aguda</text>

      <line x1="380" y1="440" x2="600" y2="380" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="4,4"/>
      <circle cx="380" cy="440" r="4" fill="#f43f5e"/>
      <rect x="580" y="350" width="190" height="40" rx="6" fill="#881337" stroke="#f43f5e" stroke-width="1"/>
      <text x="590" y="368" fill="#ffe4e6" font-size="10" font-weight="bold">Edema de Glote / Barbela</text>
      <text x="590" y="382" fill="#fecdd3" font-size="9">Infiltração sero-hemorrágica</text>
    </g>
  </svg>
  `;

  return [
    {
      id: 'photo-pasteurellosis-real',
      title: 'Fotografia Clínica Real: Septicemia Hemorrágica (Pasteurelose / Barbone)',
      description: 'Búfalo em decúbito e angústia respiratória com edema submandibular e cervical acentuado característico.',
      stageOrLesion: 'Fase superaguda com salivação, edema difuso de barbela e dispneia',
      anatomicalSite: 'Região cervical ventral, laringe e barbela',
      imageDataUri: buffaloPasteurellosisReal,
      isRealPhoto: true,
    },
    {
      id: 'photo-pasteurellosis-1',
      title: 'Esquema Vet-HD: Edema Submandibular e Barbela',
      description: 'Edema quente e doloroso na região cervical ventral e barbela, com salivação profusa e asfixia por Pasteurella multocida.',
      stageOrLesion: 'Fase hiperaguda com infiltração serofibrinosa submandibular e febre de 41.5°C',
      anatomicalSite: 'Região cervical ventral, laringe e barbela',
      imageDataUri: svgToDataUri(svg1),
      isRealPhoto: false,
    },
  ];
}

/**
 * Gera imagem de Brucelose Bubalina (Hygroma Articular e Placenta)
 */
export function getBrucellosisPhoto(): BuffaloDiseasePhoto[] {
  const svg1 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs>
      <radialGradient id="kneeSkin" cx="40%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#334155"/>
        <stop offset="60%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#020617"/>
      </radialGradient>
      <radialGradient id="hygroma" cx="45%" cy="45%" r="60%">
        <stop offset="0%" stop-color="#f59e0b"/>
        <stop offset="40%" stop-color="#d97706"/>
        <stop offset="80%" stop-color="#78350f"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </radialGradient>
    </defs>

    <rect width="800" height="600" fill="#0f172a"/>

    <!-- Membro Anterior com Articulação do Carpo (Joelho) de Búfala -->
    <path d="M 320 20 L 330 220 Q 300 280 250 360 Q 230 440 280 500 L 320 580 L 460 580 L 480 480 Q 520 400 480 320 L 470 20 Z" fill="url(#kneeSkin)" stroke="#475569" stroke-width="2"/>

    <!-- Hygroma Carpal Volumoso (Bursite Fibrinosa Crônica por Brucella abortus) -->
    <ellipse cx="300" cy="350" rx="110" ry="80" fill="url(#hygroma)" stroke="#b45309" stroke-width="2"/>
    <ellipse cx="290" cy="340" rx="90" ry="60" fill="#fef3c7" opacity="0.25"/>

    <!-- Fluctuância e espessamento capsular -->
    <path d="M 230 320 Q 290 290 360 330" stroke="#fef3c7" stroke-width="3" fill="none" opacity="0.7"/>

    <!-- Informações do Caso -->
    <g font-family="Arial, sans-serif">
      <rect x="30" y="30" width="370" height="75" rx="10" fill="#020617" fill-opacity="0.9" stroke="#e11d48" stroke-width="1.5"/>
      <text x="45" y="55" fill="#fca5a5" font-size="14" font-weight="bold">BRUCELOSE BUBALINA: HYGROMA</text>
      <text x="45" y="75" fill="#e2e8f0" font-size="11">Brucella abortus (Zoonose de Notificação Obrigatória)</text>
      <text x="45" y="92" fill="#cbd5e1" font-size="10">Hygroma carpal crônico com líquido sinovial rico em bactérias</text>

      <line x1="300" y1="350" x2="540" y2="300" stroke="#e11d48" stroke-width="1.5" stroke-dasharray="4,4"/>
      <circle cx="300" cy="350" r="4" fill="#e11d48"/>
      <rect x="540" y="280" width="180" height="40" rx="6" fill="#881337" stroke="#e11d48" stroke-width="1"/>
      <text x="550" y="298" fill="#ffe4e6" font-size="10" font-weight="bold">Hygroma Articular</text>
      <text x="550" y="312" fill="#fecdd3" font-size="9">Bursite pré-carpal crônica</text>
    </g>
  </svg>
  `;

  return [
    {
      id: 'photo-brucellosis-real',
      title: 'Fotografia Clínica Real: Higroma Carpal por Brucella abortus',
      description: 'Aumento de volume capsular e articular crônico no carpo de búfala adulta com sorologia positiva para brucelose.',
      stageOrLesion: 'Bursite pré-carpal crônica com acúmulo de líquido serofibrinoso',
      anatomicalSite: 'Articulação do carpo do membro anterior',
      imageDataUri: buffaloBrucellaReal,
      isRealPhoto: true,
    },
    {
      id: 'photo-brucellosis-1',
      title: 'Esquema Vet-HD: Hygroma Carpal e Bursite por Brucella',
      description: 'Aumento de volume articular e periarticular no carpo com espessamento fibroso e exsudato serofibrinoso infeccioso.',
      stageOrLesion: 'Bursite pré-carpal crônica com sorologia AAT e 2-ME reagente positiva',
      anatomicalSite: 'Articulação do carpo (joelho) do membro anterior',
      imageDataUri: svgToDataUri(svg1),
      isRealPhoto: false,
    },
  ];
}

/**
 * Gera imagem de Estresse Térmico / Hipertermia em Búfalo
 */
export function getThermalStressPhoto(): BuffaloDiseasePhoto[] {
  const svg1 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs>
      <radialGradient id="heatSky" cx="50%" cy="10%" r="80%">
        <stop offset="0%" stop-color="#f59e0b"/>
        <stop offset="40%" stop-color="#ea580c"/>
        <stop offset="80%" stop-color="#7c2d12"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </radialGradient>
      <radialGradient id="buffaloHead" cx="40%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#475569"/>
        <stop offset="70%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#090d16"/>
      </radialGradient>
    </defs>

    <!-- Ambiente sob Alta Radiação Solar (ITU > 82) -->
    <rect width="800" height="600" fill="url(#heatSky)"/>

    <!-- Cabeça de Búfalo Murrah com Língua Projetada e Respiração Ofegante -->
    <g transform="translate(50, 40)">
      <!-- Chifres curvados para trás típicos de Murrah -->
      <path d="M 320 200 C 360 80, 240 40, 200 80 C 180 100, 220 140, 290 200" fill="#090d16" stroke="#334155" stroke-width="2"/>
      <path d="M 460 200 C 500 80, 620 40, 660 80 C 680 100, 640 140, 490 200" fill="#090d16" stroke="#334155" stroke-width="2"/>

      <!-- Cabeça -->
      <path d="M 280 200 Q 390 170 500 200 L 520 340 Q 480 460 460 480 L 320 480 Q 300 460 260 340 Z" fill="url(#buffaloHead)" stroke="#334155" stroke-width="2"/>

      <!-- Olhos com olhar angustiado e conjuntiva hiperêmica -->
      <ellipse cx="320" cy="270" rx="16" ry="11" fill="#000"/>
      <circle cx="323" cy="268" r="3" fill="#fff"/>
      <ellipse cx="460" cy="270" rx="16" ry="11" fill="#000"/>
      <circle cx="463" cy="268" r="3" fill="#fff"/>

      <!-- Narinas dilatadas (Taquipneia > 80 resp/min) -->
      <ellipse cx="345" cy="420" rx="16" ry="10" fill="#020617"/>
      <ellipse cx="435" cy="420" rx="16" ry="10" fill="#020617"/>

      <!-- Boca aberta e Língua Projetada (Panting Score 3) -->
      <path d="M 350 450 Q 390 490 430 450 Q 450 510 390 540 Q 330 510 350 450 Z" fill="#e11d48" stroke="#be123c" stroke-width="2"/>
      <!-- Salivação abundante espumosa -->
      <path d="M 370 510 Q 360 560 375 580" stroke="#f8fafc" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.9"/>
      <path d="M 410 510 Q 420 550 415 575" stroke="#f8fafc" stroke-width="3.5" stroke-linecap="round" fill="none" opacity="0.85"/>
      <circle cx="375" cy="585" r="4" fill="#f8fafc"/>
      <circle cx="415" cy="580" r="3.5" fill="#f8fafc"/>
    </g>

    <!-- Legenda e Alerta de Emergência Bioclimática -->
    <g font-family="Arial, sans-serif">
      <rect x="30" y="30" width="370" height="75" rx="10" fill="#020617" fill-opacity="0.9" stroke="#f97316" stroke-width="1.5"/>
      <text x="45" y="55" fill="#fdba74" font-size="14" font-weight="bold">ESTRESSE TÉRMICO SEVERO</text>
      <text x="45" y="75" fill="#e2e8f0" font-size="11">ITU: 84.5 • BGT-HI: 89.0 (Sem água de banho)</text>
      <text x="45" y="92" fill="#cbd5e1" font-size="10">Taquipneia, língua projetada, sialorreia e queda de 35% de leite</text>
    </g>
  </svg>
  `;

  return [
    {
      id: 'photo-heat-real',
      title: 'Fotografia Clínica Real: Búfalo em Estresse Térmico e Banho de Lama',
      description: 'Búfalo buscando poça de lama e água para termorregulação após exposição solar intensa, com taquipneia evidente.',
      stageOrLesion: 'ITU crítico com necessidade de sombreamento e aspersão de água',
      anatomicalSite: 'Termorregulação e tegumento',
      imageDataUri: buffaloHeatStressReal,
      isRealPhoto: true,
    },
    {
      id: 'photo-heat-1',
      title: 'Esquema Vet-HD: Resposta Fisiológica ao Estresse Térmico',
      description: 'Animal em hipertermia com língua projetada, respiração ofegante e salivação abundante por falta de acesso à água de banho.',
      stageOrLesion: 'ITU > 82 com temperatura retal de 40.2°C e frequência respiratória de 88 mov/min',
      anatomicalSite: 'Fácies, cavidade oral e trato respiratório',
      imageDataUri: svgToDataUri(svg1),
      isRealPhoto: false,
    },
  ];
}

/**
 * Gera imagem de Tuberculose Bubalina (Granulomas Pulmonares e Linfonodos)
 */
export function getTuberculosisPhoto(): BuffaloDiseasePhoto[] {
  const svg1 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs>
      <radialGradient id="lungParenchyma" cx="45%" cy="40%" r="65%">
        <stop offset="0%" stop-color="#fda4af"/>
        <stop offset="40%" stop-color="#f43f5e"/>
        <stop offset="80%" stop-color="#9f1239"/>
        <stop offset="100%" stop-color="#4c0519"/>
      </radialGradient>
      <radialGradient id="caseousNodule" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#fef9c3"/>
        <stop offset="50%" stop-color="#fef08a"/>
        <stop offset="80%" stop-color="#ca8a04"/>
        <stop offset="100%" stop-color="#713f12"/>
      </radialGradient>
    </defs>

    <rect width="800" height="600" fill="#0f172a"/>

    <!-- Lobo Pulmonar em Exame Necroscópico -->
    <path d="M 80 120 C 180 60, 480 80, 680 140 C 760 260, 720 440, 640 500 C 460 560, 240 540, 100 460 C 40 360, 40 220, 80 120 Z" fill="url(#lungParenchyma)" stroke="#be123c" stroke-width="3"/>

    <!-- Linfonodo Mediastínico Volumoso com Caseificação -->
    <ellipse cx="240" cy="220" rx="95" ry="75" fill="url(#caseousNodule)" stroke="#854d0e" stroke-width="2.5"/>
    <circle cx="210" cy="200" r="22" fill="#ffffff" opacity="0.6"/>
    <circle cx="260" cy="230" r="18" fill="#fef08a" opacity="0.8"/>
    <circle cx="225" cy="245" r="15" fill="#fef9c3" opacity="0.7"/>

    <!-- Tubérculos Miliares Disseminados no Parênquima Pulmonar -->
    <circle cx="450" cy="180" r="28" fill="url(#caseousNodule)" stroke="#713f12" stroke-width="1.5"/>
    <circle cx="520" cy="240" r="38" fill="url(#caseousNodule)" stroke="#713f12" stroke-width="2"/>
    <circle cx="480" cy="320" r="24" fill="url(#caseousNodule)" stroke="#713f12" stroke-width="1.5"/>
    <circle cx="580" cy="350" r="32" fill="url(#caseousNodule)" stroke="#713f12" stroke-width="2"/>
    <circle cx="380" cy="380" r="22" fill="url(#caseousNodule)" stroke="#713f12" stroke-width="1.5"/>
    <circle cx="310" cy="440" r="30" fill="url(#caseousNodule)" stroke="#713f12" stroke-width="2"/>
    <circle cx="440" cy="450" r="35" fill="url(#caseousNodule)" stroke="#713f12" stroke-width="2"/>

    <!-- Linhas de enfisema e pleurite fibrinosa -->
    <path d="M 120 180 Q 280 140 440 160" stroke="#fecdd3" stroke-width="3" fill="none" opacity="0.7"/>
    <path d="M 500 480 Q 600 440 680 340" stroke="#fecdd3" stroke-width="3" fill="none" opacity="0.7"/>

    <!-- Callouts e Legendas -->
    <g font-family="Arial, sans-serif">
      <rect x="30" y="30" width="370" height="75" rx="10" fill="#020617" fill-opacity="0.9" stroke="#ef4444" stroke-width="1.5"/>
      <text x="45" y="55" fill="#fca5a5" font-size="14" font-weight="bold">TUBERCULOSE BUBALINA: LESÕES</text>
      <text x="45" y="75" fill="#e2e8f0" font-size="11">Mycobacterium bovis (Zoonose de Sacrifício Obrigatório)</text>
      <text x="45" y="92" fill="#cbd5e1" font-size="10">Granulomas caseo-calcificados e linfoadenite tuberculosa</text>

      <line x1="240" y1="220" x2="380" y2="100" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,4"/>
      <circle cx="240" cy="220" r="4" fill="#ef4444"/>
      <rect x="380" y="80" width="200" height="35" rx="6" fill="#7f1d1d" stroke="#ef4444" stroke-width="1"/>
      <text x="390" y="98" fill="#fee2e2" font-size="10" font-weight="bold">Linfonodo com Caseificação</text>
      <text x="390" y="110" fill="#fecdd3" font-size="9">Necrose caseosa 'tipo queijo'</text>

      <line x1="520" y1="240" x2="650" y2="220" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4,4"/>
      <circle cx="520" cy="240" r="4" fill="#eab308"/>
      <rect x="650" y="200" width="140" height="35" rx="6" fill="#713f12" stroke="#eab308" stroke-width="1"/>
      <text x="660" y="218" fill="#fef08a" font-size="10" font-weight="bold">Tubérculo Calcificado</text>
      <text x="660" y="230" fill="#fef9c3" font-size="9">Grânulos amarelados</text>
    </g>
  </svg>
  `;

  return [
    {
      id: 'photo-tb-real',
      title: 'Fotografia Clínica Real: Exame Diagnóstico de Tuberculose em Búfalo',
      description: 'Inspeção e palpação de linfonodos cervicais e pré-escapulares em tronco de contenção durante teste tuberculínico cervical comparado (TCC).',
      stageOrLesion: 'Avaliação clínica para detecção de linfoadenopatia e nódulos reativos',
      anatomicalSite: 'Região cervical lateral e linfonodos pré-escapulares',
      imageDataUri: buffaloTbReal,
      isRealPhoto: true,
    },
    {
      id: 'photo-tb-1',
      title: 'Granulomas Tuberculóides Pulmonares em Búfalo',
      description: 'Linfonodo mediastínico aumentado com necrose caseosa amarelada e tubérculos disseminados no parênquima pulmonar.',
      stageOrLesion: 'Lesão primária crônica com calcificação e teste tuberculínico cervical comparado fortemente reagente',
      anatomicalSite: 'Lobo caudal pulmonar e linfonodos torácicos',
      imageDataUri: svgToDataUri(svg1),
      isRealPhoto: false,
    },
  ];
}

/**
 * Gera imagem de Fasciolose Hepática em Búfalo (Fasciola hepatica nos Ductos Biliares)
 */
export function getFasciolosisPhoto(): BuffaloDiseasePhoto[] {
  const svg1 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs>
      <radialGradient id="liverTissue" cx="45%" cy="40%" r="65%">
        <stop offset="0%" stop-color="#78350f"/>
        <stop offset="50%" stop-color="#451a03"/>
        <stop offset="100%" stop-color="#1c1917"/>
      </radialGradient>
      <linearGradient id="bileDuct" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="50%" stop-color="#84cc16"/>
        <stop offset="100%" stop-color="#15803d"/>
      </linearGradient>
      <linearGradient id="fasciolaBody" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fed7aa"/>
        <stop offset="40%" stop-color="#ea580c"/>
        <stop offset="80%" stop-color="#9a3412"/>
        <stop offset="100%" stop-color="#431407"/>
      </linearGradient>
    </defs>

    <rect width="800" height="600" fill="#0f172a"/>

    <!-- Parênquima Hepático Cirrótico de Búfalo de Várzea -->
    <path d="M 60 100 Q 420 50 720 120 Q 780 340 700 510 Q 400 560 100 480 Q 20 300 60 100 Z" fill="url(#liverTissue)" stroke="#b45309" stroke-width="2"/>

    <!-- Ductos Biliares Dilatados e Fibrosados ("Tubos de Cachimbo") -->
    <path d="M 140 180 Q 260 220 380 200 Q 520 180 640 240" stroke="#fef08a" stroke-width="22" stroke-linecap="round" fill="none" opacity="0.85"/>
    <path d="M 380 200 Q 440 320 520 440" stroke="#fef08a" stroke-width="18" stroke-linecap="round" fill="none" opacity="0.85"/>
    <path d="M 280 210 Q 260 340 220 420" stroke="#fef08a" stroke-width="16" stroke-linecap="round" fill="none" opacity="0.85"/>

    <!-- Espécimes de Fasciola hepatica Folhosas emergindo dos ductos -->
    <g>
      <!-- Verme 1 -->
      <path d="M 440 180 C 470 140, 530 150, 520 190 C 510 230, 430 220, 440 180 Z" fill="url(#fasciolaBody)" stroke="#7c2d12" stroke-width="1.5"/>
      <ellipse cx="450" cy="180" rx="3" ry="2" fill="#000"/> <!-- Ventosa oral -->

      <!-- Verme 2 -->
      <path d="M 320 200 C 350 160, 400 170, 390 220 C 375 250, 310 240, 320 200 Z" fill="url(#fasciolaBody)" stroke="#7c2d12" stroke-width="1.5"/>

      <!-- Verme 3 nos ductos inferiores -->
      <path d="M 460 350 C 490 310, 550 330, 530 380 C 500 420, 440 390, 460 350 Z" fill="url(#fasciolaBody)" stroke="#7c2d12" stroke-width="1.5"/>

      <!-- Verme 4 -->
      <path d="M 240 330 C 270 290, 320 300, 310 350 C 290 390, 230 370, 240 330 Z" fill="url(#fasciolaBody)" stroke="#7c2d12" stroke-width="1.5"/>
    </g>

    <!-- Legendas e Diagnóstico -->
    <g font-family="Arial, sans-serif">
      <rect x="30" y="30" width="370" height="75" rx="10" fill="#020617" fill-opacity="0.9" stroke="#84cc16" stroke-width="1.5"/>
      <text x="45" y="55" fill="#bef264" font-size="14" font-weight="bold">FASCIOLOSE HEPÁTICA BUBALINA</text>
      <text x="45" y="75" fill="#e2e8f0" font-size="11">Fasciola hepatica (Búfalos em Pastagens Alagadas/Várzeas)</text>
      <text x="45" y="92" fill="#cbd5e1" font-size="10">Colangite fibrosante, ectasia biliar, caquexia e edema submandibular</text>

      <line x1="480" y1="180" x2="620" y2="100" stroke="#bef264" stroke-width="1.5" stroke-dasharray="4,4"/>
      <circle cx="480" cy="180" r="4" fill="#bef264"/>
      <rect x="600" y="80" width="180" height="35" rx="6" fill="#365314" stroke="#bef264" stroke-width="1"/>
      <text x="610" y="98" fill="#ecfccb" font-size="10" font-weight="bold">Trematódeo Adulto (3cm)</text>
      <text x="610" y="110" fill="#d9f99d" font-size="9">Corpo folhoso no ducto biliar</text>
    </g>
  </svg>
  `;

  return [
    {
      id: 'photo-fasciola-real',
      title: 'Fotografia Patológica Real: Fasciolose Hepática em Búfalo de Várzea',
      description: 'Corte anatomopatológico de fígado com ductos biliares dilatados ("tubos de cachimbo") e vermes Fasciola hepatica.',
      stageOrLesion: 'Colangite crônica hiperplásica com fibrose periductal',
      anatomicalSite: 'Fígado e ductos biliares principais',
      imageDataUri: buffaloFasciolaReal,
      isRealPhoto: true,
    },
    {
      id: 'photo-fasciola-1',
      title: 'Esquema Vet-HD: Ciclo de Fasciola e Lesões Biliares',
      description: 'Corte hepático evidenciando colangite hiperplásica com espessamento calcificado dos ductos biliares e vermes adultos folhosos.',
      stageOrLesion: 'Infecção crônica em búfalo de várzea com cirrose biliar e anemia severa',
      anatomicalSite: 'Fígado e ductos biliares principais',
      imageDataUri: svgToDataUri(svg1),
      isRealPhoto: false,
    },
  ];
}

/**
 * Gera imagem de Tristeza Parasitária (Babesiose e Anaplasmose em Esfregaço e Mucosa Ictérica)
 */
export function getAnaplasmosisPhoto(): BuffaloDiseasePhoto[] {
  const svg1 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs>
      <radialGradient id="microField" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="60%" stop-color="#0369a1"/>
        <stop offset="100%" stop-color="#082f49"/>
      </radialGradient>
      <radialGradient id="erythrocyte" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#fda4af"/>
        <stop offset="50%" stop-color="#f43f5e"/>
        <stop offset="100%" stop-color="#9f1239"/>
      </radialGradient>
    </defs>

    <rect width="800" height="600" fill="#0f172a"/>

    <!-- Campo Óptico de Microscópio 1000x com Coloração Giemsa -->
    <circle cx="400" cy="300" r="260" fill="url(#microField)" stroke="#38bdf8" stroke-width="4"/>

    <!-- Hemácias no Esfregaço Sanguíneo com Corpúsculos de Anaplasma marginale na Periferia -->
    <g>
      <!-- Hemácia Central 1 -->
      <circle cx="340" cy="240" r="42" fill="url(#erythrocyte)" stroke="#be123c" stroke-width="2"/>
      <circle cx="376" cy="225" r="7" fill="#1e1b4b" stroke="#000" stroke-width="1.5"/> <!-- Anaplasma na margem -->

      <!-- Hemácia Central 2 com Piroplasmas em par de Babesia bigemina -->
      <circle cx="460" cy="250" r="45" fill="url(#erythrocyte)" stroke="#be123c" stroke-width="2"/>
      <path d="M 450 240 L 460 265 L 440 260 Z" fill="#4338ca" stroke="#312e81"/>
      <path d="M 470 240 L 460 265 L 480 260 Z" fill="#4338ca" stroke="#312e81"/>

      <!-- Outras hemácias infectadas -->
      <circle cx="260" cy="320" r="38" fill="url(#erythrocyte)"/>
      <circle cx="292" cy="310" r="6" fill="#1e1b4b"/> <!-- Anaplasma -->

      <circle cx="420" cy="360" r="44" fill="url(#erythrocyte)"/>
      <circle cx="458" cy="370" r="7" fill="#1e1b4b"/>

      <circle cx="530" cy="340" r="40" fill="url(#erythrocyte)"/>
      <circle cx="320" cy="400" r="39" fill="url(#erythrocyte)"/>
      <circle cx="240" cy="210" r="36" fill="url(#erythrocyte)"/>
      <circle cx="500" cy="180" r="38" fill="url(#erythrocyte)"/>
    </g>

    <!-- Legenda e Detalhes -->
    <g font-family="Arial, sans-serif">
      <rect x="30" y="30" width="370" height="75" rx="10" fill="#020617" fill-opacity="0.9" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="45" y="55" fill="#7dd3fc" font-size="14" font-weight="bold">TRISTEZA PARASITÁRIA BUBALINA</text>
      <text x="45" y="75" fill="#e2e8f0" font-size="11">Anaplasma marginale &amp; Babesia bigemina (1000x Óleo)</text>
      <text x="45" y="92" fill="#cbd5e1" font-size="10">Febre > 41°C, icterícia de mucosas, hemoglobinúria e anemia</text>

      <line x1="376" y1="225" x2="220" y2="150" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="4,4"/>
      <circle cx="376" cy="225" r="4" fill="#f43f5e"/>
      <rect x="120" y="130" width="160" height="35" rx="6" fill="#881337" stroke="#f43f5e" stroke-width="1"/>
      <text x="130" y="148" fill="#ffe4e6" font-size="10" font-weight="bold">Anaplasma marginale</text>
      <text x="130" y="160" fill="#fecdd3" font-size="9">Inclusão na margem da hemácia</text>
    </g>
  </svg>
  `;

  return [
    {
      id: 'photo-tpb-real',
      title: 'Fotografia Clínica Real: Icterícia de Mucosa Ocular e Anemia em Búfalo (TPB)',
      description: 'Inspeção clínica de mucosa ocular conjuntival em búfalo demonstrando palidez severa por lise de eritrócitos e subicterícia característica de TPB.',
      stageOrLesion: 'Anemia hemolítica aguda por Anaplasma marginale / Babesia com mucosa pálida e febre',
      anatomicalSite: 'Mucosa conjuntival e mucosa oral de búfalo',
      imageDataUri: buffaloTpbReal,
      isRealPhoto: true,
    },
    {
      id: 'photo-tpb-1',
      title: 'Micrografia Óptica de Anaplasmose e Babesiose em Búfalo',
      description: 'Esfregaço de ponta de cauda corado por Giemsa revelando corpúsculos marginais de Anaplasma e pares piriformes de Babesia em hemácias.',
      stageOrLesion: 'Anemia hemolítica aguda com hematócrito abaixo de 18% e icterícia mucosa',
      anatomicalSite: 'Sangue periférico / Tecido hematopoiético',
      imageDataUri: svgToDataUri(svg1),
      isRealPhoto: false,
    },
  ];
}

/**
 * Gera imagem de Clostridiose / Carbúnculo Sintomático (Mionecrose e Enfisema Crepitante)
 */
export function getClostridiosisPhoto(): BuffaloDiseasePhoto[] {
  const svg1 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs>
      <radialGradient id="muscleNecrosis" cx="40%" cy="40%" r="65%">
        <stop offset="0%" stop-color="#450a0a"/>
        <stop offset="50%" stop-color="#18181b"/>
        <stop offset="100%" stop-color="#000000"/>
      </radialGradient>
    </defs>

    <rect width="800" height="600" fill="#0f172a"/>

    <!-- Massa Muscular da Garupa / Coxa de Búfalo com Mionecrose Enfisematosa -->
    <path d="M 100 120 Q 400 80 700 140 L 740 480 Q 420 540 80 460 Z" fill="url(#muscleNecrosis)" stroke="#7f1d1d" stroke-width="3"/>

    <!-- Bolhas de Gás (Enfisema Crepitante) no Tecido Muscular Necrótico -->
    <g fill="#fef08a" opacity="0.85">
      <circle cx="280" cy="240" r="16" stroke="#ca8a04" stroke-width="1.5"/>
      <circle cx="320" cy="270" r="22" stroke="#ca8a04" stroke-width="2"/>
      <circle cx="360" cy="230" r="14" stroke="#ca8a04" stroke-width="1.5"/>
      <circle cx="440" cy="290" r="25" stroke="#ca8a04" stroke-width="2"/>
      <circle cx="500" cy="250" r="18" stroke="#ca8a04" stroke-width="1.5"/>
      <circle cx="420" cy="370" r="20" stroke="#ca8a04" stroke-width="2"/>
      <circle cx="250" cy="340" r="15" stroke="#ca8a04" stroke-width="1.5"/>
    </g>

    <!-- Fibras Musculares Encharcadas em Exsudato Escuro com Cheiro de Manteiga Rançosa -->
    <path d="M 180 200 Q 320 280 480 220" stroke="#991b1b" stroke-width="8" fill="none" opacity="0.75"/>
    <path d="M 220 360 Q 420 400 620 340" stroke="#991b1b" stroke-width="8" fill="none" opacity="0.75"/>

    <!-- Callouts e Legendas -->
    <g font-family="Arial, sans-serif">
      <rect x="30" y="30" width="370" height="75" rx="10" fill="#020617" fill-opacity="0.9" stroke="#ef4444" stroke-width="1.5"/>
      <text x="45" y="55" fill="#fca5a5" font-size="14" font-weight="bold">CARBÚNCULO SINTOMÁTICO (MANQUEIRA)</text>
      <text x="45" y="75" fill="#e2e8f0" font-size="11">Clostridium chauvoei (Mionecrose Aguda Fulminante)</text>
      <text x="45" y="92" fill="#cbd5e1" font-size="10">Músculo escurecido com bolhas de gás, crepitação e morte súbita</text>

      <line x1="320" y1="270" x2="200" y2="440" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,4"/>
      <circle cx="320" cy="270" r="4" fill="#f59e0b"/>
      <rect x="120" y="450" width="180" height="35" rx="6" fill="#78350f" stroke="#f59e0b" stroke-width="1"/>
      <text x="130" y="468" fill="#fef3c7" font-size="10" font-weight="bold">Bolhas de Gás Enfisematoso</text>
      <text x="130" y="480" fill="#fde68a" font-size="9">Crepitação à palpação</text>
    </g>
  </svg>
  `;

  return [
    {
      id: 'photo-clostridium-real',
      title: 'Fotografia Clínica Real: Mionecrose Enfisematosa por Clostridium',
      description: 'Massa muscular escura, crepitante e com bolhas de gás provocadas por toxinas necróticas de Clostridium chauvoei.',
      stageOrLesion: 'Mionecrose gangrenosa aguda com edema e crepitação',
      anatomicalSite: 'Massas musculares da coxa e espádua',
      imageDataUri: buffaloBlacklegReal,
      isRealPhoto: true,
    },
    {
      id: 'photo-clostridium-1',
      title: 'Esquema Vet-HD: Patogenia do Carbúnculo Sintomático',
      description: 'Massa muscular da coxa esponjosa e enegrecida devido à produção de gás e toxinas necróticas bacterianas.',
      stageOrLesion: 'Lesão necrótica hemorrágica clássica em bubalino jovem com óbito em menos de 24 horas',
      anatomicalSite: 'Grandes massas musculares (quadríceps femoral e anconeu)',
      imageDataUri: svgToDataUri(svg1),
      isRealPhoto: false,
    },
  ];
}

/**
 * Gera imagem de Leptospirose Bubalina (Hemoglobinúria / Urina Vermelho-Escura e Icterícia)
 */
export function getLeptospirosisPhoto(): BuffaloDiseasePhoto[] {
  const svg1 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs>
      <radialGradient id="urineGrad" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#e11d48"/>
        <stop offset="40%" stop-color="#881337"/>
        <stop offset="80%" stop-color="#4c0519"/>
        <stop offset="100%" stop-color="#1c1917"/>
      </radialGradient>
    </defs>

    <rect width="800" height="600" fill="#0f172a"/>

    <!-- Tubo Coletor / Cálice de Urina com Hemoglobinúria Marcada ("Urina Cor de Vinho/Coca-Cola") -->
    <g transform="translate(180, 80)">
      <!-- Tubo de ensaio / Frasco de coleta graduado -->
      <path d="M 120 40 L 120 380 Q 120 440 220 440 Q 320 440 320 380 L 320 40 Z" fill="#1e293b" opacity="0.6" stroke="#94a3b8" stroke-width="3"/>
      
      <!-- Nível da Urina Hemoglobinúrica com Leptospira -->
      <path d="M 124 160 L 124 380 Q 124 436 220 436 Q 316 436 316 380 L 316 160 Z" fill="url(#urineGrad)" stroke="#f43f5e" stroke-width="2"/>
      <ellipse cx="220" cy="160" rx="96" ry="15" fill="#f43f5e" opacity="0.8"/>

      <!-- Menisco e Graduação do Frasco -->
      <line x1="120" y1="220" x2="160" y2="220" stroke="#f8fafc" stroke-width="2"/>
      <line x1="120" y1="280" x2="160" y2="280" stroke="#f8fafc" stroke-width="2"/>
      <line x1="120" y1="340" x2="160" y2="340" stroke="#f8fafc" stroke-width="2"/>
    </g>

    <!-- Visualização de Leptospira interrogans em Espiroqueta em Microscopia de Campo Escuro -->
    <g transform="translate(560, 320)">
      <circle cx="0" cy="0" r="110" fill="#020617" stroke="#fbbf24" stroke-width="3"/>
      <!-- Espiroqueta espiralada com ganchos terminais -->
      <path d="M -60 -40 Q -40 -60 -20 -40 T 20 -40 T 60 -40" stroke="#fef08a" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M -50 20 Q -30 0 -10 20 T 30 20 T 70 20" stroke="#fef08a" stroke-width="4" fill="none" stroke-linecap="round"/>
      <text x="-65" y="80" fill="#fde047" font-size="11" font-weight="bold" font-family="Arial">Leptospira sp. (Ganchos)</text>
    </g>

    <!-- Legenda e Detalhes -->
    <g font-family="Arial, sans-serif">
      <rect x="30" y="30" width="370" height="75" rx="10" fill="#020617" fill-opacity="0.9" stroke="#f43f5e" stroke-width="1.5"/>
      <text x="45" y="55" fill="#fda4af" font-size="14" font-weight="bold">LEPTOSPIROSE BUBALINA: SINAIS</text>
      <text x="45" y="75" fill="#e2e8f0" font-size="11">Leptospira interrogans (Zoonose de Águas Paradas)</text>
      <text x="45" y="92" fill="#cbd5e1" font-size="10">Hemoglobinúria severa, abortamentos no terço médio e nefrite</text>
    </g>
  </svg>
  `;

  return [
    {
      id: 'photo-lepto-real',
      title: 'Fotografia Clínica Real: Exame Clínico e Diagnóstico de Leptospirose em Búfala',
      description: 'Avaliação clínica e monitoramento de temperatura, urina e mucosa em búfala adulta com suspeita de surto por Leptospira interrogans.',
      stageOrLesion: 'Sintomas de febre, queda abrupta na produção leiteira e agalaxia com urina escura',
      anatomicalSite: 'Exame clínico geral em tronco de contenção de búfalas',
      imageDataUri: buffaloLeptoReal,
      isRealPhoto: true,
    },
    {
      id: 'photo-leptospira-1',
      title: 'Hemoglobinúria Maciça em Búfala por Leptospirose',
      description: 'Amostra de urina com coloração avermelhada/vinho devido à destruição intravascular de eritrócitos e lesão glomerular.',
      stageOrLesion: 'Fase aguda com febre, agalaxia súbita com leite espesso/sanguinolento e teste SAM reagente',
      anatomicalSite: 'Aparelho urinário (rins e bexiga) e circulação sistêmica',
      imageDataUri: svgToDataUri(svg1),
      isRealPhoto: false,
    },
  ];
}

/**
 * Gera imagem de Eimeriose / Coccidiose Neonatal em Bezerro Bubalino
 */
export function getCoccidiosisPhoto(): BuffaloDiseasePhoto[] {
  const svg1 = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs>
      <radialGradient id="colonTissue" cx="45%" cy="40%" r="65%">
        <stop offset="0%" stop-color="#dc2626"/>
        <stop offset="40%" stop-color="#991b1b"/>
        <stop offset="80%" stop-color="#450a0a"/>
        <stop offset="100%" stop-color="#18181b"/>
      </radialGradient>
      <radialGradient id="oocystGrad" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#fef9c3"/>
        <stop offset="50%" stop-color="#ca8a04"/>
        <stop offset="100%" stop-color="#713f12"/>
      </radialGradient>
    </defs>

    <rect width="800" height="600" fill="#0f172a"/>

    <!-- Mucosa do Cólon e Ceco com Enterite Difusa Hemorrágica e Pseudomembranas Fibrinosas -->
    <path d="M 80 120 C 260 60, 540 80, 720 140 C 760 300, 700 480, 620 520 C 420 560, 200 520, 80 440 Z" fill="url(#colonTissue)" stroke="#b91c1c" stroke-width="3"/>

    <!-- Placas de Fibrina e Ulcerações com Sangue Coagulado -->
    <path d="M 160 220 Q 320 280 480 200" stroke="#fef08a" stroke-width="12" fill="none" opacity="0.75" stroke-linecap="round"/>
    <path d="M 280 340 Q 420 380 580 300" stroke="#fef08a" stroke-width="10" fill="none" opacity="0.8" stroke-linecap="round"/>
    <ellipse cx="380" cy="300" rx="60" ry="30" fill="#450a0a"/>

    <!-- Micrografia Inset: Oocistos de Eimeria bareillyi / E. zuernii -->
    <g transform="translate(600, 360)">
      <circle cx="0" cy="0" r="100" fill="#020617" stroke="#fbbf24" stroke-width="3"/>
      <!-- Oocisto oval com micrópila -->
      <ellipse cx="-20" cy="-20" rx="35" ry="48" fill="url(#oocystGrad)" stroke="#fef08a" stroke-width="2"/>
      <circle cx="-20" cy="-20" r="14" fill="#854d0e"/>
      <ellipse cx="35" cy="25" rx="30" ry="42" fill="url(#oocystGrad)" stroke="#fef08a" stroke-width="2"/>
      <circle cx="35" cy="25" r="12" fill="#854d0e"/>
      <text x="-70" y="75" fill="#fde047" font-size="10" font-weight="bold" font-family="Arial">Oocistos Eimeria (400x)</text>
    </g>

    <!-- Legenda e Detalhes -->
    <g font-family="Arial, sans-serif">
      <rect x="30" y="30" width="370" height="75" rx="10" fill="#020617" fill-opacity="0.9" stroke="#ef4444" stroke-width="1.5"/>
      <text x="45" y="55" fill="#fca5a5" font-size="14" font-weight="bold">EIMERIOSE / COCCIDIOSE EM BEZERRO</text>
      <text x="45" y="75" fill="#e2e8f0" font-size="11">Eimeria bareillyi &amp; E. zuernii (Bezerros de 1 a 6 meses)</text>
      <text x="45" y="92" fill="#cbd5e1" font-size="10">Diarreia fétida com coágulos de sangue fresco, tenesmo e desidratação</text>
    </g>
  </svg>
  `;

  return [
    {
      id: 'photo-coccidia-real',
      title: 'Fotografia Clínica Real: Bezerro Bubalino com Coccidiose Neonatal',
      description: 'Bezerro búfalo em baia de enfermaria apresentando prostração, fezes diarreicas e desidratação clínica por Eimeria bareillyi.',
      stageOrLesion: 'Diarreia profusa, dor abdominal, desidratação e curso de sangue',
      anatomicalSite: 'Bezerreiro / Trato gastrointestinal posterior',
      imageDataUri: buffaloCocciReal,
      isRealPhoto: true,
    },
    {
      id: 'photo-coccidia-1',
      title: 'Tiflocolite Hemorrágica por Eimeria em Bezerro Bubalino',
      description: 'Mucosa do ceco e cólon intensamente hemorrágica com desprendimento epitelial e presença massiva de oocistos.',
      stageOrLesion: 'Diarreia com estrias de sangue e fibrina associada a alta densidade de animais em piquete maternidade',
      anatomicalSite: 'Ceco, cólon espiral e reto',
      imageDataUri: svgToDataUri(svg1),
      isRealPhoto: false,
    },
  ];
}

/**
 * Retorna fotos offline para qualquer doença pelo ID ou categoria
 */
export function getPhotosForDisease(diseaseId: string): BuffaloDiseasePhoto[] {
  switch (diseaseId) {
    case 'dis-01':
      return getMastitisPhoto();
    case 'dis-02':
      return getBrucellosisPhoto();
    case 'dis-03':
      return getTuberculosisPhoto();
    case 'dis-04':
      return getFootRotPhoto();
    case 'dis-05':
      return getToxocaraPhoto();
    case 'dis-06':
      return getLousePhoto();
    case 'dis-07':
      return getThermalStressPhoto();
    case 'dis-08':
      return getPasteurellosisPhoto();
    case 'dis-09':
      return getFasciolosisPhoto();
    case 'dis-10':
      return getAnaplasmosisPhoto();
    case 'dis-11':
      return getLeptospirosisPhoto();
    case 'dis-12':
      return getClostridiosisPhoto();
    case 'dis-13':
      return getCoccidiosisPhoto();
    default:
      if (diseaseId.includes('mastit')) return getMastitisPhoto();
      if (diseaseId.includes('tb') || diseaseId.includes('tuberculo')) return getTuberculosisPhoto();
      if (diseaseId.includes('fasciol') || diseaseId.includes('figado')) return getFasciolosisPhoto();
      if (diseaseId.includes('anaplasma') || diseaseId.includes('tristeza') || diseaseId.includes('babesi')) return getAnaplasmosisPhoto();
      if (diseaseId.includes('clostrid') || diseaseId.includes('carbunculo') || diseaseId.includes('manqueira')) return getClostridiosisPhoto();
      if (diseaseId.includes('lepto')) return getLeptospirosisPhoto();
      if (diseaseId.includes('cocci') || diseaseId.includes('eimeria')) return getCoccidiosisPhoto();
      if (diseaseId.includes('podal') || diseaseId.includes('casco') || diseaseId.includes('foot')) return getFootRotPhoto();
      if (diseaseId.includes('toxocara') || diseaseId.includes('verme')) return getToxocaraPhoto();
      if (diseaseId.includes('piolho') || diseaseId.includes('parasit')) return getLousePhoto();
      if (diseaseId.includes('termic') || diseaseId.includes('calor')) return getThermalStressPhoto();
      if (diseaseId.includes('pasteurel') || diseaseId.includes('barbone') || diseaseId.includes('respirat')) return getPasteurellosisPhoto();
      if (diseaseId.includes('brucel')) return getBrucellosisPhoto();
      return getMastitisPhoto();
  }
}

export interface BuffaloRealPhotoItem {
  diseaseId: string;
  diseaseName: string;
  popularName: string;
  category: string;
  zoonotic: boolean;
  photo: BuffaloDiseasePhoto;
}

/**
 * Retorna todas as 13 fotografias clínicas reais de campo dos búfalos
 * 100% integradas e disponíveis offline, sem necessidade de internet.
 */
export function getAllBuffaloDiseaseRealPhotos(): BuffaloRealPhotoItem[] {
  const list: { id: string; name: string; popular: string; cat: string; zoonotic: boolean; fn: () => BuffaloDiseasePhoto[] }[] = [
    { id: 'dis-01', name: 'Mastite Bubalina (Clínica e Subclínica)', popular: 'Inflamação do Úbere / Peito Empedrado', cat: 'Reprodutiva / Glândula Mamária', zoonotic: false, fn: getMastitisPhoto },
    { id: 'dis-02', name: 'Brucelose Bubalina (Bursite e Higroma Carpal)', popular: 'Mal de Canga / Aborto Infeccioso', cat: 'Reprodutiva / Zoonose', zoonotic: true, fn: getBrucellosisPhoto },
    { id: 'dis-03', name: 'Tuberculose Bubalina (Mycobacterium bovis)', popular: 'Tísica / Peste Branca Bubalina', cat: 'Respiratória / Zoonose Crítica', zoonotic: true, fn: getTuberculosisPhoto },
    { id: 'dis-04', name: 'Pododermatite Infecciosa Bubalina', popular: 'Manqueira dos Pés / Gabarro / Podridão dos Cascos', cat: 'Podal (Cascos)', zoonotic: false, fn: getFootRotPhoto },
    { id: 'dis-05', name: 'Toxocaríase Neonatal Bubalina', popular: 'Ascaridíase / Bicha de Bezerro', cat: 'Parasitária Gastrointestinal', zoonotic: true, fn: getToxocaraPhoto },
    { id: 'dis-06', name: 'Infestação por Piolho do Búfalo', popular: 'Piolheira / Haematopinus tuberculatus', cat: 'Ectoparasitária (Pele)', zoonotic: false, fn: getLousePhoto },
    { id: 'dis-07', name: 'Estresse Térmico por Calor e Insolação', popular: 'Hipertermia / Falta de Banho de Lama', cat: 'Metabólica / Ambiência', zoonotic: false, fn: getThermalStressPhoto },
    { id: 'dis-08', name: 'Septicemia Hemorrágica (Barbone / Pasteurelose)', popular: 'Barbone Bubalino / Inchaço da Garganta', cat: 'Infecciosa Aguda / Respiratória', zoonotic: false, fn: getPasteurellosisPhoto },
    { id: 'dis-09', name: 'Fasciolose Hepática em Búfalo', popular: 'Baratinha do Fígado / Sagüaça', cat: 'Parasitária Hepática', zoonotic: true, fn: getFasciolosisPhoto },
    { id: 'dis-10', name: 'Tristeza Parasitária Bubalina (TPB)', popular: 'Amarelão / Anaplasmose / Babesiose', cat: 'Parasitária Sanguínea', zoonotic: false, fn: getAnaplasmosisPhoto },
    { id: 'dis-11', name: 'Leptospirose Bubalina', popular: 'Urina Vermelha / Hemoglobinúria', cat: 'Infecciosa Renal / Zoonose', zoonotic: true, fn: getLeptospirosisPhoto },
    { id: 'dis-12', name: 'Clostridiose / Carbúnculo Sintomático', popular: 'Manqueira / Perna Preta / Blackleg', cat: 'Infecciosa Clostridial', zoonotic: false, fn: getClostridiosisPhoto },
    { id: 'dis-13', name: 'Eimeriose / Coccidiose Neonatal em Bezerro', popular: 'Curso Negro / Diarreia de Sangue', cat: 'Parasitária Neonatal', zoonotic: false, fn: getCoccidiosisPhoto },
  ];

  const results: BuffaloRealPhotoItem[] = [];
  list.forEach(item => {
    const photos = item.fn();
    const real = photos.find(p => p.isRealPhoto) || photos[0];
    if (real) {
      results.push({
        diseaseId: item.id,
        diseaseName: item.name,
        popularName: item.popular,
        category: item.cat,
        zoonotic: item.zoonotic,
        photo: real,
      });
    }
  });

  return results;
}


