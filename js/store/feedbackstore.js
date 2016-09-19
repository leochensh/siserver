/**
 * Created by 张志良 on 2016/9/9.
 */
import {Store} from 'flux/utils';
import {SisDispatcher} from "../dispatcher"
import {Constant} from "../constant"
import _ from "underscore";
import async from "async"

var feedbackList = [];

class FeedbackStore extends Store{
    getAll(){
        return feedbackList;
    }
    __onDispatch(payload){

        if(payload.actionType == Constant.GETFEEDBACKLIST){
            feedbackList = payload.Flist;
            this.__emitChange();
        }

    }
}

export var feedbackStore = new FeedbackStore(SisDispatcher);