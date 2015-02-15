
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
                <Histogram data={this.state.rawData} bins="20" width="500" height="500"/>
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

    render: function () {
        if (!this.histogram) {
            return null;
        }

        var bars = this.histogram(this.props.data),
            width = d3.scale.linear()
                      .domain([0, d3.max(bars.map(function (d) { return d.y; }))])
                      .range([0, Number(this.props.width)]),
            y = d3.scale.linear()
                  .domain([0, d3.max(bars.map(function (d) { return d.x+d.dx; }))])
                  .range([0, Number(this.props.height)]);


        var barNodes = bars.map(function (bar) {
            return (
                <rect width={width(bar.y)}
                      height={y(bar.dx)-2}
                      y={y(bar.x)}
                      x="0"
                      className="bar"></rect>
            );
        });

        return (
            <g className="histogram">
                {barNodes}
            </g>
        );
    }
});

React.render(
    <H1BGraph width="1024" height="768" url="data/h1bs.csv" />,
    document.getElementById('graph')
);
