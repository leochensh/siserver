import React from 'react';
//import $ from "jquery"
import crypto from "crypto"
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";

export var Login = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    getInitialState(){
        return{
            username:"",
            password:"",
            iferror:false
        }
    },
    handleChange(name,event){
        var newstate = {};
        newstate[name] = event.target.value;
        newstate.iferror = false;
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

                    SisDispatcher.dispatch({
                        actionType: Constant.LOGINSUCCESS,
                        role:msg.body.role,
                        id:msg.body.id
                    });
                    setTimeout(function(){
                        $("#ajaxloading").hide();
                        that.context.router.push("/home");
                    },1000);

                },
                error:function(){
                    $("#ajaxloading").hide();
                    that.setState({iferror:true});
                }
            });
        }
    },
    render() {
        var disStyle = this.state.iferror?{}:{display:"none"};
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
                            <div className="col-sm-offset-2 col-sm-10">
                                <button
                                    type="submit"
                                    className="btn btn-default"
                                    onClick={this.handleClick}
                                >Log in</button>
                            </div>
                        </div>
                    </form>
                    <div className="alert alert-danger loginalert" role="alert" style={disStyle}>
                        Username/Password error
                    </div>
                </div>
            </div>
        </div>
        )
    }
});
