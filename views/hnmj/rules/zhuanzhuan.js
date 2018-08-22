
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
	getResult();
}

var array =[];
function changeText(uiID) {
	var obj = API.getUI(uiID).value;
	console.log(API.getUI(uiID).enabled);
	var uiTextArray = API.getSwitchGroupByName(uiID);
	console.log(uiTextArray);
	for(var n in uiTextArray){
		var cId = n.substring(0,n.length-2);
        API.getUI(cId).value=cId==uiID?obj:0;
		var TextId = n.substring(2,n.length-2);
		API.getUI(TextId).appendStyle({
			color: 'rgba(73,88,93,1)'
		});
	}
	var uiText = uiID.substring(2);
	if(obj){
		API.getUI(uiText).appendStyle({
			color: 'rgba(186,76,54,1)'
		});
	}else{
		API.getUI(uiText).appendStyle({
			color: 'rgba(73,88,93,1)'
		});
	}
//	API.getUI(uiText).appendStyle({
//		color: 'rgba(186,76,54,1)'
//	});
//	
	if(uiID == '选框AA扣卡') {
		var array = ["普通扣卡","大赢家扣卡"];
		API.getUI("8局").value = '8局(每人1张)';
		API.getUI("16局").value = '16局(每人2张)';
		API.getUI("代开房间按钮").appendStyle({
				"backgroundImage": "btn_huise"
			});
	}else if(uiID == '选框普通扣卡' || uiID == '选框大赢家扣卡'){	
		API.getUI("8局").value = '8局(2张房卡)';
		API.getUI("16局").value = '16局(4张房卡)';
		API.getUI("代开房间按钮").appendStyle({
			"backgroundImage":"btn_hongse"
		});
	}else if(uiID =="选框点炮胡"){
		var array = ["规则见炮踩","抓码抢杠胡包三家"];
		uiVisible(array,true);
		API.getUI('选框见炮踩').value = API.getUI('选框抢杠胡包三家').value = true;
		changeText("选框见炮踩");
		changeText("选框抢杠胡包三家");
	}else if(uiID =="选框自摸胡"){
		var array = ["规则见炮踩","抓码抢杠胡包三家"];
		uiVisible(array,false);
		API.getUI('选框见炮踩').value = API.getUI('选框抢杠胡包三家').value = false;
	}else if(uiID == '选框一码全中'){
		API.getUI('选框全中翻倍').value = API.getUI('选框跟庄中码').value = false;
		var array = ["抓码跟庄中码","抓码全中翻倍"];
		uiVisible(array,false);
		changeText("选框跟庄中码");
		changeText("选框全中翻倍");
	}else if(uiID == '选框6码'){
		API.getUI('选框全中翻倍').value = true;
		var array = ["抓码跟庄中码","抓码全中翻倍"];

		// API.getUI('选框跟庄中码').appendStyle({
		// 	"backgroundImage":"no_fu"
		// });
		API.getUI('选框跟庄中码').enabled = API.getUI('选框跟庄中码').value = false;
		uiVisible(array,true);
		changeText("选框跟庄中码");
		changeText("选框全中翻倍");
	}else if(uiID == '选框2码' || uiID == '选框4码'){
		var array = ["抓码跟庄中码"];
		uiVisible(array,true);
		API.getUI('选框全中翻倍').value = false;
		uiVisible(["抓码全中翻倍"],false);
		API.getUI('选框跟庄中码').enabled = true;
		API.getUI('选框跟庄中码').appendStyle({
			"backgroundImage": "sikuang"
		});
	}else if(uiID == '选框全中翻倍' ){
		if(obj){
			API.getUI('选框跟庄中码').enabled = API.getUI('选框跟庄中码').value = false;
			API.getUI('选框跟庄中码').appendStyle({
				"backgroundImage": "no_fu"
			});

			changeText("选框跟庄中码");
		}else{
			API.getUI('选框跟庄中码').enabled = true;
			API.getUI('选框跟庄中码').appendStyle({
				"backgroundImage": "sikuang"
			});
		}
		
	}

	getResult('zzmj');
}

function uiVisible(uiID,state){
	if(state){
		for(var n= 0;n<uiID.length;n++){
			console.log(uiID[n]);
			API.getUI(uiID[n]).visible=true;
		}
	}else{
		for(var n= 0;n<uiID.length;n++){
			API.getUI(uiID[n]).visible=false;
		}
	}

}

