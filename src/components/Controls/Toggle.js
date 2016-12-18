
import React, { Component } from 'react';

class Toggle extends Component {
    handleClick(event) {
       this.props.onClick(this.props.name, !this.props.value);
    }

    render() {
        let className = "btn btn-default";

        if (this.props.value) {
            className += " btn-primary";
        }

        return (
            <button className={className} onClick={this.handleClick.bind(this)}>
                {this.props.label}
            </button>
        );
    }
}

export default Toggle;
