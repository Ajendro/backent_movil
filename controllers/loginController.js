const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Authentication = require('../models/authenticationModel');
const User = require('../models/userModel');
const { sendResponse } = require('../services/respuesta');
require('dotenv').config(); 

const JWT_SECRET = process.env.JWT_SECRET;

// Login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar entrada
        if (!email || !password) {
            return sendResponse(res, 400, 'Email y contraseña son requeridos', null, false);
        }

        // Buscar el email en la base de datos
        const auth = await Authentication.findOne({ email }).populate('user');
        if (!auth) {
            return sendResponse(res, 401, 'Credenciales inválidas: Usuario no encontrado', null, false);
        }

        // Verificar la contraseña
        const isPasswordValid = await bcrypt.compare(password, auth.password);
        if (!isPasswordValid) {
            return sendResponse(res, 401, 'Credenciales inválidas: Contraseña incorrecta', null, false);
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: auth.user._id, email: auth.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Respuesta con token y datos del usuario dentro de 'result'
        const result = {
            token,
            user: {
                id: auth.user._id,
                username: auth.user.username,
                profilePicture: auth.user.profilePicture,
                firstName: auth.user.firstName,
                lastName: auth.user.lastName,
                birthDate: auth.user.birthDate,
                fk_location: auth.user.fk_location
            }
        };

        sendResponse(res, 200, 'Login exitoso', result, true);
    } catch (error) {
        console.error('Error en login:', error);
        sendResponse(res, 500, 'Error en el servidor al intentar iniciar sesión', null, false);
    }
};
