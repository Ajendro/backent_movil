const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationSchema = new Schema({
    main_street: { type: String, required: true },
    secondary_street: { type: String, required: true },
    fk_city: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    fk_province: { type: Schema.Types.ObjectId, ref: 'Category', required: true }
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
