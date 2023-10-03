# miniprogram-to-vue3

将各类小程序（暂时只实现了微信小程序）源码转换为 vue3/uniapp3（Vue3/Vite版） 源码

## 背景：

随着 vue3 的发布，vue 相关前端项目都有升级需求，其中的一块内容是小程序的升级，例如小程序转码为 vue3、小程序转码为 uniapp3.0（Vue3/Vite版），相关工作量无疑是巨大的，而这些枯燥且易出错的业务代码升级很大程度上可以通过工具来实现，保障项目能跟进前端生态的发展

## 使用：

- npm install //安装依赖
- npm run build  页面文件路径（不带后缀名）  //转换单个页面，并生成同文件名+日期的vue3页面
- npm run build:project  项目文件夹路径 //转换整个项目，并生成同文件夹名+日期的uniapp项目


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





## 原理：

- wxml-compiler：wxml → posthtml-parser → AST → transform → new AST → posthtml-render → vue3/uniapp3 template
- wxss-compiler：wxss → postcss-parser → AST → transform → new AST → postcss-render → vue3/uniapp3 style
- wxjs-compiler：wxjs → @babel/parser → AST → transform → new AST → @babel/generator → vue3/uniapp3 script

## 注意事项：

- 由于js代码的灵活性，很难保证转换后的代码完全满足需求，建议转换后再检查代码的准确性
- 目前整个项目的转换不成熟，建议进行单个页面转换

## License

[MIT](LICENSE)
