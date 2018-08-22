var api = Can.api,

    $ = (name) => api.getUI(name), //获取显示对象

    show = (name, parent) => api.showUI(name, parent), //显示组件 show(组件id,父组件id)

    hide = (name) => api.hideUI(name), //关闭组件 hide(组件id)

    update = (name) => api.update(name),

    create = (id, templateId, parent = null, style = null) => api.createUI(id, -1, templateId, parent, style);

Game.initHall = function() {
	show(...["加载界面","底层"]);
	API.update("数值组");
    var res = API.data;
    console.log("检测1000是否走完");
    res.isCallback = true;
    // Game.send(1000);
    Game.send(1143);
}
Game.updateCard = function(d) {
	var res = API.data;
    res.nickname = d.readString();
    res.card = d.readInt();
    res.gold = d.readInt();
    res.isRoom = d.readBoolean();
	update("大厅");
}



Game.send1202 = function() {
	"use strict";
	var d = API.data;
	var r = WS.writeMessage(1202, null, write);
	WS.socket.send(r);

	function write(writer) {
		writer.writeByte(d.reqType);
		if(d.reqType == 1) { //1 获取数据 2请求保存/h5不用

		} else if(d.reqType == 2) {
			writer.writeString(d.trueName); //真实姓名
			writer.writeByte(d.cardID); // 身份证
		}
	}
}


Game.shiMing = function(d){
	var res = API.data;
	res.reqType  = d.readByte();
	res.isSuccess  = d.readByte();
	
	if(res.isSuccess==0){
		window.location.href = "/cerId?token="+res.token;
		return;
	}
	
	if(res.reqType==1){
		res.trueName = d.readString();
		res.cardID = d.readString();
		API.runActionGroup("显示","实名认证弹窗");
		API.getUI("姓名输入框").value = res.trueName;
		API.getUI("身份证输入框").value = res.cardID;
	}else if(res.reqType==2){
		
	}
	
}

Game.Delegate = function(d) {
	var res = API.data; //1090
	d.readInt(); //?
	res.roomIP = d.readString();
	res.roomKey = d.readString();
	res.roomID = d.readInt();
	res.isDelegate = d.readBoolean();
	//res.isDelegateRoom = d.readBoolean();
	//	res.inviteUserIds = d.readString();
	//	res.lastRoomId = d.readInt();
	if(res.isDelegate) {
		
		//res.roomServerID = d.readInt();
	} else {
		// API.update("数值组");
		// API.load("bin/game.json");
		console.log("1090 delegate send 2000");
		WS.socket.send(WS.writeMessage(2000));
	}
}

Game.playerCustom = function(d) {
	var res = API.data; //2000玩法设置
	res["玩法设置"] = d.readString();
	res.player_custom_json_str = d.readString();
	API.hideUI(["大厅", "创建房间玩法选择", "加入房间弹窗", "房间列表", "代开房提示弹窗", "屏蔽遮罩"]);
	API.update("数组值");
}

Game.chonglian = function(d) {
	var res = API.data; //1003
	res.roomIP = d.readString();
	res.roomKey = d.readString();
	WS.socket.send(WS.writeMessage(2000));
}

Game.onGotoRoom = function (d){
	var res = API.data; //1003
	res.roomIP = d.readString();
	res.roomKey = d.readString();
	WS.socket.send(WS.writeMessage(2000));
}


Game.shopList = function(d) {
	var res = API.data;
	var num = d.readShort();
	res["商品列表"] = [];
	for(var n = 0; n < num; n++) {
		var o = {};
		o["商品ID"] = d.readInt();
		o["系统"] = d.readInt();
		var cc = o.type = d.readInt();
		o["房卡金币"] = cc == 0 ? "fangka" : "jinbika";
		o["价格"] = d.readInt() / 100;
		o["数量"] = cc == 0 ? d.readInt() + "张" : d.readInt() / 10000 + "万";
		o["赠送数量"] = d.readInt();
		res["商品列表"].push(o);
	}
	API.showUI("商城弹窗", null, 3);
}

Game.buyShop = function(t) {
	var res = API.data;
	var list = res["商品列表"][t];
	console.log("=========" + list);
	res.shop = list;
	res.delegateid = res.delegate_id;
	res.pid = list["商品ID"];
	var type = list.type == 0 ? "房卡" : "金币"
	res.Text = list["数量"] + type + " = " + list["价格"] + "元";
	console.log(list["数量"], list.type == 0 ? "房卡" : "金币", res.Text);
	if(list.type == 0) {
		API.runActionGroup("显示", res.isDelegate || res.delegate_id > 0 ? "购买弹窗" : "温馨小提示");
	} else {
		API.runActionGroup("显示", "购买弹窗");
	}
}


Game.listRooms = function(d) {
	var res = API.data; //1100
	res.maxnum = d.readByte();
	res.currpage = d.readShort();
	res.maxpage = d.readShort();
	//	if(res.roomList && res.roomList.length>=res.maxnum){
	//		return;
	//	}
	buildRoomList(d);
	//	var count = d.readShort();
	console.log(res.currpage);
	if(res["按代开房按钮"] == 1) {
		//代开房提示弹窗
		if(res.roomList && res.roomList.length >= res.maxnum) {
			API.runActionGroup("错误提示", "您的房间开太多啦！");
			return;
		}
		API.runActionGroup("显示", "代开房提示弹窗");
		return;
	} else if(res["按代开房按钮"] == 2) {
		//房间列表
		API.showUI("房间列表");
	}


}

