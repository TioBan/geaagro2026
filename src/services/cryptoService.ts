/**
 * GeaAgro Cryptographic Service (Fase 1 — Segurança e Criptografia Local)
 * 
 * Padrões criptográficos adotados:
 * - Cifragem Simétrica: AES-256-GCM (Autenticado, impede adulteração silenciosa via auth tag de 128 bits)
 * - Derivação de Chave (KDF): PBKDF2 com HMAC-SHA-256, 100.000 iterações e salt criptográfico de 16 bytes
 * - Resumo Criptográfico: SHA-256 real via Web Crypto API (SubtleCrypto)
 * - Chave de Recuperação Segura: Entropia de 256 bits (32 bytes aleatórios) formatada em blocos alfanuméricos legíveis
 * 
 * Compatibilidade:
 * - Executa no navegador (window.crypto.subtle) e em ambientes modernos (globalThis.crypto.subtle / Node 18+)
 * - 100% livre de dependências externas proprietárias, garantindo perenidade e auditoria independente
 */

export interface CryptoParameters {
  algorithm: 'AES-256-GCM';
  kdf: 'PBKDF2-HMAC-SHA256';
  iterations: number;
  saltLengthBytes: number;
  ivLengthBytes: number;
  keyLengthBits: number;
  authTagLengthBits: number;
}

export const CRYPTO_DEFAULTS: CryptoParameters = {
  algorithm: 'AES-256-GCM',
  kdf: 'PBKDF2-HMAC-SHA256',
  iterations: 100000,
  saltLengthBytes: 16,
  ivLengthBytes: 12, // 96 bits recomendado para AES-GCM
  keyLengthBits: 256,
  authTagLengthBits: 128,
};

export type CryptoErrorCode =
  | 'CRYPTO_UNAVAILABLE'
  | 'WRONG_PASSWORD'
  | 'INTEGRITY_COMPROMISED'
  | 'INVALID_FORMAT'
  | 'INVALID_RECOVERY_KEY'
  | 'UNSUPPORTED_ALGORITHM'
  | 'ENCRYPTION_FAILED'
  | 'DECRYPTION_FAILED';

export class CryptoError extends Error {
  public code: CryptoErrorCode;
  constructor(message: string, code: CryptoErrorCode) {
    super(`[GeaAgro Crypto] ${message}`);
    this.name = 'CryptoError';
    this.code = code;
  }
}

export interface EncryptedPayload {
  version: 1;
  algorithm: 'AES-256-GCM';
  kdf: 'PBKDF2-HMAC-SHA256';
  iterations: number;
  salt: string; // Base64
  iv: string; // Base64
  ciphertext: string; // Base64 com tag GCM concatenada
  checksum: string; // SHA-256 hex do ciphertext
  createdAt: string; // ISO 8601
}

export interface EncryptedWithRecoveryPayload {
  version: 1;
  algorithm: 'AES-256-GCM';
  iv: string; // Base64
  ciphertext: string; // Base64 com tag GCM concatenada
  checksum: string; // SHA-256 hex do ciphertext
  createdAt: string; // ISO 8601
}

export interface EnvelopeEncryptedData {
  version: 1;
  algorithm: 'AES-256-GCM';
  // Dados cifrados com a DEK (Data Encryption Key)
  data: {
    iv: string;
    ciphertext: string;
    checksum: string;
  };
  // DEK cifrada com a senha do usuário
  passwordEncryptedKey: EncryptedPayload;
  // DEK cifrada com a chave mestre de recuperação
  recoveryEncryptedKey: EncryptedWithRecoveryPayload;
  createdAt: string;
}

export interface RecoveryKeyDetails {
  rawHex: string;
  formattedKey: string;
  createdAt: string;
  instructions: string;
}

/**
 * Utilitários internos de conversão e Web Crypto API
 */
function getSubtleCrypto(): SubtleCrypto {
  const subtle = globalThis?.crypto?.subtle;
  if (!subtle) {
    throw new CryptoError(
      'Web Crypto API (crypto.subtle) não está disponível neste ambiente.',
      'CRYPTO_UNAVAILABLE'
    );
  }
  return subtle;
}

