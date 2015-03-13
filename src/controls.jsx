
var React = require('react'),
    _ = require('lodash');

var Controls = React.createClass({
    updateYearFilter: function (year, reset) {
        var filter = function (d) {
            return d.submit_date.getFullYear() == year;
        };

        if (reset || !year) {
            filter = function () { return true; };
            year = '*';
        }

        this.setState({yearFilter: filter,
                       year: year});
    },

    updateJobTitleFilter: function (title, reset) {
        var filter = function (d) {
            return d.clean_job_title == title;
        };

        if (reset || !title) {
            filter = function () { return true; };
            title = '*';
        }

        this.setState({jobTitleFilter: filter,
                       jobTitle: title});
    },

    updateStateFilter: function (state, reset) {
        var filter = function (d) {
            return d.state == state;
        };

        if (reset || !state) {
            filter = function () { return true; };
            state = '*';
        }

        this.setState({stateFilter: filter,
                       state: state});
    },

    getInitialState: function () {
        return {yearFilter: function () { return true; },
                jobTitleFilter: function () { return true; },
                stateFilter: function () { return true; },
                year: '*',
                state: '*',
                jobTitle: '*'};
    },

    componentDidUpdate: function () {
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
        )
    }
});

var ControlRow = React.createClass({
    makePick: function (picked, newState) {
        var toggleValues = this.state.toggleValues;

        toggleValues = _.mapValues(toggleValues,
                              function (value, key) {
                                  return newState && key == picked;
                              });

        // if newState is false, we want to reset
        this.props.updateDataFilter(picked, !newState);

        this.setState({toggleValues: toggleValues});
    },

    getInitialState: function () {
        var toggles = this.props.getToggleNames(this.props.data),
            toggleValues = _.zipObject(toggles,
                                       toggles.map(function () { return false; }));

        return {toggleValues: toggleValues};
    },

    componentWillMount: function () {
        var hash = window.location.hash.replace('#', '').split("-");

        if (hash.length) {
            var fromUrl = hash[this.props.hashPart];

            if (fromUrl != '*' && fromUrl != '') {
                this.makePick(fromUrl, true);
            }else{
                // reset
                this.props.updateDataFilter('', true);
            }
        }
    },

    render: function () {

        return (
            <div className="row">
                <div className="col-md-12">
            {this.props.getToggleNames(this.props.data).map(function (name) {
                var key = "toggle-"+name,
                    label = name;

                if (this.props.capitalize) {
                    label = label.toUpperCase();
                }

                return (
                    <Toggle label={label}
                            name={name}
                            key={key}
                            value={this.state.toggleValues[name]}
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
        return {value: false};
    },

    handleClick: function (event) {
       var newValue = !this.state.value;
       this.setState({value: newValue});
       this.props.onClick(this.props.name, newValue);
    },

    componentWillReceiveProps: function (newProps) {
        this.setState({value: newProps.value});
    },

    render: function () {
        var className = "btn btn-default";

        if (this.state.value) {
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
