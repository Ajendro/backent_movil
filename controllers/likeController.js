const mongoose = require('mongoose');
const Like = require('../models/likeModel');
const Post = require('../models/postModel'); 
const { sendResponse } = require('../services/respuesta');

// Crear Like
exports.createLike = async (req, res) => {
    try {
        const { like, fk_post } = req.body;

        if (!req.user || !req.user.id) {
            return sendResponse(res, 401, false, 'Usuario no autenticado', null);
        }

        const fk_user = req.user.id;

        if (like === undefined || !fk_post) {
            return sendResponse(res, 400, false, 'Todos los campos son requeridos', null);
        }

        if (!mongoose.Types.ObjectId.isValid(fk_user) || !mongoose.Types.ObjectId.isValid(fk_post)) {
            return sendResponse(res, 400, false, 'ID de usuario o post inválido', null);
        }

        console.log('fk_post recibido:', fk_post);

        const existingLike = await Like.findOne({ fk_user, fk_post });

        if (existingLike) {
            return sendResponse(res, 400, false, 'El usuario ya dio like a esta publicación', null);
        }

        const newLike = new Like({
            like,
            like_date: new Date(),
            fk_user,
            fk_post
        });

        await newLike.save();

        await Post.findByIdAndUpdate(fk_post, { $inc: { likesCount: 1 } });

        sendResponse(res, 201, 'Like creado exitosamente', { likeId: newLike._id }, true);
    } catch (err) {
        console.error('Error creando el like:', err);
        sendResponse(res, 500, false, 'Error al crear el like', null);
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
        sendResponse(res, 500, false, 'Error al obtener likes', null);
    }
};


exports.deleteLike = async (req, res) => {
    try {
        const { fk_post } = req.body;

        // Asegurarse de que el token está presente y el usuario está autenticado
        if (!req.user || !req.user.id) {
            console.log('Usuario no autenticado');
            return sendResponse(res, 401, false, 'Usuario no autenticado', null);
        }

        const fk_user = req.user.id; // Obtener el ID del usuario desde el token
        console.log('Usuario autenticado:', fk_user);

        if (!fk_post) {
            console.log('ID del post no proporcionado');
            return sendResponse(res, 400, false, 'ID del post requerido', null);
        }

        console.log('ID del post recibido:', fk_post);

        if (!mongoose.Types.ObjectId.isValid(fk_post)) {
            console.log('ID de post inválido:', fk_post);
            return sendResponse(res, 400, false, 'ID de post inválido', null);
        }

        // Verificar si el usuario ha dado like a la publicación
        const likeToDelete = await Like.findOne({ fk_user, fk_post });
        console.log('Like encontrado:', likeToDelete);

        if (!likeToDelete) {
            console.log('El usuario no ha dado like a esta publicación');
            return sendResponse(res, 404, false, 'El usuario no ha dado like a esta publicación', null);
        }

        // Eliminar el like
        await Like.deleteOne({ _id: likeToDelete._id });
        console.log('Like eliminado:', likeToDelete._id);

        // Decrementar el contador de likes en la publicación
        await Post.findByIdAndUpdate(fk_post, { $inc: { likesCount: -1 } });
        console.log('Contador de likes de la publicación decrementado');

        sendResponse(res, 200, 'Like eliminado exitosamente', null, true);
    } catch (err) {
        console.error('Error al eliminar el like:', err);
        sendResponse(res, 500, false, 'Error al eliminar el like', null);
    }
};


// Obtener Likes por ID de Post
exports.getLikesByPost = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el id del post es válido
        if (!id) {
            return sendResponse(res, 400, false, 'ID del post no proporcionado', null);
        }

        // Convertir id a ObjectId usando 'new'
        const postObjectId = new mongoose.Types.ObjectId(id);

        // Usar agregación para contar los likes
        const likesCount = await Like.aggregate([
            { $match: { fk_post: postObjectId } },
            { $count: "totalLikes" }
        ]);

        // Si no hay likes, el resultado será un array vacío
        if (likesCount.length === 0) {
            return sendResponse(res, 200, true, 'No se encontraron likes para este post', { totalLikes: 0 });
        }

        return sendResponse(res, 200, 'Likes obtenidos por ID de post', { totalLikes: likesCount[0].totalLikes }, true);
    } catch (error) {
        console.error('Error al obtener los likes por ID del post:', error);
        return sendResponse(res, 500, false, 'Error al obtener los likes por ID del post', null);
    }
};

