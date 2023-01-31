const { declare } = require("@babel/helper-plugin-utils");
const t = require("@babel/types");
const { config } = require("../config/base");
const {
  getPageTypeInstancePath,
  createImportDeclaration,
  createFnCallExpressionStatement,
  renameDeclarationPageParam,
  transGlobalsMap,
  setScopeBindingUnique,
  geneUniqNameBaseonList,
  generateUid,
  creatReactive,
  pathFatherScopeIsPro,
  transSetData,
  transFnCallThisExpression,
} = require("../common/utils-busi/traverse");

const plugin = declare((api, options = {}, dirname) => {
  api.assertVersion(7);
  // 默认配置项
  let DefaultOptions = {};

  options = Object.assign(DefaultOptions, options);

  /**
   * Component参数类型：https://developers.weixin.qq.com/miniprogram/dev/reference/api/Component.html
   * 类型分类：根据类型，将数据转换为能够适应vue3 setup的不同形式:
   * 类型DATA：转换为reactive
   * 类型LIFECYCLE:转换执行函数
   * 类型EVENT:转换执行函数
   * 类型OTHER：本人暂不清楚转换目标，默认转到function声明
   */
  const ComponentParamType = {
    properties: "PROPERTIES",
    data: "REACTIVE",
    observers: "WATCH",
    methods: "METHODS",
    behaviors: "MIXINS",
    created: "CALLFN",
    attached: "CALLFN",
    ready: "CALLFN",
    moved: "CALLFN",
    detached: "CALLFN",
    relations: "RELATIONS",
    externalClasses: "EXTERNALCLASSES",
    options: "OPTIONS",
    lifetimes: "LIFETIMES",
    pageLifetimes: "PAGELIFETIMES",
  };

  // 如果作用域中存在对关键词（配置项关键词、Component参数、全局对象关键词（包括映射后的））的声明，则重命名这些声明，避免与关键词冲突
  function renameDeclarationKeyWord(path) {
    // 关键词集合
    let newBindingList = {};
    // 收集关键词：配置项关键词
    newBindingList[config.stateKeyWord] = true;
    // 收集关键词：Page参数类型
    for (let key in ComponentParamType) {
      newBindingList[key] = true;
    }
    // 收集关键词：全局对象关键词（包括映射后的）
    for (let key in config.globalsMap) {
      newBindingList[key] = true;
      newBindingList[config.globalsMap[key]] = true;
    }
    // 声明重命名
    setScopeBindingUnique(path.scope, newBindingList);
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
        if (ComponentParamType[item.key.name] === "CALLFN") {
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
          if (ComponentParamType[name] === "CALLFN") {
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
          if (ComponentParamType[name] === "CALLFN") {
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
          if (ComponentParamType[name] === "REACTIVE") {
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

  return {
    pre(file) {},
    visitor: {
      Program: {
        enter(programPath) {
          // 获取Page入参对象的path
          let componentInstancePath = getPageTypeInstancePath(
            programPath,
            "Component"
          );
          if (!componentInstancePath) {
            throw new Error("get Component instance error");
          }
          // 将全局作用域中冲突的已有的申明进行重新命名，为关键词转换为组合API腾出标识符
          renameDeclarationKeyWord(programPath);
          // 将全局作用域中已有的申明进行重新命名，为Page参数转换为组合API腾出标识符
          renameDeclarationPageParam(programPath, componentInstancePath);
          // 转换全局对象关键词
          transGlobalsMap(programPath);
          // 处理this表达式
          transFnCallThisExpression(componentInstancePath);
          // 将Component的对象API转换为funciton组合API
          let newNodeArr = transOptions2Composition(
            componentInstancePath,
            programPath.scope
          );
          componentInstancePath.parentPath.parentPath.replaceWithMultiple(
            newNodeArr
          );
        },
        exit(programPath) {},
      },
    },
    post(file) {},
  };
});

module.exports = plugin;
