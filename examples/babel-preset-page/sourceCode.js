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