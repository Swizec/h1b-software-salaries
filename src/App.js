import React from "react";
import * as d3 from "d3";
import _ from "lodash";
import "./style.css";

import Controls from "./components/Controls";
import MedianLine from "./components/MedianLine";
import { Title, Description, GraphDescription } from "./components/Meta";

import Histogram from "./components/Histogram";
import CountyMap from "./components/CountyMap";
import Preloader from "./components/Preloader";

import { loadAllData } from "./DataHandling";

class App extends React.Component {
    state = {
        countyNames: [],
        medianIncomes: [],
        techSalaries: [],
        salariesFilter: () => true,
        filteredBy: {
            USstate: "*",
            year: "*",
            jobTitle: "*"
        }
    };

    componentDidMount() {
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

    updateDataFilter = (filter, filteredBy) => {
        this.setState({
            salariesFilter: filter,
            filteredBy: filteredBy
        });
    };

    render() {
        const {
            techSalaries,
            countyNames,
            medianIncomesByUSState,
            filteredBy,
            medianIncomesByCounty
        } = this.state;

        if (techSalaries.length < 1) {
            return <Preloader />;
        }

        const filteredSalaries = techSalaries.filter(this.state.salariesFilter),
            filteredSalariesMap = _.groupBy(filteredSalaries, "countyID");

        const countyValues = countyNames
            .map(county => this.countyValue(county, filteredSalariesMap))
            .filter(d => !_.isNull(d));

        const params = {
            bins: 10,
            width: 500,
            height: 500,
            axisMargin: 83,
            bottomMargin: 5,
            value: d => d.base_salary
        };

        let zoom = null,
            medianHousehold = medianIncomesByUSState["US"][0].medianIncome;

        if (filteredBy.USstate !== "*") {
            zoom = filteredBy.USstate;
            medianHousehold = d3.mean(
                medianIncomesByUSState[zoom],
                d => d.medianIncome
            );
        }

        if (filteredSalaries.length < 10) {
            return (
                <div className="App container">
                    <h2>
                        Selection too small for useful comparison, pick
                        something else
                    </h2>

                    <Controls
                        data={techSalaries}
                        updateDataFilter={this.updateDataFilter}
                    />

                    <small>
                        Sources: 2014 US census data for median household
                        incomes, <a href="http://h1bdata.info/">h1bdata.info</a>{" "}
                        for tech salaries (filtered by "software")
                    </small>
                </div>
            );
        }

        return (
            <div className="App container">
                <Title data={filteredSalaries} filteredBy={filteredBy} />
                <Description
                    data={filteredSalaries}
                    allData={techSalaries}
                    medianIncomesByCounty={medianIncomesByCounty}
                    filteredBy={filteredBy}
                />

                <GraphDescription
                    data={filteredSalaries}
                    filteredBy={this.state.filteredBy}
                />

                <svg width="1100" height="500">
                    <CountyMap
                        usTopoJson={this.state.usTopoJson}
                        USstateNames={this.state.USstateNames}
                        values={countyValues}
                        width={params.width}
                        height={params.height}
                        zoom={zoom}
                    />

                    <rect
                        x="500"
                        y="0"
                        width={params.width + 100}
                        height={params.height}
                        style={{ fill: "white" }}
                    />

                    <Histogram
                        {...params}
                        x={500}
                        y={10}
                        data={filteredSalaries}
                    />
                    <MedianLine
                        {...params}
                        data={filteredSalaries}
                        x={500}
                        y={10}
                        width={params.width + 100}
                        median={medianHousehold}
                    />
                </svg>

                <Controls
                    data={techSalaries}
                    updateDataFilter={this.updateDataFilter}
                />

                <small>
                    Sources: 2014 US census data for median household incomes,{" "}
                    <a href="http://h1bdata.info/">h1bdata.info</a> for tech
                    salaries (filtered by "software")
                </small>
            </div>
        );
    }
}

export default App;
