// middleware/verifyToken.js
const jwt = require('jsonwebtoken');
const { sendResponse } = require('../services/respuesta');
require('dotenv').config(); 

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    // Verifica que el token esté en el encabezado de la solicitud
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Extrae el token

    // Si no se encuentra un token
    if (!token) {
        return sendResponse(res, 401, 'Acceso denegado: No hay token');
    }

    try {
        // Verificar y decodificar el token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Los datos del usuario se guardan en req.user
        next(); // Pasa al siguiente middleware o ruta
    } catch (error) {
        console.error('Error al verificar el token:', error);
        return sendResponse(res, 401, 'Token inválido o expirado');
    }
};

module.exports = verifyToken;
