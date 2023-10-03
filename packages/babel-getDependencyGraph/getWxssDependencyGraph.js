const postcss = require("postcss");
const fs = require("fs-extra");
const path = require("path");

function getWxssDependencyGraph(wxssFielPath) {
  return new Promise((resolve, reject) => {
    let wxssSourceCode = "";
    try {
      wxssSourceCode = fs.readFileSync(wxssFielPath, "utf8");
    } catch (error) {}
    let dependencyList = {};
    // postcss([precss, autoprefixer])
    //   .process(wxssSourceCode)
    //   .then((result) => {
    //     console.log(result);
    //   });
    let ast = {};
    try {
      ast = postcss.parse(wxssSourceCode);
    } catch (error) {
      ast = postcss.parse("");
      console.warn(`to用户：${wxssFielPath}解析失败，请确认是否存在语法错误！`);
    }
    ast.nodes.forEach((node) => {
      parseNode(node, dependencyList);
    });
    // 相对路径转换为绝对路径
    let newDependencyList = {};
    for (let relaPath in dependencyList) {
      if (relaPath.indexOf("./") === 0 || relaPath.indexOf("../") === 0) {
        const idParse = path.parse(wxssFielPath);
        let newPath = path.resolve(idParse.dir, relaPath);
        // newPath = path.resolve(
        //   path.parse(newPath).dir,
        //   "./" + path.parse(newPath).name
        // );
        newDependencyList[newPath] = {
          path: newPath,
          type: dependencyList[relaPath].type,
        };
      }
    }
    resolve(newDependencyList);
  });
}

function parseNode(node, dependencyList) {
  if (Array.isArray(node.nodes) && node.nodes.length > 0) {
    node.nodes.forEach((node) => {
      parseNode(node, dependencyList);
    });
  } else {
    if (node.prop === "background") {
      let result = new RegExp(/\(.*?\)/g).exec(node.value);
      if (result && result[0]) {
        let filePath = result[0].replace(/'|"/gi, "").replace(/^\(|\)$/gi, "");
        if (filePath) {
          dependencyList[filePath] = {
            path: filePath,
            type: "File",
          };
        }
      }
    }
  }
}

// getWxssDependencyGraph(`background: url(./img1.png);width:100px;`);
// getWxssDependencyGraph(`// Autoprefixer 处理前的CSS样式
// .container {
//     display: flex;
// }
// .item {
//     flex: 1;
// }

// // Autoprefixer 处理后的CSS样式
// .container {
//   display: -webkit-box;
//   display: -webkit-flex;
//   display: -ms-flexbox;
//   display: flex;
// }
// .item {
//   -webkit-box-flex: 1;
//   -webkit-flex: 1;
//   -ms-flex: 1;
//   flex: 1;
// }`);

// getWxssDependencyGraph(
//   `D:/jacksplwxy/git/miniprogram-to-vue3/examples/minipro2uniapp/weapp-wechat-zhihu-master/pages/answer/answer.wxss`
// );

module.exports = {
  getWxssDependencyGraph,
};
