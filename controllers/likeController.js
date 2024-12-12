const mongoose = require('mongoose');
const Like = require('../models/likeModel');

exports.createLike = async (req, res) => {
    try {
        const { 
            like, 
            dislike, 
            fk_user, 
            fk_post 
        } = req.body;

        if (like === undefined || dislike === undefined || !fk_user || !fk_post) {
            return res.status(400).json({ 
                error: 'Todos los campos son requeridos' 
            });
        }

        if (!mongoose.Types.ObjectId.isValid(fk_user) || 
            !mongoose.Types.ObjectId.isValid(fk_post)) {
            return res.status(400).json({ 
                error: 'ID de usuario o post inválido' 
            });
        }
        const newLike = new Like({
            like,
            dislike,
            like_date: new Date(), 
            fk_user,
            fk_post
        });

        const like_record = await newLike.save();
        res.status(201).json({ 
            message: 'Like creado exitosamente', 
            like: like_record 
        });
    } catch (err) {
        console.error('Error creando el like:', err);
        res.status(500).json({ 
            error: 'Error al crear el like', 
            details: err.message 
        });
    }
};

exports.getLikes = async (req, res) => {
    try {
        const likes = await Like.find()
            .populate('fk_user', 'name')
            .populate('fk_post', 'title');

        res.status(200).json({
            message: 'Likes obtenidos exitosamente',
            count: likes.length,
            likes
        });
    } catch (error) {
        console.error('Error al obtener likes:', error);
        res.status(500).json({ 
            error: 'Error al obtener likes', 
            details: error.message 
        });
    }
};

exports.getLikeById = async (req, res) => {
    try {
        const { id } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                error: 'ID de like inválido' 
            });
        }
        const like = await Like.findById(id)
            .populate('fk_user', 'name')
            .populate('fk_post', 'title');

        if (!like) {
            return res.status(404).json({ 
                error: 'Like no encontrado' 
            });
        }

        res.status(200).json({
            message: 'Like obtenido exitosamente',
            like
        });
    } catch (error) {
        console.error('Error al obtener like por ID:', error);
        res.status(500).json({ 
            error: 'Error al obtener like', 
            details: error.message 
        });
    }
};

exports.updateLike = async (req, res) => {
    try {
        const { id, like, dislike, fk_user, fk_post } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                error: 'ID de like inválido' 
            });
        }
        const updateData = {};
        if (like !== undefined) updateData.like = like;
        if (dislike !== undefined) updateData.dislike = dislike;
        if (fk_user) updateData.fk_user = fk_user;
        if (fk_post) updateData.fk_post = fk_post;
        updateData.like_date = new Date();
        const updatedLike = await Like.findByIdAndUpdate(
            id, 
            updateData, 
            { 
                new: true, 
                runValidators: true 
            }
        ).populate('fk_user', 'name')
         .populate('fk_post', 'title');

        if (!updatedLike) {
            return res.status(404).json({ 
                error: 'Like no encontrado' 
            });
        }

        res.status(200).json({
            message: 'Like actualizado exitosamente',
            like: updatedLike
        });
    } catch (error) {
        console.error('Error al actualizar like:', error);
        res.status(500).json({ 
            error: 'Error al actualizar el like', 
            details: error.message 
        });
    }
};

exports.deleteLike = async (req, res) => {
    try {
        const { id } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                error: 'ID de like inválido' 
            });
        }

        const deletedLike = await Like.findByIdAndDelete(id);

        if (!deletedLike) {
            return res.status(404).json({ 
                error: 'Like no encontrado' 
            });
        }

        res.status(200).json({ 
            message: 'Like eliminado exitosamente',
            like: deletedLike
        });
    } catch (error) {
        console.error('Error al eliminar like:', error);
        res.status(500).json({ 
            error: 'Error al eliminar el like', 
            details: error.message 
        });
    }
};

exports.getLikesByPost = async (req, res) => {
    try {
        const { fk_post } = req.body;
        if (!mongoose.Types.ObjectId.isValid(fk_post)) {
            return res.status(400).json({ 
                error: 'ID de post inválido' 
            });
        }

        const likes = await Like.find({ fk_post })
            .populate('fk_user', 'name')
            .populate('fk_post', 'title');

        res.status(200).json({
            message: 'Likes del post obtenidos exitosamente',
            count: likes.length,
            likes
        });
    } catch (error) {
        console.error('Error al obtener likes por post:', error);
        res.status(500).json({ 
            error: 'Error al obtener likes del post', 
            details: error.message 
        });
    }
};