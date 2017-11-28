const {ObjectID} = require ('mongodb');
const jwt = require ('jsonwebtoken');

const {Todo} = require ('./../../model/todo');
const {User} = require ('./../../model/user');

const jwtSecret = process.env.JWT_SECRET;

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [
  {
     _id: userOneId,
     email: 'reagan@gmail.com',
     password: 'password123',
     tokens: [
       {
         access: 'auth',
         token: jwt.sign({_id: userOneId, access: 'auth'}, jwtSecret).toString()
       }
     ]
  },
  {
    _id: userTwoId,
    email: 'reagan2@gmail.com',
    password: 'password123',
    tokens: [
      {
        access: 'auth',
        token: jwt.sign({_id: userTwoId, access: 'auth'}, jwtSecret).toString()
      }
    ]
  }
];

const todos = [{
  _id: new ObjectID(),
  text: 'First test do',
  _creator: userOneId
},
{
  _id: new ObjectID(),
  text: 'Second test todo',
  _creator: userTwoId
}];

var populateTodos = (done) => {
   Todo.remove({}).then ( () => {
    Todo.insertMany(todos).then( () => {
      done();
    });
  });
};

var populateUsers = (done) => {
   User.remove({}).then (() => {
     var userOne = new User(users[0]).save();
     var userTwo = new User(users[1]).save();
     return Promise.all([userOne,userTwo]);
   }).then( ()=> {
     done();
   });
};

module.exports = {
  users,
  todos,
  populateTodos,
  populateUsers
}
