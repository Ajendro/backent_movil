const mongoose = require('mongoose');
const User = require('../models/userModel');
const Location = require('../models/locationModel'); 
const { sendResponse } = require('../services/respuesta');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Authentication = require('../models/authenticationModel');
const cloudinary = require('../config/cloudinary');

const JWT_SECRET = process.env.JWT_SECRET;

const uploadImageToCloudinary = async (imagePath) => {
    try {
        const result = await cloudinary.uploader.upload(imagePath);
        return result.secure_url;
    } catch (error) {
        throw new Error('Error al subir la imagen a Cloudinary: ' + error.message);
    }
};

// Crear Usuario
exports.createUser = async (req, res) => {
    try {
        const { 
            username, 
            firstName, 
            lastName, 
            birthDate, 
            email, 
            password, 
            gender, 
            main_street, 
            secondary_street, 
            fk_city, 
            fk_province 
        } = req.body;

        let profilePictureUrl = null;

        // Verificar si hay imagen en la solicitud
        if (req.file) {
            profilePictureUrl = await uploadImageToCloudinary(req.file.path);
        }

        // Crear localización
        const newLocation = new Location({
            main_street,
            secondary_street,
            fk_city,
            fk_province
        });

        const savedLocation = await newLocation.save();

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const newUser = new User({
            username,
            profilePicture: profilePictureUrl,
            firstName,
            lastName,
            birthDate,
            gender,
            fk_location: savedLocation._id
        });

        const savedUser = await newUser.save();

        // Crear credenciales de autenticación
        const newAuth = new Authentication({
            email,
            password: hashedPassword,
            user: savedUser._id
        });

        await newAuth.save();

        // Responder con éxito
        return sendResponse(res, 201, 'Usuario creado exitosamente', { idTransaction: savedUser._id });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        sendResponse(res, 500, 'Error al registrar usuario');
    }
};

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().populate('fk_location');
        sendResponse(res, 200, 'Usuarios obtenidos exitosamente', { users });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        sendResponse(res, 500, 'Error al obtener usuarios');
    }
};

// Obtener usuario por ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('fk_location');
        if (!user) {
            return sendResponse(res, 404, 'Usuario no encontrado', null);
        }
        sendResponse(res, 200, 'Usuario encontrado', { user });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        sendResponse(res, 500, 'Error al obtener usuario');
    }
};

// Actualizar Usuario
exports.updateUser = async (req, res) => {
    try {
        const { username, firstName, lastName, birthDate, gender, main_street, secondary_street, fk_city, fk_province } = req.body;

        // Actualizar imagen si existe
        let profilePictureUrl = null;
        if (req.file) {
            profilePictureUrl = await uploadImageToCloudinary(req.file.path);
        }

        // Actualizar localización si se envía
        const user = await User.findById(req.params.id);
        if (!user) return sendResponse(res, 404, 'Usuario no encontrado');

        const locationId = user.fk_location;
        const updatedLocation = await Location.findByIdAndUpdate(locationId, {
            main_street,
            secondary_street,
            fk_city,
            fk_province
        }, { new: true });

        // Actualizar usuario
        const updateUser = {
            username,
            firstName,
            lastName,
            birthDate,
            gender,   // Actualizar el campo gender
            profilePicture: profilePictureUrl || user.profilePicture
        };

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateUser, { new: true }).populate('fk_location');

        sendResponse(res, 200, 'Usuario actualizado exitosamente', { updatedUser });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        sendResponse(res, 500, 'Error al actualizar usuario');
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return sendResponse(res, 404, 'Usuario no encontrado');
        await Location.findByIdAndDelete(user.fk_location);
        await Authentication.findOneAndDelete({ user: req.params.id });
        await User.findByIdAndDelete(req.params.id);

        sendResponse(res, 200, 'Usuario eliminado exitosamente', { idTransaction: req.params.id });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        sendResponse(res, 500, 'Error al eliminar usuario');
    }
};