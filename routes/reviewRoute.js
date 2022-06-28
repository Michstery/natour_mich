const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

/////////////////////////////////////////////////////
router.get('/',  authController.protect, reviewController.getAllReviews);
router.post('/', authController.protect, authController.restrictTo('user'), reviewController.setTourUserId, reviewController.createReview);
router.route('/:id').delete(reviewController.deleteReview).patch(reviewController.updateReview);


module.exports = router;