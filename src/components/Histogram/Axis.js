import React from "react";
import * as d3 from "d3";
import { useD3 } from "d3blackbox";

const Axis = ({ x, y, scale, data }) => {
    const refAnchor = useD3(anchor => {
        const axis = d3
            .axisLeft()
            .tickFormat(d => `${d3.format(".2s")(d)}`)
            .scale(scale)
            .ticks(data.length);
        d3.select(anchor).call(axis);
    });

    return <g ref={refAnchor} transform={`translate(${x}, ${y})`} />;
};

export default Axis;
