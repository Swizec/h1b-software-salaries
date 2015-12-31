
import React, { Component } from 'react';
import _ from 'lodash';

import Toggle from './Toggle';

class ControlRow extends Component {
    constructor() {
        super();
    }

    makePick(picked, newState) {
        var toggleValues = this.state.toggleValues;

        toggleValues = _.mapValues(toggleValues,
                              function (value, key) {
                                  return newState && key == picked;
                              });

        // if newState is false, we want to reset
        this.props.updateDataFilter(picked, !newState);

        this.setState({toggleValues: toggleValues});
    }

    componentWillMount() {
        var hash = window.location.hash.replace('#', '').split("-");

        let toggles = this.props.getToggleNames(this.props.data),
            toggleValues = _.zipObject(toggles,
                                       toggles.map(function () { return false; }));

        this.state = {toggleValues: toggleValues};

        if (hash.length) {
            var fromUrl = hash[this.props.hashPart];

            if (fromUrl != '*' && fromUrl != '') {
                this.makePick(fromUrl, true);
            }else{
                // reset
                this.props.updateDataFilter('', true);
            }
        }
    }

    render() {
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
                            onClick={::this.makePick} />
                );
             }.bind(this))}
                </div>
            </div>
        );
    }
}

export default ControlRow;
