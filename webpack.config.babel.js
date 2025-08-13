import Webpack from 'webpack';
import Path from 'path';

const { NODE_ENV } = process.env;

export default {
  mode: NODE_ENV,

  entry: ['./src'],

  output: {
    path: Path.join(__dirname, 'dist'),
    filename: `color-math${NODE_ENV === 'production' ? '.min' : ''}.js`,
    library: {
      name: 'ColorMath',
      type: 'umd',
    },
    //pathinfo: true
  },

  resolve: {
    fallback: {
      fs: false,
      path: false,
    },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },

  optimization: {
    minimize: NODE_ENV === 'production',
  },

  plugins: [
    new Webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    }),
  ],
};