function buildRoomList(d) {
	var res = API.data;//1101
	var count = d.readShort();
	console.log(count);
	res.roomList = [];
	for(var i = 0; i < count; i++) {
		d.readShort();
		res.roomList.push(Game.readOnRoomInfo(d));
	}
	console.log("房间列表：",res.roomList);
}
Game.refreshRoomList = function(d) {
	d.readShort();
	var o = Game.readOnRoomInfo(d);
	var res = API.data,
		isNew = true;
	for(var n = 0; n < res.roomList.length; n++) {
		if(res.roomList[n].roomID == o.roomID) {
			res.roomList[n] = o;
			isNew = false;
			break;
		}
	}
	if(isNew) {
		res.roomList.push(o);
	}
	API.update("房间列表");
	API.update("我的房间列表");
}
Game.readOnRoomInfo = function(d) {
	var o = {};//
	o.roomID = d.readInt(); //房间号;
	//console.log(res, count, o);
	o.roomKey = d.readString(); //对应的唯一key
	var roomState = o.roomState = d.readByte(); //状态 0等待 1游戏中 2结束
	if(roomState == 0) {
		o["房间状态"] = "weikaishi";
	} else if(roomState == 1) {
		o["房间状态"] = "youxizhong";
	} else if(roomState == 2) {
		o["房间状态"] = "yijieshu";
	}
	o.remainTime = d.readInt(); //剩余时间
	o.remainTime = parseInt(o.remainTime / 1000);
	o["剩余时间"] = Date.numToTime(o.remainTime);
	o.playerCount = d.readByte(); //当前玩家人数
	o.playerMax = d.readByte(); //游戏的最大人数
	o.createTime = d.readLong(); //创建时间
	o.createTime = new Date().format("YYYY/MM/DD hh:mm:ss");
	o.endTime = d.readLong(); //结束时间
	o.roomType = d.readString(); //其它参数
	var data = JSON.parse(o.roomType);
	o.SERVER_MODEL = data.SERVER_MODEL;
	for(var i = 0;i<API.data["玩法列表"].length;i++){
		if(data.SERVER_MODEL==API.data["玩法列表"][i].model)
			o.gameName = API.data["玩法列表"][i]["名称"];
	}
	// if(data.SERVER_MODEL=="zzmj"){
	// 			o.gameName = "转转麻将";
	// }else if(data.SERVER_MODEL=="hz"){
	// 			o.gameName = "红中麻将";
	// }else if(data.SERVER_MODEL=="paohuzi-cdqmt"){
	// 	o.gameName = "常德全名堂";
	// }
	o.round = d.readByte(); //局数
	o.za = d.readByte(); //扎数
	o.roomCreateId = d.readLong(); //开房人
	o.roomCreateName = d.readString(); //开房人的名字
	o.roomCreateImgUrl = d.readString(); //开房头像
	o.roomCreateAccountId = d.readInt(); //开房人的账号id
	o.curRound = d.readByte(); // 完成局数;

	var num = d.readShort();
	o.players = [];
	for(var j = 1; j < o.playerMax + 1; j++) {
		o["player" + j] = "等待玩家";
	}
	for(j = 1; j < num + 1; j++) {

		var p = {};
		d.readShort();
		p.userID = d.readLong();
		p.accountId = d.readString();
		p.name = d.readString();
		p.ico = d.readString(); // --玩家头像地址
		o.players.push(p);
		o["player" + j] = p.name;

	}
	var hasResult = o.hasResult = d.readByte();

	if(hasResult == 1) {
		var res = API.data; 
		var maxScore = 0;

		if(data.SERVER_MODEL=="zzmj") {
			num = d.readShort();
            for (i = 0; i < num; i++) {
                d.readShort();
                var p = {};
                p.userID = d.readLong(); //玩家id
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
                p.datalist = s;
                p.totalScore = d.readShort(); //分数
                if (p.totalScore > maxScore) maxScore = p.totalScore;
                p.name = d.readString(); //玩家名字
                p.accountID = d.readInt(); //玩家账号
                o.players[i] = p;
            }
            for(var i =0; i < num; i++) {
                if(!o.players) continue;
                console.log('hhah====='+maxScore);
                if(o.players[i].totalScore == maxScore && o.players[i].totalScore > 0) {
                    o.players[i].bigWin = "biaoshi_dayingjia";
                    o.players[i].zhanjibg= "changgui_2";
                } else {
                    o.players[i].bigWin = "";
                    o.players[i].zhanjibg= "changgui_1";
                }
            }
        }else if(data.SERVER_MODEL == "pdk" ) {
            num = d.readShort();
            for (i = 0; i < num; i++) {
                d.readShort();
                var p = {};
                p.playerID = d.readLong();
                p.name = d.readString();
                p.allClose = d.readShort();
                p.boom = d.readShort();
                p.totalScore = d.readShort();
                p.maxScore = d.readShort();//单局最高分
                p.winNum = d.readShort();
                p.accountId = d.readInt();
                p.iconURL = d.readString();
                var s = [];
                s.push({
                    name: "单局最高分",
                    value: p.maxScore
                });
                s.push({
                    name: "打出炸弹数",
                    value: p.boom
                });
                s.push({
                    name: "全关次数",
                    value: p.allClose
                });
                s.push({
                    name: "胜利局数",
                    value: p.winNum
                });
                p.datalist = s;

                if (p.totalScore > maxScore) maxScore = p.totalScore;
                o.players[i] = p;
            }
            for(var i =0; i < num; i++) {
                if(!o.players) continue;
                console.log('hhah====='+maxScore);
                if(o.players[i].totalScore == maxScore && o.players[i].totalScore > 0) {
                    o.players[i].bigWin = "biaoshi_dayingjia";
                    o.players[i].zhanjibg= "changgui_2";
                } else {
                    o.players[i].bigWin = "";
                    o.players[i].zhanjibg= "changgui_1";
                }
            }

        }else if(data.SERVER_MODEL == "paohuzi-cdqmt"){
            function read_player(m,player){
                player.role_id = m.readLong();
                player.account_id = m.readLong();
                player.gender = m.readByte() == 1 ? "B" :"G";
                player.name = m.readString();
                player.icon_url = m.readString();
                player.ip = m.readString();
                player.server_index = m.readByte();
            }
            function read_game_result(m) {
                var result = {};
                result.time = m.readString();
                result.room_id = m.readInt();
                result.wanfa = m.readString();
                var player_results = [];
                result.room_host = {};
                read_player(m,result.room_host);
                result.player_num = m.readByte();
                for(var i = 0;i<result.player_num;i++){
                    var obj = {};
                    // obj.player_info = {};
                    // read_player(m,obj.player_info);
                    obj.role_id = m.readLong();
                    obj.account_id = m.readLong();
                    obj.gender = m.readByte() == 1 ? "B" :"G";
                    obj.name = m.readString();
                    obj.icon_url = m.readString();
                    obj.ip = m.readString();
                    obj.server_index = m.readByte();
                    var kv_num = m.readByte();
                    var key_values =[];
                    for(var j=0;j<kv_num;j++){
                        var key = m.readString();
                        var value = m.readString();
                        key_values[key] = value;
                    }
                    obj.key_values = [];
                    obj.key_values[0] = {
                    	key:"胡牌局数",
						value:key_values["胡牌局数"]
                    };
                    obj.key_values[1] = {
                        key:"自摸次数",
                        value:key_values["自摸次数"]
                    };
                    obj.key_values[2] = {
                        key:"提牌次数",
                        value:key_values["提牌次数"]
                    };
                    obj.key_values[3] = {
                        key:"跑牌次数",
                        value:key_values["跑牌次数"]
                    };

                    obj.totalScore = key_values["总得分"];
                    if (obj.totalScore > maxScore) maxScore = obj.totalScore;

                    player_results[i] = obj;
                }
                for(var i =0; i < result.player_num; i++) {
                    console.log('hhah====='+maxScore);
                    if(player_results[i].totalScore == maxScore && player_results[i].totalScore > 0) {
                        player_results[i].Winner = "Winner";
                    } else {
                        player_results[i].Winner = "";
                    }
                }

                result.player_results = player_results;
				return result;
            }
            o.room_result = read_game_result(d);
        }else{
            num = d.readShort();
			for(i = 0; i < num; i++) {
				d.readShort();
				var p ={};
				p.userID = d.readLong(); //玩家id
				p.accountID = d.readInt(); //玩家id
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
				});
				p.datalist = s;
				p.totalScore = d.readShort(); //分数
				if(p.totalScore > maxScore) maxScore = p.totalScore;
				p.name = d.readString(); //玩家名字
                o.players[i] = p;
			}

            for(var i =0; i < num; i++) {
                if(!o.players) continue;
                console.log('hhah====='+maxScore);
                if(o.players[i].totalScore == maxScore && o.players[i].totalScore > 0) {
                    o.players[i].bigWin = "biaoshi_dayingjia";
                    o.players[i].zhanjibg= "changgui_2";
                } else {
                    o.players[i].bigWin = "";
                    o.players[i].zhanjibg= "changgui_1";
                }
            }
		}

		
	}
	return o
}
function zhanjiHallList(){
    var res = API.data;
    API.getUI("战绩内容区").value =res.zhanji.players;
    for(var i=0;i<res.zhanji.players.length;i++){
    	// for()
        API.getUI("战绩细则区[" + i + "]").value = res.zhanji.players[i].datalist;
    }
}

