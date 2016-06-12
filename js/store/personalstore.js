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
            var role = payload.role;
            $("#ajaxloading").show();
            if(role == "sadmin"){
                $.ajax({
                    url: Constant.BASE_URL+"sadmin/personal/list",

                    type: 'GET',
                    success: function (data) {
                        $("#ajaxloading").hide();
                        var msg = JSON.parse(data);
                        personalList = msg.body;

                        SisDispatcher.dispatch({
                            actionType: Constant.FORCESTAFFLISTREFRESH
                        });


                    },
                    error:function(){
                        $("#ajaxloading").hide();
                    },
                    statusCode:{

                        500:function(){
                            SisDispatcher.dispatch({
                                actionType: Constant.ERROR500
                            });
                        }
                    }
                });
            }
            else if(role == "admin"){
                $.ajax({
                    url: Constant.BASE_URL+"admin/staff/list",

                    type: 'GET',
                    success: function (data) {
                        $("#ajaxloading").hide();
                        var msg = JSON.parse(data);
                        personalList = msg.body;

                        SisDispatcher.dispatch({
                            actionType: Constant.FORCESTAFFLISTREFRESH
                        });

                    },
                    error:function(){
                        $("#ajaxloading").hide();
                    },
                    statusCode:{

                        500:function(){
                            SisDispatcher.dispatch({
                                actionType: Constant.ERROR500
                            });
                        }
                    }
                });
            }

        }
        else if(payload.actionType == Constant.ADDNEWPERSON){
            this.__emitChange();
        }
        else if(payload.actionType == Constant.FORCESTAFFLISTREFRESH){
            this.__emitChange();
        }
    }
}

export var personalStore = new PersonalStore(SisDispatcher);