// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as d3 from "d3";

export const render = (el, xAsset, yAsset, a1, a2, a1New, a2New, f, h) => {

  const width = el.offsetWidth;
  const height = h;

  const n = 5000;
  const xMin = Math.min(a1, a1New);
  const xMax = Math.max(a1, a1New);
  const span = (xMax - xMin) / 10;
  const data = [];
  for (let i = 1; i <= n; i++) {
    const px = xMin - span + (xMax + 2 * span - xMin) / n * i;
    const py = f(px);
    data.push({ px, py });
  }

  const margin = ({top: 20, right: 30, bottom: 30, left: 100});
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.px))
    .range([margin.left, width - margin.right]);
  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.py)).nice()
    .range([height - margin.bottom, margin.top]);

  const xAxis = (g, x) => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
    .call(g => g.select(".domain").remove())

  const yAxis = (g, y) => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove());

  const line = d3.line()
    .curve(d3.curveLinear)
    .x(d => xScale(d.px))
    .y(d => yScale(d.py));

  const priceLine = d3.line()
    .curve(d3.curveLinear);

  const grid = (g, x, y) => g
    .attr("stroke", "currentColor")
    .attr("stroke-opacity", 0.1)
    .call(g => g
      .selectAll(".x")
      .data(x.ticks())
      .join(
        enter => enter.append("line").attr("class", "x").attr("y1", margin.top).attr("y2", height - margin.bottom),
        update => update,
        exit => exit.remove()
      )
      .attr("x1", d => 0.5 + x(d))
      .attr("x2", d => 0.5 + x(d)))
    .call(g => g
      .selectAll(".y")
      .data(y.ticks())
      .join(
        enter => enter.append("line").attr("class", "y").attr("x1", margin.left).attr("x2", width - margin.right),
        update => update,
        exit => exit.remove()
      )
        .attr("y1", d => 0.5 + y(d))
        .attr("y2", d => 0.5 + y(d)));

  const zoomed = ({transform}) => {
    const zx = transform.rescaleX(xScale).interpolate(d3.interpolateRound);
    const zy = transform.rescaleY(yScale).interpolate(d3.interpolateRound);
    gLine.attr("transform", transform).attr("stroke-width", 1 / transform.k);
    gx.call(xAxis, zx);
    gy.call(yAxis, zy);
    gGrid.call(grid, zx, zy);
    gPriceCurr.call(transformSymbol, zx, zy, a1, a2);
    gPriceNew.call(transformSymbol, zx, zy, a1New, a2New);
    gPriceLine.call(transformPriceLine, zx, zy);
  };

  const zoom = d3.zoom()
    .scaleExtent([1, 300000])
    .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
    .translateExtent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
    .on("zoom", zoomed);

  const svg = d3.select(el).append("svg")
    .attr("width", width)
    .attr("height", height + 10)
    .attr("viewBox", [0, 0, width, height])
    .style("user-select", "none");
  svg.append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom);
  svg.call(zoom);

  svg.append("text")
    .attr("x", margin.left - 15)
    .attr("y", margin.top - 10)
    .attr("text-anchor", "start")
    .attr("font-size", 10)
    .attr("font-weight", "bold")
    .text(yAsset);

  svg.append("text")
      .attr("x", width - margin.right + 5)
      .attr("y", height - margin.bottom + 3)
      .attr("text-anchor", "start")
      .attr("font-size", 10)
      .attr("font-weight", "bold")
      .text(xAsset);

  const gx = svg.append("g")
    .call(xAxis, xScale);

  const gy = svg.append("g")
    .call(yAxis, yScale);

  const gGrid = svg.append("g")
    .call(grid, xScale, yScale);

  const gLine = svg.append("g")
      .attr("clip-path", "url(#clip)")
    .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 1)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line);

  const circle = d3.symbol().type(d3.symbolCircle).size(64);
  const transformSymbol = (g, x, y, xv, yv) => g
    .attr("transform", `translate(${x(xv)},${y(yv)})`);
  const gPriceCurr = svg.append("g")
      .attr("clip-path", "url(#clip)")
    .append("path")
      .attr("d", circle)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
    .call(transformSymbol, xScale, yScale, a1, a2);

  const gPriceNew = svg.append("g")
    .attr("clip-path", "url(#clip)")
  .append("path")
    .attr("d", circle)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1)
  .call(transformSymbol, xScale, yScale, a1New, a2New);

  const transformPriceLine = (g, x, y) => g
    .attr("d", priceLine([[x(a1), y(a2)], [x(a1New), y(a2New)]]));
  const gPriceLine = svg.append("g")
      .attr("clip-path", "url(#clip)")
    .append("path")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
    .call(transformPriceLine, xScale, yScale);

}
