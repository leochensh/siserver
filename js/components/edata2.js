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
        console.log(clist);
        if(clist && clist.length>0){
            for(var spi in clist){
                var stime = new Date(clist[spi].ctime).toLocaleString();
                spiderList.push(
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <div className="row">
                                <div className="col-md-3">
                                    {stime}
                                </div>
                            </div>
                        </div>
                        <div className="panel-body">
                            <div className="row">
                                <div className="col-md-3">
                                    Status:
                                </div>
                                <div className="col-md-3">
                                    {spiderMap[clist[spi].status]}
                                </div>
                            </div>

                        </div>

                    </div>
                )
            }
        }

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
            </div>
        )
    }
});
