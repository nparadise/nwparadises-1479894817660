import json
import csv

mainDir = 'main-workspace.json';
subDir = 'sub-workspace.json';
mainData = json.loads(open(mainDir).read())
subData = json.loads(open(subDir).read())
mainIntent = mainData['intents']
subIntent = subData['intents']
savejsonDir = 'public/jsondata/intentClassifiyingData.json'
madejson = {}

with open('intentTraining.csv', 'w', newline='') as csvfile:
	intentWriter = csv.writer(csvfile)
	madejson['main'] = []
	madejson['sub'] = []
	for intent in mainIntent:
		writeIntent = intent['intent']
		madejson['main'].append(writeIntent)
		for eachOb in intent['examples']:
			writeText = eachOb['text']
			print(writeIntent + ': ' + writeText)
			intentWriter.writerow([writeText, writeIntent])
	for intent in subIntent:
		writeIntent = intent['intent']
		madejson['sub'].append(writeIntent)
		for eachOb in intent['examples']:
			writeText = eachOb['text']
			print(writeIntent + ': ' + writeText)
			intentWriter.writerow([writeText, writeIntent])

with open(savejsonDir, 'w') as intentsClassify:
	json.dump(madejson, intentsClassify)