import React from 'react';
import {loginStore} from '../store/loginstore';
import {personalStore} from '../store/personalstore'

export var App = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    componentDidMount(){
        this.token=loginStore.addListener(this._onChange);
        this.ptoken = personalStore.addListener(this._onChange);
    },
    componentWillUnmount(){
        loginStore.remove(this.token);
        personalStore.remove(this.ptoken);
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
                <nav className="navbar navbar-default">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <a className="navbar-brand">Smartinsight Survey Management System</a>
                        </div>
                    </div>
                </nav>
                {
                    this.props.children && React.cloneElement(this.props.children,
                        {loginInfo:loginStore.getLoginInfo(),
                            personalList:personalStore.getAll()})
                }
            </div>

        )
    }
});

