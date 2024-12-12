const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const likeSchema = new Schema({
    like: { type: Number, required: true },
    dislike: { type: Number, required: true },
    like_date: { type: Date, required: true },
    fk_user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fk_post: { type: Schema.Types.ObjectId, ref: 'Post', required: true }
});

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
