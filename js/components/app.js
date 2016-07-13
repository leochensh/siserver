import React from 'react';
import {loginStore} from '../store/loginstore';
import {personalStore} from '../store/personalstore'
import {newsurveyStore} from '../store/newsurveystore'
import {surveyEditListStore} from '../store/surveyeditliststore'
import {adStore} from '../store/adstore'
import {versionStore} from "../store/versionstore"
import {orgStore} from "../store/orgstore"
import {Link} from 'react-router'

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
    },
    componentWillUnmount(){
        loginStore.remove(this.token);
        personalStore.remove(this.ptoken);
        newsurveyStore.remove(this.newstoken);
        surveyEditListStore.remove(this.eslisttoken);
        adStore.remove(this.adtoken);
        versionStore.remove(this.versiontoken);
        orgStore.remove(this.orgtoken);
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
    render() {
        console.log(versionStore.getAll())
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

                        </div>

                    </div>
                </nav>
                {
                    this.props.children && React.cloneElement(this.props.children,
                        {loginInfo:loginStore.getLoginInfo(),
                            newsurvey:newsurveyStore.getAll(),
                            personalList:personalStore.getAll(),
                            surveyeditlist:surveyEditListStore.getAll(),
                            adlist:adStore.getAll(),
                            versionlist:versionStore.getAll(),
                            orglist:orgStore.getAll(),
                            orgdata:orgStore.getData()
                        })
                }
            </div>

        )
    }
});

