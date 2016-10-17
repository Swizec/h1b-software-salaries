import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

// TODO: improve this structure
import './components/H1BGraph/style.css';
import Controls from './components/H1BGraph/Controls';
import MedianLine from './components/MedianLine';
import { Title, Description, GraphDescription } from './components/H1BGraph/Meta';

import Histogram from './components/Histogram';
import CountyMap from './components/CountyMap';

import PreloaderImg from './preloading.png';

const cleanIncomes = (d) => ({
    countyName: d['Name'],
    state: d['State'],
    medianIncome: Number(d['Median Household Income']),
    lowerBound: Number(d['90% CI Lower Bound']),
    upperBound: Number(d['90% CI Upper Bound'])
});

const dateParse = d3.timeParse("%m/%d/%Y");

const cleanSalary = (d) => {
    if (!d['base salary'] || Number(d['base salary']) > 300000) {
        return null;
    }

    return {employer: d.employer,
            submit_date: dateParse(d['submit date']),
            start_date: dateParse(d['start date']),
            case_status: d['case status'],
            job_title: d['job title'],
            clean_job_title: d['job title'],
            base_salary: Number(d['base salary']),
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

const Preloader = () => (
    <div className="App container">
        <h1>The average H1B in tech pays $86,164/year</h1>
        <p className="lead">Since 2012 the US tech industry has sponsored 176,075 H1B work visas. Most of them paid <b>$60,660 to $111,668</b> per year (1 standard deviation). <span>The best city for an H1B is <b>Kirkland, WA</b> with an average individual salary <b>$39,465 above local household median</b>. Median household salary is a good proxy for cost of living in an area.</span></p>
        <img src={PreloaderImg} style={{width: '100%'}} />
        <h2 className="text-center">Loading data ...</h2>
    </div>
);

class App extends Component {
    state = {
        countyNames: [],
        medianIncomes: [],
        techSalaries: [],
        salariesFilter: () => true,
        filteredBy: {
            state: '*',
            year: '*',
            jobTitle: '*'
        }
    }

    componentWillMount() {
        d3.queue()
          .defer(d3.json, 'data/us.json')
          .defer(d3.csv, 'data/us-county-names-normalized.csv')
          .defer(d3.csv, 'data/county-median-incomes.csv', cleanIncomes)
          .defer(d3.csv, 'data/h1bs-2012-2016.csv', cleanSalary)
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
                             medianIncomesByCounty: _.groupBy(medianIncomes, 'countyName'),
                             medianIncomesByState: _.groupBy(medianIncomes, 'state'),
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

    updateDataFilter(filter, filteredBy) {
        this.setState({salariesFilter: filter,
                       filteredBy: filteredBy});
    }

    render() {
        if (this.state.techSalaries.length < 1) {
            return (
                <Preloader />
            );
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

        let zoom = null,
            medianHousehold = this.state.medianIncomesByState['US'][0].medianIncome;

        if (this.state.filteredBy.state != '*') {
            zoom = this.state.filteredBy.state;
            medianHousehold = d3.mean(this.state.medianIncomesByState[zoom],
                                      d => d.medianIncome);
        }

        return (
            <div className="App container">
                <Title data={filteredSalaries} />
                <Description data={filteredSalaries} allData={this.state.techSalaries}
                             medianIncomesByCounty={this.state.medianIncomesByCounty} />

                <GraphDescription data={filteredSalaries} />

                <svg width="1100" height="500">
                    <CountyMap usTopoJson={this.state.usTopoJson}
                               stateNames={this.state.stateNames}
                               values={countyValues}
                               width={params.width}
                               height={params.height}
                               zoom={zoom} />
                    <rect x="500" y="0" width={params.width+100} height={params.height}
                          style={{fill: 'white'}} />
                    <Histogram {...params} x={500} y={10}
                               data={filteredSalaries} />
                    <MedianLine {...params} data={filteredSalaries} x={500} y={10}
                                width={params.width+100}
                                median={medianHousehold} />
                </svg>

                <Controls data={this.state.techSalaries} updateDataFilter={this.updateDataFilter.bind(this)} />

                <small>Sources: 2014 US census data for median household incomes, <a href="http://h1bdata.info/">h1bdata.info</a> for tech salaries (filtered by "software")</small>
            </div>
        );
    }
}

export default App;
