const babel = require('rollup-plugin-babel')
const commonjs = require('rollup-plugin-commonjs')
const replace = require('rollup-plugin-replace')
const resolve = require('rollup-plugin-node-resolve')
const uglify = require('rollup-plugin-uglify')

const { BUILD_ENV } = process.env

const config = {
  input: 'modules/index.js',
  output: {
    name: 'ReactGoogleApi',
    globals: {
      react: 'React',
    },
  },
  external: ['react'],
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**',
    }),
    commonjs({
      include: /node_modules/,
    }),
  ],
}

if (BUILD_ENV) {
  config.plugins.push(
    replace({
      'process.env.NODE_ENV': JSON.stringify(BUILD_ENV),
    }),
  )
}

if (BUILD_ENV === 'production') {
  config.plugins.push(uglify())
}

module.exports = config
