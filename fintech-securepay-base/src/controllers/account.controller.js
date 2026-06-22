/**
 * AccountController
 * DIP: accountRepository se inyecta en el constructor.
 *      SRP: El controller solo coordina la petición HTTP y delega al repositorio.
 */

const AccountRepository = require('../services/account.repository');

class AccountController {
  constructor() {
    this.accountRepository = new AccountRepository();

    // Bind para mantener contexto en Express
    this.getBalance = this.getBalance.bind(this);
  }

  /**
   * GET /v1/account-alpha/balance?accountId=ACC-XXXXX
   * Retorna el saldo actual de una cuenta.
   */
  getBalance(req, res) {
    try {
      const accountId = req.query.accountId;

      if (!accountId) {
        return res.status(400).json({
          error:   'Petición incorrecta',
          message: 'Debe proporcionar un parámetro accountId por query string (ej: ?accountId=ACC-12345).'
        });
      }

      const account = this.accountRepository.findByAccountId(accountId);

      if (!account) {
        return res.status(404).json({
          error:   'Recurso no encontrado',
          message: `La cuenta '${accountId}' no existe.`
        });
      }

      return res.status(200).json({
        accountId: account.accountAlpha,
        email:     account.email,
        balance:   account.balance
      });
    } catch (error) {
      return res.status(404).json({
        error:   'Recurso no encontrado',
        message: error.message
      });
    }
  }
}

module.exports = new AccountController();
