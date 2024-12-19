require('dotenv').config();  
const mailjet = require('node-mailjet').apiConnect(
  process.env.MAILJET_PUBLIC_KEY,  
  process.env.MAILJET_PRIVATE_KEY  
);

async function enviarCorreoModuloFinalizado(destinatario, asunto, mensaje, attachments) {
  try {
    const response = await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: 'merchanjair1@gmail.com', 
              Name: 'Jair',
            },
            To: [
              {
                Email: destinatario,
              },
            ],
            Subject: asunto,
            TextPart: mensaje,
            Attachments: attachments,
          },
        ],
      });
    console.log('Correo enviado exitosamente:', response.body);
    return response.body;
  } catch (err) {
    console.error('Error enviando correo:', err);
    throw err;
  }
}

module.exports = { enviarCorreoModuloFinalizado };
