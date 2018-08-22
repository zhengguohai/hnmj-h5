/** 参考文档当中新引擎2018.7.11*/
var api = Can.api,

    $ = (name) => api.getUI(name), //获取显示对象

    show = (name, parent) => api.showUI(name, parent), //显示组件 show(组件id,父组件id)

    hide = (name) => api.hideUI(name), //关闭组件 hide(组件id)

    update = (name) => api.update(name),

    create = (id, templateId, parent = null, style = null) => api.createUI(id, -1, templateId, parent, style);


var kaifang = ["仅会长开房", "所有人可开房"];
var fangka = ["仅会长扣卡", "扣开房者房卡", "AA开房", "扣大赢家房卡"];
var tiaojian = ["趣友圈成员", "任何人"];


//运行js脚本(main)
Game.intClub = function () {
    API.update("数值组");
    //WS.serverID = API.data.clubServerID;
    console.log("======服务器ID===", WS.serverID, API.data.userID);
    WS.socket.send(WS.writeMessage(1000));
    // delete API.data.clubKey
    API.data._type = 0;
    API.data.pageIdx = 1;
    API.data.curPage = 0;
    API.data.maxPage = 0;
    API.data.pageMax = 25;
    API.data.chengyuanID = 0;
}

Game.gotoRoom = function (d) { //2000收//改
    var res = API.data;
    var json= d.readString();
    res.player_custom_json_str = d.readString();
    API.update("数值组");
    json = JSON.parse(json);
    if (json.SERVER_MODEL === "zzmj" || json.SERVER_MODEL === "hz") {
        console.log("--------------- zzmj or hz");
        API.load("bin/game.json", function () {
            console.log("load game completed");
            API.hideUI("大厅");
            API.update("数值组");
        });
    } else if (json.SERVER_MODEL.search("paohuzi") != -1) {
        console.log("--------------- paohuzi");
        API.load("bin/gameWindow.json", function () {
            console.log("load phz completed");
            API.hideUI("大厅");
            API.update("数值组");
        })
    }else if (json.SERVER_MODEL === "pdk" ){
        API.data.playerNum = json.PLAYER_COUNT;
        API.load("bin/gamePdk.json", function () {
            console.log("load pdk completed");
            API.hideUI("大厅");
            API.update("数值组");
        })
    }
}
Game.onCheckConnect_two = function (d) {
    console.log("=======", Game.onCheckConnect_two);
}

//1000
Game.onConnectCheck = function (d) {
    var res = API.data;
    if (res.going2Hall) {
        console.log("不是俱乐部的1000");
        // app.json的1000
        // var str1 = d.readString();
        // var str2 = d.readInt();
        // var str3 = d.readInt();
        // var str4 = d.readBoolean();
        // console.log("str1:", str1, "str2:", str2, "str3:", str3, "str4:", str4);
        res.going2Hall = false;
        return;
    }
    res.clubName = d.readString(); //趣友圈名字
    res.clubID = d.readLong(); //趣友圈id
    res.clubIcon = d.readString(); //趣友圈图标
    res.clubIcon = "icon" + res.clubIcon; //趣友圈图标
    //	res.clubIcon = res.clubIcon.substr(0, res.clubIcon.length - 1);
    res.playerID = d.readLong(); //玩家ID
    res.clubPeopleNum = d.readShort(); //趣友圈成员数
    res.clubPeopleMaxNum = d.readShort(); //趣友圈最大成员数
    console.log("clubName:", res.clubName, "clubID:", res.clubID, "clubIcon:", res.clubIcon, "playerID:", res.playerID, "clubPeopleNum:", res.clubPeopleNum, "clubPeopleMaxNum:", res.clubPeopleMaxNum);
    res.clubQunzhuName = d.readString(); //群主名字
    res.clubQunzhuID = d.readLong(); //群主ID
    res.clubQunzhuAccountID = d.readInt(); //群主accountID
    res.isClubQunzhu = res.clubQunzhuID == res.userID;
    //和客户端一致2018.7.11
    // res.clubGuanliyuanName = d.readString(); //管理员名字
    // res.clubGuanliyuanID = d.readLong(); //管理员ID
    // res.clubGuanliyuanAccountID = d.readInt(); //管理员accountID
    // res.clubGuanliyuanName = res.clubGuanliyuanID ? res.clubGuanliyuanName : "暂无";
    res.isGuanliyuan = false;
    var glySize = d.readShort();
    var glyList = [];
    for (var i = 0; i < glySize; i++) {
        var data = {};
        data.playerName = d.readString(); //管理员名字
        data.playerID = d.readLong(); //管理员ID
        data.playerAccountID = d.readInt(); //管理员accountID
        data.dismissCnt = 0;
        //判断是否为管理员
        res.isGuanliyuan = data.playerID == res.userID;
        glyList.push(data);

    }

    res.glyList = glyList;


    //第一楼层的玩法信息
    var res = {};
    res.index = d.readByte();
    res.privilege = d.readByte();
    res.deduct = d.readByte();
    res.cardCfg = d.readString();
    res.join = d.readByte();
    res.playSetting = d.readString();
    res.floor = res.curFloorindex = res.index;
    tower.updateFloorInfo(res);
    console.log("初始楼层信息", res);
    console.log("888888", res.floor, API.data.clubID);
    getDeskImg(res.playSetting);

    // 请求房间列表
    Game.requestFloorRoomList(API.data.clubID, res.floor);

    // var playRuleNum = d.readByte();
    // var playRuleTb = [];
    // for (var i = 0; i < playRuleNum; i++) {
    //     var item = d.readString();
    //     playRuleTb[i] = item;
    // }

    if (res.playSetting == "") {
        API.runActionGroup("显示", "提示弹窗");
    }

    // if (API.getUI("提示弹窗")) {
    // }

    if (API.getUI("切换弹窗")) {
        Game.send(1409);

    }
    API.hideUI(["切换弹窗", "屏蔽遮罩"]);

    // if (!API.getUI("主容器")) API.showUI("主容器");
    // else API.update("主容器");

    if (!API.getUI("主容器")) {
        API.showUI("主容器");
    } else {
        API.update("主容器");
    }

    //	API.showUI("主容器");
    //	WS.socket.send(WS.writeMessage(1403));
    console.log("----数据---", API.data);
}

/**
* 判断是否管理员
* isTrue
*/


function isGuanliyuan(userID) {
    var glyList = API.data.glyList;
    for (var i = 0; i < glyList.length; i++) {
        if(glyList[i].playerID=== userID){
            return true;
        }
        // isTrue = glyList[i].playerID === userID;
    }
    return false;
}


//1403(收)
Game.onOpenRoomList = function (d) { //开房列表
    "use strict";
    var res = API.data;
    res.roomType = d.readByte();
    res.deskTotal = d.readByte();
    res.pageIdx = d.readByte();
    res.deskNum = d.readByte();
    res.pageMax = (res.deskTotal - 1) / res.deskNum;
    console.log("1403 开房列表 -> pageIdx:", res.pageIdx, "roomType:", res.roomType, "pageMax:", res.pageMax, "deskNum:", res.deskNum, "deskTotal:", res.deskTotal);

    if (res.roomType == 2) {
        res.roomNum = d.readShort();

        if(res.roomNum ==0){
            API.runActionGroup("错误提示","暂无记录");
        }

        res.endRoomTb = [];
        for (var i = 0; i < res.roomNum; i++) {
            var item = parseOneRoomList(d);
            item.gameType = getGameName(item.gameType);
            item.createTime  = new Date().format("YYYY/MM/DD hh:mm:ss");
            res.endRoomTb[i]= item;

        }
        API.showUI("结束弹窗");
        $("结束弹窗列表").value = res.endRoomTb;
        console.log(res.endRoomTb);
        for(var i=0;i<res.endRoomTb.length;i++){
            console.log(res.endRoomTb[i].playerTb);
            $("结束玩家["+i+"]").value = res.endRoomTb[i].playerTb;
        }

        return ;
    }


    if (res.pageIdx === 0) {
        res.pageIdx = 1;
        return;
    }

    //根据桌子情况去判断&&并且||或
    if (res.pageIdx < 0 || res.pageIdx > res.pageMax) return;

    // 设置页码背景
    for (var i = 1; i <= res.pageMax; i++) {
        res["pageRect" + i] = i === res.pageIdx ? "mat" : "btn_point1";    // 页码的背景
    }
    API.update("页数显示框");
    var floorInfo = tower.getFloorInfo();
    getDeskImg(floorInfo ? floorInfo.playSetting : "");

    // var playerTb = [{}, {}, {}, {}];
    // if (res.clubRuleTab) {
    //     var o = eval('(' + res.clubRuleTab + ')');
    //     res.numPlayer = o.PLAYER_COUNT;
    // } else {
    //     res.numPlayer = 4;
    // }
    // res.roomTb = [];
    // for(var j=0;j<6;j++){
    //     var k = j+1;
    //     res.roomTb[j] = {
    //         "img": "desk_mj_normal" + res.numPlayer,
    //         "index": k + res.pageIdx * 6 - 6,
    //         playerTb: playerTb
    //     }
    // }


    if (res.pageIdx <= res.pageMax) {
        API.update(...["共页数", "页数1", "玩法桌列表"]); //更新的是第几页和共第几页的数量

    }
    //修复bug2018.4.22
    if (API.data.playRuleNum == 0) {
        API.data["playRules"] = "未设置玩法";
    }

    API.hideUI(["创建房间玩法", "屏蔽遮罩", "预加载", "加载界面"]); //改
    API.update(...["玩法文本", "玩法管理", "更多玩法小背景图"]);
    console.log("1403", API.data);
}

function getDeskImg(str){
    var obj = {};
    if (str && str !== "") {
        obj = JSON.parse(str);
    }
    var count = obj.PLAYER_COUNT ? obj.PLAYER_COUNT : 4;
    var res = API.data;
    res.roomTb = [];
    var playerTb = [{}, {}, {}, {}];
    for(var j=0;j<6;j++){
        var k =j+1;
        res.roomTb[j] = {
            "img": "desk_mj_normal" + count,
            "index": k + res.pageIdx * 6 - 6,
            "playerTb":playerTb
        }

        if(obj.SERVER_MODEL==="pdk") res.roomTb[j].img= "desk_qp" + count;
    }
    return res.roomTb
}



//1409(收)
Game.onClubSetting = function (d) {
    "use strict";
    var res = API.data;
    res.clubID = d.readLong(); //俱乐部id
    res.clubName = d.readString(); //俱乐部名字
    res.clubQunzhuName = d.readString(); //群主名字
    res.clubQunzhuID = d.readLong(); //群主ID
    res.clubQunzhuAccountID = d.readInt(); //群主accountID
    res.clubIcon = d.readString(); //俱乐部图标
    res.clubIcon = "icon" + res.clubIcon; //俱乐部图标
    //	res.clubIcon = res.clubIcon.substr(0, res.clubIcon.length - 1);
    console.log("1409 -> clubName:", res.clubName, "id:", res.clubID);
    res.clubDesc = d.readString(); //俱乐部宣言
    res.clubNotice = d.readString(); //俱乐部公告
    res.clubCreateTime = d.readString(); //俱乐部创建时间
    res.clubCondition = d.readByte(); //俱乐部进入条件
    res.isOpen = d.readByte();//数据统计开关 0不公开 1公开
    var a = ["申请加入", "", "拒绝加入"]; //0 需要申请 1 不需要申请即可加入  2 拒绝加入
    res.clubConditionText = a[res.clubCondition];
    res.clubAdress = d.readString(); //俱乐部地址
    res.clubJoinReqNum = d.readShort(); //申请列表个数

    API.hideUI("重置解散房间按钮");
    console.log("1409协议数据", API.data);

    if (!API.getUI("设置弹窗")) return;

    API.update(...["设置弹窗", "申请加入", "俱乐部图标", "加入弹窗"]);

    API.getUI("数字名称").value = res.clubName;
    API.getUI("框信息1").value = res.clubDesc;
    API.getUI("框信息2").value = res.clubNotice;

    if(res.isGuanliyuan==true){
        Game.send(1454);
    }

}

//=========================点击俱乐部管理发送协议1404和接收到的协议=============================================//
//发1404
Game.send1404 = function () {
    "use strict";
    var d = API.data;
    var r = WS.writeMessage(1404, null, write);
    WS.socket.send(r);

    function write(writer) {
        writer.writeLong(d.clubID);
        writer.writeByte(d.model);
        if (d.model == 0) { //开房权限
            writer.writeByte(d.value);
        } else if (d.model == 1) { //扣卡选项. 0:扣会长卡，1扣开房者卡 2aa开房 3扣大赢家卡
            writer.writeByte(d.value);
            if (d.value == 3) {
                writer.writeString(d.valueJson);
            }
        } else if (d.model == 2) { //加入房间条件
            console.log("类型by,by" + d.model, d.value);
            writer.writeByte(d.value);
        } else if (d.model == 3) {
            console.log(d.valueJson);
            writer.writeString(d.valueJson); //游戏配置对应参数
            writer.writeByte(d.operationCode); // 0添加  1修改  2删除
            d.operationCode = 0 ? "" : writer.writeByte(0);
            if (d.operationCode == 0) {
                API.hideUI("创建房间玩法");
            }
        }
        //console.log("=====发送协议send1404当中的函数方法write值===", writer);
    }
}

//1404(收)
Game.onModifyGameSetting = function (d) {
    "use strict";
    var res = API.data;
    res.model = d.readByte();
    res.result = d.readByte();
    API.runActionGroup("关闭");
}

