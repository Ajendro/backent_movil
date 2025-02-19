const admin = require('firebase-admin');
const serviceAccount = require('../config/redsocial.json');

const initializeFirebaseAdmin = () => {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }
    console.log('Firebase Admin inicializado');
};

const sendPushNotification = async (deviceToken, message) => {
    const payload = {
        notification: {

            title: 'Notificación de corte de servicio',
            body: message,
        },
        token: deviceToken,
    };
    try {
        await admin.messaging().send(payload);
        console.log('Notificación enviada con éxito');
    } catch (error) {
        console.error('Error al enviar la notificación:', error);
    }
};

module.exports = { initializeFirebaseAdmin, sendPushNotification };
