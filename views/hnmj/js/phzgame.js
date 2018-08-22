// 大厅处理函数
function phzInit() {
    
    // 发送1001
    Game.requestEnterRoom();
    // 默认背景
    setWindowBg(1, 1);
    // 剩余卡数
    updateCardNum(80);

    var res = API.data;
    // 卡牌样式（大小，字体）卡牌资源名字构成: 卡牌选择(l, s) + 字体选择(1, 2, 3) + "_" + 卡牌值(小写: 1, 2, 3...; 大写: 10, 11, 12...) * 牌面选择(scale: 1.2, 1.0)
    var fontv = 1;
    var sizev = 1;
    var scalev = 1;
    var eyev = 1;
    var langv = "cd";
    var speedv = 1;
    res["字体选择"] = fontv;
    res["卡牌选择"] = sizev === 1 ? "l" : "s"; // 1: 大; 2: 小; 手牌或桌牌弃牌的大小区别
    res["牌面选择"] = scalev === 1 ? 1.2 : 1.0;  // 1: 大，scale为1.2；2: 小, scale为1.0
    res["护眼选择"] = eyev;   // 冷暖风格，1冷，2暖
    res["语言选择"] = langv;  // 语言 cd, pth
    res["速度选择"] = (speedv === 1 ? 300 : (speedv === 2 ? 200 : 100));  // 毫秒
    console.log("phzInit fontv:", fontv, "sizev:", sizev, "scalev:", scalev, "langv:", langv, "speedv:", speedv);
}

/**
 * 构建ui显示的卡牌url
 * @param {*} card 相应的卡牌
 * @param {*} sizeStr 卡牌选择大小: l or s; 不传则按 res["卡牌选择"] 取值
 */
function buildCardUrl(card, sizeStr) {
    var res = API.data;
    // 卡牌样式（大小，字体）卡牌资源名字构成: 卡牌选择(l, s) + 字体选择(1, 2, 3) + "_" + 卡牌值(小写: 1, 2, 3...; 大写: 10, 11, 12...) * 牌面选择(scale: 1.2, 1.0)
    var fontv = res["字体选择"];
    var sizev = sizeStr || res["卡牌选择"];
    var value = card.value;
    if (card.isBig && card.value <= 10) {
        value = card.value + 10;
    }
    var str = sizev + fontv + "_" + value;

    var eyev = res["护眼选择"];
    card.hue = eyev === 1 ? "" : (sizev === "l" ? "big" : "small");
    // console.log("card hue:", card.hue);
    return str;
}

/**
 * 构建卡牌的背景
 * @param {*} card 
 */
function buildCardBg(card) {
    var res = API.data;
    // 卡牌样式（大小，字体）卡牌资源名字构成: 卡牌选择(l, s) + 字体选择(1, 2, 3) + "_" + 卡牌值(小写: 1, 2, 3...; 大写: 10, 11, 12...) * 牌面选择(scale: 1.2, 1.0)
    var fontv = res["字体选择"];
    var sizev = res["卡牌选择"];
    card.cardBg = card.isDark ? (sizev + fontv + "_disable_front") : "";
}

// 更新剩余卡数
function updateCardNum(num) {
    var res = API.data;
    res.cardsNum = num || 80;
    API.update("剩余几张");
}

// 设置桌面背景。value: 1，2，3分别代表3种背景 eye: 1, 冷色调 2，暖色调
function setWindowBg(value, eye) {
    // 桌牌风格+护眼类型决定哪张图片
    var src = "pbg" + (eye > 1 ? "_huyan" : "") + value;
    console.log("src:", src, "eye:", eye);
    // 跑胡子桌面背景
    API.data.pbg = src;
    API.update("游戏桌面背景");
    // 卡托
    API.data.cardBottom = "hezi";
    API.update("剩余牌数");
    // 常德信息图标
    API.data.cdDesc = "cdDesc" + value;
    API.update("短描述");
}

// ui动态切换桌面背景
function changeWindowBg() {
    var desk = API.getUI("牌桌背景1").value + API.getUI("牌桌背景2").value + API.getUI("牌桌背景3").value;
    var eyev = API.getUI("护眼选择1").value + API.getUI("护眼选择2").value;
    var res = API.data;
    res["牌桌选择"] = desk;
    res["护眼选择"] = eyev;
    setWindowBg(desk, eyev);

    // 卡托, 剩余牌数
    var cardBottom = desk == 1 ? "hezi" : "hezi" + desk;
    API.data.cardBottom = cardBottom;
    API.update("剩余牌数");

    // 更新卡牌冷暖风格
    if (manager.eyev != eyev) {
        manager.eyev = eyev;
        manager.updateCardStyle();
    }
}

// 更新卡牌样式（大小，字体）卡牌资源名字构成: 卡牌选择(l, s) + 字体选择(1, 2, 3) + "_" + 卡牌值(小写: 1, 2, 3...; 大写: 10, 11, 12...)
function updateCardStyle() {
    var fontv = API.getUI("字体选择1").value + API.getUI("字体选择2").value + API.getUI("字体选择3").value; // 字体选择
    var sizev = 1;  // 卡牌选择
    var scalev = API.getUI("牌面选择1").value + API.getUI("牌面选择2").value; // 牌面选择
    var res = API.data;
    res["字体选择"] = fontv;
    res["卡牌选择"] = sizev === 1 ? "l" : "s"; // 1: 大; 2: 小
    res["牌面选择"] = scalev === 1 ? 1.2 : 1.0; // 1: scale 1.2; 2: scale 1.0
    console.log("更新卡牌样式 -> fontv:", fontv, "sizev:", sizev, "scalev:", scalev);
    if (manager.fontv != fontv) {
        manager.fontv = fontv;
        manager.updateCardStyle();
    }
}

// 更新卡牌牌面大小
function updateCardScale() {
    var scalev = API.getUI("牌面选择1").value + API.getUI("牌面选择2").value; // 牌面选择
    var res = API.data;
    res["牌面选择"] = scalev === 1 ? 1.2 : 1.0;  // 1: 大; 2: 小
    manager.updateCardScale();
}

// 展示玩家信息
function showPlayerInfo(pos) {
    console.log("show player info -> pos:", pos);
    var player = manager.getPlayerByPos(pos);
    if (!player) {
        return;
    }
    API.showUI("屏蔽遮罩1");
    API.showUI("个人主页");
    var res = API.data;
    res["nickName"] = player.name;
    res["playerId"] = player.accountId;
    res["playerIP"] = player.ip;
    res["headIcon"] = player.iconUrl;
    API.update(...["玩家昵称", "玩家ID", "玩家IP", "玩家头像"]);
}

// 玩法六十番，八十番规则。六十番只显示 请允许臭胡 ，八十番下面的规则都显示
var srules = ["允许臭胡", "带四七红", "停胡8番", "大团圆", "行行息", "背靠背", "耍猴8番", "黄番2倍"];
// 玩法展示
function showPlayTypeInfo() {
    console.log("show play type info");
    API.showUI("屏蔽遮罩1");
    API.showUI("游戏玩法面板");
    var res = API.data;
    res["playTypeName"] = manager.roomData.playTypeName;
    res["playSubTypeName"] = manager.roomData.playSubTypeName;
    res["round"] = manager.roomData.roundTotal;
    var json = res["玩法设置"];
    var setting = JSON.parse(json);
    // [局数，tab页玩法类型，选项数量，for [玩法，规则，充囤]]
    var phz = JSON.parse(setting.PHZ);
    console.log("setting:", json, "phz:", phz);
    // 规则
    var ruleIndex = 5;  // 规则开始的索引
    var ruleNum = phz[ruleIndex];
    console.log("rule num:", ruleNum, "ruleIndex:", ruleIndex, "phz len:", phz.length);
    ruleIndex += 1;
    var ruleArr = [];
    var moreFlag;  // 规则太多的标识
    for (var i = 0; i < ruleNum; i++) {
        var rule = srules[phz[ruleIndex] - 1];  // 保存的规则的值是从1开始的，所以-1
        // 太多规则了，屏蔽掉
        if (ruleArr.length >= 1) {
            moreFlag = true;
            break;
        }
        ruleArr.push(rule);
        console.log("规则:", rule, "pos:", ruleIndex);
        ruleIndex += 1; 
    }
    var ruleStr = ruleArr.join("、");
    // 太多规则
    if (moreFlag) {
        ruleStr += "等";
    }
    res["rules"] = ruleStr;
    console.log("选择的规则:", ruleStr);
    // 充囤
    var tuoIndex = phz.length - 3;
    var tuo = phz[tuoIndex];
    res["tuo"] = tuo;
    API.update(...["房间", "局数", "玩法", "规则", "充囤"]);
}

// 设置tab切换
function switchSettingTab() {
    var ui1 = API.getUI("画面tab容器"),
        ui2 = API.getUI("声音tab容器"),
        ui3 = API.getUI("牌面tab容器");
    var tab = API.getUI("画面tab").value + API.getUI("声音tab").value + API.getUI("牌面tab").value;
    if (tab === 1) {
        ui1.visible = true;
        ui2.visible = ui3.visible = false;
    } else if (tab === 2) {
        ui2.visible = true;
        ui1.visible = ui3.visible = false;
    } else {
        ui3.visible = true;
        ui1.visible = ui2.visible = false;
    }
    console.log("switchSettingTab tab:", tab);
}

// 重设亮张容器
function resetLightCardCnt() {
    for (var i=1; i<=3; i++) {
        API.getUI("亮张容器" + i).visible = false;
    }
}

// 关闭UI
function closeUI() {
    API.hideUI("游戏桌面2");
    API.hideUI("游戏桌面");
}

// 返回大厅
function back2Hall() {
    API.update("数值组");
    closeUI();
    if (valueOfServerType(WS.serverID) == 4) {
        API.load("bin/club.json");
    } else {
        API.load("bin/app.json");
    }
}

// 语言切换, 1: 常德; 2: 普通话
function switchLanguage() {
    var langv = API.getUI("语言选择1").value + API.getUI("语言选择2").value; // 语言选择
    var res = API.data;
    res["语言选择"] = langv === 1 ? "cd" : "pth";
    console.log("langv:", langv, "语言:", res["语言选择"]);
}

// 速度切换, 1: 0.3; 2: 0.2; 3: 0.1
function switchSpeed() {
    var speedv = API.getUI("速度选择1").value + API.getUI("速度选择2").value + API.getUI("速度选择3").value;
    var res = API.data;
    res["速度选择"] = (speedv === 1 ? 300 : (speedv === 2 ? 200 : 100));  // 毫秒
    console.log("speedv:", speedv, "速度:", res["速度选择"]);
}

// 提7偎6跑5碰2吃3过(弃)4邵阳-龙9邵阳-开招(坎跑)10
var soundActionMap = {
    // 1: "hu",
    2: "peng",
    3: "chi",
    5: "pao",
    6: "wei",
    7: "ti",
    9: "long",
    // 10: "pao"
    103: "bi"   // 比牌 
}

/**
 * 播放打牌音效  phz_cdm_peng
 * @param {*} value "peng", "hu"
 * @param {*} sex 0, 1
 * @param {*} langFlag 有没有语言的选项 cd: 常德; pth: 普通话
 * @param {*} repeat 是否循环播放
 */
function playSound(value, sex, langFlag = true, repeat = 0) {
    var url = "";
    var res = API.data;
    var langv = res["语言选择"];
    if (langFlag) {  // 
        if (sex === 0) {  // 女
            url += langv + "w_"; 
        } else if (sex === 1) {  // 男
            url += langv + "m_";
        }
    }
	API.playSound(url + value, repeat);
    console.log("播放的声音 url:", (url + value), "repeat:", repeat, "langFlag:", langFlag, "sex:", sex);
}

// ------------------------------------- game manager -------------------------------- //

// 跑胡子管理类
function PhzManager() {
    this.playerNum = 3;        // 该局玩家人数
    this.isReady = false;      // 是否准备好了
    this.roomData;             // 房间数据
    this.canPlayCard = false;  // 是否出牌
    this.eatGroups;            // 吃比牌卡组
    this.resultData;           // 结算数据
    this.playedCard;           // 已打出的牌，用于处理弃牌
    this.isGameRunning;        // 游戏是否已开始
    this.fontv;                // 当前的卡牌字体
    this.sizev;                // 当前的卡牌选择大小
    this.scalev;               // 当前的卡牌牌面大小
    this.eyev;                 // 冷暖色调
    this.cardNum;              // 剩余几张牌
    this.lastDealTimer;        // 上个出牌倒计时

    var accountId;
    Object.defineProperties(this, {
        // accountId
        "myAccountID": {
            get: function () {
                return accountId;
            },
            set: function (newValue) {
                accountId = newValue;
                console.log("my account id setter:", newValue);
            }
        },
        // userId
        "myUserID": {
            get: function () {
                return API.data.userID;
            }
        },
        // 房间玩家
        "players": {
            get: function () {
                return this.roomData.players;
            }
        },
        // 当前玩家是否为房主
        "isRoomOwner": {
            get: function () {
                console.log("isRoomOwner -> myUsrId:", this.myUserID, "roomOwner:", this.roomData.roomOwner.roleId);
                return this.myUserID === this.roomData.roomOwner.roleId;
            }
        }
    })
}

/**
 * 清理
 */
PhzManager.prototype.clear = function () {
    pgame.clear();
}

/**
 * 隐藏出牌或者隐藏亮张
 */
PhzManager.prototype.hideLightCard = function () {
    resetLightCardCnt();
}

/**
 * 得到房主
 */
PhzManager.prototype.getRoomOwner = function () {
    var player = this.getPlayer(this.roomData.roomOwner.accountId);
    return player;
}

/**
 * 根据accountId找到相应的玩家
 * @param {*} accountId 
 */
PhzManager.prototype.getPlayer = function (accountId) {
    var result;
    var players = this.roomData.players;
    for (var i=0; i<players.length; i++) {
        var player = players[i];
        console.log("player acc:", player.accountId, "acc:", accountId);
        if (player.accountId === accountId) {
            result = player;
            break;
        }
    }
    return result;
}

/**
 * 根据玩家位置得到相应的玩家信息
 */
PhzManager.prototype.getPlayerByPos = function (pos) {
    var result;
    var players = this.roomData.players;
    for (var i=0; i<players.length; i++) {
        var player = players[i];
        console.log("getPlayerByPos pos:", player.pos, "arg pos:", pos);
        if (player.pos === pos) {
            result = player;
            break;
        }
    }
    return result;
}

/**
 * 加入房间的新玩家, 会给玩家设定一个UI界面上的位置, 庄家视角：第二个玩家的位置是3(下家)，自己的位置是2，第三个玩家的位置是1(上家)(左，下，右)。非庄家视角：房主位置是1(上家), 第3个玩家的位置是3(下家)
 * @param {*} player 
 */
PhzManager.prototype.addNewPlayer = function (player) {
    var length = this.roomData.players.length;
    if (manager.isRoomOwner) {    // 第一个开房的为庄家
        // 庄家视角
        if (length === 1) {
            player.pos = 3;    // 第2个玩家是下家 
        } else if (length === 2) {
            player.pos = 1;    // 第3个玩家是上家
        }
    } else {
        // 非庄家视角
        if (length === 2) {
            player.pos = 3;    // 第3个是下家
        }
    }
    var existFlag = false;
    var players = this.roomData.players;
    for (var i = 0; i < length; i++) {
        var rplayer = players[i];
        if (rplayer.accountId === player.accountId) {
            existFlag = true;
            console.log("离线的玩家重装加入房间");
            break;
        }
    }

    if (!existFlag) {
        console.log("新加入的玩家", player.roleId, "pos:", player.pos);
        this.roomData.players.push(player);
    }
}

/**
 * 玩家是否为庄家
 * @param {*} userId 
 */
PhzManager.prototype.isBanker = function (accountId) {
    var result = false;
    var players = this.roundData.players;
    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        if (player.accountId === accountId) {
            result = player.isBanker;
            break;
        }
    }
    return result;
}

/**
 * 得到庄家
 */
PhzManager.prototype.getBanker = function () {
    var result;
    var players = this.roundData.players;
    players.forEach(function (player) {
        if (player.isBanker) {
            result = player;
            return result;
        }
    });
    return result;
}

/**
 * 亮张或者出牌
 * @param {*} card 
 * @param {*} player 
 */
PhzManager.prototype.showCard = function (card, player) {
    pgame.showCard(card, player);
}

/**
 * 删除卡牌映射
 * @param {*} cardId 
 */
PhzManager.prototype.deleteCard = function (cardId) {
    pgame.deleteCard(cardId);
}

/**
 * 设置手牌卡组数据 
 * @param {*} handGroups 
 */
PhzManager.prototype.setHandGroups = function (handGroups) {
    pgame.setHandGroups(handGroups);
}

/**
 * 设置桌牌卡组数据
 * @param {*} desktopGroups 
 */
PhzManager.prototype.setDesktopGroups = function (desktopGroups, player) {
    pgame.setDesktopGroups(desktopGroups, player);
}

/**
 * 设置弃牌数据
 * @param {*} discards 
 * @param {*} player 
 */
PhzManager.prototype.setDiscards = function (discards, player) {
    pgame.setDiscards(discards, player);
}

/**
 * 增加手牌
 * @param {*} handGroups 
 * @param {*} player 
 */
PhzManager.prototype.appendHandGroups = function (handGroups, player) {
    pgame.appendHandGroups(handGroups, player);
}

/**
 * 新增桌牌卡组
 * @param {*} appendGroups 
 * @param {*} player  有位置索引的player
 */
PhzManager.prototype.appendDesktopGroups = function (appendGroups, player) {
    pgame.appendDesktopGroups(appendGroups, player);
}

/**
 * 新增弃牌
 */
PhzManager.prototype.appendDiscards = function (discards, player) {
    pgame.appendDiscards(discards, player);
}

/**
 * 重设手牌数据
 */
PhzManager.prototype.resetHandGroups = function (newHandGroups) {
    pgame.resetHandGroups(newHandGroups);
}

/**
 * 刷新卡牌换肤(设置功能)
 */
PhzManager.prototype.updateCardStyle = function () {
    pgame.updateCardStyle();
}

/**
 * 更新卡牌牌面大小(设置功能)
 */
PhzManager.prototype.updateCardScale = function () {
    pgame.updateCardScale();
}

/**
 * 开始播放玩家头像回合特效
 * @param {*} pos 
 */
PhzManager.prototype.startPlayCardEffect = function (pos) {
    this.stopPlayCardEffect();
    var frameId = "玩家容器" + pos;
    var loc = API.getLocal(frameId);
    var effectId = "playCardEffect";
    var effectUI = API.getUI(effectId);
    effectUI.x = loc.x - 22;
    effectUI.y = loc.y - 24;
    effectUI.visible = true;
    console.log("该玩家回合特效, pos:", pos);
}

/**
 * 停止播放玩家头像回合特效
 */
PhzManager.prototype.stopPlayCardEffect = function () {
    API.getUI("playCardEffect").visible = false;
}

/**
 * 开始出牌倒计时
 * @param {*} pos 
 */
PhzManager.prototype.startDealTimer = function (pos) {
    console.log("出牌倒计时, pos:", pos);
    this.clearDealTimer();
    playSound("phz_dida", false);
    var res = API.data;
    var count = 10;
    console.log("开始出牌倒计时");
    var uiId = "出牌倒计时" + pos;
    API.getUI(uiId).visible = true;
      
    var timer = setInterval(function () {
        // console.log("出牌倒计时, count:", count-1);
        res["dealDigit" + pos] = "deal_" + (count-1);
        API.update(uiId);
        count --; 
        if (count === 0) {
            clearInterval(timer);
        }
    }, 1000);
    manager.lastDealTimer = timer;

    this.startPlayCardEffect(pos);

    // 开始倒计时
    // API.timer.play(24, 10, function () {
    //     console.log("出牌倒计时, count:", count-1);
    //     res["dealDigit" + pos] = "deal_" + (count-1);
    //     API.update(uiId);
    //     count --; 
    // }, function () {
    //     console.log("出牌倒计时结束, count:", count);
    //     // API.timer.remove("dealTimer");
    // }, false);
}

/**
 * 停止出牌倒计时, 数字0会保留
 */
PhzManager.prototype.stopDealTimer = function () {
    // API.timer.remove("dealTimer");
}

/**
 * 只显示出牌倒计时的0
 * @param {*} pos 
 */
PhzManager.prototype.showDealZero = function (pos) {
    var uiId = "出牌倒计时" + pos;
    API.getUI(uiId).visible = true;
    var res = API.data;
    res["dealDigit" + pos] = "deal_0";
    API.update(uiId);
}

/**
 * 清空出牌倒计时
 */
PhzManager.prototype.clearDealTimer = function () {
    // this.stopDealTimer();
    this.stopPlayCardEffect();
    API.getUI("出牌倒计时1").visible = false;
    API.getUI("出牌倒计时2").visible = false;
    API.getUI("出牌倒计时3").visible = false;
    console.log("清除出牌倒计时数字");
    if (manager.lastDealTimer) {
        clearInterval(manager.lastDealTimer);
        manager.lastDealTimer = null;
    }
}

var effTimer;
var currentPlayEffect;
/**
 * 播放指令特效
 * @param {*} actionType 
 */
PhzManager.prototype.playActionEffect = function (actionType, pos) {
    this.stopActionEffect();

    var uiId = "指令特效" + pos;
    var effect = API.getUI(uiId);
    currentPlayEffect = effect;
    var ctime = 0;  // 当前次数
    effect.alpha = 1;  
    effect.scaleX = 1.2;
    effect.scaleY = 1.2;
    effect.visible = true;
    var res = API.data;
    var url = actionUrlMap[actionType];
    res["actionEffect"] = url; 
    API.update("指令图标" + pos);
    console.log("播放卡牌选项特效 actionType:", actionType, "pos:", pos, "url:", url);

    var timePerFrame = Math.floor(1000/24);  // 每帧毫秒
    var timeout = 45*timePerFrame;  // 总毫秒
    var timeTotal = 0;  // 累计的毫秒
    effTimer = setInterval(function () {
        if (ctime < 18) {
            effect.scaleX -= (1.2-1.0)/9;
            effect.scaleY -= (1.2-1.0)/9;
        } else if (ctime <= 31) {

        } else if (ctime > 31) {
            effect.alpha -= 1.0/7;
            effect.scaleX -= (1.0-0.8)/7;
            effect.scaleY -= (1.0-0.8)/7;
        }
        ctime += 1;
        timeTotal += timePerFrame;
        if (timeTotal >= timeout) {
            clearInterval(effTimer);
            effTimer = null;

            effect.alpha = 0;
            effect.scaleX = 0.8;
            effect.scaleY = 0.8;
            effect.visible = false;
        }
    }, timePerFrame);

    // API.timer.play(2, 22, function () {
    //     if (ctime < 9) {
    //         effect.scaleX -= (1.2-1.0)/9;
    //         effect.scaleY -= (1.2-1.0)/9;
    //     } else if (ctime <= 15) {

    //     } else if (ctime > 15) {
    //         effect.alpha -= 1.0/7;
    //         effect.scaleX -= (1.0-0.8)/7;
    //         effect.scaleY -= (1.0-0.8)/7;
    //     }
    //     // if (ctime < 18) {
    //     //     effect.scaleX -= (1.2-1.0)/18;
    //     //     effect.scaleY -= (1.2-1.0)/18;
    //     // } else if (ctime <= 31) {

    //     // } else if (ctime > 31) {
    //     //     effect.alpha -= 1.0/(45-31);
    //     //     effect.scaleX -= (1.0-0.8)/(45-31);
    //     //     effect.scaleY -= (1.0-0.8)/(45-31);
    //     // }
    //     ctime ++;
    // }, function () {
    //     effect.alpha = 0;
    //     effect.scaleX = 0.8;
    //     effect.scaleY = 0.8;
    //     effect.visible = false;
    //     API.timer.remove("actionEffectTimer");
    // }, false, "actionEffectTimer");
}

