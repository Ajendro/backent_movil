const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Usuario al que se enviará la notificación
    message: { type: String, required: true },
    type: { type: String, enum: ['new_post', 'like', 'follow'], required: true }, // Tipos de notificación
    read: { type: Boolean, default: false }, // Estado de la notificación
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
