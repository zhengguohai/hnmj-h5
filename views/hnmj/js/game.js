function refresh() {
    window.location.href = window.location.href + "&t=" + getTime();
}

Game.onGetRules = function (d) {
    "use strict";
    var res = API.data;
    res.roomType = res["玩法设置"] = d.readString();
    res.player_custom_json_str = d.readString();
    var s = res.player_custom_json_str;
//	s = s.substr(0, s.length - 1);
    s = eval('(' + s + ')');
    res.inClub = s.IN_CLUB;

    Game.getRules();

}

Game.initRoom = function () {
    "use strict";
    closeUI();
    API.data.startPlay = null;
    API.data.player1 = [];
    WS.socket.send(WS.writeMessage(2000));
}


/** 加上game里面的时刻显示时间2018.8.7*/
var gameTimer = setInterval("getCurDate()", 1000),ZA;//扎码数

function getCurDate() {
    API.data.time = new Date().format("hh:mm:ss");
    API.update("时间");
};


Game.enterRoom = function (d) {
    API.hideUI(["掉线提示", "屏蔽遮罩"]);
    getCurDate();
    var res = API.data;
    var pinfo = [],
        pp = [];
    var num;
    console.log("enter room. serverModel:", res.serverModel);
    if (res.serverModel === "phz") {
        console.log("跑胡子房间，不需要后面的数据");
        WS.socket.send(WS.writeMessage(2000));
        return;
    } else if (res.serverModel == "zzmj") {
        Game.zzmj(d);
    } else if (res.serverModel == "hz") {
        res.roomID = d.readInt();
        res.zhama = d.readByte();
        res.gamecnt = d.readByte();
        res.currPass = d.readByte() + 1; //当前局数
        res["余牌数"] = d.readByte();
        if (!res["余牌数"]) res["余牌数"] = 112;
        num = res.numPlayers = d.readShort();
        for (var i = 0; i < num; i++) {
            var o = {};
            d.readShort();
            o.userID = d.readLong(); //用户ID
            o.isBanker = d.readBoolean(); //庄家
            o.name = d.readString();
            o.pos = d.readByte(); //位置
            o.ico = d.readString();
            o.sex = d.readByte();//1男，0女
            o.score = d.readShort();
            //当掉线重连的时候
            var play_num = d.readShort();

            pp[i] = [];
            ///---
            for (var n = 0; n < play_num; n++) {
                var oo = {};
                d.readShort();
                oo.type = d.readByte();
                oo.id = d.readInt();
                oo.num = d.readByte();
                if (oo.type == 8) {
                    if (!res["听牌列表"]) res["听牌列表"] = [];
                    res["听牌列表"].push({
                        id: oo.id
                    });
                } else
                    pp[i].push(oo);
            }

            o.isReady = d.readBoolean();
            o.ipAddr = d.readString();
            o.isLine = d.readBoolean();
            o.accountID = d.readInt();

            if (o.userID == res.userID) res.pos = o.pos;
            pinfo.push(o);
        }
        res["当前出牌者ID"] = d.readLong();
        res.disTime = d.readInt(); //解散房间剩余时间
        res.roomCreateID = d.readLong(); //房主id
        res.roomCreateName = d.readString(); //房主name
        res.roomCreateImgUrl = d.readString(); //房主头像url
        res.roomCreateAccountId = d.readInt(); //房主accountId;
        res.isStarted = null;
        res.startPlay = null;
        //---位置转换
        for (i = 0; i < num; i++) {
            let ii = res.pos - 1;
            var p = pinfo[i].pos - ii;
            if (p < 1) p += res.playerNum;
            if (res.playerNum == 3 && p == 3) p = 4;
            if (res.playerNum == 3 && p == 3) p = 4;
            if (res.playerNum == 2 && p == 2) p = 3;
            if (p == 4) p = 2;
            else if (p == 2) p = 4;
            res["playerInfo" + p] = pinfo[i];
            res["player" + p] = pp[i];
        }
    }


    //---遍历牌
    if (res["player1"] && res["player1"].length > 3) {
        res.startPlay = true;
        for (i = 1; i < 5; i++) {
            var p = res["player" + i],
                chupai = [],
                mingpai = [], pp = [];
            if (!p) continue;
            for (var n = 0; n < p.length; n++) {
                if (p[n].type == 6) {
                    for (var m = 0, l = p[n].num; m < l; m++) {
                        p[n].num = 1;
                        pp.push(p[n]);
                    }
                } else if (p[n].type == 1 || p[n].type == 2 || p[n].type == 3 || p[n].type == 5) {
                    mingpai.push(p[n]);
                } else if (p[n].type == 7) {
                    chupai.push(p[n]);
                }
                if (pp[n] && pp[n].type == 7) {
                    res.isStarted = true;
                }
            }
            res["吃碰杠列表" + i] = mingpai;
            res["出牌组" + i] = chupai;
            res["player" + i] = pp;
        }
    }


    delete res["摸的牌"];
    API.showUI("游戏桌面", "底层");
    API.hideUI(["加载界面", "小结算界面", "邀请俱乐部成员按钮"]);
    API.style["玩家头像右"].top = res.playerNum == 3 ? -100 : 20;
    API.hideUI(["玩家头像左", "玩家头像右"]);
    API.update(...["玩家头像左", "玩家头像右", "余牌", "局数", "3人游戏", "3人开始游戏"]);
    if (res.inClub) API.showUI("桌面底按钮2", "底层");
    else{
        API.showUI("桌面底按钮", "底层");
    }
    if (!res.startPlay) return;
    API.hideUI(["游戏桌面2", "游戏桌面1"]);
    delete res["发牌动画"];
    API.showUI(["发牌动画", "玩家头像左", "玩家头像右"], "底层");
    API.hideUI(["准备图标11","准备图标22","准备图标33","准备图标44","桌面底按钮","桌面底按钮2"]);


    if (res["听牌列表"] && res["听牌列表"].length > 0) {
        API.showUI("听牌提示", "中间层");
        $("听牌提示").width += 10;
    }

    //2人玩法
    console.log("---------------->:",res.playerNum)
    if(res.playerNum==2){
        API.hideUI(["左头像容器2","右头像容器4","发牌组2","发牌组4"]);
        //  API.showUI("游戏桌面", "底层");
    }else if(res.playerNum==3){
        API.hideUI(["右头像容器3","发牌组3"]);
    }

}


Game.zzmj = function (d) {
    var res = API.data;
    res.roomID = d.readInt();
    res.zhama = d.readByte();
    res.gamecnt = d.readByte();
    res["胡牌类型"] = d.readByte();
    res.hu7pair = d.readByte();
    res.choice = d.readByte();
    res.piao = d.readByte();
    res.playerNum = d.readByte();
    res.currPass = d.readByte() + 1; //当前局数
    res["余牌数"] = d.readByte();
    if (!res["余牌数"]) res["余牌数"] = 108;
    //当前房间人数
    res.roomSize = d.readByte();
    //房间人数类型
    res.playerNum = d.readByte();
    //房间总牌数
    res.totalCardNum = d.readInt();
//总牌数
    //res.player = {}
    var num = res.numPlayers = d.readShort();
    var pinfo = [],
        pp = [];
    for (var i = 0; i < num; i++) {
        var o = {};
        d.readShort();
        o.userID = d.readLong(); //用户ID
        o.isBanker = d.readBoolean(); //庄家
        o.name = d.readString();
        o.pos = d.readByte(); //位置
        o.ico = d.readString();
        o.sex = d.readByte();
        o.score = d.readShort();
        var pa = d.readInt();
        o.piao = res.piao > 0 ? pa : -1;
        //当掉线重连的时候
        var play_num = d.readShort();

        pp[i] = [];
        ///---
        for (var n = 0; n < play_num; n++) {
            var oo = {};
            d.readShort();
            oo.type = d.readByte();
            oo.id = d.readInt();
            oo.num = d.readByte();
            if (oo.type == 8) {
                if (!res["听牌列表"]) res["听牌列表"] = [];
                res["听牌列表"].push({id: oo.id});
            } else
                pp[i].push(oo);
        }

        o.isReady = d.readBoolean();
        o.ipAddr = d.readString();
        o.isLine = d.readBoolean();
        o.accountID = d.readInt();

        if (o.userID == res.userID) res.pos = o.pos;
        pinfo.push(o);
    }
    res["当前出牌者ID"] = d.readLong();
    res.disTime = d.readInt(); //解散房间剩余时间
    res.roomCreateID = d.readLong(); //房主id
    res.roomCreateName = d.readString(); //房主name
    res.roomCreateImgUrl = d.readString(); //房主头像url
    res.roomCreateAccountId = d.readInt(); //房主accountId;
    res.isStarted = null;
    res.startPlay = null;
    //---位置转换
    for (i = 0; i < num; i++) {
        let ii = res.pos - 1;
        var p = pinfo[i].pos - ii;
        if (p < 1) p += res.playerNum;
        if (res.playerNum == 3 && p == 3) p = 4;
        if (res.playerNum == 2 && p == 2) p = 3;
        if (p == 4) p = 2;
        else if (p == 2) p = 4;


        res["playerInfo" + p] = pinfo[i];
        res["player" + p] = pp[i];
    }
}


