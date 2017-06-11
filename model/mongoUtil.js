const MongoClient = require('mongodb').MongoClient;
var mydb = "mongodb://wanghao313:jwl12345!@ds119682.mlab.com:19682/myproject";


var db;

exports.connect =  function(callback) {
		console.log("db started");
		MongoClient.connect(mydb, (err, database) => {
			if (err) callback(err);
			db = database;
			callback();
		});
}

exports.retrieveAllUsers = function(callback) {
	db.collection('users').find().toArray(function(err, result) {
			callback(result);
	});
}
