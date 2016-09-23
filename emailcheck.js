module.exports = {
    validateEmail:function(email){
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    },
    safeJsonParse:function(jstr,alt){
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