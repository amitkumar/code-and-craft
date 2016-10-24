import * as d3 from 'd3';
import jquery from 'jquery';
import * as CraftAudio from './audio';
import { Howl, Howler } from 'howler';
import MasterGraph from './master-graph';
import Timer from './timer';

jquery(function(){
	jquery('.show-on-load').css('visibility', 'visible');

	let globalInterval;
	let globalSoundEnabled = true;
	
	const $startGlobalTimer = jquery('#btn-start-global-timer');

	const $soundToggle = jquery('#btn-toggle-sound');
	
	const svg = d3.select('#craft-timer');
	const svgRectangle = svg.node().getBoundingClientRect();

	const $document = jquery(document);
	const $controlPanel = jquery('#control-panel');

	let hideControlPanelTimeout = undefined;

	$document.on('mousemove touch', function(){
		
		$controlPanel.addClass('visible');
		clearTimeout(hideControlPanelTimeout);
		hideControlPanelTimeout = setTimeout(function(){
			$controlPanel.removeClass('visible')	
		}, 1500);
	});


	$startGlobalTimer.on('click', function(){
		masterGraph.start();	
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

	const masterGraph = new MasterGraph({
		id : 'master',
		svg: svg, 
		duration: 90 * 60 * 1000,
		numIntervals : 30,
		intervalDuration: 3 * 60 * 1000,
		width: Math.min(svgRectangle.width, svgRectangle.height) - 50
	});
});