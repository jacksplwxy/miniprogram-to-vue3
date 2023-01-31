const require2import = require("../babel-plugin-cmj2esm/index");
const options2composition_component = require("../babel-plugin-options2composition-component");
const var2let = require("../babel-plugin-var2let");

function preset(api, options) {
  return {
    plugins: [
      var2let,
      [require2import, { needExportDefault: false }],
      options2composition_component,
    ],
    presets: [],
  };
}

module.exports = preset;