Game.joinRoom = function (d) {
    var o = {};//
    o.userID = d.readLong();
    o.isBanker = d.readBoolean();
    o.name = d.readString();
    o.pos = d.readByte();
    o.ico = d.readString();
    o.sex = d.readByte();
    o.score = d.readShort();
    o.isReady = d.readBoolean();
    o.ipAddr = d.readString();
    o.isLine = d.readBoolean();
    o.accountID = d.readInt();
    var res = API.data;

    let ii = res.playerInfo1.pos - 1;
    var p = o.pos - ii;
    if (p < 1) p += res.playerNum;
    if (res.playerNum == 3 && p == 3) p = 4;
    if (res.playerNum == 2 && p == 2) p = 3;
    if (p == 4) p = 2;
    else if (p == 2) p = 4;



    console.log("---玩家位置----", res.playerNum, ii, p, o.pos)
    res["playerInfo" + p] = o;
    res["player" + p] = [];
    console.log(o.userID);
    API.data.numPlayers = 0;
    for (var i = 1; i < 5; i++) {
        if (res["playerInfo" + i]) {
            API.data.numPlayers = API.data.numPlayers + 1;
        }
    }

    res.newPlayerPos = p;
    API.update("余牌");
    if (res.startPlay) return;
    API.showUI("头像容器" + p, "底层");
    API.update(...["头像容器" + p, "3人游戏", "3人开始游戏"]);
}
Game.getRoomKey = function (d) {
    var res = API.data; //1003
    res.roomIP = d.readString();
    res.roomKey = d.readString();
    res.serverID = d.readIn();
}
Game.checkOnline = function (d) {
    var res = API.data;
    res["离线否"] = d.readByte();
    res["玩家ID"] = d.readLong();
    var n = getPosById(res["玩家ID"]);
    if (res["playerInfo" + n]) res["playerInfo" + n].isLine = res["离线否"] == 1;
    API.update(...["离线" + n, "玩离线" + n]);
    if (!$("申请退出界面")) return;
    for (var i = 0; i < res["申请退出列表"].length; i++) {
        if (res["申请退出列表"][i]['玩家ID'] == id) res["申请退出列表"][i]['在线否'] = res["离线否"] ? '' : "离线";
    }
    API.update("退出列表");
}
Game.checkReady = function (d) {
    var res = API.data;
    res["玩家ID"] = d.readLong();
    res["准备否"] = d.readBoolean();
    var n = getPosById(res["玩家ID"]);
    if (res["playerInfo" + n]) res["playerInfo" + n].isReady = res["准备否"];
    res["选飘状态" + n] = "";
    API.update(...["左上信息", "准备图标" + n,"准备图标"+n+n]);
    API.hideUI(["摸牌2", "摸牌3", "摸牌4"]);
    if (res.inClub) API.update("桌面底按钮2");
    else API.update("桌面底按钮");
}
Game.exitRoom = function (callback) {

    API.update("数值组");
    closeUI();
    if (valueOfServerType(WS.serverID) == 4) {
        API.load("bin/club.json", callback);
    } else {
        if(API.data.inClub) Game.requestServerID();
        else
        API.load("bin/app.json", callback);
    }
}
Game.returnHall = function (d) {
    var res = API.data; //1029
    res["退出成功"] = d.readBoolean();
    if (res["退出成功"]) {
        res["踢人"] = d.readBoolean();
        Game.parseBackToHallData(d);
        API.update("数值组");
        Game.exitRoom();
    }
}

Game.parseBackToHallData = function (d) {
    var res = API.data;
    res.serverType = d.readByte();//--服务器类型0:大厅,1俱乐部
    if (parseInt(res.serverType) == 1) {
        res.serverKey = res.clubKey = d.readString();
        res.serverHost = d.readString();
        res.clubID = d.readLong();//--返回的俱乐部ID;

    } else {
        res.serverKey = res.hallKey = d.readString();
        res.serverHost = d.readString();

    }
    console.log(res);
}
Game.againGame = function (d) {
    // pdkmanager.clear();
    var res = API.data;
    res.iamReady = true;
    res.startPlay = null;
    API.hideUI(["大结算界面", "出牌屏蔽", "屏蔽遮罩"]);

    for (var n = 1; n < 5; n++) {
        var d = res["playerInfo" + n];
        if (!d) continue;
        d.handCardNum = 0;
        update("玩家牌数" + n);
    }

    res.currPass = 0;
    // res.iamReady = true;
    update("局数");
    WS.socket.send(WS.writeMessage(1117, null, function (writer) {
        var loginKey = res.serverKey;    // 1028接收的信息
        writer.writeString(loginKey);
        console.log("loginKey:", loginKey);
    }));
}

Game.oneMoreGame = function (d) {//1117
    var res = {};
    res.playerId = d.readLong();//--请求再来一局的玩家ID
    res.lastRoomId = d.readInt(); //--上一局的房间号
    res.custom = d.readString(); //上一局房间的开房参数
    res.inviteUserIds = d.readString(); //上一局的玩家(除去开房者)
    res.clubId = d.readLong(); // 趣友圈ID(非趣友圈开房为0)
    res.deskId = d.readInt(); // 趣友圈桌号
    res.clubHost = d.readString(); //趣友圈host
    API.data.lastRoomInfo = res;
    API.data.isAgainPdk = true;
    WS.socket.send(WS.writeMessage(1095, null, function (writer) {
        // 空协议
    }));
}

/**
 * 1095返回，即退出房间, 这时服务器id应该已经更新
 */
Game.onRequestServerID = function (d) {
    var res = API.data;
    if (res.isAgainPdk) {    // 大结算再来一局
        res.isAgainPdk = false;
        // 返回大厅或俱乐部，再请求开房开个房
        Game.exitRoom(requestCreateRoom);
    } else if (res.isInviteAgain) {    // 再来一局邀请
        res.isInviteAgain = false;
        Game.exitRoom(requestJoinRoom);
    } else {
        Game.exitRoom();
    }

    // 请求开新房
    function requestCreateRoom() {
        setTimeout(() => {
            var lastRoomInfo = res.lastRoomInfo;
            console.log("麻将再来一局，请求开新房, json:", JSON.stringify(lastRoomInfo));
            var waitSendTimer = setInterval(function () {
                console.log("WS.socket.readyState:", WS.socket.readyState);
                if (WS.socket.readyState === 1) {

                    if (valueOfServerType(WS.serverID) == 4) {
                        console.log("俱乐部发送1411请求开房");
                        // 俱乐部 发送1411
                        WS.socket.send(WS.writeMessage(1411, null, function (writer) {
                            var json = JSON.parse(lastRoomInfo.custom);
                            writer.writeLong(lastRoomInfo.clubId);   // 趣友圈id
                            writer.writeByte(json.floor);    // 指定楼层
                            writer.writeByte(0);        // 玩法索引，过时参数，发0
                            writer.writeShort(lastRoomInfo.deskId);  // 桌号
                            writer.writeString(lastRoomInfo.custom);    // 玩法设置
                            // 再来一局的东西
                            writer.writeString(lastRoomInfo.inviteUserIds);     // 邀请用户，再来一局下发的邀请用户
                            writer.writeInt(lastRoomInfo.lastRoomId);         // 再来一局下发的最后的房间号
                            writer.writeString(json.SERVER_MODEL);     // 再来一局下发的玩法
                        }));
                    } else {
                        console.log("大厅发送1090请求开房");
                        // 大厅 发送1090
                        WS.socket.send(WS.writeMessage(1090, null, function (writer) {
                            writer.writeString(lastRoomInfo.custom);
                            writer.writeString(lastRoomInfo.inviteUserIds);
                            console.log(lastRoomInfo.inviteUserIds);
                            writer.writeInt(lastRoomInfo.lastRoomId);
                        }));
                    }

                    clearInterval(waitSendTimer);

                }
            }, 30);
        }, 3000);
    }

    // 请求加入房间 大厅发送1003，俱乐部发送1410
    function requestJoinRoom() {
        setTimeout(() => {
            var inviteMsg = res.inviteMsg;
            console.log("麻将再来一局，邀请信息, json:", JSON.stringify(inviteMsg));
            var waitSendTimer = setInterval(function () {
                console.log("WS.socket.readyState:", WS.socket.readyState);
                if (WS.socket.readyState === 1) {
                    // 加入房间
                    if (valueOfServerType(WS.serverID) == 4) {
                        WS.socket.send(WS.writeMessage(1410, null, function (writer) {
                            console.log("俱乐部麻将再来一局发送1410加入房间, clubID:", API.data.clubID, "roomId:", inviteMsg.roomId);
                            writer.writeLong(API.data.clubID);
                            writer.writeInt(inviteMsg.roomId);
                            writer.writeByte(0);
                        }));
                    } else {
                        WS.socket.send(WS.writeMessage(1003, null, function (writer) {
                            writer.writeInt(inviteMsg.roomId);
                        }));
                    }
                    clearInterval(waitSendTimer);
                }
            }, 30);
        }, 3000);
    }
}

Game.oneMoreInvite = function (d) {//1116

    var res = {};
    res.userID = d.readInt();
    res.name = d.readString();
    res.ico = d.readString();
    res.roomId = d.readInt();
    res.roomName = d.readString();//玩法名
    res.roomInfo = d.readString();//玩法名
    res.roomInfo = "玩法：" + getRuleText(res.roomInfo);
    API.data.inviteMsg = res;
    API.runActionGroup("显示", "邀请再来一局");


}

/**
 * 点击确定邀请
 */
Game.onAcceptInviteClick = function () {
    // 请求1095 返回到俱乐部或者大厅，再请求加入房间
    console.log("再来一局确定邀请");
    API.hideUI("邀请再来一局", "屏蔽遮罩");
    var res = API.data;
    res.isInviteAgain = true;              // 邀请标识
    Game.requestServerID();
}
Game.requestServerID = function () {
    WS.socket.send(WS.writeMessage(1095));
};

Game.IPAlarm = function (d) {
    WS.socket.send(WS.writeMessage(1304));
}

Game.applyExit = function (d) {
    var res = API.data;
    res["申请者ID"] = d.readLong();
    res["超时总时间"] = d.readInt();
    res["断线时间"] = d.readInt();
    res["退出倒计时"] = d.readInt();
    var num = d.readShort(); //玩家数量
    res["申请退出列表"] = [];
    var ls = res["申请退出列表"];
    for (var n = 0; n < num; n++) {
        d.readShort();
        var o = {};
        o["玩家ID"] = d.readLong();
        o["同意否"] = d.readLong();
        o["在线否"] = d.readBoolean();
        o["在线否"] = o["在线否"] ? "" : "离线";
        var ii = getPosById(o["玩家ID"]);
        o["玩家名称"] = res["playerInfo" + ii].name;
        ls.push(o);
        if (o["玩家ID"] == res["申请者ID"]) {
            res["申请者名称"] = o["玩家名称"];
            o["同意否"] = ls[n]["同意否"] ? "已同意" : "未表态";
        }

    }

    res["同意退出"] = false;
    var d = res["申请退出列表"];
    for (var i = 0; i < d.length; i++) {
        if (d[i]["玩家ID"] == res.userID && d[i]["同意否"]) {
            res["同意退出"] = true;
        }
        d[i]["同意否"] = d[i]["同意否"] ? "已同意" : "未表态";
    }
    //res["退出倒计时"]
    API.runActionGroup("显示", "申请退出界面");

}
Game.checkExit = function (d) {//1030 未开局退出
    var res = API.data;
    var p = getPosById(d.readLong());
    delete res["playerInfo" + p];
    API.data.numPlayers = API.data.numPlayers - 1;
    API.update(...["头像容器" + p, "3人游戏", "3人开始游戏"]);

}


Game.getOut2 = function (d) {
    var res = API.data;
    if (!res.startPlay && res.roomCreateID != res["申请者ID"]) {
        Game.returnHall();
        return;
    } else if (!res.startPlay && res.roomCreateID == res["申请者ID"]) {
        WS.socket.send(WS.writeMessage(1016));
        return;
    }
    Game.applyExit();
}

