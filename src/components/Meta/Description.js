
import React from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import S from 'string';

import Meta from './BaseComponent';
import USStatesMap from './USStatesMap';


class Description extends Meta {
    getAllDataByYear(year, data = this.props.allData) {
        return data.filter(function (d) {
            return d.submit_date.getFullYear() === year;
        });
    }

    getAllDataByJobTitle(jobTitle, data = this.props.allData) {
        return data.filter(function (d) {
            return d.clean_job_title === jobTitle;
        });
    }

    getAllDataByState(state, data = this.props.allData) {
        return data.filter(function (d) {
            return d.state === state;
        });
    }

    getYearFragment() {
        let years = this.getYears(),
            fragment;

        if (years.length > 1) {
            fragment = "";
        }else{
            fragment = "In "+years[0];
        }

        return fragment;
    }

    getPreviousYearFragment() {
        let years = this.getYears().map(Number),
            fragment;

        if (years.length > 1) {
            fragment = "";
        }else if (years[0] === 2012) {
            fragment = "";
        }else{
            let year = years[0],
                lastYear = this.getAllDataByYear(year-1);

            let states = this.getUSStates(),
                jobTitles = this.getJobTitles();

            if (jobTitles.length === 1) {
                lastYear = this.getAllDataByJobTitle(jobTitles[0], lastYear);
            }

            if (states.length === 1) {
                lastYear = this.getAllDataByState(states[0], lastYear);
            }

            if (this.props.data.length/lastYear.length > 2) {
                fragment = ", "+(this.props.data.length/lastYear.length).toFixed()+" times more than the year before";
            }else{
                let percent = ((1-lastYear.length/this.props.data.length)*100).toFixed();

                fragment = ", "+Math.abs(percent)+"% "+(percent > 0 ? "more" : "less")+" than the year before";
            }
        }

        return fragment;
    }

    getJobTitleFragment() {
        let jobTitles = this.getJobTitles(),
            fragment;

        if (jobTitles.length > 1) {
            fragment = "H1B work visas";
        }else{
            if (jobTitles[0] === "other") {
                fragment = "H1B work visas";
            }else{
                fragment = `H1B work visas for software ${jobTitles[0]}s`;
            }
        }

        return fragment;
    }

    getStateFragment() {
        let states = this.getUSStates(),
            fragment;

        if (states.length > 1) {
            fragment = "US";
        }else{
            fragment = USStatesMap[states[0].toUpperCase()];
        }

        return fragment;
    }

    getCountyFragment() {
        const byCounty = _.groupBy(this.props.data, 'countyID'),
              medians = this.props.medianIncomesByCounty;

        let ordered = _.sortBy(_.keys(byCounty)
                                .map(county => byCounty[county])
                                .filter(d => d.length/this.props.data.length > 0.01),
                               items => d3.mean(items, d => d.base_salary) - medians[items[0].countyID][0].medianIncome);

        let best = ordered[ordered.length-1],
            countyMedian = medians[best[0].countyID][0].medianIncome;

        const byCity = _.groupBy(best, 'city');

        ordered = _.sortBy(_.keys(byCity)
                                .map(city => byCity[city])
                                .filter(d => d.length/best.length > 0.01),
                           items => d3.mean(items, d => d.base_salary) - countyMedian);

        best = ordered[ordered.length-1];

        const city = S(best[0].city).titleCase().s + `, ${best[0].state}`,
              mean = d3.mean(best, d => d.base_salary);

        const jobFragment = this.getJobTitleFragment()
                                .replace("H1B work visas for", "")
                                .replace("H1B work visas", "");

        console.log('fragment: ', jobFragment);

        return (
            <span>
                The best city {jobFragment.length ? `for ${jobFragment} on an H1B` : 'for an H1B'} {this.getYearFragment().length ? "was" : "is"} <b>{city}</b> with an average <b>individual salary ${this.getFormatter()(mean - countyMedian)} above median household income</b>. Median household income is a good proxy for cost of living in an area. <a href="https://en.wikipedia.org/wiki/Household_income">[1]</a>.
            </span>
        );
    }

    render() {
        let formatter = this.getFormatter(),
            mean = d3.mean(this.props.data,
                           function (d) { return d.base_salary; }),
            deviation = d3.deviation(this.props.data,
                                     function (d) { return d.base_salary; });

        let yearFragment = this.getYearFragment();

        return (
            <p className="lead">{yearFragment.length ? yearFragment : "Since 2012"} the {this.getStateFragment()} tech industry {yearFragment.length ? "sponsored" : "has sponsored"} {formatter(this.props.data.length)} {this.getJobTitleFragment()}{this.getPreviousYearFragment()}. Most of them paid <b>${formatter(mean-deviation)} to ${formatter(mean+deviation)}</b> per year (1 standard deviation). {this.getCountyFragment()}</p>
        );
    }
}

export default Description;
