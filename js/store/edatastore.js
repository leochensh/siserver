import {Store} from 'flux/utils';
import {SisDispatcher} from "../dispatcher"
import {Constant} from "../constant"
import _ from "underscore";
import async from "async"


var edata = {
    targetList:["flipkart","amazonindia","snapdeal","jumia","parktel","nairaland"],
    currentIndex:0,
    spiderlist:[null,null],
    currentstatistic:"Brands statistics|0",
    statisticid:null,
    hotkeybrandlist:[],
    hotkeybrandindex:0
}

var getStatistic = function(){
    var spiderid = edata.statisticid;

    var sarray = edata.currentstatistic.split("|");
    if(edata.targetList[edata.currentIndex]!="nairaland"){
        if(Constant.SPIDERSTASTICMAP[sarray[0]][sarray[1]].url){
            $("#pleaseWaitDialog").modal("show");
            var labeltag = Constant.SPIDERSTASTICMAP[sarray[0]][sarray[1]].labeltag;
            var datatag = Constant.SPIDERSTASTICMAP[sarray[0]][sarray[1]].datatag;
            var url = Constant.SPIDERSTASTICMAP[sarray[0]][sarray[1]].url+"/"+spiderid;
            $.ajax({
                url: Constant.BASE_URL+url,
                type: 'GET',
                success: function (data) {
                    $("#pleaseWaitDialog").modal("hide");
                    var msg = JSON.parse(data).body;
                    console.log(msg);
                    var dataA = [];
                    var labelA = [];
                    if(msg.total){
                        labelA.push("Total");
                        dataA.push(msg.total);
                    }
                    for(var i in msg.models){
                        labelA.push(msg.models[i][labeltag].split("(")[0]);
                        dataA.push(msg.models[i][datatag]);
                    }
                    console.log(labeltag);
                    console.log(datatag);
                    console.log(msg.models);
                    var canvas  = document.getElementById("barcanvas");
                    var context = canvas.getContext('2d');
                    context.clearRect(0, 0, canvas.width,canvas.height);

                    new RGraph.Bar({
                        id: "barcanvas",
                        data: dataA,
                        options: {
                            gutterLeft:100,
                            gutterBottom:150,
                            labelsAbove:true,
                            textAngle:30,
                            labels: labelA,
                            shadow: true,
                            colors: ['red'],
                            strokestyle: 'rgba(0,0,0,0)'
                        }
                    }).draw();


                },
                error:function(jxr,scode){
                    $("#pleaseWaitDialog").modal("hide");
                }
            });
        }
    }
}

var getStatisticall = function(){
    var spiderid = edata.statisticid;
    async.forEachOf(Constant.SPIDERSTASTICMAP["Brands statistics"],function(v,index,cb){
        if(v.url){
            var url = v.url+"/"+spiderid;
            var labeltag = v.labeltag;
            var datatag = v.datatag;
            $.ajax({
                url: Constant.BASE_URL+url,
                type: 'GET',
                success: function (data) {
                    $("#pleaseWaitDialog").modal("hide");
                    var msg = JSON.parse(data).body;
                    console.log(msg);
                    var dataA = [];
                    var labelA = [];
                    if(msg.total){
                        labelA.push("Total");
                        dataA.push(msg.total);
                    }
                    for(var i in msg.models){
                        labelA.push(msg.models[i][labeltag].split("(")[0]);
                        dataA.push(msg.models[i][datatag]);
                    }
                    console.log(labeltag);
                    console.log(datatag);
                    console.log(msg.models);
                    var canvas  = document.getElementById("barcanvas"+index);
                    var context = canvas.getContext('2d');
                    context.clearRect(0, 0, canvas.width,canvas.height);

                    new RGraph.Bar({
                        id: "barcanvas"+index,
                        data: dataA,
                        options: {
                            gutterLeft:100,
                            gutterBottom:150,
                            labelsAbove:true,
                            textAngle:30,
                            labels: labelA,
                            shadow: true,
                            colors: ['red'],
                            strokestyle: 'rgba(0,0,0,0)'
                        }
                    }).draw();
                    cb();


                },
                error:function(jxr,scode){
                    $("#pleaseWaitDialog").modal("hide");
                    cb();
                }
            });
        }
        else{
            cb()
        }
    },function(err){

    });

    async.forEachOf(Constant.SPIDERSTASTICMAP["Models Statistics"],function(v,index,cb){
        if(v.url){
            var url = v.url+"/"+spiderid;
            var labeltag = v.labeltag;
            var datatag = v.datatag;
            $.ajax({
                url: Constant.BASE_URL+url,
                type: 'GET',
                success: function (data) {
                    $("#pleaseWaitDialog").modal("hide");
                    var msg = JSON.parse(data).body;
                    console.log(msg);
                    var dataA = [];
                    var labelA = [];
                    if(msg.total){
                        labelA.push("Total");
                        dataA.push(msg.total);
                    }
                    for(var i in msg.models){
                        labelA.push(msg.models[i][labeltag].split("(")[0]);
                        dataA.push(msg.models[i][datatag]);
                    }
                    console.log(labeltag);
                    console.log(datatag);
                    console.log(msg.models);
                    var canvas  = document.getElementById("barcanvasm"+index);
                    var context = canvas.getContext('2d');
                    context.clearRect(0, 0, canvas.width,canvas.height);

                    new RGraph.Bar({
                        id: "barcanvasm"+index,
                        data: dataA,
                        options: {
                            gutterLeft:100,
                            gutterBottom:150,
                            labelsAbove:true,
                            textAngle:30,
                            labels: labelA,
                            shadow: true,
                            colors: ['red'],
                            strokestyle: 'rgba(0,0,0,0)'
                        }
                    }).draw();
                    cb();


                },
                error:function(jxr,scode){
                    $("#pleaseWaitDialog").modal("hide");
                    cb();
                }
            });
        }
        else{
            cb()
        }
    },function(err){

    });


}


