const registerGlobalComponent = require("../babel-plugin-registerGlobalComponent/index");


function preset(api,usingComponents) {
  return {
    plugins: [[registerGlobalComponent, { usingComponents }]],
    presets: [],
  };
}

module.exports = preset;
