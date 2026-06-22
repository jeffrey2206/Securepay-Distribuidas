/**
 * TransactionService
 * SRP: Única responsabilidad — orquestar el flujo completo de una transferencia,
 *      delegando cada paso a los servicios de bajo nivel especializados.
 * DIP: Todos los colaboradores se inyectan por constructor.
 *      Este servicio NO instancia ninguna dependencia internamente.
 */

class TransactionService {
  /**
   * @param {import('./balance.validator.service')} balanceValidator
   * @param {import('./ledger.service')}            ledgerService
   * @param {import('./transaction.repository')}   transactionRepository
   * @param {import('./notification.service')}     notificationService
   * @param {import('./account.repository')}       accountRepository
   */
  constructor(balanceValidator, ledgerService, transactionRepository, notificationService, accountRepository) {
    this.balanceValidator      = balanceValidator;
    this.ledgerService         = ledgerService;
    this.transactionRepository = transactionRepository;
    this.notificationService   = notificationService;
    this.accountRepository     = accountRepository;
  }

  /**
   * Ejecuta una transferencia bancaria completa:
   *   1. Valida reglas de negocio (cuentas, montos, saldo).
   *   2. Aplica los movimientos contables (débito/crédito).
   *   3. Persiste el registro de la transacción.
   *   4. Envía notificaciones al remitente y al receptor.
   *
   * @param {string} fromAccountId
   * @param {string} toAccountId
   * @param {number} amount
   * @returns {Object} Resultado de la operación.
   */
  executeTransfer(fromAccountId, toAccountId, amount) {
    // Paso 1 — Validar
    const { sender, receiver } = this.balanceValidator.validate(fromAccountId, toAccountId, amount);

    // Paso 2 — Debitar / Acreditar y obtener nuevo saldo
    const { transaction, newSenderBalance } = this.ledgerService.applyTransfer(sender, receiver, amount);

    // Paso 3 — Actualizar saldo del receiver para la notificación
    const updatedReceiver = this.accountRepository.findByAccountId(toAccountId);

    // Paso 4 — Persistir
    this.transactionRepository.save(transaction);

    // Paso 5 — Notificar
    this.notificationService.notifyDebit(sender, fromAccountId, amount, newSenderBalance);
    this.notificationService.notifyCredit(updatedReceiver, fromAccountId, amount, updatedReceiver.balance);

    return {
      success:          true,
      message:          'Transferencia ejecutada con éxito',
      transaction:      transaction,
      balanceRestante:  newSenderBalance
    };
  }

  /**
   * Obtiene el saldo de una cuenta consultando el repositorio.
   * @param {string} accountId
   * @returns {Object}
   */
  getAccountBalance(accountId) {
    const account = this.accountRepository.findByAccountId(accountId);
    if (!account) {
      throw new Error(`La cuenta '${accountId}' no existe.`);
    }
    return {
      accountId: account.accountAlpha,
      email:     account.email,
      balance:   account.balance
    };
  }
}

module.exports = TransactionService;
