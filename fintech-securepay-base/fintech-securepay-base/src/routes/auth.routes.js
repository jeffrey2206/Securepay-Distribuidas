const express    = require('express');
const router     = express.Router();
const jwtService = require('../services/jwt.service');

/**
 * POST /v1/auth/token
 * Genera un JWT RS256 firmado para el usuario provisto.
 * Body: { "id": "usr_001", "email": "estudiante.alpha@espe.edu.ec" }
 */
router.post('/token', (req, res) => {
  const { id, email } = req.body;

  if (!id || !email) {
    return res.status(400).json({
      error:   'Petición incorrecta',
      message: 'El cuerpo debe contener los campos id y email.'
    });
  }

  try {
    const token = jwtService.signToken({ id, email });
    return res.status(200).json({
      accessToken: token,
      tokenType:   'Bearer',
      algorithm:   'RS256',
      expiresIn:   '2 minutos'
    });
  } catch (error) {
    return res.status(500).json({
      error:   'Error al generar el token',
      message: error.message
    });
  }
});

module.exports = router;
