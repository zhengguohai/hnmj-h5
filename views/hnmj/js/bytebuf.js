
function ByteBufReader(arrayBuffer) {
	this.arrayBuffer = arrayBuffer;
}
var p = ByteBufReader.prototype;
p.by = p.readByte = function() {
	var dv = new DataView(this.arrayBuffer);
	var suplusBufView = new Int8Array(this.arrayBuffer, 1);
	var number = dv.getInt8(0);
	var newBufView;
	this.arrayBuffer = new ArrayBuffer(this.arrayBuffer.byteLength - 1);
	newBufView = new Int8Array(this.arrayBuffer);
	newBufView.set(suplusBufView);
	return number;
}
p.bo = p.readBoolean = function() {
	var dv = new DataView(this.arrayBuffer);
	var suplusBufView = new Int8Array(this.arrayBuffer, 1);
	var number = dv.getInt8(0);
	var newBufView;
	this.arrayBuffer = new ArrayBuffer(this.arrayBuffer.byteLength - 1);
	newBufView = new Int8Array(this.arrayBuffer);
	newBufView.set(suplusBufView);
	return number > 0 ? true : false;
}
p.sh = p.readShort = function() {
	var dv = new DataView(this.arrayBuffer);
	var suplusBufView = new Int8Array(this.arrayBuffer, 2);
	var number = dv.getInt16(0);
	var newBufView;
	this.arrayBuffer = new ArrayBuffer(this.arrayBuffer.byteLength - 2);
	newBufView = new Int8Array(this.arrayBuffer);
	newBufView.set(suplusBufView);
	return number;
}

p.in = p.readInt = function() {
	var dv = new DataView(this.arrayBuffer);
	var suplusBufView = new Int8Array(this.arrayBuffer, 4);
	var number = dv.getInt32(0);
	var newBufView;
	this.arrayBuffer = new ArrayBuffer(this.arrayBuffer.byteLength - 4);
	newBufView = new Int8Array(this.arrayBuffer);
	newBufView.set(suplusBufView);
	return number;
}

p.lo = p.readLong = function() {
	var suplusBufView = new Int8Array(this.arrayBuffer, 8);
	var number = this.bytes2Long(new Uint8Array(this.arrayBuffer, 0, 8));
	var newBufView;
	this.arrayBuffer = new ArrayBuffer(this.arrayBuffer.byteLength - 8);
	newBufView = new Int8Array(this.arrayBuffer);
	newBufView.set(suplusBufView);
	return number;
}
p.st = p.readString = function() {
	var lengthView = new DataView(this.arrayBuffer);
	var length = lengthView.getInt16(0);
	var suplusBufView = new Int8Array(this.arrayBuffer, length + 2);
	var str = this.bytes2String(new Uint8Array(this.arrayBuffer, 2, length));
	var newBufView;
	this.arrayBuffer = new ArrayBuffer(this.arrayBuffer.byteLength - length - 2);
	newBufView = new Int8Array(this.arrayBuffer);
	newBufView.set(suplusBufView);
	return str.substring(0,str.length-1);
}
//无符号的Long转换，有符号则会报错
p.bytes2Long = function(bytes) {
	var value = 0;
	for(var i = 0; i < bytes.length; i++) {
		value = (value << 8) + bytes[i] * 1;
	}
	return value;
};

p.bytes2String = function(arr) {
	if(typeof arr === 'string') {
		return arr;
	}
	var str = '',
		_arr = arr;
	for(var i = 0; i < _arr.length; i++) {
		var one = _arr[i].toString(2),
			v = one.match(/^1+?(?=0)/);
		if(v && one.length == 8) {
			var bytesLength = v[0].length;
			var store = _arr[i].toString(2).slice(7 - bytesLength);
			for(var st = 1; st < bytesLength; st++) {
				store += _arr[st + i].toString(2).slice(2);
			}
			str += String.fromCharCode(parseInt(store, 2));
			i += bytesLength - 1;
		} else {
			str += String.fromCharCode(_arr[i]);
		}
	}
	return str;
}

function ByteBufWriter() {
	this.buf = null;
}
var p = ByteBufWriter.prototype;
p.by = p.writeByte = function(byte) {
	this.writeBuf([].concat(byte));
}

