"use strict	";

const videoGamesSalesUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";
const videoGamesTitle = "Video Game Sales";
const videoGamesDescription = "Top 100 Most Sold Video Games Grouped by Platform";

const movieSalesUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";
const moviesTitle = "Movie Sales";
const moviesDescription = "Top 100 Highest Grossing Movies Grouped By Genre";

const kickstarterPledgesUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";
const kickstarterTitle = "Kickstarter Pledges";
const kickstarterDescription = "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category";

function setSource(source) {
  switch (source) {
    case "videogames":
      init(videoGamesSalesUrl, videoGamesTitle, videoGamesDescription);
      break;

    case "movies":
      init(movieSalesUrl, moviesTitle, moviesDescription);
      break;

    case "kickstarter":
      init(kickstarterPledgesUrl, kickstarterTitle, kickstarterDescription);
      break;

    default:
      init(videoGamesSalesUrl, videoGamesTitle, videoGamesDescription);
  }
}

const plotWidth = 1440;
const plotHeight = 600;
const padding = 60;

const legendWidth = 200;
const legendPadding = 0;
const legendGap = 3;
const legendFontSize = 12;

function plotGraph(data) {
  d3.select("#container").selectAll("*").remove();

  d3.select("#legend").selectAll("*").remove();

  const tooltip = d3.select("#tooltip");

  const svg = d3
    .select("#container")
    .append("svg")
    .attr("width", plotWidth)
    .attr("height", plotHeight);

  let hierarchy = d3
    .hierarchy(data, (node) => node.children)
    .sum((node) => node.value)
    .sort((node1, node2) => node2.value - node1.value);

  const createTreeMap = d3.treemap().size([plotWidth, plotHeight]);

  createTreeMap(hierarchy);

  const movieTiles = hierarchy.leaves();

  const categories = Array.from(
    new Set(movieTiles.map((d) => d.data.category))
  );

  const colors = {};
  categories.forEach((c) => (colors[c] = randomColor()));

  const blockElements = svg
    .selectAll("g")
    .data(movieTiles)
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${d.x0}, ${d.y0})`);

  blockElements
    .append("rect")
    .attr("class", "tile")
    .attr("fill", (d) => colors[d.data.category])
    .style("stroke", "white")
    .style("stroke-width", 1)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.data.category)
    .attr("data-value", (d) => d.data.value);

  blockElements
    .append("foreignObject")
    .attr("x", 5)
    .attr("y", 5)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .append("xhtml:div")
    .style("width", "100%")
    .style("height", "100%")
    .style("display", "flex")
    .style("font-size", "10px")
    .style("font-family", "sans-serif")
    .style("word-wrap", "break-word")
    .text((d) => d.data.name);

  blockElements
    .on("mousemove", (event, d) => {
      const { name, category, value } = d.data;

      tooltip
        .attr("data-value", value)
        .style("visibility", "visible")
        .html(`Name: ${name}<br/>Category: ${category}<br/>Value: ${value}`)
        .style("font-family", "sans-serif")
        .style("font-size", "12px")
        .style("left", event.pageX + 20 + "px")
        .style("top", event.pageY - 30 + "px");
    })
    .on("mouseout", (_event) => {
      tooltip.style("visibility", "hidden");
    });

  const legendHeight = categories.length * 25;

  const legendScale = d3
    .scaleBand()
    .domain(categories.map((_c, i) => i))
    .range([legendPadding, legendHeight - legendPadding]);

  const legend = d3
    .select("#legend")
    .append("svg")
    .attr("width", legendWidth)
    .attr("height", legendHeight + legendPadding);
  2 * legendGap;

  const legendBlocks = legend
    .selectAll("g")
    .data(categories)
    .enter()
    .append("g");

  legendBlocks
    .append("rect")
    .attr("class", "legend-item")
    .attr("x", 0)
    .attr("y", (_d, i) => legendScale(i))
    .attr("width", legendScale.bandwidth() - 2 * legendGap)
    .attr("height", legendScale.bandwidth() - 2 * legendGap)
    .attr("fill", (d) => colors[d])
    .attr("rx", 5)
    .attr("ry", 5);

  legendBlocks
    .append("text")
    .text((d) => d)
    .attr("x", legendScale.bandwidth() + legendFontSize / 2)
    .attr("y", (_d, i) => legendScale(i) + legendScale.bandwidth() - 2*legendGap - legendFontSize / 2)
    .style("font-family", "sans-serif")
    .style("font-size", `${legendFontSize}px`);
}

async function init(url, title, description) {
  d3.select("#title").text(title);

  d3.select("#description").text(description);

  const response = await fetch(url);
  const data = await response.json();

  plotGraph(data);
}

init(videoGamesSalesUrl, videoGamesTitle, videoGamesDescription);
