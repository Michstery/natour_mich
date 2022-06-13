const User = require('../models/userModel');
const AppError = require('../utilities/appError');
const catchAsync = require('../utilities/catchAsync');


/////////\\\\\\\\\  ~ USERS HANDLER FUNCTIONS ~ ////////////////\\\\\\\\\\\
exports.getAllUsers = catchAsync(async(req, res) => {
    const users = await User.find();
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    });
});

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

exports.createNewUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined yet'
    })
}

exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined yet'
    })
}

exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined yet'
    })
}

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false })

    res.status(204).json({
        status: 'success',
        data: null
    });
});
