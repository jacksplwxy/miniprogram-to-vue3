const t = require("@babel/types");
const { config } = require("../../config/base");
const { Page } = require("../../polyfill/Page");

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

// 创建ImportDeclaration，例如：import { onShow, onLoad, onUnload } from '@dcloudio/uni-app'
function createImportDeclaration(nameArr, sourVal) {
  let specifiers = nameArr.map((item) => {
    let local = t.identifier(item);
    let imported = t.identifier(item);
    return t.importSpecifier(local, imported);
  });
  let source = t.stringLiteral(sourVal);
  return t.importDeclaration(specifiers, source);
}

// 创建函数调用表达式语句，例如onShow(function(res){ console.log(res) })、onHidden(function(res){console.log(res)})
function createFnCallExpressionStatement(
  nameIdentifier = "",
  fnInfo = {},
  isArrow = false
) {
  let callee = nameIdentifier;
  let arguments = [];
  if (isArrow) {
    arguments.push(
      t.arrowFunctionExpression(fnInfo.params, fnInfo.body, fnInfo.async)
    );
  } else {
    arguments.push(
      t.FunctionExpression(
        fnInfo.key,
        fnInfo.params,
        fnInfo.body,
        fnInfo.generator,
        fnInfo.async
      )
    );
  }
  let expression = t.callExpression(callee, arguments);
  return t.expressionStatement(expression);
}

// 转换全局对象关键词
function transGlobalsMap(programPath) {
  programPath.traverse({
    Identifier(identPath) {
      if (
        identPath.key === "object" &&
        identPath.parentPath.isMemberExpression() &&
        config.globalsMap[identPath.node.name]
      ) {
        identPath.node.name = config.globalsMap[identPath.node.name];
      }
    },
  });
}

// 如果作用域中的bingdings命名与newBindingList中存在冲突，则重命名原bingdings中的冲突申明
function setScopeBindingUnique(scope, newBindingList) {
  // 合并当前作用域与新声明表
  let mergeBindings = Object.assign({}, scope.bindings, newBindingList);
  for (let key in scope.bindings) {
    if (newBindingList[key]) {
      scope.rename(key, geneUniqNameBaseonList(scope, mergeBindings, key));
    }
  }
}

// 生成一个list对象中没有的名字
function geneUniqNameBaseonList(scope, list, oldName) {
  let newName = scope.generateUid(oldName);
  // 检查是否重名，若是则递归继续生成新的名字
  if (list[newName]) {
    return geneUniqNameBaseonList(scope, list, newName);
  } else {
    return newName;
  }
}

// 在作用域中将申明生成唯一的id。为保证翻译后的代码可读性，如果作用域中不存在，则优先保留原来的申明
function generateUid(scope, name) {
  if (!scope.bindings[name]) {
    return name;
  } else {
    return scope.generateUid(name);
  }
}

// 根据一个对象创建reactive
function creatReactive(objectExpression) {
  return t.variableDeclaration("const", [
    t.VariableDeclarator(
      t.Identifier(config.stateKeyWord),
      t.CallExpression(t.Identifier("reactive"), [objectExpression])
    ),
  ]);
}

// 根据一个对象创建defineProps
function creatDefineProps(objectExpression) {
  return t.variableDeclaration("const", [
    t.VariableDeclarator(
      t.Identifier(config.propsKeyWord),
      t.CallExpression(t.Identifier("defineProps"), [objectExpression])
    ),
  ]);
}

// 获取Program所在作用域
function getProScope(path) {
  let scope = path.scope;
  if (scope.parent) {
    return getProScope(scope.parent.path);
  }
  return scope;
}

// 判断父函数作用域是否为Program
function pathFatherScopeIsPro(path) {
  let result = false;
  let scope = path.scope;
  let layer = 0;
  do {
    if (scope.path.isFunctionParent()) {
      layer++;
    }
    // 如果是箭头函数，对于this表达式则不能算1层
    if (scope.path.isArrowFunctionExpression()) {
      layer--;
    }
  } while ((scope = scope.parent));
  if (layer === 1) {
    result = true;
  }
  return result;
}

// 将setData转换为reactive
function transSetData(callExpression) {
  let newNodeArr = [];
  callExpression
    .get("arguments")[0]
    .get("properties")
    .forEach((objectPropertyPath) => {
      let lVal;
      if (objectPropertyPath.get("key").isMemberExpression()) {
        lVal = objectPropertyPath.get("key").node;
      } else if (
        objectPropertyPath.get("key").isStringLiteral() ||
        objectPropertyPath.get("key").isIdentifier()
      ) {
        lVal = t.memberExpression(
          t.identifier(config.stateKeyWord),
          t.identifier(
            objectPropertyPath.get("key").node.name ||
              objectPropertyPath.get("key").node.value
          )
        );
      } else {
        console.warn(
          `to开发者和用户：暂不支持${objectPropertyPath.toString()}转换，先按StringLiteral处理，后续完善`
        );
        lVal = t.memberExpression(
          t.identifier(config.stateKeyWord),
          t.identifier(objectPropertyPath.toString())
        );
      }

      let newNode = t.expressionStatement(
        t.assignmentExpression("=", lVal, objectPropertyPath.get("value").node)
      );
      newNodeArr.push(newNode);
    });

  return newNodeArr;
}

