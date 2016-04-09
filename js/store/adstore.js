import {Store} from 'flux/utils';
import {SisDispatcher} from "../dispatcher"
import {Constant} from "../constant"
import _ from "underscore";
import async from "async"

var adList = []

class AdStore extends Store{
    getAll(){
        return adList;
    }
    __onDispatch(payload){
        //alert(test)
        if(payload.actionType == Constant.GETADLIST){
            var that = this;
            $("#ajaxloading").show();
            $.ajax({
                url: Constant.BASE_URL+"sadmin/ad/list",

                type: 'GET',
                success: function (data) {
                    //alert(data);
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data).body;
                    adList = msg;
                    SisDispatcher.dispatch({
                        actionType: Constant.FORCEEDITORSURVEYCHANGE,
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
        else if(payload.actionType == Constant.FORCEADLISTREFRESH){
            this.__emitChange();
        }
        else if(payload.actionType == Constant.DELETEAD){
            var index = payload.index;
            $("#ajaxloading").hide();
            $.ajax({
                url: Constant.BASE_URL+"sadmin/ad/delete",
                data: $.param({
                    id:adList[index]._id
                }),
                type: 'DELETE',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data);
                    adList.splice(index,1);
                    SisDispatcher.dispatch({
                        actionType: Constant.FORCEADLISTREFRESH
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
        else if(payload.actionType == Constant.ADDAD){
            var title = payload.title;
            var image = payload.image;
            var link = payload.link;
            $("#ajaxloading").hide();
            $.ajax({
                url: Constant.BASE_URL+"sadmin/ad/add",
                data: $.param({
                    title:title,
                    image:image,
                    link:link
                }),
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#ajaxloading").hide();
                    SisDispatcher.dispatch({
                        actionType: Constant.GETADLIST
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

export var adStore = new AdStore(SisDispatcher);