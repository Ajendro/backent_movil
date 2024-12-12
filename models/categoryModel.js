const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: { type: String, required: true },
    category_idcategory: { type: Number, required: true }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
