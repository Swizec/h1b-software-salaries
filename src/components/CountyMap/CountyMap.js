
import React, { Component } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import _ from 'lodash';


import County from './County';


class CountyMap extends Component {
    // Setup default D3 objects
    // projection - defines our geo projection, how the map looks
    // geoPath - calculates d attribute of <path> so it looks like a map
    // quantize - threshold scale with 9 buckets
    constructor(props) {
        super(props);

        this.projection = d3.geoAlbersUsa()
                            .scale(1280);
        this.geoPath = d3.geoPath()
                         .projection(this.projection);
        this.quantize = d3.scaleQuantize()
                          .range(d3.range(9));

        this.updateD3(props);
    }

    // update D3 objects when props update
    componentWillReceiveProps(newProps) {
        this.updateD3(newProps);
    }

    // Re-center the geo projection
    // Update domain of quantize scale
    updateD3(props) {
        this.projection
            .translate([props.width / 2, props.height / 2])
            .scale(props.width*1.3);

        if (props.zoom && props.usTopoJson) {
            const us = props.usTopoJson,
                  statePaths = topojson.feature(us, us.objects.states).features,
                  id = _.find(props.USstateNames, {code: props.zoom}).id;

            this.projection.scale(props.width*4.5);

            const centroid = this.geoPath.centroid(_.find(statePaths, {id: id})),
                  translate = this.projection.translate();

            this.projection.translate([
                translate[0] - centroid[0] + props.width / 2,
                translate[1] - centroid[1] + props.height / 2
            ]);
        }

        if (props.values) {
            this.quantize.domain([d3.quantile(props.values, 0.15, d => d.value),
                                  d3.quantile(props.values, 0.85, d => d.value)]);
        }
    }

    // If no data, do nothing (we might mount before data loads into props)
    render() {
        if (!this.props.usTopoJson) {
            return null;
        }else{
            // Translate topojson data into geojson data for drawing
            // Prepare a mesh for states and a list of features for counties
            const us = this.props.usTopoJson,
                  statesMesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b),
                  counties = topojson.feature(us, us.objects.counties).features;

            const countyValueMap = _.fromPairs(this.props.values
                                                   .map(d => [d.countyID, d.value]));

            // Loop through counties and draw <County> components
            // Add a single <path> for state borders
            return (
                <g>
                    {counties.map((feature) => (
                        <County geoPath={this.geoPath}
                                feature={feature}
                                zoom={this.props.zoom}
                                key={feature.id}
                                quantize={this.quantize}
                                value={countyValueMap[feature.id]} />
                     ))}

                     <path d={this.geoPath(statesMesh)} style={{fill: 'none',
                                                                stroke: '#fff',
                                                                strokeLinejoin: 'round'}} />
                </g>
            );
        }
    }
}

export default CountyMap;
