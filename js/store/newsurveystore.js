import {Store} from 'flux/utils';
import {SisDispatcher} from "../dispatcher"
import {Constant} from "../constant"
import _ from "underscore";
import async from "async"

var surveyData = {
    surveyname:"new survey",
    ifSaved:false,
    surveyid:null,
    ifSurveyNameEmpty:false,
    surveystatus:Constant.SURVEYSTATUS_EDIT,
    qlist:[]
}

function saveQuestion(qd,suceditcallback,sucnewcallback,faileditcallback,failnewcallback){
    if(true){
        var depid=null;
        var ifhasp = false;
        if(qd.precedentindex>=0){
            depid = surveyData.qlist[qd.precedentindex].id;
            ifhasp = true;
        }
        var q = {
            title:qd.title,
            surveyid:surveyData.surveyid,
            type:qd.type,
            selectlist:qd.selectlist,
            ifhasprecedent:ifhasp,
            precedentid:depid,
            precedentselectindex:qd.precedentselectindex,
            scorelist:qd.scorelist
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
                    suceditcallback(data);

                },
                error:function(jxr,scode){
                    faileditcallback();

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
                    sucnewcallback(data);

                },
                error:function(jxr,scode){
                    failnewcallback();
                }
            });
        }

    }
    else{
        alert("Question data is incomplete to save.")
    }

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

            saveQuestion(qd,function(data){
                $("#ajaxloading").hide();
                qd.ifSaved = true;
                SisDispatcher.dispatch({
                    actionType: Constant.CAUSECHANGE,
                });
            },function(data){
                $("#ajaxloading").hide();
                qd.ifSaved = true;
                qd.id = JSON.parse(data).body;
                SisDispatcher.dispatch({
                    actionType: Constant.CAUSECHANGE,
                });
            },function(){
                $("#ajaxloading").hide();
            },function(){
                $("#ajaxloading").hide();
            });



        }
        else if(payload.actionType == Constant.SAVEALLQUESTION){
            async.forEachOfSeries(surveyData.qlist,function(v,i,cb){
                saveQuestion(v,function(data){
                    v.ifSaved = true;
                    SisDispatcher.dispatch({
                        actionType: Constant.CAUSECHANGE,
                    });
                    cb();
                },function(data){
                    v.ifSaved = true;
                    v.id = JSON.parse(data).body;
                    SisDispatcher.dispatch({
                        actionType: Constant.CAUSECHANGE,
                    });
                    cb();
                },function(){
                    cb();
                },function(){
                    cb();
                });
            },function(err){
                $("#ajaxloading").hide();
            });
        }
        else if(payload.actionType == Constant.EDITSURVEY){
            var sid = payload.id;
            var that = this;
            $("#ajaxloading").show();
            $.ajax({
                url: Constant.BASE_URL+"editor/survey/detail/"+sid,

                type: 'GET',
                success: function (data) {
                    //alert(data);
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data).body;

                    //editSurveyList = msg;
                    SisDispatcher.dispatch({
                        actionType: Constant.PARSESURVEYDETAIL,
                        survey:msg
                    });
                },
                error:function(){
                    $("#ajaxloading").hide();
                }
            });
        }
        else if(payload.actionType == Constant.PARSESURVEYDETAIL){
            var survey = payload.survey;
            if(survey){
                surveyData = {
                    surveyname:survey.name,
                    ifSaved:true,
                    surveyid:survey._id,
                    ifSurveyNameEmpty:false,
                    surveystatus:survey.status,
                    qlist:[]
                }
                var nqlist = survey.questionlist;
                for(var i in nqlist){
                    var nq = {
                        id:nqlist[i]._id,
                        title:nqlist[i].title,
                        ifSaved:true,
                        type:nqlist[i].type,
                        selectlist:nqlist[i].selectlist,
                        scorelist:nqlist[i].scorelist
                    }
                    if(nqlist[i].ifhasprecedent){
                        var findex = _.findIndex(nqlist,function(item){
                            return nqlist[i].precedentid == item._id;
                        })
                        if(findex>=0){
                            nq.precedentindex = findex;

                        }
                        nq.precedentselectindex = nqlist[i].precedentselectindex;
                    }
                    surveyData.qlist.push(nq);
                }
                this.__emitChange();

            }

        }
    }
}

export var newsurveyStore = new NewsurveyStore(SisDispatcher);