import {Store} from 'flux/utils';
import {SisDispatcher} from "../dispatcher"
import {Constant} from "../constant"
import _ from "underscore";

var surveyData = {
    surveyname:"new survey",
    ifSaved:false,
    surveyid:null,
    ifSurveyNameEmpty:false,
    surveystatus:Constant.SURVEYSTATUS_EDIT,
    qlist:[]
}

class NewsurveyStore extends Store{
    getAll(){
        return surveyData;
    }
    __onDispatch(payload){
        //alert(test)
        if(payload.actionType == Constant.SURVEYVALUECHANGE){
            surveyData[payload.name] = payload.value;
            this.__emitChange();
        }
        else if(payload.actionType == Constant.CLEANSURVEYDATA){
            surveyData = {
                surveyname:"new survey",
                ifSaved:false,
                surveyid:null,
                ifSurveyNameEmpty:false,
                qlist:[]
            };
            this.__emitChange();
        }
        else if(payload.actionType == Constant.SURVEYDATABATCHCHANGE){
            var ka = _.keys(payload.value);
            for(var i in ka){
                surveyData[ka[i]] = payload.value[ka[i]];
            }
            this.__emitChange();
        }
        else if(payload.actionType == Constant.LOADCSV){

        }
    }
}

export var newsurveyStore = new NewsurveyStore(SisDispatcher);