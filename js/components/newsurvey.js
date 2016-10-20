import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import {Question} from "./question"
import _ from "underscore"
import crypto from "crypto"
var Dropzone = require('react-dropzone');
import {Emailcheck} from "./emailcheck";

export var Newsurvey = React.createClass({
    getInitialState(){
        return{
            surveyname:"",
            ifSaved:false,
            surveyid:null,
            ifSurveyNameEmpty:false,
            qlist:[],
            publishToPrivate:true,
            deletemetaindex:null
        }
    },
    ownChecked(event){
        if(event.target.checked){
            this.setState({
                publishToPrivate:true
            })
        }
    },
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    allChecked(event){
        if(event.target.checked){
            this.setState({
                publishToPrivate:false
            })
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
    surveyNameChange(event){
        SisDispatcher.dispatch({
            actionType:Constant.SURVEYNAMECHANGE,
            value:event.target.value
        })
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
    addMetaClick(){
        SisDispatcher.dispatch({
            actionType: Constant.ADDNEWMETA
        });
    },
    publishsurvey(){
        if(this.props.newsurvey.surveystatus!=Constant.SURVEYSTATUS_NORMAL &&this.props.newsurvey.surveystatus!=Constant.SURVEYSTATUS_PROPOSE &&this.props.newsurvey.surveyid){
            $("#publishsurvey").modal("show");
        }
    },
    confirmpublish(){

        var that = this;
        if(this.props.newsurvey.surveyid){
            $("#ajaxloading").show();
            if(this.state.publishToPrivate){
                $.ajax({
                    url: Constant.BASE_URL+"admin/survey/publishtoown",
                    data: $.param({
                        surveyid:that.props.newsurvey.surveyid
                    }),
                    type: 'POST',
                    contentType: 'application/x-www-form-urlencoded',
                    success: function (data) {

                        $("#ajaxloading").hide();
                        $("#publishsurvey").modal("hide");

                        SisDispatcher.dispatch({
                            actionType: Constant.SURVEYVALUECHANGE,
                            name:"surveystatus",
                            value:Constant.SURVEYSTATUS_NORMAL
                        });

                        setTimeout(function(){
                            that.confirmclean();
                            setTimeout(function(){
                                that.context.router.push("/surveylist");
                            },1000)
                        },200);


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
                    url: Constant.BASE_URL+"admin/survey/publishtoall",
                    data: $.param({
                        surveyid:that.props.newsurvey.surveyid
                    }),
                    type: 'POST',
                    contentType: 'application/x-www-form-urlencoded',
                    success: function (data) {

                        $("#ajaxloading").hide();
                        $("#publishsurvey").modal("hide");

                        SisDispatcher.dispatch({
                            actionType: Constant.SURVEYVALUECHANGE,
                            name:"surveystatus",
                            value:Constant.SURVEYSTATUS_NORMAL
                        });
                        setTimeout(function(){
                            that.confirmclean();
                            setTimeout(function(){
                                that.context.router.push("/surveylist");
                            },1000)
                        },200);

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


            //$.ajax({
            //    url: Constant.BASE_URL+"editor/survey/rfp",
            //    data: $.param({
            //        surveyid:that.props.newsurvey.surveyid
            //    }),
            //    type: 'PUT',
            //    contentType: 'application/x-www-form-urlencoded',
            //    success: function (data) {
            //
            //        $.ajax({
            //            url: Constant.BASE_URL+"admin/survey/audit",
            //            data: $.param({
            //                surveyid:that.props.newsurvey.surveyid,
            //                status:"surveynormal"
            //            }),
            //            type: 'PUT',
            //            contentType: 'application/x-www-form-urlencoded',
            //            success: function (data) {
            //                $.ajax({
            //                    url: Constant.BASE_URL+"admin/survey/assign",
            //                    data: $.param({
            //                        surveyid:that.props.newsurvey.surveyid,
            //                        staffid:that.props.loginInfo.id
            //                    }),
            //                    type: 'PUT',
            //                    contentType: 'application/x-www-form-urlencoded',
            //                    success: function (data) {
            //                        $("#ajaxloading").hide();
            //                        $("#publishsurvey").modal("hide");
            //
            //                        SisDispatcher.dispatch({
            //                            actionType: Constant.SURVEYVALUECHANGE,
            //                            name:"surveystatus",
            //                            value:Constant.SURVEYSTATUS_NORMAL
            //                        });
            //
            //                    },
            //                    error:function(jxr,scode){
            //                        $("#ajaxloading").hide();
            //                    },
            //                    statusCode:{
            //                        406:function(){
            //                        },
            //                        500:function(){
            //                            that.context.router.push("/login");
            //                        },
            //                        409:function(){
            //                        }
            //                    }
            //                });
            //            },
            //            error:function(jxr,scode){
            //                $("#ajaxloading").hide();
            //            },
            //            statusCode:{
            //                406:function(){
            //                },
            //                500:function(){
            //                    that.context.router.push("/login");
            //                },
            //                409:function(){
            //                }
            //            }
            //        });
            //    },
            //    error:function(jxr,scode){
            //        $("#ajaxloading").hide();
            //    },
            //    statusCode:{
            //        406:function(){
            //        },
            //        500:function(){
            //            that.context.router.push("/login");
            //        },
            //        409:function(){
            //        }
            //    }
            //});
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
    keypress(event){
        //event.stopPropagation();
        if(event.key == "Enter"){
            this.savesurvey();
        }
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
                        $("#surveynameform").popover("show");
                        setTimeout(function(){
                            $("#surveynameform").popover("hide");
                        },1000);
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
                title:"",
                ifSaved:false,
                selectlist:[],
                id:null,
                ifhasprecedent : false,
                precedentindex : -1,
                precedentselectindex : -1
            };
            //var cqlist = this.props.newsurvey.qlist;
            //cqlist.push(newQ);
            SisDispatcher.dispatch({
                actionType: Constant.SURVEYADDNEWQUESTION,
                value:newQ
            });
            setTimeout(function(){
                //var objDiv = document.getElementById("scrollright");
                //objDiv.scrollTop = objDiv.scrollHeight;
                $(window).scrollTop($(document).height());
            },100);
        }
    },
    gotop(){
        $(window).scrollTop(0);
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
                actionType: Constant.SURVEYQUESTIONEDIT,
                value:index
            });

        };
        return qhanle;
    },
    questionSequenceUp(index){
        var that =this;
        var qhanle = function(qdata){

            SisDispatcher.dispatch({
                actionType:Constant.SURVEYQUESTIONSEQUENCECHANGE,
                direction:"up",
                index:index
            })

        }
        return qhanle;
    },
    questionSequenceDown(index){
        var that =this;
        var qhanle = function(qdata){

            SisDispatcher.dispatch({
                actionType:Constant.SURVEYQUESTIONSEQUENCECHANGE,
                direction:"down",
                index:index
            })

        }
        return qhanle;
    },
    questiondeleteinform(index){
        var that = this;
        var dhandler = function(){
            //var qlist = that.props.newsurvey.qlist;
            //qlist.splice(index,1);
            SisDispatcher.dispatch({
                actionType: Constant.SURVEYQUESTIONDELETE,
                value:index
            });

        };
        return dhandler;
    },
    metatextchange(index){
        var that = this;
        var infunc = function(event){
            //var qlist = that.props.newsurvey.qlist;
            //qlist.splice(index,1);
            SisDispatcher.dispatch({
                actionType: Constant.METATEXTCHANGE,
                index:index,
                text:event.target.value
            });

        };
        return infunc;
    },
    metaselectchange(index){
        var that = this;
        var infunc = function(event){
            SisDispatcher.dispatch({
                actionType: Constant.METASELECTCHANGE,
                index:index,
                select:event.target.value
            });

        };
        return infunc;
    },
    deletemeta(index){
        var that = this;
        var infunc = function(event){
            that.state.deletemetaindex = index;
            $("#deletemeta").modal("show");
        }
        return infunc;
    },
    confirmdeletemeta(){
        $("#deletemeta").modal("hide");
        SisDispatcher.dispatch({
            actionType: Constant.DELETEMETA,
            index:this.state.deletemetaindex
        });
    },

    confirmnewfromfile(){
        $("#createsurveyfromfile").modal("hide");
        var that = this;
        if(this.props.newsurvey.surveyname){
            this.createNewSurvey(function(data){
                var msg = JSON.parse(data);

                for(var i in that.state.tmsg){
                    var q = that.state.tmsg[i];
                    q.surveyid = msg.body;
                    q.ifSaved = false;
                    q.id = null;
                }
                //alert(JSON.stringify(that.state.tmsg))
                $("#dataimporting").modal("show");
                SisDispatcher.dispatch({
                    actionType: Constant.SURVEYDATABATCHCHANGE,
                    value:{
                        ifSaved:true,
                        surveyid:msg.body,
                        qlist:that.state.tmsg
                    }
                });

                setTimeout(function(){
                    SisDispatcher.dispatch({
                        actionType: Constant.SAVEALLQUESTION,

                    });
                },500);
            })
        }
    },
    saveall(){
        SisDispatcher.dispatch({
            actionType: Constant.SAVEALLQUESTION,
        });
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
    componentDidMount(){
        $("#suveynameinput").popover({
            title:"Tip 1",
            content:"You should input survey name here first.",
            placement:"bottom",
            trigger:"manual"
        });

        $("#surveynamesavebutton").popover({
            title:"Tip 2",
            content:"Then you can push this button to save this new survey",
            placement:"bottom",
            trigger:"manual"
        });

        $("#questiontypeselect").popover({
            title:"Tip 3",
            content:"After saving survey name, you can select the question type from here. Enjoy it!",
            placement:"bottom",
            trigger:"manual"
        });

        //$("#surveynameform").popover({
        //    title:"Save indication",
        //    content:"Survey name was saved successfully.",
        //    placement:"bottom",
        //    trigger:"manual"
        //});
        //
        //$("#saveallbutton").popover({
        //    title:"Save indication",
        //    content:"Survey data was saved successfully.",
        //    placement:"top",
        //    trigger:"manual"
        //})
    },
    showtips(){
        var internal = 5000;
        $("#suveynameinput").popover("show");
        setTimeout(function(){
            $("#suveynameinput").popover("hide");
            $("#surveynamesavebutton").popover("show");
            setTimeout(function(){
                $("#surveynamesavebutton").popover("hide");
                $("#questiontypeselect").popover("show");
                setTimeout(function(){
                    $("#questiontypeselect").popover("hide");
                },internal);
            },internal);
        },internal);
    },
    importend(){
        $("#dataimportend").modal("hide");
    },
    render(){
        var dpoptionsList = [];
        dpoptionsList.push(<option value="-1">
            None
        </option>);
        for(var i in this.props.newsurvey.qlist){
            dpoptionsList.push(<option value={this.props.newsurvey.qlist[i].id}>
                {parseInt(i)+1},{this.props.newsurvey.qlist[i].title}
            </option>)
        }
        dpoptionsList.push(<option value={9999}>
            {parseInt(this.props.newsurvey.qlist.length)+1},END
        </option>)
        var metalist = [];
        for(var i in this.props.newsurvey.metainfolist){
            var cm = this.props.newsurvey.metainfolist[i];
            var mp = <div className="panel panel-default">
                <div className="panel-heading">
                    <div className="row">
                        <div className="col-sm-2">
                            <span className="grey">{parseInt(i)+1}</span>
                        </div>

                        <div className="col-sm-offset-8 col-md-2">
                            <a className="btn btn-danger" role="button" onClick={this.deletemeta(i)}>
                                Delete
                            </a>
                        </div>
                    </div>

                </div>
                <div className="panel-body">
                    <div className="row">
                        <label className="col-sm-2 control-label">
                            Meta text:
                        </label>
                        <div className="col-sm-10">
                            <textarea type="text"
                                   onChange = {this.metatextchange(i)}
                                   className="form-control">
                                {cm.text}
                            </textarea>
                        </div>
                    </div>
                    <div className="row">
                        <label className="col-sm-2 control-label">
                            Before this question:
                        </label>
                        <div className="col-sm-10">
                            <select className="form-control"
                                    value={cm.qid}
                                    onChange={this.metaselectchange(i)}
                                    >
                                {dpoptionsList}
                            </select>
                        </div>
                    </div>

                </div>
            </div>;
            metalist.push(mp);

        }


        var emptystyle = {display:"none"};
        if(this.props.newsurvey.ifSurveyNameEmpty){
            emptystyle = {}
        }

        var saveButtonStype = {
            marginBottom:"30px"
        };
        if(this.props.newsurvey.ifSaved){
            saveButtonStype = {
                display:"none",
                marginBottom:"30px"
            }
        }

        var questionList = [];
        for(var i in this.props.newsurvey.qlist){
            var q = this.props.newsurvey.qlist[i];
            questionList.push(<Question
                index={i}
                qdata={q}
                dhandle={this.questiondeleteinform(i)}
                uphandle={this.questionSequenceUp(i)}
                downhandle={this.questionSequenceDown(i)}
                qlist={this.props.newsurvey.qlist}
                qhandle={this.questionchange(i)}></Question>);
        }
        var surveyStatusTxt = "Not Published";
        var surveyStatusClassStyle = {
            color:"red",
            fontSize:"10px"
        };
        var ifDisablePublish = "";
        if(this.props.newsurvey.surveystatus==Constant.SURVEYSTATUS_NORMAL &&
            this.props.newsurvey.surveystatus==Constant.SURVEYSTATUS_PROPOSE){
            surveyStatusTxt = "Published";
            ifDisablePublish = "disabled";
            surveyStatusClassStyle = {
                color:"blue",
                fontSize:"10px"
            };
        }
        if(this.props.newsurvey.type == Constant.TYPE_TEMPLATE){
            surveyStatusTxt = "";
            ifDisablePublish = "disabled";
        }
        return(
            <div id="wrapper">
                <div id="sidebar-wrapper">

                    <ul className="sidebar-nav">
                        <div id="notsavealert" className="alert alert-danger alert-dismissible fade in" role="alert" style={{display:"none"}}>
                            <a className="close" aria-label="Close" data-dismiss="alert" type="button"></a>
                            <h4>You should save survey name first.</h4>
                        </div>
                        <li className="sidebar-brand">
                            <a >
                                Question Types
                            </a>
                        </li>
                        <li id="questiontypeselect">
                            <a onClick={this.singleselect}>
                                <span className="glyphicon glyphicon-minus" aria-hidden="true"></span>
                                &nbsp;&nbsp;Single Selection

                            </a>
                        </li>
                        <li>
                            <a  onClick={this.multiselect}>
                                <span className="glyphicon glyphicon-th-list" aria-hidden="true"></span>
                                &nbsp;&nbsp;Multiple Selection
                            </a>
                        </li>
                        <li>
                            <a  onClick={this.description}>
                                <span className="glyphicon glyphicon-pencil" aria-hidden="true"></span>
                                &nbsp;&nbsp;Subjective Item
                            </a>
                        </li>
                        <li>
                            <a  onClick={this.sorttype}>
                                <span className="glyphicon glyphicon-signal" aria-hidden="true"></span>
                                &nbsp;&nbsp;Sort
                            </a>
                        </li>
                        <li>
                            <a  onClick={this.scoretype}>
                                <span className="glyphicon glyphicon-sort-by-order" aria-hidden="true"></span>
                                &nbsp;&nbsp;Score
                            </a>
                        </li>
                        <li>
                            <Dropzone onDrop={this.onDrop} accept="text/csv">
                                <div>Drop xlsx file here or click.</div>
                            </Dropzone>
                        </li>

                    </ul>


                </div>

                <div id="page-content-wrapper">
                    <div className="container-fluid">
                        <div className="row">


                            <div id="scrollright" className="col-md-12" style={{paddingBottom:"70px"}}>
                                <nav className="navbar navbar-default navbar-fixed-bottom">
                                    <div className="container">
                                        <h3> {this.props.newsurvey.surveyname}
                                            &nbsp;&nbsp;&nbsp;&nbsp;
                                            <span style={surveyStatusClassStyle}>{surveyStatusTxt}</span>

                                            &nbsp;&nbsp;&nbsp;&nbsp;
                                            <a type="button"
                                                    disabled={ifDisablePublish}
                                                    onClick={this.publishsurvey}
                                                    className="btn btn-primary">
                                                <span className="glyphicon glyphicon-check" aria-hidden="true"></span>
                                                <span>&nbsp;&nbsp;Publish it</span>
                                            </a>
                                            &nbsp;&nbsp;
                                            <a type="button"
                                                    onClick={this.cleanall}
                                                    className="btn btn-warning">
                                                <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                                <span>&nbsp;&nbsp;Clean data</span>
                                            </a>

                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            <a type="button"
                                               onClick={this.gotop}
                                               className="btn btn-info">
                                                <span className="glyphicon glyphicon-hand-up" aria-hidden="true"></span>
                                                <span>&nbsp;&nbsp;Top</span>
                                            </a>

                                            &nbsp;&nbsp;
                                            <a type="button"
                                               onClick={this.showtips}
                                               className="btn btn-warning">
                                                <span className="glyphicon glyphicon-question-sign" aria-hidden="true"></span>
                                                <span>&nbsp;&nbsp;How to use?</span>
                                            </a>
                                        </h3>
                                    </div>
                                </nav>

                                <div className="form-horizontal">
                                    <div className="form-group">
                                        <label id="surveynameform" htmlFor="suveynameinput" className="col-sm-2 control-label">Survey Name</label>
                                        <div className="col-sm-10">
                                            <input type="text"
                                                   className="form-control"
                                                   id="suveynameinput"
                                                   value={this.props.newsurvey.surveyname}
                                                   onKeyPress={this.keypress}
                                                   onChange={this.surveyNameChange}
                                                   placeholder="Survey Name"/>
                                        </div>

                                    </div>


                                </div>
                                <div className="col-sm-offset-2 col-sm-10" style={saveButtonStype}>
                                    <a className="btn btn-primary"
                                       id = "surveynamesavebutton"
                                       onClick={this.savesurvey}>
                                        Save
                                    </a>
                                </div>
                                <div className="alert alert-danger col-md-12" role="alert" style={emptystyle}>
                                    Survey name can not be empty.
                                </div>

                                <div className="panel panel-default" style={{marginTop:"60px"}}>
                                    <div className="panel-heading">
                                        <div className="row">
                                            <div className="col-md-2">
                                                <h3 className="panel-title">Meta Text List</h3>
                                            </div>
                                            <div className="col-md-offset-8 col-md-2">
                                                <a className="btn btn-default" role="button" onClick={this.addMetaClick}>
                                                    Add Meta Text
                                                </a>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="panel-body">
                                        {metalist}
                                    </div>
                                </div>
                                <hr/>
                                {questionList}

                            </div>
                        </div>
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
                                <div className="radio">
                                    <label>
                                        <input type="radio"
                                               onChange={this.ownChecked}
                                               name="optionsRadios" checked={this.state.publishToPrivate}/>
                                            Publish this survey to own.
                                    </label>
                                </div>
                                <div className="radio">
                                    <label>
                                        <input type="radio"
                                               onChange={this.allChecked}
                                               name="optionsRadios" checked={!this.state.publishToPrivate}/>
                                            Publish this survey to all users.
                                    </label>
                                </div>

                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button" className="btn btn-primary" onClick={this.confirmpublish}>Confirm</a>
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
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button" className="btn btn-primary" onClick={this.confirmclean}>Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="createsurveyfromfile" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" >Import new survey</h4>
                            </div>
                            <div className="modal-body">
                                <h3>
                                    This operation will create a new survey.Please input survey's name.
                                </h3>
                                <form>
                                    <div className="form-group">
                                        <label htmlFor="surveynewform">Survey Name</label>
                                        <input type="text"
                                               className="form-control"
                                               id="inputPasswordxxx"
                                               placeholder=""
                                               value={this.props.newsurvey.surveyname}
                                               onChange={this.handleChange.bind(this,"surveyname")}
                                            />
                                    </div>
                                </form>



                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button" className="btn btn-primary" onClick={this.confirmnewfromfile}>Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="deletemeta" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" >Delete Meta Data</h4>
                            </div>
                            <div className="modal-body">
                                <h3>
                                    Confirm to delete this meta information?
                                </h3>

                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button" className="btn btn-primary" onClick={this.confirmdeletemeta}>Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="dataimporting" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" id="myModalLabel">Data importing</h4>
                            </div>
                            <div className="modal-body">
                                Data importing, please wait...
                            </div>

                        </div>
                    </div>
                </div>

                <div className="modal fade" id="dataimportend" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" id="myModalLabel">Data importing</h4>
                            </div>
                            <div className="modal-body">
                                Data imported successfully.
                            </div>
                            <div className="modal-footer">
                                <a type="button"
                                   onClick={this.importend}
                                   className="btn btn-primary">Confirm</a>
                                <a type="button" className="btn btn-default" data-dismiss="modal">Close</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})
