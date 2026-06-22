const jwt        = require('jsonwebtoken');
const jwtService = require('../services/jwt.service');

/**
 * Middleware de Autenticación — Microservicios Alpha y Beta.
 *
 * Flujo de validación:
 *   1. Extrae la cabecera Authorization.
 *   2. Verifica que tenga el formato "Bearer <token>".
 *   3. Valida la firma RS256 usando únicamente la clave pública (verificación autónoma).
 *   4. Si es válido → adjunta el payload a req.user y continúa con next().
 *
 * Política de Observabilidad (Fase 3):
 *   - TokenExpiredError  → HTTP 403 CONTROLADO. NO llama next(err) → Sentry NO lo registra.
 *   - JsonWebTokenError  → HTTP 401 CONTROLADO. NO llama next(err) → Sentry NO lo registra.
 *   Sólo los errores operacionales (500) se propagan con next(err) hacia Sentry.
 */
function authMiddleware(req, res, next) {
  // 1. Verificar presencia de cabecera Authorization
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      error:   'Acceso no autorizado',
      message: 'Falta la cabecera Authorization en la petición.'
    });
  }

  // 2. Verificar formato "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      error:   'Acceso no autorizado',
      message: 'Formato de cabecera de autenticación debe ser: Bearer <token>.'
    });
  }

  const token = parts[1];

  try {
    // 3. Verificar firma RS256 con clave pública (verificación autónoma stateless)
    const decoded = jwtService.verifyToken(token);

    // 4. Adjuntar payload al objeto de petición para uso en controladores
    req.user = decoded;
    next();

  } catch (error) {
    // --- ERROR LÓGICO: Token expirado → 403 Forbidden (NO alertar a Sentry) ---
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(403).json({
        error:   'Token expirado',
        message: 'El token JWT ha expirado. Por favor genera uno nuevo.',
        expiredAt: error.expiredAt
      });
    }

    // --- ERROR LÓGICO: Token inválido/malformado → 401 Unauthorized (NO alertar a Sentry) ---
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error:   'Token inválido',
        message: 'El token JWT es inválido o su firma no es auténtica.'
      });
    }

    // Cualquier otro error inesperado sí lo propagamos
    return res.status(401).json({
      error:   'Error de autenticación',
      message: error.message
    });
  }
}

module.exports = authMiddleware;
