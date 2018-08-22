var api = Can.api,

    $ = (name) => api.getUI(name), //获取显示对象

    show = (name, parent) => api.showUI(name, parent), //显示组件 show(组件id,父组件id)

    hide = (name) => api.hideUI(name), //关闭组件 hide(组件id)

    update = (name) => api.update(name),

    create = (id, templateId, parent = null, style = null) => api.createUI(id, -1, templateId, parent, style);

// 大厅处理函数

function pdkInit() {

    API.data.startPlay = null;
    API.data.player1 = [];
    WS.socket.send(WS.writeMessage(2000));
    WS.socket.send(WS.writeMessage(1001));
    API.data.time = new Date().format("hh:mm:ss");
}

var pdkTimer = setInterval("getCurDate()", 1000);

function getCurDate() {
    API.data.time = new Date().format("hh:mm");
    API.update("时间", "时间coa");//这里注意一下要写上API.不然你update这样子是不行哈2018.8.3
};
Game.enterRoomPdk = function (d) {
    API.hideUI(["掉线提示", "屏蔽遮罩"]);
    //	WS.socket.send(WS.writeMessage(2000));
    var res = API.data; //1001
    res.roomID = d.readInt(); //房间ID
    res.gamecnt = d.readByte(); //总局数{$currPass}/{$gamecnt}
    res.roomRule = d.readString(); //开局类型
    res.currPass = d.readByte() + 1; //+ 1  已经打过的局数
    res.lastSenderId = d.readLong(); //最后谁出牌
    res.playCardId = d.readLong(); //出牌人ID
    res.remainTime = d.readInt(); //剩余时间
    res.isFirstDiscard = d.readBoolean(); //是否全局第一次出牌
    pdkmanager.isFirstDiscard = res.isFirstDiscard;
    console.log("全局第一次出牌:", res.isFirstDiscard, "出牌人ID:", res.playCardId);
    res.askMaxDict = {}; // 报大报单的表 {userId, isAskMax} 下家最后一张，上家需要出对子或最大的（自主打牌时，强制出对子）
    res.player = {};
    var pinfo = [],
        cards = [];
    var num = res.numPlayers = d.readShort();
    for (var i = 0; i < num; i++) {
        var o = {};
        d.readShort();
        o.userID = d.readLong(); //玩家ID
        o.isBanker = d.readBoolean(); //         //是否房主
        o.name = d.readString(); //玩家昵称
        o.enterIndex = d.readByte(); //进入房间的序号
        o.ico = d.readString(); //头像
        o.sex = d.readByte(); //性别
        o.score = d.readShort(); //分数
        o.isReady = d.readBoolean(); // 是否已经准备
        o.ipAddr = d.readString(); //玩家IP地址
        o.isOnline = d.readBoolean(); //         //是否在线
        o.accountId = d.readInt(); //
        o.isAskMax = d.readBoolean(); //
        res.askMaxDict[o.userID] = o.isAskMax; // 填充最大报单的表

        var play_num = o.play_num = d.readShort();
        cards = [];
        var outCardNum = 0;
        for (var j = 0; j < play_num; j++) {
            var item = d.readInt(); // 牌值10000+手上的牌，20000+当前正在打出去的牌，30000+剩余的手牌
            if (item * 1 > 30000) {
                o.handCardNum = item * 1 - 30000; // 30000+ 剩余的牌
            } else {
                var obj = String(item);
                var cnum = parseInt(obj.substring(2, item.length));
                var hasPlayed = false; // 已经打出
                if (item * 1 > 20000) { // 20000+ 打出的牌
                    outCardNum = outCardNum + 1;
                    hasPlayed = true;
                }
                cards.push({
                    id: item,
                    num: cnum, // 带花式的值
                    value: cnum % 100, // 去掉花式的牌面值
                    type: parseInt(cnum / 100), // 花式
                    hasPlayed: hasPlayed // 已经打出的牌
                });


            }
        }
        if (o.handCardNum) {
            console.log("hand cardNum:", o.handCardNum, "out num:", outCardNum);
            o.outCardNum = outCardNum;
            o.handCardNum = o.handCardNum + outCardNum;
        }
        o.cards = cards;
        if (o.userID == res.userID) res.enterIndex = o.enterIndex;
        pinfo.push(o);

    }
    res.roomCreateID = d.readLong(); //房主id
    res.roomCreateName = d.readString(); //房主name
    res.roomCreateImgUrl = d.readString(); //房主头像url
    res.roomCreateAccountId = d.readInt(); //房主accountId;

    var canDaiKai = d.readBoolean();
    res.canDaiKai = canDaiKai;
    res.isPreventCard = d.readBoolean();
    res.isDismissRoom = d.readBoolean();
    res.isStarted = null;
    res.startPlay = null;
    // 重置玩家数据
    resetPlayerData();
    for (i = 0; i < num; i++) {
        let ii = res.enterIndex - 1;
        var p = pinfo[i].enterIndex - ii;
        console.log("aaa:" + p);
        if (p < 1) p += res.playerNum;
        if (res.playerNum == 3 && p == 3) p = 4;
        if (res.playerNum == 2 && p == 2) p = 3;
        if (p == 4) p = 2;
        else if (p == 2) p = 4;
        if (res.playerNum == 2 && p == 4) p = 3;
        res["playerInfo" + p] = pinfo[i];
        res["player" + p] = pinfo[i].cards;
        console.log("num player p:", p);
        update("头像容器" + p);
    }

    if (res["player1"] && res["player1"].length > 3) {
        res.startPlay = true;
        for (i = 1; i < 5; i++) {
            var p = res["player" + i],
                pp = [];
            if (!p) continue;
            for (var n = 0; n < p.length; n++) {
                pp.push(p[n]);
                res.isStarted = true;
            }
            res["player" + i] = pp;
        }
    }

    //
    // for (var p = 1; p <= 4; p++) {
    //     console.log("player" + p + ":", JSON.stringify(API.data["player" + p]));
    // }

    API.showUI("游戏桌面", "底层");
    if (res.inClub) API.showUI("桌面底按钮2", "底层");
    else if (!pdkmanager.isGameRunning) {
        API.showUI("桌面底按钮", "底层");
    }

    console.log("跑得快开局数据 -> json:", JSON.stringify(pinfo));
    if (API.data.player1 && API.data.player1.length > 0) {
        API.hideUI(["桌面底按钮", "桌面底按钮2"]);
        API.showUI("游戏桌面1", "中间层");
        pdkmanager.gameStart(num);
    }

    // 重置游戏数据
    function resetPlayerData() {
        for (var p = 1; p <= 4; p++) {
            delete API.data["player" + p];
            delete API.data["playerInfo" + p];
        }
    }


}

Game.onGetRulesPdk = function (d) {
    var res = API.data; //2000
    res.roomType = res["玩法设置"] = d.readString();
    res.player_custom_json_str = d.readString();
    var cjson = JSON.parse(res.player_custom_json_str);
    res.inClub = cjson.IN_CLUB ? true : false;

    getRulesPdk();
}

function getRulesPdk() {
    var d = API.data["玩法设置"]; //
    if (!d) {
        return;
    }
    d = JSON.parse(d);
    if (d.SERVER_MODEL == "pdk") {
        var hufa = [" ", "经典", "15张", "四人玩法"];
        var showP = [" ", "显示牌数", "不显示牌数"];
        var paiNum = [" ", "一副牌", "两副牌"];
        var x = {
            '扣卡': d.IS_AAKF ? "AA开房" : '',
            '局数': d.ROUND + '局',
            '人数': d.PLAYER_COUNT + '人',
            '玩法': hufa[d.GAME_TYPE],
            '规则': showP[d.IS_SHOW_CARDNUM],
            '拆炸弹': d.CAN_UNPACK_BOMB ? '可拆炸弹' : '',
            '黑桃3': d.FIRST_THREE ? '首局先出黑桃3' : '',
            '红桃10翻倍': d.IS_HEARTTEN ? '红桃10翻倍' : '',
            '牌数': paiNum[d.POKER_DECK],
            '防作弊': d.IS_PREVENT_CARD ? '防作弊' : '',
            '四带三': d.FOUR_WITH_THREE ? '四带三' : '',
            '四带二': d.FOUR_WITH_TWO ? '四带二' : '',
        }
        API.data.playerNum = d.PLAYER_COUNT;

        API.data.showNum = d.IS_SHOW_CARDNUM == 1 ? true : false;
        console.log("全中翻倍=======" + d.YMNF, x["码分"]);
        API.data["玩法详情2"] = x["扣卡"] + "  " + x["人数"] + "  " + x["玩法"] + "  " + x["规则"] + "  " + x["牌数"] + "  " + x["防作弊"] + "  " + x["拆炸弹"];
        API.data["玩法详情1"] = x["黑桃3"] + "  " + x["红桃10翻倍"] + " " + x["四带二"] + " " + x["四带三"];


        if (d.ROUND == 10) {
            API.data["玩法详情3"] = d.IS_AAKF ? "10局(每人1张)" : "10局(2张房卡)";
        } else if (d.ROUND == 20) {
            API.data["玩法详情3"] = d.IS_AAKF ? "20局(每人2张)" : "20局(4张房卡)";
        }


        if (API.data.inClub) {
            var aa = d.ROUND == 10 ? "1" : "2";
            API.data["玩法详情3"] = d.DE_WAY == 3 ? x["局数"] : x["局数"] + "(" + aa + "张房卡)";
        }

        API.data["玩法名称"] = API.data["玩法"][1];
        API.update("游戏桌面");
    }


}

function getPosById(v) {
    var d = API.data;
    for (var n = 1; n < 5; n++) {
        if (d["playerInfo" + n] && d["playerInfo" + n].userID == v) {

            if (d.playerNum == 3) {
                if (n == 3) return 4;
            } else if (d.playerNum == 2) {
                if (n == 2) return 3;
            }
            return n;
        }
    }
    return 0;
}

Game.checkReadyPdk = function (d) {
    var res = API.data;
    var id = d.readLong();
    res.bool = d.readBoolean();
    var n = getPosById(id);
    if (res["playerInfo" + n]) res["playerInfo" + n].isReady = res.bool;
    API.update("准备图标" + n);
    if (res.inClub) API.update("桌面底按钮2");
    else API.update("桌面底按钮");
}


Game.checkOnlinePdk = function (d) {
    var res = API.data;
    var flag = d.readByte();
    var id = d.readLong();
    var n = getPosById(id);
    if (res["playerInfo" + n]) res["playerInfo" + n].isLine = flag == 1;
    API.update("玩离线" + n);
    console.log($("申请退出界面"));
    if (!$("申请退出界面")) return;
    for (var i = 0; i < res["申请退出列表"].length; i++) {
        if (res["申请退出列表"][i]['玩家ID'] == id) res["申请退出列表"][i]['在线否'] = flag ? '' : "离线";
    }
    API.update("退出列表");

}


Game.joinRoomPdk = function (d) {
    var o = {}; //1039
    o.userID = d.readLong();
    o.isBanker = d.readBoolean();
    o.name = d.readString();
    o.enterIndex = d.readByte();
    o.ico = d.readString();
    o.sex = d.readByte();
    o.score = d.readShort();
    o.isReady = d.readBoolean();
    o.ipAddr = d.readString();
    o.isOnline = d.readBoolean();
    o.accountId = d.readInt();
    o.handCardNum = 0;
    var res = API.data;

    let ii = res.playerInfo1.enterIndex - 1;
    var p = o.enterIndex - ii;
    if (p < 1) p += res.playerNum;
    if (res.playerNum == 3 && p == 3) p = 4;
    if (res.playerNum == 2 && p == 2) p = 3;
    if (p == 4) p = 2;
    else if (p == 2) p = 4;
    res["playerInfo" + p] = o;
    res["player" + p] = [];

    update("头像容器" + p);
    API.showUI("头像容器" + p, "底层");

}


Game.getRoomKey = function (d) {
    var res = API.data; //1003
    res.roomIP = d.readString();
    res.roomKey = d.readString();
    res.serverID = d.readIn();
}

Game.onGameBeganNotify = function (d) {
    var res = API.data; //1004
    res.playCardId = d.readLong();
    API.showUI("出牌按钮界面");
    console.log("通知出牌 1004 -> userId:", res.userID, "playCardId:", res.playCardId);
    pdkmanager.clearPlayUserDeskList(res.playCardId);
    pdkmanager.checkPlayCard();
}

Game.UpdateScores = function (d) {
    var res = API.data;
    var num = d.readShort();
    for (var n = 0; n < num; n++) {
        d.readShort();
        var p = getPosById(d.readLong());
        res["playerInfo" + p].score = d.readInt();
        API.update('积分值' + p);
    }
}


Game.onServerNotifyHU = function (d) {
    console.log("牌局结束，小结算");

    // 停止闹钟
    pdkmanager.stopAlarmClock();
    //清除警报
    clearAlarmLamp();
    // 延迟1秒，看最后一手牌的展示
    setTimeout(() => {
        var winFlag = dealResult();
        setTimeout(() => {
            API.showUI("小结算界面", "最高层");
        }, 1000);
    }, 1000);

    function dealResult() {
        var winFlag = false;
        var res = API.data;
        res.jiesuanData = [];
        var lastIdex = 0;
        var num = d.readShort();
        for (var i = 0; i < num; i++) {
            var a = d.readShort();
            var info = {};
            info.userID = d.readLong();
            info.score = d.readInt();
            info.accountId = d.readInt();

            info.sex = d.readByte();         // 性别
            info.nickName = d.readString();  // 名字
            info.iconURL = d.readString();   // 头像
            info.isRoomer = d.readBoolean(); // 是不是房主
            var g = JSON.parse(res["玩法设置"]);
            var cards = [];
            var cardNum = d.readShort();
            for (var n = 0; n < cardNum; n++) {
                var item = d.readInt();
                if (item < 30000) {
                    card = {
                        id: item,
                        num: item, // 带花式的值
                        value: item % 100, // 去掉花式的牌面值
                        type: parseInt(item / 100), // 花式
                        hasPlayed: false // 剩下的牌
                    };
                    if (item == 210 && g.IS_HEARTTEN) {
                        card.isDouble = "hongtao10";
                        info.double = "imgx2";
                    }
                    pokerBuildCardUrl(card);
                    cards.push(card);
                }

            }
            info.handCardNum = cards.length;
            info.cards = cards;
            if (info.userID == res.playerInfo1.userID) {
                res.playerInfo1.state = info.state = info.handCardNum == 0 ? "shengli" : "shibai";

                // 播放音效
                var playerInfo = pdkmanager.getPlayerInfo(info.userID);
                if (info.handCardNum === 0) { // 胜利
                    pdkmanager.playEffect(5);
                    pdkmanager.playSound("win_1", playerInfo.sex);
                    pdkmanager.playSound("sndwin");
                    winFlag = true;
                } else { // 失败
                    pdkmanager.playEffect(4);
                    pdkmanager.playSound("sndlost");
                }
            }

            var indexStr = d.readString();
            API.data.indexcc = info.indexCardTb = JSON.parse(indexStr);
            info.isBoom = false;

            info.bombNum = d.readInt();    // 玩家炸弹数
            info.beBomb = d.readInt();     // 玩家被压炸弹数

            // 全关特效
            if (info.indexCardTb.length === 0) {
                pdkmanager.playSound("quanguan");
                var pos = pdkmanager.getPlayerPos(info.userID);
                pdkmanager.playEffect(3, pos);
            }

            var BoomIdx = [];
            for (var j = 0; j < info.indexCardTb.length; j++) {
                console.log("第" + info.indexCardTb[j].index + "步" + info.indexCardTb[j].cards);
                info.indexCardTb[j].NewCard = [];
                for (var k = 0; k < info.indexCardTb[j].cards.length; k++) {
                    var cardNo = info.indexCardTb[j].cards[k];

                    card = {
                        id: cardNo,
                        num: cardNo, //带花式
                        value: cardNo % 100, // 去掉花式的牌面值
                        type: parseInt(cardNo / 100), // 花式
                    };
                    if (cardNo == 210 && g.IS_HEARTTEN) {
                        card.isDouble = "hongtao10";
                        info.double = "imgx2";
                    }
                    pokerBuildCardUrl(card);
                    info.indexCardTb[j].NewCard[k] = card;
                }
                console.log("paoxing" + info.indexCardTb[j].cards);
                info.isBoom = pdkmanager.isBoomPattern(info.indexCardTb[j].cards);
                if (info.indexCardTb[j].index > lastIdex) lastIdex = info.indexCardTb[j].index;
                if (info.isBoom) {
                    BoomIdx.push(info.indexCardTb[j].index);
                    console.log("是否炸弹", info.isBoom, BoomIdx);
                }
            }
            info.isBoomUrl = info.isBoom ? "resultUI_boomno" : "";
            for (var j = 0; j < info.indexCardTb.length; j++) {
                for (var m = 0; m < BoomIdx.length; m++) {
                    if (info.indexCardTb[j].index == BoomIdx[m] + 1) {
                        info.isBoomUrl = "resultUI_boom";
                        // return ;
                    } else if (BoomIdx[m] == lastIdex && info.handCardNum == 0) { //最后一个炸弹
                        info.isBoomUrl = "resultUI_boom";
                    }
                }

            }

            console.log("xiaojiesuan ===" + info.indexCardTb);
            res.jiesuanData[i] = info;
        }
        console.log("结算玩家信息, json:", JSON.stringify(res.jiesuanData));
        res.yupai = [];
        var num = d.readShort();
        for (var i = 0; i < num; i++) {
            var item = d.readInt();
            var card = {
                id: item,
                num: item, // 带花式的值
                value: item % 100, // 去掉花式的牌面值
                type: parseInt(item / 100) // 花式
            };
            pokerBuildCardUrl(card);
            res.yupai.push(card);
        }
        res["日期"] = new Date().format("YYYY/MM/DD hh:mm:ss");
        console.log("lastIdex==", lastIdex);
        // API.showUI("小结算界面");

        return winFlag;
    }


}
function shareFriendsPdk() {
    show("发送朋友提示","中间层");
    var res = API.data;
    var title = "房间号【"+res.roomID+"】"+res.numPlayers+"缺"+res.playerNum;
    var json = JSON.parse(res.roomType);
    console.log("josn:", json);
    var str = "跑得快 " + json.PLAYER_COUNT + "人、";
    if (json.GAME_TYPE === 1) {
        str += "经典、";
    } else if (json.GAME_TYPE === 2) {
        str += "15张、"
    } else {
        str += "四人玩法、"
    }

    str += (json.IS_SHOW_CARDNUM === 1 ? "显示牌数、" : "不显示牌数、");
    str += (json.IS_PREVENT_CARD ? '防作弊、' : '');
    str += (json.CAN_UNPACK_BOMB ? '可拆炸弹、' : '');
    str += (json.FOUR_WITH_TWO ? '四带二、' : '');
    str += (json.FOUR_WITH_THREE ? '四带三、' : '');
    str += (json.FIRST_THREE ? '首局先出黑桃3、' : '');
    str += (json.IS_HEARTTEN ? '红桃10翻倍、' : '');
    str += (json.POKER_DECK === 1 ? "一副牌" : "两副牌");
    str += "快来玩吧！"
    console.log("构造的分享语句:", str);
    console.log(title);
    winxin(title,desc);
}

