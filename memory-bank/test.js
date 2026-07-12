/**
 * Testes para MemoryBank
 * Execute com: node test.js
 */

const MemoryBank = require('./MemoryBank.js');

console.log('='.repeat(50));
console.log('TESTES DO MEMORY BANK');
console.log('='.repeat(50));

const memory = new MemoryBank('teste');

// Teste 1: Set e Get
console.log('\n✓ Teste 1: SET e GET');
memory.set('nome', 'João');
console.log('   Resultado:', memory.get('nome') === 'João' ? 'PASSOU' : 'FALHOU');

// Teste 2: Has
console.log('\n✓ Teste 2: HAS');
console.log('   Resultado:', memory.has('nome') ? 'PASSOU' : 'FALHOU');

// Teste 3: Increment
console.log('\n✓ Teste 3: INCREMENT');
memory.set('contador', 0);
memory.increment('contador', 5);
console.log('   Resultado:', memory.get('contador') === 5 ? 'PASSOU' : 'FALHOU');

// Teste 4: Decrement
console.log('\n✓ Teste 4: DECREMENT');
memory.decrement('contador', 2);
console.log('   Resultado:', memory.get('contador') === 3 ? 'PASSOU' : 'FALHOU');

// Teste 5: Push
console.log('\n✓ Teste 5: PUSH');
memory.set('items', []);
memory.push('items', 'item1');
memory.push('items', 'item2');
console.log('   Resultado:', memory.get('items').length === 2 ? 'PASSOU' : 'FALHOU');

// Teste 6: Pop
console.log('\n✓ Teste 6: POP');
memory.pop('items', 0);
console.log('   Resultado:', memory.get('items').length === 1 ? 'PASSOU' : 'FALHOU');

// Teste 7: Keys
console.log('\n✓ Teste 7: KEYS');
const keys = memory.keys();
console.log('   Chaves:', keys.join(', '));
console.log('   Resultado:', keys.length > 0 ? 'PASSOU' : 'FALHOU');

// Teste 8: Remove
console.log('\n✓ Teste 8: REMOVE');
memory.remove('contador');
console.log('   Resultado:', !memory.has('contador') ? 'PASSOU' : 'FALHOU');

// Teste 9: Export/Import
console.log('\n✓ Teste 9: EXPORT/IMPORT');
const exported = memory.export();
memory.clear();
memory.import(exported);
console.log('   Resultado:', memory.has('nome') ? 'PASSOU' : 'FALHOU');

// Teste 10: GetAll
console.log('\n✓ Teste 10: GETALL');
const all = memory.getAll();
console.log('   Total de itens:', Object.keys(all).length);
console.log('   Resultado:', Object.keys(all).length > 0 ? 'PASSOU' : 'FALHOU');

console.log('\n' + '='.repeat(50));
console.log('TODOS OS TESTES CONCLUÍDOS! ✓');
console.log('='.repeat(50));

// Exibir dados finais
console.log('\nDados armazenados:');
memory.display();
