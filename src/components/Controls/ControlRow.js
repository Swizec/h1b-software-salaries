import React from "react";

import Toggle from "./Toggle";

class ControlRow extends React.Component {
    makePick = (picked, newState) => {
        // if newState is false, we want to reset
        this.props.updateDataFilter(picked, !newState);
    };

    _addToggle(name) {
        let key = `toggle-${name}`,
            label = name;

        if (this.props.capitalize) {
            label = label.toUpperCase();
        }

        return (
            <Toggle
                label={label}
                name={name}
                key={key}
                value={this.props.picked === name}
                onClick={this.makePick}
            />
        );
    }

    render() {
        const { toggleNames } = this.props;

        return (
            <div className="row">
                <div className="col-md-12">
                    {toggleNames.map(name => this._addToggle(name))}
                </div>
            </div>
        );
    }
}

export default ControlRow;
