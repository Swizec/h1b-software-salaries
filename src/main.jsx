
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
            bottomMargin: 5
        };

        var filteredData = this.state.rawData.filter(this.state.dataFilter);

        return (
            <div>
                <div className="row">
                    <div className="col-md-12">
                        <svg width={params.width} height={params.height}>
                            <Histogram {...params} data={filteredData} />
                        </svg>
                    </div>
                </div>
                <Controls data={this.state.rawData} updateDataFilter={this.updateDataFilter} />
            </div>
        );
    }
});

var Histogram = React.createClass({
    propTypes: {
        bins: React.PropTypes.number.isRequired,
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired
    },

    componentWillMount: function () {
        this.histogram = d3.layout.histogram()
                           .value(function (d) { return d.base_salary; });
        this.widthScale = d3.scale.log();
        this.yScale = d3.scale.linear();

        this.update_d3(this.props);
    },

    componentWillReceiveProps: function (newProps) {
        this.update_d3(newProps);
    },

    update_d3: function (props) {
        this.histogram.bins(props.bins);

        var bars = this.histogram(props.data)
                       .reduce(this.mergeSmall, []),
            counts = bars.map(function (d) { return d.y; });

        this.setState({bars: bars});

        this.widthScale
            .domain([d3.min(counts), d3.max(counts)])
            .range([9, props.width-props.axisMargin]);

        this.yScale
            .domain([0, d3.max(bars.map(function (d) { return d.x+d.dx; }))])
            .range([0, props.height-props.topMargin-props.bottomMargin]);
    },

    mergeSmall: function (mem, d) {
        if (d.y > 3 || !mem.length) {
            mem.push(d);
        }else{
            mem[mem.length-1].dx += d.dx;
            mem[mem.length-1].y += d.y;
        }

        return mem;
    },

    makeBar: function (bar) {
        var percent = bar.y/this.props.data.length*100;

        if (percent < 1) {
            percent = percent.toFixed(2);
        }else{
            percent = percent.toFixed(0);
        }

        var props = {label: percent+"%",
                     x: this.props.axisMargin,
                     y: this.yScale(bar.x),
                     width: this.widthScale(bar.y),
                     height: this.yScale(bar.dx)}

        return (
            <HistogramBar {...props} />
        );
    },

    render: function () {
        var translate = "translate(0, "+this.props.topMargin+")";

        return (
            <g className="histogram" transform={translate}>
                <g className="bars">
                    {this.state.bars.map(this.makeBar)}
                    <Axis {...this.props} data={this.state.bars}  />
                </g>
            </g>
        );
    }
});

var HistogramBar = React.createClass({
    render: function () {
        var translate = "translate(" + this.props.x + "," + this.props.y + ")";

        return (
            <g transform={translate} className="bar">
                <rect width={this.props.width}
                      height={this.props.height-2}
                      transform="translate(0, 1)">
                </rect>
                <text textAnchor="end"
                      x={this.props.width-5}
                      y={this.props.height/2+3}>
                    {this.props.label}
                </text>
            </g>
        );
    }
});

var Axis = React.createClass({
    componentWillMount: function () {
        this.yScale = d3.scale.linear();
        this.axis = d3.svg.axis()
                      .scale(this.yScale)
                      .orient("left")
                      .tickFormat(function (d) {
                          return "$"+this.yScale.tickFormat()(d);
                      }.bind(this));

        this.update_d3(this.props);
    },

    componentWillReceiveProps: function (newProps) {
        this.update_d3(newProps);
    },

    update_d3: function (props) {
        this.yScale
            .domain([0,
                     d3.max(props.data.map(
                         function (d) { return d.x+d.dx; }))])
            .range([0, props.height-props.topMargin-props.bottomMargin]);

        this.axis
            .ticks(props.data.length)
            .tickValues(props.data
                             .map(function (d) { return d.x; })
                             .concat(props.data[props.data.length-1].x
                                    +props.data[props.data.length-1].dx));
    },

    componentDidUpdate: function () { this.renderAxis(); },
    componentDidMount: function () { this.renderAxis(); },

    renderAxis: function () {
        var node = this.getDOMNode();

        d3.select(node).call(this.axis);
    },

    render: function () {
        var translate = "translate("+(this.props.axisMargin-3)+", 0)";
        return (
            <g className="axis" transform={translate}>
            </g>
        );
    }
});

var Controls = React.createClass({
    updateYearFilter: function (year) {
        this.props.updateDataFilter(function (d) {
            return d.submit_date.getFullYear() == year;
        });
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

        return (
            <div>
                <ControlRow data={this.props.data}
                            getToggleValues={getYears}
                            updateDataFilter={this.updateYearFilter} />

                <ControlRow data={this.props.data}
                            getToggleValues={getJobTitles}
                            updateDataFilter={this.updateJobTitleFilter} />
            </div>
        )
    }
});

var ControlRow = React.createClass({
    makePick: function (picked) {
        var togglesOn = this.state.togglesOn;

        togglesOn = _.mapValues(togglesOn,
                              function (value, key) {
                                  return key == picked;
                              });

        this.props.updateDataFilter(picked);

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
            {this.props.getToggleValues(this.props.data).map(function (value) {
                return (
                    <Toggle label={value}
                            value={value}
                            on={this.state.togglesOn[value]}
                            onClick={this.makePick} />
                );
            }.bind(this))}
            </div>
        );
    }
});

var Toggle = React.createClass({
    getInitialState: function () {
        return {on: false};
    },

    handleClick: function (event) {
        this.setState({on: !this.state.on});
        this.props.onClick(this.props.value);
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

React.render(
    <H1BGraph url="data/h1bs.csv" />,
    document.querySelectorAll('.container')[0]
);
