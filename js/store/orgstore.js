import {Store} from 'flux/utils';
import {SisDispatcher} from "../dispatcher"
import {Constant} from "../constant"
import _ from "underscore";
import async from "async"

var orgList = [];
var orgData = {
    activeorgindex:0
};

class OrgStore extends Store{
    getAll(){
        return orgList;
    }

    getData(){
        return orgData;
    }
    __onDispatch(payload){
        //alert(test)
        if(payload.actionType == Constant.GETORGNIZATIONLIST){
            var that = this;
            $("#ajaxloading").show();
            $.ajax({
                url: Constant.BASE_URL+"sadmin/org/list",

                type: 'GET',
                success: function (data) {
                    //alert(data);
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data).body;
                    orgList = msg;
                    SisDispatcher.dispatch({
                        actionType: Constant.FORCEORGNIZATIONREFRESH,
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
        else if(payload.actionType == Constant.FORCEORGNIZATIONREFRESH){
            this.__emitChange();
        }
        else if(payload.actionType == Constant.CHANGEACTIVEORG){
            orgData.activeorgindex = payload.index;
            setTimeout(function(){
                SisDispatcher.dispatch({
                    actionType: Constant.GETORGADMINLIST
                });
            },100);

        }
        else if(payload.actionType == Constant.DELETEORGADMIN){
            var index = payload.index;
            $("#ajaxloading").hide();
            $.ajax({
                url: Constant.BASE_URL+"sadmin/org/admin/delete",
                data: $.param({
                    adminid:orgData.adminlist[index]._id
                }),
                type: 'DELETE',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data);
                    SisDispatcher.dispatch({
                        actionType: Constant.GETORGADMINLIST
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
        else if(payload.actionType == Constant.GETORGADMINLIST){
            if(orgList.length>0){
                var that = this;
                $("#ajaxloading").show();
                $.ajax({
                    url: Constant.BASE_URL+"sadmin/org/admin/list/"+orgList[orgData.activeorgindex]._id,

                    type: 'GET',
                    success: function (data) {
                        //alert(data);
                        $("#ajaxloading").hide();
                        var msg = JSON.parse(data).body;
                        orgData.adminlist = msg;
                        SisDispatcher.dispatch({
                            actionType: Constant.FORCEORGNIZATIONREFRESH,
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

        }
    }
}

export var orgStore = new OrgStore(SisDispatcher);