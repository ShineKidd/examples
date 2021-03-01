const fs = require('fs')
const path = require('path')

const { getAst, getDeps, getCode } = require('./parser')

class Compiler {
  constructor(options = {}) {
    this.options = options
    this.modules = []
  }

  build(filePath) {
    const ast = getAst(filePath)
    const deps = getDeps(ast, filePath)
    const code = getCode(ast)

    return {
      filePath,
      deps,
      code
    }
  }

  generate(depsGraph) {
    // main.js
    // '"use strict";\n' +
    // '\n' +
    // 'var _add = require("./add.js");\n' +
    // '\n' +
    // 'var _minus = _interopRequireDefault(require("./minus.js"));\n' +
    // '\n' +
    // 'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n' +
    // '\n' +
    // 'console.log((0, _add.add)(1, 1));\n' +
    // 'console.log((0, _minus["default"])(2, 1));'
    const bundle = `
      (function(depsGraph) {

        // 这个 require 需要返回模块内容
        function require(module) {

          // 编译的代码中有 exports 变量，需要构造这个变量
          var exports = {}

          // code 中还有 require() 函数，并且返回代码内部的 exports
          // 需重写 code 中的 rquire 如下
          function localRequire (relativePath) {
            return require(depsGraph[module].deps[relativePath])
          }

          // 执行 code
          (function (require, exports, code) {
            eval(code)
          })(localRequire, exports, depsGraph[module].code)

          return exports
        }
        // 加载入口文件
        require('${this.options.entry}')
      })(${JSON.stringify(depsGraph)})
    `

    const outputDir = this.options.output.path || 'dist'
    const filename = this.options.output.filename || 'bundle.js'
    fs.writeFileSync(path.resolve(outputDir, filename), bundle, 'utf-8')
  }

  run() {
    const filePath = this.options.entry
    const fileInfo = this.build(filePath)
    this.modules.push(fileInfo)

    this.modules.forEach(({ deps }) => {
      // deps
      // {
      //   './add.js': '/Users/shinekidd/Desktop/examples/webpack/src/add.js',
      //   './minus.js': '/Users/shinekidd/Desktop/examples/webpack/src/minus.js'
      // }

      for (const relativePath in deps) {
        const absolutePath = deps[relativePath]
        const fileInfo = this.build(absolutePath)
        this.modules.push(fileInfo)
      }
    })

    // deps graph
    const depsGraph = this.modules.reduce((graph, { deps, code, filePath }) => {
      return {
        ...graph,
        [filePath]: { deps, code }
      }
    }, {})

    this.generate(depsGraph)
  }
}

/* depsGraph */
// {
//   './src/main.js': {
//     deps: {
//       './add.js': '/Users/shinekidd/Desktop/examples/webpack/src/add.js',
//       './minus.js': '/Users/shinekidd/Desktop/examples/webpack/src/minus.js'
//     },
//     code: '"use strict";\n' +
//       '\n' +
//       'var _add = require("./add.js");\n' +
//       '\n' +
//       'var _minus = _interopRequireDefault(require("./minus.js"));\n' +
//       '\n' +
//       'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n' +
//       '\n' +
//       'console.log((0, _add.add)(1, 1));\n' +
//       'console.log((0, _minus["default"])(2, 1));'
//   },
//   '/Users/shinekidd/Desktop/examples/webpack/src/add.js': {
//     deps: {},
//     code: '"use strict";\n' +
//       '\n' +
//       'Object.defineProperty(exports, "__esModule", {\n' +
//       '  value: true\n' +
//       '});\n' +
//       'exports.add = add;\n' +
//       '\n' +
//       'function add(a, b) {\n' +
//       '  return a + b;\n' +
//       '}'
//   },
//   '/Users/shinekidd/Desktop/examples/webpack/src/minus.js': {
//     deps: {},
//     code: '"use strict";\n' +
//       '\n' +
//       'Object.defineProperty(exports, "__esModule", {\n' +
//       '  value: true\n' +
//       '});\n' +
//       'exports["default"] = minus;\n' +
//       '\n' +
//       'function minus(a, b) {\n' +
//       '  return a - b;\n' +
//       '}'
//   }
// }

module.exports = Compiler
