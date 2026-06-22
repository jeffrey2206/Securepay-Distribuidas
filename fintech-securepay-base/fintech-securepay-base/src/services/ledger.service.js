/**
 * LedgerService
 * SRP: Única responsabilidad — ejecutar la deducción/acreditación de saldos
 *      y construir el registro de la transacción.
 * DIP: Recibe accountRepository inyectado por constructor.
 */

class LedgerService {
  /**
   * @param {import('./account.repository')} accountRepository
   */
  constructor(accountRepository) {
    this.accountRepository = accountRepository;
  }

  /**
   * Debita el monto de la cuenta origen y lo acredita en la cuenta destino.
   * Genera y retorna el objeto de transacción correspondiente.
   *
   * @param {Object} sender   - Objeto de cuenta origen (ya validado).
   * @param {Object} receiver - Objeto de cuenta destino (ya validado).
   * @param {number} amount   - Monto a transferir.
   * @returns {Object} Registro de transacción generado.
   */
  applyTransfer(sender, receiver, amount) {
    // Deducción y acreditación de saldos
    const newSenderBalance   = parseFloat((sender.balance   - amount).toFixed(2));
    const newReceiverBalance = parseFloat((receiver.balance + amount).toFixed(2));

    this.accountRepository.updateBalance(sender.accountAlpha,   newSenderBalance);
    this.accountRepository.updateBalance(receiver.accountAlpha, newReceiverBalance);

    // Construir el registro de la transacción
    const transaction = {
      transactionId: `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      from:      sender.accountAlpha,
      to:        receiver.accountAlpha,
      amount:    amount,
      status:    'COMPLETED',
      timestamp: new Date().toISOString()
    };

    return {
      transaction,
      newSenderBalance
    };
  }
}

module.exports = LedgerService;
