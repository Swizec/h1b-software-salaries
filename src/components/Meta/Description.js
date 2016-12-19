
import React, { Component } from 'react';
import { scaleLinear } from 'd3-scale';
import { mean as d3mean, extent as d3extent, deviation as d3deviation } from 'd3-array';
import _ from 'lodash';
import S from 'string';

import USStatesMap from './USStatesMap';


class Description extends Component {
    allDataForYear(year, data = this.props.allData) {
        return data.filter(d => d.submit_date.getFullYear() === year);
    }

    allDataForJobTitle(jobTitle, data = this.props.allData) {
        return data.filter(d => d.clean_job_title === jobTitle);
    }

    allDataForUSstate(USstate, data = this.props.allData) {
        return data.filter(d => d.USstate === USstate);
    }

    get yearsFragment() {
        const year = this.props.filteredBy.year;

        return year === '*' ? "" : `In ${year}`;
    }

    get USstateFragment() {
        const USstate = this.props.filteredBy.USstate;

        return USstate === '*' ? "" : USStatesMap[USstate.toUpperCase()];
    }

    get previousYearFragment() {
        const year = this.props.filteredBy.year;

        let fragment;

        if (year === '*') {
            fragment = "";
        }else if (year === 2012) {
            fragment = "";
        }else{
            const { USstate, jobTitle } = this.props.filteredBy;
            let lastYear = this.allDataForYear(year-1);


            if (jobTitle !== '*') {
                lastYear = this.allDataForJobTitle(jobTitle, lastYear);
            }

            if (USstate !== '*') {
                lastYear = this.allDataForUSstate(USstate, lastYear);
            }

            if (this.props.data.length/lastYear.length > 2) {
                fragment = ", "+(this.props.data.length/lastYear.length).toFixed()+" times more than the year before";
            }else{
                const percent = ((1-lastYear.length/this.props.data.length)*100).toFixed();

                fragment = ", "+Math.abs(percent)+"% "+(percent > 0 ? "more" : "less")+" than the year before";
            }
        }

        return fragment;
    }

    get jobTitleFragment() {
        const jobTitle = this.props.filteredBy.jobTitle;
        let fragment;

        if (jobTitle === '*') {
            fragment = "H1B work visas";
        }else{
            if (jobTitle === "other") {
                fragment = "H1B work visas";
            }else{
                fragment = `H1B work visas for software ${jobTitle}s`;
            }
        }

        return fragment;
    }

    get countyFragment() {
        const byCounty = _.groupBy(this.props.data, 'countyID'),
              medians = this.props.medianIncomesByCounty;

        let ordered = _.sortBy(
            _.keys(byCounty)
             .map(county => byCounty[county])
             .filter(d => d.length/this.props.data.length > 0.01),
            items => d3mean(items,
                            d => d.base_salary) - medians[items[0].countyID][0].medianIncome);

        let best = ordered[ordered.length-1],
            countyMedian = medians[best[0].countyID][0].medianIncome;

        const byCity = _.groupBy(best, 'city');

        ordered = _.sortBy(_.keys(byCity)
                            .map(city => byCity[city])
                            .filter(d => d.length/best.length > 0.01),
                           items => d3mean(items, d => d.base_salary) - countyMedian);

        best = ordered[ordered.length-1];

        const city = S(best[0].city).titleCase().s + `, ${best[0].USstate}`,
              mean = d3mean(best, d => d.base_salary);

        const jobFragment = this.jobTitleFragment
                                .replace("H1B work visas for", "")
                                .replace("H1B work visas", "");

        return (
            <span>
                The best city {jobFragment.length ? `for ${jobFragment} on an H1B` : 'for an H1B'} {this.yearFragment ? "was" : "is"} <b>{city}</b> with an average  salary ${this.format(mean - countyMedian)} above the local household median. Median household income is a good proxy for cost of living in an area. <a href="https://en.wikipedia.org/wiki/Household_income">[1]</a>.
            </span>
        );
    }

    get format() {
        return scaleLinear()
                 .domain(d3extent(this.props.data, d => d.base_salary))
                 .tickFormat();
    }

    render() {
        const format = this.format,
              mean = d3mean(this.props.data, d => d.base_salary),
              deviation = d3deviation(this.props.data, d => d.base_salary);

        return (
            <p className="lead">
                {this.yearsFragment ? this.yearsFragment : "Since 2012"} the {this.UStateFragment} tech industry {this.yearsFragment ? "sponsored" : "has sponsored"} <b>{format(this.props.data.length)} {this.jobTitleFragment}</b>{this.previousYearFragment}. Most of them paid <b>${format(mean-deviation)} to ${format(mean+deviation)}</b> per year. {this.countyFragment}
            </p>
        );
    }
}

export default Description;
