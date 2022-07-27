// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const d3 = window.d3;

export function render(el, data) {

  el.innerHTML = "";

  const dim = {
    width: el.offsetWidth,
    height: el.offsetHeight,
    margin: { top: 20, right: 3, bottom: 20, left: 55 },
  };

  const filtered = [ "commands" ]
  const nodes = [ { id: "cache", Component: "Cache" }, { id: "events", Component: "Events" }];
  const edges = [];

  const getLastParts = type => {
    const splits = type.split(".");
    return splits[splits.length - 2] + "." + splits[splits.length - 1];
  };

  for (let i = 0; i < data.added.length; i++) {
    const a = data.added[i];
    if (filtered.indexOf(a.Component) === -1) nodes.push({ ...a, id: a.Component});
  }

  for (let i = 0; i < data.connected.length; i++) {
    const c = data.connected[i];
    if (filtered.indexOf(c.Publisher) !== -1 || filtered.indexOf(c.Subscriber) !== -1) continue; 
    const edge = edges.find(e => e.source === c.Publisher && e.target === c.Subscriber);
    if (!!edge) {
      edge.count++;
      edge.types.push(getLastParts(c.Type));
    } else {
      edges.push({ source: c.Publisher, target: c.Subscriber, types: [getLastParts(c.Type)], count: 1 });
    }
  }

  let svg = d3.select(el).append("svg")
      .attr("width", dim.width)
      .attr("height", dim.height);
  let g = svg.append("g");
  svg.call(d3.zoom().on("zoom", function(event) {
      g.attr("transform", event.transform);
  }));

  let simulation = d3.forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(-500).theta(0.1))
      .force("link", d3.forceLink(edges).id(d => d.id).distance(200))
      .force("x", d3.forceX(dim.width / 2).strength(0.05))
      .force("y", d3.forceY(dim.height / 2).strength(0.05));

  let lines = g.selectAll("line")
      .data(edges)
      .enter()
      .append("line")
      .attr("id", function(d, i) { return "edge" + i; })
      .attr("marker-end", "url(#arrowhead)")
      .style("stroke", "#666")
      .style("pointer-events", "none");

  let circles = g.selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 10)
      .style("fill", "#DCB606")
      .style("stroke", "#666")
      .on("dblclick", releasenode)
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
  }

  function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
  }

  function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      // d3.event.subject.fx = null;
      // d3.event.subject.fy = null;
  }

  function releasenode(d) {
      d.fx = null;
      d.fy = null;
  }

  let nodelabels = g.selectAll(".nodelabel")
      .data(nodes)
      .enter()
      .append("text")
          .attr("text-anchor", "middle")
          // .attr("dx", -60)
          .attr("dy", 20)
          .attr("class", "nodelabel")
          .attr("font-size", 10)
          .style("fill", "blue")
          .text(function(d) { return d.Component; });

  let edgepaths = g.selectAll(".edgepath")
      .data(edges)
      .enter()
      .append("path")
      .attr("d", function(d) { return "M " + d.source.x + " " + d.source.y + " L " + d.target.x + " " + d.target.y; })
      .attr("class", "edgepath")
      .attr("fill-opacity", 0)
      .attr("stroke-opacity", 0)
      .attr("id", function(d, i) { return "edgepath" + i; })
      .style("pointer-events", "none");

  let edgelabels = g.selectAll(".edgelabel")
      .data(edges)
      .enter()
      .append("text")
          .style("pointer-events", "none")
          .attr("class", "edgelabel")
          .attr("id", function(d, i) { return "edgelabel" + i; })
          .attr("dx", 50)
          .attr("dy", -2)
          .attr("font-size", 10)
          .style("fill", "#666");

  edgelabels.append("textPath")
      .attr("xlink:href", function(d, i) { return "#edgepath" + i; })
      .style("pointer-events", "none")
      .text(function(d, i) { return d.types.join(); });

  g.append("defs")
      .append("marker")
          .attr("id", "arrowhead")
          .attr("viewBox", "-0 -5 10 10")
          .attr("refX", 20)
          .attr("refY", 0)
          .attr("markerUnits", "strokeWidth")
          .attr("orient", "auto")
          .attr("markerWidth", 10)
          .attr("markerHeight", 10)
          .attr("xoverflow", "visible")
      .append("svg:path")
          .attr("d", "M 0,-5 L 10 ,0 L 0,5")
          .attr("fill", "#666")
          .attr("stroke", "#666");

  simulation.on("tick", function() {
      lines.attr("x1", function(d) { return d.source.x;})
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      circles.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });

      nodelabels.attr("x", function(d) { return d.x; })
          .attr("y", function(d) { return d.y; });

      edgepaths.attr("d", function(d) {
          let path = "M " + d.source.x + " " + d.source.y + " L " + d.target.x + " " + d.target.y;
          //console.log(d)
          return path;
      });

      // edgelabels.attr("transform", function(d, i) {
      //     if (d.target.x < d.source.x) {
      //         bbox = this.getBBox();
      //         rx = bbox.x + bbox.width / 2;
      //         ry = bbox.y + bbox.height / 2;
      //         return "rotate(180 " + rx + " " + ry + ")";
      //     }

      //     return "rotate(0)";
      // });
  });
};
