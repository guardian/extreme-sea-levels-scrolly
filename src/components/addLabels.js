function generateArc(config) {

	// Optional arg for large arc flag, set to zero if doesn't exist

	if (!config.largeArcFlag) {
		config.largeArcFlag = 0
	}

	// Optional arg for sweep flag, set to zero if doesn't exist

	if (!config.sweepFlag) {
		config.sweepFlag = 0
	}

	// Optional arg that sets both x and y radius

	if (!config.radius) {
		config.radius = 75
	}

	var curvePath = `M ${config.sourceX}, ${config.sourceY} A ${config.radius}, ${config.radius} 0 ${config.largeArcFlag},${config.sweepFlag} ${config.targetX}, ${config.targetY}`
	console.log(curvePath)
	return curvePath
	
}

function checkOrientation(config) {
	if (config.sourceX > config.targetX) {
		return "start"
	}

	else if (config.sourceX < config.targetX) {
		return "end"
	}
}

export default function addLabel(config) {

	var labelWrapper = config.el.append("g")
							.attr("id", config.id)
							.attr("class", "labelWrapper")

	config.el.append("svg:defs").append("svg:marker")
		.attr("id", "arrow")
		.attr("refX", 6)
		.attr("refY", 6)
		.attr("markerWidth", 30)
		.attr("markerHeight", 30)
		.attr("markerUnits","userSpaceOnUse")
		.attr("orient", "auto")
		.append("path")
		.attr("d", "M 0 0 12 6 0 12 3 6")
		.style("fill", "black")

	labelWrapper.append("path")
		.attr("class", "labelPath")
		.attr("fill", "none")
		.attr("stroke", "#000")
		.attr("marker-end", "url(#arrow)")
		.attr("d", generateArc(config))

	labelWrapper.append("text")
		.attr("class", "labelText")
		.attr("text-anchor", checkOrientation(config))
		.attr("x", config.sourceX)
		.attr("y", config.sourceY)
		.attr("dy",10)
		.attr("dx",0)
		.attr("fill","#767676")
		.text(config.text)

}