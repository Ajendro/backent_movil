const mongoose = require('mongoose');
const Location = require('../models/locationModel');

exports.createLocation = async (req, res) => {
    try {
        const { 
            main_street, 
            secondary_street, 
            fk_city, 
            fk_province 
        } = req.body;

        if (!main_street || !secondary_street || !fk_city || !fk_province) {
            return res.status(400).json({ 
                error: 'Todos los campos son requeridos' 
            });
        }

        if (!mongoose.Types.ObjectId.isValid(fk_city) || 
            !mongoose.Types.ObjectId.isValid(fk_province)) {
            return res.status(400).json({ 
                error: 'ID de ciudad o provincia inválido' 
            });
        }
        const newLocation = new Location({
            main_street,
            secondary_street,
            fk_city,
            fk_province
        });

        const location = await newLocation.save();

        res.status(201).json({ 
            message: 'Ubicación creada exitosamente', 
            location 
        });
    } catch (err) {
        console.error('Error creando la ubicación:', err);
        res.status(500).json({ 
            error: 'Error al crear la ubicación', 
            details: err.message 
        });
    }
};


exports.getLocations = async (req, res) => {
    try {
        const locations = await Location.find()
            .populate('fk_city', 'name')
            .populate('fk_province', 'name');

        res.status(200).json({
            message: 'Ubicaciones obtenidas exitosamente',
            count: locations.length,
            locations
        });
    } catch (error) {
        console.error('Error al obtener ubicaciones:', error);
        res.status(500).json({ 
            error: 'Error al obtener ubicaciones', 
            details: error.message 
        });
    }
};


exports.getLocationById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ 
                error: 'ID de ubicación inválido' 
            });
        }

        const location = await Location.findById(req.params.id)
            .populate('fk_city', 'name')
            .populate('fk_province', 'name');

        if (!location) {
            return res.status(404).json({ 
                error: 'Ubicación no encontrada' 
            });
        }

        res.status(200).json({
            message: 'Ubicación obtenida exitosamente',
            location
        });
    } catch (error) {
        console.error('Error al obtener ubicación por ID:', error);
        res.status(500).json({ 
            error: 'Error al obtener ubicación', 
            details: error.message 
        });
    }
};


exports.updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            main_street, 
            secondary_street, 
            fk_city, 
            fk_province 
        } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                error: 'ID de ubicación inválido' 
            });
        }

        if (!main_street && !secondary_street && !fk_city && !fk_province) {
            return res.status(400).json({ 
                error: 'Debe proporcionar al menos un campo para actualizar' 
            });
        }
        const updateData = {};
        if (main_street) updateData.main_street = main_street;
        if (secondary_street) updateData.secondary_street = secondary_street;
        if (fk_city) updateData.fk_city = fk_city;
        if (fk_province) updateData.fk_province = fk_province;

        const updatedLocation = await Location.findByIdAndUpdate(
            id, 
            updateData, 
            { 
                new: true, 
                runValidators: true 
            }
        ).populate('fk_city', 'name')
         .populate('fk_province', 'name');

        if (!updatedLocation) {
            return res.status(404).json({ 
                error: 'Ubicación no encontrada' 
            });
        }

        res.status(200).json({
            message: 'Ubicación actualizada exitosamente',
            location: updatedLocation
        });
    } catch (error) {
        console.error('Error al actualizar ubicación:', error);
        res.status(500).json({ 
            error: 'Error al actualizar la ubicación', 
            details: error.message 
        });
    }
};

exports.deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                error: 'ID de ubicación inválido' 
            });
        }

        const deletedLocation = await Location.findByIdAndDelete(id);

        if (!deletedLocation) {
            return res.status(404).json({ 
                error: 'Ubicación no encontrada' 
            });
        }

        res.status(200).json({ 
            message: 'Ubicación eliminada exitosamente',
            location: deletedLocation
        });
    } catch (error) {
        console.error('Error al eliminar ubicación:', error);
        res.status(500).json({ 
            error: 'Error al eliminar la ubicación', 
            details: error.message 
        });
    }
};

