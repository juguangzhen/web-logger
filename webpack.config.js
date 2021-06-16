const path = require('path')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}


module.exports = {
  context: path.resolve(__dirname, './'),
  entry: './lib/index.js',
  output: {
    path: path.resolve(__dirname, './example'),
    filename: './app.js' // dist文件夹不存在时，会自动创建
  },
  resolve: {
    extensions: ['.js', '.json']
  },
}
