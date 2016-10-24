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

	const $craftTimer = jquery('#craft-timer'),
		$startGlobalTimer = jquery('#btn-start-global-timer'),
		craftTimerWidth = $craftTimer.width(),
		craftTimerHeight = $craftTimer.height();

	const $soundToggle = jquery('#btn-toggle-sound');
	
	const svg = d3.select('#craft-timer');
	const svgRectangle = svg.node().getBoundingClientRect();

	$startGlobalTimer.on('click', function(){
		setTimeout(function(){
			startGlobalTimer();
			// startCraftTimer();
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

	const craftTimerGraph = new DonutGraph({
		id : 'craft-10-sec',
		svg: svg, 
		duration: 10 * 1000, 
		width: 200, 
		thickness: Math.min(svgRectangle.width, svgRectangle.height)/2,
		onStart : function(){
			CraftAudio.start();
		},
		onEndStart : function(){
			CraftAudio.end();	
		}
	});
	craftTimerGraph.start();

	// const workTimerGraph = new DonutGraph({
	// 	id : 'three-minute',
	// 	svg: svg, 
	// 	duration: 10 * 1000, 
	// 	width: Math.min(svgRectangle.width, svgRectangle.height) - 50, 
	//  colorScale: d3.scaleLinear().domain([0, data.length - 1]).range([.8, .2]),
	// 	thickness: 100
	// });
	// workTimerGraph.start();

});