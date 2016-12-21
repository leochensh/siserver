import React from 'react';
//import $ from "jquery"
import crypto from "crypto";
import FacebookLogin from 'react-facebook-login';
import {Constant} from "../constant";
import {SisDispatcher} from "../dispatcher";

export var Frontpage = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    componentDidMount: function(){
        $.get(Constant.BASE_URL+"firstpagevisit");
    },
    getInitialState(){
        return{

        }
    },
    zzlregisterClick(){
        $("#zzldownloadddmodal").modal("hide");
        $("#zzlregistermodal").modal("show");
    },
    DownloadClick(){
        
    },
    handleLoginClick(){
        $("#zzldownloadddmodal").modal("hide");
        $("#loginsmodal").modal("show");
    },
    handleClick(){
        $("#zzldownloadddmodal").modal("show");
    },
    render() {

        return (
            <div  className="row" style={{position:"relative"}} >
                <img style={{position:"absolute",width:"100%",height:"580px"}}src="image/background.png"/>
                <div className="row" >
                    <div className="col-md-2 col-md-offset-5">
                        <a style={{position:"absolute",top:"-20px",zIndex:"1500"}}>
                            <img style={{width:"100px",height:"100px"}} src="image/LOGO.png"/>
                        </a>
                    </div>

                </div>
                <div className="row" >
                    <div  >
                        <img style={{position:"absolute",top:"250px",width:"750px",height:"80px"}} src="image/blue background.png"/>

                        <div style={{position:"absolute",top:"250px",left:"150px"}}>

                           <p><h1 style={{color:"#FFFFFF"}}>Survey Aspects<strong> |  Future Insights</strong></h1></p>
                        </div>
                    </div>

                </div>
                <div calssName="row" >
                    <div className="col-md-4 col-md-offset-8">
                    <a
                        type="button"
                        href="/usermanul.rar"
                        style={{position:"absolute",top:"320px",left:"160px"}}

                        ><h3 style={{color:"#FFFFFF"}}><strong>Download Manual</strong></h3></a>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-1 col-md-offset-9"    >
                        <img style={{position:"absolute",top:"370px"}} src="image/Scan or Click background.png"/>
                            <div>
                                <div style={{position:"absolute",top:"370px",left:"50px"}} >
                                    <h3 style={{color:"#FFFFFF"}}><strong>SCAN</strong></h3>
                                </div>
                                <div style={{position:"absolute",top:"410px",left:"100px"}}>
                                    <h3 style={{color:"#FFFFFF"}}>or</h3>
                                </div>
                                <div style={{position:"absolute",top:"450px",left:"50px"}}>
                                    <h3 style={{color:"#FFFFFF"}}><strong>CLICK</strong></h3>
                                </div>
                            </div>
                            <div style={{position:"absolute",top:"390px",left:"150px"}} >
                               <a
                                   type="button"
                                   onClick={this.handleClick}
                                   ><img style={{maxWidth:"100px"}}  src="image/1479981556.png"/></a>
                            </div>
                    </div>
                </div>
                <div className="row"     >
                        <div style={{position:"absolute",top:"555px",left:"520px"}} >
                           <h6 style={{color:"#FFFFFF"}}>© Copyright 2016 Ouresa. All rights reserved.</h6>>
                        </div>
                </div>

                <div

                    style={{minWidth:"400px",zIndex:1501}}
                    className="modal fade bs-example-modal-sm" id="zzldownloadddmodal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">
                    <div className="modal-dialog modal-sm" role="document">
                        <div className="modal-content">
                            <button
                                style={{marginTop:"10px",marginRight:"15px"}}

                                type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>

                            <div className="row" style={{marginTop:"20px"}}>
                                <div className="col-sm-3 col-sm-offset-2">

                                        <img style={{width:"80px",height:"80px"}} src="image/LOGO.png"/>

                                </div>
                                <div className="col-sm-3 col-sm-offset-1">

                                        <img style={{width:"80px",height:"80px"}} src="image/1479981556.png"/>

                                </div>
                            </div>

                            <form className="form-horizontal" >
                                <div className="form-group form-group-lg" style={{marginTop:"40px",marginBottom:"50px"}}>
                                    <div className="col-sm-10 col-sm-offset-1">
                                        <a
                                            type="button"
                                            href={Constant.BASE_URL+"downloadapk"}
                                            className="btn btn-info"
                                            style={{width:"240px",height:"40px",borderRadius:"20px"}}
                                            >Download for Android</a>
                                    </div>

                                </div>
                                <div className="form-group form-group-lg">
                                    <div className="col-sm-10 col-sm-offset-1">
                                        <a
                                            type="button"
                                            onClick={this.handleLoginClick}
                                            className="btn btn-info"
                                            style={{width:"240px",height:"40px",borderRadius:"20px"}}
                                            >Login</a>
                                    </div>

                                </div>

                                <div className="form-group form-group-lg">
                                    <div className="col-sm-10 col-sm-offset-1">
                                        <a
                                            type="button"
                                            onClick={this.zzlregisterClick}
                                            className="btn btn-default"
                                            style={{width:"240px",height:"40px",borderRadius:"20px"}}
                                            >Register</a>
                                    </div>

                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});
