const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background/index.ts',
    popup: './src/popup/index.ts',
    options: './src/options/index.ts',
    content: './src/content/index.ts'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/popup/popup.html', to: 'popup.html' },
        { from: 'src/popup/popup.css', to: 'popup.css' },
        { from: 'src/options/options.html', to: 'options.html' },
        { from: 'src/options/options.css', to: 'options.css' },
        { from: 'rust_core/pkg/*.wasm', to: '[name][ext]', noErrorOnMissing: true },
        { from: 'rust_core/pkg/*.js', to: 'wasm/[name][ext]', noErrorOnMissing: true },
        { from: 'icons', to: 'icons', noErrorOnMissing: true }
      ]
    })
  ],
  experiments: {
    asyncWebAssembly: true
  }
};
