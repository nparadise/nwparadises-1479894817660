/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());
app.use(express.static("public"));

var watson = require('watson-developer-cloud');

var conversation = watson.conversation({
	username: 'dc86b86e-5f2a-4eef-801e-318469cacdb4',
	password: 'NyuOTaF24WnS',
	version: 'v1',
	version_date: '2016-09-20'
});

// replace with the context obtained from the initial request

app.post("/test", function(req, res){
	console.log(req.body);
	var input_sentence = req.body.input_sentence;
	var context = JSON.parse(req.body.cur_context);
	console.log(input_sentence);
	console.log(context);
	
	conversation.message({ 
		workspace_id: '7a492733-40e3-4f49-8a49-8f99db079c75',
		input: {'text': input_sentence},
		context: context
	}, function(err, response){
		if (err)
			console.log('error:', err);
		else
		{
			res.json(response);
			console.log(JSON.stringify(response, null, 2));
		}
	});
});
