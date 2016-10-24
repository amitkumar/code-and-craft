import * as d3 from 'd3';
import * as CraftAudio from './audio';
import CraftGraph from './craft-graph';
import Timer from './timer';
import * as Utils from './utils';

class MasterGraph {
	/**
	 * @param settings.id
	 * @param settings.svg
	 * @param settings.width
	 * @param settings.numIntervals
	 * @param settings.duration
	 * @param settings.onStart
	 * @param settings.onEndStart
	 * @param settings.onEndComplete
	 */
	constructor(settings){
		this.id = settings.id;
		this.svg = settings.svg;
		this.width = settings.width;
		this.radius = this.width / 2;
		this.thickness = settings.thickness;
		this.onStart = settings.onStart || function(){};
		this.onEndStart = settings.onEndStart || function(){};
		this.onEndComplete = settings.onEndComplete || function(){};
		this.numIntervals = settings.numIntervals;
		this.numIndices = settings.numIntervals;
		this.scaleIndexToRadians = d3.scaleLinear().domain([0, this.numIndices]).range([0, Math.PI * 2]);

		this.draw = function(){
			console.log('draw');
			// path.data(this.generateTimerData())
			// 	.attr("d", arc);
		}

		this.start = function(){
			this.timer.start();
		}

		this.timer = new Timer({
			duration: settings.duration, 
			onTick : ::this.draw,
			onStart : () => {
				console.log('started');
			},
			onEnd : () => {
				console.log('ended');
			}
		});

		const svgRectangle = this.svg.node().getBoundingClientRect();

		const arc = d3.arc()
		.innerRadius(0)
		.outerRadius(this.radius);

		this.colorScale = d3.scaleLinear().domain([0, this.numIndices - 1]).range([.8, .2]);
		this.color = (index) => {
			return d3.interpolateInferno(this.colorScale(index));
		};

		const baseG = this.svg
		.append("g")
		.attr("transform", "translate(" + svgRectangle.width / 2 + "," + svgRectangle.height / 2 + ")");

		const path = baseG.selectAll("path")
		.data(this.generateBaseTimerData())
		.enter().append("path")
		.attr("fill", (d, i) => { return this.color(i); })
		.attr("d", arc)
	    .each(function(d) { this._start = d; });

	    
	    this.craftTimerGraph = new CraftGraph({
			id : 'craft',
			svg: this.svg, 
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
	}

	generateBaseTimerData(){
		const elapsed = this.timer.elapsed;
		const numIndices = this.numIntervals;
		let numIndicesCompleted = Math.floor(elapsed / 1000);
		if (numIndicesCompleted > numIndices){
			numIndicesCompleted = numIndices;
		}
		const values = Array(numIndices).fill(0);
		for(let i = 0; i < numIndicesCompleted; i++){
			values[i] = 1000;
		}
		values[numIndicesCompleted] = elapsed % 1000;

		const result = values.map((val, index) => {
			const easedVal = d3.easeCubic(CraftGraph.scaleMillisecondsToSeconds(val));
			return {
				data : val,
				value : easedVal,
				startAngle : this.scaleIndexToRadians(index),
				endAngle : this.scaleIndexToRadians(index + easedVal),
				padAngle: 0
			}
		});
		return result;
	}
}

MasterGraph.scaleMillisecondsToSeconds = d3.scaleLinear().domain([0, 1000]).range([0, 1]);


export default MasterGraph;