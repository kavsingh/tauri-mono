import path from 'path';

import HtmlWebpackPlugin from 'html-webpack-plugin';
// import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import type { Configuration } from 'webpack';

type ConfigurationFactory = (
  env?: string | Record<string, unknown>,
) => Configuration;

const fromRoot = path.resolve.bind(null, __dirname);
const isProd = (env: Parameters<ConfigurationFactory>[0]) =>
  typeof env === 'string' ? env === 'production' : !!env?.production;

const configuration: ConfigurationFactory = (env) => ({
  target: 'web',
  mode: isProd(env) ? 'production' : 'development',
  devtool: isProd(env) ? 'source-map' : 'inline-source-map',
  entry: {
    app: ['./src/index.tsx'],
  },
  output: {
    filename: isProd(env) ? '[name].[contenthash].js' : '[name].js',
    path: fromRoot('dist'),
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: fromRoot('node_modules'),
        use: [{ loader: 'babel-loader' }],
      },
    ],
  },
  devServer: {
    host: 'localhost',
    port: 3000,
    contentBase: './dist',
  },
  plugins: [
    // new ForkTsCheckerWebpackPlugin({
    //   typescript: {
    //     mode: 'write-references',
    //     configOverwrite: { include: ['./src'] },
    //   },
    //   eslint: { files: 'src/**/*.{ts,tsx,js,jsx}' },
    // }),
    new HtmlWebpackPlugin({
      title: 'app',
      template: fromRoot('src/index.html'),
      inject: 'body',
    }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
});

export default configuration;
