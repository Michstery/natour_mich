const mongoose = require('mongoose');
const dotenv = require('dotenv');
// set port and use app.listen to start the express server

// uncaught exception = error from our code that is not known,
// e.g referring to an undefined value
process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('UNCAUGHT EXCEPTION!!!!  Shutting down.....');
    process.exit(1);
  
})

dotenv.config({ path: './config.env' });
// console.log(process.env);
const app = require('./app');

const DB = process.env.DATABASE;
mongoose.connect(DB, {
    useNewUrlParser: true
    // useCreateIndex: true,
    // useFindAndModify: false
}).then(() => console.log("DB CONNECTED SUCCESSFULLY"))


// const testTour = new Tour({
//     name: 'The Park Camper',
    
//     Price: 997
// });
// testTour.save().then(doc => {
//     console.log(doc);
// }).catch(err => {
//     console.log('ERROR !!!', err)
// })



const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`app is running at port ${port}......`);
});
// unhandled rejections = error from not connecting to DB
process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('UNHANDLED REJECTION!  Shutting down.....');
    server.close(()=>{
        process.exit(1);
    })
})


