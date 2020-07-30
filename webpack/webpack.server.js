const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = (_, argv) => {
  return {
    target: 'electron-main',

    entry: {
      main: path.resolve(__dirname, '../src/main/main.ts'),
    },

    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, '../dist'),
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },

    mode: argv.mode || 'development',

    node: {
      __dirname: false,
      __filename: false,
    },

    externals: [nodeExternals()],

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
              configFile: path.resolve(__dirname, '../tsconfig.json'),
            },
          },
        },
      ],
    },
  };
};
