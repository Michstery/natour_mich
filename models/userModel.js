const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Enter your Name'],
        // unique: true,

    },
    email: {
        type: String,
        required: [true, 'Please Enter your Email'] ,
        unique: true,
        lowercase: true,
        //from the validator module: checks if its a valid email
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false,
        match: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
        // this only works on create and save
        //created our own validator func that compares both passwords
            validator: function(el) {
                return el === this.password; // i.e password === passworsConfirm
            },
            message: 'passwords are not the same'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken : String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
      }
});

// document pre middleware
userSchema.pre('save', async function(next) {
    //Only run if password was actually modified
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
})

userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
})

//pre query middleware for find, so befor u find an item it must be active,
//deleted != active.
userSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });
    next();
})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword); 
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
  
      return JWTTimestamp < changedTimestamp;
    }
  
    // False means NOT changed
    return false;
  };

  userSchema.methods.createPasswordResetToken = function() {
      //changedd from 32 to 4   EXPERIMENT OOO !!!!!
    //const resetToken = crypto.randomBytes(2).toString('hex');
    Math.random(1)
    resetToken
  
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    console.log({ resetToken }, this.passwordResetToken);
  
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
    return resetToken;
  };

const User = mongoose.model('User', userSchema);

module.exports = User;