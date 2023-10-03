const fs = require("fs");
const path = require("path");
const { transformFromAstSync } = require("@babel/core");
const parser = require("@babel/parser");
const babelPresetEsm = require("../packages/babel-preset-esm");
const { isFile } = require("../packages/common/utils-base/file");

function generateEsm(filePath) {
  return new Promise((resolve, reject) => {
    console.info(`当前正在翻译：${filePath}`)
    if (isFile(filePath)) {
      const sourceCode = fs.readFileSync(filePath, "utf8");
      const ast = parser.parse(sourceCode, {
        sourceType: "unambiguous",
        plugins: ["jsx"],
      });
      const { code } = transformFromAstSync(ast, sourceCode, {
        presets: [[babelPresetEsm, {}]],
      });
      resolve(code, filePath);
    } else {
      reject();
      throw new Error("请输入正确的js文件路径");
    }
  });
}

module.exports = { generateEsm };