function showZhanji(index){
    var res = API.data;
    res.zhanji = res.roomList[index];
    if(res.zhanji.SERVER_MODEL=="paohuzi-cdqmt"){
        res.zhanji = res.zhanji.room_result;
        res.zhanji.round =res.roomList[index].round;
        res.zhanji.curRound =res.roomList[index].curRound;
        API.runActionGroup("显示","跑胡子战绩");
        API.getUI("跑胡子大结算").value =res.zhanji.player_results;
        for(var i=0;i<res.zhanji.player_results.length;i++){
        	if(res.zhanji.player_results.role_id == res.zhanji.room_host.role_id) $("跑胡子房主["+i+"]").visible = true;
            API.getUI("战绩细则[" + i + "]").value = res.zhanji.player_results[i].key_values;
        }
	}else show("查看战绩弹窗");
}


Game.deleteRoomnNum = function(d) {
	var res = API.data;
	delete res["房间号"]; //999
	API.update("输入房间号");
	console.log("==========弹窗提示");
	API.runActionGroup("弹窗提示", "房间不存在！");

}
Game.showError = function(d) {
	var res = API.data; //收到协议999
	res.code = d.readByte();
	res.needKickout = d.readBoolean();
	res.content = d.readString();
	var code = res.code;
	console.log("-------" + res.code + "-------" + res.content);
	if(code == 0) {
		API.runActionGroup("错误提示", res.content);
	} else if(code == 1) {
		API.runActionGroup("错误提示", "房间服务器不存在！");
	} else if(code == 2) {
		API.runActionGroup("弹窗提示", "房间满了！");
	} else if(code == 3) {
		API.runActionGroup("错误提示", res.content);
	} else if(code == 4) {
	} else if(code == 15) {
		API.runActionGroup("非法开房！");
	} else if(code == 5) {
		Game.deleteRoomnNum();
    } else if(code == 9) {
        API.runActionGroup("错误提示", res.content);
        API.load("bin/app.json");
	} else if(code == 27) {
		API.runActionGroup("错误提示", "重复创建房间！");
	} else if(code == 28) {
		API.runActionGroup("错误提示", "创建房间失败！");
	} else if(code == 29) {
		API.runActionGroup("错误提示", "无法加入房间！");
	} else if(code == 41) {
		API.runActionGroup("错误提示", "没有这个俱乐部！");
	} else if(code == 46) {
		API.runActionGroup("弹窗提示", "代开房达到上限！");
	} else if(code == 58) {
		API.runActionGroup("错误提示", "只允许俱乐部成员加入！");
	} else if(code == 55) {
		API.runActionGroup("错误提示", "房间已经解散！");
	}else if(code == 24){
		return ;
	} else {
		API.runActionGroup("错误提示", res.content);
		//		console.log("----999错误---"+res.code+"-------"+res.content);
	}

}
Game.cardnum = function(d) {
	var res = API.data; //1406
	res.gangID = d.readLong();
	res.outID = d.readLong();
	res.cardnum = d.readInt();
}

