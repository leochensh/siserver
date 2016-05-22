export var Constant = {

    LOGINSUCCESS:"loginsuccess",
    ERROR500:"error500",
    GETPERSONAL_LIST:"getpersonallist",
    ADDNEWPERSON:"addnewperson",
    SURVEYVALUECHANGE:"surveyvaluechange",
    CLEANSURVEYDATA:"cleansurveydata",
    SURVEYDATABATCHCHANGE:"surveydatabatchchange",
    LOADCSV:"loadcsv",
    SAVESINGLEQUESTION:"savesinglequestion",
    CAUSECHANGE:"causechange",
    SAVEALLQUESTION:"saveallquestion",
    GETSURVEYEDITLIST:"getsurveyeditlist",
    FORCEEDITORSURVEYCHANGE:"forceeditorsurveychange",
    DELETESURVEY:"deletesurvey",
    EDITSURVEY:"editsurvey",
    PARSESURVEYDETAIL:"parsesurveydetail",
    GETADLIST:"getadlist",
    FORCEADLISTREFRESH:"forceadlistrefresh",
    DELETEAD:"deletead",
    ADDAD:"addad",
    GETVERSIONLIST:"getversionlist",
    FORCEVERSIONLISTREFRESH:"forceversionlistrefresh",
    DELETEVERSION:"deleteversion",
    VERSIONADD:"versionadd",
    ADDORGNIZATION:"addorgnization",
    GETORGNIZATIONLIST:"getorgnizationlist",
    FORCEORGNIZATIONREFRESH:"forceorgnizationrefresh",
    DELETEORGNIZATION:"deleteorgnization",
    CHANGEACTIVEORG:"changeactiveorg",
    GETORGADMINLIST:"getorgadminlist",


    QTYPE_SINGLESELECT:"singleselect",//单选题
    QTYPE_SINGLESELECT_TEXT:"singleselect_text",//单选文本题
    QTYPE_SINGLESELECT_RECORD_TEXT:"singleselect_record_text",//单选录音文本题
    QTYPE_MULTISELECT:"multiselect",//多选题
    QTYPE_MULTISELECT_TEXT:"multiselect_text",//多选文本题
    QTYPE_MULTISELECT_RECORD_TEXT:"multiselect_record_text",//多选录音文本题
    QTYPE_DESCRIPTION:"description",//文本题
    QTYPE_DESCRIPTION_RECORD_TEXT:"description_record_text",//录音文本题
    QTYPE_DESCRIPTION_IMAGE_TEXT:"description_image_text",//图片上传文本题
    QTYPE_SEQUENCE:"sequence",
    QTYPE_SCORE:"score",

    SELECTTYPE_TEXT:"textselect",
    SELECTTYPE_IMAGE:"imageselect",
    SELECTTYPE_VIDEO:"videoselect",
    SELECTTYPE_AUDIO:"audioselect",
    SELECTTYPE_DESCRIPTION:"descriptionselect",

    QTYPE_NAME_MAP:{
        "singleselect":"Single Selection",
        "singleselect_text":"Single Selection With Text Option",
        "singleselect_record_text":"Single Selection With Record&Text Option",
        "multiselect":"Multiple Selection",
        "multiselect_text":"Multiple Selection With Text Option",
        "multiselect_record_text":"Multiple Selection With Record&Text Option",
        "description":"Subjective Item",
        "description_record_text":"Subjective Item With Record&Text",
        "description_image_text":"Subjective Item With Image&Text",
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

    SURVEYSTATUSMAP:{
        "surveyedit":"Edit",
        "surveynormal":"Published"
    },

    PLATFORMTYPE_ANDROID:"android",
    PLATFORMTYPE_IOS:"ios",
    PLATFORMTYPE_WEB:"web",

    BASE_FULL:"http://www.ouresa.com/si/public/#/",
    BASE_URL:"/si/",
    BASE_IMAGEURL:"/si/uploads/"
    //BASE_FULL:"http://localhost:8080/public/#/",
    //BASE_URL:"/",
    //BASE_IMAGEURL:"/uploads/"
};