p.bo = p.writeBoolean = function(boolean) {
	boolean = boolean == "false" || !boolean ? false : true;
	this.writeBuf([].concat(boolean ? 1 : 0));
}

p.sh = p.writeShort = function(short) {
	this.writeBuf(this.short2Bytes(short));
}

p.in = p.writeInt = function(int) {
	this.writeBuf(this.int2Bytes(int));
}

p.lo = p.writeLong = function(long) {
	this.writeBuf(this.long2Bytes(long));
}

p.bu = p.writeBuf = function(bytes) {
	if(this.buf == null) {
		var int8Arr = new Int8Array(bytes);
		this.buf = int8Arr.buffer;
	} else {
		var oldLength = this.buf.byteLength;
		var oldBuf = new Int8Array(this.buf);
		var newBufView;
		this.buf = new ArrayBuffer(oldLength + bytes.length);
		newBufView = new Int8Array(this.buf);
		newBufView.set(oldBuf);
		newBufView.set(bytes, oldLength);
	}
}
p.st = p.writeString = function(str) {//console.log(str,typeof str)
	var bytes = this.str2Bytes(String(str));
	//console.log(bytes);
	this.writeBuf(this.short2Bytes(bytes.length));
	this.writeBuf(bytes);
}
p.calcBytes = function(number, bytes) {
	for(var index = bytes.length - 1; index >= 0; index--) {
		var byte = number & 0xff;
		bytes[index] = byte;
		number = number >> 8;
	}
	return bytes;
}

p.short2Bytes = function(short) {
	// we want to represent the input as a 8-bytes array
	var bytes = [0, 0];
	this.calcBytes(short, bytes);
	return bytes;
};

p.int2Bytes = function(int) {
	// we want to represent the input as a 8-bytes array
	var bytes = [0, 0, 0, 0];
	this.calcBytes(int, bytes);
	return bytes;
};

p.long2Bytes = function(long) {
	// we want to represent the input as a 8-bytes array
	var bytes = [0, 0, 0, 0, 0, 0, 0, 0];
	this.calcBytes(long, bytes);
	return bytes;
};

p.str2Bytes = function(str) {
	var bytes = new Array();
	var len, c;
	len = str.length;
	for(var i = 0; i < len; i++) {
		c = str.charCodeAt(i);
		if(c >= 0x010000 && c <= 0x10FFFF) {
			bytes.push(((c >> 18) & 0x07) | 0xF0);
			bytes.push(((c >> 12) & 0x3F) | 0x80);
			bytes.push(((c >> 6) & 0x3F) | 0x80);
			bytes.push((c & 0x3F) | 0x80);
		} else if(c >= 0x000800 && c <= 0x00FFFF) {
			bytes.push(((c >> 12) & 0x0F) | 0xE0);
			bytes.push(((c >> 6) & 0x3F) | 0x80);
			bytes.push((c & 0x3F) | 0x80);
		} else if(c >= 0x000080 && c <= 0x0007FF) {
			bytes.push(((c >> 6) & 0x1F) | 0xC0);
			bytes.push((c & 0x3F) | 0x80);
		} else {
			bytes.push(c & 0xFF);
		}
	}
	bytes.push(0);
	return bytes;
}



window.API = Can.api;

API.hideUI=function(arr){
    arr=arr instanceof Array?arr:[arr];
    console.log("remove--:",arr);
    API.remove.apply(null,arr);
}



var WS=Can.websocket;
//////////-----------websocket------------------------------------------////////////