function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  if (!globalThis?.crypto?.getRandomValues) {
    throw new CryptoError(
      'Gerador seguro de números pseudoaleatórios (getRandomValues) indisponível.',
      'CRYPTO_UNAVAILABLE'
    );
  }
  return globalThis.crypto.getRandomValues(bytes);
}

// Conversões Base64 e Uint8Array seguras para Node e Navegador
export function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    const buf = Buffer.from(base64, 'base64');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  if (cleanHex.length % 2 !== 0) {
    throw new CryptoError('String hexadecimal com tamanho ímpar.', 'INVALID_FORMAT');
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  return bytes;
}

export class CryptoService {
  /**
   * Calcula o hash criptográfico SHA-256 real dos dados fornecidos
   * Retorna representação hexadecimal minúscula de 64 caracteres
   */
  public static async sha256Hex(data: string | Uint8Array | ArrayBuffer): Promise<string> {
    const subtle = getSubtleCrypto();
    let buffer: ArrayBuffer;

    if (typeof data === 'string') {
      buffer = new TextEncoder().encode(data).buffer as ArrayBuffer;
    } else if (data instanceof Uint8Array) {
      buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
    } else {
      buffer = data;
    }

    const hashBuffer = await subtle.digest('SHA-256', buffer);
    return bytesToHex(new Uint8Array(hashBuffer));
  }

  /**
   * Deriva uma chave criptográfica AES-GCM a partir de uma senha usando PBKDF2-HMAC-SHA256
   */
  private static async deriveKeyFromPassword(
    password: string,
    salt: Uint8Array,
    iterations: number = CRYPTO_DEFAULTS.iterations
  ): Promise<CryptoKey> {
    const subtle = getSubtleCrypto();
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Importa a senha como chave base para KDF
    const baseKey = await subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // Deriva a chave AES-GCM 256 bits
    return await subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as unknown as BufferSource,
        iterations: iterations,
        hash: 'SHA-256',
      },
      baseKey,
      { name: 'AES-GCM', length: CRYPTO_DEFAULTS.keyLengthBits },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Importa uma chave AES-GCM diretamente a partir de 32 bytes de entropia pura
   */
  private static async importRawKey(rawKeyBytes: Uint8Array): Promise<CryptoKey> {
    if (rawKeyBytes.length !== 32) {
      throw new CryptoError('A chave bruta deve ter exatamente 32 bytes (256 bits).', 'INVALID_FORMAT');
    }
    const subtle = getSubtleCrypto();
    return await subtle.importKey(
      'raw',
      rawKeyBytes as unknown as BufferSource,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Cifra dados binários usando AES-256-GCM e senha derivada via PBKDF2
   */
  public static async encryptBinary(
    data: Uint8Array,
    password: string,
    iterations: number = CRYPTO_DEFAULTS.iterations
  ): Promise<EncryptedPayload> {
    if (!password || password.trim().length === 0) {
      throw new CryptoError('A senha de cifragem não pode ser vazia.', 'INVALID_FORMAT');
    }

    try {
      const subtle = getSubtleCrypto();
      const salt = getRandomBytes(CRYPTO_DEFAULTS.saltLengthBytes);
      const iv = getRandomBytes(CRYPTO_DEFAULTS.ivLengthBytes);

      const cryptoKey = await this.deriveKeyFromPassword(password, salt, iterations);

      const encryptedBuffer = await subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv as unknown as BufferSource,
          tagLength: CRYPTO_DEFAULTS.authTagLengthBits,
        },
        cryptoKey,
        data as unknown as BufferSource
      );

      const ciphertextBytes = new Uint8Array(encryptedBuffer);
      const ciphertextBase64 = bytesToBase64(ciphertextBytes);
      const checksum = await this.sha256Hex(ciphertextBytes);

      return {
        version: 1,
        algorithm: 'AES-256-GCM',
        kdf: 'PBKDF2-HMAC-SHA256',
        iterations,
        salt: bytesToBase64(salt),
        iv: bytesToBase64(iv),
        ciphertext: ciphertextBase64,
        checksum,
        createdAt: new Date().toISOString(),
      };
    } catch (err: unknown) {
      if (err instanceof CryptoError) throw err;
      throw new CryptoError(
        `Falha na cifragem dos dados: ${err instanceof Error ? err.message : String(err)}`,
        'ENCRYPTION_FAILED'
      );
    }
  }

