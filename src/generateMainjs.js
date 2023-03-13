const fs = require("fs");
const path = require("path");
const { transformFromAstSync } = require("@babel/core");
const parser = require("@babel/parser");
const babelPresetRegisterGlobalComponent = require("../packages/babel-preset-registerGlobalComponent/index");
const { isFile } = require("../packages/common/utils-base/file");

function generateMainjs(path, usingComponents) {
  return new Promise((resolve, reject) => {
    if (isFile(path)) {
      const sourceCode = fs.readFileSync(path, "utf8");
      const ast = parser.parse(sourceCode, {
        sourceType: "unambiguous",
        plugins: ["jsx"],
      });
      const { code } = transformFromAstSync(ast, sourceCode, {
        presets: [[babelPresetRegisterGlobalComponent, { usingComponents }]],
      });
      resolve(code, path);
    } else {
      reject();
      throw new Error("请输入正确的main.js路径");
    }
  });
}
module.exports = { generateMainjs };
