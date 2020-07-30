const { merge } = require('webpack-merge');
const base = require('./webpack.renderer.base');

module.exports = merge(base, {
  devtool: 'inline-source-map',
  mode: 'development',
});
