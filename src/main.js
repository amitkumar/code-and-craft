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


	const craftTimer = new Timer(15 * 1000);

	var $craftTimer = jquery('#craft-timer'),
		$startGlobalTimer = jquery('#btn-start-global-timer'),
		craftTimerWidth = $craftTimer.width(),
		craftTimerHeight = $craftTimer.height();

	var $soundToggle = jquery('#btn-toggle-sound');
	
	var width = 100,
	height = 100,
	radius = Math.min(width, height) / 2;
	
	var data = DonutGraph.generateTimerData(craftTimer.duration, craftTimer.elapsed);
	
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

    
	$startGlobalTimer.on('click', function(){
		setTimeout(function(){
			startGlobalTimer();
			startCraftTimer();
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

	function startGlobalTimer(){
		globalTimer.start();
	}
	function drawCraftTimer(){
		var data = DonutGraph.generateTimerData(craftTimer.duration, craftTimer.elapsed);
		g.datum(data);
		path = path.data(pie); // compute the new angles
	    path.transition().duration(1000).attrTween("d", arcTween); // redraw the arcs
	}
	function startCraftTimer(){
		craftTimer.start();
	}
	function stopCraftTimer(){
		craftTimer.stop();
		CraftAudio.end();
		drawCraftTimer();
	}


	const threeMinuteDonut = new DonutGraph('three-minute', svg, 10 * 1000, 500, 20);
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

});