const fs = require("fs");
const path = require("path");
const { transformFromAstSync } = require("@babel/core");
const parser = require("@babel/parser");
const babelPresetComponent = require("../../packages/babel-preset-component/index");

const sourceCode = fs.readFileSync(
  path.resolve(__dirname, "./sourceCode.js"),
  "utf8"
);

const ast = parser.parse(sourceCode, {
  sourceType: "unambiguous",
  plugins: ["jsx"],
});

const { code } = transformFromAstSync(ast, sourceCode, {
  presets: [[babelPresetComponent, {}]],
});

console.log(code);
fs.writeFileSync(path.resolve(__dirname, "./targetCode.js"), code, "utf8");
