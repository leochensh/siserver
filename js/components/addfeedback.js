/**
 * Created by 张志良 on 2016/9/22.
 */
import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import crypto from "crypto"
import {Emailcheck} from "./emailcheck"
var Dropzone = require('react-dropzone');
export var Addfeedback = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },

    getInitialState(){
        return {
            zzldescription:"",
            zzlname:"",
            zzlemail:"",
            zzlphone:"",
            newimage:null

        }
    },
    handleChange(name,event){
        var newstate = {};
        newstate[name] = event.target.value;

        this.setState(newstate);
    },
    zzlconfirmclick(){
        $("#zzladdfbmodal").modal("hide");
        this.context.router.push("/frontpage");

    },
    zzlconfirmfailclick(){
        $("#zzladdfbmodalfail").modal("hide");
    },
    zzlconfirmerrorclick(){
        $("#zzlconfirmerrormodal").modal("hide");
    },
    zzlconfirmemailclick(){
        $("#zzlemailvalid").modal("hide");
    },
    handleClick(event){
        if(!this.state.zzldescription ||!this.state.zzlname||!this.state.zzlemail||!this.state.zzlphone||!this.state.newimage){
            $("#zzlconfirmerrormodal").modal("show");
        }else{
            var that = this;
            if(Emailcheck.validateEmail(that.state.zzlemail) && Emailcheck.validatePhone(that.state.zzlphone) ){
                $("#ajaxloading").show();
                $.ajax({
                    url: Constant.BASE_URL + "anonymous/feedback",
                    data: $.param({
                        name: that.state.zzlname,
                        phone: that.state.zzlphone,
                        email: that.state.zzlemail,
                        content: that.state.zzldescription,
                        image: that.state.newimage,
                        platform: "web"
                    }),
                    type: 'POST',
                    contentType: 'application/x-www-form-urlencoded',
                    success: function (data) {
                        var msg = JSON.parse(data);
                        $("#ajaxloading").hide();
                        $("#zzladdfbmodal").modal("show");


                    },
                    error: function () {
                        $("#ajaxloading").hide();
                        $("#zzladdfbmodalfail").modal("show");

                    }
                });

            }else{
                $("#zzlemailvalid").modal("show");
            }
        }
    },
    onDropimage: function (files) {
        console.log(files[0].name);
        var data = new FormData();
        data.append("name",files[0].name);
        data.append("file",files[0]);
        $("#ajaxloading").show();
        var that  = this;
        $.ajax({
            url: Constant.BASE_URL+"anonymous/upload/image",
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: function(data){
                $("#ajaxloading").hide();
                that.setState({
                    newimage:JSON.parse(data).body
                });

            },
            error:function(jxr,scode){
                $("#ajaxloading").hide();
            }
        });
    },
    render(){
        var zzlimage = "";
        if(this.state.newimage){
            zzlimage = <img style={{width:"195px",height:"130px"}} src={Constant.BASE_IMAGEURL+this.state.newimage}/>
        }

        return(
            <div className="row" style={{position:"relative"}}>
                <div className="col-md-3">
                    <div className="row" style={{position:"absolute",top:"20px",left:"100px",width:"300px",height:"120px",backgroundColor:"#00c7ff"}}>
                    <div style={{position:"absolute",top:"10px",left:"60px"}}>
                        <h2 style={{color:"#FFFFFF"}}>Thank you for</h2>

                    </div>
                    <div style={{position:"absolute",top:"40px",left:"40px"}}>
                        <h2 style={{color:"#FFFFFF"}}>your<b> Feedback.</b></h2>
                    </div>
                    </div>
                </div>
                <div className="col-md-3 col-md-offset-1" style={{position:"absolute",top:"20px",left:"330px"}}>
                    <form className="form-horizontal">
                        <div className="form-group form-group-lg">
                            <div className="row" >
                                <div >
                                    <h5><i>Problem</i></h5>
                                </div>
                                <div >
                                    <h4><b>Description</b></h4>
                                </div>
                                <textarea
                                       rows="10"
                                       style={{width:"600px",height:"100px"}}
                                       className="form-control"
                                       placeholder="Please write your complaint or five us more suggestion..."
                                       value={this.state.zzldescription}
                                       onChange={this.handleChange.bind(this,"zzldescription")}>
                                </textarea>
                            </div>
                        </div>
                        <div className="form-group form-group-lg">
                            <div>
                                <Dropzone onDrop={this.onDropimage} accept="image/*">
                                    <div>
                                        <h5><i>Drop  Picture file here or click.</i></h5>
                                        <p>(less than 20M)</p>
                                        {zzlimage}
                                    </div>
                                </Dropzone>
                            </div>


                        </div>
                        <div className="form-group form-group-lg">
                            <div className="row" >
                                <input type="text"
                                       style={{width:"400px",height:"40px"}}
                                       className="form-control"
                                       placeholder="Name"
                                       value={this.state.zzlname}
                                       onChange={this.handleChange.bind(this,"zzlname")}
                                    />
                            </div>

                        </div>
                        <div className="form-group form-group-lg">
                            <div className="row">
                                <input type="text"
                                       style={{width:"400px",height:"40px"}}
                                       className="form-control"
                                       placeholder="Email"
                                       value={this.state.zzlemail}
                                       onChange={this.handleChange.bind(this,"zzlemail")}
                                    />

                            </div>

                        </div>
                        <div className="form-group form-group-lg">
                            <div className="row">
                                <input type="text"
                                       style={{width:"400px",height:"40px"}}
                                       className="form-control"
                                       placeholder="Phone"
                                       value={this.state.zzlphone}
                                       onChange={this.handleChange.bind(this,"zzlphone")}
                                    />

                            </div>

                        </div>
                        <div className="form-group form-group-lg">
                            <div className="row">
                                <input type="button" onClick={this.handleClick} className="btn" style={{backgroundColor:"#00c7ff",color:"#FFFFFF"}} value={"Submit"}/>

                            </div>

                        </div>
                    </form>

                </div>

                <div id="zzladdfbmodal" className="modal fade" tabindex="-1" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">messages</h4>
                            </div>
                            <div className="modal-body">
                                <p>Add feedback success.</p>
                            </div>
                            <div className="modal-footer">
                                <a type="button"
                                onClick={this.zzlconfirmclick}
                                className="btn btn-primary">Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="zzladdfbmodalfail" className="modal fade" tabindex="-1" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">messages</h4>
                            </div>
                            <div className="modal-body">
                                <p>Add feedback fail.</p>
                            </div>
                            <div className="modal-footer">
                                <a type="button"
                                   onClick={this.zzlconfirmfailclick}
                                   className="btn btn-primary">Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="zzlconfirmerrormodal" className="modal fade" tabindex="-1" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">Submit error</h4>
                            </div>
                            <div className="modal-body">
                                <p>error: Form input can not be empty.</p>

                            </div>
                            <div className="modal-footer">
                                <a type="button"
                                    onClick={this.zzlconfirmerrorclick}
                                    className="btn btn-primary">Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="zzlemailvalid" className="modal fade" tabindex="-1" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">Email error</h4>
                            </div>
                            <div className="modal-body">
                                <p>error: You should input a valid email or phone.</p>

                            </div>
                            <div className="modal-footer">
                                <a type="button"
                                   onClick={this.zzlconfirmemailclick}
                                   className="btn btn-primary">Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>


        )

    }
});