/**
 * Created by 张志良 on 2016/9/14.
 */
import {Store} from 'flux/utils';
import {SisDispatcher} from "../dispatcher"
import {Constant} from "../constant"
import _ from "underscore";
import async from "async"

var templateList = [];

class TemplateStore extends Store{
    getAll(){
        return templateList;
    }
    __onDispatch(payload){

        if(payload.actionType == Constant.GETTEMPLATELIST){
            $("#ajaxloading").show();
            $.ajax({
                url: Constant.BASE_URL+"all/templatelist",

                type: 'GET',
                success: function (data) {
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data).body;
                    templateList = msg;
                    SisDispatcher.dispatch({
                        actionType: Constant.TEMPLATEEND,
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
        else if(payload.actionType == Constant.DELETETEMPLATE){
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
                    var rindex = _.findIndex(templateList,function(item){
                        return item._id == index;
                    });
                    if(rindex>=0){
                        templateList.splice(rindex,1);
                        SisDispatcher.dispatch({
                            actionType: Constant.TEMPLATEEND
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
        else if(payload.actionType == Constant.TEMPLATEEND){
            this.__emitChange();
        }

    }
}

export var templateStore = new TemplateStore(SisDispatcher);