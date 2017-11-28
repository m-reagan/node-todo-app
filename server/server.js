require('./config/config');
const express = require ('express');
const bodyParser = require ('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

var {mongoose} = require('./db/mongoose.connect');
var {Todo} = require('./model/todo');
var {User} = require('./model/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
var port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req,res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });
  todo.save().then((result) => {
    res.send(result);
  }).catch(e => {
    res.status(400).send(e);
  });
});

app.get('/todos', authenticate, (req, res) => {
    Todo.find({
      _creator: req.user._id
    }).then( result => {
    //console.log(result);
      res.send(result);
    }).catch(e => {
      res.status(400).send(e);
    })
});

app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)){
    res.status(404).send();
  }

  Todo.findOne({
    _id: id,
    _creator: req.user._id
    }).then(todo => {
    if(!todo){
       return  res.status(404).send()
    }
    res.send({todo});
  }).catch(e => {
    res.status(404).send();
  });

});

app.delete('/todos/:id' , authenticate, (req, res) => {
    var id = req.params.id;

    if(!ObjectID.isValid(id)){
      res.status(404).send();
    }

    Todo.findOneAndRemove({
      _id: id,
      _creator: req.user._id}).then( todo => {
      if(!todo){
        res.status(404).send();
      }
      res.send({todo});
    }).catch( e => {
      res.status(404).send();
    });
});

app.patch('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)){
    res.status(404).send();
  }

  var body = _.pick(req.body,['text','completed']);
  if(_.isBoolean(body.completed) && body.completed){
    body.completedAt = new Date().getTime();
  }else{
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({
    _id: id,
    _creator: req.user._id},{$set: body},{new:true}).then((todo) => {
      if(!todo){
        res.status(404).send();
      }
      res.send({todo});
  }).catch((e) => {
      res.status(400).send();
  });

});

app.post('/users', (req, res) => {
  var user = new User(req.body);
  user.save().then(() => {
     return user.generateAuthToken();
  }).then( (token) => {
    res.header('x-auth',token).send(user);
  }).catch((e) => {
     res.status(400).send(e);
  });
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req,res) => {
    var body = _.pick(req.body,['email','password']);

    User.findByCredentials(body.email, body.password).then((user) => {
      return user.generateAuthToken().then((token) => {
        res.header('x-auth', token).send(user);
      });
    }).catch( (e) => {
      res.status(400).send();
    });
});

app.delete('/users/logout', authenticate, (req,res) => {
    req.user.removeToken(req.token).then( () => {
      res.send();
    }).catch( (e) => {
      res.status(400).send();
    });
});

app.listen(port, () => {
  console.log(`Server start up successfull on  port ${port}`);
});

module.exports = {app};
