import React from 'react';
import ReactDom from 'react-dom';
import {SisDispatcher} from "./dispatcher";
import {loginStore} from './store/loginstore';
import {personalStore} from './store/personalstore'

import {Router, Route, IndexRoute, Link, hashHistory,browserHistory } from 'react-router'
import {App} from "./components/app"
import {Login} from "./components/login"
import {Register} from "./components/register"
import {Home} from "./components/home"
import {Personal} from "./components/personal"
import {Newsurvey} from "./components/newsurvey"
import {Surveylist} from "./components/surveylist"
import {Quest} from "./components/quest"
import {Stastic} from "./components/stastic"
import {Ads} from "./components/ads"
import {Org} from "./components/org"
import {Settings} from "./components/settings"
import {Edata} from "./components/edata"
import {Frontpage} from "./components/frontpage"
import {Forgetpass} from "./components/forgetpass"
import {Resetpass} from "./components/resetpass"
import {Feedback} from "./components/feedback"

var main = document.getElementsByTagName('main')[0];


ReactDom.render(
    <Router history={hashHistory}>
        <Route path='/' component={App}>
            <IndexRoute component={Frontpage}/>
            <Route path="frontpage" component={Frontpage} />
            <Route path="login" component={Login} />
            <Route path="register" component={Register} />
            <Route path="home" component={Home} />
            <Route path="personal" component={Personal} />
            <Route path="newsurvey" component={Newsurvey} />
            <Route path="surveylist" component={Surveylist} />
            <Route path="quest/:id" component={Quest} />
            <Route path="stastic/:id" component={Stastic} />
            <Route path="ads" component={Ads} />
            <Route path="org" component={Org} />
            <Route path="settings" component={Settings} />
            <Route path="edata" component={Edata} />
            <Route path="feedback" component={Feedback} />
            <Route path="forgetpass" component={Forgetpass} />
            <Route path="resetpass/:resetcode" component={Resetpass} />
        </Route>
    </Router>,
    main
);