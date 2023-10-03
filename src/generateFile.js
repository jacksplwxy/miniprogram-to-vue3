const fs = require("fs");
const path = require("path");
const { isFile } = require("../packages/common/utils-base/file");

function generateFile(filePath) {
  return new Promise((resolve, reject) => {
    console.info(`当前正在翻译：${filePath}`)
    if (isFile(filePath)) {
      resolve(filePath);
    } else {
      reject();
      throw new Error("请输入正确的js文件路径");
    }
  });
}

module.exports = { generateFile };
