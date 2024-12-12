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
            return sendResponse(res, 400, 'ID de usuario no proporcionado', null, false);
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
        return sendResponse(res, 201, 'Producto creado exitosamente', { idTransaction: newProduct._id }, true);
    } catch (error) {
        return sendResponse(res, 500, 'No se pudo crear el producto: Error interno del servidor', null, false);
    }
};

// Obtener Todos los Productos
exports.getProducts = async (req, res) => {
    try {
        const { fk_category_product } = req.query;
        const filter = fk_category_product ? { fk_category_product } : {};
        const products = await Product.find(filter);
        return sendResponse(res, 200, 'Productos obtenidos exitosamente', { products }, true);
    } catch (error) {
        return sendResponse(res, 500, 'Error al obtener productos', null, false);
    }
};

// Obtener Producto por ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return sendResponse(res, 404, 'Producto no encontrado', null, false);
        }
        return sendResponse(res, 200, 'Producto encontrado exitosamente', { product }, true);
    } catch (error) {
        return sendResponse(res, 500, 'Error al obtener producto por ID', null, false);
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
            return sendResponse(res, 404, 'Producto no encontrado', null, false);
        }
        return sendResponse(res, 200, 'Producto actualizado exitosamente', { product: updatedProduct }, true);
    } catch (error) {
        return sendResponse(res, 500, 'No se pudo actualizar el producto: Error interno del servidor', null, false);
    }
};

// Eliminar Producto
exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return sendResponse(res, 404, 'Producto no encontrado', null, false);
        }
        return sendResponse(res, 200, 'Producto eliminado exitosamente', { idTransaction: deletedProduct._id }, true);
    } catch (error) {
        return sendResponse(res, 500, 'No se pudo eliminar el producto: Error interno del servidor', null, false);
    }
};

exports.getProductsByUserId = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el userId es válido
        if (!id) {
            return sendResponse(res, 400, 'ID de usuario no proporcionado', null, false);
        }

        // Convertir userId a ObjectId usando 'new'
        const userObjectId = new mongoose.Types.ObjectId(id);

        // Log para verificar el valor de userId
        console.log('Buscando productos para el usuario con ID:', userObjectId);

        // Buscar los productos que corresponden al usuario
        const products = await Product.find({ fk_user: userObjectId });

        // Verificar si hay productos
        console.log('Productos encontrados:', products);

        if (products.length === 0) {
            return sendResponse(res, 200, 'No se encontraron productos para este usuario', { products }, true);
        }

        return sendResponse(res, 200, 'Productos obtenidos por ID de usuario', { products }, true);
    } catch (error) {
        console.error('Error al obtener productos por ID de usuario:', error);
        return sendResponse(res, 500, 'Error al obtener productos por ID de usuario', null, false);
    }
};


