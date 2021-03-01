
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
        require('./src/main.js')
      })({"./src/main.js":{"deps":{"./add.js":"/Users/shinekidd/Desktop/examples/webpack/src/add.js","./minus.js":"/Users/shinekidd/Desktop/examples/webpack/src/minus.js"},"code":"\"use strict\";\n\nvar _add = require(\"./add.js\");\n\nvar _minus = _interopRequireDefault(require(\"./minus.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nconsole.log((0, _add.add)(1, 1));\nconsole.log((0, _minus[\"default\"])(2, 1));"},"/Users/shinekidd/Desktop/examples/webpack/src/add.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.add = add;\n\nfunction add(a, b) {\n  return a + b;\n}"},"/Users/shinekidd/Desktop/examples/webpack/src/minus.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = minus;\n\nfunction minus(a, b) {\n  return a - b;\n}"}})
    