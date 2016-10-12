import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

// TODO: improve this structure
import './components/H1BGraph/style.css';
import Controls from './components/H1BGraph/Controls';

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
        techSalaries: [],
        salariesFilter: () => true
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

              this.setState({usTopoJson: us,
                             countyNames: countyNames,
                             medianIncomes: medianIncomesMap,
                             techSalaries: techSalaries,
                             stateNames: stateNames});
          });
    }

    countyValue(county, techSalariesMap) {
        const medianHousehold = this.state.medianIncomes[county.id],
              salaries = techSalariesMap[county.name];

        if (!medianHousehold || !salaries) {
            return null;
        }

        let median = d3.median(salaries, d => d.base_salary);

        return {
            countyID: county.id,
            value: median - medianHousehold.medianIncome
        };
    }

    updateDataFilter(filter) {
        this.setState({salariesFilter: filter});
    }

    render() {
        if (this.state.techSalaries.length < 1) {
            return (
                <div className="App">
                    <h1>Loading a lot of data, please be patient 🤓</h1>
                </div>);
        }

        const filteredSalaries = this.state.techSalaries.filter(this.state.salariesFilter),
              filteredSalariesMap = _.groupBy(filteredSalaries, 'countyID');

        const countyValues = this.state.countyNames.map(
            county => this.countyValue(county, filteredSalariesMap)
        ).filter(d => !_.isNull(d));

        const params = {
            bins: 10,
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
                               data={filteredSalaries} />
                </svg>

                <Controls data={this.state.techSalaries} updateDataFilter={this.updateDataFilter.bind(this)} />
            </div>
        );
    }
}

/* <H1BGraph url="data/h1bs-2012-2016-final-cleaned.csv" /> */

export default App;
