
import React, { Component } from 'react';
import _ from 'lodash';

import ControlRow from './ControlRow';

class Controls extends Component {
    constructor() {
        super();

        this.state = {
            yearFilter: () => true,
            jobTitleFilter: () => true,
            stateFilter: () => true,
            year: '*',
            state: '*',
            jobTitle: '*'
        };
    }

    updateYearFilter(year, reset) {
        let filter = (d) => d.submit_date.getFullYear() == year;

        if (reset || !year) {
            filter = () => true;
            year = '*';
        }

        this.setState({yearFilter: filter,
                       year: year});
    }

    updateJobTitleFilter(title, reset) {
        var filter = (d) => d.clean_job_title == title;

        if (reset || !title) {
            filter = () => true;
            title = '*';
        }

        this.setState({jobTitleFilter: filter,
                       jobTitle: title});
    }

    updateStateFilter(state, reset) {
        var filter = (d) => d.state == state;

        if (reset || !state) {
            filter = () => true;
            state = '*';
        }

        this.setState({stateFilter: filter,
                       state: state});
    }

    componentDidUpdate() {
        window.location.hash = [this.state.year || '*',
                                this.state.state || '*',
                                this.state.jobTitle || '*'].join("-");

        this.props.updateDataFilter(
            ((filters) => {
                return (d) =>  filters.yearFilter(d)
                            && filters.jobTitleFilter(d)
                            && filters.stateFilter(d);
            })(this.state)
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.state, nextState);
    }

    render() {
        let getYears = (data) => _.keys(_.groupBy(data,
                                                  (d) => d.submit_date.getFullYear()))
                                  .map(Number);

        let getJobTitles = (data) => _.keys(_.groupBy(data, (d) => d.clean_job_title));


        let getStates = (data) => _.sortBy(_.keys(_.groupBy(data, (d) => d.state)));


        return (
            <div>
                <ControlRow data={this.props.data}
                            getToggleNames={getYears}
                            hashPart="0"
                            updateDataFilter={::this.updateYearFilter} />

                <ControlRow data={this.props.data}
                            getToggleNames={getJobTitles}
                            hashPart="2"
                            updateDataFilter={::this.updateJobTitleFilter} />

                <ControlRow data={this.props.data}
                            getToggleNames={getStates}
                            hashPart="1"
                            updateDataFilter={::this.updateStateFilter}
                            capitalize="true" />
            </div>
        )
    }
}

export default Controls;
