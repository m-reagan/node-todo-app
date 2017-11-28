const request = require('supertest');
const expect = require('expect');
const {ObjectID} = require('mongodb');

var {app} = require ('./../server');
var {Todo} = require ('./../model/todo');
var {User} = require ('./../model/user');
var {todos, users, populateTodos, populateUsers} = require ('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {

  it('Testing todo POST api', (done) => {
    request(app)
     .post('/todos')
     .set('x-auth',users[0].tokens[0].token)
     .send({
       text:'Testing post api'
     })
     .expect(200)
     .expect( (res) => {
       expect(res.body).toInclude({text:'Testing post api',completed:false})
     })
     .end((err, res) => {
       if(err){
         return done(err);
       }
       Todo.find().then((result) => {
         expect(result.length).toBe(3);
         done();
       }).catch(e => {
         done(e);
       });
     })
  });
});

describe ('GET /Todos', () => {
  it('Test GET all todos', done => {
    request(app)
     .get('/todos')
     .set('x-auth',users[0].tokens[0].token)
     .expect(200)
     .expect(res => {
       expect(res.body.length).toBe(1)
     })
     .end(done);
  });

  it('Test GET todo api by id. Should return todo', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth',users[0].tokens[0].token)
      .expect(200)
      .expect( res => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('Test GET todo api by id. Should not return todo if it is created by some other user', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth',users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('Test GET todo api by id. Id does not exist.', (done) => {
    request(app)
      .get(`/todos/${new ObjectID()}`)
      .set('x-auth',users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('Test GET todo api by id. Invalid object id.', (done) => {
    request(app)
      .get('/todos/adsfsd')
      .set('x-auth',users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

});

describe('DELETE /todo/:id', () => {
  it('Should delete todo if id exist', (done) => {
    request(app)
      .delete(`/todos/${todos[0]._id.toHexString()}`)
      .expect(401)
      .end(done);
  });

  it('Should delete todo if id exist', (done) => {
    request(app)
      .delete(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth',users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text)
      })
      .end(done);
  });

  it('Should not delete todo if the creator is different', (done) => {
    request(app)
      .delete(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth',users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('Should return 404 if id doesn\'t exists in collection', (done) => {
    request(app)
      .delete(`/todos/${new ObjectID()}`)
      .set('x-auth',users[1].tokens[0].token)
      .expect(404)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

  it('Test DELETE todo api by id. Invalid object id.', (done) => {
    request(app)
      .delete('/todos/adsfsd')
      .set('x-auth',users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

});

describe('PATCH /todo/:id', () => {

  var id = todos[0]._id.toHexString();

  it('Should update completedAt if completed', (done) => {
    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth',users[0].tokens[0].token)
      .send({
        text: "First to update",
        completed: true
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe("First to update");
        expect(res.body.todo.completedAt).toBeA('number');
      }).end((err, res) => {
        if(err){
          done(err);
        }
        Todo.findById(id).then(updatedTodo => {
          expect(updatedTodo.text).toBe("First to update");
          expect(updatedTodo.completed).toBeTruthy();
          expect(updatedTodo.completedAt).toBeA('number');
          done();
        }).catch( (e) => {
          done(e);
        });
      });
  });

  it('CompletedAt should not exists if not completed', (done) => {
    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth',users[0].tokens[0].token)
      .send({
        text: "First to update2",
        completed: false
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe("First to update2");
        expect(res.body.todo.completedAt).toNotExist();
      }).end((err, res) => {
        if(err){
          done(err);
        }
        Todo.findById(id).then(updatedTodo => {
          expect(updatedTodo.text).toBe("First to update2");
          expect(updatedTodo.completed).toBeFalsy();
          expect(updatedTodo.completedAt).toNotExist();
          done();
        }).catch( (e) => {
          done(e);
        });
      });
  });

  it('Should not update todo if creator is different', (done) => {
    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth',users[1].tokens[0].token)
      .send({
        text: "First to update",
        completed: true
      })
      .expect(404)
      .end(done);
  });

  it('Should be authorized to update a todo', (done) => {
    request(app)
      .patch(`/todos/${id}`)
      .send({
        text: "First to update",
        completed: true
      })
      .expect(401)
      .end(done);
  });
});

describe('POST /users', () => {
    it('Should create user if valid email is provided', (done) => {
      var email = "andres@gmail.com";
      var password = "password123";

       request(app)
        .post('/users')
        .send({email,password})
        .expect(200)
        .expect( (res) => {
          expect(res.body._id).toExist();
          expect(res.body.email).toBe(email);
          expect(res.header['x-auth']).toExist();
        })
        .end(done);
    });

    it('Should not create user if email is invalid', (done) => {
      var email = "andre";
      var password = "password123";

       request(app)
        .post('/users')
        .send({email,password})
        .expect(400)
        .expect( (res) => {
          expect(res.body._id).toNotExist();
          expect(res.header['x-auth']).toNotExist();
        })
        .end(done);
    });

    it('Should not create user if email is in use', (done) => {
       request(app)
        .post('/users')
        .send({email: users[0].email,password: users[0].password})
        .expect(400)
        .expect( (res) => {
          expect(res.body._id).toNotExist();
          expect(res.header['x-auth']).toNotExist();
        })
        .end(done);
    });
});

describe('POST /users/login', () =>{
  it('should send auth token if credentials are right', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .end((err,res) => {
        if(err){
          return done(err);
        }
        expect(res.header['x-auth']).toExist();

        User.findOne({email: users[1].email}).then( (user) => {
          expect(user.tokens[1]).toInclude({
            access:'auth',
            token: res.headers['x-auth']
          });
          done()
        }).catch ( (e) => done(e));
      })
  });
});

describe('DELETE /users/logout', () =>{
  it('should delete token if authenticated', (done) => {
    request(app)
      .delete('/users/logout')
      .set('x-auth',users[0].tokens[0].token)
      .expect(200)
      .end((err,res) => {
        if(err){
          return done(err);
        }
        expect(res.header['x-auth']).toNotExist();

        User.findOne({email: users[0].email}).then( (user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch ( (e) => done(e));
      })
  });
});
