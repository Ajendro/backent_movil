// middleware/verifyToken.js
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { sendResponse } = require('../services/respuesta');

const JWT_SECRET = process.env.JWT_SECRET;
console.log("token:",JWT_SECRET)

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
        console.log('Token decodificado:', decoded); // Agregar este log para verificar
        next(); 
    } catch (error) {
        console.error('Error al verificar el token:', error);
        return sendResponse(res, 401, 'Token inválido o expirado');
    }
};

module.exports = verifyToken;
