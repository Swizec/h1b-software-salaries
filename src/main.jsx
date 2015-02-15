
var H1BGraph = React.createClass({
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
                      base_salary: Number(d['base salary']),
                      salary_to: d['salary to'] ? Number(d['salary to']) : null,
                      city: d.city,
                      state: d.state};
          })
          .get(function (error, rows) {
              if (error) {
                  console.error(error);
                  console.error(error.stack);
              }else{
                  this.setState({rawData: rows});
              }
          }.bind(this));
    },

    getInitialState: function () {
        return {rawData: []};
    },

    componentDidMount: function () {
        this.loadRawData();
    },

    render: function () {
        return (
            <svg width={this.props.width} height={this.props.height}>
                <Histogram data={this.state.rawData} bins="30" width="500" height="500"/>
            </svg>
        );
    }
});

var Histogram = React.createClass({
    componentDidMount: function () {
        this.histogram = d3.layout.histogram()
                           .bins(Number(this.props.bins))
                           .value(function (d) { return d.base_salary; });
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

    render: function () {
        if (!this.histogram) {
            return null;
        }

        var bars = this.histogram(this.props.data)
                       .reduce(this.mergeSmall, []),
            counts = bars.map(function (d) { return d.y; }),
            width = d3.scale.log()
                      .domain([d3.min(counts), d3.max(counts)])
                      .range([0, Number(this.props.width)]),
            y = d3.scale.linear()
                  .domain([0, d3.max(bars.map(function (d) { return d.x+d.dx; }))])
                  .range([0, Number(this.props.height)]);

        console.log(bars);

        var barNodes = bars.map(function (bar) {
            return (
                <Bar label={bar.y}
                     x="0"
                     y={y(bar.x)}
                     width={width(bar.y)}
                     height={y(bar.dx)}
                     label={bar.y} />
            );
        });

        return (
            <g className="histogram">
                {barNodes}
            </g>
        );
    }
});

var Bar = React.createClass({
    render: function () {
        var translate = "translate(" + this.props.x + "," + this.props.y + ")";

        return (
            <g transform={translate} className="bar">
                <rect width={this.props.width}
                      height={this.props.height-2}>
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

React.render(
    <H1BGraph width="1024" height="768" url="data/h1bs.csv" />,
    document.getElementById('graph')
);
