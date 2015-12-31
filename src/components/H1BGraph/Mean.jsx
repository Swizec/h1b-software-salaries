
import React, { Component } from 'react';
import d3 from 'd3';

class Mean extends Component {
    componentWillMount() {
        this.yScale = d3.scale.linear();

        this.update_d3(this.props);
    }

    componentWillReceiveProps(newProps) {
        this.update_d3(newProps);
    }

    update_d3(props) {
        this.yScale
            .domain([0,
                     d3.max(props.data.map(this.props.value))])
            .range([0, props.height-props.topMargin-props.bottomMargin]);
    }

    render() {
        var mean = d3.mean(this.props.data, this.props.value),
            line = d3.svg.line()
            ([[0, 5],
              [this.props.width, 5]]);

        var translate = "translate(0, "+this.yScale(mean)+")",
            meanLabel = "Mean: $"+this.yScale.tickFormat()(mean);

        return (
            <g className="mean" transform={translate}>
                <text x={this.props.width-5} y="0" textAnchor="end">
                    {meanLabel}
                </text>
                <path d={line}></path>
            </g>
        );
    }
}

export default Mean;