Game.updateCard = function(d) {
	var res = API.data; //1006
	var type = d.readByte();
	res["卡数"] = d.readInt(); //  --改变的卡
	res.currCard = d.readInt(); // --当前卡总数

	var str = "获得";
	if(type == 0) { // --更新房卡
		str = str + "房卡" + res["卡数"] + "张";
		res.card = res.currCard;
		API.update("房卡数");
	} else if(type == 1) {
		res.gold = res.currCard;
		res["卡数"] = math.floor(res["卡数"]/ 10000) + "万";
		str = str + "金币" + res["卡数"];
		API.update("金币数")
	}
	if(res.currCard>0){
		API.runActionGroup("弹窗显示",str);
	}
}

Game.matchCnt = function(d) {
	var res = API.data; //1060
	res.matchCnt = d.readInt();
	res.rank = d.readInt();
}

Game.canExit = function(d) {
	var res = API.data; //1081
	res.canExit = d.readBoolean();
	res.key = d.readString();
}

Game.flag = function(d) {
	var res = API.data; 
	res.flag = d.readBoolean();
}

Game.platf = function(d) {
	var res = API.data; 
	res.size = d.readShort(); //??
	res.index = d.readInt();
	res.thingsid = d.readInt();
	res.platf = d.readInt();
	res.money = d.readInt();
	res.card = d.readInt();

}

Game.gif = function(d) {
	var res = API.data; //1085
	res.giveid = d.readLong();
	res.givename = d.readString();
	res.reciveid = d.readLong();
	res.gifid = d.readByte();
	res.num = d.readInt();
}

Game.price = function() {
	var res = API.data; //1084
	res.num = d.readShort();
	res.id = d.readByte();
	res.price = d.readInt();
}

Game.location = function() {
	var res = API.data; //1084
	res.num = d.readShort();
	res.playerid = d.readLong();
	res.location = d.readString();
}

Game.emoid = function() {
	var res = API.data; //1024
	res.num = d.readLong();
	res.type = d.readBoolean();
	res.emoid = d.readString();
}

Game.isQuit = function() {
	var res = API.data; //1029
	res.isQuit = d.readBoolean();
	res.loginKey = d.readString();
}

Game.isAgent = function(d) {

}
Game.createClub = function() { //	发1301
	var res = API.data;
	res.clubIcon = res.clubIconid;
	res.clubName = API.getUI("俱名称框").value;
	if(res.clubName == "") {
		API.runActionGroup("错误提示", "俱乐部名称不能为空");
		return;
	}
	Game.send(1301);
}

Game.gotoCreateClub = function(d) {//收到1301
	var res = API.data,statusCode = d.readByte(),tipContent = d.readString();
	console.log("=====" + res.tipContent);
	if(statusCode == 2) {
		API.hideUI("俱乐部弹窗");
		API.showUI("商城弹窗");
		return;

	}
	if(statusCode == 0) {
		res.clubID = d.readLong();
		API.runActionGroup("显示", "创建成功");
	} else {
		API.runActionGroup("错误提示", tipContent);
	}

}

Game.currClub = function(d) {
	var res = API.data; //收1398
	res.info = d.readString();
	var c = res.info;
	c = eval('(' + c + ')');
	res["当前俱乐部"] = c ;
	res.currClubName = c.clubName;
	res.currClubId = c.clubId;
	res.currcreaterName = c.createrName;
	API.runActionGroup("显示", "当前俱乐部弹窗");

}

