import json
import csv

directory = "public/jsondata/100/foods.json"
jsonData = json.loads(open(directory).read())
foods = jsonData['foods']

with open('foodnames.csv', 'w', newline='') as csvfile:
	foodwriter = csv.writer(csvfile)
	for food in foods:
		lowerName = food['name'].lower()
		foodwriter.writerow(['foodnames', food['name'], lowerName])