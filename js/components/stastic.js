import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import {Question} from "./question"
import _ from "underscore"
import crypto from "crypto"
import async from "async"

export var Stastic = React.createClass({
    getInitialState(){
        return{
            survey:null,
            answerlist:[]
        }
    },
    contextTypes: {
        router: React.PropTypes.object.isRequired
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
        if(this.state.survey){
            for(var i in this.state.survey.questionlist){
                var q = this.state.survey.questionlist[i];
                var slist = [];
                for(var j in q.selectlist){
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
                    slist.push(
                        <div className="row">
                            <div className="col-md-4" >
                                <div  className="alert alert-success">
                                    <span className="grey">{parseInt(j)+1}</span>
                                    <span>&nbsp;&nbsp;{s.title}</span>
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
                var qbody = <div className="panel panel-default">
                    <div className="panel-heading">
                        <span className="green">{parseInt(i)+1}</span>
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
                    Toggle Survey Answers General Data
                </a>
                <div className="collapse"  id="collapseExample">
                    {qlist}
                </div>

            </div>
        )
    }
});