//1304
Game.ClubList = function(d) {
	var res = API.data; //
	res.clubNum = d.readByte();
	res["俱乐部列表"] = [];
	var l = res.clubNum;
	for(var n = 0; n < l; n++) {
		var g = d.readString();
//		g = g.substr(0, g.length - 1);
		g = eval('(' + g + ')');
		g.clubHead = "icon" + g.clubHead;
		g.isCreater = g.createrId == res.userID ? "wo" : "hui";
		g.isCreater = g.clubManagerId == res.userID ? "guan" : g.isCreater;
		res["俱乐部列表"][n] = g;
	}
	API.update(...["俱乐部列表","无俱乐部"]);
	API.runActionGroup("显示", "俱乐部弹窗");
}

//onGotoClub  joinClub
//接收到1300协议请求去往俱乐部
Game.joinClub = function(d) { //1300
	var res = API.data,
		isCanOpenClub = d.readBoolean();
	if(isCanOpenClub) {
		res.host = d.readString();
		res.clubKey = d.readString();
		res.clubID = d.readLong();
		//res.userID = res.userID;
		//res.clubServerID = d.readLong();
		console.log("1300, join club");
		API.update("数值组");
		API.hideUI("创建俱乐部弹窗");//从大厅进入到俱乐部把一个组件隐藏起来
		API.hideUI([ "屏蔽遮罩","大厅", "当前俱乐部弹窗","俱乐部弹窗","创建成功"]);
		API.load("bin/club.json", function () {
			console.log("加载club.json成功");
		});
	}
}
Game.BindDelegate = function(d) {//1144
	var res = API.data,bool = d.readBoolean();
	res.msg = d.readString();
	if(bool) {
		API.runActionGroup("弹窗提示", "绑定代理成功！");
		API.hideUI(["绑定代理提示弹窗", "绑定代理弹窗"]);
		API.runActionGroup("显示", "绑定代理信息");
	} else {
		API.runActionGroup("错误提示", res.msg);
		API.hideUI("绑定代理提示弹窗");
	}

}

Game.listline = function(o, s) {
	if(!o[0]) return;
	var lw = s.lineWidth,
		lh = s.lineHeight,
		len = o.length,
		w = s.width,
		h = s.height,
		my = 0;
	for(n = 0; n < len; n++) {
		i = o[n];
		if(n == 0) {
			i.x = lw > 0 ? lw : 0;
			i.y = lh > 0 ? lh : 0;
			continue;
		}
		i.x = o[n - 1].style.width + o[n - 1].x + lw;
		let _my = o[n - 1].y + o[n - 1].style.height + lh;
		if(_my > my) my = _my;
		if(i.x + i.style.width > s.width) {
			i.x = lw > 0 ? lw : 0;
			if(n == 12) {
				my = -13;
			}
			i.y = my;
		} else {
			i.y = o[n - 1].y;
		}
	}

}

Game.DelegateStatus = function(d) {
    console.log("images=====",API.images);
	var res = API.data; //1143
	res.isDelegate = d.readBoolean(); //自己是否是代理
	res.delegate_id = d.readInt(); //代理ID
	res.delegate_name = d.readString(); //代理name
	res.delegate_icon = d.readString(); //代理ICON
	res.delegate_time = d.readString(); //绑定时间
	res.delegate_tipsmsg = d.readString(); //提示绑定信息

	API.update("邀请码按钮");
	if(res.isDelegate==true) {
		API.hideUI("邀请码按钮");
		//  	API.runActionGroup("弹窗提示","绑定了代理");
		//  }else if(res.delegate_id >0){
		//  	API.runActionGroup("弹窗提示","自己成为了代理更新商品列表数据");
	}

	// WS.serverID = API.data.hallServerID;
}

Game.onPayUrl = function(d) {
	var res = API.data; //1145
	res.bool = d.readBoolean();
	if(res.bool) {
		var url = d.readString();
		if(url == "") {
			API.runActionGroup("错误提示", "支付地址不存在");
		} else {
			var url = JSON.parse(url);
			WeixinJSBridge.invoke('getBrandWCPayRequest',url, function(res) {
                WeixinJSBridge.log(res.err_msg);
                if (res.err_msg == "get_brand_wcpay_request:ok") {
                    alert("支付成功!");
                    API.runActionGroup("关闭");
                    API.hideUI("商城弹窗");
                } else if (res.err_msg == "get_brand_wcpay_request:cancel") {
                    alert("用户取消支付!");
                } else {
                    alert("支付失败!");
                }
            });
			
		}

	} else {
		var msg = d.readString();
		API.runActionGroup("错误提示", msg ? msg : "支付地址不存在");
	}
}

Game.SearchClub = function(d) {
	var res = API.data;
	var json = d.readString();
//	json = json.substr(0, json.length - 1);
	json = eval('(' + json + ')');
//	console.log(json);
	res["搜索趣友圈"] = json;
	res["搜索趣友圈"].managerName = res["搜索趣友圈"].managerName == '' ? '暂无' : res["搜索趣友圈"].managerName;
	API.runActionGroup("显示", "搜索俱乐部信息");
}

Game.applyJoinclub = function(d) {
	var res = API.data;
	res.statusCode = d.readByte() //状态码 0 成功 1失败
	res.tipContent = d.readString() //提示语句

	if(res.statusCode == 0) {
		API.timer.play(30, 3, function() {
			API.runActionGroup("弹窗提示", res.tipContent);
		}, function() {
			API.hideUI(["搜索俱乐部信息", "加入俱乐部弹窗", "屏蔽遮罩", "弹窗提示"]);
			API.runActionGroup("显示", "俱乐部弹窗");
		});

	} else {
		API.runActionGroup("错误提示", res.tipContent);
	}

}

