define(function() {
	
	var canvas,
		stream,
		recorder,
		recordedBlobs = [],
		finalBlob,
		isRecording = false;


	function init() {
		canvas = document.querySelector("#content .canvas_panel canvas");
		stream = canvas.captureStream();	
		recorder = new MediaRecorder(stream, { 
			mimeType : 'video/webm',
			videoBitsPerSecond : 7500000 
		});
		recordedBlobs = [];

		recorder.ondataavailable = function(e) {
			if (event.data && event.data.size > 0) {
				recordedBlobs.push(event.data);
			}
		};
	}

	function start(){
		console.log('start recording');
		recordedBlobs = [];
		recorder.start();
		isRecording = true;
	}

	function stop(upload){
		
		if (recorder.state === 'recording'){
			console.log('stop recording');
			recorder.stop();
					
			setTimeout(function(){
				var player = document.getElementById('replay');
				finalBlob = new Blob(recordedBlobs, { type : 'video/webm' });
				player.src = window.URL.createObjectURL(finalBlob);	
				uploadVideo();
				isRecording = false;
			}, 1000);
		}
	}
    
    

    function uploadVideo() {
		console.log('uploadVideo');
		
		// var form = new FormData();
		// form.append('video', finalBlob);
		// fetch('/upload', {
		// 	method: 'post',
		// 	body: form,
		// 	credentials: 'same-origin'
		// });

		if (window.CnC.uploadVideoToFirebase){
			window.CnC.uploadVideoToFirebase(finalBlob)
		}
	}

	function getIsRecording(){
		return isRecording;
	}

	return {
		init: init,
		start: start,
		stop: stop,
		uploadVideo : uploadVideo,
		getIsRecording : getIsRecording
	};

});
