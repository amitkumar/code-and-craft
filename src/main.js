import * as d3 from 'd3';
import jquery from 'jquery';
import * as CraftAudio from './audio';
import { Howl, Howler } from 'howler';
import DonutGraph from './donut-graph';
import Timer from './timer';

jquery(function(){
	jquery('.show-on-load').css('visibility', 'visible');

	let globalInterval;
	let globalSoundEnabled = true;
	
	// 90 minutes, converted to milliseconds
	const globalTimer = new Timer(90 * 60 * 1000);

	var craftTimer = {
		duration : 10000,
		elapsed : 0,
		running : false
	};

	var $craftTimer = jquery('#craft-timer'),
		$startGlobalTimer = jquery('#btn-start-global-timer'),
		craftTimerWidth = $craftTimer.width(),
		craftTimerHeight = $craftTimer.height();

	var $soundToggle = jquery('#btn-toggle-sound');
	
	var width = 100,
	height = 100,
	radius = Math.min(width, height) / 2;
	
	var data = generateTimerData(craftTimer.duration, craftTimer.elapsed);
	
	var colorScale = d3.scaleLinear().domain([0, data.length - 1]).range([.8, .2]);
	var color = function(index){
		console.log('index', index, colorScale(index));
		return d3.interpolateInferno(colorScale(index));
	};
	
	var pie = d3.pie().sort(null);

	var arc = d3.arc()
	.innerRadius(radius - 500)
	.outerRadius(radius);

	var svg = d3.select('#craft-timer');

	var g = svg	
	.append("g")
	.attr("transform", "translate(" + craftTimerWidth / 2 + "," + craftTimerHeight / 2 + ")");

	var path = g.datum(data).selectAll("path")
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


	$startGlobalTimer.on('click', function(){
		globalTimerStartedAt = Date.now();

		setTimeout(function(){
			startGlobalInterval();
			startCraftTimer();
			threeMinuteDonut.start();
		}, 0);
	});
	$soundToggle.on('click', function(){
		globalSoundEnabled = !globalSoundEnabled
		Howler.mute(!globalSoundEnabled);
		if (globalSoundEnabled){
			$soundToggle.text('Disable Sound');
		} else {
			$soundToggle.text('Enable Sound');
		}
	});

	function startGlobalInterval(){
		// clearInterval(globalInterval);
		// globalInterval = setInterval(everySecond, 1000);
	}
	function drawCraftTimer(){
		var data = generateTimerData(craftTimer.duration, craftTimer.elapsed);
		g.datum(data);
		path = path.data(pie); // compute the new angles
	    path.transition().duration(1000).attrTween("d", arcTween); // redraw the arcs
	}
	function startCraftTimer(){
		craftTimer.elapsed = 0;
		craftTimer.running = true;
	}
	function stopCraftTimer(){
		craftTimer.elapsed = 0;
		craftTimer.running = false;
		CraftAudio.end();
		drawCraftTimer();
	}


	const threeMinuteDonut = new DonutGraph('three-minute', svg, 3 * 60 * 1000, 500, 20);
	threeMinuteDonut.start();


    
 //    function everySecond() {
	// 	if (craftTimer.running){
	// 		if (craftTimer.elapsed === 0){
	// 			CraftAudio.start();
	// 		}	
	// 		craftTimer.elapsed = craftTimer.elapsed + 1000;
	// 		drawCraftTimer();
	// 	}

	// 	if (craftTimer.elapsed > craftTimer.duration){
 //    		stopCraftTimer();
 //    	}

 //    	threeMinuteDonut.draw();
	// }


	function tick(){

	}

	d3.timer(tick);
});