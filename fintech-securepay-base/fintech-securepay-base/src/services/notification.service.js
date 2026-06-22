/**
 * NotificationService
 * SRP: Única responsabilidad — emitir notificaciones de confirmación (simula envío de correos).
 * No contiene lógica financiera, de validación ni de persistencia.
 */

class NotificationService {
  /**
   * Notifica al remitente que su débito fue procesado.
   * @param {Object} sender      - Entidad del remitente.
   * @param {string} fromAccountId
   * @param {number} amount
   * @param {number} newBalance  - Saldo actualizado tras la transferencia.
   */
  notifyDebit(sender, fromAccountId, amount, newBalance) {
    console.log(`\n--- [EMAIL OUTBOX] Enviando correo de confirmación de débito ---`);
    console.log(`Para:    ${sender.email}`);
    console.log(`Asunto:  Débito por Transferencia Realizada - Fintech SecurePay`);
    console.log(`Mensaje: Estimado usuario, se ha debitado de su cuenta ${fromAccountId} el valor de $${amount}.`);
    console.log(`         Su nuevo saldo disponible es: $${newBalance}.`);
    console.log(`--------------------------------------------------------------\n`);
  }

  /**
   * Notifica al receptor que ha recibido un crédito.
   * @param {Object} receiver    - Entidad del receptor.
   * @param {string} fromAccountId
   * @param {number} amount
   * @param {number} newBalance  - Saldo actualizado tras la transferencia.
   */
  notifyCredit(receiver, fromAccountId, amount, newBalance) {
    console.log(`\n--- [EMAIL OUTBOX] Enviando correo de confirmación de crédito ---`);
    console.log(`Para:    ${receiver.email}`);
    console.log(`Asunto:  Crédito por Transferencia Recibida - Fintech SecurePay`);
    console.log(`Mensaje: Estimado usuario, ha recibido una transferencia de $${amount} de la cuenta ${fromAccountId}.`);
    console.log(`         Su nuevo saldo disponible es: $${newBalance}.`);
    console.log(`---------------------------------------------------------------\n`);
  }
}

module.exports = NotificationService;
