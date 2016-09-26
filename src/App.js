import React, { Component } from 'react';

import H1BGraph from './components/H1BGraph';

class App extends Component {
  render() {
    return (
      <div className="App">
        <H1BGraph url="data/h1bs-2012-2016.csv" />
      </div>
    );
  }
}

export default App;
