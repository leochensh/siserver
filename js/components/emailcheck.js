export var Emailcheck = {
    validateEmail(email){
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    },
    validatePhone(phone){
        var myreg = /^1[3|4|5|7|8]\d{9}$/;
        return myreg.test(phone);
    },
    safeJsonParse(jstr,alt){
        var result = null;
        try{
            result = JSON.parse(jstr);
        }
        catch(e){
            result = alt;
        }
        return result;
    }
}