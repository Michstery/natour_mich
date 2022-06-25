const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A TOUR must have a NAME'],
        unique: true,
        trim: true,
        maxlength: [40, 'A Tour Name must have less or equal than 40 characters'],
        minlength: [10, 'A Tour Name must have greater or equal than 10 characters'],
        // validate: [validator.isAlpha, 'Tour name must only contain characters']
        // for demonstration on using validator package
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A TOUR must have a DURATION']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A TOUR must have a GROUP SIZE']
    },
    difficulty: {
        type: String,
        required: [true, 'A TOUR must have a DIFFICULTY'],
        enum: { 
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },

    ratingsAverage: {
        type: Number,
        default: 4.5,
        maxlength: [5, 'A Rating must be below 5'],
        minlength: [1, 'A Rating must be above 1']
    },
    ratingsQuantity: {
        type: Number,
        default: 4.5
    },
    price: {
        type: Number,
        required: [true, 'A TOUR must have a PRICE']
    },
    priceDiscount: {
       type: Number,
       validate: {
           validator:  function(val){
            // will not work in update, only create
            return val < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price"
       }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A TOUR must have a SUMMARY']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required:[true, 'A TOUR must have an IMAGE COVER']
    },
    images:[String],
    createdAt: {
        type: Date,
        default: Date.now(),
        //to exclude a field from being shown, simply select property to false
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        // GeoJSON, for geospatial(location) data type
        // for this type of data we need type and we need coordinate
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
        
    },
    location: [
        {
            startLocation: {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point']
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number
        }
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
},
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    

});

//define a virtual property, a field that is temporary and does not store in DB
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration /7;
});

// virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
  });

// DOCUMENT MIDDLEWARE: runs before .save and .create() .
tourSchema.pre('save', function(next){
  
    this.slug = slugify(this.name, {lower: true});
    next();
});

// tourSchema.pre('save', async function(next){
//     const guidesPromises = this.guides.map(async id  => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next()
// })

//DOCUMENT MIDDLEWARE: POST Hook mongoose middleware
// tourSchema.post('save', function(doc, next){
//     console.log(doc);
//     next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function(next){
    tourSchema.pre(/^find/, function(next){
    this.find({ secretTour: { $ne: true } });

    this.start = Date.now();
    next();
    })

    tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt -passwordResetExpires -passwordResetToken '
    });
        
    next()
    })

tourSchema.post(/^find/, function(docs, next){
    console.log(`Query took ${Date.now() - this.start} milliseconds!`)
    // console.log(docs);
    next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next){
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    console.log(this.pipeline());
    next();
})

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;