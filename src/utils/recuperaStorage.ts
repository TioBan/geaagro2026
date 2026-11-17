/**
 * GeaAgro Recupera - Armazenamento Local Estruturado (Offline-First)
 * Gerencia persistência de propriedades, áreas degradadas, diagnósticos,
 * análises laboratoriais, projetos de recuperação, monitoramentos, custos e cronogramas.
 */

import {
  PropriedadeRecupera,
  AreaDegradadaItem,
  DiagnosticoTecnicoCompleto,
  AnaliseSoloItem,
  ProjetoRecuperacao,
  MonitoramentoVisita,
  ItemCustoRecuperacao,
  AtividadeCronograma,
  PontoInteresseGps,
  StatusSincronizacaoRecupera
} from '../types/recupera';

const STORAGE_KEYS = {
  PROPRIEDADES: 'geaagro_recupera_propriedades_v1',
  AREAS: 'geaagro_recupera_areas_v1',
  DIAGNOSTICOS: 'geaagro_recupera_diagnosticos_v1',
  ANALISES: 'geaagro_recupera_analises_v1',
  PROJETOS: 'geaagro_recupera_projetos_v1',
  MONITORAMENTOS: 'geaagro_recupera_monitoramentos_v1',
  CUSTOS: 'geaagro_recupera_custos_v1',
  CRONOGRAMAS: 'geaagro_recupera_cronogramas_v1',
  PONTOS_GPS: 'geaagro_recupera_pontos_gps_v1',
  SELECTED_PROP_ID: 'geaagro_recupera_selected_prop_id',
  SELECTED_AREA_ID: 'geaagro_recupera_selected_area_id',
  LAST_SYNC: 'geaagro_recupera_last_sync_timestamp'
} as const;

function lerLista<T>(chave: string): T[] {
  try {
    const raw = localStorage.getItem(chave);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error(`Erro ao ler ${chave}:`, e);
    return [];
  }
}

function lerListaPorArea<T extends { areaId: string }>(chave: string, areaId?: string): T[] {
  const lista = lerLista<T>(chave);
  return areaId ? lista.filter(item => item.areaId === areaId) : lista;
}

function salvarLista<T>(chave: string, lista: T[]): void {
  try {
    localStorage.setItem(chave, JSON.stringify(lista));
  } catch (e) {
    console.error(`Erro ao salvar ${chave}:`, e);
  }
}

// ==========================================
// ESTRUTURAS LIMPAS (SEM PRÉ-PREENCHIMENTO FORÇADO)
// ==========================================

export function criarPropriedadeVaziaRecupera(): PropriedadeRecupera {
  return {
    id: `prop-recupera-${Date.now()}`,
    nome: '',
    produtorNome: '',
    produtorCpfCnpj: '',
    municipio: '',
    estado: '',
    carNumero: '',
    ccirNumero: '',
    matricula: '',
    areaTotalHa: 0,
    areaPreservacaoPermanenteHa: 0,
    areaReservaLegalHa: 0,
    areaProdutivaHa: 0,
    coordenadasSede: {
      latitude: 0,
      longitude: 0,
      altitude: 0,
      precisaoM: 0
    },
    responsavelTecnico: '',
    creaNumero: '',
    artNumero: '',
    historicoGeral: '',
    fotografias: [],
    observacoes: ''
  };
}

// ==========================================
// PROPRIEDADES & ÁREAS
// ==========================================

export function carregarPropriedadesRecupera(): PropriedadeRecupera[] {
  // Ignora eventual seed legado não editado para evitar talhão/fazenda pré-selecionado
  return lerLista<PropriedadeRecupera>(STORAGE_KEYS.PROPRIEDADES).filter(
    p => !(p.id === 'prop-recupera-01' && p.nome === 'Fazenda Modelo GeaAgro')
  );
}

export function salvarPropriedadesRecupera(props: PropriedadeRecupera[]): void {
  salvarLista(STORAGE_KEYS.PROPRIEDADES, props);
}

export function carregarPropriedadeSelecionadaId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEYS.SELECTED_PROP_ID) || '';
    const props = carregarPropriedadesRecupera();
    return props.some(p => p.id === id) ? id : (props[0]?.id || '');
  } catch {
    return '';
  }
}

export function salvarPropriedadeSelecionadaId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_PROP_ID, id);
  } catch (e) {
    console.error(e);
  }
}

export function carregarAreasRecupera(propId?: string): AreaDegradadaItem[] {
  const limpas = lerLista<AreaDegradadaItem>(STORAGE_KEYS.AREAS).filter(
    a => !(a.id === 'area-recupera-01' && a.nomeTalhao === 'Talhão 01 - Pasto Baixada')
  );
  return propId ? limpas.filter(a => a.propriedadeId === propId) : limpas;
}

export function salvarAreasRecupera(areas: AreaDegradadaItem[]): void {
  salvarLista(STORAGE_KEYS.AREAS, areas);
}

export function carregarAreaSelecionadaId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEYS.SELECTED_AREA_ID) || '';
    if (!id) return '';
    return carregarAreasRecupera().some(a => a.id === id) ? id : '';
  } catch {
    return '';
  }
}

export function salvarAreaSelecionadaId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_AREA_ID, id);
  } catch (e) {
    console.error(e);
  }
}

// ==========================================
// ENTIDADES VINCULADAS (DIAGNÓSTICOS, ANÁLISES, PROJETOS, ETC.)
// ==========================================

