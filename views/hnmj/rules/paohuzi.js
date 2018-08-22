// 重写引擎方法
function SGroup() {

}
SGroup.group = [];
SGroup.push = function(src, groupid) {
	SGroup.group[groupid] = [];
	for(var n = 0; n < src.length; n++) {
		SGroup.group[groupid][src[n]] = API.getUI(src[n]);
	}
}
SGroup.onClick = function(uiID, groupid) {
	console.log("group click: " + uiID);
	var o = SGroup.group[groupid][uiID];
	for(var i in SGroup.group[groupid]) {
		SGroup.group[groupid][i].value = false;
		var text = SGroup.group[groupid][i].substring(2);
		text.appendStyle({
			color: 'rgba(73,88,93,1)'
			});
			console.log(text);
	}
	if(o) {
		o.value = true;
		var uiText = o.substring(2);
		uiText.appendStyle({
			color: 'rgba(186,76,54,1)'
			});
	}
	getResult_paohuzi();
}

// 日志
function Log() {

}
Log.isDebug = true;
// 格式化log
Log.fmt = function(...params) {
	var str = "[DEBUG] ";
	for (var i=0; i<arguments.length; i++) {
		var param = arguments[i];
		if (Object.prototype.toString.call(param) === '[object Object]' || Object.prototype.toString.call(param) === '[object Array]') {
			str += JSON.stringify(param);
		} else {
			str += param;
		}
		str += " ";
	}
	return str;
}
Log.log = function(...params) {
	if (!Log.isDebug) return;
	var str = Log.fmt(params);
	console.log(str);
}
fmt = Log.fmt;
log = Log.log;


// 跑胡子方法
function init() {
	// 初始化时将根据玩法显示规则
	// rulesVisible(false);
	changeText_paohuzi("选框六八番");
	changeText_paohuzi("选框带四七红");
}

// 玩法六十番，八十番规则。六十番只显示 请允许臭胡 ，八十番下面的规则都显示
var rules = ["规则黄番2倍", "规则停胡8番", "规则大团圆", "规则行行息", "规则背靠背", "规则耍猴8番", "规则带四七红"];
function rulesVisible(value) {
    rules.forEach((v, i, arr) => {
		API.getUI(v).visible = value;
		// console.log("v: " + v);
		var uiText = v.substring(2);
		// 选框设置为不选
		API.getUI('选框' + uiText).value = false;
		// 颜色为初始颜色
		API.getUI(uiText).appendStyle({
			color: 'rgba(73,88,93,1)'
		});
	});
}

function changeText_paohuzi(uiID) {
	log("uiID: " + uiID);
    let ui = API.getUI(uiID);
    if (!ui) {
        log("function changeText -> uiID: " + uiID + ", ui is null");
        return;
    }

	// 更新选框文本颜色
    var uiTextArray = API.getSwitchGroupByName(uiID);
	for (var n in uiTextArray){
		log("group: " + n);
		var TextId = n.substring(2, n.length-2);
		API.getUI(TextId).appendStyle({
			color: 'rgba(73,88,93,1)'
		});
	}
    var uiText = uiID.substring(2);
    // log("ui text: " + uiText + " ui: " + ui);
	let selected = ui.value;
	log("selected value: " + selected);
	if (selected > 0) {
		// 选中
		API.getUI(uiText).appendStyle({
			color: 'rgba(186,76,54,1)'
		});
	} else {
		API.getUI(uiText).appendStyle({
			color: 'rgba(73,88,93,1)'
		});
	}

	if (uiID == '选框AA开房') {
		if (selected) {
			API.getUI("6局").value = '6局(每人1张)';
			API.getUI("10局").value = '10局(每人1张)';
			API.getUI("16局").value = '16局(每人2张)';
			API.getUI("代开房间按钮").appendStyle({
				"backgroundImage": "btn_huise"
			});
		} else {
            API.getUI("6局").value = '6局(每人2张)';
			API.getUI("10局").value = '10局(每人2张)';
			API.getUI("16局").value = '16局(每人4张)';
			API.getUI("代开房间按钮").appendStyle({
				"backgroundImage": "btn_hongse"
			});
		}
	} else if (uiID == '选框六八番') { // 根据玩法显示规则
		rulesVisible(false);
		API.getUI("设置带47红").visible = false;
	} else if (uiID == '选框八十番') {
		rulesVisible(true);
	} else if (uiID == '选框黄番2倍') {
        
	} else if (uiID == '选框带四七红') {
		API.getUI("设置带47红").visible = selected > 0 ? true : false;
		if (selected) {
			var itemId1 = "选框4红7红";
			var item1 = API.getUI(itemId1);
			item1.value = 0;
			API.getUI(itemId1.substring(2)).appendStyle({
                color: 'rgba(73,88,93,1)'
			});
			var itemId2 = "选框2番";
			var item2 = API.getUI(itemId2);
			item2.value = 2;
            API.getUI(itemId2.substring(2)).appendStyle({
                color: 'rgba(186,76,54,1)'
			});
			// console.log("选项带47红, item1:", item1, "item2:", item2);
		}
	}
	getResult_paohuzi();
	
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
function getResult_paohuzi() {
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
			cruleNum ++;
			ruleChecked.push(ruleUI.value);
		}
	});

	checks.push(cruleNum);
	for (var i=0; i<cruleNum; i++) {
		checks.push(ruleChecked[i]);
	}

	// 充囤
	var cscoreNum = 1;
	var score = 0;
	var scores = API.getSwitchGroupByName('选框0分');
	for (var scoreID in scores) {
		// console.log("score id: " + scoreID);
		var scoreUI = API.getUI(scoreID.substring(0, scoreID.length-2));
        score += scoreUI.value == 10 ? 0: scoreUI.value;  // 将0分的ui特殊值10改回0
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
	var isAA = API.getUI('选框AA开房').value;

    var d = {
		"IS_AAKF": isAA,
		"ROUND": round,
		"IS_DELEGATE": false,
		"SERVER_MODEL": "paohuzi-cdqmt",
		"PHZ": phzJSON,
        "PLAYER_COUNT": playMaxNum
	};
	 
	API.data["玩法设置"] = d;
	console.log("===================",API.data.card);
	if (API.data.card == 0) {
		API.runActionGroup("错误提示","您的房卡用完啦！");
	}
	console.log(d);

	return d;
}
