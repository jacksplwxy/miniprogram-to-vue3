<template>

<view class="container chat">
  <view class="chat-item flex-wrp">
    <view class="avatar flex-item">
      <image src="../../images/icon8.jpg"></image>
    </view>
    <view class="chat-content flex-item">
      <view class="chat-source">
        <text class="chatmate">Alex</text>
        <text class="lasttime">1 个月前</text>
      </view>
      <text class="chat-txt">你好~ 你好~ 你好~</text>
    </view>
  </view>
  <view class="chat-item flex-wrp">
    <view class="avatar flex-item">
      <image src="../../images/icon9.jpeg"></image>
    </view>
    <view class="chat-content flex-item">
      <view class="chat-source">
        <text class="chatmate">George</text>
        <text class="lasttime">3 个月前</text>
      </view>
      <text class="chat-txt">你好~ 你好~ 你好~</text>
    </view>
  </view>

</view>



</template>
<script setup>
import _utilsUtilJs from "../../utils/util.js";
import { reactive } from "vue";
let module = {
  exports: {}
};
let exports = module.exports;
//logs.js
let util = _utilsUtilJs;
// Page({
//  data: {
//    logs: []
//  },
//  onLoad: function () {
//    this.setData({
//      logs: (wx.getStorageSync('logs') || []).map(function (log) {
//        return util.formatTime(new Date(log))
//      })
//    })
//  }
// })
const state = reactive({
  focus: false,
  inputValue: ''
});
function bindButtonTap() {
  state.focus = Date.now();
}
function bindKeyInput(e) {
  state.inputValue = e.detail.value;
}
function bindReplaceInput(e) {
  let value = e.detail.value;
  let pos = e.detail.cursor;
  if (pos != -1) {
    //光标在中间
    let left = e.detail.value.slice(0, pos);
    //计算光标的位置
    pos = left.replace(/11/g, '2').length;
  }

  //直接返回对象，可以对输入进行过滤处理，同时可以控制光标的位置
  return {
    value: value.replace(/11/g, '2'),
    cursor: pos
  };

  //或者直接返回字符串,光标在最后边
  //return value.replace(/11/g,'2'),
}
function bindHideKeyboard(e) {
  if (e.detail.value === '123') {
    //收起键盘
    uni.hideKeyboard();
  }
}
</script>
<style>
.chat-item{
  width: 725rpx;
  background: #ffffff;
  padding: 25rpx 25rpx 25rpx 0;
  border-bottom: solid 1px #ebebeb;
}
.chat-item  image{
  width: 80rpx;
  height: 80rpx;
  border-radius: 80rpx;
}
.chat-item .avatar{
  flex: 1;
}
.chat-item .chat-content{
  flex: 4;
  text-align: left;
}
.chat-item .chat-content text{
  /*display: block;*/
}
.chat-item .chat-content .chat-source{
  color: #818A8F;
  font-size: 28rpx;
  padding: 4rpx 0 8rpx 0;
}
.chat-item .chat-content .chat-source .chatmate{
  font-size: 34rpx;
  color: #000000;
  text-align: left;
}
.chat-item .chat-content .chat-source .lasttime{
  flex: 1;
  font-size: 22rpx;
  float: right;
  vertical-align: text-bottom;
}
.chat-item .chat-content .chat-txt{
  display: block;
  color: #7b7b7b;
  font-size: 26rpx;
  line-height: 34rpx;
}
</style>