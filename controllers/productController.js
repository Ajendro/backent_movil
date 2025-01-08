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
        const { name, description, price, fk_category_product } = req.body;
        let imageUrl = null;

        if (req.file) {
            imageUrl = await uploadImageToCloudinary(req.file.path);
        }

        // Asegurarse de que el ID del usuario viene del token decodificado en req.user
        if (!req.user || !req.user.id) {
            return sendResponse(res, 401, false, 'Usuario no autenticado', null);
        }

        const fk_user = req.user.id;
        
        const newProduct = new Product({
            name,
            description,
            price,
            productImage: imageUrl,
            fk_category_product,
            fk_user
        });

        await newProduct.save();
        return sendResponse(res, 201, 'Producto creado exitosamente', { newProduct }, true);
    } catch (error) {
        console.error('Error al crear el producto:', error);
        return sendResponse(res, 500, false, 'No se pudo crear el producto: Error interno del servidor', null);
    }
};


// Obtener Todos los Productos
exports.getProducts = async (req, res) => {
    try {
        const { fk_category_product } = req.query;
        const filter = fk_category_product ? { fk_category_product } : {};
        const products = await Product.find(filter);
        return sendResponse(res, 200, 'Productos obtenidos exitosamente', { products },true);
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
        return sendResponse(res, 200, 'Producto encontrado exitosamente', { product }, true);
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
        return sendResponse(res, 200, 'Producto actualizado exitosamente', { product: updatedProduct }, true);
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
        if (!req.user || !req.user.id) {
            return sendResponse(res, 401, false, 'Usuario no autenticado', null);
        }

        const userId = req.user.id;

        // Verificar que el userId es un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return sendResponse(res, 400, false, 'ID de usuario no válido', null);
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Buscar los productos que corresponden al usuario
        const products = await Product.find({ fk_user: userObjectId });

        if (products.length === 0) {
            return sendResponse(res, 200, true, 'No se encontraron productos para este usuario', { products });
        }

        return sendResponse(res, 200, 'Productos obtenidos por ID de usuario', { products }, true);
    } catch (error) {
        console.error('Error al obtener productos por ID de usuario:', error);
        return sendResponse(res, 500, false, 'Error al obtener productos por ID de usuario', null);
    }
};