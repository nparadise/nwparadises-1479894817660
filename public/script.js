$(document).ready(function(){

    var context = {},	// save context came from conversation api
    	output = "",	// the answer watson will say
    	category,		// what category of food
    	target = [],	// save json file at here
    	foods = [],		// where a list of foods will be saved
    	iterator = 0,	// iterator for print examples
    	allFoods = [];

	$('.chat_head').click(function(){
		$('.chat_body').slideToggle('slow');
	});
	$('.msg_head').click(function(){
		$('.msg_wrap').slideToggle('slow');
	});
	
	$('.close').click(function(){
		$('.msg_box').hide();
	});
	
	$('.user').click(function(){

		$('.msg_wrap').show();
		$('.msg_box').show();
	});
	
	$('textarea').keypress(
    function(e){
        if (e.keyCode == 13) {
            e.preventDefault();
            var msg = $(this).val();
			$(this).val('');
			if(msg!='')
			$('<div class="msg_b"><div class="msg_inb">'+msg+'</div></div>').insertBefore('.msg_push');
			$('.msg_body').scrollTop($('.msg_body')[0].scrollHeight);
			$.ajax({
				url: "http://nwparadises.mybluemix.net/test",
				type: "post",
				contentType: "application/x-www-form-urlencoded",
				dataType: "text",
				data: {
					input_sentence: msg,
					cur_context: JSON.stringify(context)
				},
				success: function (data) {
					var parsedData = JSON.parse(data);
					context = parsedData.context;		// context passed by watson
					allFoods = context.allFoods;
					console.log(context.allFoods);
					context.allFoods = true;
					output = parsedData.output.text[0];	// watson answer
                    //TTS(output);
					$('<div class="msg_a"><div class="msg_ina">'+output+'</div></div>').insertBefore('.msg_push');


					if (context.hasOwnProperty('next') && context.next === true) {
						printExamples();
						delete context.next;
						console.log(context);
					} else {
						afterGetContext();
					}
				}
			});
        }
    });

    // function prints 4 examples of foods
    var printExamples = function() {
    	var j, singleFood;
    	for (j = 0; j < 4; iterator++, j++) {
    		if (iterator === 30) {
    			alert('no more foods');
    			break;
    		} // when reach last food, stop iterating and printing
    		singleFood = foods[iterator];

    		var htmlString = "<div class=\"menu_pic\"><img src='" + singleFood.image + "' alt='" + singleFood.name + "' width='250' height='200'/>" + 
    						 "<div id='name_" + j + "' class=\"menu_name\"><b>" + singleFood.name + "</div>";
    		if (singleFood.hasOwnProperty('nutrition')) {
    			htmlString += "<div id='calories_" + j + "' class=\"menu_content\">" + singleFood.nutrition.calories + " kcal</div>";
    		}

    		// print food list
    		$("#food_" + j).html(htmlString);
    	}
    }

    // get data based on entities and category
    var getData = function(entity) {
    	// get json file
    	$.ajax({
    		dataType: "json",
    		async: false,
    		url: "/jsondata/" + entity + "_" + category + "_30_revised.json",
    		success: function(data) {
    			console.log(data);
    			target = data.foods;
    			console.log(target);
    		}
    	});
    	var j,			// iterator for array of objects about recipe
    		i = -1;		// iterator for food array
    	for (j in target) {
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
    	foods = target;
    }

    // based on context, detemine data to get
    var afterGetContext = function() {
    	iterator = 0;
    	foods = [];
    	if (context.hasOwnProperty('health')) {
    		console.log(context['health'] + ' is came for input.');
    		category = context.health;
    		getData('healthy');
    		delete context.health;
    	} else if (context.hasOwnProperty('events')) {
    		console.log(context.events + ' is came for input.');
    		category = context.events;
    		getData('events');
    		delete context.events;			
    	} else if (context.hasOwnProperty('time')) {
    		console.log(context.time + ' is came for input.');
    		category = context.time;
    		getData('timeslot');
    		delete context.time;
    	}
    	printExamples();
    }
    /*
    function TTS(textToSynthesize) {
        console.log('text to synthesize: ---> ' + textToSynthesize);
        var voice = 'en-US_AllisonVoice';
        synthesizeRequest(textToSynthesize, voice);
    }

    var ttsAudio = $('.audio-tts').get(0);

    window.ttsChunks = new Array();
    window.ttsChunksIndex = 0;
    window.inputSpeechOn = false;

    var timerStarted = false;
    var timerID;

    var playTTSChunk = function() {
        if(ttsChunksIndex >= ttsChunks.length)
            return;
            
        var downloadURL = ttsChunks[ttsChunksIndex];
        ttsChunksIndex = ttsChunksIndex + 1;
        
        ttsAudio.src = downloadURL;
        ttsAudio.load();
        ttsAudio.play();
    }

    function synthesizeRequest(text, v) {
        var downloadURL = '/synthesize' +
          '?voice=' + v +
          '&text=' + encodeURIComponent(text) +
          '&X-WDC-PL-OPT-OUT=0';
        
        ttsChunks.push(downloadURL);
        playTTSChunk();
    }
    */
});

