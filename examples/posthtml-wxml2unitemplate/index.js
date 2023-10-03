const posthtml = require("posthtml");
const render = require("posthtml-render");
const posthtmlWxml2unitemplate = require("../../packages/posthtml-wxml2unitemplate/index");

const html = `
<!-- <view> {{m1.(new Date())}} </view> -->
<view class="card-info" hidden="{{!isLogin || usrStatus === '20'}}"  style="background: url('http://{{imageRootUrl}}ab'cd'ef{{displayInfo.carBgBig + 'test123'}}')  no-repeat;background-size: 100% 100%;" bindtap="todCard">

</view>
`;

posthtml([posthtmlWxml2unitemplate("", {})])
  // .use((tree) => {
  //   return { tag: "template", content: tree };
  // })
  .process(html, {
    render: (tree) => {
      return render.render(tree, { replaceQuote: false }); //replaceQuote默认为true时："" → &quot;&quot
    },
  })
  .then((result) => console.log(result.html));
