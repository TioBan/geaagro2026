/**
 * GeaAgro Folder Picker & Directory Selection Service
 * 
 * Provides resilient, privacy-preserving folder selection across all browsers
 * without triggering Chromium's "Não pode abrir esta pasta porque ela contém arquivos do sistema"
 * false-positive block on Desktop, Downloads, and folders containing hidden/config files.
 */

export interface FolderValidationResult {
  isValid: boolean;
  status: 'valid' | 'restricted_system' | 'inaccessible' | 'empty' | 'warning';
  message: string;
  folderName: string;
  folderPath: string;
  totalFiles: number;
  validFilesCount: number;
  hiddenFilesCount: number;
  hasHiddenOrConfigFiles: boolean;
}

export interface FolderSelectionResult {
  success: boolean;
  status: 'success' | 'cancelled' | 'permission_denied' | 'restricted_system' | 'inaccessible' | 'error';
  message: string;
  folderName?: string;
  folderPath?: string;
  validation?: FolderValidationResult;
}

/**
 * Known system files that must NOT block folder selection.
 * These are commonly found in Desktop, Downloads, and user directories on Windows, Mac, and Linux.
 */
export const HARMLESS_HIDDEN_FILES = new Set([
  'desktop.ini',
  'thumbs.db',
  '.ds_store',
  '.localized',
  'autorun.inf',
  '.git',
  '.gitignore',
  '.vscode',
  '.idea',
  '.env',
  '.env.example',
  '.bash_history',
  '.bashrc',
  '.zshrc'
]);

/**
 * Protected root operating system directories where writing application backups is unsafe.
 * User directories (Desktop, Downloads, Documents, Pen drives) are NOT restricted.
 */
export const RESTRICTED_OS_SYSTEM_PATHS = [
  /^c:[\\\/]windows/i,
  /^c:[\\\/]winnt/i,
  /^c:[\\\/]program files/i,
  /^c:[\\\/]program files \(x86\)/i,
  /^\/system\b/i,
  /^\/usr\/(bin|sbin|lib)/i,
  /^\/bin\b/i,
  /^\/sbin\b/i,
  /^\/etc\b/i,
  /^\/proc\b/i,
  /^\/sys\b/i,
  /^\/dev\b/i
];

/**
 * Checks if a filename is a harmless hidden file, configuration file, or metadata file.
 */
export function isHarmlessHiddenFile(filename: string): boolean {
  if (!filename) return false;
  const lower = filename.toLowerCase().trim();
  if (lower.startsWith('.')) return true;
  return HARMLESS_HIDDEN_FILES.has(lower);
}

/**
 * Checks if a path points to a protected operating system system directory.
 */
export function isProtectedOsDirectory(path: string): boolean {
  if (!path) return false;
  const normalized = path.trim().replace(/\\/g, '/');
  return RESTRICTED_OS_SYSTEM_PATHS.some((regex) => regex.test(normalized));
}

/**
 * Validates a selected folder and its contents.
 * Explicitly allows common user directories (Desktop, Downloads, Documents)
 * and folders containing hidden or configuration files without false-positive blocks.
 */
export function validateFolderSelection(
  folderName: string,
  files: Array<{ name: string; path?: string }> = [],
  fullPath?: string
): FolderValidationResult {
  const cleanName = (folderName || 'Pasta_Backup').trim();
  const targetPath = fullPath || `/Aparelho/${cleanName}/GeaAgro_Backups/`;

  // 1. Check for genuine OS root system directory restrictions
  if (isProtectedOsDirectory(cleanName) || (fullPath && isProtectedOsDirectory(fullPath))) {
    return {
      isValid: false,
      status: 'restricted_system',
      message: 'O diretório selecionado é uma pasta protegida do sistema operacional. Por favor, escolha uma pasta comum de usuário (ex.: Área de Trabalho, Downloads ou Documentos).',
      folderName: cleanName,
      folderPath: targetPath,
      totalFiles: files.length,
      validFilesCount: 0,
      hiddenFilesCount: 0,
      hasHiddenOrConfigFiles: false
    };
  }

  // 2. Count files, identifying hidden and configuration files
  let hiddenCount = 0;
  let validCount = 0;

  for (const file of files) {
    const fileName = file.name || (file.path ? file.path.split('/').pop() || '' : '');
    if (isHarmlessHiddenFile(fileName)) {
      hiddenCount++;
    } else {
      validCount++;
    }
  }

  const hasHidden = hiddenCount > 0;

  // 3. Permite a pasta mesmo que contenha arquivos ocultos ou de configuração
  return {
    isValid: true,
    status: 'valid',
    message: hasHidden
      ? `Pasta "${cleanName}" válida para backups. Arquivos ocultos/configuração detectados (${hiddenCount}) serão preservados e ignorados pelo backup.`
      : `Pasta "${cleanName}" válida para armazenamento de backups.`,
    folderName: cleanName,
    folderPath: targetPath,
    totalFiles: files.length,
    validFilesCount: validCount,
    hiddenFilesCount: hiddenCount,
    hasHiddenOrConfigFiles: hasHidden
  };
}

