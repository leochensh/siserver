export var Constant = {
    STAFF_EDITOR:"editor",
    STAFF_INVESTIGATOR:"investigator",
    STAFF_PERSONAL:"personal",
    STAFF_ORG:"orgstaff",

    LOGINSUCCESS:"loginsuccess",
    DELETELOG:"deletelog",
    DELETELOGOK:"deletelogok",
    GETLOGSLIST:"getlogslist",//add by zzl 2016.8.30
    LOGOUT:"logout",
    ERROR500:"error500",
    GETPERSONAL_LIST:"getpersonallist",
    ADDNEWPERSON:"addnewperson",
    SURVEYVALUECHANGE:"surveyvaluechange",
    CLEANSURVEYDATA:"cleansurveydata",
    ADDNEWMETA:"addnewmeta",
    METATEXTCHANGE:"metatextchange",
    METASELECTCHANGE:"metaselectchange",
    DELETEMETA:"deletemeta",
    SURVEYDATABATCHCHANGE:"surveydatabatchchange",
    LOADCSV:"loadcsv",
    SAVESINGLEQUESTION:"savesinglequestion",
    CAUSECHANGE:"causechange",
    SAVEALLQUESTION:"saveallquestion",
    GETSURVEYEDITLIST:"getsurveyeditlist",
    GETTEMPLATELIST:"gettemplatelist",
    TEMPLATEEND:"templateend",
    DELETETEMPLATE:"deletetemplate",
    FORCEEDITORSURVEYCHANGE:"forceeditorsurveychange",
    DELETESURVEY:"deletesurvey",
    AUDITSURVEY:"auditsurvey",
    WITHDRAWSURVEY:"withdrawsurvey",
    SURVEYTOTEMPLATE:"surveytotemplate",
    TEMPLATETOSURVEY:"templatetosurvey",
    EDITSURVEY:"editsurvey",
    SURVEYNAMECHANGE:"surveynamechange",
    SURVEYADDNEWQUESTION:"surveyaddnewquestion",
    SURVEYQUESTIONEDIT:"surveyquestionedit",
    SURVEYQUESTIONDELETE:"surveyquestiondelete",
    SURVEYQUESTIONSEQUENCECHANGE:"surveyquestionsequencechange",
    PARSESURVEYDETAIL:"parsesurveydetail",
    GETADLIST:"getadlist",
    FORCEADLISTREFRESH:"forceadlistrefresh",
    DELETEAD:"deletead",
    ADDAD:"addad",
    GETFEEDBACKLIST:"getfeedbacklist",
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
    DELETEORGADMIN:"deleteorgadmin",
    FORCESTAFFLISTREFRESH:"forcestafflistrefresh",
    TARGETCLICK:"targetclick",
    CREATESPIDER:"createspider",
    GETSPIDERLIST:"getspiderlist",
    SPIDERLISTUPDATE:"spiderlistupdate",
    EXPORTSPIDERDATA:"exportspiderdata",
    SHOWSPIDERSTATISTIC:"showspiderstatistic",
    SPIDERSTASTICCHANGE:"spiderstasticchange",
    DELETESPIDER:"deletespider",


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

    SURVEYPUBLISHSTATUS_PRIVATEPERSONAL:"surveypublishstatusprivatepersonal",
    SURVEYPUBLISHSTATUS_PUBLICPERSONAL:"surveypublishstatuspublicpersonal",

    SURVEYPUBLISHSTATUS_PRIVATEORG:"surveypublishstatusprivateorg",
    SURVEYPUBLISHSTATUS_PUBLICORG:"surveypublishstatuspublicorg",

    SURVEYSTATUSMAP:{
        "surveypropose":"Wait for audit",
        "surveyedit":"Edit",
        "surveynormal":"Published"
    },
    SETPAGESIZE:{
        "num1":20,
        "num2":50,
        "num3":100
    },
    PLATFORMTYPE_ANDROID:"android",
    PLATFORMTYPE_IOS:"ios",
    PLATFORMTYPE_WEB:"web",

    TYPE_SURVEY:"survey",
    TYPE_TEMPLATE:"template",

    SPIDERSTATU_ACTIVE:"spiderstatuactive",
    SPIDERSTATU_DONE:"spiderstatudone",

    SPIDERSTASTICMAP:{
        "Brands statistics":[
            {
                name:"Top 10 brands by model number",
                url:"sadmin/spiderstatistics/brand/top10modelnum",
                labeltag:"brand",
                datatag:"count"
            },
            {
                name:"Top 10 brands by model sales review number(~ sales volumn)",
                url:"sadmin/spiderstatistics/brand/top10reviewnum",
                labeltag:"brand",
                datatag:"count"
            },
            {
                name:"Top 10 brands by model sales amount (review number times price)",
                url:"sadmin/spiderstatistics/brand/top10salesamount",
                labeltag:"brand",
                datatag:"count"
            },
            {
                name:"Top 10 brands by model average price",
                url:"sadmin/spiderstatistics/brand/top10avgprice",
                labeltag:"brand",
                datatag:"avgPrice"
            }
        ],
        "Models Statistics":[
            {
                name:"Top 10 models by model sales review number(~ sales volumn)",
                url:"sadmin/spiderstatistics/model/top10reviewnum",
                labeltag:"title",
                datatag:"reviewNum"
            },
            {
                name:"Top 10 models by model sales amount(review number times price)",
                url:"sadmin/spiderstatistics/model/top10salesamount",
                labeltag:"title",
                datatag:"smount"
            },
            {
                name:"Top 10 models by model price",
                url:"sadmin/spiderstatistics/model/top10price",
                labeltag:"title",
                datatag:"price"
            },
            {
                name:"Models price range by model number",
                url:"sadmin/spiderstatistics/model/pricerangebynum",
                labeltag:"pricerange",
                datatag:"modelnum"
            },
            {
                name:"Models price range by review number",
                url:"sadmin/spiderstatistics/model/pricerangebyreviewnum",
                labeltag:"pricerange",
                datatag:"reviewnum"
            },
            {
                name:"Models price range by sales amount",
                url:"sadmin/spiderstatistics/model/pricerangebysalesamount",
                labeltag:"pricerange",
                datatag:"salesamount"
            },
            {
                name:"Top 10 Models color by model number",
                url:"sadmin/spiderstatistics/model/colormodelnum",
                labeltag:"color",
                datatag:"count"
            },
            {
                name:"Top 10 Models color by review number",
                url:"sadmin/spiderstatistics/model/colorreviewnum",
                labeltag:"color",
                datatag:"count"
            },
            {
                name:"Top 10 Models color by average price",
                url:"sadmin/spiderstatistics/model/coloravgprice",
                labeltag:"color",
                datatag:"count"
            },
            {
                name:"Models battery range by model number",
                url:"sadmin/spiderstatistics/model/batterymodelnum",
                labeltag:"batteryrange",
                datatag:"count"
            },
            {
                name:"Models battery range by review number",
                url:"sadmin/spiderstatistics/model/batteryreviewnum",
                labeltag:"batteryrange",
                datatag:"count"
            },
            {
                name:"Models battery range by average price",
                url:"sadmin/spiderstatistics/model/batteryaverageprice",
                labeltag:"batteryrange",
                datatag:"count"
            },
        ]
    },

    BASE_FULL:"http://www.ouresa.com/si/public/#/",
    BASE_URL:"/si/",
    BASE_IMAGEURL:"/si/uploads/"
        //BASE_FULL:"http://localhost:8080/public/#/",
        //BASE_URL:"/",
        //BASE_IMAGEURL:"/uploads/"
};