Game.startchupai = function () {
    var res = API.data; //1004
    API.showUI("游戏桌面", "底层");console.log("====出牌")
    if (res.ting) API.showUI('出牌line', "中间层");
    API.hideUI(['出牌屏蔽']);
    var lp = API.getUI("罗盘");
    if (lp) lp.value = "cp" + res["playerInfo1"].pos;
    if (res["听牌列表"] && res["摸的牌"]) {
        for (var n = 0; n < res["听牌列表"].length; n++) {
            if (res["听牌列表"][n].id == res["摸的牌"]) {
                res["听牌列表"].splice(n, 1);
                if (res["听牌列表"].length < 1) {
                    API.hideUI("听牌提示");
                } else
                    update("听牌组");
                return;
            }
        }
    }

}
Game.start = function () {
    API.timer.remove("动画计时");
    var d = -1;
    var t = API.getUI("提示位图");
    var o = API.getUI("罗盘");
    API.timer.play(3, 1, function () {
        o.alpha += 0.1 * d;
        if (o.alpha < 0.2) {
            d = 1;
        } else if (o.alpha > 0.9) {
            d = -1;
        }
        t.y += 1 * d;
    }, null, true, "动画计时");
    var res = API.data;
    res.startPlay = true;
    res.p = getPosById(res["当前出牌者ID"]);
    Game.updateSign(false);
    if (res["playerInfo" + res.p]) o.value = "cp" + res["playerInfo" + res.p].pos;
    Game.rotateCP();
    if (res.p > 1) API.showUI("摸牌" + res.p, "底层");
    API.timer.remove("出牌倒计时");
    var tt = API.getUI("出牌倒计时");
    tt.value = 15;
    API.timer.play(30, 15, function () {
        if (tt.value > 0) tt.value--;
    }, function () {
        tt.value = 0;
    }, false, "出牌倒计时");
    API.hideUI(["特效容器1", "特效容器2", "特效容器3", "特效容器4"]);
}
Game.showGDesk = function () {
    var res = API.data;
    API.hideUI("发牌动画");
    API.showUI("游戏桌面2", "底层");
    for (var i = 1; i < 5; i++) {
        if (res.playerNum == 3 && i == 3) {
            continue;
        }
        else {
            API.runActionGroup("加载牌", i);
        }

        API.getUI("麻将容器" + i).flex();
    }

}

Game.sort = function (p) { //整理手牌
    if (p != 1) return;
    var d = API.data["手牌组1"];
    if (!d) return;
    d = d.sort(function (o1, o2) {
        if (o1.id > o2.id) return 1;
        else return -1;
    });
    // API.showUI("出牌屏蔽", "中间层");
}
var huType = ["流局", "自摸", "抢杠胡", "点炮", "抓炮", "放炮", "海底捞", "海底炮", "杠上炮", "杠上花", "一炮多响", "一杠多花"];
var gangType = [, , "接杠", "公杠", , "暗杠"];
Game.huPai = function (d) {
    //1006
    var res = API.data;
    if (res["玩法名称"].model == "zzmj") {
        Game.zzhuPai(d);
    } else if (res["玩法名称"].model == "hz") {
        Game.hzhuPai(d);
    }
//	Game.zzhuPai(d);

}

Game.zzhuPai = function (d) {
    var res = API.data;
    d.readShort();
    var type = d.readByte(); //--胡牌类型
    var winnum = d.readShort();
    res["胡玩家"] = [];
    res["七小对"] = [];
    res["胡的牌"] = [];
    for (var i = 0; i < winnum; i++) { //winnum玩家数
        d.readShort();
        res["胡玩家"][i] = d.readLong();
        res["胡的牌"][i] = d.readInt();
        res["七小对"][i] = d.readString();
    }
    res.zhamaBean = [];
    res["中码"] = [];
    var zmnum = res["码个数"] = d.readShort();
    for (i = 0; i < zmnum; i++) {
        res.zhamaBean[i] = {
            id: d.readInt()
        };
    }

    function isHu(uid) { //判断胡了没
        for (var i = 0; i < winnum; i++) {
            if (res["胡玩家"][i] == uid) {
                return [res["胡的牌"][i], res["七小对"][i]];
            }
        }
        return null;
    }

    res.jiesuanData = [];
    var beannum = d.readShort();
    var isFanggang = false,
        isYipaoduoxiang = winnum > 1;
    res["分享战绩"] = [];
    for (i = 0; i < beannum; i++) {
        d.readShort();
        var tb = {};
        tb.userID = tb.playerId = d.readLong();
        var h = isHu(tb.userID);
        if (h) {
            tb.hu = true;
            tb["胡的牌"] = h[0];
            tb["七小对"] = h[1];
        }

        tb.score = d.readInt();
        tb.accountID = d.readInt();
        tb.piao = d.readInt();

        tb.cardList = [];
        var cardListnum = d.readShort(),
            hasP = false;
        tb.handcard = [];
        tb.mingpai = [];
        tb.pengpai = [];
        tb.hupai = -1;//玩家胡法
        tb.isFanggang = false;
        for (var j = 0; j < cardListnum; j++) {
            d.readShort();
            var o = {};
            o.type = d.readByte();
            o.id = d.readInt();
            o.num = d.readByte();
            if (o.type < 7 && o.type > 0) {
                if (o.type == 6) {

                    for (var n = 0, l = o.num; n < l; n++) {
                        if (tb.hu && !hasP) { //如果胡去掉胡的牌
                            if (o.id == tb["胡的牌"]) {
                                hasP = true;
                                continue;
                            }
                        }
                        tb.handcard.push(o);
                        // o.num = 1;
                    }
                } else if (o.type == 4) {
                    tb["放杠"] = 1;
                    isFanggang = true;
                    tb["胡牌类型"] = "放杠";
                } else if (o.type == 1) {
                    tb.pengpai.push(o);
                } else {
                    o.gangType = gangType[o.type];
                    tb.mingpai.push(o);
                }
            }

            tb.cardList.push(o);

        }
        if (tb.hu && !hasP) { //tb["胡的牌"]=0时//天湖
            tb["胡的牌"] = tb.cardList.pop().id;
            tb.handcard.pop();
        }
        var hu7pair = d.readString();
        console.log("hu7pair=====", hu7pair);
        tb.pos = getPosById(tb.playerId);
        tb.ico = res["playerInfo" + tb.pos].ico;
        tb.name = res["playerInfo" + tb.pos].name;
        res["playerInfo" + tb.pos].score += tb.score;
        res["playerInfo" + tb.pos].isReady = false;
        if (h) {
            tb["胡牌类型"] = res["胡牌类型" + tb.pos] = huType[type];
            res["胡牌图标" + tb.pos] = "hut" + type;
            if (hu7pair == 1) {
                tb["胡牌类型"] = res["胡牌类型" + tb.pos] = "七小对";
                res["胡牌图标" + tb.pos] = "hut0";
            }
            res.s = res["playerInfo" + tb.pos].sex;

        }

        var zhongMa = [];//玩家中的码
        var len = d.readShort();
        for (var j = 0; j < len; j++) {
            var id = d.readInt();
            zhongMa.push(id);
            for (var k = 0; k < res.zhamaBean.length; k++) {
                if (res.zhamaBean[k].id == id && tb.pos == 1) {
                    res.zhamaBean[k].img = "tile_zhama_light";
                }
            }
        }
        tb.zhongMa = zhongMa;
        res["分享战绩"].push(tb);
        res.jiesuanData[i] = tb;
    }
    if (winnum == 0) {
        for (j = 0; j < beannum; j++) {
            res.jiesuanData[j]["胡牌类型"] = huType[0];
        }
        res["流局"] = 1;
    }

    var ypnum = d.readShort();
    res["余牌"] = [];
    for (i = 0; i < ypnum; i++) {
        res["余牌"].push({
            id: d.readInt()
        });
    }

    for (i = 0; i < beannum; i++) {
        var ht = res.jiesuanData[i]["胡牌类型"];
        if (!ht) continue;
        if (ht == huType[1]) {
            if (isFanggang) res.jiesuanData[i]["胡牌类型"] = "自摸"; //"放杠自摸";
        } else if (ht == huType[2]) {
            if (isFanggang) {
                res.jiesuanData[i]["胡牌类型"] = "放杠抢杠胡";
            } else if (ht == huType[3]) {
                if (isYipaoduoxiang) res.jiesuanData[i]["胡牌类型"] = "一炮多响"
            }
        } else {
            if (res.jiesuanData[i] && isFanggang && res.jiesuanData[i].hu) res["放杠" + i] = "放杠";
        }
    }
    var loser = res["放炮玩家ID"] = d.readLong();
    for (j = 0; j < beannum; j++) {
        if (res.jiesuanData[j].userID == loser) {
            res.jiesuanData[j]["胡牌类型"] = "hut5";
            res.jiesuanData[j]["胡牌类型"] = "放炮";
        }
    }
    API.style["中码界面"].width = 75 * zmnum + 70;
    API.hideUI("出牌line");
    API.data["按钮列表"] = API.data["听牌列表"] = [];
    API.hideUI(["听牌提示", "漏胡提示", "吃碰杠胡按钮"]);
    res["日期"] = new Date().format("YYYY/MM/DD hh:mm:ss");
    if (winnum < 1) {
        API.runActionGroup("流局小结算");
    } else {
        API.playSound("s" + res.s + "hu");

        API.runActionGroup("小结算");
    }
}

function xiaojiesuanInit() {
    var res = API.data;

    var l = res.jiesuanData.length == 3 ? 20 : 5;
    l = res.jiesuanData.length == 2 ? 30 : l;
    console.log('=====l=====',l);
    $("结算列表").appendStyle({
        lineHeight: l
    });

    for (var i = 0; i < res.jiesuanData.length; i++) {

        if (res.jiesuanData[i].playerId == res.userID) {
            console.log(i);
            $("结算项[" + i + "]").appendStyle({
                "backgroundColor": 'rgba(223,239,236,1)'
            });
        }

        $("杠列表[" + i + "]").value = res.jiesuanData[i].mingpai;
        $("结算手牌组[" + i + "]").value = res.jiesuanData[i].handcard;
        $("结算吃碰组[" + i + "]").value = res.jiesuanData[i].pengpai;

        $("杠列表[" + i + "]").flex();
        $("结算吃碰组[" + i + "]").flex();
        $("结算牌容器[" + i + "]").flex();

    }
    if(res.jiesuanData.length == 2 ){
        $("底部结算新").appendStyle({
            top: '120B'
        });
    }

    $("结算列表").flex();

}

