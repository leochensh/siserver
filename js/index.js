import React from 'react';
import ReactDom from 'react-dom';
import {SisDispatcher} from "./dispatcher";
import {loginStore} from './store/loginstore';
import {personalStore} from './store/personalstore'

import {Router, Route, IndexRoute, Link, hashHistory} from 'react-router'
import {App} from "./components/app"
import {Login} from "./components/login"
import {Home} from "./components/home"
import {Personal} from "./components/personal"
var main = document.getElementsByTagName('main')[0];
var wrapHome = function(){
    return(React.createClass({
        render(){
            return(<Home loginInfo={loginStore.getLoginInfo()}/>);
        }
    }));
};

var wrapPersonal = function(){
    return(React.createClass({
        render(){
            return(<Personal personalList={personalStore.getAll()}/>);
        }
    }));
};

ReactDom.render(
    <Router history={hashHistory}>
        <Route path='/' component={App}>
            <IndexRoute component={Login}/>
            <Route path="login" component={Login} />
            <Route path="home" component={Home} />
            <Route path="personal" component={Personal} />
        </Route>
    </Router>,
    main
);