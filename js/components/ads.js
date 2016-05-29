import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
var Dropzone = require('react-dropzone');

export var Ads = React.createClass({
    getInitialState(){
        return{
            newadimage:null,
            newadlink:null,
            newadtitle:null,

            newplatform:Constant.PLATFORMTYPE_ANDROID,
            newfileurl:null,
            newversionnum:null
        }
    },
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    deleteAd(index){
        var infunc = function(){
            SisDispatcher.dispatch({
                actionType: Constant.DELETEAD,
                index:index
            });
        };
        return infunc;
    },
    deleteVersion(index){
        var infunc = function(){
            SisDispatcher.dispatch({
                actionType: Constant.DELETEVERSION,
                index:index
            });
        };
        return infunc;
    },
    handleChange(name,event){
        var newstate = {};
        newstate[name] = event.target.value;
        this.setState(newstate);
    },
    confirmNew:function(){
        if(this.state.newadimage && this.state.newadlink && this.state.newadtitle){
            SisDispatcher.dispatch({
                actionType: Constant.ADDAD,
                title:this.state.newadtitle,
                link:this.state.newadlink,
                image:this.state.newadimage
            });
            $("#newad").modal("hide");
        }
    },
    confirmNewVersion:function(){
        if(this.state.newplatform && this.state.newfileurl && this.state.newversionnum){
            SisDispatcher.dispatch({
                actionType: Constant.VERSIONADD,
                platform:this.state.newplatform,
                versionnum:this.state.newversionnum,
                fileurl:this.state.newfileurl
            });
            $("#newversion").modal("hide");

        }
    },
    componentDidMount (){
        this.getAdList();
        this.getVersionList();
    },

    getAdList(){
        SisDispatcher.dispatch({
            actionType: Constant.GETADLIST,
        });
    },
    getVersionList(){
        SisDispatcher.dispatch({
            actionType: Constant.GETVERSIONLIST,
        });
    },
    onDropAd: function (files) {
        console.log(files[0].name);
        var data = new FormData();
        data.append("name",files[0].name);
        data.append("file",files[0]);
        $("#ajaxloading").show();
        var that  = this;
        $.ajax({
            url: Constant.BASE_URL+"staff/upload/image",
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: function(data){
                $("#ajaxloading").hide();
                that.setState({
                    newadimage:JSON.parse(data).body
                });
                $("#newad").modal("show");
            },
            error:function(jxr,scode){
                $("#ajaxloading").hide();
            }
        });
    },
    onDropVersion: function (files) {
        console.log(files[0].name);
        var data = new FormData();
        data.append("name",files[0].name);
        data.append("file",files[0]);
        $("#ajaxloading").show();
        var that  = this;
        $.ajax({
            url: Constant.BASE_URL+"staff/upload/audio",
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: function(data){
                $("#ajaxloading").hide();
                that.setState({
                    newfileurl:JSON.parse(data).body
                });
                $("#newversion").modal("show");
            },
            error:function(jxr,scode){
                $("#ajaxloading").hide();
            }
        });
    },
    render(){
        var mlist = [];
        var vlist = [];
        var newimage = "";
        if(this.state.newadimage){
            newimage = <img style={{maxWidth:"200px"}} src={Constant.BASE_IMAGEURL+this.state.newadimage}/>
        }
        for(var i in this.props.adlist){
            var ad = this.props.adlist[i];
            var image = (
                <img style={{maxWidth:"200px"}} src={Constant.BASE_IMAGEURL+ad.image}/>
            );


            mlist.push(
                <tr key={"adlist"+i}>
                    <td>{(parseInt(i)+1)}</td>
                    <td>{ad.title}</td>
                    <td>{image}</td>
                    <td>{ad.link}</td>
                    <td>{new Date(ad.ctime).toLocaleString()}</td>
                    <td className="list_btn">
                        <div className="btn-group" role="group" >
                            <a
                                type="button"
                                onClick={this.deleteAd(i)}
                                className="btn btn-danger">Delete</a>

                        </div>
                    </td>

                </tr>
            );
        }
        for(var i in this.props.versionlist){
            var version = this.props.versionlist[i];

            vlist.push(
                <tr key={"verlist"+i}>
                    <td>{(parseInt(i)+1)}</td>
                    <td>{version.platform}</td>
                    <td>
                        <a href={Constant.BASE_IMAGEURL+version.fileurl}>
                            {Constant.BASE_IMAGEURL+version.fileurl}
                        </a>
                    </td>
                    <td>{version.versionnum}</td>
                    <td>{new Date(version.ctime).toLocaleString()}</td>
                    <td className="list_btn">
                        <div className="btn-group" role="group" >
                            <a
                                type="button"
                                onClick={this.deleteVersion(i)}
                                className="btn btn-danger">Delete</a>

                        </div>
                    </td>

                </tr>
            );
        }

        return(
            <div>
                <ul className="nav nav-tabs" role="tablist">
                    <li role="presentation" className="active"><a href="#ads" aria-controls="ads" role="tab" data-toggle="tab">Ads Management</a></li>
                    <li role="presentation"><a href="#clientversion" aria-controls="clientversion" role="tab" data-toggle="tab">Client Version</a></li>
                </ul>

                <div className="tab-content">
                    <div role="tabpanel" className="tab-pane active" id="ads">
                        <div className="panel panel-default paddingpanel">

                            <Dropzone onDrop={this.onDropAd} accept="image/*">
                                <div>Drop ad image file here or click.</div>
                            </Dropzone>

                            <table  className="table" >
                                <thead>
                                <tr>
                                    <th><span className="">##</span></th>
                                    <th><span className="">Title</span></th>
                                    <th><span className="">Image</span></th>
                                    <th><span className="">Link</span></th>
                                    <th><span className="">Ctime</span></th>
                                    <th><span className="">Operations</span></th>
                                </tr>
                                </thead>
                                <tbody>

                                {mlist}

                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div role="tabpanel" className="tab-pane" id="clientversion">
                        <div className="panel panel-default paddingpanel">

                            <Dropzone onDrop={this.onDropVersion} accept="*.apk">
                                <div>Drop apk file here</div>
                            </Dropzone>

                            <table  className="table" >
                                <thead>
                                <tr>
                                    <th><span className="">##</span></th>
                                    <th><span className="">Platform</span></th>
                                    <th><span className="">Download Link</span></th>
                                    <th><span className="">Version Number</span></th>
                                    <th><span className="">Ctime</span></th>
                                    <th><span className="">Operations</span></th>
                                </tr>
                                </thead>
                                <tbody>
                                {vlist}

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="newad" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" id="newmedialable">New Ad</h4>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="form-group">
                                        <label htmlFor="adtitle">Title</label>
                                        <input type="text" className="form-control" id="adtitle" placeholder="Ad title"
                                               onChange={this.handleChange.bind(this,"newadtitle")} value={this.state.newadtitle}/>
                                        <label htmlFor="adlink">Link</label>
                                        <input type="text" className="form-control" id="adlink" placeholder="Ad link"
                                               onChange={this.handleChange.bind(this,"newadlink")} value={this.state.newadlink}/>
                                        {newimage}
                                    </div>

                                </form>

                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button" className="btn btn-primary" onClick={this.confirmNew}>Confirm</a>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="modal fade" id="newversion" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" >New Version</h4>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="form-group">
                                        <label htmlFor="versionplatform">Platform</label>
                                        <input type="text" className="form-control" id="versionplatform" placeholder="platform"
                                                value={this.state.newplatform}/>
                                        <label htmlFor="versionnum">Link</label>
                                        <input type="text" className="form-control" id="versionnum" placeholder="Version Number"
                                               onChange={this.handleChange.bind(this,"newversionnum")} value={this.state.newversionnum}/>
                                    </div>

                                </form>

                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button" className="btn btn-primary" onClick={this.confirmNewVersion}>Confirm</a>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        )
    }
});