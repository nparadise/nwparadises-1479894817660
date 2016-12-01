import json
import csv

directory = "C:/Users/gp/Documents/nwparadises-1479894817660/public/jsondata/foods.json"
jsonData = json.loads(open(directory).read())
foods = jsonData['foods']

with open('foodnames.csv', 'w', newline='') as csvfile:
	foodwriter = csv.writer(csvfile)
	for food in foods:
		foodwriter.writerow(['foodnames', food['name']])