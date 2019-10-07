import * as d3 from "d3"
import * as topojson from "topojson"
import ScrollyTeller from "./scrollyteller"
import addLabel from "../components/addLabels"
import { makeTooltip } from './tooltips'

export default function extremesAnimation(states,extremes,places,labels,firstRun) {
	
	var key1, key2, currentDay = null;
	console.log("interval",interval)

	// if (!firstRun) {
	// 	interval.stop()
	// }
	var statusMessage = d3.select("#statusMessage");
	var embedWidth = document.querySelector(".interactive-wrapper").getBoundingClientRect().width
	var width1 = document.querySelector("#scrolly-3 #map1container").getBoundingClientRect().width
	var width2 = document.querySelector("#scrolly-3 #map2container").getBoundingClientRect().width
	var height1 = window.innerHeight;
	var height2 = window.innerHeight;
	var mobile = false;

	if (embedWidth < 620) {
	    // height = width * 0.8;
	    mobile = true;
	}
	var margin1 = {top: 20, right: 0, bottom: 20, left:0}
	var margin2 = {top: 20, right: 0, bottom: 20, left:0}
	if (mobile) {
		margin1 = {top: 80, right: 0, bottom: 10, left:0}
		margin2 = {top: 10, right: 0, bottom: 80, left:0}
		height1 = height1/2
		height2 = height2/2
	}

	console.log("width1", width1, "height1", height1, "width2", width2, "height2", height2, "embedWidth", embedWidth)
	var active = d3.select(null);
	// var scaleFactor = width / 860

	width1 = width1 - margin1.left - margin1.right,
    width2 = width2 - margin2.left - margin2.right,
    height1 = height1 - margin1.top - margin1.bottom,
    height2 = height2 - margin2.top - margin2.bottom;

	var projection = d3.geoMercator()
	                .scale(1)
	                .translate([0,0])

	var imageObj = new Image()
	imageObj.src = '<%= path %>/assets/aus-crop-light.png'

	// console.log(sa2s.objects.sa2s
	var scope = d3.select("#scrolly-3")
	scope.select("#map1container svg").remove();
	scope.select("#map2container svg").remove();

	// console.log(extremes)

	var possibleDays = [];

	for (var i = 0; i < (365*100); i++) {
		possibleDays.push(i)
	}

	var test = []
	extremes.objects.extremes.geometries.forEach(function(d) {
		d.properties.ex_26_2040 = +d.properties.ex_26_2040;
		d.properties.ex_26_2055 = +d.properties.ex_26_2055;
		d.properties.ex_26_2090 = +d.properties.ex_26_2090;
		d.properties.ex_85_2040 = +d.properties.ex_85_2040;
		d.properties.ex_85_2055 = +d.properties.ex_85_2055;
		d.properties.ex_85_2090 = +d.properties.ex_85_2090;
	})

	// console.log(extremes.objects.extremes.geometries)

	var svg1 = scope.select("#map1container").append("svg")	
	                .attr("width", width1 + margin1.left + margin1.right)
					.attr("height", height1 + margin1.top + margin1.bottom)
	                .attr("id", "map1")
	                .attr("overflow", "hidden");

	var svg2 = scope.select("#map2container").append("svg")	
	                .attr("width", width2 + margin2.left + margin2.right)
					.attr("height", height2 + margin2.top + margin2.bottom)
	                .attr("id", "map2")
	                .attr("overflow", "hidden");               

	var features1 = svg1.append("g").attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");	                                                   
	var features2 = svg2.append("g").attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");	                                                   

	var colorLinear = d3.scaleLinear().domain([0, 120]).range(['#67a9cf','red']);                
	var colorThreshold = d3.scaleThreshold().domain([100,1200]).range(['#d4b9da','#df65b0','#980043']);
	var radiusThreshold = d3.scaleThreshold().domain([100,1200]).range([6,10,14]);

	// context.clearRect(0, 0, width, height);

	var path = d3.geoPath()
	    .projection(projection);

	var bounds = path.bounds(topojson.feature(states,states.objects.states));

	var mapScale = 1 / Math.max(
	    (bounds[1][0] - bounds[0][0]) / width1,
	    (bounds[1][1] - bounds[0][1]) / height1);

	var translation = [
	    (width1 - mapScale * (bounds[1][0] + bounds[0][0])) / 2,
	    (height1 - mapScale * (bounds[1][1] + bounds[0][1])) / 2];

	projection
		.scale(mapScale)
		.translate(translation);

	var raster_width = (bounds[1][0] - bounds[0][0]) * mapScale;
	var raster_height = (bounds[1][1] - bounds[0][1]) * mapScale;

	var rtranslate_x = (width1 - raster_width) / 2;
	var rtranslate_y = (height1 - raster_height) / 2;	       

	// var graticule = d3.geoGraticule();

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

	features1.append("image")
	        .attr('id', 'Raster1')
	        .attr("xlink:href", '<%= path %>/assets/aus-crop-light.png')
	        .attr("class", "raster")
	        .attr("width", raster_width)
	        .attr("height", raster_height)
	        .attr("transform", "translate(" + rtranslate_x + ", " + rtranslate_y + ")");        

	features2.append("image")
	        .attr('id', 'Raster2')
	        .attr("xlink:href", '<%= path %>/assets/aus-crop-light.png')
	        .attr("class", "raster")
	        .attr("width", raster_width)
	        .attr("height", raster_height)
	        .attr("transform", "translate(" + rtranslate_x + ", " + rtranslate_y + ")");           

    features1.append("g")
	    .selectAll("path")
	    .attr("id","states1")
	    .data(topojson.feature(states,states.objects.states).features)
	    .enter().append("path")
	        .attr("class", "sa2")
	        .attr("id", d => "sa2" + d.properties.name)
	        .attr("fill", "none")
	        .attr("stroke", "#bcbcbc")
	        .attr("data-tooltip","")
	        .attr("d", path);  

	 features2.append("g")
	    .selectAll("path")
	    .attr("id","states2")
	    .data(topojson.feature(states,states.objects.states).features)
	    .enter().append("path")
	        .attr("class", "sa2")
	        .attr("id", d => "sa2" + d.properties.name)
	        .attr("fill", "none")
	        .attr("stroke", "#bcbcbc")
	        .attr("data-tooltip","")
	        .attr("d", path);              

	var mapCells1 = features1.append("g")
	      			.attr("class", "cells")
	      			.selectAll(".mapCells")
					.data(topojson.feature(extremes,extremes.objects.extremes).features)
					.enter().append("path")
			        .attr("class", "mapCells1")
			        .attr("id", d => "map1_" + d.properties.name)
			        .attr("fill", "none")
			        .attr("stroke", "none")
			        .attr("data-tooltip","")
			        .attr("d", path);   	
	
	        

	var mapCells2 = features2.append("g")
      			.attr("class", "cells")
      			.selectAll(".mapCells")
				.data(topojson.feature(extremes,extremes.objects.extremes).features)
				.enter().append("path")
		        .attr("class", "mapCells")
		        .attr("id", d => "map2_" + d.properties.name)
		        .attr("fill", "none")
		        .attr("stroke", "none")
		        .attr("data-tooltip","")
		        .attr("d", path);  		        


	var mapCircles1 = features1.selectAll(".mapCircle1")
						.data(topojson.feature(extremes,extremes.objects.extremes).features);				

	mapCircles1					
		.enter()
		.append("circle")
		.attr("class", "mapCircle1")
		.attr("title",function(d){return d.properties.name })
		.attr("cx",function(d){return projection([d.properties.lon,d.properties.lat])[0]})
		.attr("cy",function(d){ return projection([d.properties.lon,d.properties.lat])[1]})
		.attr("r", function(d){ return 5 } )
		.style("fill", function(d) { return "#67a9cf" })
		.style("opacity", 1)

	
	makeTooltip(".mapCircle1", "#map1container", projection)
		
	var mapCircles2 = features2.selectAll(".mapCircle2")
						.data(topojson.feature(extremes,extremes.objects.extremes).features);				

	mapCircles2					
		.enter()
		.append("circle")
		.attr("class", "mapCircle2")
		.attr("title",function(d){return d.properties.name })
		.attr("cx",function(d){return projection([d.properties.lon,d.properties.lat])[0]})
		.attr("cy",function(d){ return projection([d.properties.lon,d.properties.lat])[1]})
		.attr("r", function(d){ return 5 } )
		.style("fill", function(d) { return "#67a9cf" })
		.style("opacity", 1)	

	makeTooltip(".mapCircle2", "#map2container", projection)	

	// makeTooltip(".mapCircle2", "#map2")	

	features1.append("text")
		.attr("id", "map1label")
		.attr("class", "labelText")
		.attr("x", function() { 
			if (embedWidth < 620) {
				return width1 * 0.1
			}
			
			else {
				return width1 * 0.40
			}	
		})	
		.attr("y", function() {
			if (embedWidth < 620) {
				return height1	
			}

			else {
				return height1 * 0.8
			} 

		})
		.text("Present day")

	features2.append("text")
		.attr("id", "map2label")
		.attr("class", "labelText")
		.attr("x", function() { 
			if (embedWidth < 620) {
				return width2 * 0.1
			}
			
			else {
				return width2 * 0.40
			}	
		})
		.attr("y", function() {
			if (embedWidth < 620) {
				return height2
			}

			else {
				return height2 * 0.8
			} 

		})
		.text("RCP 2.6, 2046-65")	

	var map1label = features1.select("#map1label")
	var map2label = features2.select("#map2label")	

	function getRandom() {
		  return Math.floor(Math.random() * (36500 - 1 + 1)) + 1;
	}

	function updateCircles() {
		// console.log("updating")
		extremes.objects.extremes.geometries.forEach(function(d) {

			// for map 1

			var rand1 = getRandom()/36500;

			// console.log(rand)
			if (key1 == 'default') {
				if ((1/36500) >= rand1) {

				d.properties.default_count = d.properties.default_count + 1;

				// console.log("flooded", d.properties.name)
				
				features1
					.append("circle")
					.attr("cx",projection([d.properties.lon,d.properties.lat])[0])
					.attr("cy",projection([d.properties.lon,d.properties.lat])[1])
					.attr("r",0)
					.style("fill","red")
					.style("pointer-events", "none")
					.style("opacity",1)
					.transition()
					.duration(800)
					.attr("r",20)
					.style("opacity",0)
					.remove()


				}
			}

			else {
				if ((d.properties[key1]/36500) >= rand1) {
				// console.log("flooded!", d.properties.name)

				d.properties[key1 + "_count"] = d.properties[key1 + "_count"] + 1;

				features1
					.append("circle")
					.attr("cx",projection([d.properties.lon,d.properties.lat])[0])
					.attr("cy",projection([d.properties.lon,d.properties.lat])[1])
					.attr("r",0)
					.style("fill","red")
					.style("pointer-events", "none")
					.style("opacity",1)
					.transition()
					.duration(800)
					.attr("r",20)
					.style("opacity",0)
					.remove()

				}
			}

			var rand2 = getRandom()/36500;
			
			if (key2 == 'default') {
				if ((1/36500) >= rand2) {
				// console.log("flooded", d.properties.name)
				
				d.properties.default_count = d.properties.default_count + 1;

				features2
					.append("circle")
					.attr("cx",projection([d.properties.lon,d.properties.lat])[0])
					.attr("cy",projection([d.properties.lon,d.properties.lat])[1])
					.attr("r",0)
					.style("fill","red")
					.style("pointer-events", "none")
					.style("opacity",1)
					.transition()
					.duration(800)
					.attr("r",20)
					.style("opacity",0)
					.remove()

				}
			}

			else {
				if ((d.properties[key2]/36500) >= rand2) {
				// console.log("flooded!", d.properties.name)

				d.properties[key2 + "_count"] = d.properties[key2 + "_count"] + 1;

				features2
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

		scope.selectAll(".mapCircle1").style("fill", function(d) {
     				return colorLinear(d.properties[key1 + "_count"])
     			})

		scope.selectAll(".mapCircle2").style("fill", function(d) {
 				return colorLinear(d.properties[key2 + "_count"])
 			})
	}



	var animationSpeed = 1
	currentDay = 0
	var counter = d3.select("#counter")
	// var dayLimit = 3650
	var dayLimit = 3650
	function animate(t) {

		if (currentDay >= dayLimit) {
			console.log("stop")
			interval.stop()
			extremes.objects.extremes.geometries.forEach(function(d) {
				console.log("key1", d.properties.name, d.properties[key1 + "_count"])
				console.log("key2", d.properties.name, d.properties[key2 + "_count"])
			})
		}

		updateCircles()
		// console.log(currentDay)
		counter.html("Year: " + Math.trunc((currentDay/365)) + ", day: " + currentDay%365)
		currentDay++
	
	}

	function animationRestart() {
		console.log("pause")
		
		monthText.text("Replaying")

		var t = d3.timer(function(elapsed) {
			monthText.text("Paused")
		  	yearText.text(10 - Math.round(elapsed/1000))
		  	// console.log(elapsed)
		  	if (elapsed > 10000)

		  	{
		  		t.stop()
		  		currentDate = moment(startDateStr, 'YYYY-MM-DD');
				interval.restart(animate, animationSpeed)
		  	} 
		}, 1000);
	}	
	currentDay = 0
	key1 = "default"
	key2 = "ex_25_2055"
	
	interval = d3.interval(animate, animationSpeed);
	// interval.stop()

	function resetAnimation() {
		interval.stop()
		currentDay = 0
		extremes.objects.extremes.geometries.forEach(function(d) {
			d.properties.ex_26_2040_count = 0;
			d.properties.ex_26_2055_count = 0;
			d.properties.ex_26_2090_count = 0;
			d.properties.ex_85_2040_count = 0;
			d.properties.ex_85_2055_count = 0;
			d.properties.ex_85_2090_count = 0;
			d.properties.default_count = 0;
		})
		// console.log(extremes.objects.extremes.geometries)
	}

	resetAnimation()

	 const scrolly = new ScrollyTeller({
            parent: document.querySelector("#scrolly-3"),
            triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
            triggerTopMobile: 0.75,
            transparentUntilActive: true
     });

    scrolly.addTrigger({num: 1, do: () => {

     	// d3.selectAll(".mapCircle").transition().style("opacity",0.8).style("fill", "#67a9cf")
     	resetAnimation()
     	map1label.text("Present day")
     	map2label.text("RCP 2.6, 2046-2065")
     	key1 = "default"
		key2 = "ex_26_2055"
     	interval.restart(animate, animationSpeed)
     	

    }});

    scrolly.addTrigger({num: 2, do: () => {

    	resetAnimation()
    	currentDay = 0
    	map1label.text("RCP 2.6, 2081-2100")
     	map2label.text("RCP 8.5, 2081-2100")
    	key1 = "ex_26_2090"
		key2 = "ex_85_2090"
		interval.restart(animate, animationSpeed)

    }});

    // scrolly.addTrigger({num: 3, do: () => {


    //  	scope.selectAll(".mapCircle").transition().style("fill", function(d) {
    //  		return colorThreshold(d.properties.ex_26_2055)
    //  	}).attr("r", function(d) {
    //  			return radiusThreshold(d.properties.ex_26_2055)
    //  		})


    // }});

    // scrolly.addTrigger({num: 4, do: () => {

    //  	scope.selectAll(".mapCircle").transition().style("fill", function(d) {
    //  		return colorThreshold(d.properties.ex_26_2090)
    //  	}).attr("r", function(d) {
    //  			return radiusThreshold(d.properties.ex_26_2090)
    //  		})

    // }});

    // scrolly.addTrigger({num: 5, do: () => {

    //  	scope.selectAll(".mapCircle").transition().style("fill", function(d) {
    //  		return colorThreshold(d.properties.ex_85_2040)
    //  	}).attr("r", function(d) {
    //  			return radiusThreshold(d.properties.ex_85_2040)
    //  		})

    // }});

    // scrolly.addTrigger({num: 6, do: () => {

    //  	scope.selectAll(".mapCircle").transition().style("fill", function(d) {
    //  		return colorThreshold(d.properties.ex_85_2055)
    //  	}).attr("r", function(d) {
    //  			return radiusThreshold(d.properties.ex_85_2055)
    //  		})

    // }});

    // scrolly.addTrigger({num: 7, do: () => {

    //  	scope.selectAll(".mapCircle").transition().style("fill", function(d) {
    //  		return colorThreshold(d.properties.ex_85_2090)
    //  	}).attr("r", function(d) {
    //  			return radiusThreshold(d.properties.ex_85_2090)
    //  	})

    // }});

    scrolly.watchScroll();
    firstRun = false;
}

// Promise.all([
// 	d3.json('<%= path %>/assets/au-states.json'),
// 	d3.json('<%= path %>/assets/extremes-merged.json'),
// 	d3.json('<%= path %>/assets/places.json'),
// 	d3.csv('<%= path %>/assets/labels.csv')
// ])
// .then((results) =>  {
	
// 	init(results[0],results[1],results[2],results[3])

// 	var to=null
// 	var lastWidth = document.querySelector("#mapWrapper").getBoundingClientRect()
// 	var lastHeight = window.innerHeight
// 	window.addEventListener('resize', function() {

// 		var thisWidth = document.querySelector("#mapWrapper").getBoundingClientRect()
// 		var thisHeight = window.innerHeight
// 		if (lastWidth != thisWidth | lastHeight != thisHeight) {
			
// 			window.clearTimeout(to);
// 			to = window.setTimeout(function() {
// 					console.log("resize")
// 				    init(results[0],results[1],results[2],results[3])
// 				}, 100)
// 		}
			
// 	})

// });