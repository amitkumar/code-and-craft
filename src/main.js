import * as d3 from 'd3';
import jquery from 'jquery';
import moment from 'moment';

window.d3 = d3;
var windowWidth = window.innerWidth,
    windowHeight = window.innerHeight;

var container = d3.select("#background-shapes"); 

var mouse = [windowWidth/2, windowHeight/2];

var total = 20;

var colorScale = d3.scaleLinear().domain([0, total]).range([.3, 1]);
var color = (index) => {
  return d3.interpolateRainbow(colorScale(index));
};

// var color = d3.scaleLinear()
//     .domain([0, total])
//     .range(["blue", "orange"]);

var pathColorScale = d3.scaleLinear().domain([total, 0]).range([.3, 1]);
var pathColor = (index) => {
  return d3.interpolateRainbow(pathColorScale(index));
};

// var pathColor = d3.scaleLinear()
//     .domain([total, 0])
//     .range(["blue", "orange"]);

var tileSize = 100;

var svgWrappers = container.selectAll("div")
  .data(d3.range(total))
  .enter().append("div")
  .attr('class', 'svg-wrapper');

var svgs = svgWrappers.append("svg")
    .attr('viewBox', '0 0 100 100')
    // .attr("width", tileSize)
    // .attr("height", tileSize)
    .attr("transform", function(d, i) { 
      return `translate(${mouse})`; 
    })
    
var center = tileSize / 2;

svgs.append("g")
  // .style("fill", (d, i) => { return color(i); })
    

var g = svgs.selectAll('g');

g.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", tileSize)
  .attr("height", tileSize)
  .style("fill", (d, i) => { 
    return color(d);
  })
  // .style('fill', '#fff');

g.datum(function(d) {
  return { center: mouse.slice(), angle: 0};
});


var pointOptions = [0, tileSize/2, tileSize];
var getRandomPointValue = function(){
  var rand = Math.random();
  rand *= pointOptions.length;
  rand = Math.floor(rand);  
  return pointOptions[rand];
}

var lineData = [];
for (var i = 0; i < total; i++){
  
  var point1 = [getRandomPointValue(), getRandomPointValue()],
      point2 = [getRandomPointValue(), getRandomPointValue()],
      point3 = [getRandomPointValue(), getRandomPointValue()];
  
  lineData.push([
    point1,
    point2,
    point3
  ]);
}

var line = d3.line()
  .curve(d3.curveCatmullRom.alpha(0.5))

console.log('range', d3.range(total));

var pathCounter = -1;

g.append('path')
  .data(d3.range(total))
  .attr("d", function(d, i){
    var point1 = [getRandomPointValue(), getRandomPointValue()],
      point2 = [getRandomPointValue(), getRandomPointValue()],
      point3 = [getRandomPointValue(), getRandomPointValue()],
      point4 = [getRandomPointValue(), getRandomPointValue()];

    var d = [
      point1,
      point2,
      point3,
      // point4
    ];

    return line(d);
  })
  .style("fill", (d, i) => { 
    console.log('line d, i', d, i);
    pathCounter++;
    return pathColor(pathCounter);
  })
  // .style('fill', '#fff');

container.on("mousemove", function() {
  mouse = d3.mouse(this);
});

d3.timer(function() {
  // g.attr("transform", function(d, i) {
  //   d.center[0] += (mouse[0] - d.center[0]) / (i + 5);
  //   d.center[1] += (mouse[1] - d.center[1]) / (i + 5);
  //   return "translate(" + d.center + ")";
  // });
});