var getHotWordBrandList = function(){
    $("#pleaseWaitDialog").modal("show");
    $.ajax({
        url: Constant.BASE_URL+"sadmin/spiderstatistics/hotword/brandlist/"+edata.statisticid,
        type: 'GET',
        success: function (data) {
            $("#pleaseWaitDialog").modal("hide");
            var msg = JSON.parse(data).body;
            edata.hotkeybrandlist = msg;
            SisDispatcher.dispatch({
                actionType: Constant.SPIDERLISTUPDATE
            });
            getHotWordCount();
        },
        error:function(jxr,scode){
            $("#pleaseWaitDialog").modal("hide");
        }
    });
};

var getHotWordCount = function(){
    // $("#pleaseWaitDialog").modal("show");
    var sid = edata.statisticid;
    var bid = edata.hotkeybrandlist[edata.hotkeybrandindex]._id;
    var canvas  = document.getElementById("hotwordbarcanvas");
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width,canvas.height);
    $("#ajaxloading").show();
    $.ajax({
        url: Constant.BASE_URL+"sadmin/spiderstatistics/hotword/stastic/"+bid+"/"+sid,
        type: 'GET',
        success: function (data) {
            $("#ajaxloading").hide();
            var msg = JSON.parse(data).body;
            // edata.hotkeybrandlist = msg;
            // SisDispatcher.dispatch({
            //     actionType: Constant.SPIDERLISTUPDATE
            // });
            var dataA = [];
            var labelA = [];
            for(var i in msg){
                dataA.push(msg[i].tf);
                labelA.push(msg[i].word);
            }
            new RGraph.Bar({
                id: "hotwordbarcanvas",
                data: dataA,
                options: {
                    gutterLeft:100,
                    gutterBottom:150,
                    labelsAbove:false,
                    textAngle:30,
                    labels: labelA,
                    shadow: true,
                    colors: ['red'],
                    strokestyle: 'rgba(0,0,0,0)'
                }
            }).draw();
        },
        error:function(jxr,scode){
            $("#ajaxloading").hide();
            $("#pleaseWaitDialog").modal("hide");
        }
    });
};

var getHotWordCountAll = function(){
    // $("#pleaseWaitDialog").modal("show");

    async.forEachOf(edata.hotkeybrandlist,function(v,index,cb){
        var sid = edata.statisticid;
        var bid = v._id;
        console.log(v.name)
        console.log("{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{")
        console.log("hotwordbarcanvas"+index);
        console.log(edata.hotkeybrandlist)
        var canvas = document.getElementById("hotwordbarcanvas"+0);
        console.log(canvas);
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width,canvas.height);
        $("#ajaxloading").show();
        $.ajax({
            url: Constant.BASE_URL+"sadmin/spiderstatistics/hotword/stastic/"+bid+"/"+sid,
            type: 'GET',
            success: function (data) {
                $("#ajaxloading").hide();
                var msg = JSON.parse(data).body;
                // edata.hotkeybrandlist = msg;
                // SisDispatcher.dispatch({
                //     actionType: Constant.SPIDERLISTUPDATE
                // });
                var dataA = [];
                var labelA = [];
                for(var i in msg){
                    dataA.push(msg[i].tf);
                    labelA.push(msg[i].word);
                }
                new RGraph.Bar({
                    id: "hotwordbarcanvas"+index,
                    data: dataA,
                    options: {
                        gutterLeft:100,
                        gutterBottom:150,
                        labelsAbove:false,
                        textAngle:30,
                        labels: labelA,
                        shadow: true,
                        colors: ['red'],
                        strokestyle: 'rgba(0,0,0,0)'
                    }
                }).draw();
                cb();
            },
            error:function(jxr,scode){
                $("#ajaxloading").hide();
                $("#pleaseWaitDialog").modal("hide");
                cb();
            }
        });
    },function(err){

    });


};