/**
 * 停止指令特效
 */
PhzManager.prototype.stopActionEffect = function () {
    if (effTimer) {
        clearInterval(effTimer);
        effTimer = null;
    }
    if (currentPlayEffect) {
        currentPlayEffect.visible = false;
    }
}

/**
 * 重置桌面
 */
PhzManager.prototype.reset = function () {
    pgame.reset();
    // 胡息清空
    for (var i = 1; i <= 3; i++) {
        manager.updateHuxi(0, i);
    }
}

var MgrPrototype = PhzManager.prototype;
var manager = new PhzManager();
console.log("player num: ", manager.playerNum, "userID: ", manager.myUserID, " accountID:", API.data.accountID);

function playEffect() {
    // manager.playActionEffect(2, 2);
    // manager.startDealTimer(2);
    // manager.clearDealTimer();

    // pgame.printDesktopList();

}

// --------------------------------------- 游戏 ------------------------------------- //
// 跑胡子游戏处理

var pgame = (function (Game, manager) {

    // "use strict";

    var handListNum = 11;      // 手牌卡组最多11列
    var handGroupList = [];    // 手牌卡组数据，里面是11列卡牌组数据
    var desktopGroupList = []; // 桌牌卡组数据 索引是玩家位置 值是{id(牌组id), cards}
    var discardList = [];      // 弃牌数据
    var rawHandGroups;         // 原生的服务器手牌数据
    var listDict = [];         // 卡牌列表字典, 索引为列，值为列表ui

    var middleIndex = 5; // 卡牌列表中间的索引。水平缓动时，空列两侧根据这个索引选择哪侧靠近
    var time_tweenVertical = 5; // 垂直缓动的时间
    var time_tweenHorizontal = 5; // 水平缓动的时间
    var time_tweenDrag = 5; // 拖拽释放缓动的时间
    var cardHeight = 87; // 卡牌的高度
    // 卡牌组在不同列的x坐标
    var pxlist = [0, 76, 152, 228, 304, 380, 456, 532, 608, 684, 760];
    var pylist = [261, 174, 87, 0]; // 废弃, 暂不用
    // 卡牌组卡牌个数对应的值，用来计算卡牌列表开始的y坐标，因为卡牌是从下向上排的. 索引0, 1, 2, 3, 4对应-1, 3, 2, 1, 0
    var supList = [-1, 3, 2, 1, 0];
    // 一个卡牌列表最多4个卡牌
    var listCardsMaxNum = 4;

    var selfPos = 2; // 牌桌UI中自己的索引位置，从1开始
    var lcardCntIds; // 亮张容器ids
    var lcardPosList; // 亮张容器起始坐标, 从这个坐标出现动画
    var lcardTargetPosList;  // 亮张容器目标坐标

    var listLocList = [];  // 卡牌列表的初始坐标
    var hasInit = false;   // 是否已初始化，因为可能刷新了

    var time_tweenDesktopCard = 10;  // 桌牌缓动时间
    var cardWidth = 76;    // 卡牌宽度
    var centerPosx;        // 卡牌列表居中的坐标x

    function init() {
        hasInit = true;
        // 初始化亮张容器，为了实现亮张的动画效果
        lcardCntIds = [];
        lcardPosList = [];
        lcardTargetPosList = [];
        for (var i = 0; i < 3; i++) {
            var uid = "亮张容器" + (i + 1);
            lcardCntIds[i] = uid;
            var cnt = API.getUI(uid);
            lcardTargetPosList[i] = {x: cnt.x, y: cnt.y};
            if (i === 0) {
                lcardPosList[i] = {
                    x: cnt.x - 150,
                    y: cnt.y - 80
                };
            } else if (i === 1) {
                lcardPosList[i] = {
                    x: cnt.x + cnt.width / 2,
                    y: cnt.y + 450
                };
            } else {
                lcardPosList[i] = {
                    x: cnt.x + cnt.width + 150,
                    y: cnt.y - 80
                };
            }
        }
        console.log("lcard pos: ", JSON.stringify(lcardPosList));

        // 装载列表
        var listUI, listId;
        for (var j = 0; j < handListNum; j++) {
            listId = "卡牌组" + (j + 1);
            listUI = API.getUI(listId);
            // 将初始化的索引存储起来
            Object.defineProperty(listUI, "store", {
                configurable: true,
                writable: true,
                enumerable: true,
                value: {
                    col: j,     // 数据的索引
                    rawCol: j,  // UI原生的索引(从0开始，外部用需要+1)
                    id: listId
                }  // 初始化索引
            });
            listDict[j] = listId;

            // 原始坐标
            listLocList[j] = {x: listUI.x, y: listUI.y};
            // console.log("list store:", listUI.store.prototype.col);

            // 得到居中坐标
            if (j === Math.floor(handListNum / 2)) {
                centerPosx = listUI.x;
            }
        }
        // for (var j = 0; j < handListNum; j++) {
        //     listId = "卡牌组" + (j + 1);
        //     listUI = API.getUI(listId);
        //     console.log("list store:", listUI.store.col, "id:", listUI.store.id);
        // }
    }

    /**
     * 清空手牌
     */
    function clearHandGroups() {
        var res = API.data;
        var i, listId, listUI;
        // 手牌
        for (i = 0; i < handListNum; i++) {
            listId = "卡牌组" + (i + 1);
            listUI = API.getUI(listId);
            res["clist" + (getListRawCol(i) + 1)] = []; 
            API.update(listId);
            console.log("clear listid:", listId, "i:", i);
        }
    }

    /**
     * 重新设置手牌
     */
    function resetHandGroups(newHandGroups) {
        // 手牌换肤
        clearHandGroups();
        var redata = newHandGroups || JSON.parse(JSON.stringify(rawHandGroups));
        setHandGroups(redata);
    }

    /**
     * 刷新卡牌皮肤
     */
    function updateCardStyle() {
        if (!manager.isGameRunning) {
            return;
        }
        var res = API.data;
        resetHandGroups();

        // 桌牌换肤
        var i = 0, j = 0;
        var deskList, deskGroup;
        for (i = 0; i < manager.playerNum; i++) {
            deskList = desktopGroupList[i] || [];
            if (!deskList) {
                continue;
            }
            for (j = 0; j < deskList.length; j++) {
                deskGroup = deskList[j];
                buildDesktopData(deskGroup);
                res["desk" + (i + 1) + "" + (j + 1)] = deskGroup.cards;
                API.update("桌牌列表" + (i + 1) + "" + (j + 1));
            }
        }

        // 弃牌换肤
        var discard, dlist;
        for (i = 0; i < 3; i++) {
            dlist = discardList[i + 1];
            if (!dlist) {
                continue;
            }
            for (j = 0; j < dlist.length; j++) {
                discard = dlist[j];
                discard.card = buildCardUrl(discard, "s");
            }
            res["stink" + (i + 1)] = dlist;
            API.update("弃牌列表" + (i + 1));
        }
        console.log("更新卡牌样式成功");
    }

    /**
     * 更新卡牌牌面大小
     */
    function updateCardScale() {
        var res = API.data;
        var scalev = res["牌面选择"];
        console.log("此前的scalev:", manager.scalev, "选择的scalev:", scalev);
        var listCnt = API.getUI("卡牌容器");
        // 不用比较scalev的大小，因为如果manager.scalev是1.2，开启第二局时会变为正常大小，不符合1.2
        if (!listCnt) {
            return;
        }
        manager.scalev = scalev;
        
        // 设置scale
        // if (scalev > 1.0) {
        //     listCnt.x -= 85;
        //     listCnt.y -= 70;
        // } else {
        //     listCnt.x += 85;
        //     listCnt.y += 70;
        // }
        
        // listCnt.scaleX = scalev;
        // listCnt.scaleY = scalev;

        updateListCntCoord();
    }

    /**
     * 更新列表UI容器坐标
     */
    function updateListCntCoord() {
        var res = API.data;
        var scalev = res["牌面选择"];
        console.log("此前的scalev:", manager.scalev, "选择的scalev:", scalev);
        var listCnt = API.getUI("卡牌容器");
        listCnt.appendStyle({
            left: "0C",
            top: "12B",
            scaleX: scalev,
            scaleY: scalev
        });
        if (scalev > 1.0) {
            listCnt.x -= 85;
            listCnt.y -= 70;
        } 
        console.log("updateCardScale -> cnt x:", listCnt.x, "y:", listCnt.y, "scalev:", scalev);
    }

    /**
     * 清理
     */
    function clear() {
        console.log("clear -> hasInit:", hasInit);
        if (!hasInit) {
            return;
        }
        var i, j;
        var res = API.data;
        var listId, listUI, loc;
        // 手牌
        for (i = 0; i < handListNum; i++) {
            listId = "卡牌组" + (getListRawCol(i) + 1);
            listUI = API.getUI(listId);
            res["clist" + (getListRawCol(i) + 1)] = []; 
            API.update(listId);
            console.log("clear listid:", listId, "i:", i, "listCol:", getListRawCol(i));
            // 设置原来的坐标
            loc = listLocList[i];
            listUI = API.getUI(listId);
            listUI.x = loc.x;
            listUI.y = loc.y;
             
            listUI.store.col = i;
            listUI.store.rawCol = i;
        }
        // 桌牌
        for (i = 0; i < 3; i++) {    // 3人
            for (j = 0; j < 8; j++) {    // 8列
                res["desk" + (i + 1) + "" + (j + 1)] = [];
                API.update("桌牌列表" + (i + 1) + "" + (j + 1));
            }
            // 清空玩家位置数据
            desktopGroupList[i+1] = [];
        }
        
        // 弃牌
        for (i = 0; i < 3; i++) {
            res["stink" + (i + 1)] = [];
            API.update("弃牌列表" + (i + 1));
        }

        handGroupList = [];
        desktopGroupList = [];
        discardList = [];
        rawHandGroups = {};

        API.getUI("听牌容器").visible = false;
        API.getUI("比牌容器").visible = false;
        API.getUI("吃牌容器").visible = false;
        // API.getUI("指令容器").visible = false;
        API.hideUI("指令容器");
        resetLightCardCnt();
        manager.clearDealTimer();

        var listCnt = API.getUI("卡牌容器");
        listCnt.appendStyle({
            left: "0C",
            top: "12B",
            width: 836,
            height: 348
        });
        console.log("reset list cnt -> x:", listCnt.x, "y:", listCnt.y);
    }

    /**
     * 重置游戏桌面
     */
    function reset() {
        if (!hasInit) {

        }
        clear();
    }

    /**
     * 打印手牌列表数据
     */
    function printHandList() {
        console.log("hand list:", JSON.stringify(handGroupList));
    }

    /**
     * 打印桌牌列表数据
     */
    function printDesktopList() {
        console.log("desktop list:", JSON.stringify(desktopGroupList));
    }

    /**
     * 打印列表的数据
     */
    function printListCol() {
        listDict.forEach(function (listId, i) {
            var listUI = API.getUI(listId);
            var listCol = listUI.store.col;
            var rawCol = listUI.store.rawCol;
            console.log("lists col => id:", listId, "col:", listCol, "rawCol:", rawCol);
        });
    }

    /**
     * 根据数据的列索引，找到映射的列表UI的真实列索引(列表UI列索引会因为水平缓动变化)
     * @param {*} col 
     */
    function getListRawCol(col) {
        var listId = listDict[col];
        var listUI = API.getUI(listId);
        var listCol = listUI.store.rawCol;
        return listCol;
    }

    /**
     * 根据卡牌ID找到该卡牌相应的数据列索引
     * @param {*} cardId 
     */
    function getCardCol(cardId) {
        var col;
        var list, acard;
        for (var i = 0; i < handGroupList.length; i++) {
            list = handGroupList[i];
            for (var j = 0; j < list.length; j++) {
                acard = list[j];
                if (acard.id === cardId) {
                    col = i;
                }
            }
        }
        return col;
    }

    var dealing = false;
    var dealCards = [];
    /**
     * 发牌效果
     * @param {*} card 
     * @param {*} pos 
     */
    function deal(card, pos) {
        var idx = pos - 1;
        var res = API.data;
        res["lightCard" + pos] = buildCardUrl(card);

        var uid = lcardCntIds[idx];
        var ui = API.getUI(uid);
        console.log("lcard uid:", uid, "idx:", idx, "card:", JSON.stringify(card));
        var loc = lcardPosList[idx];         // 起始发牌坐标
        var loc2 = lcardTargetPosList[idx];  // 目标坐标
        var sx = loc2.x;
        var sy = loc2.y;
        ui.visible = false;
        ui.x = loc.x;
        ui.y = loc.y;
        ui.scaleX = 0;
        ui.scaleY = 0;
        ui.visible = true;
        API.update(...['亮张牌正' + pos, '亮张牌倒' + pos]);

        console.log("move before -> origin:", loc, "target:", sx, ",", sy);
        var speedv = res["速度选择"];
        var timePerFrame = 1000/24;
        var frame = Math.round(speedv/timePerFrame);
        console.log("speedv:", speedv, "frame:", frame);
        var disx = Math.floor((loc2.x - loc.x)/frame), disy = Math.floor((loc2.y - loc.y)/frame);
        console.log("disx:", disx, "disy:", disy);
        var currentFrame = 0;
        var totalFrames = frame + frame + Math.floor(200/timePerFrame);    // 移动缩放的时间+停顿的时间+间隔的时间
        var dealEffectTimer = setInterval(function () {
            currentFrame += 1;
            if (currentFrame < frame) {
                ui.x += disx;
                ui.y += disy;
                ui.scaleX += 1.0/frame;
                ui.scaleY += 1.0/frame;
            } else if (currentFrame === frame) {
                ui.scaleX = 1;
                ui.scaleY = 1;
                ui.x = loc2.x;
                ui.y = loc2.y;
            } else if (currentFrame === totalFrames) {
                console.log("deal complete, dealCards.length:", dealCards.length);
                dealing = false;
                checkDeal();
                clearInterval(dealEffectTimer);
            }
        }, Math.floor(timePerFrame));

        // API.moveObjectTo(uid, sx, sy, frame, function () {
        //     ui.scaleX += 1.0/frame;
        //     ui.scaleY += 1.0/frame;
        // }, function () {
        //     ui.scaleX = 1;
        //     ui.scaleY = 1;
        //     ui.x = loc2.x;
        //     ui.y = loc2.y;
        //     console.log("deal complete, dealCards.length:", dealCards.length);
        //     setTimeout(() => {
        //         dealing = false;
        //         checkDeal();
        //     }, speedv + 100);
        // });
    }

    function checkDeal() {
        if (dealCards.length > 0) {
            var spliceArr = dealCards.splice(0, 1);
            var data = spliceArr[0];
            show(data[0], data[1]);
        }
    }

    function swapLightAndCard(isCardTop) {
        var cardCnt = API.getUI("卡牌容器");
        var lightUI = API.getUI("亮张容器2");
        console.log("卡牌容器:", cardCnt, "亮张容器:", lightUI);
        console.log("卡牌容器 index:", cardCnt.style.zIndex, "亮张容器 index:", lightUI.style.zIndex, "isCardTop:", isCardTop);
        var topUI = API.getUI("游戏桌面2");
        var cindex = cardCnt.style.zIndex, lindex = lightUI.style.zIndex;
        if (isCardTop) {
            if (cindex < lindex) {
                topUI.setChildIndex(cardCnt, lindex);
            }          
        } else {
            if (cindex > lindex) {
                topUI.setChildIndex(lightUI, cindex);
            }
        }
    }

    function show(card, player) {
        // swapLightAndCard(false);
        dealing = true;
        var res = API.data;
        var speedv = res["速度选择"];
        console.log("showCard -> card:", JSON.stringify(card), "accountId:", player.accountId, "speedv:", speedv);
        // 先隐藏亮张容器
        lcardCntIds.forEach(function(cid) {
            API.getUI(cid).visible = false;
        });
        
        deal(card, player.pos);
        // 播放音效
        playSound(card.isBig ? (card.value + 100) : card.value, player.sex);
    }

    /**
     * 显示亮张或者出牌
     * @param {*} card 
     * @param {*} player 
     */
    function showCard(card, player) {
        if (!card) {
            return;
        }
        console.log("showcard -> cardid:", card.id);
        if (dealing) {
            dealCards.push([card, player]);
        } else {
            show(card, player);
        }
    }

    /**
     * 根据牌组ID找到相应的牌组
     * @param {*} groupId 
     */
    function getRawHandGroup(groupId) {
        console.log("raw hand groups: ", JSON.stringify(rawHandGroups));
        var result;
        rawHandGroups.forEach(function (group) {
            if (group.id === groupId) {
                console.log("找到相应的原始牌组, id:", groupId);
                result = group;
                return result;
            }
        });
        return result;
    }

    /**
     * 更新原生的卡牌组
     * @param {*} group 
     */
    function updateRawHandGroup(group) {
        console.log("更新原生牌组信息 group:", JSON.stringify(group));
        for (var i=0; i<rawHandGroups.length; i++) {
            var rawGroup = rawHandGroups[i];
            if (rawGroup.id === group.id) {
                console.log("找到要更新的牌组 groupId:", group.id);
                rawHandGroups[i] = group;
                break;
            }
        }
    }

    /**
     * 删除指定的原生牌组
     * @param {*} deleteId 
     */
    function deleteRawHandGroup(deleteId) {
        // 从后往前删除
        var index = rawHandGroups.length;
        while (index--) {
            var rawGroup = rawHandGroups[index];
            if (rawGroup.id === deleteId) {
                console.log("删除原始手牌牌组, id:", deleteId);
                rawHandGroups.splice(index, 1);
                break;
            }
        }
    }

    /**
     * 手牌是不是为空
     */
    function isHandGroupsEmpty() {
        var isEmpty = true;
        handGroupList.forEach(function (list) {
            if (list.length > 0) {
                isEmpty = false;
            }
        });
        return isEmpty;
    }

    var newCardGroups = [];
    var deleteGroupIds = [];
    /**
     * 刷新手牌卡组
     * @param {*} synData 
     */
    function refreshHandGroups(synData) {
        newCardGroups = newCardGroups.concat(synData.addOrUpdateCardGroups);
        deleteGroupIds = deleteGroupIds.concat(synData.deleteCardIds);

        console.log("refresh hand groups -> movingSignal:", movingSignal, "newCardGroups:", JSON.stringify(newCardGroups), "deleteGroupIds:", JSON.stringify(deleteGroupIds));
        
        if (movingSignal > 0) {
            var waitRefreshTimer = setInterval(function () {
                if (movingSignal === 0) {
                    console.log("proc refresh-----------------");
                    procRefresh();
                    clearInterval(waitRefreshTimer);
                }
            }, 1000/24);

            // setTimeout(() => {
            //     console.log("proc refresh-----------------");
            //     procRefresh();
            // }, time_tweenHorizontal);
        } else {
            procRefresh();     
        }

        // 试试使用定时器或者promise处理刷新与移动之间的顺序关系
        // setTimeout(() => {
        //     console.log("proc refresh-----------------");
        //     procRefresh();        
        // }, 0);
        // procRefresh();      

        function procRefresh() {
            console.log("procRefresh -> movingSignal:", movingSignal);
            var appendGroups = []; // 追加手牌卡组
            var res = API.data;

            // 删除卡牌
            deleteGroupIds.forEach(function (deleteId) {
                var dgroup = getRawHandGroup(deleteId);
                // 删除会发生变化, 用深拷贝处理或者从后开始循环处理
                var dcards = dgroup.cards;
                // var dcards = JSON.parse(JSON.stringify(dgroup.cards));
                // console.log("删除牌组 id:", deleteId, "cards:", JSON.stringify(dcards));
                console.log("删除牌组长度:", dcards.length, "牌组id:", deleteId);

                var dlength = dcards.length;
                while (dlength--) {
                    var acard = dcards[dlength];
                    deleteCard(acard.id, true);
                }

                // 删除相关的组
                deleteRawHandGroup(deleteId);
            });
            console.log("delete after --- handlist: ", JSON.stringify(handGroupList));
            
            newCardGroups.forEach(function (cardGroup) {
                var flag = false; // 标识可否处理
                var cmap, col, clist;
                var cards = cardGroup.cards;
                var groupId = cardGroup.id;
                var retainMap = {}; // 记录需要保留的卡牌, 其他的删除
                // 构建卡牌url
                cards.forEach(function (acard) {
                    acard.card = buildCardUrl(acard);
                    retainMap[acard.id] = true;
                });

                // console.log("新增或更新的卡牌组:", JSON.stringify(cards));
                // 如果有相关的组，则需要判断组的卡牌id, 将原来的卡牌替换掉，现在没有的，即多出的卡牌则删除掉
                var group = getRawHandGroup(groupId);
                if (group) {
                    console.log("更新现有的牌组 id:", groupId);

                    // 删除会发生变化, 用深拷贝处理或者从后开始循环处理
                    var rawCards = group.cards;
                    // var rawCards = JSON.parse(JSON.stringify(group.cards));
                    console.log("原来的卡牌组:", JSON.stringify(rawCards));

                    // 删除多余的卡牌
                    var rlength = rawCards.length;
                    while (rlength--) {
                        var rcard = rawCards[rlength];
                        // 多余的卡牌
                        if (!retainMap[rcard.id]) {
                            console.log("找到多余的卡牌:", JSON.stringify(rcard));
                            deleteCard(rcard.id, true);
                        }
                    }

                    // 更新数据
                    updateRawHandGroup(cardGroup);
                } else {
                    // 追加手牌卡组
                    appendGroups.push(cardGroup);
                }
            });
            // 追加手牌卡组
            if (appendGroups.length > 0) {
                appendHandGroups(appendGroups);
            }
            if (deleteGroupIds.length > 0 || newCardGroups.length > 0) {
                // 有可能需要水平缓动
                tweenHorizontal();
            }

            newCardGroups = [];
            deleteGroupIds = [];
        }
    }

    /**
     * 删除卡牌映射
     * @param {*} cardId 
     * @param {*} isRefreshUI 是否update ui
     */
    function deleteCard(cardId, isRefreshUI) {
        var col = getCardCol(cardId);
        var index = 0;  // 删除的索引
        console.log("删除卡牌映射 cardId:", cardId, "col:", col);
        // 删除列表里相应的数据
        var alist = handGroupList[col];
        console.log("删除卡牌前, json:", JSON.stringify(alist));
        // 需要从后面开始删除
        var alength = alist.length;
        while(alength--) {
            var card = alist[alength];
            if (card.id === cardId) {
                console.log("找到相应的删除卡牌ID：", cardId);
                alist.splice(alength, 1);
                index = alength;
                break;
            }
        }

        handGroupList[col] = alist;
        
        var listCol = getListRawCol(col);
        console.log("删除相关卡牌组卡牌,", ("卡牌组" + (listCol + 1)), "json:", JSON.stringify(alist));
        if (isRefreshUI) {
            API.update("卡牌组" + (listCol + 1));
        } else {
            if (alist.length > 0) {
                if (index === 0) {
                    API.update("卡牌组" + (listCol + 1));
                } else {
                    // 垂直缓动
                    tweenVertical(col, index);   
                }
            } else {
                // 水平缓动
                tweenHorizontal();
            }         
        }
    }

    /**
     * 处理卡牌蒙灰，将不能操作
     * @param {*} col 
     */
    function procCardDark(cards, col) {
        // cards.forEach(function (acard, j) {
        //     var uiId = "卡牌条目" + (getListRawCol(col)+1) + "[" + j + "]";
        //     // console.log("proc card dark:", uiId, "card:", JSON.stringify(acard));
        //     var cardUI = API.getUI(uiId);
        //     // 蒙灰，不能操作
        //     if (acard.isDark) {
        //         cardUI.appendStyle({
        //             draggable: 0
        //         });
        //         console.log("dark cardId:", uiId, "card:", JSON.stringify(acard));
        //     } else {
        //         cardUI.appendStyle({
        //             draggable: 1
        //         });
        //         // console.log("not dark cardUI:", cardUI);
        //     }
        // });
    }

    /**
     * 设置手牌卡组数据
     * @param {*} handGroups 
     */
    function setHandGroups(handGroups) {
        console.log("set hand groups -------------- ");
        // 保存原生的服务器数据
        rawHandGroups = handGroups;
        var gindex = 0;
        var hlist = handGroups;
        var glength = hlist.length;
        var startIndex = Math.floor((handListNum - glength)/2);
        var res = API.data;
        // 手牌卡组居中显示
        for (var i=0; i<handListNum; i++) {
            handGroupList[i] = [];
            if (i < startIndex || gindex >= glength) {
                continue;
            }
            var group = hlist[gindex];
            gindex += 1;
            var cards = group.cards;
            cards.forEach(function (acard, j) {
                // acard.isDark = true;
                acard.card = buildCardUrl(acard);
                // 蒙灰背景
                buildCardBg(acard);
            });

            // 需要深拷贝，否则在拖拽更新UI列表数据后，raw数据也会改变, 比如拖拽的列变了，delete掉该列的某项，导致raw数据也delete, 后面就找不到了
            var copyCards = JSON.parse(JSON.stringify(cards));
            handGroupList[i] = copyCards; 
            // 找到映射的列索引
            var listCol = getListRawCol(i);
            res["clist" + (listCol + 1)] = copyCards;
            API.update("卡牌组" + (listCol + 1));

            // 卡牌蒙灰处理 因为需要刷新列表才有item，只能多做一次处理
            procCardDark(cards, i);

            // console.log("update idx:", (i + 1), "cards:", JSON.stringify(group.cards));
        }
        
        console.log("set hand groups list:", JSON.stringify(handGroupList));
    }

    /**
     * 追加手牌卡组, 从有数据列后面开始追加
     * @param {*} handGroups 追加的手牌
     */
    function appendHandGroups(handGroups) {
        if (!handGroups || handGroups.length === 0) {
            return;
        }
        var res = API.data;
        var hlength = handGroupList.length;
        console.log("append hand groups ---------- length:", hlength, "list:", JSON.stringify(handGroupList));
        // 没有，则设置
        if (hlength === 0 || isHandGroupsEmpty()) {
            console.log("append 变成 set");
            setHandGroups(handGroups);
            return;
        }

        for (var i = hlength-1; i >= 0; i--) {
            // 从后面开始，找到最近的有数据列
            var cards = handGroupList[i];
            if (!cards || cards.length === 0) {
                continue;
            }
            // 追加手牌卡组
            var len = handGroups.length;
            if (((i + 1) + len) >= handListNum) {
                console.log("追加手牌的位置有问题，超出11列了. hlength:", hlength, "len:", len, "i:", i);
                len = handListNum;
            } else {
                len = i + 1 + len;
            }
            var flag = false;  // 是否已处理
            var startIndex = 0;
            for (var j = i + 1; j < len; j++) {
                var group = handGroups[startIndex];
                startIndex += 1;
                cards = group.cards;
                cards.forEach(function (acard, k) {
                    acard.card = buildCardUrl(acard);
                    buildCardBg(acard);
                });

                // 需要深拷贝，否则在拖拽更新UI列表数据后，raw数据也会改变, 比如拖拽的列变了，delete掉该列的某项，导致raw数据也delete, 后面就找不到了
                var copyCards = JSON.parse(JSON.stringify(cards));
                handGroupList[j] = copyCards; 
                // 找到映射的列索引 
                var listCol = getListRawCol(j);
                res["clist" + (listCol + 1)] = copyCards;
                API.update("卡牌组" + (listCol + 1));
                flag = true;

                // 卡牌蒙灰处理 因为需要刷新列表才有item，只能多做一次处理
                procCardDark(cards, j);
            }
 
            // 已处理，跳出循环
            if (flag) {
                break;
            }
        }

        // 追加
        rawHandGroups = rawHandGroups.concat(handGroups);
        console.log("append hand groups list:", JSON.stringify(handGroups));
    }

    /**
     * 构建桌牌数据
     * @param {*} group 
     */
    function buildDesktopData(group) {
        // 卡牌样式（大小，字体）卡牌资源名字构成: 卡牌选择(l, s) + 字体选择(1, 2, 3) + "_" + 卡牌值(小写: 1, 2, 3...; 大写: 10, 11, 12...) * 牌面选择(scale 1.2, 1.0)
        var res = API.data;
        var fontv = res["字体选择"];
        var sizev = "s";
        console.log("fontv:", fontv, "sizev:", sizev);
        var cards = group.cards;
        // 盖背面的起始索引
        var startNo = cards.length - group.coverCardNum;
        console.log("startNo:", startNo, "cards len:", cards.length, "cover num:", group.coverCardNum);
        cards.forEach(function (acard, j) {
            var cstr;
            if (startNo > j) {
                cstr = buildCardUrl(acard, sizev);
            } else {
                cstr = sizev + fontv + "_back";
            }
            acard.card = cstr;
        })
        return group;
    }

    /**
     * 移动桌牌牌组
     * @param {*} listId 
     * @param {*} pos 
     * @param {*} ttime 缓动时间
     */
    function moveCardList(listId, pos, ttime) {
        // 初始移动的x坐标映射，索引为pos
        var locMap = [0, 250, 250, -100];
        /*
        var listUI = API.getUI(listId);
        var tx = listUI.x, ty = listUI.y;
        var originX = locMap[pos], originY = ty;
        // 设置listUI的坐标为初始坐标, 然后显示
        listUI.x = originX;
        listUI.y = originY;
        listUI.visible = true; 
        console.log("移动桌牌牌组 ", listId, "ttime:", ttime, "{ x:", originX, "y:", originY, "} => { tx:", tx, "ty:", ty, "}");
        // 开始移动listUI
        API.moveObjectTo(listId, tx, ty, ttime, null, function () {
            API.update(listId);
            console.log("移动完成，再更新", listId);
        });
        */

        function printCoord () {
            console.log("移动中 -> listId:", listId, "x:", listUI.x, "y:", listUI.y); 
        }

        (function (listId, pos, ttime) {
            var listUI = API.getUI(listId);
            var tx = listUI.x, ty = listUI.y;
            var originX = locMap[pos], originY = ty;
            // 设置listUI的坐标为初始坐标, 然后显示
            listUI.x = originX;
            listUI.y = originY;
            listUI.visible = true;
            var disx = Math.floor((tx - originX)/ttime);
            var disy = Math.floor((ty - originY)/ttime); 
            var currentFrame = 0;
            console.log("移动桌牌牌组 ", listId, "ttime:", ttime, "{ x:", originX, "y:", originY, "} => { tx:", tx, "ty:", ty, "}", "disx:", disx, "disy:", disy);
            var mcardTimer = setInterval(function () {
                listUI.x += disx;
                listUI.y += disy;
                currentFrame ++;
                if (currentFrame >= ttime) {
                    listUI.x = tx;
                    listUI.y = ty;
                    clearInterval(mcardTimer);

                    (function () {
                        API.update(listId);
                        console.log("移动完成，再更新", listId);
                    })();
                }
            }, 1000/25);
        })(listId, pos, ttime);
    }

    /**
     * 设置桌牌卡组数据
     * @param {*} desktopGroups 
     * @param {*} player 
     */
    function setDesktopGroups(desktopGroups, player) {
        console.log("set desktop groups list");
        appendDesktopGroups(desktopGroups, player);
    }

    /**
     * 增加桌牌卡组
     * @param {*} appendGroups 
     * @param {*} player 
     */
    function appendDesktopGroups(appendGroups, player) {
        if (appendGroups.length === 0) {
            return;
        }
        console.log("--> 桌牌卡组:", JSON.stringify(appendGroups));
        var beforeList = desktopGroupList[player.pos] || [];
        var blength = beforeList.length;    // 原来的桌牌长度
        // 如果追加的牌组ID存在，则需要替换掉原来桌牌上的组
        var beforeIdMap = {};  // 找出已存在的组
        beforeList.forEach(function (bgroup, idx) {
            beforeIdMap[bgroup.id] = {flag: true, col: idx};
        });

        var alength = appendGroups.length;  // 新增的桌牌长度
        var list = [];
        var listId;
        var res = API.data;
        console.log("alength:", alength, "blength:", blength, "pos:", player.pos, "json:", JSON.stringify(beforeList));
        for (var i=0; i<alength; i++) {
            blength += 1;
            var group = appendGroups[i];
            buildDesktopData(group);
            list[i] = group.cards;
            // 该牌组ID在桌牌上已经存在，替换掉
            var map = beforeIdMap[group.id];
            if (map) {
                // 跑，直接更新桌牌该列
                console.log("找到桌牌上相同的牌组ID: ", group.id, "列索引:", map.col);
                res["desk" + player.pos + "" + (map.col + 1)] = group.cards;
                listId = "桌牌列表" + player.pos + "" + (map.col + 1);
                beforeList[map.col] = group;
                API.update(listId);
            } else {
                // 其他的需要移动
                res["desk" + player.pos + "" + blength] = group.cards;
                listId = "桌牌列表" + player.pos + "" + blength;
                beforeList.push(group);
                API.update(listId);
                console.log("移动桌牌前,", listId, "json:", JSON.stringify(group.cards));
                // 移动前先隐藏
                API.getUI(listId).visible = false;
                (function (listId, pos, ttime) {
                    moveCardList(listId, pos, ttime);
                })(listId, player.pos, time_tweenDesktopCard + i);
            }
            console.log("更新", listId, "json:", JSON.stringify(list[i]));
        }
        desktopGroupList[player.pos] = beforeList;
        console.log("append desktop groups list:", JSON.stringify(desktopGroupList[player.pos]));

        // 更新胡息
        var totalHuxi = manager.getGroupsTotalHuxi(beforeList);
        manager.updateHuxi(totalHuxi, player.pos);
    }

    /**
     * 设置弃牌数据
     * @param {*} discardGroups 
     * @param {*} player 
     */
    function setDiscards(discards, player) {
        console.log("set discards list");
        appendDiscards(discards, player);
    }

    /**
     * 追加弃牌列表
     * @param {*} discards 
     * @param {*} player 
     */
    function appendDiscards(discards, player) {
        if (discards.length === 0) {
            return;
        }
        // 如果当前没有弃牌，则设置弃牌数据
        var beforeList = discardList[player.pos] || [];
        var blength = beforeList.length;
        var sizev = "s";
        var startIndex = 0;
        var alength = discards.length;
        console.log("blen:", blength, "alen:", alength);
        for (var i = blength; i < (blength + alength); i++) {
            var acard = discards[startIndex++];
            acard.card = buildCardUrl(acard, sizev);
        }
        var res = API.data;
        var dlist = beforeList.concat(discards);
        res["stink" + player.pos] = dlist;
        var listId = "弃牌列表" + player.pos;
        API.update(listId);
        $(listId).resetStyle();
        discardList[player.pos] = dlist;
        console.log("append discards list:", JSON.stringify(dlist));
    }
     
    /**
     * 将拖动的卡牌组提到容器顶层
     * @param {*} uid 
     */
    function swap2Top(uid, index) {
        console.log("swap2Top -> id: ", uid, "index: ", index);
        // console.log("API.mouseEvent:", cL.mouseEvent);
        // swapLightAndCard(true);

        var originIndex = Number(uid.substring(4)); // 卡牌列表索引
        var listUI = API.getUI("卡牌组" + originIndex);
        var cnt = API.getUI("卡牌容器");
        var items = API.getChildren("卡牌容器");
        cnt.setChildIndex(listUI, items.length);

        // 处理蒙灰不能移动的情况，前面有个bug导致部分非蒙灰的卡牌也不能移动, 所以作个双重保险
        var col = listUI.store.col;
        var rawCol = listUI.store.rawCol;
        console.log("swap2top -> col:", col, "rawCol:", rawCol);
        var cards = handGroupList[col];
        procCardDark(cards, col);
        var card = cards[index];
        console.log("card:", JSON.stringify(card));
        var uiId = uid + "[" + index + "]";
        cardUI = API.getUI(uiId);
        cardUI.enabled = !card.isDark;
        console.log("isDark:", card.isDark, "cardUI:", cardUI);
        if (!card.isDark) {
            // 出牌线显示
            var lineUI = API.getUI("出牌线");
            lineUI.visible = true;
        }
    }

    /**
     * 卡牌拖拽释放后计算卡牌缓动
     */
    function dragCalc(uid, index) {
        // 出牌线隐藏
        var lineUI = API.getUI("出牌线");
        lineUI.visible = false;
        var lineY = lineUI.y;

        console.log("id: ", uid, "index: ", index);
        console.log("canPlayCard:", manager.canPlayCard); 

        var uiId = uid + "[" + index + "]";
        var item = API.getUI(uiId);

        // 游戏结束，不让再继续 
        if (!manager.isGameRunning) {
            console.log("isGameRunning：", manager.isGameRunning);
            API.hideUI(uiId);
            return;
        }

        // 得到相关的列表
        var listUI = item.parent;
        console.log("item:", item, "listUI:", listUI);
        console.log("store col:", listUI.store.col);
        var col = listUI.store.col; // 卡牌列表索引, 列
        console.log("listUI x: ", listUI.x, "y: ", listUI.y);
        console.log("x: ", item.x, "y: ", item.y, "width: ", item.width, "height: ", item.height);

        var res = API.data;
        var tx = 0,
            ty = 0;
        var width = item.width;
        // 将卡牌的本地坐标转为卡牌列表容器坐标
        var itemx = pxlist[col] + Math.round(item.x);
        var dx = Math.round(itemx + item.width / 2);
        var destList, srcList;  // 目标列表数据，源列表数据
        var dflag = false; // 拖拽处理标识
        var updateIndex = 0; // 更新索引，在for里闭包需要处理

        if (itemx < 0 || itemx > (pxlist[handListNum - 1] + item.width / 2)) {
            // 拖拽出界，回到原来的位置
            console.log("拖拽出边界了, itemx:", itemx);
            srcList = handGroupList[col];
            tx = pxlist[col];
            ty = (supList[srcList.length] + index) * cardHeight;
            // 转换为相对拖动卡牌原来位置的坐标系
            tx = tx - pxlist[col];
            API.moveObjectTo(uiId, tx, ty, time_tweenDrag);
            return;
        }

        // 出牌判断
        var loc = API.getLocal(uiId);
        console.log("global loc -> x:", loc.x, "y:", loc.y, "liney:", lineY, "canPlayCard:", manager.canPlayCard);
        if (manager.canPlayCard && (loc.y + item.height) <= lineY) {
            var dcard = handGroupList[col][index];
            console.log("牌超过出牌线，出牌id:", dcard.id, "value:", dcard.value);
            // 请求打牌
            Game.requestPlayCard(dcard.id);
            // 删除打出的牌
            API.hideUI(uiId);

            // 打出的卡牌ID
            manager.reqPlayCardId = dcard.id;
            // 打出的卡牌索引
            manager.reqPlayCardIndex = getListRawCol(col);
            // 简单的深层拷贝, 如果打牌失败，则需要重设该卡组
            srcList = handGroupList[col];
            manager.reqPlayCardList = JSON.parse(JSON.stringify(srcList));     
            return;
        }

        // 拖拽处理
        for (var i = 0; i < pxlist.length; i++) {
            tx = pxlist[i];
            // 判断当前拖动的卡牌处于哪个区域
            console.log("tx: ", tx, " itemx: ", itemx, " tx+w/2: ", (tx + item.width / 2));
            if ((tx <= itemx && (tx + item.width / 2) >= itemx) || (tx > itemx && tx < dx)) {
                destList = handGroupList[i];
                srcList = handGroupList[col];
                console.log("idx: ", i, "dx: ", dx, "tx: ", tx, "alist length: ", destList.length, "olist:", srcList);

                if (i === col || destList.length === listCardsMaxNum) {
                    // 拖动同一卡牌组或者拖到的卡牌组满了
                    console.log("refresh sort");
                    tx = pxlist[col];
                    ty = (supList[srcList.length] + index) * cardHeight;
                } else {
                    // -1是因为减去自己, +1是因为加上新添加上的卡牌
                    var clength = (i === col) ? destList.length - 1 : destList.length + 1;
                    ty = supList[clength] * cardHeight;

                    // 标识需要处理
                    dflag = true;
                }
                console.log("before tx: ", tx, "pxlist:", pxlist[col], " originindex:", col);
                // 转换为相对拖动卡牌原来位置的坐标系
                tx = tx - pxlist[col];

                console.log("卡牌拖拽释放缓动 tx: ", tx, "ty: ", ty);
                console.log("before dflag:", dflag, "i:", i, "index:", index, "originIndex:", col);

                if (dflag) {
                    // 处理数据中拖动的卡牌
                    console.log("-----拖动前处理数据 destlist: ", JSON.stringify(destList), " srclist: ", JSON.stringify(srcList));
                    var dragArr = srcList.splice(index, 1);
                    var dragData = dragArr[0];
                    destList.splice(0, 0, dragData);
                    console.log("drag arr:", JSON.stringify(dragArr));
                    console.log("拖动后处理数据 destlist: ", JSON.stringify(destList), " srclist: ", JSON.stringify(srcList));
                    // 需要找到映射的列索引, 更新数据
                    var srcCol = getListRawCol(col);
                    var destCol = getListRawCol(i);
                    res["clist" + (srcCol + 1)] = srcList;
                    res["clist" + (destCol + 1)] = destList;
                    // 更新数据 
                    handGroupList[i] = destList;
                    handGroupList[col] = srcList;
                }

                (function (i) {
                    API.moveObjectTo(uiId, tx, ty, time_tweenDrag, null, dragTweenComplete);

                    function dragTweenComplete() {
                        console.log("拖拽释放缓动后处理");
                        console.log("after dflag:", dflag, "i:", i, "col:", col);
                        if (!dflag) return;
                        
                        destList = handGroupList[i];
                        srcList = handGroupList[col];
                        console.log("拖动后处理数据 destlist2222: ", JSON.stringify(destList), " srclist: ", JSON.stringify(srcList));
                        
                        // 这里需要从字典取出列表ID，索引会因为列表水平移动而打乱位置变得不可靠
                        var listId = listDict[i];
                        API.update(listId);
                        console.log("更新 ", listId);
                        var htweenFlag = false;
                        if (srcList.length === 0) {
                            listId = listDict[col];
                            API.update(listId);
                            console.log("index=0 更新 ", listId);
                            htweenFlag = true;
                            // 水平缓动
                            tweenHorizontal();
                        } else {
                            // 如果是拖拽最上面的，则不垂直缓动，直接更新
                            if (index === 0) {
                                listId = listDict[col];
                                API.update(listId);
                                console.log("更新 ", listId);
                            } else {
                                // 垂直缓动
                                tweenVertical(col, index);
                            }
                        }

                        // 只得一个，有可以是拖拽在卡牌外围，中间有空列
                        if (destList.length === 1 && !htweenFlag) {
                            tweenHorizontal();
                        }
                    }
                })(i);

                break;
            }
        }
    }

    function calcCenterSides() {
        var alist;
        var ocenter = {
            left: 0,
            right: 0
        };
        for (var i = 0; i < handGroupList.length; i++) {
            alist = handGroupList[i];
            if (alist.length != 0) {
                if (i <= middleIndex) {
                    ocenter.left++;
                } else {
                    ocenter.right++;
                }
            }
        }
        return ocenter;
    }

    var movingSignal = 0;  // 移动中的卡牌列表
    // 移动中的卡牌处理中心
    var movingCenter = {};
    // 处理水平缓动
    function procTweenHorizontal(emptyIndex, solidIndex, itime) {
        var emptyList, targetList;
        var targetId, swapId, targetUI, swapUI;
        emptyList = handGroupList[emptyIndex];
        targetList = handGroupList[solidIndex];
        if (targetList.length != 0) {
            console.log("emptyindex:", emptyIndex, "solidIndex:", solidIndex);
            targetId = listDict[solidIndex]; // 要移动的列表
            targetUI = API.getUI(targetId);
            swapId = listDict[emptyIndex]; // 空列表
            swapUI = API.getUI(swapId);
            // 先将右侧空列表的坐标直接设置为左侧的坐标，然后左侧列表移动到右侧列表原来的坐标
            var dest = {
                x: swapUI.x,
                y: swapUI.y
            }; // 空列表的原坐标
            swapUI.x = targetUI.x;
            swapUI.y = targetUI.y;
            // 同步索引数据, 交换索引位置
            listDict[solidIndex] = swapId;
            listDict[emptyIndex] = targetId;
            var beforeCol = targetUI.store.col;
            targetUI.store.col = swapUI.store.col;
            swapUI.store.col = beforeCol;

            // 移动
            (function (col, targetId, destx, desty, itime) {
                // todo 处理这个状况
                // 移动ID一样的话，可能会有问题(id1移动中接收到再次变动的id1移动信息)
                // todo 还有一种情况，移动中时，被移除出手牌，也要处理
                console.log("moving before col:", col, "targetId:", targetId, "destx:", destx, "desty:", desty, "itime:", itime);
                var mstore = movingCenter[targetId];
                console.log("would move mstore:", mstore);
                if (mstore && mstore.times >= 1) {
                    mstore.destx = destx;
                    mstore.desty = desty;
                    mstore.col = col;
                    mstore.times = mstore.times + 1;
                    movingCenter[targetId] = mstore;
                } else {
                    var mtimes = mstore ? mstore.times - 1 : 1;
                    mtimes = mtimes > 0 ? mtimes : 1;
                    mstore = {
                        col: col,
                        destx: destx,
                        desty: desty,
                        times: mtimes
                    };
                    movingCenter[targetId] = mstore;
                    toMove(col, targetId, destx, desty, itime);
                }
                console.log("would move mstore2:", mstore);
            })(targetUI.store.col, targetId, dest.x, dest.y, itime);

            if (emptyIndex > solidIndex) {
                console.log("水平缓动 左侧 -> 中间，索引", solidIndex, "->", emptyIndex, "json:", JSON.stringify(targetList));
            } else {
                console.log("水平缓动 右侧 -> 中间，索引", solidIndex, "->", emptyIndex, "json:", JSON.stringify(targetList));
            }
            handGroupList[emptyIndex] = targetList;
            handGroupList[solidIndex] = emptyList;
            console.log(emptyIndex, "索引 json: ", JSON.stringify(targetList));
            console.log(solidIndex, "索引 json: ", JSON.stringify(emptyList));
        }
    }

    function toMove(col, targetId, destx, desty, itime) {
        (function __toMove(col, targetId, destx, desty, itime) {
            console.log("to move -> col:", col, "targetId:", targetId, "destx:", destx, "desty:", desty, "itime:", itime);
            movingSignal += 1;
            console.log("move before -> movingSignal:", movingSignal);
            API.moveObjectTo(targetId, destx, desty, time_tweenHorizontal + itime, null, function () {
                // 刷新后又需要做蒙灰处理
                var lcol = getListRawCol(col);
                API.update("卡牌组" + (lcol + 1));
                var listUI = API.getUI("卡牌组" + (lcol + 1));
                // 卡牌蒙灰处理
                var colList = handGroupList[col];
                procCardDark(colList, col);
                console.log("水平缓动完成，更新卡牌组" + (lcol + 1), "colList:", colList, "listUI x:", listUI.x, "y:", listUI.y, "itime:", itime);
                if (colList.length === 1) {
                    var testUI = API.getUI(targetId);
                    console.log("有一个列表现不对，test ui:", testUI);
                    var tchildren = API.getChildren(targetId);
                    tchildren.forEach(function (child) {
                        console.log("卡牌:", child, "坐标x:", child.x, "y:", child.y);
                    });
                }
                // 处理移动状态
                var mstore = movingCenter[targetId];
                mstore.times -= 1;
                movingCenter[targetId] = mstore;
                console.log("__toMove mstore:", JSON.stringify(mstore));
                movingSignal -= 1;
                console.log("move after -> movingSignal:", movingSignal);
                if (mstore.times > 0) {
                    __toMove(mstore.col, targetId, mstore.destx, mstore.desty, itime + 1);
                }
            });
        })(col, targetId, destx, desty, itime);
    }

    function tween_left2Right(emptyIndex) {
        var solidIndex = 0;  // 有数据的列表索引
        var emptyList, targetList;
        var increment = 0;  // 时间增量
        for (var i = emptyIndex - 1; i >= 0; i--) {
            console.log("交换前 -> emptyIndex:", emptyIndex, "i:", i, "increment:", increment);
            emptyList = handGroupList[emptyIndex];
            targetList = handGroupList[i];
            if (targetList.length != 0) {
                solidIndex = i;  // 有数据的列表索引
                (function (emptyIndex, solidIndex, itime) {
                    procTweenHorizontal(emptyIndex, solidIndex, itime);
                })(emptyIndex, solidIndex, increment++);
                // 已交换
                // emptyIndex = solidIndex;
                emptyIndex -= 1;  // 有可能连续空着几列
                i = emptyIndex;
                console.log("交换后 -> emptyIndex:", emptyIndex, "solidIndex:", solidIndex);
            }
        }
    }

    function tween_right2Left(emptyIndex) {
        var solidIndex = 0;  // 有数据的列表索引
        var emptyList, targetList;
        var increment = 0;  // 时间增量
        for (var i = emptyIndex + 1; i < handListNum; i++) {
            console.log("交换前 -> emptyIndex:", emptyIndex, "i:", i, "increment:", increment);
            emptyList = handGroupList[emptyIndex];
            targetList = handGroupList[i];
            if (targetList.length != 0) {
                solidIndex = i;  // 有数据的列表索引
                (function (emptyIndex, solidIndex, itime) {
                    procTweenHorizontal(emptyIndex, solidIndex, itime);
                })(emptyIndex, solidIndex, increment++);
                // 已交换
                // emptyIndex = solidIndex;
                emptyIndex += 1;  // 有可能连续空着几列
                i = emptyIndex;
                console.log("交换后 -> emptyIndex:", emptyIndex, "solidIndex:", solidIndex);
            }
        } 
    }

    /**
     * 水平缓动
     */
    function tweenHorizontal() {
        console.log("水平缓动");
        var mtime = 240;
        var perTime = 40;
        var currentTime = 0;
        var targetId, targetUI;
        var targetX, originX, disx, tarArr = [], disArr = [];
        var indexes = getSolidColIndexes();
        var half = Math.floor(indexes.length / 2);
        if (indexes.length > 0) {
            movingSignal ++;
        }
        var layoutTimer = setInterval(function () {
            // 左向中间
			for (var i = half; i >= 0; i--) {
                targetId = listDict[indexes[i]];
                targetUI = $(targetId);
                disx = disArr[i];
                if (!disx) {
                    originX = targetUI.x;
                    targetX = centerPosx - (half - i) * cardWidth;
                    tarArr[i] = targetX;
                    // console.log("originx:", originX, "targetx:", targetX);
                    disx = (targetX - originX) / (mtime / perTime);
                    disArr[i] = disx;
                    if (disx != 0) {
                        targetUI.x = originX + disx;
                    }
                } else {
                    if (disx != 0) {
                        targetUI.x += disx;
                    }
                }
                if (currentTime + perTime >= mtime) {
                    targetUI.x = tarArr[i];
                    API.update(targetId);
                }
                console.log("left 2 middle -> idx:", i, "disx:", disx, "targetX:", targetX, "targetUI x:", targetUI.x, "rawCol:", targetUI.store.rawCol);
            }
            // 右向中间
            for (var j = half + 1; j < indexes.length; j++) {
                targetId = listDict[indexes[j]];
                targetUI = $(targetId);
                disx = disArr[j];
                if (!disx) {
                    originX = targetUI.x;
                    targetX = centerPosx + (j - half) * cardWidth;
                    tarArr[j] = targetX;
                    // console.log("originx:", originX, "targetx:", targetX);
                    disx = (targetX - originX) / (mtime / perTime);
                    disArr[j] = disx;
                    if (disx != 0) {
                        targetUI.x = originX + disx;
                    }
                } else {
                    if (disx != 0) {
                        targetUI.x += disx;
                    }
                }
                if (currentTime + perTime >= mtime) {
                    targetUI.x = tarArr[j];
                    API.update(targetId);
                }
                console.log("right 2 middle -> idx:", j, "disx:", disx, "targetX:", targetX, "targetUI x:", targetUI.x, "rawCol:", targetUI.store.rawCol);
            }

            currentTime += perTime;
            if (currentTime >= mtime) {
                clearInterval(layoutTimer);
                movingSignal --;
                console.log("水平缓动完成，开始更新");
            }
        }, perTime);
        return;



        var circleTimes = 0;
        (function __procTween() {
            console.log("水平缓动");
            var list;
            // 左侧向中间靠拢
            for (var i = middleIndex; i >= 0; i--) {
                list = handGroupList[i];
                if (list.length === 0) {
                    (function (emptyindex) {
                        tween_left2Right(emptyindex);
                    })(i);
                    break;
                }
            }
            // 右侧向中间靠拢
            for (var i = middleIndex + 1; i < handListNum; i++) {
                list = handGroupList[i];
                if (list.length === 0) {
                    (function (emptyindex) {
                        tween_right2Left(emptyindex);
                    })(i);
                    break;
                }
            }

            // 判断是不是还有空心的列，如果有，则继续处理
            if (checkHollow()) {
                __procTween();
            }
        })();
    }

    /**
     * 实心的列数
     */
    function getSolidColIndexes() {
        var list, indexes = [];
        for (var i = 0; i < handGroupList.length; i++) {
            list = handGroupList[i];
            if (list && list.length > 0) {
                indexes.push(i);
            }
        }
        console.log("getSolidColIndexes:", JSON.stringify(indexes));
        return indexes;
    }

    /**
     * 检测手牌列表中间有没有空的
     */
    function checkHollow() {
        var list;
        var entityIndex = 0;  // 有数据的开始索引
        var hollowFlag = false;   // 空心标识
        var emptyIndex = 0;   // 空列表索引
        for (var i = 0; i < handGroupList.length; i++) {
            list = handGroupList[i];
            console.log("check hollow -> length:", list.length, "entityIndex:", entityIndex);
            if (list.length != 0 && entityIndex === 0) {
                entityIndex = i;
                continue;
            }
            if (entityIndex != 0 && list.length === 0) {
                emptyIndex = i;
                continue;
            }
            // 找到空心的列
            if (emptyIndex != 0 && list.length != 0) {
                hollowFlag = true;
                console.log("找到空心的列, col:", i);
                break;
            }
        }
        return hollowFlag;
    }

    /**
     * 垂直缓动 
     * @param {*} col 卡牌组索引
     * @param {*} pos 刚删除的索引
     */
    function tweenVertical(col, pos) {
        var lname = "卡牌组" + (getListRawCol(col) + 1);
        var itemName = "卡牌条目" + (getListRawCol(col) + 1);
        console.log("垂直缓动, ", lname, " pos: ", pos, ", ", itemName);

        if (pos === 0) return;
        var alist = handGroupList[col];
        var tx, ty, uiId;
        for (var i = pos; i > 0; i--) {
            // 计算缓动坐标
            tx = pxlist[col];
            if (alist.length === 3) {
                ty = i * cardHeight;
            } else if (alist.length === 2) {
                ty = (i + 1) * cardHeight;
            } else if (alist.length === 1) {
                ty = (i + 2) * cardHeight;
            }

            // 转换为相对拖动卡牌原来位置的坐标系
            tx = tx - pxlist[col];
            uiId = itemName + "[" + (getListRawCol(i) - 1) + "]";
            console.log("tween item: ", uiId, "tx: ", tx, "ty: ", ty);
            API.moveObjectTo(uiId, tx, ty, time_tweenVertical);
        }
        if (pos > 0) {
            // 刷新列表
            setTimeout(() => {
                console.log("垂直缓动完成");
                console.log("data: ", JSON.stringify(alist));
                var listCol = getListRawCol(col);
                API.update("卡牌组" + (listCol + 1));
                // 有可能需要水平缓动
                // tweenHorizontal();
            }, time_tweenVertical*Math.floor(1000/24));

            // API.timer.play(time_tweenVertical * pos, 1, null, tweenVerticalComplete, false, "垂直缓动");

            // function tweenVerticalComplete() {
            //     console.log("垂直缓动完成 time: ", time_tweenVertical * pos);
            //     console.log("data: ", JSON.stringify(alist));
            //     API.timer.remove("垂直缓动");
            //     API.update("卡牌组" + (col + 1));

            //     // 有可能需要水平缓动
            //     tweenHorizontal();
            // }
        }
    }

    // 卡牌排序，降序
    function cardSort(property) {
        return function (a, b) {
            var value1 = a[property];
            var value2 = b[property];
            // 降序
            return value2 - value1;
        }
    }

    return {
        printDesktopList: printDesktopList,
        printHandList: printHandList, 
        printListCol: printListCol,  // 打印列表UI索引
        init: init,
        deal: deal,
        clear: clear,             // 清理
        reset: reset,             // 重置桌面
        showCard: showCard,       // 亮张或者出牌
        deleteCard: deleteCard,   // 删除卡牌映射
        dragCalc: dragCalc,       // 卡牌拖拽释放处理
        swap2Top: swap2Top,       // 将卡牌容器层次提到顶层
        setHandGroups: setHandGroups,              // 设置手牌卡组数据
        setDesktopGroups: setDesktopGroups,        // 设置桌牌卡组数据 
        setDiscards: setDiscards,                  // 设置弃牌数据
        appendHandGroups: appendHandGroups,        // 追加手牌卡组数据
        appendDesktopGroups: appendDesktopGroups,  // 追加桌牌卡牌数据
        appendDiscards: appendDiscards,            // 追加弃牌数据
        refreshHandGroups: refreshHandGroups,      // 刷新手牌卡组
        updateCardStyle: updateCardStyle,          // 刷新卡牌皮肤(设置换卡牌字体)
        updateCardScale: updateCardScale,          // 更新卡牌牌面大小 
        resetHandGroups: resetHandGroups,          // 重设手牌数据(会刷新手牌布局)
    };

})(Game, manager || {});

