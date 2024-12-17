const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuthenticationSchema = new mongoose.Schema({
  email: {type: String,required: true,unique: true,},
  password: {type: String,required: true, },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

const Authentication = mongoose.model('Authentication', AuthenticationSchema);

module.exports = Authentication;