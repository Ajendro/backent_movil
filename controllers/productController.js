const Product = require('../models/productModel');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');

const { sendResponse } = require('../services/respuesta');

const uploadImageToCloudinary = async (imagePath) => {
    try {
        const result = await cloudinary.uploader.upload(imagePath);
        return result.secure_url;
    } catch (error) {
        throw new Error('Error al subir la imagen a Cloudinary: ' + error.message);
    }
};

// Crear Producto
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, fk_category_product, fk_user } = req.body;
        let imageUrl = null;

        if (req.file) {
            imageUrl = await uploadImageToCloudinary(req.file.path);
        }

        if (!fk_user) {
            return sendResponse(res, 400, false, 'ID de usuario no proporcionado', null);
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
        return sendResponse(res, 201, true, 'Producto creado exitosamente', { idTransaction: newProduct._id });
    } catch (error) {
        return sendResponse(res, 500, false, 'No se pudo crear el producto: Error interno del servidor', null);
    }
};

// Obtener Todos los Productos
exports.getProducts = async (req, res) => {
    try {
        const { fk_category_product } = req.query;
        const filter = fk_category_product ? { fk_category_product } : {};
        const products = await Product.find(filter);
        return sendResponse(res, 200, true, 'Productos obtenidos exitosamente', { products });
    } catch (error) {
        return sendResponse(res, 500, false, 'Error al obtener productos', null);
    }
};

// Obtener Producto por ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return sendResponse(res, 404, false, 'Producto no encontrado', null);
        }
        return sendResponse(res, 200, true, 'Producto encontrado exitosamente', { product });
    } catch (error) {
        return sendResponse(res, 500, false, 'Error al obtener producto por ID', null);
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
            return sendResponse(res, 404, false, 'Producto no encontrado', null);
        }
        return sendResponse(res, 200, true, 'Producto actualizado exitosamente', { product: updatedProduct });
    } catch (error) {
        return sendResponse(res, 500, false, 'No se pudo actualizar el producto: Error interno del servidor', null);
    }
};

// Eliminar Producto
exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return sendResponse(res, 404, false, 'Producto no encontrado', null);
        }
        return sendResponse(res, 200, true, 'Producto eliminado exitosamente', { idTransaction: deletedProduct._id });
    } catch (error) {
        return sendResponse(res, 500, false, 'No se pudo eliminar el producto: Error interno del servidor', null);
    }
};

// Obtener productos por ID de usuario
exports.getProductsByUserId = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el userId es válido
        if (!id) {
            return sendResponse(res, 400, false, 'ID de usuario no proporcionado', null);
        }

        // Convertir userId a ObjectId usando 'new'
        const userObjectId = new mongoose.Types.ObjectId(id);

        // Buscar los productos que corresponden al usuario
        const products = await Product.find({ fk_user: userObjectId });

        if (products.length === 0) {
            return sendResponse(res, 200, true, 'No se encontraron productos para este usuario', { products });
        }

        return sendResponse(res, 200, true, 'Productos obtenidos por ID de usuario', { products });
    } catch (error) {
        console.error('Error al obtener productos por ID de usuario:', error);
        return sendResponse(res, 500, false, 'Error al obtener productos por ID de usuario', null);
    }
};
