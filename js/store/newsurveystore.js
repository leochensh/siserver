import {Store} from 'flux/utils';
import {SisDispatcher} from "../dispatcher"
import {Constant} from "../constant"
import _ from "underscore";

var surveyData = {
    surveyname:"new survey",
    ifSaved:false,
    surveyid:null,
    ifSurveyNameEmpty:false,
    surveystatus:Constant.SURVEYSTATUS_EDIT,
    qlist:[]
}

class NewsurveyStore extends Store{
    getAll(){
        return surveyData;
    }
    __onDispatch(payload){
        //alert(test)
        if(payload.actionType == Constant.SURVEYVALUECHANGE){
            surveyData[payload.name] = payload.value;
            this.__emitChange();
        }
        else if(payload.actionType == Constant.CLEANSURVEYDATA){
            surveyData = {
                surveyname:"new survey",
                ifSaved:false,
                surveyid:null,
                ifSurveyNameEmpty:false,
                qlist:[]
            };
            this.__emitChange();
        }
        else if(payload.actionType == Constant.SURVEYDATABATCHCHANGE){
            var ka = _.keys(payload.value);
            for(var i in ka){
                surveyData[ka[i]] = payload.value[ka[i]];
            }
            this.__emitChange();
        }
        else if(payload.actionType == Constant.CAUSECHANGE){
            this.__emitChange();
        }
        else if(payload.actionType == Constant.SAVESINGLEQUESTION){
            var qindex = payload.qindex;
            var qd = surveyData.qlist[qindex];
            var that = this;
            if(qd.title){
                var depid=null;
                if(qd.precedentindex>=0){
                    depid = surveyData.qlist[qd.precedentindex].id;
                }
                var q = {
                    title:qd.title,
                    surveyid:surveyData.surveyid,
                    type:qd.type,
                    selectlist:qd.selectlist,
                    ifhasprecedent:qd.ifhasprecedent,
                    precedentid:depid,
                    precedentselectindex:qd.precedentselectindex
                };
                //alert(JSON.stringify(this.props.qdata));
                $("#ajaxloading").show();
                if(qd.id){
                    q.questionid = qd.id;
                    $.ajax({
                        url: Constant.BASE_URL+"editor/survey/question/edit",
                        data: JSON.stringify(q),
                        contentType: 'application/json; charset=utf-8',
                        type: 'PUT',
                        success: function(data){
                            $("#ajaxloading").hide();
                            qd.ifSaved = true;
                            SisDispatcher.dispatch({
                                actionType: Constant.CAUSECHANGE,
                            });
                        },
                        error:function(jxr,scode){
                            $("#ajaxloading").hide();
                        }
                    });
                }
                else{
                    $.ajax({
                        url: Constant.BASE_URL+"editor/survey/question/add",
                        data: JSON.stringify(q),
                        contentType: 'application/json; charset=utf-8',
                        type: 'POST',
                        success: function(data){
                            $("#ajaxloading").hide();
                            qd.ifSaved = true;
                            qd.id = JSON.parse(data).body;
                            SisDispatcher.dispatch({
                                actionType: Constant.CAUSECHANGE,
                            });

                        },
                        error:function(jxr,scode){
                            $("#ajaxloading").hide();
                        }
                    });
                }

            }
            else{
                alert("Question data is incomplete to save.")
            }

        }
    }
}

export var newsurveyStore = new NewsurveyStore(SisDispatcher);