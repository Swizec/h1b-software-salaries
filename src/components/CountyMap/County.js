
import React, { Component } from 'react';
import _ from 'lodash';

const ChoroplethColors = _.reverse([
    'rgb(247,251,255)',
    'rgb(222,235,247)',
    'rgb(198,219,239)',
    'rgb(158,202,225)',
    'rgb(107,174,214)',
    'rgb(66,146,198)',
    'rgb(33,113,181)',
    'rgb(8,81,156)',
    'rgb(8,48,107)'
]);

const BlankColor = 'rgb(240,240,240)'

// Combine array of colors and quantize scale to pick fill color
// Return a <path> element
class County extends Component {
    shouldComponentUpdate(nextProps, nextState) {
        const { zoom, value } = this.props;

        return zoom !== nextProps.zoom
            || value !== nextProps.value;
    }

    render() {
        const { value, geoPath, feature, quantize } = this.props;

        let color = BlankColor;

        if (value) {
            color = ChoroplethColors[quantize(value)];
        }

        return (
            <path d={geoPath(feature)} style={{fill: color}} title={feature.id} />
        );
    }
}

export default County;