//消息长度，不含自身(int) | 协议ID(short) | 客户端SocketID(short) | 动态包ID(int) | 服务器ID(short) | 消息体(byte[])
WS.socket;
WS.pID; //动态包ID
WS._pID; //原动态包ID;
WS.serverID=0; //服务器ID;
WS.socketID;
WS.headID;
// //////////-----------websocket------------------------------------------////////////
// function WS() {
// //消息长度，不含自身(int) | 协议ID(short) | 客户端SocketID(short) | 动态包ID(int) | 服务器ID(short) | 消息体(byte[])
// 	this.socket;
// 	this.pID; //动态包ID
// 	this._pID; //原动态包ID;
// 	this.serverID=0; //服务器ID;
// 	this.socketID;
// 	this.headID;
// };
WS.init=function(){
		if(req){
			API.data.userID=parseInt(req.userID);
     		API.data.accountID=parseInt(req.accountID);
     		API.data.nickname=req.nickname;
			var ip=req.gateAddress;
			console.log(ip);
			// ip=ip.substr(5);
			ip=ip.replace("/ws","");
			API.data.ip=ip;
			API.data.uip=req.ip;
			API.data.ico=req.ico;
			API.data.hallKey=req.hallKey;
            API.data.wxOpenId = req.wxOpenId;
			if(!API.data.version) API.data.version=req.version;

			console.log("ip=================",API.data.ip);

		}
}
WS.heart=true;//心跳
WS.heartbeat=function(){
	API.timer.play(150,1,f,null,true);
	function f(){
		if(!WS.heart){
			API.showUI("屏蔽遮罩");
			API.showUI("掉线提示");
		}
		WS.heart=false;
		WS.socket.send(WS.writeMessage(1));
	}
}
WS.writeMessage = function(headID = 8, msg = null,func=null) {
	var res = API.data;
	WS.headID = headID;
	
	var w = new ByteBufWriter();
	var v = new ByteBufWriter();
	//消息长度，不含自身(int) | 协议ID(short) | 客户端SocketID(short) | 动态包ID(int) | 服务器ID(short) | 消息体(byte[]);
//	
	console.log("发送协议:" + WS.headID, "服务器ID:" + WS.serverID);
	if(headID == 8) {
		WS._pID=null;
		w.writeInt(8);
		w.writeShort(30); 
		w.writeInt(102);
		w.writeInt(7000);
		w.writeInt(10);
		w.writeShort(25);
		w.writeShort(0);
		
		var dv = new DataView(w.buf);
		var length = w.buf.byteLength;
		for(var i = 0; i < length; i++) {
			if (i % 2 == 0 && (i % 3 == 0 || i % 3 == 1 )) {
				var newVal = (dv.getInt8(i) + i) ^ -30;
				dv.setInt8(i, newVal);
			}
		}
		var rs = new ByteBufWriter();
		rs.writeInt(22);
		rs.writeBuf(new Int8Array(w.buf));
		return rs.buf;
	} else if(headID == 0) {
		WS.heartbeat();
		w.writeInt(headID);
		w.writeShort(30);
		w.writeInt(102);
		WS.pID++;
		w.writeInt(WS.pID);
		w.writeInt(10);
		w.writeShort(25);
		w.writeShort(0);
		var dv = new DataView(w.buf);
		var length = w.buf.byteLength;
		for(var i = 0; i < length; i++) {
			if (i % 2 == 0 && (i % 3 == 0 || i % 3 == 1 )) {
				var newVal = (dv.getInt8(i) + i) ^ WS._pID;
				dv.setInt8(i, newVal);
			}
		}
		var rs = new ByteBufWriter();
		rs.writeInt(22);
		rs.writeBuf(new Int8Array(w.buf));
		//console.log(new Int8Array(rs.buf))
		return rs.buf;
	
	} else {
		w.writeInt(headID);
		w.writeShort(30);
		w.writeInt(102);
		WS.pID++;
		w.writeInt(WS.pID);
		w.writeInt(10);
		w.writeShort(25);
		if(headID==30001 && Game.serverList){
			var s=getServerIDbyType(1);
			w.writeShort(s);
			console.log("-----重连------serverID:",s)
		}else w.writeShort(WS.serverID);
		if(!func){
			var d = API.data.socketOut;
			for(var n = 0, l = d.length; n < l; n++) {
				if(d[n].headID == headID) {
					d = d[n];
					break;
				}
			}
			if(d instanceof Array) {
				console.log("[发]没有这个协议:"+headID)
				return;
			}
			if(d.type) {
				var t = String(d.type).split(";"),
					a = String(d.attr).split(";"),
					v = String(d.value).split(";");
				for(n = 0, l = t.length; n < l; n++) {
					if(v[n]) {
						var s = v[n];
						API.data[a[n]] = s;
					} else {
						s = API.data[a[n]];
						if(typeof s=="object"){
							s=JSON.stringify(s);
						}
					}
					console.log(headID+" 写入值:" + s, "写入方法:" + t[n], a[n], API.data[a[n]]);
					w[t[n]](s); //写入数据
				}
			}
		}else{
			func(w);
		}
		var dv = new DataView(w.buf);
		var length = w.buf.byteLength;
		for(var i = 0; i < length; i++) {
			if (i % 2 == 0 && (i % 3 == 0 || i % 3 == 1 )) {
				var newVal = (dv.getInt8(i) + i) ^ WS._pID;
				dv.setInt8(i, newVal);
			}
		}
		var rs = new ByteBufWriter();
		rs.writeInt(22 + w.buf ? w.buf.byteLength : 0);
		rs.writeBuf(new Int8Array(w.buf));
		return rs.buf;
	}

}
WS.readMessage = function(b) {
	WS.heart=true;
	var dv = new DataView(b);
	var r = new ByteBufReader(dv.buffer);
	if(WS.headID == 8) {
		var l = r.readInt();
		dv = new DataView(r.arrayBuffer);
		for(var i = 0; i < l; i++) {
			if (i % 2 == 0) {
				var newVal = dv.getInt8(i) ^ l;
				dv.setInt8(i, newVal);
			}
		}
	} else if(WS.headID == 0) {
		var l = r.readInt();
		dv = new DataView(r.arrayBuffer);
		for(var i = 0; i < l; i++) {
			if (i % 2 == 0 && (i % 3 == 0 || i % 3 == 1 )) {
				var newVal = (dv.getInt8(i) + i) ^ WS._pID;
				dv.setInt8(i, newVal);
			}
		}
		
	} else {
		var l = r.readInt();
		dv = new DataView(r.arrayBuffer);
		for(var i = 0; i < l; i++) {
			if (i % 2 == 0 && (i % 3 == 0 || i % 3 == 1 )) {
				var newVal = (dv.getInt8(i) ^ WS._pID) - i;
				dv.setInt8(i, newVal);
			}
		}
		//console.log(new Int8Array(r.arrayBuffer));
	}
	//消息长度，不含自身(int) | 协议ID(short) | 客户端SocketID(short) | 动态包ID(int) | 服务器ID(short) | 消息体(byte[])
	API.data.headID = WS.headID = r.readInt();
	r.readShort();
	r.readInt();
	console.log("收到协议:", WS.headID);
	if(WS.headID == 0 && !WS._pID) {
		WS.pID = WS._pID = r.readInt(); console.log("-----------动态包------：",WS._pID)
		WS.start=false;
	} else {
		r.readInt();
	}
	WS.socketID = r.readInt();
	r.readShort();
	if(WS.headID == 0){
		if(!WS.start){
			WS.serverID=0;
			Game.send(0);
			WS.start=true;
			return;
		}else{
			Game.send(30001);
			return;
		}
	} 
	r.readShort();
	if(WS.headID == 1) {
		return;
	}
	var d = API.data.socketIn;
	for(var n = 0, l = d.length; n < l; n++) {
		if(d[n].headID == WS.headID) {
			d = d[n];
			break;
		}
	}
	if(d instanceof Array) {
		console.log("[收]没有这个协议：", WS.headID);
		return;
	}
	var lastKey = null;
	decode(d);
//	if(WS.serverID == API.data.hallServerID) {
//		if(WS.headID == 1000) {
//			if(API.data.isRoom === true) {
//				WS.serverID = API.data.roomServerID;
//				console.log("在房间服:", WS.serverID);
//			} else {
//				WS.serverID = API.data.hallServerID;
//				console.log("不在房间服:", WS.serverID);
//			}
//		}
//	}
	function decode(d, type = "") {
		if(!d.type) return;
		var t = String(d.type).split(";"),
			a = String(d.attr).split(";");
		for(var n = 0, l = t.length; n < l; n++) {
			switch(t[n].substr(0, 2)) {
				case "if": //处理有条件的协议
					decode(forIf(t[n], lastKey));
					return;
				case "ls": //处理有条件的协议
					forList(t[n], lastKey);
					return;
				case "fu": //处理特殊方法;
					console.log(t[n].substr(3))
					// Game[t[n].substr(3)](r);
					dealSpec(t[n].substr(3), r);
					return;
			}
			if(type == "list") {
				if(!lo) var lo = {};
				lo[a[n]] = r[t[n]]();
				console.log("list：" + n + " 读取值名:" + a[n], "读取方法:" + t[n] + " 值:" + lo[a[n]]);
				continue;
			}
			lastKey = API.data[a[n]] = r[t[n]](); //读取数据;debug[a[n]]
			console.log("读取值名:" + a[n], "读取方法:" + t[n] + " 值:" + API.data[a[n]]);
		}
		if(type == "list") return lo;
	}

	/**
	 * 延迟执行推送的函数
	 * @param {*} delay 
	 * @param {*} delayList 
	 */
	Game.startDelayCall = function (delay, delayList) {
		console.log("开启延迟执行函数, delay:", delay);
		Game.delayParams = Game.delayParams || {};
		Game.delayCallbacks = Game.delayCallbacks || [];
		Game.delayParams.delay = delay || 10;
		Game.delayParams.delayList = delayList || [];
		Game.delayParams.starting = true;
		var delayParams = Game.delayParams;
		var delayCallbacks = Game.delayCallbacks;
        var delayCallTimer = setInterval(function () {
			// console.log("delayCallbacks.length:", delayCallbacks.length);
            if (delayCallbacks.length > 0) {
				var spliceArr = delayCallbacks.splice(0, 1);
				var callback = spliceArr[0];
				if (callback[0]) {
					console.log("延迟执行, delay: ", Game.delayParams.delay);
					console.log("延迟调用函数到点执行:", callback[0]);
					Game[callback[0]](callback[1]);
				}
			} else {
				var starting = Game.delayParams.starting;
				if (!starting) {
					console.log("停止延迟调用");
                    clearInterval(delayCallTimer);
				} 
			}
		}, delayParams.delay);      
	}

	/**
	 * 停止延迟执行函数
	 */
	Game.stopDelayCall = function () {
		console.log("关闭延迟执行的开关");
		Game.delayParams.starting = false;
	}

	// 特殊处理
	function dealSpec(callName, d) {
		Game.delayParams = Game.delayParams || {};
        if (Game.delayParams.starting && Game.delayParams.delayList.indexOf(callName) != -1) {
			console.log("开启了延迟调用功能，放进延迟调用数组, ", callName);
			Game.delayCallbacks.push([callName, d]);
		} else {
            Game[callName](d);
		}
	}

	function forIf(s, k) {
		s = s.substr(3);
		var a = String.stringToObject(s, "|", ":"),
			hID = a[k];
		console.log("条件:", k, hID)
		return getSocketInData(hID);
	}

	function forList(s, l) {
		hID = s.substr(3);
		var d = getSocketInData(hID);
		API.data[hID] = [];
		API.data.list = [];
		for(var n = 0; n < l; n++) {
			let v = decode(d, "list");
			API.data[hID].push(v);
			API.data.list.push(v);
		}
	}

	function getSocketInData(hID) {
		API.data.headID = hID;
		var d = API.data.socketIn;
		for(var n = 0, l = d.length; n < l; n++) {
			if(d[n].headID == hID) {
				d = d[n];
				return d;
			}
		}
	}
	console.log("====服务器发送协议===========",WS.serverID,API.data)
}


