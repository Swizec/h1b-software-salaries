

import { Component } from 'react';
import { scaleLinear } from 'd3-scale';
import { extent as d3extent } from 'd3-array';
import _ from 'lodash';

export default class Meta extends Component {
    getYears(data = this.props.data) {
        return _.keys(
            _.groupBy(this.props.data,
                      function (d) { return d.submit_date.getFullYear(); })
        );
    }

    getUSStates(data = this.props.data) {
        return _.keys(
            _.groupBy(this.props.data,
                      function (d) { return d.state; })
        );
    }

    getJobTitles(data = this.props.data) {
        return _.keys(
            _.groupBy(this.props.data,
                      function (d) { return d.clean_job_title; })
        );
    }

    getFormatter(data = this.props.data) {
        return scaleLinear()
                 .domain(d3extent(this.props.data,
                                  function (d) { return d.base_salary; }))
                 .tickFormat();
    }
}
