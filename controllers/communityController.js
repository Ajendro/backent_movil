const mongoose = require('mongoose');
const Community = require('../models/CommunityModel');
const { sendResponse } = require('../services/respuesta');

exports.createCommunity = async (req, res) => {
    try {
        const { name, description } = req.body;
        // Obtener el ID del usuario desde req.user
        const { id: fk_user } = req.user;

        if (!name || !description || !fk_user) {
            return sendResponse(res, 400, false, 'Todos los campos son requeridos', null);
        }

        // Validar el ID del usuario
        if (!mongoose.Types.ObjectId.isValid(fk_user)) {
            return sendResponse(res, 400, false, 'ID de usuario inválido', null);
        }

        const newCommunity = new Community({
            name,
            description,
            creation_date: new Date(),
            fk_user
        });

        const communityRecord = await newCommunity.save();
        return sendResponse(res, 201, 'Comunidad creada exitosamente', { community: communityRecord }, true);
    } catch (err) {
        console.error('Error creando la comunidad:', err);
        return sendResponse(res, 500, false, 'Error al crear la comunidad', null);
    }
};

exports.getCommunities = async (req, res) => {
    try {
        const communities = await Community.find()
            .populate('fk_user', 'name');

        return sendResponse(res, 200, 'Comunidades obtenidas exitosamente', { communities, count: communities.length }, true);
    } catch (error) {
        console.error('Error al obtener comunidades:', error);
        return sendResponse(res, 500, false, 'Error al obtener comunidades', null);
    }
};

exports.getCommunityById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, false, 'ID de comunidad inválido', null);
        }

        const community = await Community.findById(id)
            .populate('fk_user', 'name');

        if (!community) {
            return sendResponse(res, 404, false, 'Comunidad no encontrada', null);
        }

        return sendResponse(res, 200, 'Comunidad obtenida exitosamente', { community }, true);
    } catch (error) {
        console.error('Error al obtener comunidad por ID:', error);
        return sendResponse(res, 500, false, 'Error al obtener comunidad', null);
    }
};

exports.updateCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, fk_user } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, false, 'ID de comunidad inválido', null);
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (fk_user) {
            if (!mongoose.Types.ObjectId.isValid(fk_user)) {
                return sendResponse(res, 400, false, 'ID de usuario inválido', null);
            }
            updateData.fk_user = fk_user;
        }

        const updatedCommunity = await Community.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate('fk_user', 'name');

        if (!updatedCommunity) {
            return sendResponse(res, 404, false, 'Comunidad no encontrada', null);
        }

        return sendResponse(res, 200, 'Comunidad actualizada exitosamente', { community: updatedCommunity }, true);
    } catch (error) {
        console.error('Error al actualizar comunidad:', error);
        return sendResponse(res, 500, false, 'Error al actualizar la comunidad', null);
    }
};

exports.deleteCommunity = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, false, 'ID de comunidad inválido', null);
        }

        const deletedCommunity = await Community.findByIdAndDelete(id);

        if (!deletedCommunity) {
            return sendResponse(res, 404, false, 'Comunidad no encontrada', null);
        }

        return sendResponse(res, 200, true, 'Comunidad eliminada exitosamente', { community: deletedCommunity });
    } catch (error) {
        console.error('Error al eliminar comunidad:', error);
        return sendResponse(res, 500, false, 'Error al eliminar la comunidad', null);
    }
};

// Obtener todas las comunidades creadas por el usuario autenticado
exports.getCommunitiesByUser = async (req, res) => {
    try {
        // Obtener el ID del usuario desde req.user
        const { id: userId } = req.user;

        // Verificar que el usuario está autenticado
        if (!userId) {
            return sendResponse(res, 401, false, 'Usuario no autenticado', null);
        }

        // Buscar comunidades donde el fk_user coincida con el ID del usuario
        const communities = await Community.find({ fk_user: userId })
            .populate('fk_user', 'name');

        if (communities.length === 0) {
            return sendResponse(res, 404, false, 'No se encontraron comunidades para este usuario', null);
        }

        return sendResponse(res, 200, 'Comunidades obtenidas exitosamente', { communities, count: communities.length }, true);
    } catch (error) {
        console.error('Error al obtener comunidades por usuario:', error);
        return sendResponse(res, 500, false, 'Error al obtener comunidades', null);
    }
};
