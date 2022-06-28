const fs = require('fs');
///////////////////////////////////////////
const Review = require('../models/reviewModel');
const catchAsync = require('../utilities/catchAsync');
const APIFeatures = require('../utilities/apiFeatures');
//const AppError = require('../utilities/appError');
const Factory = require('./handlerFactory');

exports.getAllReviews = catchAsync( async (req, res, next) => {
    let filter = {};
    if(req.params.tourId) filter = { tour: req.params.tourId }; 
    const features = new APIFeatures(Review.find(filter), req.query).filter().sort().limitFields().paginate();

    const reviews = await features.query;
    res.status(200).json({
        status: 'success',
        result: reviews.length,
        data: {
            reviews
        }
    })
});

exports.setTourUserId = (req, res, next) => {
        // ALLOW NESTED ROUTES
        if (!req.body.tour) req.body.tour = req.params.tourId;
        if (!req.body.user) req.body.user = req.user.id;
        next();
};

exports.createReview = Factory.createOne(Review);
exports.getReview = Factory.getOne(Review);
exports.updateReview = Factory.updateOne(Review);
exports.deleteReview = Factory.deleteOne(Review);


//////////////////////////////////////////////////////////////////
// IMPORT DATA INTO DB
exports.importData = async () => {
    const reviews = JSON.parse(
        fs.readFileSync(`${__dirname}/../dev-data/data/reviews.json`, 'utf-8')
      );

    try {
      await Review.create(reviews, { validateBeforeSave: false });
      console.log('Data successfully loaded!');
    } catch (err) {
      console.log(err);
    }
    process.exit();
  };
  
  // DELETE ALL DATA FROM DB
  exports.deleteData = async () => {
    try {
      await Review.deleteMany();
      console.log('Data successfully deleted!');
    } catch (err) {
      console.log(err);
    }
    process.exit();
  };


//exports.createReview = catchAsync(async (req, res, next) =>{
    //         // ALLOW NESTED ROUTES
    //         if (!req.body.tour) req.body.tour = req.params.tourId;
    //         if (!req.body.user) req.body.user = req.user.id;
    
    //     const newReview = await Review.create(req.body);
    //     if(!newReview){
    //         return next(new AppError('No Review Created', 400))
    //      }
    
    //     res.status(201).json({
    //         status: 'success',
    //         data: {
    //             newReview
    //         }
    //     })
    // });