// 处理getApp()
function transGetAppCallExpression(programPath) {
  let hasImport = false;
  programPath.traverse({
    CallExpression(appPath) {
      if (appPath.get("callee").node.name === "getApp") {
        // 要确保path的作用域是program的作用域
        if (appPath.scope === programPath.scope) {
          if (!hasImport) {
            let importDeclaration = t.importDeclaration(
              [
                t.importDefaultSpecifier(
                  t.identifier(config.getAppCallKeyWord)
                ),
              ],
              t.stringLiteral("@/App.vue")
            );
            programPath.node.body.unshift(importDeclaration);
            hasImport = true;
          }
          appPath.replaceWith(t.Identifier(config.getAppCallKeyWord));
        }
      }
    },
  });
}

// 获取所有this（指向Page、Component、App）中申明的属性
function getAllThisProps(path) {
  let props = {};
  path.traverse({
    ThisExpression(thisPath) {
      // 要确保thisPath的父函数作用域是program的作用域
      if (pathFatherScopeIsPro(thisPath)) {
        getThisProps(thisPath, props);
      }
    },
  });
  return props;
}

// 获取this的属性
function getThisProps(thisPath, props) {
  // this作为一个对象"点"属性时,所有情况都需处理
  if (thisPath.key === "object" && thisPath.parentPath.isMemberExpression()) {
    let newBindingListKey = thisPath.getSibling("property").node.name;
    const DataKeyWord = "data";
    const SetdataKeyWord = "setData";
    if (
      newBindingListKey !== config.stateKeyWord &&
      newBindingListKey !== DataKeyWord &&
      newBindingListKey !== SetdataKeyWord &&
      !Page[newBindingListKey]
    ) {
      props[newBindingListKey] = true;
    }
  }
  // 当this作为值时进行处理，例如this=that
  else if (
    thisPath.key === "init" &&
    thisPath.parentPath.isVariableDeclarator()
  ) {
    let newThisPath = thisPath.getSibling("id");
    thisPath.scope.bindings[newThisPath.node.name] &&
      thisPath.scope.bindings[newThisPath.node.name].referencePaths &&
      thisPath.scope.bindings[newThisPath.node.name].referencePaths.forEach(
        (referencePath) => {
          getThisProps(referencePath, props);
        }
      );
  }
}

// 转换方法调用入参的this表达式为函数申明（包含了this.setData的处理）
function transFnCallThisExpression(path) {
  path.traverse({
    ThisExpression(thisPath) {
      // 要确保thisPath的父函数作用域是program的作用域
      if (pathFatherScopeIsPro(thisPath)) {
        transThis(thisPath);
      }
    },
  });
}

// 转换this
function transThis(thisPath) {
  // this作为一个对象"点"属性时,所有情况都需处理
  if (thisPath.key === "object" && thisPath.parentPath.isMemberExpression()) {
    // 将原来作用域中冲突的申明重命名
    let newBindingListKey = thisPath.getSibling("property").node.name;
    if (newBindingListKey !== config.stateKeyWord) {
      let newBindingList = {};
      newBindingList[newBindingListKey] = true;
      setScopeBindingUnique(thisPath.scope, newBindingList);
    }
    // 将this.xxx转换为xxx
    transThisObj2NoByRule(thisPath);
  }
  // 当this作为值时进行处理，例如this=that
  else if (
    thisPath.key === "init" &&
    thisPath.parentPath.isVariableDeclarator()
  ) {
    let newThisPath = thisPath.getSibling("id");
    thisPath.scope.bindings[newThisPath.node.name] &&
      thisPath.scope.bindings[newThisPath.node.name].referencePaths &&
      thisPath.scope.bindings[newThisPath.node.name].referencePaths.forEach(
        (referencePath) => {
          transThis(referencePath);
        }
      );
  } else if (thisPath.listKey === "arguments") {
    console.warn(
      `to用户：此处（${thisPath.parentPath.toString()}）的this作为参数，请手工进行相关代码转换处理！`
    );
  }
  // 其他情况
  else {
    console.warn(
      `to开发者和用户：此处（${thisPath.parentPath.toString()}）未进行转换，请确认！`
    );
  }
}

