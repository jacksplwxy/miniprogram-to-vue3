const fs = require("fs");
const fse = require("fs-extra");
const { formatDate } = require("./time");

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
  } catch (e) {
    return false
  }
}

// 更新文件（没有则会创建），路径缺少目录的自动创建目录
function createFile(filePath, data) {
  const dirCache = {};
  function writeFileByUser(filePath) {
    if (fs.existsSync(filePath)) {
    } else {
      mkdir(filePath);
    }
    fs.appendFile(filePath, data, "utf8", function (err) {
      if (err) {
        console.log(err);
      } else {
      }
    });
  }
  function mkdir(filePath) {
    const arr = filePath.split("/");
    let dir = arr[0];
    for (let i = 1; i < arr.length; i++) {
      if (!dirCache[dir] && !fs.existsSync(dir)) {
        dirCache[dir] = true;
        fs.mkdirSync(dir);
      }
      dir = dir + "/" + arr[i];
    }
    fs.writeFileSync(filePath, "");
  }
  writeFileByUser(filePath);
}

// 判断文件夹名是否存在（该方法可以被fs.existsSync替代）
function isDirectoryExist(path) {
  let result = fs.existsSync(path);
  return result;
}

// 根据当前文件夹路径获得一个新文件夹名=旧文件夹名+"时间"
function getNewDirectoryName(path) {
  const Postfix = "_" + formatDate(new Date().getTime());
  let newDirectory = path + Postfix;
  if (isDirectoryExist(newDirectory)) {
    return getNewDirectoryName(newDirectory);
  }
  return newDirectory;
}

module.exports = {
  isDirectory,
  isFile,
  createFile,
  isDirectoryExist,
  getNewDirectoryName,
};
