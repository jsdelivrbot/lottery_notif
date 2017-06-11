var express = require('express')
var app = express()
var bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
var request = require('request');

const cp = require('child_process');
childProcess = cp.fork(`${__dirname}/fetchdata.js`);

var threshold = 15;

var urlencodedParser = bodyParser.urlencoded({ extended: false })

var db = require('./model/mongoUtil.js');


db.connect(function() {


	app.listen(3000, () => {
		console.log('listening on 3000')
	})

	app.set('view engine', 'ejs')

	app.set('port', (process.env.PORT || 5000))
	//app.use(express.static(__dirname + '/public'))
	app.use(express.static('public'));

	app.get('/', function(request, response) {

  		response.sendFile("html/" + "index.html");
	})




	app.get('/threshold', function(req, res) {
		res.render('threshold.ejs');
	})

	app.post('/post_threshold', urlencodedParser,function(req, res) {
		threshold_value = req.body.threshold;
		console.log("received threshold:" + threshold_value);
		childProcess.send(threshold_value);
		res.render('thresholdSuccess.ejs');
	});

	app.post('/process_post',  urlencodedParser,function(req, res) {

		response = {
	
			email: req.body.email
		};
		
		//USER_INFO.push(response);
		
		//db.saveAllUsers(response,  callb);	
	})


	app.get('/list_users', function(req, res) {
		console.log("in list users");
		db.retrieveAllUsers(function(result) {
			res.render('index.ejs', {quotes: result});
		})	
	})

	app.listen(app.get('port'), function() {
	  console.log("Node app is running at localhost:" + app.get('port'))
	})

})
