const mongoose = require('mongoose');
const Follower = require('../models/followerModel');
const { sendResponse } = require('../services/respuesta');

// Seguir a un usuario
exports.followUser = async (req, res) => {
    try {
        const { following } = req.body;

        if (!req.user || !req.user.id) {
            return sendResponse(res, 401, false, 'Usuario no autenticado', null);
        }

        const follower = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(follower) || !mongoose.Types.ObjectId.isValid(following)) {
            return sendResponse(res, 400, false, 'ID de usuario inválido', null);
        }

        if (follower === following) {
            return sendResponse(res, 400, false, 'No puedes seguirte a ti mismo', null);
        }

        const existingFollow = await Follower.findOne({ follower, following });

        if (existingFollow) {
            return sendResponse(res, 400, false, 'Ya sigues a este usuario', null);
        }

        const newFollower = new Follower({
            follower,
            following
        });

        await newFollower.save();

        sendResponse(res, 201, 'Has comenzado a seguir al usuario', { followId: newFollower._id }, true);
    } catch (err) {
        console.error('Error al seguir al usuario:', err);
        sendResponse(res, 500, false, 'Error al seguir al usuario', null);
    }
};

// Dejar de seguir a un usuario
exports.unfollowUser = async (req, res) => {
    try {
        const { following } = req.body;

        if (!req.user || !req.user.id) {
            return sendResponse(res, 401, false, 'Usuario no autenticado', null);
        }

        const follower = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(follower) || !mongoose.Types.ObjectId.isValid(following)) {
            return sendResponse(res, 400, false, 'ID de usuario inválido', null);
        }

        const followToDelete = await Follower.findOne({ follower, following });

        if (!followToDelete) {
            return sendResponse(res, 404, false, 'No sigues a este usuario', null);
        }

        await Follower.deleteOne({ _id: followToDelete._id });

        sendResponse(res, 200, 'Has dejado de seguir al usuario', null, true);
    } catch (err) {
        console.error('Error al dejar de seguir al usuario:', err);
        sendResponse(res, 500, false, 'Error al dejar de seguir al usuario', null);
    }
};

// Obtener los seguidores de un usuario
exports.getFollowers = async (req, res) => {
    try {
        const { userId } = req.body; // Cambiado de req.params a req.body

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return sendResponse(res, 400, false, 'ID de usuario inválido', null);
        }

        const followers = await Follower.find({ following: userId })
            .populate('follower', 'name');

        sendResponse(res, 200, 'Seguidores obtenidos exitosamente', { followers }, true);
    } catch (err) {
        console.error('Error al obtener los seguidores:', err);
        sendResponse(res, 500, false, 'Error al obtener los seguidores', null);
    }
};


// Obtener los usuarios seguidos por un usuario
exports.getFollowing = async (req, res) => {
    try {
        const { userId } = req.body; // Cambiado de req.params a req.body

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return sendResponse(res, 400, false, 'ID de usuario inválido', null);
        }

        const following = await Follower.find({ follower: userId })
            .populate('following', 'name');

        sendResponse(res, 200, 'Usuarios seguidos obtenidos exitosamente', { following }, true);
    } catch (err) {
        console.error('Error al obtener los usuarios seguidos:', err);
        sendResponse(res, 500, false, 'Error al obtener los usuarios seguidos', null);
    }}