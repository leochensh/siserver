import React from 'react';
import {Constant} from "../constant"

export var RgraphControl = React.createClass({
    getInitialState(){
        return{
            options:["None","Bar graph","Pie graph"],
            currentType:"None"
        }
    },
    cleaCanvas(){
        var canvas  = document.getElementById(this.props.gid);
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width,canvas.height);
    },
    schange(event){
        this.setState({
            currentType:event.target.value
        });
        $("#ajaxloading").show();
        var that = this;

        if(event.target.value == this.state.options[1]){

            $("#ajaxloading").hide();
            setTimeout(function(){
                that.cleaCanvas();
                that.state.bar = new RGraph.Bar({
                    id: that.props.gid,
                    data: that.props.values,
                    options: {
                        labels: that.props.labels,
                        shadow: false,
                        colors: ['red'],
                        strokestyle: 'rgba(0,0,0,0)'
                    }
                }).draw();
            },500);
        }
        else if(event.target.value == this.state.options[2]){
            $("#ajaxloading").hide();
            var localValues = [];
            var localLabels = [];
            for(var i in this.props.values){

                if(this.props.values[i]!=0){
                    localLabels.push(this.props.labels[i]+", "+this.props.pervalues[i]);
                    localValues.push(this.props.values[i]);
                }
            }
            setTimeout(function(){
                that.cleaCanvas();
                that.state.bar = new RGraph.Pie({
                    id: that.props.gid,
                    data: localValues,
                    options: {
                        labels: localLabels,
                        shadow: false,
                        strokestyle: 'rgba(0,0,0,0)'
                    }
                }).draw();
            },500);
        }


    },
    render(){
        var oplist = [];
        for(var i in this.state.options){
            oplist.push(
                <option value={this.state.options[i]}>
                    {this.state.options[i]}
                </option>
            )
        }
        var gpart = "";
        if(this.state.currentType != this.state.options[0]){
            gpart =
                <canvas id={this.props.gid} width="700" height="400">
                    [No canvas support]
                </canvas>;
        }
        return(
            <div>
                <div className="form-group">
                    <label className="col-sm-2 control-label">Graph</label>
                    <div className="col-sm-10">
                        <select
                            value={this.state.currentType}
                            onChange={this.schange}
                            className="form-control">
                            {oplist}
                        </select>
                    </div>
                </div>
                {gpart}
            </div>
        )
    }
})