Game.hzhuPai = function (d) {

    var res = API.data;
    d.readShort();
    var type = d.readByte(); //--胡牌类型
    var winnum = d.readShort();
    res["胡玩家"] = [];
    res["胡类型"] = [];
    res["胡的牌"] = [];
    for (var i = 0; i < winnum; i++) { //winnum玩家数
        d.readShort();
        res["胡玩家"][i] = d.readLong();
        res["胡的牌"][i] = d.readInt();
        res["胡类型"][i] = d.readString();
    }
    res.zhamaBean = [];
    res["中码"] = [];
    var zmnum = res["码个数"] = d.readShort();
    var g = res["玩法设置"];
    g = eval('(' + g + ')');
    for (var i = 0; i < zmnum; i++) {
        var r = res["中码"][i] = d.readInt();
        var z = String(r).charAt(2);
        if (r == 400 || z == 1 || z == 5 || z == 9) {
            z = "tile_zhama_light";
        } else {
            z = "";
        }
        res.zhamaBean[i] = {
            id: r,
            img: z
        };

    }
    var tmpnum = d.readShort();
    res["余牌"] = [];
    for (i = 0; i < tmpnum; i++) {
        res["余牌"].push({
            id: d.readInt()
        });
    }

    function isHu(uid) { //判断胡了没
        for (var i = 0; i < winnum; i++) {
            if (res["胡玩家"][i] == uid) {
                return [res["胡的牌"][i], res["胡类型"][i]];
            }
        }
        return null;
    }

    var beannum = d.readShort();
    var isFanggang = false,
        isYipaoduoxiang = winnum > 1;
    res.jiesuanData = [];
    res["分享战绩"] = [];
    for (i = 0; i < beannum; i++) {
        d.readShort();
        var tb = {};
        tb.userID = d.readLong();
        var h = isHu(tb.userID);
        if (h) {
            tb.hu = true;
            tb["胡的牌"] = h[0];
            tb["胡类型"] = h[1];
        }
        tb.cardList = [];
        var cardListnum = d.readShort(),
            hasP = false;
        tb.handcard = [];
        tb.mingpai = [];
        tb.pengpai = [];
        tb.hupai = -1;//玩家胡法
        tb.isFanggang = false;
        for (var j = 0; j < cardListnum; j++) {
            d.readShort();
            var o = {};
            o.type = d.readByte();
            o.id = d.readInt();
            o.num = d.readByte();
            if (o.type < 7 && o.type > 0) {
                if (o.type == 6) {

                    for (var n = 0, l = o.num; n < l; n++) {
                        if (tb.hu && !hasP) { //如果胡去掉胡的牌
                            if (o.id == tb["胡的牌"]) {
                                hasP = true;
                                continue;
                            }
                        }
                        tb.handcard.push(o);
                        // o.num = 1;
                    }
                } else if (o.type == 4) {
                    tb["放杠"] = 1;
                    isFanggang = true;
                    tb["胡牌类型"] = "放杠";
                } else if (o.type == 1) {
                    tb.pengpai.push(o);
                } else {
                    o.gangType = gangType[o.type];
                    tb.mingpai.push(o);
                }
            }

            tb.cardList.push(o);

        }

        tb.score = d.readInt();
        tb.paixing = d.readString();

        if (tb.hu && !hasP) { //tb["胡的牌"]=0时//天湖
            tb["胡的牌"] = tb.cardList.pop().id;
            tb.handcard.pop();
        }

        tb.pos = getPosById(tb.userID);
        tb.ico = res["playerInfo" + tb.pos].ico;
        tb.name = res["playerInfo" + tb.pos].name;
        tb.accountID = res["playerInfo" + tb.pos].accountID;
        res["playerInfo" + tb.pos].score += tb.score;
        res["playerInfo" + tb.pos].isReady = false;
        if (h) {
            tb["胡牌类型"] = res["胡牌类型" + tb.pos] = huType[type];
            res["胡牌图标" + tb.pos] = "hut" + type;
            if (tb.paixing == 1) {
                tb["胡牌类型"] = res["胡牌类型" + tb.pos] = "七小对";
                res["胡牌图标" + tb.pos] = "hut0";
            }
            res.s = res["playerInfo" + tb.pos].sex;
        }
        res["分享战绩"].push(tb);
        res.jiesuanData[i] = tb;

    }
    if (winnum == 0) {
        for (j = 0; j < beannum; j++) {
            res.jiesuanData[j]["胡牌类型"] = huType[0];
        }
        res["流局"] = 1;
    }


    for (i = 0; i < beannum; i++) {
        var ht = res.jiesuanData[i]["胡牌类型"];
        if (!ht) continue;
        if (ht == huType[1]) {
            if (isFanggang) res.jiesuanData[i]["胡牌类型"] = "自摸"; //"放杠自摸";
        } else if (ht == huType[2]) {
            if (isFanggang) {
                res.jiesuanData[i]["胡牌类型"] = "放杠抢杠胡";
            } else if (ht == huType[3]) {
                if (isYipaoduoxiang) res.jiesuanData[i]["胡牌类型"] = "一炮多响"
            }
        } else {
            if (res.jiesuanData[i] && isFanggang && res.jiesuanData[i].hu) res["放杠" + i] = "放杠";
        }
    }

    var loser = res["放炮玩家ID"] = d.readLong();
    for (j = 0; j < beannum; j++) {
        if (res.jiesuanData[j].userID == loser) {
            res.jiesuanData[j]["胡牌类型"] = "hut5";
            res.jiesuanData[j]["胡牌类型"] = "放炮";
        }
    }

    API.style["中码界面"].width = 75 * zmnum + 70;
    API.hideUI("出牌line");
    API.data["按钮列表"] = API.data["听牌列表"] = [];
    res["日期"] = new Date().format("YYYY/MM/DD hh:mm:ss");
    API.hideUI(["听牌提示", "漏胡提示", "吃碰杠胡按钮"]);
    if (winnum < 1) {
        API.runActionGroup("流局小结算");
    } else {
        API.playSound("s" + res.s + "hu");

        API.runActionGroup("小结算");
    }
}

function getPosById(v) {
    var d = API.data;
    for (var n = 1; n < 5; n++) {
        if (d["playerInfo" + n] && d["playerInfo" + n].userID == v) {

            if (d.playerNum == 3 && n == 3) return 4;
            else if(d.playerNum == 2 && n!=1) return 3;
            return n;
        }
    }
    return 0;
}

Game.rotateCP = function () { //出牌指向
    var res = API.data;
    var pp = getPosById(res["当前出牌者ID"]);
    if (res["当前出牌者ID"] != res["playerInfo1"].userID) API.showUI("摸牌" + pp, "底层");
    if (pp == 2) pp = 4;
    else if (pp == 4) pp = 2;
    if (res.playerNum == 3 && pp == 3) pp = 2;

    if (pp == 0) pp = 1;
    console.log("------出牌指向------>", pp, res["playerInfo" + pp].pos, res["playerInfo1"].pos)
    if ((pp == 2 && res["playerInfo" + pp].pos == 3) || (pp == 4 && res["playerInfo" + pp].pos == 1))
        pp = 4;
    else if (res.playerNum == 2 && pp==3){
        pp=res["playerInfo" + pp].pos == 2?3:4;
    }
    else pp = res["playerInfo" + pp].pos;


    var lp = API.getUI("罗盘");
    if (lp) lp.value = "cp" + pp ;
}
Game.gameOver = function (d) {
    var res = API.data; //1028
    if (API.getUI("申请退出界面")) {
        API.runActionGroup("关闭");
    }
    var b = d.readByte(); //0:解散失败，1解散成功
    if (b == 0) {
        return;
    }
    if (res.serverModel == "hz") {
        Game.hzGameOver(d);
    } else if (res.serverModel == "zzmj") {
        Game.zzmjGameOver(d);
    }

}


Game.hzGameOver = function (d) {
    var res = API.data;
    var num = d.readShort();
    var maxScore = 0;
    res["分享战绩"] = [];
    res.players = [];
    for (var i = 0; i < num; i++) {
        d.readShort();
        var o = {};
        o.userID = d.readLong(); //--玩家id;
        o.accountID = d.readInt(); //--玩家账号;
        var s = [];
        s.push({
            name: "胡牌次数",
            value: d.readShort()
        }); //--胡牌次数（大局，小局）；
        s.push({
            name: "公杠次数",
            value: d.readShort()
        });
        s.push({
            name: "暗杠次数",
            value: d.readShort()
        }); //--暗杠
        s.push({
            name: "中码次数",
            value: d.readShort()
        }); //--扎码
        o.totalScore = d.readShort(); //--分数;
        if (o.totalScore > maxScore) maxScore = o.totalScore;
        o.name = d.readString(); //--玩家名字
        o.list = s;
        res.players[i] = o;
        res["分享战绩"].push(o);
    }
    for (var i = 0; i < num; i++) {
        if (!res.players) continue;
        if (res.players[i].totalScore == maxScore && res.players[i].totalScore > 0) {
            res.players[i].bigWin = "biaoshi_dayingjia";
            res.players[i].zhanjibg = "changgui_2";
        } else {
            res.players[i].bigWin = "";
            res.players[i].zhanjibg = "changgui_1";
        }
    }
    if (!res.startPlay && res.currPass <= 1) {//未开局解散
        closeUI();
        Game.parseBackToHallData(d);
        Game.exitRoom();
        return;
    }


    res["日期"] = new Date().format("YYYY/MM/DD hh:mm:ss");
    if (res["currPass"] == res["gamecnt"]) {
        API.runActionGroup("小结算");
    } else {

        API.runActionGroup("显示", "大结算界面");
    }
    Game.parseBackToHallData(d);
}


Game.zzmjGameOver = function (d) {
    var res = API.data;
    var num = d.readShort();
    var maxScore = 0;
    res.players = res["分享战绩"] = [];
    for (var i = 0; i < num; i++) {
        d.readShort();
        var o = {};
        o.userID = d.readLong(); //--玩家id;
        // var ii = getPosById(userID);
        // var o = res["playerInfo" + ii];
        // if(!o) continue;
        // o.userID = userID;
        var s = [];
        s.push({
            name: "自摸次数",
            value: d.readShort()
        }); //--胡牌次数（大局，小局）；
        s.push({
            name: "点炮次数",
            value: d.readShort()
        });
        s.push({
            name: "明杠次数",
            value: d.readShort()
        }); //--明杠
        s.push({
            name: "暗杠次数",
            value: d.readShort()
        }); //--暗杠
        s.push({
            name: "扎码次数",
            value: d.readShort()
        }); //--扎码
        o.totalScore = d.readShort(); //--分数;
        if (o.totalScore > maxScore) maxScore = o.totalScore;
        o.name = d.readString(); //--玩家名字
        o.accountID = d.readInt(); //--玩家账号;
        o.list = s;
        res["分享战绩"].push(o);
        res.players[i] = o;
    }
    for (var i = 0; i < num; i++) {
        if (!res.players) continue;
        if (res.players[i].totalScore == maxScore && res.players[i].totalScore > 0) {
            res.players[i].bigWin = "biaoshi_dayingjia";
            res.players[i].zhanjibg = "changgui_2";
        } else {
            res.players[i].bigWin = "";
            res.players[i].zhanjibg = "changgui_1";
        }
    }
    if (!res.startPlay && res.currPass <= 1) {//未开局解散
        closeUI();
        Game.parseBackToHallData(d);
        Game.exitRoom();
        return;
    }


    res["日期"] = new Date().format("YYYY/MM/DD hh:mm:ss");
    if (res["currPass"] == res["gamecnt"]) {
        API.runActionGroup("小结算");
    } else {

        API.runActionGroup("显示", "大结算界面");
    }
    Game.parseBackToHallData(d);
    res.oneMoreUserId = d.readLong();
    if(res.oneMoreUserId===res.userID){
        $("再来一局按钮").visible = true;
    }else{
        $("再来一局按钮").visible = false;
    }
    console.log("能否再来一局",res.oneMoreUserId,res.userID);
}

