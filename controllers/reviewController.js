const Review = require('../models/reviewModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');

exports.getAllReviews = catchAsync( async (req, res, next) => {
    let filter = {};
    
    if(req.params.tourId) filter = { tour: req.params.tourId }; 

    const reviews = await Review.find(filter);
    res.status(200).json({
        status: 'success',
        result: reviews.length,
        data: {
            reviews
        }
    })
});

exports.createReview = catchAsync(async (req, res, neext) =>{
    // ALLOW NESTED ROUTES
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

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