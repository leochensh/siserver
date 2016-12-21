import React from 'react';
import {loginStore} from '../store/loginstore';
import {personalStore} from '../store/personalstore'
import {newsurveyStore} from '../store/newsurveystore'
import {surveyEditListStore} from '../store/surveyeditliststore'
import {adStore} from '../store/adstore'
import {versionStore} from "../store/versionstore"
import {orgStore} from "../store/orgstore"
import {logsStore} from "../store/logsstore"
import {Link} from 'react-router'
import {Constant} from "../constant";
import {SisDispatcher} from "../dispatcher";
import {edataStore} from "../store/edatastore";
import {feedbackStore} from '../store/feedbackstore';
import {templateStore} from '../store/templatestore';
import crypto from "crypto"
import {Emailcheck} from "./emailcheck"

export var App = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired,
    },
    getInitialState(){
        return{
            password1st:"",
            password2nd:"",
            username:"",
            password:"",
            ifpassnotequal:false,
            iferrors:false,
            iffail:false,
            email:"",
            capcha:"",
            verifiedcode:"",
            usernamee:"",
            passwordd:"",
            repassword:"",
            iferror:false,
            errorstr:"",
            newcapcha:1,
            ifemailsend:false,
            secondcount:60

    }
    },
    componentDidMount(){
        this.token=loginStore.addListener(this._onChange);
        this.ptoken = personalStore.addListener(this._onChange);
        this.newstoken = newsurveyStore.addListener(this._onChange);
        this.eslisttoken = surveyEditListStore.addListener(this._onChange);
        this.adtoken = adStore.addListener(this._onChange);
        this.versiontoken = versionStore.addListener(this._onChange);
        this.orgtoken = orgStore.addListener(this._onChange);
        this.logtoken = logsStore.addListener(this._onChange);
        this.edatatoken = edataStore.addListener(this._onChange);
        this.Ftoken = feedbackStore.addListener(this._onChange);
        this.Ttoken = templateStore.addListener(this._onChange);
    },
    componentWillUnmount(){
        loginStore.remove(this.token);
        personalStore.remove(this.ptoken);
        newsurveyStore.remove(this.newstoken);
        surveyEditListStore.remove(this.eslisttoken);
        adStore.remove(this.adtoken);
        versionStore.remove(this.versiontoken);
        orgStore.remove(this.orgtoken);
        logsStore.remove(this.logtoken);
        edataStore.remove(this.edatatoken);
        feedbackStore.remove(this.Ftoken);
        templateStore.remove(this.Ttoken);
    },
    handleChange(name,event){
        var newstate = {};
        newstate[name] = event.target.value;
        newstate.iferrors = false;
        newstate.ifpassnotequal = false;
        this.setState(newstate);
    },
    keypress(event){
        //event.stopPropagation();
        if(event.key == "Enter"){
            this.handleClick(event);
        }
    },
    handleClick(event){
        if(!this.state.username || !this.state.password){
            this.setState({iferrors:true});
        }
        else{
            $("#ajaxloading").show();
            var hash = crypto.createHash("md5");
            hash.update(this.state.password);
            var that = this;
            $.ajax({
                url: Constant.BASE_URL+"admin/login",
                data: $.param({
                    username:that.state.username,
                    password:hash.digest("hex")
                }),
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    $("#loginsmodal").modal("hide");
                    var msg = JSON.parse(data);
                    $("#ajaxloading").hide();
                    that.context.router.push("/home");
                    SisDispatcher.dispatch({
                        actionType: Constant.LOGINSUCCESS,
                        role:msg.body.role,
                        id:msg.body.id,
                        name:msg.body.name
                    });


                },
                error:function(){
                    $("#ajaxloading").hide();
                    that.setState({iferrors:true});
                }
            });
        }
    },
    handleRegisterClick(){
        $("#loginsmodal").modal("hide");
        var newstate = {};
        newstate.email ="";
        newstate.capcha ="";
        newstate.verifiedcode ="";
        newstate.usernamee ="";
        newstate.passwordd ="";
        newstate.repassword ="";
        newstate.iferror =false;
        newstate.errorstr ="";
        newstate.newcapcha ="";
        newstate.ifemailsend =false;
        newstate.secondcount =60;
        this.setState(newstate);
        $("#zzlregistermodal").modal("show");
       //this.context.router.push("/register");
    },
    forgetpassword(){
        $("#loginsmodal").modal("hide");
        this.context.router.push("/forgetpass");
    },
    feedbackzzlclick(){
        /*
        var cpath = this.props.routes[this.props.routes.length-1]['path']
        if(cpath!="home" && cpath!="login"){
            this.context.router.push("/home");
        }
        */
        this.context.router.push("/addfeedback");
    },
    homeclick(){
        this.context.router.push("/home");
    },
    frontclick(){
        this.context.router.push("/frontpage");
    },
    loginclick(){
        var newstate = {};
        newstate.iferrors = false;
        newstate.username = "";
        newstate.password = "";
        this.setState(newstate);
        $("#loginsmodal").modal("show");
        //this.context.router.push("/login");
    },
    faqclick(){
        this.context.router.push("/faq");
    },

    _onChange() {
        var loginInfo = loginStore.getLoginInfo();
        if(!loginInfo.ifLogin){
           // this.context.router.push("/login");
            this.context.router.push("/frontpage");
        }
        this.setState({a:1});
    },
    logoutClick(){
        $("#logoutmodal").modal("show");
    },
    resetpassClick(){

        var newstate = {};
        newstate.password1st = "";
        newstate.password2nd = "";
        newstate.ifpassnotequal = false;
        newstate.iffail = false;
        this.setState(newstate);

        $("#allresetpass").modal("show");
    },
    confirmReset(){
        if(this.state.password1st && this.state.password2nd){
            if(this.state.password1st!=this.state.password2nd){
                this.setState({ifpassnotequal:true})
            }
            else{

                var hash = crypto.createHash("md5");
                hash.update(this.state.password1st);

                $("#ajaxloading").show();

                var that = this;
                $.ajax({
                    url: Constant.BASE_URL+"all/resetpass",
                    data: $.param({
                        password:hash.digest("hex")
                    }),
                    type: 'PUT',
                    contentType: 'application/x-www-form-urlencoded',
                    success: function (data) {
                        $("#allresetpass").modal("hide");
                        $("#ajaxloading").hide();

                    },
                    error:function(jxr,scode){
                        $("#allresetpass").hide();
                    },
                    statusCode:{
                        406:function(){
                            that.setState({
                                iffail: true
                            });
                        },
                        200:function(){
                        },
                        404:function(){
                            that.setState({
                                iffail: true
                            });
                        }
                    }
                });
            }
        }
    },
    gotologout(){
        var that = this;
        $.ajax({
            url: Constant.BASE_URL+"logout",
            type: 'GET',
            success: function (data) {
                $("#logoutmodal").modal("hide");
                SisDispatcher.dispatch({
                    actionType: Constant.LOGOUT

                });
            },
            error:function(jxr,scode){
            },
            statusCode:{
                406:function(){
                },
                500:function(){
                },
                409:function(){
                }
            }
        });
    },
    capchaClick(){
        this.setState({
            newcapcha:this.state.newcapcha+1
        })
    },
    getVerifiedCode(){
        if(!this.state.capcha){
            this.setState({
                errorstr:"Please input capcha code first.",
                iferror:true
            })
        }
        else{
            $("#ajaxloading").show();
            var that = this;
            this.setState({
                ifemailsend:true
            });
            var intervalId = setInterval(function(){
                that.setState({
                    secondcount:parseInt(that.state.secondcount)-10
                })
            },10000);
            setTimeout(function(){
                clearInterval(intervalId);
                that.setState({
                    ifemailsend:false,
                    secondcount:60
                })
            },60000);
            $.ajax({
                url: Constant.BASE_URL+"checkcapcha",
                data: $.param({
                    capchacode:that.state.capcha
                }),
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {

                    $("#ajaxloading").hide();
                    if(that.state.email && Emailcheck.validateEmail(that.state.email)){
                        $("#ajaxloading").show();
                        $.ajax({
                            url: Constant.BASE_URL+"sendverifiedcode",
                            data: $.param({
                                email:that.state.email,
                                capchacode:that.state.capcha
                            }),
                            type: 'POST',
                            contentType: 'application/x-www-form-urlencoded',
                            success: function (data) {

                                var msg = JSON.parse(data);
                                $("#ajaxloading").hide();
                                that.setState({
                                    iferror:true,
                                    errorstr:"A email containing verified code already was send to your email. Please check your inbox or spam folder."
                                })
                            },
                            error:function(){
                                $("#ajaxloading").hide();
                                that.setState({
                                    iferror:true,
                                    errorstr:"Internal server error. Please try again later or contact administrator."
                                });
                            }
                        });
                    }
                    else{
                        that.setState({
                            iferror:true,
                            errorstr:"You should input a valid email address to receive verified code."
                        })
                    }
                },
                error:function(){
                    $("#ajaxloading").hide();
                    clearInterval(intervalId);
                    that.setState({
                        ifemailsend:false,
                        secondcount:60
                    })
                },
                statusCode:{
                    404:function(){
                        that.setState({
                            iferror:true,
                            errorstr:"Capcha code error."});
                    }
                }
            });

        }

    },
    handlejoinClick(event){
        if(!this.state.usernamee ||
            !this.state.passwordd ||
            !this.state.repassword||
            !this.state.email ||
            !this.state.verifiedcode){
            this.setState({
                iferror:true,
                errorstr:"Form input can not be empty"});
        }
        else{
            if(this.state.passwordd!=this.state.repassword){
                this.setState({
                    iferror:true,
                    errorstr:"Reenter password should be same as password."});
            }
            else{
                $("#ajaxloading").show();
                var hash = crypto.createHash("md5");
                hash.update(this.state.passwordd);
                var that = this;
                $.ajax({
                    url: Constant.BASE_URL+"addpersonalfree",
                    data: $.param({
                        name:that.state.usernamee,
                        password:hash.digest("hex"),
                        email:that.state.email,
                        verifiedcode:that.state.verifiedcode
                    }),
                    type: 'POST',
                    contentType: 'application/x-www-form-urlencoded',
                    success: function (data) {
                        $("#zzlregistermodal").modal("hide");
                        var msg = JSON.parse(data);
                        $("#ajaxloading").hide();

                    },
                    error:function(){
                        $("#ajaxloading").hide();
                    },
                    statusCode:{
                        404:function(){
                            that.setState({
                                iferror:true,
                                errorstr:"Verified code error."});
                        },
                        500:function(){
                            SisDispatcher.dispatch({
                                actionType: Constant.ERROR500
                            });
                        },
                        409:function(){
                            that.setState({
                                iferror:true,
                                errorstr:"User name or email duplicated."});
                        }
                    }
                });
            }

        }
    },
    render() {
        var logoutStyle = {display:"none"};
        var iflogoutStyle = {};
        var loginer ="";
        var loginInfo = loginStore.getLoginInfo();
        if(loginInfo.ifLogin){
            logoutStyle = {};
            iflogoutStyle = {display:"none"};
            loginer = loginInfo.name + " is logged in";
        }
        var notequalpassstyle = {display:"none"};
        if(this.state.ifpassnotequal){
            notequalpassstyle = {}
        }
        var failerror = {display:"none"};
        if(this.state.iffail){
            failerror = {}
        }
        var disStyle = this.state.iferrors?{}:{display:"none"};
        var disStylee = this.state.iferror?{}:{display:"none"};
        var emailCheckButtonClass = "btn btn-info";
        var emailButtonText = "Get verified code";
        if(this.state.ifemailsend){
            emailCheckButtonClass = "btn btn-info disabled"
            emailButtonText = "Resend after "+this.state.secondcount
        }
        return (
            <div>
                <nav className="navbar navbar-default navbar-fixed-top" style={{backgroundColor:"#FFFFFF",borderWidth:"0 0 0px"}}>
                    <div className="container-fluid">
                        <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1" style={{position:"relative"}}>
                            <ul className="nav navbar-nav">
                                <li>
                                    <a onClick={this.frontclick}>
                                        <img src="image/LOGO_text.png"/>
                                    </a>
                                </li>
                                <li style={{paddingTop:"15px"}}>│</li>

                                <li><a href="http://10.150.17.10:81">Link</a></li>

                                <li><a onClick={this.faqclick}>FAQ</a></li>
                                <li><a onClick={this.feedbackzzlclick}>Feedback</a></li>
                                <li style={logoutStyle}><a onClick={this.homeclick}>Home</a></li>
                            </ul>
                            <div>
                                <a style={{position:"absolute",top:"15px",left:"900px"}}><marquee style={{color:"red",width:"200", height:"40", scrolldelay:"10", scrollamount:"2"}} >{loginer}</marquee></a>
                            </div>
                            <ul className="nav navbar-nav navbar-right">
                                <li style={logoutStyle}><a onClick={this.resetpassClick}>Setting</a></li>
                                <li style={logoutStyle}><a onClick={this.logoutClick}>Logout</a></li>
                                <li style={iflogoutStyle}><a onClick={this.loginclick}>Login</a></li>
                                <li style={iflogoutStyle}><a type="button" onClick={this.handleRegisterClick} className="btn" style={{backgroundColor:"#00c7ff",color:"#FFFFFF",borderRadius:"20px",marginTop:"10px",paddingTop:"5px",height:"30px"}} >Register</a></li>
                            </ul>

                        </div>
                    </div>
                </nav>
                <div className="modal fade" id="logoutmodal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" id="myModalLabel">Logout</h4>
                            </div>
                            <div className="modal-body">
                                Are you sure to logout?
                            </div>
                            <div className="modal-footer">
                                <a type="button"
                                   onClick={this.gotologout}
                                   className="btn btn-primary">Confirm</a>
                                <a type="button" className="btn btn-default" data-dismiss="modal">Close</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    style={{zIndex:1501}}
                    className="modal fade bs-example-modal-sm" id="loginsmodal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">
                    <div className="modal-dialog modal-sm" role="document">
                        <div className="modal-content">
                            <button type="button"
                                    style={{marginTop:"10px",marginRight:"15px"}}
                                    className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <div className="col-sm-offset-4 col-sm-10" style={{marginTop:"20px",marginBottom:"20px"}}>
                                <a>
                                    <img style={{width:"80px",height:"80px"}} src="image/LOGO.png"/>
                                </a>
                            </div>
                            <form className="form-horizontal">
                                <div className="form-group form-group-lg">
                                    <div className="col-sm-offset-1 col-sm-10">
                                        <input type="text"
                                               className="form-control"
                                               placeholder="Username"
                                               style={{height:"40px"}}
                                               value={this.state.username}
                                               onChange={this.handleChange.bind(this,"username")}
                                            />
                                    </div>
                                </div>
                                <div className="form-group form-group-lg">

                                    <div className="col-sm-offset-1 col-sm-10">
                                        <input type="password"
                                               ref="nameInput"
                                               onKeyPress={this.keypress}
                                               className="form-control"
                                               placeholder="Password"
                                               style={{height:"40px"}}
                                               value={this.state.password}
                                               onChange={this.handleChange.bind(this,"password")}
                                            />
                                    </div>
                                </div>
                                <div className="form-group form-group-lg">

                                    <div className="col-sm-offset-1 col-sm-10">

                                        <div className="checkbox">
                                                <label>
                                                    <a
                                                        onClick={this.forgetpassword}
                                                        >Forget password?</a>
                                                </label>
                                        </div>

                                    </div>

                                </div>
                                <div className="form-group form-group-lg">
                                    <div className="col-sm-offset-1 col-sm-10">
                                        <p> <a type="button"
                                               onClick={this.handleClick}
                                               className="btn btn-info"
                                               style={{width:"240px",height:"40px",borderRadius:"20px"}}
                                            >Login</a></p>
                                    </div>
                                </div>

                                <div className="form-group form-group-lg">
                                    <div className="col-sm-offset-1 col-sm-10">
                                        <p><a type="button"
                                              className="btn btn-default"
                                              style={{width:"240px",height:"40px",borderRadius:"20px"}}
                                              onClick={this.handleRegisterClick}
                                            >Register</a></p>
                                    </div>
                                </div>
                            </form>
                            <div className="alert alert-danger loginalert" role="alert" style={disStyle}>
                                Username/Password error
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade "
                     style={{zIndex:1501}}
                     id="zzlregistermodal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog " role="document">
                        <div className="modal-content">
                            <button type="button"
                                    style={{marginTop:"10px",marginRight:"14px"}}
                                    className="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span className="sr-only">Close</span></button>

                            <div className="col-sm-offset-5 col-sm-10" style={{marginTop:"20px",marginBottom:"20px"}}>
                                <a>
                                    <img style={{width:"80px",height:"80px"}} src="image/LOGO.png"/>
                                </a>
                            </div>
                            <form className="form-horizontal">
                                <div className="form-group form-group-lg">

                                    <div className="col-sm-8 col-sm-offset-2">
                                        <input type="email"
                                               style={{height:"40px"}}
                                               className="form-control"
                                               placeholder="Email"
                                               value={this.state.email}
                                               onChange={this.handleChange.bind(this,"email")}
                                            />
                                    </div>
                                </div>
                                <div className="form-group form-group-lg">

                                    <div className="col-sm-5 col-sm-offset-2">
                                        <input type="text"
                                               style={{height:"40px"}}
                                               className="form-control"
                                               placeholder="Capcha"
                                               value={this.state.capcha}
                                               onChange={this.handleChange.bind(this,"capcha")}
                                            />
                                    </div>
                                    <div className="col-sm-1">
                                        <img style={{width:"126px",height:"40px"}}onClick={this.capchaClick} src={Constant.BASE_URL+"getcapcha"+"?"+this.state.newcapcha} />
                                    </div>
                                </div>
                                <div className="form-group form-group-lg">

                                    <div className="col-sm-5 col-sm-offset-2">
                                        <input type="text"
                                               style={{height:"40px"}}
                                               className="form-control"
                                               placeholder="Verified code"
                                               value={this.state.verifiedcode}
                                               onChange={this.handleChange.bind(this,"verifiedcode")}
                                            />
                                    </div>
                                    <div className="col-sm-1">
                                        <a
                                            style={{width:"126px",height:"40px",borderRadius:"20px"}}
                                            className={emailCheckButtonClass}
                                            onClick={this.getVerifiedCode}
                                            >{emailButtonText}</a>
                                    </div>
                                </div>
                                <div className="form-group form-group-lg">

                                    <div className="col-sm-8 col-sm-offset-2">
                                        <input type="text"
                                               className="form-control"
                                               style={{height:"40px"}}
                                               placeholder="Username"
                                               value={this.state.usernamee}
                                               onChange={this.handleChange.bind(this,"usernamee")}
                                            />
                                    </div>
                                </div>
                                <div className="form-group form-group-lg">

                                    <div className="col-sm-8 col-sm-offset-2">
                                        <input type="password"
                                               className="form-control"
                                               style={{height:"40px"}}
                                               placeholder="Password"
                                               value={this.state.passwordd}
                                               onChange={this.handleChange.bind(this,"passwordd")}
                                            />
                                    </div>
                                </div>
                                <div className="form-group form-group-lg">

                                    <div className="col-sm-8 col-sm-offset-2">
                                        <input type="password"
                                               className="form-control"
                                               style={{height:"40px"}}
                                               placeholder="Retype password"
                                               value={this.state.repassword}
                                               onChange={this.handleChange.bind(this,"repassword")}
                                            />
                                    </div>
                                </div>

                                <div className="form-group form-group-lg">
                                    <div className="col-sm-8 col-sm-offset-2">
                                        <a
                                            type="button"
                                            onClick={this.handlejoinClick}
                                            className="btn btn-info"
                                            style={{width:"388px",height:"40px",borderRadius:"20px"}}
                                            >Create Account</a>
                                    </div>

                                </div>
                            </form>
                            <div className="alert alert-danger loginalert" role="alert" style={disStylee}>
                                {this.state.errorstr}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal fade" id="allresetpass" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" >Reset Password</h4>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="form-group">
                                        <label htmlFor="personnewpass">New Password</label>
                                        <input type="password" className="form-control" id="personnewpass" placeholder="New Password"
                                               onChange={this.handleChange.bind(this,"password1st")} value={this.state.password1st}/>
                                        <label htmlFor="personnewpass2nd">Retype New Password</label>
                                        <input type="password" className="form-control" id="personnewpass2nd" placeholder="New Password Again"
                                               onChange={this.handleChange.bind(this,"password2nd")} value={this.state.password2nd}/>
                                    </div>

                                </form>

                                <div className="alert alert-danger col-md-8" role="alert" style={notequalpassstyle}>
                                    You should input same password twice.
                                </div>
                                <div className="alert alert-danger col-md-8" role="alert" style={failerror}>
                                    Resetpassword fail.
                                </div>


                            </div>
                            <div className="modal-footer">
                                <a type="button" className="btn btn-default" data-dismiss="modal">Cancel</a>
                                <a type="button" className="btn btn-primary" onClick={this.confirmReset}>Confirm</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal fade" id="pleaseWaitDialog"  tabIndex="100" role="dialog" >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1>Processing...</h1>
                            </div>
                            <div className="modal-body">
                                <div className="progress progress-striped active">
                                    <div className="bar" style={{width:"100%"}}></div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
                {
                    this.props.children && React.cloneElement(this.props.children,
                        {loginInfo:loginStore.getLoginInfo(),
                            newsurvey:newsurveyStore.getAll(),
                            personalList:personalStore.getAll(),
                            surveyeditlist:surveyEditListStore.getAll(),
                            adlist:adStore.getAll(),
                            versionlist:versionStore.getAll(),
                            orglist:orgStore.getAll(),
                            orgdata:orgStore.getData(),
                            edata:edataStore.getAll(),
                            feedbackList:feedbackStore.getAll(),
                            logsList:logsStore.getAll(),
                            templateList:templateStore.getAll()
                        })
                }
            </div>
        )
    }
});

