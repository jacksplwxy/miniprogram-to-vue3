const fs = require("fs");

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

module.exports = {
  createFile,
};
