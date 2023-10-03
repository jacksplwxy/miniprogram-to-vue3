import state5 from '././state'
import {state6} from ''
import * as state7 from ''
const state=1
let state1=2
function state3(){}
var state4=()=>{}
class state8{}
let state9=9
function toastHidden(){
  state4(toastHidden)
}

Page(
  {
  data: {
    toastShow: true,
    userInfo: {
      'class': 1,
      'star': 0
    }
  },
  _state4:null,
  state4:{
    test1:'1',
    test2:'2',
  },
  a1:()=>{
    let a=123
    console.log(a)
  },
  toastHidden() {
    let state=123
    this._updateStar = options.updateStar
    this.data.toastShow=1
    this.data1
    console.log(data1)
    console.log(this.data1)
    console.log(this.onShow(123))
    this.a1
    function onShow(){}
    this.setData({
      toastShow: false,
      toastShow1: true,
      toastShow2: 123,
      userInfo:{}
    })
    this.onShow(123)
    const that=this
    test()
    function test(res1,res2){
      let state9=789
      let state10=789
      function onShow(){}
      onShow()
    	console.log(state)
      console.log(that.onShow())
      console.log(that.data1)
      console.log(state9,res1,res2)
      this.test
      this.test()
      const th=that
      function a(){
        console.log(th.gotoRank)
        console.log(th.gotoRank())
      }
    }
  },
  onShow() {
    this.toastHidden()
    console.log(state)
  },
  onHide:(res)=>{
    console.log(res)
  },
  gotoRank() {
    wx.navigateTo({
      url: '../rank/rank',
    })
  },
  onShareAppMessage: function (res) {
    console.log(123)
  },
}
)