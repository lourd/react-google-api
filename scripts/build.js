const fs = require('fs')
const path = require('path')
const execSync = require('child_process').execSync
const prettyBytes = require('pretty-bytes')
const gzipSize = require('gzip-size')

process.chdir(path.resolve(__dirname, '..'))
process.env.BUILDING = true

const exec = (command, extraEnv) =>
  execSync(command, {
    stdio: 'inherit',
    env: Object.assign({}, process.env, extraEnv),
  })

const filename = 'react-google-api'

console.log('\nBuilding ES modules...')

exec(`rollup -c -f es -o dist/esm/${filename}.js`)

console.log('\nBuilding CommonJS modules...')

exec(`rollup -c -f cjs -o dist/cjs/${filename}.js`)

console.log('\nBuilding UMD modules...')

exec(`rollup -c -f umd -o dist/umd/${filename}.js`, {
  BUILD_ENV: 'development',
})

exec(`rollup -c -f umd -o dist/umd/${filename}.min.js`, {
  BUILD_ENV: 'production',
})

console.log(
  '\nThe minified, gzipped UMD build is %s',
  prettyBytes(gzipSize.sync(fs.readFileSync(`dist/umd/${filename}.min.js`))),
)
