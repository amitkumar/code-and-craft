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

const firebaseAdmin = require("firebase-admin");
const firebaseServiceAccount = require("./env/codeandcraft-firebase-key.json");

const firebaseRef = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(firebaseServiceAccount),
  databaseURL: "https://codeandcraft-51db3.firebaseio.com"
});


const Session = require('express-session');
const FirebaseStore = require('connect-session-firebase')(Session);
const sessionStore = new FirebaseStore({
    database: firebaseRef.database()
});

const session = Session({ 
    secret: "not so secret", 
    resave: false, 
    saveUninitialized: true,
    store : sessionStore
});

const sharedsession = require('express-socket.io-session')
const exec = require('child_process').exec
const fileUpload = require('express-fileupload');
const {changeRepo, promiseGitInit, promiseGitCommit, promiseDir} = require('./lib/fs-git-hooks')



app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.use(session)

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

app.get('/interconnected', (req, res) => {
    res.render('interconnected/index', {});
});

app.get('/interconnected/dashboard', (req, res) => {
    res.render('interconnected/dashboard', {
        user : req.session.username
    });
});

app.get('/interconnected/glc', (req,res) => {
    // if (!req.session.username){
    //     return res.redirect('/interconnected');
    // } else {
    //     console.log('read req.session.username', req.session, req.session.username);
    //     res.render('interconnected/glc', {
    //         user : req.session.username
    //     });    
    // }
    res.render('interconnected/glc', {
        user : req.session.username
    });    
});

// app.post('/interconnected/new-user', (req,res) => {
//     if (!req.body.username){
//         return res.redirect('/interconnected');
//     } else {
//         req.session.username = req.body.username;
//         console.log('set req.session.username', req.body.username);
//         res.redirect('/interconnected/glc')
//     }
// });


// app.get('/glc', (req,res) => {
//     res.sendFile(path.join(__dirname,'/dist/glc.html'))
// })

//later, the upload function will also grab the source of the codemirror and commit it.
app.post('/commit', (req,res) => {
  console.log(req.session)
  console.log(req.session.username)
  let thisCompilePath = path.join(changeRepo, req.session.username)

  promiseDir(thisCompilePath)
  .then(promiseGitInit)
  .then(()=>promiseGitCommit(thisCompilePath, req.body, `autocommit from ${req.session.username}`))
  .then(status => res.send(status))
  .catch(problem => res.send(problem))
})


app.post('/upload', (req,res) => {
  console.log('/upload read req.session.username', req.session, req.session.username);
  let videoFile = req.files.video;
  let thisCompilePath = path.join(__dirname, 'video-bin') + '/' + req.session.username;
  let thisFileName = Date.now(); //sorry just temporary
  
  promiseDir(thisCompilePath)
    .then(()=> new Promise((resolve, reject) => {
        let clientSrc = path.join('video-bin', req.session.username ,`${thisFileName}.webm`)      
        videoFile.mv(path.join(thisCompilePath, `${thisFileName}.webm`), function(err) {
            if (err){
                reject(err)
                res.status(500).send(err);
            } else {
                req.session.latestVideoPath = clientSrc;
                broadcastVideos()
                res.send('File uploaded.');
                resolve(thisFileName + 'written successfully')
            }
        });
    })
  )
  .catch(console.log.bind(console))

})


var server_port = process.env.PORT || 3000;
var server_ip_address = process.env.IP || '127.0.0.1';


server.listen(server_port, server_ip_address);
console.log(`Server listening on ${server_ip_address}:${server_port}`);

// const dashboardSockets = io.of('/interconnected/dashboard');
// const interconnectedSockets = io.of('/interconnected');

// interconnectedSockets.use(sharedsession(session, {
//     autoSave:true
// }));
// interconnectedSockets.on('connection', socket => { 
//     let {username} = socket.handshake.session
//     if(username != undefined && username != 'dashboard'){
//         console.log(username, 'joined.')
        
//         socket.on('disconnect', () => {
//             console.log(username, 'went away');
//             broadcastVideos();
//         });
//     }
// });

// dashboardSockets.on('connection', function(socket){
//     broadcastVideos();
// });

// function broadcastVideos(){
//     // Only return user sessions that have a video
//     console.log('sessions', sessionStore.sessions); 
//     var sessions = sessionStore.sessions.filter(session => {
//         return !!session.latestVideoPath;
//     });
//     console.log('broadcastVideos sessions', sessions);
//     dashboardSockets.emit('users', sessions);
// }