function MajiangSetlist() {
    var res = API.data;
    for (var i = 0; i < res.players.length; i++) {
        $("战绩细则区[" + i + "]").value = res.players[i].list;
        if (res.players.userID == res.roomCreateID) {
            $("房主标识[" + i + "]").visible = true;
        }
    }

    if(res.isClub)
        $("趣友圈标识").value = "趣友圈";
    else $("趣友圈标识").value = "好友场";
}

Game.roomListCountdown = function () {
    var res = API.data,
        o = res.roomList;
    if (!o) return;
    for (var n = 0; n < o.length; n++) {
        if (o[n].remainTime < 1) continue;
        o[n].remainTime--;
        o[n]["剩余时间"] = Date.numToTime(o[n].remainTime);
        //console.log(o[n]["剩余时间"])
        var b = API.getUI("剩余时间[" + n + "]");
        if (b) {
            b.value = {
                "剩余时间": o[n]["剩余时间"]
            }
        }
    }
}

Game.choicePiao = function (d) {
    //return;
    var res = API.data;
    for (var n = 1; n < 5; n++) {
        res["选飘状态" + n] = "选飘中";
    }
    var l = d.readShort();
    for (n = 0; n < l; n++) {
        d.readShort();
        var i = getPosById(d.readLong());
        //res["piao" + i] = d.readInt();
        if (d.readBoolean()) res["选飘状态" + i] = "已选飘";
    }
    for (var n = 1; n < 5; n++) {
        API.update(...["选飘" + n, "飘标识" + n]);
    }
}
Game.selected = {};
Game.onPress = function (index) {//拖动手牌


    var res = API.data;
    var json  = JSON.parse(res.roomType);
    var isCanplayH = json.PLAY_EIGHT;
    if (index < 0) {
        $("摸的牌中").visible = true;
        // res["摸的牌中"]="up_color_2";
        for (var i = 0; i < res["手牌组1"].length; i++) {
            API.getUI("选中牌[" + i + "]").visible = false;
            res["手牌组1"][i].meng = "";
            if (res["摸的牌"] == res["手牌组1"][i].id) {
                API.getUI("选中牌[" + i + "]").visible = true;
            }
            API.getUI("手牌1[" + i + "]").y = 0;
        }
        if (res["摸的牌听列表"] && res["摸的牌听列表"].length > 0) {
            upDateCenter(res["摸的牌听列表"]);
        } else
            hide("听牌界面");

        API.getUI("摸牌1").y = -30;
        if(isCanplayH && res["摸的牌"]==400){
            API.runActionGroup("错误提示", "8个红中玩法不允许打出红中牌");
            API.runActionGroup("加载牌", 1);
        }
    } else {
        if (API.getUI("摸牌1")) {
            API.getUI("摸牌1").y = 0;
            $("摸的牌中").visible = false;
        }
        for (var i = 0; i < res["手牌组1"].length; i++) {
            // res["手牌组1"][i].meng = "";
            API.getUI("选中牌[" + i + "]").visible = false;
            if (res["手牌组1"][index].id == res["手牌组1"][i].id) {
                // res["手牌组1"][i].meng = "up_color_2";
                API.getUI("选中牌[" + i + "]").visible = true;
                if (res["手牌组1"][index].tingpaiList && res["手牌组1"][index].tingpaiList.length > 0) {
                    upDateCenter(res["手牌组1"][index].tingpaiList);
                } else hide("听牌界面");
            } else if (res["摸的牌"] == res["手牌组1"][index].id) {
                // res["摸的牌中"]="up_color_2";
                $("摸的牌中").visible = true;
            }

            API.getUI("手牌1[" + i + "]").y = 0;
        }
        API.getUI("手牌1[" + index + "]").y = -30;

        if(isCanplayH && res["手牌组1"][index].id==400){
            API.runActionGroup("错误提示", "8个红中玩法不允许打出红中牌");
            API.runActionGroup("加载牌", 1);
        }


    }



    if (Game.selected && Game.selected.obj) {
        Game.selected.obj.x = Game.selected.x;
        Game.selected.obj.y = Game.selected.y;
    }

    function upDateCenter(tingpaiList) {
        show("听牌界面");
        $("听牌组2").value = tingpaiList;
        $("听牌组2").flex();
        $("听牌界面").flex();
        $("听牌界面").width += 20;
        $("听牌界面").x = ($("游戏桌面").width - $("听牌界面").width) / 2;
    }

    Game.selected = {};
    var o = API.getUI(index < 0 ? "摸牌1" : ("手牌1[" + index + "]"));
    Game.selected.obj = o;
    Game.selected.x = o.x;
    Game.selected.y = o.y;
}

Game.onDrop = function (index) {

    if (!Game.selected || !Game.selected.obj || Game.selected.obj.index != index) return;
    if (Game.selected.obj.y < Game.selected.y - 90) {
        API.runAction(index == -1 ? "摸牌1_ondbclick" : "手牌1_ondbclick");
        delete Game.selected;
        return;
    }
    r();

    function r() {
        Game.selected.obj.x = Game.selected.x;
        Game.selected.obj.y = Game.selected.y;
        delete Game.selected;
    }

}

Game.player1ChuPai=function(){
    API.data["出的牌"]=API.data["手牌组1"][API.getTarget().index].id;
    console.log("-----------8个红中--------->",API.data["出的牌"]);
    var json  = JSON.parse(API.data.roomType);
    var isCanplayH = json.PLAY_EIGHT;
    console.log("-----------8个红中 ---isCanplayH------>",isCanplayH,API.data["出的牌"]);
    //如果8码 ，不能出红中
    if(isCanplayH && API.data["出的牌"]==400){
        API.runActionGroup("错误提示", "8个红中玩法不允许打出红中牌");
        API.runActionGroup("加载牌", 1);
        return ;
    }

    // for(var n=0;n<API.data.player1.length;n++){
    //     if(API.data.player1[n].id==API.data["出的牌"] && API.data.player1[n].type==6){
    //         API.data["出牌序号"]=n;
    //         break;
    //     }
    // }
    WS.socket.send(WS.writeMessage(1008));

    API.data["出牌序号"]=API.getTarget().index;
    API.hideUI("出牌线");
}
Game.chuMoPai = function(targetIndex){
    API.data["出牌序号"]=targetIndex;
    API.data["出的牌"]=API.data["摸的牌"];

    var json  = JSON.parse(API.data.roomType);
    var isCanplayH = json.PLAY_EIGHT;
    console.log("-----------8个红中 ---isCanplayH------>",isCanplayH,API.data["出的牌"]);
    //如果8个红中玩法 ，不能出红中
    if(isCanplayH && API.data["出的牌"]==400){
        API.runActionGroup("错误提示", "8个红中玩法不允许打出红中牌");
        API.runActionGroup("加载牌", 1);
        return ;
    }

    WS.socket.send(WS.writeMessage(1008));
    API.data["出牌序号"]=API.getTarget().index;
    API.hideUI("出牌线");
    API.hideUI("摸牌1");
}

