
import React, { Component } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import _ from 'lodash';

const choropleth = [
    'rgb(247,251,255)',
    'rgb(222,235,247)',
    'rgb(198,219,239)',
    'rgb(158,202,225)',
    'rgb(107,174,214)',
    'rgb(66,146,198)',
    'rgb(33,113,181)',
    'rgb(8,81,156)',
    'rgb(8,48,107)'
];

const BlankColor = 'rgb(240,240,240)'

const County = ({ data, geoPath, feature, quantize }) => {
    let color = BlankColor;

    if (data) {
        color = choropleth[quantize(data.medianIncome)];
    }

    return (<path d={geoPath(feature)} style={{fill: color}} title={feature.id} />)
};

class CountyMap extends Component {
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

    componentWillReceiveProps(newProps) {
        this.updateD3(newProps);
    }

    updateD3(props) {
        this.projection.translate([props.width / 2, props.height / 2]);

        if (props.medianIncomes) {
            this.quantize.domain([10000, 75000]);
        }
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
                    {counties.map((feature) => <County geoPath={this.geoPath}
                        feature={feature}
                        key={feature.id}
                        quantize={this.quantize}
                        data={_.find(this.props.medianIncomes, {countyId: feature.id})} />)}

                     <path d={this.geoPath(statesMesh)} style={{fill: 'none',
                                                                stroke: '#fff',
                                                                strokeLinejoin: 'round'}} />
                </g>
            );
        }
    }
}

export default CountyMap;