var deal = pgame.deal;
var dragCalc = pgame.dragCalc;
var swap2Top = pgame.swap2Top;

// ===================================== 收发协议 ===================================== // 

// ------------------------------------- 发出的协议 ----------------------------------- // 

/**
 * 1000
 * 返回大厅
 */
Game.requestBack2Hall = function () {
    var res = API.data;
    var gameName = manager.roomData.playTypeName;
    var hallKey = res.hallKey;
    var version = res.version;
    console.log("back 2 hall, gameName:", gameName, "hallKey:", hallKey, "version:", version);
    WS.socket.send(WS.writeMessage(1000, null, function (writer) {
        writer.writeString(gameName);
        writer.writeString(hallKey);
        writer.writeString(version);
    }));
}

/**
 * 1001
 * 进入房间
 */
Game.requestEnterRoom = function () {
    var res = API.data;
    var roomKey = res.roomKey;
    var version = res.version;
    var uip = res.uip;
    console.log("to enter room 1001, roomKey:", roomKey, "version:", version, "uip:", uip, "userID:", manager.myUserID);
    WS.socket.send(WS.writeMessage(1001, null, function (writer) {
        writer.writeString(roomKey);
        writer.writeString(version);
        writer.writeString(uip);
    }));
}

/**
 * 2000
 * 请求规则
 */
