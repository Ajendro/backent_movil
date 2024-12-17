const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const genderEnum = ['Masculino', 'Femenino', 'Otro'];
const userSchema = new Schema({
    username: { type: String, required: true },
    profilePicture: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    birthDate: { type: Date, required: true },  
    gender: { type: String, enum: genderEnum, required: true },
    fk_location: { type: Schema.Types.ObjectId, ref: 'Location', required: true }, 
});

const User = mongoose.model('User', userSchema);

module.exports = User;
