/**
 * Camada de Persistência Integrada — GeaAgro Estatística
 *
 * Utiliza exclusivamente a infraestrutura oficial existente do GeaAgro:
 * - Motor OPFS + WASM (`geaagro_opfs_v1` / `opfsWasmDB`)
 * - Banco estruturado `GeaAgroOfflineDB` (`offlineDB` com 9 stores `estatistica_*`)
 * - Arquivos originais imutáveis em OPFS (`estatistica_raw_*`) com checksum WASM
 * - LocalStorage exclusivamente para preferências leves de interface
 *
 * Proibido: Firebase, Firestore, Google Drive, bancos paralelos ou APIs externas.
 */

import { offlineDB } from '../../../utils/indexedDB';
import { opfsWasmDB } from '../../../services/opfsWasmDatabase';
import {
  EstatisticaProjeto,
  EstatisticaExperimento,
  EstatisticaConjuntoDados,
  EstatisticaVariavel,
  EstatisticaAnalise,
  EstatisticaResultado,
  EstatisticaGrafico,
  EstatisticaHistoricoRegistro,
  EstatisticaBackupMetadata,
  EstatisticaUiPreferences,
} from '../types/estatistica';

const UI_PREFS_KEY = 'geaagro_estatistica_ui_prefs_v1';

const DEFAULT_UI_PREFS: EstatisticaUiPreferences = {
  casasDecimais: 4,
  alphaPadrao: 0.05,
  exibirFormulas: true,
  paletaGraficoPadrao: 'scientific_emerald',
};

