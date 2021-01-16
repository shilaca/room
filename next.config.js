module.exports = {
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(glsl|vert|frag|vs|fs)$/,
      use: ['raw-loader'],
      exclude: /node_modules/
    })

    config.watchOptions = {
      poll: true
    }

    return config
  }
}
