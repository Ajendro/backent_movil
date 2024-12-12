const mongoose = require('mongoose');
const Like = require('../models/likeModel');
const { sendResponse } = require('../services/respuesta');


// Crear Like
exports.createLike = async (req, res) => {
    try {
        const { like, dislike, fk_user, fk_post } = req.body;

        if (like === undefined || dislike === undefined || !fk_user || !fk_post) {
            return sendResponse(res, 400, 'Todos los campos son requeridos', null, false);
        }

        if (!mongoose.Types.ObjectId.isValid(fk_user) || !mongoose.Types.ObjectId.isValid(fk_post)) {
            return sendResponse(res, 400, 'ID de usuario o post inválido', null, false);
        }

        const newLike = new Like({
            like,
            dislike,
            like_date: new Date(),
            fk_user,
            fk_post
        });

        const like_record = await newLike.save();
        sendResponse(res, 201, 'Like creado exitosamente', { likeId: like_record._id }, true);
    } catch (err) {
        console.error('Error creando el like:', err);
        sendResponse(res, 500, 'Error al crear el like', null, false);
    }
};

// Obtener Likes
exports.getLikes = async (req, res) => {
    try {
        const likes = await Like.find()
            .populate('fk_user', 'name')
            .populate('fk_post', 'title');

        sendResponse(res, 200, 'Likes obtenidos exitosamente', { likes }, true);
    } catch (error) {
        console.error('Error al obtener likes:', error);
        sendResponse(res, 500, 'Error al obtener likes', null, false);
    }
};

// Obtener Like por ID
exports.getLikeById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, 'ID de like inválido', null, false);
        }

        const like = await Like.findById(id)
            .populate('fk_user', 'name')
            .populate('fk_post', 'title');

        if (!like) {
            return sendResponse(res, 404, 'Like no encontrado', null, false);
        }

        sendResponse(res, 200, 'Like obtenido exitosamente', { like }, true);
    } catch (error) {
        console.error('Error al obtener like por ID:', error);
        sendResponse(res, 500, 'Error al obtener like', null, false);
    }
};

// Actualizar Like
exports.updateLike = async (req, res) => {
    try {
        const { id, like, dislike, fk_user, fk_post } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, 'ID de like inválido', null, false);
        }

        const updateData = {};
        if (like !== undefined) updateData.like = like;
        if (dislike !== undefined) updateData.dislike = dislike;
        if (fk_user) updateData.fk_user = fk_user;
        if (fk_post) updateData.fk_post = fk_post;
        updateData.like_date = new Date();

        const updatedLike = await Like.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate('fk_user', 'name')
            .populate('fk_post', 'title');

        if (!updatedLike) {
            return sendResponse(res, 404, 'Like no encontrado', null, false);
        }

        sendResponse(res, 200, 'Like actualizado exitosamente', { like: updatedLike }, true);
    } catch (error) {
        console.error('Error al actualizar like:', error);
        sendResponse(res, 500, 'Error al actualizar el like', null, false);
    }
};

// Eliminar Like
exports.deleteLike = async (req, res) => {
    try {
        const { id } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, 'ID de like inválido', null, false);
        }

        const deletedLike = await Like.findByIdAndDelete(id);

        if (!deletedLike) {
            return sendResponse(res, 404, 'Like no encontrado', null, false);
        }

        sendResponse(res, 200, 'Like eliminado exitosamente', { likeId: deletedLike._id }, true);
    } catch (error) {
        console.error('Error al eliminar like:', error);
        sendResponse(res, 500, 'Error al eliminar el like', null, false);
    }
};

exports.getLikesByPost = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el id del post es válido
        if (!id) {
            return sendResponse(res, 400, 'ID del post no proporcionado', null, false);
        }

        // Convertir id a ObjectId usando 'new'
        const postObjectId = new mongoose.Types.ObjectId(id);

        // Buscar los likes que corresponden al post
        const likes = await Like.find({ fk_post: postObjectId });

        // Verificar si hay likes
        console.log('Likes encontrados:', likes);

        if (likes.length === 0) {
            return sendResponse(res, 200, 'No se encontraron likes para este post', { likes }, true);
        }

        return sendResponse(res, 200, 'Likes obtenidos por ID de post', { likes }, true);
    } catch (error) {
        console.error('Error al obtener los likes por ID del post:', error);
        return sendResponse(res, 500, 'Error al obtener los likes por ID del post', null, false);
    }
};