/**
 * Selects a directory using the universal HTML5 webkitdirectory API.
 * This API is fully permitted by browsers for Desktop, Downloads, and any user folder,
 * never failing with Chromium's "contém arquivos do sistema" error.
 */
export function pickFolderViaWebkitDirectory(
  inputElement?: HTMLInputElement
): Promise<FolderSelectionResult> {
  return new Promise((resolve) => {
    let input = inputElement;
    let isDynamic = false;

    if (!input) {
      isDynamic = true;
      input = document.createElement('input');
      input.type = 'file';
      input.setAttribute('webkitdirectory', '');
      input.setAttribute('directory', '');
      input.style.display = 'none';
      document.body.appendChild(input);
    }

    let hasHandledChange = false;

    const cleanup = () => {
      if (isDynamic && input && input.parentNode) {
        input.parentNode.removeChild(input);
      }
    };

    input.onchange = (e: Event) => {
      hasHandledChange = true;
      const target = e.target as HTMLInputElement;
      const fileList = target.files;

      if (!fileList || fileList.length === 0) {
        cleanup();
        resolve({
          success: false,
          status: 'cancelled',
          message: 'Nenhuma pasta selecionada ou seleção cancelada.'
        });
        return;
      }

      // Determine folder name from the webkitRelativePath
      const firstFile = fileList[0];
      const relativePath = firstFile.webkitRelativePath || '';
      const folderName = relativePath.split('/')[0] || 'Pasta_Selecionada';

      const filesArray: Array<{ name: string; path?: string }> = [];
      for (let i = 0; i < Math.min(fileList.length, 500); i++) {
        filesArray.push({
          name: fileList[i].name,
          path: fileList[i].webkitRelativePath
        });
      }

      const validation = validateFolderSelection(folderName, filesArray);

      cleanup();
      const resultStatus: FolderSelectionResult['status'] = validation.isValid
        ? 'success'
        : validation.status === 'restricted_system'
        ? 'restricted_system'
        : 'error';

      resolve({
        success: validation.isValid,
        status: resultStatus,
        message: validation.message,
        folderName: validation.folderName,
        folderPath: validation.folderPath,
        validation
      });
    };

    // Detect user cancellation when file dialog is closed without selection
    window.addEventListener(
      'focus',
      () => {
        setTimeout(() => {
          if (!hasHandledChange) {
            cleanup();
            resolve({
              success: false,
              status: 'cancelled',
              message: 'Seleção de pasta cancelada pelo usuário.'
            });
          }
        }, 1200);
      },
      { once: true }
    );

    input.click();
  });
}

export interface FolderPreset {
  id: string;
  name: string;
  path: string;
  description: string;
}

export const PRESET_BACKUP_FOLDERS: FolderPreset[] = [
  {
    id: 'desktop',
    name: 'Área de Trabalho',
    path: '/Aparelho/Área_de_Trabalho/GeaAgro_Backups/',
    description: 'Salva os backups na sua Área de Trabalho'
  },
  {
    id: 'downloads',
    name: 'Downloads',
    path: '/Aparelho/Downloads/GeaAgro_Backups/',
    description: 'Pasta padrão de downloads do computador'
  },
  {
    id: 'documents',
    name: 'Documentos',
    path: '/Aparelho/Documentos/GeaAgro_Backups/',
    description: 'Pasta pessoal de documentos do usuário'
  },
  {
    id: 'pendrive',
    name: 'Pen Drive / OTG',
    path: '/Aparelho/PenDrive_OTG/GeaAgro_Backups/',
    description: 'Armazenamento externo removível ou cartão de memória'
  }
];

