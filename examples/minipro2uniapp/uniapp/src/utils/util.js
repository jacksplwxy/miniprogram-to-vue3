import _dataData_discovery_nextJs from "../data/data_discovery_next.js";
import _dataData_discoveryJs from "../data/data_discovery.js";
import _dataData_index_nextJs from "../data/data_index_next.js";
import _dataData_indexJs from "../data/data_index.js";
let module = {
  exports: {}
};
let exports = module.exports;
function formatTime(date) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hour = date.getHours();
  let minute = date.getMinutes();
  let second = date.getSeconds();
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}
function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
}
module.exports = {
  formatTime: formatTime
};
let index = _dataData_indexJs;
let index_next = _dataData_index_nextJs;
let discovery = _dataData_discoveryJs;
let discovery_next = _dataData_discovery_nextJs;
function getData(url) {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: {},
      header: {
        //'Content-Type': 'application/json'
      },
      success: function (res) {
        console.log("success");
        resolve(res);
      },
      fail: function (res) {
        reject(res);
        console.log("failed");
      }
    });
  });
}
function getData2() {
  return index.index;
}
function getNext() {
  return index_next.next;
}
function getDiscovery() {
  return discovery.discovery;
}
function discoveryNext() {
  return discovery_next.next;
}
module.exports.getData = getData;
module.exports.getData2 = getData2;
module.exports.getNext = getNext;
module.exports.getDiscovery = getDiscovery;
module.exports.discoveryNext = discoveryNext;
export default module.exports;