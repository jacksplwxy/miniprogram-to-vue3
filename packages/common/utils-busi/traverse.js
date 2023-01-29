const t = require("@babel/types");

// 将赋值表达式转换为对象表达式
function transPageInstanceAssignEx2ObjectEx(path) {
  let properties = []; //properties: Array<ObjectMethod | ObjectProperty | SpreadElement>

  let bindings = path.scope.bindings;
  for (let key in bindings) {
    let declarePath = bindings[key].path;
    if (
      declarePath.isVariableDeclarator() &&
      declarePath.node.id.name === path.node.name
    ) {
      let referencePaths = bindings[key]["referencePaths"];
      referencePaths.forEach((path) => {
        let grandfaPath = path.parentPath.parentPath;
        if (grandfaPath.isAssignmentExpression()) {
          let left = grandfaPath.get("left");
          let id = "";
          if (left.node.computed) {
            id = t.Identifier(left.get("property").node.value);
          } else {
            id = t.Identifier(left.get("property").node.name);
          }
          let ObjectProperty = t.objectProperty(
            id,
            grandfaPath.get("right").node
          );
          properties.push(ObjectProperty);
          // 删除ExpressionStatement
          grandfaPath.parentPath.remove();
        }
      });
      break;
    }
  }
  let objectExpression = t.objectExpression(properties);
  path.replaceWith(objectExpression);
}

/**
 * 获取页面的App、Page、Component的实例的AST path
 * @param {String} programPath :程序根path
 * @param {Enum} pageType :可为App、Page、Component，默认为Page
 * @returns
 */
function getPageTypeInstancePath(programPath, pageType = "Page") {
  let pageInstancePath = null;
  programPath.traverse({
    // 如果pageInstance是一个标识符，则转换为一个对象表达式
    CallExpression(pagePath) {
      if (
        pagePath.parentPath.isExpressionStatement &&
        pagePath.parentPath.parentPath.isProgram
      ) {
        if (pagePath.get("callee").node.name === pageType) {
          let identifierPath = pagePath.get("arguments")[0];
          if (identifierPath && identifierPath.isIdentifier()) {
            // 说明Page的参数为一个标识符
            transPageInstanceAssignEx2ObjectEx(identifierPath);
          }
        }
      }
    },
    ObjectExpression(pagePath) {
      if (
        pagePath.parentPath.isCallExpression &&
        pagePath.parentPath.parentPath.isExpressionStatement &&
        pagePath.parentPath.parentPath.parentPath.isProgram
      ) {
        if (
          pagePath.listKey === "arguments" &&
          pagePath.key === 0 &&
          pagePath.parentPath.get("callee").node.name === pageType
        ) {
          pageInstancePath = pagePath;
        }
      }
    },
  });
  return pageInstancePath;
}

module.exports = { getPageTypeInstancePath };
