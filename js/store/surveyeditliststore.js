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
                    surveyid:editSurveyList[index]._id
                }),
                type: 'DELETE',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data);
                    editSurveyList.splice(index,1);
                    SisDispatcher.dispatch({
                        actionType: Constant.FORCEEDITORSURVEYCHANGE
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

export var surveyEditListStore = new EditSurveyList(SisDispatcher);