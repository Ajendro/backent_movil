const mongoose = require('mongoose');
const Follower = require('../models/followerModel');
const User = require('../models/userModel'); // Asumiendo que tienes un modelo de usuario
const { sendResponse } = require('../services/respuesta');

// Seguir a un usuario
exports.followUser = async (req, res) => {
    try {
        const { fk_followed } = req.body;

        if (!req.user || !req.user.id) {
            return sendResponse(res, 401, false, 'Usuario no autenticado', null);
        }

        const fk_user = req.user.id;

        if (!fk_followed) {
            return sendResponse(res, 400, false, 'ID del usuario a seguir es requerido', null);
        }

        if (!mongoose.Types.ObjectId.isValid(fk_user) || !mongoose.Types.ObjectId.isValid(fk_followed)) {
            return sendResponse(res, 400, false, 'ID de usuario inválido', null);
        }

        const existingFollow = await Follower.findOne({ fk_user, fk_followed });

        if (existingFollow) {
            return sendResponse(res, 400, false, 'Ya sigues a este usuario', null);
        }

        const newFollow = new Follower({
            fk_user,
            fk_followed,
            follow_date: new Date()
        });

        await newFollow.save();

        await User.findByIdAndUpdate(fk_followed, { $inc: { followersCount: 1 } });
        await User.findByIdAndUpdate(fk_user, { $inc: { followingCount: 1 } });

        sendResponse(res, 201, 'Siguiendo al usuario', { followId: newFollow._id }, true);
    } catch (err) {
        console.error('Error siguiendo al usuario:', err);
        sendResponse(res, 500, false, 'Error al seguir al usuario', null);
    }
};

// Dejar de seguir a un usuario
exports.unfollowUser = async (req, res) => {
    try {
        const { fk_followed } = req.body;

        if (!req.user || !req.user.id) {
            return sendResponse(res, 401, false, 'Usuario no autenticado', null);
        }

        const fk_user = req.user.id;

        if (!fk_followed) {
            return sendResponse(res, 400, false, 'ID del usuario a dejar de seguir es requerido', null);
        }

        if (!mongoose.Types.ObjectId.isValid(fk_user) || !mongoose.Types.ObjectId.isValid(fk_followed)) {
            return sendResponse(res, 400, false, 'ID de usuario inválido', null);
        }

        const followToDelete = await Follower.findOne({ fk_user, fk_followed });

        if (!followToDelete) {
            return sendResponse(res, 404, false, 'No sigues a este usuario', null);
        }

        await Follower.deleteOne({ _id: followToDelete._id });

        await User.findByIdAndUpdate(fk_followed, { $inc: { followersCount: -1 } });
        await User.findByIdAndUpdate(fk_user, { $inc: { followingCount: -1 } });

        sendResponse(res, 200, 'Dejaste de seguir al usuario', null, true);
    } catch (err) {
        console.error('Error al dejar de seguir al usuario:', err);
        sendResponse(res, 500, false, 'Error al dejar de seguir al usuario', null);
    }
};

// Obtener seguidores de un usuario
exports.getFollowers = async (req, res) => {
    try {
        const { fk_user } = req.body;

        if (!req.user || !req.user.id) {
            return sendResponse(res, 401, false, 'Usuario no autenticado', null);
        }

        if (!fk_user) {
            return sendResponse(res, 400, false, 'ID del usuario es requerido', null);
        }

        if (!mongoose.Types.ObjectId.isValid(fk_user)) {
            return sendResponse(res, 400, false, 'ID de usuario inválido', null);
        }

        const followers = await Follower.find({ fk_followed: fk_user })
            .populate('fk_user', 'name');

        sendResponse(res, 200, 'Seguidores obtenidos', { followers }, true);
    } catch (err) {
        console.error('Error al obtener seguidores:', err);
        sendResponse(res, 500, false, 'Error al obtener seguidores', null);
    }
};

// Obtener usuarios que sigue un usuario
exports.getFollowing = async (req, res) => {
    try {
        const { fk_user } = req.body;

        if (!req.user || !req.user.id) {
            return sendResponse(res, 401, false, 'Usuario no autenticado', null);
        }

        if (!fk_user) {
            return sendResponse(res, 400, false, 'ID del usuario es requerido', null);
        }

        if (!mongoose.Types.ObjectId.isValid(fk_user)) {
            return sendResponse(res, 400, false, 'ID de usuario inválido', null);
        }

        const following = await Follower.find({ fk_user: fk_user })
            .populate('fk_followed', 'name');

        sendResponse(res, 200, 'Usuarios que sigue obtenidos', { following }, true);
    } catch (err) {
        console.error('Error al obtener usuarios que sigue:', err);
        sendResponse(res, 500, false, 'Error al obtener usuarios que sigue', null);
    }
};
