import json
import csv
import re

directory = "C:/Users/gp/Documents/nwparadises-1479894817660/public/jsondata/foods.json"
jsonData = json.loads(open(directory).read())
foods = jsonData['foods']
ingr = []
p = re.compile('([0-9]+(\/[0-9])?)(( (tablespoons?|teaspoons?|dash(es)?|cups?|cloves?|pounds?)(( (white|semisweet|white|brown|all-purpose|ground|warm|fresh|\w+ed))+)? ((\w+| )+)?)|(( pounds?)? skinless, boneless ((chicken) breast))|(( very)?( (small|large|ripe))? ((\w+| )+))|( \((([0-9]+(\.[0-9]+)?)|(\.[0-9]+)) ounce\)( (cans?|packages?|containers?))(( frozen| fat-free| \w+ed)+)? ((\w+| )+))|([0-9]) (\w+))(, (\w+ed)( and (\w+ed))?)?')
for foodObj in foods:
	ingredientList = foodObj['ingredients']
	for text in ingredientList:
		m = p.search(text)
		toPut = ""
		if m:
			if m.group(10):
				toPut = m.group(10)
			elif m.group(15):
				toPut = m.group(15)
			elif m.group(20):
				toPut = m.group(20)
			elif m.group(31):
				toPut = m.group(31)
			elif m.group(34):
				toPut = m.group(34)
			else:
				continue
		if toPut in ingr:
			continue
		if re.match('[0-9]+(\.[0-9]+)?', toPut):
			continue
		else:
			ingr.append(toPut)

with open('ingredients.csv', 'w', newline='') as csvfile:
	ingrWriter = csv.writer(csvfile)
	for each in ingr:
		ingrWriter.writerow(['ingredients', each])