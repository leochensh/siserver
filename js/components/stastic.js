import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import {Question} from "./question"
import {RgraphControl} from "./rgraphcontrol"
import _ from "underscore"
import crypto from "crypto"
import async from "async"
import {Emailcheck} from "./emailcheck"

export var Stastic = React.createClass({
    getInitialState(){
        return{
            survey:null,
            answerlist:[],
            originalanswerlist:[],
            detailid:null,
            ifexport:false,
            exporturl:null,
            filterList:[]
        }
    },
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    exportxlsx(){
        $("#ajaxloading").show();
        var qout = [];
        var firstQ = [ "No.","duration","Interviewer","Visit Date",
                       "Country","City","Customer","Male","Female"];

        for(var qindex in this.state.survey.questionlist){
            var q = this.state.survey.questionlist[qindex];
            var base_str = "Q"+(parseInt(qindex)+1);
            if(q.type == Constant.QTYPE_MULTISELECT ||
                q.type == Constant.QTYPE_SINGLESELECT ||
                q.type == Constant.QTYPE_MULTISELECT_RECORD_TEXT ||
                q.type == Constant.QTYPE_MULTISELECT_TEXT ||
                q.type == Constant.QTYPE_SINGLESELECT_RECORD_TEXT ||
                q.type == Constant.QTYPE_SINGLESELECT_TEXT){
                for(var j in q.selectlist){
                    firstQ.push(base_str+"_"+(parseInt(j)+1))
                }

            }
            else if(q.type == Constant.QTYPE_SCORE){
                var scoreStart = 0;
                var scoreEnd = 10;
                var scoreStep = 1;

                if(q.scorelist && _.isArray(q.scorelist)){
                    scoreStart = parseInt(q.scorelist[0].start);
                    scoreEnd = parseInt(q.scorelist[0].end);
                    scoreStep = parseInt(q.scorelist[0].step);
                }

                for(var i=scoreStart;i<=scoreEnd;i+=scoreStep){
                    firstQ.push(base_str+"_"+(parseInt(i)))
                }
            }
            else{
                firstQ.push(base_str);
            }


        }

        qout.push(firstQ);

        for(var aindex in this.state.answerlist){
            var currentA = this.state.answerlist[aindex];
            var calist = currentA.answerlist;
            var dstring = ""

            var country = "";
            var city = "";
            var customer = "";
            var male = "";
            var female = "";
            var duration = "";

            if(currentA.begintime && currentA.endtime){
                var stime = new Date(currentA.begintime);
                var etime = new Date(currentA.endtime);
                if(stime && etime){
                    duration = (etime-stime)/(1000*60);
                }
            }

            var aNameList = currentA.name.split("_");
            var bias = 0;
            if(aNameList[0] != this.state.survey.name){
                bias = 1;
            }
            if(aNameList[2-bias]){
                var nd=new Date(aNameList[2-bias]);
                var year = nd.getFullYear();
                var month = nd.getMonth()+1;
                var date = nd.getDate();
                dstring = year+"/"+month+"/"+date;
            }
            country = aNameList[3-bias]?aNameList[3-bias]:"";
            city = aNameList[4-bias]?aNameList[4-bias]:"";
            customer = aNameList[5-bias]?aNameList[5-bias]:"";
            if(aNameList[6-bias]){
                if(aNameList[6-bias] == "male"){
                    male = "1";
                }
                else if(aNameList[6-bias] == "female"){
                    female = "1";
                }
            }

            firstQ = [(parseInt(aindex)+1),duration,currentA.investigatorname?currentA.investigatorname:"",
                      dstring,country,city,customer,male,female];


            for(var qindex in this.state.survey.questionlist){
                var q = this.state.survey.questionlist[qindex];
                if(q.type == Constant.QTYPE_MULTISELECT ||
                    q.type == Constant.QTYPE_SINGLESELECT ||
                    q.type == Constant.QTYPE_MULTISELECT_RECORD_TEXT ||
                    q.type == Constant.QTYPE_MULTISELECT_TEXT ||
                    q.type == Constant.QTYPE_SINGLESELECT_RECORD_TEXT ||
                    q.type == Constant.QTYPE_SINGLESELECT_TEXT){
                    var tempList = [];
                    for(var j in q.selectlist){
                        tempList.push("")
                    }
                    var qfi = _.findIndex(calist,function(item){
                        return item.questionid == q._id;
                    });
                    if(qfi>=0){
                        var slist = calist[qfi].selectindexlist;
                        for(var sindex in slist){
                            tempList[slist[sindex]] = 1;
                            if(calist[qfi].selectextra && calist[qfi].selectextra.length>0){
                                var seindex = _.findIndex(calist[qfi].selectextra,function(item){
                                    return item.index == slist[sindex];
                                })
                                if(seindex>=0 && calist[qfi].selectextra[seindex].text){
                                    tempList[slist[sindex]] = calist[qfi].selectextra[seindex].text;
                                }
                            }
                        }
                    }
                    for(var tindex in tempList){
                        firstQ.push(tempList[tindex]);
                    }

                }
                else if(q.type == Constant.QTYPE_SCORE){
                    var scoreStart = 0;
                    var scoreEnd = 10;
                    var scoreStep = 1;
                    var tempList = [];
                    if(q.scorelist && _.isArray(q.scorelist)){
                        scoreStart = parseInt(q.scorelist[0].start);
                        scoreEnd = parseInt(q.scorelist[0].end);
                        scoreStep = parseInt(q.scorelist[0].step);
                    }

                    var qfi = _.findIndex(calist,function(item){
                        return item.questionid == q._id;
                    });
                    if(qfi>=0){
                        if(calist[qfi].scorelist){
                            var sfi = _.findIndex(calist[qfi].scorelist,function(item){
                                return item.index == 0;
                            })
                            if(sfi>=0){
                                for(var i=scoreStart;i<=scoreEnd;i+=scoreStep){
                                    if(i == calist[qfi].scorelist[sfi].score){
                                        tempList.push(1);
                                    }
                                    else{
                                        tempList.push("")
                                    }

                                }
                            }
                            else{
                                for(var i=scoreStart;i<=scoreEnd;i+=scoreStep){
                                    tempList.push("")
                                }
                            }

                        }
                        else{
                            for(var i=scoreStart;i<=scoreEnd;i+=scoreStep){
                                tempList.push("")
                            }
                        }


                    }
                    else{
                        for(var i=scoreStart;i<=scoreEnd;i+=scoreStep){
                            tempList.push("")
                        }
                    }
                    for(var tindex in tempList){
                        firstQ.push(tempList[tindex]);
                    }
                }
                else{
                    var qfi = _.findIndex(calist,function(item){
                        return item.questionid == q._id;
                    });
                    if(qfi>=0){
                        firstQ.push(calist[qfi].text?calist[qfi].text:"");
                    }
                    else{
                        firstQ.push("");
                    }
                }


            }

            qout.push(firstQ);



        }
        var that = this;
        $.ajax({
            url: Constant.BASE_URL+"admin/exportxlsx",
            data: JSON.stringify({
                name:that.state.survey.name,
                data:qout
            }),
            contentType: 'application/json; charset=utf-8',
            type: 'POST',
            success: function (data) {
                $("#ajaxloading").hide();
                var fu = JSON.parse(data).body;
                that.setState({
                    ifexport:true,
                    exporturl:Constant.BASE_IMAGEURL+fu
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
    },
    viewdetail(index){
        var that = this;
        var infunc = function(){
            that.setState({
                detailid:index
            });
            $("#answerdetailmodal").modal("show");
        };
        return infunc;
    },
    deleteAnswer(index){
        var that  = this;
        var infunc = function(){
            var aid = that.state.answerlist[index]._id;
            $("#ajaxloading").show();
            $.ajax({
                url: Constant.BASE_URL+"admin/survey/answer/delete",
                data: $.param({
                    answerid:aid
                }),
                type: 'DELETE',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    var msg = JSON.parse(data);
                    $("#ajaxloading").hide();
                    that.fetchAndRefresh();

                },
                error:function(){
                    $("#ajaxloading").hide();
                },
                statusCode:{
                    404:function(){

                    }
                }
            });
        };
        return infunc;
    },
    fetchAndRefresh(){
        $("#ajaxloading").show();
        var that = this;
        async.series([function(cb){
            $.ajax({
                url: Constant.BASE_URL+"anonymous/survey/detail/"+that.props.params.id,
                type: 'GET',
                success: function (data) {
                    var msg = JSON.parse(data).body;
                    for(var qindex in msg.questionlist){
                        var cq = msg.questionlist[qindex];
                        if(cq.selectlist){
                            if(_.isString(cq.selectlist)){
                                cq.selectlist = Emailcheck.safeJsonParse(cq.selectlist,[]);
                            }
                        }

                    }
                    that.setState({
                        survey:msg,
                    });
                    cb();
                },
                error:function(){
                    that.context.router.push("/login");
                    cb();
                }
            });
        },function(cb){
            $.ajax({
                url: Constant.BASE_URL + "admin/survey/answer/list/" + that.props.params.id,

                type: 'GET',
                success: function (data) {
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data).body;
                    for(var i in msg){
                        var answerlist = msg[i].answerlist;
                        if(_.isString(answerlist)){
                            msg[i].answerlist = Emailcheck.safeJsonParse(answerlist,[]);
                        }
                    }
                    that.setState({
                        originalanswerlist:msg,
                    });
                    that.filterAnswer();
                    cb();
                },
                error: function () {
                    that.context.router.push("/login");
                    cb();
                }
            });
        }],function(err){
            $("#ajaxloading").hide();
        });
    },
    componentDidMount (){
        this.fetchAndRefresh();

    },
    filterAnswer(){
        var outputList = [];
        for(var i in this.state.originalanswerlist){
            var currentAnswer = this.state.originalanswerlist[i];
            var ifFilter = true;
            for(var j in this.state.filterList){
                var currentFilter = this.state.filterList[j];
                var cfValue = currentFilter.qvalue;
                if(cfValue!="none"){
                    var currentQ = this.state.survey.questionlist[cfValue];
                    var fansweindex = _.findIndex(currentAnswer.answerlist,function(item){
                        return item.questionid == currentQ._id;
                    });
                    if(fansweindex>=0){
                        var qanswer = currentAnswer.answerlist[fansweindex];
                        if(currentFilter.checklist.length>0){
                            if(currentQ.type == Constant.QTYPE_MULTISELECT ||
                                currentQ.type == Constant.QTYPE_SINGLESELECT ||
                                currentQ.type == Constant.QTYPE_MULTISELECT_RECORD_TEXT ||
                                currentQ.type == Constant.QTYPE_MULTISELECT_TEXT ||
                                currentQ.type == Constant.QTYPE_SINGLESELECT_RECORD_TEXT ||
                                currentQ.type == Constant.QTYPE_SINGLESELECT_TEXT){
                                var notFound = true;
                                for(var fai in qanswer.selectindexlist){
                                    var aiv = qanswer.selectindexlist[fai];
                                    console.log(aiv);
                                    console.log(currentFilter.checklist);
                                    var findindex = _.indexOf(currentFilter.checklist,aiv);
                                    if(findindex>=0){
                                        notFound = false;
                                        break;
                                    }
                                }
                                if(notFound){
                                    ifFilter = false;
                                    break;
                                }
                            }
                            else if(currentQ.type == Constant.QTYPE_SCORE){
                                if(qanswer.scorelist.length>0){
                                    var findindex = _.indexOf(currentFilter.checklist,qanswer.scorelist[0].score);
                                    if(findindex<0){
                                        ifFilter = false;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

            }
            if(ifFilter){
                outputList.push(currentAnswer);
            }
        }
        this.setState({
            answerlist:outputList
        })
    },
    addFilter(){
        var filterList = this.state.filterList;
        filterList.push({
            qvalue:"none",
            checklist:[]
        });

        this.setState({
            filterList:filterList
        });

    },
    filterqchange(index){
        var that = this;
        function handleStype(event){
            var slist = that.state.filterList;
            slist[index].qvalue = event.target.value;
            that.setState({
                filterList:slist
            });
            that.filterAnswer();
        }
        return handleStype;
    },
    filtercheckchange(index,value){
        var that = this;
        value = parseInt(value);
        function handleStype(event){
            var ifchecked = event.target.checked;
            var clist = that.state.filterList[index].checklist;
            if(ifchecked){
                var cindex = _.indexOf(clist,value);
                if(cindex<0){
                    clist.push(value);
                }
            }
            else{
                var cindex = _.indexOf(clist,value);
                if(cindex>=0){
                    clist.splice(cindex,1)
                }
            }
            that.setState({
                filterList:that.state.filterList
            });
            that.filterAnswer();
        }
        return handleStype;
    },
    render(){
        var totalNum = this.state.answerlist.length;
        var clientNum = _.reduce(this.state.answerlist,function(memo,item){
            if(item.investigatorid){
                return memo+1;
            }
            else{
                return memo;
            }
        },0);
        var qlist = [];
        var elink = ""
        if(this.state.ifexport){
            elink = <a
                className="btn btn-info"
                href={this.state.exporturl}>
                <span className="glyphicon glyphicon-floppy-save" aria-hidden="true"></span>Click to download.
            </a>;
        }
        qlist.push(
            <div className="row" style={{margin:"15px"}}>
                <div className="col-md-4">
                    <a
                        type="button"

                        onClick={this.exportxlsx}
                        className="btn btn-primary">
                        <span className="glyphicon glyphicon-new-window" aria-hidden="true"></span> Export to file
                    </a>
                </div>
                <div className="col-md-8">
                    {elink}
                </div>
            </div>

        );
        var filterRenderList = [

        ];
        if(this.state.survey){
            var filterOptionList = [
                <option className="form-control"
                        value={"none"}
                >
                    None
                </option>
            ];
            for(var qindex in this.state.survey.questionlist){
                var cq = this.state.survey.questionlist[qindex];
                filterOptionList.push(
                    <option className="form-control"
                            value={qindex}
                    >
                        {parseInt(qindex)+1}.
                        {cq.title}

                    </option>
                )
            }

            for(var findex in this.state.filterList){
                var filterCheckList = [];
                var qv = this.state.filterList[findex].qvalue;
                if(qv!="none"){
                    qv = parseInt(qv);
                    var sq = this.state.survey.questionlist[qv];
                    if(sq.type == Constant.QTYPE_SCORE){
                        var scoreStart = 0;
                        var scoreEnd = 10;
                        var scoreStep = 1;
                        if(sq.scorelist && _.isArray(sq.scorelist)){
                            scoreStart = parseInt(sq.scorelist[0].start);
                            scoreEnd = parseInt(sq.scorelist[0].end);
                            scoreStep = parseInt(sq.scorelist[0].step);
                        }
                        for(var scorevalue=scoreStart;scorevalue<=scoreEnd;scorevalue+=scoreStep){
                            filterCheckList.push(
                                <div className="checkbox">
                                    <label>
                                        <input
                                            checked={_.indexOf(this.state.filterList[findex].checklist,scorevalue)>=0}
                                            onChange={this.filtercheckchange(findex,scorevalue)}
                                            type="checkbox"/>
                                        {scorevalue}
                                    </label>
                                </div>
                            )
                        }
                    }
                    else if(sq.type == Constant.QTYPE_SINGLESELECT ||
                            sq.type == Constant.QTYPE_SINGLESELECT_RECORD_TEXT ||
                            sq.type == Constant.QTYPE_SINGLESELECT_TEXT ||
                            sq.type == Constant.QTYPE_MULTISELECT ||
                            sq.type == Constant.QTYPE_MULTISELECT_RECORD_TEXT ||
                            sq.type == Constant.QTYPE_MULTISELECT_TEXT){
                        var tselectlist = sq.selectlist;
                        for(var fsindex in tselectlist){
                            var curs = tselectlist[fsindex];
                            filterCheckList.push(
                                <div className="checkbox">
                                    <label>
                                        <input
                                            checked={_.indexOf(this.state.filterList[findex].checklist,parseInt(fsindex))>=0}
                                            onChange={this.filtercheckchange(findex,fsindex)}
                                            type="checkbox"/>
                                        {curs.title}
                                    </label>
                                </div>
                            )
                        }
                    }
                }
                filterRenderList.push(
                    <div>
                        <div className="row">
                            <div className="col-md-6">
                                <select className="form-control"
                                        onChange={this.filterqchange(findex)}
                                        value={this.state.filterList[findex].qvalue}
                                >
                                    {filterOptionList}
                                </select>
                            </div>
                            <div className="col-md-6">
                                {filterCheckList}
                            </div>
                        </div>
                        <hr/>
                    </div>

                )
            }
            for(var qindex in this.state.survey.questionlist){
                var q = this.state.survey.questionlist[qindex];
                var slist = [];
                if(q.type == Constant.QTYPE_MULTISELECT ||
                    q.type == Constant.QTYPE_SINGLESELECT ||
                    q.type == Constant.QTYPE_MULTISELECT_RECORD_TEXT ||
                    q.type == Constant.QTYPE_MULTISELECT_TEXT ||
                    q.type == Constant.QTYPE_SINGLESELECT_RECORD_TEXT ||
                    q.type == Constant.QTYPE_SINGLESELECT_TEXT){
                    var labelList = [];
                    var valueList = [];
                    var valuePercentList = [];
                    for(var j in q.selectlist){
                        labelList.push("S"+(parseInt(j)+1));
                        var s = q.selectlist[j];
                        var snum = _.reduce(this.state.answerlist,function(memo,item){
                            var alist = item.answerlist;
                            var qfi = _.findIndex(alist,function(item){
                                return item.questionid == q._id;
                            });
                            if(qfi>=0){
                                var sfi = _.indexOf(alist[qfi].selectindexlist,parseInt(j));
                                if(sfi>=0){
                                    return memo+1;
                                }
                                else{
                                    sfi = _.indexOf(alist[qfi].selectindexlist,j+"");
                                    if(sfi>=0){
                                        return memo+1;
                                    }
                                    else{
                                        return memo;
                                    }

                                }
                            }
                            else{
                                return memo;
                            }
                        },0);
                        valueList.push(snum);
                        valuePercentList.push(Math.floor(parseInt(snum)/parseInt(totalNum)*100)+"%");

                        slist.push(
                            <div className="row">
                                <div className="col-md-4" >
                                    <div  className="alert alert-success">
                                        <span className="grey">{parseInt(j)+1}</span>
                                        <span>&nbsp;&nbsp;{s.title?s.title:""}</span>
                                    </div>

                                </div>
                                <div className="col-md-8">
                                    <div className="alert alert-info">&nbsp;&nbsp;
                                        {snum} selected,{Math.floor(parseInt(snum)/parseInt(totalNum)*100)}%
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    slist.push(
                        <RgraphControl gid={"g"+q._id} labels={labelList} values={valueList} pervalues={valuePercentList}>
                        </RgraphControl>
                    )
                }
                else if(q.type == Constant.QTYPE_SCORE){
                    var labelList = [];
                    var valueList = [];
                    var valuePercentList = [];

                    var scoreStart = 0;
                    var scoreEnd = 10;
                    var scoreStep = 1;

                    if(q.scorelist && _.isArray(q.scorelist)){
                        scoreStart = parseInt(q.scorelist[0].start);
                        scoreEnd = parseInt(q.scorelist[0].end);
                        scoreStep = parseInt(q.scorelist[0].step);
                    }

                    for(var i=scoreStart;i<=scoreEnd;i+=scoreStep){
                        labelList.push(i);
                        var snum = _.reduce(this.state.answerlist,function(memo,item){
                            var alist = item.answerlist;
                            var qfi = _.findIndex(alist,function(item){
                                return item.questionid == q._id;
                            });
                            if(qfi>=0){
                                if(alist[qfi].scorelist){
                                    var sfi = _.findIndex(alist[qfi].scorelist,function(item){
                                        return item.index == 0;
                                    })
                                    if(sfi>=0 && alist[qfi].scorelist[sfi].score==i){
                                        return memo+1;
                                    }
                                    else{
                                        return memo;
                                    }
                                }
                                else{
                                    return memo;
                                }

                            }
                            else{
                                return memo;
                            }
                        },0);
                        valueList.push(snum);
                        valuePercentList.push(Math.floor(parseInt(snum)/parseInt(totalNum)*100)+"%");
                        slist.push(
                            <div className="row">
                                <div className="col-md-4" >
                                    <div  className="alert alert-success">
                                        <span className="red">{parseInt(i)}</span>
                                    </div>

                                </div>
                                <div className="col-md-8">
                                    <div className="alert alert-info">&nbsp;&nbsp;
                                        {snum} selected,{parseInt(snum)/parseInt(totalNum)*100}%
                                    </div>
                                </div>


                            </div>
                        )
                    }
                    slist.push(
                        <RgraphControl gid={"g"+q._id} labels={labelList} values={valueList} pervalues={valuePercentList}>
                        </RgraphControl>
                    )

                }

                var qbody = <div className="panel panel-default">
                    <div className="panel-heading">
                        <span className="green">{parseInt(qindex)+1}</span>
                        <span>&nbsp;&nbsp;{q.title}</span>
                        <span>&nbsp;&nbsp;Type: {Constant.QTYPE_NAME_MAP[q.type]}</span>
                    </div>
                    <div className="panel-body">
                        {slist}
                    </div>

                </div>;
                qlist.push(qbody);

            }
        }
        var mlist = [];
        for(var i in this.state.answerlist){
            var a = this.state.answerlist[i];
            mlist.push(
                <tr>
                    <td>{(parseInt(i)+1)}</td>
                    <td>{a.name?a.name:""}</td>
                    <td>{new Date(a.ctime).toLocaleString()}</td>
                    <td>{a.investigatorid?"Android Client":"Web"}</td>
                    <td className="list_btn">
                        <div className="btn-group" role="group" >
                            <a
                                type="button"
                                onClick={this.viewdetail(i)}
                                className="btn btn-info">View</a>


                            <a
                                type="button"
                                onClick={this.deleteAnswer(i)}
                                className="btn btn-danger">Delete</a>
                        </div>
                    </td>
                </tr>
            )
        }
        var detailModal = [];
        if(this.state.detailid && this.state.answerlist[this.state.detailid]){
            var ca = this.state.answerlist[this.state.detailid];
            detailModal.push(
                <div className="row">
                    <div className="col-md-4">
                        <div  className="alert alert-success">
                            Answer Name:
                        </div>
                    </div>
                    <div className="col-md-8">
                        <div  className="alert alert-info">
                            {ca.name}
                        </div>

                    </div>
                </div>
            );
            detailModal.push(
                <div className="row">
                    <div className="col-md-4">
                        <div  className="alert alert-success">
                            Longitude:
                        </div>
                    </div>
                    <div className="col-md-8">
                        <div  className="alert alert-info">
                            {ca.longitude?ca.longitude:""}
                        </div>

                    </div>
                </div>
            );
            detailModal.push(
                <div className="row">
                    <div className="col-md-4">
                        <div  className="alert alert-success">
                            Latitude:
                        </div>
                    </div>
                    <div className="col-md-8">
                        <div  className="alert alert-info">
                            {ca.latitude?ca.latitude:""}
                        </div>

                    </div>
                </div>
            );
            detailModal.push(
                <div className="row">
                    <div className="col-md-4">
                        <div  className="alert alert-success">
                            Begintime:
                        </div>
                    </div>
                    <div className="col-md-8">
                        <div  className="alert alert-info">
                            {ca.begintime?ca.begintime:""}
                        </div>

                    </div>
                </div>
            );
            detailModal.push(
                <div className="row">
                    <div className="col-md-4">
                        <div  className="alert alert-success">
                            Endtime:
                        </div>
                    </div>
                    <div className="col-md-8">
                        <div  className="alert alert-info">
                            {ca.endtime?ca.endtime:""}
                        </div>

                    </div>
                </div>
            );
            for(var i in ca.answerlist){
                var q = ca.answerlist[i];
                var qid = q.questionid;
                var qsindex = _.findIndex(this.state.survey.questionlist,function(item){
                    return item._id == qid
                });
                var currentQ = null;
                if(qsindex>=0){
                    currentQ = this.state.survey.questionlist[qsindex];
                }
                var sdisList = [];
                if(currentQ){
                    if(currentQ.type == Constant.QTYPE_MULTISELECT ||
                        currentQ.type == Constant.QTYPE_SINGLESELECT ||
                        currentQ.type == Constant.QTYPE_MULTISELECT_RECORD_TEXT ||
                        currentQ.type == Constant.QTYPE_MULTISELECT_TEXT ||
                        currentQ.type == Constant.QTYPE_SINGLESELECT_RECORD_TEXT ||
                        currentQ.type == Constant.QTYPE_SINGLESELECT_TEXT){
                        for(var j in q.selectindexlist){
                            var sindex = q.selectindexlist[j];

                            var stitle = "";
                            if(currentQ.selectlist && currentQ.selectlist[sindex] && currentQ.selectlist[sindex].title){
                                stitle = currentQ.selectlist[sindex].title;
                            }
                            sdisList.push(
                                <div>
                                    <p>
                                        <span className="grey">{parseInt(sindex)+1}</span>
                                        {stitle}
                                    </p>
                                </div>

                            )
                            if(q.selectextra){
                                var seindex = _.findIndex(q.selectextra,function(item){
                                    return item.index == sindex;
                                })
                                if(seindex>=0){
                                    if(q.selectextra[seindex].text){
                                        sdisList.push(
                                            <div className="alert alert-success">
                                                {q.selectextra[seindex].text}
                                            </div>
                                        )
                                    }
                                    if(q.selectextra[seindex].audio){
                                        sdisList.push(
                                            <audio src={Constant.BASE_URL+"getmp3/"+q.selectextra[seindex].audio} controls />
                                        )
                                    }

                                }
                            }
                        }
                    }
                    else if(currentQ.type == Constant.QTYPE_SCORE){
                        //var sfi = _.findIndex(q.scorelist,function(item){
                        //    return item.index == 0;
                        //});
                        //if(sfi>=0){
                        //    sdisList.push(
                        //        <div>
                        //            <p>
                        //                <span className="red">{parseInt(q.scorelist[sfi].score)}</span>
                        //            </p>
                        //        </div>
                        //    )
                        //}
                        for(var qi in q.scorelist){
                            sdisList.push(
                                <div>
                                    <p>
                                        <span className="red">{parseInt(q.scorelist[qi].score)}</span>
                                    </p>
                                </div>
                            )
                        }

                    }
                    else if(currentQ.type == Constant.QTYPE_SEQUENCE){
                        var slist = q.sortlist;
                        var sorted = _.sortBy(slist,function(item){
                            return item.sort
                        })
                        for(var qi in sorted){
                            sdisList.push(
                                <div>
                                    <p>
                                        <span className="blue">{parseInt(sorted[qi].index)+1}</span>
                                    </p>
                                </div>
                            )
                        }
                    }
                    var qtStyle = {
                        display:"none"
                    };
                    if(q.text || q.image){
                        qtStyle = {};
                    }
                    var imgContent = "";
                    if(q.image){
                        imgContent = <img
                            src={Constant.BASE_IMAGEURL+q.image}
                            className="img-rounded"
                            style={{maxHeight:"100px"}}
                            alt="Responsive image"/>
                    }

                    var audioContent = ""
                    if(q.audio){
                        audioContent = <audio src={Constant.BASE_URL+"getmp3/"+q.audio} controls />;

                    }
                    sdisList.push(
                        <div style={qtStyle}  className="alert alert-success">
                            {q.text?q.text:""}
                            {imgContent}
                            <br/>
                            {audioContent}
                        </div>
                    )
                    detailModal.push(
                        <div className="panel panel-default">
                            <div className="panel-heading">
                                <span className="green">{parseInt(qsindex)+1}</span>
                                <span>&nbsp;&nbsp;{currentQ.title?currentQ.title:""}</span>
                                <span>&nbsp;&nbsp;Type: {Constant.QTYPE_NAME_MAP[currentQ.type]}</span>
                            </div>
                            <div className="panel-body">
                                {sdisList}
                            </div>
                        </div>
                    )

                }

            }


        }



        return (
            <div className="container">
                <h2>
                    {this.state.survey?this.state.survey.name:""}
                </h2>
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <h3 className="panel-title">Filter</h3>
                    </div>
                    <div className="panel-body">
                        {filterRenderList}
                    </div>
                    <div className="panel-footer">
                        <a className="btn btn-primary"
                           onClick={this.addFilter}
                           role="button" data-toggle="collapse">
                            Add Filter
                        </a>
                    </div>
                </div>
                <div className="well" >
                    <h3>
                        Total {totalNum} answers. {clientNum} answers from Android Client and {totalNum-clientNum} answers from web anonymous users.
                    </h3>
                </div>
                <a className="btn btn-primary" role="button" data-toggle="collapse" href="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
                    Toggle Survey Answers General Info
                </a>
                <div className="collapse"  id="collapseExample">
                    {qlist}
                </div>
                <div>
                    <a className="btn btn-primary" role="button" data-toggle="collapse" href="#answerdetail" aria-expanded="false" aria-controls="collapseExample">
                        Toggle Survey Answers Detail Info
                    </a>
                </div>

                <div className="panel panel-default collapse" id="answerdetail">
                    <div className="panel-heading">
                        <h3>
                            Answers List
                        </h3>
                    </div>
                    <div className="panel-body">
                        <table  className="table" >
                            <thead>
                            <tr>
                                <th><span className="">##</span></th>
                                <th><span className="">Answer Name</span></th>
                                <th><span className="">Create Time</span></th>
                                <th><span className="">Source</span></th>
                                <th><span className="">Operations</span></th>
                            </tr>
                            </thead>
                            <tbody>
                            {mlist}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="modal fade" id="answerdetailmodal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" id="myModalLabel">Answer Detail</h4>
                            </div>
                            <div className="modal-body">
                                {detailModal}
                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Close</a>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        )
    }
});
