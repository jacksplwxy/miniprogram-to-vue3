const { traverseModule } = require("../../packages/babel-traverseModule/traverseModule");
const path = require("path");
const fs = require("fs");

const dependencyGraph = traverseModule(
  path.resolve(__dirname, "./test-project/index.js")
);
console.log(JSON.stringify(dependencyGraph, null, 4));
fs.writeFileSync(
  path.resolve(__dirname, "./moduleListResult.json"),
  JSON.stringify(dependencyGraph, null, 4),
  "utf8"
);