function getResult(wanfa) {
	if (wanfa=="zzmj"){
		var d= {
			"huType":  API.getUI('选框点炮胡')?API.getUI('选框点炮胡').value:false,
			"bankerPlayerScore":API.getUI('选框庄闲')?API.getUI('选框庄闲').value:false,
			"grabGangHUBao3Jia":API.getUI("选框抢杠胡包三家")? API.getUI("选框抢杠胡包三家").value:false,
			"genZhuangZhongMa":API.getUI("选框跟庄中码")?API.getUI("选框跟庄中码").value:false,
			"jianPaoCai":  API.getUI("选框见炮踩")?API.getUI("选框见炮踩").value:false,
			"SERVER_MODEL": "zzmj",
			"hu7pair": API.getUI("选框可胡七对")?API.getUI("选框可胡七对").value:false,
			"PLAYER_COUNT": API.getUI("选框4人").value+API.getUI("选框3人").value,
			"MAHJONG_TPYE_NUM": 46,
			"hit6zaDouble": API.getUI("选框全中翻倍")? API.getUI("选框全中翻倍").value:false,
			"IS_AAKF": API.getUI("选框AA扣卡").value,
			"ROUND": API.getUI('选框8局').value + API.getUI('选框16局').value,
			"IS_DELEGATE": false,
			"piao":API.getUI("选框可带飘")? API.getUI("选框可带飘").value:false,
			"PAI_COUNT": 108,
			"ZA": API.getUI('选框一码全中').value+API.getUI('选框2码').value+API.getUI('选框4码').value+API.getUI('选框6码').value,
			"DE_WAY":API.getUI('选框普通扣卡').value + API.getUI('选框AA扣卡').value + API.getUI('选框大赢家扣卡').value,
		}
		API.data["玩法设置"]=d;
	
		if(API.data.card==0){
			API.runActionGroup("错误提示","您的房卡用完啦！");
		}
		return d;
	}else if (wanfa=="hz"){
		var d = {
	        "ROUND": API.getUI('选框8局').value + API.getUI('选框16局').value,  //回合数round
	        "SERVER_MODEL": "hz",    //服务器类型hz
	        "MAHJONG_TPYE_NUM": 46,  //牌种类46
	        "PAI_COUNT": 112,        //麻将数量112
	        "ZA": API.getUI('选框一码全中').value + API.getUI('选框2码').value + API.getUI('选框3码').value + API.getUI('选框4码').value + API.getUI('选框6码').value+ API.getUI('选框8码').value,    //抓码数2
	        "PLAYER_COUNT": API.getUI("选框4人").value+API.getUI("选框3人").value+API.getUI("选框2人").value,       //人数4 添加2人Iris.2018.8.10更新
	        "MILUOHONGZHONG": false,    //false
	        "CAN_WATCH": false,         //false
	        "PLAY_7D": API.getUI('选框可胡七对')?API.getUI('选框可胡七对').value:false,           //false
	        "QG_HU": API.getUI('选框可抢杠胡')?API.getUI('选框可抢杠胡').value:false,             //false
	        "IS_AAKF": API.getUI("选框AA开房")?API.getUI("选框AA开房").value:false,           //false
	        "IS_ZHUA_HU": API.getUI('选框只能自摸').value + API.getUI('选框可点炮').value - 1,            //0
	        // "IS_ZHUA_HU": API.getUI('选框可点炮')?API.getUI('选框可点炮').value:false,
	        "YMNF": API.getUI('选框一码2分').value + API.getUI('选框一码1分').value,              //2
	        "grabGangHUBao3Jia":API.getUI("选框抢杠胡包三家")? API.getUI("选框抢杠胡包三家").value:false,//2018.7.9更新
            "hit6zaDouble": API.getUI('选框全中翻倍')?API.getUI('选框全中翻倍').value:false,      //false
            "PLAY_EIGHT": API.getUI('选框8个红中')?API.getUI('选框8个红中').value:false,      //false  Iris.2018.8.10更新
	        //"DE_WAY":API.getUI('选框AA开房').value + API.getUI('选框16局').value,
	        "IS_DELEGATE": false,
	    };
	API.data["玩法设置"]=d;
	
	if(API.data.card==0){
		API.runActionGroup("错误提示","您的房卡用完啦！");
	}
	return d;
	}else if(wanfa=="paohuzi-cdqmt"){
		getResult_paohuzi();
	}else if(wanfa=="pdk"){
		getResult_pdk();
	}


}


//function getText(){
//	var kouka = ['普通扣卡','AA扣卡','大赢家扣卡'];
//	var hufa = ['自摸胡','点炮胡'];
//	var zhuama = ['','一码全中','扎2个码','','扎4个码','','扎6个码'];
//
////console.log('扣卡======'+(API.getUI('选框普通扣卡').value+API.getUI('选框AA扣卡').value+API.getUI('选框大赢家扣卡').value));
////console.log('胡======'+(API.getUI("选框自摸胡").value+API.getUI("选框点炮胡").value));
////console.log('人数======'+(API.getUI("选框4人").value+API.getUI("选框3人").value));
////console.log('局数======'+(API.getUI("选框8局").value+API.getUI("选框16局").value));
////console.log('抓码======'+(API.getUI('选框一码全中').value+API.getUI('选框2码').value+API.getUI('选框4码').value+API.getUI('选框6码').value));
//
//	var x = {
//		'扣卡':kouka[API.getUI('选框普通扣卡').value+API.getUI('选框AA扣卡').value+API.getUI('选框大赢家扣卡').value],
//		'局数':API.getUI("选框8局").value+API.getUI("选框16局").value+'局',
//		'人数':API.getUI("选框4人").value+API.getUI("选框3人").value+'人',
//		'规则':hufa[API.getUI("选框自摸胡").value+API.getUI("选框点炮胡").value],
//		'抓码':zhuama[API.getUI('选框一码全中').value+API.getUI('选框2码').value+API.getUI('选框4码').value+API.getUI('选框6码').value],
//		'见炮踩':API.getUI("选框见炮踩").value==true?'见炮踩':'',
//		'可带飘':API.getUI("选框可带飘").value==true?'可带飘':'',
//		'庄闲':API.getUI("选框庄闲").value==true?'庄闲(算分)':'',
//		'七对':API.getUI("选框可胡七对").value==true?'可胡七对':'',
//		'跟庄中码':API.getUI("选框跟庄中码").value==true?'跟庄中码':'',
//		'全中':API.getUI("选框全中翻倍").value==true?'不中算全中，全中翻倍':'',
//		'包三家':API.getUI("选框抢杠胡包三家").value==true?'抢杠胡包三家':'',
//
//	}
//}