var supportOrientation = (typeof window.orientation === 'number' &&
typeof window.onorientationchange === 'object');
var init = function(){
var htmlNode = document.body.parentNode,
orientation;
var updateOrientation = function(){
if(supportOrientation){
orientation = window.orientation;
switch(orientation){
case 90:
case -90:
orientation = 'landscape';
// alert("请关闭屏幕旋转，游戏体验更好！！");
//var el = document.getElementById("AppendText");
//	if(el){
//		el.style.transform= "rotate(-90deg)";
//		el.style.transformOrigin="0 0";
//		el.style.left=(p.y*s)+"px";
//		el.style.top=(H-p.x*s)+"px";
//	}
break;
default:
orientation = 'portrait';
//var el = document.getElementById("AppendText");
//	if(el){
//		el.style.transform= "rotate(0deg)";
//		el.style.transformOrigin="0 0";
//		el.style.left=(p.y*s)+"px";
//		el.style.top=(H-p.x*s)+"px";
//	}
break;
}
}else{
orientation = (window.innerWidth > window.innerHeight) ? 'landscape' : 'portrait';
}
htmlNode.setAttribute('class',orientation);
};
if(supportOrientation){
window.addEventListener('orientationchange',updateOrientation,false);
}else{
//监听resize事件
window.addEventListener('resize',updateOrientation,false);
}
updateOrientation();
};
window.addEventListener('DOMContentLoaded',init,false);




