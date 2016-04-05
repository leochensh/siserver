import React from 'react';
import {loginStore} from '../store/loginstore';
import {personalStore} from '../store/personalstore'
import {newsurveyStore} from '../store/newsurveystore'
import {surveyEditListStore} from '../store/surveyeditliststore'
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
    },
    componentWillUnmount(){
        loginStore.remove(this.token);
        personalStore.remove(this.ptoken);
        newsurveyStore.remove(this.newstoken);
        surveyEditListStore.remove(this.eslisttoken);
    },
    homeclick(){
        var cpath = this.props.routes[this.props.routes.length-1]['path']

        if(cpath!="home" && cpath!="login"){
            this.context.router.push("/home");
        }

    },
    loginclick(){
        this.context.router.push("/login");
    },
    _onChange() {
        var loginInfo = loginStore.getLoginInfo();
        if(!loginInfo.ifLogin){
            this.context.router.push("/login");
        }
        this.setState({a:1});
    },
    render() {
        return (
            <div>
                <nav className="navbar navbar-default navbar-fixed-top">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <a className="navbar-brand">Smartinsight Survey Management System</a>
                        </div>
                        <div className="collapse navbar-collapse" >
                            <ul className="nav navbar-nav">
                                <li><a onClick={this.homeclick}>Home</a></li>
                                <li><a onClick={this.loginclick}>Relogin</a></li>
                            </ul>

                        </div>
                    </div>
                </nav>
                {
                    this.props.children && React.cloneElement(this.props.children,
                        {loginInfo:loginStore.getLoginInfo(),
                            newsurvey:newsurveyStore.getAll(),
                            personalList:personalStore.getAll(),
                            surveyeditlist:surveyEditListStore.getAll()})
                }
            </div>

        )
    }
});

