const path = require('path');

module.exports = {
  target: 'electron-renderer',

  entry: {
    app: path.resolve(__dirname, '../src/renderer/app.tsx'),
    recaptcha: path.resolve(__dirname, '../src/renderer/recaptcha.tsx'),
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist'),
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },

  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        enforce: 'pre',
        loader: 'eslint-loader',
      },
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, '../tsconfig.renderer.json'),
          },
        },
      },
    ],
  },
};
