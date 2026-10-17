import { describe, it, expect } from 'vitest';
import {
  CryptoService,
  CryptoError,
  CRYPTO_DEFAULTS,
  bytesToHex,
  hexToBytes,
  bytesToBase64,
  base64ToBytes
} from '../services/cryptoService';

describe('GeaAgro CryptoService — Fase 1 (Segurança e Criptografia Local)', () => {
  describe('Resumo Criptográfico (SHA-256 Real)', () => {
    it('deve calcular corretamente o hash SHA-256 padrão NIST (vetor vazio)', async () => {
      const hashVazio = await CryptoService.sha256Hex('');
      // Hash SHA-256 padrão para string vazia
      expect(hashVazio).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });

    it('deve calcular hash determinístico e exato para texto com caracteres especiais agronômicos', async () => {
      const texto = 'GeaAgro — Análise de Solo Fazenda Santa Fé: pH 6.2, CTC 14.5 cmol/dm³';
      const hash1 = await CryptoService.sha256Hex(texto);
      const hash2 = await CryptoService.sha256Hex(texto);

      expect(hash1).toHaveLength(64);
      expect(hash1).toMatch(/^[0-9a-f]{64}$/);
      expect(hash1).toBe(hash2);
    });

    it('deve calcular hash sobre buffers binários Uint8Array de forma idêntica à string', async () => {
      const texto = 'Fertilidade de Solo 2026';
      const bytes = new TextEncoder().encode(texto);
      const hashString = await CryptoService.sha256Hex(texto);
      const hashBytes = await CryptoService.sha256Hex(bytes);

      expect(hashBytes).toBe(hashString);
    });
  });

  describe('Conversões Utilitárias (Base64 e Hex)', () => {
    it('deve converter bytes para Base64 e vice-versa sem perdas', () => {
      const original = new Uint8Array([0, 1, 15, 127, 128, 254, 255]);
      const base64 = bytesToBase64(original);
      const recuperado = base64ToBytes(base64);

      expect(recuperado).toEqual(original);
    });

    it('deve converter bytes para Hexadecimal e vice-versa sem perdas', () => {
      const original = new Uint8Array([0xde, 0xad, 0xbe, 0xef, 0x01, 0x42]);
      const hex = bytesToHex(original);
      expect(hex).toBe('deadbeef0142');

      const recuperado = hexToBytes(hex);
      expect(recuperado).toEqual(original);
    });
  });

  describe('Cifragem Simétrica com Senha (AES-256-GCM + PBKDF2)', () => {
    const senhaProdutor = 'SenhaForteDoProdutor#2026@GeaAgro';
    const dadosCadernoCampo = JSON.stringify({
      produtor: 'Lucas Mendes',
      fazenda: 'Recanto das Palmeiras',
      talhao: 'Talhão 04 - Soja Safra 2025/2026',
      aplicacao: 'Adubação de Cobertura com KCL',
      doseKgHa: 150,
      custoTotal: 45000.0,
    });

    it('deve cifrar e decifrar texto preservando integridade exata', async () => {
      // Usamos iterações padrão (100.000)
      const payload = await CryptoService.encryptText(dadosCadernoCampo, senhaProdutor, 10000);

      expect(payload.version).toBe(1);
      expect(payload.algorithm).toBe('AES-256-GCM');
      expect(payload.kdf).toBe('PBKDF2-HMAC-SHA256');
      expect(payload.ciphertext).toBeDefined();
      expect(payload.salt).toBeDefined();
      expect(payload.iv).toBeDefined();
      expect(payload.checksum).toBeDefined();

      const decifrado = await CryptoService.decryptText(payload, senhaProdutor);
      expect(decifrado).toBe(dadosCadernoCampo);
    });

    it('deve produzir cifras e IVs distintos a cada execução mesmo para os mesmos dados (Segurança Semântica)', async () => {
      const payload1 = await CryptoService.encryptText(dadosCadernoCampo, senhaProdutor, 5000);
      const payload2 = await CryptoService.encryptText(dadosCadernoCampo, senhaProdutor, 5000);

      // Salts diferentes gerados aleatoriamente
      expect(payload1.salt).not.toBe(payload2.salt);
      // IVs diferentes gerados aleatoriamente
      expect(payload1.iv).not.toBe(payload2.iv);
      // Cifras resultantes completamente distintas
      expect(payload1.ciphertext).not.toBe(payload2.ciphertext);

      // Ambos decifram para o mesmo conteúdo original
      expect(await CryptoService.decryptText(payload1, senhaProdutor)).toBe(dadosCadernoCampo);
      expect(await CryptoService.decryptText(payload2, senhaProdutor)).toBe(dadosCadernoCampo);
    });

    it('deve falhar a decifragem quando a senha informada estiver incorreta', async () => {
      const payload = await CryptoService.encryptText('Dados Confidenciais de Custos', senhaProdutor, 5000);
      const senhaIncorreta = 'SenhaErrada123';

      await expect(CryptoService.decryptText(payload, senhaIncorreta)).rejects.toThrow(
        /Senha incorreta ou dados adulterados/
      );
    });

    it('deve detectar adulteração de dados (tampering) no ciphertext via checksum ou Auth Tag AES-GCM', async () => {
      const payload = await CryptoService.encryptText('Dados não alteráveis', senhaProdutor, 5000);

      // Corrompe um byte do ciphertext
      const bytesCifrados = base64ToBytes(payload.ciphertext);
      bytesCifrados[0] = bytesCifrados[0] ^ 0xff; // Inverte bits do primeiro byte
      const ciphertextCorrompido = bytesToBase64(bytesCifrados);

      const payloadAdulterado = {
        ...payload,
        ciphertext: ciphertextCorrompido,
      };

      // Deve falhar via detecção de checksum
      await expect(CryptoService.decryptText(payloadAdulterado, senhaProdutor)).rejects.toThrow(
        /Falha de integridade/
      );
    });

    it('deve detectar adulteração mesmo se o checksum for falsificado (Auth Tag AES-GCM protege)', async () => {
      const payload = await CryptoService.encryptText('Dados protegidos com Tag GCM', senhaProdutor, 5000);

      // Inverte bits do ciphertext e calcula um novo checksum para tentar enganar a validação inicial
      const bytesCifrados = base64ToBytes(payload.ciphertext);
      bytesCifrados[2] = bytesCifrados[2] ^ 0xaa;
      const novoCiphertext = bytesToBase64(bytesCifrados);
      const novoChecksum = await CryptoService.sha256Hex(bytesCifrados);

      const payloadFalsificado = {
        ...payload,
        ciphertext: novoCiphertext,
        checksum: novoChecksum, // checksum bate com o texto adulterado, mas GCM auth tag deve rejeitar!
      };

      await expect(CryptoService.decryptText(payloadFalsificado, senhaProdutor)).rejects.toThrow(
        /Tag de autenticação inválida/
      );
    });

    it('deve cifrar e decifrar objetos JSON complexos com tipos agrícolas', async () => {
      const registroSolo = {
        talhaoId: 'TALHAO-101',
        amostras: [
          { profCm: '0-20', ph: 5.8, p_mehlich: 18.4, k_mg_dm3: 140, v_percent: 62.5 },
          { profCm: '20-40', ph: 5.2, p_mehlich: 6.1, k_mg_dm3: 85, v_percent: 48.0 },
        ],
        historicoCalagem: true,
        dataColeta: '2026-10-15',
      };

      const payload = await CryptoService.encryptObject(registroSolo, senhaProdutor, 5000);
      const decifrado = await CryptoService.decryptObject<typeof registroSolo>(payload, senhaProdutor);

      expect(decifrado).toEqual(registroSolo);
      expect(decifrado.amostras[0].ph).toBe(5.8);
    });

    it('deve cifrar e decifrar payloads binários (ex: fotos de laudos e pragas)', async () => {
      // Simula uma foto ou anexo binário de 2048 bytes
      const imagemBinaria = new Uint8Array(2048);
      for (let i = 0; i < imagemBinaria.length; i++) {
        imagemBinaria[i] = (i * 37) % 256;
      }

      const payload = await CryptoService.encryptBinary(imagemBinaria, senhaProdutor, 5000);
      const recuperada = await CryptoService.decryptBinary(payload, senhaProdutor);

      expect(recuperada).toEqual(imagemBinaria);
      expect(recuperada.length).toBe(2048);
    });
  });

  describe('Chave de Recuperação Segura (Recovery Key 256-bit)', () => {
    it('deve gerar chave de recuperação de 256 bits formatada em blocos de fácil transcrição', () => {
      const recovery = CryptoService.generateRecoveryKey();

      expect(recovery.rawHex).toHaveLength(64); // 32 bytes = 64 chars hex
      expect(recovery.formattedKey).toMatch(/^GEA1-[0-9A-F]{4}(-[0-9A-F]{4}){15}$/);
      expect(recovery.instructions).toContain('Guarde esta chave em local físico seguro');
    });

    it('deve validar e normalizar a chave com ou sem traços, minúsculas ou prefixos', () => {
      const recovery = CryptoService.generateRecoveryKey();
      const formatada = recovery.formattedKey;

      expect(CryptoService.validateRecoveryKeyFormat(formatada)).toBe(true);

      // Teste sem o prefixo GEA1-
      const semPrefixo = formatada.replace('GEA1-', '');
      expect(CryptoService.validateRecoveryKeyFormat(semPrefixo)).toBe(true);

      // Teste em minúsculas e sem hifens
      const minusculaSemHifen = semPrefixo.toLowerCase().replace(/-/g, '');
      expect(CryptoService.validateRecoveryKeyFormat(minusculaSemHifen)).toBe(true);

      // Teste com chave malformada / incompleta
      expect(CryptoService.validateRecoveryKeyFormat('GEA1-ABCD-1234')).toBe(false);
      expect(CryptoService.validateRecoveryKeyFormat('')).toBe(false);
    });

    it('deve cifrar e decifrar diretamente com a chave de recuperação', async () => {
      const recovery = CryptoService.generateRecoveryKey();
      const segredo = 'Coordenadas GPS de Jazida de Calcário: -15.7801, -47.9292';

      const payload = await CryptoService.encryptWithRecoveryKey(segredo, recovery.formattedKey);
      expect(payload.algorithm).toBe('AES-256-GCM');
      expect(payload.ciphertext).toBeDefined();

      const decifrado = await CryptoService.decryptWithRecoveryKey(payload, recovery.formattedKey);
      expect(decifrado).toBe(segredo);
    });

    it('deve rejeitar decifragem com chave de recuperação incorreta', async () => {
      const recovery1 = CryptoService.generateRecoveryKey();
      const recovery2 = CryptoService.generateRecoveryKey();
      const segredo = 'Dados confidenciais';

      const payload = await CryptoService.encryptWithRecoveryKey(segredo, recovery1.formattedKey);

      await expect(CryptoService.decryptWithRecoveryKey(payload, recovery2.formattedKey)).rejects.toThrow(
        /Chave de recuperação incorreta ou dados corrompidos/
      );
    });
  });

  describe('Envelope Encryption (Duplo Desbloqueio: Senha OU Chave de Recuperação)', () => {
    it('deve permitir decifrar os mesmos dados agrícolas com a senha do produtor OU com a chave de recuperação', async () => {
      const senha = 'SenhaDeUsoDiario2026';
      const recovery = CryptoService.generateRecoveryKey();
      const dadosPropriedade = JSON.stringify({
        carNumero: 'SP-3550308-0001',
        areaTotalHa: 340.5,
        reservaLegalHa: 68.1,
        proprietario: 'Fazenda Modelo Agro',
      });

      // Cria envelope: DEK única cifrada pela Senha e pela Chave de Recuperação
      const envelope = await CryptoService.createEnvelopeEncryptedData(dadosPropriedade, senha, recovery.formattedKey);

      expect(envelope.version).toBe(1);
      expect(envelope.algorithm).toBe('AES-256-GCM');
      expect(envelope.data.ciphertext).toBeDefined();
      expect(envelope.passwordEncryptedKey).toBeDefined();
      expect(envelope.recoveryEncryptedKey).toBeDefined();

      // 1. Desbloqueio habitual com a senha
      const decifradoSenha = await CryptoService.decryptEnvelopeWithPassword(envelope, senha);
      expect(decifradoSenha).toBe(dadosPropriedade);

      // 2. Desbloqueio emergencial com a Chave de Recuperação (mesmo sem saber a senha)
      const decifradoRecovery = await CryptoService.decryptEnvelopeWithRecoveryKey(envelope, recovery.formattedKey);
      expect(decifradoRecovery).toBe(dadosPropriedade);
    });

    it('deve falhar se senha errada for usada no envelope', async () => {
      const senha = 'SenhaCorreta#1';
      const recovery = CryptoService.generateRecoveryKey();
      const envelope = await CryptoService.createEnvelopeEncryptedData('Dados', senha, recovery.formattedKey);

      await expect(CryptoService.decryptEnvelopeWithPassword(envelope, 'SenhaIncorreta#2')).rejects.toThrow();
    });
  });

  describe('Serialização e Desserialização', () => {
    it('deve serializar e desserializar payloads mantendo integridade', async () => {
      const payload = await CryptoService.encryptText('GeaAgro Offline-First', 'Senha123', 5000);
      const json = CryptoService.serializePayload(payload);
      expect(typeof json).toBe('string');

      const reconstituido = CryptoService.deserializePayload(json);
      expect(reconstituido).toEqual(payload);

      const decifrado = await CryptoService.decryptText(reconstituido, 'Senha123');
      expect(decifrado).toBe('GeaAgro Offline-First');
    });

    it('deve rejeitar JSON inválido na desserialização', () => {
      expect(() => CryptoService.deserializePayload('{jsonQuebrado:')).toThrow(
        /Carga criptografada corrompida/
      );
    });
  });
});