Game.requestGetRules = function () {
    var roomKey = API.data.roomKey;
    console.log("phz get rules, roomKey:", roomKey);
    WS.socket.send(WS.writeMessage(2000, null, function (writer) {
        writer.writeString(roomKey);
    }));
}

/**
 * <pre>
 * 11403
 * 发起解散
 * 返回{@link #SM_CHESS_START_DISMISS_RESULT}
 * 普通开房，未开局时，房主强制为解散，非房主强制为悄悄离开
 * 代开房，未开局时，[房主可选择解散和离开]；非房主强制为悄悄离开
 * 当已经开局时，所有玩家强制为解散；
 * 
 * boolean true发起解散，false悄悄离开－－此值只有代开房未开局时房主有效
 * </pre>
 */
Game.requestDismiss = function () {
    var dismissOrLeave = manager.isRoomOwner;
    console.log("request dismiss room. dismissOrLeave:", dismissOrLeave);
    WS.socket.send(WS.writeMessage(11403, null, function (writer) {
        writer.writeBoolean(dismissOrLeave);
    }));
}

/**
 * <pre>
 * 11405
 * 同意或拒绝解散
 * 
 * boolean 是否同意
 * </pre>
 */
Game.requestSureDismiss = function (sure) {
    WS.socket.send(WS.writeMessage(11405, null, function (writer) {
        writer.writeBoolean(sure);
    }));
}

/**
 * 11441
 * 确认一局结算信息
 */
Game.requestConfirmRoundEnd = function () {
    WS.socket.send(WS.writeMessage(11441, null, function (writer) {

    }));
}

/**
 * <pre>
 * 11412
 * 打坨
 * boolean 是否打坨
 * 本消息会广播{@link #SM_CHESS_DATUO_RESULT}给三个玩家
 * </pre>
 */
Game.requestDaTuo = function (isDaTuo) {
    WS.socket.send(WS.writeMessage(11412, null, function (writer) {
        writer.writeBoolean(isDaTuo);
    }));
}

/**
 * <pre>
 * 11415
 * 举手确认
 * 本消息会广播{@link #SM_CHESS_HANDSHAKE_RESULT}给三个玩家
 * 
 * boolean 是否举手
 * </pre>
 */
Game.requestHandUp = function (isHandUp) {
    WS.socket.send(WS.writeMessage(11415, null, function (writer) {
        writer.writeBoolean(isHandUp);
    }));
}

/**
 * <pre>
 * 11416
 * 掀明招打牌确认
 * 返回{@link #SM_CHESS_PLAYCARD_RESULT}
 * 
 * int cardId
 * </pre>
 */
Game.requestConfirmShowPublicCard = function (cardId) {
    WS.socket.send(WS.writeMessage(11416, null, function (writer) {
        writer.writeInt(cardId);
    }));
}

/**
 * <pre>
 * 11423
 * 请求对手牌重新排序
 * </pre>
 */
Game.requestResortCard = function () {
    WS.socket.send(WS.writeMessage(11423, null, function () {

    }));
}

/**
 * <pre>
 * 11428
 * 准备确认
 * 本消息会广播{@link #SM_CHESS_READY_RESULT}给三个玩家
 * 
 * boolean 是否准备
 * </pre>
 */
Game.requestReady = function () {
    var isReady = !manager.isReady;
    manager.isReady = isReady;
    console.log("request ready: ", manager.isReady);
    WS.socket.send(WS.writeMessage(11428, null, function (writer) {
        writer.writeBoolean(isReady);
    }));
}

/**
 * <pre>
 * 11432
 * 打手牌
 * 返回{@link #SM_CHESS_PLAYCARD_RESULT}
 * 
 * byte cardId
 * </pre>
 */
Game.requestPlayCard = function (cardId) {
    WS.socket.send(WS.writeMessage(11432, null, function (writer) {
        writer.writeByte(cardId);
    }));
    manager.clearDealTimer();
}

// 比牌列表点击
function onCompareListClick(uid, index) {
    console.log("compare list click -> uid:", uid, "index:", index);
    // 找到该条目的列
    var col = uid.substring(4);
    col = col - 1;  // col - 1, ui是从1开始的
    console.log("col:", col);
    var res = API.data;
    var eatGroup = res["eatGroup"];
    var compareGroups = res["compareGroups"];
    var group = compareGroups[col];  
    // 比牌
    Game.requestEatCard(3, [eatGroup, group]);    
}

// 吃牌列表点击
function onEatListClick(uid, index) {
    console.log("eat list click -> uid:", uid, "index:", index);
    /*
    * byte 胡1碰2吃3过4
    * if(吃3){
    *  byte 吃比牌组数量m
    *  for(0~m){
    *      //一个牌组3张牌
    *      for(0~3){
    *          byte cardId
    *      }
    *  }
    * }
    */ 
    // 找到该条目的列
    var col = uid.substring(4);
    col = col - 1;  // col - 1, ui是从1开始的
    console.log("col:", col);
    var res = API.data;
    var groups = res["eatGroups"];
    var group = groups[col];  
    // console.log("groups:", "group:", JSON.stringify(group));
    var compareGroups = res["compareGroups"];
    if (compareGroups) {
        res["eatGroup"] = group;
        API.getUI("比牌容器").visible = true;
    } else {
        // 吃牌
        Game.requestEatCard(3, [group]);    
    }
}

/**
 * <pre>
 * 11436
 * 进牌：胡碰吃过
 * 返回通用结果{@link #SM_CHESS_EATCARD_RESULT}
 * 
 * byte 胡1碰2吃3过4
 * if(吃3){
 *  byte 吃比牌组数量m
 *  for(0~m){
 *      //一个牌组3张牌
 *      for(0~3){
 *          byte cardId
 *      }
 *  }
 * }
 * </pre>
 */
Game.requestEatCard = function (actType, eatGroups) {
    // 吃选项显示或隐藏吃牌容器
    if (actType === 3 && !eatGroups) {
        API.getUI("吃牌容器").visible = !API.getUI("吃牌容器").visible;
        return;
    }
    var res = API.data;
    var actionType = actType || res["actionType"];
    var groups = eatGroups;
    console.log("11436 request eat card. actionType:", actionType, " groups:", groups);
    WS.socket.send(WS.writeMessage(11436, null, function (writer) {
        writer.writeByte(actionType);
        var length = groups ? groups.length : 0;
        var groupTree, cards;
        var cardId;
        if (actionType == 3) {
            writer.writeByte(length);
            for (var i = 0; i < length; i++) {
                groupTree = groups[i];
                cards = groupTree.group.cards;
                console.log("吃牌组", i);
                // console.log("cards:", JSON.stringify(cards));
                for (var j = 0; j < 3; j++) {
                    cardId = cards[j].id;
                    console.log("吃牌组卡 id:", cardId);
                    writer.writeByte(cardId);
                }
            }
        } else if (actionType == 18) {
            writer.writeByte(length);
            for (var m = 0; m < length; m++) {
                groupTree = groups[m];
                cards = groupTree.group.cards;
                console.log("溜牌组", m);
                for (var n = 0; n < 4; n++) {
                    cardId = cards[n].id;
                    console.log("溜牌组卡 id:", cardId);
                    writer.writeByte(cardId);
                }
            }
        }
    }));
}

