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
    rules: [
        {
            test: /\.(png|jpe?g|gif|glb|gltf)$/i,
            loader: 'file-loader',
            options: {
              name: 'dist/model/[name].[ext]'
            }
        }
    ]
  },
};
