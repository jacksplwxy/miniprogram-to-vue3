const { generateVue3 } = require("./generateVue3");
const fse = require("fs-extra");
const path = require("path");
const { getNewDirectoryName } = require("../packages/common/utils-base/file");

let filePath = process.argv[2];
let filePathParse = path.parse(filePath);
filePath = filePathParse.dir + "/" + filePathParse.name;
generateVue3(filePath)
  .then((targetCode) => {
    let targetPath = getNewDirectoryName(filePath);
    // 将翻译后的内容写入到.vue文件中
    targetPath += ".vue";
    fse.outputFileSync(targetPath, targetCode);
    console.info(`页面转换成功`);
  })
  .catch((err) => {
    console.error(`页面转换失败`);
  });
