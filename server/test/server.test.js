const request = require('supertest');
const expect = require('expect');

var {app} = require ('./../server');
var {Todo} = require ('./../../model/todo');

beforeEach(done => {
  Todo.remove().then(result => {
    //console.log('clearing everything');
    Todo.insertMany([{
      text: 'First test do'
    },
    {
      text: 'Second test todo'
    }]);
  }).then (result => {
    done();
  });
});

describe('Testing todo apis', () => {

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

  it('Test GET todos', done => {
    request(app)
     .get('/todos')
     .expect(200)
     .expect(res => {
       expect(res.body.length).toBe(2)
     })
     .end(done);
  });
});