Game.chupai = function (d) {
    var res = API.data;
    var uID = d.readLong();
    res.p = getPosById(uID);
    var index = d.readByte();
    res["出的牌"] = d.readInt();
    var pl = res["player" + res.p];
    API.hideUI("吃碰杠胡按钮");
    res["摸的牌听"] = "";
    res["摸的牌听列表"] = [];
    for (var k = 0; k < res["手牌组1"].length; k++) {
        res["手牌组1"][k].ting = "";
    }
    if (res.p == 1) {
        if (index > -1) { //出牌
            API.getUI("手牌1[" + res["出牌序号"] + "]").visible = false;
            for (var n = pl.length - 1; n >= 0; n--) {
                if (pl[n].id == res["出的牌"] && pl[n].type == 6) {

                    pl.splice(n, 1);
                    break;
                }
            }
            API.showUI("出牌屏蔽", "中间层");
        } else { //出摸牌
            pl.push({
                id: res["摸的牌"],
                type: 7,
                num: 1
            });
            delete res["摸的牌"];
            afterchupai();
            return;
        }
    }
    if (res["摸的牌"]) {
        pl.push({
            id: res["摸的牌"],
            type: 6,
            num: 1
        });
        delete res["摸的牌"];
    } else if (res.p > 1) {
        checkPai(res.p);
    }
    pl.push({
        id: res["出的牌"],
        type: 7,
        num: 1
    });
    res["出牌组" + res.p].push({
        type: 7,
        id: res["出的牌"],
        num: 1
    });

    API.timer.remove("出牌倒计时");
    var t = API.getUI("出牌倒计时");
    t.value = 15;
    API.timer.play(30, 15, function () {
        if (t.value > 0) t.value--;
    }, function () {
        t.value = 0;
    }, false, "出牌倒计时");
    afterchupai();

    function afterchupai() {
        Game.hideBtn();
        API.hideUI("出牌line");
        API.hideUI(["出牌动画1", "出牌动画2", "出牌动画3", "出牌动画4", "特效容器1", "特效容器2", "特效容器3", "特效容器4", "听牌界面"]);
        API.showUI("出牌动画" + res.p, "中间层", 5);
        var o = API.getUI("出牌动画面" + res.p);
        o.value = res["出的牌"];
        API.hideUI("摸牌" + res.p)
        API.timer.play(20, 2, null, function () {
            API.hideUI("出牌动画" + res.p);
        });

        API.runActionGroup("加载牌", res.p);
        API.showUI("出牌屏蔽", "中间层");
        API.update("出牌组" + res.p);
        // API.getUI("手牌组"+res.p).flex();
        // API.getUI("麻将容器"+res.p).flex();
        Game.updateSign();
        res.s = res["playerInfo" + res.p].sex;
        API.playSound("s" + res.s + res["出的牌"], 0, 1);
    }
}
Game.mopai = function (d) {

    var res = API.data; //1009
    // var o = API.getChildren("手牌组1");
    // API.style["摸牌1"].left = API.getLocal(o[o.length - 1]).x + 85;
    res["摸的牌"] = d.readInt();
    // $("摸牌面").value = res["摸的牌"];
    $("麻将容器1").resetStyle();
    $("麻将容器1").add("摸牌1");

    // update("麻将容器1");
    if (res['余牌数']) res['余牌数'] = res['余牌数'] - 1;
    API.update("余牌");
    API.hideUI(["听牌提示", "漏胡容器"]);
}
Game.currChupai = function (d) {
    var res = API.data; //1015
    res["当前出牌者ID"] = d.readLong();
    if (res['余牌数']) res['余牌数'] = res['余牌数'] - 1;
    API.update("余牌");
    API.showUI("出牌屏蔽", "中间层");
    API.hideUI("出牌line");
    API.timer.play(30, 1, null, function () {
        Game.rotateCP();
    });
}
Game.tingpai = function (d) { //1005
    var res = API.data;
    var num = d.readShort(); //听牌数量
    res["听牌列表"] = [];
    for (var n = 0; n < num; n++) {
        res["听牌列表"].push({
            id: d.readInt()
        });
    }
    if (!res.startPlay) return;
    if (res["听牌列表"].length < 1) {
        hide("听牌提示");
        return;
    }
    API.showUI("听牌提示", "中间层");
    $("听牌提示").width += 10;
    $("听牌组").flex();

}
Game.updateTingPai = function (d) {
    var res = API.data; //1092
    var num = d.readShort();
    res.ting = true;
    for (var i = 0; i < num; i++) {
        var o = [];
        var sendCard = d.readInt(); //--手牌牌值
        var len = d.readShort();
        for (var j = 0; j < len; j++) {
            var obj = {
                id: d.readInt(),
                num: d.readByte()
            };
            o.push(obj);
        }
        for (var k = 0; k < res["手牌组1"].length; k++) {
            if (res["手牌组1"][k].id == sendCard) {
                res.ting = false;
                res["手牌组1"][k].ting = "ting_mark";
                res["手牌组1"][k].tingpaiList = o;
            }
        }
        if (sendCard == res["摸的牌"]) {
            res["摸的牌听"] = "ting_mark";
            res["摸的牌听列表"] = o;
            update("摸牌1");
        }


    }
    API.update("手牌组1");
}
Game.xuanpiao = function () {

    if (API.data["选飘状态1"] == "已选飘") return;
    if (!API.data.playerInfo1 || API.data.playerInfo1.piao == -1)
        API.timer.play(10, 1, null, function () {
            API.showUI("选飘界面", "中间层", 5);
        });
}
Game.updateSign = function (b = true) {
    var res = API.data;
    if (!res["出牌组" + res.p]) return;
    var o = API.getUI("出牌" + res.p + "[" + (res["出牌组" + res.p].length - 1) + "]");
    if (o && b) {
        var p = API.getLocal(o);
        var c = API.getUI("出牌提示");
        c.x = p.x;
        c.y = p.y;
        if (res.p == 3 || res.p == 1) {
            c.y -= 20;
        } else if (res.p == 2 || res.p == 4) {
            c.x -= 40;
            c.y -= 30;
        }
    }
}
Game.peng = function (d) {//1020
    var res = API.data,
        pID = d.readLong(),
        cID = d.readLong();
    res["出的牌"] = d.readInt();
    res.p = getPosById(pID);
    res.cp = getPosById(cID);
    console.log(pID, cID, res.p, res.cp);
    var pl = res["player" + res.p];
    var v = res.p == 1 ? res["出的牌"] : 1;
    var m = 0;
    for (var n = pl.length - 1; n >= 0; n--) {
        if (m < 2 && pl[n].type == 6 && pl[n].id == v) {
            m++;
            pl.splice(n, 1);
        }
    }
    var o = {
        type: 1,
        id: res["出的牌"],
        num: 3
    };
    pl.push(o);
    res["吃碰杠列表" + res.p].push(o);
    res["player" + res.cp].pop();
    checkPai(res.p);
    API.getUI("出牌提示").x = -80;
    API.hideUI(["出牌动画1", "出牌动画2", "出牌动画3", "出牌动画4"]);
    soundfn("peng");
//	API.runActionGroup("加载牌",res.p);
//	API.runActionGroup("加载牌",res.cp);
//	var v  = [res.p,"txt_peng"] ;
//	API.runActionGroup("播放特效",v,d = "action", delim = ",");
//	res.s = res["playerInfo"+res.p].sex;
//	API.playSound("s"+res.s+"peng");

}

Game.gang = function (d) {
    var res = API.data,
        pID = d.readLong(),
        cID = d.readLong();
    res["出的牌"] = d.readInt();
    res.p = getPosById(pID);
    res.cp = getPosById(cID); //出牌者
    var pl = res["player" + res.p];
    var v = res.p == 1 ? res["出的牌"] : 1;
    var m = 0;
    var isPengGang = false;
    if (res.p > 1) m++;
    for (var n = pl.length - 1; n >= 0; n--) {
        if (pl[n].type == 1 && pl[n].id == res["出的牌"]) { //
            isPengGang = true;
            pl[n] = {
                id: res["出的牌"],
                type: 2,
                num: 4
            }
        }
        if (res.p == 1 && pl[n].type == 6 && pl[n].id == v) {
            pl.splice(n, 1);
        } else if (m < 4 && pl[n].type == 6 && pl[n].id == v) {
            m++;
            pl.splice(n, 1);

        }
    }
    var curr = res["吃碰杠列表" + res.p];
    for (var j = 0; j < curr.length; j++) {
        if (curr[j].type == 1 && curr[j].id == res["出的牌"]) { //
            isPengGang = true;
            curr[j] = {
                id: res["出的牌"],
                type: 2,
                num: 4
            }
        }
        if (res.p == 1 && curr[j].type == 6 && curr[j].id == v) {
            curr.splice(j, 1);
        } else if (m < 4 && curr[j].type == 6 && curr[j].id == v) {
            m++;
            curr.splice(j, 1);
        }
    }

    if (!isPengGang) {
        pl.push({
            type: 2,
            id: res["出的牌"],
            num: 4
        });
        res["吃碰杠列表" + res.p].push({
            type: 2,
            id: res["出的牌"],
            num: 4
        });
        res["player" + res.cp].pop();
    }
    checkPai(res.p);
    API.getUI("出牌提示").x = -80;
    if (isPengGang && res["摸的牌"]) {
        API.hideUI("摸牌1");
        delete res["摸的牌"];
    }
    API.hideUI(["出牌动画1", "出牌动画2", "出牌动画3", "出牌动画4", "听牌提示"]);
    soundfn("gang");
}

function getshouNum(i) {
    var pl = API.data["player" + i],
        c = 0;
    for (var n = 0; n < pl.length; n++) {
        if (pl[n].type == 6) {
            c++;
        }
    }
    return c
}

function checkPai(i) {
    if (i == 1) return;
    // var pl =  API.data["player" + i],
    // 	c = 0;
    // for(var n = 0; n < pl.length; n++) {
    // 	if(pl[n].type == 6) {
    // 		c++;
    // 	} else if(pl[n].type == 2 || pl[n].type == 1 || pl[n].type == 3 || pl[n].type == 5) {
    // 		console.log(pl[n], n)
    // 		c += 3;
    // 	}
    // }
    // //console.log("=出牌===============",i,c,"================");console.log(pl)
    // if(c < 13) {
    // 	for(n = 0; n < 13 - c; n++) {
    // 		pl.unshift({
    // 			type: 6,
    // 			id: 1,
    // 			num: 1
    // 		});
    // 	}
    // } else if(c > 13) {
    // 	c = c - 13;
    // 	for(n = pl.length - 1; n >= 0; n--) {
    // 		if(c > 0 && pl[n].type == 6 && pl[n].id == 1) {
    // 			c--;
    // 			pl.splice(n, 1);
    // 		}
    // 	}
    //
    // }
    Game.updateShowPai(i);


}

Game.angang = function (d) {
    var res = API.data;
    var uID = d.readLong();
    res["暗杠牌"] = d.readInt();
    res.p = getPosById(uID);
    var pl = res["player" + res.p];
    var v = res.p == 1 ? res["暗杠牌"] : 1;
    var m = 0;
    if (res.p > 1) m++;
    for (var n = pl.length - 1; n >= 0; n--) {
        if (m < 4 && pl[n].type == 6 && pl[n].id == v) {
            m++;
            pl.splice(n, 1);

        }
    }
    pl.push({
        type: 5,
        id: res["暗杠牌"],
        num: 4
    });
    res["吃碰杠列表" + res.p].push({
        type: 5,
        id: res["暗杠牌"],
        num: 4
    });

    if (res["摸的牌"] == res["暗杠牌"]) {
        API.hideUI("摸牌1");
        delete res["摸的牌"];
    }
    if (res["摸的牌"]) {
        pl.push({
            type: 6,
            id: res["摸的牌"],
            num: 1
        });
        API.hideUI("摸牌1");
    }
    delete res["暗杠牌"];
    checkPai(res.p);
    API.getUI("出牌提示").x = -80;
    API.hideUI(["出牌动画1", "出牌动画2", "出牌动画3", "出牌动画4", "听牌提示"]);
    soundfn("gang");
}

function soundfn(f) {
    var res = API.data;
    API.runActionGroup("加载牌", res.p);
    API.runActionGroup("加载牌", res.cp);
    API.getUI("麻将容器" + res.p).flex();
    API.getUI("麻将容器" + res.cp).flex();
    var v = [res.p, "txt_" + f];
    API.runActionGroup("播放特效", v, d = "action", delim = ",");
    res.s = res["playerInfo" + res.p].sex;
    API.playSound("s" + res.s + f);
}


Game.showHuPaiBtn = function (d) {
    API.data["胡的牌"] = true;
    Game.showBtn();
}

Game.showPengBtn = function (d) {
    var res = API.data;
    res["出碰者ID"] = d.readLong();
    res["出碰序号"] = d.readByte();
    res["碰的牌"] = d.readInt();
    Game.showBtn();
}
Game.showGangBtn = function (d) {
    var res = API.data;
    res["出杠者ID"] = d.readLong();
    res["出杠序号"] = d.readByte();
    res["杠的牌"] = d.readInt();
    console.log("-----杠的牌");
    Game.showBtn();
}
Game.showAnGangBtn = function (d) {
    var res = API.data,
        l = d.readShort();
    res["暗杠牌"] = [];
    for (var n = 0; n < l; n++) {
        res["暗杠牌"].push(d.readInt());
    }
    if (l == 0) {
        var a = 0,
            c = 0;
        for (n = 0; n < res.player1.length; n++) {
            if (res.player1[n].type == 6) {
                if (a != res.player1[n].id) {
                    a = res.player1[n].id;
                    c = 0;
                } else {
                    c += res.player1[n].num;
                    if (c == 3) res["暗杠牌"].push(res.player1[n].id);
                }
            }
        }
    }
    if (l > 0) {
        Game.showBtn();
    }

}

