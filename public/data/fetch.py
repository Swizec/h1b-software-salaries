#!/usr/bin/python
# -*- coding: utf-8 -*-

from pyquery import PyQuery as pq
import requests, csv

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

if __name__ == "__main__":
    #for year in xrange(2012, 2017):
    #    print year
        #download("http://h1bdata.info/index.php?em=&job=software+*&year=%d" % year, year)

    parse()