function sharePdkZhanji(){
    var data = API.data;
    var roomNo = data.roomID;
    var time = data["日期"];
    var ownerName = data.roomCreateName;
    var gameName = data["玩法名称"].name;
    var roundTotal = data.gamecnt;
    var roundLast = data.currPass;
    var desc = "房间号:" + roomNo + " \n" + "结束时间:" + time + " \n" + "房主:" + ownerName + " \n" + gameName + " \n" + "局数" + roundLast + "/" + roundTotal + "\n";
    var players = data.jiesuanData;
    for (var i = 0; i < players.length; i++) {
        var player =  players[i];
        desc += player.nickName + " ID:" + player.accountId + " " + player.score + " \n";
    }
    show("发送朋友提示","最高层");
    console.log(desc);
    winxin(title,desc);
}


Game.resetPdk = function () {
    pdkmanager.clear();
    var res = API.data;
    res.iamReady = true;
    res.startPlay = null;
    API.hideUI(["小结算界面", "出牌屏蔽", "屏蔽遮罩"]);
    if (res["currPass"] == res["gamecnt"]) {
        API.showUI("大结算界面", "最高层");
        return;
    }
    for (var n = 1; n < 5; n++) {
        var d = res["playerInfo" + n];
        if (!d) continue;
        d.handCardNum = 0;
        update("玩家牌数" + n);
    }

    API.hideUI(["大结算界面", "游戏桌面2", "游戏桌面1"]);
    if (res["currPass"] == res["gamecnt"]) {
        API.runActionGroup("显示", "大结算界面");
    } else {
        res.currPass++;
        res.iamReady = true;
        API.update("局数","局数toh"); //这里也是哈需要写API才行2018.8.3
        Game.send(1007);
    }

}

/**
 * 大结算时再来一局
 */
