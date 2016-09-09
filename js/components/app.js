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
import {feedbackStore} from '../store/feedbackstore'

export var App = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired,
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
        feedbackStore.remove(this.Ftoken);
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
                            feedbackList:feedbackStore.getAll(),
                            logsList:logsStore.getAll()
                        })
                }
            </div>

        )
    }
});

