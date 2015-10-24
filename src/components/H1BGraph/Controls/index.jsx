
import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import _ from 'lodash';


class Controls extends Component {
    updateYearFilter(year, reset) {
        var filter = function (d) {
            return d.submit_date.getFullYear() == year;
        };

        if (reset || !year) {
            filter = function () { return true; };
            year = '*';
        }

        this.setState({yearFilter: filter,
                       year: year});
    }

    updateJobTitleFilter(title, reset) {
        var filter = function (d) {
            return d.clean_job_title == title;
        };

        if (reset || !title) {
            filter = function () { return true; };
            title = '*';
        }

        this.setState({jobTitleFilter: filter,
                       jobTitle: title});
    }

    updateStateFilter(state, reset) {
        var filter = function (d) {
            return d.state == state;
        };

        if (reset || !state) {
            filter = function () { return true; };
            state = '*';
        }

        this.setState({stateFilter: filter,
                       state: state});
    }

    getInitialState() {
        return {yearFilter: function () { return true; },
                jobTitleFilter: function () { return true; },
                stateFilter: function () { return true; },
                year: '*',
                state: '*',
                jobTitle: '*'};
    }

    componentDidUpdate() {
        window.location.hash = [this.state.year || '*',
                                this.state.state || '*',
                                this.state.jobTitle || '*'].join("-");

        this.props.updateDataFilter(
            (function (filters) {
                return function (d) {
                    return filters.yearFilter(d)
                        && filters.jobTitleFilter(d)
                        && filters.stateFilter(d);
                };
            })(this.state)
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.state, nextState);
    }

    render() {
        var getYears = function (data) {
            return _.keys(_.groupBy(data,
                                    function (d) {
                                        return d.submit_date.getFullYear()
                                    }))
                    .map(Number);
        };

        var getJobTitles = function (data) {
            return _.keys(_.groupBy(data,
                                    function (d) {
                                        return d.clean_job_title;
                                    }));
        };

        var getStates = function (data) {
            return _.sortBy(_.keys(_.groupBy(data,
                                    function (d) {
                                        return d.state;
                                    })));
        };

        return (
            <div>
                These are the controls
            </div>
        )

        /* return (
           <div>
           <ControlRow data={this.props.data}
           getToggleNames={getYears}
           hashPart="0"
           updateDataFilter={this.updateYearFilter} />

           <ControlRow data={this.props.data}
           getToggleNames={getJobTitles}
           hashPart="2"
           updateDataFilter={this.updateJobTitleFilter} />

           <ControlRow data={this.props.data}
           getToggleNames={getStates}
           hashPart="1"
           updateDataFilter={this.updateStateFilter}
           capitalize="true" />
           </div>
           ) */
    }
}

export default Controls;
