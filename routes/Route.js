const express = require('express');
const router = express.Router();
const upload = require('../config/imagenes'); 
const verifyToken = require('../services/verifyToken');
const productController = require('../controllers/productController'); 
const userController = require('../controllers/userController'); 
const postController = require('../controllers/postController');
const locationController = require('../controllers/locationController');
const likeController = require('../controllers/likeController');
const communityController = require('../controllers/communityController');
const categoryController = require('../controllers/categoryController');
const loginController = require('../controllers/loginController');
const authenticationController = require('../controllers/authenticationController');
const { forgotPassword, resetPassword} = require('../controllers/resetpasswordController');
const followerController = require('../controllers/followerController');


// APIs de autenticación
router.post('/auth/update-password', authenticationController.updatePassword); // Actualizar contraseña
router.post('/auth/delete', authenticationController.deleteAuthentication); // Eliminar cuenta

// APIs de User
router.post('/create_users', upload.single('profilePicture'), userController.createUser); // Crear un nuevo usuario
router.post('/login', loginController.loginUser); // Login de usuario
router.post('/users/all', verifyToken, userController.getUsers); // Obtener todos los usuarios
router.post('/users/getById/:id', verifyToken, userController.getUserById); // Obtener un usuario por ID
router.post('/users/update/:id', verifyToken, upload.single('profilePicture'), userController.updateUser); // Actualizar un usuario
router.post('/users/delete/:id', verifyToken, userController.deleteUser); // Eliminar un usuario por ID

// APIs de Producto
router.post('/productscreate', verifyToken, upload.single('productImage'), productController.createProduct); // Crear un nuevo producto
router.post('/products', productController.getProducts); // Obtener todos los productos
router.post('/product/getById/:id', productController.getProductById); // Obtener un producto por ID
router.post('/products/update/:id', verifyToken, upload.single('productImage'), productController.updateProduct); // Actualizar un producto por ID
router.post('/products/delete/:id', verifyToken, productController.deleteProduct); // Eliminar un producto por ID
router.post('/products/user/:id', verifyToken, productController.getProductsByUserId); // Obtener productos por ID de usuario

// APIs de Post
router.post('/postscreate', verifyToken, upload.single('imageUrl'), postController.createPost); // Crear un nuevo post
router.post('/posts',verifyToken, postController.getPostsByUserLocation); // Obtener todos los posts según la dirección
router.post('/post/getById/:id', postController.getPostById); // Obtener un post por ID
router.post('/posts/update/:id', verifyToken, upload.single('imageUrl'), postController.updatePost); // Actualizar un post por ID
router.post('/posts/delete/:id', verifyToken, postController.deletePost); // Eliminar un post por ID
router.post('/posts/user/:id', verifyToken, postController.getPostsByUserId); // Obtener posts por ID de usuario

// APIs de Ubicación
router.post('/create_locations/:id', verifyToken, locationController.createLocation); // Crear una nueva ubicación
router.post('/locations/all', verifyToken, locationController.getLocations); // Obtener todas las ubicaciones
router.post('/locations/getById/:id', verifyToken, locationController.getLocationById); // Obtener una ubicación por ID
router.post('/locations/update/:id', verifyToken, locationController.updateLocation); // Actualizar una ubicación por ID
router.post('/locations/delete/:id', verifyToken, locationController.deleteLocation); // Eliminar una ubicación por ID

// APIs de Likes
router.post('/create_likes', verifyToken, likeController.createLike); // Crear un nuevo like
router.post('/likes/all', verifyToken, likeController.getLikes); // Obtener todos los likes
router.post('/likes/delete', verifyToken, likeController.deleteLike); // Eliminar un like por ID
router.post('/likes/byPost/:id', verifyToken, likeController.getLikesByPost); // Obtener todos los likes por ID de post

// APIs de Comunidad
router.post('/create_community', verifyToken, communityController.createCommunity); // Crear una nueva comunidad
router.post('/community_all', verifyToken, communityController.getCommunities); // Obtener todas las comunidades
router.post('/community/getById/:id', verifyToken, communityController.getCommunityById); // Obtener una comunidad por ID
router.post('/community/update/:id', verifyToken, communityController.updateCommunity); // Actualizar una comunidad por ID
router.post('/community/delete/:id', verifyToken, communityController.deleteCommunity);// Eliminar una comunidad por ID
router.post('/user/communities', verifyToken, communityController.getCommunitiesByUser); // Obtener comunidad por ID Usuario

// APIs de Categorías
router.post('/categories', verifyToken, categoryController.createCategory); // Crear una nueva categoría
router.post('/categories/all', categoryController.getCategories); // Obtener todas las categorías
router.post('/categories/getById/:id', categoryController.getCategoryById); // Obtener una categoría por ID
router.post('/categories/update/:id', verifyToken, categoryController.updateCategory); // Actualizar una categoría por ID
router.post('/categories/delete/:id', verifyToken, categoryController.deleteCategory); // Eliminar una categoría por ID
router.post('/create_all', verifyToken, categoryController.createMultipleCategories); // Crea todas las categorias 

// APIs de Reseteo de Contraseña
router.post('/forgot-password',forgotPassword); // Solicitar el receteo de contraseña
router.post('/resetpassword', resetPassword); // Resetear contraseña    
router.post('/verifyAccount', userController.verifyAccount); // Verificar cuenta del Usuario

// APIs de Seguidores
router.post('/follow',verifyToken, followerController.followUser); // Seguir a un usuario
router.post('/unfollow', verifyToken, followerController.unfollowUser); // Dejar de seguir a un usuario
router.post('/followers', verifyToken, followerController.getFollowers); // Obtener seguidores de un usuario
router.post('/following', verifyToken, followerController.getFollowing); // Obtener usuarios que sigue un usuario

module.exports = router;
