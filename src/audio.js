import jquery from 'jquery';
import { Howl, Howler } from 'howler';

var craftStart = new Howl({
  src: ['audio/singing-bowl-10s.mp3']
});
var craftLoop = new Howl({
  src: ['audio/singing-bowl-loop-starting-at-10s.mp3'],
  loop: true
});
var craftEnd = new Howl({
  src: ['audio/singing-bowl-end.mp3'],
});

craftStart.on('end', function(){
	craftLoop.play();
});

function start(){
	craftStart.volume(1);
	setTimeout(function(){
		craftStart.play();	
	}, 100);
}
function loop(){
	craftLoop.play();	
}
function end(){
	craftStart.fade(1, 0, 500);
	craftLoop.stop();
	craftEnd.play();
}
function hardStop(){
	craftStart.stop();
	craftLoop.stop();
	craftEnd.stop();
}

module.exports = {
    start : start,
    loop : loop,
    end: end,
    hardStop: hardStop
};