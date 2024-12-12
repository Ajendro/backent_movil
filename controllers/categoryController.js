const express = require('express');
const mongoose = require('mongoose');
const Category = require('../models/categoryModel');
const { sendResponse } = require('../services/respuesta');

exports.createCategory = async (req, res) => {
    try {
        const { name, category_idcategory } = req.body;

        if (!name || category_idcategory === undefined) {
            return sendResponse(res, 400, 'Todos los campos son requeridos', null, false);
        }

        const newCategory = new Category({
            name,
            category_idcategory
        });

        const categoryRecord = await newCategory.save();
        return sendResponse(res, 201, 'Categoría creada exitosamente', { category: categoryRecord }, true);
    } catch (err) {
        console.error('Error creando la categoría:', err);
        return sendResponse(res, 500, 'Error al crear la categoría', null, false);
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();

        return sendResponse(res, 200, 'Categorías obtenidas exitosamente', { categories, count: categories.length }, true);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        return sendResponse(res, 500, 'Error al obtener categorías', null, false);
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, 'ID de categoría inválido', null, false);
        }

        const category = await Category.findById(id);

        if (!category) {
            return sendResponse(res, 404, 'Categoría no encontrada', null, false);
        }

        return sendResponse(res, 200, 'Categoría obtenida exitosamente', { category }, true);
    } catch (error) {
        console.error('Error al obtener categoría por ID:', error);
        return sendResponse(res, 500, 'Error al obtener categoría', null, false);
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category_idcategory } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, 'ID de categoría inválido', null, false);
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (category_idcategory !== undefined) updateData.category_idcategory = category_idcategory;

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedCategory) {
            return sendResponse(res, 404, 'Categoría no encontrada', null, false);
        }

        return sendResponse(res, 200, 'Categoría actualizada exitosamente', { category: updatedCategory }, true);
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        return sendResponse(res, 500, 'Error al actualizar la categoría', null, false);
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, 'ID de categoría inválido', null, false);
        }

        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return sendResponse(res, 404, 'Categoría no encontrada', null, false);
        }

        return sendResponse(res, 200, 'Categoría eliminada exitosamente', { category: deletedCategory }, true);
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        return sendResponse(res, 500, 'Error al eliminar la categoría', null, false);
    }
};