/**
 * 大赢家扣卡设置
 * DayingjiaKouka  eight sixteen
 */

function setEight(count) {
    var idx = count - 1;
    if (idx > 5) {
        return;
    }
    for (var i = 0; i < 6; i++) {
        API.getUI("列表1[" + i + "]").appendStyle({
            backgroundImage: "btn_s_red"
        })
    }
    for (var i = 6; i < 12; i++) {
        API.getUI("列表1[" + i + "]").appendStyle({
            backgroundImage: "btn_huise"
        })
    }
    console.log(idx, "列表1[" + idx + "]");
    API.getUI("列表1[" + idx + "]").appendStyle({
        backgroundImage: "btn_xuanzhong"
    })
    API.data.DayingjiaKouka.eight = count;
}

function setSixteen(count) {
    var idx = count - 1;
    API.getUI("列表2[0]").appendStyle({
        backgroundImage: "btn_huise"
    })
    for (var i = 1; i < 12; i++) {
        API.getUI("列表2[" + i + "]").appendStyle({
            backgroundImage: "btn_s_red"
        })
    }
    API.getUI("列表2[" + idx + "]").appendStyle({
        backgroundImage: "btn_xuanzhong"
    })
    API.data.DayingjiaKouka.sixteen = count;
}


//=========================以上就是点击俱乐部管理发送协议1404和接收到的协议=============================================//

//==========================以下是点击桌布的时候发送的协议过去============================//
Game.onClickDesk = function (index) {
    "use strict";
    var res = API.data;
    res.deskIdx = res.roomTb[index].index - 1;
    res.roomID = res.roomTb[index].id;
    if (res.playRuleNum == 0) {
        API.runActionGroup("错误提示", "会长或管理员未设置玩法规则,不能创建房间");
        return;
    }
    if (res.roomTb[index].curPeopleNum === undefined) {
        // 请求开房
        tower.requestCreateRoom(index);
    } else {
        WS.socket.send(WS.writeMessage(1410, null, function (writer) {
            console.log("俱乐部发送1410加入房间, clubID:", res.clubID, "roomId:", res.roomID);
            writer.writeLong(res.clubID);
            writer.writeInt(res.roomID);
            writer.writeByte(0);
        }));
    }

    //WS.socket.send(WS.writeMessage(1411));
    //WS.socket.send(WS.writeMessage(2000));
}

//1415(收)
Game.onUpdateRoomInfo = function (d) { //更新单条房间信息 如果房间不存在则添加 存在则修改
    "use strict";
    var res = API.data;
    var o = parseOneRoomList(d);
    var dskIndex = o.deskIdx % 6;
    console.log("ffff",o.deskIdx);
    console.log("-------", dskIndex);
    if (!res.roomTb[dskIndex]) {
        res.roomTb[dskIndex] = o;
    } else
        res.roomTb[dskIndex] = Object.assign(res.roomTb[dskIndex], o);
    var model = tower.getFloorServerModel();
    var url = model === "pdk" ? "desk_qp" : "desk_mj_normal";
    res.roomTb[dskIndex].img = url + o.maxPeopleNum;
    console.log("DDD",o.maxPeopleNum);

    API.timer.remove("倒计时");
    API.timer.play(30, 9, countDown, null, true, "倒计时");
    //countDown();
    API.timer.play(3, 1, null,
        function () {
            API.update(...["玩法桌列表"]);
        }
    )
    //	API.update(...["玩法桌列表"]);
}

//单独写的方法进来
function countDown() {
    var d = API.data.roomTb;
    //if(d)return;
    for (var n = 0; n < d.length; n++) {
        if (d[n].surplusTime) {
            d[n].surplusTime--;
            d[n].time = Date.numToTime(d[n].surplusTime);
        }
        API.update("倒计时时间[" + n + "]");
    }
}

//单独写方法方便给调用
function parseOneRoomList(d) {
    "use strict";
    var item = {};
    item.id = d.readInt();
    item.status = d.readByte();
    item.surplusTime = d.readInt() / 1000;
    item.curPeopleNum = d.readByte();
    item.maxPeopleNum = d.readByte();
    item.createTime = d.readLong() / 1000;
    item.endTime = d.readLong() / 1000;
    item.roundNum = d.readByte();
    item.zhaNum = d.readByte();

    item.roomOwnerID = d.readLong();
    item.roomOwnerAccountID = d.readInt(); //显示用accountID

    item.roomOwnerName = d.readString();
    item.roomOwnerIcon = d.readString();
    item.finishRoundNum = d.readByte();
    item.gameType = d.readString(); //房间的server_model
    item.deskIdx = d.readShort();
    item.startDeskUserID = d.readLong(); //开这个房的人
    item.startDeskUserName = d.readString();
    item.startDeskUserAccountID = d.readInt();

    item.playerNum = d.readByte();
    item.playerTb = [];

    for (var i = 0; i < 4; i++) {
        var item2 = {};
        if (i < item.playerNum) {
            item2.playerID = d.readLong();
            item2.accountID = d.readInt();
            item2.playerWXID = d.readString();
            item2.playerName = d.readString();
            item2.iconUrl = d.readString();
            item2.score = d.readShort();
            item2.isOnline = d.readBoolean(); //是否在线
        }

        item.playerTb.push(item2);
        //	res.clubTb.push(JSON.parse(d.readString()));
    }
    item.canDismiss = d.readBoolean(); //是否可以解散

    console.log(item);
    return item
}

//==========================以上是点击桌布的时候发送的协议过去============================//

//1428(收切换弹窗)
Game.onClubList = function (d) {
    "use strict";
    var res = API.data;
    res.clubNum = d.readByte(); //趣友圈数量
    res.clubTb = []; //这里的表是要在引擎当中俱乐部列表获取数据的值当中去填写的值
    for (var n = 0; n < res.clubNum; n++) {
        var s = d.readString();
        res.clubTb.push(JSON.parse(s)); //趣友圈info
        res.clubTb[n].clubHead = "icon" + res.clubTb[n].clubHead;
        if (res.clubTb[n].createrId == res.userID) {
            res.clubTb[n].isIcon = "wo";
        } else if (res.clubTb[n].clubManagerId == res.userID) {
            res.clubTb[n].isIcon = "guan";
        } else {
            res.clubTb[n].isIcon = "hui";
        }
    }
    res.pageIdx = 1;
    if (API.getUI("切换弹窗")) API.update("俱乐部列表");
    else API.runActionGroup("显示", "切换弹窗");
}

//1401(申请列表)
Game.onJoinList = function (d) {
    "use strict";
    var res = API.data;
    res.total = d.readShort();
    res.maxPage = d.readShort();
    res.curPage = d.readShort();
    res.onePageMax = d.readByte();
    res.num = d.readByte(); //请求数量
    res.joinList = [];
    for (var i = 0; i < res.num; i++) {
        var info = {};
        info.id = d.readLong(); //id
        info.userID = d.readLong(); //申请人id
        info.accountID = d.readInt(); //申请人accountID
        info.name = d.readString(); //申请人名字
        info.icon = d.readString(); //申请人图标
        info.time = d.readString(); //申请时间
        res.joinList.push(info);
    }
    API.update(...["申请列表加载", "页数"]);
    console.log("====onJoinList====" + API.data);
}

//2018.4.18
//1414(玩家列表)
Game.onMemberList = function (d) {
    "use strict";
    var res = API.data;
    res.belongID = d.readLong();
    console.log("res.belongID====", res.belongID);
    res.totalMember = d.readShort();
    res.maxPageMember = d.readByte();
    res.curPageMember = d.readByte();
    res.curShowNumMember = d.readByte();
    res.numMember = d.readByte();
    res["成员列表"] = [];
    if (res.belongID === 0) {
        res.important = [];
        res["重要成员"] = [];
    }
    for (var i = 0; i < res.numMember; i++) {
        var o = {};
        o.id = d.readLong(); //玩家唯一id
        o.playerID = d.readLong(); //玩家id
        o.playAccountID = d.readInt(); //玩家账号ID
        o.playerName = d.readString(); //玩家名字
        //		o.playerName = o.playerName.substring(0, o.playerName.length - 1);
        o.icon = d.readString(); //玩家头像
        o.jiarutime = d.readString(); //加入时间
        o.beizhu = d.readString(); //备注
        o.isHeimingdan = d.readBoolean(); //是否黑名单
        o.status = d.readByte(); //0离线 1在线 2游戏中
        //		o.beizhu = o.beizhu.substring(0, o.beizhu.length - 1);
        o.playerName = o.beizhu.length > 0 ? o.beizhu : o.playerName;
        o.beizhu = o.beizhu.length > 0 ? o.beizhu : "暂无";
        o.isCreater = o.playerID == res.clubQunzhuID ? true : false;
        o.isGuanliyuan = isGuanliyuan(o.playerID);//管理员是一个列表
        o.isSrc = "";

        if (o.isCreater) {
            o.isSrc = "huizhang";
            if (res.belongID === 0) { res["重要成员"].push(o);}
        } else if (o.isGuanliyuan) {
            o.isSrc = "guanli";
            if (res.belongID === 0) { res["重要成员"].push(o);}
        }

        if (o.status == 1) {
            o.statusSrc = "zaixian";
        } else if (o.status == 2) {
            o.statusSrc = "youxzizhong";
        } else { //剩下的都离线
            o.statusSrc = "lixian";
        }
        res["成员列表"][i] = o;
    }

    if (res.belongID == 0) {
        for (var k = 0; k < res["重要成员"].length; k++) {
            if (res["重要成员"][k].isCreater) {
                res.important.unshift({
                    title: "会长成员",
                    chengyuanID: res["重要成员"][k].playerID
                });
            } else
                res.important.push({
                    title: "管理员成员" + [k],
                    chengyuanID: res["重要成员"][k].playerID
                });
        }
    }
    API.showUI("成员列表弹窗");
    if(res.isOpen==1 || res.userID == res.clubQunzhuID || isGuanliyuan(res.userID))
        $("群数据统计").visible = true;
    else $("群数据统计").visible = false;

    $("重要统计").visible = false;
    $("重要成员").visible = true;
    $("重要成员").value = res.important;
    $("重要成员").flex();
    $("左标题栏").flex();
    if (res.belongID == 0) {
        API.getUI("群成员统计").appendStyle({
            backgroundImage: "btn_yq_22",
            color: "rgba(237,253,222,1)"
        });

        API.getUI("群数据统计").appendStyle({
            backgroundImage: "btn_yq_11",
            color: "rgba(116,90,54,1)"
        });
    }
    API.hideUI(["数据统计", "数据清零"]);
    API.update("成员列表");
    API.showUI("成员列表框");
}

function getMemberMsg(Idx) {
    var res = API.data;
    res.chengyuanID = res["重要成员"][Idx].playerID;

    // console.log(res["成员列表"]);
    API.update("成员列表框");
    for (var i = 0; i < res["重要成员"].length; i++) {
        $("重要成员按钮[" + i + "]").appendStyle({
            backgroundImage: "btn_yq_22",
            color: "rgba(237,253,222,1)"
        });

    }
    $("重要成员按钮[" + Idx + "]").appendStyle({
        backgroundImage: "btn_yq_11",
        color: "rgba(116,90,54,1)"
    });
    API.getUI("群成员统计").appendStyle({
        backgroundImage: "btn_yq_11",
        color: "rgba(116,90,54,1)"
    });
    API.getUI("群数据统计").appendStyle({
        backgroundImage: "btn_yq_11",
        color: "rgba(116,90,54,1)"
    });
    Game.send(1414);
}

//2018.4.18
//1434数据统计
Game.onClubDataStatistics = function (d) {
    var res = API.data;
    res.belongID = d.readLong();
    res.DataStatisticsSumRound = d.readInt();
    res.DataStatisticsSum = d.readShort();
    res.maxPageData = d.readShort();
    res.curPageData = d.readShort();
    res.maxNumOfPageData = d.readByte();
    res.curNumOfPageData = d.readByte();
    res["数据统计"] = [];
    if (res.belongID === 0) {
        res["重要统计"] = [],
            res.important2 = [];
    }
    for (var i = 0; i < res.curNumOfPageData; i++) {
        var member = {};
        member.index = i + 1;
        member.icon = "rank" + member.index;
        member.id = d.readLong();
        member.userID = d.readLong();
        member.accountID = d.readInt(); //成员accountID
        member.userName = d.readString();
        member.JuNum = d.readInt(); //局数
        member.WinNum = d.readShort(); //赢次数
        member.HuNum = d.readShort(); //胡次数
        member.WLScore = d.readInt(); //玩家累计
        if (res.curPageData == 1 && member.index < 4) member.icon = "winicon" + member.index;

        if (res.belongID === 0) {
            if (member.userID == res.clubQunzhuID || isGuanliyuan(member.userID)) {
                res["重要统计"].push(member);
            }
        }
        res["数据统计"][i] = member;
    }

    if (res.belongID === 0) {
        for (var k = 0; k < res["重要统计"].length; k++) {
            if (res["重要统计"][k].userID == res.clubQunzhuID) {
                res.important2.unshift({
                    title: "会长统计",
                    chengyuanID: res["重要统计"][k].userID
                });
            } else
                res.important2.push({
                    title: "管理员统计" + [k],
                    chengyuanID: res["重要统计"][k].userID
                });
        }
    }
    API.showUI("成员列表弹窗");
    $("左标题栏").resetStyle();
    $("重要成员").value = [];
    $("重要统计").visible = true;
    $("重要成员").visible = false;
    $("重要统计").value = res.important2;
    $("重要统计").flex();
    $("左标题栏").flex();
    if (res.belongID === 0) {
        API.getUI("群成员统计").appendStyle({
            backgroundImage: "btn_yq_11",
            color: "rgba(115,90,55,1)"
        });
        API.getUI("群数据统计").appendStyle({
            backgroundImage: "btn_yq_22",
            color: "rgba(237,253,222,1)"
        });
    }
    API.hideUI("成员列表框");
    API.showUI(["数据统计", "数据清零"]);
    API.update("数据统计");
}