Game.againPdk = function () {
    pdkmanager.clear();
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

/**
 * 再来一局响应, 然后请求1095 返回到俱乐部或者大厅，再请求开房开个房
 * 被邀请人在大厅或者房间会收到1116邀请，在俱乐部收到1445邀请
 * 1117
 * @param {*} d
 */
Game.onAgainPdk = function (d) {
    var lastRoomInfo = {};
    lastRoomInfo.againUserId = d.readLong();    // 再来一局的玩家ID
    lastRoomInfo.roomId = d.readInt();          // 上一局的房间ID
    lastRoomInfo.playSetting = d.readString();  // 上一局的开房参数 包含趣友圈需要用到的floor, SERVER_MODEL
    lastRoomInfo.userIds = d.readString();      // 上一局房间内的玩家id
    lastRoomInfo.clubID = d.readLong();         // 趣友圈id(非趣友圈开房时为0)
    lastRoomInfo.deskNo = d.readInt();          // 桌号
    lastRoomInfo.clubHost = d.readString();     // 俱乐部host, 过时参数
    console.log("跑得快再来一局 1117, 上一局房间信息:", JSON.stringify(lastRoomInfo));
    var res = API.data;
    res.lastRoomInfo = lastRoomInfo;    // 保存起来, 开房时使用
    res.isAgainPdk = true;              // 跑得快再来一局重新开房标识
    // 请求1095 返回到俱乐部或者大厅，再请求开房开个房
    Game.requestServerID();
}

/**
 * 大结算时关闭发送，为了请求30002服务器id
 * 1095
 */
Game.requestServerID = function () {
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
            console.log("跑得快再来一局，请求开新房, json:", JSON.stringify(lastRoomInfo));
            var waitSendTimer = setInterval(function () {
                console.log("WS.socket.readyState:", WS.socket.readyState);
                if (WS.socket.readyState === 1) {
                    // 请求开房
                    if (valueOfServerType(WS.serverID) == 4) {
                        console.log("俱乐部发送1411请求开房");
                        // 俱乐部 发送1411
                        WS.socket.send(WS.writeMessage(1411, null, function (writer) {
                            var json = JSON.parse(lastRoomInfo.playSetting);
                            writer.writeLong(lastRoomInfo.clubID);   // 趣友圈id
                            writer.writeByte(json.floor);    // 指定楼层
                            writer.writeByte(0);        // 玩法索引，过时参数，发0
                            writer.writeShort(lastRoomInfo.deskNo);  // 桌号
                            writer.writeString(lastRoomInfo.playSetting);    // 玩法设置
                            // 再来一局的东西
                            writer.writeString(lastRoomInfo.userIds);     // 邀请用户，再来一局下发的邀请用户
                            writer.writeInt(lastRoomInfo.roomId);         // 再来一局下发的最后的房间号
                            writer.writeString(json.SERVER_MODEL);     // 再来一局下发的玩法
                        }));
                    } else {
                        console.log("大厅发送1090请求开房");
                        // 大厅 发送1090
                        WS.socket.send(WS.writeMessage(1090, null, function (writer) {
                            writer.writeString(lastRoomInfo.playSetting);
                            writer.writeString(lastRoomInfo.userIds);
                            console.log(lastRoomInfo.userIds);
                            writer.writeInt(lastRoomInfo.roomId);
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
            console.log("跑得快再来一局，邀请信息, json:", JSON.stringify(inviteMsg));
            var waitSendTimer = setInterval(function () {
                console.log("WS.socket.readyState:", WS.socket.readyState);
                if (WS.socket.readyState === 1) {
                    // 加入房间
                    if (valueOfServerType(WS.serverID) == 4) {
                        WS.socket.send(WS.writeMessage(1410, null, function (writer) {
                            console.log("跑得快俱乐部再来一局发送1410加入房间, clubID:", res.clubID, "roomId:", res.roomID);
                            writer.writeLong(res.clubID);
                            writer.writeInt(inviteMsg.roomId);
                            writer.writeByte(0);
                        }));
                        clearInterval(waitSendTimer);
                    }else{
                        WS.socket.send(WS.writeMessage(1003, null, function (writer) {
                            writer.writeInt(inviteMsg.roomId);
                        }));
                        clearInterval(waitSendTimer);
                    }
                }
            }, 30);
        }, 3000);
    }
}

/**
 * 再来一局邀请(房间或大厅1116， 俱乐部1445)
 * 1116
 */
Game.onInvitedAgain = function (d) {
    var inviteMsg = {};
    // 邀请人
    inviteMsg.userID = d.readInt();            // 玩家id
    inviteMsg.name = d.readString();       // 名字
    inviteMsg.ico = d.readString();        // 头像
    inviteMsg.roomId = d.readInt();            // 房间id
    inviteMsg.playName = d.readString();       // 玩法名
    inviteMsg.playSetting = d.readString();    // 玩法设置

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
    console.log("跑得快再来一局被邀请, json:", JSON.stringify(inviteMsg));
    API.showUI(["屏蔽遮罩", "邀请再来一局"]);
    API.update("邀请再来一局");
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

function jiesuanInit() {
    var res = API.data;
    switch (res.jiesuanData.length) {
        case 2:
            show("余牌区");
            $("结算状态").appendStyle({
                "width": 600,
                "height": 200
            });
            $("牌局结算房间信息区").appendStyle({
                "top": 210
            });
            $("小结算背景2").appendStyle({
                "top": 200
            });
            $("结算列表容器").appendStyle({
                "top": 250,
                "lineHeight": 10
            });
            break;
        case 3:
            hide("余牌区");
            $("结算状态").appendStyle({
                "width": 500,
                "height": 150
            });
            $("牌局结算房间信息区").appendStyle({
                "top": 160
            });
            $("小结算背景2").appendStyle({
                "top": 150
            });
            $("结算列表容器").appendStyle({
                "top": 180,
                "lineHeight": 10
            });
            break;
        case 4:
            hide("余牌区");
            $("结算状态").appendStyle({
                "width": 500,
                "height": 100
            });
            $("牌局结算房间信息区").appendStyle({
                "top": 110
            });
            $("小结算背景2").appendStyle({
                "top": 100
            });
            $("结算列表容器").appendStyle({
                "top": 140,
                "lineHeight": 4
            });
            break;

    }


    for (var i = 0; i < res.jiesuanData.length; i++) {
        if (res.jiesuanData[i].handCardNum === 0) API.get("剩余牌[" + i + "]").clear();
        if (res.jiesuanData[i].userID == res.userID)
            $("结算1[" + i + "]").appendStyle({
                "backgroundColor": 'rgba(223,239,236,1)'
            });
        $("打出的牌[" + i + "]").value = res.jiesuanData[i].indexCardTb;
        $("结算余牌容器[" + i + "]").value = res.jiesuanData[i].cards;

        var l = res.jiesuanData[i].indexCardTb.length;
        var data = res.jiesuanData[i].indexCardTb;
        for (var j = 0; j < l; j++) {
            $("结算出牌容器1[" + j + "]").value = data[j].NewCard;
            $("打出的牌型[" + j + "]").flex();
        }
        $("打出的牌[" + i + "]").flex();
        $("结算牌区域[" + i + "]").flex();


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

}


Game.applyExitPdk = function (d) {
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

Game.onNotifyUserRefusedDisMiss = function (d) {
    var res = API.data; //1027
    res["同意否"] = d.readBoolean();
    res["退出玩家ID"] = d.readLong();
    var d = res["申请退出列表"];
    if (!d) return;
    for (var i = 0; i < d.length; i++) {
        if (d[i]["玩家ID"] == res["退出玩家ID"]) d[i]["同意否"] = res["同意否"] ? "已同意" : "未表态";
    }
    if (API.getUI("退出列表")) API.update("退出列表");
}

Game.onNotifyQuitRoomUserID = function (d) {
    var res = API.data; //1030 未开局退出房间
    res.quitID = d.readLong();
    var i = getPosById(res.quitID);
    delete res["playerInfo" + i];
    API.update("头像容器" + i);
}


Game.onNotifyUserDisMiss = function (d) {
    var res = API.data; //1028
    if (API.getUI("申请退出界面")) {
        API.runActionGroup("关闭");
    }
    var b = d.readByte();
    if (b == 0) {
        return;
    }
    var maxWinScore = 0; //大赢家
    var num = d.readShort();
    res.players = [];
    for (var i = 0; i < num; i++) {
        d.readShort();
        var o = {}
        o.playerID = d.readLong();
        o.name = d.readString();
        o.allClose = d.readShort();
        o.boom = d.readShort();
        o.totalScore = d.readShort();
        o.maxScore = d.readShort(); //单局最高分
        o.winNum = d.readShort();
        o.accountId = d.readInt();
        o.iconURL = d.readString();
        var s = [];
        s.push({
            name: "单局最高分",
            value: o.maxScore
        }); //--胡牌次数（大局，小局）；
        s.push({
            name: "打出炸弹数",
            value: o.boom
        });
        s.push({
            name: "全关次数",
            value: o.allClose
        }); //--暗杠
        s.push({
            name: "胜利局数",
            value: o.winNum
        });
        o.list = s;

        if (o.totalScore > maxWinScore) maxWinScore = o.totalScore;

        res.players[i] = o;

    }

    for (var i = 0; i < num; i++) {
        if (!res.players) continue;
        console.log('hhah=====' + maxWinScore);
        if (res.players[i].totalScore == maxWinScore && res.players[i].totalScore > 0) {
            res.players[i].bigWin = "biaoshi_dayingjia";
            res.players[i].zhanjibg = "changgui_2";
        } else {
            res.players[i].bigWin = "";
            res.players[i].zhanjibg = "changgui_1";
        }
    }

    if (!res.startPlay && res.currPass <= 1) { //未开局解散
        closeUI();
        Game.parseBackToHallData(d);//返回俱乐部还是大厅
        Game.exitRoom();
        return;
    }


    res["日期"] = new Date().format("YYYY/MM/DD hh:mm:ss");
    if (res["currPass"] == res["gamecnt"]) {

    } else {
        API.runActionGroup("显示", "大结算界面");

    }
    // 服务器信息
    Game.parseBackToHallData(d);	//返回俱乐部还是大厅
    res.againUserId = d.readLong();       // 再来一局的玩家ID, >0表示有再来一局这个按钮
    if(res.againUserId===res.userID){
        $("再来一局按钮").visible = true;
    }else{
        $("再来一局按钮").visible = false;
    }
    console.log("能否再来一局",res.againUserId,res.userID);
}

Game.exitRoom = function (callback) {
    // clearInterval(pdkTimer);
    API.update("数值组");
    closeUI();
    if (valueOfServerType(WS.serverID) == 4) {

        console.log("跑的快返回俱乐部");

        API.load("bin/club.json", callback);
    } else {
        console.log("跑的快返回俱乐部还是大厅API.data.inClub=>",API.data.inClub);
        if(API.data.inClub) Game.requestServerID();
        else
        API.load("bin/app.json", callback);
    }
}

Game.returnHallPdk = function (d) {
    var res = API.data; //1029
    var flag = d.readBoolean();
    if (flag) {
        Game.parseBackToHallData(d); //返回俱乐部还是大厅
        API.update("数值组");
        Game.exitRoom();
    }
}

Game.parseBackToHallData = function (d) {
    var res = API.data;
    res.serverType = d.readByte(); //--服务器类型0:大厅,1俱乐部
    res.serverKey = d.readString();
    res.serverHost = d.readString();//--服务器host
    console.log("服务器类型:",res.serverType,res.serverKey,res.serverHost );
    if (parseInt(res.serverType) == 1) {
        res.clubKey = res.serverKey;
        res.clubHost = res.serverHost ;
        res.clubID = d.readLong(); //--返回的俱乐部ID;
    } else {
        res.hallKey = res.serverKey;
        res.hallHost = res.serverHost;
    }
    console.log(res);
}

function setlist() {
    var res = API.data;
    for (var i = 0; i < res.players.length; i++) {
        $("战绩细则区[" + i + "]").value = res.players[i].list;
    }
    if(res.isClub)
        $("游戏场").value = "趣友圈";
    else $("游戏场").value = "好友场";
}

Game.onGiftList = function (d) {
    var res = [];
    var num1 = d.readShort();
    for (var i = 0; i < num1; i++) {
        res[i] = {};
        res[i].id = d.readByte();
        res[i].img = 'images/gifters/img' + res[i].id;
        res[i].price = d.readInt();
    }
    var ose = [];
    var num2 = d.readShort();
    for (var i = 0; i < num2; i++) {
        ose[i] = {};
        ose[i].id = d.readByte();
        ose[i].img = 'images/gifters/ing' + ose[i].id;
        ose[i].price = d.readInt();
    }

    API.runActionGroup("显示", "玩家信息");
    // console.log("礼物列表res", res, ose);
    //暂时屏蔽礼物 2018.08.04
    // API.data["礼物列表"] = $("礼物列表").value = API.data.currPlayer.userID == API.data.userID ? ose : res;
}

function sendEmoticon(id) {
    console.log("表情id", id);
    // console.log($("礼物列表").value);
    var res = API.data;
    // res["礼物列表"][id];
    WS.socket.send(WS.writeMessage(1085, null, function (writer) {
        writer.writeLong(res.currPlayer.userID);
        writer.writeByte(res["礼物列表"][id].id);
        writer.writeInt(1);
        writer.writeBoolean(API.data.currPlayer.userID == API.data.userID);
        console.log("send 1085 ===", res.currPlayer.userID, res["礼物列表"][id].id, API.data.currPlayer.userID == API.data.userID);
    }));

}

Game.onGivePlayerGif = function (obj) {
    var res = {};
    res.giveid = obj.readLong();
    res.givename = obj.readString();
    res.reciveid = obj.readLong();
    var n = getPosById(res.reciveid);
    res.gifid = obj.readByte();
    res.num = obj.readInt();
    res.isme = obj.readBoolean();
    API.runActionGroup("关闭");
    console.log("接受礼物信息", res);

}

var settingBgImg = (function () {
    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toGMTString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    var data = ["", "天蓝色按钮", "草绿色按钮", "墨绿色按钮"];

    function initF() {
        var BgImgType = getCookie("BgImgType");
        if (BgImgType == "" || BgImgType == "undefined" || BgImgType == null) {
            API.getUI("背景").value = "ditu_1";
            return;
        }
        API.getUI("背景").value = "ditu_" + BgImgType;
    }

    function init() {
        var BgImgType = getCookie("BgImgType");
        if (BgImgType == "" || BgImgType == "undefined" || BgImgType == null) {
            setCookie("BgImgType", "1", 30);
            settingBgImg.selected(1);
            onCardSizeClick(1);
            return;
        }
        settingBgImg.selected(BgImgType);

        var scalev = getCookie("scalev");
        if(scalev == "" || scalev == "undefined" || scalev == null){
            onCardSizeClick(1);
        }
        onCardSizeClick(scalev);
    }

    function selected(target) {
        setCookie("BgImgType", target, 30);
        for (var a = 1; a < data.length; a++) {
            API.getUI(data[a]).value = 0;
        }
        API.getUI(data[target]).value = target;
        API.getUI("背景").value = "ditu_" + target;
    }

    return {
        initF: initF,
        init: init,
        selected: selected
    }

})();

// ------------------------- 跑得快管理类 ----------------------- //

function PdkManager() {
    this.playerNum = 0;            // 当前模式的玩家人数
    this.isGameRunning = false;    // 游戏状态
    this.isFirstDiscard = false;   // 全局第一次出牌, 开门见3规则
    this.lastPlayerUserId;         // 上一打牌玩家的ID, 为了判别需要不需要验证能不能打的起上一玩家(不是上家)出的牌
    this.lastPlayerPlayCardValues; // 上一玩家打的牌(不一定是上家，上家过的话，就是上上家)
    this.currentPlayData = {};     // 当前打的牌数据 {cardValues, cardIndexes}
    this.rules; // 游戏规则
    this.lastCardPatternEffect;      // 上一个牌型特效
    this.lastAlarmClock;             // 上一个出牌闹钟
    this.lastSimpleFrameEffectId;    // 上一个帧特效ID
}

/**
 * 发牌特效，左右
 * @param {*} side 左右参数："left", "right"
 */
PdkManager.prototype.playDealEffectSide = function (side) {
    console.log("play deal effect -> ", side);
    pdkmanager.setDealEffectVisible(side, true);
    var res = API.data;
    res["bcard"] = "pork_bg";
    for (var i = 0; i < 3; i++) {
        API.update(side + "Icon" + (i + 1));
    }

    var card1 = API.getUI(side + "Card1"),
        card2 = API.getUI(side + "Card2"),
        card3 = API.getUI(side + "Card3");
    var frames = 80;
    var currentFrame = 0;
    var ptimes = 0; // 执行了几次，3次一循环
    var increment = 3; // 增量, 每3帧执行一次
    var intervalTime = 1000 / 120 * increment; // 参考客户端，120fps，3帧执行一次
    var sideEffectTimer = setInterval(function () {
        currentFrame += increment;
        ptimes++;
        if (ptimes === 1) {
            card1.visible = false;
            card2.visible = true;
            card3.visible = false;
        } else if (ptimes === 2) {
            card1.visible = false;
            card2.visible = false;
            card3.visible = true;
        } else {
            card1.visible = true;
            card2.visible = false;
            card3.visible = false;
            ptimes = 0;
        }

        if (currentFrame >= frames) {
            clearInterval(sideEffectTimer);
            card1.visible = false;
            card2.visible = false;
            card3.visible = false;
        }
    }, intervalTime);
}

/**
 * 发牌特效，中间的牌堆
 */
PdkManager.prototype.playDealEffectMiddle = function () {
    console.log("play deal effect -> middle");
    var res = API.data;
    var mlist = [];
    for (var i = 0; i < 9; i++) {
        mlist.push({
            "bcard": "pork_bg"
        });
    }
    res["middleList"] = mlist;
    API.update("middleList");
    var card;
    for (var j = 0; j < 9; j++) {
        card = API.getUI("middleItem[" + j + "]");
        card.y = card.y + (9 - 1 - j) * 4;
    }

    var currentCard = 9;
    var frames = 80;
    var currentFrame = 0;
    var increment = 5; // 增量, 每5帧执行一次
    var intervalTime = 1000 / 120 * increment; // 参考客户端，120fps，5帧执行一次
    var middleEffectTimer = setInterval(function () {
        currentFrame += increment;
        if (currentFrame >= 40) {
            currentCard -= 1;
            // console.log("currentCard:", currentCard);
            card = API.getUI("middleItem[" + currentCard + "]");
            if (card) {
                card.visible = false;
            }
        }
        if (currentFrame >= frames) {
            clearInterval(middleEffectTimer);

        }
    }, intervalTime);
}

/**
 * 发牌特效，上下
 * @param {*} updown
 */
PdkManager.prototype.playDealEffectUpdown = function (updown) {
    console.log("play deal effect -> ", updown);
    pdkmanager.setDealEffectVisible(updown, true);
    var res = API.data;
    res["bcard"] = "pork_bg";
    API.update(updown + "Card1");
    API.update(updown + "Card2");

    var card1 = API.getUI(updown + "Card1");
    var card2 = API.getUI(updown + "Card2");
    card1.visible = true;
    card2.visible = false;

    var frames = 80;
    var currentFrame = 0;
    var increment = 5; // 增量, 每5帧执行一次
    var intervalTime = 1000 / 120 * increment; // 参考客户端，120fps，5帧执行一次
    var updownEffectTimer = setInterval(function () {
        currentFrame += increment;
        var divide = currentFrame / increment;
        if (divide % 2 != 0) {
            card1.visible = false;
            card2.visible = true;
        } else {
            card1.visible = true;
            card2.visible = false;
        }
        if (currentFrame >= frames) {
            clearInterval(updownEffectTimer);
            card1.visible = false;
            card2.visible = false;
        }
    }, intervalTime);
}

/**
 * 发牌特效，自己的牌
 */
PdkManager.prototype.playDealEffectSelf = function (callback) {
    console.log("play deal effect -> self");
    var res = API.data;
    var mlist = [];
    // for (var i = 0; i < 17; i++) {
    // 	mlist.push({"bcard": "pork_bg"});
    // }
    // res["myCardList"] = mlist;
    // API.update("myCardList");
    // console.log("什么鬼");
    // var length = res.cardList.length;
    API.timer.play(1, 16, function () {
        mlist.push({
            "bcard": "pork_bg"
        });
        // res["myCardList"] = mlist;
        // API.update("myCardList");
        var listUI = API.getUI("myCardList");
        listUI.value = mlist;
        // 发牌音效
        pdkmanager.playSound("FaPai");
        console.log("list length1:", mlist.length);
        $("卡牌列表").visible = false;
    }, function () {
        API.timer.remove("selfEffectTimer");
        callback();
        console.log("callback call");
    }, false, "selfEffectTimer");


    // res["myCardList"] = mlist;
    // API.update("myCardList");
    // var listUI = API.getUI("myCardList");
    // listUI.value = mlist;


    // setTimeout(() => {
    // var card;
    // for (var j = 0; j < 17; j++) {
    // 	card = API.getUI("mcardItem[" + j + "]");
    // 	card.x = j*42;
    // 	card.y = 0;
    // 	card.visible = false;
    // }

    // var currentCard = 0;
    // var frames = 80;
    // var currentFrame = 0;
    // var increment = 5;  // 增量, 每5帧执行一次
    // var intervalTime = 1000/120*increment;  // 参考客户端，120fps，5帧执行一次
    // var selfEffectTimer = setInterval(function () {
    // 	currentFrame += increment;
    // 	card = API.getUI("mcardItem[" + currentCard + "]");
    // 	card.visible = true;
    // 	currentCard += 1;
    // 	console.log("current card:", currentCard, "current frame:", currentFrame, "frames:", frames, "visible:", card.visible);
    // 	if (currentFrame >= frames) {
    // 		clearInterval(selfEffectTimer);
    // 		callback();
    // 	}
    // }, intervalTime);
    // }, 300);


}

/**
 * 设置相应的发牌特效UI可见性
 * @param {*} which "up", "down", "left", "right"
 * @param {*} visible
 */
PdkManager.prototype.setDealEffectVisible = function (which, visible) {
    var effectUI = $("card" + which);
    if (effectUI) {
        effectUI.visible = visible;
    }
}

/**
 * 发牌特效，根据人数调整播放
 * @param {*} playerNum 打牌人数
 */
PdkManager.prototype.playDealEffect = function (playerNum, callback) {
    API.showUI("发牌特效面板");
    API.hideUI(["桌面底按钮", "桌面底按钮2"]);
    console.log("跑得快发牌特效，打牌人数:", playerNum)

    pdkmanager.setDealEffectVisible("up", false);
    pdkmanager.setDealEffectVisible("down", false);
    pdkmanager.setDealEffectVisible("left", false);
    pdkmanager.setDealEffectVisible("right", false);

    pdkmanager.playDealEffectMiddle();
    pdkmanager.playDealEffectUpdown("down");
    pdkmanager.playDealEffectSelf(callback);
    if (playerNum === 2) {
        // 2人对打
        pdkmanager.playDealEffectUpdown("up");
    } else if (playerNum === 3) {
        // 3人对打
        pdkmanager.playDealEffectSide("left");
        pdkmanager.playDealEffectSide("right");
    } else {
        // 4人对打
        pdkmanager.playDealEffectUpdown("up");
        pdkmanager.playDealEffectSide("left");
        pdkmanager.playDealEffectSide("right");
    }
}

/**
 * 最后一张卡牌警报检测
 */
PdkManager.prototype.checkAlarmLampOn = function () {
    var playerInfo;
    var res = API.data;

    for (var i = 1; i <= 4; i++) {
        playerInfo = res["playerInfo" + i];
        if (playerInfo) {
            // console.log("idx:", i, "player:", JSON.stringify(playerInfo), "dict:", JSON.stringify(res["askMaxDict"]));
            if (res["askMaxDict"][playerInfo.userID]) {
                console.log("alarm idx:", i);
                pdkmanager.playEffect(1, i);
                API.getUI("出牌按钮容器").visible = false;
            }
        }
    }
}

/**
 * 游戏开始
 * @param {*} playerNum
 */
PdkManager.prototype.gameStart = function (playerNum) {
    var res = API.data;
    console.log("玩法设置：", res["玩法设置"]);
    pdkmanager.rules = JSON.parse(res["玩法设置"]);

    this.isGameRunning = true;
    this.playerNum = playerNum;
    pdkmanager.playDealEffect(playerNum, function () {
        setTimeout(() => {
            console.log("game start...");
            // var effectUI = API.getUI("发牌特效面板");
            // console.log("effectUI:", effectUI);

            API.hideUI("发牌特效面板");
            pdkmanager.init();
            pdkmanager.setHandCards(API.data.player1);
            pdkmanager.checkPlayCard();
            pdkmanager.checkAlarmLampOn();
        }, 200);
    });
}

/**
 * 跑得快声音播放
 * @param {*} value url关键的值
 * @param {*} sex 性别 0女1男
 * @param {*} pattern 牌型
 * @param {*} repeat 是否循环播放
 */
PdkManager.prototype.playSound = function (value, sex = -1, pattern = -1, repeat = 0) {
    var url = sex >= 0 ? (sex === 0 ? "g_" : "b_") : "";
    if (pattern != pokerPattern.NO) {
        card = value[0];
        pureValue = getCardPureValue(card);
        switch (pattern) {
            case pokerPattern.A:
                url += pureValue;
                break;
            case pokerPattern.AA:
                url += pureValue + "d";
                break;
            case pokerPattern.AAA:
                url += "3s0";
                break;
            case pokerPattern.AAAB:
                url += "3s1";
                break;
            case pokerPattern.AAABC:
                url += "3s2";
                break;
            case pokerPattern.AAAABC:
                url += "4s2";
                break;
            case pokerPattern.AAAABCD:
                url += "4s3";
                break;
            case pokerPattern.AAAA:
                url += "bomb";
                break;
            case pokerPattern.AABBCCDD:
                url += "ds";
                break;
            case pokerPattern.AAABBBCCDD:
                url += "feiji";
                break;
            case pokerPattern.ABCDE:
                url += "s";
                break;

        }
        // 大小王音效
        if (isJokerCard(card) && (pattern === pokerPattern.A || pattern === pokerPattern.AA)) {
            API.playSound("outpoker");
        }
    } else {
        url += value;
    }
    API.playSound(url, repeat);
    console.log("play sound -> url:", url, "value:", JSON.stringify(value), "sex:", sex, "repeat:", repeat, "pattern:", pattern);
}

/**
 * 找到相应的玩家位置索引 1-4
 */
PdkManager.prototype.getPlayerPos = function (userId) {
    var playerInfo, pos = 0;
    var res = API.data;
    for (var i = 1; i <= 4; i++) {
        playerInfo = res["playerInfo" + i];
        if (playerInfo && playerInfo.userID === userId) {
            pos = i;
            break;
        }
    }
    console.log("player pos -> userId:", userId, "pos:", pos);
    return pos;
}

/**
 * 找到相应的玩家信息对象
 * @param {*} userId
 */
PdkManager.prototype.getPlayerInfo = function (userId) {
    var playerInfo;
    var res = API.data;
    var pos = pdkmanager.getPlayerPos(userId);
    if (pos > 0) {
        playerInfo = res["playerInfo" + pos];
    }
    return playerInfo;
}

/**
 * 播放出牌闹钟倒计时
 * @param {*} pos
 */
PdkManager.prototype.playAlarmClock = function (pos) {
    pdkmanager.stopAlarmClock();
    var count = 30; // 30秒
    var res = API.data;
    var alarmClock = $("闹钟" + pos);
    alarmClock.visible = true;
    pdkmanager.lastAlarmClock = alarmClock;
    res["timerDigit"] = count;
    API.update("倒计时" + pos);
    API.timer.play(24, count, function () {
        count--;
        res["timerDigit"] = count;
        API.update("倒计时" + pos);
        // 嘀嗒提醒音
        if (count === 3) {
            pdkmanager.playSound("dida");
        }
    }, function () {
        API.timer.remove("alarmClockTimer");
    }, false, "alarmClockTimer");
}

/**
 * 停止上一个出牌闹钟特效
 */
PdkManager.prototype.stopAlarmClock = function () {
    lastAlarmClock = pdkmanager.lastAlarmClock;
    if (lastAlarmClock && lastAlarmClock.visible) {
        lastAlarmClock.visible = false;
        API.timer.remove("alarmClockTimer");
    }
}

/**
 * 初始化
 */
PdkManager.prototype.init = function () {
    pdkgame.init();
}

/**
 * 手牌选择按下
 * @param {*} id
 * @param {*} index
 */
PdkManager.prototype.pressDown = function (id, index) {
    pdkgame.pressDown(id, index);
}

/**
 * 手牌选择按起
 * @param {*} id
 * @param {*} index
 */
PdkManager.prototype.pressUp = function (id, index) {
    pdkgame.pressUp(id, index);
}

/**
 * 设置手牌数据
 * @param {*} handCardList
 */
PdkManager.prototype.setHandCards = function (handCardList) {
    pdkgame.setHandCards(handCardList);
}

/**
 * 设置桌牌数据
 * @param {*} deskCardList
 * @param {*} playUserId
 */
PdkManager.prototype.setDeskCards = function (deskCardList, playUserId) {
    pdkgame.setDeskCards(deskCardList, playUserId);
}

/**
 * 清除桌面
 */
PdkManager.prototype.clear = function () {
    pdkgame.clear();
    if( API.getUI("出牌按钮容器"))API.getUI("出牌按钮容器").visible = false;
    pdkmanager.isGameRunning = false;
}

/**
 * 获取要打的牌
 */
PdkManager.prototype.getPlayCardsData = function () {
    return pdkgame.getPlayCardsData();
}

/**
 * 辅助出牌提示
 */
PdkManager.prototype.auxiliaryPlayTips = function () {
    pdkgame.auxiliaryPlayTips();
}

/**
 * 分析牌型
 * @param {*} cardValues  选择的卡牌值数组
 * @param {*} checkUnpackBomb 主要用来处理不可拆炸弹的情况，默认为false
 */
PdkManager.prototype.analyzeCardPattern = function (cardValues, checkUnpackBomb = false) {
    return pdkgame.analyzeCardPattern(cardValues, checkUnpackBomb);
}

/**
 * 分析是不是炸弹
 * @param {*} cardValues
 */
PdkManager.prototype.isBoomPattern = function (cardValues) {
    var pattern = pdkmanager.analyzeCardPattern(cardValues);
    console.log("isBoomPattern -> pattern:", pattern, "cardValues:", JSON.stringify(cardValues));
    return pattern === pokerPattern.AAAA;
}

/**
 * 更新相应玩家已打的卡牌值数组
 * @param {*} cardValues
 * @param {*} playUserId
 */
PdkManager.prototype.updatePlayCardValues = function (cardValues, playUserId) {
    var playerInfo;
    var res = API.data;
    for (var i = 1; i <= 4; i++) {
        playerInfo = res["playerInfo" + i];
        if (playerInfo && playerInfo.userID === playUserId) {
            res["player" + i] = cardValues;
            console.log("更新玩家已打的牌记录, playUserId:", playUserId, "index:", i, "cardValues:", cardValues);
            break;
        }
    }
}

/**
 * 得到下家是否是最大报单
 */
PdkManager.prototype.isNextPlayerAskMax = function () {
    var res = API.data;
    var playerInfo, isAskMax = false;
    // 找到下家
    if (pdkmanager.playerNum === 2) {
        playerInfo = res["playerInfo3"];
    } else {
        playerInfo = res["playerInfo4"];
    }
    if (playerInfo) {
        isAskMax = res.askMaxDict[playerInfo.userID];
    }
    console.log("下家的玩家ID:", playerInfo.userID, "isAskMax:", isAskMax);
    return isAskMax;
}

/**
 * 得到上家打的牌值数组，上一回合是自己则返回[]
 */
PdkManager.prototype.getPrevPlayCardValues = function () {
    var res = API.data;
    var cards, cardValues = [];
    var playerInfo;
    // 上一回合是自己出牌
    if (res.userID === pdkmanager.lastPlayerUserId) {
        console.log("上一回合是自己出牌")
        return cardValues;
    }
    // 取上一出牌玩家的牌, 线上前端保存的值，刷新后会没有
    cardValues = pdkmanager.lastPlayerPlayCardValues || [];
    if (cardValues.length === 0) {
        // 找到上家出的牌, 取后端记录
        if (pdkmanager.playerNum === 2) {
            cards = res["player3"];
            playerInfo = res["playerInfo3"];
            fetchCardValues(cards, playerInfo);
        } else {
            console.log("取上一回合玩家的出牌");
            // 上一回合玩家的出牌
            for (var i = 2; i <= 4; i++) {
                cards = res["player" + i];
                playerInfo = res["playerInfo" + i];

                if (cards && cards.length > 0) {
                    fetchCardValues(cards, playerInfo);
                    break;
                }
            }
        }
    }

    function fetchCardValues(cards, playerInfo) {
        if (cards && cards.length > 0) {
            for (var j = 0; j < cards.length; j++) {
                var card = cards[j];
                // console.log("card:", card);
                cardValues.push(card.num);
            }
            pdkmanager.lastPlayerUserId = playerInfo.userID; // 上一出牌玩家
        }
    }

    console.log("getPrevPlayCardValues:", JSON.stringify(cardValues), "cards:", JSON.stringify(cards));
    return cardValues;
}

/**
 * 上回合是不是自己出牌
 */
PdkManager.prototype.isLastRoundSelfPlay = function () {
    var cardValues = pdkmanager.getPrevPlayCardValues();
    return cardValues.length === 0;
}

/**
 * 清空准备出牌玩家的桌牌列表
 * @param {*} playUserId 出牌玩家id
 */
PdkManager.prototype.clearPlayUserDeskList = function (playUserId) {
    var res = API.data;
    for (var i = 1; i <= 4; i++) {
        var playerInfo = res["playerInfo" + i];
        if (playerInfo && playerInfo.userID === playUserId) {
            res["deskList" + i] = [];
            API.update("桌牌列表" + i);
            console.log("清空准备出牌玩家的桌牌列表 -> index:", i);
            break;
        }
    }
}

/**
 * 处理智能出牌，自动弹出提示的牌
 * @param {*} playData
 */
PdkManager.prototype.dealSmartPlay = function (playData) {
    pdkgame.dealSmartPlay(playData);
}

/**
 * 能否出牌, 会根据情况判断是否自动出牌（最后的一手牌）
 */
PdkManager.prototype.canPlayCard = function () {
    var res = API.data;
    var canPlay = res.playCardId === res.userID;
    console.log("能否出牌 -> canPlay:", canPlay, "出牌ID:", res.playCardId, "当前用户ID:", res.userID, "上一出牌玩家ID:", pdkmanager.lastPlayerUserId);

    // 判断有没有牌可以出
    if (canPlay && !pdkmanager.isFirstDiscard) {
        var playData;
        var autoPlayCheck = false; // 自动出牌检测标识
        var prevCardValues = pdkmanager.getPrevPlayCardValues();
        if (prevCardValues && prevCardValues.length > 0) { // 判断别人的牌，需不需要过牌
            playData = pdkgame.judgeHandCardsCanPlay(prevCardValues);
            if (!playData || !playData.canPlay) { // 到自己的回合，但没牌出，自动过
                Game.requestUserPass();
                canPlay = false;
            } else {
                autoPlayCheck = true;
            }
            console.log("canPlay:", canPlay, "playData:", playData);
        } else { // 上回合是自己最大，判断当前手牌满不满足一手打出
            var handCardValues = pdkgame.getHandCardValues();
            var pattern = pdkgame.analyzeCardPattern(handCardValues);
            if (pattern != pokerPattern.NO) {
                autoPlayCheck = true;
                var cardIndexes = [];
                // 构建索引数组
                for (var i = handCardValues.length - 1; i >= 0; i--) {
                    cardIndexes.push(i);
                }
                playData = {
                    pattern: pattern,
                    canPlay: true,
                    cardValues: handCardValues,
                    cardIndexes: cardIndexes
                };
                console.log("满足自动出牌 -> pattern:", pattern, "playData:", JSON.stringify(playData));
            }
        }
        console.log("autoPlayCheck:", autoPlayCheck);
        if (playData && (playData.pattern === pokerPattern.AAAABC || playData.pattern === pokerPattern.AAAABCD)) {
            autoPlayCheck = false;
            console.log("4带2或4带3，让玩家自己出牌");
        }
        // 自动出牌检测
        if (autoPlayCheck) {
            var cardValues = playData.cardValues;
            var handLength = pdkgame.getHandCardLength();

            console.log("判断自动出牌 -> cardValues length:", cardValues.length, "handlength:", handLength);
            if (cardValues.length === handLength) {
                Game.requestPlayCard(playData);
                console.log("刚好可以出光手牌，自动出牌 -> length:", handLength);
            } else if (pdkmanager.isSmartPlay()) {
                // 智能出牌提示
                pdkmanager.dealSmartPlay(playData);
            }
        }
    }
    return canPlay;
}

/**
 * 出牌检测
 */
PdkManager.prototype.checkPlayCard = function () {
    var res = API.data;
    var playUserId = res.playCardId;
    var pos = pdkmanager.getPlayerPos(playUserId);
    // 播放出牌闹钟
    pdkmanager.playAlarmClock(pos);

    var playBtn = API.getUI("出牌按钮");
    playBtn.enabled = false;

    if (pdkmanager.canPlayCard()) {
        API.getUI("出牌按钮容器").visible = true;
    } else {
        API.getUI("出牌按钮容器").visible = false;
    }
    console.log("check play card -> visible:", API.getUI("出牌按钮容器").visible, "enabled:", API.getUI("出牌按钮").enabled);
}

/**
 * 处理已打的牌
 */
PdkManager.prototype.procPlayedCards = function () {
    pdkgame.procPlayedCards();
}

/**
 * 能否4带2
 */
PdkManager.prototype.can4With2 = function () {
    var enable = pdkmanager.rules["FOUR_WITH_TWO"];
    console.log("是否可以4带2:", enable);
    return enable;
}

/**
 * 是否4带3
 */
PdkManager.prototype.can4With3 = function () {
    var enable = pdkmanager.rules["FOUR_WITH_THREE"];
    console.log("是否可以4带3:", enable);
    return enable;
}

/**
 * 是否可拆炸药，4人两副牌默认可拆
 */
PdkManager.prototype.canUnpackBomb = function () {
    var enable = pdkmanager.hasTwoPacks() ? true : pdkmanager.rules["CAN_UNPACK_BOMB"];
    console.log("是否可以拆炸弹:", enable);
    return enable;
}

/**
 * 是否防作弊
 * IS_PREVENT_CARD
 */
PdkManager.prototype.isPreventCard = function () {
    var enable = pdkmanager.rules["IS_PREVENT_CARD"];
    console.log("是否防作弊:", enable);
    return enable;
}


/**
 * 是否首局先出黑桃3
 */
PdkManager.prototype.canSpade3 = function () {
    var enable = pdkmanager.rules["FIRST_THREE"];
    console.log("是否首局先出黑桃3:", enable);
    return enable;
}

/**
 * 是不是使用两副牌
 */
PdkManager.prototype.hasTwoPacks = function () {
    return pdkmanager.rules["POKER_DECK"] === 2;
}

/**
 * 是不是智能出牌提示
 */
PdkManager.prototype.isSmartPlay = function () {
    var res = API.data;
    var smartv = res["智能出牌"];
    console.log("智能出牌 -> smartv:", smartv);
    return smartv === 1 ? true : false;
}

/**
 * 出牌大小比例
 */
PdkManager.prototype.getPlayCardScale = function () {
    var res = API.data;
    var scalev = res["出牌大小"] || cardSizeScale[1];
    console.log("出牌大小 -> scalev:", scalev);
    return scalev;
}

pdkmanager = new PdkManager();
console.log("跑得快进行中...");

function dealEffectTest() {
    pdkmanager.gameStart(4);
}

// ------------------------- 跑得快游戏 ------------------------- //

// 出牌后的卡牌比例
var cardSizeScale = {
    1: 0.9,
    2: 0.8,
    3: 0.7,
}

// 扑克花式
var pokerTrick = {
    "BLACK": 1, // 黑
    "RED": 2, // 红
    "PLUM": 3, // 梅
    "SQUARE": 4 // 方
}
// 扑克花式
var pokerTrickUrls = {
    1: "newtao", // 黑
    2: "newheart", // 红
    3: "newmeihua", // 梅
    4: "newfang" // 方
}

// 扑克底色
var pokerColor = {
    1: "black",
    2: "red",
    3: "black",
    4: "red"
}

// 扑克数值 30小鬼，31大鬼
var pokerValue = {
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
    8: "8",
    9: "9",
    10: "10",
    11: "J",
    12: "Q",
    13: "K",
    14: "A",
    20: "2",
    30: "wang",
    31: "wang"
}

// 跑得快牌型
var pokerPattern = {
    "NO": -1, // 不符合出牌规则
    "AAAA": 1, // 炸弹
    "AAAABC": 2, // 4带2, 2是一对或2个单张
    "AAABBBCCDD": 3, // 飞机(自己最后一次出牌，有特例)
    "AAABC": 4, // 3带2(自己最后一次出牌，有特例)
    "AAA": 5, // 三条
    "ABCDE": 6, // 顺子
    "AABBCCDD": 7, // 连对
    "AA": 8, // 对子
    "A": 9, // 单张
    "SS": 10, // 4王炸
    "AAAABCD": 11, // 4带3
    "AAAB": 20, // 3带1, 特例，最后一次出牌
}

/**
 * 是不是大小王 小王130，大王131
 * @param {*} cardValue
 */
function isJokerCard(cardValue) {
    return (cardValue === 130 || cardValue === 131);
}

/**
 * 构建扑克URL
 *
 * @param {any} card
 */
function pokerBuildCardUrl(card) {
    if (isJokerCard(card.num)) { // 小鬼或大鬼
        var jokerColor = card.num === 130 ? pokerColor[1] : pokerColor[2];
        card.jokerCard = jokerColor + "_" + pokerValue[card.value];
        card.jokerTrick = jokerColor + "_Joker";
    } else {
        card.card = pokerColor[card.type] + "_" + pokerValue[card.value];
        card.trick = pokerTrickUrls[card.type];
    }
}

/**
 * 根据带花式的卡牌值得到纯粹的卡牌值
 * @param {*} cardValue
 */
function getCardPureValue(cardValue) {
    return cardValue % 100;
}

var pdkgame = (function (API, pdkmanager) {
    var hasInit = false; // 是否已经初始化
    var gapWidth; // 扑克叠在一起露出的部分宽度
    var cardWidth = 108; // 扑克宽度
    var pressTimer; // 按下拖动鼠标的timer
    var centerPosx; // 居中的坐标x

    var handCardList = []; // 扑克手牌
    var selectIndexes = []; // 扑克选择的索引集
    var lastSelectIndex = -1; // 此前选择的最左侧索引
    var hasNextTips = false;  // 是否还有下次提示

    /**
     * 初始化
     */
    function init() {
        if (hasInit) {
            return;
        }
        hasInit = true;
        for (var i = 1; i <= 4; i++) {
            API.getUI("桌牌容器" + i).enabled = false;
        }
        if (pdkmanager.hasTwoPacks()) {
            gapWidth = 37; // 两副牌
            console.log("使用两副牌 -> gapWidth:", gapWidth);
        } else {
            gapWidth = 58; // 一副牌
            console.log("使用一副牌 -> gapWidth:", gapWidth);
        }

        hide("winLoseEffect");
        clearAlarmLamp();
        console.log("init hide");
    }

    /**
     * 辅助出牌提示
     */
    function auxiliaryPlayTips() {
        var id = "卡牌条目";
        var res = API.data;
        var isFirstDiscard = pdkmanager.isFirstDiscard;
        var ilist = getSelectedCardIndexList();
        var currentIndex = -1,
            pattern = 0;
        var playBtn = API.getUI("出牌按钮");
        console.log("已选择的卡牌数量:", ilist.length);
        var prevCardValues = pdkmanager.getPrevPlayCardValues();
        if (prevCardValues.length === 0) {
            var isAskMax = pdkmanager.isNextPlayerAskMax();
            if (isAskMax) {    // 下家最大报单
                currentIndex = getCardLeftIndex();
                cancelSelectedCards();
                selectCardAndPopup(id, currentIndex);
            } else if(isFirstDiscard) {
                currentIndex = startSeeSpade3();
                currentIndex = currentIndex === -1 ? getCardRightIndex() : currentIndex;
                cancelSelectedCards();
                selectCardAndPopup(id, currentIndex);
                pattern = analyzeCardPattern([103],true);
            }else{
                if (ilist.length === 0) {
                    currentIndex = startSeeSpade3();
                    currentIndex = currentIndex === -1 ? getCardRightIndex() : currentIndex;
                    selectCardAndPopup(id, currentIndex);
                } else if (ilist.length === 1) {
                    // 单张
                    var preIndex = ilist[0];
                    currentIndex = preIndex - 1;

                    // 右侧最小，左侧最大
                    console.log("preindex:", preIndex, "currentIndex:", currentIndex);
                    currentIndex = currentIndex < 0 ? getCardRightIndex() : currentIndex; // 上次最大时，切换到当前选择最小，否则只是减1索引
                    cancelSelectedCards();
                    selectCardAndPopup(id, currentIndex);
                    var card = handCardList[currentIndex].num;
                    pattern = analyzeCardPattern([card],true);
                }
            }

            console.log("出牌按钮设置可用");
            playBtn.enabled = pattern===pokerPattern.NO?false:true;
            return;
        }
        
        var pattern = analyzeCardPattern(prevCardValues);
        console.log("prevCardValues.length:", prevCardValues.length, "ilist.length:", ilist.length, "pattern:", pattern);
        // 计算此前已选择的卡牌索引
        if (prevCardValues.length === 1 && ilist.length === 1) {
            // // 按从右侧开始的顺序
            // lastSelectIndex = handCardList.length - 1 - ilist[0];
            // console.log("此前选择的索引:", lastSelectIndex);
            // // 重置索引
            // if (lastSelectIndex === (handCardList.length - 1)) {
            //     lastSelectIndex = -1;
            //     console.log("此前索引到达最左侧，重置索引");
            // }
        } else if (prevCardValues.length === 2 && ilist.length === 2) {
            console.log("对子提示");
            console.log("ilist:", JSON.stringify(ilist));
            if (lastSelectIndex !== -1 && !hasNextTips) {
                // 如果没有下次提示，则重置索引
                lastSelectIndex = -1;
            } else {
                // 已选牌的最左侧开始算起
                lastSelectIndex = handCardList.length - 1 - ilist[ilist.length - 1]; 
            }
            hasNextTips = false;
        } else if ((prevCardValues.length === 4 && ilist.length === 4) || (prevCardValues.length === 6 && ilist.length === 6) || (prevCardValues.length === 8 && ilist.length === 8)) {
    
            // if (pattern === pokerPattern.AABBCCDD) {
            //     console.log("连对提示");
            //     console.log("prevCardValues:,",prevCardValues,"ilist:", JSON.stringify(ilist), "lastSelectIndex:", lastSelectIndex, "hasNextTips:", hasNextTips);
            //     if (!hasNextTips) {
            //         // 如果没有下次提示，则重置索引
            //         lastSelectIndex = -1;
            //     } else {
            //         // 已选牌的最左侧开始算起
            //         lastSelectIndex = handCardList.length - 1 - ilist[1];
            //         console.log("lastSelectIndex:",lastSelectIndex);
            //     }
            //     hasNextTips = false;
            // }
            
        } else if (prevCardValues.length === 5 && ilist.length === 3) {
            // var pattern = analyzeCardPattern(prevCardValues);
            // if (pattern === pokerPattern.AAABC) {
            //     console.log("三带二提示");
            //     console.log("prevCardValues:,",prevCardValues,"ilist:", JSON.stringify(ilist));
            //     console.log("ilist:", JSON.stringify(ilist));
            //     if (lastSelectIndex !== -1 && !hasNextTips) {
            //         // 如果没有下次提示，则重置索引
            //         lastSelectIndex = -1;
            //     } else {
            //         // 已选牌的最左侧开始算起
            //         lastSelectIndex = handCardList.length - 1 - ilist[2];
            //         console.log("lastSelectIndex:",lastSelectIndex);
            //     }
            //     hasNextTips = false;
            // }
        }

        if (pattern === pokerPattern.A) {
            // 按从右侧开始的顺序
            lastSelectIndex = handCardList.length - 1 - ilist[ilist.length - 1];
            console.log("此前选择的索引:", lastSelectIndex);
            // 重置索引
            if (lastSelectIndex === (handCardList.length - 1)) {
                lastSelectIndex = -1;
                console.log("此前索引到达最左侧，重置索引");
            }
        } else if (pattern === pokerPattern.AAABC) {
            console.log("三带二提示");
            console.log("prevCardValues:,",prevCardValues,"ilist:", JSON.stringify(ilist));
            console.log("ilist:", JSON.stringify(ilist));
            if (lastSelectIndex !== -1 && !hasNextTips) {
                // 如果没有下次提示，则重置索引
                lastSelectIndex = -1;
            } else {
                // 已选牌的最左侧开始算起
                lastSelectIndex = handCardList.length - 1 - ilist[2];
                console.log("lastSelectIndex:",lastSelectIndex);
            }
            hasNextTips = false;
        } else if (pattern === pokerPattern.ABCDE) {
            console.log("顺子提示");
            console.log("prevCardValues:,",prevCardValues,"ilist:", JSON.stringify(ilist), "lastSelectIndex:", lastSelectIndex, "hasNextTips:", hasNextTips);
            if (!hasNextTips) {
                // 如果没有下次提示，则重置索引
                lastSelectIndex = -1;
            } else {
                // 已选牌的最左侧开始算起
                lastSelectIndex = handCardList.length - 1 - ilist[0];
                console.log("lastSelectIndex:",lastSelectIndex);
            }
            hasNextTips = false;
        } else if (pattern === pokerPattern.AABBCCDD) {
            console.log("连对提示");
            console.log("prevCardValues:,",prevCardValues,"ilist:", JSON.stringify(ilist), "lastSelectIndex:", lastSelectIndex, "hasNextTips:", hasNextTips);
            if (!hasNextTips) {
                // 如果没有下次提示，则重置索引
                lastSelectIndex = -1;
            } else {
                // 已选牌的最左侧开始算起
                lastSelectIndex = handCardList.length - 1 - ilist[1];
                console.log("lastSelectIndex:",lastSelectIndex);
            }
            hasNextTips = false;        
        }

        // 处理提示出牌的卡牌弹起
        
        var tipsData = pdkgame.judgeHandCardsCanPlay(prevCardValues);
        dealSmartPlay(tipsData);
    }

    /**
     * 智能出牌，自动弹起提示出的牌
     * @param {*} tipsData
     */
    function dealSmartPlay(tipsData) {
        console.log("智能出牌处理");
        var id = "卡牌条目";
        if (tipsData && tipsData.canPlay) {
            var tipsCardValues = tipsData.cardValues;
            var tipsCardIndexes = tipsData.cardIndexes;
            console.log("提示出牌 -> tipsData:", JSON.stringify(tipsData));
            if (tipsCardIndexes && tipsCardIndexes.length > 0) {
                cancelSelectedCards();
                for (var i = 0; i < tipsCardIndexes.length; i++) {
                    var index = tipsCardIndexes[i];
                    selectCardAndPopup(id, index);
                }
                var pattern = analyzeCardPattern(tipsCardValues,true);
                setTimeout(() => {
                    var playBtn = API.getUI("出牌按钮");
                    playBtn.enabled = pattern===pokerPattern.NO?false:true;
                    console.log("出牌按钮设置可用");
                }, 200);
            }
        } else {
            console.log("提示出牌 -> tipsData: null");
        }
    }

    /**
     * 得到当前手牌的数量
     */
    function getHandCardLength() {
        return handCardList.length;
    }

    /**
     * 将相应范围的卡牌状态改变，变灰或者恢复正常 [from, to)
     * @param {*} from 从from开始，包括from
     * @param {*} to 到to结束，不包括to
     * @param {Boolean} disable true表示变灰，false表示恢复正常
     */
    function disableCards(from, to, disable = true) {
        if (from === to || (disable && (from === 0 && to === handCardList.length))) {
            return;
        }
        console.log("设置卡牌状态 -> from:", from, "to:", to, "disable:", disable);
        // 反转
        from = handCardList.length - from;
        to = handCardList.length - to;
        console.log("reverse 设置卡牌状态 -> from:", to, "to:", from, "disable:", disable);
        var res = API.data;
        var selectUI, selectId, cardUI, cardId;
        for (var i = to; i < from; i++) {
            selectId = "选择面" + "[" + i + "]";
            selectUI = $(selectId);
            selectUI.visible = disable;
            cardId = "卡牌条目[" + i + "]";
            cardUI = $(cardId);
            cardUI.enabled = !disable;
        }
    }

    /**
     * 判定手牌是否有符合牌型的牌可出
     * @param {*} prevCardValues 上家打的牌
     */
    function judgeHandCardsCanPlay(prevCardValues) {
        if (!prevCardValues || prevCardValues.length === 0) {
            return null;
        }
        console.log("judgeHandCardsCanPlay -> prevCardValues:", JSON.stringify(prevCardValues));
        var tipsData = {}; // 返回的结果数据
        var tipsCardValues = [],
            tipsCardIndexes = []; // 能打的卡牌值数组，卡牌索引数组
        var card, card1, card2, canPlay = false;
        var seqNum, sameNum, isSeq;
        var pureCard, pureCard1, pureCard2; // 不带花式的卡牌值
        var pattern = analyzeCardPattern(prevCardValues);
        // 王炸，无敌的存在
        if (pattern === pokerPattern.SS) {
            return null;
        }
        var handCardValues = getHandCardValues(); // 值在内部反转了，值从小到大排序
        console.log("handCardValues -> json:", JSON.stringify(handCardValues));
        // 初次判断, 小于4说明不带炸弹，而且牌型不匹配
        if (prevCardValues.length >= 4 && handCardValues.length < 4) {
            return null;
        }

        // 取消自己选择的牌
        cancelSelectedCards();

        // 得到相应牌值的牌数hash
        var prevHash = getSameHash(prevCardValues);
        var handHash = getSameHash(handCardValues);

        // 填充tipsCardIndexes, 从start开始填充seqNum个序列值，因为值反转了，索引也需要反转
        function fillTipsCardIndexes(start, seqNum = 1) {
            for (var i = 0; i < seqNum; i++) {
                // 索引反转
                tipsCardIndexes.push((handCardValues.length - 1) - (start + i));
            }
        }

        var isAskMax = pdkmanager.isNextPlayerAskMax();
        var increment = 1; // 循环的增量，为了动态处理禁用范围
        var disablePos = 0; // 禁用的起始索引
        var plength = prevCardValues.length;
        switch (plength) {
            case 1: // 单张
                if (pattern === pokerPattern.A) {
                    seqNum = 1;
                    card1 = prevCardValues[0];
                    pureCard1 = getCardPureValue(card1);
                    
                    if (isAskMax) { // 下家最大报单
                        var cidx = handCardValues.length - 1;
                        card2 = handCardValues[cidx];
                        pureCard2 = getCardPureValue(card2);
                        console.log("下家最大报单，cidx:", cidx, "card1:", card1, "card2:", card2);
                        if (pureCard2 > pureCard1) {
                            canPlay = true;
                            tipsCardValues.push(card2);
                            fillTipsCardIndexes(cidx);
                            disableCards(0, cidx);
                        }
                    } else {
                        for (var i = 0; i < handCardValues.length; i += increment) {
                            increment = 1;
                            card2 = handCardValues[i];
                            pureCard2 = getCardPureValue(card2);
                            sameNum = getSameNum(handHash, card2);
                            console.log("单张 card1:", pureCard1, "card2:", pureCard2, "sameNum:", sameNum, "seqNum:", seqNum, "i:", i, "lastSelectIndex:", lastSelectIndex);
                            
                            // 跳过已选择前面的索引
                            if (lastSelectIndex >= i && lastSelectIndex != (handCardValues.length - 1)) {
                                continue;
                            }
                            if (sameNum >= seqNum && pureCard2 > pureCard1) {
                                if (!canPlay) {
                                    canPlay = true;
                                    // disableCards(0, i);
                                    tipsCardValues.push(card2);
                                    fillTipsCardIndexes(i);
                                } else {
                                    hasNextTips = true;
                                }

                                // 只禁用第一次提示，后面再连续按提示不用处理
                                if (lastSelectIndex === -1) {
                                    // 禁用相应范围
                                    disableCards(disablePos, i);
                                    disablePos = i + sameNum;
                                }
                                // break;
                            } else if (sameNum >= 4) {
                                if (!canPlay) {
                                    canPlay = true;
                                    // disableCards(0, i);
                                    // 炸弹也要提示
                                    tipsCardValues = handCardValues.slice(i, i + sameNum);
                                    fillTipsCardIndexes(i, sameNum);
                                } else {
                                    hasNextTips = true;
                                }
                                
                                // 只禁用第一次提示，后面再连续按提示不用处理
                                if (lastSelectIndex === -1) {
                                    // 禁用相应范围
                                    disableCards(disablePos, i);
                                    disablePos = i + sameNum;
                                }
                                // break;
                            }
                            console.log("canPlay:", canPlay, "disablePos:", disablePos, "i:", i);
                            increment = sameNum;
                        }
                        if (lastSelectIndex === -1) {
                            // 禁用后面不满足的范围
                            disableCards(disablePos, handCardValues.length);
                        }
                    }
                }
                break;
            case 2: // 对子
                if (pattern === pokerPattern.AA) {
                    seqNum = 2;
                    card1 = prevCardValues[0];
                    pureCard1 = getCardPureValue(card1);
                    for (var i = 0; i < handCardValues.length; i += increment) {
                        increment = 1;
                        card2 = handCardValues[i];
                        pureCard2 = getCardPureValue(card2);
                        sameNum = getSameNum(handHash, card2);
                        // console.log("对子, sameNum:", sameNum, "seqNum:", seqNum, "pureCard2:", pureCard2, "pureCard1:", pureCard1, "lastSelectIndex:", lastSelectIndex, "i:", i);
                        if (sameNum >= seqNum && pureCard2 > pureCard1) {
                            if (!canPlay) {
                                canPlay = true;
                                // tipsCardValues = handCardValues.slice(i, i + seqNum);
                                // fillTipsCardIndexes(i, seqNum);
                                // break;
                            }
                            increment = sameNum; // 跳出已经处理的范围
                            // 跳过已选择前面的索引
                            if (lastSelectIndex >= i && lastSelectIndex != (handCardValues.length - seqNum)) {
                                continue;
                            } 
                   
                            // console.log("tipsCardValues.length:", tipsCardValues.length, "i:", i, "seqNum:", seqNum, "sameNum:", sameNum);
                            // 只取最近一次，后面的因为需要判断是否禁用不适合的，所以不能直接跳出循环
                            if (tipsCardValues.length === 0) {
                                tipsCardValues = handCardValues.slice(i, i + seqNum);
                                fillTipsCardIndexes(i, seqNum);
                            } else if (lastSelectIndex !== -1) {
                                // 还有提示
                                hasNextTips = true;
                            }

                            // 只禁用第一次提示，后面再连续按提示不用处理
                            if (lastSelectIndex === -1) {
                                // 禁用相应范围
                                disableCards(disablePos, i);
                            }
                            disablePos = i + sameNum;
                            // increment = sameNum; // 跳出已经处理的范围
                        }


                    }
                    if (lastSelectIndex === -1) {
                        // 禁用后面不满足的范围
                        disableCards(disablePos, handCardValues.length);
                    } else {
                        // console.log("disablePos:", disablePos, "length:", handCardValues.length, "selectIndex:", lastSelectIndex);
                    }
                }
                break;
            case 3: // 3条
                if (pattern === pokerPattern.AAA) {    // 最后打
                    seqNum = 3;
                    card1 = prevCardValues[0];
                    pureCard1 = getCardPureValue(card1);
                    for (var i = 0; i < handCardValues.length; i += increment) {
                        increment = 1;
                        card2 = handCardValues[i];
                        pureCard2 = getCardPureValue(card2);
                        sameNum = getSameNum(handHash, card2);
                        increment = sameNum;
                        if (sameNum >= seqNum && pureCard2 > pureCard1) {
                            canPlay = true;
                            tipsCardValues = handCardValues.slice(i, i + seqNum);
                            fillTipsCardIndexes(i, seqNum);
                            disableCards(0, i);
                            break;
                        }
                    }
                }
                break;
            case 4: // 炸弹, 3带1不需要判断，因为3带1只能最后一手打，打完就牌局结束了

                break;
            case 5: // 3带2, 单顺后面处理
                if (pattern === pokerPattern.AAABC) { // 3带2
                    seqNum = 3;
                    for (var k = 0; k < prevCardValues.length; k++) {
                        card = prevCardValues[k];
                        sameNum = getSameNum(prevHash, card);
                        if (sameNum === seqNum) {
                            card1 = card;
                            pureCard1 = getCardPureValue(card1);
                            break;
                        }
                    }
                    console.log("pre length:", prevCardValues.length, "hand length:", handCardValues.length);
                    for (var i = 0; i < handCardValues.length; i += increment) {
                        increment = 1;
                        card2 = handCardValues[i];
                        pureCard2 = getCardPureValue(card2);
                        sameNum = getSameNum(handHash, card2);
                        increment = sameNum; // 跳出已经处理的范围
                        // 判断炸弹是否可拆
                        if (sameNum >= 4 && !pdkmanager.canUnpackBomb()) {
                            continue;
                        }
                        if (sameNum >= seqNum && pureCard2 > pureCard1 && prevCardValues.length <= handCardValues.length) {
                            // canPlay = true;
                            if (!canPlay) {
                                canPlay = true;
                            }
                            // increment = sameNum; // 跳出已经处理的范围
                            // 跳过已选择前面的索引
                            if (lastSelectIndex >= i && lastSelectIndex != (handCardValues.length - seqNum)) {
                                continue;
                            }

                            if (tipsCardValues.length === 0) {
                                tipsCardValues = handCardValues.slice(i, i + seqNum);
                                fillTipsCardIndexes(i, seqNum);
                            } else if (lastSelectIndex !== -1) {
                                // 还有提示
                                hasNextTips = true;
                            }
                            // if (lastSelectIndex === -1) {
                            //     // 禁用相应范围
                            //     disableCards(disablePos, i);
                            // }
                            // disablePos = i + sameNum;
                            // tipsCardValues = handCardValues.slice(i, i + seqNum);
                            // fillTipsCardIndexes(i, seqNum);
                            // 处理后面附带的尾巴//只需提示AAA
                            // var addNum = 0;
                            // for (var j = 0; j < handCardValues.length; j++) {
                            //     if (j < i || j >= (i + seqNum)) {
                            //         tipsCardValues.push(handCardValues[j]);
                            //         fillTipsCardIndexes(j);
                            //         addNum += 1;
                            //     }
                            //     if (addNum === 2) { // 带的2
                            //         break;
                            //     }
                            // }
                            break;
                        }
                    }
                }
                break;
            case 6: // 4带2
                if (pdkmanager.can4With2() && pattern === pokerPattern.AAAABC) { // 4带2
                    seqNum = 4;
                    for (var k = 0; k < prevCardValues.length; k++) {
                        card = prevCardValues[k];
                        sameNum = getSameNum(prevHash, card);
                        if (sameNum === seqNum) {
                            card1 = card;
                            pureCard1 = getCardPureValue(card1);
                            break;
                        }
                    }

                    for (var i = 0; i < handCardValues.length; i++) {
                        card2 = handCardValues[i];
                        pureCard2 = getCardPureValue(card2);
                        sameNum = getSameNum(handHash, card2);
                        if (sameNum >= seqNum && pureCard2 > pureCard1) {
                            canPlay = true;
                            tipsCardValues = handCardValues.slice(i, i + seqNum);
                            fillTipsCardIndexes(i, seqNum);
                            // 处理后面附带的尾巴
                            var addNum = 0;
                            for (var j = 0; j < handCardValues.length; j++) {
                                if (j < i || j >= (i + seqNum)) {
                                    tipsCardValues.push(handCardValues[j]);
                                    fillTipsCardIndexes(j);
                                    addNum += 1;
                                }
                                if (addNum === 2) { // 带的2
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }
                break;
            case 7:
                if (pdkmanager.can4With3() && pattern === pokerPattern.AAAABCD) { // 4带3
                    seqNum = 4;
                    for (var k = 0; k < prevCardValues.length; k++) {
                        card = prevCardValues[k];
                        sameNum = getSameNum(prevHash, card);
                        if (sameNum === seqNum) {
                            card1 = card;
                            pureCard1 = getCardPureValue(card1);
                            break;
                        }
                    }

                    for (var i = 0; i < handCardValues.length; i++) {
                        card2 = handCardValues[i];
                        pureCard2 = getCardPureValue(card2);
                        sameNum = getSameNum(handHash, card2);
                        if (sameNum >= seqNum && pureCard2 > pureCard1) {
                            canPlay = true;
                            tipsCardValues = handCardValues.slice(i, i + seqNum);
                            fillTipsCardIndexes(i, seqNum);
                            // 处理后面附带的尾巴
                            var addNum = 0;
                            for (var j = 0; j < handCardValues.length; j++) {
                                if (j < i || j >= (i + seqNum)) {
                                    tipsCardValues.push(handCardValues[j]);
                                    fillTipsCardIndexes(j);
                                    addNum += 1;
                                }
                                if (addNum === 3) { // 带的3
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }
                break;
            case 8:
            case 9:
                break;
            case 10: // 飞机
            case 15: // 飞机
                if (pattern === pokerPattern.AAABBBCCDD) {
                    var sameNum1 = 0,
                        sameNum2 = 0,
                        sameNum3 = 0;
                    seqNum = 3;
                    for (var k = 0; k < prevCardValues.length; k += increment) {
                        increment = 1;
                        card = prevCardValues[k];
                        pureCard = getCardPureValue(card);
                        sameNum = getSameNum(prevHash, card);
                        if (sameNum >= seqNum) {
                            if ((k + sameNum) >= prevCardValues.length) {
                                break;
                            }
                            card1 = prevCardValues[k + sameNum];
                            pureCard1 = getCardPureValue(card1);
                            sameNum1 = getSameNum(prevHash, card1);
                            if (sameNum1 >= seqNum && pureCard === (pureCard1 - 1)) {
                                console.log("找到要匹配的飞机 -> card:", card, "sameNum:", sameNum);
                                break;
                            }
                            increment = sameNum;
                        }
                    }
                    isSeq = true;

                    var seqHow = plength === 10 ? 2 : 3; // 多少架飞机
                    for (var i = 0; i < handCardValues.length; i++) {
                        card2 = handCardValues[i];
                        pureCard2 = getCardPureValue(card2);
                        sameNum = getSameNum(handHash, card2);
                        if (sameNum >= seqNum && pureCard2 > pureCard) {
                            if ((i + sameNum) >= handCardValues.length) {
                                break;
                            }
                            var card3 = handCardValues[i + sameNum];
                            var pureCard3 = getCardPureValue(card3);
                            sameNum2 = getSameNum(handHash, card3);
                            if (sameNum2 >= seqNum && pureCard2 === (pureCard3 - 1)) {
                                if (seqHow === 2) { // 2架飞机
                                    canPlay = true;
                                    // 第一架，因为相同的卡牌可能大于seqNum, 所以分开算
                                    tipsCardValues = handCardValues.slice(i, i + seqNum);
                                    fillTipsCardIndexes(i, seqNum);
                                    console.log("第一架飞机 cardValues:", JSON.stringify(tipsCardValues), "cardIndexes:", JSON.stringify(tipsCardIndexes));
                                    // 第二架
                                    tipsCardValues = tipsCardValues.concat(handCardValues.slice(i + sameNum, i + sameNum + seqNum));
                                    fillTipsCardIndexes(i + sameNum, seqNum);
                                    console.log("第一架飞机 cardValues:", JSON.stringify(tipsCardValues), "cardIndexes:", JSON.stringify(tipsCardIndexes));
                                } else { // 3架飞机
                                    if ((i + sameNum + sameNum2) >= handCardValues.length) {
                                        break;
                                    }
                                    var card4 = handCardValues[i + sameNum + sameNum2];
                                    var pureCard4 = getCardPureValue(card4);
                                    sameNum3 = getSameNum(handHash, card4);
                                    if (sameNum3 >= seqNum && pureCard3 === (pureCard4 - 1)) {
                                        canPlay = true;
                                        // 第一架，因为相同的卡牌可能大于seqNum, 所以分开算
                                        tipsCardValues = handCardValues.slice(i, i + seqNum);
                                        fillTipsCardIndexes(i, seqNum);
                                        // 第二架
                                        tipsCardValues = tipsCardValues.concat(handCardValues.slice(i + sameNum, i + sameNum + seqNum));
                                        fillTipsCardIndexes(i + sameNum, seqNum);
                                        // 第三架
                                        tipsCardValues = tipsCardValues.concat(handCardValues.slice(i + sameNum + sameNum2, i + sameNum + sameNum2 + seqNum));
                                        fillTipsCardIndexes(i + sameNum + sameNum2, seqNum);
                                    }
                                }
                            }
                            if (canPlay) {
                                console.log("处理附带的尾巴 -> sameNum:", sameNum, "sameNum2:", sameNum2, "sameNum3:", sameNum3, "indexes:", JSON.stringify(tipsCardIndexes));
                                // 处理后面附带的尾巴
                                var addNum = 0;
                                for (var j = 0; j < handCardValues.length; j++) {
                                    var ridx = handCardValues.length - 1 - j;
                                    console.log("i:", i, "j:", j, "ridx:", ridx);
                                    if (tipsCardIndexes.indexOf(ridx) === -1) {
                                        // if (j < i || j >= (i + sameNum + sameNum2 + sameNum3)) {
                                        console.log("weiba :",handCardValues[j]);
                                        var pattern = analyzeCardPattern([handCardValues[j]],true);
                                        if(pattern!==pokerPattern.NO) {//尾巴是否炸弹Iris
                                            console.log("追加尾巴 -> j:", j);
                                            tipsCardValues.push(handCardValues[j]);
                                            fillTipsCardIndexes(j);
                                            addNum += 1;
                                        }

                                    }
                                    if (addNum === 2 * seqHow) { // 带的2
                                        break;
                                    }
                                }
                                // 不是炸弹，数量不同表示牌型不满足
                                if (tipsCardValues.length != prevCardValues.length) {
                                    canPlay = false;
                                }
                                break;
                            }
                        }
                    }
                }
                break;
        }

        var seqFlag = false;
        if (pattern === pokerPattern.ABCDE || pattern === pokerPattern.AABBCCDD) { // 单顺，双顺
            tipsData = judgeHandCardSeqPattern(pattern, prevCardValues, handCardValues);
            canPlay = tipsData ? tipsData.canPlay : false;
            if (canPlay) {
                seqFlag = true;
                console.log("顺子的处理 -> tipsData:", JSON.stringify(tipsData));
            }
            console.log("顺子判定 canPlay:", canPlay);
        }

        if (!canPlay) {
            if (pattern === pokerPattern.AAAA) { // 牌型是炸弹的判断，不管一副还是两副牌一同处理
                console.log("牌型是炸弹的处理，判断有没有更大的炸弹可使用");
                seqNum = prevCardValues.length;
                card1 = prevCardValues[0];
                pureCard1 = getCardPureValue(card1);
                for (var i = 0; i < handCardValues.length; i += increment) {
                    increment = 1;
                    card2 = handCardValues[i];
                    pureCard2 = getCardPureValue(card2);
                    sameNum = getSameNum(handHash, card2);
                    if (sameNum === seqNum && pureCard2 > pureCard1) {
                        if (!canPlay) {
                            canPlay = true;
                            tipsCardValues = handCardValues.slice(i, i + seqNum);
                            fillTipsCardIndexes(i, seqNum);
                        }
                        // 禁用相应范围
                        disableCards(disablePos, i);
                        disablePos = i + sameNum;
                        increment = sameNum; // 跳出已经处理的范围
                        // break;
                    } else if (sameNum > seqNum) { // 个数越多，炸弹越大
                        if (!canPlay) {
                            canPlay = true;
                            tipsCardValues = handCardValues.slice(i, i + sameNum);
                            fillTipsCardIndexes(i, sameNum);
                        }
                        // 禁用相应范围
                        disableCards(disablePos, i);
                        disablePos = i + sameNum;
                        increment = sameNum; // 跳出已经处理的范围
                        // break;
                    }
                }
                // 禁用后面不满足的范围
                disableCards(disablePos, handCardValues.length);
            } else { // 牌型不是炸弹的判断
                console.log("牌型不是炸弹的处理, 判断有没有炸弹可使用");
                increment = 1; // 循环的增量，为了动态处理禁用范围
                disablePos = 0; // 禁用的起始索引
                for (var i = 0; i < handCardValues.length; i += increment) {
                    increment = 1;
                    card = handCardValues[i];
                    sameNum = getSameNum(handHash, card);
                    if (sameNum >= 4) {
                        if (!canPlay) {
                            canPlay = true;
                            tipsCardValues = handCardValues.slice(i, i + sameNum);
                            fillTipsCardIndexes(i, sameNum);
                            console.log("card:", card, "sameNum:", sameNum, "i:", i, "canPlay:", canPlay);
                        }
                        // 禁用相应范围
                        disableCards(disablePos, i);
                        disablePos = i + sameNum;
                        increment = sameNum; // 跳出已经处理的范围
                        // break;
                    }
                }
                // 禁用后面不满足的范围
                disableCards(disablePos, handCardValues.length);
            }
        } else {
            console.log("将上面变灰的炸弹恢复正常, pattern:", pattern);
            if ((isAskMax && pattern === pokerPattern.A) || pattern === pokerPattern.AA) {
                // 将上面变灰的炸弹恢复正常
                for (var i = 0; i < handCardValues.length; i += increment) {
                    increment = 1;
                    card = handCardValues[i];
                    sameNum = getSameNum(handHash, card);
                    if (sameNum >= 4) {
                        // 将上面变灰的炸弹恢复正常
                        disableCards(i, i + sameNum, false);
                        increment = sameNum; // 跳出已经处理的范围
                    }
                }
            }
        }

        // 判断有没有4王炸
        if (pdkmanager.hasTwoPacks()) {
            var jokerNum = 0; // 大小王的数量
            for (var i = 0; i < handCardValues.length; i++) {
                card = handCardValues[i];
                if (isJokerCard(card)) {
                    jokerNum += 1;
                }
            }
            if (jokerNum === 4) { // 4王炸
                if (!canPlay) {
                    // 提示出4王炸
                    canPlay = true;
                    tipsCardValues = handCardValues.slice(handCardValues.length - jokerNum, handCardValues.length);
                    fillTipsCardIndexes(handCardValues.length - jokerNum, jokerNum);
                    disableCards(0, handCardValues.length - jokerNum); // 4王炸肯定是在最左侧
                } else {
                    // 前面有可打的牌，但也要将4王炸的状态恢复可选
                    disableCards(handCardValues.length - jokerNum, handCardValues.length, false);
                }
            }
        }

        if (!seqFlag) {
            tipsData = {
                pattern: pattern,
                canPlay: canPlay,
                cardValues: tipsCardValues,
                cardIndexes: tipsCardIndexes
            };
        }
        console.log("pattern:", pattern, "canPlay:", canPlay, "tipsData:", JSON.stringify(tipsData), "prevCardValues:", JSON.stringify(prevCardValues), "handCardValues:", JSON.stringify(handCardValues));

        return tipsData;
    }

    /**
     * 判定手牌的顺牌型
     */
    function judgeHandCardSeqPattern(pattern, prevCardValues, handCardValues) {
        var card, card1, card2, canPlay = false;
        var seqNum, sameNum, isSeq;
        var pureCard, pureCard1, pureCard2; // 不带花式的卡牌值
        var prevHash = getSameHash(prevCardValues);
        var handHash = getSameHash(handCardValues);
        var tipsCardValues = [],
            tipsCardIndexes = [];
        var pointSeqNum = 0; // 几连发

        // 判断手牌上的牌能不能组成相应长度的顺
        var keyNum = 0;
        Object.keys(handHash).forEach(function (key) {
            keyNum += 1;
        });
        if (keyNum < prevCardValues.length) {
            console.log("手牌不足以组成一副相应长度的顺, keyNum:", keyNum, "prev length:", prevCardValues.length);
            // return null;
        }

        // 填充tipsCardIndexes, 从start开始填充seqNum个序列值, 因为值反转了，索引也需要反转
        function fillTipsCardIndexes(start, seqNum = 1) {
            for (var i = 0; i < seqNum; i++) {
                // 索引反转
                tipsCardIndexes.push((handCardValues.length - 1) - (start + i));
            }
        }

        console.log("judgeHandCardSeqPattern");
        var increment = 1; // 循环的增量，为了动态处理禁用范围
        var disablePos = 0; // 禁用的起始索引
        var hasFill = false;  // 已经填充
        card1 = prevCardValues[0];
        pureCard1 = getCardPureValue(card1);
        seqNum = getSameNum(prevHash, card1);
        pointSeqNum = prevCardValues.length / seqNum; // 几连发
        for (var i = 0; i < handCardValues.length; i += increment) {
            increment = 1;
            card2 = handCardValues[i];
            pureCard2 = getCardPureValue(card2);
            sameNum = getSameNum(handHash, card2);

            if (!pdkmanager.hasTwoPacks() && pureCard2 > 14) { // 顺最大是10JQKA, 二副牌可连到2
                continue;
            }
            // 处理 顺
            console.log("pureCard2:", pureCard2, "pureCard1:", pureCard1, "hlength:", handCardValues.length, "i:", i, "plength:", prevCardValues.length, "pointSeqNum:", pointSeqNum);
            if (seqNum <= sameNum && pureCard2 > pureCard1 && (handCardValues.length - i) >= prevCardValues.length) {
                console.log("截取手牌来检测是不是顺, start:", i, "lastSelectIndex:", lastSelectIndex);
                increment = sameNum;
                // 跳过已选择前面的索引
                if (lastSelectIndex >= i) {
                    continue;
                } 
                // 不能拆炸弹
                if (sameNum >= 4 && !pdkmanager.canUnpackBomb()) {
                    continue;
                }
                var cardValues = handCardValues.slice(i);
                var cutPattern = analyzeSeqCardPattern(cardValues, handHash, seqNum, pointSeqNum, false);
                console.log("cutPattern:", cutPattern, "pattern:", pattern);
                if (cutPattern === pattern) {
                    canPlay = true;
                    if (hasFill) {
                        // 有下个提示
                        hasNextTips = true;
                        break;
                    }
                    // 因为传进来的cardValues, 有可能不是连续的顺，需要特殊处理，找到符合要求的顺出来
                    var currentSeqTimes = 0; // 当前的顺次数  aabb表示第2次; aabbcc表示第3次
                    var dynNum = seqNum;
                    for (var j = 0; j < cardValues.length; j += dynNum) {
                        card = cardValues[j];
                        pureCard = getCardPureValue(card);
                        sameNum = getSameNum(handHash, card);
                        dynNum = sameNum > seqNum ? sameNum : seqNum;
                        tipsCardValues = tipsCardValues.concat(cardValues.slice(j, j + seqNum));
                        fillTipsCardIndexes(i + j, seqNum);
                        // console.log("处理顺 -> tipsCardValues:", JSON.stringify(tipsCardValues), "cut:", JSON.stringify(cardValues.slice(j, j + seqNum)));
                        // console.log("indexes -> tipsCardIndexes:", JSON.stringify(tipsCardIndexes), "i+j:", (i+j))
                        currentSeqTimes += 1;
                        if (currentSeqTimes === pointSeqNum) {
                            console.log("截取了符合牌型的顺，退出检测程序");
                            hasFill = true;
                            break;
                        }
                    }
                    if (lastSelectIndex === -1) {
                    disableCards(0, i);
                    }
                    console.log("特殊处理的顺 -> tipsCardValues:", JSON.stringify(tipsCardValues), "tipsCardIndexes:", JSON.stringify(tipsCardIndexes), "hasNextTips:", hasNextTips);
                    // break;
                }
            }
        }
        return {
            pattern: pattern,
            canPlay: canPlay,
            cardValues: tipsCardValues,
            cardIndexes: tipsCardIndexes
        };
    }

    /**
     * 获取手牌的卡牌值数组, 值从小到大排序
     */
    function getHandCardValues() {
        var card, cardValues = [];
        for (var i = 0; i < handCardList.length; i++) {
            card = handCardList[i];
            cardValues.push(card.num);
        }
        cardValues.reverse(); // 值从小到大排序
        return cardValues;
    }

    /**
     * 分析已选择的卡牌牌型
     * @param cardValues 要分析的牌值数组
     * @param checkUnpackBomb 主要用来处理不可拆炸弹时的情况
     */
    function analyzeCardPattern(cardValues, checkUnpackBomb = false) {
        console.log("analyzeCardPattern -> cardValues:", JSON.stringify(cardValues), "checkUnpackBomb:", checkUnpackBomb);
        var pattern = pokerPattern.NO;
        var card, card1, card2, sameNum, sameNum1, sameNum2;
        var hash = getSameHash(cardValues);
        if (checkUnpackBomb && !pdkmanager.canUnpackBomb()) {
            var handCardValues = getHandCardValues();
            var handHash = getSameHash(handCardValues);
            for (var i = 0; i < cardValues.length; i++) {
                card = cardValues[i];
                sameNum1 = getSameNum(hash, card);
                sameNum2 = getSameNum(handHash, card);
                if (sameNum2 >= 4 && sameNum2 > sameNum1) {
                    console.log("analyzeCardPattern -> 不可拆炸弹, card:", card, "sameNum1:", sameNum1, "sameNum2:", sameNum2);
                    return pattern;
                }
            }
            ;
        }
        // 判断有没有4王炸
        if (pdkmanager.hasTwoPacks()) {
            var jokerNum = 0; // 大小王的数量
            for (var i = 0; i < cardValues.length; i++) {
                card = cardValues[i];
                if (isJokerCard(card)) {
                    jokerNum += 1;
                }
            }
            if (jokerNum === 4) { // 4王炸
                pattern = pokerPattern.SS;
                console.log("分析牌型 -> 王炸 pattern:", pattern);
                return pattern;
            }
        }

        console.log("卡牌长度:", cardValues.length);
        switch (cardValues.length) {
            case 1: // 单张
                pattern = pokerPattern.A;
                break;
            case 2: // 对子
                card = cardValues[0];
                sameNum = getSameNum(hash, card);
                if (sameNum === 2) {
                    pattern = pokerPattern.AA;
                }
                break;
            case 3: // 三条, 最后一手出牌才算牌型
                card = cardValues[0];
                sameNum = getSameNum(hash, card);
                if (sameNum === 3 && isFinalHand()) {
                    pattern = pokerPattern.AAA;
                }
                break;
            case 4: // 炸弹, 特例3带1
                card = cardValues[0];
                sameNum = getSameNum(hash, card);
                console.log("card:", card, "sameNum:", sameNum, "isFinalHand:", isFinalHand());
                if (sameNum === 4) { // 炸弹
                    pattern = pokerPattern.AAAA;
                } else if (sameNum === 3 && isFinalHand()) { // 3带1
                    pattern = pokerPattern.AAAB;
                } else if (sameNum === 1) { // 3带1
                    card = cardValues[1];
                    sameNum = getSameNum(hash, card);
                    console.log("card:", card, "sameNum:", sameNum);
                    if (sameNum === 3 && isFinalHand()) {
                        pattern = pokerPattern.AAAB;
                        break;
                    }
                }
                break;
            case 5: // 3带2, 单顺后面算
                for (var i = 0; i < cardValues.length; i++) {
                    card = cardValues[i];
                    sameNum = getSameNum(hash, card);
                    if (sameNum === 3) {
                        pattern = pokerPattern.AAABC;
                        break;
                    }
                }
                break;
            case 6: // 4带2, 连对单顺后面算
                if (pdkmanager.can4With2()) {
                    for (var i = 0; i < cardValues.length; i++) {
                        card = cardValues[i];
                        sameNum = getSameNum(hash, card);
                        if (sameNum === 4) { // 4带2
                            pattern = pokerPattern.AAAABC;
                            break;
                        }
                    }
                }
                break;
            case 7: // 4带3, 单顺后面算
                if (pdkmanager.can4With3()) {
                    for (var i = 0; i < cardValues.length; i++) {
                        card = cardValues[i];
                        sameNum = getSameNum(hash, card);
                        if (sameNum === 4) {
                            pattern = pokerPattern.AAAABCD;
                            break;
                        }
                    }
                }
                break;
            case 8: // 单顺，双顺，后面算
            case 9: // 单顺，三顺，后面算
                break;
            case 10: // 2架灰机带翅膀，单顺，双顺后面算
            case 15: // 3架灰机带翅膀，单顺后面算
                var increment = 1;    // 增量
                var seqNum = 3;
                var seqSameNum = 0;
                for (var i = 0; i < cardValues.length - seqNum; i += increment) {
                    increment = 1;
                    card = cardValues[i];
                    sameNum = getSameNum(hash, card);
                    card1 = cardValues[i + sameNum];
                    sameNum1 = getSameNum(hash, card1);
                    var pureValue = getCardPureValue(card);
                    var pureValue1 = getCardPureValue(card1);
                    console.log("飞机检测 -> card:", card, "card1:", card1, "sameNum:", sameNum, "sameNum1:", sameNum1);
                    if (sameNum === sameNum1 && sameNum === seqNum && (pureValue === (pureValue1 - 1))) {
                        if (pdkmanager.hasTwoPacks() || pureValue1 <= 14) { // 一副牌不能连到2，两副则可以
                            seqSameNum += 1;
                            increment = seqNum;
                            console.log("seqSameNum:", seqSameNum);
                        }
                    }
                }
                // 2架飞机的话长度要10，3架的话长度15
                if (((seqSameNum + 1) === 2 && cardValues.length === 10) || ((seqSameNum + 1) === 3 && cardValues.length === 15)) {
                    pattern = pokerPattern.AAABBBCCDD;
                }
                break;
            default:
                pattern = pokerPattern.NO;
                break;
        }

        if (cardValues.length > 4 && pdkmanager.hasTwoPacks()) { // 判断两副牌的炸弹
            card = cardValues[0];
            sameNum = getSameNum(hash, card);
            if (sameNum === cardValues.length) { // 炸弹
                pattern = pokerPattern.AAAA;
            }
        }

        if (pattern === pokerPattern.NO && cardValues.length >= 4) { // 计算是否是顺子
            pattern = analyzeSeqCardPattern(cardValues, hash);
        }
        console.log("分析牌型 -> pattern:", pattern);
        printSelectedCard(cardValues);

        // 判断是否首局先出黑桃3
        var isFirstDiscard = pdkmanager.isFirstDiscard;
        var canSpade3 = pdkmanager.canSpade3();
        console.log("isFirstDiscard",isFirstDiscard);
        if(isFirstDiscard && canSpade3){
            var flag=false;
            for(var i=0;i<cardValues.length;i++){
                if(cardValues[i] === 103){
                    flag = true;
                    console.log("含有黑桃3======",cardValues[i]);
                }
            }
            pattern = flag?pattern:-1;
            console.log("分析首局牌型 -> pattern:", pattern,"==>flag:",flag);
        }

        return pattern;
    }

    /**
     * 是否是最后一手, 手牌只有3张或4张
     */
    function isFinalHand() {
        return handCardList.length === 3 || handCardList.length === 4;
    }

    /**
     * 打印已选择的卡牌
     * @param {*} ilist
     */
    function printSelectedCard(cardValues) {
        console.log("已选择的卡牌, json:", JSON.stringify(cardValues));
    }

    /**
     * 分析是什么顺子。单顺，连对，或者三顺
     * @param {*} cardValues
     * @param {*} hash
     * @param {*} seqNum 指定什么顺
     * @param {*} pointSeqNum  指定的顺子数 334455， 表示3连发
     * @param {*} strictFlag 严谨标识，为true时cardValues的长度要与顺的长度一致
     */
    function analyzeSeqCardPattern(cardValues, hash, seqNum = 0, pointSeqNum = 0, strictFlag = true) {
        console.log("hash:", JSON.stringify(hash), "cardValues:", JSON.stringify(cardValues), "seqNum:", seqNum, "pointSeqNum:", pointSeqNum, "strictFlag:", strictFlag);
        var card, card1, card2, sameNum, sameNum2;
        var pattern = pokerPattern.NO;
        // var strictFlag = pointSeqNum === 0 ? true : false;
        strictFlag = pdkmanager.isLastRoundSelfPlay() ? false : strictFlag;
        
        var isSeq; // 顺子标识
        if (seqNum != 0) { // 指定什么顺，因为cardValeus传出来的长度不一定是顺的长度，所以不能直接用长度计算是什么顺
            isSeq = checkSeqNum(seqNum);
        } else { // 不指定什么顺，自己算
            // seqNum = 3;    // 多少顺
            // isSeq = checkSeqNum(seqNum);    // 3顺
            // if (!isSeq) {
            seqNum = 2;
            isSeq = checkSeqNum(seqNum); // 双顺
            // }
            if (!isSeq) {
                seqNum = 1;
                isSeq = checkSeqNum(seqNum); // 单顺
            }
        }

        if (isSeq && seqNum === 1 && pointSeqNum === 0) {
            // 单顺, 最少是5连顺
            pointSeqNum = 5;
        }

        console.log("isSeq:", isSeq, "seqNum:", seqNum, "length:", cardValues.length, "pointSeqNum:", pointSeqNum);
        if (isSeq) {
            if (strictFlag) {
                // 判断顺和卡牌组长度是否一致
                var count = 0;
                for (var i = 0; i < cardValues.length; i++) {
                    card = cardValues[i];
                    sameNum = getSameNum(hash, card);
                    if (sameNum !== seqNum) {
                        break;
                    }
                    count++;
                }
                if (count !== cardValues.length) {
                    console.log("strictFlag, break");
                    return pattern;
                }
            }
            // 卡牌值从小到大排
            var currentSeqTimes = 1;
            var dynNum = seqNum;
            for (var j = 0; j < (cardValues.length - seqNum); j += dynNum) {
                
                card1 = cardValues[j];
                sameNum = getSameNum(hash, card1);
                
                dynNum = sameNum > seqNum ? sameNum : seqNum;
                card2 = cardValues[j + dynNum];
                sameNum2 = getSameNum(hash, card2);
                console.log("card1:", card1, "card2:", card2, "sameNum:", sameNum, "dynNum:", dynNum, "currentSeqTimes", currentSeqTimes, "sameNum2:", sameNum2);

                // 不能拆炸弹
                if ((sameNum >= 4 || sameNum2 >= 4) && !pdkmanager.canUnpackBomb()) {
                    isSeq = false;
                    console.log("不可拆炸弹，不成顺子, card2:", card2);
                    break;
                }

                var pureValue1 = getCardPureValue(card1);
                var pureValue2 = getCardPureValue(card2);
                if (pureValue1 != (pureValue2 - 1) || (!pdkmanager.hasTwoPacks() && pureValue2 > 14)) { // 一副牌不能连到2，两副牌可连到2
                    console.log("pureValue1:", pureValue1, "pureValue2:", pureValue2);
                    break;
                }

                currentSeqTimes += 1;
                // if (pointSeqNum != 0 && (currentSeqTimes + 0) === pointSeqNum) {
                //     console.log("匹配到相应的顺牌型，跳出检测程序 result:");
                //     break;
                // }
            }
            if (pointSeqNum != 0 && ((currentSeqTimes + 0) < pointSeqNum || (strictFlag && cardValues.length !== pointSeqNum))) {
                isSeq = false;
                console.log("长度不符合相应顺子, currentSeqTimes", (currentSeqTimes + 0), "pointSeqNum:", pointSeqNum, "strictFlag:", strictFlag, "length:", cardValues.length);
            }
        }
        if (isSeq) { // 顺子
            if (seqNum === 3 || seqNum === 1) { // 顺子
                pattern = pokerPattern.ABCDE;
            } else { // 连对
                pattern = pokerPattern.AABBCCDD;
            }
        }

        // 判断是单顺，双顺，还是3顺
        function checkSeqNum(seqNum) {
            if (seqNum <= 0) {
                return false;
            }
            var increment = 0;
            var currentSeqTimes = 0;
            var isSeq = true;
            for (var i = 0; i < cardValues.length; i+= increment) {
                increment = 1;
                card = cardValues[i];
                sameNum = getSameNum(hash, card);
                console.log("check seq num -> card:", card, "sameNum:", sameNum, "seqNum:", seqNum, "currentSeqTimes:", currentSeqTimes, "pointSeqNum:", pointSeqNum);
                if (pointSeqNum != 0) {
                    // 用来判定手牌有没有满足的顺牌型，不严格
                    if (sameNum < seqNum) {
                        isSeq = false;
                        break;
                    }
                    currentSeqTimes += 1;
                    // 满足几连发，跳出循环
                    if (currentSeqTimes >= pointSeqNum) {
                        break;
                    }
                } else {
                    // 用来判定鼠标选择的卡牌组满不满足顺的要求，严格
                    if (sameNum != seqNum) {
                        isSeq = false;
                        break;
                    }
                }
                increment = sameNum;
            }
            if (pointSeqNum != 0 && currentSeqTimes < pointSeqNum) {
                isSeq = false;
            }

            return isSeq;
        }
        console.log("顺子 pattern:", pattern);
        return pattern;
    }

    // 根据hash, 卡牌值得到相同卡牌值的次数
    function getSameNum(hash, value) {
        if (!hash) {
            return 0;
        }
        var pureValue = getCardPureValue(value);
        return hash[pureValue];
    }

    // 得到相同卡牌值的次数hash
    function getSameHash(cardValues) {
        var hash = {},
            sameNum = 0;
        var pureValue;
        // 如果有相同的卡牌值则累计
        cardValues.forEach(function (value) {
            sameNum = 0;
            pureValue = getCardPureValue(value);
            if (hash[pureValue]) {
                sameNum = hash[pureValue];
            }
            sameNum += 1;
            hash[pureValue] = sameNum;
            // console.log("card value:", value, "sameNum:", sameNum);
        });
        return hash;
    }

    /**
     * 选择卡牌并弹出
     * @param {*} id
     * @param {*} index
     */
    function selectCardAndPopup(id, index) {
        selectCard(id, index);
        delaySelectPopup(id, index);
    }

    /**
     * 得到最右侧的卡牌索引
     */
    function getCardRightIndex() {
        return (handCardList.length - 1);
    }

    /**
     * 得到最左侧的卡牌索引
     */
    function getCardLeftIndex() {
        return 0;
    }

    /**
     * 取消当前卡牌选择
     */
    function cancelSelectedCards() {
        var id = "卡牌条目";
        var ilist = getSelectedCardIndexList();
        ilist.forEach(function (value) {
            unselectCard(id, value);
        });
        selectIndexes = [];
    }

    /**
     * 得到当前已选择的卡牌索引列表, 会按索引值从大到小排序，卡牌值从小到大排序
     */
    function getSelectedCardIndexList() {
        var ilist = [];
        for (var i = 0; i < selectIndexes.length; i++) {
            if (selectIndexes[i] > 0) {
                ilist.push(i);
            }
        }
        ilist.reverse(); // 索引值从大到小排，导致卡牌值则从小到大排
        return ilist;
    }

    /**
     * 是否有选择的卡牌
     */
    function hasSelectedCard() {
        var ilist = getSelectedCardIndexList();
        return ilist.length > 0;
    }

    /**
     * 开门见3
     */
    function startSeeSpade3() {
        var cardIndex = -1;
        if (pdkmanager.isFirstDiscard) {
            cardIndex = getSpade3Index();
            console.log("开门见3 -> cardIndex:", cardIndex);
        }
        return cardIndex;
    }

    /**
     * 得到黑桃3索引，没有则是-1
     */
    function getSpade3Index() {
        var card, cardIndex = -1;
        for (var i = 0; i < handCardList.length; i++) {
            card = handCardList[i];
            // console.log("card type:", card.type, "trick:", pokerTrick.BLACK, "value:", card.value, "pokerValue:", pokerValue[3]);
            if (card.type === pokerTrick.BLACK && card.value === parseInt(pokerValue[3])) {
                cardIndex = i;
                break;
            }
        }
        console.log("是否存在黑桃3 index:", cardIndex);
        return cardIndex;
    }

    /**
     * 出牌
     */
    function getPlayCardsData() {
        var canPlay = false;
        var card, cardValues = [],
            cardIndexes = [];
        for (var i = 0; i < handCardList.length; i++) {
            if (selectIndexes[i] > 0) {
                card = handCardList[i];
                cardValues.push(card.num);
                cardIndexes.push(i);
                canPlay = true;
            }
        }
        return {
            canPlay: canPlay,
            cardValues: cardValues,
            cardIndexes: cardIndexes
        };
    }

    /**
     * 选择卡牌
     *
     * @param {any} id
     * @param {any} index
     */
    function selectCard(id, index) {
        console.log("id:", id, "index:", index);
        var cardUI = $(id + "[" + index + "]");
        // 被禁用的跳过，不然会取消禁用，引擎的问题
        if (!cardUI.enabled) {
            return;
        }
        var selectUI = API.getUI("选择面" + "[" + index + "]");
        selectUI.visible = true;
        if (selectIndexes[index] > 0) {
            unselectCard(id, index);
        } else {
            selectIndexes[index] = 1;
            console.log("selectCard -> index:", index);
        }
    }

    /**
     * 取消选择卡牌
     *
     * @param {any} id
     * @param {any} index
     */
    function unselectCard(id, index) {
        selectIndexes[index] = -1;
        console.log("unselectCard -> index:", index);
        var cardUI = API.getUI(id + "[" + index + "]");
        if (cardUI.y != 0) {
            cardUI.y = 0;
        }
    }

    /**
     * 选择的卡牌弹出表现
     * @param {*} id
     * @param {*} i
     */
    function delaySelectPopup(id, i) {
        var cardUI = API.getUI(id + "[" + i + "]");
        console.log("cardui y:", cardUI.y, "选择的卡牌索引:", i);
        if (cardUI.y === 0) {
            setTimeout(() => {
                var selectUI = API.getUI("选择面" + "[" + i + "]");
                selectUI.visible = false;
            }, 30);
            cardUI.y -= 20;
        }
    }

    /**
     * 卡牌按下
     *
     * @param {any} id
     * @param {any} index
     */
    function pressDown(id, index) {
        console.log("press down -> id:", id, "index:", index);

        var selectedDict = {}; // 当前已选择
        var currentIndex = index;
        toSelectCard(currentIndex);
        var listLoc = API.getLocal("卡牌条目[0]");
        pressTimer = setInterval(function () {
            var stagex = Can.event.stageX;
            // console.log("clientx:", stagex);
            currentIndex = Math.floor((stagex - listLoc.x) / gapWidth);
            // console.log("currentIndex:", currentIndex, "handcard length:", handCardList.length, "flag: ", selectedDict[currentIndex]);
            currentIndex = currentIndex >= handCardList.length ? (handCardList.length - 1) : currentIndex;
            if (currentIndex >= 0 && !selectedDict[currentIndex]) {
                console.log("当前选择的索引，currentIndex:", currentIndex);
                toSelectCard(currentIndex);
            }
        }, 10);

        function toSelectCard(currentIndex) {
            selectedDict[currentIndex] = true;
            selectCard(id, currentIndex);
            // 播放音效
            pdkmanager.playSound("hitcard");
        }
    }

    /**
     * 卡牌按起
     *
     * @param {any} id
     * @param {any} index
     * @returns
     */
    function pressUp(id, index) {
        console.log("press up -> id:", id, "index:", index);
        clearInterval(pressTimer);
        var playBtn = API.getUI("出牌按钮");
        playBtn.enabled = false;
        // console.log("playBtn:", playBtn);

        for (var i = 0; i < selectIndexes.length; i++) {
            if (selectIndexes[i] > 0) {
                (function (id, i) {
                    delaySelectPopup(id, i);
                })(id, i);
            } else if (selectIndexes[i] === -1) {
                console.log("selected index:", i);
                var selectUI = API.getUI("选择面" + "[" + i + "]");
                selectUI.visible = false;
            }
        }

        setTimeout(() => {
            var cardValues = [];
            var slist = getSelectedCardIndexList();
            var llist = pdkmanager.getPrevPlayCardValues();
            console.log("getPrevPlayCardValues==llist:",llist);
            slist.forEach(function (ivalue) {
                var card = handCardList[ivalue];
                cardValues.push(card.num);
            });
            var pattern = analyzeCardPattern(cardValues, true);
            var patternPrev = analyzeCardPattern(llist, true);
            var isAskMax = pdkmanager.isNextPlayerAskMax();
            console.log("patternPrev:",patternPrev,"pattern:", pattern, "isAskMax:", isAskMax);
            // 判断下家最大报单的情况
            if (pattern === pokerPattern.A && isAskMax) {
                var index = slist[0];
                if (index != 0) { // 不是最大的卡牌则不满足条件, 最左侧为最大的卡牌
                    console.log("下家最大报单，需要出最大的牌或者对子 -> index:", index, "max index:", (handCardList.length - 1));
                    pattern = pokerPattern.NO;
                }
            }

            if (patternPrev === pokerPattern.NO) {
                if(pattern != pokerPattern.NO)playBtn.enabled = true;
            } else if (pattern === patternPrev) {
                var canPlay = canPatternPlay(llist, cardValues);
                if (canPlay) {
                    playBtn.enabled = true;
                }
            } else if (pattern === pokerPattern.SS || pattern === pokerPattern.AAAA) {
                playBtn.enabled = true;
            }


        }, 30);
    }

    /**
     * 检测卡牌是否可以打
     */
    function canPatternPlay(prevCardValues, cardValues) {
        var pattern1 = analyzeCardPattern(prevCardValues, true);
        var pattern2 = analyzeCardPattern(cardValues, true);
        if (pattern2 === pokerPattern.NO) {
            return false;
        }
        if (pattern2 === pokerPattern.SS || (pattern1 !== pokerPattern.AAAA && pattern2 === pokerPattern.AAAA)) {
            return true;
        }
        console.log("canPatternPlay, prevCardValues:", prevCardValues, "cardValues:", cardValues);
        var card, card1, card2;      // 带花式的卡牌值
        var pureCard, pureCard1, pureCard2; // 不带花式的卡牌值
        var sameNum, sameNum1, sameNum2;    // 相同卡牌的数量
        var prevHash = getSameHash(prevCardValues);
        var handHash = getSameHash(cardValues);
        var canPlay = false;
        switch (pattern1) {
            case pokerPattern.AAABC:
                var keys1 = Object.keys(prevHash);
                for (var i = 0; i < keys1.length; i++) {
                    pureCard1 = parseInt(keys1[i]);
                    sameNum1 = getSameNum(prevHash, pureCard1);
                    if (sameNum1 === 3) {
                        break;
                    }
                }
                var keys2 = Object.keys(handHash);
                for (var j = 0; j < keys2.length; j++) {
                    pureCard2 = parseInt(keys2[j]);
                    sameNum2 = getSameNum(handHash, pureCard2);
                    console.log("pureCard2:", pureCard2, "sameNum2:", sameNum2, "pureCard1:", pureCard1, "flag:", (pureCard2 > pureCard1));
                    if (sameNum2 === 3) {
                        if (pureCard2 > pureCard1) {
                            canPlay = true;
                        }
                        break;
                    }
                }
                break;
        }
        console.log("canPatternPlay, canPlay:", canPlay, "pureCard1:", pureCard1, "pureCard2:", pureCard2);
        return canPlay;
    }

    /**
     * 设置扑克手牌数据
     *
     * @param {any} cardList
     * @returns
     */
    function setHandCards(cardList) {
        if (!cardList || cardList.length === 0) {
            return;
        }

        cardList.reverse();
        var handList = [],
            deskList = [];
        for (var i = 0; i < cardList.length; i++) {
            var card = cardList[i];
            pokerBuildCardUrl(card);
            if (!card.hasPlayed) {
                handList.push(card); // 手牌
            } else {
                deskList.push(card); // 桌牌
            }
        }


        // 手牌处理
        var res = API.data;
        // res["cardList"] = handList;
        $("卡牌列表").value = handList;
        // API.update("卡牌列表");
        $("卡牌列表").visible = true;
        console.log("handList.length:", handList.length);
        var isPreventCard = pdkmanager.isPreventCard();
        if(isPreventCard&&deskList.length==0){
            if(res.userID != res.playCardId){
                $("卡牌列表").visible = false;
                var mlist =[];
                for (var i = 0; i < cardList.length; i++) {
                    mlist.push({
                        "bcard": "pork_bg"
                    });
                }
                $("卡牌容器").add("myCardList");
                $("myCardList").value = mlist;
            }
        }


        console.log("手牌列表:", JSON.stringify(handList));
        console.log("桌牌列表:", JSON.stringify(deskList));
        // 卡牌坐标居中(卡牌列表与容器保持不动，卡牌项居中，方便后面打牌后卡牌移动处理)
        var cardsWidth = (handList.length - 1) * gapWidth + cardWidth;
        var cardCnt = API.getUI("卡牌容器");
        var startX = (cardCnt.width - cardsWidth) / 2; // 起点坐标
        console.log("cards w:", cardsWidth, "cnt w:", cardCnt.width, "startx:", startX);
        // 叠卡牌
        for (var j = 0; j < handList.length; j++) {
            var card = API.getUI("卡牌条目[" + j + "]");
            card.x = startX + gapWidth * j;
            card.y = 0;

            // 得到中心的卡牌坐标
            if (j === Math.floor(handList.length / 2)) {
                centerPosx = card.x;
                console.log("center posx:", centerPosx);
            }
        }
        if(handList.length>20){
            cardCnt.appendStyle({
                left:"50C"
            });
        }



        handCardList = handList;

        // 桌牌处理， 当前出牌人不显示上个桌牌列表
        if (res.userID != res.playCardId) {
            res["deskList1"] = deskList;
            API.update("桌牌列表1")
            // 重新布局桌牌列表
            layoutDeskList(deskList, 1);
            console.log("更新桌牌列表1", "json:", JSON.stringify(deskList));
        }

        var plist, playerInfo;
        for (var k = 2; k <= 4; k++) {
            playerInfo = res["playerInfo" + k];
            // 当前出牌人不显示上个桌牌列表
            if (!playerInfo || playerInfo.userID === res.playCardId) {
                continue;
            }
            plist = res["player" + k] || [];
            plist.forEach(function (card) {
                pokerBuildCardUrl(card);
            });
            res["deskList" + k] = plist;
            API.update("桌牌列表" + k);
            // 重新布局桌牌列表
            layoutDeskList(plist, k);
            console.log("更新桌牌列表" + k, "json:", JSON.stringify(plist));
        }
    }

    /**
     * 设置桌牌列表
     * @param {*} cardList
     * @param {*} playUserId
     */
    function setDeskCards(cardList, playUserId) {
        if (!cardList || cardList.length === 0) {
            return;
        }
        console.log("设置桌牌列表");
        var res = API.data;
        var card, plist = [];
        var playIndex = 0;
        for (var i = 1; i <= 4; i++) {
            var playerInfo = res["playerInfo" + i];
            if (!playerInfo) {
                continue;
            }
            // console.log("i:", i, "playerInfo:", JSON.stringify(playerInfo), "playUserId:", playUserId);
            if (playerInfo.userID === playUserId) {
                playIndex = i;
                cardList.forEach(function (cardNo) {
                    card = {
                        num: cardNo,
                        value: cardNo % 100, // 去掉花式的牌面值
                        type: parseInt(cardNo / 100), // 花式
                    };
                    pokerBuildCardUrl(card);
                    plist.push(card);
                });
                res["deskList" + i] = plist;
                var deskId = "桌牌列表" + i;
                API.update(deskId);
                console.log("更新桌牌列表" + i, "json:", JSON.stringify(plist));
                break;
            }
        }
        // 重新布局桌牌列表
        layoutDeskList(plist, playIndex);

    }

    /**
     * 将桌牌列表居中
     */
    function layoutDeskList(plist, playIndex) {
        if (!plist || plist.length === 0) {
            return;
        }
        console.log("playIndex:", playIndex, "plist length:", plist.length);
        // 叠卡牌
        for (var j = 0; j < plist.length; j++) {
            var card = API.getUI("桌牌条目" + playIndex + "[" + j + "]");
            card.x = (gapWidth - 10) * j;
            card.y = 0;
        }
        // 列表坐标居中
        var cardsWidth = (plist.length - 1) * (gapWidth - 10) + cardWidth;
        var cardCnt = API.getUI("桌牌容器" + playIndex);
        var listUI = API.getUI("桌牌列表" + playIndex);
        console.log("cards w:", cardsWidth, "cnt w:", cardCnt.width, "playIndex:", playIndex, "listx:", listUI.x, "cardCntx:", cardCnt.x);

        // 缩放
        var scalev = pdkmanager.getPlayCardScale();
        // listUI.scaleX = scalev;
        // listUI.scaleY = scalev;
        
        if (playIndex === 4) {
            listUI.x = -(plist.length - 1) * (gapWidth - 10) * scalev;
        } else if (playIndex === 1 || playIndex === 3) {
            listUI.x = (cardCnt.width - cardsWidth) / 2; // 居中
        }
        console.log("桌牌列表scale:", scalev, "list width:", listUI.width, "x:", listUI.x);
    }

    /**
     * 处理已打的卡牌列表
     */
    function procPlayedCards() {
        var playData = pdkmanager.currentPlayData;
        if (!playData) {
            return;
        }
        console.log("currentPlayData:", JSON.stringify(playData));
        // 提示数据重置
        hasNextTips = false;
        lastSelectIndex = -1;
        // 选择的索引清空
        selectIndexes = [];

        var cardValues = playData.cardValues;
        var cardIndexes = playData.cardIndexes;
        // 消除打出的牌
        var elim = new Promise(function (resolve, reject) {
            var deleteIndex;
            var playedHash = {};

            var mtime = 240;
            var perTime = 40;
            var currentTime = 0;

            var card;
            var count = mtime/perTime;
            var tpoints = [], speeds = [];
            var deskList = $("桌牌列表1");
            var deskCnt = $("桌牌容器1");
            var cardCnt = $("卡牌容器");
            deskList.visible = false;
            var px = deskCnt.x + deskList.x - cardCnt.x - 0; // 居中
            var py = -216;
            console.log("px:", px, "py:", py, "cntx:", cardCnt.x, "listx:", deskList.x);
            var scalev = 0.7;
            var scale0 = (1 - scalev)/count;
            for (var i = 0; i < cardIndexes.length; i++) {
                deleteIndex = cardIndexes[i];
                card = API.getUI("卡牌条目[" + deleteIndex + "]");
                card.enabled = false;
                // card.visible = false;
                playedHash[deleteIndex] = true;
                console.log("删除卡牌 -> index:", deleteIndex, "value:", cardValues[i]);
                // move(cardUI, px + gapWidth*i, py);
                var tx = px + (gapWidth - 10)*i;
                var ty = py;
                var x0 = tx - card.x;
                var y0 = ty - card.y;
                var dis = Math.sqrt(x0*x0 + y0*y0);
                var v = dis/count;
                var spx = x0*v/dis;
                var spy = y0*v/dis;
                tpoints[i] = {x: tx, y: ty};
                speeds[i] = {spx: spx, spy: spy};
                console.log("deleteIndex:", deleteIndex, "tx:", tx, "ty:", ty);
            }

            var passCardTimer = setInterval(function () {
                currentTime += perTime;
                for (var i = 0; i < cardIndexes.length; i++) {
                    deleteIndex = cardIndexes[i];
                    card = API.getUI("卡牌条目[" + deleteIndex + "]");
                    var speed = speeds[i];
                    card.x += speed.spx;
                    card.y += speed.spy;
                    card.scaleX -= scale0;
                    card.scaleY -= scale0;
                    // console.log("move x:", card.x, "y:", card.y, "spx:", spx, "spy:", spy);
                }
                if (currentTime >= mtime) {
                    clearInterval(passCardTimer);
                    for (var i = 0; i < cardIndexes.length; i++) {
                        deleteIndex = cardIndexes[i];
                        card = API.getUI("卡牌条目[" + deleteIndex + "]");
                        // var target = tpoints;
                        // card.x = target.x;
                        // card.y = target.y;
                        card.scaleX = scalev;
                        card.scaleY = scalev;
                    }
                    $("桌牌列表1").visible = true;
                    setTimeout(() => {
                        console.log("消除完成，开始重新布局");
                        resolve(playedHash);
                    }, 100);
                }
            }, perTime);
        });

        // 布局剩余的牌
        function layout(playedHash) {
            return new Promise(function (resolve, reject) {
                var cardUI, hasPlayed;
                var posArr = [];
                var clength = handCardList.length;
                // 删除已打的牌
                for (var k = clength - 1; k >= 0; k--) {
                    hasPlayed = playedHash[k];
                    if (!hasPlayed) {
                        cardUI = API.getUI("卡牌条目[" + k + "]");
                        posArr.unshift(cardUI.x); // 向第一个索引添加
                    } else {
                        handCardList.splice(k, 1);
                    }
                }
                // 更新列表使卡牌索引正确，更新会导致列表卡牌叠在同一个地方(不是弹性盒)
                var res = API.data;
                res["cardList"] = handCardList;
                API.update("卡牌列表");
                var cardUI;
                console.log("handCardList.length:", handCardList.length, "hash:", JSON.stringify(playedHash), "posArr:", JSON.stringify(posArr));

                if (handCardList.length === 0) {
                    reject();
                    return;
                }

                // 重新将卡牌按原来的布局
                for (var i = 0; i < handCardList.length; i++) {
                    cardUI = API.getUI("卡牌条目[" + i + "]");
                    cardUI.x = posArr[i];
                    cardUI.y = 0;
                }

                var mtime = 240;
                var perTime = 40;
                var currentTime = 0;
                var disx, originX, targetX;
                var disArr = [];
                var layoutTimer = setInterval(function () {
                    currentTime += perTime;
                    var half = Math.floor(handCardList.length / 2);
                    // 左向中间
                    for (var i = half; i >= 0; i--) {
                        cardUI = API.getUI("卡牌条目[" + i + "]");
                        if (!cardUI) {
                            console.log("卡牌为空，index:", i, "json:", JSON.stringify(handCardList));
                            clearInterval(layoutTimer);
                            console.log("布局移动完成，开始更新");
                            resolve();
                            break;
                        }
                        disx = disArr[i];
                        if (!disx) {
                            originX = posArr[i];
                            // console.log("left default x:", originX, "cardUIx:", cardUI.x);
                            targetX = centerPosx - (half - i) * gapWidth;
                            disx = (targetX - originX) / (mtime / perTime);
                            disArr[i] = disx;
                            cardUI.x = originX + disx;
                        } else {
                            cardUI.x += disx;
                        }
                        cardUI.y = 0;
                        cardUI.enabled = true;
                        // console.log("left moving -> index:", i, "disx:", disx, "cardx:", cardUI.x);
                    }
                    // 右向中间
                    for (var j = half + 1; j < handCardList.length; j++) {
                        cardUI = API.getUI("卡牌条目[" + j + "]");
                        if (!cardUI) {
                            console.log("卡牌为空，index:", j, "json:", JSON.stringify(handCardList));
                            clearInterval(layoutTimer);
                            console.log("布局移动完成，开始更新");
                            resolve();
                            break;
                        }
                        disx = disArr[j];
                        if (!disx) {
                            originX = posArr[j];
                            // console.log("right default x:", originX);
                            targetX = centerPosx + (j - half) * gapWidth;
                            disx = (targetX - originX) / (mtime / perTime);
                            disArr[j] = disx;
                            cardUI.x = originX + disx;
                        } else {
                            cardUI.x += disx;
                        }
                        cardUI.y = 0;
                        cardUI.enabled = true;
                        // console.log("right moving -> index:", j, "disx:", disx, "cardx:", cardUI.x);
                    }

                    if (currentTime >= mtime) {
                        clearInterval(layoutTimer);
                        console.log("布局移动完成，开始更新");
                        resolve();
                    }
                }, perTime);
            });
        }

        elim.then(layout).then(function () {
            console.log("手牌列表:", JSON.stringify(handCardList));
            pdkmanager.currentPlayData = null;
        }).catch(function () {
            console.log("牌局结束");
        });
    }

    /**
     * 清除桌面
     */
    function clear() {
        var res = API.data;
        res["cardList"] = [];
        API.update("卡牌列表");
        for (var i = 1; i <= 4; i++) {
            res["deskList" + i] = [];
            API.update("桌牌列表" + i);

            var notPlayUI = API.getUI("notPlay" + i);
            if(notPlayUI)
            notPlayUI.visible = false;
        }
        hasInit = false;

        console.log("pdk game clear");
        // 清除特效
        pdkmanager.stopEffect(0);
    }

    return {
        init: init, // 初始化
        pressDown: pressDown, // 选择扑克按下
        pressUp: pressUp, // 选择扑克按起
        setHandCards: setHandCards, // 设置扑克手牌数据
        setDeskCards: setDeskCards, // 设置扑克桌牌数据
        getPlayCardsData: getPlayCardsData, // 获取要打的牌
        auxiliaryPlayTips: auxiliaryPlayTips, // 辅助出牌提示
        procPlayedCards: procPlayedCards, // 处理已打的牌
        analyzeCardPattern: analyzeCardPattern, // 分析牌型
        judgeHandCardsCanPlay: judgeHandCardsCanPlay, // 判定手牌是否有可出的牌型
        clear: clear, // 清除桌面
        getHandCardLength: getHandCardLength, // 得到当前手牌的数量
        getHandCardValues: getHandCardValues, // 得到当前手牌的牌值数组
        dealSmartPlay: dealSmartPlay, // 处理智能出牌，自动弹出提示的牌
        cancelSelectedCards: cancelSelectedCards, // 取消已选择的卡牌
    };
})(API, pdkmanager);

// -------------------------- 发送请求 --------------------------- //

// 提示出牌
function onPlayTipsClick() {
    pdkmanager.auxiliaryPlayTips();

    // pdkmanager.playCardPatternEffect(7, 4);
}

// 智能出牌, 不需要按提示出牌则自动弹出提示出牌
function onSmartPlayClick() {
    var res = API.data;
    var smartv = $("智能出牌").value; // 1: 智能出牌；0: 非智能出牌
    res["智能出牌"] = smartv;
    console.log("智能出牌设置 -> smartv:", smartv);
}

// 出牌大小处理(大, 中，小 -> 0.8, 0.7, 0.6)
function onCardSizeClick(scalev) {
    var res = API.data;
    var json = ["","出牌大小1","出牌大小2","出牌大小3"];
    setCookie("scalev",scalev);
    for (var a = 1; a < json.length; a++) {
        API.getUI(json[a]).value = 0;
    }
    API.getUI(json[scalev]).value = scalev;

    res["出牌大小"] = cardSizeScale[scalev];
    console.log("出牌大小设置 -> scalev:", cardSizeScale[scalev],"scalev:",scalev);
}


/**
 * 出牌
 * 1008
 * @param {*} playData {canPlay, cardValues, cardIndexes}
 */
Game.requestPlayCard = function (playData) {
    if (!playData) {
        playData = pdkmanager.getPlayCardsData();
    }
    if (!playData || !playData.canPlay) {
        console.log("没有牌可以出");
        return;
    }
    var playCardValues = playData.cardValues;
    WS.socket.send(WS.writeMessage(1008, null, function (writer) {
        writer.writeShort(playCardValues.length);
        for (var i = 0; i < playCardValues.length; i++) {
            var card = playCardValues[i];
            writer.writeInt(card);
        }
    }));
    pdkmanager.currentPlayData = playData;
    console.log("跑得快出牌 -> 1008, json:", JSON.stringify(playData), "length:", playCardValues.length);
}

/**
 * 程序判断自动过牌
 * 1033
 */
Game.requestUserPass = function () {
    // 因为可能有连续的几个要不起，前端作个延迟处理
    var timeout = pdkmanager.playerNum === 2 ? 1500 : 1000;
    setTimeout(() => {
        var flag = 1;
        WS.socket.send(WS.writeMessage(1033, null, function (writer) {
            writer.writeByte(flag);
        }));
        console.log("过牌 -> 1033, flag:", flag);
    }, timeout);
}

// ------------------------- 返回响应 ---------------------------- //

/**
 * 出牌推送响应
 * 1008
 * @param {*} d
 */
Game.onPlayCard_notify = function (d) {
    var res = {};
    res.userId = d.readLong();
    var playNum = d.readShort();
    var n = getPosById(res.userId);
    API.data["playerInfo" + n].handCardNum = API.data["playerInfo" + n].handCardNum - playNum;
    console.log('玩家牌数' + n, API.data["playerInfo" + n].handCardNum, playNum);
    API.update('玩家牌数' + n);
    var cards = [];
    for (var i = 0; i < playNum; i++) {
        cards[i] = d.readInt();
    }
    res.cards = cards;
    res.isOneCard = d.readBoolean(); // 最后一张，需要出最大的
    console.log("出牌推送 1008 -> json:", JSON.stringify(res));

    pdkmanager.isFirstDiscard = false;
    if(API.getUI("myCardList")){
        $("myCardList").visible = false;
        $("卡牌列表").visible = true;

    }

    API.data.askMaxDict[res.userId] = res.isOneCard; // 是否为最后一张
    console.log("res userId:", res.userId, "userId:", API.data.userID, "cards:", res.cards);
    // 将当前打牌的玩家记录下来，有上家要不起时判别用
    pdkmanager.lastPlayerUserId = res.userId;
    // 将当前打的牌记录下来
    pdkmanager.lastPlayerPlayCardValues = res.cards;
    // 设置桌牌列表
    pdkmanager.setDeskCards(res.cards, res.userId);
    // 处理手牌
    if (res.userId === API.data.userID) {
        pdkmanager.procPlayedCards();
        API.getUI("出牌按钮容器").visible = false;
    }
    // 播放特效
    pdkmanager.checkCardPatternEffect(res.cards, res.userId);
    // 播放音效
    var playerInfo = pdkmanager.getPlayerInfo(res.userId);
    var pattern = pdkmanager.analyzeCardPattern(res.cards);
    pdkmanager.playSound(res.cards, playerInfo.sex, pattern);
    if (res.isOneCard) {
        pdkmanager.playSound("WARN", playerInfo.sex);
        var pos = pdkmanager.getPlayerPos(res.userId);
        pdkmanager.playEffect(1, pos);    // 警报灯
    }
}

/**
 * 要不起广播
 * 1033
 * @param {*} d
 */
Game.onUserPass_notify = function (d) {
    var userId = d.readLong();
    console.log("要不起 -> 1033, userId:", userId, "selfId:", API.data.userID);
    // 消除上一个出牌闹钟
    pdkmanager.stopAlarmClock();
    var res = API.data;
    for (var i = 1; i <= 4; i++) {
        var playerInfo = res["playerInfo" + i];
        if (playerInfo && playerInfo.userID === userId) {
            var notPlayUI = API.getUI("notPlay" + i);
            notPlayUI.visible = true;
            setTimeout(() => {
                notPlayUI.visible = false;
            }, 1000);
            console.log("要不起位置:", i);
            pdkmanager.updatePlayCardValues(null, userId);

            // 播放音效
            var random = Math.floor(Math.random() * 3);
            pdkmanager.playSound("pass" + random, playerInfo.sex);
            break;
        }
    }
}

// ------------------------- 特效处理 -------------------------- //

/**
 * 检测出牌牌型, 满足则播放相关特效
 * @param {*} cardValues
 * @param {*} playUserId
 */
PdkManager.prototype.checkCardPatternEffect = function (cardValues, playUserId) {
    var pattern = pdkmanager.analyzeCardPattern(cardValues);
    console.log("checkCardPatternEffect -> pattern:", pattern);
    var playerInfo;
    var res = API.data;
    for (var i = 1; i <= 4; i++) {
        playerInfo = res["playerInfo" + i];
        if (playerInfo && playerInfo.userID === playUserId) {
            pdkmanager.playCardPatternEffect(pattern, i);
            break;
        }
    }
}

/**
 * 播放牌型特效
 * @param {*} pattern
 * @param {*} pos
 */
PdkManager.prototype.playCardPatternEffect = function (pattern, pos = 1) {
    console.log("playCardPatternEffect -> pattern:", pattern, "pos:", pos);
    var str = "effectRect";
    // 清除掉上一个播放特效
    lastEffect = pdkmanager.lastCardPatternEffect;
    if (lastEffect && lastEffect.visible) {
        console.log("清除上一个牌型播放特效");
        // lastEffect.visible = false;
        hide(str);
        API.timer.remove("cardPatternEffect");
    }

    var url;
    var airFlag = false;     // 飞机标识
    switch (pattern) {
        case pokerPattern.AABBCCDD: // 连对
            url = "eff_liandui";
            break;
        case pokerPattern.ABCDE: // 顺子
            url = "eff_shunzi";
            break;
        case pokerPattern.AAA: // 三条
            url = "cardPatterm5";
            break;
        case pokerPattern.AAAB: // 3带1
            url = "cardPatterm8";
            break;
        case pokerPattern.AAABC: // 3带2
            url = "eff_sandaier";
            break;
        case pokerPattern.AAAABC: // 4带2
            url = "cardPatterm9";
            break;
        case pokerPattern.AAAABCD: // 4带3
            url = "cardPatterm10";
            break;
        case pokerPattern.AAABBBCCDD: // 飞机
            url = "eff_feiji";
            airFlag = true;
            break;
        case pokerPattern.AAAA:    // 炸弹
        case pokerPattern.SS:      // 4王炸
            pdkmanager.playEffect(2, pos);
            break;
    }
    if (!url) {
        return;
    }

    show(str);
    if (pos > 2 && !airFlag) { // 位置3，4的在右侧

        console.log("url::::",url.substring(0,3));
        if(url.substring(0,3)=="eff")
        url += "_right";

    }
    console.log("url:", url, "str:", str);
    var effect = API.getUI(str);
    pdkmanager.lastCardPatternEffect = effect;
    var params = {};
    if (pos === 1) {
        params.left = 200;
        params.top = 300;
    } else if (pos === 2) {
        params.left = 0;
        params.top = 90;
        if (airFlag) {
            params.left += 0;
            params.top += 50;
        }
    } else if (pos === 3) {
        params.left = 650;
        params.top = 60;
        if (airFlag) {
            params.left += 400;
            params.top += 30;
        }
    } else {
        params.left = 950;
        params.top = 90;
        if (airFlag) {
            params.left += 400;
            params.top += 50;
        }
    }

    if (!airFlag) {
        params.width = 349;
        params.height = 279;
    } else {
        params.scaleX = (pos === 3 || pos === 4) ? -1 : 1;    // 飞机没有右向左的资源，程序反转
        params.width = 495;
        params.height = 254;
    }
    effect.appendStyle(params);
    console.log("effect:", effect);

    effect.alpha = 0.2;
    effect.visible = true;

    var res = API.data;
    res[str] = url;
    API.update(str);

    var currentFrame = 0;
    var times = 8;
    var dis = pos > 2 ? -50 : 50;
    API.timer.play(2, times, function () {
        currentFrame += 1;
        effect.x += dis;
        if (effect.alpha < 1) {
            effect.alpha += 0.2;
        }
        if (currentFrame > 5) {
            effect.alpha -= 0.2;
        }

        console.log("frame exec -> x:", effect.x, "y:", effect.y, "current frame:", currentFrame);
    }, function () {
        console.log("card pattern effect had play completed -> alpha:", effect.x);
        // effect.visible = false;
        res[str] = null;
        API.update(str);
        hide(str);
        API.timer.remove("cardPatternEffect");
    }, false, "cardPatternEffect");
}

// 序列帧标识集，还在执行中的序列帧 {占位图id: true}
var frameEffectFlags = {};

/**
 * 播放序列帧特效
 * @param {*} id 占位图id
 * @param {*} prefixName 序列帧资源前缀
 * @param {*} frame 多少帧执行一次
 * @param {*} count 执行多少次
 * @param {*} params 参数信息 {left, top, width, height}
 * @param {*} loop 是否循环
 * @param {*} addition 附加图片(特殊处理，在特效后面几帧附加另外一张图片)
 */
function playSimpleFrameEffect(id, prefixName, frame = 4, count = 8, params = null, loop = false, addition = false) {
    console.log("playSimpleFrameEffect -> id:", id, "prefixName:", prefixName, "frame:", frame, "count:", count, "loop:", loop, "addition:", addition);
    if (id === "effectRect") {
        var lastEffectId = pdkmanager.lastSimpleFrameEffectId;
        if (lastEffectId) {
            stopSimpleFrameEffect(lastEffectId);    // 因为是多个特效共用一个特效框，播放前先清空原来的
            pdkmanager.lastSimpleFrameEffectId = id;
            console.log("lastEffectId:", lastEffectId, "newId:", id);
        }
    }

    var currentCount = 0;
    var res = API.data;
    frameEffectFlags[id] = true;
    show(id);
    res[id] = null;
    API.update(id);
    var effectUI = $(id);
    if (!effectUI) {
        return;
    }
    if (params) {
        effectUI.appendStyle(params);
        console.log("effect params:", JSON.stringify(params));
    }
    console.log("effectUI:", effectUI);

    API.timer.play(frame, count, function () {
        currentCount += 1;
        res[id] = prefixName + currentCount;
        API.update(id);
        if (currentCount === count) {
            currentCount = 0;
        } else if (currentCount === (count - 2)) {
            if (addition) {
                var addId = id + "_add";
                show(addId);
                var addUI = $(addId);
                console.log("addId:", addId, "addUI:", addUI);
                res[addId] = prefixName + "add";
                API.update(addId);
                addUI.x = effectUI.x + (effectUI.width - addUI.width) / 2 - 10;
                addUI.y = effectUI.y;
                console.log("effect width:", effectUI.width, "height:", effectUI.height);
            }
        }
        // console.log("simple frame effect -> url:", (prefixName + currentCount));
    }, function () {
        currentCount = 0;
        stopSimpleFrameEffect(id, addition);
    }, loop, "simpleFrameEffect_" + id);
}

/**
 * 停止序列帧特效播放
 * @param {*} id
 */
function stopSimpleFrameEffect(id, addition = false) {
    console.log("stopSimpleFrameEffect -> id:", id);
    if (frameEffectFlags[id]) {
        console.log("destroy -> ", id);
        API.timer.remove("simpleFrameEffect_" + id);

        delete frameEffectFlags[id];
        var res = API.data;
        res[id] = null;
        update(id);

        // 附加图
        // if (addition) {
        res[id + "_add"] = null;
        update(id + "_add");
        // }
    }
    hide(id);
    hide(id + "_add");
}

/**
 * 播放部分特效
 * @param {*} type 特效类型 1: 警报类 2: 炸弹 3: 全关 4: 失败 5: 胜利
 * @param {*} pos 位置索引
 */
PdkManager.prototype.playEffect = function (type, pos = 1) {
    var params;
    var coordlist;
    switch (type) {
        case 1:    // 警报灯
            coordlist = [[0, 0], [150, "100B"], [50, 130], ["110R", 40], ["50R", 130]];
            params = {
                left: coordlist[pos][0],
                top: coordlist[pos][1],
                width: 60,
                height: 60
            };
            playSimpleFrameEffect("alarmLamp" + pos, "eff_baodan_", 4, 2, params, true);
            break;
        case 2:    // 炸弹
        case 3:    // 全关
            coordlist = [[0, 0], ["0C", "170B"], [100, 100], ["0C", 60], ["100R", 100]];
            params = {
                left: coordlist[pos][0],
                top: coordlist[pos][1],
                width: 388,
                height: 355
            };
            if (type === 2) {
                playSimpleFrameEffect("effectRect", "eff_boom_", 4, 6, params, false, true);
            } else {
                playSimpleFrameEffect("effectRect", "eff_quanguan_", 5, 5, params, false, true);
            }
            break;
        case 4:    // 失败
        case 5:    // 成功
            params = {
                left: "0C",
                top: 100,
                width: 444,
                height: 381
            };
            playSimpleFrameEffect("winLoseEffect", (type === 4 ? "eff_shu_" : "eff_ying_"), 5, 5, params, false);
            break;
    }
}

/**
 * 停止播放特效
 * @param {*} type
 */
PdkManager.prototype.stopEffect = function (type) {
    console.log("stopEffect -> type:", type);
    if (type === 0) {
        clearAlarmLamp();
        stopSimpleFrameEffect("winLoseEffect");
        stopSimpleFrameEffect("effectRect");
        return;
    }
    if (type === 1) {    // 警报灯
        clearAlarmLamp();
    } else if (type === 4 || type === 5) {     // 胜负
        stopSimpleFrameEffect("winLoseEffect");
    } else {
        stopSimpleFrameEffect("effectRect");
    }
}

/**
 * 清除警报特效
 */
function clearAlarmLamp() {
    for (var i = 1; i <= 4; i++) {
        stopSimpleFrameEffect("alarmLamp" + i);
    }
}

