import React from "react";
import { loadAllData } from "./DataHandling";
import * as _ from "lodash";

import LineChart from "./LineChart";

class TrendsApp extends React.Component {
    state = {
        data: []
    };

    componentDidMount() {
        loadAllData(({ techSalaries }) => {
            this.setState({
                data: techSalaries,
                byYear: _.groupBy(techSalaries, d => d.start_date.getFullYear())
            });
        });
    }

    render() {
        const { data, byYear } = this.state;

        return (
            <div className="App container">
                <h2>Tech salary trends 2012 to 2018</h2>
                <p className="lead">
                    Dataset of {data.length} salaries for employees on H1B
                    visas. Full dataset is parsing, realized this one is borked.
                </p>
                <svg width={1024} height={786}>
                    {byYear && (
                        <LineChart
                            x={0}
                            y={0}
                            width={400}
                            height={400}
                            data={byYear}
                        />
                    )}
                </svg>
            </div>
        );
    }
}

export default TrendsApp;
