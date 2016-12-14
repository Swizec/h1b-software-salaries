
import React, { Component } from 'react';
import _ from 'lodash';

import ControlRow from './ControlRow';

class Controls extends Component {
    constructor() {
        super();

        this.state = {
            yearFilter: () => true,
            jobTitleFilter: () => true,
            USstateFilter: () => true,
            year: '*',
            USstate: '*',
            jobTitle: '*'
        };
    }

    updateYearFilter(year, reset) {
        let filter = (d) => d.submit_date.getFullYear() === year;

        if (reset || !year) {
            filter = () => true;
            year = '*';
        }

        this.setState({yearFilter: filter,
                       year: year});
    }

    updateJobTitleFilter(title, reset) {
        var filter = (d) => d.clean_job_title === title;

        if (reset || !title) {
            filter = () => true;
            title = '*';
        }

        this.setState({jobTitleFilter: filter,
                       jobTitle: title});
    }

    updateUSStateFilter(USstate, reset) {
        var filter = (d) => d.USstate === USstate;

        if (reset || !USstate) {
            filter = () => true;
            USstate = '*';
        }

        this.setState({USstateFilter: filter,
                       USstate: USstate});
    }

    componentDidUpdate() {
        window.location.hash = [this.state.year || '*',
                                this.state.USstate || '*',
                                this.state.jobTitle || '*'].join("-");

        this.props.updateDataFilter(
            ((filters) => {
                return (d) =>  filters.yearFilter(d)
                            && filters.jobTitleFilter(d)
                            && filters.USstateFilter(d);
            })(this.state),
            {USstate: this.state.USstate,
             year: this.state.year,
             jobTitle: this.state.jobTitle}
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


        let getUSStates = (data) => _.sortBy(_.keys(_.groupBy(data, (d) => d.USstate)));


        return (
            <div>
                <ControlRow data={this.props.data}
                            getToggleNames={getYears}
                            hashPart="0"
                            updateDataFilter={this.updateYearFilter.bind(this)} />

                <ControlRow data={this.props.data}
                            getToggleNames={getJobTitles}
                            hashPart="2"
                            updateDataFilter={this.updateJobTitleFilter.bind(this)} />

                <ControlRow data={this.props.data}
                            getToggleNames={getUSStates}
                            hashPart="1"
                            updateDataFilter={this.updateUSStateFilter.bind(this)}
                            capitalize="true" />
            </div>
        )
    }
}

export default Controls;
