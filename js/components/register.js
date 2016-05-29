import React from 'react';
//import $ from "jquery"
import crypto from "crypto"
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";

export var Register = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    getInitialState(){
        return{
            email:"",
            verifiedcode:"",
            username:"",
            password:"",
            repassword:"",
            iferror:false,
            errorstr:""
        }
    },
    handleChange(name,event){
        var newstate = {};
        newstate[name] = event.target.value;
        newstate.iferror = false;
        this.setState(newstate);
    },
    getVerifiedCode(){
        if(this.state.email){
            $("#ajaxloading").show();
            var that =this;
            $.ajax({
                url: Constant.BASE_URL+"sendverifiedcode",
                data: $.param({
                    email:that.state.email
                }),
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {

                    var msg = JSON.parse(data);
                    $("#ajaxloading").hide();
                    that.setState({
                        iferror:true,
                        errorstr:"A email containing verified code already was send to your email. Please check your inbox or spam folder."
                    })
                },
                error:function(){
                    $("#ajaxloading").hide();
                    that.setState({
                        iferror:true,
                        errorstr:"Internal server error. Please try again later or contact administrator."
                    });
                }
            });
        }
    },
    gotoLogin(){
        $("#loginmodal").modal("hide");
        this.context.router.push("/login");
    },
    handleClick(event){
        if(!this.state.username ||
            !this.state.password ||
            !this.state.repassword||
            !this.state.email ||
            !this.state.verifiedcode){
            this.setState({
                iferror:true,
                errorstr:"Form input can not be empty"});
        }
        else{
            if(this.state.password!=this.state.repassword){
                this.setState({
                    iferror:true,
                    errorstr:"Reenter password should be same as password."});
            }
            else{
                $("#ajaxloading").show();
                var hash = crypto.createHash("md5");
                hash.update(this.state.password);
                var that = this;
                $.ajax({
                    url: Constant.BASE_URL+"addpersonalfree",
                    data: $.param({
                        name:that.state.username,
                        password:hash.digest("hex"),
                        email:that.state.email,
                        verifiedcode:that.state.verifiedcode
                    }),
                    type: 'POST',
                    contentType: 'application/x-www-form-urlencoded',
                    success: function (data) {
                        var msg = JSON.parse(data);
                        $("#ajaxloading").hide();
                        $("#loginmodal").modal("show");
                    },
                    error:function(){
                        $("#ajaxloading").hide();
                    },
                    statusCode:{
                        404:function(){
                            that.setState({
                                iferror:true,
                                errorstr:"Verified code error."});
                        },
                        500:function(){
                            SisDispatcher.dispatch({
                                actionType: Constant.ERROR500
                            });
                        },
                        409:function(){
                            that.setState({
                                iferror:true,
                                errorstr:"User name duplicated."});
                        }
                    }
                });
            }

        }
    },
    render() {
        var disStyle = this.state.iferror?{}:{display:"none"};
        return (
            <div className="row">
                <div className="col-md-10 col-md-offset-1">
                    <div className="divLogin">
                        <form className="form-horizontal">
                            <div className="form-group form-group-lg">
                                <label htmlFor="inputEmail4" className="col-sm-2 control-label">Email</label>
                                <div className="col-sm-7">
                                    <input type="email"
                                           className="form-control"
                                           id="inputEmail4"
                                           placeholder="Email"
                                           value={this.state.email}
                                           onChange={this.handleChange.bind(this,"email")}
                                    />
                                </div>
                                <div className="col-sm-1">
                                    <a
                                        className="btn btn-default"
                                        onClick={this.getVerifiedCode}
                                    >Get verified code</a>
                                </div>
                            </div>
                            <div className="form-group form-group-lg">
                                <label htmlFor="inputEmail5" className="col-sm-2 control-label">Verified code</label>
                                <div className="col-sm-10">
                                    <input type="text"
                                           className="form-control"
                                           id="inputEmail5"
                                           placeholder="Verified code"
                                           value={this.state.verifiedcode}
                                           onChange={this.handleChange.bind(this,"verifiedcode")}
                                    />
                                </div>
                            </div>
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
                                <label htmlFor="inputPassword4" className="col-sm-2 control-label">Reenter password</label>
                                <div className="col-sm-10">
                                    <input type="password"
                                           className="form-control"
                                           id="inputPassword4"
                                           placeholder="Password"
                                           value={this.state.repassword}
                                           onChange={this.handleChange.bind(this,"repassword")}
                                    />
                                </div>
                            </div>

                            <div className="form-group form-group-lg">
                                <div className="col-sm-offset-2 col-sm-2">
                                    <a
                                        className="btn btn-primary"
                                        onClick={this.handleClick}
                                    >Confirm</a>
                                </div>

                            </div>
                        </form>
                        <div className="alert alert-danger loginalert" role="alert" style={disStyle}>
                            {this.state.errorstr}
                        </div>
                    </div>
                </div>

                <div id="loginmodal" className="modal fade" tabindex="-1" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">Register success</h4>
                            </div>
                            <div className="modal-body">
                                <p>Now you can use your registered user name to login.</p>
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
