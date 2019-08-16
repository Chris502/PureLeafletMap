var path = require('path');
module.exports = {
  entry: './src/Map.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'Map.js',
    libraryTarget: 'commonjs2' 
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test:/\ts?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  
  externals: {
    'react': 'commonjs react'
  }
};
