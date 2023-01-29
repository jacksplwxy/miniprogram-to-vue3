const { declare } = require("@babel/helper-plugin-utils");
const t = require("@babel/types");

const plugin = declare((api, options) => {
  api.assertVersion(7);
  return {
    visitor: {
      VariableDeclaration(path) {
        if (path.get("kind").node === "var") {
          path.node.kind = "let";
        }
      },
    },
  };
});
module.exports = plugin;
