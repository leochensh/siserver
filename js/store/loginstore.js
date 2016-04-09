import {Store} from 'flux/utils';
import {SisDispatcher} from "../dispatcher"
import {Constant} from "../constant"

var loginInfo = {
    ifLogin:false,
    role:null,
    id:null
};

class LoginStore extends Store{
    getLoginInfo(){
        return loginInfo;
    }
    __onDispatch(payload){
        //alert(test)
        if(payload.actionType == Constant.LOGINSUCCESS){
            loginInfo.ifLogin = true;
            loginInfo.role = payload.role;
            loginInfo.id = payload.id;
            this.__emitChange();
        }
        else if(payload.actionType == Constant.ERROR500){
            loginInfo.ifLogin = false;
            loginInfo.role = null;
            loginInfo.id = null;
            this.__emitChange();
        }
    }
}

export var loginStore = new LoginStore(SisDispatcher);