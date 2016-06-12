import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import {Question} from "./question"
import _ from "underscore"
import crypto from "crypto"

export var Surveylist = React.createClass({
    getInitialState(){
        return{
            surveyurl:"",
            deleteindex:null
        }
    },
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    componentDidMount (){
        this.getSurveyList();
    },

    getSurveyList(){
        SisDispatcher.dispatch({
            actionType: Constant.GETSURVEYEDITLIST,
            role:this.props.loginInfo.role
        });
    },
    deleteButtonClick(index){
        var that = this;
        var inFunc = function(){
            that.state.deleteindex = index;
            $("#deletemodal").modal("show");

        };
        return inFunc;
    },
    confirmDeleteSurvey(){
        $("#deletemodal").modal("hide");
        SisDispatcher.dispatch({
            actionType: Constant.DELETESURVEY,
            index:this.state.deleteindex
        });
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
            that.setState({
                surveyurl:Constant.BASE_FULL+"quest/"+that.props.surveyeditlist[index]._id
            });
            //that.context.router.push("/quest/"+that.props.surveyeditlist[index]._id);
            $("#sharemodal").modal("show");
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
            var pdate = "";
            if(selist[i].publishtime){
                pdate = new Date(selist[i].publishtime).toLocaleString();
            }
            mlist.push(
                <tr key={"slist"+i}>
                    <td>{i}</td>
                    <td>{selist[i].name}</td>
                    <td>{new Date(selist[i].ctime).toLocaleString()}</td>
                    <td>{pdate}</td>
                    <td>{ stext }</td>
                    <td className="list_btn">
                        <div className="btn-group" role="group" >
                            <a
                                type="button"
                                onClick={this.deleteButtonClick(i)}
                                className="btn btn-danger">Delete</a>
                            <a
                                type="button"
                                onClick={this.editButtonClick(i)}
                                className="btn btn-primary">Edit</a>
                            <a
                                type="button"
                                onClick={this.shareItClick(i)}
                                className="btn btn-primary">Share it</a>
                            <a
                                type="button"
                                onClick={this.stastic(i)}
                                className="btn btn-primary">Stastic</a>
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
                            <th><span className="">Publish Time</span></th>
                            <th><span className="">Status</span></th>
                            <th><span className="">Operations</span></th>
                        </tr>
                        </thead>
                        <tbody>

                        {mlist}

                        </tbody>
                    </table>
                </div>


                <div className="modal fade" id="sharemodal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" >Survey link share</h4>
                            </div>
                            <div className="modal-body">
                                <h3>
                                    Copy the url to your destination.
                                </h3>
                                <form>
                                    <div className="form-group">
                                        <label htmlFor="surveynewform">Survey Url</label>
                                        <input type="text"
                                               className="form-control"
                                               value={this.state.surveyurl}
                                        />
                                    </div>
                                </form>



                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="deletemodal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" >Confirm to delete</h4>
                            </div>
                            <div className="modal-body">
                                <h3>
                                    Are you sure to delete this survey?
                                </h3>




                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button"
                                   onClick={this.confirmDeleteSurvey}
                                   className="btn btn-primary" >Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }
})