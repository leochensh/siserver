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
            adminname:"",
            ifAddError:false,
            errorMsg:"Name duplicate",
            adminpass:"",
            adminrepass:"",

            ifAdminError:false,
            adminErrorMsg:""
        }
    },
    handleChange(name,event){
        var newstate = {};
        newstate[name] = event.target.value;
        newstate.ifAddError = false;
        newstate.ifAdminError = false;
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
    newOrgAdmin(){
        $("#neworgadmin").modal("show");
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
    deleteButtonClick(index){
        var that = this;
        var infunc = function(){
            SisDispatcher.dispatch({
                actionType: Constant.DELETEORGADMIN,
                index:index
            });
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
    confirmaddorgadmin(){
        if(this.state.adminname && this.state.adminpass && this.state.adminrepass){
            if(this.state.adminpass == this.state.adminrepass){
                var orgId = this.props.orglist[this.props.orgdata.activeorgindex]._id;
                $("#ajaxloading").show();
                var that  = this;
                var hash = crypto.createHash("md5");
                hash.update(this.state.adminpass);
                $.ajax({
                    url: Constant.BASE_URL+"sadmin/org/admin/add",
                    data: $.param({
                        name:that.state.adminname,
                        orgid:orgId,
                        password:hash.digest("hex")
                    }),
                    type: 'POST',
                    contentType: 'application/x-www-form-urlencoded',
                    success: function (data) {
                        $("#ajaxloading").hide();
                        $("#neworgadmin").modal("hide");
                        SisDispatcher.dispatch({

                            actionType: Constant.GETORGADMINLIST

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
                                ifAdminError:true,
                                adminErrorMsg:"Name duplicate"
                            })
                        }
                    }
                });
            }
            else{
                this.setState({
                    ifAdminError:true,
                    adminErrorMsg:"Password and re-enter password should be same."
                })
            }
        }
        else{
            this.setState({
                ifAdminError:true,
                adminErrorMsg:"Form input should not be empty."
            })
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

        var adminErrorStyle = {
            display:"none"
        };
        if(this.state.ifAdminError){
            adminErrorStyle = {};
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
        var adminlist = [];

        for(var index in this.props.orgdata.adminlist){
            var admin = this.props.orgdata.adminlist[index];
            adminlist.push(
                <tr key={"adminlist"+index}>
                    <td>{parseInt(index)+1}</td>
                    <td>{admin.name}</td>
                    <td>{new Date(admin.ctime).toLocaleString()}</td>
                    <td className="list_btn">
                        <div className="btn-group" role="group" >
                            <a
                                type="button"
                                onClick={this.deleteButtonClick(index)}
                                className="btn btn-danger">Delete</a>

                        </div>
                    </td>

                </tr>
            );
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
                                                   onClick={this.newOrgAdmin}
                                                   className="btn btn-primary" disabled="">
                                                    <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
                                                    <span>&nbsp;&nbsp;Create Admin</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="panel-body">
                                        <table  className="table" >
                                            <thead>
                                            <tr>
                                                <th><span className="">##</span></th>
                                                <th><span className="">Admin Name</span></th>
                                                <th><span className="">Create Time</span></th>
                                                <th><span className="">Operations</span></th>
                                            </tr>
                                            </thead>
                                            <tbody>

                                            {adminlist}

                                            </tbody>
                                        </table>
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
                                <h4 className="modal-title" >Create new orgnization</h4>
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

                <div className="modal fade" id="neworgadmin" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" >Create new admin</h4>
                            </div>
                            <div className="modal-body">
                                <h3>
                                    This operation will create a new admin acount.Please input admin's name.
                                </h3>
                                <form>
                                    <div className="form-group">
                                        <label htmlFor="adminnameid">Admin Name</label>
                                        <input type="text"
                                               className="form-control"
                                               id="adminnameid"
                                               placeholder=""
                                               value={this.state.adminname}
                                               onChange={this.handleChange.bind(this,"adminname")}
                                        />
                                        <label htmlFor="adminpass">Password</label>
                                        <input type="password"
                                               className="form-control"
                                               id="adminpass"
                                               placeholder=""
                                               value={this.state.adminpass}
                                               onChange={this.handleChange.bind(this,"adminpass")}
                                        />
                                        <label htmlFor="adminrepass">Reenter Password</label>
                                        <input type="password"
                                               className="form-control"
                                               id="adminrepass"
                                               placeholder=""
                                               value={this.state.adminrepass}
                                               onChange={this.handleChange.bind(this,"adminrepass")}
                                        />
                                    </div>
                                    <div style={adminErrorStyle}>
                                        <div className="alert alert-danger" role="alert">
                                            {this.state.adminErrorMsg}
                                        </div>
                                    </div>
                                </form>

                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button"
                                   onClick={this.confirmaddorgadmin}
                                   className="btn btn-primary" >Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }
})