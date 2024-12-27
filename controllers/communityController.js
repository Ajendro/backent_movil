const mongoose = require('mongoose');
const Community = require('../models/CommunityModel');
const { sendResponse } = require('../services/respuesta');

exports.createCommunity = async (req, res) => {
    try {
        const { name, description, fk_user } = req.body;

        if (!name || !description || !fk_user) {
            return sendResponse(res, 400, false, 'Todos los campos son requeridos', null);
        }

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
        return sendResponse(res, 201, true, 'Comunidad creada exitosamente', { community: communityRecord });
    } catch (err) {
        console.error('Error creando la comunidad:', err);
        return sendResponse(res, 500, false, 'Error al crear la comunidad', null);
    }
};

exports.getCommunities = async (req, res) => {
    try {
        const communities = await Community.find()
            .populate('fk_user', 'name');

        return sendResponse(res, 200, true, 'Comunidades obtenidas exitosamente', { communities, count: communities.length });
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

        return sendResponse(res, 200, true, 'Comunidad obtenida exitosamente', { community });
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

        return sendResponse(res, 200, true, 'Comunidad actualizada exitosamente', { community: updatedCommunity });
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
