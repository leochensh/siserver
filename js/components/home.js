import React from 'react';

export var Home = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    personClick(event){
        this.context.router.push("/personal");
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

        if(loginInfo.role == "sadmin"){
            orgDisable = "";
            personalDisable = "";
        }
        return (
            <div>
                <div className="row" style={style}>

                    <button className="col-md-3 col-md-offset-3 btn btn-default"
                        disabled={orgDisable}>

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
                                <span>Personal Users</span>
                            </div>
                        </div>
                    </button>

                </div>
                <div className="row">
                    <button className="col-md-3 col-md-offset-3 btn btn-default"
                    disabled={newsurveyDisable}>

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
                    disabled={surveyManageDisable}>

                        <div className="fixed-size-square">
                            <div>
                            <span className="glyphicon glyphicon-list-alt" aria-hidden="true">
                            </span>
                            </div>
                            <div>
                                <span>Surveys Management</span>
                            </div>
                        </div>
                    </button>

                </div>

            </div>
        )
    }
});