export function carregarDiagnosticos(areaId?: string): DiagnosticoTecnicoCompleto[] {
  return lerListaPorArea<DiagnosticoTecnicoCompleto>(STORAGE_KEYS.DIAGNOSTICOS, areaId);
}

export function salvarDiagnosticos(diagnosticos: DiagnosticoTecnicoCompleto[]): void {
  salvarLista(STORAGE_KEYS.DIAGNOSTICOS, diagnosticos);
}

export function carregarAnalisesSolo(areaId?: string): AnaliseSoloItem[] {
  return lerListaPorArea<AnaliseSoloItem>(STORAGE_KEYS.ANALISES, areaId);
}

export function salvarAnalisesSolo(analises: AnaliseSoloItem[]): void {
  salvarLista(STORAGE_KEYS.ANALISES, analises);
}

export function carregarProjetosRecupera(areaId?: string): ProjetoRecuperacao[] {
  return lerListaPorArea<ProjetoRecuperacao>(STORAGE_KEYS.PROJETOS, areaId);
}

export function salvarProjetosRecupera(projetos: ProjetoRecuperacao[]): void {
  salvarLista(STORAGE_KEYS.PROJETOS, projetos);
}

export function carregarMonitoramentos(areaId?: string): MonitoramentoVisita[] {
  return lerListaPorArea<MonitoramentoVisita>(STORAGE_KEYS.MONITORAMENTOS, areaId);
}

export function salvarMonitoramentos(monit: MonitoramentoVisita[]): void {
  salvarLista(STORAGE_KEYS.MONITORAMENTOS, monit);
}

export function carregarCustosRecupera(areaId?: string): ItemCustoRecuperacao[] {
  return lerListaPorArea<ItemCustoRecuperacao>(STORAGE_KEYS.CUSTOS, areaId);
}

export function salvarCustosRecupera(custos: ItemCustoRecuperacao[]): void {
  salvarLista(STORAGE_KEYS.CUSTOS, custos);
}

export function carregarCronogramasRecupera(): AtividadeCronograma[] {
  return lerLista<AtividadeCronograma>(STORAGE_KEYS.CRONOGRAMAS);
}

export function salvarCronogramasRecupera(atividades: AtividadeCronograma[]): void {
  salvarLista(STORAGE_KEYS.CRONOGRAMAS, atividades);
}

export function carregarPontosGpsRecupera(): PontoInteresseGps[] {
  return lerLista<PontoInteresseGps>(STORAGE_KEYS.PONTOS_GPS);
}

export function salvarPontosGpsRecupera(pontos: PontoInteresseGps[]): void {
  salvarLista(STORAGE_KEYS.PONTOS_GPS, pontos);
}

// ==========================================
// STATUS DE SINCRONIZAÇÃO E BACKUP
// ==========================================

export function obterStatusSincronizacaoRecupera(totalRegistrosPreComputado?: number): StatusSincronizacaoRecupera {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  const totalRegistros =
    totalRegistrosPreComputado ??
    carregarAreasRecupera().length + carregarDiagnosticos().length + carregarProjetosRecupera().length;

  return {
    ultimaSincronizacao: lastSync || 'Não sincronizado recentemente',
    registrosLocaisPendentes: totalRegistros,
    registrosSincronizados: totalRegistros,
    conflitosPendentes: 0,
    modoOfflineAtivo: !isOnline,
    versaoBancoLocal: 'GeaAgro Recupera DB v1.0.0 (Offline-First)'
  };
}

export function registrarSincronizacaoRealizada(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toLocaleString('pt-BR'));
  } catch (e) {
    console.error(e);
  }
}

export function resetarTodosOsDadosRecupera(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  } catch (e) {
    console.error('Erro ao resetar dados Recupera:', e);
  }
}

export function exportarBackupJsonRecupera(): string {
  const backup = {
    versao: '1.0',
    dataExportacao: new Date().toISOString(),
    modulo: 'GeaAgro Recupera - Recuperação de Áreas Degradadas',
    propriedades: carregarPropriedadesRecupera(),
    areas: carregarAreasRecupera(),
    diagnosticos: carregarDiagnosticos(),
    analises: carregarAnalisesSolo(),
    projetos: carregarProjetosRecupera(),
    monitoramentos: carregarMonitoramentos(),
    custos: carregarCustosRecupera(),
    cronogramas: carregarCronogramasRecupera(),
    pontosGps: carregarPontosGpsRecupera()
  };
  return JSON.stringify(backup, null, 2);
}

export function restaurarBackupJsonRecupera(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.propriedades) salvarPropriedadesRecupera(data.propriedades);
    if (data.areas) salvarAreasRecupera(data.areas);
    if (data.diagnosticos) salvarDiagnosticos(data.diagnosticos);
    if (data.analises) salvarAnalisesSolo(data.analises);
    if (data.projetos) salvarProjetosRecupera(data.projetos);
    if (data.monitoramentos) salvarMonitoramentos(data.monitoramentos);
    if (data.custos) salvarCustosRecupera(data.custos);
    if (data.cronogramas) salvarCronogramasRecupera(data.cronogramas);
    if (data.pontosGps) salvarPontosGpsRecupera(data.pontosGps);
    return true;
  } catch (e) {
    console.error('Erro ao restaurar backup Recupera:', e);
    return false;
  }
}
