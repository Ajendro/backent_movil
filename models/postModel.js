const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    post_type: { type: String, enum: ['accidente', 'comercio', 'corte_agua', 'recomendacion'], required: true }, 
    post_date: { type: Date, required: true },
    fk_user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fk_location: { type: Schema.Types.ObjectId, ref: 'Location', required: true }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
