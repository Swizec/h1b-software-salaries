#!/usr/bin/python
# -*- coding: utf-8 -*-

from pyquery import PyQuery as pq
import requests, csv

def download(url):
    d = pq(url=url)

    with open("raw.html", "wb") as f:
        r = requests.get(url, stream=True)
        for chunk in r.iter_content(100):
            f.write(chunk)

    f.closed

def parse():
    d = pq(filename="raw.html")

    print d.encoding

    def cell(td):
        td = d(td)
        return td.text().lower().encode("utf-8").replace("ÿ", " ") \
          if td.text() else ""


    with open("h1bs.csv", "wb") as csvfile:
        writer = csv.writer(csvfile)

        header = [th.text.lower() for th in d("thead th")]
        writer.writerow([th.text.lower()
                         for th in d("thead th")])

        for row in d("table tr"):
            writer.writerow([cell(td) for td in d(row)("td")])

if __name__ == "__main__":
    #download("http://h1bdata.info/beta/index.php?em=&job=software+*")
    parse()
