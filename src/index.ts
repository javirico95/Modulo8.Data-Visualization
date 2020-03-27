import * as d3 from "d3";
import * as topojson from "topojson-client";
const spainjson = require("./spain.json");
const d3Composite = require("d3-composite-projections");
import { latLongCommunities } from "./communities";
import { stats, new_stats, ResultEntry } from "./stats";


const radiusDependingCVCases = (comunidad: string, data: ResultEntry[]) => {
    const entry = data.find(item => item.name === comunidad);
    const maxAffected = 1000;


const affectedRadiusScale = d3
  .scaleLinear()
  .domain([0, maxAffected])
  .range([5, 40])
  .clamp(true);

  return entry ? affectedRadiusScale(entry.value) : 0;
};

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  .attr("style", "background-color: #FBFAF0");

const aProjection = d3Composite
  .geoConicConformalSpain()
  // Let's make the map bigger to fit in our resolution
  .scale(3300)
  // Let's center the map
  .translate([500, 400]);

const geoPath = d3.geoPath().projection(aProjection);
const geojson = topojson.feature(spainjson, spainjson.objects.ESP_adm1);

svg
  .selectAll("path")
  .data(geojson["features"])
  .enter()
  .append("path")
  .attr("class", "country")
  // data loaded from json file
  .attr("d", geoPath as any);


svg
  .selectAll("circle")
  .data(latLongCommunities)
  .enter()
  .append("circle")
  .attr("class", "affected-marker")
  .attr("r", d => radiusDependingCVCases(d.name,stats))
  .attr("cx", d => aProjection([d.long, d.lat])[0])
  .attr("cy", d => aProjection([d.long, d.lat])[1]);


  const updateStats = (data: ResultEntry[]) => {
    svg.selectAll("circle")
    .data(latLongCommunities)
    .attr("r", d => radiusDependingCVCases(d.name, data))
    .attr("cx", d => aProjection([d.long, d.lat])[0])
    .attr("cy", d => aProjection([d.long, d.lat])[1]);
  };

  document
  .getElementById("stats")
  .addEventListener("click", function handleStats() {
    updateStats(stats);
  });

document
  .getElementById("new_stats")
  .addEventListener("click", function handleNewStats() {
    updateStats(new_stats);
  });