/**
 * <pre>
 * 11452
 * 发送聊天
 * 广播结果{@link #SM_CHESS_CHAT_RESULT}
 * 
 * boolean true表情,false语音
 * byte id 预设的表情ID，语音ID
 * </pre>
 */
Game.requestChat = function (isEmoji, id) {
    WS.socket.send(WS.writeMessage(11452, null, function (writer) {
        writer.writeBoolean(isReady);
        writer.writeByte(id);
    }));
}

/**
 * 邀请好友
 */
Game.phzInviteFriends = function () {
    API.showUI("发送朋友提示");

    var plength = manager.players.length;
    var res = API.data;
    var json = res["玩法设置"];
    var setting = JSON.parse(json);
    // [局数，tab页玩法类型，选项数量，for [玩法，规则，充囤]]
    var phz = JSON.parse(setting.PHZ);
    console.log("setting:", json, "phz:", phz);
    var round = phz[0];
    // 规则
    var ruleIndex = 5;  // 规则开始的索引
    var ruleNum = phz[ruleIndex];
    console.log("rule num:", ruleNum, "ruleIndex:", ruleIndex, "phz len:", phz.length);
    ruleIndex += 1;
    var ruleArr = [];
    var moreFlag;  // 规则太多的标识
    for (var i = 0; i < ruleNum; i++) {
        var rule = srules[phz[ruleIndex] - 1];  // 保存的规则的值是从1开始的，所以-1
        // 太多规则了，屏蔽掉
        // if (ruleArr.length >= 1) {
        //     moreFlag = true;
        //     break;
        // }
        ruleArr.push(rule);
        console.log("规则:", rule, "pos:", ruleIndex);
        ruleIndex += 1; 
    }
    var ruleStr = ruleArr.join("、");
    // 太多规则
    // if (moreFlag) {
    //     ruleStr += "等";
    // }
    console.log("选择的规则:", ruleStr);
    // 充囤
    var tuoIndex = phz.length - 3;
    var tuo = phz[tuoIndex];

    var title = "房间号【" + res.roomID + "】" + setting["PLAYER_COUNT"] + "缺" + (setting["PLAYER_COUNT"] - plength);
    var desc = getRuleDesc();
    winxin(title, desc);

    function getRuleDesc() {
        var str = manager.roomData.playTypeName + "、" + round + "局、" + manager.roomData.playSubTypeName + "、" + ruleStr + "、充囤" + tuo + "分";
        console.log("rule desc:", str);
        return str;
    }
}

// ------------------------------------ 收到的协议 -------------------------------------- //

/**
 * 1001
 * 进入房间
 * @param {*} d 
 */
Game.onEnterRoom = function (d) {
    console.log("1001 进入房间");

    // 请求规则
    Game.requestGetRules();
}

/**
 * 1003
 * 加入房间。有玩家加入房间，房主会收到11411， 11409
 * @param {*} d 
 */
Game.onJoinRoom = function (d) {
    var res = API.data; //1003
    res.roomIP = d.readString();
    res.roomKey = d.readString();
    res.serverID = d.readIn();
    console.log("1003 加入房间");
}

/**
 * 1030
 * 未开局退出房间
 */
Game.onQuitRoom_notify = function (d) {
    var leaveId = d.readLong();
    var players = manager.roomData.players;
    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        if (player.accountId === leaveId) {
            // 准备图标隐藏
            API.getUI("准备" + player.pos).visible = false;
            manager.roomData.players.splice(i, 1);
            console.log("有玩家未开局离开房间, leaveId:", leaveId);
            break;
        }
    }
    // 更新玩家位置信息
    manager.updatePosition();
    console.log("1030 未开局退出房间, leaveId:", leaveId);
}

/**
 * 2000
 * 获得规则
 * @param {*} d 
 */
Game.onGetRules = function (d) {
    var res = API.data;
    res["玩法设置"] = d.readString();
    res.player_custom_json_str = d.readString();
    var cjson = JSON.parse(res.player_custom_json_str);
    res.inClub = cjson.IN_CLUB;

    console.log("2000 跑胡子获得规则 -> 玩法设置:", res["玩法设置"], " custom json:", res.player_custom_json_str);
}

/**
 * <pre>
 * 11403
 * 解散房间结果
 * 
 * boolean 是否成功
 * String tips
 * </pre>
 */
Game.onDismissResult = function (d) {
    var isSuccess = d.readBoolean();
    var tips = d.readString();
    console.log("11403 解散房间结果 -> success:", isSuccess, "tips:", tips);
    if (isSuccess) {
        API.hideUI(["屏蔽遮罩1", "设置面板"]);
    } else {
        tips.length && API.runActionGroup("错误提示", tips);
    }
}

// 处理解散面板的选择提示
function procAgreeDismissTips (player, isAgree) {
    if (!player) return;

    var res = API.data;
    res["选择提示" + player.pos] = isAgree ? "同意" : "未选择";
    var tipsUI = API.getUI("选择提示" + player.pos);
    if (isAgree) {
        tipsUI.appendStyle({
            color: 'rgba(34,177,0,1)'
		});
    } else {
        tipsUI.appendStyle({
			color: 'rgba(198,188,67,1)'
		});
    }
    API.update("选择提示" + player.pos);
    console.log("proc agree tips -> pos:", player.pos, "agree:", isAgree);
}

/**
 * 开始同意倒计时
 */
function startAgreeTimer (seconds) {
    var res = API.data;
    var frame = 0;  // 当前帧
    var framesPerSec = 24;  // 一秒多少帧
    var execTimes = 60*3;    // 执行次数
    var lastSeconds = seconds;  // 剩余多少秒
    (function () {
        console.log("timer start");
        // 隔多少帧执行，执行多少次，每次执行的函数，完成执行的函数，布尔值是否循环，timer名称
        // 一秒执行一次
        API.timer.play(framesPerSec, execTimes, function () {
            lastSeconds --;
            if (lastSeconds >= 0) {
                updateTimer(lastSeconds);
            }
        }, function () {
            console.log("timer end");
            // 倒计时结束
            API.timer.remove("agreeTimer");
        }, false, "agreeTimer");
    })();

    function updateTimer(seconds) {
        var m = Math.floor((seconds / 60 % 60));
        var s = Math.floor((seconds % 60));
        m = m < 10 ? "0" + m : m;
        s = s < 10 ? "0" + s : s;
        var str = m + ":" + s;
        res["agreeTimer"] = str;
        API.update("选择倒计时");
        // console.log("timer str:", str);
    }
}

/**
 * 停止同意倒计时
 */
function stopAgreeTimer() {
    API.timer.remove("agreeTimer");
}

/**
 * <pre>
 * 11404
 * 服务器询问玩家是否愿意解散房间
 * long 请求玩家id
 * int 多少秒后解散(为了断线重连显示)
 * </pre>
 */
Game.onDismissAsk = function (d) {
    var accountId = d.readLong();
    var seconds = d.readInt();
    console.log("11404 询问是否愿意解散房间 -> accountId:", accountId, "myAccountId:", manager.myAccountID, "seconds:", seconds);
    API.showUI("屏蔽遮罩1", "游戏桌面2");
    API.showUI("解散房间面板", "游戏桌面2");
    startAgreeTimer(seconds);

    var res = API.data;
    var reqPlayer = manager.getPlayer(accountId);
    res["申请玩家"] = reqPlayer.name;
    API.update("申请玩家");

    var players = manager.players;
    for (var i=0; i<players.length; i++) {
        var player = players[i];
        // 选择提示处理
        procAgreeDismissTips(player, accountId == player.accountId ? true : false);
        res["playerName" + player.pos] = player.name;
        API.update("玩家名字" + player.pos);
        console.log("玩家名字 pos:", player.pos);
    }

    // 解散，不同意按钮处理
    if (accountId === manager.myAccountID) {
        API.getUI("解散房间").visible = false;
        API.getUI("不同意按钮").visible = false;
    } else {
        API.getUI("解散房间").visible = true;
        API.getUI("不同意按钮").visible = true;
    }
}

/**
 * <pre>
 * 11405
 * 同意解散结果
 * 
 * boolean 是否成功
 * String tips
 * </pre>
 */
Game.onSureDismiss = function (d) {
    var isSuccess = d.readBoolean();
    var tips = d.readString();
    console.log("11405 同意解散结果 -> success:", isSuccess, "tips:", tips);
    if (isSuccess) {
        var player = manager.getPlayer(manager.myAccountID);
        procAgreeDismissTips(player, true);
        API.getUI("解散房间").visible = false;
        API.getUI("不同意按钮").visible = false;
    } else {
        tips.length && API.runActionGroup("错误提示", tips);
    }
}

/**
 * <pre>
 * 11406
 * 有人拒绝解散，关闭等待界面，继续游戏流程
 * 
 * long 玩家ID
 * boolean true表示拒绝，false表示同意
 * </pre>
 */
Game.onRefuseDismiss_notify = function (d) {
    var accountId = d.readLong();
    var isRefuse = d.readBoolean();
    console.log("11406 有人拒绝解散 -> accountId:", accountId, "refuse:", isRefuse);
    if (!isRefuse) {
        // 有人点同意
        var player = manager.getPlayer(accountId);
        procAgreeDismissTips(player, true);
    } else {
        // 拒绝则继续游戏
        API.hideUI("屏蔽遮罩1");
        API.hideUI("解散房间面板");
    }
}

/**
 * <pre>
 * 结算数据的KEY定义:
    public static String KEY_总得分="总得分";
    public static String KEY_胡牌局数="胡牌局数";
    public static String KEY_最大息数="最大息数";
    public static String KEY_最大番数="最大番数";
    public static String KEY_总息数="总息数";
    public static String KEY_总番数="总番数";
    public static String KEY_最高得分="最高得分";//保靖
    public static String KEY_名堂次数="名堂次数";//衡阳祁东
    public static String KEY_自摸次数="自摸次数";//衡山
    public static String KEY_点炮次数="点炮次数";//衡山
    public static String KEY_提牌次数="提牌次数";//衡山
    public static String KEY_跑牌次数="跑牌次数";//衡山
* 
* 
* 
* 
* 
* String 结算时间
* int 房间id
* String 玩法
* 房主参考{@link #SM_CHESS_玩家基本数据}
* byte 人数n
* for(0~n){//n个玩家的数据
*  附加参考{@link #SM_CHESS_玩家基本数据}
*  
*  byte 结算数据m
*  for(0~m){
*      String key 
*      String value
*  }
* }
* </pre>
*/
MgrPrototype.fetchGameResult = function (d) {
    var res = {};
    res.time = d.readString();
    res.roomId = d.readInt();
    res.playType = d.readString();
    res.banker = {}; // 庄家
    manager.fetchPlayer(d, res.banker);
    res.playerNum = d.readByte();
    var playerResults = [];
    for (var i = 0; i < res.playerNum; i++) {
        var result = {};
        result.keyValues = {};
        result.player = {};
        manager.fetchPlayer(d, result.player);
        var kvNum = d.readByte();
        for (var j = 0; j < kvNum; j++) {
            var key = d.readString();
            var value = d.readString();
            console.log("key:", key, "value:", value);
            result.keyValues[key] = value;

            // 春天事件
            if (key === "春天" || parseInt(value) === 1) {

            }
        }
        playerResults[i] = result;
    }
    res.playerResults = playerResults;
    return res;
}

/**
 * 返回大厅的数据
 * byte 服务器类型
 * string 服务器key
 * string 服务器host
 * if (服务器类型 == 1) {
 *     long 俱乐部id
 * }
 * @param {*} d 
 */
MgrPrototype.fetchBack2HallData = function (d) {
    var res = {};
    res.serverType = d.readByte(); // 服务器类型 0:大厅,1俱乐部
    res.serverKey = d.readString(); // 
    res.host = d.readString(); // 服务器host
    if (parseInt(res.serverType) === 1) {
        res.clubId = d.readLong(); // 俱乐部ID
    }
    return res;
}

/**
 * <pre>
 * 11407 1028
 * 通知客户端，强制退出房间(客户端确认后直接退出）
 * 如果有结算则附加房间结算信息(客户端确认后直接退出）
 * 
 * String tips
 * boolean 是否有房间结算信息
 * if(有房间结算信息){
 *  {@link #SM_CHESS_房间结算信息}
 * }
 * byte--服务器类型0:大厅,1俱乐部
 * String serverKey = 
 * String serverHost --服务器host
 * if (服务器类型 == 1)
 * {
 *   long 俱乐部ID
 * }
 * </pre>
 */
Game.onExit_notify = function (d) {
    var res = {};
    res.tips = d.readString();
    res.hasResult = d.readBoolean();
    if (res.hasResult) {
        res.result = manager.fetchGameResult(d);
    }
    res.back2HallData = manager.fetchBack2HallData(d);
    console.log("11407 通知退出房间 -> json:", JSON.stringify(res));

    if (res.hasResult) {
        API.hideUI("屏蔽遮罩1");
        API.hideUI("结算面板");
        API.showUI("屏蔽遮罩1", "顶层");
        API.showUI("大结算面板", "顶层");
        
        var resultData = res.result;
        var res = API.data;
        // header
        res["gameName"] = resultData["playType"];
        res["gameType"] = "";
        res["roomNo"] = resultData["roomId"];
        var owner = manager.getRoomOwner();
        res["roomOwner"] = owner.name;
        res["roomOwnerId"] = owner.accountId;
        res["date"] = resultData["time"];
        API.update(...["游戏名字", "游戏类型", "大结算房间号", "大结算房主", "大结算房主ID", "大结算日期"]);
        // content
        var pos = 0;
        for (var i = 0; i < resultData.playerNum; i++) {
            pos = i + 1;
            var playerResult = resultData.playerResults[i];
            var player = playerResult.player;
            res["bigResultId" + pos] = player.accountId;
            res["bigResultName" + pos] = player.name;
            res["bigResultIcon" + pos] = player.iconUrl;
            API.update(...["大结算ID" + pos, "大结算名字" + pos, "大结算头像" + pos]);

            res["huTimes" + pos] = playerResult.keyValues["胡牌局数"];
            res["moTimes" + pos] = playerResult.keyValues["自摸次数"];
            res["tiTimes" + pos] = playerResult.keyValues["提牌次数"];
            res["runTimes" + pos] = playerResult.keyValues["跑牌次数"];
            API.update(...["胡牌次数" + pos, "自摸次数" + pos, "提牌次数" + pos, "跑牌次数" + pos]);

            // 总成绩
            var totalScore = playerResult.keyValues["总得分"];
            var digit = 0, digits = [];
            digits = String(totalScore).split("");
            console.log("total score -> digits:", digits);
            for (var j = 0; j < digits.length; j++) {
                digit = digits[j];
                res["totalScore" + pos + "" + j] = totalScore >= 0 ? ("num_" + digit) : ("num2_" + digit);
                API.update("总成绩位数" + pos + "" + j);
            }

            var scoreUI = API.getUI("总成绩" + pos);
            if (Math.abs(totalScore) > 100) {
                if (totalScore > 0) {
                    scoreUI.x = 70;
                } else {
                    scoreUI.x = 50;
                }
            } else {
                if (totalScore >= 0) {
                    scoreUI.x = 80;
                } else {
                    scoreUI.x = 70;
                }
            }
        }
    } else {
        clearAndBack();
    }
}

// 清理并退出房间
function clearAndBack() {
    // 以防UI在之前的协议没有关闭
    API.hideUI("屏蔽遮罩1");
    API.hideUI("解散房间面板");
    // 如果是解散面板解散的，则倒计时有可能在运行中
    stopAgreeTimer();
    // 清理
    manager.clear();
    // 返回大厅
    back2Hall();
}

/**
 *  读取一个玩家的信息
 *    long userId
 *    long accountId
 *    byte 性别 1:男 0:女
 *    String roleName
 *    string 头像URL
 *    string ip
 *    byte 服务器位置
 *  特别描述..游戏逻辑所用的role_id和account_id即为平台的accountId..
 *  platform_role_id即时平台的roleId
 */
MgrPrototype.fetchPlayer = function (d, player) {
    if (!player) player = {};

    player.roleId = d.readLong();
    player.accountId = player.platformRoleId = d.readLong();
    player.sex = d.readByte();
console.log("fetch player -> accID:", player.accountId, "roleId:", player.roleId, "sex:", player.sex);
    player.name = d.readString();
    player.iconUrl = d.readString();
    player.ip = d.readString();
    player.serverIndex = d.readByte();

    // 将accountID记录下来，因为测试服没有登录，没有传accountID过来
    console.log("myUserID:", manager.myUserID, "roleID:", player.roleId);
    if (!manager.myAccountID && manager.myUserID === player.roleId) {
        manager.myAccountID = player.accountId;
    }
    return player;
}

/**
 * <pre>
 * 
 * int　房间id
 * String 玩法名称
 * String 子玩法名称
 * byte 房间最大人数
 * int 胡息上限-0表示无上限
 * int 剩余局数(无限局数时为当前第几局)
 * int 总局数(无限局数时为0)
 * for(0~3){//3个玩家的数据，依次为左中右，即初始庄下上，座位位置不变
 *  boolean 此位置是否有人
 *  if(true){
 *    附加参考{@link #SM_CHESS_玩家基本数据}
 *    int 积分
 *    boolean 是否打坨
 *    String GPS信息
 *  }
 * }
 * 房主参考{@link #SM_CHESS_玩家基本数据}
 * boolean 是否检测IP
 * boolean 是否检测GPS
 * boolean 是否代开房
 * boolean 是否已开局(打坨确认也算已开局)
 * </pre>
 */
MgrPrototype.fetchRoomData = function (d) {
    var res = {};
    res.roomId = d.readInt();
    res.playTypeName = d.readString();
    res.playSubTypeName = d.readString();
    res.playerNum = d.readByte();
    res.huxiLimit = d.readInt();
    res.roundLast = d.readInt();
    res.roundTotal = d.readInt();
    res.players = [];
    var posIndex = 0; // 用来帮助标记玩家的位置索引
    for (var i = 0; i < res.playerNum; i++) {
        var hasPlayer = d.readBoolean();
        if (hasPlayer) {
            var player = {};
            manager.fetchPlayer(d, player);
            player.gold = d.readInt();
            player.isDaTuo = d.readBoolean();
            player.location = d.readString();
            res.players.push(player);
        }
    }
    // 房主信息
    res.roomOwner = {};
    manager.fetchPlayer(d, res.roomOwner);
    res.isCheckIP = d.readBoolean();
    res.isCheckGPS = d.readBoolean();
    res.isDelegate = d.readBoolean();
    res.hasGameStarted = d.readBoolean();

    // console.log("房间信息:", JSON.stringify(res));
    return res;
}

/**
 * 清空位置信息
 */
MgrPrototype.clearPosition = function () {
    var data = API.data;
    var posIndex = 0;
    for (var i=0; i<manager.playerNum; i++) {
        posIndex += 1;
        data["nickName" + posIndex] = "";
        data["curScore" + posIndex] = "";
        data["hxNum" + posIndex] = "";
        data["headIcon" + posIndex] = "nullerror";
        API.update(...["玩家昵称" + posIndex, "胡息" + posIndex, "分数" + posIndex, "玩家头像" + posIndex]);
        console.log("clear position, pos:", posIndex);
    }
}

/**
 * 更新玩家位置信息(昵称，胡息)
 */
MgrPrototype.updatePosition = function () {
    this.clearPosition();
    var data = API.data;
    var player, posIndex = 0;
    var roomPlayers = manager.players;
    var roomOwner = manager.getRoomOwner();
    for (var i = 0; i < roomPlayers.length; i++) {
        player = roomPlayers[i];
        data["nickName" + player.pos] = player.name;
        // data["hxNum" + player.pos] = player.gold + "胡息";
        data["curScore" + player.pos] = player.gold;
        data["hxNum" + player.pos] = "0胡息";
        data["headIcon" + player.pos] = player.iconUrl;
        API.update(...["玩家昵称" + player.pos, "胡息" + player.pos, "分数" + player.pos, "玩家头像" + player.pos]);
        console.log("update position -> player id:", player.accountId, "name:", player.name, "pos:", player.pos, "url:", player.iconUrl, "owner:", roomOwner.accountId, "score:", player.gold);

        if (roomOwner.accountId === player.accountId) {
            // var posUI = API.getUI("头像框" + player.pos);
            var ownerIcon = API.getUI("房主图标");
            var ploc = API.getLocal("头像框" + player.pos);
            ownerIcon.x = ploc.x;
            ownerIcon.y = ploc.y + 1;
            ownerIcon.visible = true;
        }
    }
}

// 更新玩家胡息
MgrPrototype.updateHuxi = function (huxi, pos) {
    console.log("更新玩家胡息 -> huxi:", huxi, "pos:", pos);
    var data = API.data;
    data["hxNum" + pos] = huxi + "胡息";
    API.update("胡息" + pos);
}

/**
 * 设置房间信息数据，并处理房间位置，庄家视角：第二个玩家的位置是3(下家)，自己的位置是2，第三个玩家的位置是1(上家)(左，下，右)。非庄家视角：房主位置是1(上家), 第3个玩家的位置是3(下家)
 * @param {*} res 
 */
MgrPrototype.setRoomData = function (res) {
    manager.roomData = res;
    var players = res.players;
    var roomOwner = res.roomOwner;
    var myself = manager.getPlayer(manager.myAccountID);
    console.log("myself:", JSON.stringify(myself));
    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        console.log("player idx:", player.serverIndex, "roomid:", roomOwner.roleId, "myselfid:", manager.myUserID, "myself idx:", myself.serverIndex);
        if (myself.serverIndex > player.serverIndex) {
            player.pos = 3;    // 下家
        } else {
            player.pos = 1;    // 上家
        }
        if (player.roleId === manager.myUserID) {
            player.pos = 2;
        } else {
            if (myself.serverIndex === 1) {         // serverIndex 2下家，3上家
                player.pos = player.serverIndex === 2 ? 3 : 1;
            } else if (myself.serverIndex === 2) {  // 1上家，3下家
                player.pos = player.serverIndex === 1 ? 1 : 3;
            } else {                                // 1下家，2上家    
                player.pos = player.serverIndex === 1 ? 3 : 1;
            }
        }
        console.log("set pos:", player.pos);
        manager.roomData.players[i] = player;
    }
}

/**
 * <pre>
 * 11408
 * 通知客户端，游戏开始
 * 
 * 即从等人状态，切换到游戏状态，等待开局
 *
 * </pre>
 */
