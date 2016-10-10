import * as d3 from 'd3';
import jquery from 'jquery';

jquery(function(){
	var timer = {
		duration : 10000,
		elapsed : 0,
		started : null
	};
	var $craftTimer = jquery('#craft-timer'),
		craftTimerWidth = $craftTimer.width(),
		craftTimerHeight = $craftTimer.height();
	
	var width = 300,
	height = 300,
	radius = Math.min(width, height) / 2;
	
	var data = generateTimerData(timer.duration, timer.elapsed);
	
	var colorScale = d3.scaleLinear().domain([0, data.length - 1]).range([.8, .2]);
	var color = function(index){
		console.log('index', index, colorScale(index));
		return d3.interpolateInferno(colorScale(index));
	};
	
	var pie = d3.pie().sort(null);

	var arc = d3.arc()
	.innerRadius(radius - 800)
	.outerRadius(radius - 20);

	var svg = d3.select('#craft-timer')
	.append("g")
	.attr("transform", "translate(" + craftTimerWidth / 2 + "," + craftTimerHeight / 2 + ")");

	var path = svg.datum(data).selectAll("path")
	.data(pie)
	.enter().append("path")
	.attr("fill", function(d, i) { return color(i); })
	.attr("d", arc)
    .each(function(d) { this._current = d; }); // store the initial angles

    // Store the displayed angles in _current.
	// Then, interpolate from _current to the new angles.
	// During the transition, _current is updated in-place by d3.interpolate.
	function arcTween(a) {
		var i = d3.interpolate(this._current, a);
		this._current = i(0);
		return function(t) {
			return arc(i(t));
		};
	}

    setInterval(everySecond, 1000);
    function everySecond() {
    	timer.elapsed = timer.elapsed + 1000;
    	if (timer.elapsed > timer.duration){
    		timer.elapsed = 0;
    	}
    	var data = generateTimerData(timer.duration, timer.elapsed);

    	svg.datum(data);
    	path = path.data(pie); // compute the new angles
	    path.transition().duration(1000).attrTween("d", arcTween); // redraw the arcs
	}

	/**
	 * For a duration of n seconds, generates an array with n+1 numbers initialized to 0.
	 * Number of elapsed milliseconds will be reflected with appropriate number of array indices 
	 * set to 1000, with last item in array holding remaining duration.
	 * 
	 * @param duration {Number} - milliseconds
	 * @param elapsed {Number} - milliseconds
	 */
	function generateTimerData(duration, elapsed){
		console.log('duration, elapsed', duration, elapsed);
		var numIndices = Math.floor(duration / 1000);
		var result = Array(numIndices + 1).fill(0);
		var numIndicesElapsed = Math.ceil(elapsed / 1000);
		for(var i = 0; i < numIndicesElapsed; i++){
			result[i] = 1000;
		}
		result[result.length - 1] = (numIndices - numIndicesElapsed) * 1000;
		console.log('numIndices', numIndices, 'numIndicesElapsed', numIndicesElapsed);
		console.log(result);
		return result;
	}
});