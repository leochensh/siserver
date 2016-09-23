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

    render() {

        return (
            <div  className="imgrow" >
                <div className="row" >
                    <div className="col-md-2 col-md-offset-5">
                        <a>
                            <img  src="image/LOGO.png"/>
                        </a>
                    </div>

                </div>
                <div className="row" >
                    <div className="col-md-6" style={{position:"relative"}}>
                        <img style={{position:"absolute",top:"300px",width:"765px",height:"100px"}} src="image/blue background.png"/>

                        <div style={{position:"absolute",top:"320px",left:"200px"}}>

                           <h1 style={{color:"#FFFFFF"}}>Survey Details<strong> | Insight Future</strong></h1>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-1 col-md-offset-9" style={{position:"relative"}}>
                        <img style={{position:"absolute",top:"450px"}} src="image/Scan or Click background.png"/>
                            <div>
                                <div style={{position:"absolute",top:"450px",left:"50px"}} >
                                    <h3 style={{color:"#FFFFFF"}}><strong>SCAN</strong></h3>
                                </div>
                                <div style={{position:"absolute",top:"490px",left:"100px"}}>
                                    <h3 style={{color:"#FFFFFF"}}>or</h3>
                                </div>
                                <div style={{position:"absolute",top:"530px",left:"50px"}}>
                                    <h3 style={{color:"#FFFFFF"}}><strong>CLICK</strong></h3>
                                </div>
                            </div>
                            <div style={{position:"absolute",top:"470px",left:"150px"}} >
                                <img  src="image/QR code.png"/>
                            </div>


                    </div>
                </div>


            </div>
        )
    }
});
