/**
 * Created by 张志良 on 2016/8/30.
 */
import {Store} from 'flux/utils';
import {SisDispatcher} from "../dispatcher"
import {Constant} from "../constant"
import _ from "underscore";
import async from "async"

var  logsList = [];
class LogsStore extends Store{
    getAll(){
        return logsList;
    }
    __onDispatch(payload){
        if(payload.actionType == Constant.GETLOGSLIST){
            logsList = payload.loglist;
            this.__emitChange();
        }
        else if(payload.actionType == Constant.DELETELOG){
            logsList.splice(payload.index,1);
            SisDispatcher.dispatch({
                actionType: Constant.DELETELOG
            });
        }
        else if(payload.actionType == Constant.DELETEAD){
            this.__emitChange();
        }
    }
}

export var logsStore = new LogsStore(SisDispatcher);