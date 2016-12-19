
import React, { Component } from 'react';
import * as d3 from 'd3';

import Axis from './Axis';

const HistogramBar = ({ percent, x, y, width, height }) => {
    let translate = `translate(${x}, ${y})`,
        label = percent.toFixed(0)+'%';

    if (percent < 1) {
        label = percent.toFixed(2)+"%";
    }

    if (width < 20) {
        label = label.replace("%", "");
    }

    if (width < 10) {
        label = "";
    }

    return (
        <g transform={translate} className="bar">
            <rect width={width}
                  height={height-2}
                  transform="translate(0, 1)">
            </rect>
            <text textAnchor="end"
                  x={width-5}
                  y={height/2+3}>
                {label}
            </text>
        </g>
    );
}

class Histogram extends Component {
    constructor(props) {
        super();

        this.histogram = d3.histogram();
        this.widthScale = d3.scaleLinear();
        this.yScale = d3.scaleLinear();

        this.updateD3(props);
    }

    componentWillReceiveProps(newProps) {
        this.updateD3(newProps);
    }

    updateD3(props) {
        this.histogram
            .thresholds(props.bins)
            .value(props.value);

        const bars = this.histogram(props.data),
              counts = bars.map((d) => d.length);

        this.widthScale
            .domain([d3.min(counts), d3.max(counts)])
            .range([0, props.width-props.axisMargin]);

        this.yScale
            .domain([0, d3.max(bars, (d) => d.x1)])
            .range([0, props.height-props.y-props.bottomMargin]);
    }

    makeBar(bar) {
        let percent = bar.length/this.props.data.length*100;

        let props = {percent: percent,
                     x: this.props.axisMargin,
                     y: this.yScale(bar.x0),
                     width: this.widthScale(bar.length),
                     height: this.yScale(bar.x1 - bar.x0),
                     key: "histogram-bar-"+bar.x0}

        return (
            <HistogramBar {...props} />
        );
    }

    render() {
        const translate = `translate(${this.props.x}, ${this.props.y})`,
              bars = this.histogram(this.props.data);

        return (
            <g className="histogram" transform={translate}>
                <g className="bars">
                    {bars.map(this.makeBar.bind(this))}
                </g>
                <Axis x={this.props.axisMargin-3} y={0} data={bars} scale={this.yScale} />
            </g>
        );
    }
}


export default Histogram;
