const mongoose = require('mongoose');
const Community = require('../models/CommunityModel');
const { sendResponse } = require('../services/respuesta');

exports.createCommunity = async (req, res) => {
    try {
        const { name, description, fk_user } = req.body;

        if (!name || !description || !fk_user) {
            return sendResponse(res, 400, 'Todos los campos son requeridos', null, false);
        }

        if (!mongoose.Types.ObjectId.isValid(fk_user)) {
            return sendResponse(res, 400, 'ID de usuario inválido', null, false);
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
        return sendResponse(res, 500, 'Error al crear la comunidad', null, false);
    }
};

exports.getCommunities = async (req, res) => {
    try {
        const communities = await Community.find()
            .populate('fk_user', 'name');

        return sendResponse(res, 200, 'Comunidades obtenidas exitosamente', { communities, count: communities.length }, true);
    } catch (error) {
        console.error('Error al obtener comunidades:', error);
        return sendResponse(res, 500, 'Error al obtener comunidades', null, false);
    }
};

exports.getCommunityById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, 'ID de comunidad inválido', null, false);
        }

        const community = await Community.findById(id)
            .populate('fk_user', 'name');

        if (!community) {
            return sendResponse(res, 404, 'Comunidad no encontrada', null, false);
        }

        return sendResponse(res, 200, 'Comunidad obtenida exitosamente', { community }, true);
    } catch (error) {
        console.error('Error al obtener comunidad por ID:', error);
        return sendResponse(res, 500, 'Error al obtener comunidad', null, false);
    }
};

exports.updateCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, fk_user } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, 'ID de comunidad inválido', null, false);
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (fk_user) {
            if (!mongoose.Types.ObjectId.isValid(fk_user)) {
                return sendResponse(res, 400, 'ID de usuario inválido', null, false);
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
            return sendResponse(res, 404, 'Comunidad no encontrada', null, false);
        }

        return sendResponse(res, 200, 'Comunidad actualizada exitosamente', { community: updatedCommunity }, true);
    } catch (error) {
        console.error('Error al actualizar comunidad:', error);
        return sendResponse(res, 500, 'Error al actualizar la comunidad', null, false);
    }
};

exports.deleteCommunity = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, 'ID de comunidad inválido', null, false);
        }

        const deletedCommunity = await Community.findByIdAndDelete(id);

        if (!deletedCommunity) {
            return sendResponse(res, 404, 'Comunidad no encontrada', null, false);
        }

        return sendResponse(res, 200, 'Comunidad eliminada exitosamente', { community: deletedCommunity }, true);
    } catch (error) {
        console.error('Error al eliminar comunidad:', error);
        return sendResponse(res, 500, 'Error al eliminar la comunidad', null, false);
    }
};