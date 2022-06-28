// since we're not using a real db, we'll be reading from a file using fs
const fs = require('fs');
// we require the tour db from the tour model file
const Tour = require('../models/tourModel');
const APIFeatures = require('../utilities/apiFeatures');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');
const Factory = require('./handlerFactory');


// convert file we'll be using into JSON format
// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

/////////\\\\\\\\\\\ middleware to check the id for err ////////////\\\\
// exports.checkId = (req, res, next, val) => {
//     console.log(`Tour id is : ${val}`)
//     if(req.params.id * 1 > tours.length){
//         // if(!tour){
//         return res.status(404).json({
//             status: 'failed',
//             message: 'Invalid ID'
//         });
//     }
    
//     next()
// };
///////\\\\\\\\\ middleware to check for data in the body ////////\\\\\\\\
// exports.checkBody = (req, res, next) => {
//     if ( !req.body.name || !req.body.price ){
//         return  res.status(400).json({
//             status: 'failed',
//             message: 'Missing Name or Price field'
//         });
//     }
//     next()
// }

/////////\\\\\\\\\  ~ TOURS HANDLER FUNCTIONS ~ ////////////////\\\\\\\\\\\

//-------- Middle ware ------------
exports.aliasTopTours = (req, res, next) => {
    // amount/ limit of items to be displayed per page
    req.query.limit = '5';
    // arrange in ascending/descending price and ratingAverage
    req.query.sort = '-ratingsAverage,price';
    //fields to be displayed from query
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}
//-------- Middle ware ------------




exports.getAllTours = catchAsync(async (req, res, next)=>{
// try{
   
    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
    const tours = await features.query;

    // const tours = await Tour.find({
    //     duration: 5,
    //     difficulty: 'easy'
    // });
    // const tours = await Tour.find();
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    });
// } catch(err){
//     res.status(404).json({
//         status: 'fail',
//         message: err
//     })
// }
});





exports.getTour = catchAsync(async (req, res, next)=>{
    // try{
        const tour = await Tour.findById(req.params.id).populate('reviews');
        if(!tour){
            //for all :id routes patch,delete e.t.c it majorly handles their err
           return next(new AppError('No Tour found with this ID', 404))
        }
        // Tour.findOne({ _id: req.params.id })
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    // }catch(err){
    //     res.status(404).json({
    //         status: 'fail',
    //         message: err
    //     })
    // }


});

exports.createNewTour = Factory.createOne(Tour);
exports.updateTour = Factory.updateOne(Tour);
exports.deleteTour = Factory.deleteOne(Tour);

// exports.createNewTour =  catchAsync(async (req, res, next)=>{
//     // try{
//         const newTour = await Tour.create(req.body);
//         if(!newTour){
//             return next(new AppError('No Tour Created', 400))
//          }
 
//         res.status(201).json({
//             status:'success',
//             data: {
//                 tour : newTour
//             } 
//         })
//     // } catch(err){
//     //     res.status(400).json({
//     //         status: 'fail',
//     //         message: err
//     //     })
//     // }


// });

// exports.updateTour = catchAsync(async (req, res, next)=>{
// //     if(req.params.id * 1 > tours.length){
// //         return res.status(404).json({
// //         status: 'failed',
// //         message: 'Invalid ID'
// //     })
// // }
//     // try{
//         const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//             new: true,
//             runValidators: true
//         });
//         if(!tour){
//             return next(new AppError('No Tour found with this ID', 404))
//          }

//         res.status(200).json({
//             status: 'success',
//             data: {
//                 tour
//             }
//         })
//     // } catch(err){
//     //     res.status(404).json({
//     //         status: 'fail',
//     //         message: err
//     //     })
//     // }


// });


// exports.deleteTour = catchAsync(async (req, res, next)=>{
// //     if(req.params.id * 1 > tours.length){
// //         return res.status(404).json({
// //         status: 'failed',
// //         message: 'Invalid ID'
// //     })
// // }
//     // try{
//         const tour = await Tour.findByIdAndDelete(req.params.id);
//         if(!tour){
//             return next(new AppError('No Tour found with this ID', 404))
//          }

//         res.status(204).json({
//             status: 'success',
//             data: null
//         })
//     // }catch(err){
//     //     res.status(404).json({
//     //         status: 'fail',
//     //         message: err
//     //     })
//     // }



// });

exports.getTourStats = catchAsync(async (req, res, next)=>{
    // try{
        //using mongo aggregate pipeline to get the stat of our db
        const stats = await Tour.aggregate([
            {  //we use the $match aggregate to get the average of $gte equals >/= value,
              //we also have $gt(>),$lt(<),$lte(</=)
                $match:  { ratingsAverage: {$gte: 4.5} }
            },

            { // the $group gives us an aggregate of max, min or average value in d DB
                $group: {
                    // categorize DB using difficulty, set to uppercase using $toUpper operator
                    _id: {$toUpper: '$difficulty' },
                    //total number of tours using $sum operator
                    numTours: { $sum: 1 },
                    //total number of ratings
                    numRating: { $avg: '$ratingsQuantity' },
                    //average of ratingsAverage DB entries using $avg operator
                    avgRating: { $avg: '$ratingsAverage' },
                    //average of price DB entries
                    avgPrice: { $avg: '$price' },
                    //minimum price in DB entries
                    minRating: { $min: '$price' },
                    //maximum price in DB entries
                    maxRating: { $max: '$price' }
    
                }
            },

            {   // we arrange our list according to descending order of avgPrice
                $sort: {avgPrice: 1}
            }

            
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        });

    // }catch(err){
    //     res.status(404).json({
    //         status: 'fail',
    //         message: err
    //     })
    // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next)=>{
    // try{
       const year = req.params.year * 1; //2021

       const plan = await Tour.aggregate([
           {

            $unwind: '$startDates'
           },

           {
               $match: {
                   startDates: {
                       $gte: new Date(`${year}-01-01`),
                       $lte: new Date(`${year}-12-31`)
                   }
               }
           },

           {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
           },

           {// it adds a new field to our dB
               $addFields: { month: '$_id'  }
           },

           {
               $project: {
                   _id: 0
               }
           },

           {// simply sorts the dB in ascending or descending order
               $sort: { numTourStarts: -1 }
           },

           {// like query it sets the amount of items displayed
               $limit: 12
           }
       ])

        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        });

    // }catch(err){
    //     res.status(404).json({
    //         status: 'fail',
    //         message: err
    //     })
    // }
});




// IMPORT DATA INTO DB
exports.importData = async () => {
    const tours = JSON.parse(
        fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`, 'utf-8')
      );

    try {
      await Tour.create(tours);
      console.log('Data successfully loaded!');
    } catch (err) {
      console.log(err);
    }
    process.exit();
  };
  
  // DELETE ALL DATA FROM DB
  exports.deleteData = async () => {
    try {
      await Tour.deleteMany();
      console.log('Data successfully deleted!');
    } catch (err) {
      console.log(err);
    }
    process.exit();
  };