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
  creatDefineProps,
  pathFatherScopeIsPro,
  transSetData,
  transGetAppCallExpression,
  transFnCallThisExpression,
  getCompositionNodeFromProperties,
  getAllThisProps,
  decarePromvariables,
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
    properties: "PROPS",
    data: "REACTIVE",
    observers: "WATCH",
    methods: "METHODS",
    behaviors: "MIXINS",
    created: "CALLFN",
    attached: "CALLFN",
    ready: "CALLFN",
    moved: "CALLFN",
    detached: "CALLFN",
    error: "CALLFN",
    relations: "RELATIONS",
    externalClasses: "EXTERNALCLASSES",
    options: "OPTIONS",
    lifetimes: "LIFETIMES",
    pageLifetimes: "PAGELIFETIMES",
    show: "PAGELIFETIMES-SHOW",
    hide: "CALLFN-PAGELIFETIMES-SHOW",
    resize: "CALLFN-PAGELIFETIMES-SHOW",
  };

  // PageLifetimes中生命周期转换关系
  const PageLifetimesMap = {
    show: "onShow",
    hide: "onHide",
    resize: "onResize",
  };

  // 获取Component中lifetimes、pageLifetimes、methods下的属性列表
  function getInstanceSpecKeyPropsArr(componentInstancePath) {
    let arr = [];
    componentInstancePath.get("properties").forEach((nodePath) => {
      let name = nodePath.node.key.name || nodePath.node.key.value;
      switch (name) {
        case "lifetimes":
          // 存入ComponentParamType中了，不再处理
          break;
        case "pageLifetimes":
          // 存入ComponentParamType中了，不再处理
          break;
        case "methods":
          if (nodePath.get("value").isObjectExpression()) {
            nodePath
              .get("value")
              .get("properties")
              .forEach((nodePath) => {
                arr.push(nodePath.node.key.name || nodePath.node.key.value);
              });
          } else {
            console.warn(
              `to开发者：此处${nodePath.toString()}出现未考虑到情况，请完善！`
            );
          }
          break;
      }
    });
    return arr;
  }

  /**
   * 如果作用域中存在对关键词（配置项关键词、Component参数、This（指向Page、Component、App）的属性、全局对象关键词（映射后的））的声明，则重命名这些声明，避免与关键词冲突
   * @param {*} path
   * @param {*} componentInstancePropArr Component的直接属性
   * @param {*} componentInstancePropArr Component的特殊属性下的属性
   */
  function renameDeclarationKeyWord(
    path,
    componentInstancePropArr,
    instanceSpecKeyPropsArr,
    getAllThisProps
  ) {
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
    // 收集关键词：Component预设参数类型
    for (let key in ComponentParamType) {
      newBindingList[key] = true;
    }
    // 收集关键词：Component实际参数和特殊属性下的参数
    [...componentInstancePropArr, ...instanceSpecKeyPropsArr].forEach((key) => {
      newBindingList[key] = true;
    });
    // 收集关键词：This（指向Page、Component、App）的属性
    newBindingList = { ...newBindingList, ...getAllThisProps };

    // 声明重命名
    setScopeBindingUnique(path.scope, newBindingList);
  }

  // 将小程序props转换vue3格式
  function transProps(objectExpressionPath) {
    let propertiesPath = objectExpressionPath.get("properties");
    propertiesPath = propertiesPath.map((objectPropertyPath) => {
      let optionalTypesArr = [];
      let objectPropertyValPath = objectPropertyPath.get("value");
      if (objectPropertyValPath.isObjectExpression()) {
        let propertiesArr = objectPropertyValPath.get("properties");
        if (!Array.isArray(propertiesArr)) {
          console.warn(
            `to开发者：${objectPropertyPath
              .get("value")
              .toString()}出现异常，请排查！`
          );
          propertiesArr = [];
        }
        propertiesArr.forEach((itemPath) => {
          const optionalTypesKeyWord = "optionalTypes";
          const observerKeyWord = "observer";
          // 存在optionalTypes
          if (itemPath.get("key").node.name === optionalTypesKeyWord) {
            // 将多个类型合并到type中
            optionalTypesArr = itemPath.get("value").get("elements");
            objectPropertyPath
              .get("value")
              .get("properties")
              .some((itemPathInner) => {
                const typeKeyWord = "type";
                if (itemPathInner.get("key").node.name === typeKeyWord) {
                  optionalTypesArr.push(itemPathInner.get("value"));
                  itemPathInner.get("value").replaceWith(
                    t.arrayExpression(
                      optionalTypesArr.map((item) => {
                        return item.node;
                      })
                    )
                  );
                  return true;
                }
              });
            itemPath.remove();
            return true;
          }
          //如果存在observer
          else if (itemPath.get("key").node.name === observerKeyWord) {
            console.warn(
              "to开发者：为实现properties的observer属性转换，请完善！"
            );
            console.warn(
              "to用户：暂不支持properties的observer属性转换，请手工移入watch监听器中"
            );
          } else {
            // xxx: 0这种情况，不进行处理
          }
        });
      } else if (objectPropertyValPath.isIdentifier()) {
        // xxx: String这种情况，不进行处理
      } else if (objectPropertyValPath.isLiteral()) {
        // xxx: 123这种情况，不进行处理
      } else {
        console.warn(
          `to开发者：存在未处理的情况：${objectPropertyPath.toString()}`
        );
      }
      return objectPropertyPath;
    });
    let properties = propertiesPath.map((item) => {
      return item.node;
    });
    return t.objectExpression(properties);
  }

  // 将小程序Observers转换vue3格式
  function transObservers(objectExpressionPath) {
    let newNodes = [];
    //将xx(){} → watch([name, age],([name, age])=>{})
    let propertiesPath = objectExpressionPath.get("properties");
    propertiesPath.forEach((objectPropertyPath) => {
      let arguments = [];
      let argument1 = t.arrayExpression(
        objectPropertyPath
          .get("key")
          .node.value.split(",")
          .map((name) => {
            return t.identifier(name);
          })
      );
      arguments.push(argument1);
      let argument2;
      if (objectPropertyPath.isObjectProperty()) {
        argument2 = objectPropertyPath.get("value").node;
      } else if (objectPropertyPath.isObjectMethod()) {
        let node = objectPropertyPath.node;
        argument2 = t.functionExpression(
          t.identifier(node.key.value),
          node.params,
          node.body,
          node.generator,
          node.async
        );
      } else {
        console.log("此处存在未处理的情况", objectPropertyPath);
      }
      arguments.push(argument2);
      let fnCallExpStmt = t.expressionStatement(
        t.callExpression(t.identifier(config.vue3Api.watchKeyWord), arguments)
      );
      newNodes.push(fnCallExpStmt);
    });
    return newNodes;
  }

  // 拿到lifetimes中的声明的生命周期数组
  function getLifetimesDela(properties) {
    let array = [];
    properties.some((path) => {
      let name = path.node.key.name || path.node.key.value;
      if (path.isObjectProperty() && ComponentParamType[name] === "LIFETIMES") {
        path
          .get("value")
          .get("properties")
          .forEach((objProPath) => {
            array.push(objProPath.node.key.name || objProPath.node.key.value);
          });
        return true;
      }
    });
    return array;
  }

  /**
   * 将option选项API转换为composition组合API
   * @param {*} ObjectExpressionPath
   * @param {*} scope 转换到的作用域
   * @returns
   */
  function transOptions2Composition(ObjectExpressionPath, scope) {
    let newNodeArr = [];
    let componentParamDependArr = [];
    let lifeTimesArr = getLifetimesDela(ObjectExpressionPath.get("properties"));
    ObjectExpressionPath.get("properties").forEach((nodePath) => {
      let item = nodePath.node;
      // ObjectProperty的key可能是Identifier | Literal
      let name = item.key.name || item.key.value;
      // 处理Component({test(){}})
      if (nodePath.isObjectMethod()) {
        if (ComponentParamType[name] === "CALLFN") {
          // 被lifetimes覆盖，不处理
          if (lifeTimesArr.includes(name)) {
            return;
          }
          componentParamDependArr.push(name);
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
      // 处理Component({test:xxx})
      else if (nodePath.isObjectProperty()) {
        // 处理Component({test: function () {}})
        if (item.value.type === "FunctionExpression") {
          if (ComponentParamType[name] === "CALLFN") {
            // 被lifetimes覆盖，不处理
            if (lifeTimesArr.includes(name)) {
              return;
            }
            componentParamDependArr.push(name);
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
        // 处理Component({test:()=>{}})
        else if (item.value.type === "ArrowFunctionExpression") {
          if (ComponentParamType[name] === "CALLFN") {
            // 被lifetimes覆盖，不处理
            if (lifeTimesArr.includes(name)) {
              return;
            }
            componentParamDependArr.push(name);
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
        // 处理Component({data:{}})
        else if (item.value.type === "ObjectExpression") {
          // 处理data数据
          if (ComponentParamType[name] === "REACTIVE") {
            // 引入依赖
            let program = scope.getProgramParent().path;
            let dependency = createImportDeclaration(["reactive"], "vue");
            program.node.body.unshift(dependency);
            // 创建reactive
            let reactiveNode = creatReactive(item.value);
            newNodeArr.unshift(reactiveNode);
          }
          // 处理Component({properties:{}})
          else if (ComponentParamType[name] === "PROPS") {
            // 创建defineProps
            let newNode = transProps(nodePath.get("value"));
            let propsNode = creatDefineProps(newNode);
            newNodeArr.push(propsNode);
          }
          // 处理Component({observers:{}})
          else if (ComponentParamType[name] === "WATCH") {
            // 引入依赖
            let program = scope.getProgramParent().path;
            let dependency = createImportDeclaration(
              [config.vue3Api.watchKeyWord],
              "vue"
            );
            program.node.body.unshift(dependency);
            let newNode = transObservers(nodePath.get("value"));
            newNodeArr.push(...newNode);
          }
          // 处理Component({lifetimes:{}})
          else if (ComponentParamType[name] === "LIFETIMES") {
            nodePath
              .get("value")
              .get("properties")
              .forEach((objectPropertyPath) => {
                let newNode = getCompositionNodeFromProperties(
                  objectPropertyPath,
                  scope
                );
                newNodeArr.push(newNode);
              });
          }
          // 处理Component({pageLifetimes:{}})
          else if (ComponentParamType[name] === "PAGELIFETIMES") {
            nodePath
              .get("value")
              .get("properties")
              .forEach((objectPropertyPath) => {
                let identifierName = objectPropertyPath.node.key.name;
                if (PageLifetimesMap[identifierName]) {
                  objectPropertyPath.node.key.name =
                    PageLifetimesMap[identifierName];
                }
                let stringLiteralName = objectPropertyPath.node.key.value;
                if (PageLifetimesMap[stringLiteralName]) {
                  objectPropertyPath.node.key.value =
                    PageLifetimesMap[stringLiteralName];
                }
                let newNode = getCompositionNodeFromProperties(
                  objectPropertyPath,
                  scope
                );
                newNodeArr.push(newNode);
              });
          }
          // 处理Component({methods:{}})
          else if (ComponentParamType[name] === "METHODS") {
            nodePath
              .get("value")
              .get("properties")
              .forEach((objectPropertyPath) => {
                let newNode = getCompositionNodeFromProperties(
                  objectPropertyPath,
                  scope
                );
                newNodeArr.push(newNode);
              });
          }
          // 处理Component({test:any})
          else {
            newNodeArr.push(getCompositionNodeFromProperties(nodePath, scope));
          }
        }
        //  处理Component({behaviors:[]})
        else if (
          item.value.type === "ArrayExpression" &&
          ComponentParamType[name] === "MIXINS"
        ) {
          console.warn(
            "to开发者和用户：behaviors可以翻译为vue中的 “mixins”，由于这是违背设计原则的特性，暂不处理"
          );
        }
        // 其他未考虑到的情况（暂定为赋值）
        else {
          newNodeArr.push(getCompositionNodeFromProperties(nodePath, scope));
        }
      } else {
        newNodeArr.push(getCompositionNodeFromProperties(nodePath, scope));
      }
    });
    // 引入依赖
    if (componentParamDependArr.length > 0) {
      let program = scope.getProgramParent().path;
      let dependency = createImportDeclaration(
        componentParamDependArr,
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
          // 获取Component入参对象的path
          let componentInstancePath = getPageTypeInstancePath(
            programPath,
            "Component"
          );
          if (!componentInstancePath) {
            // throw new Error("get Component instance error");
            console.warn("to用户：get Component instance error");
          }
          let allThisProps = getAllThisProps(programPath);
          // 将全局作用域中冲突的已有的申明进行重新命名，为关键词转换为组合API腾出标识符
          renameDeclarationKeyWord(
            programPath,
            componentInstancePath
              ? componentInstancePath.get("properties").map((nodePath) => {
                  return nodePath.node.key.name || nodePath.node.key.value;
                })
              : [],
            componentInstancePath
              ? getInstanceSpecKeyPropsArr(componentInstancePath)
              : [],
            allThisProps
          );
          // 转换全局对象关键词
          transGlobalsMap(programPath);
          // 处理getApp()表达式
          transGetAppCallExpression(programPath);
          if (componentInstancePath) {
            // 处理this表达式（包含了this.setData的处理）
            transFnCallThisExpression(componentInstancePath);
            // 申明this的属性变量
            decarePromvariables(programPath,Object.keys(allThisProps));
            // 将Component的对象API转换为funciton组合API
            let newNodeArr = transOptions2Composition(
              componentInstancePath,
              programPath.scope
            );
            componentInstancePath.parentPath.parentPath.replaceWithMultiple(
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
