const { parser } = require("posthtml-parser");
const postcss = require("postcss");
const fs = require("fs-extra");
const path = require("path");

function getWxmlDependencyGraph(wxmlFilePath) {
  return new Promise((resolve, reject) => {
    let wxmlSourceCode = "";
    try {
      wxmlSourceCode = fs.readFileSync(wxmlFilePath, "utf8");
    } catch (error) {}
    let dependencyList = {};
    let ast = parser(wxmlSourceCode);
    ast.forEach((node) => {
      parseNode(node, dependencyList);
    });
    // 相对路径转换为绝对路径
    let newDependencyList = {};
    for (let relaPath in dependencyList) {
      if (relaPath.indexOf("./") === 0 || relaPath.indexOf("../") === 0) {
        const idParse = path.parse(wxmlFilePath);
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
  if (typeof node === "object") {
    let attrs = node.attrs;
    if (node.tag === "image" && attrs) {
      for (let key in attrs) {
        if (key === "src") {
          if (!/{{.*}}/g.test(attrs[key])) {
            let filePath = attrs[key];
            dependencyList[filePath] = {
              path: filePath,
              type: "File",
            };
          }
        }
      }
    }
    if (attrs) {
      for (let key in attrs) {
        if (key === "style" && !/{{.*}}/g.test(attrs[key])) {
          let ast = {};
          try {
            ast = postcss.parse(attrs[key]);
          } catch (error) {
            ast = postcss.parse('');
            console.warn(`to用户：${attrs[key]}解析失败，请确认是否存在语法错误！`)
          }
          if (Array.isArray(ast.nodes)) {
            ast.nodes.forEach((item) => {
              if (item.prop === "background") {
                let result = new RegExp(/\(.*?\)/g).exec(node.value);
                if (result && result[0]) {
                  let filePath = result[0]
                    .replace(/'|"/gi, "")
                    .replace(/^\(|\)$/gi, "");
                  if (filePath) {
                    dependencyList[filePath] = {
                      path: filePath,
                      type: "File",
                    };
                  }
                }
              }
            });
          }
        }
      }
    }
    if (Array.isArray(node.content)) {
      node.content.forEach((node) => {
        parseNode(node, dependencyList);
      });
    }
  }
}

// getWxmlDependencyGraph(` <view class="notice-left" bindtap="goNoticeMore">
// <view class="left-more" style="background: url(./img1.png);width:100px;">更多</view>
// <image class="left-img" src="../../images/luggage-icon-arrowright@3x.png"></image>
// </view>`);

// getWxmlDependencyGraph(
//   `D:/jacksplwxy/git/company/wxminiprogram/WX_MINPROGRAM/pages/bagServer/bagSearch/bagdetail/bagdetail.wxml`
// );

module.exports = {
  getWxmlDependencyGraph,
};
