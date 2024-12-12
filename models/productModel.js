const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Schema.Types.Decimal128, required: true },
    description: { type: String, required: true },
    productImage: { type: String, required: true },
    fk_user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    fk_category_product: { type: Schema.Types.ObjectId, ref: 'Category', required: false }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
