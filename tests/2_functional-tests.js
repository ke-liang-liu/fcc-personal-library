/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var ObjectId = require("mongodb").ObjectID;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done()
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        this.timeout(25000)

        chai.request(server)
          .post('/api/books')
          .send({title: 'bookFunctionalTest2'})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'res.body should be an object');
            assert.property(res.body, 'title', 'Book should contain title');
            assert.property(res.body, 'comments', 'Book should contain comments');
            assert.property(res.body, '_id', 'Book should contain _id');
            assert.isArray(res.body.comments, 'comments field should be an array');
            assert.equal(res.body.title, 'bookFunctionalTest2');
            assert.equal(res.body.commentcount, 0);
            done();
          })
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: ''})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'missing title');  // res.json('missing title');
            done();          
        })
      });
    });

    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'res.body should be an array');
            assert.property(res.body[0], '_id', 'book in array should has _id');
            assert.property(res.body[0], 'title', 'book in array should has title');
            assert.property(res.body[0], 'commentcount', 'book in array should has commentcount');
            done();
        })
      });      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        let _id;
        let invalidId = ObjectId(_id);
        chai.request(server)
          .get('/api/books/' + invalidId)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
            done();
        })
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        let validId = '5ec8e64ca8b45f03f539cf91';
        chai.request(server)
          .get('/api/books/' + validId)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'res.body is an object');
            assert.property(res.body, '_id', 'res.body should have _id field');
            assert.property(res.body, 'title', 'res.body should have body field')
            assert.property(res.body, 'comments', 'res.body should have comments field')
            assert.equal(res.body._id, validId)
            done();
        })
      });
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        this.timeout(3000);
        let _id = '5ec7e0a3360634262e3139f7';
        let validId = ObjectId(_id);
        chai.request(server)
          .post('/api/books/'+ validId)
          .send({_id: validId, comment: 'one comment'})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'res.body should be an object');
            assert.property(res.body, 'comments', 'book should have comments field');
            assert.property(res.body, 'title', 'book should have title field');
            assert.property(res.body, '_id', 'book should have _id field');
            assert.equal(res.body._id, validId);
            assert.isArray(res.body.comments, 'comments should be an array');
            assert.include(res.body.comments, 'one comment', 'comments should include the new comment');
            done();
        })
      });
      
    });

  });

});
