import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Configuracoes Module Submodules (Perfil de Uso, Memória, Energia, Tema, Atualizações, Sobre & Feedback)', () => {
  it('should have separate sub-tabs and decoupled views in ConfiguracoesModule.tsx including Memória, Energia, Tema, Sobre and Feedback', () => {
    const filePath = path.resolve(process.cwd(), 'src/components/ConfiguracoesModule.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Sub-tab definitions and state
    expect(content).toContain("export type ConfiguracoesSubTab = 'perfil' | 'memoria' | 'energia' | 'tema' | 'atualizacoes' | 'sobre' | 'feedback'");
    expect(content).toContain("currentTab === 'perfil'");
    expect(content).toContain("currentTab === 'memoria'");
    expect(content).toContain("currentTab === 'energia'");
    expect(content).toContain("currentTab === 'tema'");
    expect(content).toContain("currentTab === 'atualizacoes'");
    expect(content).toContain("currentTab === 'sobre'");
    expect(content).toContain("currentTab === 'feedback'");

    // Separate UI buttons for all sub-modules
    expect(content).toContain('Perfil de Uso');
    expect(content).toContain('Módulo de Memória');
    expect(content).toContain('Módulo de Energia');
    expect(content).toContain('Módulo Tema');
    expect(content).toContain('Atualizações do Sistema');
    expect(content).toContain('Sobre');
    expect(content).toContain('Feedback');

    // Theme options: Claro, Escuro, AMOLED (100%)
    expect(content).toContain('Claro');
    expect(content).toContain('Escuro');
    expect(content).toContain('AMOLED (100%)');

    // Feedback Google Forms link
    expect(content).toContain('https://docs.google.com/forms/d/e/1FAIpQLSfFbadWdvEIkXgLVJRHl_Tqmz_nKirv88GsoygKI2VynSJeSQ/viewform?usp=publish-editor');

    // Perfil de Uso section contents
    expect(content).toContain('1. Escolha seu Perfil de Uso');
    expect(content).toContain('2. Incluir ou Alterar Módulos Desejados');

    // Atualizacoes section contents
    expect(content).toContain('Atualizações & Versões do GeaAgro');
    expect(content).toContain('Histórico de Versões & Notas de Lançamento');
    expect(content).toContain('OPFS + WASM');
  });

  it('should include Memória, Energia, Tema, Sobre, Perfil de Uso, Atualizações and Feedback subitems in Navbar.tsx under Configuracoes', () => {
    const navbarPath = path.resolve(process.cwd(), 'src/components/Navbar.tsx');
    const content = fs.readFileSync(navbarPath, 'utf-8');

    expect(content).toContain("{ id: 'perfil_uso', label: 'Perfil de Uso', icon: Sliders }");
    expect(content).toContain("{ id: 'memoria', label: 'Módulo de Memória', icon: Cpu }");
    expect(content).toContain("{ id: 'energia', label: 'Módulo de Energia', icon: Zap }");
    expect(content).toContain("{ id: 'tema', label: 'Módulo Tema', icon: Sun }");
    expect(content).toContain("{ id: 'atualizacoes', label: 'Atualizações do Sistema', icon: RefreshCw }");
    expect(content).toContain("{ id: 'sobre', label: 'Sobre', icon: Info }");
    expect(content).toContain("id: 'feedback'");
    expect(content).toContain("label: 'Feedback'");
    expect(content).toContain('https://docs.google.com/forms/d/e/1FAIpQLSfFbadWdvEIkXgLVJRHl_Tqmz_nKirv88GsoygKI2VynSJeSQ/viewform?usp=publish-editor');

    // Must NOT contain individual profiles as subitems in Configuracoes
    const configBlockMatch = content.match(/id:\s*'configuracoes'[\s\S]*?subItems:\s*\[([\s\S]*?)\]/);
    expect(configBlockMatch).not.toBeNull();
    const subItemsBlock = configBlockMatch![1];
    expect(subItemsBlock).not.toContain('Perfil Agricultor');
    expect(subItemsBlock).not.toContain('Perfil Pecuarista');
    expect(subItemsBlock).not.toContain('Perfil Administrador');
    expect(subItemsBlock).not.toContain('Perfil Perícia');
    expect(subItemsBlock).not.toContain('Todos os Módulos');
    expect(subItemsBlock).toContain("id: 'sobre'");
  });
});
