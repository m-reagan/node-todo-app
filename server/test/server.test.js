const request = require('supertest');
const expect = require('expect');
const {ObjectID} = require('mongodb');

var {app} = require ('./../server');
var {Todo} = require ('./../model/todo');

var todos = [{
  _id: new ObjectID(),
  text: 'First test do'
},
{
  _id: new ObjectID(),
  text: 'Second test todo'
}];

beforeEach(done => {
  Todo.remove().then(result => {
    Todo.insertMany(todos);
  }).then (result => {
    done();
  });
});

describe('Testing todo POST api', () => {

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

describe ('Test Todo GET API ', () => {
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

describe('Testing Todos DELETE API', () => {
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

describe('Testing PATCH todo api', () => {

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
