/**
 * TransferController
 * DIP: Las dependencias se componen e inyectan en el constructor.
 *      El controlador no instancia nada de bajo nivel directamente.
 */

const AccountRepository      = require('../services/account.repository');
const BalanceValidatorService = require('../services/balance.validator.service');
const LedgerService           = require('../services/ledger.service');
const TransactionRepository   = require('../services/transaction.repository');
const NotificationService     = require('../services/notification.service');
const TransactionService      = require('../services/transaction.service');

class TransferController {
  constructor() {
    // Composición de dependencias (árbol de objetos inyectados por constructor)
    const accountRepository    = new AccountRepository();
    const balanceValidator     = new BalanceValidatorService(accountRepository);
    const ledgerService        = new LedgerService(accountRepository);
    const transactionRepository = new TransactionRepository();
    const notificationService  = new NotificationService();

    this.transactionService = new TransactionService(
      balanceValidator,
      ledgerService,
      transactionRepository,
      notificationService,
      accountRepository
    );

    // Bind para mantener contexto en Express
    this.executeTransfer = this.executeTransfer.bind(this);
  }

  /**
   * POST /v1/transfer-beta/execute
   * Ejecuta una transferencia bancaria entre dos cuentas.
   */
  executeTransfer(req, res, next) {
    try {
      const { fromAccountId, toAccountId, amount } = req.body;

      if (!fromAccountId || !toAccountId || amount === undefined) {
        return res.status(400).json({
          error:   'Petición incorrecta',
          message: 'Los campos fromAccountId, toAccountId y amount son requeridos en el cuerpo de la petición.'
        });
      }

      const result = this.transactionService.executeTransfer(fromAccountId, toAccountId, Number(amount));
      return res.status(200).json(result);
    } catch (error) {
      // Errores de validación de negocio → 400
      return res.status(400).json({
        error:   'Error en la transacción',
        message: error.message
      });
    }
  }
}

module.exports = new TransferController();
