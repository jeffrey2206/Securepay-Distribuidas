const express = require('express');
const router  = express.Router();

const authRoutes     = require('./auth.routes');
const accountRoutes  = require('./account.routes');
const transferRoutes = require('./transfer.routes');

// Rutas de autenticación (generación de tokens JWT)
router.use('/auth', authRoutes);

// Rutas del microservicio Alpha — consulta de saldos
router.use('/account-alpha', accountRoutes);

// Rutas del microservicio Beta — ejecución de transferencias
router.use('/transfer-beta', transferRoutes);

module.exports = router;
