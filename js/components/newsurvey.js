import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import {Question} from "./question"
import _ from "underscore"
import crypto from "crypto"
var Dropzone = require('react-dropzone');

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
        //var newstate = {};
        //newstate[name] = event.target.value;
        //newstate.ifSurveyNameEmpty = false;
        //this.setState(newstate);
        SisDispatcher.dispatch({
            actionType: Constant.SURVEYVALUECHANGE,
            name:name,
            value:event.target.value
        });
    },
    cleanall(){
        $("#cleanall").modal("show");
    },
    confirmclean(){
        //this.setState({
        //    surveyname:"new survey",
        //    ifSaved:false,
        //    surveyid:null,
        //    ifSurveyNameEmpty:false,
        //    qlist:[]
        //});
        SisDispatcher.dispatch({
            actionType: Constant.CLEANSURVEYDATA
        });
        $("#cleanall").modal("hide");
    },
    publishsurvey(){
        if(this.props.newsurvey.surveyid){
            $("#publishsurvey").modal("show");
        }

    },
    confirmpublish(){

        var that = this;
        if(this.props.newsurvey.surveyid){
            $("#ajaxloading").show();
            $.ajax({
                url: Constant.BASE_URL+"editor/survey/rfp",
                data: $.param({
                    surveyid:that.props.newsurvey.surveyid
                }),
                type: 'PUT',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {

                    $.ajax({
                        url: Constant.BASE_URL+"admin/survey/audit",
                        data: $.param({
                            surveyid:that.props.newsurvey.surveyid,
                            status:"surveynormal"
                        }),
                        type: 'PUT',
                        contentType: 'application/x-www-form-urlencoded',
                        success: function (data) {
                            $.ajax({
                                url: Constant.BASE_URL+"admin/survey/assign",
                                data: $.param({
                                    surveyid:that.props.newsurvey.surveyid,
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
    createNewSurvey(callback){
        var that =this;
        $.ajax({
            url: Constant.BASE_URL+"editor/survey/create",
            data: $.param({
                name:that.props.newsurvey.surveyname,
                type:"survey"
            }),
            type: 'POST',
            contentType: 'application/x-www-form-urlencoded',
            success: function (data) {
                $("#ajaxloading").hide();
                callback(data);

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
    },
    savesurvey(){

        if(!this.props.newsurvey.surveyname){
            SisDispatcher.dispatch({
                actionType: Constant.SURVEYVALUECHANGE,
                name:"ifSurveyNameEmpty",
                value:true
            });
        }
        else{

            $("#ajaxloading").show();
            var that = this;
            if(this.props.newsurvey.ifSaved){
                $.ajax({
                    url: Constant.BASE_URL+"editor/survey/edit",
                    data: $.param({
                        name:that.props.newsurvey.surveyname,
                        id:that.props.newsurvey.surveyid
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
                this.createNewSurvey(function(data){
                    var msg = JSON.parse(data);
                    SisDispatcher.dispatch({
                        actionType: Constant.SURVEYDATABATCHCHANGE,
                        value:{
                            ifSaved:true,
                            surveyid:msg.body
                        }
                    });
                });

            }

        }
    },
    checkIfSurveySaved(){
        if(!this.props.newsurvey.ifSaved){
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
                surveyid:this.props.newsurvey.surveyid,
                type:qtype,
                title:"newquestion",
                ifSaved:false,
                selectlist:[],
                id:null
            };
            var cqlist = this.props.newsurvey.qlist;
            cqlist.push(newQ);
            SisDispatcher.dispatch({
                actionType: Constant.SURVEYVALUECHANGE,
                name:"qlist",
                value:cqlist
            });
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
            var cq = that.props.newsurvey.qlist[index];
            for(var i in _.keys(qdata)){
                var key = _.keys(qdata)[i];
                cq[key] = qdata[key];
            }
            SisDispatcher.dispatch({
                actionType: Constant.SURVEYVALUECHANGE,
                name:"qlist",
                value:that.props.newsurvey.qlist
            });

        }
        return qhanle;
    },
    questiondeleteinform(index){
        var that = this;
        var dhandler = function(){
            var qlist = that.props.newsurvey.qlist;
            qlist.splice(index,1);
            SisDispatcher.dispatch({
                actionType: Constant.SURVEYVALUECHANGE,
                name:"qlist",
                value:qlist
            });

        };
        return dhandler;
    },
    confirmnewfromfile(){
        $("#createsurveyfromfile").modal("hide");
        var that = this;
        if(this.props.newsurvey.surveyname){
            this.createNewSurvey(function(data){
                var msg = JSON.parse(data);

                for(var i in that.state.tmsg){
                    var q = that.state.tmsg[i];
                    q.surveyid = that.props.newsurvey.surveyid;
                    q.ifSaved = false;
                    q.id = null;
                }
                //alert(JSON.stringify(that.state.tmsg))
                SisDispatcher.dispatch({

                    actionType: Constant.SURVEYDATABATCHCHANGE,
                    value:{
                        ifSaved:true,
                        surveyid:msg.body,
                        qlist:that.state.tmsg
                    }
                });
            })
        }
    },
    onDrop(files){
        if(true){
            var data = new FormData();
            data.append("name",files[0].name);
            data.append("file",files[0]);
            $("#ajaxloading").show();
            var that = this;
            $.ajax({
                url: Constant.BASE_URL+"staff/upload/video",
                data: data,
                cache: false,
                contentType: false,
                processData: false,
                type: 'POST',
                success: function(data){
                    //alert(data);
                    var file = JSON.parse(data).body
                    $.ajax({
                        url: Constant.BASE_URL+"parsexlsx",
                        data: $.param({
                            file:file
                        }),
                        type: 'POST',
                        contentType: 'application/x-www-form-urlencoded',
                        success: function (data) {
                            $("#ajaxloading").hide();
                            var msg = JSON.parse(data).body;
                            that.state.tmsg = msg;
                            $("#createsurveyfromfile").modal("show");

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
                }
            });
        }

    },
    render(){
        var emptystyle = {display:"none"};
        if(this.props.newsurvey.ifSurveyNameEmpty){
            emptystyle = {}
        }
        var questionList = [];
        for(var i in this.props.newsurvey.qlist){
            var q = this.props.newsurvey.qlist[i];
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
                        <Dropzone onDrop={this.onDrop} accept="text/csv">
                            <div>Drop xlsx file here or click.</div>
                        </Dropzone>
                    </div>

                    <div id="scrollright" className="col-md-9 right_list_media">
                        <div className="page-header">
                            <h3> {this.props.newsurvey.surveyname}&nbsp;&nbsp;&nbsp;&nbsp;
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
                                           value={this.props.newsurvey.surveyname}
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

                <div className="modal fade" id="createsurveyfromfile" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" >Clean All Data</h4>
                            </div>
                            <div className="modal-body">
                                <h3>
                                    This operation will create a new survey.Please input survey's name.
                                </h3>
                                    <div className="form-group form-group-lg">
                                        <label htmlFor="surveynewform" className="col-sm-2 control-label">Survey Name</label>
                                        <div className="col-sm-10">
                                            <input type="text"
                                                   className="form-control"
                                                   id="inputPasswordxxx"
                                                   placeholder=""
                                                   value={this.props.newsurvey.surveyname}
                                                   onChange={this.handleChange.bind(this,"surveyname")}
                                            />
                                        </div>
                                    </div>


                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={this.confirmnewfromfile}>Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})