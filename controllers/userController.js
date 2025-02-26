const mongoose = require('mongoose');
const User = require('../models/userModel');
const Location = require('../models/locationModel');
const { sendResponse } = require('../services/respuesta');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
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

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Objeto para almacenar códigos de verificación
const verificationCodeStore = {};
console.log(verificationCodeStore)

// Generar un código de verificación aleatorio
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Crear Usuario
exports.createUser = async (req, res) => {
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

    try {
        // Verificar si ya existe un usuario con ese email
        const existingUser = await Authentication.findOne({ email });
        if (existingUser) {
            return sendResponse(res, 400, 'El correo electrónico ya está registrado.', null, false);
        }

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
            user: savedUser._id,
            isVerified: false // Inicialmente no verificado
        });

        await newAuth.save();

        // Generar un código de verificación y almacenarlo en memoria con expiración
        const verificationCode = generateVerificationCode();
        const expiresAt = Date.now() + 3600000;  // Expiración en 1 hora
        verificationCodeStore[email] = { code: verificationCode, expiresAt };
        console.log('Código de verificación almacenado:', verificationCodeStore[email]);

        // Configuración del correo
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verificación de cuenta',
            text: `Tu código de verificación es: ${verificationCode}. Este código expirará en una hora.`,
        };

        // Enviar el correo con el código de verificación
        await transporter.sendMail(mailOptions);

        // Responder con éxito
        return sendResponse(res, 201, 'Usuario creado y correo enviado con el código de verificación.', { idTransaction: savedUser._id }, true);
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        return sendResponse(res, 500, 'Error al registrar usuario', null, false);
    }
};

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().populate('fk_location');
        return sendResponse(res, 200, 'Usuarios obtenidos exitosamente', { users }, true);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return sendResponse(res, 500, 'Error al obtener usuarios', null, false);
    }
};

// Obtener usuario por ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.body.id).populate('fk_location');
        if (!user) {
            return sendResponse(res, 404, 'Usuario no encontrado', null, false);
        }
        return sendResponse(res, 200, 'Usuario encontrado', { user }, true);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        return sendResponse(res, 500, 'Error al obtener usuario', null, false);
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
        if (!user) return sendResponse(res, 404, 'Usuario no encontrado', null, false);

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

        return sendResponse(res, 200, 'Usuario actualizado exitosamente', { updatedUser }, true);
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        return sendResponse(res, 500, 'Error al actualizar usuario', null, false);
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return sendResponse(res, 404, 'Usuario no encontrado', null, false);
        await Location.findByIdAndDelete(user.fk_location);
        await Authentication.findOneAndDelete({ user: req.params.id });
        await User.findByIdAndDelete(req.params.id);

        return sendResponse(res, 200, 'Usuario eliminado exitosamente', { idTransaction: req.params.id }, true);
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        return sendResponse(res, 500, 'Error al eliminar usuario', null, false);
    }
};

exports.verifyAccount = async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        // Buscar el código de verificación almacenado en memoria
        const storedData = verificationCodeStore[email];
        console.log('Datos almacenados del código de verificación para', email, storedData);

        if (!storedData) {
            return sendResponse(res, 400, 'Código de verificación no encontrado o expirado.', null, false);
        }

        // Comprobar si el código coincide
        if (storedData.code !== verificationCode) {
            return sendResponse(res, 400, 'Código de verificación incorrecto.', null, false);
        }

        // Comprobar si el código ha expirado
        if (storedData.expiresAt < Date.now()) {
            return sendResponse(res, 400, 'El código de verificación ha expirado.', null, false);
        }

        // Verificar que el usuario exista en la base de datos
        const authentication = await Authentication.findOne({ email });
        if (!authentication) {
            return sendResponse(res, 400, 'Usuario no encontrado.', null, false);
        }

        // Marcar la cuenta como verificada
        authentication.isVerified = true;
        await authentication.save();

        // Eliminar el código de verificación de la memoria
        delete verificationCodeStore[email];

        return sendResponse(res, 200, 'Cuenta verificada con éxito.', null, true);
    } catch (error) {
        console.error('Error al verificar la cuenta:', error);
        return sendResponse(res, 500, 'Error al verificar la cuenta.', null, false);
    }
};
