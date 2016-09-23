/**
 * Created by 张志良 on 2016/4/18.
 */
import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import _ from "underscore"
import crypto from "crypto"
var Dropzone = require('react-dropzone');

export var Feedback = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },

    getInitialState(){
      return {
          currentpage:0,
          pagesize:10,
          fbackList:[],
          fdindex:null,
          filtertext:""

      }
    },

    getFlist(){
      $.ajax({
          url: Constant.BASE_URL+"sadmin/feedback/list",
          type: 'GET',
          success: function(data){
              $("#ajaxloading").hide();
              var msg = JSON.parse(data);
              SisDispatcher.dispatch({
                  actionType: Constant.GETFEEDBACKLIST,
                  Flist:msg.body
              });
          },
          error:function(){
              $("#ajaxloading").hide();
          }
      });
    },
    componentDidMount(){
        this.getFlist();
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

    deleteButtonClick(id){
        var that = this;
        var inFunc = function(){
            that.state.fdindex = that.props.feedbackList[id]._id;
            $("#deletefeedback").modal("show");

        };
        return inFunc;
    },
    deletefblick(){
        $("#deletefeedback").modal("hide");
        var that = this;
        $("#ajaxloading").show();
            $.ajax({
                url: Constant.BASE_URL+"sadmin/feedback/delete",
                data: $.param({
                    feedbackid:that.state.fdindex
                }),
                type: 'DELETE',
                contentType: 'application/x-www-form-urlencoded',
                success: function(data){
                    $("#ajaxloading").hide();
                    var rindex = _.findIndex(that.props.feedbackList,function(item){
                        return item._id == that.state.fdindex;
                    });
                    if(rindex>=0){
                        that.setState({
                            fbackList:that.props.feedbackList.splice(rindex,1)
                        })
                    }
                },
                error:function(){
                    $("#ajaxloading").hide();
                }
            });

    },

    render(){
        var mlist = [];
        var loginInfo = this.props.loginInfo;
        if(loginInfo.role == null)
        {
            this.context.router.push("/");
        }
        var llist = this.props.feedbackList;
        var that=this;
        if(this.state.filtertext && this.state.filtertext.length>0){

            llist = _.filter(llist,function(item){
                return item.name.indexOf(that.state.filtertext)>=0
            });
        }
        var startPos = this.state.currentpage*this.state.pagesize;
        var stopPos = Math.min(startPos+this.state.pagesize,llist.length);

        var maxPageNum = Math.ceil(llist.length/this.state.pagesize);
        llist = llist.slice(startPos,stopPos);
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


        for(var i in llist){
            var Fli = llist[i];
            mlist.push(
                <tr>
                    <td>{parseInt(startPos)+parseInt(i)+1}</td>
                    <td>{Fli.name}</td>
                    <td>{Fli.content}</td>
                    <td>{new Date(Fli.ctime).toLocaleString()}</td>
                    <td className="list_btn">
                        <div className="btn-group" role="group" >
                            <a
                                type="button"
                                onClick={this.deleteButtonClick(i)}
                                className="btn btn-danger">Delete</a>

                        </div>

                    </td>

                </tr>
            );
        }
        var setPagesizeSelect = [
            <option value="10">
                10
            </option>
        ];
        for(var num in Constant.SETPAGESIZE){
            setPagesizeSelect.push(<option value={Constant.SETPAGESIZE[num]}>
                {Constant.SETPAGESIZE[num]}
            </option>)
        }
        return(
            <div >

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
                                       placeholder="Search Staff Name"/>
                            </div>

                        </div>
                    </div>
                    <div className="panel-body">
                        <table  className="table" >
                            <thead>
                            <tr>
                                <th><span className="">##</span></th>
                                <th><span className="">Staff Name</span></th>
                                <th><span className="">Content</span></th>
                                <th><span className="">Feedback Time</span></th>
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

                <div className="modal fade" id="deletefeedback" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" >Confirm to delete</h4>
                            </div>
                            <div className="modal-body">
                                <h3>
                                    Are you sure to delete this feedback?
                                </h3>




                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button"
                                   onClick={this.deletefblick}
                                   className="btn btn-primary" >Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )

    }
});

