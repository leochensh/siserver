#coding:utf-8
QList = [
    { 
        "selectlist" :
            [ 
                { 
                    "type" : "textselect",
                    "title" : "one select"
                }, 
                { 
                    "type" : "textselect", 
                    "title" : "two select" 
                },
                { 
                    "type" : "textselect", 
                    "title" : "three select" 
                },
                { 
                    "type" : "textselect", 
                    "title" : "four select" 
                }
            ],        
        "type" : "singleselect",
        "title" : "Which one do you like?",        
        "ifhasprecedent":False
    },
    {   "type" : "description",
        "title" : "What is your name?",        
        "ifhasprecedent":False
    },
    { 
        "selectlist" :
            [ 
                { 
                    "type" : "textselect",
                    "title" : "one select"
                }, 
                { 
                    "type" : "textselect", 
                    "title" : "two select" 
                },
                { 
                    "type" : "textselect", 
                    "title" : "three select" 
                },
                { 
                    "type" : "textselect", 
                    "title" : "four select" 
                }
            ],        
        "type" : "multiselect",
        "title" : "Which one do you like?",
        
        "ifhasprecedent":False,
        "precedentid":"56dbd7b293517f949020c18f",
        "precedentselectindex":2
    }
]

Answer = {
    "surveyid" : "56dbd7b293517f949020c18c",
    "longitude":121.5168,
    "latitude":31.16961,
    "begintime":"2016-03-06T07:09:38.998Z",
    "endtime":"2016-03-06T07:09:48.998Z",
    "answerlist" :
        [
            {
                "questionid" : "56dbd7b293517f949023c18e",
                "selectindexlist":[0,1],
                "scorelist":[
                    {
                        "index":0,
                        "score":4,
                    },
                    {
                        "index":1,
                        "score":4,
                    },
                    {
                        "index":2,
                        "score":4,
                    },
                    {
                        "index":3,
                        "score":4,
                    }
                 ],
                "sortlist":[
                    {
                        "index":0,
                        "sort":2,
                    },
                    {
                        "index":1,
                        "sort":3,
                    },
                    {
                        "index":2,
                        "sort":0,
                    },
                    {
                        "index":3,
                        "sort":1,
                    }
                 ],
                "selectextra":[
                     {
                        "index":1,
                        "text":"",
                        "image":"",
                        "audio":""
                     }
                ],
                "text":"",
                "image":"",
                "audio":"",
                "begintime":"2016-03-06T07:09:38.998Z",
                "endtime":"2016-03-06T07:09:48.998Z"
            },
            {
                "questionid" : "56dbd7b293517f949023c18e",
                "selectindexlist":[0,1],
                "text":"",
                "image":"",
                "audio":"",
                "begintime":"2016-03-06T07:09:38.998Z",
                "endtime":"2016-03-06T07:09:48.998Z"
            }
        ],
}
