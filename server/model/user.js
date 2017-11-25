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

  return User.findOne({
    '_id': decoded._id,
    'tokens.access': 'auth',
    'tokens.token': token
  });

};

userSchema.statics.findByCredentials = function (email,password) {
  var User = this;
  return User.findOne({email}).then ( (user) => {
      if(!user){
        return Promise.reject();
      }

      return new Promise( (resolve, reject) => {
        bcrypt.compare(password, user.password, function (err, res) {
           if(res){
             resolve(user);
           } else {
             reject();
           }
        });
      });
   });
};

userSchema.methods.removeToken = function (token) {
    var user = this;

    return user.update({
      $pull: {
        tokens: {token}
      }
    });
};

userSchema.pre('save', function (next) {
  var user = this;
  if(user.isModified('password')){
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
        user.password = hash;
        next();
    });
   });
  }else{
   next();
  }
});

var User = mongoose.model('User',userSchema);

module.exports = {User};
