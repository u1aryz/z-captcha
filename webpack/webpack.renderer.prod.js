const { merge } = require('webpack-merge');
const base = require('./webpack.renderer.base');

module.exports = merge(base, {
  mode: 'production',
});
