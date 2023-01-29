<template>
<!--logs.wxml-->
<view class="top-tab flex-wrp flex-tab">
  <view :class="'toptab flex-item ' + (state.currentNavtab == idx ? 'active' : '')" v-for="(itemName , idx) in state.navTab" :data-idx="idx" @click="switchTab">
    {{itemName}}
  </view>
</view>
<scroll-view scroll-y="true" class="container notify withtab" @scrolltoupper="upper" @scrolltolower="lower" @scroll="scroll" :scroll-into-view="toView" :scroll-top="scrollTop">
  <view class="ctnt0" :hidden="state.currentNavtab == 0 ? '' : true">
    <view class="unread">
      <text>0 条未读</text>
      <image src="../../images/allread.png"></image>
    </view>
    <view class="notify-item flex-wrp">
      <view class="avatar flex-item">
        <image src="../../images/icon1.jpeg"></image>
      </view>
      <view class="notify-content flex-item">
        <text class="notify-source">Rebecca  回答了问题</text>
        <text class="notify-title">C#如何在不覆盖原有文件的情况下直接修改某一部分的内容？</text>
      </view>
    </view>
    <view class="notify-item flex-wrp">
      <view class="avatar flex-item">
        <image src="../../images/icon1.jpeg"></image>
      </view>
      <view class="notify-content flex-item">
        <text class="notify-source">Rebecca  回答了问题</text>
        <text class="notify-title">C#如何在不覆盖原有文件的情况下直接修改某一部分的内容？</text>
      </view>
    </view>
    <view class="notify-item flex-wrp">
      <view class="avatar flex-item">
        <image src="../../images/icon1.jpeg"></image>
      </view>
      <view class="notify-content flex-item">
        <text class="notify-source">Rebecca  回答了问题</text>
        <text class="notify-title">C#如何在不覆盖原有文件的情况下直接修改某一部分的内容？</text>
      </view>
    </view>
    <view class="notify-item flex-wrp">
      <view class="avatar flex-item">
        <image src="../../images/icon1.jpeg"></image>
      </view>
      <view class="notify-content flex-item">
        <text class="notify-source">Rebecca  回答了问题</text>
        <text class="notify-title">C#如何在不覆盖原有文件的情况下直接修改某一部分的内容？</text>
      </view>
    </view>
    <view class="notify-item flex-wrp">
      <view class="avatar flex-item">
        <image src="../../images/icon1.jpeg"></image>
      </view>
      <view class="notify-content flex-item">
        <text class="notify-source">Rebecca  回答了问题</text>
        <text class="notify-title">C#如何在不覆盖原有文件的情况下直接修改某一部分的内容？</text>
      </view>
    </view>
    <view class="notify-item flex-wrp">
      <view class="avatar flex-item">
        <image src="../../images/icon1.jpeg"></image>
      </view>
      <view class="notify-content flex-item">
        <text class="notify-source">Rebecca  回答了问题</text>
        <text class="notify-title">C#如何在不覆盖原有文件的情况下直接修改某一部分的内容？</text>
      </view>
    </view>
    <view class="notify-item flex-wrp">
      <view class="avatar flex-item">
        <image src="../../images/icon1.jpeg"></image>
      </view>
      <view class="notify-content flex-item">
        <text class="notify-source">Rebecca  回答了问题</text>
        <text class="notify-title">C#如何在不覆盖原有文件的情况下直接修改某一部分的内容？</text>
      </view>
    </view>
  </view>
  <view class="ctnt1 placehold" :hidden="state.currentNavtab == 1 ? '' : true">
    <text>赞与感谢</text>
  </view>
  <view class="ctnt2 placehold" :hidden="state.currentNavtab == 2 ? '' : true">
    <text>关注</text>
  </view>
</scroll-view>

</template>
<script setup>
import _utilsUtilJs from "../../utils/util.js";
import { onLoad } from "@dcloudio/uni-app";
import { reactive } from "vue";
let module = {
  exports: {}
};
let exports = module.exports;
const state = reactive({
  navTab: ["通知", "赞与感谢", "关注"],
  currentNavtab: "0"
});
onLoad(function () {});
function switchTab(e) {
  state.currentNavtab = e.currentTarget.dataset.idx;
}
//logs.js
let util = _utilsUtilJs;
</script>
<style>
@import url('../../app.css');
</style>
<style>
.unread{
  color: #9A9C9B;
  height: 60rpx;
  padding: 10rpx 40rpx;
  text-align: left;
  width: 670rpx;
}
.unread text{
  display: inline-block;
  line-height: 60rpx;
  font-size: 22rpx;
}
.unread image{
  display: inline-block;
  width: 50rpx;
  height: 50rpx;
  vertical-align: middle;
  float: right;
}
.notify-item{
  width: 680rpx;
  background: #ffffff;
  padding: 25rpx 70rpx 25rpx 0;
  border-bottom: solid 1px #ebebeb;
}
.notify-item  image{
  width: 80rpx;
  height: 80rpx;
  border-radius: 80rpx;
}
.notify-item .avatar{
  flex: 1;
}
.notify-item .notify-content{
  flex: 4;
  text-align: left;
}
.notify-item .notify-content text{
  display: block;
}
.notify-item .notify-content .notify-source{
  color: #818A8F;
  font-size: 28rpx;
  padding: 0 0 8rpx 0;
}
.notify-item .notify-content .notify-title{
  color: #AFAFAF;
  font-size: 30rpx;
  line-height: 34rpx;
}
.placehold{
  padding: 80rpx 0;
  font-size: 28rpx
}
</style>