
function pdkClick(uiID){
    console.log(uiID);
    var obj = API.getUI(uiID).value;
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
    if(uiID == '选框AA开房'){
        if(obj){
            API.getUI('10局') .value = '10局(每人1张)';
            API.getUI('20局').value = '20局(每人2张)';  
            API.getUI("代开房间按钮").appendStyle({
                "backgroundImage": "btn_huise"
            }); 
        }else{
            API.getUI('10局').value = '10局(2张房卡)';
            API.getUI('20局').value = '20局(4张房卡)';
            API.getUI("代开房间按钮").appendStyle({
            "backgroundImage":"btn_hongse"
        });
               
        }
    }else if (uiID == '选框2人'){
        var array = ["选框首局先出黑桃3","选框防作弊"];
        cDisClick(array,1);



    }else if(uiID == "选框3人"){
        var array = ["选框首局先出黑桃3","选框防作弊"];
        cDisClick(array,0);
        API.getUI('选框首局先出黑桃3').value = true;
        pdkClick("选框首局先出黑桃3",-1);
        pdkClick("选框一副牌",-1);
        API.getUI("选框两副牌").enabled = API.getUI("选框两副牌").value = false;
    }else if(uiID == "选框经典" ||uiID == "选框15张"){

        API.getUI ("选框3人").value = 3;
        pdkClick("选框3人",-1);

        var arr =  ["选框2人","选框3人"];
        rDisClick(arr,0); 
        
        API.getUI('选框防作弊').value=API.getUI('选框四带三').value=API.getUI('选框四带二').value=API.getUI('选框可拆炸弹').value = false;
        var array = ["选框可拆炸弹","选框防作弊","选框四带三","选框四带二"];
        cDisClick(array,0);

        var arr3 =  ["选框两副牌"];
        rDisClick(arr3,1);
        API.getUI('选框一副牌').value = API.getUI('选框首局先出黑桃3').value = true;
        pdkClick("选框一副牌",-1);
        pdkClick("选框首局先出黑桃3",-1);
        // API.getUI ("选框3人").enabled =
       

        // API.getUI('选框可拆炸弹').value = false;
        // API.getUI("选框可拆炸弹").enabled = true;
        // API.getUI("选框可拆炸弹").appendStyle({
        //     "backgroundImage":"sikuang"
        // })

    }else if(uiID == "选框四人"){
        var arr =  ["选框2人","选框3人"];
        var arr3 =  ["选框一副牌","选框两副牌"];
        rDisClick(arr,1);
        rDisClick(arr3,0);
        var array = ["选框首局先出黑桃3","选框防作弊","选框四带三","选框四带二"];
        API.getUI('选框四带三').value=API.getUI('选框四带二').value=API.getUI('选框防作弊').value = false;
        cDisClick(array,0);

        API.getUI('选框可拆炸弹').value = API.getUI('选框首局先出黑桃3').value = true;
        pdkClick("选框首局先出黑桃3",-1);

        API.getUI("选框可拆炸弹").enabled = false;
        API.getUI("选框可拆炸弹").appendStyle({
            "backgroundImage":"no_gou"
        })
    }else if(uiID == "选框两副牌"){
    	var array = ["选框首局先出黑桃3","选框红桃10翻倍","选框防作弊","选框四带三","选框四带二"];
    	API.getUI('选框四带三').value=API.getUI('选框四带二').value=API.getUI('选框防作弊').value = false;
        cDisClick(array,1);
        
    }else if(uiID == "选框一副牌"){
    	var array = ["选框首局先出黑桃3","选框红桃10翻倍","选框防作弊","选框四带三","选框四带二"];
    	API.getUI('选框四带三').value=API.getUI('选框四带二').value=API.getUI('选框防作弊').value = false;
        cDisClick(array,0);
    }
    getResult_pdk();
}

function cDisClick(uiID,state){
    if(state){
        for(var n= 0;n<uiID.length;n++){
            console.log(uiID[n]);

            var o = API.getUI(uiID[n]);
            o.appendStyle({
                "backgroundImage": "no_fu"
            });
            o.enabled = o.value = false;
            pdkClick(uiID[n],-1);
        }
    }else{
        for(var n= 0;n<uiID.length;n++){
            API.getUI(uiID[n]).appendStyle({
                "backgroundImage": "sikuang"
            });
            API.getUI(uiID[n]).enabled= true;
            pdkClick(uiID[n],-1);
        }
    }
}


function rDisClick(uiID,state){
    if(state){
        for(var n= 0;n<uiID.length;n++){
            console.log(uiID[n]);
            var o = API.getUI(uiID[n]);
            o.appendStyle({
                "backgroundImage": "no_yuandian"
            });
            o.enabled = o.value = false;
            pdkClick(uiID[n],-1);
        }
    }else{
        for(var n= 0;n<uiID.length;n++){
            var o = API.getUI(uiID[n]);
            o.appendStyle({
                "backgroundImage": "yuandian"
            });
            API.getUI(uiID[n]).enabled= true;
        }
    }
}

function getResult_pdk(){
    var api = API.getUI;
    var d =  {
        "SERVER_MODEL"       : "pdk",      //游戏房间服务器标志
        "IS_DELEGATE"        : false,      //是否代理开房
        "ROUND"              : api("选框10局").value + api("选框20局").value ,         //轮数
        "PLAYER_COUNT"       :api("选框2人").value + api("选框3人").value,          //玩家数量 （四人跑得快只能选四人，其他玩法可以选2或3人
        "GAME_TYPE"          : api("选框经典").value + api("选框15张").value+ api("选框四人").value,          //游戏类型 1：经典跑得快 2：15张跑得快 3：四人跑得快
        'IS_SHOW_CARDNUM'    : api("选框显示牌数").value + api("选框不显示牌数").value,          //是否显示牌数 1：显示 2：不显示
        'CAN_UNPACK_BOMB'    : API.getUI('选框可拆炸弹')?API.getUI('选框可拆炸弹').value:false,      //是否可拆炸弹 true：可拆 false:不可拆
        'FIRST_THREE'        : API.getUI('选框首局先出黑桃3')?API.getUI('选框首局先出黑桃3').value:false,       //首局先出黑桃3 true:是 false否
        'POKER_DECK'         : api("选框一副牌").value + api("选框两副牌").value,          //几副扑克牌？ （只在四人跑得快可以选择，其他玩法默认一副
        'IS_PREVENT_CARD'    : API.getUI("选框防作弊")?API.getUI("选框防作弊").value:false,
        'IS_AAKF'            : API.getUI("选框AA开房")?API.getUI("选框AA开房").value:false,
        'IS_HEARTTEN'        : API.getUI("选框红桃10翻倍")?API.getUI("选框红桃10翻倍").value:false,
        'FOUR_WITH_TWO'      : API.getUI("选框四带二")?API.getUI("选框四带二").value:false,//四带二
        'FOUR_WITH_THREE'    : API.getUI("选框四带三")?API.getUI("选框四带三").value:false//四带三
    }

    if(d.GAME_TYPE==3){
        d.PLAYER_COUNT = 4;
    }
    console.log(d);
    API.data["玩法设置"]=d;
    
    if(API.data.card==0){
        API.runActionGroup("错误提示","您的房卡用完啦！");
    }
    return d;

}


