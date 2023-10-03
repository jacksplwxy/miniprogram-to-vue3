const { isFile } = require("../common/utils-base/file");
const path = require("path");
const posthtml = require("posthtml");
const postcss = require("postcss");
const { getJsDependencyGraph } = require("./getJsDependencyGraph");
const { getWxmlDependencyGraph } = require("./getWxmlDependencyGraph");
const { getWxssDependencyGraph } = require("./getWxssDependencyGraph");
const fs = require("fs");

/**
 * 1、此处不能只做js依赖分析，应当做Page/Component依赖分析
 * 2、入口为app.json的pages、subPackages、usingComponents，按深度优先进行遍历，依赖收集的数据结构：
 * 路径:{
 *  path:'xx',  //绝对路径（Vue不带后缀名,其他文件带后缀名）
 *  type:'' // 3种类型：Vue表示是页面或组件类型；另一个是Js类型,表示为普通js类型;还有一种是File，例如图片、css等静态资源
 * }
 * 3、依赖收集的依据：1、入口进去的页面的都为Vue类型；2、检查同名json文件，usingComponents下的都为Vue类型；3、页面中import或require的都为普通js文件或静态资源；4、诸如<img src="...">、background: url(...) 和CSS@import的资源URL都会被解析为一个模块依赖（https://blog.csdn.net/m0_68036862/article/details/127640668）5：require.context引入的批量图片
 * 4、数据收集以列表的形式整合，同绝对路径名的文件则直接丢弃。再遍历列表，将目标代码以文件形式生成出来。都放置在项目根目录并列的新建类名文件夹下
 */
async function getDependencyGraph(appJsonSourceCode, inputPath) {
  return new Promise(async (resolve) => {
    let vueDependencyList = {};
    let allDependencyList = {};
    let pages = appJsonSourceCode.pages || [];
    let subPackages = appJsonSourceCode.subPackages || [];
    let usingComponents = [];
    if (appJsonSourceCode.usingComponents) {
      usingComponents = Object.keys(appJsonSourceCode.usingComponents).map(
        (item) => {
          return appJsonSourceCode.usingComponents[item];
        }
      );
    }

    pages
      .concat(
        subPackages.map((item) => {
          return item.pages.map((subPackagesItem) => {
            return (item.root + "/" + subPackagesItem).replace(/\/\//g, "/");
          });
        }),
        usingComponents
      )
      .flat()
      .forEach((pagePath, index) => {
        let filePath = path.resolve(inputPath, pagePath);
        if (isFile(filePath + ".wxml")) {
          // 收集依赖
          getVueDependencyGraph(filePath, vueDependencyList);
        } else {
          throw new Error(`请确认${filePath + ".wxml"}路径是否存在？`);
        }
      });
    for (let filePath in vueDependencyList) {
      await collectionDependency(filePath, allDependencyList);
    }

    resolve(allDependencyList);
  });
}

// 获取Vue级别的依赖图
function getVueDependencyGraph(filePath, dependencyList) {
  // 读取文件内容
  let jsonFielPath = filePath + ".json";
  let jsonSourceCode = "";
  try {
    jsonSourceCode = fs.readFileSync(jsonFielPath, "utf8");
  } catch (error) {}
  // 收集当前文件的依赖
  dependencyList[filePath] = {
    path: filePath,
    type: "Vue",
  };

  // 收集json中的依赖
  if (
    jsonSourceCode.usingComponents &&
    Object.keys(jsonSourceCode.usingComponents).length > 0
  ) {
    for (let key in jsonSourceCode.usingComponents) {
      let compPath = jsonSourceCode.usingComponents[key];
      if (compPath.indexOf("./") === 0 || compPath.indexOf("../") === 0) {
        compPath = path.resolve(filePath, jsonSourceCode.usingComponents[key]);
      }
      getVueDependencyGraph(compPath, dependencyList);
    }
  }
}

async function collectionDependency(filePath, dependencyList) {
  // 收集当前文件的依赖
  dependencyList[filePath] = {
    path: filePath,
    type: "Vue",
  };

  // 读取文件内容
  let wxmlFilePath = filePath + ".wxml";
  let wxssFielPath = filePath + ".wxss";
  let jsFielPath = filePath + ".js";

  // 收集wxml文件中的File依赖
  if (isFile(wxmlFilePath)) {
    let wxmlDependency = await getWxmlDependencyGraph(wxmlFilePath);
    Object.assign(dependencyList, wxmlDependency);
  }

  // 收集wxss文件中的File依赖
  if (isFile(wxssFielPath)) {
    let wxssDependency = await getWxssDependencyGraph(wxssFielPath);
    Object.assign(dependencyList, wxssDependency);
  }

  // 收集js文件中的所有依赖
  if (isFile(jsFielPath)) {
    let allModules = {};
    try {
      allModules = getJsDependencyGraph(jsFielPath).allModules;
      // console.warn(
      //   "to开发者：报错，临时注释上面代码，极有可能是引入了第三方依赖未正确处理"
      // );
    } catch (error) {}
    let jsDependency = {};
    for (let path in allModules) {
      if (path.replace(/\//gi, "\\") !== jsFielPath.replace(/\//gi, "\\")) {
        jsDependency[path] = {
          path: path,
          type: "Js",
        };
      }
    }
    Object.assign(dependencyList, jsDependency);
  }
}
module.exports = {
  getDependencyGraph,
};
