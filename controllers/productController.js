const Product = require('../models/productModel');
const cloudinary = require('../config/cloudinary');

const uploadImageToCloudinary = async (imagePath) => {
    try {
        const result = await cloudinary.uploader.upload(imagePath);
        return result.secure_url;
    } catch (error) {
        throw new Error('Error al subir la imagen a Cloudinary: ' + error.message);
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, fk_category_product, fk_user } = req.body;
        let imageUrl = null;

        if (req.file) {
            imageUrl = await uploadImageToCloudinary(req.file.path);
        }

        if (!fk_user) {
            return res.status(400).json({ mensaje: 'ID de usuario no proporcionado' });
        }

        const newProduct = new Product({
            name,
            description,
            price,
            productImage: imageUrl,
            fk_category_product,
            fk_user 
        });

        await newProduct.save();
        res.status(201).json({ mensaje: 'Producto creado exitosamente', producto: newProduct });
    } catch (error) {
        res.status(500).json({ mensaje: 'No se pudo crear el producto: Error interno del servidor', error: error.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const { fk_category_product } = req.query;
        const filter = fk_category_product ? { fk_category_product } : {};
        const products = await Product.find(filter);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener productos', error: error.message });
    }
};

// Obtener Producto por ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener producto por ID', error: error.message });
    }
};

// Actualizar Producto
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        let updateData = req.body;

        if (req.file) {
            const imageUrl = await uploadImageToCloudinary(req.file.path);
            updateData = { ...updateData, productImage: imageUrl };
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }
        res.status(200).json({ mensaje: 'Producto actualizado exitosamente', producto: updatedProduct });
    } catch (error) {
        res.status(500).json({ mensaje: 'No se pudo actualizar el producto: Error interno del servidor', error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }
        res.status(200).json({ mensaje: 'Producto eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'No se pudo eliminar el producto: Error interno del servidor', error: error.message });
    }
};

exports.getProductsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const products = await Product.find({ fk_user: userId });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener productos por ID de usuario', error: error.message });
    }
};
