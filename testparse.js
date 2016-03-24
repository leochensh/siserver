var parse = require('csv-parse');
var fs = require('fs');

fs.readFile("./testparse.csv",function(err,data){
    parse(data,function(err,output){
        if(output[4][2].trim() == "0"){
            console.log("string");
        }
        else{
            console.log("number")
        }
    })
})