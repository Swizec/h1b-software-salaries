
import csv, re

def uniquifyIds():
    with open('us-county-names.tsv', 'r') as csvfile:
        reader = csv.reader(csvfile, delimiter="\t")

        with open('us-county-names-normalized.csv', 'w') as csvoutfile:
            writer = csv.writer(csvoutfile)
            writer.writerow(next(reader))

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
            writer.writerow(['Orig Name'] + next(reader))

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

def uniquifyH1Bs():
    countyIDs = {}

    with open('county-median-incomes-normalized.csv') as csvfile:
        reader = csv.reader(csvfile)
        next(reader)

        for row in reader:
            county = '%s, %s' % (row[0].strip(), row[2].strip())
            countyIDs[county] = row[1]

    def normalize(name):
        if name == 'Prince Georges County':
            return 'Prince George\'s County'
        if name == 'US.DC.001 County':
            return 'District of Columbia'
        if name == 'Orleans Parish County':
            return 'Orleans Parish'
        if name == 'Saint Louis County':
            return 'St. Louis County'
        if name == 'East Baton Rouge Parish County':
            return 'East Baton Rouge Parish'
        if name == 'City and County of Broomfield County':
            return 'Broomfield County'

        if name.startswith('City of'):
            name = name.replace('City of', '').replace('County', '').strip()
            name += ' city'
            return name

        name = name.replace('Saint', 'St.')

        return name

    def cleanJobs(title):
        title = re.sub(r'[^a-z ]', '', title, flags=re.IGNORECASE)

        if re.search(r'consultant|specialist|expert|prof|advis|consult', title):
            title = "consultant"
        elif re.search(r'analyst|strateg|scien/', title):
            title = "analyst";
        elif re.search(r'manager|associate|train|manag|direct|supervis|mgr|chief', title):
            title = "manager"
        elif re.search(r'architect', title):
            title = "architect"
        elif re.search(r'lead|coord', title):
            title = "lead"
        elif re.search(r'eng|enig|ening|eign', title):
            title = "engineer"
        elif re.search(r'program', title):
            title = "programmer"
        elif re.search(r'design', title):
            title = "designer"
        elif re.search(r'develop|dvelop|develp|devlp|devel|deelop|devlop|devleo|deveo', title):
            title = "developer"
        elif re.search(r'tester|qa|quality|assurance|test', title):
            title = "tester"
        elif re.search(r'admin|support|packag|integrat', title):
            title = "administrator"
        else:
            title = "other"

        return title

    with open('h1bs-2012-2018-final-cleaned.csv') as csvfile:
        reader = csv.reader(csvfile)
        header = next(reader)

        header += ['countyID']

        with open('h1bs-2012-2018-final-with-countyid.csv', 'w', encoding="utf-8") as csvoutfile:
            writer = csv.writer(csvoutfile)
            writer.writerow(header)

            N = 0

            for row in reader:
                row = [cell.strip() for cell in row]
                row[5] = row[5].upper()

                N += 1

                if row[3] == 'New York':
                    row[4] = 'New York County'
                if row[3] == 'metro wyoming':
                    row[3] = 'Wyoming'
                    row[4] = 'Kent County'
                if row[3] == 'metro wixom':
                    row[3] = 'Wixom'
                    row[4] = 'Oakland County'
                if row[3] == 'Hampton Inn & Suites Chicago Mt. Prospect':
                    row[4] = 'Cook County'
                if row[3] == 'east birimingham':
                    row[3] = 'East Birmingham'
                    row[4] = 'Jefferson County'
                if row[3] == 'metro southfield':
                    row[3] = 'Southfield'
                    row[4] = 'Oakland County'
                if row[3] in ['tempe', 'suite 400', 'middle town', 'symmes twp', 'offallon']:
                    continue
                if row[3] == 'parsipanny':
                    row[3] = 'Parsippany'
                    row[4] = 'Morris County'
                if row[3] == 'mc lean':
                    row[3] = 'McLean'
                    row[4] = 'Fairfax County'
                if row[3] == 'alisa viejo':
                    row[3] = 'Aliso Viejo'
                    row[4] = 'Orange County'
                if row[3] == 'Seattle\xe2\x80\x93Tacoma International Airport':
                    row[3] = 'Seattle'
                    row[4] = 'King County'
                if row[3] == 'seattle':
                    row[3] = 'Seattle'
                    row[4] = 'King County'
                    row[5] = 'WA'
                if row[3] == 'alda':
                    row[3] = 'Ada Township'
                    row[4] = 'Kent County'
                if row[3] in ['sanfrancisco', 'sanfransisco']:
                    row[3] = 'San Francisco'
                    row[4] = 'San Francisco County'
                if row[3] == 'landera ranch':
                    row[3] = 'Ladera Ranch'
                    row[4] = 'Orange County'
                if row[3] == 'north bay vlg':
                    row[3] = 'North Bay Village'
                    row[4] = 'Miami-Dade County'
                if row[3] == 'cincinnati':
                    row[3] = 'Cincinnati'
                    row[4] = 'Hamilton County'
                    row[5] = 'OH'
                if row[3] == 'bollingbrook':
                    row[3] = 'Bolingbrook'
                    row[4] = 'Will County'

                county = '%s, %s' % (normalize(row[4]), row[5])
                try:
                    row += [countyIDs[county]]
                except KeyError:
                    print(N)
                    print(row)
                    continue

                row[1] = cleanJobs(row[1])

                print(row)
                writer.writerow(row)
            print('done')

if __name__ == "__main__":
    uniquifyIds()
    # uniquifyMedians()
    # uniquifyH1Bs()
