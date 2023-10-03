const cmj2esm = require("../babel-plugin-cmj2esm/index");
const var2let = require("../babel-plugin-var2let");

function preset(api, options) {
  return {
    plugins: [ [cmj2esm, { needExportDefault: true }],var2let],
    presets: [],
  };
}

module.exports = preset;
