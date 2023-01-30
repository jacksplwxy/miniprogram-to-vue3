<template>
<!--index.wxml-->
<scroll-view scroll-y="true" class="container" @scrolltoupper="upper" upper-threshold="10" lower-threshold="5" @scrolltolower="lower" :scroll-into-view="toView" :scroll-top="scrollTop">
  <view class="search flex-wrp">
      <view class="search-left flex-item">
          <image src="../../images/search.png"></image>
          <input placeholder="搜索话题, 问题或人" placeholder-class="search-placeholder">
      </view>
      <view class="search-right flex-item" @click="upper">
          <image src="../../images/lighting.png"></image>
      </view>
  </view>

    <view v-for="(item , idx) in state.feed" :data-idx="idx">
        <view class="feed-item">
            <view class="feed-source">
                <a class="">
                    <view class="avatar">
                        <image :src="item.feed_source_img"></image>
                    </view>
                    <text>{{item.feed_source_name}}{{item.feed_source_txt}}</text>
                </a>
                <image class="item-more" mode="aspectFit" src="../../images/more.png"></image>
            </view>
            <view class="feed-content">
                <view class="question" :qid="question_id" @click="bindQueTap">
                    <a class="question-link">
                        <text>{{item.question}}</text>
                    </a>
                </view>
                <view class="answer-body">
                    <view @click="bindItemTap">
                        <text class="answer-txt" :aid="answer_id">{{item.answer_ctnt}}</text>
                    </view>
                    <view class="answer-actions" @click="bindItemTap">
                        <view class="like dot">
                            <a>{{item.good_num}} 赞同 </a>
                        </view>
                        <view class="comments dot">
                            <a>{{item.comment_num}} 评论 </a>
                        </view>
                        <view class="follow-it">
                            <a>关注问题</a>
                        </view>
                    </view>
                </view>
            </view>
        </view>
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
//index.js

let util = _utilsUtilJs;
const state = reactive({
  feed: [],
  feed_length: 0
});
function bindItemTap() {
  uni.navigateTo({
    url: '../answer/answer'
  });
}
function bindQueTap() {
  uni.navigateTo({
    url: '../question/question'
  });
}
onLoad(function () {
  console.log('onLoad');
  let that = this;
  //调用应用实例的方法获取全局数据
  getData();
});
function upper() {
  uni.showNavigationBarLoading();
  refresh();
  console.log("upper");
  setTimeout(function () {
    uni.hideNavigationBarLoading();
    uni.stopPullDownRefresh();
  }, 2000);
}
function lower(e) {
  uni.showNavigationBarLoading();
  let that = this;
  setTimeout(function () {
    uni.hideNavigationBarLoading();
    nextLoad();
  }, 1000);
  console.log("lower");
}
function refresh0() {
  let index_api = '';
  util.getData(index_api).then(function (data) {
    //this.setData({
    //
    //});
    console.log(data);
  });
}
function getData() {
  let feed = util.getData2();
  console.log("loaddata");
  let feed_data = feed.data;
  state.feed = feed_data;
  state.feed_length = feed_data.length;
}
function refresh() {
  uni.showToast({
    title: '刷新中',
    icon: 'loading',
    duration: 3000
  });
  let feed = util.getData2();
  console.log("loaddata");
  let feed_data = feed.data;
  state.feed = feed_data;
  state.feed_length = feed_data.length;
  setTimeout(function () {
    uni.showToast({
      title: '刷新成功',
      icon: 'success',
      duration: 2000
    });
  }, 3000);
}
function nextLoad() {
  uni.showToast({
    title: '加载中',
    icon: 'loading',
    duration: 4000
  });
  let next = util.getNext();
  console.log("continueload");
  let next_data = next.data;
  state.feed = state.feed.concat(next_data);
  state.feed_length = state.feed_length + next_data.length;
  setTimeout(function () {
    uni.showToast({
      title: '加载成功',
      icon: 'success',
      duration: 2000
    });
  }, 3000);
}
let app = getApp();
</script>
<style>
/**index.wxss**/

.container{
  height: 1500rpx;
}
.container .search{
  width: 735rpx;
  height: 65rpx;
  padding: 12.5rpx 0 12.5rpx 15rpx;
  background: #2A8CE5;
}
.container .search-left{
  flex: 8;
  background: #4EA3E7;
  text-align: left;
}
.container .search-left input{
  display: inline-block;
  height: 65rpx;
  font-size: 26rpx;
}
.search-placeholder{
  color: #8CCEFD;
  line-height: 20rpx;
}
.container .search .search-left image{
  display: inline-block;
  width: 35rpx;
  height: 35rpx;
  padding: 15rpx 15rpx 15rpx 20rpx;
}
.container .search .search-right{
  flex: 1;
}
.container .search .search-right image{
  width: 45rpx;
  height: 45rpx;
  padding: 10rpx;
}

.container{
  padding: 0;
  font-size: 14rpx;
  background: #F0F4F3;
  color: #000;
}
/*feed-item part is in app.wxss for multiplexing*/
</style>