Game.isAgent = function(d) {
	var res = API.data;
	res.isDelegate = d.readBoolean(); //--是否代理
	res.hasRequire = d.readBoolean(); //--是否有邀请信息
	if(res.hasRequire || res.isDelegate) {
		res.URL = d.readString();
		window.location.href = res.URL;
	} else {
		API.runActionGroup("显示", "提示弹窗");
	}

}

Game.ActivityNotice = function(d) {
	var res = API.data; //1111
	res.size = d.readShort();
	res["公告信息"] = [];
	for(var i = 0; i < res.size; i++) {
		var o = {};
		o.id = d.readInt();
		o.type = d.readByte();
        o.title = d.readString();
        // o.msg = d.readString();
        var txt = encodeURIComponent(d.readString());
		var a = encodeURIComponent("<br/>");
        txt = txt.replace(/\%0A/g,a);
        o.msg = decodeURIComponent(txt);
		res["公告信息"].push(o);
	}
	
	API.runActionGroup("显示", "公告弹窗");
}





Game.yaoqingEnterRoom = function(d) {
	var res = API.data;
	res.clubId = d.readLong();
	res.roomID = d.readInt();
	res.yaoqingName = d.readString();
	res.clubName = d.readString();
	API.runActionGroup("显示", "俱乐部邀请进房间");
}

Game.daikaifang = function(){
	var res = API.data;
	if(res["玩法设置"].IS_AAKF||res["玩法设置"].DE_WAY==2){
		API.runActionGroup("错误提示","代开房不能选择AA开房功能");
		return ;
	}
	
	res["玩法设置"].IS_DELEGATE=true;
	res["按代开房按钮"]=1;
	Game.send(1090);
}



Game.updateClubList = function() {
    //1305
    Game.send(1304);
}

Game.showMsg = function(d) {
	//1115
	var res = API.data, _type = d.readByte();
	res.msg = d.readString();
	if(_type == 0) {
		API.runActionGroup("错误提示", res.msg);
	} else if(_type == 1) {
		res.cbStr1 = d.readString();
		API.runActionGroup("错误提示", res.msg);
	} else if(_type == 2) {
		res.cbStr1 = d.readString();// --跳转关键字
        res.cbStr2 = d.readString();// --跳转关键字
		API.runActionGroup("显示", "俱乐部提示弹窗");
	}
	API.hideUI("加载屏蔽");
}




Game.deleteRoomItem = function (d){
	//1102
	var res = API.data;
	var roomid  = d.readInt();
	for(var n= 0;n<res.roomList.length;n++){
		if(res.roomList[n].roomID = roomid){
			res.roomList.splice(n,1);
		}
	}
	
	API.update("我的房间列表");
}

function feedback(){
	window.location.href = "/feedback?token="+API.data.token;
}

function shareGame(){
	var title = "";
	var desc = '';
	winxin(title,desc);
}

function shareRoom(){
    API.showUI("发送朋友提示");
	//分享房间
	var res = API.data;
	var o = {
		roomID:res.msg.roomID,
		playerMax:res.msg.playerMax,
		playerCount:res.msg.playerCount,
		desc:getRuleText(res.msg.roomType)
	};
	o.title = "房间号【"+o.roomID+"】"+o.playerCount+"缺"+o.playerMax;
    console.log(o.desc);
	winxin(o.title,o.desc);
}


/**
 * 跑胡子分享战绩
 */
function phzShareResult() {
    API.showUI("发送朋友提示");
    var data = API.data.zhanji;
    var roomNo = data.room_id;
    var time = data.time;
    var owner = data.room_host;
    var ownerName = owner.name;
    var gameName = data.wanfa;
    var roundTotal = data.round;
    var roundLast = data.curRound;
    var desc = "房间号:" + roomNo + " \n" + "结束时间:" + time + " \n" + "房主:" + ownerName + " \n" + gameName + " \n" + "局数" + roundLast + "/" + roundTotal + "\n";
    var player_results = data.player_results;

    for (var i = 0; i < player_results.length; i++) {
        var players = player_results[i];
        desc += players.name + " ID:" + players.account_id + " " + players.totalScore + " \n";
    }
    console.log(desc);
    var title = gameName + "战绩分享";
    winxin(title, desc);
}

