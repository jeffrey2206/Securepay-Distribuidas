/**
 * BalanceValidatorService
 * SRP: Única responsabilidad — aplicar las reglas de validación financiera.
 * DIP: Recibe accountRepository inyectado por constructor; no lo instancia internamente.
 */

class BalanceValidatorService {
  /**
   * @param {import('./account.repository')} accountRepository
   */
  constructor(accountRepository) {
    this.accountRepository = accountRepository;
  }

  /**
   * Valida que la cuenta origen exista, que la cuenta destino exista,
   * que el monto sea positivo y que haya saldo suficiente.
   *
   * @param {string} fromAccountId
   * @param {string} toAccountId
   * @param {number} amount
   * @throws {Error} Si alguna regla de negocio no se cumple.
   * @returns {{ sender: Object, receiver: Object }} Entidades validadas.
   */
  validate(fromAccountId, toAccountId, amount) {
    const sender = this.accountRepository.findByAccountId(fromAccountId);
    if (!sender) {
      throw new Error(`Error de validación: La cuenta origen '${fromAccountId}' no existe en la base de datos.`);
    }

    const receiver = this.accountRepository.findByAccountId(toAccountId);
    if (!receiver) {
      throw new Error(`Error de validación: La cuenta destino '${toAccountId}' no existe en la base de datos.`);
    }

    if (amount <= 0) {
      throw new Error('Error de validación: El monto a transferir debe ser mayor a cero.');
    }

    if (sender.balance < amount) {
      throw new Error(
        `Saldo insuficiente: La cuenta '${fromAccountId}' tiene $${sender.balance}, requiere $${amount}.`
      );
    }

    return { sender, receiver };
  }
}

module.exports = BalanceValidatorService;
