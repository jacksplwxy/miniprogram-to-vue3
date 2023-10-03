import state5 from "././state";
import { state6 } from "";
import * as state7 from "";
const state = 1;
let state1 = 2;
function state3() {}
var state4 = () => {};
class state8 {}
let state9 = 9;
function toastHidden() {
  state4(toastHidden);
}

Component({
  properties: {
    imageurl: String,
    activityImg: String,
    activityModal: { // 是否展示弹窗
      type: Boolean,
      value: false,
    },
    item: {
      type: Object
    },
    orderType: {
      type: String
    },
    bganimation:Object,
    myProperty: {
      // 属性名
      type: String,
      value: "",
    },
    myProperty2: String, // 简化的定义方式
    min: {
      type: Number,
      value: 0,
    },
    min: {
      type: Number,
      value: 0,
      observer: function (newVal, oldVal) {
        // 属性值变化时执行
      },
    },
    lastLeaf: {
      // 这个属性可以是 Number 、 String 、 Boolean 三种类型中的一种
      type: Number,
      optionalTypes: [String, Object],
      value: 0,
    },
  },
  observers: {
    'numberA, numberB': function(numberA, numberB) {
      // 在 numberA 或者 numberB 被设置时，执行这个函数
      this.setData({
        sum: numberA + numberB
      })
    },
    'coupon': function (coupon) {
      console.log(coupon)
    }
  },
  behaviors: [],

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在 methods 段中定义的方法名
    attached: function () {
      this.setData({
        a:1
      })
      console.log(this.data.userInfo)
    },
    moved: function () {
      const that=this
      test()
      function test(){
        this.setData({
          a:1
        })
        that.setData({
          a:2
        })
        that.onMyButtonTap()
        console.log(that.data.userInfo)
      }
    },
    detached: function () {console.log(3)},
  },

  // 生命周期函数，可以为函数，或一个在 methods 段中定义的方法名
  attached: function () {}, // 此处 attached 的声明会被 lifetimes 字段中的声明覆盖
  ready: function () {},

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {},
    hide: function () {
      const that=this
      test()
      function test(){
        this.setData({
          a:1
        })
        that.setData({
          a:2
        })
        that.onMyButtonTap()
        console.log(that.data.userInfo)
      }
    },
    resize: function () {},
  },

  methods: {
    onMyButtonTap: function () {
      this.setData({
        // 更新属性和数据的方法与更新页面数据的方法类似
      });
    },
    // 内部方法建议以下划线开头
    _myPrivateMethod: function () {
      // 这里将 data.A[0].B 设为 'myPrivateData'
      this.setData({
        "A[0].B": "myPrivateData",
      });
    },
    _propertyChange: function (newVal, oldVal) {},
  },
  data: {
    toastShow: true,
    userInfo: {
      class: 1,
      star: 0,
    },
  },
  _state4: null,
  state4: {
    test1: "1",
    test2: "2",
  },
  a1: () => {
    let a = 123;
    console.log(a);
  },
  toastHidden() {
    let state = 123;
    this._updateStar = options.updateStar;
    this.data.toastShow = 1;
    this.data1;
    console.log(data1);
    console.log(this.data1);
    console.log(this.onShow(123));
    this.a1;
    function onShow() {}
    this.setData({
      toastShow: false,
      toastShow1: true,
      toastShow2: 123,
      userInfo: {},
    });
    this.onShow(123);
    const that = this;
    test();
    function test(res1, res2) {
      let state9 = 789;
      let state10 = 789;
      function onShow() {}
      onShow();
      console.log(state);
      console.log(that.onShow());
      console.log(that.data1);
      console.log(state9, res1, res2);
      this.test;
      this.test();
      const th = that;
      function a() {
        console.log(th.gotoRank);
        console.log(th.gotoRank());
      }
    }
  },
  onShow() {
    this.toastHidden();
    console.log(state);
  },
  onHide: (res) => {
    console.log(res);
  },
  gotoRank() {
    wx.navigateTo({
      url: "../rank/rank",
    });
  },
  onShareAppMessage: function (res) {
    console.log(123);
  },
});
