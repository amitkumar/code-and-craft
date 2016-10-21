export default class {
	constructor(duration, start){
		this.duration = duration;
		this.running = false;
		// Time started as milliseconds elapsed since the UNIX epoch (Date.now())
		this.startedAt = null;
		if (start){
			this.start();
		}
	}
	start(){
		this.startedAt = Date.now();
		this.running = true;
	}
	get elapsed(){
		if (!this.running){
			return 0;
		}
		return Date.now() - this.startedAt;
	}
}