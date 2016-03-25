export var Constant = {

    LOGINSUCCESS:"loginsuccess",
    GETPERSONAL_LIST:"getpersonallist",
    ADDNEWPERSON:"addnewperson",
    SURVEYVALUECHANGE:"surveyvaluechange",
    CLEANSURVEYDATA:"cleansurveydata",
    SURVEYDATABATCHCHANGE:"surveydatabatchchange",
    LOADCSV:"loadcsv",

    QTYPE_SINGLESELECT:"singleselect",
    QTYPE_MULTISELECT:"multiselect",
    QTYPE_DESCRIPTION:"description",
    QTYPE_SEQUENCE:"sequence",
    QTYPE_SCORE:"score",

    SELECTTYPE_TEXT:"textselect",
    SELECTTYPE_IMAGE:"imageselect",
    SELECTTYPE_VIDEO:"videoselect",
    SELECTTYPE_AUDIO:"audioselect",
    SELECTTYPE_DESCRIPTION:"descriptionselect",

    QTYPE_NAME_MAP:{
        "singleselect":"Single Selection",
        "multiselect":"Multiple Selection",
        "description":"Subjective Item",
        "sequence":"Sort",
        "score":"Score"
    },
    STYPEMAP:{
        "textselect":"text",
        "imageselect":"image",
        "descriptionselect":"subjective"
    },

    SURVEYSTATUS_EDIT:"surveyedit",
    SURVEYSTATUS_PROPOSE:"surveypropose",
    SURVEYSTATUS_REJECT:"surveyreject",
    SURVEYSTATUS_NORMAL:"surveynormal",

    //BASE_URL:"http://localhost:3000/",
    //BASE_URL:"http://121.40.94.201:3005/",
    //BASE_URL:"/tracker/"
    //BASE_URL:"http://121.40.94.201/mmn/",
    BASE_URL:"/si/",
    BASE_IMAGEURL:"/si/uploads/"
    //BASE_URL:"/",
    //BASE_IMAGEURL:"/uploads/"
};