const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    birthDate: { type: Date },
});

const User = mongoose.model('User', userSchema);

module.exports = User;