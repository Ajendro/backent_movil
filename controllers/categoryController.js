const mongoose = require('mongoose');
const Category = require('../models/categoryModel');
const { sendResponse } = require('../services/respuesta');

exports.createCategory = async (req, res) => {
    try {
        const { name, category_idcategory } = req.body;

        if (!name) {
            return sendResponse(res, 400, false, 'El nombre de la categoría es requerido', null);
        }

        // Validate parent category ID if provided
        if (category_idcategory && !mongoose.Types.ObjectId.isValid(category_idcategory)) {
            return sendResponse(res, 400, false, 'ID de categoría padre inválido', null);
        }

        const newCategory = new Category({
            name,
            category_idcategory: category_idcategory || null
        });

        const categoryRecord = await newCategory.save();

        return sendResponse(res, 201, true, 'Categoría creada exitosamente', { category: categoryRecord });
    } catch (err) {
        console.error('Error creando la categoría:', err);
        return sendResponse(res, 500, false, 'Error al crear la categoría', null);
    }
};

exports.getCategories = async (req, res) => {
    try {
        // Obtener todas las categorías y poblar las categorías padre si las hay
        const categories = await Category.find().populate('category_idcategory');

        return sendResponse(res, 200,'Categorías obtenidas exitosamente', { categories, count: categories.length }, true);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        return sendResponse(res, 500, false, 'Error al obtener categorías', null);
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar el ID proporcionado
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, false, 'ID de categoría inválido', null);
        }

        // Obtener la categoría por ID y poblar la categoría padre
        const category = await Category.findById(id).populate('category_idcategory');

        if (!category) {
            return sendResponse(res, 404, false, 'Categoría no encontrada', null);
        }

        return sendResponse(res, 200, 'Categoría obtenida exitosamente', { category }, true);
    } catch (error) {
        console.error('Error al obtener categoría por ID:', error);
        return sendResponse(res, 500, false, 'Error al obtener categoría', null);
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category_idcategory } = req.body;

        // Validar el ID proporcionado
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, false, 'ID de categoría inválido', null);
        }

        // Validar la referencia de la categoría padre
        if (category_idcategory && !mongoose.Types.ObjectId.isValid(category_idcategory)) {
            return sendResponse(res, 400, false, 'ID de categoría padre inválido', null);
        }

        // Preparar los datos a actualizar
        const updateData = {};
        if (name) updateData.name = name;
        if (category_idcategory !== undefined) updateData.category_idcategory = category_idcategory;

        // Actualizar la categoría
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedCategory) {
            return sendResponse(res, 404, false, 'Categoría no encontrada', null);
        }

        return sendResponse(res, 200, 'Categoría actualizada exitosamente', { category: updatedCategory }, true);
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        return sendResponse(res, 500, false, 'Error al actualizar la categoría', null);
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar el ID proporcionado
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, false, 'ID de categoría inválido', null);
        }

        // Verificar si la categoría tiene subcategorías
        const subcategories = await Category.find({ category_idcategory: id });
        if (subcategories.length > 0) {
            return sendResponse(res, 400, false, 'No se puede eliminar la categoría porque tiene subcategorías asociadas.', null);
        }

        // Eliminar la categoría
        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return sendResponse(res, 404, false, 'Categoría no encontrada', null);
        }

        return sendResponse(res, 200, true, 'Categoría eliminada exitosamente', { category: deletedCategory });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        return sendResponse(res, 500, false, 'Error al eliminar la categoría', null);
    }
};

exports.createMultipleCategories = async (req, res) => {
    try {
        const { categories } = req.body;

        // Verificar que se haya enviado un arreglo de categorías
        if (!Array.isArray(categories) || categories.length === 0) {
            return sendResponse(res, 400, false, 'Debe proporcionar un arreglo de categorías', null);
        }

        // Verificar que cada categoría tenga los campos requeridos
        const invalidCategory = categories.find(category => !category.name || category.category_idcategory === undefined);
        if (invalidCategory) {
            return sendResponse(res, 400, false, 'Todos los campos son requeridos para cada subcategoría', null);
        }

        // Validar los ObjectId de cada categoría padre (category_idcategory)
        categories.forEach(category => {
            if (category.category_idcategory && !mongoose.Types.ObjectId.isValid(category.category_idcategory)) {
                return sendResponse(res, 400, false, `ID de categoría padre inválido para la categoría ${category.name}`, null);
            }
        });

        // Insertar las categorías de forma masiva
        const newCategories = await Category.insertMany(categories);

        return sendResponse(res, 201, true, 'Subcategorías creadas exitosamente', { categories: newCategories });
    } catch (err) {
        console.error('Error creando subcategorías:', err);
        return sendResponse(res, 500, false, 'Error al crear las subcategorías', null);
    }
};