Game.onStart_notify = function (d) {
    var res = manager.fetchRoomData(d);
    // manager.roomData = res;
    manager.setRoomData(res);
    console.log("11408 推送游戏开始, json:", JSON.stringify(res));

    var data = API.data;
    data.roomNo = res.roomId;
    data.roundLast = res.roundLast;
    API.update(...["房间号", "剩余局数"]);
    data.playTypeName = res.playTypeName;  // 游戏名

    // 解散，返回按钮
    var isRoomOwner = manager.isRoomOwner;
    API.getUI("解散房间按钮").visible = isRoomOwner;
    API.getUI("返回按钮").visible = !isRoomOwner;

    manager.updatePosition();
}

/**
 * <pre>
 * 11409
 * 游戏开始前，人员同步
 * 
 * long 离开的玩家playerId
 * boolean 是否有新玩家进入
 * if(true){//玩家的数据
 *  附加参考{@link #SM_CHESS_玩家基本数据}
 *  int 积分
 *  boolean 是否打坨
 *  String GPS信息
 * }
 * </pre>
 */
Game.onRoomSync = function (d) {
    var res = {};
    res.leaveId = d.readLong();
    res.hasNewRole = d.readBoolean();
    var player = {};
    if (res.hasNewRole) {
        manager.fetchPlayer(d, player);
        player.gold = d.readInt(); // 积分
        player.isDaTuo = d.readBoolean(); // 打坨
        player.location = d.readString(); // gps
        player.isOnline = true; // 在线状态
        res.player = player;
        manager.addNewPlayer(player);
        console.log("有新玩家加入房间, roleId:", player.roleId);
    } else {
        var players = manager.roomData.players;
        for (var i = 0; i < players.length; i++) {
            player = players[i];
            if (player.roleId === res.leaveId) {
                manager.roomData.players.splice(i, 1);
                console.log("有玩家离开，leaveID:", res.leaveId, "剩余玩家:", JSON.stringify(manager.roomData.players));
            }
        }
    }
    // 更新玩家位置
    manager.updatePosition();
    console.log("11409 游戏开始前人员同步 -> json: ", JSON.stringify(res));
}

/**
 * <pre>
 *  读取一张牌信息
 *  byte id
 *  byte point 一或壹
 *  boolean true表示大字,false表示小字
 * </pre>
 */
MgrPrototype.fetchACard = function (d) {
    var card = {};
    card.id = d.readByte();
    card.value = d.readByte();
    card.isBig = d.readBoolean();
    return card;
}

/**
 * <pre>
 * 卡牌组合
 *
 * int 牌组ID
 * byte 牌张数m
 * for(0~m){
 *  参考{@link #SM_CHESS_一张牌}
 *  boolean 是否蒙灰(桌牌吃进的牌,手牌坎)
 * }
 * byte 盖牌张数（4，3，2，1，0）
 * byte 胡息
 * byte 门子类型(11提,10跑,9坎,8偎,6碰,3顺,2绞,1对(将))
 * </pre>
 */
MgrPrototype.fetchCardGroup = function (d) {
    var cardGroup = {};
    cardGroup.id = d.readInt();
    var cardNum = d.readByte();
    cardGroup.cards = [];

    for (var i = 0; i < cardNum; i++) {
        var card = manager.fetchACard(d);
        card.isDark = d.readBoolean(); // 是否蒙灰, true表示不能再操作，需要变灰
        cardGroup.cards[i] = card;
    }
    cardGroup.coverCardNum = d.readByte(); // 盖牌张数（4，3，2，1，0）
    cardGroup.huxi = d.readByte(); // 胡息
    cardGroup.actionType = d.readByte(); // 门子类型 (11提,10跑,9坎,8偎,6碰,3顺,2绞,1对(将))
    return cardGroup;
}

/**
 * <pre>
 * 
 * byte 牌组数量n
 * for(0~n){
 *  参考{@link #SM_CHESS_牌组}
 * }
 * </pre>
 */
MgrPrototype.fetchCardGroups = function (d) {
    var cardGroups = [];
    var num = d.readByte();
    for (var i = 0; i < num; i++) {
        cardGroups[i] = manager.fetchCardGroup(d);
    }
    return cardGroups;
}

/**
 * <pre>
 * 
 * byte 手牌组合n
 * for(0~n){
 *  参考{@link #SM_CHESS_牌组}
 *  
 * }
 * byte 桌牌组合n
 * for(0~n){
 *  参考{@link #SM_CHESS_牌组}
 * }
 * byte 弃牌数量n
 * for(0~n){
 *  参考{@link #SM_CHESS_一张牌}
 * }
 * </pre>
 */
MgrPrototype.fetchMyCards = function (d) {
    var cards = {};
    var cardGroup;
    // 手牌组合
    cards.handGroups = [];
    var handGroupNum = d.readByte();
    for (var i = 0; i < handGroupNum; i++) {
        cardGroup = manager.fetchCardGroup(d);
        cards.handGroups.push(cardGroup);
    }
    // 桌牌组合
    cards.desktopGroups = [];
    var desktopGroupNum = d.readByte();
    for (var i = 0; i < desktopGroupNum; i++) {
        cardGroup = manager.fetchCardGroup(d);
        cards.desktopGroups.push(cardGroup);
    }
    // 弃牌
    cards.discards = [];
    var discardNum = d.readByte();
    for (var i = 0; i < discardNum; i++) {
        var card = manager.fetchACard(d);
        cards.discards.push(card);
    }
    return cards;
}

/**
 * <pre>
 * 
 * byte 桌牌组合n
 * for(0~n){
 *  参考{@link #SM_CHESS_牌组}
 * }
 * byte 弃牌数量n
 * for(0~n){
 *  参考{@link #SM_CHESS_一张牌}
 * }
 * </pre>
 */
MgrPrototype.fetchOtherPlayerCards = function (d) {
    var cards = {};
    var cardGroup;
    // 桌牌组合
    cards.desktopGroups = [];
    var desktopGroupNum = d.readByte();
    for (var i = 0; i < desktopGroupNum; i++) {
        cardGroup = manager.fetchCardGroup(d);
        cards.desktopGroups.push(cardGroup);
    }
    // 弃牌
    cards.discards = [];
    var discardNum = d.readByte();
    for (var i = 0; i < discardNum; i++) {
        var card = manager.fetchACard(d);
        cards.discards.push(card);
    }
    return cards;
}

/**
 * <pre>
 * 开局+初始化牌局（各玩家手牌+桌牌， 亮张）消息
 * 如果玩家退出APP重新进入继续游戏，也会发送此消息
 * 
 * boolean 是否需要显示发牌动画
 * int 剩余局数(无限局数时为当前第几局)
 * byte 墩上牌数
 * boolean 是否有明示牌 (例如开局亮张，中途别人打的牌或摸出的牌）
 * if(true){
 *  参考{@link #SM_CHESS_一张牌}
 * }
 * for(0~3){//3个玩家的数据
 *  附加参考{@link #SM_CHESS_玩家基本数据}
 *  int 积分
 *  boolean 是否打坨
 *  String GPS信息
 *  boolean 是否庄家－－庄家需要显示亮张倒计时
 *  boolean 是否举手(耒阳)
 *  if(自己){
 *      自己的牌 参考{@link #SM_CHESS_我的牌}
 *  } else {
 *      别人的牌 参考{@link #SM_CHESS_别人的牌}
 *  }
 * }
 * </pre>
 */
MgrPrototype.fetchRoundData = function (d) {
    var res = {};
    res.isShowDealEffect = d.readBoolean(); // 是否显示发牌动画
    res.roundLast = d.readInt();
    res.cardNum = d.readByte();
    res.hasShowCard = d.readBoolean(); // 是否有明示牌 (例如开局亮张，中途别人打的牌或摸出的牌）
    if (res.hasShowCard) {
        res.showCard = manager.fetchACard(d);
    }

    res.players = [];
    var playerNum = manager.playerNum;
    // console.log("playnum:", playerNum, "json:", JSON.stringify(res));
    for (var i = 0; i < playerNum; i++) {
        var player = {};
        manager.fetchPlayer(d, player);
        player.score = d.readInt();
        player.isDaTuo = d.readBoolean();
        player.location = d.readString();
        player.isBanker = d.readBoolean();  // 是不是庄家
        player.isHandup = d.readBoolean();  // 是否举手
console.log("player roleId:", player.roleId, "my role ID:", manager.myUserID);
        if (player.roleId == manager.myUserID) {
            player.cards = manager.fetchMyCards(d);
        } else {
            player.cards = manager.fetchOtherPlayerCards(d);
        }
        res.players.push(player);
    }
    return res;
}

/**
 * 游戏开始
 * @param {*} res 
 */
MgrPrototype.gameStart = function (res) {
    API.showUI("游戏桌面2", "顶层");
    manager.roundData = res;
    manager.isGameRunning = true;
    var players = res.players;
    players.forEach(function(player, i) {
        // 得到有位置索引的玩家数据
        var posPlayer = manager.getPlayer(player.accountId);
        console.log("pos player:", posPlayer.pos);
        console.log("hasShowCard:", res.hasShowCard, "isBanker:", player.isBanker);
        // 设置庄家图标
        if (player.isBanker) {
            var posLoc = API.getLocal("头像框" + posPlayer.pos);
            var bankerIcon = API.getUI("庄家图标");
            bankerIcon.x = posLoc.x - 4;
            bankerIcon.y = posLoc.y + 40;
            bankerIcon.visible = true;
        }
        // 设置亮张
        if (res.hasShowCard && player.isBanker) {
            var playCard = res.showCard;
            manager.showCard(playCard, posPlayer);
            // 播放音效
            // playSound(playCard.isBig ? (playCard.value + 100) : playCard.value, posPlayer.sex);
        }
        console.log("gameStart desktop groups -> pos:", posPlayer.pos, "json:", JSON.stringify(player.cards.desktopGroups));
        
        // 设置桌牌卡组
        manager.setDesktopGroups(player.cards.desktopGroups, posPlayer);
        // 设置自己的手牌卡组
        if (player.roleId === manager.myUserID) {
            manager.setHandGroups(player.cards.handGroups);
        }
        // 设置弃牌
        manager.setDiscards(player.cards.discards, posPlayer);
    });
    // 缩放
    setTimeout(() => {
        manager.updateCardScale();
    }, 0);
    // 开房延迟调用后端返回的执行函数
    Game.startDelayCall(100, ["onCardBroadcast", "onCardActions_notify"]);
}

/**
 * 11421
 * 推送当局数据
 * @param {} d 
 */
Game.onPushRoundData = function (d) {
    var res = manager.fetchRoundData(d);
    console.log("11421 推送当局数据 -> json: ", JSON.stringify(res));

    // 准备图标隐藏
    var players = manager.players;
    for (var i=0; i<players.length; i++) {
        var player = players[i];
        var readyUI = API.getUI("准备" + player.pos);
        if (readyUI) {
            readyUI.visible = false;
        }
    }
    // 剩余局数
    var data = API.data;
    data.roundLast = res.roundLast;
    API.update("剩余局数");
    // 剩余卡数
    manager.cardNum = res.cardNum;
    updateCardNum(manager.cardNum);
    manager.gameStart(res);
}

/**
 * 刷新手牌卡组
 * @param {*} synData 
 */
MgrPrototype.refreshHandGroups = function (synData) {
    pgame.refreshHandGroups(synData);
}

/**
 * <pre>
 * 
 * 新增或更新的手牌牌组 参考{@link #SM_CHESS_牌组s}
 * byte 删除的手上牌组数量n
 * for(){
 *  int 牌组ID
 * }
 * </pre>
 */
MgrPrototype.fetchOwnCardSyncData = function (d) {
    var syncHandCards = {};
    console.log("开始读取增加或更新牌组");
    syncHandCards.addOrUpdateCardGroups = manager.fetchCardGroups(d);
    syncHandCards.deleteCardIds = [];
    console.log("开始读取删除牌组");
    var deleteNum = d.readByte();
    for (var i = 0; i < deleteNum; i++) {
        var deleteId = d.readInt();
        syncHandCards.deleteCardIds[i] = deleteId;
        console.log("读取删除牌组, deleteId:", deleteId);
    }

    return syncHandCards;
}

/**
 * <pre>
 * 11422
 * 通知客户端，庄家收回亮张
 * 
 * boolean 是否增加提牌
 * if(true){
 *  增加的桌面牌组 参考{@link #SM_CHESS_牌组s}
 * }
 * if(客户端是庄家){
 *  手牌同步 参考{@link #SM_CHESS_手牌同步数据}
 * }
 * </pre>
 */
MgrPrototype.fetchTakeBackCard = function (d) {
    var res = {};
    res.isTiPai = d.readBoolean();
    if (res.isTiPai) {
        res.cardGroups = manager.fetchCardGroups(d);
    }
    // 是否为庄家
    if (manager.isBanker(manager.myAccountID)) {
        res.syncHandCards = manager.fetchOwnCardSyncData(d);
    }
    return res;
}

/**
 * 11422
 * 庄家收回亮张
 * @param {*} d 
 */
Game.onTakeBackCard_notify = function (d) {
    var res = manager.fetchTakeBackCard(d);
    console.log("11422 庄家收回亮张 -> json: ", JSON.stringify(res));
    resetLightCardCnt();
    console.log("isBanker:", manager.isBanker(manager.myAccountID));
    if (res.isTiPai) {
        // 提牌，桌牌增加
        var banker = manager.getBanker();  // 庄家
        var posPlayer = manager.getPlayer(banker.accountId);
        manager.appendDesktopGroups(res.cardGroups, posPlayer);
    }
    // 是否为庄家
    if (manager.isBanker(manager.myAccountID)) {
        console.log("玩家是庄家，收回亮张，刷新手牌");
        // 刷新手牌卡组
        manager.refreshHandGroups(res.syncHandCards);
    }
}

/**
 * <pre>
 * 11423
 * 同步手牌结果
 * 
 * boolean 是否成功
 * String tips
 * if(成功){－－如果成功，客户端应该首先删除所有本地手牌
 *  手牌同步 参考{@link #SM_CHESS_手牌同步数据}
 * }
 * </pre>
 */
Game.onResortCardResult = function (d) {
    var res = {};
    res.isSuccess = d.readBoolean();
    res.tips = d.readString();
    if (res.isSuccess) {
        res.syncHandCards = manager.fetchOwnCardSyncData(d);
    }
    console.log("11423 同步手牌结果 -> json: ", JSON.stringify(res));

    if (res.isSuccess) {
        // 刷新手牌卡组
        manager.refreshHandGroups(res.syncHandCards);
    }
}

/**
 * <pre>
 * 11431
 * 通知客户端打手牌
 *  long roleId 
 * </pre>
 */
Game.onPlayCard_notify = function (d) {
    var accountId = d.readLong();
    
    if (accountId === manager.myAccountID) {
        manager.canPlayCard = true;
    } else {
        manager.canPlayCard = false;
    }
    // 清除上张出牌
    // manager.hideLightCard();
    // 出牌动画倒计时
    var player = manager.getPlayer(accountId);
    manager.startDealTimer(player.pos);

    console.log("11431 通知客户端出牌 -> play accountId: ", accountId, "myaccId:", manager.myAccountID, "canPlayCard:", manager.canPlayCard);
}

/**
 * <pre>
 * 11432
 * 出牌结果
 * 
 * boolean 是否成功
 * String tips
 * if(成功){
 *  手牌同步 参考{@link #SM_CHESS_手牌同步数据}
 * }
 * </pre>
 */
Game.onPlayCardResult = function (d) {
    var res = {};
    res.isSuccess = d.readBoolean();
    res.tips = d.readString();
    if (res.isSuccess) {
        res.syncHandCards = manager.fetchOwnCardSyncData(d);
        // 刷新手牌卡组
        manager.refreshHandGroups(res.syncHandCards);
        // 清空出牌倒计时
        manager.clearDealTimer();
    } else {
        res.tips.length && API.runActionGroup("错误提示", res.tips);
        // 还原打牌之前的卡组
        var data = API.data;
        var cardId = manager.reqPlayCardId;
        var reqIndex = manager.reqPlayCardIndex;
        var reqList = manager.reqPlayCardList;
        console.log("打牌失败，还原原卡组, ", "cardId", cardId, "reqIndex:", reqIndex, "json:", JSON.stringify(reqList));
        if (reqList) {
            data["clist" + (reqIndex + 1)] = reqList;
            API.update("卡牌组" + (reqIndex + 1)); 
        }
    }
    // 清除之前的打牌记录
    manager.reqPlayCardId = -1;
    manager.reqPlayCardIndex = -1;
    manager.reqPlayCardList = null;
    console.log("11432 出牌结果 -> json: ", JSON.stringify(res));
}

/**
 * <pre>
 * 打出的手牌或摸到的牌
 * 
 * boolean 是否对其它玩家隐形
 * boolean 是否摸牌
 * long playerId
 * 参考{@link #SM_CHESS_一张牌}
 * </pre>
 */
MgrPrototype.fetchPlayCard = function (d) {
    var isOtherInvisible = d.readBoolean();
    var isMoPai = d.readBoolean();
    var accountId = d.readLong();
    var card = manager.fetchACard(d);
    card.playAccountId = accountId;
    card.isMoPai = isMoPai;
    card.isOtherInvisible = isOtherInvisible;
    return card;
}

/**
 * <pre>
 * 胡碰吃过等卡组信息, 有循环引用，json打印需要特殊处理
 * byte 可选牌组n
 * for(0~n){
 *  参考{@link #SM_CHESS_牌组s}
 *  boolean 是否有下级可选牌组
 *  if(true){
 *      附加参考{@link #SM_CHESS_比牌数据数据}
 *  }
 * }
 * </pre>
 */
MgrPrototype.fetchActionCardData = function (d) {
    var actionGroups = [];
    return (function fn(d) {
        var groupNum = d.readByte();
        for (var i = 0; i < groupNum; i++) {
            var groupTree = {};
            groupTree.group = manager.fetchCardGroup(d);
            var hasChild = d.readBoolean();
            if (hasChild) {
                groupTree.child = fn(d);
            }
            actionGroups[i] = groupTree;
        }
        return actionGroups;
    })(d);
}

// 指令选项的图标URL
var actionMap = {1:"Hu", 2: "Peng", 3: "Chi", 4: "Guo"};
// 设置选项隐藏
function resetActionsInvisible() {
    var res = API.data;
    delete res["actionList"];
    API.update("指令动作列表");
}

// 重设吃牌容器
function resetEatCnt() {
    var res = API.data;
    for (var i=0; i<5; i++) {
        var uid = "吃牌列表" + (i+1)
        var ui = API.getUI(uid);
        ui.x = 5 + (60 + 5)*i;
        ui.y = 8;
        // res["eatList" + (i+1)] = [];
        delete res["eatList" + (i+1)];
        API.update(uid);

        var uid2 = "比牌列表" + (i+1);
        var ui2 = API.getUI(uid2);
        ui2.x = 5 + (60 + 5)*i;
        ui2.y = 8;
        // res["compareList" + (i+1)] = [];
        delete res["compareList" + (i+1)];
        API.update(uid2);
    }

    delete res["eatGroup"];
    delete res["eatGroups"];
    delete res["compareGroups"];
}

// 动作指令点击
function onActionClick(id, index) {
    console.log("on action click, id:", id, "index:", index);
    var res = API.data;
    var actionList = res["actionList"];
    var action = actionList[index];
    console.log("click action type:", action.type, "url:", action.url);
    Game.requestEatCard(action.type);
}

/**
 * <pre>
 * 11435
 * 打手牌后或摸牌后 推送玩家可选项：胡碰吃过
 * 
 * long 显示倒计时的角色ID 如果为0表示出牌倒计时为0
 * boolean 是否需要打牌或摸牌
 * if(true){
 *   参考{@link #SM_CHESS_出牌信息}
 * }
 * 
 * byte 可选项数量n
 * for(0~n){
 *   byte 胡1碰2吃3过4
 *   if(吃){
 *     附加参考{@link #SM_CHESS_比牌数据数据}
 *   }
 * }
 * </pre>
 */
