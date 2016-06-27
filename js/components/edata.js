import React from 'react';
//import $ from "jquery"
import crypto from "crypto"
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import _ from "underscore";

var stasticItems = ["Models Number","Average Price","Average Rate","Popular Index"];
var canvasid = "mycanvas";

export var Edata = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    getInitialState(){
        return{
            brandList:[],
            brandCheckList:[],
            stasticItemIndex:0
        }
    },
    handleChange(name,event){
        var newstate = {};
        newstate[name] = event.target.value;
        newstate.iferror = false;
        this.setState(newstate);
    },
    brandCheck(bindex){
        var that = this;
        var ifunc = function(event){
            var ifchecked = event.target.checked;
            var cindex = _.indexOf(that.state.brandCheckList,bindex);
            if(ifchecked){

                if(cindex<0){
                    that.state.brandCheckList.push(bindex);
                }
            }
            else{
                if(cindex>=0){
                    that.state.brandCheckList.splice(cindex,1);
                }
            }
            that.setState({
                brandCheckList:that.state.brandCheckList
            });
            setTimeout(function(){
                that.cleaCanvas();
                that.redrawcanvas();
            },300);
        };
        return ifunc;
    },
    stasticchange(event){
        this.setState({
            stasticItemIndex:event.target.value
        });
        var that = this;
        setTimeout(function(){
            that.cleaCanvas();
            that.redrawcanvas();
        },300);
    },
    getSingleBrandModelNum(bi){
        var brand = this.state.brandList[bi];
        var count = 0;
        for(var mindex in brand.modelList){
            count+=1;
        }
        return count;
    },
    getSingleBrandaprice(bi){
        var brand = this.state.brandList[bi];
        var count = 0;
        for(var mindex in brand.modelList){
            count+=brand.modelList[mindex].aprice;
        }
        if(brand.modelList.length>0){
            return Math.floor(count/brand.modelList.length);
        }
        else{
            return 0;
        }

    },
    getSingleBrandapindex(bi){
        var brand = this.state.brandList[bi];
        var count = 0;
        for(var mindex in brand.modelList){
            count+=brand.modelList[mindex].rate;
        }
        if(brand.modelList.length>0){
            return Math.floor(count/brand.modelList.length);
        }
        else{
            return 0;
        }

    },
    getSingleBrandarate(bi){
        var brand = this.state.brandList[bi];
        var count = 0;
        for(var mindex in brand.modelList){
            count+=brand.modelList[mindex].arate;
        }
        if(brand.modelList.length>0){
            return Math.floor(count/brand.modelList.length);
        }
        else{
            return 0;
        }
    },
    redrawcanvas(){
        var data = [];
        var labels = [];
        if(this.state.stasticItemIndex == 0){
            for(var dindex in this.state.brandCheckList){
                var d = this.getSingleBrandModelNum(this.state.brandCheckList[dindex]);
                data.push(d);
                labels.push(this.state.brandList[this.state.brandCheckList[dindex]].brand)
            }
        }
        else if(this.state.stasticItemIndex == 1){
            for(var dindex in this.state.brandCheckList){
                var d = this.getSingleBrandaprice(this.state.brandCheckList[dindex]);
                data.push(d);
                labels.push(this.state.brandList[this.state.brandCheckList[dindex]].brand)
            }
        }
        else if(this.state.stasticItemIndex == 2){
            for(var dindex in this.state.brandCheckList){
                var d = this.getSingleBrandarate(this.state.brandCheckList[dindex]);
                data.push(d);
                labels.push(this.state.brandList[this.state.brandCheckList[dindex]].brand)
            }
        }
        else if(this.state.stasticItemIndex == 3){
            for(var dindex in this.state.brandCheckList){
                var d = this.getSingleBrandapindex(this.state.brandCheckList[dindex]);
                data.push(d);
                labels.push(this.state.brandList[this.state.brandCheckList[dindex]].brand)
            }
        }
        new RGraph.Bar({
            id: canvasid,
            data:data,
            options: {
                labels: labels,
                shadow: false,
                gutterLeft:85,
                colors: ['red'],
                strokestyle: 'rgba(0,0,0,0)'
            }
        }).draw();
    },
    cleaCanvas(){
        var canvas  = document.getElementById(canvasid);
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width,canvas.height);
    },
    componentDidMount(){
        $("#ajaxloading").show();
        var that = this;
        $.ajax({
            url: Constant.BASE_URL + "sadmin/edata/flipkart",
            type: 'GET',
            success: function (data) {
                $("#ajaxloading").hide();
                var msg = JSON.parse(data).body;
                that.setState({
                    brandList:msg
                })
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
    },
    render() {
        var brandNum = this.state.brandList.length;
        var mnum = 0;
        for(var bindex in this.state.brandList){
            var cb = this.state.brandList[bindex];
            for(var mindex in cb.modelList){
                mnum+=1;
            }
        }
        var bchecklist = [];

        var gcnum = 4;
        var checkGroupNum = Math.ceil(brandNum/gcnum);

        var widthclassname = "col-md-"+parseInt(12/gcnum);

        var stasticItemOptions = [];
        for(var oindex in stasticItems){
            var csi = stasticItems[oindex];
            stasticItemOptions.push(
                <option value={oindex}>
                    {csi}
                </option>
            )
        }

        for(var gitem=0;gitem<checkGroupNum;gitem++){
            var sglist = [];
            for(var sgitem=0;sgitem<gcnum;sgitem++){
                if(gitem*gcnum+sgitem<brandNum){
                    sglist.push(
                        <div className={"checkbox "+widthclassname}>
                            <label>
                                <input
                                    checked={_.indexOf(this.state.brandCheckList,(gitem*gcnum+sgitem))>=0}
                                    onChange={this.brandCheck(gitem*gcnum+sgitem)}
                                    type="checkbox" value=""/>
                                {this.state.brandList[gitem*gcnum+sgitem].brand}
                            </label>
                        </div>
                    )
                }
            }
            bchecklist.push(
                <div className="row">
                    {sglist}
                </div>
            )
        }
        return (
            <div id="wrapper">
                <div id="sidebar-wrapper">

                    <ul className="sidebar-nav">

                        <li className="sidebar-brand">
                            <a >
                                Data Source
                            </a>
                        </li>
                        <li >
                            <a className="active">
                                Flipkart
                            </a>
                        </li>


                    </ul>


                </div>

                <div id="page-content-wrapper">
                    <div className="container-fluid">
                        <div className="row">


                            <div id="scrollright" className="col-md-12">
                                <div className="panel panel-default">
                                    <div className="panel-heading">
                                        <div className="row">
                                            <div className="col-md-3">
                                                General Info
                                            </div>
                                        </div>
                                    </div>
                                    <div className="panel-body">
                                        <table  className="table" >
                                            <thead>
                                            <tr>
                                                <th><span className="">##</span></th>
                                                <th><span className="">Info Item</span></th>
                                                <th><span className="">Value</span></th>
                                            </tr>
                                            </thead>
                                            <tbody>

                                            <tr>
                                                <td>1</td>
                                                <td>Brands Number</td>
                                                <td>{brandNum}</td>
                                            </tr>
                                            <tr>
                                                <td>2</td>
                                                <td>Models Number</td>
                                                <td>{mnum}</td>
                                            </tr>

                                            </tbody>
                                        </table>
                                    </div>

                                </div>

                                <div className="panel panel-default">
                                    <div className="panel-heading">
                                        <div className="row">
                                            <div className="col-md-3">
                                                Stastic
                                            </div>
                                        </div>
                                    </div>
                                    <div className="panel-body">
                                        <form className="form-horizontal">
                                            <div className="form-group">
                                                <label className="col-sm-2 control-label">Brands</label>
                                                <div className="col-sm-10">
                                                    {bchecklist}
                                                </div>
                                            </div>

                                        </form>
                                        <form className="form-horizontal">
                                            <div className="form-group">
                                                <label className="col-sm-2 control-label">Stastic Items</label>
                                                <div className="col-sm-10">
                                                    <select
                                                        onChange={this.stasticchange}
                                                        value={this.state.stasticItemIndex}
                                                        className="form-control">
                                                        {stasticItemOptions}
                                                    </select>
                                                </div>
                                            </div>

                                        </form>

                                        <canvas id={canvasid} width="800" height="400" style={{marginLeft:"50px"}}>
                                            [No canvas support]
                                        </canvas>
                                    </div>



                                </div>
                            </div>
                        </div>
                    </div>
                </div>







            </div>
        )
    }
});
