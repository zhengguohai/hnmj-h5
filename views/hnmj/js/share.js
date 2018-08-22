// **
// **Iris

var shareTLT = ["趣牌互娱，叫上亲朋戚友一起来！",
     "一把趣牌，好运自来！",
     "怡情的游戏，益智的玩乐，尽在趣牌互娱！",
     "趣牌互娱休闲棋牌，让你的网络生活不再孤单。",
     "选择趣牌互娱，玩转智慧人生！",
     "游戏玩乐一家亲，趣牌互娱最贴心！",
     "来趣牌互娱，大赢家就是你！",
     "趣牌互娱，让我们成为休闲娱乐的大赢家。",
     "每天趣牌两小时，赢家当足一整天。",
     "工作累了，放松一下，来一把趣牌互娱吧。",
     "“牌”解忧愁，“棋”乐融融。你想要的，都在趣牌互娱！",
     "“牌”除烦恼，“趣”味无穷。尽在趣牌互娱！",
     "趣牌互娱，想玩啥就玩啥！",
     "你还在犹豫什么？快来趣牌互娱玩耍啊！",
     "麻将棋牌跑胡子都有了，就等着你来趣牌互娱了",
     "平常生活太无聊？一般游戏不带劲？你太OUT啦！赶紧来趣牌互娱！",
     "趣牌互娱，给你带来紧张刺激的游戏体验！",
     "趣牌互娱，点一下，玩一年，赢家不花一分钱！",
     "趣牌互娱，游戏赢家的首选！",
     "开局一条龙，胡牌不是梦，趣牌互娱，就是这么轻松！",
    ];


var title = shareTLT[Math.floor(Math.random()*20)];
var desc   = "邀请您一起玩游戏!";
var url = "http://h5hnmj.qu188.com";

var winxin = function (title,desc){
    wx.ready(function () {
        wx.onMenuShareTimeline({
            title:shareTLT[Math.floor(Math.random()*20)],
            desc: desc,
            link: url,
            imgUrl:getImage(),
            trigger: function (res) {
                // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回
                console.log('用户点击分享到朋友圈');
            },
            success: function (res) {
                console.log('已分享');
                API.hideUI("发送朋友圈提示");
            },
            cancel: function (res) {
                console.log('已取消');
            },
            fail: function (res) {
                console.log(JSON.stringify(res));
            }
        });
        wx.onMenuShareAppMessage({
            title:title,
            desc: desc,
            link: url,
            imgUrl:getImage(),
            success: function (res) {
                console.log('分享成功');
                API.hideUI("发送朋友提示");
            },
            cancel: function (res) {
                console.log('已取消');
            },
            fail: function (res) {
                console.log(JSON.stringify(res));
            }
        });


    });
}

// var url = location.href.split('#')[0];
var xmlhttp = new XMLHttpRequest();
xmlhttp.open("POST","/signture",true);
xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
xmlhttp.send("url="+location.href.split('#')[0]);
xmlhttp.onreadystatechange=function()
{
    if (xmlhttp.readyState==4 && xmlhttp.status==200)
    {
        var res =JSON.parse(xmlhttp.responseText);
        var data= res.signs;
        wx.config({
            debug: false,
            appId: res.appId,
            timestamp: data.timestamp,
            nonceStr: data.nonceStr,
            signature: data.signature,
            jsApiList: [
                'checkJsApi',
                'onMenuShareTimeline',
                'onMenuShareAppMessage',
                'onMenuShareQQ'
            ]
        });
        winxin(title,desc);

    }
}









// var url = location.href.split('#')[0];
// API.ajax("/signture",{url:location.href.split('#')[0]},"POST",function (res) {
//     wx.config({
//         debug: false,
//         appId: res.appId,
//         timestamp: res.signs.timestamp,
//         nonceStr: res.signs.nonceStr,
//         signature: res.signs.signature,
//         jsApiList: [
//             'checkJsApi',
//             'onMenuShareTimeline',
//             'onMenuShareAppMessage',
//             'onMenuShareQQ'
//         ]
//     });
//     winxin(title,desc);
// });

//   $.ajax({
//     url: "/signture",
//     type: 'post',
//     data: { url:location.href.split('#')[0] },
//     success:function(res){
//      wx.config({
//         debug: false,
//             appId: res.appId,
//             timestamp: res.signs.timestamp,
//             nonceStr: res.signs.nonceStr,
//             signature: res.signs.signature,
//             jsApiList: [
//             'checkJsApi',
//             'onMenuShareTimeline',
//             'onMenuShareAppMessage',
//             'onMenuShareQQ'
//         ]
//         });
//         winxin(title,desc);
//     }
//
//   });
//
// winxin(title,desc);



//在微信里不可直接调用分享

// function shareTimeline(){
//
//     wx.onMenuShareTimeline({
//         title:title,
//         desc: desc,
//         link: url,
//         imgUrl:getImage(),
//         success: function (res) {
//             console.log('分享成功');
//         },
//         cancel: function (res) {
//             console.log('已取消');
//         },
//         fail: function (res) {
//             console.log(JSON.stringify(res));
//         }
//     });
// }
//
//
// function shareAppMessage(title,desc){
// //分享朋友
//     wx.onMenuAppMessage({
//         title:title,
//         desc: desc,
//         link: url,
//         imgUrl:getImage(),
//         success: function (res) {
//             console.log('分享成功');
//         },
//         cancel: function (res) {
//             console.log('已取消');
//         },
//         fail: function (res) {
//             console.log(JSON.stringify(res));
//         }
//     });
// }


  // 获取图片
  function getImage() {
    return 'http://'+location.host+'/assets/common3/icon.png';
  };