const { declare } = require("@babel/helper-plugin-utils");
const t = require("@babel/types");
const { config } = require("../config/base");
const { getPageTypeInstancePath } = require("../common/utils-busi/traverse");
// 一、将Page 选项中的方法转换为function方法，对于指定方法，有固定转换关系；
// 二、方法的调用需消除this
// 三、将data数据转换为reactive数据：
// 1、确定reactive对象名，默认为state
// 2、判断当前作用域中是否存在state变量名，若存在则改名为一个唯一变量名
// 3、创建一个变量state接收reactive对象

const plugin = declare((api, options = {}, dirname) => {
  api.assertVersion(7);
  // 默认配置项
  let DefaultOptions = {};

  options = Object.assign(DefaultOptions, options);

  /**
   * Page参数类型：https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html
   * 类型分类：根据类型，将数据转换为能够适应vue3 setup的不同形式:
   * 类型DATA：转换为reactive
   * 类型SETDATA：转换为state赋值语句
   * 类型LIFECYCLE:转换执行函数
   * 类型EVENT:转换执行函数
   * 类型OTHER：本人暂不清楚转换目标，默认转到function声明
   */
  const PageParamType = {
    data: "DATA", //页面的初始数据
    setData: "SETDATA", //更新页面数据
    options: "OTHER", //页面的组件选项，同 Component 构造器 中的 options ，需要基础库版本 2.10.1
    behaviors: "OTHER", //类似于 mixins 和traits的组件间代码复用机制，参见 behaviors，需要基础库版本 2.9.2
    onLoad: "LIFECYCLE", //生命周期回调—监听页面加载
    onShow: "LIFECYCLE", //生命周期回调—监听页面显示
    onReady: "LIFECYCLE", //生命周期回调—监听页面初次渲染完成
    onHide: "LIFECYCLE", //生命周期回调—监听页面隐藏
    onUnload: "LIFECYCLE", //生命周期回调—监听页面卸载
    onPullDownRefresh: "EVENT", //监听用户下拉动作
    onReachBottom: "EVENT", //页面上拉触底事件的处理函数
    onShareAppMessage: "EVENT", //用户点击右上角转发
    onShareTimeline: "EVENT", //用户点击右上角转发到朋友圈
    onAddToFavorites: "EVENT", //用户点击右上角收藏
    onPageScroll: "EVENT", //页面滚动触发事件的处理函数
    onResize: "EVENT", //页面尺寸改变时触发，详见 响应显示区域变化
    onTabItemTap: "EVENT", //当前是 tab 页时，点击 tab 时触发
    onSaveExitState: "EVENT", //页面销毁前保留状态回调
  };

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

  // 如果作用域中存在对关键词（配置项关键词、Page参数、特殊关键词（包括映射后的））的声明，则重命名这些声明，避免与关键词冲突
  function renameDeclarationKeyWord(path) {
    let newBindingList = {};
    //配置项关键词
    newBindingList[config.stateKeyWord] = true;
    // Page参数类型
    for (let key in PageParamType) {
      newBindingList[key] = true;
    }
    //特殊关键词（包括映射后的）
    for (let key in config.globalsMap) {
      newBindingList[key] = true;
      newBindingList[config.globalsMap[key]] = true;
    }
    // 声明重命名
    setScopeBindingUnique(path.scope, newBindingList);
  }

  // 将全局作用域中冲突的已有的申明进行重新命名，为Page参数转换为组合API腾出标识符
  function renameDeclarationPageParam(programPath, pageInstancePath) {
    let newBindingList = {};
    pageInstancePath.get("properties").forEach((nodePath) => {
      newBindingList[nodePath.node.key.name] = true;
    });
    setScopeBindingUnique(programPath.scope, newBindingList);
  }

  // 转换特殊关键词
  function transKeyWordMap(path) {
    path.traverse({
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
  function creatReactive(t, objectExpression) {
    return t.variableDeclaration("const", [
      t.VariableDeclarator(
        t.Identifier(config.stateKeyWord),
        t.CallExpression(t.Identifier("reactive"), [objectExpression])
      ),
    ]);
  }

  /**
   * 将option选项API转换为composition组合API
   * @param {*} ObjectExpressionPath
   * @param {*} scope 转换到的作用域
   * @returns
   */
  function transOptions2Composition(ObjectExpressionPath, scope) {
    let newNodeArr = [];
    let pageParamDependArr = [];
    ObjectExpressionPath.get("properties").forEach((nodePath) => {
      let item = nodePath.node;
      // 处理Page({test(){}})
      if (nodePath.isObjectMethod()) {
        if (
          PageParamType[item.key.name] === "LIFECYCLE" ||
          PageParamType[item.key.name] === "EVENT"
        ) {
          pageParamDependArr.push(item.key.name);
          const newNode = createFnCallExpressionStatement(
            t.identifier(generateUid(scope, item.key.name)),
            {
              key: null,
              params: item.params,
              body: item.body,
              generator: item.generator,
              async: item.async,
            },
            false
          );
          newNodeArr.push(newNode);
        } else {
          const newNode = t.functionDeclaration(
            t.identifier(generateUid(scope, item.key.name)),
            item.params,
            item.body,
            item.generator,
            item.async
          );
          newNodeArr.push(newNode);
        }
      }
      // 处理Page({test:xxx})
      else if (nodePath.isObjectProperty()) {
        // 处理Page({test: function () {}})
        // ObjectProperty的key可能是Identifier | Literal
        let name = item.key.name || item.key.value;
        if (item.value.type === "FunctionExpression") {
          if (
            PageParamType[name] === "LIFECYCLE" ||
            PageParamType[name] === "EVENT"
          ) {
            pageParamDependArr.push(item.key.name);
            const newNode = createFnCallExpressionStatement(
              t.identifier(generateUid(scope, name)),
              {
                key: null,
                params: item.value.params,
                body: item.value.body,
                generator: item.value.generator,
                async: item.value.async,
              },
              false
            );
            newNodeArr.push(newNode);
          } else {
            const newNode = t.functionDeclaration(
              t.identifier(generateUid(scope, name)),
              item.value.params,
              item.value.body,
              item.value.generator,
              item.value.async
            );
            newNodeArr.push(newNode);
          }
        }
        // 处理Page({test:()=>{}})
        else if (item.value.type === "ArrowFunctionExpression") {
          if (
            PageParamType[name] === "LIFECYCLE" ||
            PageParamType[name] === "EVENT"
          ) {
            pageParamDependArr.push(item.key.name);
            const newNode = createFnCallExpressionStatement(
              t.identifier(generateUid(scope, name)),
              {
                params: item.value.params,
                body: item.value.body,
                async: item.value.async,
              },
              true
            );
            newNodeArr.push(newNode);
          } else {
            const newNode = t.variableDeclaration("let", [
              t.variableDeclarator(
                t.identifier(generateUid(scope, name)),
                t.arrowFunctionExpression(
                  item.value.params,
                  item.value.body,
                  item.value.async
                )
              ),
            ]);
            newNodeArr.push(newNode);
          }
        }
        // 处理Page({data:{}})
        else if (item.value.type === "ObjectExpression") {
          // 处理data数据
          if (PageParamType[name] === "DATA") {
            // 引入依赖
            let program = scope.getProgramParent().path;
            let dependency = createImportDeclaration(["reactive"], "vue");
            program.node.body.unshift(dependency);
            // 创建reactive
            let reactiveNode = creatReactive(t, item.value);
            newNodeArr.unshift(reactiveNode);
          }
          // 处理Page({test:any})
          else {
            let newNode = t.variableDeclaration("let", [
              t.VariableDeclarator(
                t.Identifier(generateUid(scope, name)),
                item.value
              ),
            ]);
            newNodeArr.push(newNode);
          }
        }
        // 其他未考虑到的情况（暂定为赋值）
        else {
          let newNode = t.variableDeclaration("let", [
            t.VariableDeclarator(
              t.Identifier(generateUid(scope, name)),
              item.value
            ),
          ]);
          newNodeArr.push(newNode);
        }
      }
    });
    // 引入依赖
    if (pageParamDependArr.length > 0) {
      let program = scope.getProgramParent().path;
      let dependency = createImportDeclaration(
        pageParamDependArr,
        "@dcloudio/uni-app"
      );
      program.node.body.unshift(dependency);
    }
    return newNodeArr;
  }

  // 转换Page入参的this表达式
  function transPageThisExpression(path) {
    path.traverse({
      ThisExpression(thisPath) {
        // 要确保thisPath的父函数作用域是program的作用域
        if (thisFatherScopeIsPro(thisPath)) {
          transThis(thisPath);
        }
      },
    });
  }

  // 判断父函数作用域是否为Program
  function thisFatherScopeIsPro(thisPath) {
    let result = false;
    let scope = thisPath.scope;
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

  // 转换this
  function transThis(thisPath) {
    // this作为一个对象点属性时,所有情况都需处理
    if (thisPath.key === "object" && thisPath.parentPath.isMemberExpression()) {
      removeLikeThis(thisPath);
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
    }
    // 纯this则直接移除
    // todo：此处需要考量，可能有未考虑到的情况导致代码被删除
    else {
      thisPath.remove();
    }
  }

  // 移除类this对象中的this
  function removeLikeThis(thisPath) {
    // 将原来作用域中冲突的申明重命名
    let newBindingListKey = thisPath.getSibling("property").node.name;
    if (newBindingListKey !== config.stateKeyWord) {
      let newBindingList = {};
      newBindingList[newBindingListKey] = true;
      setScopeBindingUnique(thisPath.scope, newBindingList);
    }
    // 将this.xxx转换为xxx
    transThisObj2No(thisPath);
  }

  // 将this.xxx转换为xxx
  function transThisObj2No(thisPath) {
    if (thisPath.key === "object" && thisPath.parentPath.isMemberExpression()) {
      let identifierName = thisPath.parentPath.get("property").node.name;
      // 处理this.data.xxx
      if (PageParamType[identifierName] === "DATA") {
        thisPath.parentPath.replaceWith(t.Identifier(config.stateKeyWord));
      }
      // 处理this.setData
      else if (
        PageParamType[identifierName] === "SETDATA" &&
        thisPath.parentPath.parentPath.isCallExpression() &&
        thisPath.parentPath.key === "callee"
      ) {
        // 向上查找的范围应当尽可能小，避免没有考虑到的情况处理
        let oldCallExpression = thisPath.findParent((p) =>
          p.isCallExpression()
        );
        // 暂不支持赋值的形式
        if (oldCallExpression.get("arguments")[0].isIdentifier()) {
          let line = oldCallExpression.node.loc.start.line;
          console.log(`${line}行：暂不支持setData以参数形式赋值的翻译`);
        } else {
          let newNodeArr = transSetData(oldCallExpression);
          oldCallExpression.replaceWithMultiple(newNodeArr);
        }
      }
      // 处理this.xxx
      // 处理console.log(this.xxx)
      // 处理this.xxx =
      else {
        thisPath.parentPath.replaceWith(t.Identifier(identifierName));
      }
    }
  }

  // 将setData转换为reactive
  function transSetData(callExpression) {
    let newNodeArr = [];
    callExpression
      .get("arguments")[0]
      .get("properties")
      .forEach((objectPropertyPath) => {
        let newNode = t.expressionStatement(
          t.assignmentExpression(
            "=",
            t.memberExpression(
              t.identifier(config.stateKeyWord),
              t.identifier(
                objectPropertyPath.get("key").node.name ||
                  objectPropertyPath.get("key").node.value
              )
            ),
            objectPropertyPath.get("value").node
          )
        );
        newNodeArr.push(newNode);
      });

    return newNodeArr;
  }

  return {
    pre(file) {},
    visitor: {
      Program: {
        enter(programPath) {
          // 获取Page入参对象的path
          let pageInstancePath = getPageTypeInstancePath(programPath, "Page");
          if (!pageInstancePath) {
            throw new Error("get Page instance error");
          }
          // 将全局作用域中冲突的已有的申明进行重新命名，为关键词转换为组合API腾出标识符
          renameDeclarationKeyWord(programPath);
          // 将全局作用域中已有的申明进行重新命名，为Page参数转换为组合API腾出标识符
          renameDeclarationPageParam(programPath, pageInstancePath);
          // 转换特殊关键词
          transKeyWordMap(programPath);
          // 处理this表达式
          transPageThisExpression(pageInstancePath);
          // 将Page的对象API转换为funciton组合API
          let newNodeArr = transOptions2Composition(
            pageInstancePath,
            programPath.scope
          );
          pageInstancePath.parentPath.parentPath.insertAfter(newNodeArr);
          pageInstancePath.parentPath.parentPath.remove();
        },
        exit(programPath) {},
      },
    },
    post(file) {},
  };
});

module.exports = plugin;