function uid(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const estatisticaStorage = {
  // --------------------------------------------------------------------------
  // PREFERÊNCIAS DE UI (LocalStorage leve espelhado pelo OPFS Bridge)
  // --------------------------------------------------------------------------
  getUiPreferences(): EstatisticaUiPreferences {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(UI_PREFS_KEY);
        if (raw) {
          return { ...DEFAULT_UI_PREFS, ...JSON.parse(raw) };
        }
      }
    } catch {}
    return { ...DEFAULT_UI_PREFS };
  },

  saveUiPreferences(prefs: Partial<EstatisticaUiPreferences>): EstatisticaUiPreferences {
    const merged = { ...this.getUiPreferences(), ...prefs };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(UI_PREFS_KEY, JSON.stringify(merged));
      }
    } catch {}
    return merged;
  },

  // --------------------------------------------------------------------------
  // HISTÓRICO DE AUDITORIA CIENTÍFICA
  // --------------------------------------------------------------------------
  async registrarHistorico(
    entry: Omit<EstatisticaHistoricoRegistro, 'id' | 'timestamp'>
  ): Promise<EstatisticaHistoricoRegistro> {
    const rec: EstatisticaHistoricoRegistro = {
      id: uid('hist'),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    await offlineDB.put('estatistica_historico', rec, true);
    return rec;
  },

  async listarHistorico(experimentoId?: string): Promise<EstatisticaHistoricoRegistro[]> {
    const all = await offlineDB.getAll<EstatisticaHistoricoRegistro>('estatistica_historico');
    const filtered = experimentoId
      ? all.filter((h) => h.experimentoId === experimentoId)
      : all;
    return filtered.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  // --------------------------------------------------------------------------
  // PROJETOS DE PESQUISA
  // --------------------------------------------------------------------------
  async listarProjetos(): Promise<EstatisticaProjeto[]> {
    const items = await offlineDB.getAll<EstatisticaProjeto>('estatistica_projetos');
    return items.sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
  },

  async salvarProjeto(
    input: Omit<EstatisticaProjeto, 'id' | 'criadoEm' | 'atualizadoEm'> & { id?: string }
  ): Promise<EstatisticaProjeto> {
    const now = new Date().toISOString();
    const existing = input.id
      ? await offlineDB.get<EstatisticaProjeto>('estatistica_projetos', input.id)
      : null;

    const projeto: EstatisticaProjeto = {
      id: input.id || uid('proj'),
      nome: input.nome.trim() || 'Projeto sem título',
      descricao: input.descricao || '',
      categoria: input.categoria || 'Experimentação Agrícola',
      pesquisador: input.pesquisador || '',
      instituicao: input.instituicao || '',
      culturaOuArea: input.culturaOuArea || '',
      localidade: input.localidade || '',
      tags: Array.isArray(input.tags) ? input.tags : [],
      status: input.status || 'ativo',
      criadoEm: existing?.criadoEm || now,
      atualizadoEm: now,
    };

    await offlineDB.put('estatistica_projetos', projeto);
    await this.registrarHistorico({
      projetoId: projeto.id,
      acao: existing ? 'edicao' : 'criacao',
      entidade: 'Projeto',
      descricao: `${existing ? 'Atualizado' : 'Criado'} projeto "${projeto.nome}"`,
    });
    return projeto;
  },

  async duplicarProjeto(projetoId: string): Promise<EstatisticaProjeto | null> {
    const orig = await offlineDB.get<EstatisticaProjeto>('estatistica_projetos', projetoId);
    if (!orig) return null;
    const copia = await this.salvarProjeto({
      ...orig,
      id: undefined,
      nome: `${orig.nome} (Cópia)`,
      status: 'ativo',
    });

    const experimentos = await this.listarExperimentos(projetoId);
    for (const exp of experimentos) {
      await this.duplicarExperimento(exp.id, copia.id);
    }

    await this.registrarHistorico({
      projetoId: copia.id,
      acao: 'duplicacao',
      entidade: 'Projeto',
      descricao: `Duplicado projeto "${orig.nome}" para "${copia.nome}"`,
    });
    return copia;
  },

  async arquivarProjeto(projetoId: string, arquivar = true): Promise<void> {
    const proj = await offlineDB.get<EstatisticaProjeto>('estatistica_projetos', projetoId);
    if (!proj) return;
    proj.status = arquivar ? 'arquivado' : 'ativo';
    proj.atualizadoEm = new Date().toISOString();
    await offlineDB.put('estatistica_projetos', proj);
    await this.registrarHistorico({
      projetoId,
      acao: 'arquivamento',
      entidade: 'Projeto',
      descricao: `Projeto "${proj.nome}" ${arquivar ? 'arquivado' : 'reativado'}`,
    });
  },

  async excluirProjeto(projetoId: string): Promise<void> {
    const exps = await this.listarExperimentos(projetoId);
    for (const exp of exps) {
      await this.excluirExperimento(exp.id);
    }
    const proj = await offlineDB.get<EstatisticaProjeto>('estatistica_projetos', projetoId);
    await offlineDB.delete('estatistica_projetos', projetoId);
    await this.registrarHistorico({
      projetoId,
      acao: 'exclusao',
      entidade: 'Projeto',
      descricao: `Excluído projeto "${proj?.nome || projetoId}" e seus ${exps.length} experimento(s)`,
    });
  },

  // --------------------------------------------------------------------------
  // EXPERIMENTOS
  // --------------------------------------------------------------------------
  async listarExperimentos(projetoId?: string): Promise<EstatisticaExperimento[]> {
    const all = await offlineDB.getAll<EstatisticaExperimento>('estatistica_experimentos');
    const filtered = projetoId ? all.filter((e) => e.projetoId === projetoId) : all;
    return filtered.sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
  },

  async obterExperimento(id: string): Promise<EstatisticaExperimento | null> {
    return offlineDB.get<EstatisticaExperimento>('estatistica_experimentos', id);
  },

  async salvarExperimento(
    input: Omit<EstatisticaExperimento, 'id' | 'criadoEm' | 'atualizadoEm'> & { id?: string }
  ): Promise<EstatisticaExperimento> {
    const now = new Date().toISOString();
    const existing = input.id
      ? await offlineDB.get<EstatisticaExperimento>('estatistica_experimentos', input.id)
      : null;

    const exp: EstatisticaExperimento = {
      id: input.id || uid('exp'),
      projetoId: input.projetoId,
      nome: input.nome.trim() || 'Experimento sem título',
      descricao: input.descricao || '',
      objetivo: input.objetivo || '',
      delineamento: input.delineamento || 'DIC',
      mapeamento: input.mapeamento || { respostaCols: [] },
      alphaPadrao: input.alphaPadrao ?? 0.05,
      status: input.status || 'rascunho',
      criadoEm: existing?.criadoEm || now,
      atualizadoEm: now,
    };

    await offlineDB.put('estatistica_experimentos', exp);
    await this.registrarHistorico({
      projetoId: exp.projetoId,
      experimentoId: exp.id,
      acao: existing ? 'edicao' : 'criacao',
      entidade: 'Experimento',
      descricao: `${existing ? 'Atualizado' : 'Criado'} experimento "${exp.nome}" (${exp.delineamento})`,
    });
    return exp;
  },

  async duplicarExperimento(
    experimentoId: string,
    targetProjetoId?: string
  ): Promise<EstatisticaExperimento | null> {
    const orig = await this.obterExperimento(experimentoId);
    if (!orig) return null;

    const novoExp = await this.salvarExperimento({
      ...orig,
      id: undefined,
      projetoId: targetProjetoId || orig.projetoId,
      nome: targetProjetoId ? orig.nome : `${orig.nome} (Cópia)`,
    });

    const dados = await this.obterConjuntoDados(experimentoId);
    if (dados) {
      let copiedRawKey: string | null = null;
      if (dados.rawArtifactKey) {
        const rawArtifact = await opfsWasmDB.readArtifactFile(dados.rawArtifactKey);
        if (rawArtifact) {
          copiedRawKey = `estatistica_raw_${novoExp.id}_${Date.now()}`;
          await opfsWasmDB.saveArtifactFile(
            copiedRawKey,
            rawArtifact.bytes,
            rawArtifact.record.mimeType
          );
        }
      }
      await this.salvarConjuntoDados({
        ...dados,
        id: uid('ds'),
        experimentoId: novoExp.id,
        rawArtifactKey: copiedRawKey,
      });
    }

    const vars = await this.listarVariaveis(experimentoId);
    for (const v of vars) {
      await this.salvarVariavel({ ...v, id: undefined, experimentoId: novoExp.id });
    }

    await this.registrarHistorico({
      projetoId: novoExp.projetoId,
      experimentoId: novoExp.id,
      acao: 'duplicacao',
      entidade: 'Experimento',
      descricao: `Experimento "${orig.nome}" duplicado`,
    });
    return novoExp;
  },

  async excluirExperimento(experimentoId: string): Promise<void> {
    const exp = await this.obterExperimento(experimentoId);
    const ds = await this.obterConjuntoDados(experimentoId);
    if (ds) {
      if (ds.rawArtifactKey) {
        await opfsWasmDB.deleteArtifactFile(ds.rawArtifactKey);
      }
      await offlineDB.delete('estatistica_dados', ds.id);
    }

    const vars = await this.listarVariaveis(experimentoId);
    for (const v of vars) await offlineDB.delete('estatistica_variaveis', v.id);

    const analises = await this.listarAnalises(experimentoId);
    for (const a of analises) await offlineDB.delete('estatistica_analises', a.id);

    const resultados = await this.listarResultados(experimentoId);
    for (const r of resultados) await offlineDB.delete('estatistica_resultados', r.id);

    const graficos = await this.listarGraficos(experimentoId);
    for (const g of graficos) await offlineDB.delete('estatistica_graficos', g.id);

    await offlineDB.delete('estatistica_experimentos', experimentoId);
    await this.registrarHistorico({
      projetoId: exp?.projetoId,
      experimentoId,
      acao: 'exclusao',
      entidade: 'Experimento',
      descricao: `Excluído experimento "${exp?.nome || experimentoId}"`,
    });
  },

  // --------------------------------------------------------------------------
  // CONJUNTOS DE DADOS & ARQUIVOS ORIGINAIS IMUTÁVEIS EM OPFS
  // --------------------------------------------------------------------------
  async obterConjuntoDados(experimentoId: string): Promise<EstatisticaConjuntoDados | null> {
    const all = await offlineDB.getAll<EstatisticaConjuntoDados>('estatistica_dados');
    return all.find((d) => d.experimentoId === experimentoId) || null;
  },

  async salvarArquivoOriginalOpfs(
    experimentoId: string,
    fileName: string,
    bytes: Uint8Array | string,
    mimeType: string
  ): Promise<{ artifactKey: string; checksum: number; sizeBytes: number }> {
    const safeKey = `estatistica_raw_${experimentoId}_${Date.now()}`;
    const rec = await opfsWasmDB.saveArtifactFile(safeKey, bytes, mimeType);
    await this.registrarHistorico({
      experimentoId,
      acao: 'importacao',
      entidade: 'Arquivo Original (OPFS)',
      descricao: `Arquivo original "${fileName}" preservado de forma imutável no OPFS (${rec.sizeBytes} bytes, checksum WASM ${rec.checksum})`,
    });
    return {
      artifactKey: safeKey,
      checksum: rec.checksum,
      sizeBytes: rec.sizeBytes,
    };
  },

  async lerArquivoOriginalOpfs(artifactKey: string) {
    return opfsWasmDB.readArtifactFile(artifactKey);
  },

  async salvarConjuntoDados(
    input: Omit<EstatisticaConjuntoDados, 'workingChecksum' | 'criadoEm' | 'atualizadoEm'> & {
      criadoEm?: string;
    }
  ): Promise<EstatisticaConjuntoDados> {
    const now = new Date().toISOString();
    const existing = await offlineDB.get<EstatisticaConjuntoDados>('estatistica_dados', input.id);
    const payloadStr = JSON.stringify({ colunas: input.colunas, linhas: input.linhasWorking });
    const workingChecksum = opfsWasmDB.calculateWasmChecksum(payloadStr);

    const ds: EstatisticaConjuntoDados = {
      ...input,
      workingChecksum,
      versao: existing ? existing.versao + 1 : input.versao || 1,
      criadoEm: existing?.criadoEm || input.criadoEm || now,
      atualizadoEm: now,
    };

    await offlineDB.put('estatistica_dados', ds);
    return ds;
  },

  // --------------------------------------------------------------------------
  // VARIÁVEIS EXPERIMENTAIS
  // --------------------------------------------------------------------------
  async listarVariaveis(experimentoId: string): Promise<EstatisticaVariavel[]> {
    const all = await offlineDB.getAll<EstatisticaVariavel>('estatistica_variaveis');
    return all.filter((v) => v.experimentoId === experimentoId);
  },

  async salvarVariavel(
    input: Omit<EstatisticaVariavel, 'id' | 'criadoEm'> & { id?: string }
  ): Promise<EstatisticaVariavel> {
    const existing = input.id
      ? await offlineDB.get<EstatisticaVariavel>('estatistica_variaveis', input.id)
      : null;
    const variavel: EstatisticaVariavel = {
      ...input,
      id: input.id || uid('var'),
      criadoEm: existing?.criadoEm || new Date().toISOString(),
    };
    await offlineDB.put('estatistica_variaveis', variavel);
    return variavel;
  },

  async substituirVariaveisExperimento(
    experimentoId: string,
    novasVariaveis: Omit<EstatisticaVariavel, 'id' | 'criadoEm'>[]
  ): Promise<EstatisticaVariavel[]> {
    const atuais = await this.listarVariaveis(experimentoId);
    for (const v of atuais) {
      await offlineDB.delete('estatistica_variaveis', v.id);
    }
    const salvas: EstatisticaVariavel[] = [];
    for (const nv of novasVariaveis) {
      const saved = await this.salvarVariavel({ ...nv, experimentoId });
      salvas.push(saved);
    }
    return salvas;
  },

  // --------------------------------------------------------------------------
  // ANÁLISES & RESULTADOS
  // --------------------------------------------------------------------------
  async listarAnalises(experimentoId?: string): Promise<EstatisticaAnalise[]> {
    const all = await offlineDB.getAll<EstatisticaAnalise>('estatistica_analises');
    const filtered = experimentoId ? all.filter((a) => a.experimentoId === experimentoId) : all;
    return filtered.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  },

  async listarResultados(experimentoId?: string): Promise<EstatisticaResultado[]> {
    const all = await offlineDB.getAll<EstatisticaResultado>('estatistica_resultados');
    const filtered = experimentoId ? all.filter((r) => r.experimentoId === experimentoId) : all;
    return filtered.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  },

  async salvarAnaliseEResultado(
    analiseInput: Omit<EstatisticaAnalise, 'id' | 'criadoEm'>,
    resultadoInput: Omit<EstatisticaResultado, 'id' | 'analiseId' | 'criadoEm' | 'checksumDados'>
  ): Promise<{ analise: EstatisticaAnalise; resultado: EstatisticaResultado }> {
    const now = new Date().toISOString();
    const analise: EstatisticaAnalise = {
      id: uid('anl'),
      criadoEm: now,
      ...analiseInput,
    };
    const checksumDados = opfsWasmDB.calculateWasmChecksum(JSON.stringify(resultadoInput.dados));
    const resultado: EstatisticaResultado = {
      id: uid('res'),
      analiseId: analise.id,
      criadoEm: now,
      checksumDados,
      ...resultadoInput,
    };

    await offlineDB.put('estatistica_analises', analise);
    await offlineDB.put('estatistica_resultados', resultado);
    await this.registrarHistorico({
      experimentoId: analise.experimentoId,
      acao: 'analise',
      entidade: resultado.titulo,
      descricao: `Executada análise ${resultado.titulo} (${resultado.subtipo})`,
    });

    return { analise, resultado };
  },

  async excluirResultado(resultadoId: string): Promise<void> {
    const res = await offlineDB.get<EstatisticaResultado>('estatistica_resultados', resultadoId);
    if (res) {
      await offlineDB.delete('estatistica_analises', res.analiseId);
      await offlineDB.delete('estatistica_resultados', resultadoId);
    }
  },

  // --------------------------------------------------------------------------
  // GRÁFICOS CIENTÍFICOS SALVOS
  // --------------------------------------------------------------------------
  async listarGraficos(experimentoId?: string): Promise<EstatisticaGrafico[]> {
    const all = await offlineDB.getAll<EstatisticaGrafico>('estatistica_graficos');
    const filtered = experimentoId ? all.filter((g) => g.experimentoId === experimentoId) : all;
    return filtered.sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
  },

  async salvarGrafico(
    input: Omit<EstatisticaGrafico, 'id' | 'criadoEm' | 'atualizadoEm'> & { id?: string }
  ): Promise<EstatisticaGrafico> {
    const now = new Date().toISOString();
    const existing = input.id
      ? await offlineDB.get<EstatisticaGrafico>('estatistica_graficos', input.id)
      : null;
    const grafico: EstatisticaGrafico = {
      ...input,
      id: input.id || uid('graf'),
      criadoEm: existing?.criadoEm || now,
      atualizadoEm: now,
    };
    await offlineDB.put('estatistica_graficos', grafico);
    await this.registrarHistorico({
      experimentoId: grafico.experimentoId,
      acao: 'grafico',
      entidade: 'Gráfico Científico',
      descricao: `Salvo gráfico "${grafico.nome}" (${grafico.configuracao.tipo})`,
    });
    return grafico;
  },

  async excluirGrafico(id: string): Promise<void> {
    await offlineDB.delete('estatistica_graficos', id);
  },

  // --------------------------------------------------------------------------
  // METADADOS DE BACKUP E MONITORAMENTO DE QUOTA OPFS
  // --------------------------------------------------------------------------
  async registrarMetadataBackup(
    meta: Omit<EstatisticaBackupMetadata, 'id' | 'criadoEm'>
  ): Promise<EstatisticaBackupMetadata> {
    const rec: EstatisticaBackupMetadata = {
      id: uid('bmeta'),
      criadoEm: new Date().toISOString(),
      ...meta,
    };
    await offlineDB.put('estatistica_backups_metadata', rec);
    return rec;
  },

  async listarBackupsMetadata(): Promise<EstatisticaBackupMetadata[]> {
    const all = await offlineDB.getAll<EstatisticaBackupMetadata>('estatistica_backups_metadata');
    return all.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  },

  async obterStatusArmazenamento(): Promise<{
    engine: string;
    usageBytes: number;
    quotaBytes: number;
    percentage: number;
    isPersistent: boolean;
    totalProjetos: number;
    totalExperimentos: number;
    totalResultados: number;
    totalGraficos: number;
    artefatosOpfsCount: number;
  }> {
    const [diag, projetos, experimentos, resultados, graficos, artifacts] = await Promise.all([
      opfsWasmDB.getEngineDiagnostics(),
      offlineDB.count('estatistica_projetos'),
      offlineDB.count('estatistica_experimentos'),
      offlineDB.count('estatistica_resultados'),
      offlineDB.count('estatistica_graficos'),
      opfsWasmDB.listArtifactFiles('estatistica_'),
    ]);

    return {
      engine: diag.engine,
      usageBytes: diag.storageEstimateBytes,
      quotaBytes: diag.storageQuotaBytes,
      percentage: diag.usagePercentage,
      isPersistent: diag.isPersistent,
      totalProjetos: projetos,
      totalExperimentos: experimentos,
      totalResultados: resultados,
      totalGraficos: graficos,
      artefatosOpfsCount: artifacts.length,
    };
  },
};
