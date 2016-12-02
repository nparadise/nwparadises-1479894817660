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

var text_to_speech = watson.text_to_speech({
	username: '6f517a2d-1082-4ced-9567-1c5de272f49b',
	password: 'ztMYjoTIJkgO',
	version: 'v1'
});

var tone_analyzer = watson.tone_analyzer({
  username: 'f5013813-b539-4ebc-956e-a7e30a6a8ab8',
  password: 'QWKZ8IKtbA3U',
  version_date: '2016-05-19'
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
			if (!context.hasOwnProperty('allFoods'))
			{
				// read json files containing foods
				var fs = require('fs');
				var target = JSON.parse(fs.readFileSync(directory + "/public/jsondata/foods.json", 'utf8')).foods;
				for (var j in target)
				{
					if (!target[j].hasOwnProperty('nutrition')) continue;
					var initialNut = target[j].nutrition,
						calories = initialNut[0].split(" "),
						fat = initialNut[1].split(" "),
						carbohydrate = initialNut[2].split(" "),
						protein = initialNut[3].split(" "),
						cholesterol = initialNut[4].split(" "),
						sodium = initialNut[5].split(" ");
					var nutritionObj = {
						'calories': calories[1],
						'fat': fat[1],
						'carbohydrate': carbohydrate[1].substring(0, carbohydrate[1].length - 1),
						'protein': protein[1],
						'cholesterol': cholesterol[1],
						'sodium': sodium[1]
					};
					target[j].nutrition = nutritionObj;
				}
				response.context.allFoods = target;
				console.log(target.length);
			}

			tone_analyzer.tone({ text: input_sentence }, //ajax에서 request
			  function(err, tone) {
			    if (err)
			      console.log(err);
			    else
			    {
			      var emotion_obj1 = JSON.stringify(tone, null, 2);
			      var emotion_obj2 = JSON.parse(emotion_obj1);
			      var anger = emotion_obj2.document_tone.tone_categories[0].tones[0].score;
			      var disgust = emotion_obj2.document_tone.tone_categories[0].tones[1].score;
			      if(anger >=0.5 || disgust >=0.5)
			      {
			        console.log("I think you are very disappointed with my suggestions."); 
			        response.context.angry = true;
			      } else {
			      	response.context.angry = false;
			      }
			    }
			});

			res.json(response);
			console.log(JSON.stringify(response, null, 2));
		}
	});
});

var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
var fs = require('fs');

var text_to_speech = new TextToSpeechV1({
  username: '6f517a2d-1082-4ced-9567-1c5de272f49b',
  password: 'ztMYjoTIJkgO'
});

var params = {
  text: 'Hello from IBM Watson',
  voice: 'en-US_AllisonVoice', // Optional voice
  accept: 'audio/wav'
};

// Pipe the synthesized text to a file
text_to_speech.synthesize(params).pipe(fs.createWriteStream('output.wav'));

app.get('/api/synthesize', function(req, res, next) {
  var transcript = text_to_speech.synthesize(req.query);
  transcript.on('error', next);
  transcript.pipe(res);
});