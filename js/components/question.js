import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import crypto from "crypto"
var Dropzone = require('react-dropzone');


export var Question = React.createClass({
    getInitialState(){
        return {
            title:"newquestion",
            ifSaved:false,
            selectlist:[],
            id:null
        };
    },
    addselection(){
        var ls = this.props.qdata.selectlist;
        ls.push({
            title:"selection",
            type:Constant.SELECTTYPE_TEXT
        });
        this.informChange({
            selectlist:ls
        });
        //setTimeout(function(){
        //    var objDiv = document.getElementById("scrollright");
        //    objDiv.scrollTop = objDiv.scrollHeight;
        //},100);
    },
    handleChange(name,event){
        var newstate = {};
        newstate[name] = event.target.value;
        this.informChange(newstate);
    },
    onDrop: function (index) {
        var that = this;
        function handleUpload(files){
            console.log(files[0].name);
            var data = new FormData();
            data.append("name",files[0].name);
            data.append("file",files[0]);
            $("#ajaxloading").show();

            $.ajax({
                url: Constant.BASE_URL+"staff/upload/image",
                data: data,
                cache: false,
                contentType: false,
                processData: false,
                type: 'POST',
                success: function(data){
                    $("#ajaxloading").hide();
                    that.props.qdata.selectlist[index].img = JSON.parse(data).body;
                    that.informChange({
                        selectlist:that.props.qdata.selectlist
                    })
                },
                error:function(jxr,scode){
                    $("#ajaxloading").hide();
                }
            });
        }
        return handleUpload;
    },
    stypechange(index){
        var that = this;
        function handleStype(event){
            var slist = that.props.qdata.selectlist;
            slist[index].type = event.target.value;
            that.informChange({
                selectlist:slist
            })
        }
        return handleStype;
    },
    selectTitleChange(index){
        var that = this;
        function handleTC(event){
            var slist = that.props.qdata.selectlist;
            slist[index].title = event.target.value;
            that.informChange({
                selectlist:slist
            })
        }
        return handleTC;
    },
    informChange(obj){
        if(!obj.ifSaved){
            obj.ifSaved = false;
        }
        this.props.qhandle(obj);
        //this.setState(obj);
        //var that = this;
        //setTimeout(
        //    function(){
        //        that.props.qhandle(that.state);
        //    },50
        //);

    },
    deleteselection(index){
        var that = this;
        var dfunc = function(){
            var slist = that.props.qdata.selectlist;
            slist.splice(index,1);
            that.informChange({
                selectlist:slist
            })
        }
        return dfunc;
    },
    savequestion(){
        SisDispatcher.dispatch({

            actionType: Constant.SAVESINGLEQUESTION,
            qindex:this.props.index
        });
        //if(this.props.qdata.title &&
        //    (this.props.qdata.selectlist.length>0 || this.props.qdata.type == Constant.QTYPE_DESCRIPTION)){
        //    var q = {
        //        title:this.props.qdata.title,
        //        surveyid:this.props.qdata.surveyid,
        //        type:this.props.qdata.type,
        //        selectlist:this.props.qdata.selectlist
        //    };
        //    //alert(JSON.stringify(this.props.qdata));
        //    $("#ajaxloading").show();
        //    var that = this;
        //    if(this.props.qdata.id){
        //        q.questionid = this.props.qdata.id;
        //        $.ajax({
        //            url: Constant.BASE_URL+"editor/survey/question/edit",
        //            data: JSON.stringify(q),
        //            contentType: 'application/json; charset=utf-8',
        //            type: 'PUT',
        //            success: function(data){
        //                $("#ajaxloading").hide();
        //                that.informChange({
        //                    ifSaved:true,
        //                });
        //            },
        //            error:function(jxr,scode){
        //                $("#ajaxloading").hide();
        //            }
        //        });
        //    }
        //    else{
        //        $.ajax({
        //            url: Constant.BASE_URL+"editor/survey/question/add",
        //            data: JSON.stringify(q),
        //            contentType: 'application/json; charset=utf-8',
        //            type: 'POST',
        //            success: function(data){
        //                $("#ajaxloading").hide();
        //                that.informChange({
        //                    ifSaved:true,
        //                    id:JSON.parse(data).body
        //                });
        //            },
        //            error:function(jxr,scode){
        //                $("#ajaxloading").hide();
        //            }
        //        });
        //    }
        //
        //}
        //else{
        //    alert("Question data is incomplete to save.")
        //}
    },
    deletequestion(){
        if(this.props.qdata.id){
            $("#ajaxloading").show();
            var that = this;
            $.ajax({
                url: Constant.BASE_URL+"editor/survey/question/delete",
                data: $.param({
                    questionid:that.props.qdata.id
                }),
                type: 'DELETE',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data);
                },
                error:function(jxr,scode){
                    $("#ajaxloading").hide();
                },
                statusCode:{
                    406:function(){
                    },
                    500:function(){
                        that.context.router.push("/login");
                    },
                    409:function(){
                    }
                }
            });
        }
        this.props.dhandle();

    },
    render(){
        //alert(JSON.stringify(this.props))
        var colorClass = this.props.qdata.ifSaved?"blue":"red";
        var qid = "questionname"+this.props.index;

        var typestr = Constant.QTYPE_NAME_MAP[this.props.qdata.type];
        var slist = [];
        for(var i in this.props.qdata.selectlist){
            var s = this.props.qdata.selectlist[i];
            var sid = "selection"+i;
            var img = "";
            var s2id = "selection2"+i;
            var s3id = "selection3"+i;
            if(s.img){
                img = <img
                    src={Constant.BASE_IMAGEURL+s.img}
                    className="img-rounded"
                    style={{maxHeight:"100px"}}
                    alt="Responsive image"/>
            }
            var ifDropShow = {
                display:"none"
            };
            if(s.type == Constant.SELECTTYPE_IMAGE){
                ifDropShow = {};
            }
            slist.push(
                <div className="panel panel-info">
                    <div className="panel-heading">
                        Selection&nbsp;&nbsp;<span className="grey">{parseInt(i)+1}</span>
                        <button type="button"
                                onClick={this.deleteselection(i)}
                                className="btn btn-danger right">
                            <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                            <span>&nbsp;&nbsp;Delete</span>
                        </button>
                    </div>
                    <div className="panel-body">
                        <div className="form-group">
                            <label htmlFor={sid} className="col-sm-2 control-label">
                                Selection Title
                            </label>
                            <div className="col-sm-10">
                                <textarea type="text"
                                          className="form-control"
                                          id={sid}
                                          value={s.title}
                                          onChange={this.selectTitleChange(i)}
                                >
                                </textarea>
                            </div>

                            <label htmlFor={s2id} className="col-sm-2 control-label" style={ifDropShow}>
                                Selection Image
                            </label>
                            <div className="col-sm-10" style={ifDropShow}>
                                {img}
                                <Dropzone onDrop={this.onDrop(parseInt(i))} accept="image/*">
                                    <div>Drop file here or click.</div>
                                </Dropzone>
                            </div>

                            <label htmlFor={s3id} className="col-sm-2 control-label">
                                Selection Type
                            </label>
                            <div className="col-sm-10">
                                <select className="form-control"
                                        value={s.type} onChange={this.stypechange(i)}
                                        id={s3id}>
                                    <option value={Constant.SELECTTYPE_TEXT}>
                                        {Constant.STYPEMAP[Constant.SELECTTYPE_TEXT]}
                                    </option>
                                    <option value={Constant.SELECTTYPE_IMAGE}>
                                        {Constant.STYPEMAP[Constant.SELECTTYPE_IMAGE]}
                                    </option>
                                    <option value={Constant.SELECTTYPE_DESCRIPTION}>
                                        {Constant.STYPEMAP[Constant.SELECTTYPE_DESCRIPTION]}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>


            )
        }

        var dpoptionsList = [];
        dpoptionsList.push(<option value="-1">
            None
        </option>);
        for(var i in this.props.qlist){
            dpoptionsList.push(<option value={i}>
                {parseInt(i)+1},{this.props.qlist[i].title}
            </option>)
        }
        var selectoptionsList = [];
        selectoptionsList.push(<option value="-1">
            None
        </option>);
        if(this.props.qdata.precedentindex>=0){
            for(var i in this.props.qlist[this.props.qdata.precedentindex].selectlist){
                var s = this.props.qlist[this.props.qdata.precedentindex].selectlist[i];
                selectoptionsList.push(<option value={i}>
                    {parseInt(i)+1},{s.title}
                </option>);
            }
        }
        return(
            <div className="panel panel-default">
                <div className="panel-heading">
                    <span className={colorClass}>{parseInt(this.props.index)+1}</span>
                    <span>&nbsp;&nbsp;{typestr}</span>
                </div>
                <div className="panel-body">
                    <form className="form-horizontal">
                        <div className="form-group">
                            <label htmlFor={qid} className="col-sm-2 control-label">Question Title</label>
                            <div className="col-sm-10">
                                <textarea type="text"
                                          className="form-control"
                                          id={qid}
                                          value={this.props.qdata.title}
                                          onChange={this.handleChange.bind(this,"title")}>
                                </textarea>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="col-sm-2 control-label">Dependent Question</label>
                            <div className="col-sm-10">
                                <select className="form-control"
                                        value={this.props.qdata.precedentindex}
                                        onChange={this.handleChange.bind(this,"precedentindex")}
                                >
                                    {dpoptionsList}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="col-sm-2 control-label">Dependent Select</label>
                            <div className="col-sm-10">
                                <select className="form-control"
                                        value={this.props.qdata.precedentselectindex}
                                        onChange={this.handleChange.bind(this,"precedentselectindex")}
                                >
                                    {selectoptionsList}
                                </select>
                            </div>
                        </div>

                        {slist}

                    </form>
                </div>
                <div className="panel-footer">
                    <span className={colorClass}>{parseInt(this.props.index)+1}</span>
                    <span>&nbsp;&nbsp;</span>
                    <button type="button"
                            onClick={this.addselection}
                            className="btn btn-primary">
                        <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
                        <span>&nbsp;&nbsp;Add new selection item </span>
                    </button>
                    &nbsp;&nbsp;
                    <button type="button"
                            onClick={this.savequestion}
                            className="btn btn-info">
                        <span className="glyphicon glyphicon-floppy-disk" aria-hidden="true"></span>
                        <span>&nbsp;&nbsp;Save question</span>
                    </button>
                    &nbsp;&nbsp;
                    <button type="button"
                            onClick={this.deletequestion}
                            className="btn btn-danger">
                        <span className="glyphicon glyphicon-remove-circle" aria-hidden="true"></span>
                        <span>&nbsp;&nbsp;Delete question</span>
                    </button>
                </div>
            </div>

        )
    }
});