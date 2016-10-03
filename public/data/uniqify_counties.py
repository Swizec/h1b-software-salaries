
import csv, re

def uniquifyIds():
    with open('us-county-names.tsv', 'rb') as csvfile:
        reader = csv.reader(csvfile, delimiter="\t")

        with open('us-county-names-normalized.csv', 'wb') as csvoutfile:
            writer = csv.writer(csvoutfile)
            writer.writerow(reader.next())

            counties = {}

            for row in reader:
                county = row[1]

                if county in counties:
                    counties[county] += 1
                else:
                    counties[county] = 1

                row[1] = "%s%d" % (county, counties[county])
                writer.writerow(row)

def uniquifyMedians():
    with open('county-median-incomes.csv', 'rb') as csvfile:
        reader = csv.reader(csvfile)

        with open('county-median-incomes-normalized.csv', 'wb') as csvoutfile:
            writer = csv.writer(csvoutfile)
            writer.writerow(['Orig Name'] + reader.next())

            counties = {}

            for row in reader:
                county = re.sub(r'(City|Parish|Borough|County|Census Area|Municipality)$', '', row[0], flags=re.IGNORECASE).strip()

                if county in counties:
                    counties[county] += 1
                else:
                    counties[county] = 1

                row = [row[0]] + row
                row[1] = "%s%d" % (county, counties[county])

                writer.writerow(row)

if __name__ == "__main__":
    #uniquifyIds()
    uniquifyMedians()
