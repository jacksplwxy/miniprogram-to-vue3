// 微信小程序事件文档：https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/event.html
// · 一些规范：
//   ~ 自基础库版本 1.5.0 起，在大多数组件和自定义组件中， bind 后可以紧跟一个冒号，其含义不变，如 bind:tap 。基础库版本 2.8.1 起，在所有组件中开始提供这个支持。

// 事件传播类型，通常为事件名的前缀
const EventPropagationType = [
  "bind",
  "catch",
  "mut-bind",
  "capture-bind",
  "capture-catch",
];

// 事件类型映射关系表,key为uni的事件类型，val为小程序事件类型
const EventTypeMap = {
  click: "tap",
  touchstart: "touchstart",
  touchmove: "touchmove",
  touchcancel: "touchcancel",
  touchend: "touchend",
};

// 判定属性key是否为事件的正则，例如bind:tap
const EventReg = new RegExp(
  `^(${EventPropagationType.join(
    "|"
  )}):?(([^\x00-\xff]|[a-zA-Z_$])([^\x00-\xff]|[a-zA-Z0-9_$])*)$`
);

module.exports = {
  EventPropagationType,
  EventTypeMap,
  EventReg,
};
