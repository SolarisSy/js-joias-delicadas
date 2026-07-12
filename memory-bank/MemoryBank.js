/**
 * MemoryBank - Sistema de armazenamento de dados persistente
 * Funciona tanto em Node.js quanto no navegador (localStorage)
 */

class MemoryBank {
  constructor(storageName = 'appMemory') {
    this.storageName = storageName;
    this.isNodeEnv = typeof window === 'undefined';
    this.data = this.loadData();
  }

  /**
   * Carrega dados do armazenamento
   */
  loadData() {
    try {
      if (this.isNodeEnv) {
        // Node.js
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, `${this.storageName}.json`);
        
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          return JSON.parse(fileContent);
        }
      } else {
        // Navegador
        const stored = localStorage.getItem(this.storageName);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    return {};
  }

  /**
   * Salva dados no armazenamento
   */
  saveData() {
    try {
      if (this.isNodeEnv) {
        // Node.js
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, `${this.storageName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(this.data, null, 2), 'utf-8');
        console.log(`✓ Dados salvos em ${filePath}`);
      } else {
        // Navegador
        localStorage.setItem(this.storageName, JSON.stringify(this.data));
        console.log('✓ Dados salvos no localStorage');
      }
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  }

  /**
   * Define um valor na memória
   * @param {string} key - Chave do dado
   * @param {any} value - Valor a ser armazenado
   */
  set(key, value) {
    this.data[key] = value;
    this.saveData();
    return this;
  }

  /**
   * Obtém um valor da memória
   * @param {string} key - Chave do dado
   * @param {any} defaultValue - Valor padrão se não encontrar
   */
  get(key, defaultValue = null) {
    return this.data[key] !== undefined ? this.data[key] : defaultValue;
  }

  /**
   * Verifica se uma chave existe
   * @param {string} key - Chave a verificar
   */
  has(key) {
    return key in this.data;
  }

  /**
   * Remove um dado da memória
   * @param {string} key - Chave a remover
   */
  remove(key) {
    delete this.data[key];
    this.saveData();
    return this;
  }

  /**
   * Limpa toda a memória
   */
  clear() {
    this.data = {};
    this.saveData();
    console.log('✓ Memória limpa');
    return this;
  }

  /**
   * Obtém todas as chaves
   */
  keys() {
    return Object.keys(this.data);
  }

  /**
   * Obtém todos os dados
   */
  getAll() {
    return { ...this.data };
  }

  /**
   * Incrementa um valor numérico
   * @param {string} key - Chave do dado
   * @param {number} amount - Quantidade a incrementar (padrão: 1)
   */
  increment(key, amount = 1) {
    const current = this.get(key, 0);
    this.set(key, current + amount);
    return this.get(key);
  }

  /**
   * Decrementa um valor numérico
   * @param {string} key - Chave do dado
   * @param {number} amount - Quantidade a decrementar (padrão: 1)
   */
  decrement(key, amount = 1) {
    const current = this.get(key, 0);
    this.set(key, current - amount);
    return this.get(key);
  }

  /**
   * Adiciona item a um array
   * @param {string} key - Chave do array
   * @param {any} value - Valor a adicionar
   */
  push(key, value) {
    if (!this.has(key)) {
      this.set(key, []);
    }
    if (Array.isArray(this.data[key])) {
      this.data[key].push(value);
      this.saveData();
    }
    return this;
  }

  /**
   * Remove item de um array
   * @param {string} key - Chave do array
   * @param {number} index - Índice a remover
   */
  pop(key, index = -1) {
    if (this.has(key) && Array.isArray(this.data[key])) {
      if (index === -1) {
        return this.data[key].pop();
      } else {
        const item = this.data[key][index];
        this.data[key].splice(index, 1);
        this.saveData();
        return item;
      }
    }
    return null;
  }

  /**
   * Exibe todos os dados formatados
   */
  display() {
    console.table(this.data);
    return this;
  }

  /**
   * Exporta dados como JSON string
   */
  export() {
    return JSON.stringify(this.data, null, 2);
  }

  /**
   * Importa dados de um JSON string
   * @param {string} jsonString - String JSON a importar
   */
  import(jsonString) {
    try {
      this.data = JSON.parse(jsonString);
      this.saveData();
      console.log('✓ Dados importados com sucesso');
      return this;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return this;
    }
  }
}

// Exporta para Node.js e navegador
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MemoryBank;
}
