const fs = require('fs');
const multer = require('multer');
///////////////////////////////////////////
const User = require('../models/userModel');
const AppError = require('../utilities/appError');
const catchAsync = require('../utilities/catchAsync');
const Factory = require('./handlerFactory');

/////////////////        IMAGE UPLOAD WITH MULTER      ///////////////////
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    //user-(userId)123456-(date)12032022.jpegg(file extension)
    const extension = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
  }
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')){
    cb(null, true)
  } else {
    cb(new AppError('Not an Image! Please upload only images.', 400), false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.uploadUserPhoto =  upload.single('photo');

/////////\\\\\\\\\  ~ USERS HANDLER FUNCTIONS ~ ////////////////\\\\\\\\\\\
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.updateMe = catchAsync( async (req, res, next) => {
    console.log(req.file);
    console.log(req.body); 
    // 1) create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError("This route is not for password updates. Use /updatePassword route", 400));
    }

    //2) update user document
    const { name, email } = req.body;
    const filteredBody = { name,email } 
    if (req.file) filteredBody.photo = req.file.filename;
    console.log(filteredBody.photo)
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