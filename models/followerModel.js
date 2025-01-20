const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const followerSchema = new Schema({
    follower: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    followed: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    follow_date: { type: Date, required: true, default: Date.now }
});

const Follower = mongoose.model('Follower', followerSchema);
module.exports = Follower;
