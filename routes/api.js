/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;

var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
        const db = client.db('test2') //test2 is the database name
        db.collection('book').find({}, {title: 1, commentcount:1})
          .toArray((err, docs) => {
            if (err) { console.log(err) }
            res.json(docs);
            db.close();
          })
      })
    })
    
    .post(function (req, res){
      //response will contain new book object including atleast _id and title
      var title = req.body.title;
      console.log('the title is: ' + title);
      if (title.trim() == '') { 
        res.json('missing title');
        return;  // must add return. otherwise the program will continue forward
      }
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
        const db = client.db('test2') //test2 is the database name
        let new_book = {
          title: title,
          comments: [String],
          commentcount: 0
        }
        db.collection('book').insertOne(new_book)
          .catch(err => console.error(`Failed to insert item: ${err}`))
          .then(result => {
            console.log(`Successfully inserted item with _id: ${result.insertedId}`);
            res.json(result.ops[0]);
            db.close;
          })
          
      });
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
        const db = client.db('test2');
        db.collection('book').deleteMany({}, function(err, docs) {
          if (err) {
            res.json(err);
          } else if (docs.result.n > 0) {
            res.json('complete delete successful');
          } else {
            res.json('complete delete unsuccessful');
          }
          db.close();
        })
      })

    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = ObjectId(req.params.id);
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
        const db = client.db('test2');
        db.collection('book').findOne({ _id: bookid}, {title: 1, comments: 1}, function(err, doc) {
          if (err) { res.json(err) }
          if (doc == null) {
            res.json('no book exists')
          } else {
            res.json(doc);            
          }
          db.close();
        })
      })
    
    })
    
    .post(function(req, res){
      var bookid = ObjectId(req.params.id);
      var comment = req.body.comment;
      //json res format same as .get
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
        const db = client.db('test2');
        db.collection('book').findOneAndUpdate(
          {_id: bookid}, 
          {
            $push: { comments: comment },
            $inc:  { commentcount: 1}
          }, 
          { returnOriginal: false } , function(err, docs) {
            if (err) { console.log(err) };
            res.json(docs.value);
            db.close();
          })
        
      })  
    
    })
    
    .delete(function(req, res){
      var bookid = ObjectId(req.params.id);
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
        const db = client.db('test2');
        db.collection('book').deleteOne({ _id: bookid}, function(err, result) {
          if (err) { 
            res.json(err);
          };
          if (result.deletedCount === 0) {
            res.json('delete failed');
          } else {
            res.json('delete successful');
          }
          db.close();
        })
      })
    });
};
