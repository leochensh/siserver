import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import {Question} from "./question"
import {RgraphControl} from "./rgraphcontrol"
import _ from "underscore"
import crypto from "crypto"
import async from "async"

export var Stastic = React.createClass({
    getInitialState(){
        return{
            survey:null,
            answerlist:[],
            detailid:null,
            ifexport:false,
            exporturl:null
        }
    },
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    exportxlsx(){
        $("#ajaxloading").show();
        var qout = [];
        var firstQ = [ "No.","Interviewer","Visit Date",
            "Country","Customer","Male","Female"];

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
            if(currentA.begintime){
                var nd=new Date(currentA.begintime);
                var year = nd.getFullYear();
                var month = nd.getMonth()+1;
                var date = nd.getDate();
                dstring = year+"/"+month+"/"+date;
            }
            firstQ = [(parseInt(aindex)+1),currentA.investigatorname?currentA.investigatorname:"",
                dstring,"","","",""];


            for(var qindex in this.state.survey.questionlist){
                var q = this.state.survey.questionlist[qindex];
                var base_str = "Q"+(parseInt(qindex)+1);
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

                    for(var i=scoreStart;i<=scoreEnd;i+=scoreStep){
                        tempList.push("")
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
    componentDidMount (){
        $("#ajaxloading").show();
        var that = this;
        async.series([function(cb){
            $.ajax({
                url: Constant.BASE_URL+"anonymous/survey/detail/"+that.props.params.id,
                type: 'GET',
                success: function (data) {
                    var msg = JSON.parse(data).body;
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
                            msg[i].answerlist = JSON.parse(answerlist);
                        }
                    }
                    that.setState({
                        answerlist:msg,
                    });
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
        if(this.state.survey){
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
                    for(var j in q.selectlist){
                        labelList.push("S"+(parseInt(j)+1));
                        var s = q.selectlist[j];
                        var snum = _.reduce(this.state.answerlist,function(memo,item){
                            var alist = item.answerlist;
                            var qfi = _.findIndex(alist,function(item){
                                return item.questionid == q._id;
                            });
                            if(qfi>=0){
                                var sfi = _.indexOf(alist[qfi].selectindexlist,j);
                                if(sfi>=0){
                                    return memo+1;
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
                                        {snum} selected,{parseInt(snum)/parseInt(totalNum)*100}%
                                    </div>
                                </div>


                            </div>
                        )
                    }
                    slist.push(
                        <RgraphControl gid={"g"+q._id} labels={labelList} values={valueList}>
                        </RgraphControl>
                    )
                }
                else if(q.type == Constant.QTYPE_SCORE){
                    var labelList = [];
                    var valueList = [];

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
                        <RgraphControl gid={"g"+q._id} labels={labelList} values={valueList}>
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
                    <td>{i}</td>
                    <td>{a.name?a.name:""}</td>
                    <td>{new Date(a.ctime).toLocaleString()}</td>
                    <td>{a.investigatorid?"Android Client":"Web"}</td>
                    <td className="list_btn">
                        <div className="btn-group" role="group" >
                            <a
                                type="button"
                                onClick={this.viewdetail(i)}
                                className="btn btn-danger">View</a>
                        </div>
                    </td>

                </tr>
            )
        }
        var detailModal = [];
        if(this.state.detailid){
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
            )
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
            )
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
            )
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
            )
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
            )
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
                                if(seindex>=0 && q.selectextra[seindex].text){
                                    sdisList.push(
                                        <div className="alert alert-success">
                                            {q.selectextra[seindex].text}
                                        </div>
                                    )
                                }
                            }
                        }
                    }
                    else if(currentQ.type == Constant.QTYPE_SCORE){
                        var sfi = _.findIndex(q.scorelist,function(item){
                            return item.index == 0;
                        });
                        if(sfi>=0){
                            sdisList.push(
                                <div>
                                    <p>
                                        <span className="red">{parseInt(q.scorelist[sfi].score)}</span>
                                    </p>
                                </div>
                            )
                        }
                    }

                }
                var qtStyle = {
                    display:"none"
                };
                if(q.text){
                    qtStyle = {};
                }
                sdisList.push(
                    <div style={qtStyle}  className="alert alert-success">
                        {q.text?q.text:""}
                    </div>
                )
                detailModal.push(
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <span className="green">{parseInt(i)+1}</span>
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
        return (
            <div className="container">

                <h2>
                    {this.state.survey?this.state.survey.name:""}
                </h2>

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