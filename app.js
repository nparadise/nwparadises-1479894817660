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

app.get('/api/synthesize', function(req, res, next) {
    var transcript = text_to_speech.synthesize(req.query);
    transcript.on('error', next);
    transcript.pipe(res);
});

var tone_analyzer = watson.tone_analyzer({
    username: '5d6812dc-d371-492f-a265-1d9f1f5bcc45',
    password: 'LQpaYHcJyqXM',
    version: 'v3',
    version_date: '2016-05-19'
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
    var initialNut = target[j].nutrition,
        per_calories = initialNut[0].split("kcal"),
        per_fat = initialNut[1].split("g"),
        per_carb = initialNut[2].split("g"),
        per_protein = initialNut[3].split("g"),
        per_chol = initialNut[4].split("mg"),
        per_sodium = initialNut[5].split("mg");
    var nutritionObj = {
        'calories': calories[1],
        'fat': fat[1],
        'carbohydrate': carbohydrate[1].substring(0, carbohydrate[1].length - 1),
        'protein': protein[1],
        'cholesterol': cholesterol[1],
        'sodium': sodium[1]
    };
    var nutri2 = {
        'calories': per_calories[1],
        'fat': per_fat[1],
        'carbohydrate': per_carb[1],
        'protein': per_protein[1],
        'cholesterol': per_chol[1],
        'sodium': per_sodium[1]
    };
    target[j].nutrition = nutritionObj;
    target[j].nutrition2 = nutri2;
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

var classifyingDeterminator = JSON.parse(fs.readFileSync(directory + '/intentClassifyingData.json', 'utf8'));
app.post("/test", function(req, res) {
    console.log(req.body);
    var input_sentence = req.body.input_sentence;
    var context = JSON.parse(req.body.cur_context);
    console.log(input_sentence);
    //console.log(context);

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
                            if (current_intent === "IngredientException")
                                response.context.next = false;
                        } else {
                            save_anger = false;
                        }
                    }
                }
                response.context.anger = save_anger;
                prev_intent = current_intent;
                res.json(response);
                //console.log(JSON.stringify(response, null, 2));
            });
        }
    });
});
