

var svg = d3.select("body").append("svg")
    .attr("width", '100%')
    .attr("height", '100%');

var g = svg.selectAll("g")
    .data(d3.range(25))
  .enter().append("g")
    .attr("transform", "translate(" + mouse + ")");

var windowWidth = window.innerWidth,
    windowHeight = window.innerHeight;

var mouse = [windowWidth/2, windowHeight/2],
    count = 0;

var colorScale = d3.scaleLinear().domain([0, 20]).range([0, 1]);
var color = (index) => {
    return d3.interpolateInferno(colorScale(index));
  };

g.append("rect")
    .attr("x", - windowWidth / 10 / 2)
    .attr("y", - windowHeight / 10 / 2)
    .attr("width", windowWidth / 10)
    .attr("height", windowHeight / 10)
    .attr("transform", function(d, i) { return "scale(" + (1 - d / 25) * 10 + ")"; })
    .style("fill", (d, i) => { return color(i); })

g.datum(function(d) {
  return {center: mouse.slice(), angle: 0};
});

svg.on("mousemove", function() {
  mouse = d3.mouse(this);
});

d3.timer(function() {
  count++;
  g.attr("transform", function(d, i) {
    d.center[0] += (mouse[0] - d.center[0]) / (i + 5);
    d.center[1] += (mouse[1] - d.center[1]) / (i + 5);
    return "translate(" + d.center + ")";
  });
});