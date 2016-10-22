import * as d3 from 'd3';
export default class {
	/**
	 * @param settings.duration
	 * @param settings.onTick
	 * @param settings.onStart
	 * @param settings.onEnd
	 */
	constructor(settings){
		this.duration = settings.duration;
		this.running = false;
		// Time started as milliseconds elapsed since the UNIX epoch (Date.now())
		this.startedAt = null;
		this._lastTicked = null;
		this.onTick = settings.onTick || function(){};
		this.onStart = settings.onStart || function(){};
		this.onEnd = settings.onEnd || function(){};
		this.d3Timer = undefined;
	}
	_internalOnTick(){
		const elapsed = this.elapsed;
		const now = Date.now();
		if (!this.running){ return; }
		// check whether it's time to stop
		if (elapsed > this.duration){
			this._internalOnEnd();
		} else {
			this._lastTicked = now;
			this.onTick();
		}
	}
	_internalOnEnd(){
		this.onEnd();
		this.stop();
	}
	start(){
		this.stop();
		this.startedAt = this._lastTicked = Date.now();
		this.running = true;
		this.onStart();
		this.d3Timer = d3.timer(::this._internalOnTick);
	}
	stop(){
		if (this.d3Timer){ this.d3Timer.stop(); }
		this.running = false;
		this.startedAt = null;
	}
	get elapsed(){
		if (!this.running){
			return 0;
		}
		return Date.now() - this.startedAt;
	}
}