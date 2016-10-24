import * as d3 from 'd3';
import jquery from 'jquery';
import * as CraftAudio from './audio';
import { Howl, Howler } from 'howler';
import MasterGraph from './master-graph';
import Timer from './timer';
import moment from 'moment';

jquery(function(){
	jquery('.show-on-load').css('visibility', 'visible');

	let globalInterval;
	let globalSoundEnabled = true;
	
	const $startGlobalTimer = jquery('#btn-start-global-timer');
	const $stopGlobalTimer = jquery('#btn-stop-global-timer');

	const $soundToggle = jquery('#btn-toggle-sound');
	
	const svg = d3.select('#craft-timer');
	const svgRectangle = svg.node().getBoundingClientRect();

	const $document = jquery(document);
	const $controlPanel = jquery('#control-panel');

	let hideControlPanelTimeout = undefined;

	const masterGraph = new MasterGraph({
		id : 'master',
		svg: svg, 
		numIntervals : 30,
		workDuration: 180 * 1000,
		breakDuration: 15 * 1000,
		width: Math.min(svgRectangle.width, svgRectangle.height) - 50,
		$timeDisplay : jquery('#elapsed-time')
	});

	$document.on('mousemove touchdown', function(){
		$controlPanel.addClass('visible');
		clearTimeout(hideControlPanelTimeout);
		hideControlPanelTimeout = setTimeout(function(){
			$controlPanel.removeClass('visible');	
		}, 1500);
	});


	$startGlobalTimer.on('click', function(){
		masterGraph.start();
	});
	$stopGlobalTimer.on('click', function(){
		masterGraph.stop();
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
});