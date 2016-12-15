import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import './style.css';

import Controls from './components/Controls';
import MedianLine from './components/MedianLine';
import { Title, Description, GraphDescription } from './components/Meta';

import Histogram from './components/Histogram';
import CountyMap from './components/CountyMap';
import Preloader from './components/Preloader';

import { loadAllData } from './DataHandling';

class App extends Component {
    state = {
        countyNames: [],
        medianIncomes: [],
        techSalaries: [],
        salariesFilter: () => true,
        filteredBy: {
            USstate: '*',
            year: '*',
            jobTitle: '*'
        }
    }

    componentWillMount() {
        loadAllData(data => this.setState(data));
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
            medianHousehold = this.state.medianIncomesByUSState['US'][0].medianIncome;

        if (this.state.filteredBy.USstate !== '*') {
            zoom = this.state.filteredBy.USstate;
            medianHousehold = d3.mean(this.state.medianIncomesByUSState[zoom],
                                      d => d.medianIncome);
        }

        return (
            <div className="App container">
                <Title data={filteredSalaries} filteredBy={this.state.filteredBy} />
                <Description data={filteredSalaries}
                             allData={this.state.techSalaries}
                             medianIncomesByCounty={this.state.medianIncomesByCounty}
                             filteredBy={this.state.filteredBy} />

                <GraphDescription data={filteredSalaries}
                                  filteredBy={this.state.filteredBy} />

                <svg width="1100" height="500">
                    <CountyMap usTopoJson={this.state.usTopoJson}
                               USstateNames={this.state.USstateNames}
                               values={countyValues}
                               width={params.width}
                               height={params.height}
                               zoom={zoom} />

                    <rect x="500" y="0"
                          width={params.width+100} height={params.height}
                          style={{fill: 'white'}} />

                    <Histogram {...params} x={500} y={10}
                               data={filteredSalaries} />
                    <MedianLine {...params} data={filteredSalaries} x={500} y={10}
                                width={params.width+100}
                                median={medianHousehold} />
                </svg>

                <Controls data={this.state.techSalaries}
                          updateDataFilter={this.updateDataFilter.bind(this)} />

                <small>Sources: 2014 US census data for median household incomes, <a href="http://h1bdata.info/">h1bdata.info</a> for tech salaries (filtered by "software")</small>
            </div>
        );
    }
}

export default App;
