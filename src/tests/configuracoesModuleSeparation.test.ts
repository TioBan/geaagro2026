import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Configuracoes Module Submodules (Perfil de Uso, Atualizações & Feedback)', () => {
  it('should have separate sub-tabs and decoupled views in ConfiguracoesModule.tsx including Feedback', () => {
    const filePath = path.resolve(process.cwd(), 'src/components/ConfiguracoesModule.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Sub-tab definitions and state
    expect(content).toContain("export type ConfiguracoesSubTab = 'perfil' | 'atualizacoes' | 'feedback'");
    expect(content).toContain("currentTab === 'perfil'");
    expect(content).toContain("currentTab === 'atualizacoes'");
    expect(content).toContain("currentTab === 'feedback'");

    // Separate UI buttons for all 3 sub-modules
    expect(content).toContain('Perfil de Uso');
    expect(content).toContain('Atualizações do Sistema');
    expect(content).toContain('Feedback');

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

  it('should include Perfil de Uso, Atualizações do Sistema and Feedback subitems in Navbar.tsx for Configuracoes', () => {
    const navbarPath = path.resolve(process.cwd(), 'src/components/Navbar.tsx');
    const content = fs.readFileSync(navbarPath, 'utf-8');

    expect(content).toContain("{ id: 'perfil_uso', label: 'Perfil de Uso', icon: Sliders }");
    expect(content).toContain("{ id: 'atualizacoes', label: 'Atualizações do Sistema', icon: RefreshCw }");
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
  });
});
