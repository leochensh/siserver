import React from 'react';
//import $ from "jquery"
import crypto from "crypto"
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import _ from "underscore";

var stasticItems = ["Models Number","Average Price","Average Rate","Popular Index"];
var canvasid = "mycanvas";

var spiderMap = {
    "spiderstatuactive":"progressing",
    "spiderstatudone":"done"
}

export var Edata2 = React.createClass({
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
    targetclick(index){
        var that = this;
        var infunc = function(event){
            SisDispatcher.dispatch({
                actionType: Constant.TARGETCLICK,
                index:index
            });
        }
        return infunc;
    },
    createspider(){
        SisDispatcher.dispatch({
            actionType: Constant.CREATESPIDER
        });
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
        SisDispatcher.dispatch({
            actionType: Constant.GETSPIDERLIST
        });
    },
    exportClick(index){
        var that = this;
        var infunc = function(){
            var spi = that.props.edata.spiderlist[that.props.edata.currentIndex][index];
            if(spi.status == Constant.SPIDERSTATU_DONE){
                SisDispatcher.dispatch({
                    actionType: Constant.EXPORTSPIDERDATA,
                    index:index
                });
            }
            
        };
        return infunc;
    },
    statisticClick(index){
        var that = this;
        var infunc = function(){
            var spi = that.props.edata.spiderlist[that.props.edata.currentIndex][index];
            if(spi.status == Constant.SPIDERSTATU_DONE){
                SisDispatcher.dispatch({
                    actionType: Constant.SHOWSPIDERSTATISTIC,
                    index:index
                });

                $("#spiderstatistic").modal("show");
            }

        };
        return infunc;
    },
    deleteClick(index){
        var that = this;
        var infunc = function(){
            var spi = that.props.edata.spiderlist[that.props.edata.currentIndex][index];
            if(spi.status == Constant.SPIDERSTATU_DONE){
                that.state.deleteSpiderId = index;
                $("#deletespidermodal").modal("show");
            }
        };
        return infunc;

    },
    gotoDeleteSpider(){
        $("#deletespidermodal").modal("hide");
        SisDispatcher.dispatch({
            actionType: Constant.DELETESPIDER,
            index:this.state.deleteSpiderId
        });
    },
    cleaCanvas(){
        var canvas  = document.getElementById("barcanvas");
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width,canvas.height);
    },
    stasticchange(event){
        SisDispatcher.dispatch({
            actionType: Constant.SPIDERSTASTICCHANGE,
            value:event.target.value
        });
    },
    render() {
        var targeList = [];
        for(var ti in this.props.edata.targetList){
            if(ti == this.props.edata.currentIndex){
                targeList.push(
                    <a
                        onClick={this.targetclick(ti)}
                        className="active">
                        {this.props.edata.targetList[ti]}
                    </a>
                );
            }
            else{
                targeList.push(
                    <a
                        onClick={this.targetclick(ti)}
                    >
                        {this.props.edata.targetList[ti]}
                    </a>
                );
            }
        }


        var spiderList = [];

        var clist = this.props.edata.spiderlist[this.props.edata.currentIndex];
        if(clist && clist.length>0){
            for(var spi in clist){
                var stime = new Date(clist[spi].ctime).toLocaleString();
                var displayClass = " alert alert-info";
                if(clist[spi].status == Constant.SPIDERSTATU_ACTIVE){
                    displayClass = " alert alert-danger";
                }
                var bdisabled = "";
                if(clist[spi].status == Constant.SPIDERSTATU_ACTIVE){
                    bdisabled = "disabled";
                }
                var downLink = "";
                if(clist[spi].downlink){
                    downLink = <a href={Constant.BASE_IMAGEURL+clist[spi].downlink}>
                        Download
                    </a>
                }

                spiderList.push(
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <div className="row">
                                <div className="col-md-2">
                                    {stime}
                                </div>
                                <div className="col-md-5 col-md-offset-3">
                                    <div className="btn-group" role="group">
                                        <a className="btn btn-info"
                                           onClick={this.statisticClick(spi)}
                                           disabled={bdisabled}
                                           role="button">View Statistic</a>
                                        <a className="btn btn-danger"
                                           onClick={this.deleteClick(spi)}
                                           disabled={bdisabled}
                                           role="button">Delete</a>
                                        <a className="btn btn-default"
                                           onClick={this.exportClick(spi)}
                                           disabled={bdisabled}
                                           role="button">Export</a>
                                    </div>

                                </div>
                                <div className="col-md-2">
                                    {downLink}
                                </div>
                            </div>
                        </div>
                        <div className="panel-body">
                            <div className="row">
                                <div className="col-md-3">
                                    Status:
                                </div>
                                <div className={"col-md-3"+displayClass}>
                                    {spiderMap[clist[spi].status]}
                                </div>

                                <div className="col-md-2">



                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-3">
                                    Start time:
                                </div>
                                <div className="col-md-3 alert alert-info">
                                    {new Date(clist[spi].ctime).toLocaleString()}
                                </div>

                                <div className="col-md-3">
                                    End time:
                                </div>
                                <div className="col-md-3 alert alert-info">
                                    {clist[spi].endtime?new Date(clist[spi].endtime).toLocaleString():""}
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-3">
                                    Brand Number:
                                </div>
                                <div className="col-md-3 alert alert-info">
                                    {clist[spi].brandcount}
                                </div>

                                <div className="col-md-3">
                                    Model Number:
                                </div>
                                <div className="col-md-3 alert alert-info">
                                    {clist[spi].modelcount}
                                </div>
                            </div>

                        </div>

                    </div>
                )
            }
        }

        var spiderstatisticoptions = [];
        for(var oi in Constant.SPIDERSTASTICMAP){
            var optgrouplist = [];
            for (var suboi in Constant.SPIDERSTASTICMAP[oi]){
                optgrouplist.push(
                    <option value={oi+"|"+suboi}>
                        {Constant.SPIDERSTASTICMAP[oi][suboi].name}
                    </option>
                )
            }
            spiderstatisticoptions.push(
                <optgroup label={oi}>
                    {optgrouplist}
                </optgroup>
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
                            {targeList}
                        </li>


                    </ul>


                </div>

                <div id="page-content-wrapper">
                    <div className="container-fluid">
                        <div className="row">

                            <div className="panel panel-default">
                                <div className="panel-body">
                                    <a
                                        onClick={this.createspider}
                                        className="btn btn-primary btn-lg active">Create new spider</a>
                                </div>
                            </div>


                            <div id="scrollright" className="col-md-12">
                                {spiderList}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="spiderstatistic" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" id="myModalLabel">Statistic</h4>
                            </div>
                            <div className="modal-body">
                                <select
                                    value={this.props.edata.currentstatistic}
                                    onChange={this.stasticchange}
                                    className="form-control">
                                    {spiderstatisticoptions}
                                </select>

                                <canvas id="barcanvas" width="850px" height="750px" >
                                    [No canvas support]
                                </canvas>

                            </div>

                        </div>
                    </div>
                </div>

                <div id="deletespidermodal" className="modal fade" tabindex="-1" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">Delete Spider</h4>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure to delete this spider and all reated data?</p>
                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button"
                                   onClick={this.gotoDeleteSpider}
                                   className="btn btn-primary">Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }
});
