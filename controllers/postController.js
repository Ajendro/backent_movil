const Post = require('../models/postModel');
const User = require('../models/userModel');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');
const { sendResponse } = require('../services/respuesta');

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
    try {
        const { name, description, post_type, post_date, fk_user, fk_location } = req.body;
        let imageUrl = null;

        if (req.file) {
            imageUrl = await uploadImageToCloudinary(req.file.path);
        }

        if (!fk_user || !fk_location) {
            return sendResponse(res, 400, false, 'ID de usuario y ubicación son obligatorios', null);
        }

        const newPost = new Post({
            name,
            description,
            imageUrl,
            post_type,
            post_date,
            fk_user,
            fk_location
        });

        await newPost.save();
        return sendResponse(res, 201, true, 'Publicación creada exitosamente', { publicacion: newPost });
    } catch (error) {
        console.error('Error al crear publicación:', error);
        return sendResponse(res, 500, false, 'No se pudo crear la publicación: Error interno del servidor', null);
    }
};

// Obtener Publicaciones por Ubicación del Usuario
exports.getPostsByUserLocation = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('fk_location');

        if (!user) {
            return sendResponse(res, 404, false, 'Usuario no encontrado', null);
        }

        const userLocationId = user.fk_location?._id;
        if (!userLocationId) {
            return sendResponse(res, 400, false, 'El usuario no tiene una dirección asociada', null);
        }

        const posts = await Post.find({ fk_location: userLocationId })
            .populate({
                path: 'fk_location',
                select: 'main_street secondary_street fk_city fk_province'
            })
            .populate({
                path: 'fk_user',
                select: 'name email'
            });

        return sendResponse(res, 200, true, 'Publicaciones obtenidas exitosamente', { posts });
    } catch (error) {
        console.error('Error al obtener publicaciones por ubicación del usuario:', error);
        return sendResponse(res, 500, false, 'Error interno del servidor', null);
    }
};

// Obtener Publicación por ID
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return sendResponse(res, 404, false, 'Publicación no encontrada', null);
        }
        return sendResponse(res, 200, true, 'Publicación obtenida exitosamente', { post });
    } catch (error) {
        console.error('Error al obtener publicación por ID:', error);
        return sendResponse(res, 500, false, 'Error al obtener publicación por ID', null);
    }
};

// Actualizar Publicación
exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        let updateData = req.body;

        if (req.file) {
            const imageUrl = await uploadImageToCloudinary(req.file.path);
            updateData = { ...updateData, imageUrl };
        }

        const updatedPost = await Post.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedPost) {
            return sendResponse(res, 404, false, 'Publicación no encontrada', null);
        }
        return sendResponse(res, 200, true, 'Publicación actualizada exitosamente', { post: updatedPost });
    } catch (error) {
        console.error('Error al actualizar publicación:', error);
        return sendResponse(res, 500, false, 'No se pudo actualizar la publicación: Error interno del servidor', null);
    }
};

// Eliminar Publicación
exports.deletePost = async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
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
        const { id } = req.params;
        if (!id) {
            return sendResponse(res, 400, false, 'ID de usuario no proporcionado', null);
        }

        const userObjectId = new mongoose.Types.ObjectId(id);
        console.log('Buscando publicaciones para el usuario con ID:', userObjectId);

        const posts = await Post.find({ fk_user: userObjectId });
        console.log('Publicaciones encontradas:', posts);

        if (posts.length === 0) {
            return sendResponse(res, 200, true, 'No se encontraron publicaciones para este usuario', { posts });
        }

        return sendResponse(res, 200, true, 'Publicaciones obtenidas por ID de usuario', { posts });
    } catch (error) {
        console.error('Error al obtener publicaciones por ID de usuario:', error);
        return sendResponse(res, 500, false, 'Error al obtener publicaciones por ID de usuario', null);
    }
};
