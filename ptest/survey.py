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