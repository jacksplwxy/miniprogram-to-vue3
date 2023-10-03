const { declare } = require("@babel/helper-plugin-utils");
const t = require("@babel/types");
const { config } = require("../config/base");
const {
  getPageTypeInstancePath,
  createImportDeclaration,
  createFnCallExpressionStatement,
  transGlobalsMap,
  setScopeBindingUnique,
  geneUniqNameBaseonList,
  generateUid,
  creatReactive,
  pathFatherScopeIsPro,
  transSetData,
  transFnCallThisExpression,
  getCompositionNodeFromProperties,
} = require("../common/utils-busi/traverse");

const plugin = declare((api, options = {}, dirname) => {
  api.assertVersion(7);
  // 默认配置项
  let DefaultOptions = {};

  options = Object.assign(DefaultOptions, options);

  /**
   * 将option选项API转换为composition组合API
   * @param {*} ObjectExpressionPath
   * @returns
   */
  function transOptions2ExportOptions(ObjectExpressionPath) {
    let newNode = t.exportDefaultDeclaration(ObjectExpressionPath.node);
    return newNode;
  }

  return {
    pre(file) {},
    visitor: {
      Program: {
        enter(programPath) {
          // 获取App入参对象的path
          let appInstancePath = getPageTypeInstancePath(programPath, "App");
          if (!appInstancePath) {
            console.warn("to用户：get App instance error");
            return
          }

          // 转换全局对象关键词
          transGlobalsMap(programPath);

          // 将App的对象API转换为导出对象API
          let newNodeArr = transOptions2ExportOptions(appInstancePath);
          appInstancePath.parentPath.parentPath.replaceWithMultiple(newNodeArr);
        },
        exit(programPath) {},
      },
    },
    post(file) {},
  };
});

module.exports = plugin;
