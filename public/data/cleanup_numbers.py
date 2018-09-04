
import csv, re

def cleanNumber(n):
    n = int(n.replace('.', '').replace(',', ''))

    if (n < 100):
        n *= 1000

    if (n < 1000):
        n *= 10

    if (n < 10000):
        n *= 10

    return n

def cleanupMedians():
    with open('county-median-incomes-normalized.csv', 'r') as csvfile:
        reader = csv.reader(csvfile)

        with open('county-median-incomes.csv', 'w') as csvoutfile:
            writer = csv.writer(csvoutfile)
            writer.writerow(reader.next())

            for row in reader:
                row[3] = cleanNumber(row[3])
                row[4] = cleanNumber(row[4])
                row[5] = cleanNumber(row[5])

                writer.writerow(row)

def cleanupH1Bs():
    with open('h1bs-2012-2018-final-with-countyid.csv', 'r') as csvfile:
        reader = csv.reader(csvfile)

        with open('h1bs-2012-2018.csv', 'w') as csvoutfile:
            writer = csv.writer(csvoutfile)
            writer.writerow(next(reader))

            for row in reader:
                row[2] = cleanNumber(row[2])

                writer.writerow(row)

if __name__ == "__main__":
    #cleanupMedians()
    cleanupH1Bs()
