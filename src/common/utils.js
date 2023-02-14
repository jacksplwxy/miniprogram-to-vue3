var fs = require("fs");
var path = require("path");

// 是否是文件夹
function isDirectory(path) {
  try {
    return fs.statSync(path).isDirectory();
  } catch (e) {}
  return false;
}

// 是否是文件
function isFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (e) {}
  return false;
}

module.exports = {
  isDirectory,
  isFile,
};
