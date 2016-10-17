
import React from 'react';
import { mean as d3mean } from 'd3-array';
import S from 'string';

import Meta from './BaseComponent';
import StatesMap from './StatesMap';

class Title extends Meta {
    getYearsFragment() {
        let years = this.getYears(),
            title;


        if (years.length > 1) {
            title = "";
        }else{
            title = "in "+years[0];
        }

        return title;
    }

    getStateFragment() {
        let states = this.getUSStates(),
            title;

        if (states.length > 1 || states.length == 0) {
            title = "";
        }else{
            title = StatesMap[states[0].toUpperCase()];
        }

        return title;
    }

    getJobTitleFragment() {
        let jobTitles = this.getJobTitles(),
            years = this.getYears(),
            title;

        if (jobTitles.length > 1) {
            if (years.length > 1) {
                title = "The average H1B in tech pays";
            }else{
                title = "The average tech H1B paid";
            }
        }else{
            if (jobTitles[0] === "other") {
                title = "Other H1Bs in tech pay";
            }else{
                title = `Software ${jobTitles[0]}s on an H1B`;

                if (years.length > 1) {
                    title += " make";
                }else{
                    title += " made";
                }
            }
        }

        return title;
    }

    render() {
        let mean = d3mean(this.props.data,
                          (d) => d.base_salary),
            format = this.getFormatter();

        let
            yearsFragment = this.getYearsFragment(),
            jobTitleFragment = this.getJobTitleFragment(),
            stateFragment = this.getStateFragment(),
            title;

        if (yearsFragment && stateFragment) {
            title = (
                <h2>In {stateFragment}, {jobTitleFragment} ${format(mean)}/year {yearsFragment}</h2>
            );
        }else{
            title = (
                <h2>{jobTitleFragment} ${format(mean)}/year {stateFragment ? `in ${stateFragment}` : ''} {yearsFragment}</h2>
            );
        }

        return title;
    }
}

export default Title;