/**
 * Intelligent folder picker:
 * 1. Tries File System Access API (showDirectoryPicker) with safe options.
 * 2. Does NOT trigger <input webkitdirectory> automatically (preventing Chrome's alarming 'Fazer upload de arquivos' prompt).
 * 3. Handles user cancellation (AbortError) without error warnings.
 */
export async function pickBackupFolder(
  options?: {
    fallbackInputRef?: HTMLInputElement | null;
    suggestedPath?: string;
    allowWebkitFallback?: boolean;
  }
): Promise<FolderSelectionResult> {
  // If window is not defined (SSR / test runner)
  if (typeof window === 'undefined') {
    return {
      success: false,
      status: 'inaccessible',
      message: 'Ambiente de execução não suporta seleção de pastas da interface.'
    };
  }

  // Attempt File System Access API if available
  if ('showDirectoryPicker' in window && typeof (window as any).showDirectoryPicker === 'function') {
    try {
      const handle = await (window as any).showDirectoryPicker({
        id: 'geaagro_backups_dir',
        mode: 'read',
        startIn: 'documents'
      });

      if (handle && handle.name) {
        const validation = validateFolderSelection(handle.name);
        const resultStatus: FolderSelectionResult['status'] = validation.isValid
          ? 'success'
          : validation.status === 'restricted_system'
          ? 'restricted_system'
          : 'error';

        return {
          success: validation.isValid,
          status: resultStatus,
          message: validation.message,
          folderName: validation.folderName,
          folderPath: validation.folderPath,
          validation
        };
      }
    } catch (err: any) {
      // 1. User pressed cancel in dialog
      if (err.name === 'AbortError') {
        return {
          success: false,
          status: 'cancelled',
          message: 'Seleção de pasta cancelada pelo usuário.'
        };
      }

      // 2. Permission denied
      if (err.name === 'NotAllowedError') {
        return {
          success: false,
          status: 'permission_denied',
          message: 'Permissão de acesso à pasta foi negada pelo usuário ou pelo navegador.'
        };
      }

      // 3. SecurityError: The browser deems Desktop, Downloads, or system path sensitive.
      // If webkit fallback input is provided and not explicitly disallowed, use it
      if (options?.fallbackInputRef && options?.allowWebkitFallback !== false) {
        return pickFolderViaWebkitDirectory(options.fallbackInputRef);
      }

      return {
        success: false,
        status: 'restricted_system',
        message: 'O navegador restringiu a seleção direta desta pasta raiz. Use um dos atalhos rápidos (Área de Trabalho, Downloads ou Documentos) ou digite a pasta desejada.'
      };
    }
  }

  if (options?.fallbackInputRef && options?.allowWebkitFallback !== false) {
    return pickFolderViaWebkitDirectory(options.fallbackInputRef);
  }

  return {
    success: false,
    status: 'restricted_system',
    message: 'Navegador não possui seletor nativo de diretório. Utilize os atalhos de Área de Trabalho, Downloads ou digite o caminho desejado.'
  };
}

/**
 * Saves a backup file using the native OS Save File Picker (Save As / Salvar Como)
 * without ever triggering any upload warnings or system file restrictions.
 * Falls back to browser download if showSaveFilePicker is not available.
 */
export async function saveBackupFileWithNativePicker(
  filename: string,
  content: string,
  mimeType = 'application/json'
): Promise<{ saved: boolean; method: 'native_picker' | 'browser_download'; pathOrName: string }> {
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const extMatch = filename.match(/\.[a-z0-9]+$/i);
      const ext = extMatch ? extMatch[0].toLowerCase() : '.geaagro';

      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: 'Arquivo de Backup GeaAgro (*.geaagro, *.json)',
            accept: {
              'application/json': ['.json', '.geaagro', '.geabackup', ext],
              'application/octet-stream': ['.geaagro', '.geabackup', ext]
            }
          }
        ]
      });

      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      return {
        saved: true,
        method: 'native_picker',
        pathOrName: fileHandle.name || filename
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User canceled save dialog
        return { saved: false, method: 'native_picker', pathOrName: filename };
      }
      console.warn('[saveBackupFileWithNativePicker] showSaveFilePicker falhou, usando download padrão:', err);
    }
  }

  // Fallback to regular browser download
  if (typeof document !== 'undefined') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 6000);
    return { saved: true, method: 'browser_download', pathOrName: filename };
  }

  return { saved: false, method: 'browser_download', pathOrName: filename };
}
