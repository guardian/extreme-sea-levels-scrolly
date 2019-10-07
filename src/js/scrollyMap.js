import * as d3 from "d3"
import * as topojson from "topojson"
import ScrollyTeller from "./scrollyteller"
import addLabel from "../components/addLabels"

export default function scrollyMap(states,extremes,places,labels,firstRun) {

	var statusMessage = d3.select("#statusMessage");
	var width = document.querySelector("#mapLocations").getBoundingClientRect().width
	var height = width * 0.8
	var mobile = false;

	if (width < 620) {
	    // height = width * 0.8;
	    mobile = true;
	}
	var margin = {top: 0, right: 5, bottom: 0, left:5}
	// if (mobile) {
	// 	margin = {top: 0, right: 5, bottom: 0, left:5}
	// }
	var active = d3.select(null);
	var scaleFactor = width / 860

	width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom;

	var projection = d3.geoMercator()
	                .scale(1)
	                .translate([0,0])

	var imageObj = new Image()
	imageObj.src = '<%= path %>/assets/aus-crop-light.png'

	// console.log(sa2s.objects.sa2s
	   
	var scope = d3.select("#mapLocations")
	scope.select(".mapWrapper svg").remove();

	// console.log(extremes)

	var possibleDays = [];

	for (var i = 0; i < (365*100); i++) {
		possibleDays.push(i)
	}

	// console.log(possibleDays

	var svg = scope.select(".mapWrapper").append("svg")	
	                .attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
	                .attr("id", "map")
	                .attr("overflow", "hidden");

	var features = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");	                                                   
	var oranges = ['#feb24c','#fd8d3c','#fc4e2a','#b10026']
	var purples = ['#67a9cf','#8c96c6','#8c6bb1','#6e016b']
	var colorLinear = d3.scaleLinear().domain([0, 1200]).range(['#ffeda0','#f03b20']);                
	var colorThreshold = d3.scaleThreshold().domain([10,100,1000]).range(purples);
	var radiusThreshold = d3.scaleThreshold().domain([10,100,1000]).range([6,8,10,12]);

	// context.clearRect(0, 0, width, height);

	var path = d3.geoPath()
	    .projection(projection);

	var bounds = path.bounds(topojson.feature(states,states.objects.states));

	var mapScale = 1 / Math.max(
	    (bounds[1][0] - bounds[0][0]) / width,
	    (bounds[1][1] - bounds[0][1]) / height);

	var translation = [
	    (width - mapScale * (bounds[1][0] + bounds[0][0])) / 2,
	    (height - mapScale * (bounds[1][1] + bounds[0][1])) / 2];

	projection
		.scale(mapScale)
		.translate(translation);

	var raster_width = (bounds[1][0] - bounds[0][0]) * mapScale;
	var raster_height = (bounds[1][1] - bounds[0][1]) * mapScale;

	var rtranslate_x = (width - raster_width) / 2;
	var rtranslate_y = (height - raster_height) / 2;	       

	var graticule = d3.geoGraticule();

	labels.forEach( function(d) {
		d.lat = +d.lat;
		d.lon = +d.lon;
	})

	var filterPlaces = places.features.filter(function(d){ 
		if (mobile) {
			return d.properties.scalerank < 2	
		}

		else {
			return d.properties.scalerank < 2		
		}
		
	});

	features.append("image")
	        .attr('id', 'Raster')
	        .attr("xlink:href", '<%= path %>/assets/aus-crop-light.png')
	        .attr("class", "raster")
	        .attr("width", raster_width)
	        .attr("height", raster_height)
	        .attr("transform", "translate(" + rtranslate_x + ", " + rtranslate_y + ")");        

    features.append("g")
	    .selectAll("path")
	    .attr("id","states")
	    .data(topojson.feature(states,states.objects.states).features)
	    .enter().append("path")
	        .attr("class", "sa2")
	        .attr("id", d => "sa2" + d.properties.name)
	        .attr("fill", "none")
	        .attr("stroke", "#bcbcbc")
	        .attr("data-tooltip","")
	        .attr("d", path);    

	var mapCells = features.append("g")
	      			.attr("class", "cells")
	      			.selectAll(".mapCells")
					.data(topojson.feature(extremes,extremes.objects.extremes).features)
					.enter().append("path")
			        .attr("class", "mapCells")
			        .attr("id", d => "sa2" + d.properties.name)
			        .attr("fill", "none")
			        .attr("stroke", "none")
			        .attr("data-tooltip","")
			        .attr("d", path);   	
	        
	var mapCircles = features.selectAll(".mapCircle")
						.data(topojson.feature(extremes,extremes.objects.extremes).features);				

	mapCircles					
		.enter()
		.append("circle")
		.attr("class", "mapCircle")
		.attr("title",function(d){return d.properties.name })
		.attr("cx",function(d){return projection([d.properties.lon,d.properties.lat])[0]})
		.attr("cy",function(d){ return projection([d.properties.lon,d.properties.lat])[1]})
		.attr("r", function(d){ return 5 } )
		.style("fill", function(d) { return "#67a9cf" })
		.style("opacity", 0)
	
	addLabel({"el":features,
			"id":"denison",
			"targetX":projection([151.2,-33.9])[0],
			"targetY":projection([151.2,-33.9])[1],
			"sourceX":projection([154.21,-36.09])[0],
			"sourceY":projection([154.21,-36.09])[1],
			"text":"Fort Denison",
			"sweepFlag":0
			});

	scope.select("#denison").style("opacity",0)

	function getRandom() {
		  return Math.floor(Math.random() * (36500 - 1 + 1)) + 1;
	}

	function updateCircles(key) {
		extremes.objects.extremes.geometries.forEach(function(d) {
			var rand = getRandom()/36500;
			// console.log(rand)
			if (key == 'default') {
				if ((1/36500) >= rand) {
				console.log("Winner!", d.properties.name)
				}
			}

			else {
				if ((d.properties[key]/36500) >= rand) {
				console.log("flooded!", d.properties.name)

				features
					.append("circle")
					.attr("cx",projection([d.properties.lon,d.properties.lat])[0])
					.attr("cy",projection([d.properties.lon,d.properties.lat])[1])
					.attr("r",0)
					.style("fill","red")
					.style("opacity",1)
					.transition()
					.duration(800)
					.attr("r",20)
					.style("opacity",0)
					.remove()

				}
			}
			
		})
	}

	scope.selectAll(".mapCircle").transition().style("opacity",1).style("fill", "#67a9cf").attr("r", 5)

	// var animationSpeed = 1
	// var currentDay = 0
	// var counter = d3.select("#counter")
	// function animate(t) {

	// 	if (currentDay >= 3650) {
	// 		console.log("stop")
	// 		interval.stop()
	// 	}
	// 	updateCircles("ex_85_2090")
	// 	console.log(currentDay)
	// 	counter.html(currentDay)
	// 	currentDay++
	
	// }

	// var interval = d3.interval(animate, animationSpeed);

	 // const scrolly = new ScrollyTeller({
  //           parent: document.querySelector("#scrolly-1"),
  //           triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
  //           triggerTopMobile: 0.75,
  //           transparentUntilActive: true
  //    });

  //   scrolly.addTrigger({num: 1, do: () => {

  //    	scope .selectAll(".mapCircle").transition().style("opacity",0.8).style("fill", "#67a9cf").attr("r", 5)

  //   }});

  //   scrolly.addTrigger({num: 2, do: () => {

  //    	scope.selectAll(".mapCircle")
  //    		.transition()
  //    		.style("fill", function(d) {
  //    		return colorThreshold(d.properties.ex_26_2055)
  //    		})
  //    		.attr("r", function(d) {
  //    			return radiusThreshold(d.properties.ex_26_2055)
  //    		})

  //   }});

  //   scrolly.addTrigger({num: 3, do: () => {


  //    	scope.selectAll(".mapCircle").transition().style("fill", function(d) {
  //    		return colorThreshold(d.properties.ex_85_2055)
  //    	}).attr("r", function(d) {
  //    			return radiusThreshold(d.properties.ex_85_2055)
  //    		})


  //   }});

  //   scrolly.addTrigger({num: 4, do: () => {

  //    	scope.selectAll(".mapCircle").transition().style("fill", function(d) {
  //    		return colorThreshold(d.properties.ex_85_2090)
  //    	}).attr("r", function(d) {
  //    			return radiusThreshold(d.properties.ex_85_2090)
  //    		})

  //   }});

  //   scrolly.watchScroll();
    firstRun = false;
}