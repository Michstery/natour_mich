const fs = require('fs');
///////////////////////////////////////////
const User = require('../models/userModel');
const AppError = require('../utilities/appError');
const catchAsync = require('../utilities/catchAsync');
const Factory = require('./handlerFactory');


/////////\\\\\\\\\  ~ USERS HANDLER FUNCTIONS ~ ////////////////\\\\\\\\\\\
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.updateMe = catchAsync( async (req, res, next) => {
    // 1) create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError("This route is not for password updates. Use /updatePassword route", 400));
    }

    //2) update user document
    const { name, email } = req.body;
    const filteredBody = {name,email} 
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
})

exports.deleteMe = catchAsync(async (req, res, next) => { 
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getAllUsers = Factory.getAll(User);
exports.getUser = Factory.getOne(User);
exports.deleteUser = Factory.deleteOne(User);
exports.updateUser = Factory.updateOne(User);

// IMPORT DATA INTO DB
exports.importData = async () => {
    const users = JSON.parse(
        fs.readFileSync(`${__dirname}/../dev-data/data/users.json`, 'utf-8')
      );

    try {
      await User.create(users, { validateBeforeSave: false });
      console.log('Data successfully loaded!');
    } catch (err) {
      console.log(err);
    }
    process.exit();
  };
  
  // DELETE ALL DATA FROM DB
  exports.deleteData = async () => {
    try {
      await User.deleteMany();
      console.log('Data successfully deleted!');
    } catch (err) {
      console.log(err);
    }
    process.exit();
  };