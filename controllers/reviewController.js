const Review = require('../models/reviewModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');

exports.getAllReviews = catchAsync( async (req, res, next) => {
    const reviews = await Review.find();
    res.status(200).json({
        status: 'success',
        result: reviews.length,
        data: {
            reviews
        }
    })
});

exports.createReview = catchAsync(async (req, res, neext) =>{
    const newReview = await Review.create(req.body);
    if(!newReview){
        return next(new AppError('No Review Created', 400))
     }

    res.status(201).json({
        status: 'success',
        data: {
            newReview
        }
    })
});