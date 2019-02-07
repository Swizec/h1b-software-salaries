import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import * as topojson from "topojson";
import _ from "lodash";

import County from "./County";

function render({ usTopoJson, values, zoom, geoPath, quantize }) {
    // Translate topojson data into geojson data for drawing
    // Prepare a mesh for states and a list of features for counties
    const us = usTopoJson,
        USstatesMesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b),
        counties = topojson.feature(us, us.objects.counties).features;

    const countyValueMap = _.fromPairs(values.map(d => [d.countyID, d.value]));

    // Loop through counties and draw <County> components
    // Add a single <path> for state borders
    return (
        <g>
            {counties.map(feature => (
                <County
                    geoPath={geoPath}
                    feature={feature}
                    zoom={zoom}
                    key={feature.id}
                    quantize={quantize}
                    value={countyValueMap[feature.id]}
                />
            ))}

            <path
                d={geoPath(USstatesMesh)}
                style={{
                    fill: "none",
                    stroke: "#fff",
                    strokeLinejoin: "round"
                }}
            />
        </g>
    );
}

const CountyMap = ({
    width,
    height,
    zoom,
    usTopoJson,
    USstateNames,
    values
}) => {
    // rough equivalent of constructor()
    const [{ geoPath }, setGeoPath] = useState({});
    const [{ quantize }, setQuantize] = useState({});

    // update quantize when values change
    useEffect(() => {
        const quantize = d3.scaleQuantize().range(d3.range(9));

        if (values) {
            quantize.domain([
                d3.quantile(values, 0.15, d => d.value),
                d3.quantile(values, 0.85, d => d.value)
            ]);
        }

        setQuantize({ quantize });
    }, [values]);

    // update geoPath with new projection
    useEffect(() => {
        const projection = d3.geoAlbersUsa().scale(1280),
            geoPath = d3.geoPath().projection(projection);

        projection.translate([width / 2, height / 2]).scale(width * 1.3);

        if (zoom && usTopoJson) {
            const us = usTopoJson,
                USstatePaths = topojson.feature(us, us.objects.states).features,
                id = _.find(USstateNames, { code: zoom }).id;

            projection.scale(width * 4.5);

            const centroid = geoPath.centroid(_.find(USstatePaths, { id: id })),
                translate = projection.translate();

            projection.translate([
                translate[0] - centroid[0] + width / 2,
                translate[1] - centroid[1] + height / 2
            ]);
        }

        setGeoPath({ geoPath });
    }, [width, height, zoom, usTopoJson, USstateNames]);

    if (!usTopoJson || !geoPath || !quantize) {
        return null;
    } else {
        return render({ usTopoJson, values, zoom, geoPath, quantize });
    }
};

export default CountyMap;
