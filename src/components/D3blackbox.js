import React from "react";

export default function D3blackbox(D3render) {
    return class Blackbox extends React.Component {
        anchorRef = React.createRef();

        componentDidMount() {
            D3render.call(this);
        }
        componentDidUpdate() {
            D3render.call(this);
        }

        render() {
            const { x, y } = this.props;
            return (
                <g transform={`translate(${x}, ${y})`} ref={this.anchorRef} />
            );
        }
    };
}
