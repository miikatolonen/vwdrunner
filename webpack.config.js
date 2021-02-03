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
  module:{
    rules:[
      {  test: /\.(gltf)$/, use: [{ loader: "gltf-webpack-loader"}]},
      { test: /\.(png|jpe?g|gif|bin|fbx)$/i, use: [{ loader: 'file-loader'}]},
    ]
  },
};
