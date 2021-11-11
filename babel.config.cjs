module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
  plugins: [
    [
      'file-loader',
      {
        name: "[hash].[ext]",
        extensions: ["png", "jpg", "jpeg", "gif", "svg"],
        publicPath: "/public",
        outputPath: "/public",
        context: "",
        limit: 0
      }
    ]
  ]
};
