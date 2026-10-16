/**
 /**
 * Gerador de Ilustrações e Representações Fotográficas Offline (Data-URIs SVG)
 * Garante que todas as fotos e sintomas da Biblioteca de Doenças do Solo funcionem 100% OFFLINE,
 * sem depender de internet ou servidores externos.
 */

export function getOfflineDiseasePhoto(
  diseaseId: string,
  organ: 'root' | 'collar' | 'stem' | 'leaf' | 'seedling' | 'soil',
  title: string
): string {
  let color1 = '#3A2518';
  let color2 = '#8B4513';
  let accent = '#D2691E';

  if (diseaseId.includes('fusarium')) {
    color1 = '#5B2C1F';
    color2 = '#8B1A1A';
    accent = '#CD2626'; // Reddish vascular necrosis
  } else if (diseaseId.includes('macrophomina')) {
    color1 = '#1C1C1C';
    color2 = '#363636';
    accent = '#0A0A0A'; // Charcoal black microsclerotia
  } else if (diseaseId.includes('sclerotinia')) {
    color1 = '#2B3A28';
    color2 = '#E8E8E8';
    accent = '#111111'; // White mold + black sclerotia
  } else if (diseaseId.includes('ralstonia')) {
    color1 = '#1A331E';
    color2 = '#3D6B35';
    accent = '#F5F5F5'; // Bacterial pus streaming
  } else if (diseaseId.includes('meloidogyne')) {
    color1 = '#4A3B32';
    color2 = '#8B5A2B';
    accent = '#D9822B'; // Root galls
  } else if (diseaseId.includes('phytophthora') || diseaseId.includes('pythium')) {
    color1 = '#1F2922';
    color2 = '#3F2212';
    accent = '#7F1D1D'; // Dark water-soaked rot
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color1}" />
          <stop offset="100%" stop-color="${color2}" />
        </linearGradient>
        <pattern id="soilTexture" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="1.5" fill="#000" opacity="0.15"/>
          <circle cx="15" cy="12" r="2" fill="#fff" opacity="0.08"/>
        </pattern>
      </defs>
      
      <!-- Soil & Tissue Background -->
      <rect width="600" height="400" fill="url(#bg)" />
      <rect width="600" height="400" fill="url(#soilTexture)" />
      
      <!-- Root / Vascular Structure -->
      <g stroke="${accent}" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.85">
        <path d="M 300,30 Q 310,120 280,220 T 320,380" />
        <path d="M 290,100 Q 220,150 170,220" />
        <path d="M 305,140 Q 380,180 440,250" />
        <path d="M 285,210 Q 230,270 190,340" />
        <path d="M 315,230 Q 370,290 410,360" />
      </g>
      
      <!-- Lesion / Gall / Symptom Spots -->
      <g fill="${accent}" opacity="0.9">
        <circle cx="280" cy="220" r="18" />
        <circle cx="310" cy="120" r="14" />
        <circle cx="220" cy="150" r="12" />
        <circle cx="380" cy="180" r="15" />
        <ellipse cx="300" cy="180" rx="25" ry="40" fill="#000" opacity="0.3" />
      </g>

      <!-- Organ Icon Overlay & Label Badge -->
      <rect x="20" y="20" width="220" height="34" rx="17" fill="rgba(0,0,0,0.65)" />
      <text x="35" y="42" fill="#FFFFFF" font-family="sans-serif" font-size="13" font-weight="bold">
        📷 REGISTRO OFFLINE: ${organ.toUpperCase()}
      </text>

      <rect x="20" y="340" width="560" height="40" rx="8" fill="rgba(0,0,0,0.75)" />
      <text x="35" y="365" fill="#A7F3D0" font-family="sans-serif" font-size="14" font-weight="bold">
        ${title}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
