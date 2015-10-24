
var React = require('react'),
    d3 = require('d3');


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

var Mean = React.createClass({
    componentWillMount: function () {
        this.yScale = d3.scale.linear();

        this.update_d3(this.props);
    },

    componentWillReceiveProps: function (newProps) {
        this.update_d3(newProps);
    },

    update_d3: function (props) {
        this.yScale
            .domain([0,
                     d3.max(props.data.map(this.props.value))])
            .range([0, props.height-props.topMargin-props.bottomMargin]);
    },

    render: function () {
        var mean = d3.mean(this.props.data, this.props.value),
            line = d3.svg.line()
            ([[0, 5],
              [this.props.width, 5]]);

        var translate = "translate(0, "+this.yScale(mean)+")",
            meanLabel = "Mean: $"+this.yScale.tickFormat()(mean);

        return (
            <g className="mean" transform={translate}>
                <text x={this.props.width-5} y="0" textAnchor="end">
                    {meanLabel}
                </text>
                <path d={line}></path>
            </g>
        );
    }
});


module.exports = {
    Histogram: Histogram,
    Mean: Mean
};
