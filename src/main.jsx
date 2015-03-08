
var React = require('react'),
    _ = require('lodash'),
    d3 = require('d3'),
    drawers = require('./drawers.jsx'),
    Controls = require('./controls.jsx'),
    meta = require('./meta.jsx');

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

    componentWillMount: function () {
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
                <meta.Title data={filteredData} />
                <meta.Description data={filteredData} allData={onlyGoodVisas} />
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

React.render(
    <H1BGraph url="data/h1bs.csv" />,
    document.querySelectorAll('.h1bgraph')[0]
);