Game.showBtn = function () {
    if (!API.getUI("游戏桌面2")) return;
    var d = API.data;
    d["按钮列表"] = [];
    var dl = d["按钮列表"];
    if (d["杠的牌"]) {
        dl.push({
            action: "杠",
            img: "gang",
            id: d["杠的牌"]
        });
        var pl = d.player1,
            isPengGang = false;
        for (var n = pl.length - 1; n >= 0; n--) {
            if (pl[n].type == 1 && pl[n].id == d["杠的牌"]) isPengGang = true;
        }
        if (!isPengGang) {
            d["碰的牌"] = d["杠的牌"];
            d["出碰者ID"] = d["出杠者ID"];
        }

    }
    if (d["暗杠牌"]) {
        for (var n = 0; n < d["暗杠牌"].length; n++) {
            dl.push({
                action: "暗杠",
                img: "gang",
                id: d["暗杠牌"][n]
            });
        }
    }
    if (d["碰的牌"]) {
        dl.push({
            action: "碰",
            img: "peng",
            id: d["碰的牌"]
        });
    }
    if (d["胡的牌"]) {
        dl.push({
            action: "胡",
            img: "hu"
        });
    }

    if (dl.length > 0) {
        dl.unshift({
            action: "过",
            img: "guo"
        });
    }

    //API.showUI("吃碰杠胡按钮","中间层");
    var o = API.getUI("吃碰杠胡按钮");
    if (o) {
        API.update("吃碰杠胡按钮");
        console.log("======吃碰杠胡按钮======")
        return;
    }
    API.showUI("吃碰杠胡按钮", "中间层");
}
Game.hideBtn = function () {
    var d = API.data;
    API.hideUI("吃碰杠胡按钮");
    delete d["胡的牌"];
    delete d["碰的牌"];
    delete d["杠的牌"];
    delete d["暗杠牌"];
    d["按钮列表"] = [];
}
Game.louHu = function (d) {
    var res = API.data;
    var isLouHu = d.readByte();
    var l = d.readShort();
    var a = [];
    for (var n = 0; n < l; n++) {
        a[n] = {
            id: d.readInt()
        };
    }
    a.sort(function (v1, v2) {
        return v1.id < v2.id ? 1 : -1;
    });
    res["漏胡列表"] = a;
    API.update("漏胡列表");
    API.showUI("漏胡容器", "中间层");
}

Game.updateDismiss = function (d) {
    var res = API.data; //1027
    res["同意否"] = d.readBoolean();
    res["退出玩家ID"] = d.readLong();
    var d = res["申请退出列表"];
    if (!d) return;
    for (var i = 0; i < d.length; i++) {
        if (d[i]["玩家ID"] == res["退出玩家ID"]) d[i]["同意否"] = d[i]["同意否"] ? "已同意" : "未表态";
    }
    if (API.getUI("退出列表")) API.update("退出列表");

}

Game.reset = function () {
    var res = API.data;
    res.iamReady = true;
    res.startPlay = null;
    API.hideUI(["小结算界面", "小结算新版", "中码界面", "漏胡容器", "听牌提示", "摸牌1", "摸牌2", "摸牌3", "摸牌4", "特效容器1", "特效容器2", "特效容器3", "特效容器4", "出牌line", "出牌屏蔽", "屏蔽遮罩"]);
    if (res["currPass"] == res["gamecnt"]) {
        API.showUI("大结算界面", "最高层");
        return;
    }
    for (var n = 1; n < 5; n++) {
        var d = res["playerInfo" + n];
        if (!d) continue;
        res["player" + n] = [];
        if (!d) continue;
        d.piao = -1;
        d["选飘状态"] = "";
        d["选飘状态" + n] = "";
        d.isLine = true;
    }
    if (res.playerNum == 3) {
        delete res.player3;
        delete res.playerInfo3;
    }
    delete res["流局"];
    delete res["发牌动画"];
    delete res["胡玩家"];
    delete res["胡的牌"];
    delete res["出的牌"];
    delete res["摸的牌"];
    delete res["胡牌否"];
    delete res["胡牌类型1"];
    delete res["胡牌类型2"];
    delete res["胡牌类型3"];
    delete res["胡牌类型4"];
    delete res["胡牌图标1"];
    delete res["胡牌图标2"];
    delete res["胡牌图标3"];
    delete res["胡牌图标4"];
    delete res["结算杠类型1"];
    delete res["结算杠类型2"];
    delete res["结算杠类型3"];
    delete res["结算杠类型4"];
    API.hideUI(["大结算界面", "游戏桌面2", "游戏桌面1", "摸牌组", "发牌动画", "玩家头像左", "玩家头像右", "特效胡", "特效位图胡"]);
    if (res["currPass"] == res["gamecnt"]) {
        API.runActionGroup("显示", "大结算界面");
    } else {
        res.currPass++;
        res.iamReady = true;

        API.showUI(["玩家头像左", "玩家头像右"], "底层");
        API.update("左上信息");
        Game.send(1007);
        if(res.playerNum==2){
            API.hideUI(["左头像容器2","右头像容器4"]);
            //  API.showUI("游戏桌面", "底层");
        }else if(res.playerNum==3){
            API.hideUI("右头像容器3");
        }
    }

}
Game.fixSmallSettlement = function (o, s) {//小结算界面重排
    var a = [],
        h = 0;
    for (var n = 0; n < o.length; n++) {
        if (o[n].visible) {
            a.push(o[n]);
            h += o[n].style.height;
        }
    }
    if (a.length > 1) {
        a = a.sort(function (o1, o2, options) {
            if (!o2.style) {
                return true;
            }
            if (!o1.style) {
                return false;
            }
            return o2.style.zIndex - o1.style.zIndex;
        });
    }
    h = (s.height - h) / (a.length + 1);
    for (n = 0; n < a.length; n++) {
        var i = a[n];
        if (n > 0) {
            i.y = a[n - 1].style.height + a[n - 1].y + h;
        } else {
            i.y = h > 0 ? h : 0;
        }
        i.x = s.lineWidth;
    }
}
Game.fixBigSettlement = function (o, s) {//大结算界面重排
    var a = [],
        w = 0,
        lh = s.lineHeight;
    for (var n = 0; n < o.length; n++) {
        if (o[n].visible) {
            a.push(o[n]);
            w += o[n].style.width;
        }
    }
    w = (s.width - w) / (a.length + 1);
    for (n = 0; n < a.length; n++) {
        var i = a[n];
        if (n == 0) {
            i.x = w;
            i.y = lh > 0 ? lh : 0;
            continue;
        }
        i.x = a[n - 1].style.width + a[n - 1].x + w;
        i.y = lh;
    }
}
Game.listMajiang1 = function (o, s) {//玩家1手牌重排
    if (!o[0]) return;
    var lw = s.lineWidth,
        lh = s.lineHeight,
        len = o.length,
        w = s.width,
        h = s.height,
        my = 0;
    for (n = 0; n < len; n++) {
        i = o[n];
        if (n == 0) {
            i.x = lw > 0 ? lw : 0;
            i.y = lh > 0 ? lh : 0;
            continue;
        }
        i.x = o[n - 1].style.width + o[n - 1].x + lw;
        let _my = o[n - 1].y + o[n - 1].style.height + lh;
        if (_my > my) my = _my;
        if (i.x + i.style.width > s.width) {
            i.x = lw > 0 ? lw : 0;
            if (n == 12) {
                my = -13;
            }
            i.y = my;
        } else {
            i.y = o[n - 1].y;
        }
    }

}
Game.listMajiang2 = function (o, s) {//玩家2手牌重排
    if (!o[0]) return;
    var lw = s.lineWidth,
        lh = s.lineHeight,
        len = o.length,
        w = s.width,
        h = s.height,
        my = 0;
    for (n = 0; n < len; n++) {
        i = o[n];
        if (n == 0) {
            i.x = lw > 0 ? lw : 0;
            i.y = lh > 0 ? lh : 0;
            continue;
        }
        i.x = o[n - 1].style.width + o[n - 1].x + lw;
        let _my = o[n - 1].y + o[n - 1].style.height + lh;
        if (_my > my) my = _my;
        if (i.x + i.style.width > s.width) {
            i.x = lw > 0 ? lw : 0;
            if (n == 12) {
                my = 0;
                i.x = -13;
            } else if (n == 18) {
                my = o[6].y;
                i.x = -13;

            }
            i.y = my;
        } else {
            i.y = o[n - 1].y;
        }
    }

}
Game.listMajiang3 = function (o, s) {//玩家3手牌重排
    var lw = s.lineWidth,
        lh = s.lineHeight,
        len = o.length,
        w = s.width,
        h = s.height,
        my = 9999;
    for (var n = 0; n < len; n++) {
        var i = o[n];
        if (n == 0) {
            i.x = w - lw - i.style.width;
            i.y = h - i.style.height - lh;
            continue;
        }
        i.x = o[n - 1].x - i.style.width - lw;
        var _my = o[n - 1].y - i.style.height - lh;
        if (_my < my) my = _my;
        i.parent.setChildIndex(i, n >= 12 ? 12 : 0);
        if (i.x < 0) {
            i.x = w - lw - i.style.width;
            if (n >= 12) my = o[0].y - 13;
            i.y = my;
        } else {
            i.y = o[n - 1].y;
        }
    }
}
Game.listMajiang4 = function (o, s) {//玩家4手牌重排
    var lw = s.lineWidth,
        lh = s.lineHeight,
        len = o.length,
        w = s.width,
        h = s.height,
        my = 9999;
    for (var n = 0; n < len; n++) {
        var i = o[n];
        if (n == 0) {
            i.x = w - lw - i.style.width;
            i.y = h - i.style.height - lh;
            continue;
        }
        i.x = o[n - 1].x - i.style.width - lw;
        var _my = o[n - 1].y - i.style.height - lh;
        if (_my < my) my = _my;
        i.parent.setChildIndex(i, n >= 12 ? 12 : 0);
        if (i.x < 0) {
            i.x = w - lw - i.style.width;
            if (n == 12) {
                my = o[0].y;
                i.x -= 13;
            } else if (n == 18) {
                my = o[6].y;
                i.x -= 13;
            }
            i.y = my;
        } else {

            i.y = o[n - 1].y;
        }

    }
}

Game.updateShowPai = function (i) {
    API.data["手牌组" + i] = [];
    var pl = API.data["player" + i];
    console.log("pl======", pl);
    if (pl.length > 13) pl.length = 13;
    for (var n = 0; n < pl.length; n++) {
        if (pl[n].type == 6) {
            API.data["手牌组" + i].push(pl[n]);
        }
    }
}

