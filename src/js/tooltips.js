import * as d3 from "d3"

function makeTooltip(el,parent,projection) {

	console.log("make", el)
	
	var els = d3.selectAll(el)
	var width = document.querySelector(parent).getBoundingClientRect().width

	var tooltip = d3.select("body").append("div")
		    .attr("class", "tooltip")
		    .attr("id", "tooltip")
		    .style("position", "absolute")
		    .style("background-color", "white")
		    .style("pointer-events","none")
		    .style("z-index",200)
		    .style("opacity", 0);

	els.on("mouseover", function(d) {
		var text = `<b>${d.properties.name}</b>`
		tooltip.transition()
			.duration(200)
		   	.style("opacity", 1);

		tooltip.html(text)
		var tipHeight = document.querySelector("#tooltip").getBoundingClientRect().height
		var tipWidth = document.querySelector("#tooltip").getBoundingClientRect().width
		// console.log(tipHeight)
		var mouseX = d3.event.pageX
        var mouseY = d3.event.pageY
        console.log(mouseX,mouseY)

        tooltip.style("left", mouseX - (tipWidth/2) + "px");
        tooltip.style("top", mouseY - 50 + "px");

	})
	
	els.on("mouseout", function(d) {

	  tooltip.transition()
	       .duration(500)
	       .style("opacity", 0);

	})


}

export { makeTooltip }