const mongoose = require('mongoose');
const User = require('../models/userModel');
const { sendResponse } = require('../services/respuesta');


// Crear Usuario
exports.createUser = async (req, res) => {
    try {
        const { birthDate } = req.body;

        // Validar que la fecha de nacimiento esté presente
        if (!birthDate) {
            return sendResponse(res, 400, 'La fecha de nacimiento es requerida', { idTransaction: null });
        }

        // Crear una nueva instancia de usuario
        const newUser = new User({
            birthDate,
        });

        // Guardar el nuevo usuario en la base de datos
        const user = await newUser.save();

        // Enviar respuesta de éxito
        sendResponse(res, 200, 'Usuario creado exitosamente', { idTransaction: user._id });
    } catch (err) {
        console.error('Error creando el usuario:', err);
        sendResponse(res, 500, 'Error al crear el usuario', { idTransaction: null });
    }
};

// Obtener Todos los Usuarios
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        sendResponse(res, 200, 'Usuarios obtenidos con éxito', { idTransaction: users.length });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        sendResponse(res, 500, 'Error al obtener usuarios', { idTransaction: null });
    }
};

// Obtener Usuario por ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return sendResponse(res, 404, 'Usuario no encontrado', { idTransaction: req.params.id });
        }
        sendResponse(res, 200, 'Usuario encontrado', { idTransaction: user._id });
    } catch (error) {
        console.error('Error al obtener usuario por ID:', error);
        sendResponse(res, 500, 'Error al obtener usuario por ID', { idTransaction: null });
    }
};

// Actualizar Usuario
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { birthDate } = req.body;

        // Validar que la fecha de nacimiento esté presente
        if (!birthDate) {
            return sendResponse(res, 400, 'La fecha de nacimiento es requerida', { idTransaction: id });
        }

        // Actualizar el usuario
        const updatedUser = await User.findByIdAndUpdate(id, { birthDate }, { new: true });

        if (!updatedUser) {
            return sendResponse(res, 404, 'Usuario no encontrado', { idTransaction: id });
        }

        sendResponse(res, 200, 'Usuario actualizado exitosamente', { idTransaction: updatedUser._id });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        sendResponse(res, 500, 'Error al actualizar el usuario', { idTransaction: null });
    }
};

// Eliminar Usuario
exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return sendResponse(res, 404, 'Usuario no encontrado', { idTransaction: req.params.id });
        }
        sendResponse(res, 200, 'Usuario eliminado exitosamente', { idTransaction: deletedUser._id });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        sendResponse(res, 500, 'Error al eliminar el usuario', { idTransaction: null });
    }
};
