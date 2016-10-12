
import React from 'react';
import { mean as d3mean } from 'd3-array';
import S from 'string';

import Meta from './BaseComponent';
import StatesMap from './StatesMap';

class Title extends Meta {
    getYearsFragment() {
        var years = this.getYears(),
            title;


        if (years.length > 1) {
            title = "";
        }else{
            title = "in "+years[0];
        }

        return title;
    }

    getStateFragment() {
        var states = this.getUSStates(),
            title;

        if (states.length > 1 || states.length == 0) {
            title = "";
        }else{
            title = "in "+StatesMap[states[0].toUpperCase()];
        }

        return title;
    }

    getJobTitleFragment() {
        var jobTitles = this.getJobTitles(),
            years = this.getYears(),
            title;

        if (jobTitles.length > 1) {
            if (years.length > 1) {
                title = "Individuals in tech outearn most households";
            }else{
                title = "Individuals in tech outearned most households";
            }
        }else{
            if (jobTitles[0] === "other") {
                title = "Other techies";
            }else{
                title = "Software "+jobTitles[0]+"s";
            }
        }

        return title;
    }

    render() {
        var mean = d3mean(this.props.data,
                          (d) => d.base_salary),
            format = this.getFormatter();

        var
            yearsFragment = this.getYearsFragment(),
            jobTitleFragment = this.getJobTitleFragment(),
            stateFragment = this.getStateFragment(),
            title;

        if (yearsFragment && stateFragment) {
            title = (
                <h2>{S(stateFragment).capitalize().s}, {jobTitleFragment} {yearsFragment.length ? "made" : "make"} ${format(mean)}/year {yearsFragment}</h2>
            );
        }else{
            title = (
                <h2>{jobTitleFragment} at ${format(mean)}/year {stateFragment} {yearsFragment}</h2>
            );
        }

        return title;
    }
}

export default Title;
