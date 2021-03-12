var path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: './src/app.js'
  },
  devServer: {
    historyApiFallback: {
        index: './public/index.html'
      }
  }, 
  module:{
    rules:[
      { test: /\.(png|jpe?g|gif|bin|fbx|glb|gltf|mtl)$/i, use: [{ loader: 'file-loader'}]},
    ]
  },
};
