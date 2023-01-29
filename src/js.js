const fs = require("fs");
const path = require("path");
const { transformFromAstSync } = require("@babel/core");
const parser = require("@babel/parser");
const babelPresetJs = require("../packages/babel-preset-js");

// 将文件夹下所有js文件由commonjs模块转换es模块
async function generateEsmFile(folderPath) {
  fs.readdir(folderPath, function (err, files) {
    if (err) {
      return console.error(err);
    }
    files.forEach(function (file) {
      console.log(file);
      cmj2esm(folderPath + "/" + file);
    });
  });
}

// 文件由commonjs模块转换es模块
function cmj2esm(filePath) {
  const sourceCode = fs.readFileSync(filePath, "utf8");

  const ast = parser.parse(sourceCode, {
    sourceType: "unambiguous",
    plugins: ["jsx"],
  });

  const { code } = transformFromAstSync(ast, sourceCode, {
    presets: [[babelPresetJs, {}]],
  });
  fs.writeFileSync(filePath, code, "utf8");
}

// 执行翻译程序
generateEsmFile(process.argv[2]);
