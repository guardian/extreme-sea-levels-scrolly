import * as d3 from "d3"
// import scrollyMap from "./scrollyMap"
import extremesChart from "./extremesChart"
import extremesAnimation from "./extremesAnimation"

window.interval=null;  

Promise.all([
	d3.json('<%= path %>/assets/au-states.json'),
	d3.json('<%= path %>/assets/extremes-merged.json'),
	d3.json('<%= path %>/assets/places.json'),
	d3.csv('<%= path %>/assets/labels.csv'),
	d3.csv('<%= path %>/assets/sealevels.csv')
])
.then((results) =>  {
	
	// scrollyMap(results[0],results[1],results[2],results[3],true)
	extremesChart(results[4],true)
	extremesAnimation(results[0],results[1],results[2],results[3],true)

	var to=null
	var lastWidth = document.querySelector("#data-viz2").getBoundingClientRect()
	var lastHeight = window.innerHeight
	window.addEventListener('resize', function() {

		var thisWidth = document.querySelector("#data-viz2").getBoundingClientRect()
		var thisHeight = window.innerHeight
		if (lastWidth != thisWidth | lastHeight != thisHeight) {
			
			window.clearTimeout(to);
			to = window.setTimeout(function() {
					console.log("resize")
				    // scrollyMap(results[0],results[1],results[2],results[3],true)
					extremesChart(results[4],true)
					if (interval != null) {
						interval.stop()	
					}
					
					extremesAnimation(results[0],results[1],results[2],results[3],true)
				}, 100)
		}
			
	})

});