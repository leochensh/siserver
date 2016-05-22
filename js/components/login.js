import React from 'react';
//import $ from "jquery"
import crypto from "crypto";
import FacebookLogin from 'react-facebook-login';
import {Constant} from "../constant";
import {SisDispatcher} from "../dispatcher";

export var Login = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    getInitialState(){
        return{
            username:"",
            password:"",
            iferror:false,
            fbname:"",
            fbemail:"",
            fbpass:"",
            fbrepass:"",
            fberrorstr:"",
            iffberror:false
        }
    },
    handleChange(name,event){
        var newstate = {};
        newstate[name] = event.target.value;
        newstate.iferror = false;
        newstate.iffberror = false;
        this.setState(newstate);
    },
    handleClick(event){
        if(!this.state.username || !this.state.password){
            this.setState({iferror:true});
        }
        else{
            $("#ajaxloading").show();
            var hash = crypto.createHash("md5");
            hash.update(this.state.password);
            var that = this;
            $.ajax({
                url: Constant.BASE_URL+"admin/login",
                data: $.param({
                    username:that.state.username,
                    password:hash.digest("hex")
                }),
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {

                    var msg = JSON.parse(data);
                    $("#ajaxloading").hide();
                    that.context.router.push("/home");
                    SisDispatcher.dispatch({
                        actionType: Constant.LOGINSUCCESS,
                        role:msg.body.role,
                        id:msg.body.id
                    });


                },
                error:function(){
                    $("#ajaxloading").hide();
                    that.setState({iferror:true});
                }
            });
            return false;
        }
    },
    handleRegisterClick(){
        this.context.router.push("/register");
    },
    responseFacebook(res){
        console.log(res);
        if(res.id){
            $("#ajaxloading").show();
            var that = this;
            $.ajax({
                url: Constant.BASE_URL+"lookupfbid",
                data: $.param({
                    fbid:res.id
                }),
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    var msg = JSON.parse(data);
                    $("#ajaxloading").hide();
                    that.context.router.push("/home");
                    SisDispatcher.dispatch({
                        actionType: Constant.LOGINSUCCESS,
                        role:msg.body.role,
                        id:msg.body._id
                    });
                },
                error:function(){
                    $("#ajaxloading").hide();
                },
                statusCode:{
                    404:function(){
                        that.state.fbid = res.id;
                        setTimeout(function(){
                            $("#newfbuser").modal("show");
                        },300);
                    }
                }
            });
        }
    },
    gotoLogin(){
        $("#loginmodal").modal("hide");
    },
    confirmnewfbuser(){
        if(this.state.fbname && this.state.fbemail && this.state.fbpass && this.state.fbrepass){
            if(this.state.fbpass == this.state.fbrepass){
                $("#ajaxloading").show();
                var hash = crypto.createHash("md5");
                hash.update(this.state.fbpass);
                var that = this;
                $.ajax({
                    url: Constant.BASE_URL+"addfbuser",
                    data: $.param({
                        fbname:that.state.fbname,
                        fbpass:hash.digest("hex"),
                        fbemail:that.state.fbemail,
                        fbid:that.state.fbid
                    }),
                    type: 'POST',
                    contentType: 'application/x-www-form-urlencoded',
                    success: function (data) {
                        var msg = JSON.parse(data);
                        $("#ajaxloading").hide();
                        $("#newfbuser").modal("hide");
                        that.context.router.push("/home");
                        SisDispatcher.dispatch({
                            actionType: Constant.LOGINSUCCESS,
                            role:msg.body.role,
                            id:msg.body.id
                        });
                    },
                    error:function(){
                        $("#ajaxloading").hide();
                    },
                    statusCode:{
                        404:function(){
                            that.setState({
                                iffberror:true,
                                fberrorstr:"Verified code error."});
                        },
                        500:function(){
                            SisDispatcher.dispatch({
                                actionType: Constant.ERROR500
                            });
                        },
                        409:function(){
                            that.setState({
                                iffberror:true,
                                fberrorstr:"User name duplicated."});
                        }
                    }
                });
            }
            else{
                this.setState({
                    iffberror:true,
                    fberrorstr:"Reenter password should be same as password."
                })
            }
        }
        else{
            this.setState({
                iffberror:true,
                fberrorstr:"Form input can not be empty"
            })
        }
    },
    render() {
        var disStyle = this.state.iferror?{}:{display:"none"};
        var fbdisstyle = this.state.iffberror?{}:{display:"none"};
        return (
        <div className="row">
            <div className="col-md-6 col-md-offset-3">
                <div className="divLogin">
                    <form className="form-horizontal">
                        <div className="form-group form-group-lg">
                            <label htmlFor="inputEmail3" className="col-sm-2 control-label">Username</label>
                            <div className="col-sm-10">
                                <input type="text"
                                       className="form-control"
                                       id="inputEmail3"
                                       placeholder="Username"
                                       value={this.state.username}
                                       onChange={this.handleChange.bind(this,"username")}
                                />
                            </div>
                        </div>
                        <div className="form-group form-group-lg">
                            <label htmlFor="inputPassword3" className="col-sm-2 control-label">Password</label>
                            <div className="col-sm-10">
                                <input type="password"
                                       className="form-control"
                                       id="inputPassword3"
                                       placeholder="Password"
                                       value={this.state.password}
                                       onChange={this.handleChange.bind(this,"password")}
                                />
                            </div>
                        </div>
                        <div className="form-group form-group-lg">
                            <div className="col-sm-offset-2 col-sm-10">
                                <div className="checkbox">
                                    <label>
                                        <input type="checkbox"/> Remember me
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="form-group form-group-lg">
                            <div className="col-sm-offset-2 col-sm-2">
                                <a
                                    className="btn btn-primary"
                                    onClick={this.handleClick}
                                >Log in</a>
                            </div>
                            <div className="col-sm-offset-1 col-sm-2">
                                <a
                                    className="btn btn-default"
                                    onClick={this.handleRegisterClick}
                                >Register</a>
                            </div>
                            <div className="col-sm-offset-1 col-sm-2">
                                <FacebookLogin
                                    appId="1820455008188736"
                                    autoLoad={false}
                                    callback={this.responseFacebook} />
                            </div>

                        </div>
                    </form>
                    <div className="alert alert-danger loginalert" role="alert" style={disStyle}>
                        Username/Password error
                    </div>
                </div>
            </div>

            <div className="modal fade" id="newfbuser" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 className="modal-title" >Register new user</h4>
                        </div>
                        <div className="modal-body">
                            <h3>
                                This is your first time login. Please fill out detail info.
                            </h3>
                            <form>
                                <div className="form-group">
                                    <label htmlFor="fbname">User Name</label>
                                    <input type="text"
                                           className="form-control"
                                           id="fbname"
                                           placeholder=""
                                           value={this.state.fbname}
                                           onChange={this.handleChange.bind(this,"fbname")}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="fbemail">Email</label>
                                    <input type="email"
                                           className="form-control"
                                           id="fbemail"
                                           placeholder=""
                                           value={this.state.fbemail}
                                           onChange={this.handleChange.bind(this,"fbemail")}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="fbpass">Password</label>
                                    <input type="password"
                                           className="form-control"
                                           id="fbpass"
                                           placeholder=""
                                           value={this.state.fbpass}
                                           onChange={this.handleChange.bind(this,"fbpass")}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="fbrepass">Reenter Password</label>
                                    <input type="password"
                                           className="form-control"
                                           id="fbrepass"
                                           placeholder=""
                                           value={this.state.fbrepass}
                                           onChange={this.handleChange.bind(this,"fbrepass")}
                                    />
                                </div>
                            </form>

                            <div className="alert alert-danger loginalert" role="alert" style={fbdisstyle}>
                                {this.state.fberrorstr}
                            </div>

                        </div>
                        <div className="modal-footer">
                            <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                            <a type="button" className="btn btn-primary" onClick={this.confirmnewfbuser}>Confirm</a>
                        </div>
                    </div>
                </div>
            </div>

            <div id="loginmodal" className="modal fade" tabindex="-1" role="dialog">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Login success</h4>
                        </div>
                        <div className="modal-body">
                            <p>Login success.</p>
                        </div>
                        <div className="modal-footer">
                            <a type="button"
                               onClick={this.gotoLogin}
                               className="btn btn-primary">Confirm</a>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        )
    }
});
