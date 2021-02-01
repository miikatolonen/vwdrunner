var path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  devServer: {
    historyApiFallback: {
        index: './public/index.html'
      }
  },
  module: {
    rules:
    [{
    test: /\.(glb|gltf)$/,
    use:
    [{
        loader: 'file-loader',
        options:{
        outputPath: 'assets/models/'
        }}
    ]},
    ]}
};