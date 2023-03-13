const fs = require("fs");
const path = require("path");
const { transformFromAstSync } = require("@babel/core");
const parser = require("@babel/parser");
const babelPresetApp = require("../packages/babel-preset-app/index");
const { isFile } = require("../packages/common/utils-base/file");

function generateAppvue(path) {
  return new Promise((resolve, reject) => {
    if (isFile(path)) {
      const sourceCode = fs.readFileSync(path, "utf8");
      const ast = parser.parse(sourceCode, {
        sourceType: "unambiguous",
        plugins: ["jsx"],
      });
      const { code } = transformFromAstSync(ast, sourceCode, {
        presets: [[babelPresetApp, {}]],
      });
      resolve(code, path);
    } else {
      reject();
      throw new Error("请输入正确的app.js路径");
    }
  });
}

module.exports = { generateAppvue };
