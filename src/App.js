import React, { Component } from 'react';
import * as d3 from 'd3';

import H1BGraph from './components/H1BGraph';
import CountyMap from './components/CountyMap';

class App extends Component {
    state = {}

    componentWillMount() {
        d3.queue()
          .defer(d3.json, 'data/us.json')
          .await((error, us) => {
              this.setState({usTopoJson: us});
          });
    }

    render() {
        return (
            <div className="App">
                <svg width="800" height="600">
                    <CountyMap usTopoJson={this.state.usTopoJson} width={800} height={600} />
                </svg>
            </div>
        );
    }
}

/* <H1BGraph url="data/h1bs-2012-2016-final-cleaned.csv" /> */

export default App;
