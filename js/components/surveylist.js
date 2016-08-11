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
            deleteindex:null,
            catoption:"all",
            auditindex:null,
            withdrawindex:null,
            filtertext:""
        }
    },
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    filterChange(event){
        this.setState({
            filtertext:event.target.value
        });
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
    auditButtonClick(index){
        var that = this;
        var inFunc = function(){
            that.state.auditindex = index;
            $("#auditmodal").modal("show");

        };
        return inFunc;
    },
    confirmAuditSurvey(){
        $("#auditmodal").modal("hide");
        SisDispatcher.dispatch({
            actionType: Constant.AUDITSURVEY,
            index:this.state.auditindex,
            role:this.props.loginInfo.role
        });
    },
    withdrawButtonClick(index){
        var that = this;
        var inFunc = function(){
            that.state.withdrawindex = index;
            $("#withdrawmodal").modal("show");

        };
        return inFunc;
    },
    confirmWithdrawSurvey(){
        $("#withdrawmodal").modal("hide");
        SisDispatcher.dispatch({
            actionType: Constant.WITHDRAWSURVEY,
            index:this.state.withdrawindex,
            role:this.props.loginInfo.role
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
    catChange(event){
        this.setState({
            catoption:event.target.value
        })
    },
    render(){
        var mlist = [];
        //var selist = this.props.surveyeditlist;
        var that = this;
        var selist = _.filter(that.props.surveyeditlist,function(item){
            if(that.state.catoption == "all"){
                return true;
            }
            else{
                return item.status == that.state.catoption;
            }
        });
        if(this.state.filtertext && this.state.filtertext.length>0){
            selist = _.filter(selist,function(item){
                return item.name.indexOf(that.state.filtertext)>=0
            });
        }

        for(var i in selist){
            var stext = Constant.SURVEYSTATUSMAP[selist[i].status];
            var trclass = "";
            if(selist[i].status == Constant.SURVEYSTATUS_PROPOSE){
                trclass = "danger";
            }
            else if(selist[i].status == Constant.SURVEYSTATUS_EDIT){
                trclass = "warning"
            }
            var pdate = "";
            if(selist[i].publishtime){
                pdate = new Date(selist[i].publishtime).toLocaleString();
            }
            var buttonGrp = [];

            if(selist[i].status != Constant.SURVEYSTATUS_NORMAL && selist[i].status != Constant.SURVEYSTATUS_PROPOSE){
                buttonGrp.push(<a
                    type="button"
                    onClick={this.deleteButtonClick(i)}
                    className="btn btn-danger">Delete</a>);
            }
            if(this.props.loginInfo.role == "sadmin" ||
                (selist[i].status != Constant.SURVEYSTATUS_NORMAL &&
                selist[i].status != Constant.SURVEYSTATUS_PROPOSE)){
                buttonGrp.push(<a
                    type="button"
                    onClick={this.editButtonClick(i)}
                    className="btn btn-primary">Edit</a>);
            }
            if(selist[i].status == Constant.SURVEYSTATUS_NORMAL){
                buttonGrp.push(<a
                    type="button"
                    onClick={this.shareItClick(i)}
                    className="btn btn-primary">Share it</a>);
                buttonGrp.push(<a
                    type="button"
                    onClick={this.stastic(i)}
                    className="btn btn-primary">Statistics</a>);
            }
            if(this.props.loginInfo.role == "sadmin" &&
                (selist[i].status == Constant.SURVEYSTATUS_PROPOSE)){
                buttonGrp.push(<a
                    type="button"
                    onClick={this.auditButtonClick(i)}
                    className="btn btn-primary">Audit</a>);
            }
            if(selist[i].status == Constant.SURVEYSTATUS_NORMAL || selist[i].status == Constant.SURVEYSTATUS_PROPOSE){
                buttonGrp.push(<a
                    type="button"
                    onClick={this.withdrawButtonClick(i)}
                    className="btn btn-primary">Withdraw</a>);
            }
            mlist.push(
                <tr key={"slist"+i} className={trclass}>
                    <td>{i}</td>
                    <td>{selist[i].name}</td>
                    <td>{new Date(selist[i].ctime).toLocaleString()}</td>
                    <td>{pdate}</td>
                    <td>{ stext }</td>
                    <td className="list_btn">
                        <div className="btn-group" role="group" >
                            {buttonGrp}
                        </div>
                    </td>

                </tr>
            );
        }


        var surveyCatValueSelect = [
            <option value="all">
                all
            </option>
        ];
        for(var ov in Constant.SURVEYSTATUSMAP){
            surveyCatValueSelect.push(<option value={ov}>
                {Constant.SURVEYSTATUSMAP[ov]}
            </option>)
        }

        return (
            <div >

                <div className="panel panel-default">
                    <div className="panel-heading">
                        <div className="row">
                            <div className="col-md-3">
                                <select className="form-control" value={this.state.catoption} onChange={this.catChange}>
                                    {surveyCatValueSelect}
                                </select>
                            </div>
                            <div className="col-md-3 col-md-offset-1">
                                <input type="text"
                                       className="form-control"
                                       value={this.state.filtertext}
                                       onChange={this.filterChange}
                                       placeholder="Search"/>
                            </div>
                        </div>
                    </div>
                    <div className="panel-body">
                        <table  className="table" >
                            <thead>
                            <tr>
                                <th><span className="">##</span></th>
                                <th><span className="">Survey Name</span></th>
                                <th><span className="">Time Created</span></th>
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

                <div className="modal fade" id="auditmodal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" >Confirm to audit</h4>
                            </div>
                            <div className="modal-body">
                                <h3>
                                    Are you sure to audit this survey to public?
                                </h3>




                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button"
                                   onClick={this.confirmAuditSurvey}
                                   className="btn btn-primary" >Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="withdrawmodal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" >Confirm to withdraw</h4>
                            </div>
                            <div className="modal-body">
                                <h3>
                                    Are you sure to withdraw this survey and others can not access this survey?
                                </h3>




                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button"
                                   onClick={this.confirmWithdrawSurvey}
                                   className="btn btn-primary" >Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }
})