function getDataStatistics(Idx) {
    var res = API.data;
    res.belongID = res["重要统计"][Idx].userID;
    $("重要统计").resetStyle();
    for (var i in res["重要统计"]) {
        $("重要统计按钮[" + i + "]").appendStyle({
            "backgroundImage": "btn_yq_11",
            "color": "rgba(116,90,54,1)"
        });

    }
    $("重要统计按钮[" + Idx + "]").appendStyle({
        "backgroundImage": "btn_yq_22",
        "color": "rgba(237,253,222,1)"
    });
    $("群成员统计").appendStyle({
        backgroundImage: "btn_yq_11",
        color: "rgba(116,90,54,1)"
    });
    $("群数据统计").appendStyle({
        backgroundImage: "btn_yq_11",
        color: "rgba(116,90,54,1)"
    });
    Game.send(1446);
}

Game.removeList = function(){
    var res = API.data;
    res.managerList  = [];
    console.log(res.important);
    for(var i = 0;i<res.important.length;i++){
        if(res.important[i].chengyuanID===res.userID) {
        }else{
            res.managerList.push({
                title:"管理员列表"+i,
                belongID:res.important[i].chengyuanID
            });
            if(i==0){res.managerList[i].title = "会长列表"}
        }

    }
    console.log(res.managerList);
    $("成员信息内容区").add("管理列表");
    $("管理列表").value = res.managerList;
}

Game.confirmMoveMember = function (index){
    var res = API.data;
    var listName = res.managerList[index].title ;
    var dec = "你要将id为【"+res.cMember.playAccountID+"】的玩家【"+res.cMember.playerName+"】移至【"+listName+"】吗？";

    show("确认弹窗");

    $("确认显示内容").value  = dec;

    $("再次确定").mouseUp = function(){
        WS.socket.send(WS.writeMessage(1104, null, function (writer) {
            console.log("发送1104移动成员列表, clubID:", res.clubID);
            writer.writeLong(res.clubID);
            writer.writeLong(res.cMember.playerID);
            writer.writeLong(res.managerList[index].belongID);
        }));
    };
    $("再次确认取消").mouseUp = function(){
        hide("确认弹窗");
    };

}

Game.onMoveMember = function(d){
    var state = d.readByte();
    if(state==0){
        API.runActionGroup("错误提示","成功移动成员");
    }else{
        API.runActionGroup("错误提示","移动失败");
    }
    hide("确认弹窗");
}

Game.memberListMsg = function(idx){
    var res = API.data;
    res.cMember = res["成员列表"][idx];
    if(res.belongID===0){
        if(isGuanliyuan||isClubQunzhu){
            show("成员信息");
            $("输入备注").value=res.cMember.beizhu;
        }else{
            show("成员信息2");
        }
    }else{
        if(res.userID===res.belongID){
            show("成员信息");
            $("输入备注").value=res.cMember.beizhu;
        }else{
            show("成员信息2");
        }

    }


}



function decodeAnnouncement(txt) {
    API.load("rules/jlb_gg.txt", function (r) {
        var txt = encodeURIComponent(r);
        var a = encodeURIComponent("<br/>");
        txt = txt.replace(/\%0A/g, a);
        API.getUI("俱乐部文本公告").value = decodeURIComponent(txt);
    });
}

function getToday() {
    var res = API.data;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //一月是0，一定要注意
    var yyyy = today.getFullYear();
    var hour = today.getHours();
    var minutes = today.getMinutes();
    var seconds = today.getSeconds();
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }

    res.today = yyyy + '-' + mm + '-' + dd;
    getBefore(0); //一星期前;
    res.day = 0;
}

function getBefore(dayD) {
    var now = new Date();
    var date = new Date(now.getTime() - dayD * 24 * 3600 * 1000);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    if (day < 10) {
        day = '0' + day
    }
    if (month < 10) {
        month = '0' + month
    }
    API.data.todayZero = year + '-' + month + '-' + day;
}

function GetDateTimeDiff(startTime, endTime) {
    var retValue = {},
        date3 = endTime.getTime() - startTime.getTime(); //时间差的毫秒数
    //计算出相差天数
    var days = Math.floor(date3 / (24 * 3600 * 1000));
    retValue.Days = days;
    API.day = retValue.Days;
}

function checkDate(data) {
    //如果日期字符串为空

    if (data == "") {
        API.runActionGroup("错误提示", "日期不能为空");
        return;
    }

    //如果小于8位
    //
    //  if(data.length<10){
    //  	API.runActionGroup("错误提示", "输入的格式应该为'xxxx-xx-xx'");
    //      return;
    //  }

    var reg = /^(\d{4})-(\d{2})-(\d{2})$/;
    var str = data;
    var arr = reg.exec(str);
    if (!reg.test(str) && RegExp.$2 <= 12 && RegExp.$3 <= 31) {
        API.runActionGroup("错误提示", "输入的格式应该为'xxxx-xx-xx'");
        return false;
    }
    return true;
}

function addHRToStr(oldStr) {
    //如果存在-或者/
    if (oldStr.indexOf('-') >= 0 || oldStr.indexOf('/') >= 0) {
        return oldStr;
    }

    //如果小于6或者大于8
    if (oldStr.length != 8) {
        return oldStr;
    }

    var idx1 = 4;
    var idx2 = 6;

    if (oldStr.length == 6) {
        idx2 = 5;
    } else if (oldStr.length == 7) {
        idx2 = 6;
    }

    var newStr = oldStr.substring(0, 4) + "-" + oldStr.substring(4, idx2) + "-" + oldStr.substring(idx2);
    return newStr;
}

function validateDay(year_num, month_num, day_num) {
    if (day_num < 1) {
        return dayLT1;

        //如果月份是1,3,5,7,8,10,12
    } else if ((month_num == 1 || month_num == 3 || month_num == 5 || month_num == 7 ||
        month_num == 8 || month_num == 10 || month_num == 12) && day_num > 31) {
        API.runActionGroup("错误提示", "日期不能超出31号");
        return dayGT31;

        //如果月份是4,6,9,11
    } else if ((month_num == 4 || month_num == 6 || month_num == 9 || month_num == 11) &&
        day_num > 30) {
        API.runActionGroup("错误提示", "日期不能超出30号");
        return dayGT30;

        //如果月份是2
    } else if (month_num == 2) {
        //如果为闰年
        if (isLeapYear(year_num) && day_num > 29) {
            API.runActionGroup("错误提示", "日期不能超出29号");
            return dayGT29;
        } else if (day_num > 28) {
            API.runActionGroup("错误提示", "日期不能超出28号");
            return dayGT28;
        }
    }
    return success;
}

//1406(房卡统计)
Game.onRoomCardStatistics = function (d) { ///房卡统计
    var res = API.data;
    res.FKTJMaxPage = d.readShort(); //最大页数
    if (res.FKTJMaxPage == 0) {
        API.runActionGroup("错误提示", "无房卡统计记录");
        res["房卡统计"] = [];
        show("房卡统计弹窗");
        return;
    }
    res.FKTJCurPage = d.readShort(); //当前页码
    res.FKTJPageObjMaxNum = d.readByte(); //每页展示的最大数量
    res.FKTJPageObjCurNum = d.readByte(); //该页显示的真实数量
    res["房卡统计"] = [];
    for (var i = 0; i < res.FKTJPageObjCurNum; i++) {
        //res.roomTb[i]  =
        var item = {};
        item.id = d.readLong();
        item.roomID = d.readInt();
        item.consumeCardNum = d.readByte();
        item.playerMaxNum = d.readByte();
        item.finishedInning = d.readByte();
        item.sumInning = d.readByte();
        item.openRoomTime = d.readString();
        item.homeownerName = d.readString();
        item.creatorName = d.readString();
        item.gameType = d.readString(); //玩法
        item.gameType = getGameName(item.gameType);
        item.jushu = d.readInt(); //局数

        item.bigReplayCode = d.readString();//大局的回放码

        item.playerNum = d.readInt();
        //		item.playerId 		= d.readLong();
        item.players = [];
        if (item.playerNum > 0) {
            for (var j = 0; j < item.playerNum; j++) {
                var item2 = {};
                item2.id = d.readLong();
                item2.accountID = d.readInt();
                item2.score = d.readInt();
                item2.name = d.readString();
                item2.iconURL = d.readString();
                item2.isWin = d.readBoolean();
                item2.dayingjia = item2.isWin ? "dayingjia_jiaobiao" : "";
                item.players.push(item2);
            }
        }
        res["房卡统计"].push(item);
    }
    res.qunzhuConsumeCard = d.readInt();
    res.chengyuanConsumeCard = d.readInt();
    res.meCostCard = d.readInt();
    if($("房卡统计弹窗")) {
        update("房卡统计弹窗");
    }else{
        show("房卡统计弹窗");
    }
}

//1101(文字提示)
Game.showCommonMsg = function (d) {
    "use strict";
    var res = API.data,
        _type = d.readByte();
    console.log(_type);
    if (_type == 0) {
        res.msg = d.readString();
        API.runActionGroup("错误提示", res.msg);
    } else if (_type == 1) {
        res.msg = d.readString();
        res.cbStr1 = d.readString();
        API.runActionGroup("显示", "提示弹窗");
        $("提示信息").value = res.msg;
    } else if (_type == 2) {
        res.msg = d.readString();
        res.cbStr1 = d.readString(); //跳转关键字
        res.cbStr2 = d.readString(); //跳转关键字
    }
    // API.runActionGroup("弹窗显示", res.msg);
}
//1416(收)删除房间
Game.onDeleteRoom = function (d) {
    "use strict";
    var res = API.data;
    var roomID = d.readInt();
    //API.hideUI(["桌子头像","桌子详情","等待开局"]);
    var playerTb = [{}, {}, {}, {}];
    var floorInfo = tower.getFloorInfo();
    var obj = JSON.parse(floorInfo.playSetting);
    var count = obj.PLAYER_COUNT;
    console.log("count:", count);
    for (var n = 0; n < res.roomTb.length; n++) {
        if (res.roomTb[n].id == roomID) {
            res.roomTb[n] = {
                "img": "desk_mj_normal" + count,
                "index": n + res.pageIdx * 6 - 5,
                playerTb: playerTb
            }
            if (obj.SERVER_MODEL === "pdk") res.roomTb[n].img = "desk_qp" + count;
        }
    }
    API.hideUI(["详情弹窗", "强制解散弹窗"]);
    API.update("玩法桌列表");
    console.log(res);
}
//1412(强制解散房间)
Game.onDismissRoom = function (d) { //解散房间
    "use strict";
    var res = API.data;
    res.info = d.readString();
    API.runActionGroup("错误提示", res.info);
    console.log("1412 -> res.deskIdx:", res.deskIdx, "res.roomTb:", res.roomTb);
    if (res.info == "解散成功") {
        res.roomTb[res.deskIdx].playerTb = [{}, {}, {}, {}];
        API.update("玩法桌列表");
    }
    API.hideUI(["详情弹窗", "强制解散弹窗"]);
}

//1405(收)俱乐部返回大厅
Game.onClubGotoHall = function (d) {
    var res = API.data;
    var key = d.readString();
    res.host = d.readString();
    console.log("hall key before -> ", res.hallKey, "clubKey:", res.clubKey);
    res.hallKey = key;
    console.log("1405 -> go to hall, key:", key, "host:", res.host);
    res.going2Hall = true;    // 返回大厅标识
    API.timer.reset();
    API.hideUI(["设置弹窗", "解散俱乐部弹窗"]);
    API.hideUI(["主容器", "屏蔽遮罩"])
    API.update("数值组");
    API.load("bin/hall.json");

    // return; //？？？？

    //API.updata("大厅");
}

//1424(俱乐部创建新玩法删除成功)
Game.onDeleteSetting = function (d) {
    "use strict";
    //var res = API.data;
    //res.state 	= d.readByte();
    //res.str		= d.readString();
    var state = d.readByte();
    var str = d.readString();

    if (state == 0) { //删除成功
        API.showUI("俱乐部删除弹窗");
    }
}

//onClubChatMsg 接收到1430 --收到聊天信息
Game.onClubChatMsg = function (d) {
    "use strict";
    //var res = API.data;
    //res.str = d.readString();//俱乐部id/来源id
    //res.data = d.
}



Game.gotoCreateClubSuccess = function(d) {//收到1301
    var res = API.data,statusCode = d.readByte(),tipContent = d.readString();
    console.log("=====" + res.tipContent);
    if(statusCode == 2) {
        API.hideUI("俱乐部弹窗");
        API.showUI("商城弹窗");
        return;
    }
    if(statusCode == 0) {
        res.uclubId = d.readLong();
        API.runActionGroup("显示", "创建成功");
    } else {
        API.runActionGroup("错误提示", tipContent);
    }
}







