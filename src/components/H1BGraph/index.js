import React, { Component } from 'react';
import * as d3 from 'd3';

import { Title, Description } from './Meta';
import Histogram from '../Histogram';
import Mean from './Mean';
import Controls from './Controls';

import './style.css';

class H1BGraph extends Component {
    constructor(props) {
        super(props);

        this.state = {
            rawData: props.rawData,
            dataFilter: () => true
        };
    }

    updateDataFilter(filter) {
        this.setState({dataFilter: filter});
    }

    render() {
        if (!this.state.rawData.length) {
            return (
                <h2>Loading data about 177,830 H1B visas in the software industry</h2>
            );
        }

        let params = {
            bins: 20,
            width: 500,
            height: 500,
            axisMargin: 83,
            topMargin: 10,
            bottomMargin: 5,
            value: (d) => d.base_salary
        },
            fullWidth = 700;

        let onlyGoodVisas = this.state
                                .rawData
                                .filter((d) => d.case_status === "certified"),
            filteredData = onlyGoodVisas.filter(this.state.dataFilter);

        return (
            <div>
                <Title data={filteredData} />
                <Description data={filteredData} allData={onlyGoodVisas} />
                <svg width={fullWidth} height={params.height}>
                    <Histogram {...params} data={filteredData} />
                    <Mean {...params} data={filteredData} width={fullWidth} />
                </svg>
                <Controls data={onlyGoodVisas} updateDataFilter={this.updateDataFilter.bind(this)} />
            </div>
        );
    }
}

export default H1BGraph;
