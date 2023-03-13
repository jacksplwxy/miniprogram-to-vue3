const { declare } = require("@babel/helper-plugin-utils");
const t = require("@babel/types");
const path = require("path");

const plugin = declare((api, options) => {
  api.assertVersion(7);
  let { usingComponents } = options.usingComponents;
  let newUsingComponents = {};
  for (let key in usingComponents) {
    let newKey = key.replace(/-(\w)/g, (all, letter) => {
      return letter.toUpperCase();
    });
    newUsingComponents[newKey] = "./" + usingComponents[key];
  }
  // 创建：app.component('Loading', Loading)
  function creatRegisterComponent(name, component) {
    let callee = t.memberExpression(
      t.identifier("app"),
      t.identifier("component")
    );
    let arguments = [t.stringLiteral(name), t.identifier(component)];
    let expression = t.callExpression(callee, arguments);
    return t.expressionStatement(expression);
  }
  //创建import App from "./App.vue";
  function createImportDeclaration(name, path) {
    let importDeclaration = t.importDeclaration(
      [t.importDefaultSpecifier(t.identifier(name))],
      t.stringLiteral(path)
    );
    return importDeclaration;
  }
  return {
    visitor: {
      Program(programPath) {
        let importDeclarationArr = [];
        for (let key in newUsingComponents) {
          importDeclarationArr.push(
            createImportDeclaration(key, newUsingComponents[key])
          );
        }
        programPath.node.body.unshift(...importDeclarationArr);
      },
      CallExpression(path) {
        if (path.get("callee").node.name === "createSSRApp") {
          for (let key in newUsingComponents) {
            let registerComponent = creatRegisterComponent(key, key);
            path.parentPath.parentPath.insertAfter(registerComponent);
          }
        }
      },
    },
  };
});
module.exports = plugin;