//1410 --进入房间回调
Game.onClubGotoRoom = function (d) {
    "use strict";
    var res = API.data;
    API.hideUI(["主容器", "屏蔽遮罩"]);
    API.timer.reset();
    res.host = d.readString();
    res.roomKey = d.readString();
    WS.socket.send(WS.writeMessage(2000));
    //
    // if (json.SERVER_MODEL === "zzmj" || json.SERVER_MODEL === "hz") {
    //     console.log("--------------- zzmj or hz");
    //     API.load("bin/game.json", function () {
    //         console.log("load game completed");
    //         API.hideUI("大厅");
    //         API.update("数值组");
    //     });
    // } else if (json.SERVER_MODEL.search("paohuzi") != -1) {
    //     console.log("--------------- paohuzi");
    //     API.load("bin/gameWindow.json", function () {
    //         console.log("load phz completed");
    //         API.hideUI("大厅");
    //         API.update("数值组");
    //     })
    // }else if (json.SERVER_MODEL === "pdk" ){
    //     API.data.playerNum = json.PLAYER_COUNT;
    //     API.load("bin/gamePdk.json", function () {
    //         console.log("load pdk completed");
    //         API.hideUI("大厅");
    //         API.update("数值组");
    //     })
    // }




}

//1305onRequestJoinResult大厅
Game.onRequestJoinResult = function (d) {
    "use strict";
    var res = API.data;
    res.roomInfo = parseOneRoomList(d);
}

//俱乐部接收到的协议1084
//onGiftList 1084
Game.onGiftList = function (d) {
    "use strict";
    var res = API.data;
    res.num1 = d.readShort();
    for (var i = 0; i < num1; i++) {
        res[i] = {};
        res[i].id = d.readByte();
        res[i].price = d.readInt();
    }
    var ose = {};
    var num2 = d.readShort();
    for (var j = 0; j < num2; j++) {
        ose[j] = {};
        ose[j].id = d.readByte();
        ose[j].price = d.readInt();
    }
}

//1031(在线)
//接收的俱乐部协议1031
Game.onNotifyUserOnAnOff = function (d) {
    "use strict";
    var res = API.data;
    res.flag = d.readByte(); //1:在线,2:离线
    res.userId = d.readLong();
}

Game.send1408 = function (d) {

    var d = API.data;
    WS.socket.send(WS.writeMessage(1408, null, write));

    function write(writer) {
        writer.writeLong(d.clubID);
        var s = String(d["发送内容"]),
            t = d["发送类型"];
        console.log(s);
        writer.writeByte(t);
        if (t == 0) { //俱乐部名称
            console.log("----", s)
            writer.writeString(s);
        } else if (t == 1) { //趣友圈
            writer.writeString(s);
        } else if (t == 2) { //加入房间条件
            writer.writeString(s);
        } else if (t == 3) {
            writer.writeByte(s);
        } else if (t == 4) {
            writer.writeString(s);
        } else if (t == 5) { //修改趣友圈数据统计权限
            writer.writeByte(s);
            API.data.isOpen = s;
            isOpen();

        }

    }
}

//1408(收)
Game.onUpdateClubSetting = function (d) { //修改趣友圈配置
    var res = API.data,
        status = d.readBoolean(),
        type = d.readByte(),
        content = d.readString(); //提示弹窗内容
    if (status) {
        if (type == 0) { //修改趣友圈名称
            res["clubName"] = res["发送内容"];
            console.log("--------------", res["发送内容"])
        } else if (type == 1) { //修改介绍
            res["clubDesc"] = res["发送内容"];
        } else if (type == 2) { //修改公告
            res["clubNotice"] = res["发送内容"];
        } else if (type == 3) { //趣友圈加入条件
            var a = ["申请加入", "", "拒绝加入"]; //0 需要申请 1不需要申请 2拒绝加入
            res["clubConditionText"] = a[res["发送内容"]];
        } else if (type == 4) { //趣友圈乐部图标
            res["clubIcon"] = "icon" + res.clubIconid;
        } else if (type == 5) { //修改趣友圈数据统计权限
            res.isOpen = d.readByte();

        }
    }
    API.runActionGroup("弹窗显示", content);

    if (status == 0) return;
    API.update(...["设置弹窗", "俱乐部名", "俱乐部头像选择", "加入弹窗", "俱乐部图标容器", "俱乐部头像"]);
}

function isOpen() {
    var isOpen = API.data.isOpen;
    if (isOpen == 1) {
        API.getUI("公开按钮").appendStyle({
            backgroundImage: 'danxuan2'
        });
        API.getUI("关闭统计按钮").appendStyle({
            backgroundImage: 'danxuan1'
        });
        API.getUI("公开按钮文").appendStyle({
            color: "rgba(129,0,15,1)"
        });
        API.getUI("不公开文字").appendStyle({
            color: "rgba(70,85,90,1)"
        });
    } else {
        API.getUI("不公开文字").appendStyle({
            color: "rgba(129,0,15,1)"
        });
        API.getUI("公开按钮文").appendStyle({
            color: "rgba(70,85,90,1)"
        });
        API.getUI("关闭统计按钮").appendStyle({
            backgroundImage: 'danxuan2'
        });
        API.getUI("公开按钮").appendStyle({
            backgroundImage: 'danxuan1'
        });
    }

    API.update(...["不公开文字", "公开按钮文", "关闭统计按钮", "公开按钮",]);

}


//4.3
function huiUid(type_2) {
    var arr = ["普通扣卡", "AA扣卡", "大赢家扣卡"];
    var arr2 = ["选框普通扣卡", "选框AA扣卡", "选框大赢家扣卡"];
    for (var n = 0; n < arr.length; n++) {
        API.getUI(arr[n]).appendStyle({
            color: 'rgba(180,180,180,1)'
        });
        API.getUI(arr2[n]).appendStyle({
            backgroundImage: 'yuandian'
        });
        API.getUI(arr2[n]).enabled = false;
    }
    if ((type_2 == 1) || (type_2 == 0)) {
        API.getUI("选框普通扣卡").value = true;
        API.getUI("选框普通扣卡").appendStyle({
            backgroundImage: 'point_lvse'
        });
        //		API.getUI("8局").value = '8局(1张房卡)';
        //		API.getUI("16局").value = '16局(2张房卡)';
    } else if (type_2 == 2) {
        API.getUI("选框AA扣卡").value = true;
        API.getUI("选框AA扣卡").appendStyle({
            backgroundImage: 'point_lvse'
        });
        //		API.getUI("8局").value = '8局(每人1张)';
        //		API.getUI("16局").value = '16局(每人2张)';
    } else if (type_2 == 3) {
        API.getUI("选框大赢家扣卡").value = true;
        API.getUI("选框大赢家扣卡").appendStyle({
            backgroundImage: 'point_lvse'
        });
        //		API.getUI("8局").value = '8局(2张房卡)';
        //		API.getUI("16局").value = '16局(4张房卡)';
    }

    getResultC(API.data.SERVER_MODEL);
}

//5.21
function huiUidhz(type_2) {
    if (type_2 == 2) {
        API.data.IS_AAKF = true;
        API.getUI("8局").value = '8局(每人1张)';
        API.getUI("16局").value = '16局(每人2张)';
    } else {
        API.data.IS_AAKF = false;
        API.getUI("8局").value = '8局(1张房卡)';
        API.getUI("16局").value = '16局(2张房卡)';
    }

    getResultC(API.data.SERVER_MODEL);
}

/*
	跑胡子创建房间，常德全名堂
	[局数，tab页玩法类型，选项数量，for [玩法，规则，充囤]]
	tab玩法：1 2 3
	选项数量：不包含局数
	玩法：已复选项数量，for[选择的值：多数从1开始]
	规则：已复选项数量，for[选择的值：多数从1开始]
	充囤：已复选项数量，for[选择的值：0开始 多数从1开始]
*/
function getResult_phz() {
    console.log("===================test");
    var checks = [];
    var round = API.getUI('选框6局').value + API.getUI('选框10局').value + API.getUI('选框16局').value;  // 局数
    var tabIndex = 1;  // 常德全名堂
    var checksNum = 4; // 跑胡子创建房间协议的坑，需要根据选框组来组成phz_str，选框不包括局数。玩法，规则，充囤, 带47红(新增)(注意顺序，规则和充囤和ui是相反的，lua客户端的坑)
    var cplayNum = 1;  // 玩法已复选数量

    checks.push(round);
    checks.push(tabIndex);
    checks.push(checksNum);
    // 玩法
    checks.push(cplayNum);  // 玩法已复选数量
    checks.push(API.getUI('选框六八番').value + API.getUI('选框八十番').value);  // 玩法已选的值

    // 规则
    var cruleNum = 0;  // 规则已复选数量
    var ruleChecked = [];    // 规则已选的值
    var crules = ["规则允许臭胡"].concat(rules);
    console.log("rules: " + rules.toString());
    crules.forEach((ruleID, i, arr) => {
        ruleID = "选框" + ruleID.substring(2);
        // console.log("ruleID: " + ruleID);
        var ruleUI = API.getUI(ruleID);
        // console.log("rule value: " + ruleUI.value);
        if (ruleUI.value > 0) {
            cruleNum++;
            ruleChecked.push(ruleUI.value);
        }
    });

    checks.push(cruleNum);
    for (var i = 0; i < cruleNum; i++) {
        checks.push(ruleChecked[i]);
    }

    // 充囤
    var cscoreNum = 1;
    var score = 0;
    var scores = API.getSwitchGroupByName('选框0分');
    for (var scoreID in scores) {
        // console.log("score id: " + scoreID);
        var scoreUI = API.getUI(scoreID.substring(0, scoreID.length - 2));
        score += scoreUI.value == 10 ? 0 : scoreUI.value;  // 将0分的ui特殊值10改回0
    }
    checks.push(cscoreNum);
    checks.push(score);

    // 带47红，新增
    var item47Value = API.getUI("选框带四七红").value;
    checks.push(item47Value > 0 ? 1 : 0);
    if (item47Value > 0) {
        var value47 = API.getUI("选框4红7红").value + API.getUI("选框2番").value;
        checks.push(value47);
    }
    console.log("item47Value:", item47Value);

    var checkSameIP = true;  // 同IP检测
    var checkGPS = true;     // gps检测
    checks.push(checkSameIP);
    checks.push(checkGPS);

    // 跑胡子json文本
    var phzJSON = JSON.stringify(checks);
    console.log("phz_json: " + phzJSON);
    var playMaxNum = 3;  // 玩家最大数量
    // var isAA = API.getUI('选框AA开房').value; //2018.7.27因俱乐部没有AA开发所以这给注释

    var d = {
        // "IS_AAKF": isAA,//2018.7.27因俱乐部没有AA开发所以这给注释
        "ROUND": round,
        "IS_DELEGATE": false,
        "SERVER_MODEL": "paohuzi-cdqmt",
        "PHZ": phzJSON,
        "PLAYER_COUNT": playMaxNum
    };

    API.data["玩法设置"] = d;
    console.log(d);

    return d;
}


