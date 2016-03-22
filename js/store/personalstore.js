import {Store} from 'flux/utils';
import {SisDispatcher} from "../dispatcher"
import {Constant} from "../constant"

var personalList = [];

class PersonalStore extends Store{
    getAll(){
        return personalList;
    }
    __onDispatch(payload){
        //alert(test)
        if(payload.actionType == Constant.GETPERSONAL_LIST){
            personalList = payload.plist;
            this.__emitChange();
        }
        else if(payload.actionType == Constant.ADDNEWPERSON){
            this.__emitChange();
        }
    }
}

export var personalStore = new PersonalStore(SisDispatcher);