function getRuleText(t){
	var d = JSON.parse(t);
	if(d.SERVER_MODEL=="zzmj"){
	var kouka = ['普通扣卡', '普通扣卡', 'AA扣卡', '大赢家扣卡'];
	var hufa = ['自摸胡', '点炮胡'];
	var zhuama = ['', '一码全中', '扎2个码', '', '扎4个码', '', '扎6个码'];
	var x = {
		'扣卡': kouka[d.DE_WAY],
		'局数': d.ROUND + '局',
		'人数': d.PLAYER_COUNT + '人',
		'规则': hufa[d.huType],
		'抓码': zhuama[d.ZA],
		'见炮踩': d.jianPaoCai ? '见炮踩' : '',
		'可带飘': d.piao > 0 ? '可带飘' : '不可带飘',
		'庄闲': d.bankerPlayerScore > 0 ? '庄闲(算分)' : '不分庄闲',
		'七对': d.hu7pair ? '可胡七对' : '不可胡七对',
		'跟庄中码': d.genZhuangZhongMa ? '跟庄中码' : '',
		'不中算全中，全中翻倍': d.hit6zaDouble ? '不中算全中，全中翻倍' : '',
		'抢杠胡包三家': d.grabGangHUBao3Jia ? '抢杠胡包三家' : '',
	}
	var a = x["跟庄中码"]==''? '' : '、';
	var b = x["不中算全中，全中翻倍"]==''? '' : '、';
	var c = x["抢杠胡包三家"]==''? '' : '、';
	var pao = x["见炮踩"]==''? '' : '、';
	var desc = "转转麻将、"+x["扣卡"]+'、'+x["局数"]+'、'+x["人数"]+pao+x["见炮踩"]+'、'+x["可带飘"]+'、'+x["庄闲"]+'、'+x["七对"]+'、'+x["规则"]+'、'+x["抓码"]+a+x["跟庄中码"]+b+x["不中算全中，全中翻倍"]+c+x["抢杠胡包三家"];
	}else if(d.SERVER_MODEL=="hz"){
		var hufa = ['只能自摸', '可点炮'];
		var fenshu = ['', '一码1分','一码2分'];
		var zhuama = ['', '一码全中', '扎2个码', '扎3个码', '扎4个码', '', '扎6个码',"","扎8个码"];
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
		var a = x["扣卡"]==''? '' : '、';
		var b = x["不中算全中，全中翻倍"]==''? '' : '、';
        var c = x["抢杠胡包三家"]==''? '' : x["抢杠胡包三家"]+'、';
        var PLAY_EIGHT = x["8个红中"]==''? '' : x["8个红中"]+'、';
		var desc = "红中麻将、"+x["局数"]+'、'+x["人数"]+'、'+x["规则"]+'、'+x["七对"]+'、'+x["抢杠胡"]+'、'+x["抓码"]+'、'+x["码分"]+a+x["扣卡"]+b+c+x["不中算全中，全中翻倍"]+PLAY_EIGHT;
	
	}
	return desc;
}

// 2000, 根据业务代码，分派相应的业务JSON
Game.onHallGetRules = function (d) {
	var str1 = d.readString();
	var str2 = d.readString();
	var res = API.data;
	res["玩法设置"] = str1;
	res["player_custom_json_str"] = str2;
    API.hideUI(["创建房间玩法选择", "加入房间弹窗"]);
	API.update("数值组");
	API.hideUI("创建房间玩法选择");

    var json = JSON.parse(str1);
	console.log("onHallGetRules SERVER_MODEL:", json.SERVER_MODEL);
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

	API.hideUI(["房间列表", "代开房提示弹窗", "加载屏蔽"]);
}

// 请求2000规则，分派相应的业务JSON
Game.dispathServiceJSON = function () {
	console.log("dispathServiceJSON 分派业务json，请求2000, roomKey:", API.data.roomKey);
	WS.socket.send(WS.writeMessage(2000));
}
function showShop(){
    API.showUI("商城弹窗");
    WS.socket.send(WS.writeMessage(1007));
}
function setCookie(cname,cvalue,exdays){
    var d = new Date();
    d.setTime(d.getTime()+(exdays*24*60*60*1000));
    var expires = "expires="+d.toGMTString();
    document.cookie = cname+"="+cvalue+"; "+expires;
}
function getCookie(cname){
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name)==0) { return c.substring(name.length,c.length); }
    }
    return "";
}
/**
 * 玩法选择界面
 * 设置cookie
 */
var settingRules = (function(){
	var data = ["麻将","扑克","跑胡子"];
	// wanfaType//玩法名称
	// targetIndex//玩法列表
	// type//num


	function init(){
		API.hideUI("玩法设置");
		var wanfaType=getCookie("wanfaType");
		if(wanfaType=="undefined" || wanfaType==""||wanfaType==null){
			setCookie("wanfaType","麻将",30);
			settingRules.listName("麻将列");
			return ;
		}

		API.getUI(wanfaType+"列").appendStyle({
			"backgroundImage":"btn_yq_2"
		});
		API.data["新列表"] = [];
		for(var i in API.data["玩法列表"]){
			if(API.data["玩法列表"][i]["类型"]==wanfaType){
				API.data["新列表"].push(API.data["玩法列表"][i]);
			}
		}
		API.runActionGroup("更换列表数据");
		var targetIndex = getCookie("targetIndex");	
		settingRules.listRules (targetIndex);
	}

	function listName (target){
		for(var i in data){
			API.getUI(data[i]+"列").appendStyle({
				"backgroundImage":"btn_yq_1"
			});
		}

		API.getUI(target).appendStyle({
				"backgroundImage":"btn_yq_2"
			});

		var type = target.substring(0,target.length-1);
		setCookie("wanfaType",type,30);//存玩法类型
		API.data["新列表"] = [];
		for(var i in API.data["玩法列表"]){
			if(API.data["玩法列表"][i]["类型"]==type){
				API.data["新列表"].push(API.data["玩法列表"][i]);
			}
		}
		API.runActionGroup("更换列表数据");
		var targetIndex = type=="扑克" ?1:0;
		settingRules.listRules (targetIndex);
	}

	function listRules (targetIndex){
		for(var i in API.data["新列表"]){
			API.getUI("玩法列表item["+i+"]").appendStyle({
				"color":"rgba(126,101,66,1)",
				"backgroundImage":"btn_yq_11"
			});
		}

		API.getUI("玩法列表item["+targetIndex+"]").appendStyle({
				"color":"rgba(235,250,223,1)",
				"backgroundImage":"btn_yq_22"
			});

		var g =API.data["新列表"][targetIndex];
		if(g.src){
			setCookie("targetIndex",targetIndex,30);//存玩法选项
			API.hideUI("玩法设置");
			API.data.a = g.src;
			API.runActionGroup("加载玩法",g.src);
			API.data.SERVER_MODEL = g.model;
			API.data.til = API.getUI("玩法标题背景").value = g["名称"];
		}else {
			API.data.SERVER_MODEL = g.model;
			API.data.til = API.getUI("玩法标题背景").value = g["名称"];
			API.hideUI("玩法设置");
			API.runActionGroup("错误提示","暂未开通，猿正在努力中");
		}
		API.getUI("代开房间按钮").appendStyle({
			"backgroundImage":"btn_hongse"
		});

	}

	return {
		init:init,
		listName:listName,
		listRules:listRules
	}

})();
/**
 * 玩法选择帮助界面
 *
 */