function createDiv(id,txt){

	var o=API.getUI(id),el=document.createElement("div");
	var s= API.getStageSacle();
	var p=API.getLocal(o);
	var W = window.innerWidth,H = window.innerHeight;
	el.style.left=p.x*s+"px";
	el.style.top=p.y*s+"px";
	el.style.width=o.style.width*s+"px";
	el.style.height=o.style.height*s+"px";
	el.style.position="absolute";
	el.style.font="14px '微软雅黑'"
	el.style.overflow="scroll";
    el.style.webkitOverflowScrolling="touch";
	el.style.color="#47565a";
	if(H>W){
		el.style.transform= "rotate(-90deg)";
		el.style.transformOrigin="0 0";
		el.style.left=(p.y*s)+"px";
		el.style.top=(H-p.x*s)+"px";
	}
	el.id = "AppendText";
	document.body.appendChild(el);
	
	var obj = document.getElementById(el.id);
	var a = encodeURIComponent("<br/>");
	txt = txt.replace(/\%0A/g,a);
	obj.innerHTML = decodeURIComponent(txt);
}
function removeDiv(id){
	var aa = document.getElementById(id);
	if(aa){
		document.body.removeChild(aa);
	}
}
function Game() {
}
Game.send=function(id){
	WS.socket.send(WS.writeMessage(id));
}
Game.appInit = function (d){
    var res = API.data;
	res.isCallback = true;
    res.nickname 	= d.readString();
    res.card = d.readInt();
    res.gold = d.readInt();
    res.isRoom 		= d.readBoolean();
	console.log(res.isRoom);
    if(res.isRoom){
        // d.readBoolean();
        res.roomKey = d.readString();
        res.roomIP = d.readString();
        d.readBoolean();
        res.GPSwitch =d.readBoolean();
        res.IPSwitch =d.readBoolean();
        res.userID =d.readLong();
        res.token =d.readString();
		update("数值组");
		hide("加载屏蔽");
        Game.dispathServiceJSON();
	}else{
        d.readBoolean();
        res.GPSwitch =d.readBoolean();
        res.IPSwitch =d.readBoolean();
        res.userID =d.readLong();
        res.token =d.readString();
        update("数值组");
        hide("公司logo");
        API.load("bin/hall.json");
	}

}

