import React, { useEffect, useState } from "react";
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

function render({ histogram, yScale, widthScale, x, y, data, axisMargin }) {
    const makeBar = bar => {
        let percent = (bar.length / data.length) * 100;

        let props = {
            percent: percent,
            x: axisMargin,
            y: yScale(bar.x1),
            width: widthScale(bar.length),
            height: yScale(bar.x0) - yScale(bar.x1),
            key: "histogram-bar-" + bar.x0
        };

        return <HistogramBar {...props} />;
    };

    const bars = histogram(data);

    return (
        <g className="histogram" transform={`translate(${x}, ${y})`}>
            <g className="bars">{bars.map(d => makeBar(d, bars.length))}</g>
            <Axis x={axisMargin - 3} y={0} data={bars} scale={yScale} />
        </g>
    );
}

const Histogram = ({
    x,
    y,
    data,
    axisMargin,
    bins,
    value,
    width,
    height,
    bottomMargin
}) => {
    // rough equivalent of state
    const [{ histogram, widthScale, yScale }, setD3objects] = useState({});

    useEffect(() => {
        const histogram = d3.histogram(),
            widthScale = d3.scaleLinear(),
            yScale = d3.scaleLinear();

        histogram.thresholds(bins).value(value);

        const bars = histogram(data),
            counts = bars.map(d => d.length);

        widthScale
            .domain([d3.min(counts), d3.max(counts)])
            .range([0, width - axisMargin]);

        yScale
            .domain([0, d3.max(bars, d => d.x1)])
            .range([height - y - bottomMargin, 0]);

        setD3objects({ histogram, widthScale, yScale });
    }, [bins, data.length, height, y, bottomMargin, axisMargin]);

    if (!histogram || !widthScale || !yScale) {
        return null;
    } else {
        return render({
            histogram,
            yScale,
            widthScale,
            x,
            y,
            data,
            axisMargin
        });
    }
};

export default Histogram;
