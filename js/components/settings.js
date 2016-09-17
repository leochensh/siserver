import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import _ from "underscore"
import crypto from "crypto"
var Dropzone = require('react-dropzone');

export var Settings = React.createClass({
    getInitialState(){
        return{
            visitCount:0,
            downloadCount:0,
            currentpage:0,
            pagesize:20,
            pagenum:9,
            jumppage:1,
            filtertext:"",
            logglist:[],
            logindex:null

        }
    },
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },

    componentDidMount (){
        this.getAdList();
        this.getVersionList();
        this.getLogsList();
    },
    firstpageclick(){
        this.setState({
            currentpage:0
        })
    },
    trailpageclick(maxpn){
        var that = this;
        //alert(maxpn);
        var infun = function(){
            if(that.state.currentpage!=maxpn-1){
                that.setState({
                    currentpage:maxpn-1
                })
            }
        };
        return infun;
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
    goclick(){
        if(this.state.jumppage != (this.state.currentpage+1)){
            this.setState({
                currentpage:this.state.jumppage-1
            })
        }
    },
    jumpChange(event){
        if(event.target.value!=""&&(parseInt(event.target.value)>0)){
            this.setState({
                jumppage:parseInt(event.target.value)
            })
        }
    },
    pagesizeChange(event){
        this.setState({
            pagesize:parseInt(event.target.value),
            currentpage:0
        })
    },
    filterChange(event){
        this.setState({
            filtertext:event.target.value,
            currentpage:0
        });
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
    getLogsList(){
        $("#ajaxloading").show();
        $.ajax({
            url: Constant.BASE_URL+"sadmin/logs/list",
            type: 'GET',
            success: function(data){
                $("#ajaxloading").hide();
                var msg = JSON.parse(data);

                SisDispatcher.dispatch({
                    actionType: Constant.GETLOGSLIST,
                    loglist:msg.body
                });
            },
            error:function(){
                $("#ajaxloading").hide();
            }
        });
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
    deleteButtonClick(id){
        var that = this;
        var inFunc = function(){
            that.state.logindex = id;
            $("#deletelog").modal("show");

        };
        return inFunc;
    },
    deletelogclick(){
        $("#deletelog").modal("hide");
      //  $("#ajaxloading").show();

        SisDispatcher.dispatch({
            actionType: Constant.DELETELOG,
            logidex:this.state.logindex
        });

    /*
        var that = this;
        $.ajax({
                url: Constant.BASE_URL+"sadmin/logs/delete",
                data: $.param({
                    logid:that.state.logindex
                }),
                type: 'DELETE',
                contentType: 'application/x-www-form-urlencoded',
                success: function(data){
                    $("#ajaxloading").hide();
                    var rindex = _.findIndex(that.props.logsList,function(item){
                        return item._id == that.state.logindex;
                    });
                    if(rindex>=0){
                        that.setState({
                            logglist:that.props.logsList.splice(rindex,1)
                        })
                    }
                },
                error:function(){
                    $("#ajaxloading").hide();
                }
        });
    */
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
        var mlist = this.props.logsList;
        var that=this;
        if(this.state.filtertext && this.state.filtertext.length>0){

            mlist = _.filter(mlist,function(item){
                return item.message.indexOf(that.state.filtertext)>=0
            });
        }
        var startPos = this.state.currentpage*this.state.pagesize;
        var stopPos = Math.min(startPos+this.state.pagesize,mlist.length);

        var maxPageNum = Math.ceil(mlist.length/this.state.pagesize);

        mlist = mlist.slice(startPos,stopPos);

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
            <a aria-label="first" onClick={this.firstpageclick}>
                {"first page"}
            </a>
        </li>);
        if(maxPageNum <= this.state.pagenum){
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
        }
        else{
            if(this.state.currentpage < maxPageNum-9){
                pageButtonGrp.push(<li className={leftButtonClass}>
                    <a aria-label="Previous" onClick={this.leftpageclick}>
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>);

                for(var pn = this.state.currentpage;pn<=this.state.currentpage+3;pn++){
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

                pageButtonGrp.push(<li className={"disabled"}>
                    <a>
                        {"..."}

                    </a>
                </li>);

                for(var ps =maxPageNum-4;ps<=maxPageNum-1;ps++ ){
                    var currentPageButtonCls = "";
                    if(this.state.currentpage == ps){
                        currentPageButtonCls = "active";
                    }
                    pageButtonGrp.push(<li className={currentPageButtonCls}>
                        <a onClick={this.pnumclick(ps)}>
                            {parseInt(ps)+1}

                        </a>
                    </li>);
                }

                pageButtonGrp.push(<li className={rightButtonClass}>
                    <a aria-label="Next" onClick={this.rightpageclick(maxPageNum)}>
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>);
            }
            else{
                pageButtonGrp.push(<li className={leftButtonClass}>
                    <a aria-label="Previous" onClick={this.leftpageclick}>
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>);
                for(var pn = maxPageNum-9;pn<=maxPageNum-1;pn++){
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
            }

        }
        pageButtonGrp.push(<li className={rightButtonClass}>
            <a aria-label="trailer" onClick={this.trailpageclick(maxPageNum)}>
                {"trailer page"}
            </a>
        </li>);

        var llist = [];
        for(var i in mlist){
            var mli = mlist[i];
            llist.push(
                <tr>
                    <td>{parseInt(startPos)+parseInt(i)+1}</td>
                    <td>{mli.message}</td>
                    <td>{new Date(mli.timestamp).toLocaleString()}</td>
                    <td>{mli.level}</td>
                    <td className="list_btn">
                        <div className="btn-group" role="group" >
                            <a
                                type="button"
                                onClick={this.deleteButtonClick(mli._id)}
                                className="btn btn-danger">Delete</a>
                        </div>

                    </td>

                </tr>
            );
        }
        var setPagesizeSelect =[];
        for(var num in Constant.SETPAGESIZE){
            setPagesizeSelect.push(<option value={Constant.SETPAGESIZE[num]}>
                {Constant.SETPAGESIZE[num]}
            </option>)
        }
        return(
            <div>
                <ul className="nav nav-tabs" role="tablist">
                    <li role="presentation" className="active"><a href="#ads" aria-controls="ads" role="tab" data-toggle="tab">Visit Counter</a></li>
                    <li role="presentation"><a href="#logslist" aria-controls="logslist" role="tab" data-toggle="tab">Logs List</a></li>
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
                    <div role="tabpanel" className="tab-pane" id="logslist">
                        <div className="panel panel-default">
                            <div className="panel-heading">
                                <div className="row">
                                    <div className="col-md-3">
                                        <select className="form-control" value={this.state.pagesize} onChange={this.pagesizeChange}>
                                            {setPagesizeSelect}
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
                                        <th><span className="">Message</span></th>
                                        <th><span className="">Timestamp</span></th>
                                        <th><span className="">Level</span></th>
                                        <th><span className="">Operations</span></th>
                                    </tr>
                                    </thead>
                                    <tbody>

                                    {llist}

                                    </tbody>
                                </table>
                            </div>
                            <div className="panel-footer">

                                    <nav>
                                        <ul className="pagination">
                                            {pageButtonGrp}
                                            <li className="">
                                                <input type="number"
                                                    placeholder="jump page"
                                                    onChange={this.jumpChange}/>
                                            </li>
                                            <li className="">
                                                <button type="submit" className="btn btn-default"onClick={this.goclick}>Go</button>
                                            </li>
                                        </ul>

                                    </nav>


                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal fade" id="deletelog" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" >Confirm to delete</h4>
                            </div>
                            <div className="modal-body">
                                <h3>
                                    Are you sure to delete this log?
                                </h3>




                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button"
                                   onClick={this.deletelogclick}
                                   className="btn btn-primary" >Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }
});