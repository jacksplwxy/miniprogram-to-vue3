import { ready } from "@dcloudio/uni-app";
import { reactive } from "vue";
import { watch } from "vue";
import state5 from "././state";
import { state6 } from "";
import * as state7 from "";
const _state = 1;
let state1 = 2;
function state3() {}
let _state2 = () => {};
class state8 {}
let state9 = 9;
function _toastHidden() {
  _state2(_toastHidden);
}
const state = reactive({
  toastShow: true,
  userInfo: {
    class: 1,
    star: 0
  }
});
const props = defineProps({
  imageurl: String,
  activityImg: String,
  activityModal: {
    // 是否展示弹窗
    type: Boolean,
    value: false
  },
  item: {
    type: Object
  },
  orderType: {
    type: String
  },
  bganimation: Object,
  myProperty: {
    // 属性名
    type: String,
    value: ""
  },
  myProperty2: String,
  // 简化的定义方式
  min: {
    type: Number,
    value: 0
  },
  min: {
    type: Number,
    value: 0,
    observer: function (newVal, oldVal) {
      // 属性值变化时执行
    }
  },
  lastLeaf: {
    // 这个属性可以是 Number 、 String 、 Boolean 三种类型中的一种
    type: [String, Object, Number],
    value: 0
  }
});
watch([numberA,  numberB], function (numberA, numberB) {
  // 在 numberA 或者 numberB 被设置时，执行这个函数
  state.sum = numberA + numberB;
});
watch([coupon], function (coupon) {
  console.log(coupon);
});
function attached() {
  state.a = 1;
  console.log(state.userInfo);
}
function moved() {
  const that = this;
  test();
  function test() {
    this.setData({
      a: 1
    });
    state.a = 2;
    onMyButtonTap();
    console.log(state.userInfo);
  }
}
function detached() {
  console.log(3);
}
ready(function () {});
function onShow() {}
function onHide() {
  const that = this;
  test();
  function test() {
    this.setData({
      a: 1
    });
    state.a = 2;
    onMyButtonTap();
    console.log(state.userInfo);
  }
}
function onResize() {}
function onMyButtonTap() {}
function _myPrivateMethod() {
  // 这里将 data.A[0].B 设为 'myPrivateData'
  state.A[0].B = "myPrivateData";
}
function _propertyChange(newVal, oldVal) {}
let _state4 = null;
let state4 = {
  test1: "1",
  test2: "2"
};
let a1 = () => {
  let a = 123;
  console.log(a);
};
function toastHidden() {
  let state = 123;
  _updateStar = options.updateStar;
  state.toastShow = 1;
  data1;
  console.log(data1);
  console.log(data1);
  console.log(onShow(123));
  a1;
  function _onShow() {}
  state.toastShow = false;
  state.toastShow1 = true;
  state.toastShow2 = 123;
  state.userInfo = {};
  onShow(123);
  const that = this;
  test();
  function test(res1, res2) {
    let state9 = 789;
    let state10 = 789;
    function _onShow2() {}
    _onShow2();
    console.log(state);
    console.log(onShow());
    console.log(data1);
    console.log(state9, res1, res2);
    this.test;
    this.test();
    const th = that;
    function a() {
      console.log(gotoRank);
      console.log(gotoRank());
    }
  }
}
function onShow() {
  toastHidden();
  console.log(_state);
}
let onHide = res => {
  console.log(res);
};
function gotoRank() {
  uni.navigateTo({
    url: "../rank/rank"
  });
}
function onShareAppMessage(res) {
  console.log(123);
}