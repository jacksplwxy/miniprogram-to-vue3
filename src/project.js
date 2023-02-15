const { isDirectory } = require("../packages/common/utils-base/file");
const fse = require("fs-extra");
const {
  traverseModule,
} = require("../packages/babel-traverseModule/traverseModule");
const path = require("path");
const fs = require("fs");
const { getNewDirectoryName } = require("../packages/common/utils-base/file");
const { createFile } = require("../packages/common/utils-base/file");

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


  /**
   * 小程序app.js拆分为App.vue + <script>export default</script>（https://juejin.cn/post/7009282373476941831），app.js字面量也要转换为组合式，属性和方法通过{}暴露出去。
   * getApp()方法进行定义为拿到app.js。
   * 对app.js简单转换未Uniapp格式（采用）
   */
  // createFile(appjs路径,转换后的app.vue源码)

  // 对app.json的pages、subPackages、usingComponents进行静态文件依赖分析
  jsonSourceCode.pages.forEach((pagePath, index) => {
    if (index === 0) {
      // const dependencyGraph = traverseModule(
      //   path.resolve(inputPath, "./", pagePath + ".js")
      // );
      // console.log(JSON.stringify(dependencyGraph, null, 4));
      // for(let path in dependencyGraph.allModules){
      // }
      /**
       * 1、此处不能只做js依赖分析，应当做Page/Component依赖分析
       * 2、入口为app.json的pages、subPackages、usingComponents，依赖收集的数据结构：
       * 路径:{
       *  path:'xx',  //绝对路径（不带后缀名）
       *  isTransformed:false,  //是否被转码过
       *  type:'' // 2种类型：Vue表示是页面或组件类型，这种不需要进行export；另一个是Js类型,表示为普通js类型，需要export
       * }
       * 3、依赖收集的依据：1、入口进去的页面的都为Vue类型；2、检查同名json文件，usingComponents下的都为Vue类型；3、页面中import或require的都为普通js文件
       * 4、数据收集以列表的形式整合，同绝对路径名的文件则直接丢弃。再遍历列表，将目标代码以文件形式生成出来。都放置在项目根目录并列的新建类名文件夹下
       */
    }
  });
} else {
  console.error("请输入项目目录文件夹路径");
}