Game.onCardActions_notify = function (d) {
    var res = {};
    res.playRoleId = d.readLong();
    res.isNeedPlayCard = d.readBoolean();
    if (res.isNeedPlayCard) {
        res.playCard = manager.fetchPlayCard(d);
    }
    res.num = d.readByte();
    res.actions = [];
    for (var i = 0; i < res.num; i++) {
        var action = {};
        action.type = d.readByte();
        action.groups = [];
        if (action.type == 3 || action.type == 18) {
            action.groups = manager.fetchActionCardData(d);
        }
        res.actions[i] = action;
    }
    // 有循环引用
    var cache = [];
    console.log("11435 打出牌后，推送玩家可选项：胡碰吃过 -> json: ", JSON.stringify(res, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    }));
    cache = null;

    // 需要出牌或摸牌
    var player;
    if (res.isNeedPlayCard) {
        var playCard = res.playCard;
        player = manager.getPlayer(playCard.playAccountId);
        // 是不是摸牌
        if (playCard.isMoPai) {
            manager.cardNum--;
            updateCardNum(manager.cardNum);
            // 对别人隐形，则只显示给自己看
            if (playCard.isOtherInvisible) {
                if (manager.myAccountID === playCard.playAccountId) {
                    manager.showCard(playCard, player);
                } 
            } else {
                manager.showCard(playCard, player);
                manager.playedCard = playCard;
                // 播放音效
                // playSound(playCard.isBig ? (playCard.value + 100) : playCard.value, player.sex);
            }
            console.log("摸牌 -> 对别人隐形:", playCard.isOtherInvisible, "myAcc:", manager.myAccountID, "playAcc:", playCard.playAccountId);
        } else {
            // 打牌
            manager.showCard(playCard, player);
            manager.playedCard = playCard;
            console.log("打牌");
            // 播放音效
            // playSound(playCard.isBig ? (playCard.value + 100) : playCard.value, player.sex);
        }
    }

    if (res.playRoleId === 0 && player) {
        // 出牌倒计时为0
        // manager.showDealZero(player.pos);
    } else {
        // 出牌倒计时
        var playing = manager.getPlayer(res.playRoleId);
        manager.startDealTimer(playing.pos);
    }

    // 可选动作数量
    var anum = res.num;
    var actions = res.actions;

    var res = API.data;
    // 与吃牌列表长度关联的间隔大小
    var gapMap = [0, 0, 30, 20, 5, 5, 5];
    var borderMap = [0, 120, 80, 50, 30, 10, 0];
    // 与吃牌列表长度关联的宽度
    var widthMap = [0, 120, 200, 260, 320, 350, 400];
    if (anum > 0) {
        API.showUI("指令容器", "游戏桌面2");
        API.getUI("指令容器").visible = true;
        var eatUI = API.getUI("吃牌面板");
        var compareUI = API.getUI("比牌面板");
        var eatCnt = API.getUI("吃牌容器");
        var compareCnt = API.getUI("比牌容器");
        // 初始化指令
        resetActionsInvisible();
        // 处理可选择的指令
        actions.forEach(function (act) {
            console.log("act type:", act.type, "url:", actionMap[act.type]);
            // 构建动作url
            act.url = actionMap[act.type];

            if (act.type === 3) {
                // 吃
                var groups = act.groups;
                console.log("吃牌卡组长度:", groups.length);
                if (groups.length > 0) {
                    resetEatCnt();
                    // 保存吃牌卡组，为选择吃牌列表处理作准备
                    res["eatGroups"] = groups;
                    // 调整容器宽度, x轴
                    eatUI.appendStyle({
                        width: widthMap[groups.length]
                    });
                    eatUI.x = (320 - eatUI.width)/2;
                    console.log("吃牌面板width:", eatUI.width);
                }
 
                var gap = gapMap[groups.length];
                groups.forEach(function (groupTree, k){
                    // groupTree.group, groupTree.child groupTree.group.cards
                    // 吃牌数据
                    var cards = groupTree.group.cards;
                    cards.forEach(function (acard) {
                        acard.card = buildCardUrl(acard);
                    });
                    var uid = "吃牌列表" + (k+1);
                    res["eatList" + (k+1)] = cards;
                    API.update(uid);
                    var ui = API.getUI(uid);
                    var startX = (eatUI.width - (60*groups.length + gap*(groups.length - 1)))/2 + 2;
                    ui.x = startX + (60 + gap)*k;
                    console.log("uix:", ui.x, "startx:", startX, "width:", eatUI.width, "gap:", gap, "glength:", groups.length);
                    console.log("吃牌数据 k", k, "json:", JSON.stringify(cards));

                    // 有比牌数据
                    var child = groupTree.child;
                    if (child) {
                        console.log("比牌卡组长度:", child.length);
                        // 保存比牌卡组，为选择比牌列表处理作准备
                        res["compareGroups"] = child;
                        // 调整容器宽度, x轴
                        compareUI.appendStyle({
                            width: widthMap[child.length]
                        });
                        compareUI.x = (320 - compareUI.width)/2;
                        var eatLoc = API.getLocal("吃牌面板");
                        // 靠近吃牌面板
                        compareCnt.x = eatLoc.x - compareUI.width - borderMap[child.length];
                        console.log("比牌面板width:", compareUI.width);
                        var gap2 = gapMap[child.length];
                        child.forEach(function (ctree, t) {
                            var cards2 = ctree.group.cards;
                            cards2.forEach(function (ccard) {
                                ccard.card = buildCardUrl(ccard);
                            });
                            var uid2 = "比牌列表" + (t+1);
                            res["compareList" + (t+1)] = cards2;
                            API.update(uid2);
                            var ui2 = API.getUI(uid2);
                            console.log("比牌列表 -> uid2:", uid2, "ui2:", ui2);
                            startX = (compareUI.width - (60*child.length + gap2*(child.length - 1)))/2 + 2;
                            ui2.x = startX + (60 + gap)*t;
                            console.log("比牌数据 cards", JSON.stringify(cards2));
                        });
                    }
                });
            }
        });

        // 刷新列表
        actions.reverse();  // 反转数组
        res["actionList"] = actions;
        API.update("指令动作列表");
        console.log("---------------------指令动作列表 x:", $("指令动作列表").x, "指令动作容器 x:", $("指令容器").x);
    } else {
        // API.getUI("指令容器").visible = false;
        API.hideUI("指令容器");
    }
}

/**
 * <pre>
 * 11436
 * 指令操作结果
 * 
 * boolean 是否成功
 * String tips
 * </pre>
 */
Game.onEatCardResult = function (d) {
    var isSuccess = d.readBoolean();
    var tips = d.readString();
    console.log("11436 结果 -> isSuccess", isSuccess, "tips:", tips);
    if (isSuccess) {
        API.getUI("比牌容器").visible = false;
        API.getUI("吃牌容器").visible = false;
        // API.getUI("指令容器").visible = false;
        API.hideUI("指令容器");
        // 清除吃牌比牌的数据
        var res = API.data;
        delete res["eatGroup"];
        delete res["eatGroups"];
        delete res["compareGroups"];

        // 展示牌消失
        resetLightCardCnt();     
    } else {
        tips.length && API.runActionGroup("错误提示", tips);
    }
}

// 在打牌时的动作图标
// 1胡2碰3吃4过, 邵阳什么的先不考虑
var actionUrlMap = {
    1: "Result_Hu",      // 胡
    2: "Result_Peng",    // 碰
    3: "Result_Chi",     // 吃
    5: "Result_Pao",     // 跑
    6: "Result_Wei",     // 偎
    7: "Result_Ti",      // 提
    8: "wai",            // 臭偎
    9: "Result_Long",    // 邵阳-龙，字牌称开场就摸到的一提牌为一龙牌
    10: "Result_Kan",    // 邵阳-坎跑
}

// 结算时的动作图标
// 门子类型 (11提,10跑,9坎,8偎,6碰,3顺,2绞,1对(将))
var resultActionUrlMap = {
    0: "YuPai",          // 余牌
    1: "Result_Jiang",   // 对，将 
    2: "Result_Jiao",    // 绞
    3: "Result_Shun",    // 顺
    4: "Result_Shun",
    5: "Result_Chi",     // 一句话，吃或顺
    6: "Result_Peng",    // 碰
    8: "Result_Wei",     // 偎
    9: "Result_Kan",     // 坎
    10: "Result_Pao",    // 跑
    11: "Result_Ti"      // 提
}

/**
 * <pre>
 * 有玩家偎提跑碰吃弃牌时，广播消息－－如果玩家有胡碰吃过选项未选，则直接跳过选择
 * 
 * boolean 是否起手提(起手提不需要清理菜单选项)
 * boolean 是否需要打牌或摸牌
 * if(true){
 *  参考{@link #SM_CHESS_出牌信息}
 * }
 * 
 * long 提偎跑碰吃弃的角色id
 * byte 提7偎6跑5碰2吃3过(弃)4邵阳-龙9邵阳-开招(坎跑)10
 * 
 * 新增或更新的桌面牌组 参考{@link #SM_CHESS_牌组s}
 * 手牌同步 参考{@link #SM_CHESS_手牌同步数据}
 * </pre>
 */
MgrPrototype.fetchCardBroadcast = function (d) {
    var res = {};
    res.isFirstTi = d.readBoolean(); // 起手提
    res.needPlayOrMo = d.readBoolean();
    if (res.needPlayOrMo) {
        res.playCard = manager.fetchPlayCard(d);
    }
    res.roleId = d.readLong();
    res.actionType = d.readByte();
    res.desktopGroups = manager.fetchCardGroups(d);
    res.syncHandCards = manager.fetchOwnCardSyncData(d);

    return res;
}

// 得到指定卡牌组的胡息
MgrPrototype.getGroupsTotalHuxi = function (cardGroups) {
    var totalHuxi = 0;
    cardGroups.forEach(function (group) {
        totalHuxi += group.huxi;
    });
    return totalHuxi;
}

/**
 * 11437
 * 卡牌广播
 * @param {*} d 
 */
Game.onCardBroadcast = function (d) {
    var res = manager.fetchCardBroadcast(d);
    console.log("11437 卡牌广播 -> json:", JSON.stringify(res));

    // 起手提不需要清理未选择的选项
    if (!res.isFirstTi) {
        // API.getUI("指令容器").visible = false;
        API.hideUI("指令容器");
    }

    if (res.needPlayOrMo) {
        var playCard = res.playCard;
        var player = manager.getPlayer(playCard.playAccountId);

        // 是不是摸牌
        if (playCard.isMoPai) {
            manager.cardNum--;
            updateCardNum(manager.cardNum);
            // 发牌音效
            playSound("phz_fapai", player.sex);
            // 对别人隐形，则只显示给自己看
            if (playCard.isOtherInvisible) {
                if (manager.myAccountID === playCard.playAccountId) {
                    manager.showCard(playCard, player);
                } 
            } else {
                manager.showCard(playCard, player);
                // 播放音效
                // playSound(playCard.isBig ? (playCard.value + 100) : playCard.value, player.sex);
            }
            console.log("摸牌 -> 对别人隐形:", playCard.isOtherInvisible, "myAcc:", manager.myAccountID, "playAcc:", playCard.playAccountId);
        } else {
            // 出牌音效
            playSound("phz_chupai", player.sex);
            // 打牌
            manager.showCard(playCard, player);
            console.log("打牌");
            // 播放音效
            // playSound(playCard.isBig ? (playCard.value + 100) : playCard.value, player.sex);
        }
    }

    var orderPlayer = manager.getPlayer(res.roleId);
    // 如果不是过，则播放相应的特效
    if (res.actionType != 4) {
        manager.playActionEffect(res.actionType, orderPlayer.pos);
        // 播放音效
        playSound(soundActionMap[res.actionType], orderPlayer.sex);
        // 偎牌需要隐藏掉
        if (res.actionType === 6) {
            manager.hideLightCard();
        }
    } else if (manager.playedCard) {
        // 弃上张的牌
        console.log("可以弃的牌:", JSON.stringify(manager.playedCard));
        manager.appendDiscards([manager.playedCard], orderPlayer);
        manager.playedCard = null;
    }

    // 追加桌牌卡组
    if (res.desktopGroups) {
        manager.appendDesktopGroups(res.desktopGroups, orderPlayer);
    }

    if (res.syncHandCards) {
        // 刷新手牌卡组
        manager.refreshHandGroups(res.syncHandCards);
    }
}

/**
 * <pre>
 * 一局结算通知,没有人输赢积分>0时表示荒庄平局
 * String 时间
 * byte　剩余墩牌数量n
 * for(0~n){
 *  参考{@link #SM_CHESS_一张牌}
 * }
 * 
 * boolean 是否胡牌（false表示平局)
 * if(胡牌){
 *  最后胡的牌 参考{@link #SM_CHESS_一张牌}
 *   if(永州 || 衡阳十胡卡 || 衡阳十五胡){//翻醒和跟醒动画
 *     是否有醒牌 
 *     if(有醒牌){
 *      醒牌　参考{@link #SM_CHESS_一张牌}
 *      中醒的牌　参考{@link #SM_CHESS_一张牌}
 *       int 类型(翻醒模式=0;//0：不带醒，1：上醒；2：中醒；3：下醒（翻醒）；4：跟醒、随醒。)
 *       int 醒数
 *     }
 *     byte 王霸转换牌数量n
 *     for(0~n){
 *       byte 王霸牌id
 *       替换后的牌 参考{@link #SM_CHESS_一张牌}
 *     }
 *  }
 * }
 * 
 * for(0~3){//3个玩家的数据
 *  long playerId
 *  int 积分----如果是回放，则需要客户端本地取数据自行计算--湘乡:表示累积胡息
 *  int 输赢积分---湘乡:表示当局胡息,如果负数表示放炮
 *  int 耒阳提龙;其它玩法0
 *  boolean 是否放炮玩家
 *  boolean 是否胡牌玩家
 *  boolean 是否庄家
 *  if(是胡牌玩家){
 *      所有胡牌牌组 参考{@link #SM_CHESS_牌组s}
 *      int 总囤数
 *      int 倍数
 *      int 囤数
 *      int 总胡息
 *      byte 花样数量m
 *      for(0~m){
 *          String 花样名称
 *          byte 番数
 *      }
 *  } else {
 *      所有手牌牌组 参考{@link #SM_CHESS_牌组s}----如果是回放，则为0，需要客户端本地取数据
 *      所有桌牌牌组 参考{@link #SM_CHESS_牌组s}----如果是回放，则为0，需要客户端本地取数据
 *  }
 *  byte 数据数量n
 *  for(0~n){
 *    String key:宁乡自摸显示、扎鸟
 *    String value
 *  }
 * }
 * </pre>
 */
MgrPrototype.fetchPushRoundEnd = function (d) {
    var roundResult = {};
    roundResult.players = [];
    console.log("读取结算消息");
    roundResult.time = d.readString();
    var cardNum = d.readByte();
    roundResult.cards = [];
    for (var i = 0; i < cardNum; i++) {
        var card = manager.fetchACard(d);
        roundResult.cards[i] = card;
        // console.log("墩牌 idx: ", i, "json: ", JSON.stringify(card));
    }
    roundResult.isHu = d.readBoolean(); // 是否胡牌
    if (roundResult.isHu) {
        roundResult.huCard = manager.fetchACard(d);
        console.log("胡的牌: ", JSON.stringify(roundResult.huCard));

        // 醒牌
        roundResult.hasXingPai = d.readBoolean();
        if (roundResult.hasXingPai) {
            roundResult.fanXingCard = manager.fetchACard(d);
            roundResult.zhongXingCard = manager.fetchACard(d);
            roundResult.fanXingType = d.readInt();
            roundResult.xingCount = d.readInt(); // 醒数
            console.log("翻醒类型: ", roundResult.fanXingType);
        }
        console.log("是否有醒牌:", roundResult.hasXingPai, " 醒数:", roundResult.xingCount);

        // 王霸转换牌
        var kingExchangeNum = d.readByte(); // 王霸转换牌数
        roundResult.kingExchangeList = []; // [king{id, card}]
        console.log("王牌数量: ", kingExchangeNum);
        for (var j = 0; j < kingExchangeNum; j++) {
            var king = {};
            king.id = d.readByte();
            king.card = manager.fetchACard(d);
            roundResult.kingExchangeCards[j] = king;
            console.log("王牌id:", king.id, "王牌转换:", JSON.stringify(king.card));
        }
    }

    var playerNum = manager.playerNum;
    for (var k = 0; k < playerNum; k++) {
        var playerResult = {};
        playerResult.roleId = d.readLong();
        playerResult.gold = d.readInt();
        playerResult.score = d.readInt();
        // 耒阳提龙;其它玩法0
        playerResult.tiLong = d.readInt();
        playerResult.isFangPao = d.readBoolean();
        playerResult.isHu = d.readBoolean();
        playerResult.isBanker = d.readBoolean(); // 是不是庄家
        // 胡牌
        if (playerResult.isHu) {
            var huInfo = {};
            huInfo.groups = manager.fetchCardGroups(d);
            huInfo.totalTimes = d.readInt(); // 总番数
            huInfo.times = d.readInt(); // 底分 倍数
            huInfo.storeNum = d.readInt(); // 囤数
            huInfo.huXi = d.readInt(); // 总胡息
            var trickNum = d.readByte(); // 花样数
            huInfo.tricks = []; // 花样
            for (var t = 0; t < trickNum; t++) {
                var trick = {};
                trick.name = d.readString();
                trick.fanNum = d.readByte(); // 番数
                huInfo.tricks[t] = trick;
            }
            playerResult.huInfo = huInfo;
        } else {
            console.log("读取手牌");
            playerResult.handGroups = manager.fetchCardGroups(d);
            console.log("读取桌牌");
            playerResult.desktopGroups = manager.fetchCardGroups(d);
        }

        // 额外数据 
        playerResult.extraDatas = {};
        var extraNum = d.readByte();
        console.log("额外的数据数量:", extraNum);
        for (var m = 0; m < extraNum; m++) {
            var extraKey = d.readString();
            var extraValue = d.readString();
            playerResult.extraDatas[extraKey] = extraValue;
            console.log("extra key:", extraKey, " value:", extraValue);
        }
        roundResult.players[k] = playerResult;
    }

    /*
    // 散豪
    roundResult.sanHaoList = {};
    var lnum = d.readByte();
    var n = 0;
    var card;
    console.log("散豪 lnum:", lnum);
    for (n = 0; n < lnum; n++) {
        card = manager.fetchACard(d);
        roundResult.sanHaoList[n] = card;
    }

    // 清溜
    roundResult.qinLiuList = {};
    lnum = d.readByte();
    console.log("lnum:", lnum);
    for (n = 0; n < lnum; n++) {
        card = manager.fetchACard(d);
        roundResult.qinLiuList[n] = card;
    }

    // 内豪
    roundResult.neiHaoList = {};
    lnum = d.readByte();
    console.log("lnum:", lnum);
    for (n = 0; n < lnum; n++) {
        card = manager.fetchACard(d);
        roundResult.neiHaoList[n] = card;
    }

    // 外豪
    roundResult.waiHaoList = {};
    lnum = d.readByte();
    console.log("lnum:", lnum);
    for (n = 0; n < lnum; n++) {
        card = manager.fetchACard(d);
        roundResult.waiHaoList[n] = card;
    }
    */

    return roundResult;
}

/**
 * 重置结算面板
 */
function resetResultPanel () {
    // 红框先隐藏
    // API.hideUI("胡红框");
    API.getUI("胡红框").visible = false;

    var data = API.data;
    data["winName"] = "";     // 名字
    data["winId"] = "";       // id
    data["winHuxi"] = "";     // 总胡息
    data["winScore"] = "0";    // 得到的积分
    data["winTun"] = "";      // 囤数
    data["winTimes"] = "";    // 总番数
    API.update(...["胜利名字", "胜利ID", "胡息", "胜利积分", "囤数", "番数"]);

    delete data["orderList"];
    delete data["huxiList"];
    API.update(...["指令列表", "胡息列表"]);

    for (var i=0; i<8; i++) {
        delete data["orderCardList" + (i + 1)];
        API.update("指令卡组列表" + (i + 1));
    }
}

// 胜利玩家容器的部分信息隐藏与否, 荒庄时隐藏
function controlWinInfoVisible (value) {
    API.getUI("胡息").visible = value;
    API.getUI("囤数").visible = value;
    API.getUI("番数").visible = value;
    API.getUI("胡火图标").visible = value;
}

/**
 * 战绩分享
 */
Game.phzShareResult = function () {
    API.showUI("发送朋友提示");

    var data = API.data;
    var roomNo = data.roomNo;
    var res = manager.resultData;
    var time = res.time;
    var owner = manager.getRoomOwner();
    var ownerName = owner.name;
    var gameName = data.playTypeName;
    var roundTotal = manager.roomData.roundTotal;
    var roundLast = manager.roomData.roundLast;
    var desc = "房间号:" + roomNo + " \n" + "结束时间:" + time + " \n" + "房主:" + ownerName + " \n" + gameName + " \n" + "局数" + roundLast + "/" + roundTotal + "\n";
    var players = res.players;
    for (var i = 0; i < players.length; i++) {
        var playerResult = players[i];
        var player = manager.getPlayer(playerResult.roleId);
        desc += player.name + " ID:" + player.accountId + " " + playerResult.gold + " \n";
    }
    console.log(desc);
    var title = gameName + "战绩分享";
    winxin(title, desc);
}

/**
 * 11440
 * 本局结束
 * @param {*} d 
 */
