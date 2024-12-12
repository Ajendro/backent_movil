const express = require('express');
const router = express.Router();
const upload = require('../config/imagenes'); 
const productController = require('../controllers/productController'); 
const userController = require('../controllers/userController'); 
const postController = require('../controllers/postController');
const locationController = require('../controllers/locationController');
const likeController = require('../controllers/likeController');
const communityController = require('../controllers/communityController');
const categoryController = require('../controllers/categoryController');
// APIs de User
// APIs de Usuario
router.post('/create_users', userController.createUser); // Crear un nuevo usuario
router.post('/users/all', userController.getUsers); // Obtener todos los usuarios
router.post('/users/getById', userController.getUserById); // Obtener un usuario por ID
router.post('/users/update', userController.updateUser); // Actualizar un usuario por ID
router.post('/users/delete', userController.deleteUser); // Eliminar un usuario por ID

// APIs de Producto
router.post('/productscreate', upload.single('productImage'), productController.createProduct); // Crear un nuevo producto
router.post('/products', productController.getProducts); // Obtener todos los productos
router.post('/product/getById/:id', productController.getProductById); // Obtener un producto por ID
router.post('/products/update/:id', upload.single('productImage'), productController.updateProduct); // Actualizar un producto por ID
router.post('/products/delete/:id', productController.deleteProduct); // Eliminar un producto por ID
router.post('/products/user/:id', productController.getProductsByUserId); // Obtener productos por ID de usuario

// APIs de Post
router.post('/postscreate', upload.single('imageUrl'), postController.createPost); // Crear un nuevo post
router.post('/posts', postController.getPosts); // Obtener todos los posts
router.post('/post/getById/:id', postController.getPostById); // Obtener un post por ID
router.post('/posts/update/:id', upload.single('imageUrl'), postController.updatePost); // Actualizar un post por ID
router.post('/posts/delete/:id', postController.deletePost); // Eliminar un post por ID
router.post('/posts/user/:id', postController.getPostsByUserId); // Obtener posts por ID de usuario

// APIs de Ubicación
router.post('/create_locations/:id', locationController.createLocation); // Crear una nueva ubicación
router.post('/locations/all/:id', locationController.getLocations); // Obtener todas las ubicaciones
router.post('/locations/getById/:id', locationController.getLocationById); // Obtener una ubicación por ID
router.post('/locations/update/:id', locationController.updateLocation); // Actualizar una ubicación por ID
router.post('/locations/delete/:id', locationController.deleteLocation); // Eliminar una ubicación por ID

// APIs de Likes
router.post('/create_likes', likeController.createLike); // Crear un nuevo like
router.post('/likes/all', likeController.getLikes); // Obtener todos los likes
router.post('/likes/getById/:id', likeController.getLikeById); // Obtener un like por ID
router.post('/likes/update/:id', likeController.updateLike); // Actualizar un like por ID
router.post('/likes/delete/:id', likeController.deleteLike); // Eliminar un like por ID
router.post('/likes/byPost/:id', likeController.getLikesByPost); // Obtener todos los likes por ID de post

// APIs de Comunidad
router.post('/create_community', communityController.createCommunity); // Crear una nueva comunidad
router.post('/community_all', communityController.getCommunities); // Obtener todas las comunidades
router.post('/community/getById/:id', communityController.getCommunityById); // Obtener una comunidad por ID
router.post('/community/update/:id', communityController.updateCommunity); // Actualizar una comunidad por ID
router.post('/community/delete/:id', communityController.deleteCommunity); // Eliminar una comunidad por ID

// APIs de Categorías
router.post('/categories', categoryController.createCategory); // Crear una nueva categoría
router.post('/categories/all', categoryController.getCategories); // Obtener todas las categorías
router.post('/categories/getById/:id', categoryController.getCategoryById); // Obtener una categoría por ID
router.post('/categories/update/:id', categoryController.updateCategory); // Actualizar una categoría por ID
router.post('/categories/delete/:id', categoryController.deleteCategory); // Eliminar una categoría por ID

module.exports = router;



