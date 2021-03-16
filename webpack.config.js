var path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js'
  },
  devServer: {
    historyApiFallback: {
        index: './public/index.html',
      },
	  port: 9000
  }, 
  module:{
    rules:[
      { test: /\.(png|jpe?g|gif|bin|fbx|glb|gltf|mtl)$/i, use: [{ loader: 'file-loader'}]},
    ]
  },
};
