const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const distPath = path.resolve(__dirname, 'dist');

const extractSass = new ExtractTextPlugin({
  filename: 'bundle.css',
});

module.exports = {
  entry: ['./index.js', './index.scss'],
  output: {
    filename: 'bundle.js',
    path: distPath,
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: extractSass.extract({
          use: ['css-loader', 'sass-loader'],
        }),
      }
    ],
  },
  plugins: [
    new CleanWebpackPlugin([distPath]),
    new CopyWebpackPlugin([
      {
        from: 'index.html',
        to: distPath,
      }
    ]),
    extractSass,
  ],
};
