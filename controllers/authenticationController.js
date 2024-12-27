const bcrypt = require('bcrypt');
const Authentication = require('../models/authenticationModel');
const { sendResponse } = require('../services/respuesta');

// Actualizar contraseña
exports.updatePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Verificar que los campos sean proporcionados
    if (!email || !oldPassword || !newPassword) {
      return sendResponse(res, 400, false, 'Todos los campos son requeridos', null);
    }

    // Buscar la autenticación por email
    const auth = await Authentication.findOne({ email });
    if (!auth) {
      return sendResponse(res, 404, false, 'Autenticación no encontrada', null);
    }

    // Verificar si la contraseña anterior es correcta
    const isMatch = await bcrypt.compare(oldPassword, auth.password);
    if (!isMatch) {
      return sendResponse(res, 400, false, 'La contraseña anterior es incorrecta', null);
    }

    // Encriptar la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña
    auth.password = hashedNewPassword;
    await auth.save();

    return sendResponse(res, 200, true, 'Contraseña actualizada exitosamente', null);
  } catch (err) {
    console.error('Error al actualizar la contraseña:', err);
    return sendResponse(res, 500, false, 'Error al actualizar la contraseña', null);
  }
};

// Eliminar cuenta (autenticación)
exports.deleteAuthentication = async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar que el email sea proporcionado
    if (!email) {
      return sendResponse(res, 400, false, 'El email es requerido', null);
    }

    // Buscar la autenticación por email
    const auth = await Authentication.findOne({ email });
    if (!auth) {
      return sendResponse(res, 404, false, 'Autenticación no encontrada', null);
    }

    // Eliminar la autenticación
    await Authentication.findOneAndDelete({ email });
    return sendResponse(res, 200, true, 'Autenticación eliminada exitosamente', null);
  } catch (err) {
    console.error('Error al eliminar autenticación:', err);
    return sendResponse(res, 500, false, 'Error al eliminar autenticación', null);
  }
};
