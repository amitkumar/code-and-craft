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
		this.onStart = settings.onStart || function(){};
		this.onEndStart = settings.onEndStart || function(){};
		this.onEndComplete = settings.onEndComplete || function(){};
		this.numIntervals = settings.numIntervals;
		this.workDuration = settings.workDuration;
		this.breakDuration = settings.breakDuration;
		this.scaleIndexToRadians = d3.scaleLinear().domain([0, this.numIntervals]).range([0, Math.PI * 2]);
		this.discToSpikeRatio = settings.discToSpikeRatio;
		this.scaleOuterRadius = d3.scaleLinear().domain([this.overallIntervalDuration, 0 ]).range([0, this.radius]);

		this.$timeDisplay = settings.$timeDisplay;
		this.$workTimeDisplay = settings.$workTimeDisplay;

		const svgRectangle = this.svg.node().getBoundingClientRect();

		this.draw = () => {
			const elapsed = this.overallTimer.elapsed,
				time = moment.duration(elapsed),
				timeLeft = moment.duration(this.overallTimer.remaining),
				workTimeLeft = moment.duration(this.workTimer.remaining),
				craftTimeLeft = moment.duration(this.craftGraph.timer.remaining),
				intervalsRemaining = this.numIntervals - Math.floor(elapsed / this.overallIntervalDuration);

			this.$timeDisplay.html(`
				<p>Overall Elapsed:<br/>+${("00" + Math.floor(time.asMinutes())).substr(-2,2)}:${("00" + time.seconds()).substr(-2,2)}</p>
				<p>Overall Remaining:<br/>-${("00" + Math.floor(timeLeft.asMinutes())).substr(-2,2)}:${("00" + timeLeft.seconds()).substr(-2,2)}</p>
				<p>Intervals Remaining:<br/>${intervalsRemaining}</p>
				<p>Code Interval:<br/>${Math.ceil(workTimeLeft.asSeconds())}s</p>
				<p>Craft Interval:<br/>${Math.ceil(craftTimeLeft.asSeconds())}s</p>
				`);

			this.$workTimeDisplay.html(`${Math.ceil(workTimeLeft.asSeconds())}s`);

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

		this.discRadius = this.radius * this.discToSpikeRatio;
		this.spikeInnerRadius = d3.scaleLinear().domain([this.overallIntervalDuration, 0]).range([this.discRadius, -this.radius]);

		const arc = d3.arc()
		.innerRadius((d) => {
			return this.spikeInnerRadius(d.value);
		})
		.outerRadius(this.discRadius);

		const textClass = (d) => {
			if (d.value <= 0){
				return 'hidden';
			}
		};

		this.colorScale = d3.scaleLinear().domain([0, this.numIntervals - 1]).range([.1, .5]);
		this.interpolateColor = d3.interpolate('white', 'black');
		this.color = (index) => {
			return this.interpolateColor(this.colorScale(index));
		};

		this.baseG = this.svg
		.append("g")
		.attr('class', 'master-graph active')
		.attr("transform", "translate(" + svgRectangle.width / 2 + "," + svgRectangle.height / 2 + ") rotate(180) scale(-1, 1)");

		const data = this.generateStartTimerData();
		const path = this.baseG.selectAll("path")
		.data(data)
		.enter().append("path")
		.attr("fill", (d, i) => { return this.color(i); })
		.attr("stroke", 'rgba(255,255,255,.2)')
		.attr("d", arc)
		.each(function(d) { this._start = d; });
    
	 //    const labels = this.baseG.selectAll("text")
		// .data(data)
		// .enter().append("text")
		// .attr("fill", (d, i) => { return this.color(i); })
		// .attr('class', textClass)
		// .text(function(d){return d.label});

		this.craftGraph = new CraftGraph({
			id : 'craft',
			svg: this.svg, 
			duration: this.breakDuration,
			width: this.width,
			discToSpikeRatio : this.discToSpikeRatio,
			onStart : () => {
				this.baseG.classed('active', false);
				this.$workTimeDisplay.removeClass('active');
				CraftAudio.start();
			},
			onEndStart : () => {
				CraftAudio.end();
				this.workTimer.start();
			},
			onEndComplete : () => {
				this.$workTimeDisplay.addClass('active');
				this.baseG.classed('active', true);
			}
		});
	}

	get overallIntervalDuration(){
		return this.workDuration + this.breakDuration;
	}

	generateStartTimerData(){
		const elapsed = this.overallTimer.elapsed;
		const numIndices = this.numIntervals;
		const overallIntervalDuration = this.overallIntervalDuration;

		let numIndicesCompleted = Math.floor(elapsed / this.overallIntervalDuration);
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
				// padAngle: .003,
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
		values.reverse();

		const result = values.map((val, index) => {
			// const easedVal = d3.easeCubic(CraftGraph.scaleMillisecondsToSeconds(val));
			return {
				data : val,
				value : val,
				startAngle : this.scaleIndexToRadians(index),
				endAngle : this.scaleIndexToRadians(index + 1),
				// padAngle: .003,
				label : Math.ceil(val/1000) + 's'
			}
		});
		return result;
	}
}

MasterGraph.scaleMillisecondsToSeconds = d3.scaleLinear().domain([0, 1000]).range([0, 1]);

export default MasterGraph;