const socket = io('/dashboard');

socket.on('users', data => {
  console.log('users', data)
  data.forEach( user => {
    let thisVideoBox = document.createElement('div')
    let thisVideo = document.createElement('video')
    let thisLabel = document.createElement('h3')
    thisLabel.textContent = user.username
    thisVideo.setAttribute('src', '/' + user.latestVideoPath)
    thisVideo.setAttribute('autoplay', true)
    thisVideo.setAttribute('loop', true)
    thisVideoBox.appendChild(thisLabel)
    thisVideoBox.appendChild(thisVideo)
    document.getElementsByTagName('grid')[0].appendChild(thisVideoBox)
  })
})