
import React, { Component } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson';

const County = ({ geoPath, feature }) => (
    <path d={geoPath(feature)} />
);

class CountyMap extends Component {
    constructor(props) {
        super(props);

        this.projection = d3.geoAlbersUsa()
                            .scale(1080);
        this.geoPath = d3.geoPath()
                         .projection(this.projection);

        this.updateD3(props);
    }

    componentWillReceiveProps(newProps) {
        this.updateD3(newProps);
    }

    updateD3(props) {
        this.projection.translate([props.width / 2, props.height / 2]);
    }

    render() {
        if (!this.props.usTopoJson) {
            return null;
        }else{
            const us = this.props.usTopoJson,
                  statesMesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b),
                  counties = topojson.feature(us, us.objects.counties).features;

            return (
                <g>
                    {counties.map((feature) => <County geoPath={this.geoPath} feature={feature} key={feature.id} />)}
                     <path d={this.geoPath(statesMesh)} style={{fill: 'none',
                                                               stroke: '#fff',
                                                               strokeLinejoin: 'round'}} />
                </g>
            );
        }
    }
}

export default CountyMap;
