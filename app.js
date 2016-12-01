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

var directory = __dirname;
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
var allFoodList = [];

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
			console.log('dir: ' + directory);
			console.log('dirname: ' + __dirname);
			if (!context.hasOwnProperty('allFoods'))
			{
				// read json files containing foods
				var fs = require('fs');
				var target = JSON.parse(fs.readFileSync(directory + "/public/jsondata/foods.json", 'utf8')).foods;
				for (var j in target)
				{
					var initialNut = target[j].nutrition;
					var nutritionObj = {
						'calories': (initialNut[0].split(" "))[1],
						'fat': (initialNut[1].split(" "))[1],
						'carbohydrate': (initialNut[2].split(" "))[1].substring(0, (initialNut[2].split(" "))[1].length - 1),
						'protein': (initialNut[3].split(" "))[1],
						'cholesterol': (initialNut[4].split(" "))[1],
						'sodium': (initialNut[5].split(" "))[1]
					};
					target[j].nutrition = nutritionObj;
				}
				response.context.allFoods = target;
			}

			res.json(response);
			console.log(JSON.stringify(response, null, 2));
		}
	});
});
