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

exports.createPost = async (req, res) => {
    try {
        const { name, description, post_type, post_date, fk_user, fk_location } = req.body;
        let imageUrl = null;

        if (req.file) {
            imageUrl = await uploadImageToCloudinary(req.file.path);
        }
        if (!fk_user || !fk_location) {
            return sendResponse(res, 400, 'ID de usuario y ubicación son obligatorios', null, false);
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
        return sendResponse(res, 201, 'Publicación creada exitosamente', { publicacion: newPost }, true);
    } catch (error) {
        console.error('Error al crear publicación:', error);
        return sendResponse(res, 500, 'No se pudo crear la publicación: Error interno del servidor', null, false);
    }
};


exports.getPostsByUserLocation = async (req, res) => {
    try {
        const userId = req.user.id; 
        const user = await User.findById(userId).populate('fk_location');
        if (!user) {
            return sendResponse(res, 404, 'Usuario no encontrado', null, false);
        }

        const userLocationId = user.fk_location?._id;
        if (!userLocationId) {
            return sendResponse(res, 400, 'El usuario no tiene una dirección asociada', null, false);
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
        return sendResponse(res, 200, 'Publicaciones obtenidas exitosamente', { posts }, true);
    } catch (error) {
        console.error('Error al obtener publicaciones por ubicación del usuario:', error);
        return sendResponse(res, 500, 'Error interno del servidor', null, false);
    }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return sendResponse(res, 404, 'Publicación no encontrada', null, false);
        }
        return sendResponse(res, 200, 'Publicación obtenida exitosamente', { post }, true);
    } catch (error) {
        console.error('Error al obtener publicación por ID:', error);
        return sendResponse(res, 500, 'Error al obtener publicación por ID', null, false);
    }
};

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
            return sendResponse(res, 404, 'Publicación no encontrada', null, false);
        }
        return sendResponse(res, 200, 'Publicación actualizada exitosamente', { post: updatedPost }, true);
    } catch (error) {
        console.error('Error al actualizar publicación:', error);
        return sendResponse(res, 500, 'No se pudo actualizar la publicación: Error interno del servidor', null, false);
    }
};

exports.deletePost = async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
            return sendResponse(res, 404, 'Publicación no encontrada', null, false);
        }
        return sendResponse(res, 200, 'Publicación eliminada exitosamente', null, true);
    } catch (error) {
        console.error('Error al eliminar publicación:', error);
        return sendResponse(res, 500, 'No se pudo eliminar la publicación: Error interno del servidor', null, false);
    }
};

exports.getPostsByUserId = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return sendResponse(res, 400, 'ID de usuario no proporcionado', null, false);
        }
        const userObjectId = new mongoose.Types.ObjectId(id);
        console.log('Buscando productos para el usuario con ID:', userObjectId);
        const products = await Post.find({ fk_user: userObjectId });
        console.log('Productos encontrados:', products);
        if (products.length === 0) {
            return sendResponse(res, 200, 'No se encontraron productos para este usuario', { products }, true);
        }

        return sendResponse(res, 200, 'Productos obtenidos por ID de usuario', { products }, true);
    } catch (error) {
        console.error('Error al obtener productos por ID de usuario:', error);
        return sendResponse(res, 500, 'Error al obtener productos por ID de usuario', null, false);
    }
};