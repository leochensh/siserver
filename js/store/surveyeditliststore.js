import {Store} from 'flux/utils';
import {SisDispatcher} from "../dispatcher"
import {Constant} from "../constant"
import _ from "underscore";
import async from "async"

var editSurveyList = []

class EditSurveyList extends Store{
    getAll(){
        return editSurveyList;
    }
    __onDispatch(payload){
        //alert(test)
        if(payload.actionType == Constant.GETSURVEYEDITLIST){
            var that = this;
            $("#ajaxloading").show();
            if(payload.role == "admin"){
                $.ajax({
                    url: Constant.BASE_URL+"admin/survey/list",

                    type: 'GET',
                    success: function (data) {
                        //alert(data);
                        $("#ajaxloading").hide();
                        var msg = JSON.parse(data).body;
                        editSurveyList = msg;
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
            else if(payload.role == 'sadmin'){
                $.ajax({
                    url: Constant.BASE_URL+"sadmin/survey/list",

                    type: 'GET',
                    success: function (data) {
                        //alert(data);
                        $("#ajaxloading").hide();
                        var msg = JSON.parse(data).body;
                        editSurveyList = msg;
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
            else{
                $.ajax({
                    url: Constant.BASE_URL+"editor/survey/list",

                    type: 'GET',
                    success: function (data) {
                        //alert(data);
                        $("#ajaxloading").hide();
                        var msg = JSON.parse(data).body;
                        editSurveyList = msg;
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

        }
        else if(payload.actionType == Constant.FORCEEDITORSURVEYCHANGE){
            this.__emitChange();
        }
        else if(payload.actionType == Constant.DELETESURVEY){
            var index = payload.index;
            $("#ajaxloading").show();
            $.ajax({
                url: Constant.BASE_URL+"editor/survey/delete",
                data: $.param({
                    surveyid:index
                }),
                type: 'DELETE',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data);
                    var rindex = _.findIndex(editSurveyList,function(item){
                        return item._id == index;
                    });
                    if(rindex>=0){
                        editSurveyList.splice(rindex,1);
                        SisDispatcher.dispatch({
                            actionType: Constant.FORCEEDITORSURVEYCHANGE
                        });
                    }

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
        else if(payload.actionType == Constant.AUDITSURVEY){
            var index = payload.index;
            $("#ajaxloading").show();
            $.ajax({
                url: Constant.BASE_URL+"sadmin/survey/audit",
                data: $.param({
                    surveyid:index
                }),
                type: 'PUT',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data);
                    SisDispatcher.dispatch({
                        actionType: Constant.GETSURVEYEDITLIST,
                        role:payload.role
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
        else if(payload.actionType == Constant.WITHDRAWSURVEY){
            var index = payload.index;
            $("#ajaxloading").show();
            $.ajax({
                url: Constant.BASE_URL+"admin/survey/withdraw",
                data: $.param({
                    surveyid:index
                }),
                type: 'PUT',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data);
                    SisDispatcher.dispatch({
                        actionType: Constant.GETSURVEYEDITLIST,
                        role:payload.role
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
        else if(payload.actionType == Constant.SURVEYTOTEMPLATE){
            var surveyid = payload.surveyid;
            var templatename = payload.templatename;
            $("#ajaxloading").show();
            $.ajax({
                url: Constant.BASE_URL+"sadmin/survey/totemplate",
                data: $.param({
                    surveyid:surveyid,
                    templatename:templatename
                }),
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data);
                    SisDispatcher.dispatch({
                        actionType: Constant.GETTEMPLATELIST
                       // role:payload.role
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
        /*
        else if(payload.actionType == Constant.TEMPLATETOSURVEY){
            var surveyid = payload.surveyid;
            var surveyname = payload.surveyname;
            $("#ajaxloading").show();
            $.ajax({
                url: Constant.BASE_URL+"admin/survey/fromtemplate",
                data: $.param({
                    surveyid:surveyid,
                    surveyname:surveyname
                }),
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data);
                    SisDispatcher.dispatch({
                        actionType: Constant.GETSURVEYEDITLIST,
                        role:payload.role
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
        */
    }
}

export var surveyEditListStore = new EditSurveyList(SisDispatcher);