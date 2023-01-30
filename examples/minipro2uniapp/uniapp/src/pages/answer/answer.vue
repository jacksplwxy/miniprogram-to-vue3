<template>
<!--answer.wxml-->
<view class="container">
    <view class="question" @click="toQuestion">
        <text class="question-title">选择 Kindle 而不是纸质书的原因是什么？</text>
    </view>
    <view class="answerer-wrp">
        <view class="bg-half"></view>
        <view class="answerer flex-wrp">
            <view class="avatar flex-item">
                <image src="../../images/icon1.jpeg"></image>
            </view>
            <view class="answerer-info flex-item">
                <text class="answerer-name">Rebecca</text>
                <text class="answerer-des">WEB前端*不靠谱天气预报员*想做代码小仙女</text>
            </view>
            <view class="follow flex-item">
                <text>十 关注</text>
            </view>
        </view>
    </view>
    <view class="answer-content">
        <text>难道不明白纸质书更贵啊！！！

            若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。

            另外，用kindle看小说的怎么真心不懂了。题主不看小说么？难道题主拿来看教科书还是技术文档？还是题主觉得小说就是小时代内样的？（对小时代没偏见，尊重多样性）

            而且纸质书搬起来真心困难啊！当初毕业带不回来，忍痛卖了不少好桑心！

            碎片时间阅读总不能天天背着一本书吧，那么占地方。

            看到描述最后一段，感觉有骗答案的嫌疑

        </text>
        <image src="../../images/1444983318907-_DSC1826.jpg"></image>
        <text>
            难道不明白纸质书更贵啊！！！

            若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。

            另外，用kindle看小说的怎么真心不懂了。题主不看小说么？难道题主拿来看教科书还是技术文档？还是题主觉得小说就是小时代内样的？（对小时代没偏见，尊重多样性）

            而且纸质书搬起来真心困难啊！当初毕业带不回来，忍痛卖了不少好桑心！

            碎片时间阅读总不能天天背着一本书吧，那么占地方。

            看到描述最后一段，感觉有骗答案的嫌疑

        </text>
        <image src="../../images/1444983318907-_DSC1826.jpg"></image>
    </view>

    <view class="answer-footer flex-wrp">
        <view class="good flex-item">
            <view class="good-bad">
                <image src="../../images/good-bad.png"></image>
            </view>
            <view class="good-num">2.1k</view>
        </view>
        <view class="operation-wrp flex-item">
            <view class="operation flex-wrp flex-tab">
                <view class="operation-btn flex-item">
                    <image src="../../images/flag.png"></image>
                    <text>没有帮助</text>
                </view>
                <view class="operation-btn flex-item">
                    <image src="../../images/heart2.png"></image>
                    <text>感谢</text>
                </view>
                <view class="operation-btn flex-item">
                    <image src="../../images/star2.png"></image>
                    <text>收藏</text>
                </view>
                <view class="operation-btn flex-item">
                    <image src="../../images/comment.png"></image>
                    <text>302</text>
                </view>

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
//answer.js
let util = _utilsUtilJs;
const state = reactive({
  motto: '知乎--微信小程序版',
  userInfo: {}
});
function toQuestion() {
  uni.navigateTo({
    url: '../question/question'
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
function tapName(event) {
  console.log(event);
}
let app = getApp();
</script>
<style>
/**answer.wxss**/

.container {
    padding: 0;
    font-size: 14rpx;
    background: #F0F4F3;
    color: #000;
}

.question {
    position: relative;
    width: 650rpx;
    padding: 40rpx 50rpx 30rpx;
    background: #298DE5;
    color: #fff;
    font-size: 38rpx;
    line-height: 48rpx;
}
.answerer-wrp{
    position: relative;
    width: 750rpx;
    height: 150rpx;
    background: #fff;
}
.answerer-wrp .bg-half{
    position: absolute;
    top: 0;
    width: 750rpx;
    height: 75rpx;
    background: #298DE5;
}
.answerer {
    position: relative;
    margin: 0 auto;
    width: 630rpx;
    height: 90rpx;
    padding: 30rpx;
    background: #fff;
    border: solid 1px #ebebeb;
    border-radius: 3px;
    box-shadow: 0 1px 2px #bebebe;
}
.answerer .avatar {
    flex: 1;
    width: 90rpx;
    height: 90rpx;
}

.answerer .avatar image {
    display: inline-block;
    width: 90rpx;
    height: 90rpx;
    border-radius: 90rpx;
}
.answerer .answerer-info{
    flex: 5;
    text-align: left;
    padding: 10rpx 20rpx;
    line-height: 38rpx;
}
.answerer .answerer-info text{
    display: block;
}
.answerer .answerer-info .answerer-name{
    font-size: 32rpx;
}
.answerer .answerer-info .answerer-des{
    font-size: 22rpx;
    color: #808080;
    line-height: 28rpx;
}
.answerer .follow{
    flex: 2;
    padding: 15rpx 0;
    font-size: 22rpx;
}
.answerer .follow text{
    display: inline-block;
    padding: 15rpx 20rpx;
    color: #40bcd0;
    border: solid 2px #40bcd0;
    border-radius: 6rpx;
}
.answer-content{
    padding: 30rpx 40rpx;
    background: #ffffff;
}
.answer-content text{
    font-size: 32rpx;
    color: #454545;
    line-height: 44rpx;
}
.answer-content image{
    width: 100%;
    margin: 20rpx 0;
}
.answer-footer{
    position: fixed;
    bottom: 0;
    height: 70rpx;
    border-top: solid 1px #ebebeb;
    background: #ffffff;
    width: 670rpx;
    padding: 20rpx 40rpx;
}
.answer-footer .good{
    flex: 1;
    /*display: inline-block;*/
    height: 40rpx;
    border: solid 1px #d1d1d1;
    border-radius: 3px;
    padding: 10rpx 8rpx;
    margin: 10rpx 0;
}
.answer-footer .good .good-bad{
    display: inline-block;
}
.answer-footer .good image{
    display: inline-block;
    width: 38rpx;
    height: 38rpx;
    vertical-align: middle;
}
.answer-footer .good .good-num{
    display: inline-block;
    padding: 10rpx 4rpx;
    /*font-size: 24rpx;*/
}
.answer-footer .operation-wrp{
    flex: 5;
}
.answer-footer .operation{
    justify-content: space-between;
    padding: 0 0 0 60rpx;
}
.answer-footer .operation-btn{
    flex: 1;
    text-align: center;
}
.answer-footer .operation image{
    display: block;
    margin: 0 auto;
    width: 50rpx;
    height: 50rpx;
}
.answer-footer .operation-btn text{
    display: block;
    font-size: 14rpx;
    color: #bebebe;
}

</style>