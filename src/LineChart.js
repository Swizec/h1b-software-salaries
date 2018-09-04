import React from "react";
import * as d3 from "d3";
import styled from "styled-components";

const Line = styled.path`
    stroke: steelblue;
    stroke-width: 2px;
    fill: none;
`;

class LineChart extends React.Component {
    xScale = d3
        .scaleLinear()
        .domain(d3.extent(Object.keys(this.props.data), d => Number(d)))
        .range([0, this.props.width]);
    yScale = d3
        .scaleLinear()
        .domain([
            0,
            d3.max(Object.keys(this.props.data), k => this.props.data[k].length)
        ])
        .range([this.props.height, 0]);
    line = d3
        .line()
        .x(k => this.xScale(Number(k)))
        .y(k => this.yScale(this.props.data[k].length));

    render() {
        const { x, y, data } = this.props;

        return (
            <g transform={`translate(${x}, ${y})`}>
                <Line d={this.line(Object.keys(data))} />
            </g>
        );
    }
}

export default LineChart;
