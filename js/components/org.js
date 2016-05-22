import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import {Question} from "./question"
import _ from "underscore"
import crypto from "crypto"

export var Org = React.createClass({
    getInitialState(){
        return{
            orgname:"new orgnization",
            ifAddError:false,
            errorMsg:"Name duplicate",
        }
    },
    handleChange(name,event){
        var newstate = {};
        newstate[name] = event.target.value;
        newstate.ifAddError = false;
        this.setState(newstate);
        //SisDispatcher.dispatch({
        //    actionType: Constant.SURVEYVALUECHANGE,
        //    name:name,
        //    value:event.target.value
        //});
    },
    newOrg(){
        $("#neworg").modal("show");
    },
    orgitemclick(index){
        var that = this;
        var infunc = function(){
            if(index!=that.props.orgdata.activeorgindex){
                SisDispatcher.dispatch({
                    actionType: Constant.CHANGEACTIVEORG,
                    index:index
                });

                //that.setState({
                //    activeorgindex:index
                //})
            }
        };
        return infunc;
    },
    componentDidMount (){
        SisDispatcher.dispatch({
            actionType: Constant.GETORGNIZATIONLIST,
        });
        setTimeout(function(){
            SisDispatcher.dispatch({
                actionType: Constant.GETORGADMINLIST,
            });
        },500);
    },
    confirmaddorg(){
        if(this.state.orgname){
            $("#ajaxloading").show();
            var that  = this;
            $.ajax({
                url: Constant.BASE_URL+"sadmin/org/create",
                data: $.param({
                    name:that.state.orgname
                }),
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#ajaxloading").hide();
                    $("#neworg").modal("hide");
                    SisDispatcher.dispatch({
                        actionType: Constant.GETORGNIZATIONLIST
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
                        that.setState({
                            ifAddError:true,
                            errorMsg:"Name duplicate"
                        })
                    }
                }
            });

        }
    },
    render(){
        var errorStyle = {
            display:"none"
        };
        if(this.state.ifAddError){
            errorStyle = {
            }
        }
        var orgulli = [];
        for(var i in this.props.orglist){
            var c = "";
            if(i == this.props.orgdata.activeorgindex){
                c = "active";
            }
            orgulli.push(
                <li >
                    <a onClick={this.orgitemclick(i)}
                        className={c}>
                        {this.props.orglist[i].name}
                    </a>
                </li>
            )
        }
        return(
            <div id="wrapper">
                <div id="sidebar-wrapper">

                    <ul className="sidebar-nav">

                        <li className="sidebar-brand">
                            <a >
                                Orgnization List
                            </a>
                        </li>
                        <a type="button"
                           style={{marginLeft:"50px"}}
                           onClick={this.newOrg}
                           className="btn btn-primary">
                            <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
                            <span>&nbsp;&nbsp;Create</span>
                        </a>
                        {orgulli}


                    </ul>


                </div>

                <div id="page-content-wrapper">
                    <div className="container-fluid">
                        <div className="row">


                            <div id="scrollright" className="col-md-12">
                                <div className="panel panel-default">
                                    <div className="panel-heading">
                                        <div className="row">
                                            <div className="col-md-3">
                                                Admin List
                                            </div>
                                            <div className="col-md-5">
                                                <a type="button"
                                                   onClick={this.newOrg}
                                                   className="btn btn-primary" disabled="false">
                                                    <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
                                                    <span>&nbsp;&nbsp;Create Admin</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="panel-body">
                                        Panel content
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="modal fade" id="neworg" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" >Publish Survey</h4>
                            </div>
                            <div className="modal-body">
                                <h3>
                                    This operation will create a new orgnization.Please input orgnization's name.
                                </h3>
                                <form>
                                    <div className="form-group">
                                        <label htmlFor="orgnameid">Orgnization Name</label>
                                        <input type="text"
                                               className="form-control"
                                               id="orgnameid"
                                               placeholder=""
                                               value={this.state.orgname}
                                               onChange={this.handleChange.bind(this,"orgname")}
                                        />
                                    </div>
                                    <div style={errorStyle}>
                                        <div className="alert alert-danger" role="alert">
                                            {this.state.errorMsg}
                                        </div>
                                    </div>
                                </form>

                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button"
                                   onClick={this.confirmaddorg}
                                   className="btn btn-primary" >Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }
})