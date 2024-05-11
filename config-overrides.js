module.exports = function override(config, env) {
  config.module.rules = [
    ...config.module.rules,
    {
      resourceQuery: /raw/,
      type: 'asset/source',
      generator: { emit: false, }
    },
    {
      test: /\.csv$/,
      loader: 'csv-loader',
      type: 'asset/source',
      options: {
        dynamicTyping: true,
        header: false,
        skipEmptyLines: true
      },
      generator: { emit: false }
    }
  ]
  return config;
}

