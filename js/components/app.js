import React from 'react';
import {loginStore} from '../store/loginstore';
import {personalStore} from '../store/personalstore'
import {newsurveyStore} from '../store/newsurveystore'
import {surveyEditListStore} from '../store/surveyeditliststore'
import {adStore} from '../store/adstore'
import {versionStore} from "../store/versionstore"
import {orgStore} from "../store/orgstore"
import {logsStore} from "../store/logsstore"
import {Link} from 'react-router'
import {Constant} from "../constant";
import {SisDispatcher} from "../dispatcher";
import {edataStore} from "../store/edatastore";
import {feedbackStore} from '../store/feedbackstore';
import crypto from "crypto"
export var App = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired,
    },
    getInitialState(){
        return{
            password1st:"",
            password2nd:"",
            ifpassnotequal:false,
            iffail:false
        }
    },
    componentDidMount(){
        this.token=loginStore.addListener(this._onChange);
        this.ptoken = personalStore.addListener(this._onChange);
        this.newstoken = newsurveyStore.addListener(this._onChange);
        this.eslisttoken = surveyEditListStore.addListener(this._onChange);
        this.adtoken = adStore.addListener(this._onChange);
        this.versiontoken = versionStore.addListener(this._onChange);
        this.orgtoken = orgStore.addListener(this._onChange);
        this.logtoken = logsStore.addListener(this._onChange);
        this.edatatoken = edataStore.addListener(this._onChange);
        this.Ftoken = feedbackStore.addListener(this._onChange);
    },
    componentWillUnmount(){
        loginStore.remove(this.token);
        personalStore.remove(this.ptoken);
        newsurveyStore.remove(this.newstoken);
        surveyEditListStore.remove(this.eslisttoken);
        adStore.remove(this.adtoken);
        versionStore.remove(this.versiontoken);
        orgStore.remove(this.orgtoken);
        logsStore.remove(this.logtoken);
        edataStore.remove(this.edatatoken);
        feedbackStore.remove(this.Ftoken);
    },
    handleChange(name,event){
        var newstate = {};
        newstate[name] = event.target.value;
        newstate.ifpassnotequal = false;
        this.setState(newstate);
    },
    homeclick(){
        var cpath = this.props.routes[this.props.routes.length-1]['path']
        if(cpath!="home" && cpath!="login"){
            this.context.router.push("/home");
        }
    },
    loginclick(){
        this.context.router.push("/frontpage");
    },
    _onChange() {
        var loginInfo = loginStore.getLoginInfo();
        if(!loginInfo.ifLogin){
            this.context.router.push("/login");
        }
        this.setState({a:1});
    },
    logoutClick(){
        $("#logoutmodal").modal("show");
    },
    resetpassClick(){

        var newstate = {};
        newstate.password1st = "";
        newstate.password2nd = "";
        newstate.ifpassnotequal = false;
        newstate.iffail = false;
        this.setState(newstate);

        $("#allresetpass").modal("show");
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

                var that = this;
                $.ajax({
                    url: Constant.BASE_URL+"all/resetpass",
                    data: $.param({
                        password:hash.digest("hex")
                    }),
                    type: 'PUT',
                    contentType: 'application/x-www-form-urlencoded',
                    success: function (data) {
                        $("#allresetpass").modal("hide");
                        $("#ajaxloading").hide();

                    },
                    error:function(jxr,scode){
                        $("#allresetpass").hide();
                    },
                    statusCode:{
                        406:function(){
                            that.setState({
                                iffail: true
                            });
                        },
                        200:function(){
                        },
                        404:function(){
                            that.setState({
                                iffail: true
                            });
                        }
                    }
                });
            }
        }
    },
    gotologout(){
        var that = this;
        $.ajax({
            url: Constant.BASE_URL+"logout",
            type: 'GET',
            success: function (data) {
                $("#logoutmodal").modal("hide");
                SisDispatcher.dispatch({
                    actionType: Constant.LOGOUT

                });
            },
            error:function(jxr,scode){
            },
            statusCode:{
                406:function(){
                },
                500:function(){
                },
                409:function(){
                }
            }
        });
    },
    render() {
        var logoutStyle = {display:"none"};
        var loginInfo = loginStore.getLoginInfo();
        if(loginInfo.ifLogin){
            logoutStyle = {};
        }
        var notequalpassstyle = {display:"none"};
        if(this.state.ifpassnotequal){
            notequalpassstyle = {}
        }
        var failerror = {display:"none"};
        if(this.state.iffail){
            failerror = {}
        }
        return (
            <div>
                <nav className="navbar navbar-default navbar-fixed-top">
                    <div className="container-fluid">
                        <div class="navbar-header">
                            <a style={{padding:0}} className="navbar-brand" href="#">
                                <img style={{maxHeight:"50px"}} alt="Brand" src="image/logo_244px.png"/>
                            </a>
                            <a style={{fontSize:"40px",fontWeight:"bolder"}} className="navbar-brand" href="#">Ouresa</a>
                        </div>
                        <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                            <ul className="nav navbar-nav">

                                <li><a onClick={this.loginclick}>Home</a></li>
                                <li><a onClick={this.homeclick}>Entries</a></li>
                            </ul>

                            <ul className="nav navbar-nav navbar-right">
                                <li style={logoutStyle}><a onClick={this.resetpassClick}>Setting</a></li>
                                <li style={logoutStyle}><a onClick={this.logoutClick}>Logout</a></li>
                            </ul>

                        </div>
                    </div>
                </nav>
                <div className="modal fade" id="logoutmodal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" id="myModalLabel">Logout</h4>
                            </div>
                            <div className="modal-body">
                                Are you sure to logout?
                            </div>
                            <div className="modal-footer">
                                <a type="button"
                                   onClick={this.gotologout}
                                   className="btn btn-primary">Confirm</a>
                                <a type="button" className="btn btn-default" data-dismiss="modal">Close</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal fade" id="allresetpass" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
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
                                <div className="alert alert-danger col-md-8" role="alert" style={failerror}>
                                    Resetpassword fail.
                                </div>


                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button" className="btn btn-primary" onClick={this.confirmReset}>Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>
                {
                    this.props.children && React.cloneElement(this.props.children,
                        {loginInfo:loginStore.getLoginInfo(),
                            newsurvey:newsurveyStore.getAll(),
                            personalList:personalStore.getAll(),
                            surveyeditlist:surveyEditListStore.getAll(),
                            adlist:adStore.getAll(),
                            versionlist:versionStore.getAll(),
                            orglist:orgStore.getAll(),
                            orgdata:orgStore.getData(),
                            edata:edataStore.getAll(),
                            feedbackList:feedbackStore.getAll(),
                            logsList:logsStore.getAll()
                        })
                }
            </div>
        )
    }
});

