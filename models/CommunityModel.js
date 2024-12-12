const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const communitySchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    creation_date: { type: Date, required: true },
    fk_user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

const Community = mongoose.model('Community', communitySchema);

module.exports = Community;
