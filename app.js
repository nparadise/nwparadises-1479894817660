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

// base directory of this file
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

app.use(bodyParser.urlencoded({
    extended: true
}));
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
    username: '5d6812dc-d371-492f-a265-1d9f1f5bcc45',
    password: 'LQpaYHcJyqXM',
    version: 'v3',
    version_date: '2016-05-19'
});

var natural_language_classifier = watson.natural_language_classifier({
    username: 'fd8f4926-9fa1-48c5-bc1e-138b175605a9',
    password: 'ijyZRnqZYcks',
    version: 'v1'
});

var tradeoff_analytics = watson.tradeoff_analytics({
  username: '87172859-e18c-4bc5-8dcd-6eca8e51e61d',
  password: 'exX3L0bJuSVU',
  version: 'v1'
});

// replace with the context obtained from the initial request
var allFoodList = [];
var intent2check = ['Next_foods', 'Events', 'Time', 'Health'];
var prev_intent = '';
var current_intent = '';

// read json files containing foods
var fs = require('fs');
var target = JSON.parse(fs.readFileSync(directory + "/public/jsondata/100/foods.json", 'utf8')).foods;
for (var j in target) {
    if (!target[j].hasOwnProperty('nutrition')) continue;
    // fix the nutrition information
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

app.post("/start", function(req, res) {
    console.log(req.body);
    console.log('start');
    conversation.message({
        workspace_id: '7a492733-40e3-4f49-8a49-8f99db079c75'
    }, function(err, response) {
        if (err)
            console.log('error:', err);
        else {
            console.log(response);
            response.context.allFoods = target;
            res.json(response);
        }
    });
});

var options = new Array();
var newOp = {
	'type':'numeric', 
	"is_objective": true
};
var isSysNum = false;
var isMin = true;
var isLM = false;
var theme_intent = '';
var classifyingDeterminator = JSON.parse(fs.readFileSync(directory + '/intentClassifyingData.json', 'utf8'));
app.post("/test", function(req, res) {
    console.log(req.body);
    var input_sentence = req.body.input_sentence;
    var context = JSON.parse(req.body.cur_context);
    console.log(input_sentence);
    //console.log(context);

    natural_language_classifier.classify({
        text: input_sentence,
        classifier_id: 'b7339ax137-nlc-597'
    }, function(err, nlcResponse) {
        if (err)
            console.log('error:', err);
        else {
            console.log('nlc start');
            var curClass = nlcResponse.classes[0].class_name;
            if (classifyingDeterminator.main.indexOf(curClass) > -1) {
                console.log('main conversation');
                conversation.message({
                    workspace_id: '7a492733-40e3-4f49-8a49-8f99db079c75',
                    input: {
                        'text': input_sentence
                    },
                    context: context
                }, function(err, response) {
                    if (err)
                        console.log('error:', err);
                    else {
                        console.log(response);
                        if (response.intents.length > 0)
                            current_intent = response.intents[0].intent;
                        	theme_intent = response.intents[0].intent;
                        tone_analyzer.tone({
                            text: input_sentence
                        }, function(err, tone) {
                            if (err)
                                console.log(err);
                            else {
                                var save_anger = false;
                                // check only when previous intent is about specific food category: health, time, cuisine, and events
                                if (intent2check.indexOf(prev_intent) > -1 && response.context.next === false) {
                                    var emotion_obj1 = JSON.stringify(tone, null, 2);
                                    var emotion_obj2 = JSON.parse(emotion_obj1);
                                    var anger = emotion_obj2.document_tone.tone_categories[0].tones[0].score;
                                    var disgust = emotion_obj2.document_tone.tone_categories[0].tones[1].score;
                                    var agreeableness = emotion_obj2.document_tone.tone_categories[2].tones[3].score;
                                    var sadness = emotion_obj2.document_tone.tone_categories[0].tones[4].score;
                                    if (anger >= 0.5 || disgust >= 0.5 || agreeableness <= 0.5) {
                                        console.log("I think you are very disappointed with my suggestions.");
                                        save_anger = true;
                                        response.context.next = true;
                                    } else {
                                        save_anger = false;
                                    }
                                }
                            }
                            response.context.anger = save_anger;
                            response.context.main = true;
                            prev_intent = current_intent;
                            res.json(response);
                            //console.log(JSON.stringify(response, null, 2));
                        });
                    }
                });
            } else {
            	console.log('sub conversation');
                conversation.message({
                    workspace_id: '671b4b13-362b-4cc5-b6b4-f8dea9f33908',
                    input: {
                        'text': input_sentence
                    },
                    context: context
                }, function(err, response) {
                    if (err)
                        console.log(err);
                    else {
                        console.log(response);
                        response.context.main = false;

                        console.log("in tradeoff");
                        
                        if (isSysNum) {
                        	var enti = response.entities;
                    		for (var e in enti) {
	                    		if (enti[e].entity === 'nutrition') {
	                    			newOp['key'] = enti[e].value;
	                    		} else if (enti[e].entity === 'sys-number') {
	                    			newOp['range'] = {}
	                    			if (isMin) {
		                        		newOp['range']['low'] = 0;
		                        		newOp['range']['high'] = parseInt(response.entities[0].value);
		                        	} else {
		                        		newOp['range']['low'] = parseInt(response.entities[0].value);
		                        		newOp['range']['high'] = 3000;
		                        	}
	                    		}
                        	}
                        	isSysNum = false;
                        	console.log("add SysNum:\n" + JSON.stringify(newOp, null, 2));
                        	options.push(newOp);
                        	newOp = {
								'type':'numeric', 
								"is_objective": true
							};
                        } else if (response.intents[0].intent === 'negative') {
                        	console.log("adding option phase is end. send query\n");
                        	if (theme_intent === "") {
                        		var params = require("./public/jsondata/ta/foods_100_problem.json");
                        	} else {
                        		var params = require("./public/jsondata/ta/" + entity + "_" + category + "_100_problem.json");
                        	} 	
      
                        	for (op in options) {
                        		params['columns'].push(options[op]);
                        	}
                        	console.log(JSON.stringify(params['columns'], null, 2));
                        	tradeoff_analytics.dilemmas(params, function(error, resol) {
								if (error)
									console.log('error:', error)
								else {
									//console.log(JSON.stringify(resol, null, 2));

									var result = {
										"recommand":[]
									};
									//console.log(JSON.stringify(resol['resolution']['solutions'], null, 2));
									var sol = resol['resolution']['solutions'];
									for (var i in sol) {
										console.log(JSON.stringify(sol[i], null, 2));
										if (sol[i]['status'] === 'FRONT') {
											console.log(sol[i]['solution_ref']);
											result['recommand'].push(sol[i]['solution_ref']);
										}
									}
									console.log(JSON.stringify(result, null, 2))
									response.context.tra = result;
									console.log("success recommand using tra");
								}
						    });
                        	options = new Array(); // reset option
                        } else if (response.intents[0].intent === 'positive') {
                        	// through
                        } else if (response.intents[0].intent === 'less') {                        		
                    		newOp["format"] = "number:0.0";
                    		newOp['goal'] = 'min';
                        	newOp['key'] = response.entities[0].value;
                        	isMin = true;
                        	isSysNum = true;
                        	isLM = true;
                        	console.log("add columns(less):\n" + JSON.stringify(newOp, null, 2));
                        } else if (response.intents[0].intent === 'more') {
                        	newOp["format"] = "number:0.0";
                    		newOp['goal'] = 'max';
                        	console.log("add columns(more):\n" + JSON.stringify(newOp, null, 2));
                        	isMin = false;
          					isSysNum = true;
                        	isLM = true;
                        } else {
                        	newOp["format"] = "number:0.0";
                    		newOp['goal'] = 'min';
                        	newOp['key'] = response.intents[0].intent;
                        	if (response.intents[0].intent === 'protein') {
                        		newOp['goal'] = 'max';
                        		isMin = false;
                        	} else {
                        		isMin = true;
                        		console.log("wrong value?:\n" + response.entities[0].value);
                        	}
                        	isSysNum = true;
                        	isLM = false;
                        	console.log("add columns(else):\n" + JSON.stringify(newOp, null, 2));
                        }
            
                        res.json(response);

                    }
                });
            }
            //console.log(JSON.stringify(nlcResponse, null, 2));
        }
    });
});

var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');

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