  /**
   * Decifra dados binários usando AES-256-GCM e valida integridade / autenticidade
   */
  public static async decryptBinary(
    payload: EncryptedPayload,
    password: string
  ): Promise<Uint8Array> {
    if (!payload || !payload.ciphertext || !payload.salt || !payload.iv) {
      throw new CryptoError('Formato de carga criptografada inválido.', 'INVALID_FORMAT');
    }

    if (payload.algorithm !== 'AES-256-GCM') {
      throw new CryptoError(
        `Algoritmo não suportado: ${payload.algorithm}. Apenas AES-256-GCM é aceito.`,
        'UNSUPPORTED_ALGORITHM'
      );
    }

    const ciphertextBytes = base64ToBytes(payload.ciphertext);

    // Verificação de integridade via checksum SHA-256 antes da decifragem
    if (payload.checksum) {
      const calculatedChecksum = await this.sha256Hex(ciphertextBytes);
      if (calculatedChecksum !== payload.checksum) {
        throw new CryptoError(
          'Falha de integridade: O checksum do texto cifrado não confere (dados corrompidos ou adulterados).',
          'INTEGRITY_COMPROMISED'
        );
      }
    }

    try {
      const subtle = getSubtleCrypto();
      const salt = base64ToBytes(payload.salt);
      const iv = base64ToBytes(payload.iv);

      const cryptoKey = await this.deriveKeyFromPassword(
        password,
        salt,
        payload.iterations || CRYPTO_DEFAULTS.iterations
      );

      const decryptedBuffer = await subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv as unknown as BufferSource,
          tagLength: CRYPTO_DEFAULTS.authTagLengthBits,
        },
        cryptoKey,
        ciphertextBytes as unknown as BufferSource
      );

