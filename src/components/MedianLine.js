
import React, { Component } from 'react';
import * as d3 from 'd3';

class MedianLine extends Component {
    componentWillMount() {
        this.yScale = d3.scaleLinear();

        this.updateD3(this.props);
    }

    componentWillReceiveProps(newProps) {
        this.updateD3(newProps);
    }

    updateD3(props) {
        this.yScale
            .domain([0,
                     d3.max(props.data, props.value)])
            .range([0, props.height-props.y-props.bottomMargin]);
    }

    render() {
        const median = this.props.median || d3.median(this.props.data, this.props.value),
              line = d3.line()([[0, 5],
                                [this.props.width, 5]]);

        const translate = `translate(${this.props.x}, ${this.yScale(median)})`,
              medianLabel = `Median Household: $${this.yScale.tickFormat()(median)}`;

        return (
            <g className="mean" transform={translate}>
                <text x={this.props.width-5} y="0" textAnchor="end">
                    {medianLabel}
                </text>
                <path d={line}></path>
            </g>
        );
    }
}

export default MedianLine;
