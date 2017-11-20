const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

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
  console.log(userObject);

  return _.pick(userObject, ['email']);
};

var User = mongoose.model('User',userSchema);

module.exports = {User};
