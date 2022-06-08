const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');
const sendEmail = require('../utilities/email');

const signToken = id => {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

exports.signup = catchAsync(async (req,res,next) => {
    const newUser = await User.create(req.body);
    if(!newUser){
        return next(new AppError('No User Created', 400))
     }

    //  const token = signToken(newUser._id);

     createSendToken(newUser,201,res)

    // res.status(201).json({
    //     status:'success',
    //     token,
    //     data: {
    //         user : newUser
    //     } 
    // })
});

exports.login = catchAsync( async(req,res,next) =>{
    const { email, password } = req.body;

    // 1) check if email and password exist
    if(!email || !password){
       return next(new AppError('Please provide email and password!!!', 400));
    }
    // 2) check if user and password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError('Incorrect email or password', 401))
    }
    // 3) if everything is okay, then send token to client
    // const token = signToken(user._id);
    // res.status(200).json({
    //     status: 'success',
    //     token
    // })
    createSendToken(user,200,res)

});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    // console.log(token);
    if(!token){
        return next(new AppError('You are not logged in! login to gain access',401));
    }
    // 2) Validate token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);

    // 3) check if user still exists
    const freshUser = await User.findById(decoded.id);
    if(!freshUser){
        return next( new AppError('The User belonging to this token does no longer exist!!', 401));
    }
    // 4) check if user changed password after JWT was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password!!, Please Login again', 401))
    };

    // Grant access to the protected route
    req.user = freshUser;
    next();
});

// since it's impossible to pass arguments through a middleware function,
// we simply create a roles array for holding our arg and then pass middleware
exports.restrictTo = (...roles) => {
    return(req, res, next) => {
        // roles [admin, lead-guide]. role='user'
        if(!roles.includes(req.user.role)){
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }
        next();
    }
}

//Password Reset Functionality
exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('There is no user with email address.', 404));
    }
  
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
  
    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
  
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message
      });
  
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
  
      return next(
        new AppError('There was an error sending the email. Try again later!'),
        500
      );
    }
  });


exports.resetPassword = catchAsync( async (req,res,next) => {
    // 1) Get  User based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt:Date.now() } });
    // 2) If token has not expired and there is user, set the new User
    if (!user) {
        return next(new AppError('Token is invalid or has Expired'), 400);
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // 3) Update the changed password

    // 4) Log the user in
    // const token = signToken(user._id);
    // res.status(200).json({
    //     status: 'success',
    //     token
    // })
    createSendToken(user,200,res)
});

exports.updatePassword = catchAsync(async (req,res,next) => {
    //1) Get user from collection
    const user = User.findById(req.user.id).select('+password');
    const { passwordConfirm, password, confirmNewPassword } = req.body;
    
    //2) check if password is correct
    if( !(await user.correctPassword(passwordConfirm, user.password))){
        return next(new AppError('Incorrect email or password', 401))
    }

    //3) if so update the user
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();
    // note: user.findByIdAndUpdate will not work as intended

    //4) log User in, send  JWT
    createSendToken(user,200,res)
})