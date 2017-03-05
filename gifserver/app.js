const express = require('express')
const app = express()
const server = require('http').Server(app)
const path = require('path')

app.use(require('cookie-parser')())
app.use(require('body-parser').urlencoded({ extended: true }))
app.use(require('body-parser').json())
app.use(express.static(path.join(__dirname,'/')))

app.get('/', (req,res) => {
  console.log(req.cookies)
  res.send(
    `<html>
      <head>
      </head>
      <body>
        <form action="/newUser" method="POST">
          <input name="username" placeholder="username" type="text">
          <button type="submit">Submit</button>
        </form>
      </body>
    </html>`)
})

app.post('/newUser', (req,res) => {
  res.cookie('username',req.body.username)
  res.redirect('/editor')
})

app.get('/editor', (req,res) => {
    res.sendFile('index_src.html', {root: __dirname })
})

app.post('/compile', (req,res) => {
  console.log(req.cookies.username)
  console.log(req.body.source)
  res.sendStatus(200)
})

server.listen(3000)
console.log('server listening on 3000')