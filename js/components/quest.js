import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import {Question} from "./question"
import _ from "underscore"
import crypto from "crypto"
import async from "async"

export var Quest = React.createClass({
    getInitialState(){
        return{
            survey:null,
            currentIndex:0,
            ifsubmit:false
        }
    },
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    checkedchange(index){
        var that = this;
        var ifunc = function(event){
            var slist = that.state.answer.answerlist[that.state.currentIndex].selectindexlist;
            var Qlist = that.state.survey.questionlist;
            var currentQ = Qlist[that.state.currentIndex];
            if(event.target.checked){
                if(currentQ.type == Constant.QTYPE_SINGLESELECT){
                    that.state.answer.answerlist[that.state.currentIndex].selectindexlist = [index];
                }
                else if(currentQ.type == Constant.QTYPE_MULTISELECT){
                    that.state.answer.answerlist[that.state.currentIndex].selectindexlist.push(index);
                }


            }
            else{
                var cindex = _.indexOf(slist,index);
                if(cindex>=0){
                    that.state.answer.answerlist[that.state.currentIndex].selectindexlist.splice(cindex,1);
                }
            }
            that.setState({
                answer:that.state.answer
            })
        }
        return ifunc;
    },
    selecttextchange(index){
        var that = this;
        var infunc = function(event){
            var v = event.target.value;
            var selectdesarray = that.state.answer.answerlist[that.state.currentIndex].selectextra;
            var sdindex = _.findIndex(selectdesarray,function(item){
                return item.index==index
            });
            if(sdindex>=0){
                that.state.answer.answerlist[that.state.currentIndex].selectextra[sdindex].text = v;
            }
            else{
                that.state.answer.answerlist[that.state.currentIndex].selectextra.push({
                    index:index,
                    text:v
                });
            }
            that.setState({
                answer:that.state.answer
            })
        }
        return infunc;
    },
    splitEnglish(v){
        return v.split("/@/")[0];
    },
    nextq(direction){
        var step = 1;
        var next;
        if(direction == "right"){
            next = this.state.survey.questionlist[this.state.currentIndex+step];
        }
        else{
            next = this.state.survey.questionlist[this.state.currentIndex-step];
        }
        while(next && next.ifhasprecedent){
            var preid = next.precedentid;
            var preselectindex = next.precedentselectindex;
            var amatchindex = _.findIndex(this.state.answer.answerlist,function(item){
                return item.questionid == preid;
            });
            console.log(amatchindex);
            if(amatchindex>=0){
                var sindexarr = this.state.answer.answerlist[amatchindex].selectindexlist;
                var newmatchindex = _.find(sindexarr,function(item){
                    return item == preselectindex
                })
                console.log(newmatchindex);
                if(newmatchindex>=0){
                    break;
                }
                else{
                    step+=1;
                }
                if(direction == "right"){
                    next = this.state.survey.questionlist[this.state.currentIndex+step];
                }
                else{
                    next = this.state.survey.questionlist[this.state.currentIndex-step];
                }
            }
            else{
                break;
            }

        }
        if(direction == "right"){
            this.setState({
                currentIndex:this.state.currentIndex+step
            })
        }
        else{
            this.setState({
                currentIndex:this.state.currentIndex-step
            })
        }

    },
    leftclick(){
        this.nextq("left");
    },
    rightclick(){
        this.nextq("right")
    },
    textchange(event){
        var v = event.target.value;
        this.state.answer.answerlist[this.state.currentIndex].text = v;
        this.setState({
            answer:this.state.answer
        });
    },
    componentDidMount (){
        $("#ajaxloading").show();
        var that = this;
        $.ajax({
            url: Constant.BASE_URL+"anonymous/survey/detail/"+that.props.params.id,

            type: 'GET',
            success: function (data) {
                $("#ajaxloading").hide();
                var msg = JSON.parse(data).body;

                var answer = {
                    surveyid:msg._id,
                    begintime:new Date().toISOString(),
                    answerlist:[]
                };
                for(var i in msg.questionlist){
                    var q = msg.questionlist[i];
                    answer.answerlist.push({
                        questionid:q._id,
                        selectindexlist:[],
                        scorelist:[],
                        sortlist:[],
                        selectextra:[],
                        text:"",
                        image:"",
                        audio:""
                    })
                }

                that.setState({
                    survey:msg,
                    answer:answer
                })

            },
            error:function(){
                $("#ajaxloading").hide();
            }
        });
    },
    submit(){
        var that = this;
        $.ajax({
            url: Constant.BASE_URL+"anonymous/survey/answer/add",
            data: JSON.stringify(that.state.answer),
            contentType: 'application/json; charset=utf-8',
            type: 'POST',
            success: function(data){

                that.setState({
                    ifsubmit:true
                })
            },
            error:function(jxr,scode){

            }
        });
    },
    render(){
        if(this.state.survey){
            var Qlist = this.state.survey.questionlist;
            var percent = (this.state.currentIndex+1)/Qlist.length;
            var currentQ = Qlist[this.state.currentIndex];
            var currentType = currentQ.type;
            var slist = [];
            var leftDisabled = "";
            var rightDisabled = "";
            var ifsubmit = {};
            if(this.state.currentIndex == 0){
                leftDisabled = "disabled";
            }
            if(this.state.currentIndex == Qlist.length-1){
                rightDisabled = "disabled";
            }

            if(this.state.currentIndex < Qlist.length-1){
                ifsubmit = {
                    display:"none"
                }
            }
            for(var i in currentQ.selectlist){
                var sindexlist =
                    this.state.answer.answerlist[this.state.currentIndex].selectindexlist;
                var selectdesarray = this.state.answer.answerlist[this.state.currentIndex].selectextra;
                var sdindex = _.findIndex(selectdesarray,function(item){
                    return item.index==i
                });

                var image = "";
                var descript = "";
                if(currentQ.selectlist[i].type == Constant.SELECTTYPE_IMAGE &&
                    currentQ.selectlist[i].img){
                    image = <img style={{maxWidth:"200px"}}
                                 src={Constant.BASE_IMAGEURL+currentQ.selectlist[i].img}/>
                }
                if(currentQ.selectlist[i].type == Constant.SELECTTYPE_DESCRIPTION ){
                    descript = <textarea className="form-control input-lg"
                                         onChange={this.selecttextchange(i)}
                                         value={sdindex>=0?selectdesarray[sdindex].text:""}
                                         type="checkbox">

                                </textarea>
                }
                if(currentType == Constant.QTYPE_SINGLESELECT){

                    slist.push(
                        <div className="form-group">
                            <div className="col-sm-2">
                                <input className="form-control"
                                       name="x"
                                       onChange={this.checkedchange(i)}
                                       checked={_.indexOf(sindexlist,i)>=0}
                                       type="radio"/>
                            </div>
                            <div className="col-sm-8">
                                {image}
                                <h3 style={{marginTop:"5px"}}>{currentQ.selectlist[i].title?this.splitEnglish(currentQ.selectlist[i].title):""}</h3>
                                {descript}
                            </div>
                        </div>
                    )
                }
                else if(currentType == Constant.QTYPE_MULTISELECT){
                    slist.push(
                        <div className="form-group">
                            <div className="col-sm-2">
                                <input className="form-control"
                                       onChange={this.checkedchange(i)}
                                       checked={_.indexOf(sindexlist,i)>=0}
                                       type="checkbox"/>
                            </div>
                            <div className="col-sm-8">
                                {image}
                                <h3 style={{marginTop:"5px"}}>{currentQ.selectlist[i].title?this.splitEnglish(currentQ.selectlist[i].title):""}</h3>
                                {descript}
                            </div>
                        </div>
                    )
                }


            }
            if(currentType == Constant.QTYPE_DESCRIPTION){
                slist.push(
                    <div className="form-group">
                                <textarea className="form-control input-lg"
                                          onChange={this.textchange}
                                          value={this.state.answer.answerlist[this.state.currentIndex].text}
                                          type="checkbox">

                                </textarea>
                    </div>
                )
            }
            var mainPart = (
                <div className="container">
                    <div className="progress">
                        <div className="progress-bar" role="progressbar" aria-valuenow="53.2" aria-valuemin="0" aria-valuemax="100" style={{width: percent*100+"%"}}>
                            {this.state.currentIndex+1} of {Qlist.length}
                        </div>
                    </div>
                    <h2>{this.splitEnglish(Qlist[this.state.currentIndex].title)}</h2>
                    <form className="form-horizontal">
                        {slist}
                    </form>

                    <p>
                        <a className="btn btn-primary btn-lg "
                           disabled={leftDisabled}
                           onClick={this.leftclick}
                           role="button">
                                <span className="glyphicon glyphicon-menu-left"
                                      aria-hidden="true"></span>
                            Previous
                        </a>
                        &nbsp;&nbsp;&nbsp;
                        <a className="btn btn-primary btn-lg"
                           disabled={rightDisabled}
                           onClick={this.rightclick}
                           role="button">
                                <span className="glyphicon glyphicon-menu-right"
                                      aria-hidden="true"></span>
                            Next&nbsp;&nbsp;&nbsp;&nbsp;
                        </a>

                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <a className="btn btn-danger btn-lg"
                           style={ifsubmit}
                           onClick={this.submit}
                           role="button">
                                <span className="glyphicon glyphicon-check"
                                      aria-hidden="true"></span>
                            Submit&nbsp;&nbsp;
                        </a>
                    </p>


                </div>);
            if(this.state.ifsubmit){
                mainPart = (
                    <div className="container">
                        <h2>Submit success! Thanks for your cooperation.</h2>
                    </div>)
            }
            return (
                <div className="jumbotron ">
                    {mainPart}
                </div>
            )
        }
        else{
            return (<div></div>)
        }


    }
})