class Edatastore extends Store{
    getAll(){
        return edata;
    }
    __onDispatch(payload) {
        //alert(test)
        if(payload.actionType == Constant.TARGETCLICK){
            var index = payload.index;
            edata.currentIndex = index;
            this.__emitChange();
        }
        else if(payload.actionType == Constant.SPIDERLISTUPDATE){
            this.__emitChange();
        }
        else if(payload.actionType == Constant.GETHOTWORDBRAND){

        }
        else if(payload.actionType == Constant.GETSPIDERLIST){
            $("#ajaxloading").show();
            async.map(edata.targetList,function(item,callback){
                $.ajax({
                    url: Constant.BASE_URL+"sadmin/spiderlist/"+item,
                    type: 'GET',
                    success: function (data) {
                        $("#ajaxloading").hide();
                        var msg = JSON.parse(data);
                        callback(null,msg.body);
                    },
                    error:function(jxr,scode){
                        $("#ajaxloading").hide();
                        callback("error",null);
                    }
                });
            },function(err,results){
                edata.spiderlist = results;
                SisDispatcher.dispatch({
                    actionType: Constant.SPIDERLISTUPDATE
                });
            });
        }
        else if(payload.actionType == Constant.CREATESPIDER){
            $("#ajaxloading").show();
            $.ajax({
                url: Constant.BASE_URL+"sadmin/createspider",
                data: $.param({
                    spidername:edata.targetList[edata.currentIndex]
                }),
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#ajaxloading").hide();
                    var msg = JSON.parse(data);
                    SisDispatcher.dispatch({
                        actionType: Constant.GETSPIDERLIST
                    });
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

                        window.alert("There is a active spider running. You can not create another spider now.")

                    },
                    416:function(){
                        window.alert("For preventing from banned by site administrator, you can not create spider too frequently.")
                    }
                }
            });
        }
        else if(payload.actionType == Constant.EXPORTSPIDERDATA){
            var sp = edata.spiderlist[edata.currentIndex][payload.index];
            $("#pleaseWaitDialog").modal("show");
            $.ajax({
                url: Constant.BASE_URL+"sadmin/exportspider",
                data: $.param({
                    spidername:sp.name,
                    spiderid:sp._id
                }),
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#pleaseWaitDialog").modal("hide");
                    var msg = JSON.parse(data);
                    var fname = msg.body;
                    sp.downlink = fname;
                    SisDispatcher.dispatch({
                        actionType: Constant.SPIDERLISTUPDATE
                    });
                },
                error:function(jxr,scode){
                    $("#pleaseWaitDialog").modal("hide");
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

        }
        else if(payload.actionType == Constant.SHOWSPIDERSTATISTIC){
            var sp = edata.spiderlist[edata.currentIndex][payload.index];
            edata.statisticid = sp._id;

            if(edata.targetList[edata.currentIndex]=="nairaland"){
                getHotWordBrandList();
            }
            else{
                getStatistic();
            }
        }
        else if(payload.actionType == Constant.SPIDERSTASTICCHANGE){
            var value = payload.value;
            edata.currentstatistic = value;
            this.__emitChange();
            getStatistic();
        }
        else if(payload.actionType == Constant.SPIDERSTASTICCHANGEALL){
            var value = payload.value;
            edata.currentstatistic = value;
            this.__emitChange();
             getStatisticall();
        }
        else if(payload.actionType == Constant.HOTWORDBRANDCHANGE){
            var value = payload.value;
            edata.hotkeybrandindex = value;
            this.__emitChange();
            getHotWordCount();
        }
        else if(payload.actionType == Constant.HOTWORDBRANDCHANGEALL){
            var value = payload.value;
            edata.hotkeybrandindex = value;
            this.__emitChange();
            getHotWordCountAll();
        }
        else if(payload.actionType == Constant.DELETESPIDER){
            var sp = edata.spiderlist[edata.currentIndex][payload.index];
            $("#pleaseWaitDialog").modal("show");
            $.ajax({
                url: Constant.BASE_URL+"sadmin/deletespider",
                data: $.param({
                    spiderid:sp._id
                }),
                type: 'DELETE',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#pleaseWaitDialog").modal("hide");
                    var msg = JSON.parse(data);

                    SisDispatcher.dispatch({
                        actionType: Constant.GETSPIDERLIST
                    });
                },
                error:function(jxr,scode){
                    $("#pleaseWaitDialog").modal("hide");
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
        }
    }
}

export var edataStore = new Edatastore(SisDispatcher);