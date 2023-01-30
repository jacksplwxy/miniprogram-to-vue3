<template>
<!--question.wxml-->
<view class="container">
    <view class="question-wrp">
        <view class="question-item">
            <view class="que-tag">
                <text class="tag">阅读</text>
                <text class="tag">电子书</text>
                <text class="tag">Kindle</text>
                <text class="tag">书籍</text>
                <text class="tag">文学</text>
            </view>
            <view class="que-title">
                选择 Kindle 而不是纸质书的原因是什么？
            </view>
            <view class="que-content">
                WEB前端*不靠谱天气预报员*想做代码小仙女
            </view>
            <view class="que-follow">
                <view class="left">
                    <view class="watch">
                        <image src="../../images/eye.png"></image>
                        <text>3316</text>
                    </view>
                    <view class="comment">
                        <image src="../../images/comment2.png"></image>
                        <text>27</text>
                    </view>
                </view>
                <view class="right">
                    关注
                </view>
            </view>
        </view>
        <view class="que-operate flex-wrp">
            <view class="invite flex-item">
                <image src="../../images/invite.png"></image>
                <text>邀请回答</text>
            </view>
            <view class="write flex-item">
                <image src="../../images/write.png"></image>
                <text>写回答</text>
            </view>
        </view>
    </view>
    <view class="answer-feed">
        <view @click="bindItemTap" class="feed-item">
            <view class="feed-source">
                <a class="" @Tap="">
                    <view class="avatar">
                        <image src="../../images/icon1.jpeg"></image>
                    </view>
                    <text>Rebecca</text>
                </a>
            </view>
            <view class="feed-content">
                <view class="answer-body">
                    <view>
                        <text class="answer-txt">难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的... </text>
                    </view>
                    <view class="answer-actions">
                        <view class="like dot">
                            <a>3.9K 赞同 </a>
                        </view>
                        <view class="comments dot">
                            <a>254 评论 </a>
                        </view>
                        <view class="time">
                            <a>2 个月前</a>
                        </view>

                    </view>
                </view>
            </view>
        </view>
        <view @click="bindItemTap" class="feed-item">
            <view class="feed-source">
                <a class="" @Tap="">
                    <view class="avatar">
                        <image src="../../images/icon1.jpeg"></image>
                    </view>
                    <text>Rebecca</text>
                </a>
            </view>
            <view class="feed-content">
                <view class="answer-body">
                    <view>
                        <text class="answer-txt">难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的... </text>
                    </view>
                    <view class="answer-actions">
                        <view class="like dot">
                            <a>3.9K 赞同 </a>
                        </view>
                        <view class="comments dot">
                            <a>254 评论 </a>
                        </view>
                        <view class="time">
                            <a>2 个月前</a>
                        </view>

                    </view>
                </view>
            </view>
        </view>
        <view @click="bindItemTap" class="feed-item">
            <view class="feed-source">
                <a class="" @Tap="">
                    <view class="avatar">
                        <image src="../../images/icon1.jpeg"></image>
                    </view>
                    <text>Rebecca</text>
                </a>
            </view>
            <view class="feed-content">
                <view class="answer-body">
                    <view>
                        <text class="answer-txt">难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的... </text>
                    </view>
                    <view class="answer-actions">
                        <view class="like dot">
                            <a>3.9K 赞同 </a>
                        </view>
                        <view class="comments dot">
                            <a>254 评论 </a>
                        </view>
                        <view class="time">
                            <a>2 个月前</a>
                        </view>

                    </view>
                </view>
            </view>
        </view>
        <view @click="bindItemTap" class="feed-item">
            <view class="feed-source">
                <a class="" @Tap="">
                    <view class="avatar">
                        <image src="../../images/icon1.jpeg"></image>
                    </view>
                    <text>Rebecca</text>
                </a>
            </view>
            <view class="feed-content">
                <view class="answer-body">
                    <view>
                        <text class="answer-txt">难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的... </text>
                    </view>
                    <view class="answer-actions">
                        <view class="like dot">
                            <a>3.9K 赞同 </a>
                        </view>
                        <view class="comments dot">
                            <a>254 评论 </a>
                        </view>
                        <view class="time">
                            <a>2 个月前</a>
                        </view>

                    </view>
                </view>
            </view>
        </view>
        <view @click="bindItemTap" class="feed-item">
            <view class="feed-source">
                <a class="" @Tap="">
                    <view class="avatar">
                        <image src="../../images/icon1.jpeg"></image>
                    </view>
                    <text>Rebecca</text>
                </a>
            </view>
            <view class="feed-content">
                <view class="answer-body">
                    <view>
                        <text class="answer-txt">难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的... </text>
                    </view>
                    <view class="answer-actions">
                        <view class="like dot">
                            <a>3.9K 赞同 </a>
                        </view>
                        <view class="comments dot">
                            <a>254 评论 </a>
                        </view>
                        <view class="time">
                            <a>2 个月前</a>
                        </view>

                    </view>
                </view>
            </view>
        </view>
        <view @click="bindItemTap" class="feed-item">
            <view class="feed-source">
                <a class="" @Tap="">
                    <view class="avatar">
                        <image src="../../images/icon1.jpeg"></image>
                    </view>
                    <text>Rebecca</text>
                </a>
            </view>
            <view class="feed-content">
                <view class="answer-body">
                    <view>
                        <text class="answer-txt">难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的... </text>
                    </view>
                    <view class="answer-actions">
                        <view class="like dot">
                            <a>3.9K 赞同 </a>
                        </view>
                        <view class="comments dot">
                            <a>254 评论 </a>
                        </view>
                        <view class="time">
                            <a>2 个月前</a>
                        </view>

                    </view>
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
function bindItemTap() {
  uni.navigateTo({
    url: '../answer/answer'
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

.answer-feed {
    padding: 0;
    font-size: 14rpx;
    background: #F0F4F3;
    color: #000;
}
.question-wrp{
    border-radius: 3px;
    box-shadow: 0 1px 2px #bebebe;
}
.question-item{
    width: 710rpx;
    padding: 40rpx 20rpx 10rpx;
    background: #fff;
}
.question-item .que-tag{

}
.question-item .que-tag .tag{
    height: 28rpx;
    padding: 15rpx 20rpx;
    border-radius: 28rpx;
    margin: 0 10rpx;
    background: #EEF5F8;
    color: #2186E0;
    font-size: 28rpx;
    vertical-align: middle;
}
.question-item .que-title{
    padding: 40rpx 20rpx 30rpx;
    font-size: 38rpx;
}
.question-item .que-content{
    padding: 0 20rpx;
    font-size: 26rpx;
}
.question-item .que-follow{
    margin: 20rpx;
    height: 68rpx;
}
.question-item .que-follow view{
    display: inline-block;
    margin: 0 40rpx 0 0;
}

.question-item .que-follow image{
    width: 50rpx;
    height: 50rpx;
    margin: 0 10rpx 0 0;
    vertical-align: middle;
}
.question-item .que-follow .left{
    float: left;
    padding: 10rpx 0;
}
.question-item .que-follow .left text{
    color: #AFAFAF;
    height: 50rpx;
    vertical-align: middle;
    padding: 18rpx 0;
    font-size: 24rpx;
}
.question-item .que-follow .right{
    float: right;
    padding: 20rpx 55rpx;
    color: #ffffff;
    background: #52C980;
    border-radius: 3px;
    font-size: 26rpx;
    margin: 0;
}
.que-operate{
    width: 750rpx;
    border-top: solid 1px #ebebeb;
    border-bottom: solid 1px #ebebeb;
    color: #889091;
    vertical-align: middle;
    background: #ffffff;
}
.que-operate .flex-item{
    padding: 20rpx 0;
    font-size: 26rpx;
}
.que-operate .invite{
    border-right: solid 2px #ebebeb;
}
.que-operate image{
    width: 50rpx;
    height: 50rpx;
    vertical-align: middle;
    margin: 0 20rpx 0 0;
}

/*.answer-feed .feed-item{*/
    /*width: 690rpx;*/
    /*padding: 30rpx 30rpx 20rpx;*/
    /*margin: 7rpx 0 6rpx 0;*/
    /*background: #ffffff;*/
    /*border-top: 1px solid #eee;*/
    /*border-bottom: 1px solid #eee;*/
    /*box-shadow: 0 2px 5px #eeeeee;*/
/*}*/
/*.answer-feed .feed-item .feed-source{*/
    /*width: 690rpx;*/
    /*left: 0;*/
    /*height: 50rpx;*/
/*}*/
/*.answer-feed .feed-item .feed-source .avatar{*/
    /*position: relative;*/
    /*display: inline-block;*/
/*}*/
/*.answer-feed .feed-item .feed-source a{*/
    /*display: inline-block;*/
    /*height: 40rpx;*/
/*}*/
/*.answer-feed .feed-item .feed-source .avatar image{*/
    /*/!*position: absolute;*!/*/
    /*display: inline-block;*/
    /*width: 45rpx;*/
    /*height: 45rpx;*/
    /*border-radius: 45rpx;*/
    /*top: 10rpx;*/
    /*vertical-align: middle;*/
/*}*/
/*.answer-feed .feed-item .feed-source text{*/
    /*/!*position: absolute;*!/*/
    /*display: inline-block;*/
    /*height: 40rpx;*/
    /*line-height: 40rpx;*/
    /*vertical-align: middle;*/
    /*margin: 0 0 0 15rpx;*/
    /*color: #a0acac;*/
    /*font-size: 16rpx;*/
/*}*/
/*.answer-feed .feed-item .feed-source .item-more{*/
    /*display: inline-block;*/
    /*width: 40rpx;*/
    /*height: 45rpx;*/
    /*float: right;*/
/*}*/
/*.answer-feed .feed-item .feed-content{*/
    /*padding: 10rpx 0 0 0;*/
/*}*/
/*.answer-feed .feed-item .feed-content .question text{*/
    /*font-size: 28rpx;*/
    /*font-weight: 600px;*/
    /*line-height: 40rpx;*/
    /*text-space: 5rpx;*/
/*}*/
.answer-feed .feed-item .feed-content .answer-body{
    padding: 0;
    /*height: 10rpx;*/
    font-size: 24rpx;
    line-height: 28rpx;
    color: #5b5b5b;
}
/*.answer-feed .feed-item .feed-content .answer-actions{*/
    /*width: 690rpx;*/
    /*padding: 10rpx 0  0;*/
    /*color: #a0acac;*/
/*}*/
/*.answer-feed .feed-item .feed-content .answer-actions view{*/
    /*display: inline-block;*/
    /*vertical-align: text-bottom;*/
    /*padding: 0 10rpx 0 0;*/
    /*font-size: 24rpx;*/
/*}*/
/*.answer-feed .feed-item .feed-content .answer-actions .dot ::after{*/
    /*content: "•";*/
/*}*/









</style>