Game.getOut = function () {
    var res = API.data;
    var g = res["玩法设置"];
    g = eval('(' + g + ')');
    if (res.startPlay || res.currPass > 1) { //已开局或非第一局开始
        res["提示内容"] = "确认解散房间？";
        res["当前界面"] = "申请退出确认";
        API.runActionGroup("显示", "申请退出确认");

    } else if (res.roomCreateID != res.userID) { //没有开局

        API.runActionGroup("错误提示", "退出成功");
        Game.send(1029);
        return;
    } else {
        if (res.inClub) { //俱乐部解散房间
            res["提示内容"] = "确认解散房间？";
            res["当前界面"] = "俱乐部申请退出";
            API.hideUI("设置界面");
            API.runActionGroup("显示", "俱乐部申请退出");
            return;
        }
        if (g.IS_DELEGATE && !res.inClub) { //代开房解散房间
            res["提示内容"] = "确认解散房间？";
            res["当前界面"] = "代开房申请退出";
            API.runActionGroup("显示", "代开房申请退出");
            return;
        }
        res["提示内容"] = "确认解散房间？";
        res["当前界面"] = "申请退出确认";
        API.runActionGroup("显示", "申请退出确认");
    }

    API.hideUI("设置界面");


}
//
Game.clubMembers = function (d) {
    var res = API.data;
    res.maxPage = d.readByte();
    res.curPage = d.readByte();
    res.maxNumb = d.readByte();
    res.count = d.readByte();
    res.clubMembersList = [];
    for (var i = 0; i < res.count; i++) {
        var obj = {};
        obj.userID = d.readLong();
        obj.accountID = d.readInt();
        obj.name = d.readString();
        obj.icon = d.readString();
        obj.xuanzhong = "";
        res.clubMembersList[i] = obj;

    }
    API.data.numb = 0;
    API.runActionGroup("显示", "邀请俱乐部成员");

}

Game.yiyaoqing = function () {
    var res = API.data;
    for (var i = 0; i < res.count; i++) {
        var o = new RegExp(res.clubMembersList[i].userID);
        if (res.members) {
            var aa = o.test(res.members);
            if (o.test(res.members)) {
                res.clubMembersList[i].xuanzhong = "yiyaoqing";
//				API.getUI("选中状态[" + i + "]").value = "yiyaoqing";
            }
        }

    }
    API.update("邀请成员列表", "邀请俱乐部成员");

}

function appendMembers(i, member) {
    var res = API.data;
//	var flag = API.getUI("选中状态[" + i + "]").value;
    var flag = res.clubMembersList[i].xuanzhong;
    console.log(flag);
    if (res.clubMembersList[i].xuanzhong == "yiyaoqing") {
        API.runActionGroup("错误提示", "3分钟内不能重复邀请");
        return;
    }

//	if(API.getUI("选中状态[" + i + "]").value == "yiyaoqing") return;

    if (!flag) {
        res.clubMembersList[i].xuanzhong = "xuanzhong";
//		API.getUI("选中状态[" + i + "]").value = "xuanzhong";
        API.data.numb++;
    } else {
        res.clubMembersList[i].xuanzhong = "";
//		API.getUI("选中状态[" + i + "]").value = "";
        API.data.numb--;
    }
    API.update("邀请成员列表", "已选中人数");

}

Game.yaoQingMember = function () { //确
    var res = API.data;
    API.data.members = "";
    for (var i = 0; i < API.data.count; i++) {
        if (res.clubMembersList[i].xuanzhong != "") {
            if (API.data.members == "") {
                API.data.members = API.data.clubMembersList[i].userID;
            } else {
                API.data.members = API.data.members + ',' + API.data.clubMembersList[i].userID;
            }
            res.clubMembersList[i].xuanzhong = "yiyaoqing";
        }
    }
    if (API.data.numb < 1) {
        API.runActionGroup("错误提示", "请选择成员");
        return;
    }
    API.timer.play(30, 180, null, function () {
        API.data.members = "";
    });
    API.update(...["邀请成员列表", "邀请俱乐部成员"]);
    API.runActionGroup("关闭");
    API.runActionGroup("错误提示", "已发送邀请");
    Game.send(1091);
}


function countdown(v) {

}


Game.getRules = function () {
    var d = API.data["玩法设置"];
    d = JSON.parse(d);
    API.data.serverModel = d.SERVER_MODEL;

    if (d.SERVER_MODEL == "zzmj") {
        var kouka = ['普通扣卡', '普通扣卡', 'AA扣卡', '大赢家扣卡'];
        var zhuama = ['', '一码全中', '扎2个码', '', '扎4个码', '', '扎6个码'];
        var hufa = ['自摸胡', '点炮胡'];
        var x = {
            '扣卡': kouka[d.DE_WAY],
            '局数': d.ROUND + '局',
            '人数': d.PLAYER_COUNT + '人',
            '规则': hufa[d.huType],
            '抓码': zhuama[d.ZA],
            '见炮踩': d.jianPaoCai ? '见炮踩' : '',
            '可带飘': d.piao > 0 ? '可带飘' : '',
            '庄闲': d.bankerPlayerScore > 0 ? '庄闲(算分)' : '',
            '七对': d.hu7pair ? '可胡七对' : '不可胡七对',
            '跟庄中码': d.genZhuangZhongMa ? '跟庄中码' : '',
            '不中算全中，全中翻倍': d.hit6zaDouble ? '不中算全中，全中翻倍' : '',
            '抢杠胡包三家': d.grabGangHUBao3Jia ? '抢杠胡包三家' : '',
        }
        API.data["玩法详情1"] = x["人数"] + "  " + x["扣卡"] + "  " + x["抢杠胡包三家"] + "  " + x["规则"] + "  " + x["见炮踩"];
        API.data["玩法详情2"] = x["可带飘"] + "  " + x["庄闲"] + "  " + x["七对"] + "  " + x["抓码"] + "  " + x["跟庄中码"] + "  " + x["不中算全中，全中翻倍"];
        API.data["玩法名称"] = API.data["玩法"][0];
        API.update("游戏桌面");
    } else if (d.SERVER_MODEL == "hz") {//红中
        var hufa = ['只能自摸', '可点炮'];
        var fenshu = ['', '一码1分', '一码2分'];
        var zhuama = ['', '一码全中', '扎2个码', '扎3个码', '扎4个码', '', '扎6个码', "", "扎8个码"];
        var x = {
            '扣卡': d.IS_AAKF ? "AA开房" : '',
            '局数': d.ROUND + '局',
            '人数': d.PLAYER_COUNT + '人',
            '规则': hufa[d.IS_ZHUA_HU],
            '抓码': zhuama[d.ZA],
            '码分': fenshu[d.YMNF],
            '七对': d.PLAY_7D ? '可胡七对' : '不可胡七对',
            '不中算全中，全中翻倍': d.hit6zaDouble ? '不中算全中，全中翻倍' : '',
            '抢杠胡': d.QG_HU ? '可抢杠胡' : '不可抢杠胡',
            '抢杠胡包三家': d.grabGangHUBao3Jia ? "抢杠胡包三家" : '',
            '8个红中': d.PLAY_EIGHT ? "8个红中" : ''

        }
        API.data.playerNum = d.PLAYER_COUNT;
        console.log("全中翻倍=======" + d.YMNF, x["码分"]);
        API.data["玩法详情2"] = x["扣卡"] + "  " + x["人数"] + "  " + x["规则"] + "  " + x["抢杠胡"] + "  " + x["七对"] + "  " + x["抓码"];
        API.data["玩法详情1"] = x["码分"] + "  " + x["不中算全中，全中翻倍"] + "  没红中胡牌加1码" + " " + x["抢杠胡包三家"] +" "+x["8个红中"];
        API.data["玩法名称"] = API.data["玩法"][1];
        API.update("游戏桌面");
    }

//console.log("扣卡方式" + d.DE_WAY);
    if (d.DE_WAY == 2) {
        var aa = d.ROUND == 8 ? "1" : "2";
        API.data["玩法详情3"] = x["局数"] + "(每人" + aa + "张)";
    } else if (d.DE_WAY == 3) {
//		+ "(" + aa + "张房卡)"
        API.data["玩法详情3"] = x["局数"];
    } else {
        var aa = d.ROUND == 8 ? "2" : "4";
        API.data["玩法详情3"] = x["局数"] + "(" + aa + "张房卡)";
    }
    if (API.data.inClub) {
        var aa = d.ROUND == 8 ? "1" : "2";
        API.data["玩法详情3"] = d.DE_WAY == 3 ? x["局数"] : x["局数"] + "(" + aa + "张房卡)";
    }

    API.data.clubID = d.clubId;
    console.log(API.data["玩法详情3"]);
    console.log("----------------------", d, API.data["玩法详情1"])
}

function closeUI() {
    API.timer.reset();
    removeDiv("AppendText");
    API.hideUI(["小结算界面", "游戏桌面", "游戏桌面2", "游戏桌面1", "玩家头像左", "玩家头像右", "大结算界面", "屏蔽遮罩", "最高层", "底层", "中间层","俱乐部申请退出"]);
}


function shareFriends() {
    var res = API.data;
    var title = "房间号【" + res.roomID + "】" + res.numPlayers + "缺" + res.playerNum;
    var desc = getRuleText(res.roomType);
    console.log(desc);
    winxin(title, desc);
}


function shareZhanji() {

    var data = API.data;
    var roomNo = data.roomID;
    var time = data["日期"];
    var ownerName = data.roomCreateName;
    var gameName = data["玩法名称"].name;
    var roundTotal = data.gamecnt;
    var roundLast = data.currPass;
    var desc = "房间号:" + roomNo + " \n" + "结束时间:" + time + " \n" + "房主:" + ownerName + " \n" + gameName + " \n" + "局数" + roundLast + "/" + roundTotal + "\n";
    var players = data.numPlayers;
    for (var i = 0; i < players.length; i++) {
        var player = data["分享战绩"][i];
        desc += player.name + " ID:" + player.accountId + " " + player.score + " \n";
    }
    console.log(desc);
    winxin(title, desc);
}

Game.applyThreeRoom = function (d) {
    var res = API.data;
    var o = {};
    var status = d.readInt();
    if (status == 1) {
        hide("申请3人游戏");
        return;
    }
    res["请求人"] = o.reqMan = d.readLong();
    o.reqTime = d.readLong();
    o.delayTime = d.readInt();
    res["申请倒计时"] = o.remainTime = d.readInt();
    var num = d.readShort();
    var playerList = [];
    res.agree = false;
    for (var i = 0; i < num; i++) {
        d.readShort();
        var p = {};
        p.playerID = d.readLong();
        p.name = d.readString();
        var status = d.readLong();
        if (status == 2) {
            hide("申请3人游戏");
            API.runActionGroup("弹窗提示", p.name + "玩家不同意开始游戏");
            return;
        }
        if (p.playerID == res.userID && status == 1) {
            res.agree = true;
        }
        p.status = status == 1 ? "同意" : "未表态";
        playerList[i] = p;
    }
    show("申请3人游戏", "最高层");
    $("申请列表").value = playerList;
    var t = API.getUI("申请倒计时");
    t.value = o.remainTime + "秒";
    API.timer.play(30, 15, function () {
        if (o.remainTime > 0) {
            o.remainTime--;
            t.value = o.remainTime + "秒";
        }
    }, function () {
        t.value = 0 + "秒";
        hide("申请3人游戏");
    }, false, "出牌倒计时");

}

