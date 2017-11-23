const request = require('supertest');
const expect = require('expect');
const {ObjectID} = require('mongodb');

var {app} = require ('./../server');
var {Todo} = require ('./../model/todo');
var {todos, users, populateTodos, populateUsers} = require ('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {

  it('Testing todo POST api', (done) => {
    request(app)
     .post('/todos')
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
     .expect(200)
     .expect(res => {
       expect(res.body.length).toBe(2)
     })
     .end(done);
  });

  it('Test GET todo api by id. Should return todo', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect( res => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('Test GET todo api by id. Id does not exist.', (done) => {
    request(app)
      .get(`/todos/${new ObjectID()}`)
      .expect(404)
      .end(done);
  });

  it('Test GET todo api by id. Invalid object id.', (done) => {
    request(app)
      .get('/todos/adsfsd')
      .expect(404)
      .end(done);
  });

});

describe('DELETE /todo/:id', () => {
  it('Should delete todo if id exist', (done) => {
    request(app)
      .delete(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text)
      })
      .end(done);
  });

  it('Should return 404 if id doesn\'t exists in collection', (done) => {
    request(app)
      .delete(`/todos/${new ObjectID()}`)
      .expect(404)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

  it('Test DELETE todo api by id. Invalid object id.', (done) => {
    request(app)
      .get('/todos/adsfsd')
      .expect(404)
      .end(done);
  });

});

describe('PATCH /todo/:id', () => {

  var id = todos[0]._id.toHexString();

  it('Should update completedAt if completed', (done) => {
    request(app)
      .patch(`/todos/${id}`)
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
