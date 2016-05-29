import {Store} from 'flux/utils';
import {SisDispatcher} from "../dispatcher"
import {Constant} from "../constant"
import _ from "underscore";
import async from "async"

var versionList = []

class Versionstore extends Store{
    getAll(){
        return versionList;
    }
    __onDispatch(payload){
        //alert(test)
        if(payload.actionType == Constant.GETVERSIONLIST){
            var that = this;
            $("#ajaxloading").show();
            $.ajax({
                url: Constant.BASE_URL+"sadmin/version/list",

                type: 'GET',
                success: function (data) {
                    //alert(data);
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data).body;
                    versionList = msg;
                    SisDispatcher.dispatch({
                        actionType: Constant.FORCEVERSIONLISTREFRESH,
                    });
                },
                error:function(){
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

                    }
                }
            });
        }
        else if(payload.actionType == Constant.FORCEVERSIONLISTREFRESH){
            this.__emitChange();
        }
        else if(payload.actionType == Constant.DELETEVERSION){
            var index = payload.index;
            $("#ajaxloading").hide();
            $.ajax({
                url: Constant.BASE_URL+"sadmin/version/delete",
                data: $.param({
                    id:versionList[index]._id
                }),
                type: 'DELETE',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data);
                    versionList.splice(index,1);
                    SisDispatcher.dispatch({
                        actionType: Constant.FORCEVERSIONLISTREFRESH
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

                    }
                }
            });
        }
        else if(payload.actionType == Constant.VERSIONADD){
            var platform = payload.platform;
            var versionnum = payload.versionnum;
            var fileurl = payload.fileurl;
            $("#ajaxloading").show();
            $.ajax({
                url: Constant.BASE_URL+"sadmin/version/add",
                data: $.param({
                    platform:platform,
                    versionnum:versionnum,
                    fileurl:fileurl
                }),
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#ajaxloading").hide();
                    SisDispatcher.dispatch({
                        actionType: Constant.GETVERSIONLIST
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

                    }
                }
            });
        }
    }
}

export var versionStore = new Versionstore(SisDispatcher);