
import React from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import S from 'string';

import Meta from './BaseComponent';
import StatesMap from './StatesMap';


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
            fragment = "foreign nationals";
        }else{
            if (jobTitles[0] === "other") {
                fragment = "foreign nationals";
            }else{
                fragment = "foreign software "+jobTitles[0]+"s";
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
            fragment = StatesMap[states[0].toUpperCase()];
        }

        return fragment;
    }

    getCityFragment() {
        let byCity = _.groupBy(this.props.data, "city"),

            ordered = _.sortBy(_.keys(byCity)
                                .map(function (city) {
                                    return byCity[city];
                                })
                                .filter(function (d) {
                                    return d.length/this.props.data.length > 0.01;
                                }.bind(this)),
                               function (items) {
                                   return d3.mean(items, (d) => d['base_salary']);
                               }),
            best = ordered[ordered.length-1],
            mean = d3.mean(best, (d) => d['base_salary']);

        let city = S(best[0].city).titleCase().s;

        let jobFragment = this.getJobTitleFragment()
                              .replace("foreign nationals", "")
                              .replace("foreign", "");

        return (
            <span>
                The best city {jobFragment.length ? "for "+jobFragment : "to be in"} {this.getYearFragment().length ? "was" : "is"} {city} with an average salary of ${this.getFormatter()(mean)}.
            </span>
        );
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
                                .replace("foreign nationals", "")
                                .replace("foreign", "");


        return (
            <span>
                The best city {jobFragment.length ? "for "+jobFragment : "to be a techie"} {this.getYearFragment().length ? "was" : "is"} <b>{city}</b> with an average individual salary <b>${this.getFormatter()(mean - countyMedian)} above household median</b>.
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
            <p className="lead">{yearFragment.length ? yearFragment : "Since 2012"} the {this.getStateFragment()} tech industry {yearFragment.length ? "gave" : "has employed"} {formatter(this.props.data.length)} {this.getJobTitleFragment()}{this.getPreviousYearFragment()}. Most of them made between ${formatter(mean-deviation)} and ${formatter(mean+deviation)} per year. {this.getCountyFragment()}</p>
        );
    }
}

export default Description;
