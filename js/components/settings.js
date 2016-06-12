import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
var Dropzone = require('react-dropzone');

export var Settings = React.createClass({
    getInitialState(){
        return{
            visitCount:0,
            downloadCount:0
        }
    },
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    handleChange(name,event){
        var newstate = {};
        newstate[name] = event.target.value;
        this.setState(newstate);
    },

    componentDidMount (){
        this.getAdList();
        this.getVersionList();
    },

    getAdList(){
        $("#ajaxloading").show();
        var that = this;
        $.ajax({
            url: Constant.BASE_URL+"sadmin/visit/count",

            type: 'GET',
            success: function (data) {
                //alert(data);
                $("#ajaxloading").hide();
                var msg = JSON.parse(data).body;
                that.setState({
                    visitCount:msg
                })
            },
            error:function(){
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
    },
    getVersionList(){
        $("#ajaxloading").show();
        var that = this;
        $.ajax({
            url: Constant.BASE_URL+"sadmin/downloadapk/count",

            type: 'GET',
            success: function (data) {
                //alert(data);
                $("#ajaxloading").hide();
                var msg = JSON.parse(data).body;
                that.setState({
                    downloadCount:msg
                })
            },
            error:function(){
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
    },
    render(){

        return(
            <div>
                <ul className="nav nav-tabs" role="tablist">
                    <li role="presentation" className="active"><a href="#ads" aria-controls="ads" role="tab" data-toggle="tab">Visit Counter</a></li>
                </ul>

                <div className="tab-content">
                    <div role="tabpanel" className="tab-pane active" id="ads">
                        <div className="panel panel-default paddingpanel">


                            <table  className="table" >
                                <thead>
                                <tr>

                                    <th><span className="">Item</span></th>
                                    <th><span className="">Count</span></th>

                                </tr>
                                </thead>
                                <tbody>

                                    <tr>
                                        <td>
                                            First page visit
                                        </td>
                                        <td>
                                            {this.state.visitCount}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Apk file download
                                        </td>
                                        <td>
                                            {this.state.downloadCount}
                                        </td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>


            </div>
        )
    }
});