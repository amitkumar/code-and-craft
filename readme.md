# Code & Craft Web App
Features the tools & timers used for Code & Craft events. Made with D3.


## Live Site
http://codeandcraft.org 


## Development Notes

- We use a forked GifLoopCoder, included as a git subtree at /public/vendor/glc. If editing GLC, run `grunt build` at /public/vendor/gifloopcoder/
- Assets in /public are built with webpack and output to /dist
- Assets in /dist folder shouldn't be directly edited; they will be overwritten by a webpack build. Instead, edit the files in the /public directory.



### Project Setup

- Install editorconfig plugin in your text editor.

``` shell
$ npm install
$ npm install -g webpack gulp grunt
```

### Run

``` shell
$ webpack --progress --watch
$ npm start
```
View the site at http://localhost:3000.

### Deploy
- `$ ssh root@104.236.90.0` # Must be permissioned.
- `$ cd code-and-craft`
- `$ git pull`
- `$ npm i`
- `$ webpack`
- `$ pm2 restart all`
- If errors (502 Bad Gateway), check pm2 logs. `$ pm2 logs`

## "Interconnected" app 

- HTML pages are PUG template files. /views/interconnected/
- Backend code is in /app.js
- JS is in /public/interconnected
- Uses GLC library, which is located at /public/vendor/gifloopcoder. It is compiled to /dist
- Video capture: https://github.com/webrtc/samples/blob/gh-pages/src/content/capture/canvas-record/js/main.js
- To reset event data, 

### Video Capture Process for GLC
- Created new Recorder class in GLC.
- Hook start/stop recording into Scheduler. 
- Compile now triggers a restart of the loop (through MainController), in order to restart the recording.


## Hosting
- Hosted on DigitalOcean. Contact Amit Kumar for access.
- Set up with these instructions: https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04
- Using Nginx, PM2, Let's Encrypt, node.js
- Project directory is at ~/code-and-craft
- `$ ssh root@104.236.90.0`
- `$ cd code-and-craft`
- `$ git pull`
- `$ webpack`
- `$ pm2 restart all`


## Author
Amit Kumar
http://www.amitkumar.com


## Image Inspirations
- https://gitlab.com/amitthekumar/code-n-craft/tree/master/public/img/kawandeep-virdee
- https://www.google.com/search?q=sol+lewitt


## References
- https://www.browsersync.io/docs/recipes
- https://bl.ocks.org/mbostock/1346410
- https://bl.ocks.org/mbostock/4341417
- http://webpack.github.io/docs/tutorials/getting-started/
- https://github.com/harytkon/d3-es6-webpack-boilerplate/blob/master/package.json
- http://webpack.github.io/docs/tutorials/getting-started/



