/**
 * Exemplos de uso do MemoryBank
 */

// ============================================
// EXEMPLOS PARA NAVEGADOR (localStorage)
// ============================================

// 1. Criar instância
const memory = new MemoryBank('meuApp');

// 2. Salvar dados simples
memory.set('usuario', { nome: 'João', email: 'joao@example.com' });
memory.set('tema', 'dark');
memory.set('idioma', 'pt-BR');

// 3. Recuperar dados
console.log(memory.get('usuario'));
console.log(memory.get('tema'));

// 4. Verificar se existe
if (memory.has('usuario')) {
  console.log('Usuário existe na memória');
}

// 5. Trabalhar com contadores
memory.set('visualizacoes', 0);
memory.increment('visualizacoes', 1);  // 1
memory.increment('visualizacoes', 5);  // 6
memory.decrement('visualizacoes', 2);  // 4

// 6. Trabalhar com arrays
memory.set('carrinho', []);
memory.push('carrinho', { id: 1, produto: 'Anel', preco: 150 });
memory.push('carrinho', { id: 2, produto: 'Brinco', preco: 80 });
console.log(memory.get('carrinho'));

// 7. Listar todas as chaves
console.log(memory.keys());

// 8. Obter todos os dados
console.log(memory.getAll());

// 9. Remover um dado específico
memory.remove('tema');

// 10. Exibir todos os dados
memory.display();

// 11. Exportar dados
const jsonExportado = memory.export();
console.log(jsonExportado);

// 12. Limpar toda a memória
// memory.clear();


// ============================================
// EXEMPLO REAL: LOJA DE JOIAS
// ============================================

class LojaMemoria {
  constructor() {
    this.memory = new MemoryBank('loja-joias');
    this.inicializar();
  }

  inicializar() {
    if (!this.memory.has('carrinho')) {
      this.memory.set('carrinho', []);
      this.memory.set('total', 0);
      this.memory.set('usuario', null);
      this.memory.set('historico', []);
    }
  }

  adicionarAoCarrinho(produto) {
    this.memory.push('carrinho', produto);
    this.atualizarTotal();
    console.log(`✓ ${produto.nome} adicionado ao carrinho`);
  }

  removerDoCarrinho(index) {
    this.memory.pop('carrinho', index);
    this.atualizarTotal();
  }

  atualizarTotal() {
    const carrinho = this.memory.get('carrinho', []);
    const total = carrinho.reduce((sum, item) => sum + item.preco, 0);
    this.memory.set('total', total);
  }

  finalizarCompra(usuario) {
    const carrinho = this.memory.get('carrinho', []);
    if (carrinho.length > 0) {
      const compra = {
        id: Date.now(),
        usuario,
        itens: carrinho,
        total: this.memory.get('total'),
        data: new Date().toLocaleString('pt-BR')
      };
      this.memory.push('historico', compra);
      this.memory.set('usuario', usuario);
      this.memory.set('carrinho', []);
      this.memory.set('total', 0);
      console.log('✓ Compra finalizada com sucesso!');
    }
  }

  obterCarrinho() {
    return this.memory.get('carrinho', []);
  }

  obterTotal() {
    return this.memory.get('total', 0);
  }

  obterHistorico() {
    return this.memory.get('historico', []);
  }
}

// Usar exemplo
// const loja = new LojaMemoria();
// loja.adicionarAoCarrinho({ nome: 'Anel Ouro', preco: 500 });
// loja.adicionarAoCarrinho({ nome: 'Brinco Prata', preco: 200 });
// console.log(`Total: R$ ${loja.obterTotal()}`);
// loja.finalizarCompra('Maria Silva');