function getResultC(wanfa) {
    if (wanfa == "zzmj") {    // 转转麻将
        var d = {
            "huType": API.getUI('选框点炮胡') ? API.getUI('选框点炮胡').value : false,
            "bankerPlayerScore": API.getUI('选框庄闲') ? API.getUI('选框庄闲').value : false,
            "grabGangHUBao3Jia": API.getUI("选框抢杠胡包三家") ? API.getUI("选框抢杠胡包三家").value : false,
            "genZhuangZhongMa": API.getUI("选框跟庄中码") ? API.getUI("选框跟庄中码").value : false,
            "jianPaoCai": API.getUI("选框见炮踩") ? API.getUI("选框见炮踩").value : false,
            "SERVER_MODEL": "zzmj",
            "hu7pair": API.getUI("选框可胡七对") ? API.getUI("选框可胡七对").value : false,
            "PLAYER_COUNT": API.getUI("选框4人").value + API.getUI("选框3人").value,
            "MAHJONG_TPYE_NUM": 46,
            "hit6zaDouble": API.getUI("选框全中翻倍") ? API.getUI("选框全中翻倍").value : false,
            "IS_AAKF": API.getUI("选框AA扣卡").value,
            "ROUND": API.getUI('选框8局').value + API.getUI('选框16局').value,
            "IS_DELEGATE": false,
            "piao": API.getUI("选框可带飘") ? API.getUI("选框可带飘").value : false,
            "PAI_COUNT": 108,
            "ZA": API.getUI('选框一码全中').value + API.getUI('选框2码').value + API.getUI('选框4码').value + API.getUI('选框6码')
                .value,
            "DE_WAY": API.getUI('选框普通扣卡').value + API.getUI('选框AA扣卡').value + API.getUI('选框大赢家扣卡').value,
        }
        API.data["玩法设置"] = d;

        if (API.data.type_2) {
            d.DE_WAY = API.data.type_2;
        }
        API.data.valueJson = JSON.stringify(d);
        if (API.data.type_2 == 2) d.IS_AAKF = true;
        API.data.valueJson.DE_WAY = API.data.type_2;

        console.log("==========游戏规则==" + API.data.valueJson, API.data.valueJson.DE_WAY);
        return d;
    } else if (wanfa == "hz") {    // 红中麻将
        var d = {
            "ROUND": API.getUI('选框8局').value + API.getUI('选框16局').value, //回合数round
            "SERVER_MODEL": "hz", //服务器类型hz
            "MAHJONG_TPYE_NUM": 46, //牌种类46
            "PAI_COUNT": 112, //麻将数量112
            "ZA": API.getUI('选框一码全中').value + API.getUI('选框2码').value + API.getUI('选框3码').value + API.getUI('选框4码').value + API.getUI('选框6码').value + API.getUI('选框8码').value, //抓码数2 加上8码 2018.7.24
            "PLAYER_COUNT": API.getUI("选框4人").value + API.getUI("选框3人").value, //人数4
            "MILUOHONGZHONG": false, //false
            "CAN_WATCH": false, //false
            "PLAY_7D": API.getUI('选框可胡七对') ? API.getUI('选框可胡七对').value : false, //false
            "QG_HU": API.getUI('选框可抢杠胡') ? API.getUI('选框可抢杠胡').value : false, //false
            "IS_AAKF": API.data.IS_AAKF, //false
            "IS_ZHUA_HU": API.getUI('选框只能自摸').value + API.getUI('选框可点炮').value, //0
            // "IS_ZHUA_HU": API.getUI('选框可点炮')?API.getUI('选框可点炮').value:false,
            "YMNF": API.getUI('选框一码2分').value + API.getUI('选框一码1分').value, //2
            "grabGangHUBao3Jia": API.getUI("选框抢杠胡包三家") ? API.getUI("选框抢杠胡包三家").value : false,// 2018.7.24
            "hit6zaDouble": API.getUI('选框全中翻倍') ? API.getUI('选框全中翻倍').value : false, //false
            //"DE_WAY":API.getUI('选框AA开房').value + API.getUI('选框16局').value,
            "IS_DELEGATE": false,
        };
        API.data["玩法设置"] = d;

        if (API.data.type_2) {
            d.DE_WAY = API.data.type_2;
        }
        API.data.valueJson = JSON.stringify(d);
        if (API.data.type_2 == 2) d.IS_AAKF = true;
        API.data.valueJson.DE_WAY = API.data.type_2;

        console.log("==========游戏规则==" + API.data.valueJson, API.data.valueJson.DE_WAY);
        return d;
    } else if (wanfa === "paohuzi-cdqmt") {    // 常德全名堂
        return getResult_phz();
    } else if (wanfa === "pdk") {    // 跑得快
        var api = API.getUI;
        var d = {
            "SERVER_MODEL": "pdk",      //游戏房间服务器标志
            "IS_DELEGATE": false,      //是否代理开房
            "ROUND": api("选框10局").value + api("选框20局").value,         //轮数
            "PLAYER_COUNT": api("选框2人").value + api("选框3人").value,          //玩家数量 （四人跑得快只能选四人，其他玩法可以选2或3人
            "GAME_TYPE": api("选框经典").value + api("选框15张").value + api("选框四人").value,          //游戏类型 1：经典跑得快 2：15张跑得快 3：四人跑得快
            'IS_SHOW_CARDNUM': api("选框显示牌数").value + api("选框不显示牌数").value,          //是否显示牌数 1：显示 2：不显示
            'CAN_UNPACK_BOMB': API.getUI('选框可拆炸弹') ? API.getUI('选框可拆炸弹').value : false,      //是否可拆炸弹 true：可拆 false:不可拆
            'FIRST_THREE': API.getUI('选框首局先出黑桃3') ? API.getUI('选框首局先出黑桃3').value : false,       //首局先出黑桃3 true:是 false否
            'POKER_DECK': api("选框一副牌").value + api("选框两副牌").value,          //几副扑克牌？ （只在四人跑得快可以选择，其他玩法默认一副
            'IS_PREVENT_CARD': API.getUI("选框防作弊") ? API.getUI("选框防作弊").value : false,
            'IS_AAKF': API.getUI("选框AA开房") ? API.getUI("选框AA开房").value : false,
            'IS_HEARTTEN': API.getUI("选框红桃10翻倍") ? API.getUI("选框红桃10翻倍").value : false,
            'FOUR_WITH_TWO': API.getUI("选框四带二") ? API.getUI("选框四带二").value : false,//四带二
            'FOUR_WITH_THREE': API.getUI("选框四带三") ? API.getUI("选框四带三").value : false//四带三
        }

        if (d.GAME_TYPE == 3) {
            d.PLAYER_COUNT = 4;
        }
        console.log(d);
        API.data["玩法设置"] = d;
        return d;
    }


}

//game邀请趣友圈成员
//1090
Game.onChengYuanList = function (d) {
    "use strict";
    var res = API.data;
    res.maxPage = d.readByte();
    res.curPage = d.readByte();
    res.maxNumb = d.readByte();
    res.count = d.readByte();
    res.data = [];
    for (var i = 0; i < res.count; i++) {
        var tab = {};
        tab.userID = d.readLong();
        tab.accountID = d.readInt();
        tab.name = d.readString();
        tab.icon = d.readString();
        //res.data[i]=push(tab);
        res.data.push(tab);
    }
}

//1431
//申请红点
Game.onRedPoint = function (d) { //红点
    "use strict";
    var res = API.data;
    //0 申请列表的红点
    res.rp_type = d.readByte();
    res.isRed = d.readBoolean();
    API.update("红点");
}

//2018.4.18
//1423(更新单个成员信息)
Game.onUpdateMemberInfo = function (d) {
    "use strict";
    var res = API.data;
    var o = {};
    o.id = d.readLong(); //玩家唯一id
    o.playerID = d.readLong(); //玩家id
    o.playAccountID = d.readInt(); //玩家账号ID
    o.playerName = d.readString(); //玩家名字
    //	o.playerName = o.playerName.substring(0, o.playerName.length - 1);
    o.icon = d.readString(); //玩家头像
    o.jiarutime = d.readString(); //加入时间
    o.beizhu = d.readString(); //备注
    o.isHeimingdan = d.readBoolean(); //是否黑名单
    o.status = d.readByte(); //0离线 1在线 2游戏中
    //	o.beizhu = o.beizhu.substring(0, o.beizhu.length - 1);
    o.playerName = o.beizhu.length > 0 ? o.beizhu : o.playerName;
    o.beizhu = o.beizhu.length > 0 ? o.beizhu : "暂无";
    o.isCreaterSrc = o.playerID == res.clubQunzhuID ? "head_qunzhu" : "";
    o.isCreater = o.playerID == res.clubQunzhuID ? true : false;
    if (o.status == 1) {
        o.statusSrc = "zaixian";
    } else if (o.status == 2) {
        o.statusSrc = "youxzizhong";
    } else { //剩下的都离线
        o.statusSrc = "lixian";
    }
    if (res.currClickIndex) {
        res["成员列表"][res.currClickIndex] = o;
    }
    API.hideUI(["成员信息", "成员信息2", "屏蔽遮罩"]);
    API.update("成员列表弹窗");
}

//单独一个方法方便给调用
function parseOneMember(d) {

    "use strict";
    var info = API.data;
    info.id = d.readLong(); //玩家唯一id
    info.playerID = d.readLong(); //玩家id
    info.playerAccountID = d.readInt(); //玩家账号ID
    info.playerName = d.readString(); //玩家名字
    info.playerIcon = d.readString(); //玩家头像
    info.jiarutime = d.readString(); //加入时间
    info.beizhu = d.readString(); //备注
    info.isHeimingdan = d.readBoolean(); //是否黑名单
    info.status = d.readByte(); //0离线 1在线 2游戏中
    return info;
}

//1402(申请加入俱乐部的结果返回)
Game.onJoinResult = function (d) {
    "use strict";
    var res = API.data;
    res.isReset = d.readByte();
    res.total = d.readShort();
    res.msg = d.readString();
    if (res.agree == 0) { //同意直接关闭弹窗
        API.runActionGroup("关闭");
    } else if (res.agree == 1) { //拒绝显示弹窗
        API.runActionGroup("显示", "申请弹窗");
        res.pageIdx = 1;
        WS.socket.send(WS.writeMessage(1401));
    }

    if (res.msg) {
        API.runActionGroup("错误提示", res.msg);
    }

}

//1100(文字提示)
Game.updateClubInfo = function (d) {
    "use strict";
    var res = API.data;
    var t = d.readByte(); //更新信息类型
    //t.push(t);
    if (t == 0) {
        res.clubPeopleNum = d.readShort(); //趣友圈成员
    } else if (t == 1) {
        res.clubName = d.readString(); //趣友圈名称
    } else if (t == 2) {
        res.isOpen = res.clubOpenSJTJ = d.readByte();
    }
}

//1442（点击搜索）
Game.onSearchPlayer = function (d) {
    var res = API.data;
    res.status = d.readByte(); //0成功 1为空
    if (res.status == 1) {
        API.runActionGroup("错误提示", "查询不到结果");
        return;
    }
    res.userIDSearch = d.readLong();
    res.accountIDSearch = d.readInt(); //用户accountID（主要用于显示）
    res.userNameSearch = d.readString(); //用户名
    res.iconSearch = d.readString();
    API.update(...["邀请背景", "任命管理员信息"]);
}

//1440 邀请好友加入趣友圈
Game.onInviteMemberToClub = function (d) {
    var res = API.data;
    res.status = d.readByte();
    res.clubMemberNum = d.readShort();
    res.tips = d.readString();
    API.runActionGroup("错误提示", res.tips);

}

//1412(强制解散房间)
// Game.onDismissRoom = function (d) { //解散房间
//     "use strict";
//     var res = API.data;
//     res.info = d.readString();
//     API.hideUI(["强制解散弹窗", "详情弹窗"]);
//     API.runActionGroup("错误提示", res.info);
// }

//1432(收)任命管理员
Game.onAppointManager = function (d) {
    hide("任命弹窗");
    setTimeout(() => {
        hide(["提示弹窗", "任命管理员弹窗", "任命弹窗", "屏蔽遮罩"]);
        var waitSendTimer = setInterval(function () {
            WS.socket.send(WS.writeMessage(1454));
            clearInterval(waitSendTimer);
        }, 30);
    }, 5000);
}

//1413
Game.kickOut = function (d) {
    console.log("踢人成功");
    API.hideUI(["屏蔽遮罩", "踢人弹窗", "成员信息"]);
    API.update("成员列表");
    WS.socket.send(WS.writeMessage(1414));

}

//1436
Game.xiugaiBeizhu = function (d) {
    var res = API.data;
    res.flag = d.readByte();
    if (res.flag == 0) {
        API.runActionGroup("关闭");
    }
}

Game.TextHint = function (d) {
    var res = API.data;
    res.htype = d.readByte();
    res.msg = d.readString();
    API.runAction("错误提示", res.msg);
}

//1454
//设置按钮当中的趣友圈管理员
Game.updateGuanliyuanList = function (d) {

    var res = API.data;
    var glySize = d.readShort();
    var glyList = [];
    res.glyList =[];
    res.isGuanliyuan = false;
    for (var i = 0; i < glySize; i++) {
        var data = {};
        data.playerName = d.readString(); //管理员名字
        data.playerID = d.readLong(); //管理员ID
        data.playerAccountID = d.readInt(); //管理员accountID
        data.dismissCnt = d.readInt(); //解散房间的次数
        data.iconURL = d.readString(); //
        console.log("头像显示", data);
        res.isGuanliyuan = data.playerID == res.userID;
        if (res.isGuanliyuan)
            res.isGuanliyuanDismissCnt = data.dismissCnt;
        update("当前解散房间次数");
        glyList.push(data);
        res.glyList[i] = data;
    }
    if(!$("管理员设置弹窗"))return;
    // if($("管理员设置弹窗")){
    if ($("屏蔽遮罩")) hide("屏蔽遮罩");
    if ($("管理员设置弹窗")) { //暂时
        show("管理员设置弹窗");
    }
    $("管理员详情列表").value = glyList;
    for (var i = 0; i < 5; i++) {
        if (glyList[i]) {
            hide(["空管理员[" + i + "]", "设置管理员[" + i + "]"]);
            //是否为会长
            API.getUI("管理员信息[" + i + "]").visible = true;
            if (res.clubQunzhuID == res.userID) {
                $("重置解散房间按钮[" + i + "]").visible = true;
                $("撤销按钮[" + i + "]").visible = true;
            } else if (glyList[i].playerID == res.userID) {
                $("申请解散房间按钮[" + i + "]").visible = true;
            }
        } else {
            glyList[i] = {};
            API.getUI("管理员信息[" + i + "]").visible = false;
            API.getUI("空管理员[" + i + "]").visible = false;
            if (res.clubQunzhuID == res.userID) {
                show("设置管理员[" + i + "]");
            } else {
                show("空管理员[" + i + "]");
            }
        }
    }
    console.log("glyList------------",glyList);

    if ($("设置弹窗")) {
        update("俱乐部中");
    }
    console.log("1454协议", API.data);
}

Game.onResetDismissTimes = function (d) {
    var state = d.readByte();
    if (state == 1) {
        API.runActionGroup("弹窗提示", "重置成功");
    }
}

Game.onReceiveApplyDissmissTimes = function (d) {
    var res = API.data;
    // res.socketType = "club"
    var content = d.readString();
    res.clubID = d.readLong();
    res._guanliyuanID = d.readLong();
    res._times = d.readByte();
    API.runActionGroup("显示", "踢人弹窗");
    $("踢人内容").value = content;
    $("确认踢人").mouseUp = function () {
        WS.socket.send(WS.writeMessage(1453));
    }

}


//1993趣友圈请求战绩数据
Game.onCombatGainsList = function (d) {

    var res = API.data;
    var res_a = {};
    res_a.bigCombatLen = d.readShort();
    var data = [];
    for (var i = 0; i < res_a.bigCombatLen; i++) {
        d.readShort();
        var dd = parseBigCombatGains(d);
        data.push(dd);
    }
    res.bigCombatList = data;
    res_a.onCombatGainsList = res;
    console.log("1993协议查看回放战绩", data);

}

