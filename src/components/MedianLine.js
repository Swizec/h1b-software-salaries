import React, { useState, useEffect } from "react";
import * as d3 from "d3";

const MedianLine = ({
    data,
    value,
    width,
    height,
    x,
    y,
    bottomMargin,
    median
}) => {
    const [{ yScale, line }, setYScale] = useState({});

    // Calculate D3 objects on the smallest possible amount of change
    // then using local state to update what the outside uses
    useEffect(() => {
        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(data, value)])
            .range([height - y - bottomMargin, 0]);
        const line = d3.line()([[0, 5], [width, 5]]);

        setYScale({ yScale, line });
    }, [data.length, value, width, height, y, bottomMargin]);

    if (!yScale) {
        return null;
    }

    const medianValue = median || d3.median(data, value);

    const translate = `translate(${x}, ${yScale(medianValue)})`,
        medianLabel = `Median Household: $${yScale.tickFormat()(median)}`;

    return (
        <g className="mean" transform={translate}>
            <text
                x={width - 5}
                y="0"
                textAnchor="end"
                style={{ background: "purple" }}
            >
                {medianLabel}
            </text>
            <path d={line} />
        </g>
    );
};

export default MedianLine;
