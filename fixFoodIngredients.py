import json
import os
import glob

baseDir = 'public/jsondata/100'
d = {}

for filename in glob.glob(os.path.join(baseDir, '*.json')):
	fixedFileDir = filename[20:]
	with open(filename) as jsonFiles:
		d = json.load(jsonFiles)
		jsonFiles.close()
		i = 0
		for food in d['foods']:
			toChange = food['ingredients'][:-3]
			j = 0
			d['foods'][i]['ingredients'] = toChange
			i += 1
		with open('public/jsondata/fixIngredients/' + fixedFileDir, 'w') as f:
			json.dump(d, f, indent='\t')

