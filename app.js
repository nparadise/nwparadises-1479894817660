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

var totalFoodList = [];
var totalFoods = function() {
	// read json files containing foods
	var fs = require('fs');
	var path = require('path');
	var dirPath = '/public/jsondata';
	var fileType = '.json';
	var files = [];
	fs.readdir(dirPath, function(err, list)
	{
		if (err)
			console.log('error:', err);
		else
		{
			for (var i = 0; i < list; i++)
			{
				if (path.extname(list[i]) === fileType)
				{
					console.log(list[i]);
					files.push(list[i]);
				}
			}
		}
	});

	var i = -1;
	for (var i = 0; i < files.length; i++)
	{
		var target = JSON.parse(fs.readFileSync(files[i], 'utf8')).answer_units;
		for (var j in target)
		{
			if (target[j].title === 'recipe') continue;
			if (target[j].parent_id === "")
			{
				var insertingObj = {
					'name': target[j].title;
				};
				totalFoodList.push(insertingObj);
				i++;
			} 
			else if (target[j].title === 'Nutrition')
			{
				var nutritionText = target[j]['content'][0]['text'].split(" ");
				var nutritionObj = {
					calories: nutritionText[1],
					fat: nutritionText[5],
					carbohydrate: nutritionText[9].substring(0, nutritionText[9].length - 1),
					protein: nutritionText[12],
					cholesterol: nutritionText[16],
					sodium: nutritionText[20]
				};
				totalFoodList[i].nutrition = nutritionObj;
			}
			else if (target[j].title === 'Ingredients List')
			{
				var ingrText = target[j]['content'][0]['text'].split(" ");
				var getRidOfAd = [];
				for (var idx in ingrText)
				{
					if (ingrText[idx] === 'ADVERTISEMENT') continue;
					getRidOfAd.push(ingrText[idx]);
				}
				totalFoodList[i].ingredients = getRidOfAd.join(" ");
			}
			else if (target[j].title === 'Directions')
				totalFoodList[i].directions = target[j]['content'][0]['text'];
		}
	}
}

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
			if (!context.hasOwnProperty('allFoods'))
			{
				totalFoods();
				response.context.allFoods = totalFoodList;
			}

			res.json(response);
			console.log(JSON.stringify(response, null, 2));
		}
	});
});
