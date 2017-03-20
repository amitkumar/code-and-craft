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
const io = require('socket.io')(server)
const path = require('path')
const compress = require('compression');
const fs = require('fs')
const session = require('express-session')({ secret: "not so secret", resave: true, saveUninitialized: true})
const sharedsession = require('express-socket.io-session')
const exec = require('child_process').exec
const fileUpload = require('express-fileupload');
const {changeRepo, promiseGitInit, promiseGitCommit, promiseDir} = require('./lib/fs-git-hooks')

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.use(session)
io.use(sharedsession(session, {
    autoSave:true
}));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('body-parser').json());
app.use(compress());
app.use(fileUpload());
app.use(express.static(path.join(__dirname,'/dist/')));
app.use('/video-bin',express.static(path.join(__dirname,'/video-bin/')));


app.get('/', (req, res) => {
    res.render('index', {
        user : req.session.username
    });
});

app.get('/grapevine/dashboard', (req, res) => {
    req.session.username = 'dashboard'
    res.render('grapevine/dashboard', {
        user : req.session.username
    });
});

app.get('/grapevine/glc', (req,res) => {
    res.render('grapevine/glc', {
        user : req.session.username
    });
});

app.post('/grapevine/new-user', (req,res) => {
  req.session.username = req.body.username
  res.redirect('/grapevine/glc')
});


app.get('/glc', (req,res) => {
  res.sendFile(path.join(__dirname,'/dist/glc.html'))
})

//later, the upload function will also grab the source of the codemirror and commit it.
app.post('/commit', (req,res) => {
  console.log(req.session)
  console.log(req.session.username)
  let thisCompilePath = path.join(changeRepo, req.session.username)
  // console.log(req.body.source)
  promiseDir(thisCompilePath)
  .then(promiseGitInit)
  .then(()=>promiseGitCommit(thisCompilePath, req.body, `autocommit from ${req.session.username}`))
  .then(status => res.send(status))
  .catch(problem => res.send(problem))
})

//session 

//dashboard 

//update src attribute of sessions object in session array per user. 

//
app.post('/upload', (req,res) => {
  console.log(req.session.username)
  let videoFile = req.files.video;
  let thisCompilePath = path.join(__dirname, 'video-bin', req.session.username)
  let thisFileName = Date.now() //sorry just temporary
  let clientSrc = path.join('video-bin',req.session.username,`${thisFileName}.webm`)
  promiseDir(thisCompilePath)
    .then(()=> new Promise((resolve, reject) => {
        videoFile.mv(path.join(thisCompilePath, `${thisFileName}.webm`), function(err) {
            if (err){
                reject(err)
                res.status(500).send(err);
            } else {
                // req.session.path = clientSrc
                //make sure obj saved in the usernameToSession object has the path property assigned to it. Req.session is supposed to allow that.
                Object.assign(usernameToSession[req.session.username], {path: '\\' + clientSrc})
                updateDashboard()
                res.send('File uploaded.');
                resolve(thisFileName + 'written successfully')
            }
        });
    })
    // .then(message =>{
    //     console.log(message)
    //     Object.assign(usernameToSession[req.session.username], {path: '\\' + clientSrc})
    //     updateDashboard()
    // })
  )
  .catch(console.log.bind(console))

})

var server_port = process.env.PORT || 3000;
var server_ip_address = process.env.IP || '127.0.0.1';


server.listen(server_port, server_ip_address);
console.log(`Server listening on ${server_ip_address}:${server_port}`);

let activeClients = []
let usernameToSession = {}

io.on('connection', socket => { 
    let {username} = socket.handshake.session
    if(username != undefined && username != 'dashboard'){
        usernameToSession[username] = socket.handshake.session
        activeClients.push(username)
        console.log(username, 'joined.')
        console.log(activeClients)
        socket.on('disconnect', () => {
            activeClients = activeClients.filter(user => user != username) //pop off the user thats not there anymore //screws up if two people have the same username. like undefined.
            updateDashboard()
            console.log(username, 'went away')
            console.log(activeClients)
        })
    } 
})

function updateDashboard(){
    infoArray = activeClients.map(username => {
        seshcopy = Object.assign({},usernameToSession[username])
        delete seshcopy.cookie
        return seshcopy
    })//now there's an array of objects
    console.log("File updated. Updated dashboard.")
    console.log(infoArray)
    io.sockets.emit('infoArray',infoArray)
        // dashboardSockets.broadcast(infoArray)
}