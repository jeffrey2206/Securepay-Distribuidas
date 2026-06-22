/**
 * TransactionRepository
 * SRP: Única responsabilidad — persistencia del historial de transacciones en memoria.
 * No contiene lógica financiera ni de notificación.
 */

class TransactionRepository {
  constructor() {
    this._history = [];
  }

  /**
   * Persiste una nueva transacción en el historial.
   * @param {Object} transaction - Objeto de transacción a almacenar.
   */
  save(transaction) {
    this._history.push({ ...transaction });
  }

  /**
   * Retorna todas las transacciones almacenadas.
   * @returns {Array}
   */
  getAll() {
    return this._history;
  }

  /**
   * Busca una transacción por su ID.
   * @param {string} transactionId
   * @returns {Object|undefined}
   */
  findById(transactionId) {
    return this._history.find(t => t.transactionId === transactionId);
  }
}

module.exports = TransactionRepository;
