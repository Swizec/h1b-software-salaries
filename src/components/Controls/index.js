
import React, { Component } from 'react';
import _ from 'lodash';

import ControlRow from './ControlRow';

class Controls extends Component {
    state = {
        yearFilter: () => true,
        jobTitleFilter: () => true,
        USstateFilter: () => true,
        year: '*',
        USstate: '*',
        jobTitle: '*'
    };

    componentDidMount() {
        let [year, USstate, jobTitle] = window.location.hash.replace('#', '').split("-");

        if (year !== '*' && year) {
            this.updateYearFilter(Number(year));
        }
        if (USstate !== '*' && USstate) {
            this.updateUSstateFilter(USstate);
        }
        if (jobTitle !== '*' && jobTitle) {
            this.updateJobTitleFilter(jobTitle);
        }
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
        let filter = (d) => d.clean_job_title === title;

        if (reset || !title) {
            filter = () => true;
            title = '*';
        }

        this.setState({jobTitleFilter: filter,
                       jobTitle: title});
    }

    updateUSstateFilter(USstate, reset) {
        let filter = (d) => d.USstate === USstate;

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

        this.reportUpdateUpTheChain();
    }

    reportUpdateUpTheChain() {
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

        return (
            <div>
                <ControlRow data={data}
                            toggleNames={Array.from(years.values())}
                            picked={this.state.year}
                            updateDataFilter={this.updateYearFilter.bind(this)} />

                <ControlRow data={data}
                            toggleNames={Array.from(jobTitles.values())}
                            picked={this.state.jobTitle}
                            updateDataFilter={this.updateJobTitleFilter.bind(this)} />

                <ControlRow data={data}
                            toggleNames={Array.from(USstates.values())}
                            picked={this.state.USstate}
                            updateDataFilter={this.updateUSstateFilter.bind(this)}
                            capitalize="true" />
            </div>
        )
    }
}

export default Controls;
