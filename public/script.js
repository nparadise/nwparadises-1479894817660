$(document).ready(function(){

	var context = {},		// save context came from conversation api
		output = "",		// the answer watson will say
		category,			// what category of food
		target = [],		// save json file at here
		foods = [],			// where a list of foods will be saved
		iterator = 0,		// iterator for print examples
		allFoods = [],		// where all foods will be stored
		exception = [],		// where ingredients to except will be stored
		nowShowing = [];	// foods now showing

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
				url: "/test",
				type: "post",
				contentType: "application/x-www-form-urlencoded",
				dataType: "text",
				data: {
					input_sentence: msg,
					cur_context: JSON.stringify(context),
				},
				success: function (data) {
					var parsedData = JSON.parse(data);
					context = parsedData.context;			// context passed by watson
					allFoods = context.allFoods;			// variable to save every foods
					console.log(context.allFoods);
					console.log(context.angry);
					context.allFoods = true;				// to notify server that we already have information about every foods
					output = parsedData.output.text[0];		// watson answer

					// if (parsedData.intents.length > 0) {
					// 	intent = parsedData.intents[0].intent;
					// 	console.log('previous intent: ' + intent);
					// }
					if (context.hasOwnProperty('except')) {
						exception.push(context.except);		// add ingredients to except
						delete context.except;
					}
					if (!context.hasOwnProperty('foodnames')) {
						$('<audio src="/api/synthesize?text=' + output + '" autoplay></audio>').insertBefore('.msg_push');
						//TTS(output);
						$('<div class="msg_a"><div class="msg_ina">'+output+'</div></div>').insertBefore('.msg_push');
					}

					// if next flag is true, show next 4 foods
					if (context.hasOwnProperty('next') && context.next === true) {
						printExamples();
						delete context.next;
						console.log(context);
					} else if (context.hasOwnProperty('foodnames')) {	// if user choose food, show that food
						console.log(context.foodnames);
						var lookingfor = context.foodnames;		// food to find
						var checkAppear = false;				// flag to check wether food is in list or not
						for (var it in nowShowing) {
							if (nowShowing[it].name == lookingfor) { // check food appear
								checkAppear = true;	
								$('<audio src="/api/synthesize?text=Here+is+the+recipe+of+' + lookingfor + '" autoplay></audio>').insertBefore('.msg_push');	// read the Watson's response
								$('<div class="msg_a"><div class="msg_ina">Here is the recipe of ' + lookingfor + '.</div></div>').insertBefore('.msg_push');	// print the Watson's response

								// show food information
								var htmlString = '<div class="menu_pic"><img src="' + nowShowing[it].image + '" alt="' + nowShowing[it].name + '" width="400" height="250"/></div>' + 
												 "<div id='name_" + j + "' class=\"menu_name\"><b>" + nowShowing[it].name + "</div>";
								if (nowShowing[it].hasOwnProperty('nutrition')) {
									htmlString += "<div id='calories_" + j + "' class=\"menu_content\">" + nowShowing[it].nutrition.calories + " kcal</div>";
								}
								$('#food_detail').html(htmlString);
							}
						}
						if (!checkAppear) { // if food does not appear, show message
							$('<div class="msg_a"><div class="msg_ina">There is no ' + lookingfor + ' in the list.</div></div>').insertBefore('.msg_push');
						}
						delete context.foodnames;
					} else {
						afterGetContext();
					}
				}
			});
		}
	});

	// function prints 4 examples of foods
	var printExamples = function() {
		var j,				// iterator to iterate 4 times
			singleFood,		// variable to store each foods to print
			inDiv = "";		// variable to store codes for showing prints
		if (foods.length === 0) return;		// if no foods are loaded, stop executing the function
		for (j = 0; j < 4; iterator++, j++) {
			if (iterator === 30) {			// if iterator reach end of food list, stop the function
				alert('no more foods');
				break;
			} // when reach last food, stop iterating and printing
			singleFood = foods[iterator];
			var foodIngrs = singleFood.ingredients;		// get list of foods ingredients
			var exit = false;							// save the condition to exit for loop
			for (var sentence in foodIngrs) {
				var senLower = sentence.toLowerCase();
				for (var exIng in exception) {
					var ingLower = exIng.toLowerCase();
					if (senLower.search(ingLower) > -1) {	// if there is ingredient to avoid in the food, continue to most outer loop
						j--;
						exit = true;
						break;
					}
				}
				if (exit) break;
			}
			if (exit) {
				exit = false;
				continue;
			}

			// html codes to print foods
			nowShowing.push(singleFood);
			var htmlString = "<div class=\"menu_pic\"><img src='" + singleFood.image + "' alt='" + singleFood.name + "' width='250' height='200'/>" + 
							 "<div id='name_" + j + "' class=\"menu_name\"><b>" + singleFood.name + "</div>";
			if (singleFood.hasOwnProperty('nutrition')) {
				htmlString += "<div id='calories_" + j + "' class=\"menu_content\">" + singleFood.nutrition.calories + " kcal</div>";
			}
			// print food list
			inDiv += '<div class="menu">' + htmlString + '</div>';
		}
		$('<div class="msg_a"><div class="msg_ina">' + inDiv + '</div></div>').insertBefore('.msg_push');
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
			// fix the nutrition data
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
		foods = [];			// reset food array
		nowShowing = [];	// reset the list of now showing
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
		} else if (context.hasOwnProperty('world-cuisine')) {
			console.log(context.time + ' is came for input.');
			category = context["world-cuisine"];
			getData('world-cuisine');
		}
		printExamples();	// after get list, print list
	}
	
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

});

