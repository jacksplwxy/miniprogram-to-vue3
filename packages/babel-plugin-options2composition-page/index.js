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
  transGetAppCallExpression,
  getCompositionNodeFromProperties,
  getAllThisProps,
  decarePromvariables,
} = require("../common/utils-busi/traverse");
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
   * 类型分类：根据类型，将数据转换为能够适应vue3 setup的不同形式
   */
  const PageParamType = {
    data: "REACTIVE", //页面的初始数据
    // setData: "SETDATA", //更新页面数据（在this转换中进行处理）
    options: "OPTIONS", //页面的组件选项，同 Component 构造器 中的 options ，需要基础库版本 2.10.1
    behaviors: "MIXINS", //类似于 mixins 和traits的组件间代码复用机制，参见 behaviors，需要基础库版本 2.9.2
    onLoad: "CALLFN", //生命周期回调—监听页面加载
    onShow: "CALLFN", //生命周期回调—监听页面显示
    onReady: "CALLFN", //生命周期回调—监听页面初次渲染完成
    onHide: "CALLFN", //生命周期回调—监听页面隐藏
    onUnload: "CALLFN", //生命周期回调—监听页面卸载
    onPullDownRefresh: "CALLFN", //监听用户下拉动作
    onReachBottom: "CALLFN", //页面上拉触底事件的处理函数
    onShareAppMessage: "CALLFN", //用户点击右上角转发
    onShareTimeline: "CALLFN", //用户点击右上角转发到朋友圈
    onAddToFavorites: "CALLFN", //用户点击右上角收藏
    onPageScroll: "CALLFN", //页面滚动触发事件的处理函数
    onResize: "CALLFN", //页面尺寸改变时触发，详见 响应显示区域变化
    onTabItemTap: "CALLFN", //当前是 tab 页时，点击 tab 时触发
    onSaveExitState: "CALLFN", //页面销毁前保留状态回调
  };

  // 如果作用域中存在对关键词（配置项关键词、Page参数、This（指向Page、Component、App）的属性、全局对象关键词（包括映射后的））的声明，则重命名这些声明，避免与关键词冲突
  function renameDeclarationKeyWord(path, pageInstancePropArr, allThisProps) {
    // 关键词集合
    let newBindingList = {};
    // 收集关键词：配置项关键词
    for (let key in config) {
      // vue3关键词（映射后的）
      if (key === "vue3Api") {
        for (let key in config.vue3Api) {
          newBindingList[config.vue3Api[key]] = true;
        }
      }
      // 全局对象关键词（映射后的）
      else if (key === "globalsMap") {
        for (let key in config.globalsMap) {
          newBindingList[config.globalsMap[key]] = true;
        }
      } else {
        newBindingList[config[key]] = true;
      }
    }
    // 收集关键词：Page预设参数类型
    for (let key in PageParamType) {
      newBindingList[key] = true;
    }
    // 收集关键词：Page实际参数
    pageInstancePropArr.forEach((key) => {
      newBindingList[key] = true;
    });
    // 收集关键词：This（指向Page、Component、App）的属性
    newBindingList = { ...newBindingList, ...allThisProps };
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
      // ObjectProperty的key可能是Identifier | Literal
      let name = item.key.name || item.key.value;
      if (
        !(nodePath.get("key").isIdentifier() || nodePath.get("key").isLiteral())
      ) {
        console.warn(
          `to开发者：${nodePath.get(
            "key"
          )}出现非(Identifier | Literal)的异常情况，请排查！`
        );
      }
      // 处理Page({test(){}})
      if (nodePath.isObjectMethod()) {
        if (PageParamType[name] === "CALLFN") {
          pageParamDependArr.push(name);
          const newNode = createFnCallExpressionStatement(
            t.identifier(name),
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
          newNodeArr.push(getCompositionNodeFromProperties(nodePath, scope));
        }
      }
      // 处理Page({test:xxx})
      else if (nodePath.isObjectProperty()) {
        // 处理Page({test: function () {}})
        if (item.value.type === "FunctionExpression") {
          if (PageParamType[name] === "CALLFN") {
            pageParamDependArr.push(name);
            const newNode = createFnCallExpressionStatement(
              t.identifier(name),
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
            newNodeArr.push(getCompositionNodeFromProperties(nodePath, scope));
          }
        }
        // 处理Page({test:()=>{}})
        else if (item.value.type === "ArrowFunctionExpression") {
          if (PageParamType[name] === "CALLFN") {
            pageParamDependArr.push(name);
            const newNode = createFnCallExpressionStatement(
              t.identifier(name),
              {
                params: item.value.params,
                body: item.value.body,
                async: item.value.async,
              },
              true
            );
            newNodeArr.push(newNode);
          } else {
            newNodeArr.push(getCompositionNodeFromProperties(nodePath, scope));
          }
        }
        // 处理Page({data:{}})
        else if (item.value.type === "ObjectExpression") {
          // 处理data数据
          if (PageParamType[name] === "REACTIVE") {
            // 引入依赖
            let program = scope.getProgramParent().path;
            let dependency = createImportDeclaration(["reactive"], "vue");
            program.node.body.unshift(dependency);
            // 创建reactive
            let reactiveNode = creatReactive(item.value);
            newNodeArr.unshift(reactiveNode);
          }
          // 处理Page({test:any})
          else {
            newNodeArr.push(getCompositionNodeFromProperties(nodePath, scope));
          }
        }
        // 其他未考虑到的情况（暂定为赋值）
        else {
          newNodeArr.push(getCompositionNodeFromProperties(nodePath, scope));
        }
      } else {
        console.warn(
          `to开发者：${nodePath.toString()}出现未考虑到的情况，请排查！`
        );
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
          let pageInstancePath = getPageTypeInstancePath(programPath, "Page");
          if (!pageInstancePath) {
            // throw new Error("get Page instance error");
            console.warn("to用户：get Page instance error");
            // debugger;
          }
          // 将全局作用域中冲突的已有的申明进行重新命名，为关键词转换为组合API腾出标识符
          let pageInstancePropArr = pageInstancePath
            ? pageInstancePath.get("properties").map((nodePath) => {
                return nodePath.node.key.name || nodePath.node.key.value;
              })
            : [];
          let allThisProps = getAllThisProps(programPath);
          renameDeclarationKeyWord(
            programPath,
            pageInstancePropArr,
            allThisProps
          );
          // 转换全局对象关键词
          transGlobalsMap(programPath);
          // 处理getApp()表达式
          transGetAppCallExpression(programPath);
          if (pageInstancePath) {
            // 处理this表达式
            transFnCallThisExpression(pageInstancePath);
            // 申明this的属性变量
            decarePromvariables(programPath,Object.keys(allThisProps))
            // 将Page的对象API转换为funciton组合API
            let newNodeArr = transOptions2Composition(
              pageInstancePath,
              programPath.scope
            );
            pageInstancePath.parentPath.parentPath.replaceWithMultiple(
              newNodeArr
            );
          }
        },
        exit(programPath) {},
      },
    },
    post(file) {},
  };
});

module.exports = plugin;
