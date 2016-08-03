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
    handleChange(name,event){
        var newstate = {};
        newstate[name] = event.target.value;
        newstate.iferror = false;
        newstate.iffberror = false;
        this.setState(newstate);
    },

    handleRegisterClick(){
        this.context.router.push("/register");
    },
    handleLoginClick(){
        this.context.router.push("/login");
    },
    render() {
        var disStyle = this.state.iferror?{}:{display:"none"};
        var fbdisstyle = this.state.iffberror?{}:{display:"none"};
        return (
            <div className="row"  style={{background:"#789928",minHeight:"700px",padding:"100px"}}>
                <div className="col-md-8">
                    <div className="jumbotron"  style={{background:"#789928",
                                        textAlign:"center",
                                        color:"#fff",
                                        textShadow:"0 -1px 1px rgba(0,0,0,0.8)",
                                        display:"block"}}>
                        <h1 style={{fontSize:"50px"}}>Survey Details,  Insight Future</h1>
                        <h3>You can scan QR code via mobile phone or press download buttun to experience android version right now.</h3>
                        <p style={{marginTop:"30px"}}>
                            <button type="button" onClick={this.handleLoginClick} className="btn btn-primary btn-lg" style={{marginRight:"15px"}}>Login</button>
                            <button type="button" onClick={this.handleRegisterClick} className="btn btn-default btn-lg">Register</button>
                        </p>

                    </div>

                </div>
                <div className="col-md-4">
                    <div className="row" style={{textAlign:"center",display:"block"}}>
                        <a className="col-md-offset-2 col-md-8"
                           href={Constant.BASE_URL+"downloadapk"}>
                            <img style={{marginTop:"50px",maxWidth:"200px"}} src="image/dfa.png"/>
                        </a>

                    </div>
                    <div className="row" style={{textAlign:"center",display:"block"}}>

                        <a className="col-md-offset-2 col-md-8">
                            <img style={{marginTop:"50px",maxWidth:"200px"}} src="image/0e549f74a0110310e75ad351b98f403b.png"/>
                        </a>
                    </div>
                </div>

            </div>
        )
    }
});
