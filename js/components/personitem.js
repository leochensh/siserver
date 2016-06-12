import React from 'react';
import {Constant} from "../constant"
import {SisDispatcher} from "../dispatcher";
import crypto from "crypto"

export var PersonItem = React.createClass({
    resetClick(){
        this.props.resetClick(this.props._id)
    },
    render(){
        var id = this.props.id;
        var name = this.props.name;
        var ctime = this.props.ctime;

        return(
            <tr>
                <td>{parseInt(id)+1}</td>
                <td>{name}</td>
                <td>{new Date(ctime).toLocaleString()}</td>
                <td className="list_btn">
                    <input type="submit" name="reset" value="Reset Password"
                        onClick={this.resetClick}
                    />

                </td>

            </tr>)
    }
});