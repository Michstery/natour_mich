const express = require('express');
const router = express.Router();
////////\\\\\\ controller contains our route handlers in exports. (instead of const) form.
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login); 

router.post('/forgotPassword', authController.forgotPassword); 
router.patch('/resetPassword/:token', authController.resetPassword); 
router.patch('/updatePassword', authController.protect, authController.updatePassword); 


/////////\\\\\\\\\  ~ USERS ROUTES ~ ////////////////\\\\\\\\\\\
router.route('/').get(userController.getAllUsers).post(userController.createNewUser);
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;