//单独写1993方法传进去
function parseBigCombatGains(d) {

    var res = API.data;
    var info = {};
    info.serverModel = d.readString(); //玩法类型
    info.roomType = d.readByte(); //房间类型 0大厅 1趣友圈
    info.personNum = d.readByte(); //最大玩家数
    info.roundNum = d.readInt(); //总回合数
    info.bigReplayCode = d.readString(); //大局回放码，拿来请求小局信息
    info.starTime = d.readString(); //结束时间
    info.bigPlayerLen = d.readShort(); //玩法列表个数
    info.bigPlayerList = []; //房间玩家总得分列表
    var data = [];
    for (var i = 0; i < info.bigPlayerLen; i++) {
        d.readShort();
        var dd = parsePlayerScpre(d);
        data.push(dd);
    }
    info.bigPlayerList = data;

    return info;
}

//在单独写这个方法出来也是接着是1993的
function parsePlayerScpre(d) {

    // var res = API.data;
    var d = {};
    d.playerID = d.readLong();
    d.accountID = d.readLong();
    d.iconURL = d.readString();
    d.nickName = d.readString();
    d.score = d.readInt();
    d.isBiggerWinner = d.readBoolean();
    return d;

}


/**
 * 跑得快 再来一局邀请(房间或大厅1116， 俱乐部1445)
 * 1116
 */
Game.onClubInvitedAgain = function (d) {
    var inviteMsg = {};
    // 邀请人
    inviteMsg.userID = d.readInt(); // 玩家id
    inviteMsg.name = d.readString(); // 名字
    inviteMsg.ico = d.readString(); // 头像
    inviteMsg.roomId = d.readInt(); // 房间id
    inviteMsg.playName = d.readString(); // 玩法名
    inviteMsg.playSetting = d.readString(); // 玩法设置

    // 显示被邀请的界面
    // 在房间里点确定的话，先发1095退回到大厅或俱乐部，在请求加入房间
    // 在大厅请求1003
    // 在俱乐部请求1410

    var json = JSON.parse(inviteMsg.playSetting);
    console.log("josn:", json);
    var str = "玩法：" + inviteMsg.playName + ", " + json.ROUND + "局、" + json.PLAYER_COUNT + "人、";
    if (json.GAME_TYPE === 1) {
        str += "经典、";
    } else if (json.GAME_TYPE === 2) {
        str += "15张、"
    }
    str += (json.IS_SHOW_CARDNUM === 1 ? "显示牌数、" : "不显示牌数、");
    str += (json.POKER_DECK === 1 ? "一副牌" : "两副牌");
    inviteMsg.roomInfo = str;
    console.log("构造的邀请语句:", str);
    var res = API.data;
    res.inviteMsg = inviteMsg;
    console.log("俱乐部 -> 跑得快再来一局被邀请, json:", JSON.stringify(inviteMsg));
    API.showUI(["屏蔽遮罩", "邀请再来一局"]);
    API.update("邀请再来一局");
}

/**
 * 点击确定邀请。加入房间 大厅1003，俱乐部1410
 */
Game.onClubAcceptInviteClick = function () {
    // 请求1095 返回到俱乐部或者大厅，再请求加入房间
    console.log("俱乐部 -> 再来一局确定邀请");
    API.hideUI("邀请再来一局", "屏蔽遮罩");
    var res = API.data;
    var inviteMsg = res.inviteMsg;
    console.log("俱乐部 -> 跑得快再来一局，邀请信息, json:", JSON.stringify(inviteMsg));
    // 加入房间 大厅1003，俱乐部1410
    WS.socket.send(WS.writeMessage(1410, null, function (writer) {
        console.log("在俱乐部发送1410加入房间, clubID:", res.clubID, "roomId:", inviteMsg.roomId);
        writer.writeLong(res.clubID);
        writer.writeInt(inviteMsg.roomId);
        writer.writeByte(0);
    }));
}


// --------------------------- 趣友圈楼层设置 --------------------------- //

/**
 * 请求楼层房间列表
 * @param {*} clubId
 * @param {*} floor
 * @param {*} type 0: 趣友圈场景类型，2：已结束UI类型
 * @param {*} pageIdx 当前页，初始为1
 */
Game.requestFloorRoomList = function (clubId, floor, type = 0, pageIdx = 1) {
    WS.socket.send(WS.writeMessage(1403, null, function (writer) {
        writer.writeLong(clubId); // 趣友圈id
        writer.writeByte(floor);  // 指定楼层
        writer.writeByte(type);      // 0：未开始 2: 已结束
        writer.writeByte(pageIdx);  // 指定楼层
    }));
    console.log("1448 -> 请求楼层界面信息 clubId:", clubId, "floor:", floor, "type:", type, "pageIdx:", pageIdx);
}

/**
 * 趣友圈点击桌子请求开房
 * 1411
 * @param {*} clubId
 * @param {*} floor
 * @param {*} deskNo
 * @param {*} playSetting
 */
Game.requestCreateRoomInClubDesk = function (clubId, floor, deskNo, playSetting) {
    WS.socket.send(WS.writeMessage(1411, null, function (writer) {
        writer.writeLong(clubId);   // 趣友圈id
        writer.writeByte(floor);    // 指定楼层
        writer.writeByte(0);        // 玩法索引，过时参数，发0
        writer.writeShort(deskNo);  // 桌号
        writer.writeString(playSetting);    // 玩法设置
        // 再来一局的东西, 不是则发送默认值
        writer.writeString("");     // 邀请用户，再来一局下发的邀请用户
        writer.writeInt(0);         // 再来一局下发的最后的房间号
        writer.writeString("");     // 再来一局下发的玩法
    }));
    console.log("1411 -> 趣友圈桌子请求开房 clubId:", clubId, "floor:", floor, "deskNo:", deskNo);
}

/**
 * 响应开房
 * 1411
 * @param {*} d
 */
Game.onRequestCreateRoomInClubDesk = function (d) {
    var str = d.readString();
    console.log("响应点击桌子的开房, json:", str);
    var json = JSON.parse(str);
    if (json.rState !== 0) {    // 0表示成功
        API.runActionGroup("弹窗显示", json.msg);
    }
}

/**
 * 切换最右侧楼层请求, 返回1451
 * 1448
 */
Game.requestSwitchFloor = function (clubId, floor) {
    WS.socket.send(WS.writeMessage(1448, null, function (writer) {
        writer.writeLong(clubId); // 趣友圈id
        writer.writeByte(floor);  // 指定楼层
    }));
    console.log("1448 -> 请求楼层界面信息 clubId:", clubId, "floor:", floor);
}

/**
 * 请求楼层设置信息
 * 1450
 */
Game.requestTowerSetting = function () {
    var clubId = API.data.clubID;
    WS.socket.send(WS.writeMessage(1450, null, function (writer) {
        writer.writeLong(clubId); // 趣友圈id
    }));
    console.log("1450 -> 请求楼层界面信息 clubId:", clubId);
}

/**
 * 响应请求楼层设置按钮
 * 1450
 * @param {*} d
 */
Game.onRequestTowerSetting = function (d) {
    var res = {};
    res.clubId = d.readLong();
    res.floorSize = d.readShort();
    res.floors = [];
    for (var i = 0; i < res.floorSize; i++) {
        var info = {};
        info.index = d.readByte();
        info.privilege = d.readByte();
        info.deduct = d.readByte();
        info.cardCfg = d.readString();
        info.join = d.readByte();
        info.playSetting = d.readString();
        info.sumDesk = d.readInt();
        res.floors[i] = info;
    }

    console.log("1450 -> 楼层UI信息, json:", JSON.stringify(res));
    tower.setTowerData(res);
}

/**
 * 指定楼层界面信息（切换最右侧楼层）
 * 1451
 * @param {*} clubId    趣友圈id
 * @param {*} floor     指定楼层
 */
Game.requestFloorInfo = function (clubId, floor) {
    WS.socket.send(WS.writeMessage(1451, null, function (writer) {
        writer.writeLong(clubId); // 趣友圈id
        writer.writeByte(floor); // 指定楼层
    }));
    console.log("1451 -> 请求楼层界面信息 clubId:", clubId, "floor:", floor);
}

/**
 * 响应指定楼层界面信息
 * 1451
 * @param {*} d
 */
Game.onRequestFloorInfo = function (d) {
    var res = {};
    res.clubId = d.readLong();     // 趣友圈id
    res.floor = d.readByte();      // 指定楼层
    res.privilege = d.readByte();  // 开房权限
    res.deduct = d.readByte();     // 扣卡选项
    res.cardCfg = d.readString();  // 扣卡额外参数
    res.join = d.readByte();       // 加入条件
    res.playSetting = d.readString(); // 玩法设置
    console.log("1451 -> 响应指定楼层界面信息 json:", JSON.stringify(res));
    tower.updateFloorInfo(res);
    Game.requestFloorRoomList(res.clubId, res.floor);
}

/**
 * 获取指定楼层的玩法设置信息(楼层设置里面的设置按钮)
 * 1449
 * @param {*} clubId    趣友圈id
 * @param {*} floor     指定楼层
 */
Game.requestFloorSetting = function (clubId, floor) {
    WS.socket.send(WS.writeMessage(1449, null, function (writer) {
        writer.writeLong(clubId);   // 趣友圈id
        writer.writeByte(floor);    // 指定楼层
    }));
    console.log("1449 -> 获取指定楼层的玩法设置信息 clubId:", clubId, "floor:", floor);
}

/**
 * 响应获取指定楼层的玩法设置信息
 * 1449
 * @param {*} d
 */
Game.onRequestFloorSetting = function (d) {
    var res = {};
    res.clubId = d.readLong();    // 趣友圈id
    res.floor = d.readByte();     // 指定楼层
    res.privilege = d.readByte(); // 开房权限
    API.data.privilege = res.deduct = d.readByte();    // 扣卡选项
    res.cardCfg = d.readString(); // 扣卡额外参数
    res.join = d.readByte();      // 加入条件
    res.playSetting = d.readString();    // 玩法设置
    console.log("1449 -> 响应获取指定楼层的玩法设置信息 json:", JSON.stringify(res));

    var obj = eval("(" + res.cardCfg + ")");
    API.data.DayingjiaKouka = obj;

    settingCheckboxClick(0, res.privilege, false);
    settingCheckboxClick(1, res.deduct, false);
    settingCheckboxClick(2, res.join, false);
    // 更多玩法管理
    $("玩法管理").visible = res.playSetting.length > 0;
    $("添加更多玩法框").visible = res.playSetting.length === 0;
    $("设置大赢家扣卡").visible = res.deduct === 3;
    if (res.playSetting !== "") {
        var data = API.data;
        var roomRules = tower.buildRoomRules(res);
        var playRules = tower.buildPlayRules(res);
        var playIcon = tower.getPlayIcon(res);
        data["roomRules"] = roomRules;
        data["playRules"] = playRules;
        data["玩法icon"] = playIcon;
        API.update("房间规则", "玩法规则", "头像图");
        var object = JSON.parse(res.playSetting);
        if (object.SERVER_MODEL === "zzmj") {
            $("选框扣大赢家房卡").enabled = true;
            $("扣大赢家房卡").appendStyle({
                color: 'rgba(73,88,93,1)'
            });
            $("选框扣大赢家房卡").appendStyle({
                backgroundImage: 'danxuan1'
            });
            if (res.deduct === 3) {
                $("设置大赢家扣卡").visible = true;
                $("扣大赢家房卡").appendStyle({
                    color: 'rgba(186,74,52,1)'
                });
                var obj = eval("(" + res.cardCfg + ")");
                // settingCardCfg(obj);
                $("8局张数").value = "8局" + obj.eight + "张";
                $("16局张数").value = "16局" + obj.sixteen + "张";
            }
        }
    } else {
        $("选框扣大赢家房卡").appendStyle({
            backgroundImage: 'danxuan3_2'
        });
        API.getUI("扣大赢家房卡").appendStyle({
            color: 'rgba(180,180,180,1)'
        });
        $("设置大赢家扣卡").visible = false;
        $("选框扣大赢家房卡").enabled = false;
    }
}


/**
 * 修改指定楼层设置 修改成功会向指定楼广播1451
 * 只发送修改的相应模块
 * 1447
 */
Game.updateFloorSetting = function (setting) {
    // var clubId;          // long 趣友圈
    // var floor;           // byte 指定楼层
    // var which;           // byte 修改的模块 0：修改开房权限 1：修改扣卡选项 2：进入房间条件 3：玩法设置
    // var privilege;       // byte 开房权限 0：仅会长开房 1：所有人可开房 默认为所有人可开房
    // var deduct;          // byte 扣卡选项 0：扣会长房卡 1：扣开房这房卡 2：AAKF 3：大赢家扣卡
    // var cardCfg;         // string 扣卡额外参数，大赢家扣卡时有
    // var join;            // byte 加入房间条件 0：俱乐部成员 1：所有人
    // var playSetting;     // string 玩法设置
    // var opt;             // byte 操作 0：添加 1：修改 2：删除

    console.log("1447 -> 修改指定楼层设置, json:", JSON.stringify(setting), "which:", setting.which);
    WS.socket.send(WS.writeMessage(1447, null, function (writer) {
        writer.writeLong(setting.clubId); // 趣友圈id
        writer.writeByte(setting.floor);  // 指定楼层
        writer.writeByte(setting.which);
        switch (setting.which) {
            case 0:
                writer.writeByte(setting.privilege);
                break;
            case 1:
                writer.writeByte(setting.deduct);
                writer.writeString(setting.cardCfg);
                break;
            case 2:
                writer.writeByte(setting.join);
                break;
            case 3:
                writer.writeString(setting.playSetting);
                break;
        }
        writer.writeByte(setting.opt);
    }));
}

