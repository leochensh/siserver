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
            filtertext:"",
            currentpage:0,
            pagesize:10,
            templatename:"",
            templatefromid:null
           // newsurveyfromtemplatename:"",
           // surveyfromid:null
        }
    },
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    leftpageclick(){
        if(this.state.currentpage!=0){
            this.setState({
                currentpage:this.state.currentpage-1
            })
        }
    },
    rightpageclick(maxpn){
        var that = this;
        var infun = function(){
            if(that.state.currentpage!=maxpn-1){
                that.setState({
                    currentpage:that.state.currentpage+1
                })
            }
        };
        return infun;

    },
    pnumclick(num){
        var that = this;
        var infun = function(){
            if(that.state.currentpage!=num){
                that.setState({
                    currentpage:num
                })
            }
        };
        return infun;
    },
    filterChange(event){
        this.setState({
            filtertext:event.target.value,
            currentpage:0
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
                id:index
            });
            that.context.router.push("/newsurvey");
        };
        return inFunc;
    },
    shareItClick(index){
        var that = this;
        var inFunc = function(){
            that.setState({
                surveyurl:Constant.BASE_FULL+"quest/"+index
            });
            //that.context.router.push("/quest/"+that.props.surveyeditlist[index]._id);
            $("#sharemodal").modal("show");
        };
        return inFunc;

    },
    totemButtonClick(sid){
        var that = this;
        var inFunc = function(){
            var slist = that.props.surveyeditlist;
            var survey = _.find(slist,function(item){
                return item._id == sid;
            });

            if(survey){
                that.setState({
                    templatename:survey.name,
                    templatefromid:sid
                });
                $("#createtemplate").modal("show");
            }
        };
        return inFunc;



    },
    /*
    generateSurveyButtonClick(sid){
        var that = this;
        var inFunc = function(){
            var slist = that.props.surveyeditlist;
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
    */
    templatenamechange(event){
        this.setState({
            templatename:event.target.value
        });
    },
    /*
    surveynamefromtempchange(event){
        this.setState({
            newsurveyfromtemplatename:event.target.value
        });
    },
    */
    confirmtemplatefromsurvey(){
        if(this.state.templatename && this.state.templatefromid){
            $("#createtemplate").modal("hide");
            SisDispatcher.dispatch({
                actionType: Constant.SURVEYTOTEMPLATE,
                surveyid:this.state.templatefromid,
                templatename:this.state.templatename,
                role:this.props.loginInfo.role
            });
        }
    },
    /*
    confirmsurveyfromtemplate(){
        if(this.state.newsurveyfromtemplatename && this.state.surveyfromid){
            $("#createsurveyfromtemplate").modal("hide");
            SisDispatcher.dispatch({
                actionType: Constant.TEMPLATETOSURVEY,
                surveyid:this.state.surveyfromid,
                surveyname:this.state.newsurveyfromtemplatename,
                role:this.props.loginInfo.role
            });
        }
    },
    */
    stastic(index){
        var that = this;
        var inFunc = function(){
            that.context.router.push("/stastic/"+index);
        };
        return inFunc;
    },
    catChange(event){
        this.setState({
            catoption:event.target.value,
            currentpage:0
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
                return item.name.indexOf(that.state.filtertext)>=0 ||
                    (item.editorname && item.editorname.indexOf(that.state.filtertext)>=0)
            });
        }

        var startPos = this.state.currentpage*this.state.pagesize;
        var stopPos = Math.min(startPos+this.state.pagesize,selist.length);

        var maxPageNum = Math.ceil(selist.length/this.state.pagesize);

        selist = selist.slice(startPos,stopPos);

        var leftButtonClass = "";
        if(this.state.currentpage == 0){
            leftButtonClass = "disabled";
        }

        var rightButtonClass = "";
        if(this.state.currentpage == maxPageNum-1){
            rightButtonClass = "disabled";
        }

        var pageButtonGrp = [];
        pageButtonGrp.push(<li className={leftButtonClass}>
            <a aria-label="Previous" onClick={this.leftpageclick}>
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>);

        for(var pn = 0;pn<=maxPageNum-1;pn++){
            var currentPageButtonCls = "";
            if(this.state.currentpage == pn){
                currentPageButtonCls = "active";
            }
            pageButtonGrp.push(<li className={currentPageButtonCls}>
                <a onClick={this.pnumclick(pn)}>
                    {parseInt(pn)+1}

                </a>
            </li>);

        }

        pageButtonGrp.push(<li className={rightButtonClass}>
            <a aria-label="Next" onClick={this.rightpageclick(maxPageNum)}>
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>);


        for(var i in selist){
            var stext = Constant.SURVEYSTATUSMAP[selist[i].status];
            if(stext == "Published"){
                if(selist[i].publishstatus){
                    if(selist[i].publishstatus == Constant.SURVEYPUBLISHSTATUS_PRIVATEPERSONAL ||
                        selist[i].publishstatus == Constant.SURVEYPUBLISHSTATUS_PRIVATEORG){
                        stext = "Private Published";
                    }
                    else if(selist[i].publishstatus == Constant.SURVEYPUBLISHSTATUS_PUBLICORG ||
                        selist[i].publishstatus == Constant.SURVEYPUBLISHSTATUS_PUBLICPERSONAL){
                        stext = "Public Published";
                    }
                }
            }
            var trclass = "";
            if(selist[i].status == Constant.SURVEYSTATUS_PROPOSE){
                trclass = "danger";
            }
            else if(selist[i].status == Constant.SURVEYSTATUS_EDIT){
                trclass = "warning"
            }
            else if(selist[i].type == Constant.TYPE_TEMPLATE){
                trclass = "info";
            }
            var pdate = "";
            if(selist[i].publishtime){
                pdate = new Date(selist[i].publishtime).toLocaleString();
            }


            var buttonGrp = [];

            if(selist[i].type!=Constant.TYPE_TEMPLATE){
                if(selist[i].status != Constant.SURVEYSTATUS_NORMAL && selist[i].status != Constant.SURVEYSTATUS_PROPOSE){
                    buttonGrp.push(<a
                        type="button"
                        onClick={this.deleteButtonClick(selist[i]._id)}
                        className="btn btn-danger">Delete</a>);
                }
                if(this.props.loginInfo.role == "sadmin" || this.props.loginInfo.role == "admin" ||
                    (selist[i].status != Constant.SURVEYSTATUS_NORMAL &&
                    selist[i].status != Constant.SURVEYSTATUS_PROPOSE)){
                    buttonGrp.push(<a
                        type="button"
                        onClick={this.editButtonClick(selist[i]._id)}
                        className="btn btn-primary">Edit</a>);
                }
                if(selist[i].status == Constant.SURVEYSTATUS_NORMAL){
                    buttonGrp.push(<a
                        type="button"
                        onClick={this.shareItClick(selist[i]._id)}
                        className="btn btn-primary">Share it</a>);

                }
                if((this.props.loginInfo.role == "sadmin" ||  this.props.loginInfo.role == "admin") &&
                    (selist[i].status == Constant.SURVEYSTATUS_PROPOSE)){
                    buttonGrp.push(<a
                        type="button"
                        onClick={this.auditButtonClick(selist[i]._id)}
                        className="btn btn-primary">Audit</a>);
                }
                if(selist[i].status == Constant.SURVEYSTATUS_NORMAL || selist[i].status == Constant.SURVEYSTATUS_PROPOSE){
                    buttonGrp.push(<a
                        type="button"
                        onClick={this.withdrawButtonClick(selist[i]._id)}
                        className="btn btn-primary">Withdraw</a>);
                }

                if((this.props.loginInfo.role == "sadmin" ||  this.props.loginInfo.role == "admin") &&
                    (selist[i].status == Constant.SURVEYSTATUS_NORMAL)){
                    buttonGrp.push(<a
                        type="button"
                        onClick={this.totemButtonClick(selist[i]._id)}
                        className="btn btn-primary">Generate template</a>);
                }

                buttonGrp.push(<a
                    type="button"
                    onClick={this.stastic(selist[i]._id)}
                    className="btn btn-primary">Statistics</a>);
            }
            else{
                /*
                if(this.props.loginInfo.role == "sadmin"){
                    buttonGrp.push(<a
                        type="button"
                        onClick={this.editButtonClick(selist[i]._id)}
                        className="btn btn-primary">Edit</a>);
                    buttonGrp.push(<a
                        type="button"
                        onClick={this.deleteButtonClick(selist[i]._id)}
                        className="btn btn-danger">Delete</a>);
                }
                else{
                    buttonGrp.push(<a
                        type="button"
                        onClick={this.generateSurveyButtonClick(selist[i]._id)}
                        className="btn btn-primary">Generate survey</a>);
                }
                */
            }




            mlist.push(
                <tr key={"slist"+i} className={trclass}>
                    <td>{parseInt(startPos)+parseInt(i)+1}</td>
                    <td>{selist[i].name}</td>
                    <td>{selist[i].type==Constant.TYPE_SURVEY?"survey":"template"}</td>
                    <td>{selist[i].editorname?selist[i].editorname:""}</td>
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
                                <th><span className="">Type</span></th>
                                <th><span className="">Editor</span></th>
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
                    <div className="panel-footer">
                        <nav aria-label="Page navigation">
                            <ul className="pagination">
                                {pageButtonGrp}
                            </ul>
                        </nav>

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

                <div className="modal fade" id="createtemplate" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" >Generate template from survey</h4>
                            </div>
                            <div className="modal-body">
                                <h3>
                                    This operation will create a new template.Please input template's name.
                                </h3>
                                <form>
                                    <div className="form-group">
                                        <label htmlFor="surveynewform">Template Name</label>
                                        <input type="text"
                                               className="form-control"

                                               placeholder=""
                                               value={this.state.templatename}
                                               onChange={this.templatenamechange}
                                        />
                                    </div>
                                </form>



                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button" className="btn btn-primary" onClick={this.confirmtemplatefromsurvey}>Confirm</a>
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
})