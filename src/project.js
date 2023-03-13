const { isDirectory } = require("../packages/common/utils-base/file");
const fse = require("fs-extra");
const path = require("path");
const fs = require("fs");
const { getNewDirectoryName } = require("../packages/common/utils-base/file");
// const { createFile } = require("../packages/common/utils-base/file");
const { generateAppvue } = require("./generateAppvue");
const { generateVue3 } = require("./generateVue3");
const { generateEsm } = require("./generateEsm");
const {
  getDependencyGraph,
} = require("../packages/babel-getDependencyGraph/index");

const inputPath =
  process.argv[2] ||
  "D:/jacksplwxy/git/miniprogram-to-vue3/examples/minipro2uniapp/weapp-wechat-zhihu-master";
// 执行翻译程序
if (isDirectory(inputPath)) {
  let jsonSourceCode;
  try {
    let jsonPath = inputPath + "/app.json";
    jsonSourceCode = fs.readFileSync(jsonPath, "utf8");
  } catch (error) {
    console.log("读取目录app.json文件夹失败：", error);
  }
  try {
    jsonSourceCode = JSON.parse(jsonSourceCode);
  } catch (error) {
    throw new Error("请确认文件内容满足json格式");
  }

  // 复制模板项目
  let targetProjectPath = getNewDirectoryName(inputPath);
  fse.copySync(
    path.resolve(__dirname, "../packages/template/uni-preset-vue-vite"),
    targetProjectPath
  );
  console.log("完成模板代码创建");
  console.info("全局组件待注册。。。。");

  /**
   * 小程序app.js拆分为App.vue + <script>export default</script>（https://juejin.cn/post/7009282373476941831），app.js字面量也要转换为组合式，属性和方法通过{}暴露出去。
   * getApp()方法进行定义为拿到app.js。
   * 对app.js简单转换为Uniapp格式（采用）
   */
  generateAppvue(path.resolve(inputPath, "./app.js")).then((code) => {
    // 获取app.wxss中的代码
    let css = fs.readFileSync(path.resolve(inputPath, "./app.wxss"), "utf8");
    code = `<script>\n${code}\n</script>\n<style>\n${css}\n</style>`;
    fs.writeFileSync(
      path.resolve(targetProjectPath, "./src/App.vue"),
      code,
      "utf8"
    );
    console.log("完成app.js + app.wxss → App.vue转换");
  });

  //app.json → pages.json
  let pagesJson = fs.readFileSync(
    path.resolve(inputPath, "./app.json"),
    "utf8"
  );
  try {
    pagesJson = JSON.parse(pagesJson);
    pagesJson.pages = pagesJson.pages.map((item) => {
      return {
        path: item,
        style: {
          navigationBarTitleText: "",
          navigationBarTextStyle: "black",
        },
      };
    });
  } catch (error) {
    pagesJson = {};
  }
  fs.writeFileSync(
    path.resolve(targetProjectPath, "./src/pages.json"),
    JSON.stringify(pagesJson, null, 2),
    "utf8"
  );
  console.log("完成app.json → pages.json转换");

  // 获取依赖图
  getDependencyGraph(jsonSourceCode, inputPath).then((dependencyList) => {
    console.log("完成依赖收集：", dependencyList);
    console.log(
      "开始根据依赖的路径及类型匹配不同解析方法进行转换生成新文件..."
    );
    let totalNum = Object.keys(dependencyList).length;
    let finishNum = 0;
    let failNum = 0;
    for (let sourcePath in dependencyList) {
      let type = dependencyList[sourcePath].type;
      let targetPath = path.resolve(
        targetProjectPath,
        "./src/" +
          sourcePath
            .replace(/\//gi, "\\")
            .replace(inputPath.replace(/\//gi, "\\"), "")
      );
      switch (type) {
        case "Vue":
          generateVue3(sourcePath)
            .then((targetCode, filePath) => {
              // 将翻译后的内容写入到.vue文件中
              targetPath += ".vue";
              // createFile(targetPath, targetCode);
              fse.outputFileSync(targetPath, targetCode);
              finishNum++;
              console.log(
                `${sourcePath}完成转换，完成率：${finishNum}/${totalNum}`
              );
            })
            .catch((err) => {
              failNum++;
              console.log(
                `${sourcePath}转换失败，失败率：${failNum}/${totalNum}`
              );
            });
          break;
        case "Js":
          generateEsm(sourcePath)
            .then((targetCode, filePath) => {
              // 将翻译后的内容写入到.vue文件中
              fse.outputFileSync(targetPath, targetCode);
              finishNum++;
              console.log(
                `${sourcePath}完成转换，完成率：${finishNum}/${totalNum}`
              );
            })
            .catch((err) => {
              failNum++;
              console.log(
                `${sourcePath}转换失败，失败率：${failNum}/${totalNum}`
              );
            });
          break;
        case "File":
          fse
            .copy(sourcePath, targetPath)
            .then(() => {
              finishNum++;
              console.log(
                `${sourcePath}完成转换，完成率：${finishNum}/${totalNum}`
              );
            })
            .catch((err) => {
              failNum++;
              console.log(
                `${sourcePath}转换失败，失败率：${failNum}/${totalNum}`
              );
            });
          break;
      }
    }
    console.log("完成vue、js及其他file文件转换");
  });
} else {
  console.error("请输入项目目录文件夹路径");
}
