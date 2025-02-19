const admin = require('firebase-admin');
const User = require('../models/userModel');
const Post = require('../models/postModel');
const Follower = require('../models/followerModel');
const { sendResponse } = require('../services/respuesta');
require('dotenv').config();

// Notificar nuevo post
exports.notifyNewPost = async (req, res) => {
  try {
      const { postId } = req.body;
      const userId = req.user.id; // Obtenemos el userId del token JWT

      if (!postId) {
          return sendResponse(res, 400, 'PostId es requerido', null, false);
      }

      const post = await Post.findById(postId);
      const user = await User.findById(userId);

      if (!post) {
          return sendResponse(res, 404, 'Post no encontrado', null, false);
      }

      if (!user) {
          return sendResponse(res, 404, 'Usuario no encontrado', null, false);
      }

      // Verificar que el post pertenece al usuario
      if (post.fk_user.toString() !== userId) {
          return sendResponse(res, 403, 'No autorizado para notificar sobre este post', null, false);
      }

      const followers = await Follower.find({ following: userId })
          .populate('follower', 'fcmToken');

      const tokens = followers
          .map(f => f.follower.fcmToken)
          .filter(token => token);

      if (tokens.length > 0) {
          await sendNotification(
              tokens,
              'Nueva publicación',
              `${user.username} ha publicado algo nuevo`,
              {
                  type: 'new_post',
                  postId: postId.toString(),
                  userId: userId.toString()
              }
          );
      }

      sendResponse(res, 200, 'Notificaciones enviadas exitosamente', null, true);
  } catch (error) {
      console.error('Error en notifyNewPost:', error);
      sendResponse(res, 500, 'Error al enviar notificaciones de nuevo post', null, false);
  }
};

// Notificar nuevo like
exports.notifyNewLike = async (req, res) => {
    try {
        const { postId } = req.body;
        const likerId = req.user.id; // Obtenemos el ID del usuario del token

        if (!postId || !likerId) {
            return sendResponse(res, 400, 'PostId y likerId son requeridos', null, false);
        }

        const post = await Post.findById(postId).populate('fk_user');
        const liker = await User.findById(likerId);

        if (!post || !liker) {
            return sendResponse(res, 404, 'Post o usuario no encontrado', null, false);
        }

        if (post.fk_user.fcmToken) {
            await sendNotification(
                post.fk_user.fcmToken,
                'Nuevo me gusta',
                `A ${liker.username} le gustó tu publicación`,
                {
                    type: 'new_like',
                    postId: postId.toString(),
                    likerId: likerId.toString()
                }
            );
        }

        sendResponse(res, 200, 'Notificación enviada exitosamente', null, true);
    } catch (error) {
        console.error('Error en notifyNewLike:', error);
        sendResponse(res, 500, 'Error al enviar notificación de nuevo like', null, false);
    }
};

// Notificar nuevo seguidor
exports.notifyNewFollower = async (req, res) => {
  try {
      const followerId = req.user.id;
      const { followedId } = req.body;

      if (!followedId) {
          return sendResponse(res, 400, 'followedId es requerido', null, false);
      }

      if (followerId === followedId) {
          return sendResponse(res, 400, 'No puedes notificarte a ti mismo', null, false);
      }

      // Verificar si existe la relación de seguimiento
      const existingFollow = await Follower.findOne({
          follower: followerId,
          following: followedId
      });

      if (!existingFollow) {
          return sendResponse(res, 400, 'No sigues a este usuario', null, false);
      }

      const [follower, followed] = await Promise.all([
          User.findById(followerId),
          User.findById(followedId)
      ]);

      if (!follower || !followed) {
          return sendResponse(res, 404, 'Usuario no encontrado', null, false);
      }

      // Aquí solo enviamos la notificación
      sendResponse(res, 200, 'Notificación de seguimiento enviada', {
          follower: {
              id: follower._id,
              username: follower.username
          },
          followed: {
              id: followed._id,
              username: followed.username
          },
          followDate: existingFollow.follow_date
      }, true);

  } catch (error) {
      console.error('Error en notifyNewFollower:', error);
      sendResponse(res, 500, 'Error al enviar notificación de seguimiento', null, false);
  }
};