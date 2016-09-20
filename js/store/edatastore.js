import {Store} from 'flux/utils';
import {SisDispatcher} from "../dispatcher"
import {Constant} from "../constant"
import _ from "underscore";
import async from "async"


var edata = {
    targetList:["flipkart","amazonindia"],
    currentIndex:0,
    spiderlist:[null,null]
}

class Edatastore extends Store{
    getAll(){
        return edata;
    }
    __onDispatch(payload) {
        //alert(test)
        if(payload.actionType == Constant.TARGETCLICK){
            var index = payload.index;
            edata.currentIndex = index;
            this.__emitChange();
        }
        else if(payload.actionType == Constant.SPIDERLISTUPDATE){
            this.__emitChange();
        }
        else if(payload.actionType == Constant.GETSPIDERLIST){
            $("#ajaxloading").show();
            async.map(edata.targetList,function(item,callback){
                $.ajax({
                    url: Constant.BASE_URL+"sadmin/spiderlist/"+item,
                    type: 'GET',
                    success: function (data) {
                        $("#ajaxloading").hide();
                        var msg = JSON.parse(data);
                        callback(null,msg.body);
                    },
                    error:function(jxr,scode){
                        $("#ajaxloading").hide();
                        callback("error",null);
                    }
                });
            },function(err,results){
                edata.spiderlist = results;
                SisDispatcher.dispatch({
                    actionType: Constant.SPIDERLISTUPDATE
                });
            });
        }
        else if(payload.actionType == Constant.CREATESPIDER){
            $("#ajaxloading").show();
            $.ajax({
                url: Constant.BASE_URL+"sadmin/createspider",
                data: $.param({
                    spidername:edata.targetList[edata.currentIndex]
                }),
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data);
                    SisDispatcher.dispatch({
                        actionType: Constant.GETSPIDERLIST
                    });
                },
                error:function(jxr,scode){
                    $("#ajaxloading").hide();
                },
                statusCode:{
                    406:function(){

                    },
                    500:function(){
                        SisDispatcher.dispatch({
                            actionType: Constant.ERROR500
                        });
                    },
                    409:function(){

                        window.alert("There is a active spider running. You can not create another spider now.")

                    }
                }
            });
        }
        else if(payload.actionType == Constant.EXPORTSPIDERDATA){
            var sp = edata.spiderlist[edata.currentIndex][payload.index];
            $("#pleaseWaitDialog").modal("show");
            $.ajax({
                url: Constant.BASE_URL+"sadmin/exportspider",
                data: $.param({
                    spidername:sp.name,
                    spiderid:sp._id
                }),
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#pleaseWaitDialog").modal("hide");
                    var msg = JSON.parse(data);
                    var fname = msg.body;
                    sp.downlink = fname;
                    SisDispatcher.dispatch({
                        actionType: Constant.SPIDERLISTUPDATE
                    });
                },
                error:function(jxr,scode){
                    $("#pleaseWaitDialog").modal("hide");
                },
                statusCode:{
                    406:function(){

                    },
                    500:function(){
                        SisDispatcher.dispatch({
                            actionType: Constant.ERROR500
                        });
                    },
                    409:function(){

                    }
                }
            });
            
        }
    }
}

export var edataStore = new Edatastore(SisDispatcher);