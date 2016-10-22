import * as d3 from 'd3';
import Timer from './timer';

export default class {
	/**
	 * @param settings.id
	 * @param settings.svg
	 * @param settings.width
	 * @param settings.thickness
	 * @param settings.duration
	 * @param settings.onStart
	 * @param settings.onEnd
	 */
	constructor(settings){
		this.id = settings.id;
		this.svg = settings.svg;
		this.width = settings.width;
		this.radius = this.width / 2;
		this.thickness = settings.thickness;
		this.onStart = settings.onStart || function(){};
		this.onEnd = settings.onEnd || function(){};

		const svgRectangle = this.svg.node().getBoundingClientRect();

		const pie = d3.pie().sort(null);

		const arc = d3.arc()
		.innerRadius(this.radius - this.thickness)
		.outerRadius(this.radius);


		this.draw = function(){
			g.datum(this.timerData);
			path.data(pie)
				.attr("d", arcEased);
		}
		this.start = function(){
			this.timer.start();
		}

		this.timer = new Timer({
			duration: settings.duration, 
			onTick : ::this.draw,
			onStart : () => {
				this.onStart();
			},
			onEnd : () => {
				this.draw();
				this.onEnd();
			}
		});
		
		const arcEased = function(d, i){
			var interpolate = d3.interpolate(this._current, d);
			return arc(interpolate(d3.easeCubic(oneSecondScaleIn(d.value))));
		}

		const data = this.timerData;
		const oneSecondScaleIn = d3.scaleLinear().domain([0, 1000]).range([0, 1]);
		const colorScale = d3.scaleLinear().domain([0, data.length - 1]).range([.8, .2]);
		const color = function(index){
			return d3.interpolateInferno(colorScale(index));
		};
		
		const g = this.svg
		.append("g")
		.attr("transform", "translate(" + svgRectangle.width / 2 + "," + svgRectangle.height / 2 + ")");

		const path = g.datum(data).selectAll("path")
		.data(pie)
		.enter().append("path")
		.attr("fill", function(d, i) { return color(i); })
		.attr("d", arc)
	    .each(function(d) { this._current = d; }); // store the initial angles
	}

	get timerData(){
		return this.constructor.generateTimerData(this.timer.duration, this.timer.elapsed);
	}

	/**
	 * For a duration of n seconds, generates an array with n+1 numbers initialized to 0.
	 * Number of elapsed milliseconds will be reflected with appropriate number of array indices 
	 * set to 1000, with last item in array holding remaining duration.
	 */
	static generateTimerData(duration, elapsed){
		console.log('duration, elapsed', duration, elapsed);
		const numIndices = Math.floor(duration / 1000);
		let numIndicesCompleted = Math.floor(elapsed / 1000);
		if (numIndicesCompleted > numIndices){
			numIndicesCompleted = numIndices;
		}
		let result = Array(numIndices + 1).fill(0);
		for(let i = 0; i < numIndicesCompleted; i++){
			result[i] = 1000;
		}
		result[numIndicesCompleted] = elapsed % 1000;

		result[result.length - 1] = duration - elapsed; //(numIndices - numIndicesElapsed) * 1000;
		console.log('numIndices', numIndices, 'numIndicesCompleted', numIndicesCompleted);
		console.log(result);
		return result;
	}
}