const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

/////////////////////////////////////////////////////
/// PROTECT THE ROUTE ////////
router.use(authController.protect);
router.get('/',  reviewController.getAllReviews);
router.post('/', authController.restrictTo('user'), reviewController.setTourUserId, reviewController.createReview);
router.route('/:id').get(reviewController.getReview).delete(authController.restrictTo('user'), reviewController.deleteReview).patch(authController.restrictTo('user', 'admin'), reviewController.updateReview);

module.exports = router;