/**
 * 响应修改指定楼层设置
 * 1447
 */
Game.onUpdateFloorSetting = function (d) {
    var which = d.readByte(); // 更新的哪个模块
    var status = d.readByte(); // 修改成功状态, 0成功
    console.log("更新的模块:", which, "status:", status);
}

/**
 * 删除指定楼层的玩法设置
 * 1452
 */
Game.deleteFloorSetting = function () {
    var clubId;
    var floor;
    WS.socket.send(WS.writeMessage(1452, null, function (writer) {
        writer.writeLong(clubId); // 趣友圈id
        writer.writeByte(floor); // 指定楼层
    }));
    console.log("1452 -> 删除指定楼层的玩法设置 clubId:", clubId, "floor:", floor);
}

/**
 * 响应删除楼层玩法设置
 * 1452
 * @param {*} d
 */
Game.onDeleteFloorSetting = function (d) {
    var status = d.readByte(); // 删除状态 0: 成功 1: 失败
    var msg = d.readString();  // 提示信息
    if (status === 0) {

    } else if (msg) {
        API.runActionGroup("错误提示", msg);
    }
    console.log("1452 -> 响应删除楼层玩法设置 status:", status, "msg:", msg);
}


var settingCheckboxes = [["选框仅会长开房", "选框所有人可开房"], ["选框仅会长扣卡", "选框扣开房者房卡", "选框AA开房0", "选框扣大赢家房卡"], ["选框趣友圈成员", "选框任何人"]];

/**
 * 选择设置点击
 * @param {*} which 0, 1, 2
 * @param {*} index
 */
function settingCheckboxClick(which, index, send2Update = true) {
    console.log("which:", which, "index:", index);
    var uiID = settingCheckboxes[which][index];
    var value = index + 1;    // ui上的值+1
    console.log("uiID:", uiID, "value:", value);
    var uiTextArray = API.getSwitchGroupByName(uiID);
    // console.log(uiTextArray);
    for (var n in uiTextArray) {
        var cId = n.substring(0, n.length - 2);
        $(cId).value = (cId === uiID ? value : 0);
        var textId = n.substring(2, n.length - 2);
        $(textId).appendStyle({
            color: 'rgba(73,88,93,1)'
        });
    }
    var uiText = uiID.substring(2);
    console.log("uiText:", uiText);
    $(uiText).appendStyle({
        color: 'rgba(186,76,54,1)'
    });

    if (send2Update) {
        tower.playSettingCRUD(1, which);
    }
}

/**
 * 根据相应的模块得到checkbox的值
 * @param {*} which
 */
function getSettingCheckboxValue(which) {
    var value = 0;
    var cboxes = settingCheckboxes[which];
    for (var i = 0; i < cboxes.length; i++) {
        var uiID = cboxes[i];
        value += $(uiID).value;
    }
    value -= 1;    // 为了让值用1开始，UI处加了1，需要减1
    console.log("getSettingCheckboxValue -> which:", which, "value:", value);
    return value;
}

/**
 * 根据相应的模块得到checkbox的标签名
 * @param {*} which
 */
function getSettingCheckboxName(which, index) {
    var uiID = settingCheckboxes[which][index];
    var label = uiID.substring(2);
    if (label === "AA开房0") {
        label = label.substring(0, label.length - 1);
    }
    return label;
}

/**
 * 根据相应的模块得到局数张数
 * @param {*} round 局数
 * @param {*} count 张数
 */

function getSettingCardCfgDes(res) {
    var data = JSON.parse(res.playSetting);
    var obj = JSON.parse(res.cardCfg);
    var zhang = data.ROUND === 8 ? obj.eight : obj.sixteen;
    var str = res.deduct == 3 ? '(扣' + zhang + '张)' : "";
    console.log(str);
    return str;
}

function getSettingCardCfg() {
    var val = getSettingCheckboxValue(1);
    var CardCfg = {
        "eight": 2,
        "sixteen": 4
    };
    if (val === 3) {
        CardCfg = {
            "eight": API.data.DayingjiaKouka.eight,
            "sixteen": API.data.DayingjiaKouka.sixteen
        }
    }
    return JSON.stringify(CardCfg);
}

function settingCardCfg() {
    API.runActionGroup("关闭");
    tower.playSettingCRUD(1, 1);
}


// ---------------------- 楼层设置 ------------------------ //

var tower = (function () {
    var count = 4;       // 楼层层数, 从1到4，4层
    var towerData;       // 茶楼信息
    var startupIndex = 1;    // 设置的索引（楼层）
    var currentFloor = 1;    // 当前所处的楼层
    var currentFloorInfo;    // 当前的楼层信息

    // var isOpen = res.isClubQunzhu||res.isGuanliyuan ;

    // 相应的游戏名字
    var gameNames = {
        "zzmj": "转转麻将",
        "hz": "红中麻将",
        "paohuzi-cdqmt": "常德全名堂",
        "pdk": "跑得快",
    };
    // 相应的游戏图标
    var iconUrls = {
        "zzmj": "icon_zz",
        "hz": "icon_hz",
        "paohuzi-cdqmt": "icon_phz",
        "pdk": "icon_poker",
    };

    /**
     * 初始化   非会长和管理员 屏蔽开启和设置按钮Iris
     */
    function init() {
        for (var i = 1; i <= count; i++) {
            $("已开启" + i).visible = false;
            $("未开启" + i).visible = i === 1 ? false : true;
            $("开启按钮" + i).visible = i === 1 ? true : false;
            $("设置按钮" + i).visible = false;
        }
    }


    /**
     * 设置楼层面板信息
     * @param {*} res
     */
    function setTowerData(res) {
        console.log("setTowerData");
        towerData = res;
        var floor, floorInfo;
        var object, tips;
        var lastFloorOpenFlag = false;    // 上一楼层是否已开启的标识

        if (API.data.isClubQunzhu == false && API.data.isGuanliyuan == false) {
            for (var i = 0; i < towerData.floorSize; i++) {
                floor = i + 1;
                floorInfo = towerData.floors[i];
                if (floorInfo.playSetting !== "") {
                    $("已开启" + floor).visible = true;
                    $("未开启" + floor).visible = false;
                    object = JSON.parse(floorInfo.playSetting);
                    tips = gameNames[object.SERVER_MODEL];
                    tips += " " + floorInfo.sumDesk + "桌";
                    $("开启玩法" + floor).value = tips;
                } else {
                    $("已开启" + floor).visible = false;
                    $("未开启" + floor).visible = true;
                }
            }
            return;
        }


        for (var i = 0; i < towerData.floorSize; i++) {
            floor = i + 1;
            floorInfo = towerData.floors[i];
            console.log("current floor:", floor);
            if (floorInfo.playSetting !== "") {
                console.log("设置tips");
                $("已开启" + floor).visible = true;
                $("未开启" + floor).visible = false;
                $("开启按钮" + floor).visible = false;
                $("设置按钮" + floor).visible = true;

                object = JSON.parse(floorInfo.playSetting);
                tips = gameNames[object.SERVER_MODEL];
                tips += " " + floorInfo.sumDesk + "桌";
                $("开启玩法" + floor).value = tips;
                lastFloorOpenFlag = true;    // 开启
            } else {
                console.log("lastFloorOpenFlag:", lastFloorOpenFlag);
                $("已开启" + floor).visible = false;
                $("设置按钮" + floor).visible = false;
                if (lastFloorOpenFlag) {    // 上一楼层已开启，显示该层的开启按钮
                    $("未开启" + floor).visible = false;
                    $("开启按钮" + floor).visible = true;
                } else {
                    $("未开启" + floor).visible = floor === 1 ? false : true;
                    $("开启按钮" + floor).visible = floor === 1 ? true : false;
                }
                lastFloorOpenFlag = false;   // 未开启
            }
        }

        // 位置箭头
        $("你的位置").y = API.getLocal("开启按钮" + currentFloor).y - 15;
    }

    /**
     * 更新楼层信息,
     * @param {*} res
     */
    function updateFloorInfo(res) {
        console.log("updateFloorInfo");
        currentFloorInfo = res;
        currentFloor = res.floor;
        var data = API.data;
        data["floor"] = currentFloor;
        // 更新主容器的头顶显示玩法
        if ($("玩法文本")) {
            if (currentFloorInfo && currentFloorInfo.playSetting !== "") {
                data["playRules"] = buildPlayRules(currentFloorInfo);
                data.roomTb = getDeskImg(currentFloorInfo.playSetting);
                API.update("玩法文本");
                // $("玩法文本").value = buildPlayRules(currentFloorInfo);
            } else {
                // $("玩法文本").value = "未设置玩法";
                data["playRules"] = "未设置玩法";
                API.update("玩法文本");
            }
        }

        // 最右侧的楼层背景
        var floorBgs = [["btn_yilou2", "btn_yilou1"], ["btn_erlou2", "btn_erlou"], ["btn_sanlou2", "btn_sanlou"], ["btn_silou2", "btn_silou"]];
        var floor;
        for (var i = 0; i < 4; i++) {
            floor = i + 1;
            if (floor === currentFloor) {
                data["floorIndex" + floor] = floorBgs[i][1];
            } else {
                data["floorIndex" + floor] = floorBgs[i][0];
            }
            console.log("floor:", floor, "currentFloor:", currentFloor, "floorBgs[i][1]:", floorBgs[i][1], "floorBgs[i][0]:", floorBgs[i][0]);
        }
        API.update("楼层设置数量");
    }

    /**
     * 打开玩法详情
     */
    function showLeftTips() {
        if ($("玩法详情弹窗")) {
            API.hideUI("玩法详情弹窗");
            return;
        }
        API.showUI("玩法详情弹窗");
        if (currentFloorInfo && currentFloorInfo.playSetting !== "") {
            var object = JSON.parse(currentFloorInfo.playSetting);
            $("详情名称").value = gameNames[object.SERVER_MODEL];
            $("详情局数").value = object.ROUND;
            $("详情人数").value = object.PLAYER_COUNT;
            var res = API.data;
            console.log("show left tips");
            res["playRules"] = buildPlayRules(currentFloorInfo);
            res["roomRules"] = buildRoomRules(currentFloorInfo);
            API.update("规则内容", "开房设置");
        } else {
            $("详情名称").value = "";
            $("详情局数").value = 0;
            $("详情人数").value = 0;
            $("规则内容").value = "未设置玩法";
            $("开房设置").value = "开房设置:未设置玩法";
        }
    }

    function getFloorServerModel() {
        var object = JSON.parse(currentFloorInfo.playSetting);
        return object.SERVER_MODEL;
    }

    function getFloorInfo() {
        return currentFloorInfo;
    }

    /**
     * 开启玩法设置
     */
    function startupPlaySetting(index) {
        startupIndex = index;
        var res = API.data;
        if (res.isClubQunzhu || res.isGuanliyuan) {
            API.showUI("俱乐部管理弹窗");
            Game.requestFloorSetting(res.clubID, startupIndex);
        } else {
            API.runActionGroup("错误提示", "只有会长和管理员才能设置");
        }
    }

    /**
     * 玩法设置的增删改查
     * @param {*} opt0      操作 0：添加 1：修改 2：删除
     * @param {*} which0    修改的模块 0：修改开房权限 1：修改扣卡选项 2：进入房间条件 3：玩法设置
     */
    function playSettingCRUD(opt0, which0) {
        // var clubId;          // long 趣友圈
        // var floor;           // byte 指定楼层
        // var which;           // byte 修改的模块 0：修改开房权限 1：修改扣卡选项 2：进入房间条件 3：玩法设置
        // var privilege;       // byte 开房权限 0：仅会长开房 1：所有人可开房 默认为所有人可开房
        // var deduct;          // byte 扣卡选项 0：扣会长房卡 1：扣开房者房卡 2：AAKF 3：大赢家扣卡
        // var cardCfg;         // string 扣卡额外参数，大赢家扣卡时有
        // var join;            // byte 加入房间条件 0：俱乐部成员 1：所有人
        // var playSetting;     // string 玩法设置
        // var opt;             // byte 操作 0：添加 1：修改 2：删除

        var res = API.data;
        if (!(res.isClubQunzhu || res.isGuanliyuan)) {
            API.runActionGroup("错误提示", "只有会长和管理员才能设置");
            return;
        }

        var playSetting = "";
        if (which0 === 3 && opt0 === 0) {    // 根据修改的模块发送相应的东西
            playSetting = JSON.stringify(getResultC(res.SERVER_MODEL));
        }
        var setting = {
            clubId: res.clubID,
            floor: startupIndex,
            which: which0,
            privilege: getSettingCheckboxValue(0),
            deduct: getSettingCheckboxValue(1),
            cardCfg: getSettingCardCfg(),
            join: getSettingCheckboxValue(2),
            playSetting: playSetting,
            opt: opt0
        };

        API.hideUI("创建房间玩法");
        // 发送1447
        Game.updateFloorSetting(setting);
        // 发送1450
        Game.requestTowerSetting();
        // 发送1449
        Game.requestFloorSetting(res.clubID, startupIndex);
    }

    /**
     * 切换楼层
     */
    function switchFloor(floor) {
        if (floor < 1 || floor > 4 || floor === currentFloor) {
            return;
        }
        if (towerData) {    // 刚打开趣友圈是没有这个数据的，也需要请求1448
            var floorInfo = towerData.floors[floor - 1];
            console.log("switch floor info:", floorInfo);
            if (floorInfo.playSetting === "") {
                API.showUI("楼层弹窗");
                return;
            }
        }

        var res = API.data;
        Game.requestSwitchFloor(res.clubID, floor);
    }

    /**
     * 请求开房
     * @param {*} deskNo
     */
    function requestCreateRoom(deskNo) {
        deskNo = convertDeskNo(deskNo);
        console.log("请求开房, deskNo:", deskNo, "currentFloorInfo:", currentFloorInfo);
        if (currentFloorInfo) {
            var res = API.data;
            Game.requestCreateRoomInClubDesk(res.clubID, currentFloor, deskNo, currentFloorInfo.playSetting);
        }
    }

    /**
     * 将没处理页数的桌号转换为带页数的桌号
     * @param {*} deskNo
     */
    function convertDeskNo(deskNo) {
        var res = API.data;
        var ndeskNo = (res.pageIdx - 1) * res.deskNum + deskNo;
        return ndeskNo;
    }

    /**
     *得到玩法设置的人数
     *
     * @returns
     */
    function getPlayerNum() {
        var num = 0;
        if (currentFloorInfo) {
            var object = JSON.parse(currentFloorInfo.playSetting);
            num = object.PLAYER_COUNT;
        }
        return num;
    }

    /**
     * 请求结束房间列表
     */
    function requestEndRoomList() {
        var res = API.data;
        Game.requestFloorRoomList(res.clubID, currentFloor, 2, res.pageIdx || 1);
    }

    /**
     * 得到玩法图标
     * @param {*} res
     */
    function getPlayIcon(res) {
        var object = JSON.parse(res.playSetting);
        return iconUrls[object.SERVER_MODEL];
    }

    /**
     * 构建房间规则
     * @param {*} res
     */
    function buildRoomRules(res) {
        var str = "";
        str += getSettingCheckboxName(0, res.privilege) + ", " + getSettingCheckboxName(1, res.deduct) + getSettingCardCfgDes(res) + ", " + getSettingCheckboxName(2, res.join);
        console.log("room rules:", str);
        return str;
    }

    // 跑胡子规则
    var srules = ["允许臭胡", "带四七红", "停胡8番", "大团圆", "行行息", "背靠背", "耍猴8番", "黄番2倍"];

    /**
     * 构建玩法规则
     * @param {*} res
     */
    function buildPlayRules(res) {
        var object = JSON.parse(res.playSetting);
        var str = gameNames[object.SERVER_MODEL] + "、";
        switch (object.SERVER_MODEL) {
            case "zzmj":    // 转转
                str += object.ROUND + "局、" + object.PLAYER_COUNT + "人、" + (object.piao === 0 ? "不可带飘" : "可带飘") + "、"
                    + (object.bankerPlayerScore === 0 ? "不分庄闲" : "庄闲(算分)") + "、" + (object.hu7pair === 0 ? "不可胡七对" : "可胡七对") + "、";
                if (object.huType === 0) {
                    str += "自摸胡";
                } else {
                    str += "点炮胡";
                    if (object.jianPaoCai) {
                        str += "、见炮踩";
                    }
                }
                str += "、";
                mjRulesFragment();
                break;
            case "hz":     // 红中
                str += object.ROUND + "局、" + object.PLAYER_COUNT + "人、" + (object.IS_ZHUA_HU === 0 ? "只能自摸" : "可点炮") + "、"
                    + (object.PLAY_7D ? "可胡七对" : "不可胡七对") + "、" + (object.QG_HU ? "可抢杠胡" : "不可抢杠胡") + "、";
                mjRulesFragment();
                str += "、" + "一码" + object.YMNF + "分";
                if (!object.MILUOHONGZHONG) {
                    str += "、没红中胡牌加1码";
                }
                break;
            case "paohuzi-cdqmt":    // 常德全名堂
                str += object.ROUND + "局、";
                var phz = JSON.parse(object.PHZ);
                // 玩法
                var ruleIndex = 4;    // 玩法，1六八番 2八十番
                str += (phz[ruleIndex] === 1 ? "六八番" : "八十番") + "、";
                // 规则
                ruleIndex += 1;
                var ruleNum = phz[ruleIndex++];    // 规则数量
                for (var i = 0; i < ruleNum; i++) {
                    var rule = srules[phz[ruleIndex++] - 1];  // 保存的规则的值是从1开始的，所以-1
                    str += rule + "、"
                }
                // 充囤
                var tuoIndex = phz.length - 3;
                var tuo = phz[tuoIndex];
                str += tuo + "分"
                break;
            case "pdk":
                str += object.ROUND + "局、" + object.PLAYER_COUNT + "人、";
                if (object.GAME_TYPE !== 3) {
                    str += (object.GAME_TYPE === 1 ? "经典" : "十五张") + "、";
                }
                str += (object.IS_SHOW_CARDNUM === 1 ? "显示牌数" : "不显示牌数") + "、";
                if (object.IS_PREVENT_CARD) {
                    str += "防作弊、";
                }
                str += (object.CAN_UNPACK_BOMB ? "可拆炸弹" : "不可拆炸弹") + "、";
                if (object.FOUR_WITH_TWO) {
                    str += "四带二、";
                }
                if (object.FOUR_WITH_THREE) {
                    str += "四带三、";
                }
                if (object.FIRST_THREE) {
                    str += "首局先出黑桃3、";
                }
                if (object.IS_HEARTTEN) {
                    str += "红桃10翻倍、";
                }
                str += (object.POKER_DECK === 1 ? "一副牌" : "两副牌");
                break;
        }
        console.log("play rules:", str);

        // 麻将的部分规则片段
        function mjRulesFragment() {
            if (object.ZA === 1) {
                str += "一码全中"
            } else {
                str += "扎" + object.ZA + "个码";
            }
            if (object.hit6zaDouble) {
                str += "、不中算全中，全中翻倍";
            }
            if (object.genZhuangZhongMa) {
                str += "、跟庄中码"
            }
            if (object.grabGangHUBao3Jia) {
                str += "、抢杠胡包三家"
            }
        }

        return str;
    }

    return {
        init: init,         // 初始化
        setTowerData: setTowerData,           // 设置楼层数据
        startupPlaySetting: startupPlaySetting,     // 开启玩法设置(开启按钮，设置按钮)
        playSettingCRUD: playSettingCRUD,           // 玩法设置的增删改查
        buildRoomRules: buildRoomRules,             // 构建房间规则
        buildPlayRules: buildPlayRules,             // 构建玩法规则
        switchFloor: switchFloor,                   // 切换最右侧楼层
        updateFloorInfo: updateFloorInfo,           // 更新楼层信息
        showLeftTips: showLeftTips,                 // 最左侧的玩法详情弹窗
        requestCreateRoom: requestCreateRoom,       // 点击桌子请求开房
        requestEndRoomList: requestEndRoomList,     // 请求结束的房间列表
        getPlayIcon: getPlayIcon,                   // 得到玩法图标
        getFloorServerModel: getFloorServerModel,   //拿到当前的楼层玩法
        getFloorInfo: getFloorInfo,                 //拿到当前楼层设置
        getPlayerNum: getPlayerNum,                 // 得到玩法设置的人数
    }
})();