var rulesHelp  = (function(){
    var data = ["麻将","扑克","跑胡子"];
    // wanfaType//玩法名称
    // targetIndex//玩法列表
    // type//num

    function init(){
        var wanfaType=getCookie("wanfaType");
        console.log(wanfaType);
        if(wanfaType=="undefined" || wanfaType==""||wanfaType==null){
            rulesHelp.listName("麻将帮助");
            return ;
        }

        API.getUI(wanfaType+"帮助").appendStyle({
            "backgroundImage":"btn_yq_2"
        });
        API.data["新列表"] = [];
        for(var i in API.data["玩法列表"]){
            if(API.data["玩法列表"][i]["类型"]==wanfaType){
                API.data["新列表"].push(API.data["玩法列表"][i]);
            }
        }
		$("玩法列表2").value =  API.data["新列表"];
        var targetIndex = getCookie("targetIndex");
        rulesHelp.listRules (targetIndex);
    }

    function listName (target){
        for(var i in data){
            API.getUI(data[i]+"帮助").appendStyle({
                "backgroundImage":"btn_yq_1"
            });
        }
        API.getUI(target).appendStyle({
            "backgroundImage":"btn_yq_2"
        });
        var type = target.substring(0,target.length-2);
        console.log(type);
        API.data["新列表"] = [];
        for(var i in API.data["玩法列表"]){
            if(API.data["玩法列表"][i]["类型"]==type){
                API.data["新列表"].push(API.data["玩法列表"][i]);
            }
        }
        $("玩法列表2").value =  API.data["新列表"];
        console.log($("玩法列表2").value);
        var targetIndex =0;
        rulesHelp.listRules (targetIndex);
    }

    function listRules (targetIndex){
        for(var i in API.data["新列表"]){
            API.getUI("玩法列表项["+i+"]").appendStyle({
                "color":"rgba(126,101,66,1)",
                "backgroundImage":"btn_yq_11"
            });
        }

        API.getUI("玩法列表项["+targetIndex+"]").appendStyle({
            "color":"rgba(235,250,223,1)",
            "backgroundImage":"btn_yq_22"
        });

        var g =API.data["新列表"][targetIndex];
        console.log(g);
        if(g.rules){
            API.data.a = g.rules;
            // API.runActionGroup("加载玩法帮助",g.rules);
            API.load("rulefile/"+API.data.a+".txt",function (r) {
                var txt = encodeURIComponent(r);
                var a = encodeURIComponent("<br/>");
                txt = txt.replace(/\%0A/g,a);
                API.getUI("帮助内容").value= decodeURIComponent(txt);

            });
            API.data.til = API.getUI("玩法帮助").value = g["名称"];
        }else {
            API.data.til = API.getUI("玩法帮助").value = g["名称"];
            API.runActionGroup("错误提示","暂未开通，猿正在努力中");
        }
    }

    return {
        init:init,
        listName:listName,
        listRules:listRules
    }

})();


function decodeHelp(txt){
    // var txt = encodeURIComponent(data);
    var a = encodeURIComponent("<br/>");
    txt = txt.replace(/\%0A/g,a);
    API.getUI("帮助说明").value= decodeURIComponent(txt);
}

Date.numToTime=function (num) {
    let m = parseInt(num / 60) % 60,s = parseInt(num % 60);
    return String.getCoreFormat(m, "00") + ":" + String.getCoreFormat(s, "00");
}
String.getCoreFormat=function (v, form = "000000") {
    var l = String(v).length;
    if(l >= form.length) return v;
    return form.substr(l, form.length) + v;
}


/**
 * 再来一局邀请(房间或大厅1116， 俱乐部1445)
 * 1116
 */
Game.onHallInvitedAgain = function (d) {
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
	console.log("大厅 -> 跑得快再来一局被邀请, json:", JSON.stringify(inviteMsg));
	API.showUI(["屏蔽遮罩", "邀请再来一局"]);
	API.update("邀请再来一局");
}

/**
 * 点击确定邀请。加入房间 大厅1003，俱乐部1410
 */
Game.onHallAcceptInviteClick = function () {
	// 请求1095 返回到俱乐部或者大厅，再请求加入房间
	console.log("大厅 -> 再来一局确定邀请");
	API.hideUI("邀请再来一局", "屏蔽遮罩");
	var res = API.data;
	var inviteMsg = res.inviteMsg;
	console.log("大厅 -> 跑得快再来一局，邀请信息, json:", JSON.stringify(inviteMsg));
	// 加入房间 大厅1003，俱乐部1410
	WS.socket.send(WS.writeMessage(1003, null, function (writer) {
		writer.writeInt(inviteMsg.roomId);
	})); 
}