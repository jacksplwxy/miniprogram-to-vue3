const fs = require("fs");
const path = require("path");
const { transformFromAstSync } = require("@babel/core");
const parser = require("@babel/parser");
const babelPresetRegisterGlobalComponent = require("../../packages/babel-preset-registerGlobalComponent/index");

const sourceCode = fs.readFileSync(
  path.resolve(__dirname, "./sourceCode.js"),
  "utf8"
);

const ast = parser.parse(sourceCode, {
  sourceType: "unambiguous",
  plugins: ["jsx"],
});

const { code } = transformFromAstSync(ast, sourceCode, {
  presets: [[babelPresetRegisterGlobalComponent, {"usingComponents": {
    "modal":"pages/components/modal/modal",
    "gio-marke": "utils/gio-minp/components/gio-marketing/gio-marketing"
}}]],
});

console.log(code);
fs.writeFileSync(path.resolve(__dirname, "./targetCode.js"), code, "utf8");
