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

	$('.msg_head').click(function(){
		$('.msg_wrap').slideToggle('slow');
	});

	$('.msg_click').click(function(){
		mainRequest();
	});

	$('.detail_name').click(function(){
		$('.detail_wrap').slideToggle('slow');
	});
	
	$('.detail_iT').click(function(){
		$('.detail_i').slideToggle('slow');
	});

	$('.detail_dT').click(function(){
		$('.detail_d').slideToggle('slow');
	});

	$('textarea').keypress(
	function(e){
		if (e.keyCode == 13) {
			e.preventDefault();
			mainRequest();
		}
	});

	var startRequest = function() {
		$.ajax({
			url: "/start",
			type: "post",
			contentType: "application/x-www-form-urlencoded",
			dataType: "text",
			beforeSend: function(data) {
				jQuery("#loading_image").fadeIn();
			},
			success: function(data) {
				var parsedData = JSON.parse(data);
				context = parsedData.context;
				output = parsedData.output.text[0];		// watson answer
				allFoods = context.allFoods;
				delete context.allFoods;
				console.log(context.allFoods);
				jQuery("#loading_image").fadeOut();	
				$('<audio src="/api/synthesize?text=' + output + '&voice=en-US_AllisonVoice" autoplay></audio>').insertBefore('.msg_push');
				$('<div class="msg_a"><div class="chefPic"></div><div class="msg_ina">'+output+'</div></div>').insertBefore('.msg_push');
				$('.msg_body').scrollTop($('.msg_body')[0].scrollHeight);
			}
		});
	}

	var mainRequest = function() {
		var msg = $('textarea').val();
		$('textarea').val('');
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
			beforeSend: function(data) {
				jQuery("#loading_image").fadeIn();		//show loading image
			},
			success: function (data) {
				var parsedData = JSON.parse(data);
				context = parsedData.context;			// context passed by watson
				console.log(context.angry);
				output = parsedData.output.text[0];		// watson answer
				jQuery("#loading_image").fadeOut();		// loading image disappear

				if (context.main === true) {
					if (context.hasOwnProperty('except')) {
						exception.push(context.except);		// add ingredients to except
						delete context.except;
					}
					if (!context.hasOwnProperty('foodnames')) {
						$('<audio src="/api/synthesize?text=' + output + '&voice=en-US_AllisonVoice" autoplay></audio>').insertBefore('.msg_push');
						$('<div class="msg_a"><div class="chefPic"></div><div class="msg_ina">'+output+'</div></div>').insertBefore('.msg_push');
						$('.msg_body').scrollTop($('.msg_body')[0].scrollHeight);
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

							for (var j = 0; j < 4; j++) {
								$("#food_" + j).html("");
							}
							if (nowShowing[it].name == lookingfor) { // check food appear
								checkAppear = true;	

								$('<audio src="/api/synthesize?text=Here+is+the+recipe+of+' + lookingfor + '&voice=en-US_AllisonVoice" autoplay></audio>').insertBefore('.msg_push');	// read the Watson's response
								$('<div class="msg_a"><div class="chefPic"></div><div class="chefPic"></div><div class="msg_ina">Here is the recipe of ' + lookingfor + '.</div></div>').insertBefore('.msg_push');	// print the Watson's response

								var ratings = nowShowing[it].rating * 20;
								// show food information
								var htmlString = '<div class="detail"><div class="detail_name">' + nowShowing[it].name + '</div><div class="detail_wrap">' +
												'<div class="detail_pic"><img src="' + nowShowing[it].image + '" alt="' + nowShowing[it].name + '" width="380" height="290"/></div>' + 
												'<div class="detail_right"><div class="detail_rightText"><table><tr><td>cook time: </td><td>' + nowShowing[it].cook_time + ' m</td></tr>' +
												'<tr><td>rating: </td><td><div class="detail_star"><p class="detail_star2" style="width: ' + ratings + '%;"</p></div></td></tr></table>' +
												'comment: ' + nowShowing[it].comment + '</table></div><table border="1" class="table_dri">' +
												'<th colspan="3">Nutrition</th><tr><td></td><td>Quantity</td><td>D.R.I</td></tr>' + 
												'<tr><td>Calories</td><td>' + nowShowing[it].nutrition.calories + 'kcal</td><td>' + nowShowing[it].nutrition2.calories + '</td></tr>' + 
												'<tr><td>Fat</td><td>' + nowShowing[it].nutrition.fat + 'g</td><td>' + nowShowing[it].nutrition2.fat + '</td></tr>' + 
												'<tr><td>Carbs</td><td>' + nowShowing[it].nutrition.carbohydrate + 'g</td><td>' + nowShowing[it].nutrition2.carbohydrate + '</td></tr>' + 
												'<tr><td>Protein</td><td>' + nowShowing[it].nutrition.protein + 'g</td><td>' + nowShowing[it].nutrition2.protein + '</td></tr>' + 
												'<tr><td>Cholesterol</td><td>' + nowShowing[it].nutrition.cholesterol + 'mg</td><td>' + nowShowing[it].nutrition2.cholesterol + '</td></tr>' + 
												'<tr><td>Sodium</td><td>' + nowShowing[it].nutrition.sodium + 'mg</td><td>' + nowShowing[it].nutrition2.sodium + '</td></tr></table></div>' +
								    			'<div class="detail_bottom"><div class="detail_iT detail_bT">Ingredient</div>' +
								    			'<div class="detail_i detail_b">' + nowShowing[it].ingredients + '</div><div style="padding: 5px"></div>' +
								      			'<div class="detail_dT detail_bT">Directions</div><div class="detail_d detail_b">' + nowShowing[it].directions + '</div></div></div></div>';
								$(htmlString).insertBefore('.msg_push');
								$('.msg_body').scrollTop($('.msg_body')[0].scrollHeight);
							}
						}
						if (!checkAppear) { // if food does not appear, show message
							$('<div class="msg_a"><div class="chefPic"></div><div class="msg_ina">There is no ' + lookingfor + ' in the list.</div></div>').insertBefore('.msg_push');
							$('.msg_body').scrollTop($('.msg_body')[0].scrollHeight);
						}
						delete context.foodnames;
					} else {
						afterGetContext();
					}
				} else {
					$('<audio src="/api/synthesize?text=' + output + '&voice=en-US_AllisonVoice" autoplay></audio>').insertBefore('.msg_push');
					$('<div class="msg_a"><div class="chefPic"></div><div class="msg_ina">'+output+'</div></div>').insertBefore('.msg_push');
					$('.msg_body').scrollTop($('.msg_body')[0].scrollHeight);
				}
			}
		});
	}
	// function prints 4 examples of foods
	var printExamples = function() {
		var j, 				// iterator to iterate 4 times
			singleFood, 		// variable to store each foods to print
			inDiv = "";		// variable to store codes for showing prints
		if (foods.length === 0) return;		// if no foods are loaded, stop executing the function
		for (j = 0; j < 4; iterator++, j++) {
			if (iterator === 100) {			// if iterator reach end of food list, stop the function
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
			var htmlString = '<div class="menu_pic"><img src="' + singleFood.image + '" alt="' + singleFood.name + '" width="250" height="200"/></div>' + 
							 '<div id="name_' + j + '" class="menu_name"><b>' + singleFood.name + '</div>';
			if (singleFood.hasOwnProperty('nutrition')) {
				htmlString += '<div id="calories_' + j + '" class="menu_content">' + singleFood.nutrition.calories + ' kcal</div>';
			}
			// print food list
			inDiv += '<div class="menu">' + htmlString + '</div>';
		}
		$('<div class="msg_a"><div class="chefPic"></div><div class="msg_ina">' + inDiv + '</div></div>').insertBefore('.msg_push');
		$('.msg_body').scrollTop($('.msg_body')[0].scrollHeight);
	}

	// get data based on entities and category
	var getData = function(entity) {
		// get json file
		$.ajax({
			dataType: "json",
			async: false,
			url: "/jsondata/100/" + entity + "_" + category + "_100_revised.json",
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
	
	startRequest();
});