module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-normalize': {},
    'postcss-preset-env': {
      stage: 3,
      features: {
        'custom-properties': false
      }
    },
    'postcss-flexbugs-fixes': {},
  },
};