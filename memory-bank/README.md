# Memory Bank 🧠

Sistema de armazenamento de dados persistente em JavaScript. Funciona tanto em **Node.js** quanto no **navegador** (usando localStorage).

## Instalação

### No Navegador
```html
<script src="memory-bank/MemoryBank.js"></script>
<script src="memory-bank/exemplos.js"></script>
```

### No Node.js
```javascript
const MemoryBank = require('./memory-bank/MemoryBank.js');
```

## Como Usar

### Criar uma instância
```javascript
const memory = new MemoryBank('meuApp');
```

## Métodos Disponíveis

### Operações Básicas

#### `set(key, value)`
Salva um valor na memória
```javascript
memory.set('usuario', { nome: 'João', email: 'joao@email.com' });
memory.set('tema', 'dark');
```

#### `get(key, defaultValue)`
Recupera um valor da memória
```javascript
const usuario = memory.get('usuario');
const tema = memory.get('tema', 'light'); // com valor padrão
```

#### `has(key)`
Verifica se uma chave existe
```javascript
if (memory.has('usuario')) {
  console.log('Usuário existe');
}
```

#### `remove(key)`
Remove um item específico
```javascript
memory.remove('tema');
```

#### `clear()`
Limpa toda a memória
```javascript
memory.clear();
```

### Operações com Números

#### `increment(key, amount)`
Incrementa um valor numérico
```javascript
memory.set('visualizacoes', 0);
memory.increment('visualizacoes');      // 1
memory.increment('visualizacoes', 5);   // 6
```

#### `decrement(key, amount)`
Decrementa um valor numérico
```javascript
memory.decrement('visualizacoes', 2);   // 4
```

### Operações com Arrays

#### `push(key, value)`
Adiciona item a um array
```javascript
memory.set('carrinho', []);
memory.push('carrinho', { id: 1, nome: 'Anel' });
memory.push('carrinho', { id: 2, nome: 'Brinco' });
```

#### `pop(key, index)`
Remove item de um array
```javascript
memory.pop('carrinho');      // Remove último item
memory.pop('carrinho', 0);   // Remove primeiro item
```

### Operações de Consulta

#### `keys()`
Retorna todas as chaves armazenadas
```javascript
const todasAsChaves = memory.keys();
// ['usuario', 'tema', 'carrinho']
```

#### `getAll()`
Retorna todos os dados
```javascript
const todosDados = memory.getAll();
```

#### `display()`
Exibe todos os dados em formato tabela
```javascript
memory.display();
```

### Importar/Exportar

#### `export()`
Exporta dados como JSON string
```javascript
const json = memory.export();
console.log(json);
```

#### `import(jsonString)`
Importa dados de uma string JSON
```javascript
memory.import('{"usuario": {"nome": "Maria"}}');
```

## Exemplos Práticos

### 1. Gerenciar Preferências do Usuário
```javascript
const memory = new MemoryBank('appPrefs');

memory.set('idioma', 'pt-BR');
memory.set('tema', 'dark');
memory.set('notificacoes', true);

console.log(memory.getAll());
```

### 2. Carrinho de Compras
```javascript
const memory = new MemoryBank('loja');

// Adicionar produtos
memory.set('carrinho', []);
memory.push('carrinho', { id: 1, nome: 'Anel', preco: 150 });
memory.push('carrinho', { id: 2, nome: 'Brinco', preco: 80 });

// Calcular total
const carrinho = memory.get('carrinho');
const total = carrinho.reduce((sum, item) => sum + item.preco, 0);
memory.set('total', total);

console.log(`Total: R$ ${memory.get('total')}`);
```

### 3. Sistema de Contadores
```javascript
const memory = new MemoryBank('stats');

memory.set('visualizacoes', 0);
memory.set('cliques', 0);
memory.set('compartilhamentos', 0);

// Simular eventos
memory.increment('visualizacoes', 10);
memory.increment('cliques', 3);
memory.increment('compartilhamentos', 1);

console.log(memory.getAll());
```

### 4. Histórico de Ações
```javascript
const memory = new MemoryBank('historico');

memory.set('acoes', []);

// Registrar ações
memory.push('acoes', {
  tipo: 'login',
  usuario: 'joao@email.com',
  data: new Date()
});

memory.push('acoes', {
  tipo: 'compra',
  valor: 150,
  data: new Date()
});

console.log(memory.get('acoes'));
```

## Armazenamento

### No Navegador
Os dados são salvos em **localStorage** automaticamente após cada operação.
- Local: DevTools → Application → Local Storage
- Chave padrão: `appMemory`

### No Node.js
Os dados são salvos em um arquivo **JSON** automaticamente.
- Local: `memory-bank/appMemory.json` (ou outro nome definido)

## Métodos de Encadeamento

Todos os métodos que modificam dados retornam `this`, permitindo encadeamento:

```javascript
memory
  .set('usuario', { nome: 'João' })
  .set('tema', 'dark')
  .push('historico', { acao: 'login' })
  .display();
```

## Boas Práticas

✅ **Faça:**
- Use nomes descritivos para as chaves
- Organize dados relacionados em objetos
- Valide dados antes de salvar
- Use `has()` para verificar existência antes de usar

❌ **Evite:**
- Armazenar dados sensíveis (senhas, tokens)
- Colocar dados muito grandes em localStorage
- Confiar apenas em localStorage para dados críticos

## Limitações

- **localStorage**: ~5-10MB por domínio (navegador)
- **Node.js**: Limitado pelo espaço em disco
- Não é adequado para dados altamente sensíveis

## Compatibilidade

✅ Chrome, Firefox, Safari, Edge  
✅ Node.js 12+  
✅ Navegadores modernos com localStorage

---

**Desenvolvido para o projeto Joias Delicadas** 💎