/**
 * 获取玩法名称
 * string  model
 */
function getGameName(server_model){
    for(var i = 0;i<API.data["俱乐部玩法列表"].length;i++){
        if(server_model === API.data["俱乐部玩法列表"][i].model)
            var  model = API.data["俱乐部玩法列表"][i]["名称"];
    }
    return model;
}



// ---------------------- 玩法设置 ------------------------ //
/**
 * 玩法选择界面
 * 设置cookie
 * wanfaType 玩法名称
 * targetIndex 玩法列表
 * type  num
 */
var settingClubRules = (function () {
    var data = ["麻将", "扑克", "跑胡子"];
    var targetIndex = 0;

    function init() {
        API.hideUI("玩法设置");
        var wanfaType = getCookie("ClubType");
        if (wanfaType == "undefined" || wanfaType == "" || wanfaType == null) {
            setCookie("ClubType", "麻将", 30);
            settingClubRules.listName("麻将列表");
            return;
        }

        API.getUI(wanfaType + "列表").appendStyle({
            "backgroundImage": "btn_yq_2"
        });
        API.data["新列表"] = [];
        for (var i in API.data["俱乐部玩法列表"]) {
            if (API.data["俱乐部玩法列表"][i]["类型"] == wanfaType) {
                API.data["新列表"].push(API.data["俱乐部玩法列表"][i]);
            }
        }
        $("玩法列表").value = API.data["新列表"];
        // var targetIndex = parseInt(getCookie("targetIndex"));
        console.log(API.data["新列表"]);
        targetIndex = targetIndex > 0 ? targetIndex : 0;
        settingClubRules.listRules(targetIndex);
    }

    function listName(target) {
        for (var i in data) {
            API.getUI(data[i] + "列表").appendStyle({
                "backgroundImage": "btn_yq_1"
            });
        }

        API.getUI(target).appendStyle({
            "backgroundImage": "btn_yq_2"
        });

        var type = target.substring(0, target.length - 2);
        setCookie("ClubType", type, 30);//存玩法类型
        API.data["新列表"] = [];
        for (var i in API.data["俱乐部玩法列表"]) {
            if (API.data["俱乐部玩法列表"][i]["类型"] == type) {
                API.data["新列表"].push(API.data["俱乐部玩法列表"][i]);
            }
        }
        $("玩法列表").value = API.data["新列表"];
        var targetIndex = type == "扑克" ? 1 : 0;
        settingClubRules.listRules(targetIndex);
    }

    function listRules(targetIndex) {
        for (var i in API.data["新列表"]) {
            API.getUI("玩法列表item[" + i + "]").appendStyle({
                "color": "rgba(126,101,66,1)",
                "backgroundImage": "btn_yq_11"
            });
        }

        API.getUI("玩法列表item[" + targetIndex + "]").appendStyle({
            "color": "rgba(235,250,223,1)",
            "backgroundImage": "btn_yq_22"
        });

        var g = API.data["新列表"][targetIndex];
        if (g.src) {
            setCookie("targetIndex", targetIndex, 30);//存玩法选项
            API.hideUI("玩法设置");
            API.data.a = g.src;
            API.runActionGroup("加载玩法", g.src);
            API.data.SERVER_MODEL = g.model;
            API.getUI("玩法标题字").value = g["名称"];
        } else {
            API.data.SERVER_MODEL = g.model;
            API.getUI("玩法标题字").value = g["名称"];
            API.hideUI("玩法设置");
            API.runActionGroup("错误提示", "暂未开通，猿正在努力中");
        }

    }

    return {
        init: init,
        listName: listName,
        listRules: listRules
    }

})();
/**
 * 玩法选择帮助界面
 *
 */
var rulesClubHelp = (function () {
    var data = ["麻将", "扑克", "跑胡子"];
    // wanfaType//玩法名称
    // targetIndex//玩法列表
    // type//num

    function init() {
        var wanfaType = getCookie("ClubType");
        console.log(wanfaType);
        if(wanfaType=="undefined" || wanfaType==""||wanfaType==null){
            rulesHelp.listName("麻将帮助");
            return ;
        }

        API.getUI(wanfaType + "帮助").appendStyle({
            "backgroundImage": "btn_yq_2"
        });
        API.data["新列表"] = [];
        for (var i in API.data["俱乐部玩法列表"]) {
            if (API.data["俱乐部玩法列表"][i]["类型"] == wanfaType) {
                API.data["新列表"].push(API.data["俱乐部玩法列表"][i]);
            }
        }
        $("玩法列表2").value = API.data["新列表"];
        var targetIndex = getCookie("targetIndex");
        rulesHelp.listRules(targetIndex);
    }

    function listName(target) {
        for (var i in data) {
            API.getUI(data[i] + "帮助").appendStyle({
                "backgroundImage": "btn_yq_1"
            });
        }
        API.getUI(target).appendStyle({
            "backgroundImage": "btn_yq_2"
        });
        var type = target.substring(0, target.length - 2);
        console.log(type);
        API.data["新列表"] = [];
        for (var i in API.data["俱乐部玩法列表"]) {
            if (API.data["俱乐部玩法列表"][i]["类型"] == type) {
                API.data["新列表"].push(API.data["俱乐部玩法列表"][i]);
            }
        }
        $("玩法列表2").value = API.data["新列表"];
        console.log($("玩法列表2").value);
        var targetIndex = 0;
        rulesHelp.listRules(targetIndex);
    }

    function listRules(targetIndex) {
        for (var i in API.data["新列表"]) {
            API.getUI("玩法列表项[" + i + "]").appendStyle({
                "color": "rgba(126,101,66,1)",
                "backgroundImage": "btn_yq_11"
            });
        }

        API.getUI("玩法列表项[" + targetIndex + "]").appendStyle({
            "color": "rgba(235,250,223,1)",
            "backgroundImage": "btn_yq_22"
        });

        var g = API.data["新列表"][targetIndex];
        console.log(g);
        if (g.rules) {
            API.data.a = g.rules;
            // API.runActionGroup("加载玩法帮助",g.rules);
            API.load("rulefile/" + API.data.a + ".txt", function (r) {
                var txt = encodeURIComponent(r);
                var a = encodeURIComponent("<br/>");
                txt = txt.replace(/\%0A/g, a);
                API.getUI("帮助内容").value = decodeURIComponent(txt);

            });
            API.data.til = API.getUI("玩法帮助").value = g["名称"];
        } else {
            API.data.til = API.getUI("玩法帮助").value = g["名称"];
            API.runActionGroup("错误提示", "暂未开通，猿正在努力中");
        }
    }

    return {
        init: init,
        listName: listName,
        listRules: listRules
    }

})();
