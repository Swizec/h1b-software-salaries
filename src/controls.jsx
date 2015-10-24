
var React = require('react'),
    _ = require('lodash');


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
