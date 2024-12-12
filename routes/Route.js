const express = require('express');
const router = express.Router();
const upload = require('../config/imagenes'); 
const productController = require('../controllers/productController'); 
const userController = require('../controllers/userController'); 
const postController = require('../controllers/postController');
const locationController = require('../controllers/locationController');
const likeController = require('../controllers/likeController');


//apis user
router.post('/create_users', userController.createUser);
router.post('/users/all', userController.getUsers);
router.post('/users/getById', userController.getUserById);
router.post('/users/update', userController.updateUser);
router.post('/users/delete', userController.deleteUser);

//apis product
router.post('/productscreate',upload.single('productImage'),productController.createProduct);
router.post('/products', productController.getProducts);
router.post('/product/:id', productController.getProductById);
router.put('/updateproducts/:id',upload.single('productImage'), productController.updateProduct);
router.delete('/deleteproducts/:id', productController.deleteProduct);
router.post('/products/user/:userId', productController.getProductsByUserId);

// apis post
router.post('/postscreate', upload.single('imageUrl'), postController.createPost); 
router.post('/posts', postController.getPosts); 
router.post('/post/:id', postController.getPostById); 
router.put('/updateposts/:id', upload.single('imageUrl'), postController.updatePost); 
router.delete('/deleteposts/:id', postController.deletePost); 
router.post('/posts/user/:userId', postController.getPostsByUserId); 

//apis location
router.post('/create_locations', locationController.createLocation);
router.post('/locations/all', locationController.getLocations);
router.post('/locations/getById', locationController.getLocationById);
router.post('/locations/update', locationController.updateLocation);
router.post('/locations/delete', locationController.deleteLocation);

// apis likes
router.post('/create_likes', likeController.createLike);
router.post('/likes/all', likeController.getLikes);
router.post('/likes/getById', likeController.getLikeById);
router.post('/likes/update', likeController.updateLike);
router.post('/likes/delete', likeController.deleteLike);
router.post('/likes/byPost', likeController.getLikesByPost);



module.exports = router;



