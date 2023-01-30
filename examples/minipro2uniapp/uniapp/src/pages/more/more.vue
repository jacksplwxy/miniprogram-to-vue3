<template>

<view class="container more">
  <view class="user flex-wrp">
    <view class="avatar flex-item">
      <image class="userinfo-avatar" :src="state.userInfo.avatarUrl" background-size="cover"></image>
    </view>
    <view class="user-info flex-item">
      <text class="userinfo-nickname">{{state.userInfo.nickName}}</text>
      <text class="edit">查看或编辑个人主页</text>
    </view>
  </view>

  <view class="my">
    <view class="my-item flex-wrp">
      <view class="myitem-icon flex-item">
        <image src="../../images/eye.png"></image>
      </view>
      <view class="myitem-name flex-item">
        <text>我的关注</text>
      </view>
    </view>
    <view class="my-item flex-wrp">
      <view class="myitem-icon flex-item">
        <image src="../../images/star.png"></image>
      </view>
      <view class="myitem-name flex-item">
        <text>我的收藏</text>
      </view>
    </view>
    <view class="my-item flex-wrp">
      <view class="myitem-icon flex-item">
        <image src="../../images/draft.png"></image>
      </view>
      <view class="myitem-name flex-item">
        <text>我的草稿</text>
      </view>
    </view>
    <view class="my-item flex-wrp">
      <view class="myitem-icon flex-item">
        <image src="../../images/recent.png"></image>
      </view>
      <view class="myitem-name flex-item">
        <text>最近浏览</text>
      </view>
    </view>
    <view class="my-item flex-wrp">
      <view class="myitem-icon flex-item">
        <image src="../../images/book.png"></image>
      </view>
      <view class="myitem-name flex-item">
        <text>我的书架</text>
      </view>
    </view>
    <view class="my-item flex-wrp">
      <view class="myitem-icon flex-item">
        <image src="../../images/live.png"></image>
      </view>
      <view class="myitem-name flex-item">
        <text>我的 Live</text>
      </view>
    </view>
    <view class="my-item flex-wrp">
      <view class="myitem-icon flex-item">
        <image src="../../images/zhi.png"></image>
      </view>
      <view class="myitem-name flex-item">
        <text>我的值乎</text>
      </view>
    </view>

  </view>
</view>

</template>
<script setup>
import _utilsUtilJs from "../../utils/util.js";
import { onLoad } from "@dcloudio/uni-app";
import { reactive } from "vue";
let module = {
  exports: {}
};
let exports = module.exports;
//logs.js
let util = _utilsUtilJs;
const state = reactive({
  motto: 'Hello World',
  userInfo: {}
});
function bindViewTap() {
  uni.navigateTo({
    url: ''
  });
}
onLoad(function () {
  console.log('onLoad');
  let that = this;
  //调用应用实例的方法获取全局数据
  app.getUserInfo(function (userInfo) {
    //更新数据
    state.userInfo = userInfo;
  });
});
let app = getApp();
</script>
<style>
.user {
  width: 725rpx;
  background: #ffffff;
  padding: 30rpx 25rpx 30rpx 0;
  margin: 15rpx 0 0 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #dcdcdc;
  box-shadow: 0 2px 5px #eeeeee;
}
.user .userinfo-avatar{
  flex: 1;
  display: inline-block;
  width: 100rpx;
  height: 100rpx;
  border-radius: 80rpx;
}
.user .user-info{
  flex: 5;
  text-align: left;
}
.user .user-info text{
  display: block;
}
.user .user-info .userinfo-nickname{
  padding: 8rpx 0 10rpx 0;
  font-size: 30rpx;
  color: #818A8F;
}
.user .user-info .edit{
  font-size: 30rpx;
  color: #bababa;
  line-height: 34rpx;
}

.my{
  margin: 15rpx 0 0 0;
  border-top: solid 1px #ebebeb;
  border-bottom: solid 2px #ebebeb;
}
.my .my-item{
  width: 750rpx;
  background: #ffffff;
  padding: 0
}
.my .my-item .myitem-icon{
  flex: 1;
}
.my .my-item .myitem-icon image{
  width: 45rpx;
  height: 45rpx;
  padding: 37.5rpx 0;
}
.my .my-item .myitem-name{
  flex: 5;
  text-align: left;
  font-size: 34rpx;
  color: #6d6d6d;
  line-height: 60rpx;
  padding: 30rpx 0;
  border-bottom: solid 1px #ebebeb;
}
.my .my-item:last-child .myitem-name{
  border-bottom: none;
}
</style>