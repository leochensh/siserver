/**
 * Created by 张志良 on 2016/9/21.
 */
import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import crypto from "crypto"

export var Faq = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },

    getInitialState(){
        return {


        }
    },
    render(){

        return(
                <div className="row" style={{position:"relative"}}>
                    <div className="col-md-3">
                        <div className="row"style={{position:"absolute",top:"20px",left:"150px",width:"150px",height:"80px",backgroundColor:"#00c7ff"}}>
                            <div className="row"style={{position:"absolute",left:"50px"}}>
                                <h1 style={{color:"#FFFFFF"}}>FAQ</h1>

                            </div>
                        </div>




                    </div>
                    <div className="col-md-3 col-md-offset-1" style={{position:"absolute",top:"20px",left:"200px"}}>
                        <div className="row" style={{width:"700px"}}>
                            <p><h3><b>Why</b> use Ouresa?</h3></p>
                            <p><h5>Ouresa can help you share surveys securely and collaborate on all aspects of  your survey projects with</h5></p>
                            <p><h5>Team Collaboration.</h5></p>
                            <hr style={{width:"700px"}}/>
                        </div>

                        <div className="row" style={{width:"700px"}}>
                            <p><h4><b>What</b> can Ouresa do?</h4></p>
                            <p><h5>Ouresa can help you share surveys securely and collaborate on all aspects of your survey prohects with</h5></p>
                            <p><h5>Collaboration.</h5></p>
                            <hr style={{width:"700px"}}/>
                        </div>

                        <div className="row" style={{width:"700px"}}>
                            <p><h3><b>What</b> question types can Ouresa supported?</h3></p>
                            <p><h5>Ouresa can help you share surveys securely  and collaborate on all aspects of your survey Collaboration.</h5></p>
                            <hr style={{width:"700px"}}/>
                        </div>

                        <div className="row" style={{width:"700px"}}>
                            <p><h3><b>Why</b> use Ouresa?</h3></p>
                            <p><h5>Ouresa can help you share surveys securely and collaborate.</h5></p>

                        </div>
                    </div>

                </div>


        )

    }
});