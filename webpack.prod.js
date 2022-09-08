/* eslint-disable */
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = merge(common('production', { mode: 'production' }), {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    kaoto: path.resolve(__dirname, 'src', 'App.tsx'),
  },
  output: {
    filename: '[name]-cjs.js',
    // filename: 'index.js',
    libraryTarget: 'commonjs',
  },
  optimization: {
    minimizer: [
      new CssMinimizerPlugin({
        minimizerOptions: {
          processorOptions: {
            preset: ['default', { mergeLonghand: false }], // Fixes bug in PF Select component https://github.com/patternfly/patternfly-react/issues/5650#issuecomment-822667560
          },
        },
      }),
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      KAOTO_API: JSON.stringify(process.env.KAOTO_API || '/api'),
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.jsx'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, './tsconfig.build.json'),
      }),
    ],
    symlinks: false,
    cacheWithContext: false,
  },
});
