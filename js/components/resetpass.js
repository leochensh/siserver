import React from 'react';
//import $ from "jquery"
import crypto from "crypto";
import FacebookLogin from 'react-facebook-login';
import {Constant} from "../constant";
import {SisDispatcher} from "../dispatcher";

export var Resetpass = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    componentDidMount: function(){
        this.state.resetcode = this.props.params.resetcode;
    },
    getInitialState(){
        return{
            iferror:false,
            errorstr:"",
            resetcode:null,
            pass:"",
            repass:""
        }
    },
    handleChange(name,event){
        var newstate = {};
        newstate[name] = event.target.value;
        newstate.iferror = false;
        this.setState(newstate);
    },

    handleClick(){
        if(this.state.pass &&
            this.state.repass &&
            this.state.pass.length>0 &&
            this.state.repass.length>0){

            var hash = crypto.createHash("md5");
            hash.update(this.state.pass);
            var that = this;
            $("#ajaxloading").show();
            $.ajax({
                url: Constant.BASE_URL+"resetpassfromcode",
                data: $.param({
                    code:this.props.params.resetcode,
                    pass:hash.digest("hex")
                }),
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {

                    var msg = JSON.parse(data);
                    $("#ajaxloading").hide();
                    $("#resetsucmodal").modal("show")



                },
                error:function(){
                    $("#ajaxloading").hide();
                },
                statusCode: {
                    404: function () {
                        that.setState({
                            iferror: true,
                            errorstr: "This reset code is not valid."
                        });
                    },
                    409: function () {
                        that.setState({
                            iferror: true,
                            errorstr: "Password reset time out. Please try again."
                        });
                    }
                }
            });


        }
        else{
            this.setState({
                iferror:true,
                errorstr:"Please input correct password."
            })
        }

    },
    confirmreset(){
        $("#resetsucmodal").modal("hide");
        this.context.router.push("/login");
    },
    render() {
        var disStyle = {
            display:"none"
        };
        if(this.state.iferror){
            disStyle = {};
        }
        return (
            <div className="row">

                <div className="col-md-8 col-md-offset-2">
                    <div className="panel panel-default" style={{marginTop:"30px"}}>

                        <div className="panel-body" style={{backgroundColor:"#eee",padding:"30px"}}>
                            <form className="form-horizontal">
                                <div className="form-group form-group-lg">
                                    <label  className="col-sm-3 control-label">New password</label>
                                    <div className="col-sm-9">
                                        <input type="password"
                                               className="form-control"
                                               value={this.state.pass}
                                               onChange={this.handleChange.bind(this,"pass")}
                                        />
                                    </div>
                                </div>

                                <div className="form-group form-group-lg">
                                    <label  className="col-sm-3 control-label">New password again</label>
                                    <div className="col-sm-9">
                                        <input type="password"
                                               className="form-control"
                                               value={this.state.repass}
                                               onChange={this.handleChange.bind(this,"repass")}
                                        />
                                    </div>
                                </div>


                            </form>
                            <div className="row">
                                <div className="col-sm-2 col-sm-offset-3">
                                    <a
                                        className="btn btn-primary btn-lg"
                                        onClick={this.handleClick}
                                    >Confirm to reset password</a>
                                </div>

                            </div>
                            <div style={{marginTop:"30px"}} className="row">
                                <div

                                    className="col-sm-7 col-sm-offset-3 alert alert-danger loginalert" role="alert" style={disStyle}>
                                    {this.state.errorstr}
                                </div>
                            </div>

                        </div>

                    </div>

                </div>

                <div id="resetsucmodal" className="modal fade" tabindex="-1" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">Password reset confirm</h4>
                            </div>
                            <div className="modal-body">
                                <p>Password reset successfully! Please login again. </p>
                            </div>
                            <div className="modal-footer">
                                <a type="button"
                                   onClick={this.confirmreset}
                                   className="btn btn-primary">OK</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});
