const MongoClient = require('mongodb').MongoClient;
const Server = require('mongodb').Server;
const MongoUri = "mongodb://localhost:27017/";

var db = null;

function connect(callback) {
    MongoClient.connect(MongoUri, function(err, database) {
      if(err) {
        callback(err) ;
        return; 
      }
      db = database.db('calc');
      callback();
  });
}

function getCalcStateByUsername(user, callback) {
  db.collection('state').findOne({'user':user}, callback);
}

function setCalcState(user, a, b, opr, callback) {
  db.collection('state').update({ user: user }, 
    { 'user': user, 'a':a, 'b':b, 'opr':opr},
    { upsert: true }, callback);
}

exports.getCalcStateByUsername = getCalcStateByUsername;
exports.setCalcState = setCalcState;
exports.connect = connect;
