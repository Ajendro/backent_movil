const bcrypt = require('bcrypt');
const Authentication = require('../models/authenticationModel');
const { sendResponse } = require('../services/respuesta');

// Actualizar contraseña
exports.updatePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Verificar que los campos sean proporcionados
    if (!email || !oldPassword || !newPassword) {
      return sendResponse(res, 400, 'Todos los campos son requeridos');
    }

    // Buscar la autenticación por email
    const auth = await Authentication.findOne({ email });
    if (!auth) {
      return sendResponse(res, 404, 'Autenticación no encontrada');
    }

    // Verificar si la contraseña anterior es correcta
    const isMatch = await bcrypt.compare(oldPassword, auth.password);
    if (!isMatch) {
      return sendResponse(res, 400, 'La contraseña anterior es incorrecta');
    }

    // Encriptar la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña
    auth.password = hashedNewPassword;
    await auth.save();

    sendResponse(res, 200, 'Contraseña actualizada exitosamente');
  } catch (err) {
    console.error('Error al actualizar la contraseña:', err);
    sendResponse(res, 500, 'Error al actualizar la contraseña', null, false);
  }
};

// Eliminar cuenta (autenticación)
exports.deleteAuthentication = async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar que el email sea proporcionado
    if (!email) {
      return sendResponse(res, 400, 'El email es requerido');
    }

    // Buscar la autenticación por email
    const auth = await Authentication.findOne({ email });
    if (!auth) {
      return sendResponse(res, 404, 'Autenticación no encontrada');
    }

    // Eliminar la autenticación
    await Authentication.findOneAndDelete({ email });
    sendResponse(res, 200, 'Autenticación eliminada exitosamente');
  } catch (err) {
    console.error('Error al eliminar autenticación:', err);
    sendResponse(res, 500, 'Error al eliminar autenticación', null, false);
  }
};
