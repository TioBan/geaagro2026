/**
 * Offline Clinical Imagery & Diagnostic Anatomy for Equine Diseases Guide
 * 100% Standalone - Zero external internet network dependencies.
 */

export interface EquineDiseaseImageData {
  id: string;
  title: string;
  clinicalSignLabel: string;
  imageAlt: string;
  realPhotoUrl: string;
  realPhotoCaption: string;
  svgDataUri: string;
  anatomicalLocation: string;
  keyFindings: string[];
}

// Inline standalone SVG data URIs with rich clinical illustrations & medical callouts
export const EQUINE_DISEASE_IMAGES: Record<string, EquineDiseaseImageData> = {
  'dis-colica': {
    id: 'dis-colica',
    title: 'Síndrome Cólica (Abdômen Agudo)',
    clinicalSignLabel: 'Postura de dor visceral, olhar frequente para os flancos e distensão cecal',
    imageAlt: 'Fotografia clínica real de equino com dor abdominal aguda de cólica olhando para os flancos',
    realPhotoUrl: '/equine_colica_real.jpg',
    realPhotoCaption: 'Fotografia Clínica Real: Equino em baia apresentando dor abdominal aguda de cólica, postura inquieta e olhar direcionado para a fossa do flanco.',
    anatomicalLocation: 'Trato Gastrointestinal (Cólon Maior, Ceco e Jejuno)',
    keyFindings: [
      'Atitude de escavar o solo e olhar repetidamente para a fossa do flanco',
      'Distensão do cólon ascendente com timpanismo e hipomotilidade auscultatória',
      'Sudorese profusa em tábua do pescoço e flancos com taquicardia (>60 bpm)',
      'Adoção de decúbito lateral prolongado com tentativas de rolar violentamente'
    ],
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
      <defs>
        <linearGradient id="colicBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%23291811" />
          <stop offset="50%" stop-color="%231a100b" />
          <stop offset="100%" stop-color="%230d0705" />
        </linearGradient>
        <radialGradient id="painGlow" cx="55%" cy="58%" r="35%">
          <stop offset="0%" stop-color="%23ef4444" stop-opacity="0.6" />
          <stop offset="60%" stop-color="%23b91c1c" stop-opacity="0.2" />
          <stop offset="100%" stop-color="%23000000" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="horseSkin" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="%2378350f" />
          <stop offset="50%" stop-color="%2392400e" />
          <stop offset="100%" stop-color="%235c2409" />
        </linearGradient>
      </defs>
      
      <!-- Background Field & Baia -->
      <rect width="800" height="500" fill="url(%23colicBg)" />
      <path d="M 0 380 Q 400 370 800 380 L 800 500 L 0 500 Z" fill="%231c1917" />
      <path d="M 0 420 Q 400 405 800 420 L 800 500 L 0 500 Z" fill="%23292524" opacity="0.6" />
      
      <!-- Visceral Pain Zone Flare -->
      <circle cx="440" cy="270" r="140" fill="url(%23painGlow)" />
      
      <!-- Equine Silhouette in Colic Stance (Looking Back at Flank) -->
      <g transform="translate(100, 110)">
        <!-- Legs Back -->
        <path d="M 390 180 L 410 290 L 400 300 L 380 295 L 370 190 Z" fill="%23451a03" />
        <path d="M 120 170 L 110 285 L 125 295 L 140 285 L 145 170 Z" fill="%23451a03" />
        
        <!-- Horse Body & Flank Contours -->
        <path d="M 110 160 Q 150 110 240 120 Q 320 115 370 140 Q 420 170 410 220 Q 390 270 330 260 Q 230 275 140 240 Q 100 200 110 160 Z" fill="url(%23horseSkin)" stroke="%23b45309" stroke-width="2" />
        
        <!-- Tail -->
        <path d="M 405 180 Q 440 240 430 310 Q 415 280 400 220 Z" fill="%23291307" />
        
        <!-- Forelegs (Restless Pawing) -->
        <path d="M 140 180 L 160 285 L 180 295 L 185 280 L 165 180 Z" fill="%2378350f" />
        <path d="M 340 190 L 350 285 L 365 295 L 375 285 L 360 190 Z" fill="%2378350f" />
        
        <!-- Neck Arching Back to Look at Abdomen -->
        <path d="M 130 140 Q 160 90 220 110 Q 250 125 250 160 Q 220 170 180 160 Z" fill="%2392400e" stroke="%23b45309" stroke-width="1.5" />
        
        <!-- Head Turned Toward Flank -->
        <path d="M 230 130 Q 270 145 280 180 Q 260 200 230 180 Q 220 150 230 130 Z" fill="%2378350f" stroke="%23d97706" stroke-width="2" />
        <polygon points="235,130 245,105 255,132" fill="%235c2409" />
        <!-- Distressed Eye -->
        <circle cx="250" cy="150" r="3.5" fill="%23fef08a" />
        <circle cx="250" cy="150" r="2" fill="%23000000" />
        
        <!-- Intestinal Scheme Overlay (GI tract spasm & distension) -->
        <g opacity="0.85">
          <!-- Cecum and Large Colon distension -->
          <path d="M 280 210 Q 320 190 350 220 Q 340 255 290 245 Q 260 235 280 210 Z" fill="%23ef4444" fill-opacity="0.4" stroke="%23f87171" stroke-width="2.5" stroke-dasharray="4 2" />
          <path d="M 295 225 Q 315 205 330 225 Q 320 245 300 235 Z" fill="%23b91c1c" fill-opacity="0.6" stroke="%23fca5a5" stroke-width="1.5" />
          <!-- Spasm Waves -->
          <circle cx="315" cy="225" r="28" fill="none" stroke="%23ef4444" stroke-width="2" opacity="0.8" />
          <circle cx="315" cy="225" r="42" fill="none" stroke="%23f87171" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6" />
        </g>
      </g>
      
      <!-- Diagnostic Callout Badges -->
      <g transform="translate(480, 50)">
        <rect width="280" height="90" rx="14" fill="%231e1b18" fill-opacity="0.9" stroke="%23ef4444" stroke-width="1.5" />
        <circle cx="24" cy="28" r="8" fill="%23ef4444" />
        <text x="24" y="32" fill="%23ffffff" font-size="11" font-weight="900" text-anchor="middle">!</text>
        <text x="42" y="26" fill="%23ffffff" font-size="13" font-family="sans-serif" font-weight="bold">Sinais Críticos de Cólica</text>
        <text x="42" y="44" fill="%23fca5a5" font-size="10.5" font-family="sans-serif">• Auscultação: Hipomotilidade / Silêncio</text>
        <text x="42" y="60" fill="%23fca5a5" font-size="10.5" font-family="sans-serif">• FC elevada (>60 bpm) + Sudorese</text>
        <text x="42" y="76" fill="%23fca5a5" font-size="10.5" font-family="sans-serif">• Risco de torção e refluxo gástrico</text>
      </g>
      
      <!-- Bottom Medical Badge -->
      <rect x="30" y="440" width="360" height="36" rx="10" fill="%230f172a" fill-opacity="0.85" stroke="%2338bdf8" stroke-width="1" />
      <text x="45" y="463" fill="%2338bdf8" font-size="12" font-family="sans-serif" font-weight="bold">🔬 Exame Clínico: Sondagem Nasogástrica Imediata</text>
    </svg>`
  },

  'dis-laminite': {
    id: 'dis-laminite',
    title: 'Laminite Equina & Rotação de P3',
    clinicalSignLabel: 'Postura de alívio nos talões e perda do paralelismo da 3ª falange (P3)',
    imageAlt: 'Fotografia clínica real de equino com laminite adotando postura de alívio nos talões',
    realPhotoUrl: '/equine_laminite_real.jpg',
    realPhotoCaption: 'Fotografia Clínica Real: Posição antálgica clássica de laminite (aguamento), com membros anteriores estendidos à frente para aliviar a pressão nas pinças dos cascos.',
    anatomicalLocation: 'Dígito Equino (Muralha, Lâminas Dérmicas/Epidérmicas e Falange Distal)',
    keyFindings: [
      'Adoção da "postura de cavalete invertido" com membros anteriores projetados à frente',
      'Aumento da amplitude do pulso digital nas artérias digitais palmares/plantares com calor local',
      'Descolamento das lâminas do estojo córneo com rotação da ponta de P3 em direção à sola',
      'Espessamento da linha branca e sensibilidade aguda na pinça ao teste de sonda/pinça de casco'
    ],
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
      <defs>
        <linearGradient id="lamiBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%23091e14" />
          <stop offset="50%" stop-color="%2306120d" />
          <stop offset="100%" stop-color="%23020604" />
        </linearGradient>
        <linearGradient id="hoofWall" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="%231e293b" />
          <stop offset="50%" stop-color="%23334155" />
          <stop offset="100%" stop-color="%230f172a" />
        </linearGradient>
        <linearGradient id="boneP3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%23f8fafc" />
          <stop offset="50%" stop-color="%23e2e8f0" />
          <stop offset="100%" stop-color="%2394a3b8" />
        </linearGradient>
      </defs>
      
      <rect width="800" height="500" fill="url(%23lamiBg)" />
      
      <!-- Clinical Stance (Silhouette Left Side) -->
      <g transform="translate(40, 60)">
        <rect width="320" height="390" rx="18" fill="%230f172a" fill-opacity="0.8" stroke="%2310b981" stroke-width="1.5" />
        <text x="20" y="32" fill="%2334d399" font-size="13" font-family="sans-serif" font-weight="bold">1. Postura Típica de Alívio</text>
        <text x="20" y="50" fill="%2394a3b8" font-size="11" font-family="sans-serif">Membros anteriores à frente descarregando peso nos talões</text>
        
        <!-- Horse in Laminitic Posture -->
        <g transform="translate(20, 70)">
          <!-- Ground -->
          <line x1="0" y1="260" x2="280" y2="260" stroke="%23334155" stroke-width="2" />
          
          <!-- Horse Back/Body -->
          <path d="M 60 120 Q 120 90 200 110 Q 230 140 220 180 Q 190 210 120 200 Q 70 180 60 120 Z" fill="%235c2409" stroke="%2378350f" />
          <!-- Head/Neck Upright in Pain -->
          <path d="M 60 120 Q 40 80 50 40 Q 70 30 85 50 Q 80 90 100 120 Z" fill="%2378350f" />
          <!-- Hind legs tucked underneath abdomen -->
          <path d="M 210 160 L 160 230 L 150 260 L 165 260 L 180 230 L 225 170 Z" fill="%23451a03" />
          <!-- Forelegs extended far forward (rocked back on heels) -->
          <path d="M 80 160 L 40 230 L 15 260 L 35 260 L 60 230 L 100 160 Z" fill="%2378350f" stroke="%23ef4444" stroke-width="1.5" />
          
          <!-- Weight Vector Arrow (Heels) -->
          <path d="M 25 240 L 25 210" stroke="%23ef4444" stroke-width="2.5" marker-end="url(%23arrow)" />
          <text x="35" y="225" fill="%23f87171" font-size="10" font-weight="bold">Sobrecarga nos Talões</text>
        </g>
      </g>
      
      <!-- Sagittal Radiographic Cross-Section (Right Side) -->
      <g transform="translate(390, 60)">
        <rect width="370" height="390" rx="18" fill="%23020617" fill-opacity="0.95" stroke="%23ef4444" stroke-width="1.5" />
        <text x="20" y="32" fill="%23f87171" font-size="13" font-family="sans-serif" font-weight="bold">2. Radiografia & Rotação de P3 (3ª Falange)</text>
        <text x="20" y="50" fill="%23cbd5e1" font-size="11" font-family="sans-serif">Perda de paralelismo entre muralha dorsal e osso P3</text>
        
        <!-- Hoof Sagittal Schema -->
        <g transform="translate(60, 80)">
          <!-- Hoof Wall External Profile -->
          <path d="M 60 40 L 0 220 L 190 220 L 180 160 L 140 40 Z" fill="url(%23hoofWall)" stroke="%2364748b" stroke-width="2" />
          
          <!-- Sole & Frog -->
          <path d="M 0 220 Q 90 205 190 220" stroke="%23475569" stroke-width="6" fill="none" />
          <path d="M 110 215 Q 140 180 170 218" fill="%23334155" stroke="%2364748b" stroke-width="1" />
          
          <!-- Inflamed Laminae (Red Band) -->
          <path d="M 62 48 L 12 212" stroke="%23ef4444" stroke-width="8" stroke-linecap="round" opacity="0.85" />
          <!-- Ischemic / Necrotic Micro-Tears -->
          <line x1="28" y1="120" x2="38" y2="124" stroke="%23fef08a" stroke-width="2" />
          <line x1="22" y1="150" x2="32" y2="154" stroke="%23fef08a" stroke-width="2" />
          <line x1="16" y1="180" x2="26" y2="184" stroke="%23fef08a" stroke-width="2" />
          
          <!-- Bone P2 (Segunda Falange) -->
          <path d="M 85 20 Q 110 15 130 35 L 115 80 Q 90 85 75 60 Z" fill="url(%23boneP3)" stroke="%2394a3b8" stroke-width="1.5" />
          
          <!-- Bone P3 (Rotated Third Phalanx) -->
          <!-- Normal would be parallel to muralha (slope ~45 deg). Rotated has tip pointing down to sole! -->
          <path d="M 70 85 L 140 110 L 120 175 L 30 195 Z" fill="url(%23boneP3)" stroke="%23ef4444" stroke-width="2.5" />
          
          <!-- Rotation Angle Line -->
          <line x1="56" y1="45" x2="2" y2="225" stroke="%2338bdf8" stroke-width="2" stroke-dasharray="4 2" />
          <line x1="68" y1="85" x2="28" y2="200" stroke="%23ef4444" stroke-width="2" />
          
          <!-- Sole penetration danger indicator -->
          <circle cx="30" cy="195" r="8" fill="%23ef4444" fill-opacity="0.4" />
          <circle cx="30" cy="195" r="4" fill="%23ef4444" />
          <text x="45" y="198" fill="%23fca5a5" font-size="10" font-weight="bold">Ponta de P3 (Pressão na Sola)</text>
          
          <!-- Digital Flexor Tendon pulling P3 downwards -->
          <path d="M 125 30 Q 155 100 135 160 L 120 175" fill="none" stroke="%23eab308" stroke-width="4" stroke-dasharray="2 2" />
          <text x="145" y="140" fill="%23fef08a" font-size="9.5">TFDP (Tração)</text>
        </g>
      </g>
      
      <!-- Diagnostic Footer -->
      <rect x="40" y="455" width="450" height="30" rx="8" fill="%230f172a" stroke="%2310b981" stroke-width="1" />
      <text x="55" y="475" fill="%2334d399" font-size="11.5" font-family="sans-serif" font-weight="bold">❄️ Protocolo de Emergência: Crioterapia Contínua (Gelo) nas Primeiras 48h</text>
    </svg>`
  },

  'dis-garrotilho': {
    id: 'dis-garrotilho',
    title: 'Garrotilho (Adenite Equina - Streptococcus equi)',
    clinicalSignLabel: 'Abscesso volumoso em linfonodo submandibular com supuração purulenta e secreção nasal',
    imageAlt: 'Fotografia clínica real de equino com garrotilho apresentando abscesso submandibular e corrimento purulento',
    realPhotoUrl: '/equine_garrotilho_real.jpg',
    realPhotoCaption: 'Fotografia Clínica Real: Aumento inflamatório agudo com abscesso submandibular e drenagem de secreção purulenta nasal por Streptococcus equi.',
    anatomicalLocation: 'Vias Aéreas Superiores & Linfonodos Submandibulares / Retrofaríngeos',
    keyFindings: [
      'Aumento de volume inflamatório doloroso no espaço intermandibular',
      'Maturação com ponto de flutuação e fistulização de exsudato purulento cremoso',
      'Corrimento nasal mucopurulento bilateral abundante',
      'Febre súbita (39.5 a 41.0°C), disfagia e tosse produtiva dolorosa'
    ],
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
      <defs>
        <linearGradient id="garrotilhoBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%231a1508" />
          <stop offset="50%" stop-color="%23120d04" />
          <stop offset="100%" stop-color="%23080502" />
        </linearGradient>
        <radialGradient id="abscessGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="%23facc15" />
          <stop offset="50%" stop-color="%23eab308" />
          <stop offset="100%" stop-color="%23a16207" />
        </radialGradient>
      </defs>
      
      <rect width="800" height="500" fill="url(%23garrotilhoBg)" />
      
      <!-- Horse Head in Profile -->
      <g transform="translate(60, 40)">
        <!-- Head Contour -->
        <path d="M 120 40 Q 220 50 340 160 L 460 270 Q 480 300 460 340 L 400 370 Q 360 380 320 340 L 260 310 Q 180 330 130 250 L 100 130 Z" fill="%2378350f" stroke="%2392400e" stroke-width="2" />
        
        <!-- Ears -->
        <polygon points="120,40 140,0 160,45" fill="%235c2409" stroke="%2392400e" />
        <polygon points="150,45 175,5 190,50" fill="%23451a03" />
        
        <!-- Eye with depression sign -->
        <circle cx="280" cy="150" r="14" fill="%231e293b" />
        <circle cx="280" cy="150" r="10" fill="%230f172a" />
        <circle cx="277" cy="147" r="3" fill="%23ffffff" />
        <path d="M 260 135 Q 280 130 300 140" stroke="%2392400e" stroke-width="3" fill="none" />
        
        <!-- Muzzle & Nostril with Purulent Nasal Discharge -->
        <ellipse cx="440" cy="330" rx="16" ry="10" fill="%231c1917" />
        <!-- Copious Purulent Discharge draining from nostril -->
        <path d="M 445 335 Q 460 370 455 410 Q 450 425 442 415 Q 440 375 435 340 Z" fill="%23fef08a" stroke="%23eab308" stroke-width="1.5" />
        <path d="M 450 360 Q 465 390 460 415" stroke="%23facc15" stroke-width="2" fill="none" />
        
        <!-- Submandibular Lymph Node Abscess (Classic Garrotilho) -->
        <g transform="translate(260, 270)">
          <!-- Swelling Halo -->
          <circle cx="45" cy="45" r="65" fill="%23ef4444" fill-opacity="0.25" />
          <circle cx="45" cy="45" r="50" fill="%23b45309" fill-opacity="0.5" />
          
          <!-- Abscess Mass with Fluctuation Core -->
          <ellipse cx="45" cy="45" rx="42" ry="36" fill="url(%23abscessGlow)" stroke="%23fef08a" stroke-width="2.5" />
          
          <!-- Rupture / Fistula Site with Draining Creamy Pus -->
          <circle cx="58" cy="55" r="6" fill="%23dc2626" />
          <path d="M 58 55 Q 65 95 62 140 Q 56 150 50 140 Q 52 95 55 58 Z" fill="%23fef9c3" stroke="%23facc15" stroke-width="1" />
          <circle cx="62" cy="148" r="4" fill="%23fef08a" />
          <circle cx="58" cy="160" r="3" fill="%23fef08a" />
        </g>
      </g>
      
      <!-- Diagnostic Callout Right Box -->
      <g transform="translate(490, 70)">
        <rect width="270" height="230" rx="16" fill="%231c1917" fill-opacity="0.9" stroke="%23eab308" stroke-width="1.5" />
        <text x="20" y="32" fill="%23facc15" font-size="14" font-family="sans-serif" font-weight="bold">Achados Patognomônicos</text>
        
        <text x="20" y="65" fill="%23fde047" font-size="11.5" font-weight="bold">1. Linfadenite Submandibular:</text>
        <text x="20" y="82" fill="%23d6d3d1" font-size="10.5">Aumento acentuado de volume com calor,</text>
        <text x="20" y="96" fill="%23d6d3d1" font-size="10.5">dor à palpação e supuração espessa.</text>
        
        <text x="20" y="125" fill="%23fde047" font-size="11.5" font-weight="bold">2. Corrimento Nasal Bilateral:</text>
        <text x="20" y="142" fill="%23d6d3d1" font-size="10.5">Exsudato mucopurulento amarelado</text>
        <text x="20" y="156" fill="%23d6d3d1" font-size="10.5">decorrente da infecção das vias aéreas.</text>
        
        <text x="20" y="185" fill="%23fde047" font-size="11.5" font-weight="bold">3. Febre & Prostração:</text>
        <text x="20" y="202" fill="%23d6d3d1" font-size="10.5">Picos febris de 40.0°C a 41.5°C.</text>
      </g>
      
      <!-- Bottom Warning -->
      <rect x="60" y="440" width="680" height="38" rx="10" fill="%23451a03" stroke="%23f59e0b" stroke-width="1" />
      <text x="80" y="464" fill="%23fef08a" font-size="12" font-family="sans-serif" font-weight="bold">⚠️ Biossegurança Máxima: Altamente contagioso entre animais jovens. Isolar baias e cochos.</text>
    </svg>`
  },

  'dis-tetano': {
    id: 'dis-tetano',
    title: 'Tétano Equino (Clostridium tetani)',
    clinicalSignLabel: 'Prolapso da terceira pálpebra, orelhas eretas rígidas e postura em cavalete',
    imageAlt: 'Fotografia clínica real de equino com tétano exibindo prolapso de terceira pálpebra e rigidez',
    realPhotoUrl: '/equine_tetano_real.jpg',
    realPhotoCaption: 'Fotografia Clínica Real: Expressão tetânica com prolapso espástico da terceira pálpebra, orelhas imóveis hiper-eretas e narinas dilatadas.',
    anatomicalLocation: 'Sistema Nervoso Central & Placa Motora / Musculatura Estriada',
    keyFindings: [
      'Prolapso patognomônico da terceira pálpebra (membrana nictitante) aos estímulos auditivos',
      'Hipertonia muscular generalizada com atitude em "cavalete de madeira"',
      'Trismo mandibular com incapacidade de apreensão e mastigação de alimentos',
      'Narinas dilatadas em trombeta, cauda erguida em bandeira e hiperexcitabilidade'
    ],
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
      <defs>
        <linearGradient id="tetanusBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%231e112a" />
          <stop offset="50%" stop-color="%2311091a" />
          <stop offset="100%" stop-color="%2307030a" />
        </linearGradient>
      </defs>
      
      <rect width="800" height="500" fill="url(%23tetanusBg)" />
      
      <!-- Equine Eye Detail (Prolapse of 3rd Eyelid) Left Box -->
      <g transform="translate(40, 50)">
        <rect width="330" height="380" rx="16" fill="%230f0a17" fill-opacity="0.9" stroke="%23c084fc" stroke-width="1.5" />
        <text x="20" y="32" fill="%23e9d5ff" font-size="13" font-family="sans-serif" font-weight="bold">1. Prolapso da Terceira Pálpebra</text>
        <text x="20" y="48" fill="%23a855f7" font-size="11">Membrana nictitante cobre a córnea ao menor estímulo</text>
        
        <!-- Eye Close-Up Drawing -->
        <g transform="translate(30, 75)">
          <!-- Eyelid Margins -->
          <path d="M 20 110 Q 130 30 240 110 Q 130 190 20 110 Z" fill="%23581c87" stroke="%239333ea" stroke-width="3" />
          <!-- Eyeball Sclera & Iris -->
          <circle cx="130" cy="110" r="55" fill="%231e1b4b" stroke="%236366f1" stroke-width="1.5" />
          <ellipse cx="130" cy="110" rx="35" ry="32" fill="%230f172a" />
          <circle cx="130" cy="110" r="20" fill="%23020617" />
          <circle cx="120" cy="100" r="5" fill="%23ffffff" />
          
          <!-- Prolapsed Third Eyelid (Membrana Nictitante Prolapso) -->
          <path d="M 20 110 Q 80 50 145 95 Q 110 160 20 110 Z" fill="%23f43f5e" fill-opacity="0.85" stroke="%23fda4af" stroke-width="2" />
          <text x="50" y="105" fill="%23ffffff" font-size="10.5" font-weight="900">3ª PÁLPEBRA</text>
          
          <!-- Stimulus Sound Waves -->
          <path d="M 245 80 Q 265 110 245 140" stroke="%23e879f9" stroke-width="2" fill="none" stroke-dasharray="3 3" />
          <path d="M 255 70 Q 280 110 255 150" stroke="%23e879f9" stroke-width="2" fill="none" />
        </g>
        
        <rect x="20" y="325" width="290" height="35" rx="8" fill="%233b0764" />
        <text x="30" y="347" fill="%23f5d0fe" font-size="11" font-weight="bold">Sinal clássico ao bater palmas ou elevar a fronte</text>
      </g>
      
      <!-- Sawhorse Stance (Right Box) -->
      <g transform="translate(400, 50)">
        <rect width="360" height="380" rx="16" fill="%230f0a17" fill-opacity="0.9" stroke="%23ef4444" stroke-width="1.5" />
        <text x="20" y="32" fill="%23fca5a5" font-size="13" font-family="sans-serif" font-weight="bold">2. Postura Rígida em "Cavalete"</text>
        <text x="20" y="48" fill="%23f87171" font-size="11">Hipertonia e espasmos da musculatura extensora</text>
        
        <!-- Equine in Sawhorse Stance -->
        <g transform="translate(30, 80)">
          <!-- Ground -->
          <line x1="0" y1="210" x2="300" y2="210" stroke="%234c1d95" stroke-width="2" />
          
          <!-- Rigid Stiff Body -->
          <path d="M 80 90 L 220 90 L 250 140 L 200 150 L 80 140 Z" fill="%237e22ce" stroke="%23a855f7" stroke-width="2" />
          <!-- Stiff Extended Forelegs -->
          <line x1="90" y1="140" x2="50" y2="210" stroke="%23c084fc" stroke-width="8" stroke-linecap="round" />
          <line x1="110" y1="140" x2="70" y2="210" stroke="%239333ea" stroke-width="8" stroke-linecap="round" />
          <!-- Stiff Extended Hindlegs -->
          <line x1="220" y1="140" x2="265" y2="210" stroke="%23c084fc" stroke-width="8" stroke-linecap="round" />
          <line x1="240" y1="140" x2="285" y2="210" stroke="%239333ea" stroke-width="8" stroke-linecap="round" />
          
          <!-- Rigid Extended Neck & Tail in Banner -->
          <path d="M 80 90 L 40 40 L 60 35 L 95 80 Z" fill="%237e22ce" />
          <!-- Head / Ears Alert Pricked -->
          <polygon points="35,40 20,15 35,25" fill="%23f43f5e" />
          <polygon points="45,35 40,10 52,22" fill="%23f43f5e" />
          <circle cx="35" cy="45" r="10" fill="%23a855f7" />
          <!-- Tail Straight Out -->
          <line x1="220" y1="90" x2="280" y2="75" stroke="%23c084fc" stroke-width="5" stroke-linecap="round" />
          <text x="240" y="65" fill="%23f0abfc" font-size="9" font-weight="bold">Cauda em Bandeira</text>
        </g>
        
        <rect x="20" y="325" width="320" height="35" rx="8" fill="%23450a0a" />
        <text x="30" y="347" fill="%23fca5a5" font-size="11" font-weight="bold">🚨 Emergência: Soro Antitetânico + Baia Escura e Silenciosa</text>
      </g>
      
      <!-- Footer Reference -->
      <rect x="40" y="445" width="720" height="35" rx="8" fill="%231e112a" stroke="%239333ea" stroke-width="1" />
      <text x="60" y="467" fill="%23e9d5ff" font-size="11.5" font-weight="bold">💉 Prevenção 100% Eficaz: Vacinação Anual com Toxoide Antitetânico</text>
    </svg>`
  },

  'dis-aie': {
    id: 'dis-aie',
    title: 'Anemia Infecciosa Equina (AIE - Retrovírus)',
    clinicalSignLabel: 'Edema ventral gravitacional, icterícia conjuntival e emaciação crônica',
    imageAlt: 'Fotografia clínica real de equino com AIE apresentando edema esternal/abdominal em declive e emaciação',
    realPhotoUrl: '/equine_aie_real.jpg',
    realPhotoCaption: 'Fotografia Clínica Real: Equino acometido por Anemia Infecciosa Equina demonstrando edema de declive esternal e abdominal, caquexia e letargia.',
    anatomicalLocation: 'Sistema Hematopoiético, Fígado, Baço e Linfonodos',
    keyFindings: [
      'Edemas ventrais acentuados na linha alba abdominal, peito, prepúcio e membros',
      'Mucosas conjuntivais e gengivais pálidas ou amareladas (icterícia hemolítica)',
      'Febre intermitente recorrente (40-41°C) acompanhada de prostração e taquicardia',
      'Doença de Notificação Obrigatória ao MAPA - Diagnóstico Oficial por Teste de Coggins'
    ],
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
      <defs>
        <linearGradient id="aieBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%232b1111" />
          <stop offset="50%" stop-color="%23170707" />
          <stop offset="100%" stop-color="%230a0202" />
        </linearGradient>
      </defs>
      
      <rect width="800" height="500" fill="url(%23aieBg)" />
      
      <!-- Left: Clinical Signs (Horse Silhouette with Ventral Edema) -->
      <g transform="translate(40, 50)">
        <rect width="340" height="380" rx="16" fill="%23180808" fill-opacity="0.9" stroke="%23ef4444" stroke-width="1.5" />
        <text x="20" y="32" fill="%23fca5a5" font-size="13" font-family="sans-serif" font-weight="bold">1. Edemas Ventrais & Debilidade</text>
        <text x="20" y="48" fill="%23fda4af" font-size="11">Acúmulo de líquido em peito, abdômen e membros</text>
        
        <g transform="translate(20, 75)">
          <line x1="0" y1="220" x2="300" y2="220" stroke="%237f1d1d" stroke-width="2" />
          
          <!-- Emaciated Horse Body -->
          <path d="M 60 110 Q 110 85 180 95 Q 230 110 240 160 L 220 180 Q 160 185 100 170 Z" fill="%2378350f" stroke="%23991b1b" stroke-width="2" />
          <!-- Visible Ribs Lines (Emaciação) -->
          <line x1="120" y1="110" x2="115" y2="160" stroke="%23451a03" stroke-width="2" />
          <line x1="135" y1="110" x2="130" y2="160" stroke="%23451a03" stroke-width="2" />
          <line x1="150" y1="110" x2="145" y2="160" stroke="%23451a03" stroke-width="2" />
          <line x1="165" y1="110" x2="160" y2="160" stroke="%23451a03" stroke-width="2" />
          
          <!-- Ventral Dependent Edema (Bolsa de Edema no Ventre e Peito) -->
          <path d="M 90 160 Q 150 205 210 175 Z" fill="%23ef4444" fill-opacity="0.6" stroke="%23f87171" stroke-width="2" />
          <path d="M 70 140 Q 85 175 100 155 Z" fill="%23ef4444" fill-opacity="0.6" stroke="%23f87171" stroke-width="1.5" />
          <text x="110" y="195" fill="%23fee2e2" font-size="10" font-weight="bold">Edema de Declive</text>
          
          <!-- Legs with Sheath / Leg Swelling -->
          <line x1="90" y1="160" x2="80" y2="220" stroke="%2378350f" stroke-width="10" stroke-linecap="round" />
          <line x1="220" y1="160" x2="230" y2="220" stroke="%2378350f" stroke-width="10" stroke-linecap="round" />
        </g>
        
        <rect x="20" y="325" width="300" height="35" rx="8" fill="%23450a0a" />
        <text x="30" y="347" fill="%23fecaca" font-size="11" font-weight="bold">📋 Teste de Coggins (IDGA) Obrigatório para Trânsito</text>
      </g>
      
      <!-- Right: Vector Transmission & Legal Regulations (MAPA) -->
      <g transform="translate(410, 50)">
        <rect width="350" height="380" rx="16" fill="%23180808" fill-opacity="0.9" stroke="%23dc2626" stroke-width="1.5" />
        <text x="20" y="32" fill="%23fca5a5" font-size="13" font-family="sans-serif" font-weight="bold">2. Transmissão & Notificação MAPA</text>
        <text x="20" y="48" fill="%23f87171" font-size="11">Vetores hematófagos (Tabanus/mutucas) e agulhas</text>
        
        <!-- Vector Tabanid Fly Illustration -->
        <g transform="translate(100, 75)">
          <ellipse cx="75" cy="60" rx="35" ry="25" fill="%23451a03" stroke="%2378350f" stroke-width="2" />
          <circle cx="45" cy="55" r="14" fill="%23166534" />
          <!-- Compound Green Eyes of Tabanid -->
          <circle cx="42" cy="52" r="5" fill="%234ade80" />
          <!-- Wings -->
          <ellipse cx="85" cy="35" rx="45" ry="16" fill="%2394a3b8" fill-opacity="0.6" stroke="%23cbd5e1" transform="rotate(-20, 85, 35)" />
          <ellipse cx="85" cy="85" rx="45" ry="16" fill="%2394a3b8" fill-opacity="0.6" stroke="%23cbd5e1" transform="rotate(20, 85, 85)" />
        </g>
        
        <!-- Legal Status Warning Box -->
        <g transform="translate(20, 200)">
          <rect width="310" height="110" rx="12" fill="%237f1d1d" fill-opacity="0.5" stroke="%23ef4444" stroke-width="1.5" />
          <text x="15" y="25" fill="%23ffffff" font-size="12" font-weight="bold">🚨 Normativa Federal MAPA:</text>
          <text x="15" y="45" fill="%23fecaca" font-size="10.5">• Doença sem cura ou tratamento autorizado</text>
          <text x="15" y="62" fill="%23fecaca" font-size="10.5">• Eutanásia compulsória dos animais positivos</text>
          <text x="15" y="79" fill="%23fecaca" font-size="10.5">• Interdição da propriedade e quarentena</text>
          <text x="15" y="96" fill="%23fecaca" font-size="10.5">• Uso estrito de agulhas e seringas descartáveis</text>
        </g>
        
        <rect x="20" y="325" width="310" height="35" rx="8" fill="%23991b1b" />
        <text x="30" y="347" fill="%23ffffff" font-size="11" font-weight="bold">Defesa Agropecuária: Notificação Imediata</text>
      </g>
      
      <!-- Footer Note -->
      <rect x="40" y="445" width="720" height="35" rx="8" fill="%232b1111" stroke="%23dc2626" stroke-width="1" />
      <text x="60" y="467" fill="%23fee2e2" font-size="11.5" font-weight="bold">🛡️ Prevenção: Controle de vetores, exames semestrais e GTA rigorosa para movimentação.</text>
    </svg>`
  },

  'dis-mormo': {
    id: 'dis-mormo',
    title: 'Mormo Equino (Burkholderia mallei)',
    clinicalSignLabel: 'Úlceras estreladas na mucosa nasal, corrimento mucopurulento e nódulos cutâneos',
    imageAlt: 'Fotografia clínica real de equino com mormo apresentando lesões ulcerativas e corrimento nasal',
    realPhotoUrl: '/equine_mormo_real.jpg',
    realPhotoCaption: 'Fotografia Clínica Real: Lesões ulcerativas e corrimento mucopurulento em cavidade nasal causadas por Burkholderia mallei (Zoonose / MAPA).',
    anatomicalLocation: 'Mucosa Nasal, Trato Respiratório e Sistema Linfático Cutâneo',
    keyFindings: [
      'Úlceras e erosões na mucosa do septo nasal que cicatrizam em formato de estrela',
      'Corrimento nasal mucopurulento bilateral ou unilateral profuso',
      'Nódulos e cordões linfáticos ulcerados na face e membros (forma cutânea)',
      'Zoonose Grave de Notificação Obrigatória Imediata ao MAPA'
    ],
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
      <defs>
        <linearGradient id="mormoBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%231a0b0b" />
          <stop offset="50%" stop-color="%23120606" />
          <stop offset="100%" stop-color="%23050101" />
        </linearGradient>
      </defs>
      
      <rect width="800" height="500" fill="url(%23mormoBg)" />
      
      <!-- Left: Nasal Mucosa Stellate Ulcers Drawing -->
      <g transform="translate(40, 50)">
        <rect width="340" height="380" rx="16" fill="%231f0808" fill-opacity="0.9" stroke="%23dc2626" stroke-width="1.5" />
        <text x="20" y="32" fill="%23fca5a5" font-size="13" font-family="sans-serif" font-weight="bold">1. Úlceras Estreladas na Mucosa Nasal</text>
        <text x="20" y="48" fill="%23f87171" font-size="11">Lesões crateriformes com cicatrizes em formato de estrela</text>
        
        <!-- Nasal Cavity Cross-Section -->
        <g transform="translate(30, 75)">
          <path d="M 20 40 Q 140 10 260 50 Q 280 140 240 200 Q 130 220 30 170 Z" fill="%23881337" stroke="%23be123c" stroke-width="2" />
          
          <!-- Stellate Ulcers on Septum -->
          <g transform="translate(80, 70)">
            <path d="M 30 10 L 35 25 L 50 30 L 35 35 L 30 50 L 25 35 L 10 30 L 25 25 Z" fill="%23fecdd3" stroke="%23e11d48" stroke-width="2" />
            <circle cx="30" cy="30" r="5" fill="%239f1239" />
          </g>
          
          <g transform="translate(160, 100)">
            <path d="M 20 5 L 23 18 L 35 20 L 23 23 L 20 35 L 17 23 L 5 20 L 17 18 Z" fill="%23fecdd3" stroke="%23e11d48" stroke-width="1.5" />
            <circle cx="20" cy="20" r="3" fill="%239f1239" />
          </g>
          
          <!-- Purulent Mucous Stream -->
          <path d="M 40 160 Q 90 190 140 200" stroke="%23fef08a" stroke-width="8" stroke-linecap="round" fill="none" />
        </g>
        
        <rect x="20" y="325" width="300" height="35" rx="8" fill="%23881337" />
        <text x="30" y="347" fill="%23ffe4e6" font-size="11" font-weight="bold">🔬 Diagnóstico Oficial: Fixação de Complemento / ELISA</text>
      </g>
      
      <!-- Right: Zoonosis & Safety Protocol -->
      <g transform="translate(410, 50)">
        <rect width="350" height="380" rx="16" fill="%231f0808" fill-opacity="0.9" stroke="%23b91c1c" stroke-width="1.5" />
        <text x="20" y="32" fill="%23fca5a5" font-size="13" font-family="sans-serif" font-weight="bold">2. Alerta de Zoonose Gravíssima</text>
        <text x="20" y="48" fill="%23f87171" font-size="11">Risco letal de transmissão para seres humanos</text>
        
        <!-- Biohazard Sign -->
        <g transform="translate(130, 80)">
          <circle cx="45" cy="45" r="42" fill="%23facc15" stroke="%23ca8a04" stroke-width="3" />
          <polygon points="45,18 70,68 20,68" fill="%23000000" />
          <circle cx="45" cy="48" r="5" fill="%23facc15" />
          <text x="45" y="64" fill="%23facc15" font-size="10" font-weight="900" text-anchor="middle">!</text>
        </g>
        
        <!-- Safety Guidelines -->
        <g transform="translate(20, 190)">
          <rect width="310" height="120" rx="12" fill="%23450a0a" stroke="%23ef4444" stroke-width="1" />
          <text x="15" y="25" fill="%23ffffff" font-size="12" font-weight="bold">Procedimentos Mandatórios:</text>
          <text x="15" y="46" fill="%23fecaca" font-size="10.5">• NÃO manipular secreções sem EPI completo (N95/Luvas)</text>
          <text x="15" y="64" fill="%23fecaca" font-size="10.5">• Tratamento de equídeos é terminantemente PROIBIDO</text>
          <text x="15" y="82" fill="%23fecaca" font-size="10.5">• Sacrifício sanitário sob fiscalização do MAPA</text>
          <text x="15" y="100" fill="%23fecaca" font-size="10.5">• Desinfecção terminal com hipoclorito / calor</text>
        </g>
        
        <rect x="20" y="325" width="310" height="35" rx="8" fill="%23991b1b" />
        <text x="30" y="347" fill="%23ffffff" font-size="11" font-weight="bold">Comunicação Obrigatória Imediata à Defesa Agropecuária</text>
      </g>
      
      <!-- Footer -->
      <rect x="40" y="445" width="720" height="35" rx="8" fill="%231a0b0b" stroke="%23ef4444" stroke-width="1" />
      <text x="60" y="467" fill="%23fee2e2" font-size="11.5" font-weight="bold">🛡️ Programa Nacional de Sanidade dos Equídeos (PNSE - MAPA nº 35/2018)</text>
    </svg>`
  },

  'dis-piroplasmose': {
    id: 'dis-piroplasmose',
    title: 'Piroplasmose Equina (Babesiose / Theileria equi)',
    clinicalSignLabel: 'Icterícia conjuntival acentuada, hemoglobinúria e anemia hemolítica',
    imageAlt: 'Fotografia clínica real de equino com piroplasmose apresentando icterícia conjuntival acentuada',
    realPhotoUrl: '/equine_piroplasmose_real.jpg',
    realPhotoCaption: 'Fotografia Clínica Real: Icterícia conjuntival amarelo-ouro intensa decorrente de hemólise maciça e hiperbilirrubinemia por Theileria equi / Babesia caballi.',
    anatomicalLocation: 'Hemácias / Eritrócitos, Fígado e Baço',
    keyFindings: [
      'Icterícia severa em conjuntiva ocular e mucosa oral por hemólise maciça',
      'Hemoglobinúria característica (urina escurecida cor de vinho ou café)',
      'Febre alta súbita (39.5 a 41.5°C) com taquicardia e taquipneia compensatória',
      'Diagnóstico por esfregaço de ponta de orelha (trofozoítos intraeritrocitários)'
    ],
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
      <defs>
        <linearGradient id="piroBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%231c1505" />
          <stop offset="50%" stop-color="%23140e02" />
          <stop offset="100%" stop-color="%23080501" />
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(%23piroBg)" />
      
      <!-- Left: Conjunctival Jaundice (Icterícia) -->
      <g transform="translate(40, 50)">
        <rect width="340" height="380" rx="16" fill="%23171206" stroke="%23eab308" stroke-width="1.5" />
        <text x="20" y="32" fill="%23fde047" font-size="13" font-family="sans-serif" font-weight="bold">1. Icterícia Conjuntival Acentuada</text>
        <text x="20" y="48" fill="%23facc15" font-size="11">Coloração amarelo-ouro por hiperbilirrubinemia</text>
        
        <!-- Eye Close up -->
        <g transform="translate(30, 75)">
          <path d="M 20 110 Q 130 30 240 110 Q 130 190 20 110 Z" fill="%2378350f" stroke="%2392400e" stroke-width="3" />
          <!-- Sclera / Conjunctiva Intense Yellow -->
          <circle cx="130" cy="110" r="55" fill="%23facc15" stroke="%23ca8a04" stroke-width="2" />
          <!-- Engorged Vessels on Yellow Sclera -->
          <path d="M 90 90 Q 110 95 120 105" stroke="%23ef4444" stroke-width="1.5" fill="none" />
          <path d="M 160 85 Q 145 98 135 105" stroke="%23ef4444" stroke-width="1.5" fill="none" />
          <circle cx="130" cy="110" r="28" fill="%231c1917" />
          <circle cx="130" cy="110" r="16" fill="%230c0a09" />
          <circle cx="124" cy="104" r="4" fill="%23ffffff" />
        </g>
        
        <rect x="20" y="325" width="300" height="35" rx="8" fill="%23422006" />
        <text x="30" y="347" fill="%23fef08a" font-size="11" font-weight="bold">Bilirrubina total e indireta marcadamente elevadas</text>
      </g>
      
      <!-- Right: Blood Smear & Urine (Microscopy) -->
      <g transform="translate(410, 50)">
        <rect width="350" height="380" rx="16" fill="%23171206" stroke="%23f59e0b" stroke-width="1.5" />
        <text x="20" y="32" fill="%23fde047" font-size="13" font-family="sans-serif" font-weight="bold">2. Hemólise & Esfregaço Sangüíneo</text>
        <text x="20" y="48" fill="%23facc15" font-size="11">Trofozoítos de Theileria equi / Babesia caballi</text>
        
        <!-- Red Blood Cells with Parasite Merozoites -->
        <g transform="translate(50, 75)">
          <circle cx="60" cy="50" r="32" fill="%23b91c1c" stroke="%23dc2626" stroke-width="2" />
          <!-- Piroplasm pair inside RBC (Cruz de Malta / Piriforme) -->
          <ellipse cx="55" cy="48" rx="6" ry="10" fill="%2338bdf8" transform="rotate(-30, 55, 48)" />
          <ellipse cx="68" cy="52" rx="6" ry="10" fill="%2338bdf8" transform="rotate(30, 68, 52)" />
          
          <circle cx="140" cy="80" r="28" fill="%23b91c1c" stroke="%23dc2626" stroke-width="2" />
          <circle cx="140" cy="80" r="4" fill="%2338bdf8" />
          
          <!-- Test Tube of Dark Wine-colored Urine -->
          <rect x="200" y="20" width="30" height="90" rx="12" fill="%231e293b" stroke="%2394a3b8" stroke-width="2" />
          <rect x="204" y="50" width="22" height="56" rx="8" fill="%23450a0a" />
          <text x="180" y="130" fill="%23fca5a5" font-size="10" font-weight="bold">Hemoglobinúria</text>
        </g>
        
        <g transform="translate(20, 220)">
          <rect width="310" height="90" rx="10" fill="%23291807" stroke="%23d97706" stroke-width="1" />
          <text x="15" y="25" fill="%23fde047" font-size="11.5" font-weight="bold">Tratamento de Escolha:</text>
          <text x="15" y="45" fill="%23fef08a" font-size="10.5">• Dipropionato de Imidocarb ou Diminazeno</text>
          <text x="15" y="62" fill="%23fef08a" font-size="10.5">• Fluidoterapia para proteção renal contra hemoglobina</text>
          <text x="15" y="79" fill="%23fef08a" font-size="10.5">• Carrapaticidas (Amblyomma / Dermacentor)</text>
        </g>
        
        <rect x="20" y="325" width="310" height="35" rx="8" fill="%23713f12" />
        <text x="30" y="347" fill="%23ffffff" font-size="11" font-weight="bold">Protocolo Terapêutico Guiado por Hemograma</text>
      </g>
      
      <!-- Footer -->
      <rect x="40" y="445" width="720" height="35" rx="8" fill="%231c1505" stroke="%23eab308" stroke-width="1" />
      <text x="60" y="467" fill="%23fef08a" font-size="11.5" font-weight="bold">🐎 Endêmica no Brasil: Importante barreira sanitária para exportação e competições internacionais.</text>
    </svg>`
  },

  'dis-tendinite': {
    id: 'dis-tendinite',
    title: 'Tendinite do Flexor Digital Superficial ("Bow Tendon")',
    clinicalSignLabel: 'Deformidade arqueada em banana na canela, edema inflamatório e claudicação',
    imageAlt: 'Fotografia clínica real de tendinite em canela equina com arqueamento e edema do flexor superficial',
    realPhotoUrl: '/equine_tendinite_real.jpg',
    realPhotoCaption: 'Fotografia Clínica Real: Deformidade convexa arqueada em "banana" (bowed tendon) no aspecto palmar da canela por tendinite aguda do flexor superficial.',
    anatomicalLocation: 'Membro Locomotor (Tendão Flexor Digital Superficial - TFDS)',
    keyFindings: [
      'Deformidade convexa palmar no terço médio metacarpiano ("banana bow")',
      'Calor local, dor severa à palpação do cordão tendíneo e claudicação ao trote',
      'Ultrassonografia com área anecóica central (core lesion / ruptura de fibras)',
      'Protocolo clínico imediato: Gelo 20min 4x/dia + Bandagem compressiva + Repouso'
    ],
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
      <defs>
        <linearGradient id="tendonBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%230c1e2b" />
          <stop offset="50%" stop-color="%2308141d" />
          <stop offset="100%" stop-color="%2303080d" />
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(%23tendonBg)" />
      
      <!-- Left: Leg Contour & Arc Profile -->
      <g transform="translate(40, 50)">
        <rect width="340" height="380" rx="16" fill="%230b1b26" stroke="%2338bdf8" stroke-width="1.5" />
        <text x="20" y="32" fill="%237dd3fc" font-size="13" font-family="sans-serif" font-weight="bold">1. Arqueamento Palmar ("Banana Bow")</text>
        <text x="20" y="48" fill="%2338bdf8" font-size="11">Edema e espessamento do tendão flexor superficial</text>
        
        <g transform="translate(100, 75)">
          <!-- Cannon Bone Front Profile -->
          <path d="M 30 10 L 30 200 L 10 230 L 30 240 L 50 240 L 60 200 L 55 10 Z" fill="%2378350f" stroke="%2392400e" stroke-width="2" />
          
          <!-- Normal Deep Flexor -->
          <line x1="55" y1="20" x2="55" y2="200" stroke="%23cbd5e1" stroke-width="6" />
          
          <!-- Bowed Superficial Flexor Tendon (Inflamed & Bowed Out) -->
          <path d="M 58 20 Q 95 110 58 200" stroke="%23ef4444" stroke-width="10" stroke-linecap="round" fill="none" />
          <path d="M 58 50 Q 88 110 58 170" stroke="%23f87171" stroke-width="4" stroke-linecap="round" fill="none" />
          
          <!-- Swelling heat radiation waves -->
          <path d="M 98 90 Q 110 110 98 130" stroke="%23f59e0b" stroke-width="2" fill="none" />
          <path d="M 108 80 Q 124 110 108 140" stroke="%23f59e0b" stroke-width="1.5" fill="none" stroke-dasharray="3 3" />
        </g>
        
        <rect x="20" y="325" width="300" height="35" rx="8" fill="%230369a1" />
        <text x="30" y="347" fill="%23e0f2fe" font-size="11" font-weight="bold">Palpação: Espessamento doloroso e aumento térmico</text>
      </g>
      
      <!-- Right: Ultrasound Transverse Scan (Core Lesion) -->
      <g transform="translate(410, 50)">
        <rect width="350" height="380" rx="16" fill="%230b1b26" stroke="%230284c7" stroke-width="1.5" />
        <text x="20" y="32" fill="%237dd3fc" font-size="13" font-family="sans-serif" font-weight="bold">2. Ultrassonografia & "Core Lesion"</text>
        <text x="20" y="48" fill="%2338bdf8" font-size="11">Corte transversal: Rompimento fibrilar anecóico (preto)</text>
        
        <!-- US Screen Simulation -->
        <g transform="translate(50, 75)">
          <rect width="250" height="150" rx="12" fill="%23020617" stroke="%23334155" stroke-width="2" />
          <!-- SDFT Oval -->
          <ellipse cx="125" cy="50" rx="45" ry="25" fill="%23475569" stroke="%2394a3b8" stroke-width="1.5" />
          <!-- Central Anechoic Core Lesion (Fluid/Hemorrhage) -->
          <ellipse cx="125" cy="50" rx="20" ry="12" fill="%23020617" stroke="%23ef4444" stroke-width="2" />
          <text x="125" y="54" fill="%23f87171" font-size="9" font-weight="bold" text-anchor="middle">LESÃO CENTRAL</text>
          
          <!-- DDFT Below -->
          <ellipse cx="125" cy="95" rx="48" ry="18" fill="%23334155" stroke="%2364748b" stroke-width="1" />
          <text x="125" y="100" fill="%23cbd5e1" font-size="9" text-anchor="middle">TFDP (Profundo)</text>
        </g>
        
        <g transform="translate(20, 240)">
          <rect width="310" height="70" rx="10" fill="%23082f49" stroke="%230ea5e9" stroke-width="1" />
          <text x="15" y="22" fill="%237dd3fc" font-size="11.5" font-weight="bold">Conduta Terapêutica:</text>
          <text x="15" y="40" fill="%23bae6fd" font-size="10.5">• Crioterapia + Fita kinesio / Ducha fria</text>
          <text x="15" y="58" fill="%23bae6fd" font-size="10.5">• Terapia Celular (PRP / Células Tronco) + Repouso</text>
        </g>
        
        <rect x="20" y="325" width="310" height="35" rx="8" fill="%230284c7" />
        <text x="30" y="347" fill="%23ffffff" font-size="11" font-weight="bold">Ultrassom Seriado a cada 30-45 dias de Reabilitação</text>
      </g>
      
      <!-- Footer -->
      <rect x="40" y="445" width="720" height="35" rx="8" fill="%230c1e2b" stroke="%230ea5e9" stroke-width="1" />
      <text x="60" y="467" fill="%23e0f2fe" font-size="11.5" font-weight="bold">🧊 Primeiro Socorro: Não aplicar calor na fase aguda (primeiras 72h). Apenas gelo e imobilização.</text>
    </svg>`
  }
};

