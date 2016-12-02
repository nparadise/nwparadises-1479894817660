== 테마 목록 ==
   // 작은 테마 id들
   var Theme_nums = new Array( 187, 198, 193, 1419, 78, 17562, 79, 739, 741, 84, 1232, 1231, 200, 201, 95, 205, 416, 156, 276, 96, 94, 227, 233, 723, 728, 15876 );
   // 테마 이름 담은 딕셔너리. key: 테마 id, value: ['테마', '작은 테마']
   var Dic_theme = { 187:['events','christmas'], 198:['events', 'thanksgiving'], 193:['events', 'new-year'], 
            1419:['events','big-game'], 
            78:['timeslot', 'breakfast-and-brunch'], 17562:['timeslot', 'dinner'], 79:['desserts', 'desserts'],
            739:['healthy', 'diabetic'], 741:['healthy', 'gluten-free'], 84:['healthy', 'healthy'], 
            1232:['healthy', 'low-calorie'], 1231:['healthy', 'low-fat'], 
            200:['ingredient', 'beef'], 201:['ingredient', 'chicken'], 95:['ingredient', 'pasta'],
            205:['ingredient', 'pork'], 416:['ingredient', 'salmon'], 
            156:['dish-type', 'breads'], 276:['dish-type', 'cakes'], 96:['dish-type', 'salads'],
            94:['dish-type', 'soups'], 227:['world-cuisine', 'asian'], 233:['world-cuisine', 'indian'],
            723:['world-cuisine', 'italian'], 728:['world-cuisine', 'mexican'], 15876:['world-cuisine', 'southern']
            };
   // file_name 만들기 예시. 아래 코드는 모든 파일에 대해서 동작을 수행
   var recipe_num = 30;
   for (var i = 0; i < Theme_nums.length; i++) {
     var theme_num = Theme_nums[i];
     file_name = Dic_theme[theme_num][0] + "_" + Dic_theme[theme_num][1] + "_" + recipe_num;
     // 하고 싶은 동작 여기에 
   }

== 테마별로 나눠져 있는 json 파일(revised) ==
   'foods'에 json 객체 리스트가 있음.
   각 json 객체는 요리 하나에 대응.
   json 요리 객체 내부 요소:
      id: 음식 고유 아이디. 작은 테마 id * 100 + 음식 번호(1~30)
      name: 음식 이름
      nutrition: 영양분 리스트
      ingredients: 재료 리스트
      directions: 만드는 방법
      image: 이미지 경로
      ready_in_time: 재료 숙성 등 사전 준비에 걸리는 시간
      prep_time: 요리 직전에 걸리는 준비 시간
      cook_time: 요리에 걸리는 시간
      total_time: 준비 시간을 전부 포함한 총 조리 시간
      cal: 음식의 칼로리 (단위 kcal)
      rating: 음식의 별점 (0~5)

== 테마별로 나눠져 있는 json 파일(revised 아닌 거) title, content의 text가 순서대로 다음과 같음 ==

   recipe
   null

   Image
   이미지 링크 (src 속성에 넣어서 이미지 태그로 만들면 웹에서 이미지로 쓸 수 있음)

   음식 이름
   레시피 만든 사람의 간략 코멘트

   Ingredients
   요약정보와 분량 지시 사항

   Nutrition
   영양정보

   [Nutrition Information
   영양에 대한 설명]

   Ingredients List
   ADVERTISEMENT로 나뉘어진 재료들 리스트

   Directions
   지시사항들


