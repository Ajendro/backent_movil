require('dotenv').config();
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const Authentication = require('../models/authenticationModel');
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
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const authentication = await Authentication.findOne({ email });
    if (!authentication) {
      return res.status(400).json({ ok: false, message: 'Usuario no encontrado.' });
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
    res.status(200).json({ ok: true, message: 'Correo enviado con el código de verificación.' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ ok: false, message: 'Error al procesar la solicitud.' });
  }
};
const resetPassword = async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;

  try {
    const authentication = await Authentication.findOne({ email });
    if (!authentication) {
      return res.status(400).json({ ok: false, message: 'Usuario no encontrado.' });
    }
    const storedData = verificationCodes[email];
    if (!storedData) {
      return res.status(400).json({ ok: false, message: 'Código de verificación incorrecto.' });
    }
    if (storedData.code !== verificationCode) {
      return res.status(400).json({ ok: false, message: 'Código de verificación incorrecto.' });
    }

    // Verificar si el código ha expirado
    if (storedData.expiresAt < Date.now()) {
      return res.status(400).json({ ok: false, message: 'El código de verificación ha expirado.' });
    }
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    authentication.password = hashedPassword;
    await authentication.save();
    delete verificationCodes[email];

    res.status(200).json({ ok: true, message: 'Contraseña restablecida con éxito.' });
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error);
    res.status(500).json({ ok: false, message: 'Error al restablecer la contraseña.' });
  }
};

module.exports.forgotPassword = forgotPassword;
module.exports.resetPassword = resetPassword;
