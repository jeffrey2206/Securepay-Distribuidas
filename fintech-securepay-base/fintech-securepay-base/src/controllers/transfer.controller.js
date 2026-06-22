/**
 * TransferController
 * DIP: Las dependencias se componen e inyectan en el constructor.
 *      El controlador no instancia nada de bajo nivel directamente.
 *
 * Política de Observabilidad (Fase 3):
 *   - Errores de validación de negocio (400) → manejados localmente, NO van a Sentry.
 *   - Errores operacionales (500)             → Sentry.setUser adjunta contexto de usuario
 *     y next(err) propaga el error al handler de Sentry para su captura en el Dashboard.
 */

const Sentry = require('../instrument');

const AccountRepository       = require('../services/account.repository');
const BalanceValidatorService = require('../services/balance.validator.service');
const LedgerService           = require('../services/ledger.service');
const TransactionRepository   = require('../services/transaction.repository');
const NotificationService     = require('../services/notification.service');
const TransactionService      = require('../services/transaction.service');

class TransferController {
  constructor() {
    // Composición de dependencias (árbol de objetos inyectados por constructor)
    const accountRepository     = new AccountRepository();
    const balanceValidator      = new BalanceValidatorService(accountRepository);
    const ledgerService         = new LedgerService(accountRepository);
    const transactionRepository = new TransactionRepository();
    const notificationService   = new NotificationService();

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
   *
   * Flujo de observabilidad:
   *   1. Adjunta el ID de usuario al contexto de Sentry con setUser().
   *   2. Simula un fallo operacional de BD → lanza Error 500.
   *   3. next(err) propaga al Sentry Error Handler → captura en Dashboard con Tags.
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

      // ── Observabilidad: Adjuntar contexto de usuario al scope de Sentry ──────
      // Esto garantiza que el Tag 'user.id' aparezca en el reporte del Dashboard.
      Sentry.setUser({
        id:    req.user?.sub   || 'desconocido',
        email: req.user?.name  || 'sin-email'
      });

      // ── Simulación de Fallo Operacional ───────────────────────────────────────
      // ERROR OPERACIONAL: Fallo de conexión al Clúster de Datos SecurePay.
      // Este error DEBE alertar a Sentry con el Tag de usuario adjunto.
      throw new Error('Conexión interrumpida con el Clúster de Datos SecurePay');

      // Nota: En un entorno real, aquí iría la llamada al servicio de transacciones:
      // const result = this.transactionService.executeTransfer(fromAccountId, toAccountId, Number(amount));
      // return res.status(200).json(result);

    } catch (error) {
      // Propagar el error al Sentry Error Handler (setupExpressErrorHandler)
      // para que sea capturado y reportado con telemetría completa.
      return next(error);
    }
  }
}

module.exports = new TransferController();
