var path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: './dist/main.js'
  },
  devServer: {
    historyApiFallback: {
        index: './public/index.html'
      }
  }, 
  module:{
    rules:[
      { test: /\.(png|jpe?g|gif|bin|fbx|glb|gltf)$/i, use: [{ loader: 'file-loader'}]},
    ]
  },
};
