const mongoose = require('mongoose');
const User = require('../models/userModel');

// Crear Usuario
exports.createUser = async (req, res) => {
    try {
        const { birthDate } = req.body;

        // Validar que la fecha de nacimiento esté presente
        if (!birthDate) {
            return res.status(400).json({ error: 'La fecha de nacimiento es requerida' });
        }

        // Crear una nueva instancia de usuario
        const newUser = new User({
            birthDate,
        });

        // Guardar el nuevo usuario en la base de datos
        const user = await newUser.save();

        // Enviar respuesta de éxito
        res.status(201).json({ message: 'Usuario creado exitosamente', user });
    } catch (err) {
        console.error('Error creando el usuario:', err);
        res.status(500).json({ error: 'Error al crear el usuario: ' + err.message });
    }
};

// Obtener Todos los Usuarios
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios: ' + error.message });
    }
};

// Obtener Usuario por ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error al obtener usuario por ID:', error);
        res.status(500).json({ error: 'Error al obtener usuario por ID: ' + error.message });
    }
};

// Actualizar Usuario
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { birthDate } = req.body;

        // Validar que la fecha de nacimiento esté presente
        if (!birthDate) {
            return res.status(400).json({ error: 'La fecha de nacimiento es requerida' });
        }

        // Actualizar el usuario
        const updatedUser = await User.findByIdAndUpdate(id, { birthDate }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Usuario actualizado exitosamente', user: updatedUser });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Error al actualizar el usuario: ' + error.message });
    }
};

// Eliminar Usuario
exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error al eliminar el usuario: ' + error.message });
    }
};
