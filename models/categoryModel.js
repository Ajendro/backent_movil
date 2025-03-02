const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: { type: String, required: true },
    category_idcategory: { type: Schema.Types.ObjectId, ref: 'Category'}
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
