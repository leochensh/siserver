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
            var index = payload.logidex;
            $("#ajaxloading").show();
            $.ajax({
                url: Constant.BASE_URL+"sadmin/logs/delete",
                data: $.param({
                    logid:index
                }),
                type: 'DELETE',
                contentType: 'application/x-www-form-urlencoded',
                success: function(data){
                    $("#ajaxloading").hide();
                    var rindex = _.findIndex(logsList,function(item){
                        return item._id == index;
                    });
                    if(rindex>=0){
                        logsList.splice(rindex,1);

                        SisDispatcher.dispatch({
                            actionType: Constant.DELETELOGOK
                        });
                    }

                },
                error:function(){
                    $("#ajaxloading").hide();
                }
            });

        }
        else if(payload.actionType == Constant.DELETELOGOK){
            this.__emitChange();
        }
    }
}

export var logsStore = new LogsStore(SisDispatcher);