let express = require('express')
const app = express()
const ip = require('ip').address()

const exec = require('child_process').exec

const fs = require('fs')
const filePath = './lib/logger.js'
// exec('webpack')
exec('cp -rf lib ./example')

console.log(`正在监听 ${filePath}`);
fs.watch(filePath, { recursive: true }, (type, fileName) => {
    if (filePath) {
      console.log('copy')
      exec('cp -rf lib ./example')
    }
})

app.use(express.static('./example'))

let server = app.listen('9000', function() {
  let port = server.address().port

  console.log(`app is running http://${ip}:${port}`)
})
