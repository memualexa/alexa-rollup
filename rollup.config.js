import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';

const {BUILD, MINIFY} = process.env;
const minified = MINIFY === 'true';
const prod = BUILD === 'prod';

const config = [{ 
  input: ['src/js/app.js'],
  output: {
    name: 'alexa-app',
    dir: 'public/js',
    format: 'umd',
    indent: false
  },
  watch: {
    exclude: ['node_modules/**','*.json']
  },
  plugins: [
    json({
      // ignores indent and generates the smallest code
      compact: true // Default: false
    }),
    // resolve({
    //   // not all files you want to resolve are .js files
    //   extensions: [ '.mjs', '.js', '.jsx', '.json', '.node' ],  // Default: [ '.mjs', '.js', '.json', '.node' ]
    //   browser: true,
    //   main: true,
    //   jsnext: true,
    //   // whether to prefer built-in modules (e.g. `fs`, `path`) or
    //   // local ones with the same names
    //   preferBuiltins: false
    // }),
    // commonjs({
    //   include: 'node_modules/**',  // Default: undefined
    //   exclude: [ 'node_modules/foo/**', 'node_modules/bar/**' ],  // Default: undefined
    //   // global keyword handling causes Webpack compatibility issues, so we disabled it:
    //   // https://github.com/mapbox/mapbox-gl-js/pull/6956
    //   //ignoreGlobal: true,
    //   ignoreGlobal: false,
    //   // if false then skip sourceMap generation for CommonJS modules
    //   sourceMap: false,  // Default: true
    //   namedExports: {
    //     // left-hand side can be an absolute path, a path
    //     // relative to the current directory, or the name
    //     // of a module in node_modules
    //     'mapbox-gl': [ 'mapbox-gl' ]
    //   }
    // }),
    resolve(),
    commonjs(),
    (minified && uglify()),
  ]
}];

export default config;