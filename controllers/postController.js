const Post = require('../models/postModel');
const User = require('../models/userModel');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');
const { sendResponse } = require('../services/respuesta');
const Location = require('../models/locationModel'); // Ajusta la ruta según tu estructura

const JWT_SECRET = process.env.JWT_SECRET;

const uploadImageToCloudinary = async (imagePath) => {
    try {
        const result = await cloudinary.uploader.upload(imagePath);
        return result.secure_url;
    } catch (error) {
        throw new Error('Error al subir la imagen a Cloudinary: ' + error.message);
    }
};

// Crear Publicación
exports.createPost = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { name, description, post_type, post_date, main_street, secondary_street, fk_city, fk_province } = req.body;
        let imageUrl = null;

        // Verificar si se adjunta una imagen
        if (req.file) {
            imageUrl = await uploadImageToCloudinary(req.file.path);
        }

        // Verificar autenticación del usuario
        if (!req.user || !req.user.id) {
            await session.abortTransaction();
            session.endSession();
            return sendResponse(res, 401, false, 'Usuario no autenticado', null);
        }

        const fk_user = req.user.id;

        // Crear la ubicación
        const newLocation = new Location({
            main_street,
            secondary_street,
            fk_city,
            fk_province
        });

        const savedLocation = await newLocation.save({ session });

        // Crear la publicación
        const newPost = new Post({
            name,
            description,
            post_type,
            post_date,
            imageUrl,
            fk_user,
            fk_location: savedLocation._id
        });

        await newPost.save({ session });

        // Confirmar transacción
        await session.commitTransaction();
        session.endSession();

        return sendResponse(res, 201, 'Publicación creada exitosamente', { newPost }, true);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('Error al crear la publicación:', error);
        return sendResponse(res, 500, false, 'No se pudo crear la publicación: Error interno del servidor', null);
    }
};


exports.getPostsByUserLocation = async (req, res) => {
    try {
        console.log("req.user:", req.user);  

        const id = req.user?.id;  

        if (!id) {
            return sendResponse(res, 400, 'No se pudo obtener el ID del usuario desde el token', null);
        }

        const user = await User.findById(id).populate('fk_location');
        if (!user) {
            return sendResponse(res, 404, 'Usuario no encontrado', null);
        }

        const userLocation = user.fk_location;
        if (!userLocation || !userLocation.fk_city || !userLocation.fk_province) {
            return sendResponse(res, 400, 'El usuario no tiene una dirección asociada correctamente', null);
        }

        const { fk_city, fk_province } = userLocation;
        console.log('Buscando publicaciones en la ciudad:', fk_city, 'y provincia:', fk_province);

        // Obtener todas las publicaciones con su ubicación y usuario
        const posts = await Post.find()
            .populate('fk_location')
            .populate('fk_user');

        // Filtrar manualmente las publicaciones por ciudad o provincia
        const filteredPosts = posts.filter(post => 
            post.fk_location?.fk_city?.toString() === fk_city.toString() ||
            post.fk_location?.fk_province?.toString() === fk_province.toString()
        );

        console.log('Publicaciones obtenidas:', filteredPosts);
        return sendResponse(res, 200, 'Publicaciones obtenidas exitosamente', { posts: filteredPosts }, true);
    } catch (error) {
        console.error('Error al obtener publicaciones por ubicación del usuario:', error);
        return sendResponse(res, 500, 'Error interno del servidor', null);
    }
};


// Obtener Publicación por ID
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return sendResponse(res, 404, false, 'Publicación no encontrada', null);
        }
        return sendResponse(res, 200, 'Publicación obtenida exitosamente', { post }, true);
    } catch (error) {
        console.error('Error al obtener publicación por ID:', error);
        return sendResponse(res, 500, false, 'Error al obtener publicación por ID', null);
    }
};

// Actualizar Publicación
exports.updatePost = async (req, res) => {
    try {
        const { id } = req.body;
        let updateData = req.body;

        if (req.file) {
            const imageUrl = await uploadImageToCloudinary(req.file.path);
            updateData = { ...updateData, imageUrl };
        }

        const updatedPost = await Post.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedPost) {
            return sendResponse(res, 404, false, 'Publicación no encontrada', null);
        }
        return sendResponse(res, 200, 'Publicación actualizada exitosamente', { post: updatedPost }, true);
    } catch (error) {
        console.error('Error al actualizar publicación:', error);
        return sendResponse(res, 500, false, 'No se pudo actualizar la publicación: Error interno del servidor', null);
    }
};

exports.deletePost = async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.body.id);
        if (!deletedPost) {
            return sendResponse(res, 404, false, 'Publicación no encontrada', null);
        }
        return sendResponse(res, 200, true, 'Publicación eliminada exitosamente', null);
    } catch (error) {
        console.error('Error al eliminar publicación:', error);
        return sendResponse(res, 500, false, 'No se pudo eliminar la publicación: Error interno del servidor', null);
    }
};

// Obtener Publicaciones por ID de Usuario
exports.getPostsByUserId = async (req, res) => {
    try {
        // Usar el ID del usuario desde req.user
        const id = req.user?.id;

        if (!id) {
            return sendResponse(res, 400, false, 'ID de usuario no proporcionado', null);
        }

        // Verificar si el id es válido
        const userObjectId = new mongoose.Types.ObjectId(id);
        console.log('Buscando publicaciones para el usuario con ID:', userObjectId);

        const posts = await Post.find({ fk_user: userObjectId });
        console.log('Publicaciones encontradas:', posts);

        if (posts.length === 0) {
            return sendResponse(res, 200, true, 'No se encontraron publicaciones para este usuario', { posts });
        }

        return sendResponse(res, 200, 'Publicaciones obtenidas por ID de usuario', { posts }, true);
    } catch (error) {
        console.error('Error al obtener publicaciones por ID de usuario:', error);
        return sendResponse(res, 500, false, 'Error al obtener publicaciones por ID de usuario', null);
    }
};
