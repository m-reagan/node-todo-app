const express = require ('express');
const bodyParser = require ('body-parser');

var {mongoose} = require('./mongoose.connect');
var {Todo} = require('./../model/todo');

var app = express();

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

app.listen(process.argv.PORT || 3000, () => {
  console.log('Server start up successfull');
});

module.exports = {app};
