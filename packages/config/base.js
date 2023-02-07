const config = {
  // 将小程序data转换为reactive的赋值申明变量名称
  stateKeyWord: "state",
  // 将小程序properties转换为defineProps的赋值申明变量名称
  propsKeyWord: "props",
  // 全局对象映射关系表
  globalsMap: {
    wx: "uni",  // wx映射为uni
  },
};

module.exports = {
  config,
};
