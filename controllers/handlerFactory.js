const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');
const APIFeatures = require('../utilities/apiFeatures');



exports.getAll = Model => catchAsync(async (req, res, next)=> {

        // EXECUTE QUERY
        const features = new APIFeatures(Model.find(), req.query).filter().sort().limitFields().paginate();
        //const doc = await features.query.explain();
        const doc = await features.query;

        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                data: doc
            }
        });
});

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

exports.getOne = (Model, populator) =>  catchAsync(async (req, res, next)=>{
        let query = await Model.findById(req.params.id);
        if (populator) query = query.populate(populator);
        const doc = await query;

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

