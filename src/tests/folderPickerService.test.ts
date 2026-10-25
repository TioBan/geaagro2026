// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import {
  validateFolderSelection,
  isHarmlessHiddenFile,
  isProtectedOsDirectory,
  pickFolderViaWebkitDirectory,
  pickBackupFolder,
  HARMLESS_HIDDEN_FILES,
  PRESET_BACKUP_FOLDERS,
  saveBackupFileWithNativePicker
} from '../services/folderPickerService';

describe('GeaAgro Folder Selection and Validation (Fase 1 / Resolução de Pastas do Sistema)', () => {
  // 1. Seleção de uma pasta comum na Área de Trabalho
  it('1. deve permitir a seleção de uma pasta comum na Área de Trabalho sem bloqueios', () => {
    const desktopNames = [
      'Área de Trabalho',
      'Area de Trabalho',
      'Desktop',
      'Backups_GeaAgro_Desktop',
      'C:\\Users\\Agronomo\\Desktop\\GeaAgro'
    ];

    for (const name of desktopNames) {
      const result = validateFolderSelection(name, [
        { name: 'backup_2026.json', path: `${name}/backup_2026.json` }
      ]);

      expect(result.isValid, `Pasta "${name}" deve ser considerada válida`).toBe(true);
      expect(result.status).toBe('valid');
      expect(result.folderName).toBe(name);
      expect(result.folderPath).toContain('/GeaAgro_Backups/');
    }
  });

  // 2. Seleção de uma pasta comum em Downloads
  it('2. deve permitir a seleção de uma pasta comum em Downloads sem bloqueios', () => {
    const downloadNames = [
      'Downloads',
      'Meus_Downloads',
      '/home/usuario/Downloads/Backups',
      'D:\\Downloads\\Fazenda_Santa_Luzia'
    ];

    for (const name of downloadNames) {
      const result = validateFolderSelection(name, [
        { name: 'laudo_safra.pdf', path: `${name}/laudo_safra.pdf` }
      ]);

      expect(result.isValid, `Pasta "${name}" deve ser considerada válida`).toBe(true);
      expect(result.status).toBe('valid');
      expect(result.folderName).toBe(name);
      expect(result.folderPath).toContain(name);
    }
  });

  // 3. Pastas com arquivos ocultos ou de configuração
  it('3. deve aceitar pastas contendo arquivos ocultos, desktop.ini, .DS_Store, .git ou de configuração sem falsos positivos', () => {
    const filesWithHidden = [
      { name: 'desktop.ini', path: 'Meus_Backups/desktop.ini' },
      { name: 'Thumbs.db', path: 'Meus_Backups/Thumbs.db' },
      { name: '.DS_Store', path: 'Meus_Backups/.DS_Store' },
      { name: '.git', path: 'Meus_Backups/.git' },
      { name: '.gitignore', path: 'Meus_Backups/.gitignore' },
      { name: '.env', path: 'Meus_Backups/.env' },
      { name: 'config.json', path: 'Meus_Backups/config.json' },
      { name: 'backup_safra.json', path: 'Meus_Backups/backup_safra.json' }
    ];

    const result = validateFolderSelection('Meus_Backups', filesWithHidden);

    expect(result.isValid, 'Pastas com arquivos ocultos NÃO devem ser bloqueadas').toBe(true);
    expect(result.status).toBe('valid');
    expect(result.hasHiddenOrConfigFiles).toBe(true);
    expect(result.hiddenFilesCount).toBe(6); // desktop.ini, Thumbs.db, .DS_Store, .git, .gitignore, .env
    expect(result.validFilesCount).toBe(2); // config.json, backup_safra.json
    expect(result.message.toLowerCase()).toContain('arquivos ocultos/configuração detectados');
  });

  it('3.1 deve identificar corretamente arquivos inofensivos de sistema e metadados', () => {
    expect(isHarmlessHiddenFile('desktop.ini')).toBe(true);
    expect(isHarmlessHiddenFile('DESKTOP.INI')).toBe(true);
    expect(isHarmlessHiddenFile('thumbs.db')).toBe(true);
    expect(isHarmlessHiddenFile('.DS_Store')).toBe(true);
    expect(isHarmlessHiddenFile('.git')).toBe(true);
    expect(isHarmlessHiddenFile('.anything')).toBe(true);
    expect(isHarmlessHiddenFile('planilha_adubacao.xlsx')).toBe(false);
  });

  // 4. Cancelamento da seleção
  it('4. deve tratar cancelamento da seleção de pasta com elegância e mensagem específica', async () => {
    // Simula showDirectoryPicker lançando AbortError (usuário cancelou a caixa de diálogo)
    const mockShowDirectoryPicker = vi.fn().mockRejectedValue({
      name: 'AbortError',
      message: 'The user aborted a request.'
    });

    (window as any).showDirectoryPicker = mockShowDirectoryPicker;

    const result = await pickBackupFolder();

    expect(result.success).toBe(false);
    expect(result.status).toBe('cancelled');
    expect(result.message).toContain('cancelada pelo usuário');
  });

  // 5. Permissão negada e diretório inacessível
  it('5. deve tratar permissão negada (NotAllowedError) com mensagem clara ao usuário', async () => {
    const mockShowDirectoryPicker = vi.fn().mockRejectedValue({
      name: 'NotAllowedError',
      message: 'The request is not allowed by the user agent or the platform.'
    });

    (window as any).showDirectoryPicker = mockShowDirectoryPicker;

    const result = await pickBackupFolder();

    expect(result.success).toBe(false);
    expect(result.status).toBe('permission_denied');
    expect(result.message).toContain('Permissão de acesso à pasta foi negada');
  });

  it('5.1 deve bloquear somente diretórios protegidos reais do sistema operacional (ex: C:\\Windows\\System32, /proc)', () => {
    const genuineSystemPaths = [
      'C:\\Windows\\System32',
      'C:/Windows',
      'C:\\Program Files',
      '/system/bin',
      '/usr/bin',
      '/proc',
      '/sys'
    ];

    for (const sysPath of genuineSystemPaths) {
      expect(isProtectedOsDirectory(sysPath), `Caminho "${sysPath}" deve ser reconhecido como sistema protegido`).toBe(true);

      const result = validateFolderSelection('System32', [], sysPath);
      expect(result.isValid).toBe(false);
      expect(result.status).toBe('restricted_system');
      expect(result.message).toContain('pasta protegida do sistema operacional');
    }
  });

  // 6. Tratamento correto de erros, sem falsos positivos de “pasta do sistema”
  it('6. quando showDirectoryPicker lançar SecurityError (Chromium restringindo raiz de Desktop/Downloads), deve executar fallback para seletor universal', async () => {
    // Simula o erro do Chromium ao tentar selecionar Desktop ou Downloads com showDirectoryPicker
    const mockShowDirectoryPicker = vi.fn().mockRejectedValue({
      name: 'SecurityError',
      message: 'The directory selected was sensitive and cannot be accessed.'
    });

    (window as any).showDirectoryPicker = mockShowDirectoryPicker;

    // Mock do input file webkitdirectory
    const mockInput = document.createElement('input');
    mockInput.type = 'file';

    const fallbackPromise = pickBackupFolder({ fallbackInputRef: mockInput });

    // Aguarda resolução da rejeição do showDirectoryPicker e montagem do listener do fallback
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Simula o evento de seleção do usuário no input fallback
    const file = new File(['{"backup": true}'], 'backup.json', { type: 'application/json' });
    Object.defineProperty(file, 'webkitRelativePath', {
      value: 'Área de Trabalho/backup.json'
    });

    Object.defineProperty(mockInput, 'files', {
      value: [file]
    });

    mockInput.dispatchEvent(new Event('change'));

    const result = await fallbackPromise;

    expect(result.success).toBe(true);
    expect(result.status).toBe('success');
    expect(result.folderName).toBe('Área de Trabalho');
    expect(result.folderPath).toContain('/Aparelho/Área de Trabalho/GeaAgro_Backups/');
  });

  it('6.1 seletor universal webkitdirectory deve extrair nome correto da pasta a partir de arquivos selecionados', async () => {
    const mockInput = document.createElement('input');
    mockInput.type = 'file';

    const promise = pickFolderViaWebkitDirectory(mockInput);

    const file = new File(['teste'], 'dados.json', { type: 'application/json' });
    Object.defineProperty(file, 'webkitRelativePath', {
      value: 'Downloads/dados.json'
    });

    Object.defineProperty(mockInput, 'files', {
      value: [file]
    });

    mockInput.dispatchEvent(new Event('change'));

    const result = await promise;

    expect(result.success).toBe(true);
    expect(result.folderName).toBe('Downloads');
    expect(result.folderPath).toContain('/Aparelho/Downloads/GeaAgro_Backups/');
  });

  // 7. Prevenção de avisos de "upload de arquivos" do navegador
  it('7. quando allowWebkitFallback: false, pickBackupFolder NÃO deve invocar o seletor webkitdirectory que dispara o aviso de upload do navegador', async () => {
    const mockShowDirectoryPicker = vi.fn().mockRejectedValue({
      name: 'SecurityError',
      message: 'Sensitive directory'
    });
    (window as any).showDirectoryPicker = mockShowDirectoryPicker;

    const mockInput = document.createElement('input');
    mockInput.type = 'file';
    const clickSpy = vi.spyOn(mockInput, 'click');

    const result = await pickBackupFolder({
      fallbackInputRef: mockInput,
      allowWebkitFallback: false
    });

    expect(clickSpy).not.toHaveBeenCalled();
    expect(result.status).toBe('restricted_system');
    expect(result.message).toContain('Use um dos atalhos rápidos');
  });

  // 8. Validação dos atalhos de pastas comuns
  it('8. PRESET_BACKUP_FOLDERS deve disponibilizar atalhos para Área de Trabalho, Downloads, Documentos e Pen Drive', () => {
    expect(PRESET_BACKUP_FOLDERS.length).toBe(4);
    const ids = PRESET_BACKUP_FOLDERS.map((p: any) => p.id);
    expect(ids).toContain('desktop');
    expect(ids).toContain('downloads');
    expect(ids).toContain('documents');
    expect(ids).toContain('pendrive');
  });

  // 9. Salvamento direto via saveBackupFileWithNativePicker
  it('9. saveBackupFileWithNativePicker deve salvar com sucesso usando seletor nativo ou download local', async () => {
    const mockWritable = {
      write: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined)
    };
    (window as any).showSaveFilePicker = vi.fn().mockResolvedValue({
      name: 'geaagro_backup.geaagro',
      createWritable: vi.fn().mockResolvedValue(mockWritable)
    });

    const result = await saveBackupFileWithNativePicker('geaagro_backup.geaagro', '{"test":123}');
    expect(result.saved).toBe(true);
    expect(result.method).toBe('native_picker');
    expect(mockWritable.write).toHaveBeenCalledWith('{"test":123}');
    expect(mockWritable.close).toHaveBeenCalled();
  });
});

