// since we're not using a real db, we'll be reading from a file using fs
// const fs = require('fs');
// require express after npm i express
const express = require('express');
const morgan = require('morgan');
const AppError = require('./utilities/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');


// MIDDLEWARE
// set express call to app
const app = express();



// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}


// in order to carry out some post req we need a JSON middleware
app.use(express.json());
app.subscribe(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    
    next();
})

//         ~  Routes  ~
/////////\\\\\\\\\  ~ TOURS ROUTES ~ ////////////////\\\\\\\\\\\
app.use('/api/v1/tours', tourRouter);
/////////\\\\\\\\\  ~ USERS ROUTES ~ ////////////////\\\\\\\\\\\
app.use('/api/v1/users', userRouter);

//======== Handling unhandled Route ======
app.all('*', (req, res, next)=> {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server!!`
    // });
    // const err = new Error(`Can't find ${req.originalUrl} on this server!!`);
    // err.status = 'fail';
    // err.statusCode = 404;

    next(new AppError(`Can't find ${req.originalUrl} on this server !`, 404));
});
// Global Error Handling Function
app.use(globalErrorHandler);


// set an app get request with route '/', and 2 args req & res
// app.get('/', (req, res)=>{
    // we use  .send for sending the strings alone
    // res.status(200).send('Hello from the server side');
    // we can also use .json, it's much better and it sends a json object
//     res.status(200).json({ message: 'Hello from the server side', app: 'Natours' })
// });

// app.post('/', (req, res)=>{
//     res.send('You can post to this endpoint')
// })

// real work starts here

// convert file we'll be using into JSON format
// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
// );

//===========refactoring our code by seperating handler functions from the routes========
//=============== ~Handler functions ===============



////////\\\\\\\   EXPORT APP TO SERVER ////////\\\\\\\

module.exports = app;