Game.onPushRoundEnd = function (d) {
    var res = manager.fetchPushRoundEnd(d);
    manager.resultData = res;
    console.log("11440 本局结束 -> json:", JSON.stringify(res));

    // API.getUI("比牌容器").visible = false;
    // API.getUI("吃牌容器").visible = false;
    // API.getUI("指令容器").visible = false;
    API.showUI("屏蔽遮罩1", "游戏桌面2");
    API.showUI("结算面板", "游戏桌面2");
    // 重置面板
    resetResultPanel();
    manager.isGameRunning = false;
    Game.stopDelayCall();

    var data = API.data;
    // header
    data["roomNo"] = data.roomNo;         // 房间号
    data["phzName"] = data.playTypeName;  // 游戏名
    var owner = manager.getRoomOwner();
    console.log("房主:", owner);
    data["roomOwner"] = owner.accountId;         // 房主ID
    data["resultDate"] = res.time;        // 日期
    res.cards.forEach(function (acard) {
        acard.card = buildCardUrl(acard, "s");
    });
    data["secretList"] = res.cards;
    API.update(...["房号", "游戏名", "房主ID", "结算时间", "底牌列表"]);
    
    // content
    var huCard;
    if (res.isHu) {
        // 胡牌
        huCard = res.huCard;
    }

    var list = [];  // 手牌卡组的动作卡组
    var hasMarkRemain = false;  // 是否已有余牌
    var remainCards = [];  // 剩余的卡牌
    var remainIndex = 0;   // 余牌数组的索引
    var orders = [],
        huxiList = []; // 指令列表，胡息列表
    
    var roomOwnerResult;   // 房主的数据
    var isSelfHu = false;  // 是不是当前玩家胡了
    var idx = 0; // 失败玩家的开始索引
    for (var i = 0; i < manager.playerNum; i++) {
        var playerResult = res.players[i];
        var player = manager.getPlayer(playerResult.roleId);
        if (playerResult.isHu) {
            // 胡音效
            playSound("hu", player.sex);
            
            // 当前玩家胡了
            if (player.accountId === manager.myAccountID) {
                isSelfHu = true;
            }
            // 显示
            controlWinInfoVisible(true);

            var huInfo = playerResult.huInfo;
            data["winName"] = player.name; // 名字
            data["winId"] = player.accountId; // id
            data["winHuxi"] = huInfo.huXi; // 总胡息
            data["winScore"] = playerResult.score; // 得到的积分
            data["winTun"] = huInfo.storeNum; // 囤数
            data["winTimes"] = huInfo.totalTimes; // 总番数
            API.update(...["胜利名字", "胜利ID", "胡息", "胜利积分", "囤数", "番数"]);

            // 指令动作
            var huFlag = false;  // 找到胡牌的标识
            var huCol = 0,
                huIndex = 0; // 胡的牌的列和索引
            var groups = huInfo.groups;
            groups.forEach(function (group, k) {
                huxiList.push({
                    huxi: group.huxi
                }); // 胡息列表
                // 指令牌组
                var cards = group.cards;
                cards.forEach(function (acard, t) {
                    acard.card = buildCardUrl(acard, "s");
                    // 胡的牌, 加上红框
                    if (huCard.id === acard.id) {
                        huCol = k;
                        huIndex = t;
                        huFlag = true;
                    }
                });

                // 余牌收集起来，加在列表最后
                hasMarkRemain = group.actionType === 0 ? true : hasMarkRemain;
                procRemainCards(group, remainCards, remainIndex, list, orders, cards);
                console.log("player accid:", player.accountId, "hu groups action type:", group.actionType, "cards:", JSON.stringify(cards));
            });

            // 填充列表
            var startIndex = 0;
            updateOrderHuxiList(hasMarkRemain, remainCards, orders, list, startIndex, huxiList);

            // 胡牌加红框
            if (huFlag) {
                var huItemId = "指令卡组列表" + (huCol + 1);
                // var huItemId = "指令卡条目" + (huCol + 1) + "[" + huIndex + "]";
                var loc = API.getLocal(huItemId);
                console.log("添加胡红框, itemID:", huItemId, "loc:", loc, "huIndex:", huIndex, "huCard:", huCard);
                // API.showUI("胡红框", "结算面板");
                var huFrame = API.getUI("胡红框");
                huFrame.visible = true;
                huFrame.x = loc.x;
                huFrame.y = loc.y + 38*(huIndex-1); // - 40
            }

        } else {
            // 有两种情况，一是正常的输方，一是荒庄
            // 荒庄则处理不是房主的玩家信息
            var roomOwner = manager.getRoomOwner();
            console.log("房主ID:", roomOwner.accountId, "玩家ID:", player.accountId);
            if (res.isHu || roomOwner.accountId != player.accountId){
                idx += 1;
                data["loseName" + idx] = player.name; // 名字
                data["loseId" + idx] = player.accountId; // id
                data["loseScore" + idx] = playerResult.score; // 失败积分
                API.update(...["失败名字" + idx, "失败ID" + idx, "失败积分" + idx]);
                console.log("idx:", idx, "失败名字：", player.name);
            } else {
                roomOwnerResult = playerResult;
            }
        }
    }

    if (!res.isHu) {
        // 荒庄
        data["winOrLose"] = "huangzang";  
        // 荒庄，隐藏胜利玩家容器的一些信息
        controlWinInfoVisible(false);
        // 荒庄音效
        var self = manager.getPlayer(manager.myAccountID);
        playSound("huangzhuang", self.sex);

        var ownerPlayer = manager.getPlayer(roomOwnerResult.roleId);
        data["winName"] = ownerPlayer.name; // 名字
        data["winId"] = ownerPlayer.accountId; // id
        data["winScore"] = roomOwnerResult.score; // 得到的积分
        API.update(...["胜利名字", "胜利ID", "胜利积分"]);

        var handGroups = roomOwnerResult.handGroups;
        var desktopGroups = roomOwnerResult.desktopGroups;

        console.log("荒庄 -》 handgroups:", JSON.stringify(handGroups));
        // 桌牌
        desktopGroups.forEach(function (group, k) {
            // 门子类型 (11提,10跑,9坎,8偎,6碰,3顺,2绞,1对(将))
            orders.push({
                order: resultActionUrlMap[group.actionType]
            }); // 指令列表
            
            // 指令牌组
            cards = group.cards;
            cards.forEach(function (acard, t) {
                acard.card = buildCardUrl(acard, "s");
            });
            data["orderCardList" + (k + 1)] = cards;
            API.update("指令卡组列表" + (k + 1));

            console.log("update", ("指令卡组列表" + (k + 1)));
            console.log("ownerPlayer accid:", ownerPlayer.accountId, "desktop action type:", group.actionType, "cards:", JSON.stringify(cards));
        });

        // 余牌
        handGroups.forEach(function (group, k) {
            // 指令牌组
            cards = group.cards;
            cards.forEach(function (acard, t) {
                acard.card = buildCardUrl(acard, "s");
            });

            // 余牌收集起来，加在列表最后
            hasMarkRemain = group.actionType === 0 ? true : hasMarkRemain;
            remainIndex = procRemainCards(group, remainCards, remainIndex, list, orders, cards);
            console.log("hand action type:", group.actionType, "cards:", JSON.stringify(cards)); 
        });

        // 填充列表数据
        var startIndex = desktopGroups.length;
        updateOrderHuxiList(hasMarkRemain, remainCards, orders, list, startIndex, huxiList);
    } else {
        if (isSelfHu) {
            data["winOrLose"] = "YouWin";
            playSound("phz_gameWin");
        } else {
            data["winOrLose"] = "YouLose";
            playSound("phz_gameLost");
        }
    }
    API.update("标题图片");

    // 更新指令列表，胡息列表
    function updateOrderHuxiList(hasMarkRemain, remainCards, orders, list, startIndex, huxiList) {
        // 有余牌
        if (hasMarkRemain) {
            orders.push({order: resultActionUrlMap[0]});
            list = list.concat(remainCards);
        }

        // 填充列表
        list.forEach(function (cards, k) {
            data["orderCardList" + (startIndex + k + 1)] = cards;
            var listId = "指令卡组列表" + (startIndex + k + 1);
            API.update(listId);
        });

        data["orderList"] = orders;
        data["huxiList"] = huxiList;
        API.update(...["指令列表", "胡息列表"]);
    }
}

/**
 * <pre>
 * 11441
 * 确认本局结束结果
 * 
 * boolean 是否成功
 * String tips
 * </pre>
 */
Game.onConfirmRoundEndResult = function (d) {
    var res = {};
    res.isSuccess = d.readBoolean();
    res.tips = d.readString();
    console.log("11441 确认本局结束结果 -> json:", JSON.stringify(res));

    if (res.isSuccess) {
        updateCardNum();
        API.hideUI("按钮区域");
        API.hideUI("屏蔽遮罩1");
        API.hideUI("结算面板");
        API.getUI("庄家图标").visible = false;
        manager.reset();
    }
}

/**
 * <pre>
 * 11442
 * 确认结算界面的玩家
 * 
 * long 玩家ID
 * </pre>
 */
Game.onConfirmRoundEndBroadcast = function (d) {
    var accountId = d.readLong();
    console.log("11442 确认结算界面的玩家 -> accountId:", accountId);
    var player = manager.getPlayer(accountId);
    player.isReady = true;  // 准备
    // 准备图标
    var readyUI = API.getUI("准备" + player.pos);
    readyUI.visible = player.isReady;
}

/**
 * <pre>
 * 11411
 * 玩家上线离线同步
 * 
 * long 玩家playerId
 * boolean true上线，false离线
 * </pre>
 */
Game.onRommOnlineSync = function (d) {
    var res = {};
    res.accountId = d.readLong();
    res.isOnline = d.readBoolean();
    console.log("11411 玩家上线离线同步 -> json:", JSON.stringify(res));

    var players = manager.players;
    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        if (player.accountId === res.accountId) {
            player.isOnline = res.isOnline;
            API.getUI("离线提示" + player.pos).visible = !player.isOnline;
            console.log("离线状态修改 pos:", player.pos, "isOnline:", player.isOnline);
        }
    }
}

/**
 * <pre>
 * 11412
 * 打坨广播
 * 
 * long 打坨玩家ID： 如果是自己，则有动画：按钮缩小，然后飞到玩家的头像处，头像处显示“打坨”的字样
 * </pre>
 SM_CHESS_DATUO_RESULT = 1412;
*/
Game.onDaTuoBroadcast = function (d) {
    var roleId = d.readLong();
    console.log("11412 打坨广播 -> roleId:", roleId);
}

/**
 * <pre>
 * 11413
 * 要求打坨确认
 * 
 * </pre>
 */
Game.onSelectDaTuo = function (d) {
    console.log("11413 要求打坨确认");
}

/**
 * <pre>
 * 11414
 * 要求举手确认
 * 
 * </pre>
 */
Game.onSelectHandUp = function (d) {
    console.log("11414 要求举手确认");
}

/**
 * <pre>
 * 11415
 * 举手广播
 * 
 * long 举手玩家ID
 * </pre>
 */
Game.onHandUpBroadcast = function (d) {
    var roleId = d.readLong();
    console.log("11415 举手广播 -> roleId:", roleId);
}

/**
 * <pre>
 * 11416
 * 掀明招打牌确认
 * int cardId
 * </pre>
 */
Game.onConfirmShowPublicCard = function (d) {
    var cardId = d.readInt();
    console.log("11416 掀明招打牌确认 -> cardId:", cardId);
}

/**
 * <pre>
 * 11417
 * 掀明招打牌广播
 * 
 * long 玩家ID
 * int cardId
 * </pre>
 */
Game.onShowPublicCardBroadcast = function (d) {
    var roleId = d.readLong();
    var cardId = d.readInt();
    console.log("11417 掀明招打牌广播 -> roleId:", roleId, "cardId:", cardId);
}

/**
 * <pre>
 * 11419
 * 房间已经被房主提前解散，10s后将自动返回大厅。
 * 玩家确定或关闭提示框,请发送此消息到服务器{@link #CM_CHESS_CONFIRM_ROUNDEND}
 * 
 * String tips
 * </pre>
 */
Game.onForceCloseBroadcast = function (d) {
    var tips = d.readString();
    console.log("11419 房间强制关闭广播 -> tips:", tips);
}

/**
 * <pre>
 * 11424
 * IP作弊提示
 * 
 * String 玩家A与玩家B,玩家C与玩家D的IP地址相同
 * </pre>
 */
Game.onCheatCheck = function (d) {
    var desc = d.readString();
    console.log("11424 ip作弊提示-> desc:", desc);
}

/**
 * <pre>
 * 通知客户端，玩家补牌
 * 补牌时，如果台面上有牌，则需要保持此牌不消失
 * 客户端需要处理牌墩牌数减1，提牌，以及自己手牌刷新
 * 
 * boolean 是否明示补的牌
 * byte 补牌玩家数量n
 * for(0~n){--每一次循环，牌墩均减1
 *   long 补牌玩家id
 *  if(是否明示补的牌){
 *    参考{@link #SM_CHESS_一张牌}－－－如果有多人明示，则同时放到台面，等1秒左右消失
 *  }
 *   提牌 参考{@link #SM_CHESS_牌组s}
 *    boolean 是否需要同步手牌
 *   if(是否需要同步手牌){
 *     手牌同步 参考{@link #SM_CHESS_手牌同步数据}
 *   }
 * }
 * </pre>
 */
MgrPrototype.fetchAddCard_notify = function (d) {
    var res = {};
    res.isShowAddCard = d.readBoolean();
    res.addCardPlayerNum = d.readByte();
    res.addCardPlayers = [];
    for (var i = 0; i < res.addCardPlayerNum; i++) {
        var player = {};
        player.roleId = d.readLong();
        if (res.isShowAddCard) {
            player.addCard = manager.fetchACard(d);
        }
        player.desktopGroups = manager.fetchCardGroups(d);
        player.isSyncHandGroups = d.readBoolean();
        if (player.isSyncHandGroups) {
            player.handGroups = manager.fetchOwnCardSyncData(d);
            if (player.accountId === manager.myAccountID) {
                res.syncHandCards = player.handGroups;
            }
        }
        res.addCardPlayers[i] = player;
    }
    return res;
}

/**
 * 11425
 * 补牌推送
 * @param {*} d 
 */
Game.onAddCard_notify = function (d) {
    var res = manager.fetchAddCard_notify(d);
    console.log("11425 补牌推送 -> json:", JSON.stringify(res));

    for (var i=0; i<res.addCardPlayerNum; i++) {
        manager.cardNum--;
        updateCardNum(manager.cardNum);
        var player = res.addCardPlayers[i];
        var posPlayer = manager.getPlayer(player.accountId);
        if (res.isShowAddCard) {
            // 显示补牌
            manager.showCard(res.addCard, posPlayer);
        }

        // 提牌
        if (player.desktopGroups) {
            manager.appendDesktopGroups(player.desktopGroups, posPlayer);
        }
    }

    if (res.syncHandCards) {
        // 刷新手牌卡组
        manager.refreshHandGroups(res.syncHandCards);
    }
}

/**
 * <pre>
 * 11426
 * 推送听牌数据
 * 
 * byte 听牌数量
 * for(0~n){
 *   参考{@link #SM_CHESS_一张牌}
 * }
 * </pre>
 */
Game.onHearCards = function (d) {
    var res = {};
    res.lessNums = [];
    res.hearCards = [];
    var hearNum = d.readByte();
    for (var i = 0; i < hearNum; i++) {
        res.lessNums[i] = d.readByte();    
        var card = manager.fetchACard(d);
        card.card = "tp_" + (card.isBig ? (card.value + 10) : card.value);
        res.hearCards[i] = card;
    }
    console.log("11426 推送听牌数据 -> json:", JSON.stringify(res));
    var hearUI = API.getUI("听牌容器");
    if (!hearUI) {
        console.log("听牌容器为null");
        return;
    }

    var data = API.data;
    if (res.hearCards.length > 0) {
        hearUI.visible = true;
    } else {
        hearUI.visible = false;
    }

    // 有时听的牌图标会出现白底，加个延迟
    setTimeout(() => {
        data["hearList"] = res.hearCards;
        API.update("听牌列表");    
        console.log("更新听牌列表, json:", JSON.stringify(res.hearCards));
    }, 0);
}

/**
 * <pre>
 * 11427
 * 推送定庄随机牌
 * 
 * long 庄家pid
 * byte 玩家数量n
 * for(0~n){//n个玩家的数据
 *   long 玩家家pid
 *   参考{@link #SM_CHESS_一张牌}
 * }
 * </pre>
 */
Game.onRandom2Banker = function (d) {
    var res = {};
    res.banker = d.readLong();
    res.playerNum = d.readByte();
    res.playerDatas = [];
    for (var i = 0; i < res.playerNum; i++) {
        var playerData = {};
        playerData.id = d.readLong();
        playerData.card = manager.fetchACard(d);
        res.playerDatas[i] = playerData;
    }
    console.log("11427 推送定庄随机牌 -> json:", JSON.stringify(res));
}

/**
 * <pre>
 * 11428
 * 准备广播
 * 
 * byte 玩家数量n
 * for(0~n){
 *   long 玩家ID
 *   boolean true准备false未准备
 * }
 * </pre>
 */
Game.onReady = function (d) {
    var res = {};
    var player;
    var roomPlayers = manager.roomData.players;
    var roomOwner = manager.roomData.roomOwner;
    var playerNum = d.readByte();
    res.players = [];
    for (var i = 0; i < playerNum; i++) {
        var data = {};
        data.accountId = d.readLong();
        data.isReady = d.readBoolean();
        res.players[i] = data;

        // 自己的准备状态
        if (manager.myAccountID === data.accountId) {
            console.log("is ready setter:", data.isReady);
            manager.isReady = data.isReady;
        }

        // 玩家列表的准备状态
        for (var j = 0; j < roomPlayers.length; j++) {
            player = roomPlayers[j];
            if (player.accountId === data.accountId) {
                player.isReady = data.isReady;
            }
        }
    }

    // update UI
    for (var k = 0; k < roomPlayers.length; k++) {
        player = roomPlayers[k];
        // 准备图标
        var readyUI = API.getUI("准备" + player.pos);
        if (readyUI) {
            readyUI.visible = player.isReady;
        } else {
            console.log("准备图标为null, pos:", player.pos);
        }

        if (manager.myUserID === player.roleId) {
            // 准备，取消准备按钮
            API.getUI("准备按钮").visible = !player.isReady;
            API.getUI("取消准备按钮").visible = player.isReady;
        }
        // console.log("userId:", player.roleId, "isReady:", player.isReady, "pos:", player.pos);
    }

    console.log("my role id:", manager.myAccountID);
    console.log("11428 准备广播 -> json:", JSON.stringify(res));
}

/**
 * <pre>
 * 11418
 * 要求准备确认
 * 
 * boolean true:如果未确认,显示确认按钮;false:不显示确认按钮
 * </pre>
 */
Game.onSelectReady = function (d) {
    var notReady = d.readBoolean();
    console.log("11418 要求准备确认 -> notReady:", notReady);
}

/**
 * <pre>
 * 11452
 * 广播聊天
 * 
 * long 发送者的角色ID
 * boolean true表情,false语音
 * byte id 预设的表情ID，语音ID
 * </pre>
 */
Game.onChat = function (d) {
    var res = {};
    res.roleId = d.readLong();
    res.isEmoji = d.readBoolean();
    res.id = d.readByte();
    console.log("11452 广播聊天 -> json:", JSON.stringify(res));
}

// 处理余牌
function procRemainCards(group, remainCards, remainIndex, list, orders, cards) {
    var index = remainIndex;
    // 余牌收集起来，加在列表最后
    if (group.actionType === 0) {
        var rarr = remainCards[index] || [];
        console.log("多少个余牌了:", rarr.length, "当前余牌:", cards.length, "remainIndex:", index);
        // 如果满4个则开新列
        if ((rarr.length + cards.length) <= 4) {
            rarr = rarr.concat(cards);
        } else {
            index += 1;
            rarr = [].concat(cards);
        }
        remainCards[index] = rarr;
    } else {
        // 门子类型 (11提,10跑,9坎,8偎,6碰,3顺,2绞,1对(将))
        orders.push({
            order: resultActionUrlMap[group.actionType]
        }); // 指令列表
        list.push(cards);
    }
    // console.log("hand action type:", group.actionType, "cards:", JSON.stringify(cards)); 
    return index;
}

// 手牌详情点击
function onHandCardDetailClick () {
    API.showUI("手牌详情面板", "游戏桌面2");
    API.hideUI("胡红框2");

    var res = manager.resultData;  // 结算数据
    var data = API.data;
    // content
    var huCard;
    if (res.isHu) {
        // 胡牌
        huCard = res.huCard;
    }

    var list;  // 手牌卡组的动作卡组
    var hasMarkRemain = false;  // 是否已有余牌
    var remainCards;  // 剩余的卡牌
    var remainIndex = 0;   // 余牌数组的索引
    var cards;
    var orders; // 指令列表
    for (var i = 0; i < manager.playerNum; i++) {
        orders = [];  
        list = [];  // 手牌卡组的动作卡组
        hasMarkRemain = false;  // 是否已有余牌
        remainCards = [];  // 剩余的卡牌
        remainIndex = 0;   // 余牌数组的索引
        var playerResult = res.players[i];
        var player = manager.getPlayer(playerResult.roleId);
        if (playerResult.isHu) {
            // 显示大赢家图标
            API.getUI("大赢家" + (i+1)).visible = true;

            var huInfo = playerResult.huInfo;
            data["detailName" + (i+1)] = player.name; // 名字
            data["detailId" + (i+1)] = player.accountId; // id
            data["detailHuxi" + (i+1)] = huInfo.huXi; // 总胡息
            data["detailScore" + (i+1)] = playerResult.score; // 得到的积分
            API.update(...["详情名字" + (i+1), "详情ID" + (i+1), "详情胡息" + (i+1), "详情积分" + (i+1)]);

            // 指令动作
            var huCol = 0,
                huIndex = 0; // 胡的牌的列和索引
            var groups = huInfo.groups;
            groups.forEach(function (group, k) {
                // 指令牌组
                cards = group.cards;
                cards.forEach(function (acard, t) {
                    acard.card = buildCardUrl(acard, "s");
                    // 胡的牌, 加上红框
                    if (huCard.id === acard.id) {
                        huCol = k;
                        huIndex = t;
                    }
                });

                // 余牌收集起来，加在列表最后
                hasMarkRemain = group.actionType === 0 ? true : hasMarkRemain;
                remainIndex = procRemainCards(group, remainCards, remainIndex, list, orders, cards);
            });

            // 填充列表
            var startIndex = 0;
            updateDetailList(hasMarkRemain, remainCards, orders, list, startIndex, i);

            // 胡牌加红框
            if (huCol > 0) {
                var huItemId = "详情卡组列表" + (i + 1) + "" + (huCol + 1);
                // var huItemId = "详情卡条目" + (i + 1) + "" + (huCol + 1) + "[" + huIndex + "]";
                var loc = API.getLocal(huItemId);
                console.log("添加胡红框, itemID:", huItemId, "loc:", loc);
                API.showUI("胡红框2", "手牌详情面板");
                // API.showUI("胡图标", "手牌详情面板");
                var huFrame = API.getUI("胡红框2");
                huFrame.x = loc.x+10;
                huFrame.y = loc.y + 38*(huIndex-1); // - 40
                // var huIcon = API.getUI("胡图标");
                // huIcon.x = loc.x;
                // huIcon.y = loc.y;
            }

        } else {
            // 隐藏大赢家图标
            API.getUI("大赢家" + (i+1)).visible = false;

            var handGroups = playerResult.handGroups;
            var desktopGroups = playerResult.desktopGroups;

            var huxi = 0;  // 总胡息
            // 桌牌
            desktopGroups.forEach(function (group, k) {
                // 门子类型 (11提,10跑,9坎,8偎,6碰,3顺,2绞,1对(将))
                orders.push({
                    order: resultActionUrlMap[group.actionType]
                }); // 指令列表
                
                // 指令牌组
                cards = group.cards;
                cards.forEach(function (acard, t) {
                    acard.card = buildCardUrl(acard, "s");
                });
                data["detailCardList" + (i + 1) + "" + (k + 1)] = cards;
                API.update("详情卡组列表" + (i + 1) + "" + (k + 1));

                huxi += group.huxi;
                console.log("update", ("详情卡组列表" + (i + 1) + "" + (k + 1)));
                // console.log("player accid:", player.accountId, "desktop action type:", group.actionType, "cards:", JSON.stringify(cards));
            });

            // 余牌
            handGroups.forEach(function (group, k) {
                // 指令牌组
                cards = group.cards;
                cards.forEach(function (acard, t) {
                    acard.card = buildCardUrl(acard, "s");
                });

                // 余牌收集起来，加在列表最后
                hasMarkRemain = group.actionType === 0 ? true : hasMarkRemain;
                remainIndex = procRemainCards(group, remainCards, remainIndex, list, orders, cards);
            });

            var startIndex = desktopGroups.length;
            updateDetailList(hasMarkRemain, remainCards, orders, list, startIndex, i);

            // console.log("详情 玩家ID:", player.accountId, "名字:", player.name, "i:", i);
            data["detailName" + (i+1)] = player.name; // 名字
            data["detailId" + (i+1)] = player.accountId; // id
            data["detailHuxi" + (i+1)] = huxi; // 总胡息
            data["detailScore" + (i+1)] = playerResult.score; // 得到的积分
            API.update(...["详情名字" + (i+1), "详情ID" + (i+1), "详情胡息" + (i+1), "详情积分" + (i+1)]);
        }
    }

    // 更新详情卡组列表，详情指令列表
    function updateDetailList(hasMarkRemain, remainCards, orders, list, startIndex, i) {
        // 有余牌
        if (hasMarkRemain) {
            orders.push({order: resultActionUrlMap[0]});
            list = list.concat(remainCards);
        }

        // 填充列表
        list.forEach(function (cards, k) {
            data["detailCardList" + (i + 1) + "" + (startIndex + k + 1)] = cards;
            var listId = "详情卡组列表" + (i + 1) + "" + (startIndex + k + 1);
            API.update(listId);
        });

        // console.log("orders:", JSON.stringify(orders));
        data["detailOrderList" + (i + 1)] = orders;
        API.update("详情指令列表" + (i + 1));
    }
}

// 继续游戏
function gameRestart() {
    Game.requestConfirmRoundEnd();
}