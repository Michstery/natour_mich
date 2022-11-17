const express = require('express');
const router = express.Router();

////////\\\\\\ controller contains our route handlers in exports. (instead of const) form.
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('./../controllers/reviewController');



router.post('/signup', authController.signup);
router.post('/login', authController.login); 

router.post('/forgotPassword', authController.forgotPassword); 
router.post('/validate/otp', authController.validateOtp); 
router.patch('/resetPassword/:token', authController.resetPassword); 

// for loading and deleting pre-set data
/////////////////////////////////////////////////////////////
router.delete('/delete-all-users', userController.deleteData);
router.post('/import-all-users', userController.importData);
/////////////////////////////////////////////////////////////

////// PROTECT ROUTE WITH MIDDLEWARE ///////////////
router.use(authController.protect);
router.patch('/updatePassword', authController.updatePassword); 
router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);
router.get('/me', userController.getMe, userController.getUser);


/////////\\\\\\\\\  ~ USERS ROUTES FOR ADMIN ALONE~ ////////////////\\\\\\\\\\\
router.use(authController.restrictTo('admin'));
router.route('/').get(userController.getAllUsers);
router.route('/:id').get(userController.getUser).delete(userController.deleteUser).patch(userController.updateUser);
// router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

/// NESTED ROUTES
// POST /tour/1234/reviews
// GET /tour/1234/reviews



module.exports = router;