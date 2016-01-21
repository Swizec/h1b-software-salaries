
import React, { Component } from 'react';

class Toggle extends Component {
    constructor() {
        super();

        this.state = {value: false};
    }

    handleClick(event) {
       let newValue = !this.state.value;
       this.setState({value: newValue});
       this.props.onClick(this.props.name, newValue);
    }

    componentWillReceiveProps(newProps) {
        this.setState({value: newProps.value});
    }

    render() {
        let className = "btn btn-default";

        if (this.state.value) {
            className += " btn-primary";
        }

        return (
            <button className={className} onClick={::this.handleClick}>
                {this.props.label}
            </button>
        );
    }
}

export default Toggle;
