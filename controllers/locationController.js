const mongoose = require('mongoose');
const Location = require('../models/locationModel');
const { sendResponse } = require('../services/respuesta');

// Crear Ubicación
exports.createLocation = async (req, res) => {
    try {
        const { main_street, secondary_street, fk_city, fk_province } = req.body;

        if (!main_street || !secondary_street || !fk_city || !fk_province) {
            return sendResponse(res, 400, false, 'Todos los campos son requeridos', null);
        }

        if (!mongoose.Types.ObjectId.isValid(fk_city) || !mongoose.Types.ObjectId.isValid(fk_province)) {
            return sendResponse(res, 400, false, 'ID de ciudad o provincia inválido', null);
        }

        const newLocation = new Location({
            main_street,
            secondary_street,
            fk_city,
            fk_province,
        });

        const location = await newLocation.save();
        sendResponse(res, 201,'Ubicación creada exitosamente', { locationId: location._id }, true);
    } catch (err) {
        console.error('Error creando la ubicación:', err);
        sendResponse(res, 500, false, 'Error al crear la ubicación', null);
    }
};

// Obtener todas las ubicaciones
exports.getLocations = async (req, res) => {
    try {
        const locations = await Location.find()
            .populate('fk_city', 'name')
            .populate('fk_province', 'name');

        sendResponse(res, 200, 'Ubicaciones obtenidas exitosamente', { locations }, true);
    } catch (error) {
        console.error('Error al obtener ubicaciones:', error);
        sendResponse(res, 500, false, 'Error al obtener ubicaciones', null);
    }
};

// Obtener Ubicación por ID
exports.getLocationById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, false, 'ID de ubicación inválido', null);
        }

        const location = await Location.findById(id)
            .populate('fk_city', 'name')
            .populate('fk_province', 'name');

        if (!location) {
            return sendResponse(res, 404, false, 'Ubicación no encontrada', null);
        }

        sendResponse(res, 200,'Ubicación obtenida exitosamente', { location }, true);
    } catch (error) {
        console.error('Error al obtener ubicación por ID:', error);
        sendResponse(res, 500, false, 'Error al obtener ubicación', null);
    }
};

// Actualizar Ubicación
exports.updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { main_street, secondary_street, fk_city, fk_province } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, false, 'ID de ubicación inválido', null);
        }

        if (!main_street && !secondary_street && !fk_city && !fk_province) {
            return sendResponse(res, 400, false, 'Debe proporcionar al menos un campo para actualizar', null);
        }

        const updateData = {};
        if (main_street) updateData.main_street = main_street;
        if (secondary_street) updateData.secondary_street = secondary_street;
        if (fk_city) updateData.fk_city = fk_city;
        if (fk_province) updateData.fk_province = fk_province;

        const updatedLocation = await Location.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate('fk_city', 'name')
            .populate('fk_province', 'name');

        if (!updatedLocation) {
            return sendResponse(res, 404, false, 'Ubicación no encontrada', null);
        }

        sendResponse(res, 200, 'Ubicación actualizada exitosamente', { location: updatedLocation }, true);
    } catch (error) {
        console.error('Error al actualizar ubicación:', error);
        sendResponse(res, 500, false, 'Error al actualizar la ubicación', null);
    }
};

// Eliminar Ubicación
exports.deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, false, 'ID de ubicación inválido', null);
        }

        const deletedLocation = await Location.findByIdAndDelete(id);

        if (!deletedLocation) {
            return sendResponse(res, 404, false, 'Ubicación no encontrada', null);
        }

        sendResponse(res, 200, true, 'Ubicación eliminada exitosamente', { locationId: deletedLocation._id });
    } catch (error) {
        console.error('Error al eliminar ubicación:', error);
        sendResponse(res, 500, false, 'Error al eliminar la ubicación', null);
    }
};
