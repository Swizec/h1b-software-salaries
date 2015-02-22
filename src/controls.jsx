
var React = require('react'),
    _ = require('lodash');

var Controls = React.createClass({
    updateYearFilter: function (year, reset) {
        var filter = function (d) {
            return d.submit_date.getFullYear() == year;
        };

        if (reset) {
            filter = function () { return true; };
        }

        this.setState({yearFilter: filter});
    },

    updateJobTitleFilter: function (title, reset) {
        var filter = function (d) {
            return d.clean_job_title == title;
        };

        if (reset) {
            filter = function () { return true; };
        }

        this.setState({jobTitleFilter: filter});
    },

    updateStateFilter: function (state, reset) {
        var filter = function (d) {
            return d.state == state;
        };

        if (reset) {
            filter = function () { return true; };
        }

        this.setState({stateFilter: filter});
    },

    getInitialState: function () {
        return {yearFilter: function () { return true; },
                jobTitleFilter: function () { return true; },
                stateFilter: function () { return true; }};
    },

    componentDidUpdate: function () {
        this.props.updateDataFilter(
            (function (filters) {
                return function (d) {
                    return filters.yearFilter(d)
                        && filters.jobTitleFilter(d)
                        && filters.stateFilter(d);
                };
            })(this.state)
        );
    },

    shouldComponentUpdate: function (nextProps, nextState) {
        return !_.isEqual(this.state, nextState);
    },

    render: function () {
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
                <ControlRow data={this.props.data}
                            getToggleValues={getYears}
                            updateDataFilter={this.updateYearFilter} />

                <ControlRow data={this.props.data}
                            getToggleValues={getJobTitles}
                            updateDataFilter={this.updateJobTitleFilter} />

                <ControlRow data={this.props.data}
                            getToggleValues={getStates}
                            updateDataFilter={this.updateStateFilter}
                            capitalize="true" />
            </div>
        )
    }
});

var ControlRow = React.createClass({
    makePick: function (picked, newState) {
        var togglesOn = this.state.togglesOn;

        togglesOn = _.mapValues(togglesOn,
                              function (value, key) {
                                  return newState && key == picked;
                              });

        // if newState is false, we want to reset
        this.props.updateDataFilter(picked, !newState);

        this.setState({togglesOn: togglesOn});
    },

    getInitialState: function () {
        var toggles = this.props.getToggleValues(this.props.data),
            togglesOn = _.zipObject(toggles,
                                    toggles.map(function () { return false; }));

        return {togglesOn: togglesOn};
    },

    render: function () {

        return (
            <div className="row">
                <div className="col-md-12">
            {this.props.getToggleValues(this.props.data).map(function (value) {
                var key = "toggle-"+value,
                    label = value;

                if (this.props.capitalize) {
                    label = label.toUpperCase();
                }

                return (
                    <Toggle label={label}
                            value={value}
                            key={key}
                            on={this.state.togglesOn[value]}
                            onClick={this.makePick} />
                );
             }.bind(this))}
                </div>
            </div>
        );
    }
});

var Toggle = React.createClass({
    getInitialState: function () {
        return {on: false};
    },

    handleClick: function (event) {
        var newState = !this.state.on;
        this.setState({on: newState});
        this.props.onClick(this.props.value, newState);
    },

    componentWillReceiveProps: function (newProps) {
        this.setState({on: newProps.on});
    },

    render: function () {
        var className = "btn btn-default";

        if (this.state.on) {
            className += " btn-primary";
        }

        return (
            <button className={className} onClick={this.handleClick}>
                {this.props.label}
            </button>
        );
    }
});

module.exports = Controls;
