
var React = require('react'),
    _ = require('lodash'),
    d3 = require('d3'),
    drawers = require('./drawers.jsx'),
    Controls = require('./controls.jsx'),
    States = require('./states.js');

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.decapitalize = function () {
    return this.charAt(0).toLowerCase() + this.slice(1);
}

var H1BGraph = React.createClass({
    cleanJobs: function (title) {
        title = title.replace(/[^a-z ]/gi, '');

        if (title.match(/consultant|specialist|expert|prof|advis|consult/)) {
            title = "consultant";
        }else if (title.match(/analyst|strateg|scien/)) {
            title = "analyst";
        }else if (title.match(/manager|associate|train|manag|direct|supervis|mgr|chief/)) {
            title = "manager";
        }else if (title.match(/architect/)) {
            title = "architect";
        }else if (title.match(/lead|coord/)) {
            title = "lead";
        }else if (title.match(/eng|enig|ening|eign/)) {
            title = "engineer";
        }else if (title.match(/program/)) {
            title = "programmer";
        }else if (title.match(/design/)) {
            title = "designer";
        }else if (title.match(/develop|dvelop|develp|devlp|devel|deelop|devlop|devleo|deveo/)) {
            title = "developer";
        }else if (title.match(/tester|qa|quality|assurance|test/)) {
            title = "tester";
        }else if (title.match(/admin|support|packag|integrat/)) {
            title = "administrator";
        }else{
            title = "other";
        }

        return title;
    },

    loadRawData: function () {
        var dateFormat = d3.time.format("%m/%d/%Y");
        d3.csv(this.props.url)
          .row(function (d) {
              if (!d['base salary']) {
                  return null;
              }

              return {employer: d.employer,
                      submit_date: dateFormat.parse(d['submit date']),
                      start_date: dateFormat.parse(d['start date']),
                      case_status: d['case status'],
                      job_title: d['job title'],
                      clean_job_title: this.cleanJobs(d['job title']),
                      base_salary: Number(d['base salary']),
                      salary_to: d['salary to'] ? Number(d['salary to']) : null,
                      city: d.city,
                      state: d.state};
          }.bind(this))
          .get(function (error, rows) {
              if (error) {
                  console.error(error);
                  console.error(error.stack);
              }else{
                  this.setState({rawData: rows});
              }
          }.bind(this));
    },

    updateDataFilter: function (filter) {
        this.setState({dataFilter: filter});
    },

    getInitialState: function () {
        return {rawData: [],
                dataFilter: function () { return true; }};
    },

    componentDidMount: function () {
        this.loadRawData();
    },

    render: function () {
        if (!this.state.rawData.length) {
            return (
                <h2>Loading data about 81,000 H1B visas in the software industry</h2>
            );
        }

        var params = {
            bins: 20,
            width: 500,
            height: 500,
            axisMargin: 83,
            topMargin: 10,
            bottomMargin: 5,
            value: function (d) { return d.base_salary; }
        },
            fullWidth = 700;

        var onlyGoodVisas = this.state.rawData.filter(function (d) {
            return d.case_status == "certified";
        }),
            filteredData = onlyGoodVisas.filter(this.state.dataFilter);

        return (
            <div>
                <Title data={filteredData} />
                <Description data={filteredData} allData={onlyGoodVisas} />
                <div className="row">
                    <div className="col-md-12">
                        <svg width={fullWidth} height={params.height}>
                            <drawers.Histogram {...params} data={filteredData} />
                            <drawers.Mean {...params} data={filteredData} width={fullWidth} />
                        </svg>
                    </div>
                </div>
                <Controls data={onlyGoodVisas} updateDataFilter={this.updateDataFilter} />
            </div>
        );
    }
});

var MetaMixin = {
    getYears: function (data) {
        data || (data = this.props.data);

        return _.keys(
            _.groupBy(this.props.data,
                      function (d) { return d.submit_date.getFullYear(); })
        );
    },

    getStates: function (data) {
        data || (data = this.props.data);

        return _.keys(
            _.groupBy(this.props.data,
                      function (d) { return d.state; })
        );
    },

    getJobTitles: function (data) {
        data || (data = this.props.data);

        return _.keys(
            _.groupBy(this.props.data,
                      function (d) { return d.clean_job_title; })
        );
    },

    getFormatter: function (data) {
        data || (data = this.props.data);

        return d3.scale.linear()
                 .domain(d3.extent(this.props.data,
                                   function (d) { return d.base_salary; }))
                 .tickFormat();
    }
};

