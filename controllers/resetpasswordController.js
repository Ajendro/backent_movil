require('dotenv').config();
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const Authentication = require('../models/authenticationModel');
const { sendResponse } = require('../services/respuesta');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const verificationCodes = {}; 

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Enviar correo para restablecer contraseña
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const authentication = await Authentication.findOne({ email });
    if (!authentication) {
      return sendResponse(res, 400, false, 'Usuario no encontrado.', null);
    }

    const verificationCode = generateVerificationCode();
    const expiresAt = Date.now() + 3600000;
    verificationCodes[email] = { code: verificationCode, expiresAt };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Restablecimiento de contraseña',
      text: `Tu código de verificación es: ${verificationCode}. Este código expirará en una hora.`,
    };

    await transporter.sendMail(mailOptions);

    return sendResponse(res, 200, true, 'Correo enviado con el código de verificación.', null);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return sendResponse(res, 500, false, 'Error al procesar la solicitud.', null);
  }
};

// Restablecer contraseña
const resetPassword = async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;

  try {
    const authentication = await Authentication.findOne({ email });
    if (!authentication) {
      return sendResponse(res, 400, false, 'Usuario no encontrado.', null);
    }

    const storedData = verificationCodes[email];
    if (!storedData) {
      return sendResponse(res, 400, false, 'Código de verificación incorrecto.', null);
    }

    if (storedData.code !== verificationCode) {
      return sendResponse(res, 400, false, 'Código de verificación incorrecto.', null);
    }

    if (storedData.expiresAt < Date.now()) {
      return sendResponse(res, 400, false, 'El código de verificación ha expirado.', null);
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    authent
    ication.password = hashedPassword;
    await authentication.save();

    delete verificationCodes[email];

    return sendResponse(res, 200, true, 'Contraseña restablecida con éxito.', null);
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error);
    return sendResponse(res, 500, false, 'Error al restablecer la contraseña.', null);
  }
};

module.exports.forgotPassword = forgotPassword;
module.exports.resetPassword = resetPassword;
