"use strict	";

const movieSalesUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";

const plotWidth = 960;
const plotHeight = 600;
const padding = 60;

const barColor = "#607EAA";
const barWidth = 100;
const selectionColor = "#1C3879";

const legendWidth = 300;
const legendHeight = 15;
const legendPadding = 30;

const colors = {
  Action: "#4c92c3",
  Drama: "#bed2ed",
  Adventure: "#ff993e",
  Family: "#ffc993",
  Animation: "#ade5a1",
  Comedy: "#56b356",
  Biography: "#de5253",
};

function plotGraph(movieSales) {
  const tooltip = d3.select("#tooltip");

  const svg = d3
    .select("#container")
    .append("svg")
    .attr("width", plotWidth)
    .attr("height", plotHeight);

  let hierarchy = d3
    .hierarchy(movieSales, (node) => node.children)
    .sum((node) => node.value)
    .sort((node1, node2) => node2.value - node1.value);

  const createTreeMap = d3.treemap().size([plotWidth, plotHeight]);

  createTreeMap(hierarchy);

  const movieTiles = hierarchy.leaves();

  const categories = Array.from(new Set(movieTiles.map(d => d.data.category)));

  console.log(movieTiles)

  const blockElements = svg
    .selectAll("g")
    .data(movieTiles)
    .enter()
    .append("g")
    .attr("transform", d => `translate(${d.x0}, ${d.y0})`);

  blockElements
    .append("rect")
    .attr("class", "tile")
    .attr("fill", d => colors[d.data.category])
    .attr("data-name", d => d.data.name)
    .attr("data-category", d => d.data.category)
    .attr("data-value", d => d.data.value)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0);

  blockElements
    .append("text")
    .text(d => d.data.name)
    .attr("x", 5)
    .attr("y", 20)

  blockElements
    .on("mouseover", (event, d) => {
      const { name, category, value } = d.data;

      tooltip
        .attr("data-value", value)
        .style("visibility", "visible")
        .html(`${name}<br/>${category}<br/>${value}`)
        .style("font-family", "sans-serif")
        .style("font-size", "12px")
        .style("left", event.pageX + 20 + "px")
        .style("top", event.pageY - 30 + "px");
    })
    .on("mouseout", (_event) => {
      tooltip.style("visibility", "hidden");
    });

  const legend = d3
    .select("#legend")
    .append("svg")
    .attr("width", legendWidth)
    .attr("height", legendHeight + legendPadding);

  const legendBlocks = legend
    .selectAll("g")
    .data(categories)
    .enter()
    .append("g");

  legendBlocks
    .append("rect")
    .attr("class", "legend-item")
    .attr("x", (_d, i) => i)
    .attr("y", 0)
    .attr("width",10)
    .attr("height", 10)
    .attr("fill", (d) => colors[d])

  legendBlocks
    .append("text")
    .text(d => d)
    .attr("x", 5)
    .attr("y", 20)
}

async function init() {
  const movieSalesResponse = await fetch(movieSalesUrl);
  const movieSales = await movieSalesResponse.json();

  plotGraph(movieSales);
}

init();