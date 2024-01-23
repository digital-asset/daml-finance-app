// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as d3 from "d3";

export const render = (el, data, h) => {

  const width = el.offsetWidth;
  const height = h;

  const baseSvg = d3.select(el).append("svg")
    .attr("width", width)
    .attr("height", height + 10)
    .attr("viewBox", [0, 0, width, height])
    .style("user-select", "none");
  const svg = baseSvg
    .append("g");

  const margin = ({top: 20, right: 30, bottom: 30, left: 40});
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.price))
    .range([margin.left, width - margin.right]);

  const [, max] = d3.extent(data, d => d.value);
  const y = d3.scaleLinear()
    .domain([-max, max]).nice()
    .range([height - margin.bottom, margin.top]);

  const xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
    .call(g => g.select(".domain").remove())
    .call(g => g.select(".tick:last-of-type text").clone()
      .attr("x", -30)
      .attr("y", -15)
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text(`${data[0].priceAsset}`));

  const yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.select(".tick:last-of-type text").clone()
      .attr("x", -30)
      .attr("y", -15)
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text(`${data[0].valueAsset}`));

  const line = d3.line()
    .curve(d3.curveLinear)
    // .defined(d => !isNaN(d.value))
    .x(d => x(d.price))
    .y(d => y(d.value));

  const grid = g => g
    .attr("stroke", "currentColor")
    .attr("stroke-opacity", 0.1)
    .call(g => g.append("g")
      .selectAll("line")
      .data(x.ticks())
      .join("line")
        .attr("x1", d => 0.5 + x(d))
        .attr("x2", d => 0.5 + x(d))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom))
    .call(g => g.append("g")
      .selectAll("line")
      .data(y.ticks())
      .join("line")
        .attr("y1", d => 0.5 + y(d))
        .attr("y2", d => 0.5 + y(d))
        .attr("x1", margin.left)
        .attr("x2", width - margin.right));

  svg.append("g")
    .call(xAxis);

  svg.append("g")
    .call(yAxis);

  svg.append("g")
    .call(grid);

  svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line);
}
