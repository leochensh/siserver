import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import {Question} from "./question"
import _ from "underscore"
import crypto from "crypto"
import async from "async"

export var Starrating = React.createClass({
    componentDidMount(){
        alert(this.props.did)
        $("#"+this.props.did).rating();
    },
    render(){
        return (
            <input id={this.props.did}
                   type="number"
                   className="rating"
                   data-min="1"
                   data-max="10"
                   data-stars="10"
                   data-step="1"
                   data-size="lg"/>
        )
    }
});