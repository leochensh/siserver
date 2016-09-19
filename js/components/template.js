/**
 * Created by 张志良 on 2016/9/14.
 */
import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import _ from "underscore"
import crypto from "crypto"


export var Template = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    componentDidMount(){
        this.getTemplateList();
    },
    getInitialState(){
        return{
            deleteindex:null,
            newsurveyfromtemplatename:null,
            surveyfromid:null,

        }
    },
    getTemplateList(){
        SisDispatcher.dispatch({
            actionType: Constant.GETTEMPLATELIST,
        });
    },
    editButtonClick(index){
        var that = this;
        var inFunc = function(){
            SisDispatcher.dispatch({
                actionType: Constant.EDITSURVEY,
                id:index
            });
            that.context.router.push("/newsurvey");
        };
        return inFunc;
    },
    deleteButtonClick(index){
        var that = this;
        var inFunc = function(){
            that.state.deleteindex = index;
            $("#deletetemplate").modal("show");

        };
        return inFunc;
    },
    confirmDeleteTemplate(){
        $("#deletetemplate").modal("hide");
        SisDispatcher.dispatch({
            actionType: Constant.DELETETEMPLATE,
            index:this.state.deleteindex
        });
    },
    generateSurveyButtonClick(sid){
        var that = this;
        var inFunc = function(){
            var slist = that.props.templateList;
            var survey = _.find(slist,function(item){
                return item._id == sid;
            });

            if(survey){
                that.setState({
                    newsurveyfromtemplatename:survey.name,
                    surveyfromid:sid
                });
                $("#createsurveyfromtemplate").modal("show");
            }
        };
        return inFunc;
    },
    surveynamefromtempchange(event){
        this.setState({
            newsurveyfromtemplatename:event.target.value
        });
    },
    confirmsurveyfromtemplate(){
        if(this.state.newsurveyfromtemplatename && this.state.surveyfromid){
            $("#createsurveyfromtemplate").modal("hide");
            var that = this;

            $("#ajaxloading").show();
            $.ajax({
                url: Constant.BASE_URL+"admin/survey/fromtemplate",
                data: $.param({
                    surveyid:that.state.surveyfromid,
                    surveyname:that.state.newsurveyfromtemplatename
                }),
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data);
                    SisDispatcher.dispatch({
                        actionType: Constant.EDITSURVEY,
                        id:msg.body
                    });
                    that.context.router.push("/newsurvey");
                },
                error:function(jxr,scode){
                    $("#ajaxloading").hide();
                },
                statusCode:{
                    406:function(){

                    },
                    500:function(){
                        SisDispatcher.dispatch({
                            actionType: Constant.ERROR500
                        });
                    },
                    409:function(){

                    }
                }
            });
        }
    },
    render() {
        var loginInfo = this.props.loginInfo;
        if(loginInfo.role == null)
        {
            this.context.router.push("/login");
        }

        var mlist = [];
        for(var i in this.props.templateList){
            var Fli = this.props.templateList[i];

            var buttonGrp = [];
            if(loginInfo.role == "sadmin"){
                buttonGrp.push(<a
                    type="button"
                    onClick={this.editButtonClick(Fli._id)}
                    className="btn btn-primary">Edit</a>);
                buttonGrp.push(<a
                    type="button"
                    onClick={this.deleteButtonClick(Fli._id)}
                    className="btn btn-danger">Delete</a>);
            }
            else{
                buttonGrp.push(<a
                    type="button"
                    onClick={this.generateSurveyButtonClick(Fli._id)}
                    className="btn btn-primary">Generate survey</a>);
            }

            mlist.push(
                <tr>
                    <td>{parseInt(i)+1}</td>
                    <td>{Fli.name}</td>
                    <td>{Fli.type}</td>
                    <td>{new Date(Fli.ctime).toLocaleString()}</td>
                    <td className="list_btn">
                        <div className="btn-group" role="group" >
                            {buttonGrp}
                        </div>

                    </td>

                </tr>
            );
        }

        return (
            <div>
                <div className="panel panel-default">
                    <div className="panel-heading">
                    </div>
                    <div className="panel-body">
                        <table  className="table" >
                            <thead>
                            <tr>
                                <th><span className="">##</span></th>
                                <th><span className="">Survey Name</span></th>
                                <th><span className="">Type</span></th>
                                <th><span className="">Time Created</span></th>
                                <th><span className="">Operations</span></th>
                            </tr>
                            </thead>
                            <tbody>

                            {mlist}
                            </tbody>
                        </table>
                    </div>

                </div>
                <div className="modal fade" id="deletetemplate" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" >Confirm to delete</h4>
                            </div>
                            <div className="modal-body">
                                <h3>
                                    Are you sure to delete this template?
                                </h3>

                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button"
                                   onClick={this.confirmDeleteTemplate}
                                   className="btn btn-primary" >Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal fade" id="createsurveyfromtemplate" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" >Generate survey from template</h4>
                            </div>
                            <div className="modal-body">
                                <h3>
                                    This operation will create a new survey.Please input survey's name.
                                </h3>
                                <form>
                                    <div className="form-group">
                                        <label htmlFor="surveynewform">Survey Name</label>
                                        <input type="text"
                                               className="form-control"

                                               placeholder=""
                                               value={this.state.newsurveyfromtemplatename}
                                               onChange={this.surveynamefromtempchange}
                                            />
                                    </div>
                                </form>



                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button" className="btn btn-primary" onClick={this.confirmsurveyfromtemplate}>Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});