var Title = React.createClass({
    mixins: [MetaMixin],

    getYearsFragment: function () {
        var years = this.getYears(),
            title;


        if (years.length > 1) {
            title = "";
        }else{
            title = "in "+years[0];
        }

        return title;
    },

    getStateFragment: function () {
        var states = this.getStates(),
            title;


        if (states.length > 1) {
            title = "";
        }else{
            title = "in "+States[states[0].toUpperCase()];
        }

        return title;
    },

    getJobTitleFragment: function () {
        var jobTitles = this.getJobTitles(),
            title;

        if (jobTitles.length > 1) {
            title = "H1B workers in the software industry";
        }else{
            if (jobTitles[0] == "other") {
                title = "Other H1B workers in the software industry";
            }else{
                title = "Software "+jobTitles[0]+"s on an H1B";
            }
        }

        return title;
    },

    render: function () {
        var mean = d3.mean(this.props.data,
                           function (d) { return d.base_salary; }),
            format = this.getFormatter();

        var
            yearsFragment = this.getYearsFragment(),
            jobTitleFragment = this.getJobTitleFragment(),
            stateFragment = this.getStateFragment(),
            title;

        if (yearsFragment && stateFragment) {
            title = (
                <h2>{stateFragment.capitalize()}, {jobTitleFragment.match(/^H1B/) ? jobTitleFragment : jobTitleFragment.decapitalize()} {yearsFragment.length ? "made" : "make"} ${format(mean)}/year {yearsFragment}</h2>
            );
        }else{
            title = (
                <h2>{jobTitleFragment} {yearsFragment.length ? "made" : "make"} ${format(mean)}/year {stateFragment} {yearsFragment}</h2>
            );
        }

        return title;
    }
});

var Description = React.createClass({
    mixins: [MetaMixin],

    getAllDataByYear: function (year, data) {
        data || (data = this.props.allData);

        return data.filter(function (d) {
            return d.submit_date.getFullYear() == year;
        });
    },

    getAllDataByJobTitle: function (jobTitle, data) {
        data || (data = this.props.allData);

        return data.filter(function (d) {
            return d.clean_job_title == jobTitle;
        });
    },

    getAllDataByState: function (state, data) {
        data || (data = this.props.allData);

        return data.filter(function (d) {
            return d.state == state;
        });
    },

    getYearFragment: function () {
        var years = this.getYears(),
            fragment;

        if (years.length > 1) {
            fragment = "";
        }else{
            fragment = "In "+years[0];
        }

        return fragment;
    },

    getPreviousYearFragment: function () {
        var years = this.getYears().map(Number),
            fragment;

        if (years.length > 1) {
            fragment = "";
        }else if (years[0] == 2012) {
            fragment = "";
        }else{
            var year = years[0],
                lastYear = this.getAllDataByYear(year-1);

            var states = this.getStates(),
                jobTitles = this.getJobTitles();

            if (jobTitles.length == 1) {
                lastYear = this.getAllDataByJobTitle(jobTitles[0], lastYear);
            }

            if (states.length == 1) {
                lastYear = this.getAllDataByState(states[0], lastYear);
            }

            var percent = ((this.props.data.length-lastYear.length)/this.props.data.length*100);

            if (this.props.data.length/lastYear.length > 2) {
                fragment = ", "+(this.props.data.length/lastYear.length).toFixed()+" times more than the year before";
            }else{
                var percent = ((1-lastYear.length/this.props.data.length)*100).toFixed();

                fragment = ", "+Math.abs(percent)+"% "+(percent > 0 ? "more" : "less")+" than the year before";
            }
        }

        return fragment;
    },

    getJobTitleFragment: function () {
        var jobTitles = this.getJobTitles(),
            fragment;

        if (jobTitles.length > 1) {
            fragment = "foreign nationals";
        }else{
            if (jobTitles[0] == "other") {
                fragment = "foreign nationals";
            }else{
                fragment = "foreign software "+jobTitles[0]+"s";
            }
        }

        return fragment;
    },

    getStateFragment: function () {
        var states = this.getStates(),
            fragment;

        if (states.length > 1) {
            fragment = "US";
        }else{
            fragment = States[states[0].toUpperCase()];
        }

        return fragment;
    },

    getCityFragment: function () {
        var byCity = _.groupBy(this.props.data, "city"),

            ordered = _.sortBy(_.keys(byCity)
                                .map(function (city) {
                                    return byCity[city];
                                })
                                .filter(function (d) {
                                    return d.length/this.props.data.length > 0.01;
                                }.bind(this)),
                               function (d) {
                                   return d3.mean(_.pluck(d, 'base_salary'));
                               }),
            best = ordered[ordered.length-1],
            mean = d3.mean(_.pluck(best, 'base_salary'));

        var city = best[0].city
                          .split(" ")
                          .map(function (w) { return w.capitalize() })
                          .join(" ");

        var jobFragment = this.getJobTitleFragment()
                              .replace("foreign nationals", "")
                              .replace("foreign", "");

        return (
            <span>
                The best city {jobFragment.length ? "for "+jobFragment : "to be in"} {this.getYearFragment().length ? "was" : "is"} {city} with an average salary of ${this.getFormatter()(mean)}.
            </span>
        );
    },

    render: function () {
        var formatter = this.getFormatter(),
            mean = d3.mean(this.props.data,
                           function (d) { return d.base_salary; }),
            deviation = d3.deviation(this.props.data,
                                     function (d) { return d.base_salary; });

        var yearFragment = this.getYearFragment();

        return (
            <p className="lead">{yearFragment.length ? yearFragment : "Since 2012"} the {this.getStateFragment()} software industry {yearFragment.length ? "gave" : "has given"} jobs to {formatter(this.props.data.length)} {this.getJobTitleFragment()}{this.getPreviousYearFragment()}. Most of them made between ${formatter(mean-deviation)} and ${formatter(mean+deviation)} per year. {this.getCityFragment()}</p>
        );
    }
});


React.render(
    <H1BGraph url="data/h1bs.csv" />,
    document.querySelectorAll('.h1bgraph')[0]
);
