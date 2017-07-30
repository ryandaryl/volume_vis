var width = innerWidth // Math.max(960, innerWidth),
   height = innerHeight // Math.max(500, innerHeight);

var i = 0;

var svg = d3.select("#container").append("svg")
   .attr("width", width)
   .attr("height", height)
   .attr("z-index", 1);

svg.append("rect")
   .attr("width", width)
   .attr("height", height)
   .on("ontouchstart" in document ? "touchmove" : "mousemove", particle);

function particle(xy, mr) {
 var m = xy ? xy : d3.mouse(this);
 var max_radius =mr ? mr : 100

 svg.insert("circle", "rect")
     .attr("cx", m[0])
     .attr("cy", m[1])
     .attr("r", 1e-6)
     .style("stroke", d3.hsl((i = (i + 1) % 360), 1, .5))
     .style("stroke-opacity", 1)
   .transition()
     .duration(2000)
     .ease(Math.sqrt)
     .attr("r", max_radius)
     .style("stroke-opacity", 1e-6)
     .remove();

//  d3.event.preventDefault();
}