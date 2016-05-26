import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import crypto from "crypto"
import {PersonItem} from "./personitem"
//import $ from "jquery"
//import bootstrap from "bootstrap"
export var Personal = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    getInitialState(){
        return{
            username:"",
            password:"",
            ifpasserror:false,
            ifduplicate:false,
            password1st:"",
            password2nd:"",
            resetid:null,
            ifpassnotequal:false
        }
    },
    handleChange(name,event){
        var newstate = {};
        newstate[name] = event.target.value;
        newstate.iferror = false;
        newstate.ifpasserror = false;
        newstate.ifduplicate = false;
        newstate.ifpassnotequal = false;
        this.setState(newstate);
    },
    confirmNew(){
        if(!this.state.username || !this.state.password){
            this.setState({ifpasserror:true});
        }
        else{
            var hash = crypto.createHash("md5");
            hash.update(this.state.password);
            $("#ajaxloading").show();
            var that = this;
            $.ajax({
                url: Constant.BASE_URL+"sadmin/personal/add",
                data: $.param({
                    name:that.state.username,
                    password:hash.digest("hex")
                }),
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#newpersonal").modal("hide");
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data);
                    //SisDispatcher.dispatch({
                    //    actionType: Constant.ADDNEWPERSON
                    //});
                    that.getPList();


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
                        that.setState({
                            ifduplicate:true
                        })
                    }
                }
            });
        }

    },
    addNewPerson(){
        $("#newpersonal").modal("show");
    },
    getPList(){
        var that = this;
        if(this.props.loginInfo.role == "sadmin"){
            $.ajax({
                url: Constant.BASE_URL+"sadmin/personal/list",

                type: 'GET',
                success: function (data) {
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data);
                    SisDispatcher.dispatch({
                        actionType: Constant.GETPERSONAL_LIST,
                        plist:msg.body
                    });

                },
                error:function(){
                    $("#ajaxloading").hide();
                }
            });
        }
        else if(this.props.loginInfo.role == "admin"){
            $.ajax({
                url: Constant.BASE_URL+"admin/staff/list",

                type: 'GET',
                success: function (data) {
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data);
                    SisDispatcher.dispatch({
                        actionType: Constant.GETPERSONAL_LIST,
                        plist:msg.body
                    });

                },
                error:function(){
                    $("#ajaxloading").hide();
                },
                statusCode:{

                    500:function(){
                        SisDispatcher.dispatch({
                            actionType: Constant.ERROR500
                        });
                    }
                }
            });
        }

    },
    componentDidMount(){
        this.getPList();
    },
    componentDidUpdate(){
        //this.getPList();
    },
    resetPassClick(id){
        if(id){
            this.setState({resetid:id})
        }
        $("#personresetpass").modal("show");
    },
    confirmReset(){
        if(this.state.password1st && this.state.password2nd){
            if(this.state.password1st!=this.state.password2nd){
                this.setState({ifpassnotequal:true})
            }
            else{
                var hash = crypto.createHash("md5");
                hash.update(this.state.password1st);

                $("#ajaxloading").show();
                //alert(this.state.resetid)
                var that = this;
                $.ajax({
                    url: Constant.BASE_URL+"sadmin/org/admin/resetpass",
                    data: $.param({
                        adminid:that.state.resetid,
                        password:hash.digest("hex")
                    }),
                    type: 'PUT',
                    contentType: 'application/x-www-form-urlencoded',
                    success: function (data) {
                        $("#personresetpass").modal("hide");
                        $("#ajaxloading").hide();


                    },
                    error:function(jxr,scode){
                        $("#personresetpass").hide();
                    },
                    statusCode:{

                    }
                });
            }
        }
    },
    render() {
        //alert("hehe")
        //alert(JSON.stringify(this.props))
        var mlist = [];
        for(var i in this.props.personalList){
            var pli = this.props.personalList[i];
            mlist.push(<PersonItem
                _id={pli._id}
                id={i}
                name={pli.name}
                ctime={pli.ctime}
                key={pli._id}
                resetClick={this.resetPassClick}

            />)
        }
        var emptyNameStyle = {display:"none"};

        var duplicateStyle = {display:"none"};
        if(this.state.ifpasserror){
            emptyNameStyle = {}
        }
        if(this.state.ifduplicate){
            duplicateStyle = {}
        }

        var notequalpassstyle = {display:"none"};
        if(this.state.ifpassnotequal){
            notequalpassstyle = {}
        }
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <div className="row">
                        <div className="col-md-3 col-md-offset-1">
                            <h3 className="title"> Personal Users List </h3>

                        </div>
                        <div className="col-md-3">
                            <a type="button" className="btn btn-lg btn-primary"
                               style={{marginTop:"20px"}}
                               onClick={this.addNewPerson}
                            >Create</a>
                        </div>


                    </div>
                </div>

                <div className="panel-body">
                    <table  className="table" >
                        <thead>
                        <tr>
                            <th><span className="">##</span></th>
                            <th><span className="">User Name</span></th>
                            <th><span className="">Create Time</span></th>
                            <th><span className="">Operations</span></th>
                        </tr>
                        </thead>
                        <tbody>

                        {mlist}

                        </tbody>
                    </table>
                </div>

                <div className="modal fade" id="newpersonal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" id="newmedialable">New personal user</h4>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="form-group">
                                        <label htmlFor="mediaNameInput">User Name</label>
                                        <input type="text" className="form-control" id="mediaNameInput" placeholder="User Name"
                                               onChange={this.handleChange.bind(this,"username")} value={this.state.username}/>
                                        <label htmlFor="mediaPassInput">Initial Password</label>
                                        <input type="text" className="form-control" id="mediaPassInput" placeholder="Initial Password"
                                               onChange={this.handleChange.bind(this,"password")} value={this.state.password}/>
                                    </div>

                                </form>

                                <div className="alert alert-danger col-md-8" role="alert" style={emptyNameStyle}>
                                    User name or password error
                                </div>
                                <div className="alert alert-danger col-md-8" role="alert" style={duplicateStyle}>
                                    Duplicate username
                                </div>
                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button" className="btn btn-primary" onClick={this.confirmNew}>Confirm</a>
                            </div>
                        </div>
                    </div>

                </div>


                <div className="modal fade" id="personresetpass" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" >Reset Password</h4>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="form-group">
                                        <label htmlFor="personnewpass">New Password</label>
                                        <input type="password" className="form-control" id="personnewpass" placeholder="New Password"
                                               onChange={this.handleChange.bind(this,"password1st")} value={this.state.password1st}/>
                                        <label htmlFor="personnewpass2nd">Retype New Password</label>
                                        <input type="password" className="form-control" id="personnewpass2nd" placeholder="New Password Again"
                                               onChange={this.handleChange.bind(this,"password2nd")} value={this.state.password2nd}/>
                                    </div>

                                </form>

                                <div className="alert alert-danger col-md-8" role="alert" style={notequalpassstyle}>
                                    You should input same password twice.
                                </div>

                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button" className="btn btn-primary" onClick={this.confirmReset}>Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        );
    }
});
