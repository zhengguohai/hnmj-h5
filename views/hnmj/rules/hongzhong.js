function click(id,index=-1){
    var o = API.getUI(id);
    var obj = API.getUI(id).value;
    console.log('id: ' + id);
    var text = API.getUI(id.substr(2,id.length));

    var uiTextArray = API.getSwitchGroupByName(id);
    for(var n in uiTextArray){
        var cId = n.substring(0,n.length-2);
        API.getUI(cId).value=cId==id?obj:0;
        var TextId = n.substring(2,n.length-2);
        API.getUI(TextId).appendStyle({
            color: 'rgba(73,88,93,1)'
        });
        console.log("cId:",cId);
        console.log("TextId:",TextId);
        if(o.group === 'hzD'){
            API.getUI('抓码全中翻倍').visible = false;
            API.getUI('选框全中翻倍').value = 0;
        }
    }

    var uiText = id.substring(2);
    if(obj){
        API.getUI(uiText).appendStyle({
            color: 'rgba(186,76,54,1)'
        });
    }else{
        API.getUI(uiText).appendStyle({
            color: 'rgba(73,88,93,1)'
        });
    }


    if(id == '选框AA开房'){
        if(o.value == 0){
            API.getUI('8局').value = '8局(2张房卡)';
            API.getUI('16局').value = '16局(4张房卡)';
            API.getUI("代开房间按钮").appendStyle({
                "backgroundImage":"btn_hongse"
            });
        }else{
            API.getUI('8局') .value = '8局(每人1张)';
            API.getUI('16局').value = '16局(每人2张)';
            API.getUI("代开房间按钮").appendStyle({
                "backgroundImage": "btn_huise"
            });
        }
    }else if(id=="选框可抢杠胡"){   //更新到1.5.20
        if(o.value == 0){
            API.getUI('抓码抢杠胡包三家').visible = false;
             API.getUI('选框抢杠胡包三家').value = 0;

        }else{
            API.getUI('抓码抢杠胡包三家').visible = true;
             API.getUI('选框抢杠胡包三家').value = 1;
             var text1 = API.getUI('抢杠胡包三家');
             text1.appendStyle({
                 color: 'rgba(186,76,54,1)'
             });
        }

    }else if(id == "选框6码"){
        API.getUI('抓码全中翻倍').visible = true;
        API.getUI('选框全中翻倍').value = 1;
        var text1 = API.getUI('全中翻倍');
        text1.appendStyle({
            color: 'rgba(186,76,54,1)'
        });
    }else if(id == "选框只能自摸"){
        API.getUI('选框8个红中').value = 1;
        API.getUI('选框8个红中').enabled = true;
        var text1 = API.getUI('8个红中');
        text1.appendStyle({
            color: 'rgba(186,76,54,1)'
        });
        API.getUI('选框8个红中').appendStyle({
            "backgroundImage": "sikuang"
        });
    }else if(id == "选框可点炮"){
        API.getUI('选框8个红中').value = 0;
        API.getUI('选框8个红中').enabled = false;

        var text1 = API.getUI('8个红中');
        text1.appendStyle({
            color: 'rgba(73,88,93,1)'
        });
        API.getUI('选框8个红中').appendStyle({
            "backgroundImage": "no_fu"
        });
    }



    getResult('hz');
}
