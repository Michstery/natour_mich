const express = require('express');
const router = express.Router();
////////\\\\\\ controller contains our route handlers in exports. (instead of const) form.
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('./../controllers/reviewController');

router.post('/signup', authController.signup);
router.post('/login', authController.login); 

router.post('/forgotPassword', authController.forgotPassword); 
router.patch('/resetPassword/:token', authController.resetPassword); 
router.patch('/updatePassword', authController.protect, authController.updatePassword); 
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);
router.get('/me', authController.protect, userController.getMe, userController.getUser);


/////////\\\\\\\\\  ~ USERS ROUTES ~ ////////////////\\\\\\\\\\\
router.route('/').get(userController.getAllUsers);
router.route('/:id').get(userController.getUser).delete(authController.restrictTo('admin'), userController.deleteUser).patch(authController.restrictTo('admin'), userController.updateUser);
// router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

/// NESTED ROUTES
// POST /tour/1234/reviews
// GET /tour/1234/reviews
router.route('/:tourId/reviews').post(
    authController.protect, authController.restrictTo('user'), reviewController.createReview);


module.exports = router;