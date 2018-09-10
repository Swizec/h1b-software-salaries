import React from "react";
import * as d3 from "d3";

import Axis from "./Axis";

const HistogramBar = ({ percent, x, y, width, height }) => {
    let translate = `translate(${x}, ${y})`,
        label = percent.toFixed(0) + "%";

    if (percent < 1) {
        label = percent.toFixed(2) + "%";
    }

    if (width < 20) {
        label = label.replace("%", "");
    }

    if (width < 10) {
        label = "";
    }

    return (
        <g transform={translate} className="bar">
            <rect
                width={width}
                height={height - 2}
                transform="translate(0, 1)"
            />
            <text textAnchor="end" x={width - 5} y={height / 2 + 3}>
                {label}
            </text>
        </g>
    );
};

class Histogram extends React.Component {
    state = {
        histogram: d3.histogram(),
        widthScale: d3.scaleLinear(),
        yScale: d3.scaleLinear()
    };

    static getDerivedStateFromProps(props, state) {
        let { histogram, widthScale, yScale } = state;

        histogram.thresholds(props.bins).value(props.value);

        const bars = histogram(props.data),
            counts = bars.map(d => d.length);

        widthScale
            .domain([d3.min(counts), d3.max(counts)])
            .range([0, props.width - props.axisMargin]);

        yScale
            .domain([0, d3.max(bars, d => d.x1)])
            .range([0, props.height - props.y - props.bottomMargin]);

        return {
            ...state,
            histogram,
            widthScale,
            yScale
        };
    }

    makeBar = bar => {
        const { yScale, widthScale } = this.state;

        let percent = (bar.length / this.props.data.length) * 100;

        let props = {
            percent: percent,
            x: this.props.axisMargin,
            y: yScale(bar.x0),
            width: widthScale(bar.length),
            height: yScale(bar.x1 - bar.x0),
            key: "histogram-bar-" + bar.x0
        };

        return <HistogramBar {...props} />;
    };

    render() {
        const { histogram, yScale } = this.state,
            { x, y, data, axisMargin } = this.props;

        const bars = histogram(data);

        return (
            <g className="histogram" transform={`translate(${x}, ${y})`}>
                <g className="bars">{bars.map(this.makeBar)}</g>
                <Axis x={axisMargin - 3} y={0} data={bars} scale={yScale} />
            </g>
        );
    }
}

export default Histogram;
