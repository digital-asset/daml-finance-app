// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as d3 from "d3";
import { fmt } from "../../util";

export const renderCashflows = (el, data, navigate, h, renderNet) => {

  const margin = ({top: 20, right: 30, bottom: 50, left: 60});
  const width = el.offsetWidth - margin.left - margin.right;
  const height = h - margin.top - margin.bottom;

  var parseDate = d3.timeParse("%Y-%m-%d");

  var x = d3.scaleTime()
    .range([0, width]);

  var y = d3.scalePow()
    .exponent(0.5)
    .range([height, margin.top]);

  var center = d3.scalePow()
    .range([0, width]);

  var xAxis = d3.axisBottom(x).ticks(10);
  var yAxis = d3.axisLeft(y);//.ticks(15);
  var centerLine = d3.axisTop(center).ticks(0);

  // const cashflows = data.flatMap(d => d.cashflows.map(cf => cf.cashflow));
  var y_min = 0;//d3.min(cashflows) > 0 ? 0 : d3.min(cashflows);
  var y_max = 0;//d3.max(cashflows);
  data.forEach(function(d) {
    var y0_positive = 0;
    var y0_negative = 0;

    d.components = d.cashflows.map(function(cf) {
      if (cf.cashflow >= 0) {
        return { contractId: cf.contractId, date: d.date, label: cf.label, value: cf.cashflow, y1: y0_positive, y0: y0_positive += cf.cashflow };
      } else {
        return { contractId: cf.contractId, date: d.date, label: cf.label, value: cf.cashflow, y0: y0_negative, y1: y0_negative += cf.cashflow };
      }
    });
    d.net = d.cashflows.reduce((a, b) => a + b, 0);
    y_min = y0_negative < y_min ? y0_negative : y_min;
    y_max = y0_positive > y_max ? y0_positive : y_max;
  });

  const datestart = d3.min(data, function(d) { return parseDate(d.date); });
  const dateend = d3.max(data, function(d) { return parseDate(d.date); });

  x.domain([datestart, dateend]);
  y.domain([y_min, y_max]);

  const netLine = d3.line()
			.x(function(d) { return x(parseDate(d.date)); })
			.y(function(d) { return y(d.net); });

  const baseSvg = d3.select(el).append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

	const svg = baseSvg
    .append("g")

	baseSvg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

	baseSvg.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  baseSvg.append("g")
    .attr("class", "centerline")
    .attr("transform", "translate(0," + y(0) + ")")
    .call(centerLine);

  var entry = svg.selectAll(".entry")
    .data(data)
    .enter().append("g")
    .attr("class", "g")
    .attr("transform", function(d) { return "translate(" + x(parseDate(d.date)) + ", 0)"; });

  entry.selectAll("rect")
    .data(function(d) { return d.components; })
    .enter().append("rect")
    .attr("width", 5)
    .attr("y", function(d) { return y(d.y0); })
    .attr("height", function(d) { return Math.abs(y(d.y0) - y(d.y1)); })
    .style("fill", function(d) { return d.value >= 0 ? "green" : "red"; } )
    .style("stroke", function(d) { return "#000"; } )
		.on("mouseover", function() { tooltip.style("display", null); })
		.on("mouseout", function() { tooltip.style("display", "none"); })
		.on("mousemove", function(event, d) {
			var xPosition = d3.pointer(event)[0] + 5;
			var yPosition = d3.pointer(event)[1] - 15;
			tooltip.attr("transform", "translate(" + (x(parseDate(d.date)) + xPosition) + "," + yPosition + ")");
			tooltip.select("text").text(d.label + " (" + d.date + ": " + fmt(d.value) + ")");
		})
		.on("click", (event, d) => navigate("/portfolio/positions/" + d.contractId));

  if (renderNet) {
    svg.append("path")
    .datum(data)
    .attr("class", "line")
    .style("fill", "none")
    .style("stroke", "#ccc")
    .style("stroke-width", "1.2px")
    .attr("d", netLine);
  }

	var tooltip = svg.append("g")
		.attr("class", "tooltip")
		.style("display", "none");

	tooltip.append("rect")
		.attr("width", 200)
		.attr("height", 12)
		.attr("fill", "black")
		.style("opacity", 0.5);

	tooltip.append("text")
		.attr("x", 100)
		.attr("dy", "1.2em")
		.style("text-anchor", "middle")
		.style("fill", "white")
		.attr("font-size", "8px");
}
