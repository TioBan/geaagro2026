/**
 * Gerador Offline de Ilustrações Científicas e Micrografias Vetoriais de Nematoides
 * 100% Funcional Offline (sem dependência de internet ou assets externos).
 */

function svgToDataUri(svgString: string): string {
  const cleaned = svgString
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleaned)}`;
}

/**
 * Gera micrografia óptica científica simulada em alta resolução (SVG)
 */
export function generateNematodeMicroscopeSvg(
  speciesId: string,
  anatomyType: string = 'vermiform',
  scientificName: string = 'Nematoda sp.'
): string {
  const isCyst = anatomyType === 'cyst' || speciesId.includes('globodera') || speciesId.includes('heterodera');
  const isGlobose = anatomyType === 'globose' || speciesId.includes('meloidogyne') || speciesId.includes('nacobbus');
  const isReniform = anatomyType === 'reniform' || speciesId.includes('rotylenchulus') || speciesId.includes('tylenchulus');
  const isSpiral = anatomyType === 'spiral' || speciesId.includes('helicotylenchus') || speciesId.includes('scutellonema');
  const isDagger = anatomyType === 'dagger' || speciesId.includes('xiphinema') || speciesId.includes('longidorus') || speciesId.includes('belonolaimus');
  const isPin = anatomyType === 'pin' || speciesId.includes('trichodorus') || speciesId.includes('paratrichodorus');
  const isSheath = anatomyType === 'sheath' || speciesId.includes('hemicycliophora') || speciesId.includes('criconemoides');

  let organismSvg = '';
  let stainColor = '#065f46';
  let stainBg = '#022c22';
  let stainAccent = '#34d399';
  let magText = '400x Óptica';
  let stainName = 'Contraste DIC / Fucsina';

  if (isGlobose) {
    stainBg = '#1c1917';
    stainColor = '#f43f5e';
    stainAccent = '#fb7185';
    magText = '400x Fucsina Ácida';
    stainName = 'Fucsina Ácida em Lactofenol';
    organismSvg = `
      <!-- Gelatinous matrix with eggs -->
      <path d="M 280 230 C 350 210, 390 280, 360 340 C 330 390, 270 370, 280 300 Z" fill="rgba(244, 63, 94, 0.18)" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="3,3" />
      <circle cx="320" cy="270" r="10" fill="#fb7185" opacity="0.6"/>
      <circle cx="340" cy="295" r="9" fill="#fb7185" opacity="0.7"/>
      <circle cx="310" cy="315" r="11" fill="#fb7185" opacity="0.5"/>
      <circle cx="335" cy="335" r="8" fill="#fb7185" opacity="0.8"/>
      <circle cx="360" cy="305" r="9" fill="#fb7185" opacity="0.6"/>

      <!-- Globose Female Body -->
      <path d="M 200 130 C 205 150, 220 180, 260 210 C 300 240, 305 310, 260 360 C 215 410, 130 400, 95 350 C 60 300, 80 230, 130 190 C 165 160, 185 145, 195 130 Z" fill="url(#globoseGrad)" stroke="#fda4af" stroke-width="3" />
      
      <!-- Neck & Stylet -->
      <path d="M 195 130 L 205 85 L 188 85 Z" fill="#fda4af" stroke="#f43f5e" stroke-width="2"/>
      <line x1="197" y1="80" x2="197" y2="120" stroke="#ffe4e6" stroke-width="2.5" />
      <circle cx="193" cy="120" r="3" fill="#ffe4e6" />
      <circle cx="201" cy="120" r="3" fill="#ffe4e6" />
      
      <!-- Median Esophageal Bulb -->
      <ellipse cx="197" cy="155" rx="12" ry="16" fill="#f43f5e" opacity="0.85" stroke="#ffe4e6" stroke-width="1.5" />
      <circle cx="197" cy="155" r="4" fill="#ffffff" />
      
      <!-- Perineal Pattern lines -->
      <path d="M 160 365 Q 180 345, 200 365" stroke="#ffe4e6" stroke-width="1.5" fill="none" opacity="0.7" />
      <path d="M 150 375 Q 180 340, 210 375" stroke="#ffe4e6" stroke-width="1.5" fill="none" opacity="0.7" />
      <path d="M 140 385 Q 180 335, 220 385" stroke="#ffe4e6" stroke-width="1.5" fill="none" opacity="0.7" />
      <ellipse cx="180" cy="360" rx="3" ry="1.5" fill="#ffffff" />
    `;
  } else if (isCyst) {
    stainBg = '#1c1917';
    stainColor = '#d97706';
    stainAccent = '#f59e0b';
    magText = '200x Estereomicroscopia';
    stainName = 'Luz Transmitida & Polarizada';
    const isPale = speciesId.includes('pallida');
    const cystFill = isPale ? 'url(#paleCystGrad)' : 'url(#goldCystGrad)';
    organismSvg = `
      <!-- Cyst Body (Lemon/Spherical with Vulval Cone) -->
      <path d="M 200 80 C 210 85, 215 110, 240 135 C 290 185, 305 270, 275 330 C 245 390, 155 390, 125 330 C 95 270, 110 185, 160 135 C 185 110, 190 85, 200 80 Z" fill="${cystFill}" stroke="#fef3c7" stroke-width="3.5" />
      
      <!-- Punctations / Cuticle Texture -->
      <g fill="#78350f" opacity="0.4">
        <circle cx="170" cy="180" r="2.5"/><circle cx="210" cy="170" r="2.5"/><circle cx="240" cy="210" r="3"/><circle cx="150" cy="230" r="2"/><circle cx="190" cy="240" r="2.5"/><circle cx="230" cy="270" r="3"/><circle cx="160" cy="300" r="2.5"/><circle cx="200" cy="310" r="3"/><circle cx="240" cy="320" r="2"/><circle cx="180" cy="340" r="2.5"/>
      </g>
      
      <!-- Internal Eggs Shadow -->
      <g fill="#92400e" opacity="0.5">
        <ellipse cx="175" cy="210" rx="14" ry="9" transform="rotate(25 175 210)"/>
        <ellipse cx="215" cy="225" rx="14" ry="9" transform="rotate(-15 215 225)"/>
        <ellipse cx="185" cy="260" rx="14" ry="9" transform="rotate(40 185 260)"/>
        <ellipse cx="225" cy="280" rx="14" ry="9" transform="rotate(-30 225 280)"/>
        <ellipse cx="165" cy="295" rx="14" ry="9" transform="rotate(10 165 295)"/>
      </g>

      <!-- Vulval Cone & Fenestration -->
      <ellipse cx="200" cy="365" rx="14" ry="8" fill="#451a03" stroke="#fde68a" stroke-width="2"/>
      <ellipse cx="194" cy="365" rx="4" ry="4" fill="#fde68a" />
      <ellipse cx="206" cy="365" rx="4" ry="4" fill="#fde68a" />
    `;
  } else if (isSpiral) {
    stainBg = '#0f172a';
    stainColor = '#8b5cf6';
    stainAccent = '#c084fc';
    magText = '500x Óptica';
    stainName = 'Campo Claro / Contraste de Fase';
    organismSvg = `
      <!-- Spiral Nematode Body Coil (360-degree spiral posture) -->
      <path d="M 270 120 C 330 160, 340 280, 270 330 C 190 380, 110 330, 95 240 C 85 160, 140 100, 210 105 C 265 110, 280 165, 260 215 C 240 255, 185 265, 160 235 C 145 215, 155 185, 180 180 Q 200 180, 205 200" fill="none" stroke="url(#spiralGrad)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" />
      
      <!-- Stylet & Knobs at Anterior End -->
      <line x1="270" y1="120" x2="245" y2="108" stroke="#ffffff" stroke-width="3" />
      <circle cx="243" cy="107" r="3.5" fill="#fbcfe8" />
      <circle cx="248" cy="113" r="3.5" fill="#fbcfe8" />
      
      <!-- Median bulb & Esophagus -->
      <circle cx="215" cy="107" r="7" fill="#a855f7" stroke="#ffffff" stroke-width="1.5" />
      
      <!-- Cuticle Annulations (transverse striations) -->
      <path d="M 260 140 L 280 145 M 290 180 L 310 178 M 305 230 L 325 232 M 280 290 L 295 305 M 220 340 L 225 360 M 150 325 L 140 340 M 105 265 L 90 270 M 100 200 L 85 195 M 130 135 L 120 120" stroke="#f3e8ff" stroke-width="1.5" opacity="0.6" />
    `;
  } else if (isDagger) {
    stainBg = '#0b1329';
    stainColor = '#ef4444';
    stainAccent = '#f87171';
    magText = '400x DIC Nomarski';
    stainName = 'Contraste Diferencial de Interferência';
    organismSvg = `
      <!-- Slender Long Body -->
      <path d="M 80 80 Q 150 110, 220 180 T 310 320 Q 330 360, 360 370" fill="none" stroke="url(#daggerGrad)" stroke-width="18" stroke-linecap="round" />
      
      <!-- Massive Long Odontostylet -->
      <line x1="75" y1="76" x2="155" y2="120" stroke="#ffffff" stroke-width="4.5" />
      <circle cx="155" cy="120" r="5" fill="#fca5a5" />
      <path d="M 152 114 L 165 125 L 150 128 Z" fill="#f87171" stroke="#ffffff" stroke-width="1"/>
      
      <!-- Guide Ring -->
      <ellipse cx="120" cy="101" rx="4" ry="7" transform="rotate(30 120 101)" fill="none" stroke="#ffffff" stroke-width="2" />
      
      <!-- Esophageal Basal Bulb -->
      <path d="M 190 155 Q 220 180, 240 215" fill="none" stroke="#dc2626" stroke-width="16" stroke-linecap="round" />
      <circle cx="215" cy="185" r="5" fill="#ffffff" />
    `;
  } else if (isReniform) {
    stainBg = '#18181b';
    stainColor = '#ea580c';
    stainAccent = '#fb923c';
    magText = '400x Corte Histológico';
    stainName = 'Fucsina Ácida em Tecido Radicular';
    organismSvg = `
      <!-- Plant Root Tissue Border -->
      <path d="M 40 40 L 160 40 L 160 360 L 40 360 Z" fill="#27272a" stroke="#3f3f46" stroke-width="2" />
      <circle cx="100" cy="120" r="18" fill="#18181b" stroke="#52525b" />
      <circle cx="100" cy="200" r="22" fill="#18181b" stroke="#52525b" />
      <circle cx="100" cy="280" r="18" fill="#18181b" stroke="#52525b" />

      <!-- Reniform Female Body (Kidney Shaped Outside the Root) -->
      <path d="M 140 180 C 140 150, 160 120, 200 110 C 250 100, 310 130, 320 190 C 330 250, 280 300, 220 300 C 170 300, 150 250, 160 210 C 165 190, 140 190, 140 180 Z" fill="url(#reniformGrad)" stroke="#fdba74" stroke-width="3" />
      
      <!-- Slender Anterior Neck Embedded Inside Root Tissue -->
      <path d="M 140 180 Q 110 185, 90 195" fill="none" stroke="#fed7aa" stroke-width="8" stroke-linecap="round" />
      <line x1="90" y1="195" x2="80" y2="198" stroke="#ffffff" stroke-width="3" />
      
      <!-- Median Bulb & Excretory Pore -->
      <circle cx="130" cy="183" r="5" fill="#c2410c" stroke="#ffffff" stroke-width="1" />
      <ellipse cx="245" cy="280" rx="15" ry="8" fill="#7c2d12" stroke="#fdba74" stroke-width="1.5" />
    `;
  } else {
    // Default Vermiform (Pratylenchus, Radopholus, Hirschmanniella, Aphelenchoides, etc.)
    stainBg = '#042f2e';
    stainColor = '#0d9488';
    stainAccent = '#2dd4bf';
    magText = '600x Imersão Óptica';
    stainName = 'Contraste Nomarski / Campo Claro';
    organismSvg = `
      <!-- Vermiform Body Profile -->
      <path d="M 60 90 C 110 110, 160 140, 200 200 C 240 260, 270 310, 340 330" fill="none" stroke="url(#vermiformGrad)" stroke-width="20" stroke-linecap="round" />
      
      <!-- Flattened Lip Region (Pratylenchus/Lesion hallmark) -->
      <path d="M 52 82 L 68 95 L 60 102 Z" fill="#ccfbf1" stroke="#0f766e" stroke-width="1.5" />
      
      <!-- Massive Robust Stylet with Knobs -->
      <line x1="58" y1="87" x2="95" y2="105" stroke="#ffffff" stroke-width="3.5" />
      <circle cx="95" cy="101" r="3.5" fill="#fef08a" />
      <circle cx="99" cy="109" r="3.5" fill="#fef08a" />
      <circle cx="91" cy="107" r="3.5" fill="#fef08a" />
      
      <!-- Esophageal Median Bulb (Valvular Apparatus) -->
      <ellipse cx="140" cy="138" rx="8" ry="12" transform="rotate(30 140 138)" fill="#0f766e" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="140" cy="138" r="3" fill="#ffffff" />
      
      <!-- Overlapping Intestinal Gland Lobe -->
      <path d="M 165 160 Q 185 190, 195 220" fill="none" stroke="#14b8a6" stroke-width="12" opacity="0.7" />
      
      <!-- Vulva & Cuticle Annulations -->
      <line x1="230" y1="240" x2="245" y2="255" stroke="#ffffff" stroke-width="2.5" />
      <path d="M 80 95 L 85 110 M 110 115 L 115 130 M 175 165 L 185 180 M 265 285 L 275 300 M 310 315 L 320 328" stroke="#ffffff" stroke-width="1.5" opacity="0.5" />
      
      <!-- Hyaline Tail Tip (Zona Hialina Terminal) -->
      <path d="M 330 325 Q 345 332, 355 335" fill="none" stroke="#99f6e4" stroke-width="10" stroke-linecap="round" />
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" style="background:${stainBg}">
      <defs>
        <!-- Gradients -->
        <radialGradient id="micVignette" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stop-color="rgba(0,0,0,0)"/>
          <stop offset="95%" stop-color="rgba(0,0,0,0.65)"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0.95)"/>
        </radialGradient>
        <radialGradient id="lensGlow" cx="50%" cy="50%" r="45%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.08)"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
        </radialGradient>
        <linearGradient id="globoseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fda4af"/>
          <stop offset="50%" stop-color="#f43f5e"/>
          <stop offset="100%" stop-color="#9f1239"/>
        </linearGradient>
        <linearGradient id="goldCystGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fde68a"/>
          <stop offset="45%" stop-color="#d97706"/>
          <stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
        <linearGradient id="paleCystGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef3c7"/>
          <stop offset="50%" stop-color="#d4d4d8"/>
          <stop offset="100%" stop-color="#71717a"/>
        </linearGradient>
        <linearGradient id="spiralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f5d0fe"/>
          <stop offset="50%" stop-color="#a855f7"/>
          <stop offset="100%" stop-color="#6b21a8"/>
        </linearGradient>
        <linearGradient id="daggerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fecaca"/>
          <stop offset="50%" stop-color="#ef4444"/>
          <stop offset="100%" stop-color="#991b1b"/>
        </linearGradient>
        <linearGradient id="reniformGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fed7aa"/>
          <stop offset="50%" stop-color="#f97316"/>
          <stop offset="100%" stop-color="#9a3412"/>
        </linearGradient>
        <linearGradient id="vermiformGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ccfbf1"/>
          <stop offset="50%" stop-color="#14b8a6"/>
          <stop offset="100%" stop-color="#115e59"/>
        </linearGradient>
      </defs>

      <!-- Microscope Reticle Grid & Circular Field -->
      <circle cx="200" cy="200" r="190" fill="${stainBg}" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
      <circle cx="200" cy="200" r="140" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1" stroke-dasharray="4,4"/>
      <line x1="200" y1="10" x2="200" y2="390" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      <line x1="10" y1="200" x2="390" y2="200" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

      <!-- Organism Morphology -->
      <g>
        ${organismSvg}
      </g>

      <!-- Optical Lens Vignette & Reflections -->
      <circle cx="200" cy="200" r="190" fill="url(#micVignette)"/>
      <circle cx="200" cy="200" r="185" fill="url(#lensGlow)"/>

      <!-- Microscope Scale Bar (20 µm / 50 µm) -->
      <g transform="translate(250, 360)">
        <rect x="-5" y="-14" width="130" height="24" rx="4" fill="rgba(0,0,0,0.7)" />
        <line x1="0" y1="0" x2="100" y2="0" stroke="#ffffff" stroke-width="3" />
        <line x1="0" y1="-4" x2="0" y2="4" stroke="#ffffff" stroke-width="2" />
        <line x1="100" y1="-4" x2="100" y2="4" stroke="#ffffff" stroke-width="2" />
        <text x="50" y="-3" fill="#ffffff" font-size="10" font-family="monospace" font-weight="bold" text-anchor="middle">50 µm</text>
      </g>

      <!-- Scientific Overlay Badge -->
      <g transform="translate(18, 28)">
        <rect x="0" y="0" width="170" height="34" rx="6" fill="rgba(0,0,0,0.75)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
        <text x="8" y="14" fill="#67e8f9" font-size="9" font-family="sans-serif" font-weight="bold">${magText}</text>
        <text x="8" y="27" fill="#cbd5e1" font-size="8" font-family="sans-serif">${stainName}</text>
      </g>
    </svg>
  `;

  return svgToDataUri(svg);
}

/**
 * Gera sintomatologia de campo e danos radiculares simulados em alta resolução (SVG)
 */
export function generateNematodeFieldDamageSvg(
  speciesId: string,
  anatomyType: string = 'vermiform',
  scientificName: string = 'Nematoda sp.'
): string {
  const isCyst = anatomyType === 'cyst' || speciesId.includes('globodera') || speciesId.includes('heterodera');
  const isGlobose = anatomyType === 'globose' || speciesId.includes('meloidogyne') || speciesId.includes('nacobbus');
  const isReniform = anatomyType === 'reniform' || speciesId.includes('rotylenchulus') || speciesId.includes('tylenchulus');
  const isDagger = anatomyType === 'dagger' || speciesId.includes('xiphinema') || speciesId.includes('longidorus');
  const isSpiral = anatomyType === 'spiral' || speciesId.includes('helicotylenchus') || speciesId.includes('scutellonema');

  let damageContent = '';
  let symptomBadge = 'Lesões Corticais e Supressão Radicular';

  if (isGlobose) {
    symptomBadge = 'Galhas Radiculares Severas (Meloidoginose)';
    damageContent = `
      <!-- Main Taproot with Galls / Knots -->
      <path d="M 200 40 Q 205 100, 195 180 T 210 320 L 205 380" fill="none" stroke="#d97706" stroke-width="14" stroke-linecap="round" />
      
      <!-- Lateral Secondary Roots -->
      <path d="M 195 130 Q 130 170, 70 230" fill="none" stroke="#b45309" stroke-width="7" />
      <path d="M 200 170 Q 270 200, 330 260" fill="none" stroke="#b45309" stroke-width="7" />
      <path d="M 198 240 Q 140 280, 90 350" fill="none" stroke="#92400e" stroke-width="6" />
      <path d="M 205 280 Q 260 320, 310 370" fill="none" stroke="#92400e" stroke-width="6" />

      <!-- Massive Swollen Root Galls (Galhas Coalescentes) -->
      <ellipse cx="200" cy="110" rx="22" ry="16" fill="#f59e0b" stroke="#78350f" stroke-width="2.5" />
      <ellipse cx="195" cy="175" rx="28" ry="20" fill="#f59e0b" stroke="#78350f" stroke-width="3" />
      <ellipse cx="208" cy="265" rx="24" ry="18" fill="#f59e0b" stroke="#78350f" stroke-width="2.5" />
      <ellipse cx="135" cy="175" rx="16" ry="13" fill="#fbbf24" stroke="#78350f" stroke-width="2" />
      <ellipse cx="270" cy="205" rx="18" ry="14" fill="#fbbf24" stroke="#78350f" stroke-width="2" />
      <ellipse cx="100" cy="220" rx="14" ry="10" fill="#fbbf24" stroke="#78350f" stroke-width="2" />
      <ellipse cx="300" cy="245" rx="15" ry="11" fill="#fbbf24" stroke="#78350f" stroke-width="2" />
      <ellipse cx="140" cy="290" rx="14" ry="11" fill="#fbbf24" stroke="#78350f" stroke-width="2" />
      <ellipse cx="260" cy="325" rx="13" ry="10" fill="#fbbf24" stroke="#78350f" stroke-width="2" />
    `;
  } else if (isCyst) {
    symptomBadge = 'Fêmeas e Cistos Fixados nas Radicelas';
    damageContent = `
      <!-- Taproot and fibrous root branches -->
      <path d="M 200 40 L 200 370" fill="none" stroke="#a16207" stroke-width="12" stroke-linecap="round" />
      <path d="M 200 120 Q 140 160, 90 220" fill="none" stroke="#854d0e" stroke-width="6" />
      <path d="M 200 150 Q 260 190, 310 250" fill="none" stroke="#854d0e" stroke-width="6" />
      <path d="M 200 220 Q 130 260, 80 340" fill="none" stroke="#713f12" stroke-width="5" />
      <path d="M 200 260 Q 270 300, 320 370" fill="none" stroke="#713f12" stroke-width="5" />

      <!-- Tiny Cysts and Lemon-shaped Females Attached (Visible to Naked Eye) -->
      <g fill="#fef08a" stroke="#78350f" stroke-width="1.5">
        <circle cx="206" cy="100" r="5"/><circle cx="192" cy="135" r="5.5"/><circle cx="207" cy="180" r="6"/><circle cx="193" cy="210" r="5"/><circle cx="206" cy="250" r="5.5"/><circle cx="194" cy="290" r="6"/><circle cx="206" cy="330" r="5"/>
        <circle cx="160" cy="145" r="4.5"/><circle cx="120" cy="185" r="5"/><circle cx="95" cy="215" r="4.5"/>
        <circle cx="235" cy="170" r="5"/><circle cx="280" cy="225" r="4.5"/><circle cx="150" cy="250" r="5"/><circle cx="110" cy="290" r="4.5"/><circle cx="240" cy="285" r="5"/><circle cx="290" cy="335" r="4.5"/>
      </g>
      <!-- Dark Mature Cysts -->
      <g fill="#78350f" stroke="#fef08a" stroke-width="1">
        <circle cx="194" cy="160" r="5.5"/><circle cx="206" cy="220" r="6"/><circle cx="140" cy="165" r="5"/><circle cx="255" cy="200" r="5.5"/><circle cx="170" cy="275" r="5"/><circle cx="260" cy="310" r="5.5"/>
      </g>
    `;
  } else if (isReniform) {
    symptomBadge = 'Raiz Suja (Agregação Intensa de Solo)';
    damageContent = `
      <!-- Stunted Root System with Aggregated Soil Particles -->
      <path d="M 200 40 Q 195 150, 205 360" fill="none" stroke="#78350f" stroke-width="10" />
      <path d="M 200 130 Q 140 170, 95 240" fill="none" stroke="#78350f" stroke-width="5" />
      <path d="M 200 170 Q 260 210, 305 270" fill="none" stroke="#78350f" stroke-width="5" />
      <path d="M 200 240 Q 150 280, 110 350" fill="none" stroke="#78350f" stroke-width="4" />
      <path d="M 200 270 Q 250 310, 290 370" fill="none" stroke="#78350f" stroke-width="4" />

      <!-- Clumping of Soil Mud & Gelatinous Egg Masses -->
      <g fill="#451a03" stroke="#a16207" stroke-width="1">
        <ellipse cx="200" cy="120" rx="18" ry="12"/><ellipse cx="195" cy="180" rx="20" ry="14"/><ellipse cx="205" cy="250" rx="19" ry="13"/><ellipse cx="150" cy="165" rx="14" ry="9"/><ellipse cx="250" cy="205" rx="15" ry="10"/><ellipse cx="120" cy="215" rx="12" ry="8"/><ellipse cx="280" cy="245" rx="13" ry="8"/><ellipse cx="160" cy="275" rx="12" ry="8"/><ellipse cx="240" cy="305" rx="13" ry="9"/>
      </g>
    `;
  } else if (isDagger) {
    symptomBadge = 'Ápices em Gancho e Necrose Terminal';
    damageContent = `
      <!-- Root System with Swollen Hooked Tips (Fishhooking) -->
      <path d="M 200 40 L 200 200 Q 195 280, 160 320 Q 130 350, 100 330 Q 80 300, 110 270" fill="none" stroke="#991b1b" stroke-width="10" stroke-linecap="round" />
      <path d="M 200 140 Q 250 170, 290 230 Q 330 290, 310 330 Q 280 360, 250 330" fill="none" stroke="#991b1b" stroke-width="7" stroke-linecap="round" />
      
      <!-- Hooked Swollen Apices (Meristemas Calejados) -->
      <circle cx="100" cy="330" r="14" fill="#ef4444" stroke="#450a0a" stroke-width="2.5" />
      <circle cx="310" cy="330" r="13" fill="#ef4444" stroke="#450a0a" stroke-width="2.5" />
      <ellipse cx="180" cy="220" rx="12" ry="8" fill="#b91c1c" />
    `;
  } else {
    // Default Lesions / Vermiform (Pratylenchus etc.)
    symptomBadge = 'Lesões Necróticas Corticais & Podridão';
    damageContent = `
      <!-- Main Root with Necrotic Lesions -->
      <path d="M 200 40 L 200 370" fill="none" stroke="#d97706" stroke-width="14" stroke-linecap="round" />
      <path d="M 200 110 Q 130 150, 75 220" fill="none" stroke="#b45309" stroke-width="6" />
      <path d="M 200 160 Q 270 200, 325 270" fill="none" stroke="#b45309" stroke-width="6" />
      <path d="M 200 230 Q 140 270, 90 350" fill="none" stroke="#92400e" stroke-width="5" />
      <path d="M 200 270 Q 260 310, 305 370" fill="none" stroke="#92400e" stroke-width="5" />

      <!-- Dark Brown/Black Cortical Lesions (Lesões Escuras no Córtex) -->
      <rect x="194" y="90" width="12" height="35" rx="4" fill="#451a03" stroke="#1c1917" stroke-width="1" />
      <rect x="193" y="150" width="14" height="45" rx="5" fill="#451a03" stroke="#1c1917" stroke-width="1" />
      <rect x="194" y="225" width="12" height="40" rx="4" fill="#451a03" stroke="#1c1917" stroke-width="1" />
      <rect x="195" y="295" width="10" height="30" rx="3" fill="#451a03" stroke="#1c1917" stroke-width="1" />
      <rect x="130" y="150" width="8" height="20" rx="3" transform="rotate(-30 130 150)" fill="#451a03" />
      <rect x="250" y="190" width="8" height="22" rx="3" transform="rotate(30 250 190)" fill="#451a03" />
      <rect x="130" y="270" width="7" height="18" rx="2" transform="rotate(-30 130 270)" fill="#451a03" />
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" style="background:#18181b">
      <defs>
        <radialGradient id="fieldVignette" cx="50%" cy="50%" r="50%">
          <stop offset="65%" stop-color="rgba(0,0,0,0)"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0.8)"/>
        </radialGradient>
      </defs>

      <!-- Soil Profile Background -->
      <rect x="0" y="0" width="400" height="400" fill="#1c1917"/>
      
      <!-- Top Soil Layer / Surface Line -->
      <rect x="0" y="0" width="400" height="40" fill="#292524" />
      <line x1="0" y1="40" x2="400" y2="40" stroke="#78350f" stroke-width="3" />
      <path d="M 180 40 L 190 10 L 200 40 L 210 15 L 220 40" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>

      <!-- Root Damage Content -->
      <g>
        ${damageContent}
      </g>

      <!-- Vignette Shade -->
      <rect x="0" y="0" width="400" height="400" fill="url(#fieldVignette)" pointer-events="none"/>

      <!-- Symptom Description Tag -->
      <g transform="translate(16, 352)">
        <rect x="0" y="0" width="368" height="34" rx="6" fill="rgba(0,0,0,0.85)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
        <circle cx="16" cy="17" r="6" fill="#ef4444" />
        <text x="30" y="21" fill="#f8fafc" font-size="11" font-family="sans-serif" font-weight="bold">${symptomBadge}</text>
      </g>
    </svg>
  `;

  return svgToDataUri(svg);
}
