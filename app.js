// /**
//  * Require Browsersync along with webpack and middleware for it
//  */
// var browserSync          = require('browser-sync').create();
// var webpack              = require('webpack');
// var webpackDevMiddleware = require('webpack-dev-middleware');
// var stripAnsi            = require('strip-ansi');

// /**
//  * Require ./webpack.config.js and make a bundler from it
//  */
// var webpackConfig = require('./webpack.config');
// var bundler       = webpack(webpackConfig);

// /**
//  * Reload all devices when bundle is complete
//  * or send a fullscreen error message to the browser instead
//  */
// bundler.plugin('done', function (stats) {
//     if (stats.hasErrors() || stats.hasWarnings()) {
//         return browserSync.sockets.emit('fullscreen:message', {
//             title: "Webpack Error:",
//             body:  stripAnsi(stats.toString()),
//             timeout: 100000
//         });
//     }
//     browserSync.reload();
// });

// /**
//  * Run Browsersync and use middleware for Hot Module Replacement
//  */
// browserSync.init({
//     server: 'public',
//     open: false,
//     logFileChanges: false,
//     notify: false,
//     middleware: [
//         webpackDevMiddleware(bundler, {
//             publicPath: webpackConfig.output.publicPath,
//             stats: {colors: true}
//         })
//     ],
//     plugins: ['bs-fullscreen-message'],
//     files: [
//         'public/css/*.css',
//         'public/*.html'
//     ]
// });


const express = require('express')
const app = express()
const server = require('http').Server(app)
const path = require('path')
const compress = require('compression');
const fs = require('fs')
const exec = require('child_process').exec
const fileUpload = require('express-fileupload');
const {changeRepo, promiseGitInit, promiseGitCommit, promiseDir} = require('./lib/fs-git-hooks')

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('body-parser').json());
app.use(compress());
app.use(fileUpload());
app.use(express.static(path.join(__dirname,'/dist/')));


app.get('/', (req, res) => {
    res.render('index', {
        user : req.cookies.username
    });
});

app.post('/new-user', (req,res) => {
  res.cookie('username',req.body.username)
  res.redirect('/glc')
})

app.get('/glc', (req,res) => {
    res.sendFile(path.join(__dirname,'/dist/glc.html'))
})

app.post('/compile', (req,res) => {
  console.log(req.cookies.username)
  let thisCompilePath = path.join(changeRepo, req.cookies.username)
  // console.log(req.body.source)
  promiseDir(thisCompilePath)
  .then(promiseGitInit)
  .then(()=>promiseGitCommit(thisCompilePath, req.body, `autocommit from ${req.cookies.username}`))
  .then(status => res.send(status))
  .catch(problem => res.send(problem))
})

app.post('/upload', (req,res) => {
  let videoFile = req.files.video;
  videoFile.mv('./video-bin/instagram.webm', function(err) {
    if (err) return res.status(500).send(err);
    res.send('File uploaded.');
  });
})


var server_port = process.env.PORT || 3000;
var server_ip_address = process.env.IP || '127.0.0.1';
 

server.listen(server_port, server_ip_address);
console.log(`Server listening on ${server_ip_address}:${server_port}`);
