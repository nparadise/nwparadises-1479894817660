from bs4 import BeautifulSoup
import urllib.request
import csv

r = urllib.request.urlopen('http://food.ndtv.com/ingredient')
soup = BeautifulSoup(r, 'html.parser')
parse_url = soup.find_all(itemprop="url")

link = []
item = []
for url in parse_url:
	link.append(url['href'])

for go in link:
	r = urllib.request.urlopen(go)
	soup = BeautifulSoup(r, 'html.parser')
	while True:
		parse_foodname = soup.find_all(itemprop="name")
		i = 0
		for foodname in parse_foodname:
			if i < 4:
				i += 1
				continue
			item.append(foodname.string)
		pageList = soup.find_all(class_="pagination")
		if len(pageList) == 0:
			break
		if pageList[len(pageList) - 1].contents[0].string == 'Next »':
			nextLink = pageList[len(pageList) - 1].contents[0]['href']
			print(ascii(nextLink))
			r = urllib.request.urlopen(nextLink)
			soup = BeautifulSoup(r, 'html.parser')
		else:
			break

with open('ingredients.csv', 'w', newline='') as csvfile:
	ingrWriter = csv.writer(csvfile)
	for ingr in item:
		ingrWriter.writerow(['ingredient', ingr])