const path = require('path')
const fs = require('fs')
const babelParser = require('@babel/parser')
const babelTraverse = require('@babel/traverse').default
const { transformFromAst } = require('@babel/core')


function getAst(filePath) {
  const file = fs.readFileSync(filePath, 'utf-8')

  const ast = babelParser.parse(file, {
    sourceType: 'module'
  })

  return ast
}

function getCode(ast) {
  const { code } = transformFromAst(ast, null, {
    presets: ['@babel/preset-env']
  })
  return code
}

function getDeps(ast, filePath) {
  const deps = {}
  const dirname = path.dirname(filePath)
  babelTraverse(ast, {
    ImportDeclaration({ node }) {
      const relativePath = node.source.value
      const absolutePath = path.resolve(dirname, relativePath)
      deps[relativePath] = absolutePath
    }
  })
  return deps
}

module.exports = {
  getAst,
  getCode,
  getDeps,
}
