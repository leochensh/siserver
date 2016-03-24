import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import {Question} from "./question"
import _ from "underscore"
import crypto from "crypto"

export var Newsurvey = React.createClass({
    getInitialState(){
        return{
            surveyname:"new survey",
            ifSaved:false,
            surveyid:null,
            ifSurveyNameEmpty:false,
            qlist:[]
        }
    },
    handleChange(name,event){
        var newstate = {};
        newstate[name] = event.target.value;
        newstate.ifSurveyNameEmpty = false;
        this.setState(newstate);
    },
    cleanall(){
        $("#cleanall").modal("show");
    },
    confirmclean(){
        this.setState({
            surveyname:"new survey",
            ifSaved:false,
            surveyid:null,
            ifSurveyNameEmpty:false,
            qlist:[]
        });
        $("#cleanall").modal("hide");
    },
    publishsurvey(){
        if(this.state.surveyid){
            $("#publishsurvey").modal("show");
        }

    },
    confirmpublish(){

        var that = this;
        if(this.state.surveyid){
            $("#ajaxloading").show();
            $.ajax({
                url: Constant.BASE_URL+"editor/survey/rfp",
                data: $.param({
                    surveyid:that.state.surveyid
                }),
                type: 'PUT',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {

                    $.ajax({
                        url: Constant.BASE_URL+"admin/survey/audit",
                        data: $.param({
                            surveyid:that.state.surveyid,
                            status:"surveynormal"
                        }),
                        type: 'PUT',
                        contentType: 'application/x-www-form-urlencoded',
                        success: function (data) {
                            $.ajax({
                                url: Constant.BASE_URL+"admin/survey/assign",
                                data: $.param({
                                    surveyid:that.state.surveyid,
                                    staffid:that.props.loginInfo.id
                                }),
                                type: 'PUT',
                                contentType: 'application/x-www-form-urlencoded',
                                success: function (data) {
                                    $("#ajaxloading").hide();
                                    $("#publishsurvey").modal("hide");
                                },
                                error:function(jxr,scode){
                                    $("#ajaxloading").hide();
                                },
                                statusCode:{
                                    406:function(){
                                    },
                                    500:function(){
                                        that.context.router.push("/login");
                                    },
                                    409:function(){
                                    }
                                }
                            });
                        },
                        error:function(jxr,scode){
                            $("#ajaxloading").hide();
                        },
                        statusCode:{
                            406:function(){
                            },
                            500:function(){
                                that.context.router.push("/login");
                            },
                            409:function(){
                            }
                        }
                    });
                },
                error:function(jxr,scode){
                    $("#ajaxloading").hide();
                },
                statusCode:{
                    406:function(){
                    },
                    500:function(){
                        that.context.router.push("/login");
                    },
                    409:function(){
                    }
                }
            });
        }

    },
    savesurvey(){

        if(!this.state.surveyname){
            this.setState({ifSurveyNameEmpty:true});
        }
        else{

            $("#ajaxloading").show();
            var that = this;
            if(this.state.ifSaved){
                $.ajax({
                    url: Constant.BASE_URL+"editor/survey/edit",
                    data: $.param({
                        name:that.state.surveyname,
                        id:that.state.surveyid
                    }),
                    type: 'PUT',
                    contentType: 'application/x-www-form-urlencoded',
                    success: function (data) {
                        $("#ajaxloading").hide();
                        var msg = JSON.parse(data);

                    },
                    error:function(jxr,scode){
                        $("#ajaxloading").hide();
                    },
                    statusCode:{
                        406:function(){

                        },
                        500:function(){
                            that.context.router.push("/login");
                        },
                        409:function(){

                        }
                    }
                });
            }
            else{
                $.ajax({
                    url: Constant.BASE_URL+"editor/survey/create",
                    data: $.param({
                        name:that.state.surveyname,
                        type:"survey"
                    }),
                    type: 'POST',
                    contentType: 'application/x-www-form-urlencoded',
                    success: function (data) {
                        $("#ajaxloading").hide();
                        var msg = JSON.parse(data);
                        that.setState({
                            ifSaved:true,
                            surveyid:msg.body
                        })
                        $("#notsavealert").hide();
                    },
                    error:function(jxr,scode){
                        $("#ajaxloading").hide();
                    },
                    statusCode:{
                        406:function(){

                        },
                        500:function(){
                            that.context.router.push("/login");
                        },
                        409:function(){

                        }
                    }
                });
            }

        }
    },
    checkIfSurveySaved(){
        if(!this.state.ifSaved){
            $("#notsavealert").show();
            return false;
        }
        else{
            return true;
        }
    },
    addNewQuestion(qtype){
        if(this.checkIfSurveySaved()){
            var newQ = {
                surveyid:this.state.surveyid,
                qtype:qtype
            };
            var cqlist = this.state.qlist;
            cqlist.push(newQ);

            this.setState({qlist:cqlist});
            setTimeout(function(){
                var objDiv = document.getElementById("scrollright");
                objDiv.scrollTop = objDiv.scrollHeight;
            },100);
        }
    },
    singleselect(){
        this.addNewQuestion(Constant.QTYPE_SINGLESELECT);
    },
    multiselect(){
        this.addNewQuestion(Constant.QTYPE_MULTISELECT);
    },
    description(){
        this.addNewQuestion(Constant.QTYPE_DESCRIPTION);
    },
    sorttype(){
        this.addNewQuestion(Constant.QTYPE_SEQUENCE);
    },
    scoretype(){
        this.addNewQuestion(Constant.QTYPE_SCORE);
    },
    questionchange(index){
        var that =this;
        var qhanle = function(qdata){
            var cq = that.state.qlist[index];
            for(var i in _.keys(qdata)){
                var key = _.keys(qdata)[i];
                cq[key] = qdata[key];
            }
        }
        return qhanle;
    },
    questiondeleteinform(index){
        var that = this;
        var dhandler = function(){
            var qlist = that.state.qlist;
            qlist.splice(index,1);
            that.setState({
                qlist:qlist
            })
        };
        return dhandler;
    },
    render(){
        var emptystyle = {display:"none"};
        if(this.state.ifSurveyNameEmpty){
            emptystyle = {}
        }
        var questionList = [];
        for(var i in this.state.qlist){
            var q = this.state.qlist[i];
            questionList.push(<Question
                index = {i}
                qdata={q}
                dhandle={this.questiondeleteinform(i)}
                qhandle={this.questionchange(i)}></Question>);
        }
        return(
            <div>
                <div className="row" >
                    <div className="col-md-3 left_list_media" style={{borderRight:"1px solid" }}>
                        <div className="page-header">
                            <h3>Question Types </h3>
                        </div>
                        <div id="notsavealert" className="alert alert-danger alert-dismissible fade in" role="alert" style={{display:"none"}}>
                            <button className="close" aria-label="Close" data-dismiss="alert" type="button"></button>
                            <h4>You should save survey name first.</h4>
                        </div>

                        <div className="list-group" style={{marginRight:"0!important",paddingRight:"0!important"}}>
                            <a className="list-group-item" onClick={this.singleselect}>
                                <h3>
                                    <span className="glyphicon glyphicon-minus" aria-hidden="true"></span>
                                    &nbsp;&nbsp;Single Selection
                                </h3>

                            </a>
                            <a className="list-group-item" onClick={this.multiselect}>
                                <h3>
                                    <span className="glyphicon glyphicon-th-list" aria-hidden="true"></span>
                                    &nbsp;&nbsp;Multiple Selection
                                </h3>

                            </a>
                            <a className="list-group-item" onClick={this.description}>
                                <h3>
                                    <span className="glyphicon glyphicon-pencil" aria-hidden="true"></span>
                                    &nbsp;&nbsp;Subjective Item
                                </h3>

                            </a>
                            <a className="list-group-item" onClick={this.sorttype}>
                                <h3>
                                    <span className="glyphicon glyphicon-signal" aria-hidden="true"></span>
                                    &nbsp;&nbsp;Sort
                                </h3>

                            </a>
                            <a className="list-group-item" onClick={this.scoretype}>
                                <h3>
                                    <span className="glyphicon glyphicon-sort-by-order" aria-hidden="true"></span>
                                    &nbsp;&nbsp;Score
                                </h3>

                            </a>

                        </div>
                    </div>

                    <div id="scrollright" className="col-md-9 right_list_media">
                        <div className="page-header">
                            <h3> {this.state.surveyname}&nbsp;&nbsp;&nbsp;&nbsp;
                                <button type="button"
                                        onClick={this.publishsurvey}
                                        className="btn btn-primary">
                                    <span className="glyphicon glyphicon-check" aria-hidden="true"></span>
                                    <span>&nbsp;&nbsp;Publish it</span>
                                </button>
                                &nbsp;&nbsp;
                                <button type="button"
                                        onClick={this.cleanall}
                                        className="btn btn-warning">
                                    <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                    <span>&nbsp;&nbsp;Clean all data</span>
                                </button>
                            </h3>
                        </div>
                        <form className="form-horizontal">
                            <div className="form-group">
                                <label htmlFor="inputEmail3" className="col-sm-2 control-label">Survey Name</label>
                                <div className="col-sm-10">
                                    <input type="text"
                                           className="form-control"
                                           id="inputEmail3"
                                           value={this.state.surveyname}
                                           onChange={this.handleChange.bind(this,"surveyname")}
                                           placeholder="Survey Name"/>
                                </div>

                            </div>

                            <div className="form-group">
                                <div className="col-sm-offset-2 col-sm-10">
                                    <button className="btn btn-primary"
                                            onClick={this.savesurvey}>
                                        Save
                                    </button>
                                </div>
                            </div>
                        </form>
                        <div className="alert alert-danger col-md-12" role="alert" style={emptystyle}>
                            Survey name can not be empty.
                        </div>
                        <hr/>
                        {questionList}

                    </div>
                </div>

                <div className="modal fade" id="publishsurvey" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" >Publish Survey</h4>
                            </div>
                            <div className="modal-body">
                                <h3>
                                    Make sure you already save all data before publish.
                                </h3>

                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={this.confirmpublish}>Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="cleanall" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" >Clean All Data</h4>
                            </div>
                            <div className="modal-body">
                                <h3>
                                    Make sure you already save all data before clean it.
                                </h3>

                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={this.confirmclean}>Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})