const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [
      {
        validator: validator.isEmail,
        message: '{VALUE} is not valid email'
      }
    ]
  },
  password: {
    type: String,
    required: true,
    minlength:6
  },
  tokens:[
    {
      access: {
        type: String
      },
      token: {
        type: String
      }
    }
  ]
});

userSchema.methods.generateAuthToken = function  () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(),access},'salt').toString();
  user.tokens.push({access, token});
  return user.save().then(() => {
    return token;
  });
};

userSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id','email']);
};

userSchema.statics.findByToken = function (token) {
  var User = this;
  try{
    var decoded = jwt.verify(token,'salt');
  }catch (e){
    return Promise.reject();
  }

  return User.find({
    '_id': decoded._id,
    'tokens.access': 'auth',
    'tokens.token': token
  });

};

userSchema.pre('save', function (next) {
  var user = this;
  var bcrypt = require('bcryptjs');
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
        user.password = hash;
        next();
    });
  });
});

var User = mongoose.model('User',userSchema);

module.exports = {User};
