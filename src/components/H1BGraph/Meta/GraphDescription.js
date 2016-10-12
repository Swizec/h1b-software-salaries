
import React from 'react';
import { mean as d3mean } from 'd3-array';
import S from 'string';

import Meta from './BaseComponent';

class GraphDescription extends Meta {
    getJobTitleFragment() {
        var jobTitles = this.getJobTitles(),
            years = this.getYears(),
            title;

        if (jobTitles.length > 1) {
            title = 'in tech';
        }else{
            if (jobTitles[0] === "other") {
                title = "in tech";
            }else{
                title = "a Software "+jobTitles[0];
            }
        }

        return title;
    }

    render() {
        const jobTitleFragment = this.getJobTitleFragment();

        return (
            <div>
                <div className="col-md-6 text-center">
                    <h3>Best places to be {jobTitleFragment}</h3>
                    <small>Darker color means bigger difference between median household salary<br/>and individual tech salary. Gray means lack of tech salary data.</small>
                </div>
                <div className="col-md-6 text-center">
                    <h3>Salary distribution</h3>
                    <small>Histogram shows tech salary distribution compared to median household income.</small>
                </div>
            </div>
        )
    }
}

export default GraphDescription;
