import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import H1BGraph from './components/H1BGraph';
import CountyMap from './components/CountyMap';

const parseNumber = (n) => {
    n = Number(n.replace('.', ''));
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

class App extends Component {
    state = {}

    componentWillMount() {
        d3.queue()
          .defer(d3.json, 'data/us.json')
          .defer(d3.csv, 'data/us-county-names-normalized.csv')
          .defer(d3.csv, 'data/county-median-incomes-normalized.csv', cleanIncomes)
          .await((error, us, countyNames, medianIncomes) => {
              countyNames = countyNames.map(({ id, name }) => ({id: Number(id),
                                                                name: name}));

              medianIncomes = medianIncomes.filter(d => _.find(countyNames, {name: d['countyName']}))
                                           .map((d) => {
                                               d['countyId'] = _.find(countyNames,
                                                                      {name: d['countyName']}).id;
                                               return d;
                                           });

              console.log(d3.min(medianIncomes, d => d.medianIncome));
              console.log(d3.max(medianIncomes, d => d.medianIncome));

              console.log(medianIncomes.filter(d => d.medianIncome == 21658));
              console.log(medianIncomes.filter(d => d.medianIncome == 125635));


              this.setState({usTopoJson: us,
                             countyNames: countyNames,
                             medianIncomes: medianIncomes});
          });
    }

    render() {
        return (
            <div className="App">
                <svg width="1024" height="800">
                    <CountyMap usTopoJson={this.state.usTopoJson}
                               medianIncomes={this.state.medianIncomes}
                               width={1024}
                               height={800} />
                </svg>
            </div>
        );
    }
}

/* <H1BGraph url="data/h1bs-2012-2016-final-cleaned.csv" /> */

export default App;
