// 读取文件夹，并翻译程序
const fs = require("fs");
const path = require("path");
const posthtml = require("posthtml");
const render = require("posthtml-render");
const posthtmlWxml2unitemplate = require("../packages/posthtml-wxml2unitemplate/index");
const { transformFromAstSync } = require("@babel/core");
const parser = require("@babel/parser");
const babelPresetPage = require("../packages/babel-preset-page/index");

// 是否是文件
function isFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (e) {}
  return false;
}

// 翻译一个小程序文件夹下的文件为vue3
function generateVue3(filePath) {
  return new Promise(async (resolve, reject) => {
    if (isFile(filePath + ".wxml")) {
      // 目标code
      let targetCode = "";

      // 读取文件内容
      let jsonFielPath = filePath + ".json";
      let wxmlFielPath = filePath + ".wxml";
      let jsFielPath = filePath + ".js";
      let wxssFielPath = filePath + ".wxss";
      let jsonSourceCode = "";
      try {
        jsonSourceCode = fs.readFileSync(jsonFielPath, "utf8");
      } catch (error) {}
      let wxmlSourceCode = "";
      try {
        wxmlSourceCode = fs.readFileSync(wxmlFielPath, "utf8");
      } catch (error) {}
      let jsSourceCode = "";
      try {
        jsSourceCode = fs.readFileSync(jsFielPath, "utf8");
      } catch (error) {}
      let wxssSourceCode = "";
      try {
        wxssSourceCode = fs.readFileSync(wxssFielPath, "utf8");
      } catch (error) {}
      // 判断是Page还是Component
      let pageType = "Page";
      if (jsonSourceCode && jsonSourceCode.component === true) {
        pageType = "Component";
      }
      // 翻译wxml文件
      targetCode +=
        `<template>\n` +
        (await transWxml(wxmlSourceCode, jsSourceCode)) +
        `\n</template>`;
      // 翻译js文件
      targetCode +=
        `\n<script setup>\n` + (await transJs(jsSourceCode)) + `\n</script>`;
      // 翻译wxss文件
      targetCode += `\n<style>\n` + wxssSourceCode + `\n</style>`;

      resolve(targetCode, filePath);
    } else {
      reject();
      throw new Error("请输入正确的小程序文件路径");
    }
  });
}

// 翻译wxml
function transWxml(wxmlSourceCode, jsSourceCode) {
  return new Promise((resolve, reject) => {
    posthtml([posthtmlWxml2unitemplate(jsSourceCode, {})])
      //   .use((tree) => {
      //     return { tag: "template", content: tree };
      //   })
      .process(wxmlSourceCode, {
        render: (tree) => {
          return render.render(tree, { replaceQuote: false }); //replaceQuote默认为true时："" → &quot;&quot
        },
      })
      .then((result) => resolve(result.html))
      .catch((err) => {
        reject(err);
      });
  });
}

// 翻译js
function transJs(jsSourceCode) {
  return new Promise((resolve, reject) => {
    let ast = parser.parse(jsSourceCode, {
      sourceType: "unambiguous",
      plugins: ["jsx"],
    });
    let { code } = transformFromAstSync(ast, jsSourceCode, {
      presets: [[babelPresetPage, {}]],
    });
    resolve(code);
  });
}



module.exports = {
  generateVue3,
};
