import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import H1BGraph from './components/H1BGraph';
import Histogram from './components/Histogram';
import CountyMap from './components/CountyMap';

const parseNumber = (n) => {
    n = Number(n.replace('.', '').replace(',', ''));
    if (n < 100) {
        n *= 1000;
    }
    if (n < 1000) {
        n *= 10;
    }
    if (n < 10000) {
        n *= 10;
    }
    return n;
};

const cleanIncomes = (d) => ({
    countyName: d['Name'],
    medianIncome: parseNumber(d['Median Household Income']),
    lowerBound: parseNumber(d['90% CI Lower Bound']),
    upperBound: parseNumber(d['90% CI Upper Bound'])
});

const dateParse = d3.timeParse("%m/%d/%Y");

const cleanSalary = (d) => {
    if (!d['base salary'] || parseNumber(d['base salary']) > 300000) {
        return null;
    }

    return {employer: d.employer,
            submit_date: dateParse(d['submit date']),
            start_date: dateParse(d['start date']),
            case_status: d['case status'],
            job_title: d['job title'],
            clean_job_title: d['job title'],
            base_salary: parseNumber(d['base salary']),
            city: d['city'],
            state: d['state'],
            county: d['county'],
            countyID: d['countyID']
    };
}

const cleanStateName = (d) => ({
    code: d.code,
    id: Number(d.id),
    name: d.name
});

class App extends Component {
    state = {
        countyNames: [],
        medianIncomes: [],
        techSalaries: []
    }

    componentWillMount() {
        d3.queue()
          .defer(d3.json, 'data/us.json')
          .defer(d3.csv, 'data/us-county-names-normalized.csv')
          .defer(d3.csv, 'data/county-median-incomes-normalized.csv', cleanIncomes)
          .defer(d3.csv, 'data/h1bs-2012-2016-final-with-countyid.csv', cleanSalary)
          .defer(d3.tsv, 'data/us-state-names.tsv', cleanStateName)
          .await((error, us, countyNames, medianIncomes, techSalaries, stateNames) => {
              countyNames = countyNames.map(({ id, name }) => ({id: Number(id),
                                                                name: name}));

              let medianIncomesMap = {},
                  techSalariesMap = {};

              medianIncomes.filter(d => _.find(countyNames,
                                               {name: d['countyName']}))
                           .forEach((d) => {
                               d['countyID'] = _.find(countyNames,
                                                      {name: d['countyName']}).id;
                               medianIncomesMap[d.countyID] = d;
                           });

              techSalaries = techSalaries.filter(d => !_.isNull(d));
              techSalariesMap = _.groupBy(techSalaries, 'countyID');

              this.setState({usTopoJson: us,
                             countyNames: countyNames,
                             medianIncomes: medianIncomesMap,
                             techSalaries: techSalaries,
                             techSalariesMap: techSalariesMap,
                             stateNames: stateNames});
          });
    }

    countyValue(county) {
        const medianHousehold = this.state.medianIncomes[county.id],
              salaries = this.state.techSalariesMap[county.name];

        if (!medianHousehold || !salaries) {
            return null;
        }

        let median = d3.median(salaries, d => d.base_salary);

        return {
            countyID: county.id,
            value: median - medianHousehold.medianIncome
        };
    }

    render() {
        let countyValues = null;

        if (this.state.techSalaries.length > 0) {
            countyValues = this.state.countyNames.map(
                county => this.countyValue(county)
            ).filter(d => !_.isNull(d));
        }

        const params = {
            bins: 20,
            width: 500,
            height: 500,
            axisMargin: 83,
            bottomMargin: 5,
            value: (d) => d.base_salary
        };

        return (
            <div className="App">
                <svg width="1000" height="500">
                    <CountyMap usTopoJson={this.state.usTopoJson}
                               stateNames={this.state.stateNames}
                               values={countyValues}
                               width={params.width}
                               height={params.height}
                               zoom={"CA"} />
            <rect x="500" y="0" width={params.width} height={params.height}
                  style={{fill: 'white'}} />
                    <Histogram {...params} x={500} y={10}
                               data={this.state.techSalaries} />
                </svg>
            </div>
        );
    }
}

/* <H1BGraph url="data/h1bs-2012-2016-final-cleaned.csv" /> */

export default App;
