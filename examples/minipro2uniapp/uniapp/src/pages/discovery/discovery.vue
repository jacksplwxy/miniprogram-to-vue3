<template>

<view class="top-tab flex-wrp flex-tab ">
  <view :class="'toptab flex-item ' + (state.currentNavtab == idx ? 'active' : '')" v-for="(itemName , idx) in state.navTab" :data-idx="idx" @click="switchTab">
    {{itemName}}
  </view>
</view>

<scroll-view scroll-y="true" class="container discovery withtab" @scrolltoupper="upper" @scrolltolower="lower" :scroll-into-view="toView" :scroll-top="scrollTop">
  <view class="ctnt0" :hidden="state.currentNavtab == 0 ? '' : true">
    <swiper class="activity" :indicator-dots="state.indicatorDots" :autoplay="state.autoplay" :interval="state.interval" :duration="state.duration">
      <view v-for="(item , index) in state.imgUrls">
        <swiper-item>
          <image :src="item" class="slide-image" width="355" height="155">
        </image></swiper-item>
      </view>
    </swiper>

    <view v-for="(item , idx) in state.feed" :data-idx="idx">
      <view class="feed-item">
        <view class="feed-source">
          <a class="">
            <view class="avatar">
              <image :src="item.feed_source_img"></image>
            </view>
            <text>{{item.feed_source_name}}</text>
          </a>
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
  </view>
  <view class="ctnt1 placehold" :hidden="state.currentNavtab == 1 ? '' : true">
    <text>圆桌</text>
  </view>
  <view class="ctnt2 placehold" :hidden="state.currentNavtab == 2 ? '' : true">
    <text>热门</text>
  </view>
  <view class="ctnt3 placehold" :hidden="state.currentNavtab == 3 ? '' : true">
    <text>收藏</text>
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
  navTab: ["推荐", "圆桌", "热门", "收藏"],
  currentNavtab: "0",
  imgUrls: ['../../images/24213.jpg', '../../images/24280.jpg', '../../images/1444983318907-_DSC1826.jpg'],
  indicatorDots: false,
  autoplay: true,
  interval: 5000,
  duration: 1000,
  feed: [],
  feed_length: 0
});
onLoad(function () {
  console.log('onLoad');
  let that = this;
  //调用应用实例的方法获取全局数据
  refresh();
});
function switchTab(e) {
  state.currentNavtab = e.currentTarget.dataset.idx;
}
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
function refresh() {
  let feed = util.getDiscovery();
  console.log("loaddata");
  let feed_data = feed.data;
  state.feed = feed_data;
  state.feed_length = feed_data.length;
}
function nextLoad() {
  let next = util.discoveryNext();
  console.log("continueload");
  let next_data = next.data;
  state.feed = state.feed.concat(next_data);
  state.feed_length = state.feed_length + next_data.length;
}
//discovery.js
let util = _utilsUtilJs;
</script>
<style>
@import url('../../app.css');
</style>
<style>
.container{
  height: 1500rpx;
}
.top-tab{
  width: 750rpx;
  height: 100rpx;
  background: #298DE5;
  color: #8CCEFD;
  font-size: 28rpx;
  line-height: 100rpx;
  box-shadow: 0 2px 2px #bebebe;
  margin: 0 0 8rpx 0;
  z-index: 9999;
}

.toptab.active{
  color: #ffffff;
  border-bottom: solid 2px #ffffff;
}
.activity{
  width: 750rpx;
  height: 375rpx;
}
.activity image{
  width: 750rpx;
  height: 375rpx;
}
.placehold{
  font-size: 28rpx;
  padding: 80rpx 0;
}
</style>