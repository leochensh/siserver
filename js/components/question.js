import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import crypto from "crypto"
import _ from "underscore"
var Dropzone = require('react-dropzone');


export var Question = React.createClass({
    getInitialState(){
        return {
            title:"newquestion",
            ifSaved:false,
            selectlist:[],
            id:null,
            deleteindex:null,
            deletescoreindex:null
        };
    },
    addselection(){
        if(this.props.qdata.type == Constant.QTYPE_MULTISELECT||
            this.props.qdata.type == Constant.QTYPE_MULTISELECT_RECORD_TEXT||
            this.props.qdata.type == Constant.QTYPE_MULTISELECT_TEXT||
            this.props.qdata.type == Constant.QTYPE_SINGLESELECT||
            this.props.qdata.type == Constant.QTYPE_SINGLESELECT_RECORD_TEXT||
            this.props.qdata.type == Constant.QTYPE_SINGLESELECT_TEXT){
            var ls = this.props.qdata.selectlist;
            ls.push({
                title:"",
                type:Constant.SELECTTYPE_TEXT,
                qid:-1
            });
            this.informChange({
                selectlist:ls
            });
        }
        else if(this.props.qdata.type == Constant.QTYPE_SCORE){
            var sl = this.props.qdata.scorelist;
            var slsize = sl.length;
            sl.push({
                index:slsize,
                start:0,
                end:10,
                step:1,
                title:""
            });
            this.informChange({
                scorelist:sl
            });
        }

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
    jumptochange(index){
        var that = this;
        function handleStype(event){
            var slist = that.props.qdata.selectlist;
            slist[index].qid = event.target.value;
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
    handleScoreStartChange(index){
        var that = this;
        var innerFunc = function(event){
            var scoreStart = parseInt(event.target.value);
            var scoreEnd = that.props.qdata.scorelist[index].end;
            var scoreStep = that.props.qdata.scorelist[index].step;
            var scoretitle = that.props.qdata.scorelist[index].title?that.props.qdata.scorelist[index].title:"";
            that.handleScoreChange(index,scoreStart,scoreEnd,scoreStep,scoretitle);
        }
        return innerFunc;

    },
    handleScoreEndChange(index){
        var that = this;
        var innerFunc = function(event){
            var scoreStart = that.props.qdata.scorelist[index].start;
            var scoreEnd = parseInt(event.target.value);
            var scoreStep = that.props.qdata.scorelist[index].step;
            var scoretitle = that.props.qdata.scorelist[index].title?that.props.qdata.scorelist[index].title:"";
            that.handleScoreChange(index,scoreStart,scoreEnd,scoreStep,scoretitle);
        };
        return innerFunc;
    },
    handleScoreStepChange(index){
        var that = this;
        var innerFunc = function(event){
            var scoreStart = that.props.qdata.scorelist[index].start;
            var scoreEnd = that.props.qdata.scorelist[index].end;
            var scoreStep = parseInt(event.target.value);
            var scoretitle = that.props.qdata.scorelist[index].title?that.props.qdata.scorelist[index].title:"";
            that.handleScoreChange(index,scoreStart,scoreEnd,scoreStep,scoretitle)
        };
        return innerFunc;
    },

    handleScoreTitleChange(index){
        var that = this;
        var innerFunc = function(event){
            var scoreStart = that.props.qdata.scorelist[index].start;
            var scoreEnd = that.props.qdata.scorelist[index].end;
            var scoreStep = that.props.qdata.scorelist[index].step;
            var scoretitle = event.target.value;
            that.handleScoreChange(index,scoreStart,scoreEnd,scoreStep,scoretitle)
        };
        return innerFunc;
    },
    deletescoreitem(index){
        var that = this;
        var innerFunc = function(event){
            that.state.deletescoreindex = index;
            $("#deletescoremodal").modal("show");
        };
        return innerFunc;
    },
    confirmDeleteScore(){
        var slist = this.props.qdata.scorelist;
        if(this.state.deletescoreindex){
            slist.splice(this.state.deletescoreindex,1);
            this.informChange({
                scorelist:slist
            })
        }
        $("#deletescoremodal").modal("hide");
    },
    handleScoreChange(index,start,end,step,title){
        var sarray = [];
        if(this.props.qdata.scorelist && _.isArray(this.props.qdata.scorelist)){
            sarray = this.props.qdata.scorelist;
            sarray[index] = {
                index:index,
                start:start,
                end:end,
                step:step,
                title:title
            }
        }
        else{
            sarray = [{
                index:0,
                start:start,
                end:end,
                step:step,
                tittle:title
            }]
        }

        this.informChange({scorelist:sarray})
    },
    informChange(obj){
        var that = this;
        setTimeout(function(){
            that.props.qhandle(obj);
        },10)

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

            $("#deleteindexmodal").modal("show");
            that.state.deleteindex = index;


        };
        return dfunc;
    },
    confirmDeleteSelection(){
        var slist = this.props.qdata.selectlist;
        if(this.state.deleteindex){
            slist.splice(this.state.deleteindex,1);
            this.informChange({
                selectlist:slist
            })
        }
        $("#deleteindexmodal").modal("hide");

    },
    selectionUp(index){
        var that = this;
        var dfunc = function(){
            var slist = that.props.qdata.selectlist;
            if(index!=0){
                var temp = slist[index-1];
                slist[index-1] = slist[index];
                slist[index] = temp;
            }
            that.informChange({
                selectlist:slist
            })
        };
        return dfunc;
    },
    selectionDown(index){
        var that = this;
        var dfunc = function(){
            var slist = that.props.qdata.selectlist;
            if(index!=slist.length-1){
                var intindex = parseInt(index);
                var temp = slist[intindex+1];
                slist[intindex+1] = slist[intindex];
                slist[intindex] = temp;
            }
            that.informChange({
                selectlist:slist
            })
        };
        return dfunc;
    },
    savequestion(){
        if(this.props.qdata.title){
            SisDispatcher.dispatch({

                actionType: Constant.SAVESINGLEQUESTION,
                qindex:this.props.index
            });
        }
        else{
            alert("Question title can not be null!")
        }


    },
    deletequestion(){
        //this.props.dhandle();
        $("#deletemodal").modal("show");
    },
    confirmDeleteQuestion(){
        this.props.dhandle();
        $("#deletemodal").modal("hide");
    },
    questionUp(){
        this.props.uphandle();
    },
    questionDown(){
        this.props.downhandle();
    },
    render(){
        //alert(JSON.stringify(this.props))
        //var colorClass = this.props.qdata.ifSaved?"blue":"red";
        var colorClass = "blue";
        var qid = "questionname"+this.props.index;

        var typestr = Constant.QTYPE_NAME_MAP[this.props.qdata.type];

        var typeOptions = [
            <optgroup label="Single Selection">
                <option value="singleselect">
                    {Constant.QTYPE_NAME_MAP["singleselect"]}
                </option>
                <option value="singleselect_text">
                    {Constant.QTYPE_NAME_MAP["singleselect_text"]}
                </option>
                <option value="singleselect_record_text">
                    {Constant.QTYPE_NAME_MAP["singleselect_record_text"]}
                </option>
            </optgroup>,
            <optgroup label="Multiple Selection">
                <option value="multiselect">
                    {Constant.QTYPE_NAME_MAP["multiselect"]}
                </option>
                <option value="multiselect_text">
                    {Constant.QTYPE_NAME_MAP["multiselect_text"]}
                </option>
                <option value="multiselect_record_text">
                    {Constant.QTYPE_NAME_MAP["multiselect_record_text"]}
                </option>
            </optgroup>,
            <optgroup label="Subjective">
                <option value="description">
                    {Constant.QTYPE_NAME_MAP["description"]}
                </option>
                <option value="description_record_text">
                    {Constant.QTYPE_NAME_MAP["description_record_text"]}
                </option>
                <option value="description_image_text">
                    {Constant.QTYPE_NAME_MAP["description_image_text"]}
                </option>
            </optgroup>,
            <optgroup label="Others">
                <option value="sequence">
                    {Constant.QTYPE_NAME_MAP["sequence"]}
                </option>
                <option value="score">
                    {Constant.QTYPE_NAME_MAP["score"]}
                </option>
            </optgroup>
        ];
        //for(var tkey in Constant.QTYPE_NAME_MAP){
        //    typeOptions.push(<option value={tkey}>
        //        {Constant.QTYPE_NAME_MAP[tkey]}
        //    </option>)
        //}


        var jumpOptionsList = [];
        jumpOptionsList.push(<option value="-1">
            None
        </option>);
        for(var i in this.props.qlist){
            jumpOptionsList.push(<option value={this.props.qlist[i].id}>
                {parseInt(i)+1},{this.props.qlist[i].title}
            </option>)
        }

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

            var upSelArrowClass = "btn btn-default";
            var downSelArrowClass = "btn btn-default";

            var jumpqid = -1;
            if(s.qid){
                jumpqid = s.qid;
            }

            if(i == 0){
                upSelArrowClass = "btn btn-default disabled";
            }

            if(i == this.props.qdata.selectlist.length-1){
                downSelArrowClass = "btn btn-default disabled";
            }

            slist.push(
                <div className="panel panel-info">
                    <div className="panel-heading">
                        <div className="row">
                            <div className="col-md-2">
                                Selection&nbsp;&nbsp;<span className="grey">{parseInt(i)+1}</span>
                            </div>

                            <div className="col-md-2 col-md-offset-1">
                                <a type="button"
                                   onClick={this.deleteselection(i)}
                                   className="btn btn-danger right">
                                    <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                    <span>&nbsp;&nbsp;Delete</span>
                                </a>
                            </div>
                            <div className="col-md-2 col-md-offset-5">
                                <a className={upSelArrowClass}  role="button" onClick={this.selectionUp(i)}>
                                    <span className="glyphicon glyphicon-arrow-up" aria-hidden="true"></span>
                                </a>
                                <a className={downSelArrowClass}  role="button" onClick={this.selectionDown(i)}>
                                    <span className="glyphicon glyphicon-arrow-down" aria-hidden="true"></span>
                                </a>

                            </div>
                        </div>


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
                                          placeholder="Selection Title"
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


                            <label  className="col-sm-2 control-label">
                                Jump to:
                            </label>
                            <div className="col-sm-10">
                                <select className="form-control"
                                        value={jumpqid} onChange={this.jumptochange(i)}
                                        >
                                    {jumpOptionsList}
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





        var ifDisplaySelectStyle = {
            display:"none"
        };
        if(this.props.qdata.precedentindex>=0){
            for(var i in this.props.qlist[this.props.qdata.precedentindex].selectlist){
                var s = this.props.qlist[this.props.qdata.precedentindex].selectlist[i];
                selectoptionsList.push(<option value={i}>
                    {parseInt(i)+1},{s.title}
                </option>);
            }
            ifDisplaySelectStyle = {};
        }

        var ifDisplayScoreBeginEndStepStyle = {
            display:"none"
        };
        var scoreStart = 0;
        var scoreEnd = 10;
        var scoreStep = 1;
        var scoreHtml = []
        if(this.props.qdata.type == Constant.QTYPE_SCORE){
            ifDisplayScoreBeginEndStepStyle = {};
            //console.log(this.props.qdata.scorelist);
            if(this.props.qdata.scorelist && _.isArray(this.props.qdata.scorelist)){
                var scoreArray = this.props.qdata.scorelist;
                for(var sai in scoreArray){
                    var si = scoreArray[sai];
                    var sstart = parseInt(si.start);
                    var send = parseInt(si.end);
                    var sstep = parseInt(si.step);
                    var stitle = si.title?si.title:"";

                    scoreHtml.push(<div  className="panel panel-default">
                        <div className="panel-heading">
                            <div className="row">
                                <div className="col-sm-2">
                                    <input type="text"
                                           className="form-control"
                                           value={stitle}
                                           onChange={this.handleScoreTitleChange(sai)}
                                           placeholder="Score title"/>
                                </div>
                                <div className="col-sm-2 col-sm-offset-2">
                                    <a type="button"
                                       onClick={this.deletescoreitem(sai)}
                                       className="btn btn-danger">
                                        <span className="glyphicon glyphicon-remove-circle" aria-hidden="true"></span>
                                        <span>&nbsp;&nbsp;Delete score item</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="panel-body">
                            <div className="row">
                                <label className="col-sm-2 control-label">Score Start</label>
                                <div className="col-sm-2">
                                    <input type="number" className="form-control"
                                           value={sstart}
                                           onChange={this.handleScoreStartChange(sai)}
                                    >
                                    </input>
                                </div>
                                <label className="col-sm-2 control-label">Score End</label>
                                <div className="col-sm-2">
                                    <input type="number" className="form-control"
                                           value={send}
                                           onChange={this.handleScoreEndChange(sai)}
                                    >
                                    </input>
                                </div>
                                <label className="col-sm-2 control-label">Score Step</label>
                                <div className="col-sm-2">
                                    <input type="number" className="form-control"
                                           value={sstep}
                                           onChange={this.handleScoreStepChange(sai)}
                                    >
                                    </input>
                                </div>
                            </div>
                        </div>

                    </div>);

                }
            }
            else{
                this.handleScoreChange(0,scoreStart,scoreEnd,scoreStep);
            }
        }


        var upArrowClass = "btn btn-default";
        var downArrowClass = "btn btn-default";

        if(this.props.index == 0){
            upArrowClass = "btn btn-default disabled";
        }

        if(this.props.index == this.props.qlist.length-1){
            downArrowClass = "btn btn-default disabled";
        }


        //var dependencyQ = <div className="form-group">
        //    <label className="col-sm-2 control-label">Dependent Question</label>
        //    <div className="col-sm-10">
        //        <select className="form-control"
        //                value={this.props.qdata.precedentindex}
        //                onChange={this.handleChange.bind(this,"precedentindex")}
        //        >
        //            {dpoptionsList}
        //        </select>
        //    </div>
        //</div>;

        var dependentList = <div className="form-group" style={ifDisplaySelectStyle}>
            <label className="col-sm-2 control-label">Dependent Select</label>
            <div className="col-sm-10">
                <select className="form-control"
                        value={this.props.qdata.precedentselectindex}
                        onChange={this.handleChange.bind(this,"precedentselectindex")}
                >
                    {selectoptionsList}
                </select>
            </div>
        </div>;

        var dependencyQ = ""



        return(
            <div className="panel panel-default">
                <div className="panel-heading">
                    <div className="row">
                        <div className="col-md-4">
                            <span className={colorClass}>{parseInt(this.props.index)+1}</span>
                        </div>

                        <form className="col-md-6 form-inline">
                            <select className="form-control"
                                    onChange={this.handleChange.bind(this,"type")}
                                    value={this.props.qdata.type}>
                                {typeOptions}
                            </select>
                        </form>
                        <div className="col-md-2">
                            <a className={upArrowClass}  role="button" onClick={this.questionUp}>
                                <span className="glyphicon glyphicon-arrow-up" aria-hidden="true"></span>
                            </a>
                            <a className={downArrowClass}  role="button" onClick={this.questionDown}>
                                <span className="glyphicon glyphicon-arrow-down" aria-hidden="true"></span>
                            </a>

                        </div>
                    </div>

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
                                          placeholder="Question Title"
                                          onChange={this.handleChange.bind(this,"title")}>
                                </textarea>
                            </div>
                        </div>



                        {dependencyQ}
                        <div className="form-group" style={ifDisplayScoreBeginEndStepStyle}>
                            {scoreHtml}
                        </div>

                        {slist}

                    </form>
                </div>
                <div className="panel-footer">
                    <span className={colorClass}>{parseInt(this.props.index)+1}</span>
                    <span>&nbsp;&nbsp;</span>
                    <a type="button"
                            onClick={this.addselection}
                            className="btn btn-primary">
                        <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
                        <span>&nbsp;&nbsp;Add new item </span>
                    </a>
                    &nbsp;&nbsp;
                    &nbsp;&nbsp;
                    <a type="button"
                            onClick={this.deletequestion}
                            className="btn btn-danger">
                        <span className="glyphicon glyphicon-remove-circle" aria-hidden="true"></span>
                        <span>&nbsp;&nbsp;Delete question</span>
                    </a>
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
                                    Are you sure to delete this question?
                                </h3>
                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button"
                                   onClick={this.confirmDeleteQuestion}
                                   className="btn btn-primary" >Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="deleteindexmodal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" >Confirm to delete</h4>
                            </div>
                            <div className="modal-body">
                                <h3>
                                    Are you sure to delete this question selection?
                                </h3>
                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button"
                                   onClick={this.confirmDeleteSelection}
                                   className="btn btn-primary" >Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="deletescoremodal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" >Confirm to delete</h4>
                            </div>
                            <div className="modal-body">
                                <h3>
                                    Are you sure to delete this score item?
                                </h3>
                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button"
                                   onClick={this.confirmDeleteScore}
                                   className="btn btn-primary" >Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        )
    }
});