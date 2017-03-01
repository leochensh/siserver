import {Store} from 'flux/utils';
import {SisDispatcher} from "../dispatcher"
import {Constant} from "../constant"
import _ from "underscore";
import async from "async";
import {Emailcheck} from "../components/emailcheck";

var surveyData = {
    surveyname:"",
    ifallowrepeat:false,
    ifSaved:false,
    surveyid:null,
    ifSurveyNameEmpty:false,
    surveystatus:Constant.SURVEYSTATUS_EDIT,
    qlist:[],
    type:"",
    metainfolist:[]
};

var opArray = [];

var opInterval = 1500;

var addToProc = function(op){
    var findex = _.findIndex(opArray,function(it){
        if(op.type == "namechange"){
            return it.type == op.type;
        }
        else if(op.type == "questionchange"){
            return it.type == op.type && it.index == op.index;
        }

    });
    if(findex<0){
        opArray.push(op);
    }
}

var opProc = function(){
    for(var index in opArray){
        var co = opArray[index];
        if(co.type == "namechange"){

            opArray.splice(index,1);
            $("#ajaxloading").show();
            var data = {
                name:surveyData.surveyname,
                id:surveyData.surveyid,
                ifallowrepeat:surveyData.ifallowrepeat
            };
            if(surveyData.metainfolist && surveyData.metainfolist.length>0){
                data.metainfo = JSON.stringify(surveyData.metainfolist);
            }
            else{
                data.metainfo = JSON.stringify([]);
            }
            $.ajax({
                url: Constant.BASE_URL+"editor/survey/edit",
                data: $.param(data),
                type: 'PUT',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#ajaxloading").hide();
                    $("#surveynameform").popover("show");

                    var msg = JSON.parse(data);

                },
                error:function(jxr,scode){
                    $("#ajaxloading").hide();
                },
                statusCode:{
                    406:function(){

                    },
                    500:function(){
                        SisDispatcher.dispatch({
                            actionType: Constant.ERROR500,
                        });
                    },
                    409:function(){

                    }
                }
            });
        }
        else if(co.type == "questionchange"){
            opArray.splice(index,1);
            saveQuestion(surveyData.qlist[co.index],function(){},function(){},function(){},function(){});
        }

    }
};

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
                    $("#ajaxloading").hide();
                    suceditcallback(data);


                },
                error:function(jxr,scode){
                    $("#ajaxloading").hide();
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
                    $("#ajaxloading").hide();
                    qd.ifSaved = true;
                    qd.id = JSON.parse(data).body;
                    sucnewcallback(data);

                },
                error:function(jxr,scode){
                    $("#ajaxloading").hide();
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
            if(payload.name!="ifSurveyNameEmpty" || !payload.value){
                surveyData["ifSurveyNameEmpty"] = false;
            }

            this.__emitChange();
        }
        else if(payload.actionType == Constant.CLEANSURVEYDATA){
            surveyData = {
                surveyname:"",
                ifSaved:false,
                surveyid:null,
                ifSurveyNameEmpty:false,
                surveystatus:Constant.SURVEYSTATUS_EDIT,
                qlist:[],
                type:"",
                metainfolist:[]
            };
            this.__emitChange();
        }
        else if(payload.actionType == Constant.ADDNEWMETA){
            if(!surveyData.metainfolist){
                surveyData.metainfolist = [];
            }
            surveyData.metainfolist.push({
                text:"",
                qid:-1
            });
            this.__emitChange();
        }
        else if(payload.actionType == Constant.METATEXTCHANGE){
            var index = payload.index;
            var text = payload.text;


            var metainfolist = surveyData.metainfolist;
            metainfolist[index].text = text;

            this.__emitChange();
            addToProc({
                type:"namechange"
            });

            setTimeout(function(){
                opProc();
            },opInterval);
        }
        else if(payload.actionType == Constant.METAIMGCHANGE){
            var index = payload.index;
            var img = payload.img;


            var metainfolist = surveyData.metainfolist;
            metainfolist[index].img = img;

            this.__emitChange();
            addToProc({
                type:"namechange"
            });

            setTimeout(function(){
                opProc();
            },opInterval);
        }
        else if(payload.actionType == Constant.METASELECTCHANGE){
            var index = payload.index;
            var select = payload.select;


            var metainfolist = surveyData.metainfolist;
            metainfolist[index].qid = select;

            this.__emitChange();
            addToProc({
                type:"namechange"
            });

            setTimeout(function(){
                opProc();
            },opInterval);
        }
        else if(payload.actionType == Constant.DELETEMETA){
            var index = payload.index;
            surveyData.metainfolist.splice(index,1);
            this.__emitChange();
            addToProc({
                type:"namechange"
            });

            setTimeout(function(){
                opProc();
            },opInterval);
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
            var that = this;
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
                $("#saveallbutton").popover("show");
                setTimeout(function(){
                    $("#saveallbutton").popover("hide");
                },1500);

                $("#dataimporting").modal("hide");
                $("#dataimportend").modal("show");

                for(var qindex in surveyData.qlist){
                    var cq = surveyData.qlist[qindex];
                    var cslist = cq.selectlist;
                    for(var sindex in cslist){
                        var cs = cslist[sindex];
                        if(cs.qindex && cs.qindex>=0){
                            cs.qid = surveyData.qlist[cs.qindex].id;
                            console.log("+++++++++++++++++++++++++++++");
                            console.log(cs);


                            addToProc({
                                type:"questionchange",
                                index:qindex
                            });

                            setTimeout(function(){
                                opProc();
                            },opInterval);
                        }
                    }

                }
                SisDispatcher.dispatch({
                    actionType: Constant.CAUSECHANGE,
                });


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
                    for(var qindex in msg.questionlist){  //如果是android客户端上传，可能是打包成json字符串，因此要进行处理。再quest和stastic中也要同样处理。
                        var cq = msg.questionlist[qindex];
                        if(cq.selectlist){
                            if(_.isString(cq.selectlist)){
                                cq.selectlist = Emailcheck.safeJsonParse(cq.selectlist,[]);
                            }
                        }

                    }
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
                    ifallowrepeat:survey.ifallowrepeat,
                    ifSaved:true,
                    surveyid:survey._id,
                    ifSurveyNameEmpty:false,
                    surveystatus:survey.status,
                    qlist:[],
                    type:survey.type,
                    metainfolist:survey.metainfolist
                };
                var nqlist = survey.questionlist;
                for(var i in nqlist){
                    var nq = {
                        id:nqlist[i]._id,
                        title:nqlist[i].title,
                        ifSaved:true,
                        type:nqlist[i].type,
                        selectlist:nqlist[i].selectlist,
                        scorelist:nqlist[i].scorelist
                    };
                    if(nqlist[i].ifhasprecedent){
                        var findex = _.findIndex(nqlist,function(item){
                            return nqlist[i].precedentid == item._id;
                        });
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
        else if(payload.actionType == Constant.SURVEYNAMECHANGE){
            var value = payload.value;

            surveyData.surveyname = value;
            this.__emitChange();
            if(surveyData.ifSaved){
                addToProc({
                    type:"namechange"
                });

                setTimeout(function(){
                    opProc();
                },opInterval);
            }


        }
        else if(payload.actionType == Constant.SURVEYALLOWREPEATSUBMIT){
            var value = payload.value;

            surveyData.ifallowrepeat = value;
            this.__emitChange();
            if(surveyData.ifSaved){
                addToProc({
                    type:"namechange"
                });

                setTimeout(function(){
                    opProc();
                },opInterval);
            }


        }
        else if(payload.actionType == Constant.SURVEYADDNEWQUESTION){
            var q = payload.value;
            surveyData.qlist.push(q);
            this.__emitChange();

            addToProc({
                type:"questionchange",
                index:surveyData.qlist.length-1
            });

            setTimeout(function(){
                opProc();
            },opInterval);

            //saveQuestion(q,null,function(data){
            //    $("#ajaxloading").hide();
            //    q.ifSaved = true;
            //    q.id = JSON.parse(data).body;
            //    SisDispatcher.dispatch({
            //        actionType: Constant.CAUSECHANGE,
            //    });
            //},null,function(){
            //    $("#ajaxloading").hide();
            //});
        }
        else if(payload.actionType == Constant.SURVEYQUESTIONEDIT){
            var qindex = payload.value;
            //var currentQ = surveyData.qlist[qindex];
            this.__emitChange();
            addToProc({
                type:"questionchange",
                index:qindex
            });

            setTimeout(function(){
                opProc();
            },opInterval);
            //saveQuestion(currentQ,function(data){
            //    $("#ajaxloading").hide();
            //    currentQ.ifSaved = true;
            //    SisDispatcher.dispatch({
            //        actionType: Constant.CAUSECHANGE,
            //    });
            //},null,function(){
            //    $("#ajaxloading").hide();
            //},null);
        }
        else if(payload.actionType == Constant.SURVEYQUESTIONDELETE){
            var qindex = payload.value;
            console.log(payload);
            if(surveyData.metainfolist && surveyData.metainfolist.length>0){
                var fi = _.findIndex(surveyData.metainfolist,function(item){
                    return item.qid == surveyData.qlist[qindex].id
                })
                if(fi>=0){
                    surveyData.metainfolist.splice(fi,1);
                    this.__emitChange();
                    addToProc({
                        type:"namechange"
                    });

                    setTimeout(function(){
                        opProc();
                    },opInterval);
                }
            }

            for(var questionindex in surveyData.qlist){
                var cq = surveyData.qlist[questionindex];
                for (var selectindex in cq.selectlist){
                    if(cq.selectlist[selectindex].qid == surveyData.qlist[qindex].id){
                        cq.selectlist[selectindex].qid = -1;
                        addToProc({
                            type:"questionchange",
                            index:questionindex
                        });

                        setTimeout(function(){
                            opProc();
                        },opInterval);
                    }
                }
            }


            $("#ajaxloading").show();
            var that = this;
            $.ajax({
                url: Constant.BASE_URL+"editor/survey/question/delete",
                data: $.param({
                    questionid:surveyData.qlist[qindex].id
                }),
                type: 'DELETE',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data);
                    surveyData.qlist.splice(qindex,1);
                    SisDispatcher.dispatch({
                        actionType: Constant.CAUSECHANGE,
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
                            actionType: Constant.ERROR500,
                        });
                    },
                    409:function(){
                    }
                }
            });
        }
        else if(payload.actionType == Constant.SURVEYQUESTIONSEQUENCECHANGE){
            var qindex = payload.index;
            var direction = payload.direction;

            $("#ajaxloading").show();
            var that = this;
            $.ajax({
                url: Constant.BASE_URL+"editor/survey/question/sequencechange",
                data: $.param({
                    surveyid:surveyData.surveyid,
                    questionid:surveyData.qlist[qindex].id,
                    direction:direction
                }),
                type: 'PUT',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data);

                    if(direction == "up" && qindex!=0){
                        var temp = surveyData.qlist[qindex-1];
                        surveyData.qlist[qindex-1] = surveyData.qlist[qindex];
                        surveyData.qlist[qindex] = temp;
                    }
                    else if(direction == "down" && qindex != surveyData.qlist.length-1){
                        var nextIndex = parseInt(qindex);
                        var temp = surveyData.qlist[nextIndex+1];
                        surveyData.qlist[nextIndex+1] = surveyData.qlist[qindex];
                        surveyData.qlist[qindex] = temp;
                    }


                    SisDispatcher.dispatch({
                        actionType: Constant.CAUSECHANGE,
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
                            actionType: Constant.ERROR500,
                        });
                    },
                    409:function(){
                    }
                }
            });
        }
    }
}

export var newsurveyStore = new NewsurveyStore(SisDispatcher);