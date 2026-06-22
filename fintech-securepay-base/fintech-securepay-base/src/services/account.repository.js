/**
 * AccountRepository
 * SRP: Única responsabilidad — acceso y mutación de la fuente de datos de cuentas (BD en memoria).
 * Ningún otro servicio accede directamente al array usersDb.
 */

// Base de datos simulada en memoria (fuente única de verdad)
const usersDb = [
  { id: 'usr_001', email: 'estudiante.alpha@espe.edu.ec', accountAlpha: 'ACC-12345', balance: 1500.00 },
  { id: 'usr_002', email: 'docente.beta@espe.edu.ec',     accountAlpha: 'ACC-67890', balance: 350.50  }
];

class AccountRepository {
  /**
   * Busca una cuenta por su número de cuenta (accountAlpha).
   * @param {string} accountId
   * @returns {Object|undefined}
   */
  findByAccountId(accountId) {
    return usersDb.find(u => u.accountAlpha === accountId);
  }

  /**
   * Busca un usuario por su ID único.
   * @param {string} userId
   * @returns {Object|undefined}
   */
  findById(userId) {
    return usersDb.find(u => u.id === userId);
  }

  /**
   * Actualiza el saldo de una cuenta.
   * @param {string} accountId
   * @param {number} newBalance
   */
  updateBalance(accountId, newBalance) {
    const account = this.findByAccountId(accountId);
    if (account) {
      account.balance = newBalance;
    }
  }

  /**
   * Retorna todos los usuarios (solo para operaciones administrativas).
   * @returns {Array}
   */
  findAll() {
    return usersDb;
  }
}

module.exports = AccountRepository;
