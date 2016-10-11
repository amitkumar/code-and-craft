import jquery from 'jquery';
import { Howl, Howler } from 'howler';

// create audio context
var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var craftAudio = document.querySelector('#craft-audio-10s');
var craftAudioLoop = document.querySelector('#craft-audio-loop');

var craftSource = context.createMediaElementSource(craftAudio);
var craftLoopSource = context.createMediaElementSource(craftAudioLoop);

craftSource.connect(context.destination);
// craftLoopSource.connect(context.destination);

export function play() {
	
}

var craftStart = new Howl({
  src: ['audio/singing-bowl-10s.mp3']
});
// craftStart.play();


var craftLoop = new Howl({
  src: ['audio/singing-bowl-loop-starting-at-10s.mp3']
});
var craftEnd = new Howl({
  src: ['audio/singing-bowl-end.mp3']
});
craftEnd.play();