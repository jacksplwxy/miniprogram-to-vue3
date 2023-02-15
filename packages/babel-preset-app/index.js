const require2import = require("../babel-plugin-cmj2esm/index");
const options2options_app = require("../babel-plugin-options2options-app");
const var2let = require("../babel-plugin-var2let");

function preset(api, options) {
  return {
    plugins: [
      var2let,
      [require2import, { needExportDefault: false }],
      options2options_app,
    ],
    presets: [],
  };
}

module.exports = preset;
