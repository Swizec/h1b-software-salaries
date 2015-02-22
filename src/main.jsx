
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
            return false;
        }

        var params = {
            bins: 30,
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
    getYears: function () {
        return _.keys(
            _.groupBy(this.props.data,
                      function (d) { return d.submit_date.getFullYear(); })
        );
    },

    getStates: function () {
        return _.keys(
            _.groupBy(this.props.data,
                      function (d) { return d.state; })
        );
    },

    getJobTitles: function () {
        return _.keys(
            _.groupBy(this.props.data,
                      function (d) { return d.clean_job_title; })
        );
    },

    getFormatter: function () {
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
                <h3>{stateFragment.capitalize()}, {jobTitleFragment.match(/^H1B/) ? jobTitleFragment : jobTitleFragment.decapitalize()} {yearsFragment.length ? "made" : "make"} ${format(mean)}/year {yearsFragment}</h3>
            );
        }else{
            title = (
                <h3>{jobTitleFragment} {yearsFragment.length ? "made" : "make"} ${format(mean)}/year {stateFragment} {yearsFragment}</h3>
            );
        }

        return title;
    }
});


React.render(
    <H1BGraph url="data/h1bs.csv" />,
    document.querySelectorAll('.container')[0]
);
