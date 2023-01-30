# miniprogram-to-vue3

将各类小程序源码转换为 vue3/uniapp3（Vue3/Vite版） 源码

## 背景：

随着 vue3 的发布，vue 相关前端项目都有升级需求，其中的一块内容是小程序的升级，例如小程序转码为 vue3、小程序转码为 uniapp3（Vue3/Vite版），相关工作量无疑是巨大的，而这些枯燥且易出错的业务代码升级很大程度上可以通过工具来实现，保障项目能跟进前端生态的发展

## 使用：

- npm install // 安装依赖文件
- npm run build:page 路径 // 将指定路径文件夹下的小程序文件（wxml、js、wxss）构建为.vue 文件。路径既可以是文件夹，也可以是 app.json，如果路径是文件夹，则只转换文件夹下的小程序文件；如果路径是 app.json 则转换当中 pages 配置的所有文件夹
- npm run build:js 文件夹路径 // 将指定路径文件夹下的 js 文件模块由 commonjs 转换为 es 模块（vite 不支持 commonjs）

## 转换示例:
- wxml转换前
```
<view class="card-info" hidden="{{!isLogin || usrStatus === '20'}}"  style="background: url('http://{{imageRootUrl}}ab'cd'ef{{displayInfo.carBgBig + 'test123'}}')  no-repeat;background-size: 100% 100%;" bindtap="todCard">
</view>
```
- wxml转换后
```
<view class="card-info" :hidden="!isLogin || usrStatus === '20'" :style="'background: url("http://' + imageRootUrl + 'ab"cd"ef' + (displayInfo.carBgBig + 'test123') + '")  no-repeat;background-size: 100% 100%;'" @click="todCard">

</view>
```
- js转换前
```
const state = 1;
function toastHidden() {
  console.log('outerToastHidden')
}
Page({
  data: {
    toastShow: true,
    userInfo: {
      class: 1,
      star: 0,
    },
  },
  toastHidden() {
    let state = 123;
    this.setData({
      toastShow: false,
      userInfo: {},
    });
    const that = this;
    function test(res) {
      const th = that;
      function aonShow() {
        console.log(th.gotoRank());
      }
    }
  },
  onShow() {
    this.toastHidden();
  },
  gotoRank() {
    wx.navigateTo({
      url: "../rank/rank",
    });
  },
  onShareAppMessage: function (res) {},
});
```
- js转换后
```
import { onShow, onShareAppMessage } from "@dcloudio/uni-app";
import { reactive } from "vue";
const _state = 1;
function _toastHidden() {
  console.log('outerToastHidden');
}
const state = reactive({
  toastShow: true,
  userInfo: {
    class: 1,
    star: 0
  }
});
function toastHidden() {
  let state = 123;
  state.toastShow = false;
  state.userInfo = {};
  const that = this;
  function test(res) {
    const th = that;
    function aonShow() {
      console.log(gotoRank());
    }
  }
}
onShow(function () {
  toastHidden();
});
function gotoRank() {
  uni.navigateTo({
    url: "../rank/rank"
  });
}
onShareAppMessage(function (res) {});
```

## 项目转换示例：

- 由于工具的不完善，在转换前需要做一些手工操作：
- 1、在网上找到知乎微信小程序源码并下载下来，作为待转换的项目：https://github.com/RebeccaHanjw/weapp-wechat-zhihu
- 2、使用 npx degit dcloudio/uni-preset-vue#vite my-vue3-project 命令创建 Vue3/Vite 版 uniapp 模板（node 版本^14.18.0）
- 3、为保证转换效果一致性，需将小程序的一些公用文件复制到 uniapp 目录下，例如小程序的app.wxss复制到uniapp中，并在main.js进行全局import引入，例如小程序的 utils、images、data 文件夹复制到 uniapp 的 src 文件夹中。另外，由于 vite 不支持 commonjs，需要将小程序的 commonjs 转换为 es 模块，可以通过本工具的命令行对文件夹下的 js 文件进行模块转换：npm run build:js D:/miniprogram-to-vue3/examples/minipro2uniapp/uniapp/src/data。
- 4、执行转换小程序页面为 vue3 文件的命令行 npm run build D:/miniprogram-to-vue3/examples/minipro2uniapp/weapp-wechat-zhihu-master/pages/index/index，并生成 index.vue 文件
- 5、将生成.vue 文件剪切到 uniapp 中，运行 uni 项目后即可看到生成的页面与微信小程序中保持一致。
- 6、其他页面的转换与 5 一致即可（也可npm run build app.json路径进行多页面转换）

## 具体做了哪些转换？

- 1、
- 2、
- 3、

## 进度：

目前只能转换指定 Page，不支持 Component、APP 类型以及依赖的 js 的文件转换，待成熟后将支持自动翻译整个项目



## 原理：

- wxml-compiler：wxml → posthtml-parser → AST → transform → new AST → posthtml-render → vue3/uniapp3 template
- wxjs-compiler：wxjs → @babel/parser → AST → transform → new AST → @babel/generator → vue3/uniapp3 script

## 注意事项：

- 工具并不成熟，建议转换后再检查代码是否正确

## License

[MIT](LICENSE)
