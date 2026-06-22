/**
 * instrument.js — Módulo de Inicialización de Sentry
 *
 * CRÍTICO: Este archivo DEBE ser importado como la primera línea absoluta
 * del entrypoint (index.js), antes que Express, dotenv o cualquier otra librería.
 * De lo contrario, Sentry no puede interceptar correctamente todos los errores
 * operacionales (trazas de pila incompletas, instrumentación deficiente).
 *
 * Política de observabilidad distribuida SecurePay:
 *   ✅ ERROR OPERACIONAL (500) → Sentry captura + Tags de usuario adjuntados.
 *   🚫 ERROR LÓGICO (401/403)  → Manejado en auth.middleware sin propagar a Sentry.
 */

require('dotenv').config();
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Captura el 100% de las transacciones para trazabilidad completa en evaluación
  tracesSampleRate: 1.0,

  // Entorno de ejecución (sobreescribir en producción con 'production')
  environment: process.env.NODE_ENV || 'development',

  // Información de la release para correlacionar errores con versiones
  release: 'fintech-securepay@1.0.0'
});

module.exports = Sentry;