// 根据规则，将this.xxx转换为xxx
function transThisObj2NoByRule(thisPath) {
  const DataKeyWord = "data";
  const SetdataKeyWord = "setData";
  if (thisPath.key === "object" && thisPath.parentPath.isMemberExpression()) {
    let identifierName = thisPath.parentPath.get("property").node.name;
    // 处理this.data.xxx
    if (identifierName === DataKeyWord) {
      thisPath.parentPath.replaceWith(t.Identifier(config.stateKeyWord));
    }
    // 处理this.setData
    else if (
      identifierName === SetdataKeyWord &&
      thisPath.parentPath.parentPath.isCallExpression() &&
      thisPath.parentPath.key === "callee"
    ) {
      // 向上查找的范围应当尽可能小，避免没有考虑到的情况处理
      let oldCallExpression = thisPath.findParent((p) => p.isCallExpression());
      // 赋值的形式的实现
      if (oldCallExpression.get("arguments")[0].isIdentifier()) {
        // let line = oldCallExpression.node.loc.start.line;
        //  `@babel/plugin-transform-object-assign`
        // 拿到Identifier的referencePaths，将所有引用的Identifier改为state，如果是VariableDeclarator语句则
        let objAssign = t.callExpression(
          t.memberExpression(t.identifier("Object"), t.identifier("assign")),
          [
            t.identifier(config.stateKeyWord),
            oldCallExpression.get("arguments")[0].node,
          ]
        );
        oldCallExpression.replaceWith(objAssign);
      } else {
        let newNodeArr = transSetData(oldCallExpression);
        oldCallExpression.replaceWithMultiple(newNodeArr);
      }
    }
    // 处理this.xxx
    // 处理console.log(this.xxx)
    // 处理this.xxx =
    else {
      // 处理特殊Page/Component关键词（例如：route、getTabBar ）
      if (Page[identifierName]) {
        // todo：此处应当针对Page的属性进行处理
        console.warn(`此处应当进行属性处理：${thisPath.parentPath.toString()}`);
      } else {
        // // 命名冲突处理（将原本存在的全局申明改名）
        // let proScope = getProScope(thisPath);
        // let newBindingList = {};
        // newBindingList[identifierName] = true;
        // setScopeBindingUnique(proScope, newBindingList);
        // proScope.path.unshiftContainer(
        //   "body",
        //   t.variableDeclaration("let", [
        //     t.VariableDeclarator(t.Identifier(identifierName)),
        //   ])
        // );
        thisPath.parentPath.replaceWith(t.Identifier(identifierName));
      }
    }
  } else {
    console.warn(
      `to开发者：此处（${thisPath.parentPath.toString()}）的this处理情况未考虑到，请处理！`
    );
  }
}



/**
 * 从对象属性中提取符合Composition格式的新节点（不处理关键词）
 * @param {*} propertyPath 对象的属性path
 * @param {*} scope 转换后需要避免与scope作用域出现申明冲突
 * @returns 节点
 */
function getCompositionNodeFromProperties(propertyPath, scope) {
  let newNode;
  let item = propertyPath.node;
  // ObjectProperty的key可能是Identifier | Literal
  let name = item.key.name || item.key.value;
  // 处理Component({any(){}})
  if (propertyPath.isObjectMethod()) {
    newNode = t.functionDeclaration(
      t.identifier(name),
      item.params,
      item.body,
      item.generator,
      item.async
    );
  }
  // 处理Component({test:xxx})
  else if (propertyPath.isObjectProperty()) {
    // 处理Component({test: function () {}})
    if (item.value.type === "FunctionExpression") {
      newNode = t.functionDeclaration(
        t.identifier(name),
        item.value.params,
        item.value.body,
        item.value.generator,
        item.value.async
      );
    }
    // 处理Component({test:()=>{}})
    else if (item.value.type === "ArrowFunctionExpression") {
      newNode = t.variableDeclaration("let", [
        t.variableDeclarator(
          t.identifier(name),
          t.arrowFunctionExpression(
            item.value.params,
            item.value.body,
            item.value.async
          )
        ),
      ]);
    }
    // 处理Component({any:any})
    else if (item.value.type === "ObjectExpression") {
      newNode = t.variableDeclaration("let", [
        t.VariableDeclarator(t.Identifier(name), item.value),
      ]);
    }
    // 其他未考虑到的情况（暂定为赋值）
    else {
      newNode = t.variableDeclaration("let", [
        t.VariableDeclarator(t.Identifier(name), item.value),
      ]);
    }
  } else {
    console.log("此处存在未处理的情况");
  }
  return newNode;
}

module.exports = {
  getPageTypeInstancePath,
  createImportDeclaration,
  createFnCallExpressionStatement,
  transGlobalsMap,
  setScopeBindingUnique,
  geneUniqNameBaseonList,
  generateUid,
  creatReactive,
  creatDefineProps,
  pathFatherScopeIsPro,
  transSetData,
  transFnCallThisExpression,
  transGetAppCallExpression,
  getCompositionNodeFromProperties,
  getProScope,
  getAllThisProps,
};
