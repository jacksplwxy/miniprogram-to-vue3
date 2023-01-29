import { onShow, onShareAppMessage } from "@dcloudio/uni-app";
import { reactive } from "vue";
const _state = 1;
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
function _toastHidden() {
  console.log('outerToastHidden');
}