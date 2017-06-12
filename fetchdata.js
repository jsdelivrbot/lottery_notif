var request = require('request');
var nodemailer = require('nodemailer');
var ontime = require('ontime');
var mySet = new Set();
var jiji = 0;
var  jiou = 0;
var ouji = 0; 
var ouou = 0;
var threshold = 1;

var smtpTransport = require('nodemailer-smtp-transport');

console.log("inside fetchdata.js");

function parseLotteryData(lottery) {
	var parsedData;
	var datagot = JSON.parse(lottery).data;
	if (datagot.length > 0) {
	     lotterydata = datagot[0];
	     if (Object.keys(lotterydata).length > 0) {
	     	lotterydata._id = lotterydata.expect;
	     	delete lotterydata.expect;
	     	parsedData = lotterydata;
	      }
	}
	return parsedData;
}

function saveDataToDB(data) {
	db.collection('lotterydata').save(response, (err, result) => {
		if (err) return console.log(err);
		
	})
}



process.on('message', (m) => {
	console.log("child process msg:" + m);

	var trhold = parseInt(m);

	threshold = trhold;
	console.log("threshold: " + threshold);
})

function checkInSet(id, data) {
	if (!mySet.has(id)) {
		mySet.add(id);
		parsed = data.split(',');
		if (parsed.length == 5) {
			var four = parsed[3];
			var five = parsed[4];
			if (four%2 == 1 && five%2 == 1) {
				ouou += 1;
				jiou += 1;
				ouji += 1;
			} else if (four%2 == 0 && five%2 == 0) {
				jiji += 1;
				jiou += 1;
				ouji += 1;
			} else if (four%2 == 1 && five%2 == 0) {
				jiji += 1;
				ouji += 1;
				ouou += 1;
			} else if (four%2 == 0 && five%2 == 1) {
				jiji += 1;
				jiou += 1;
				ouou += 1;
			}
		}
	} else {
		console.log("data already fetched");
	}
}

function sendEmail(content, threshold) {

	// var transporter = nodemailer.createTransport(smtpTransport({

	// 		  service: 'Gmail',
	// 		   auth: {
	// 			    XOAuth2: {
	// 			      user: "wanghao313@gmail.com", // Your gmail address.
	// 			                                      // Not @developer.gserviceaccount.com
	// 			      clientId: "580098852229-1m12bmhcklpke8i0ocqfif2lih8ti81n.apps.googleusercontent.com",
	// 			      clientSecret: "G6wYs8oRNBc9dFZ4j4-9vh3D",
	// 			      refreshToken: "1/_12y25rj1xrhYJbJqZjdr9bIrAyiChyQx_wIMCyRrX0"
	// 			    }
 //  				}
	// }));
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    auth: {
        user: 'wanghao313@gmail.com',
        pass: 'jwl12345!'
    }
});

	var mailOptions = {
		  from: 'wanghao313@gmail.com',
		  to: 'wanghao313@126.com',
		  subject: content +  threshold,
		  text: content +  threshold
	};

	transporter.sendMail(mailOptions, function(error, info){
	  if (error) {
	    console.log(error);
	  } else {
	    console.log('Email sent: ' + info.response);
	  }
    }); 

}

function checkThreshold(threshold) {
	if (jiji >= threshold) {
		sendEmail("jiji", threshold);
		jiji = 0;
	}
	if (jiou >= threshold) {
		sendEmail("jiou", threshold);
		jiou = 0;
	}
	if (ouji >= threshold) {
		sendEmail("ouji",threshold);
		ouji= 0;
	}
	if (ouou >= threshold) {
		sendEmail("ouou", threshold);
		ouou = 0;
	}
}

function fetchLotteryData() {
	var url = "http://f.apiplus.net/cqssc-1.json";
	request(url, function (error, response, body) {
    	if (!error && response.statusCode == 200) {
        	parsed = parseLotteryData(body);
 
        	var id = parsed._id;
        	var opencode = parsed.opencode;
        	console.log("id:" + id);
        	console.log(opencode);
        	checkInSet(id, opencode);
        	checkThreshold(threshold);
     	} else {
     		console.log("data not fetched");
     	}
	})
}

ontime({
	cycle: ['03:00', '13:00', '23:00', '33:00', '43:00', '53:00']
}, function(ot) {
	var date = new Date();
	var min = date.getMinutes();
	console.log("current minutes: " + min);
	console.log('10 mins to next run');
	fetchLotteryData();
	ot.done();
	return;
})

