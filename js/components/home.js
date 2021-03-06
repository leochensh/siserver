import React from 'react';
import {SisDispatcher} from "../dispatcher";
import {Constant} from "../constant";

export var Home = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    personClick(event){
        this.context.router.push("/personal");
    },
    newsurvey(event){
        SisDispatcher.dispatch({
            actionType: Constant.CLEANSURVEYDATA
        });
        this.context.router.push("/newsurvey");
    },
    surveymanage(event){
        this.context.router.push("/surveylist")
    },

    adsclick(event){
        this.context.router.push("/ads")
    },
    orgclick(event){
        this.context.router.push("/org");
    },
    settingClick(){
        this.context.router.push("/settings");
    },
    edataclick(){
        this.context.router.push("/edata2");
    },
    feedbacklick(event){
        this.context.router.push("/feedback")
    },
    templateclick(){
        this.context.router.push("/template")
    },
    render() {
        var style = {
            marginTop:"30px"
        };
        //alert(JSON.stringify(this.props.loginInfo))
        var loginInfo = this.props.loginInfo;
        var orgDisable = "disabled";
        var personalDisable = "disabled";
        var newsurveyDisable = "disabled";
        var surveyManageDisable = "disabled";
        var adsDisable = "disabled";
        var settingsDisable = "disabled";
        var edataDisable = "disabled";
        var feedbackDisable = "disabled";

        if(loginInfo.role == "sadmin"){
            orgDisable = "";
            personalDisable = "";
            adsDisable = "";
            settingsDisable = "";
            edataDisable = "";
            surveyManageDisable = "";
            feedbackDisable = "";
        }
        else if(loginInfo.role == "admin"){
            personalDisable = "";
            newsurveyDisable = "";
            surveyManageDisable = "";
        }
        else if(loginInfo.role == "personal"){
            newsurveyDisable = "";
            surveyManageDisable = "";
        }
        else if(loginInfo.role == "orgstaff"){
            newsurveyDisable = "";
            surveyManageDisable = "";
        }

        return (
            <div>
                <div className="row" style={style}>

                    <button className="col-md-3 col-md-offset-3 btn btn-default"
                        disabled={orgDisable}
                        onClick={this.orgclick}
                    >

                        <div className="fixed-size-square">
                            <div>
                            <span className="glyphicon glyphicon-home" aria-hidden="true">
                            </span>
                            </div>
                            <div>
                                <span>Organizations</span>
                            </div>
                        </div>
                    </button>

                    <button className="col-md-3 btn btn-default"
                        disabled={personalDisable}
                        onClick={this.personClick}
                        >

                        <div className="fixed-size-square">
                            <div>
                            <span className="glyphicon glyphicon-user" aria-hidden="true">
                            </span>
                            </div>
                            <div>
                                <span>Staffs</span>
                            </div>
                        </div>
                    </button>

                </div>
                <div className="row">
                    <button className="col-md-3 col-md-offset-3 btn btn-default"
                    disabled={newsurveyDisable} onClick={this.newsurvey}>

                        <div className="fixed-size-square">
                            <div>
                            <span className="glyphicon glyphicon-pencil" aria-hidden="true">
                            </span>
                            </div>
                            <div>
                                <span>Create Survey</span>
                            </div>
                        </div>
                    </button>
                    <button className="col-md-3 btn btn-default"
                    disabled={surveyManageDisable} onClick={this.surveymanage}>

                        <div className="fixed-size-square">
                            <div>
                            <span className="glyphicon glyphicon-list-alt" aria-hidden="true">
                            </span>
                            </div>
                            <div>
                                <span>Surveys</span>
                            </div>
                        </div>
                    </button>

                </div>

                <div className="row">
                    <button className="col-md-3 col-md-offset-3 btn btn-default"
                            disabled={adsDisable} onClick={this.adsclick}>

                        <div className="fixed-size-square">
                            <div>
                            <span className="glyphicon glyphicon-picture" aria-hidden="true">
                            </span>
                            </div>
                            <div>
                                <span>{"Ads&Client"}</span>
                            </div>
                        </div>
                    </button>

                    <button className="col-md-3 btn btn-default"
                            disabled={settingsDisable} onClick={this.settingClick}>

                        <div className="fixed-size-square">
                            <div>
                            <span className="glyphicon glyphicon-cog" aria-hidden="true">
                            </span>
                            </div>
                            <div>
                                <span>Settings</span>
                            </div>
                        </div>
                    </button>

                </div>
                <div className="row">
                    <button className="col-md-3 col-md-offset-3 btn btn-default"
                            disabled={edataDisable} onClick={this.edataclick}>

                        <div className="fixed-size-square">
                            <div>
                            <span className="glyphicon glyphicon-signal" aria-hidden="true">
                            </span>
                            </div>
                            <div>
                                <span>{"Edata"}</span>
                            </div>
                        </div>
                    </button>

                    <button className="col-md-3 btn btn-default"
                            disabled={feedbackDisable} onClick={this.feedbacklick}>

                        <div className="fixed-size-square">
                            <div>
                            <span className="glyphicon glyphicon-list-alt" aria-hidden="true">
                            </span>
                            </div>
                            <div>
                                <span>View Feedback</span>
                            </div>
                        </div>
                    </button>
                </div>
                <div className="row">
                    <button className="col-md-3 col-md-offset-3 btn btn-default"
                            onClick={this.templateclick}>

                        <div className="fixed-size-square">
                            <div>
                            <span className="glyphicon glyphicon-list-alt" aria-hidden="true">
                            </span>
                            </div>
                            <div>
                                <span>{"Survey Templates"}</span>
                            </div>
                        </div>
                    </button>
                </div>

            </div>
        )
    }
});
