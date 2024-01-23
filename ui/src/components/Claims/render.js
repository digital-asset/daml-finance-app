// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as d3 from "d3";

export const render = (el, data, h) => {

  const nodeWidth = 120;
  const nodeHeight = 80;

  const tree = d3.tree().nodeSize([nodeWidth, nodeHeight]).separation((a, b) => a.parent === b.parent ? 1 : 1.2);//.size([width - 20, height - 20]);
  const diagonal = d3.linkVertical().x(d => d.x).y(d => d.y);
  const color = d => {
    if (d.data.type === "Claim") {
      return d._children ? "#6d9eeb" : "#c9daf8"; // light green 2: "#a4c2f4";
    } else {
      return d._children ? "#93c47d" : "#d9ead3"; // light blue 3: "#b6d7a8"
    }
  }

  const root = d3.hierarchy(data);
  const width = el.offsetWidth;
  const height = h; //root.height * 20 + 20;

  root.x0 = 0;
  root.y0 = 0;
  root.descendants().forEach((d, i) => {
    d.id = i;
    d._children = d.children;
  });

  function zoom(event) {
    svg.attr("transform", event.transform);
  }

  var zoomListener = d3.zoom().scaleExtent([0.01, 30]).on("zoom", zoom);

  const baseSvg = d3.select(el).append("svg")
    .attr("width", width)
    .attr("height", height + 10)
    .attr("viewBox", [-width / 3, -10, width, height])
    .style("user-select", "none")
    .call(zoomListener);
  const svg = baseSvg
    .append("g");

  const gLink = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#555")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 1.5);

  const gNode = svg.append("g")
    .attr("cursor", "pointer")
    .attr("pointer-events", "all");

  const update = (source, animate) => {

    const duration = 250;
    const nodes = root.descendants().reverse();
    const links = root.links();

    tree(root);

    const transition = svg.transition()
      .duration(duration)
      .attr("viewBox", [-width / 2, -10, width, height])
      .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

    const node = gNode.selectAll("g")
      .data(nodes, d => d.id);

    const nodeEnter = node.enter().append("g")
      .attr("transform", d => animate ? `translate(${source.x0},${source.y0})` : `translate(${d.x},${d.y})`)
      .attr("fill-opacity", animate ? 0 : 1)
      .attr("stroke-opacity", animate ? 0 : 1)
      .on("click", (event, d) => {
        d.children = d.children ? null : d._children;
        update(d, true);
      });

    nodeEnter.append("rect")
      .attr("x", -50)
      .attr("y", -10)
      .attr("width", 100)
      .attr("height", 20)
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .attr("fill", color);
    nodeEnter.append("text")
      .text(d => d.data.text || d.data.tag)
      .attr("dominant-baseline", "central")
      .style("text-anchor", "middle");

    // Transition nodes to their new position.
    // const nodeUpdate =
    node.merge(nodeEnter).transition(transition)
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .attr("fill-opacity", 1)
      .attr("stroke-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    // const nodeExit =
    node.exit().transition(transition).remove()
      .attr("transform", d => `translate(${source.x},${source.y})`)
      .attr("fill-opacity", 0)
      .attr("stroke-opacity", 0);

    // Update the links…
    const link = gLink.selectAll("path")
      .data(links, d => d.target.id);

    // Enter any new links at the parent's previous position.
    const linkEnter = link.enter().append("path")
      .attr("d", d => {
        const o = { x: source.x0, y: source.y0 };
        return diagonal(animate ? { source: o, target: o } : d);
      });

    // Transition links to their new position.
    link.merge(linkEnter).transition(transition)
      .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition(transition).remove()
      .attr("d", d => {
        const o = { x: source.x, y: source.y };
        return diagonal({ source: o, target: o });
      });

    // Stash the old positions for transition.
    root.eachBefore(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });

    // Link annotations
    // const link = svg.append("g")
    //     .attr("fill", "none")
    //     .attr("stroke", "black")
    //     .attr("stroke-width", 0.5)
    //   .selectAll(".link")
    //   .data(links)
    //   .enter()
    //     .append("g");
    // link.insert("path", ".node")
    //   .attr("class", "link")
    //   .attr("d", renderLink);
    // link.append("rect")
    //   .attr("x", d => 0.5 * (d.source.x + d.target.x) - 30)
    //   .attr("y", d => 0.5 * (d.source.y + d.target.y) - 6)
    //   .attr("width", 60)
    //   .attr("height", 12)
    //   .attr("rx", 2)
    //   .attr("ry", 2)
    //   .attr("stroke-width", 0)
    //   .attr("fill", "#f2f2f2");
    // link.append("text")
    //   .text(d => d.target.data.linkText)
    //   .attr("x", d => 0.5 * (d.source.x + d.target.x))
    //   .attr("y", d => 0.5 * (d.source.y + d.target.y))
    //   .attr("stroke-width", 0)
    //   .attr("fill", "black")
    //   .attr("dominant-baseline", "central")
    //   .style("text-anchor", "middle")
    //   .style("font-size", "10px")
  };

  const renderLegend = () => {
    const legend = baseSvg.append("g")
      .attr("transform", d => `translate(${width / 2 - 60},7)`);
    legend.append("rect")
      .attr("x", -55)
      .attr("y", -15)
      .attr("width", 110)
      .attr("height", 70)
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .attr("fill", "transparent");
    legend.append("text")
      .text("Legend:")
      .style("text-anchor", "middle");
    legend.append("rect")
      .attr("x", -50)
      .attr("y", 10)
      .attr("width", 100)
      .attr("height", 20)
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("fill", "#a4c2f4");
    legend.append("text")
      .text("Claim")
      .attr("y", 20)
      .attr("dominant-baseline", "central")
      .style("text-anchor", "middle");
    legend.append("rect")
      .attr("x", -50)
      .attr("y", 30)
      .attr("width", 100)
      .attr("height", 20)
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("fill", "#b6d7a8");
    legend.append("text")
      .text("Observation")
      .attr("y", 40)
      .attr("dominant-baseline", "central")
      .style("text-anchor", "middle");
  };

  renderLegend();
  update(root, false);
}
