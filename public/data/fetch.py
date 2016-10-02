#!/usr/bin/python
# -*- coding: utf-8 -*-

from pyquery import PyQuery as pq
import requests, csv, urllib
from geopy.geocoders import GeoNames

def download(url, year):
    d = pq(url=url)

    with open("raw-%d.html" % year, "wb") as f:
        r = requests.get(url, stream=True)
        for chunk in r.iter_content(100):
            f.write(chunk)

    f.closed

def parse():
    d = pq(filename="raw-2012.html")

    def cell(td):
        td = d(td)
        return td.text().lower().encode("utf-8").replace("ÿ", " ") \
          if td.text() else ""


    with open("h1bs-2012-2016.csv", "wb") as csvfile:
        writer = csv.writer(csvfile)

        header = [th.text.lower() for th in d("thead th")]
        writer.writerow([th.text.lower()
                         for th in d("thead th")])

        for year in xrange(2012, 2017):
            d = pq(filename="raw-%d.html" % year)
            print year

            for row in d("table tr"):
                writer.writerow([cell(td) for td in d(row)("td")])

def cleannames():
    geolocator = GeoNames(domain = 'ws.geonames.net',
                          country_bias = 'United States',
                          username = 'swizec',
                          timeout = 20)

    with open("h1bs-2012-2016.csv", "rb") as csvfile:
        reader = csv.reader(csvfile)
        with open("h1bs-2012-2016-cleaned.csv", "wb") as csvoutfile:
            writer = csv.writer(csvoutfile)

            writer.writerow(reader.next())

            locations = {}

            for row in reader:
                if len(row) > 0:
                    location = row[3] + ', united states'

                    if location not in locations:
                        cleaned = geolocator.geocode(location, True)
                        if cleaned:
                            locations[location] = cleaned.address.encode('utf8')
                        else:
                            locations[location] = location

                    row[3] = locations[location]

                    writer.writerow(row)
                    print row

def countynames():
    with open("h1bs-2012-2016-cleaned.csv", "rb") as csvfile:
        reader = csv.reader(csvfile)
        reader.next()
        with open("h1bs-2012-2016-final.csv", "wb") as csvoutfile:
            writer = csv.writer(csvoutfile)

            writer.writerow(['employer',
                             'job title',
                             'base salary',
                             'city',
                             'county',
                             'state',
                             'submit date',
                             'start date',
                             'case status'])

            counties = {}

            for row in reader:
                if len(row) > 0:
                    location = row[3]

                    if location not in counties:
                        url = "http://geonames.net/search.html?q=%s&username=swizec" % location.replace(' ', '+').replace(',', '')

                        d = pq(url)
                        county = d('table.restable tr:eq(2) td:eq(2) small').text()
                        counties[location] = county

                    _location = location.split(',')

                    outrow = [row[0],
                                     row[1],
                                     row[2],
                                     _location[0].strip(),
                                     counties[location],
                                     _location[1],
                                     row[4],
                                     row[5],
                                     row[6]]
                    print outrow
                    writer.writerow(outrow)

if __name__ == "__main__":
    #for year in xrange(2012, 2017):
    #    print year
        #download("http://h1bdata.info/index.php?em=&job=software+*&year=%d" % year, year)

    #parse()
    #cleannames()
    countynames()
