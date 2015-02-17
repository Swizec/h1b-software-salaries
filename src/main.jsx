
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
        this.histogram.bins(Number(props.bins));

        var bars = this.histogram(props.data)
                       .reduce(this.mergeSmall, []),
            counts = bars.map(function (d) { return d.y; });

        this.setState({bars: bars});

        this.widthScale
            .domain([d3.min(counts), d3.max(counts)])
            .range([9, Number(props.width)]);

        this.yScale
            .domain([0, d3.max(bars.map(function (d) { return d.x+d.dx; }))])
            .range([0, Number(props.height)]);
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
        var props = {label: bar.y,
                     x: 0,
                     y: this.yScale(bar.x),
                     width: this.widthScale(bar.y),
                     height: this.yScale(bar.dx),
                     label: bar.y}

        return (
            <HistogramBar {...props} />
        );
    },

    render: function () {
        var barNodes = this.state.bars.map(this.makeBar);

        return (
            <g className="histogram">
                <g className="bars">
                    {barNodes}
                    <Axis data={this.state.bars} height={this.props.height} />
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

var Axis = React.createClass({
    componentWillMount: function () {
        this.yScale = d3.scale.linear();
        this.axis = d3.svg.axis()
                      .scale(this.yScale)
                      .orient("left");

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
            .range([0, props.height]);
        this.axis.ticks(props.data.length);
    },

    componentDidUpdate: function () {
        var node = this.getDOMNode();

        d3.select(node).call(this.axis);
    },

    render: function () {
        return (
            <g className="axis" transform="translate(200, 0)">
            </g>
        );
    }
});

React.render(
    <H1BGraph width="1024" height="768" url="data/h1bs.csv" />,
    document.getElementById('graph')
);
