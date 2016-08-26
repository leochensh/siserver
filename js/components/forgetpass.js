import React from 'react';
//import $ from "jquery"
import {Constant} from "../constant";
import {SisDispatcher} from "../dispatcher";
import {Emailcheck} from "./emailcheck"

export var Forgetpass = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    componentDidMount: function(){
    },
    getInitialState(){
        return{
            email:"",
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

    handleClick(){
        if(this.state.email && Emailcheck.validateEmail(this.state.email)){

        }
        else{
            this.setState({
                iferror:true,
                errorstr:"Please input correct email address."
            })
        }
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

                <div className="col-md-6 col-md-offset-3">
                    <div className="panel panel-default" style={{marginTop:"30px"}}>

                        <div className="panel-body" style={{backgroundColor:"#eee",padding:"30px"}}>
                            <form className="form-horizontal">
                                <div className="form-group form-group-lg">
                                    <label
                                        style={{marginBottom:"30px"}}
                                        htmlFor="inputEmail3" className="control-label">Input your register email to reset password</label>
                                    <div className="">
                                        <input type="text"
                                               className="form-control"
                                               id="inputEmail3"
                                               placeholder="Email"
                                               value={this.state.email}
                                               onChange={this.handleChange.bind(this,"email")}
                                        />
                                    </div>
                                </div>


                            </form>
                            <div className="row">
                                <div className="col-sm-2">
                                    <a

                                        className="btn btn-primary"
                                        onClick={this.handleClick}
                                    >Reset</a>
                                </div>

                            </div>
                            <div style={{marginTop:"30px"}} className="row">
                                <div

                                    className="col-sm-8 alert alert-danger loginalert" role="alert" style={disStyle}>
                                    {this.state.errorstr}
                                </div>
                            </div>

                        </div>

                    </div>

                </div>
            </div>
        )
    }
});