//30002获取服务器ID
Game.getServerID=function(d){
	var s=d.readShort();
	var t=valueOfServerType(s);
	console.log("======---------------------------=====",t,s);
	API.data.serverID=WS.serverID=s;
	if(t==2){
		Game.send(1000);
	}else if(t==3 && API.getUI("游戏桌面")){
		Game.send(1001);
	}
	
}
Game.serverList;
//30003获取服务器列表
Game.getServerList=function(d){
	var s=d.readString();
	var ls=eval('('+s+')');
	Game.serverList=ls.serverList;
}
function valueOfServerType(id){
	var ls=Game.serverList;console.log("------------",ls)
	for(var n in ls){
		console.log(n,ls[n].serverId==id,ls[n].serverId,id)
		if(ls[n].serverId==id)return ls[n].serverType;
	}
}
function getServerIDbyType(id){
	var ls=Game.serverList;console.log(ls)
	for(var n in ls){
		console.log(n,ls[n])
		if(ls[n].serverType==id)return ls[n].serverId;
	}
}

String.stringToObject=function(s,C = ";", D = ",") {
	if(s.length == 0) {
		return {};
	}
	let a = s.split(C);
	let l = a.length;
	let r = {};
	for(let n = l - 1; n >= 0; n--) {
		let aa = a[n].split(D).map(f);console.log(aa[0],aa[1])
		r[aa[0]]=aa[1];
	}

	function f(v) {
		if(isNaN(v)) {
			return v;
		} else {
			return parseFloat(v);
		}
	}
	return r;
}