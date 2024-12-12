const Post = require('../models/postModel');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');
const { sendResponse } = require('../services/respuesta');

// Función para subir imagen a Cloudinary
const uploadImageToCloudinary = async (imagePath) => {
    try {
        const result = await cloudinary.uploader.upload(imagePath);
        return result.secure_url;
    } catch (error) {
        throw new Error('Error al subir la imagen a Cloudinary: ' + error.message);
    }
};

// Crear publicación
exports.createPost = async (req, res) => {
    try {
        const { name, description, post_type, post_date, fk_user, fk_location } = req.body;
        let imageUrl = null;

        if (req.file) {
            imageUrl = await uploadImageToCloudinary(req.file.path);
        }

        // Validar que los campos fk_user y fk_location estén presentes
        if (!fk_user || !fk_location) {
            return sendResponse(res, 400, 'ID de usuario y ubicación son obligatorios', null, false);
        }

        // Crear nueva publicación
        const newPost = new Post({
            name,
            description,
            imageUrl,
            post_type,
            post_date,
            fk_user,
            fk_location
        });

        // Guardar la nueva publicación
        await newPost.save();
        return sendResponse(res, 201, 'Publicación creada exitosamente', { publicacion: newPost }, true);
    } catch (error) {
        console.error('Error al crear publicación:', error);
        return sendResponse(res, 500, 'No se pudo crear la publicación: Error interno del servidor', null, false);
    }
};

// Obtener todas las publicaciones
exports.getPosts = async (req, res) => {
    try {
        const { post_type } = req.query;
        const filter = post_type ? { post_type } : {};
        const posts = await Post.find(filter);
        return sendResponse(res, 200, 'Publicaciones obtenidas exitosamente', { posts }, true);
    } catch (error) {
        console.error('Error al obtener publicaciones:', error);
        return sendResponse(res, 500, 'Error al obtener publicaciones', null, false);
    }
};

// Obtener publicación por ID
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

// Actualizar publicación
exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        let updateData = req.body;

        // Si se sube una nueva imagen, se agrega la URL de la imagen
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

// Eliminar publicación
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