import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import {Question} from "./question"
import _ from "underscore"
import crypto from "crypto"

export var Surveylist = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    componentDidMount (){
        this.getSurveyList();
    },

    getSurveyList(){
        SisDispatcher.dispatch({
            actionType: Constant.GETSURVEYEDITLIST,
        });
    },
    deleteButtonClick(index){
        var inFunc = function(){
            SisDispatcher.dispatch({
                actionType: Constant.DELETESURVEY,
                index:index
            });
        };
        return inFunc;
    },
    editButtonClick(index){
        var that = this;
        var inFunc = function(){
            SisDispatcher.dispatch({
                actionType: Constant.EDITSURVEY,
                id:that.props.surveyeditlist[index]._id
            });
            that.context.router.push("/newsurvey");
        };
        return inFunc;
    },
    shareItClick(index){
        var that = this;
        var inFunc = function(){
            that.context.router.push("/quest/"+that.props.surveyeditlist[index]._id);
        };
        return inFunc;

    },
    stastic(index){
        var that = this;
        var inFunc = function(){
            that.context.router.push("/stastic/"+that.props.surveyeditlist[index]._id);
        };
        return inFunc;
    },
    render(){
        var mlist = [];
        var selist = this.props.surveyeditlist;
        for(var i in selist){
            var stext = Constant.SURVEYSTATUSMAP[selist[i].status];
            mlist.push(
                <tr>
                    <td>{i}</td>
                    <td>{selist[i].name}</td>
                    <td>{new Date(selist[i].ctime).toLocaleString()}</td>
                    <td>{ stext }</td>
                    <td className="list_btn">
                        <div className="btn-group" role="group" >
                            <button
                                type="button"
                                onClick={this.deleteButtonClick(i)}
                                className="btn btn-danger">Delete</button>
                            <button
                                type="button"
                                onClick={this.editButtonClick(i)}
                                className="btn btn-primary">Edit</button>
                            <button
                                type="button"
                                onClick={this.shareItClick(i)}
                                className="btn btn-primary">Share it</button>
                            <button
                                type="button"
                                onClick={this.stastic(i)}
                                className="btn btn-primary">Stastic</button>
                        </div>
                    </td>

                </tr>
            );
        }
        return (
            <div >

                <div className="panel panel-default paddingpanel">
                    <table  className="table" >
                        <thead>
                        <tr>
                            <th><span className="">##</span></th>
                            <th><span className="">Survey Name</span></th>
                            <th><span className="">Create Time</span></th>
                            <th><span className="">Status</span></th>
                            <th><span className="">Operations</span></th>
                        </tr>
                        </thead>
                        <tbody>

                        {mlist}

                        </tbody>
                    </table>
                </div>




            </div>
        )
    }
})