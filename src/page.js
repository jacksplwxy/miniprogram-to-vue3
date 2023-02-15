const fs = require("fs");
const { createFile } = require("../packages/common/utils-base/file");
const { generateVue3 } = require("./generateVue3");
const { isDirectory } = require("../packages/common/utils-base/file");

// 将app.json下的所有pages进行翻译，并存放在一个新文件夹下
function generateVue3Folder(jsonPath) {
  let jsonSourceCode = fs.readFileSync(jsonPath, "utf8");
  try {
    jsonSourceCode = JSON.parse(jsonSourceCode);
  } catch (error) {
    throw new Error("请确认文件内容满足json格式");
  }
  if (jsonSourceCode && Array.isArray(jsonSourceCode.pages)) {
    let rootPath = jsonPath.slice(0, jsonPath.lastIndexOf("/"));
    let dirPath = rootPath + `/pages_${formatDate(new Date().getTime())}`;
    fs.mkdirSync(dirPath);
    let totalNum = jsonSourceCode.pages.length;
    let finishNum = 0;
    let failNum = 0;
    jsonSourceCode.pages.forEach((path) => {
      let sourcePath = rootPath + `/` + path;
      console.log(`开始转换${path}...`);
      generateVue3(sourcePath).then((targetCode, filePath) => {
        // 将翻译后的内容写入到.vue文件中
        let targetPath = dirPath + `/` + path + ".vue";
        createFile(targetPath, targetCode);
        finishNum++;
        console.log(`${path}完成转换，完成率：${finishNum}/${totalNum}`);
      });
    });
  }
}

//时间戳转日期
function formatDate(time) {
  let date = new Date(time);
  let y = date.getFullYear();
  let MM = date.getMonth() + 1;
  MM = MM < 10 ? "0" + MM : MM;
  let d = date.getDate();
  d = d < 10 ? "0" + d : d;
  let h = date.getHours();
  h = h < 10 ? "0" + h : h;
  let m = date.getMinutes();
  m = m < 10 ? "0" + m : m;
  let s = date.getSeconds();
  s = s < 10 ? "0" + s : s;
  return y + "_" + MM + "_" + d + "_" + h + "_" + m + "_" + s;
}



const inputPath = process.argv[2];
// 执行翻译程序
if (isDirectory(inputPath)) {
  generateVue3(inputPath).then((targetCode, filePath) => {
    // 将翻译后的内容写入到.vue文件中
    let targetPath = filePath + ".vue";
    fs.writeFileSync(targetPath, targetCode, "utf8");
  });
} else {
  generateVue3Folder(inputPath);
}
