require('./config/config');
const express = require ('express');
const bodyParser = require ('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

var {mongoose} = require('./db/mongoose.connect');
var {Todo} = require('./model/todo');


var app = express();
var port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', (req,res) => {
  var todo = new Todo(req.body);
  todo.save().then((result) => {
    res.send(result);
  }).catch(e => {
    res.status(400).send(e);
  });
});

app.get('/todos', (req, res) => {
    Todo.find().then( result => {
    //console.log(result);
      res.send(result);
    }).catch(e => {
      res.status(400).send(e);
    })
});

app.get('/todos/:id', (req, res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)){
    res.status(404).send();
  }

  Todo.findById(id).then(todo => {
    if(!todo){
       return  res.status(404).send()
    }
    res.send({todo});
  }).catch(e => {
    res.status(404).send();
  });

});

app.delete('/todos/:id' , (req, res) => {
    var id = req.params.id;

    if(!ObjectID.isValid(id)){
      res.status(404).send();
    }

    Todo.findByIdAndRemove(id).then( todo => {
      if(!todo){
        res.status(404).send();
      }
      res.send({todo});
    }).catch( e => {
      res.status(404).send();
    });
});

app.patch('/todos/:id', (req, res) => {
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

  console.log(body);
  Todo.findByIdAndUpdate(id,{$set: body},{new:true}).then((todo) => {
      if(!todo){
        res.send(404).send();
      }
      res.send({todo});
  }).catch((e) => {
      res.status(400).send();
  });

});

app.listen(port, () => {
  console.log(`Server start up successfull on  port ${port}`);
});

module.exports = {app};
