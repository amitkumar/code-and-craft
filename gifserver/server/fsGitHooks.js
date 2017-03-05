
const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec
console.log(__dirname)
const changeRepo = path.join(__dirname, '..','..','..','giftest')
module.exports = {changeRepo, promiseGitInit, promiseGitCommit, promiseDir}

function promiseGitCommit(pathname, objectOfStrings, comment){
  //pathname is the directory to save files into 
  //objectOfStrings contains filenames as keys and strings as values to save, add, and commit in the given directory
  let fileWriteArray = []
  for(let filename in objectOfStrings){
    fileWriteArray.push(promiseWrite(path.join(pathname,filename), objectOfStrings[filename]))
  }
  //returns an array of filenames that were saved to disk to .then off of
  return Promise.all(fileWriteArray).then(fileArray => new Promise((resolve, reject) => {
    exec(`git add ${fileArray.map(string => `"${string}"`).join(' ')} && git commit -m "${comment}"`, {cwd: changeRepo}, (err,stdout,stderr) => {
      // console.log('err:', err, '\nstdout:', stdout, '\nstderr:', stderr)
      if(err) reject(err) //should be caught by a .then.catch if anything bad happened, otherwise, continue. 
      else resolve(stdout)
   })
  }))
}

function promiseWrite(filename, filetext){
  return new Promise((resolve,reject) => {
    fs.writeFile(filename, filetext, err => {
      if(err) reject(err)
      else resolve(filename)
    })
  })
}


function promiseGitInit(pathname){
  return new Promise((resolve, reject) => {
    exec('git status',{cwd: changeRepo}, (err,stdout,stderr) => {
      console.log('err:', err, '\nstdout:', stdout, '\nstderr', stderr)
      
      if(err){
        console.log("GIT STATUS err'd in promiseGitInit")
        reject(err)
      } else {
        exec('git init', {cwd: changeRepo})
        console.log("Git Status success ")
        resolve(stdout)
      }
    })
  })
}

//promises that the directory exists, creating it if necessary.
function promiseDir(pathname){
  return new Promise((resolve, reject) => {
    fs.access(pathname, fs.constants.R_OK, err => {
      if(!err){
        console.log(pathname, "already exists, resolving now.")
        resolve(pathname)
      }
      if(err && err.code == 'ENOENT'){
        fs.mkdir(pathname, {mode: 0o777}, err => {
          if(!err){resolve(pathname)}
          else {reject(err)}
        })
      }
      //if it got this far without resolving, reject the promise.
      reject(err)
    })
  })
}