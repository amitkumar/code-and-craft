const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(ffmpegPath)
const Storage = require('@google-cloud/storage')

var self = {};

self.transcode = function (event, callback) {
	console.log('Processing file: ' + JSON.stringify(event.data))
	const remoteWriteStream = outputbucket.file('result.mp4').createWriteStream()
	const remoteReadStream = inputbucket.file(event.data.name).createReadStream()
	const command = ffmpeg()
		.input(remoteReadStream)
		.outputOptions('-c:v libx264')
		.outputOptions('-pix_fmt yuv420p')
		.outputOptions('-f mp4')
		.outputOptions('-tune animation')
		.outputOptions('-preset fast')
		.outputOptions('-crf 20')
		.outputOptions('-framerate 50')
		.outputOptions('-movflags frag_keyframe+empty_moov')
		.on('start', (commandLine) => {
			console.log('Spawned Ffmpeg with command: ' + commandLine)
		})
		.on('end', () => {
			console.log('file has been converted succesfully')
		})
		.on('error', (err, stdout, stderr) => {
			console.log('an error happened: ' + err.message)
			console.log('stdout: ' + stdout)
			console.log('stderr: ' + stderr)
		})
		.pipe(remoteWriteStream, { end: true })
	callback()
}

module.exports = function (app) {
	// self.storage = app.firebaseApp.storage();
	// self.inputbucket = self.storage.bucket()
	// self.outputbucket = self.storage.bucket()
}