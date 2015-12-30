module.exports = {
  context: __dirname + '/ux',
  entry: {
    'docx-templater': './src/docx-templater.js'
  },
  output: {
    path: __dirname + '/ux/bundles',
    filename: '[name].js',
    chunkFilename: '[id].js'
  }
};
