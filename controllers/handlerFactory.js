const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');



exports.createOne = Model =>  catchAsync(async (req, res, next)=>{
        const doc = await Model.create(req.body);
        if(!doc){
            return next(new AppError('No Document Created', 400))
         }
 
        res.status(201).json({
            status:'success',
            data: {
                data: doc
            } 
        })
});

exports.updateOne = Model =>  catchAsync(async (req, res, next)=>{
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if(!doc){
        return next(new AppError('No Document found with this ID', 404))
     }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })  

});

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
   
    const doc = await Model.findByIdAndDelete(req.params.id);
    if(!doc){
        return next(new AppError(`No document found with this ID`, 404))
     }

    res.status(204).json({
        status: 'success',
        data: null
    })

});

