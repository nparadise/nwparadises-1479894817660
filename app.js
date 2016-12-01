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
			res.json(response);
			console.log(JSON.stringify(response, null, 2));
		}
	});
});

const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');

// Bootstrap application settings
require(directory + '/config/express.js')(app);

const textToSpeech = new TextToSpeechV1({
  // If unspecified here, the TEXT_TO_SPEECH_USERNAME and
  // TEXT_TO_SPEECH_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  // username: '<username>',
  // password: '<password>',
});

app.get('/', (req, res) => {
  res.render('index');
});

/**
 * Pipe the synthesize method
 */
app.get('/api/synthesize', (req, res, next) => {
  const transcript = text_to_speech.synthesize(req.query);
  transcript.on('response', (response) => {
    if (req.query.download) {
      if (req.query.accept && req.query.accept === 'audio/wav') {
        response.headers['content-disposition'] = 'attachment; filename=transcript.wav';
      } else {
        response.headers['content-disposition'] = 'attachment; filename=transcript.ogg';
      }
    }
  });
  transcript.on('error', next);
  transcript.pipe(res);
});

// error-handler settings
require('./config/error-handler')(app);

module.exports = app;