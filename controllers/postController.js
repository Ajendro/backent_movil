const Post = require('../models/postModel');
const cloudinary = require('../config/cloudinary');

const uploadImageToCloudinary = async (imagePath) => {
    try {
        const result = await cloudinary.uploader.upload(imagePath);
        return result.secure_url;
    } catch (error) {
        throw new Error('Error al subir la imagen a Cloudinary: ' + error.message);
    }
};
exports.createPost = async (req, res) => {
    try {
        const { name, description, post_type, post_date, fk_user, fk_location } = req.body;
        let imageUrl = null;

        if (req.file) {
            imageUrl = await uploadImageToCloudinary(req.file.path);
        }

        if (!fk_user || !fk_location) {
            return res.status(400).json({ mensaje: 'ID de usuario y ubicación son obligatorios' });
        }

        const newPost = new Post({
            name,
            description,
            imageUrl: imageUrl,
            post_type,
            post_date,
            fk_user,
            fk_location
        });

        await newPost.save();
        res.status(201).json({ mensaje: 'Publicación creada exitosamente', publicacion: newPost });
    } catch (error) {
        res.status(500).json({ mensaje: 'No se pudo crear la publicación: Error interno del servidor', error: error.message });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const { post_type } = req.query;
        const filter = post_type ? { post_type } : {};
        const posts = await Post.find(filter);
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener publicaciones', error: error.message });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ mensaje: 'Publicación no encontrada' });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener publicación por ID', error: error.message });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        let updateData = req.body;

        if (req.file) {
            const imageUrl = await uploadImageToCloudinary(req.file.path);
            updateData = { ...updateData, image_url: imageUrl };
        }

        const updatedPost = await Post.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedPost) {
            return res.status(404).json({ mensaje: 'Publicación no encontrada' });
        }
        res.status(200).json({ mensaje: 'Publicación actualizada exitosamente', publicacion: updatedPost });
    } catch (error) {
        res.status(500).json({ mensaje: 'No se pudo actualizar la publicación: Error interno del servidor', error: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
            return res.status(404).json({ mensaje: 'Publicación no encontrada' });
        }
        res.status(200).json({ mensaje: 'Publicación eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'No se pudo eliminar la publicación: Error interno del servidor', error: error.message });
    }
};

exports.getPostsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const posts = await Post.find({ fk_user: userId });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener publicaciones por ID de usuario', error: error.message });
    }
};