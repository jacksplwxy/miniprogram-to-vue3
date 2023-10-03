const require2import = require("../babel-plugin-cmj2esm/index");
const options2composition_component = require("../babel-plugin-options2composition-component");
const var2let = require("../babel-plugin-var2let");

function preset(api, options) {
  return {
    plugins: [
      options2composition_component,
      var2let,
      [require2import, { needExportDefault: false }],
    ],
    presets: [],
  };
}

module.exports = preset;