      return new Uint8Array(decryptedBuffer);
    } catch (err: unknown) {
      // O Web Crypto API rejeita automaticamente com OperationError caso a senha esteja incorreta
      // ou a tag de autenticação GCM seja inválida
      throw new CryptoError(
        'Falha ao decifrar: Senha incorreta ou dados adulterados (Tag de autenticação inválida).',
        'WRONG_PASSWORD'
      );
    }
  }

  /**
   * Cifra uma string de texto UTF-8 (ex: JSON, anotações, tokens)
   */
  public static async encryptText(
    plainText: string,
    password: string,
    iterations: number = CRYPTO_DEFAULTS.iterations
  ): Promise<EncryptedPayload> {
    const bytes = new TextEncoder().encode(plainText);
    return await this.encryptBinary(bytes, password, iterations);
  }

  /**
   * Decifra uma string de texto UTF-8
   */
  public static async decryptText(
    payload: EncryptedPayload,
    password: string
  ): Promise<string> {
    const bytes = await this.decryptBinary(payload, password);
    return new TextDecoder().decode(bytes);
  }

  /**
   * Cifra um objeto estruturado (converte em JSON e cifra)
   */
  public static async encryptObject<T>(
    data: T,
    password: string,
    iterations: number = CRYPTO_DEFAULTS.iterations
  ): Promise<EncryptedPayload> {
    const json = JSON.stringify(data);
    return await this.encryptText(json, password, iterations);
  }

  /**
   * Decifra e desserializa um objeto estruturado
   */
  public static async decryptObject<T>(
    payload: EncryptedPayload,
    password: string
  ): Promise<T> {
    const json = await this.decryptText(payload, password);
    try {
      return JSON.parse(json) as T;
    } catch {
      throw new CryptoError('Erro ao desserializar objeto JSON decifrado.', 'INVALID_FORMAT');
    }
  }

  /**
   * Geração segura de Chave de Recuperação (Recovery Key)
   * Gera 256 bits (32 bytes) de entropia criptográfica via CSPRNG
   * Formato legível: GEA1-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX (8 blocos de 4 chars em base32/hex)
   */
  public static generateRecoveryKey(): RecoveryKeyDetails {
    const rawBytes = getRandomBytes(32);
    const rawHex = bytesToHex(rawBytes);

    // Formata em blocos de 4 caracteres para anotação em papel pelo produtor rural
    const chunks: string[] = [];
    for (let i = 0; i < rawHex.length; i += 4) {
      chunks.push(rawHex.substring(i, i + 4).toUpperCase());
    }
    const formattedKey = `GEA1-${chunks.join('-')}`;

    return {
      rawHex,
      formattedKey,
      createdAt: new Date().toISOString(),
      instructions:
        'Guarde esta chave em local físico seguro. Em caso de perda da senha do GeaAgro, apenas esta chave poderá recuperar seus dados criptografados locais.',
    };
  }

  /**
   * Normaliza e extrai os 32 bytes brutos a partir de uma chave de recuperação formatada
   */
  public static parseRecoveryKey(formattedOrHex: string): Uint8Array {
    if (!formattedOrHex || typeof formattedOrHex !== 'string') {
      throw new CryptoError('Chave de recuperação vazia ou inválida.', 'INVALID_RECOVERY_KEY');
    }

    // Remove prefixo GEA1- e hifens/espaços
    let clean = formattedOrHex.trim().toUpperCase();
    if (clean.startsWith('GEA1-')) {
      clean = clean.substring(5);
    }
    clean = clean.replace(/[^0-9A-F]/g, '');

    if (clean.length !== 64) {
      throw new CryptoError(
        `Chave de recuperação com tamanho incompatível (${clean.length}/64 caracteres hexadecimais esperados).`,
        'INVALID_RECOVERY_KEY'
      );
    }

    return hexToBytes(clean.toLowerCase());
  }

  /**
   * Valida se uma string é uma chave de recuperação bem formada
   */
  public static validateRecoveryKeyFormat(formattedOrHex: string): boolean {
    try {
      this.parseRecoveryKey(formattedOrHex);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Cifra diretamente com a chave de recuperação (AES-256-GCM pura)
   */
  public static async encryptWithRecoveryKey(
    plainText: string,
    recoveryKey: string
  ): Promise<EncryptedWithRecoveryPayload> {
    const rawBytes = this.parseRecoveryKey(recoveryKey);
    const subtle = getSubtleCrypto();
    const iv = getRandomBytes(CRYPTO_DEFAULTS.ivLengthBytes);
    const cryptoKey = await this.importRawKey(rawBytes);

    const dataBytes = new TextEncoder().encode(plainText);
    const encryptedBuffer = await subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
        tagLength: CRYPTO_DEFAULTS.authTagLengthBits,
      },
      cryptoKey,
      dataBytes as unknown as BufferSource
    );

    const ciphertextBytes = new Uint8Array(encryptedBuffer);
    const checksum = await this.sha256Hex(ciphertextBytes);

    return {
      version: 1,
      algorithm: 'AES-256-GCM',
      iv: bytesToBase64(iv),
      ciphertext: bytesToBase64(ciphertextBytes),
      checksum,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Decifra com a chave de recuperação (AES-256-GCM)
   */
  public static async decryptWithRecoveryKey(
    payload: EncryptedWithRecoveryPayload,
    recoveryKey: string
  ): Promise<string> {
    if (!payload || !payload.ciphertext || !payload.iv) {
      throw new CryptoError('Carga cifrada com chave de recuperação inválida.', 'INVALID_FORMAT');
    }

    const rawBytes = this.parseRecoveryKey(recoveryKey);
    const ciphertextBytes = base64ToBytes(payload.ciphertext);

    if (payload.checksum) {
      const calculatedChecksum = await this.sha256Hex(ciphertextBytes);
      if (calculatedChecksum !== payload.checksum) {
        throw new CryptoError(
          'Integridade violada na decifragem com chave de recuperação.',
          'INTEGRITY_COMPROMISED'
        );
      }
    }

    try {
      const subtle = getSubtleCrypto();
      const iv = base64ToBytes(payload.iv);
      const cryptoKey = await this.importRawKey(rawBytes);

      const decryptedBuffer = await subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv as unknown as BufferSource,
          tagLength: CRYPTO_DEFAULTS.authTagLengthBits,
        },
        cryptoKey,
        ciphertextBytes as unknown as BufferSource
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch {
      throw new CryptoError(
        'Chave de recuperação incorreta ou dados corrompidos.',
        'WRONG_PASSWORD'
      );
    }
  }

  /**
   * Cria estrutura de Envelope Encryption (DEK gerada aleatoriamente protegida tanto pela senha quanto pela chave de recuperação)
   * Isso permite ao produtor recuperar seus dados mesmo se esquecer a senha,
   * e trocar a senha sem precisar recifrar todo o banco de dados.
   */
  public static async createEnvelopeEncryptedData(
    plainText: string,
    password: string,
    recoveryKey: string
  ): Promise<EnvelopeEncryptedData> {
    const subtle = getSubtleCrypto();

    // 1. Gera uma DEK aleatória de 256 bits (32 bytes)
    const dekBytes = getRandomBytes(32);
    const dekCryptoKey = await this.importRawKey(dekBytes);

    // 2. Cifra o conteúdo principal com a DEK
    const contentBytes = new TextEncoder().encode(plainText);
    const dataIv = getRandomBytes(CRYPTO_DEFAULTS.ivLengthBytes);

    const encryptedContentBuffer = await subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: dataIv as unknown as BufferSource,
        tagLength: CRYPTO_DEFAULTS.authTagLengthBits,
      },
      dekCryptoKey,
      contentBytes as unknown as BufferSource
    );

    const encryptedContentBytes = new Uint8Array(encryptedContentBuffer);
    const dataChecksum = await this.sha256Hex(encryptedContentBytes);

    // 3. Cifra a DEK com a senha do usuário
    const dekHex = bytesToHex(dekBytes);
    const passwordEncryptedKey = await this.encryptText(dekHex, password);

    // 4. Cifra a DEK com a chave de recuperação
    const recoveryEncryptedKey = await this.encryptWithRecoveryKey(dekHex, recoveryKey);

    return {
      version: 1,
      algorithm: 'AES-256-GCM',
      data: {
        iv: bytesToBase64(dataIv),
        ciphertext: bytesToBase64(encryptedContentBytes),
        checksum: dataChecksum,
      },
      passwordEncryptedKey,
      recoveryEncryptedKey,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Decifra envelope usando a senha
   */
  public static async decryptEnvelopeWithPassword(
    envelope: EnvelopeEncryptedData,
    password: string
  ): Promise<string> {
    const dekHex = await this.decryptText(envelope.passwordEncryptedKey, password);
    const dekBytes = hexToBytes(dekHex);
    return await this.decryptEnvelopeDataWithDek(envelope, dekBytes);
  }

  /**
   * Decifra envelope usando a chave de recuperação
   */
  public static async decryptEnvelopeWithRecoveryKey(
    envelope: EnvelopeEncryptedData,
    recoveryKey: string
  ): Promise<string> {
    const dekHex = await this.decryptWithRecoveryKey(envelope.recoveryEncryptedKey, recoveryKey);
    const dekBytes = hexToBytes(dekHex);
    return await this.decryptEnvelopeDataWithDek(envelope, dekBytes);
  }

  private static async decryptEnvelopeDataWithDek(
    envelope: EnvelopeEncryptedData,
    dekBytes: Uint8Array
  ): Promise<string> {
    const subtle = getSubtleCrypto();
    const ciphertextBytes = base64ToBytes(envelope.data.ciphertext);

    if (envelope.data.checksum) {
      const calculatedChecksum = await this.sha256Hex(ciphertextBytes);
      if (calculatedChecksum !== envelope.data.checksum) {
        throw new CryptoError(
          'Integridade violada no envelope de dados.',
          'INTEGRITY_COMPROMISED'
        );
      }
    }

    const iv = base64ToBytes(envelope.data.iv);
    const dekCryptoKey = await this.importRawKey(dekBytes);

    try {
      const decryptedBuffer = await subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv as unknown as BufferSource,
          tagLength: CRYPTO_DEFAULTS.authTagLengthBits,
        },
        dekCryptoKey,
        ciphertextBytes as unknown as BufferSource
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch {
      throw new CryptoError('Falha ao decifrar envelope de dados.', 'DECRYPTION_FAILED');
    }
  }

  /**
   * Serialização e desserialização seguras para persistência e exportação
   */
  public static serializePayload(payload: unknown): string {
    return JSON.stringify(payload);
  }

  public static deserializePayload<T = EncryptedPayload>(serialized: string): T {
    try {
      return JSON.parse(serialized) as T;
    } catch {
      throw new CryptoError('Carga criptografada corrompida ou com JSON inválido.', 'INVALID_FORMAT');
    }
  }
}
