import * as d3 from 'd3';
import * as CraftAudio from './audio';
import CraftGraph from './craft-graph';
import Timer from './timer';
import moment from 'moment';

class MasterGraph {
	/**
	 * @param settings.id
	 * @param settings.svg
	 * @param settings.width
	 * @param settings.numIntervals
	 * @param settings.workDuration
	 * @param settings.breakDuration
	 * @param settings.onStart
	 * @param settings.onEndStart
	 * @param settings.onEndComplete
	 * @param settings.$timeDisplay
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
		this.workDuration = settings.workDuration;
		this.breakDuration = settings.breakDuration;
		this.scaleIndexToRadians = d3.scaleLinear().domain([0, this.numIntervals]).range([0, Math.PI * 2]);
		this.scaleOuterRadius = d3.scaleLinear().domain([this.overallIntervalDuration, 0 ]).range([0, this.radius]);
		this.$timeDisplay = settings.$timeDisplay;

		const svgRectangle = this.svg.node().getBoundingClientRect();

		this.draw = function(){
			const time = moment.duration(this.overallTimer.elapsed),
				timeLeft = moment.duration(this.overallTimer.remaining),
				workTimeLeft = moment.duration(this.workTimer.remaining),
				craftTimeLeft = moment.duration(this.craftGraph.timer.remaining);
			this.$timeDisplay.html(`
				<p>Overall Elapsed:<br/>+${("00" + Math.floor(time.asMinutes())).substr(-2,2)}:${("00" + time.seconds()).substr(-2,2)}</p>
				<p>Overall Remaining:<br/>-${("00" + Math.floor(timeLeft.asMinutes())).substr(-2,2)}:${("00" + timeLeft.seconds()).substr(-2,2)}</p>
				<p>Code Interval Remaining:<br/>${Math.ceil(workTimeLeft.asSeconds())}s</p>
				<p>Craft Interval Remaining:<br/>${Math.ceil(craftTimeLeft.asSeconds())}s</p>
				`);
			const data = this.generateTimerData();
			path.data(data)
				.attr("d", arc)
			// labels.data(data)
			// 	.attr('class', textClass)
			// 	.text(function(d){return d.label});
		}

		this.start = function(){
			this.overallTimer.start();
		}

		this.stop = function(){
			this.workTimer.stop();
			CraftAudio.hardStop();
			this.craftGraph.stop();
			this.overallTimer.stop();
		}

		this.workTimer = new Timer({
			duration: this.workDuration,
			onStart : () => {
			},
			onEnd : () => {
				this.craftGraph.start();
			}
		});
		
		this.craftGraph = new CraftGraph({
			id : 'craft',
			svg: this.svg, 
			duration: this.breakDuration,
			width: this.radius/2, 
			thickness: this.radius + (this.radius/2/2),
			onStart : () => {
				this.baseG.classed('active', false);
				CraftAudio.start();
			},
			onEndStart : () => {
				CraftAudio.end();
				this.workTimer.start();
			},
			onEndComplete : () => {
				this.baseG.classed('active', true);
			}
		});

		this.overallTimer = new Timer({
			duration: (this.numIntervals * (this.overallIntervalDuration)), 
			onTick : ::this.draw,
			onStart : () => {
				console.log('started');
				this.craftGraph.start();
			},
			onEnd : () => {
				console.log('ended');
				this.workTimer.stop();
				this.craftGraph.stop();
			}
		});

		const arc = d3.arc()
		.innerRadius(0)
		.outerRadius((d) => {
			console.log(d);
			return this.scaleOuterRadius(d.value);
		});

		const textClass = (d) => {
			if (d.value <= 0){
				return 'hidden';
			}
		};

		this.colorScale = d3.scaleLinear().domain([0, this.numIntervals - 1]).range([.1, .2]);
		this.interpolateColor = d3.interpolate('white', 'black');
		this.color = (index) => {
			return this.interpolateColor(this.colorScale(index));
		};

		this.baseG = this.svg
		.append("g")
		.attr('class', 'master-graph active')
		.attr("transform", "translate(" + svgRectangle.width / 2 + "," + svgRectangle.height / 2 + ")");

		const data = this.generateStartTimerData();
		const path = this.baseG.selectAll("path")
		.data(data)
		.enter().append("path")
		.attr("fill", (d, i) => { return this.color(i); })
		.attr("d", arc)
		.each(function(d) { this._start = d; });
    
	 //    const labels = this.baseG.selectAll("text")
		// .data(data)
		// .enter().append("text")
		// .attr("fill", (d, i) => { return this.color(i); })
		// .attr('class', textClass)
		// .text(function(d){return d.label});
	}

	get overallIntervalDuration(){
		return this.workDuration + this.breakDuration;
	}

	generateStartTimerData(){
		const elapsed = this.overallTimer.elapsed;
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
			return {
				data : val,
				value : val,
				startAngle : this.scaleIndexToRadians(index),
				endAngle : this.scaleIndexToRadians(index + 1),
				padAngle: .003,
				label : Math.ceil(val/1000) + 's'
			}
		});
		return result;
	}

	generateTimerData(){
		const elapsed = this.overallTimer.elapsed;
		const numIndices = this.numIntervals;
		const overallIntervalDuration = this.overallIntervalDuration;

		let numIndicesCompleted = Math.floor(elapsed / this.overallIntervalDuration);
		if (numIndicesCompleted > numIndices){
			numIndicesCompleted = numIndices;
		}
		const values = Array(numIndices).fill(0);
		for(let i = 0; i < numIndicesCompleted; i++){
			values[i] = overallIntervalDuration;
		}
		values[numIndicesCompleted] = elapsed % overallIntervalDuration;

		const result = values.map((val, index) => {
			// const easedVal = d3.easeCubic(CraftGraph.scaleMillisecondsToSeconds(val));
			return {
				data : val,
				value : val,
				startAngle : this.scaleIndexToRadians(index),
				endAngle : this.scaleIndexToRadians(index + 1),
				padAngle: .003,
				label : Math.ceil(val/1000) + 's'
			}
		});
		return result;
	}
}

MasterGraph.scaleMillisecondsToSeconds = d3.scaleLinear().domain([0, 1000]).range([0, 1]);

export default MasterGraph;