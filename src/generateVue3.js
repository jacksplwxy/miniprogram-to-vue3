// 读取文件夹，并翻译程序
const fs = require("fs");
const path = require("path");
const { isFile } = require("../packages/common/utils-base/file");
const posthtml = require("posthtml");
const render = require("posthtml-render");
const posthtmlWxml2unitemplate = require("../packages/posthtml-wxml2unitemplate/index");
const { transformFromAstSync } = require("@babel/core");
const parser = require("@babel/parser");
const babelPresetPage = require("../packages/babel-preset-page/index");
const babelPresetComponent = require("../packages/babel-preset-component/index");

/**
 * 翻译一个小程序文件夹下的文件为vue3
 * @param {*} filePath 不带后缀的文件路径
 * @returns
 */
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

      // 翻译wxml文件
      targetCode +=
        `<template>\n` +
        (await transWxml(wxmlFielPath, jsFielPath)) +
        `\n</template>`;
      // 翻译js文件
      targetCode +=
        `\n<script setup>\n` +
        (await transJs(jsFielPath, await getPageType(jsonFielPath))) +
        `\n</script>`;
      // 翻译wxss文件
      targetCode +=
        `\n<style scoped>\n` + (await transWxss(wxssFielPath)) + `\n</style>`;

      resolve(targetCode, filePath);
    } else {
      reject();
      throw new Error("请输入正确的小程序文件路径");
    }
  });
}

// 翻译wxss
function getPageType(jsonFielPath) {
  return new Promise((resolve, reject) => {
    let jsonSourceCode = "";
    try {
      jsonSourceCode = fs.readFileSync(jsonFielPath, "utf8");
      jsonSourceCode = JSON.parse(jsonSourceCode);
    } catch (error) {
      jsonSourceCode = {};
    }
    let pageType = "Page";
    if (jsonSourceCode && jsonSourceCode.component === true) {
      pageType = "Component";
    }
    resolve(pageType);
  });
}

// 翻译wxml
function transWxml(wxmlFielPath, jsFielPath) {
  return new Promise((resolve, reject) => {
    console.info(`当前正在翻译：${wxmlFielPath}`);
    let wxmlSourceCode = "";
    try {
      wxmlSourceCode = fs.readFileSync(wxmlFielPath, "utf8");
    } catch (error) {}
    let jsSourceCode = "";
    try {
      jsSourceCode = fs.readFileSync(jsFielPath, "utf8");
    } catch (error) {}
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
function transJs(jsFielPath, pageType) {
  return new Promise((resolve, reject) => {
    console.info(`当前正在翻译：${jsFielPath}`);
    let jsSourceCode = "";
    try {
      jsSourceCode = fs.readFileSync(jsFielPath, "utf8");
    } catch (error) {}
    let ast = parser.parse(jsSourceCode, {
      sourceType: "unambiguous",
      plugins: ["jsx"],
    });
    let babelPresetVue =
      pageType === "Component" ? babelPresetComponent : babelPresetPage;
    let { code } = transformFromAstSync(ast, jsSourceCode, {
      presets: [[babelPresetVue, {}]],
    });
    resolve(code);
  });
}

// 翻译wxss
function transWxss(wxssFielPath) {
  return new Promise((resolve, reject) => {
    console.info(`当前正在翻译：${wxssFielPath}`);
    let code = "";
    try {
      code = fs.readFileSync(wxssFielPath, "utf8");
    } catch (error) {}
    resolve(code);
  });
}

module.exports = {
  generateVue3,
};
