
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
        const data = this.props.data;

        const years = new Set(data.map(d => d.submit_date.getFullYear())),
              jobTitles = new Set(data.map(d => d.clean_job_title)),
              USstates = new Set(data.map(d => d.USstate));

        console.log(Array.from(jobTitles.values()));

        return (
            <div>
                <ControlRow data={data}
                            toggleNames={Array.from(years.values())}
                            hashPart="0"
                            updateDataFilter={this.updateYearFilter.bind(this)} />

                 <ControlRow data={data}
                             getToggleNames={Array.from(jobTitles.values())}
                             hashPart="2"
                             updateDataFilter={this.updateJobTitleFilter.bind(this)} />

                 <ControlRow data={data}
                             getToggleNames={Array.from(USstates.values())}
                             hashPart="1"
                             updateDataFilter={this.updateUSStateFilter.bind(this)}
                             capitalize="true" />

            </div>
        )
    }
}

export default Controls;
