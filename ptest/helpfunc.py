#coding:utf-8
from pymongo import MongoClient
import requests
import hashlib
import json
import survey

urlHeader = "http://localhost:8080"


def cleanDb():
    client = MongoClient()
    db = client["smartinsight"]
    db.drop_collection("admins")
    db.drop_collection("organization")
    db.drop_collection("questions")
    db.drop_collection("staffs")
    db.drop_collection("surveys")
    
def createSuperAdmin(password):
    csaUrl = urlHeader + "/createsuperadmin"
    csaData = {"password":password}
    csaRequest = requests.post(csaUrl,csaData)
    return csaRequest    

def sadminLogin(sadminpass):
    hash = hashlib.md5()
    hash.update(sadminpass)
    csar = createSuperAdmin(sadminpass)
    sloginUrl = urlHeader + "/admin/login"
    sloginData = {"password":hash.hexdigest(),"username":"superadmin"}
    salRequest = requests.post(sloginUrl,data=sloginData)
    return salRequest    

def createOrg(sapass,orgname):
    salogin = sadminLogin(sapass)
    coUrl = urlHeader + "/sadmin/org/create"
    coData = {"name":orgname}
    coRequest = requests.post(coUrl,data=coData,cookies=salogin.cookies)
    return {"sadmin":salogin,"org":coRequest}

def createAdmin(sapass,orgname,adminname,adminpass):
    hash = hashlib.md5()
    hash.update(adminpass)
    
    coReq = createOrg(sapass,orgname)
    orgId = json.loads(coReq["org"].content)["body"]
    coaUrl = urlHeader + "/sadmin/org/admin/add"
    coaData = {"orgid":orgId,"name":adminname,"password":hash.hexdigest()}
    coaRequest = requests.post(coaUrl,data=coaData,cookies=coReq["sadmin"].cookies)
    coReq["admin"] = coaRequest
    return coReq

def adminLogin(sapass,orgname,adminname,adminpass):
    createAdmin(sapass,orgname,adminname,adminpass)
    hash = hashlib.md5()
    hash.update(adminpass)
    sloginUrl = urlHeader + "/admin/login"
    sloginData = {"password":hash.hexdigest(),"username":adminname}
    salRequest = requests.post(sloginUrl,data=sloginData)
    return salRequest 

def createEditor(sapass,orgname,adminname,adminpass,editorname,editorpass):
    adminLoginReq = adminLogin(sapass,orgname,adminname,adminpass)
    hash = hashlib.md5()
    hash.update(editorpass)
    asUrl = urlHeader+"/admin/staff/add"
    asData = {"name":editorname,"role":"editor","password":hash.hexdigest()}
    asReq = requests.post(asUrl,data=asData,cookies=adminLoginReq.cookies)
    return {"admin":adminLoginReq,"editor":asReq}

def editorLogin(sapass,orgname,adminname,adminpass,editorname,editorpass):
    createEditor(sapass,orgname,adminname,adminpass,editorname,editorpass)
    hash = hashlib.md5()
    hash.update(editorpass)
    eloginUrl = urlHeader+"/staff/login"
    eloginData = {"username":editorname,"password":hash.hexdigest()}
    eloginReq = requests.post(eloginUrl,data=eloginData)
    return eloginReq

def createSurvey(sapass,orgname,adminname,adminpass,editorname,editorpass,surveyname,surveytype):
    editor = editorLogin(sapass,orgname,adminname,adminpass,editorname,editorpass)
    csUrl = urlHeader + "/editor/survey/create"
    csData = {"name":surveyname,"type":surveytype}
    csReq = requests.post(csUrl,data=csData,cookies=editor.cookies)
    return {"editor":editor,"survey":csReq}

def createQuestions(sapass,orgname,adminname,adminpass,editorname,editorpass,surveyname,surveytype):
    createSurveyReq = createSurvey(sapass,orgname,adminname,adminpass,editorname,editorpass,surveyname,surveytype)
    surveyId = json.loads(createSurveyReq["survey"].content)["body"]
    cqUrl = urlHeader + "/editor/survey/question/add"
    cqJson = survey.QList[0]
    cqJson["surveyid"] = surveyId
    cqReq = requests.post(cqUrl,json=cqJson,cookies=createSurveyReq["editor"].cookies)
    
    cqJson2 = survey.QList[1]
    cqJson2["surveyid"] = surveyId
    cqReq2 = requests.post(cqUrl,json=cqJson2,cookies=createSurveyReq["editor"].cookies)
    reqList = []
    reqList.append(cqReq)
    reqList.append(cqReq2)
    createSurveyReq["questions"] = reqList
    return createSurveyReq

def deleteQuestion(sapass,orgname,adminname,adminpass,editorname,editorpass,surveyname,surveytype):
    createQ = createQuestions(sapass,orgname,adminname,adminpass,editorname,editorpass,surveyname,surveytype)
    qlist = createQ["questions"]
    qid1 = json.loads(qlist[0].content)["body"]
    deletequrl = urlHeader + "/editor/survey/question/delete"
    deleteqdata = {"questionid":qid1}
    deleteqreq = requests.delete(deletequrl,data=deleteqdata,cookies=createQ["editor"].cookies)

def proposeSurvey(sapass,orgname,adminname,adminpass,editorname,editorpass,surveyname,surveytype):
    createQ = createQuestions(sapass,orgname,adminname,adminpass,editorname,editorpass,surveyname,surveytype)
    surveyId = json.loads(createQ["survey"].content)["body"]
    psUrl = urlHeader + "/editor/survey/rfp"
    psData = {"surveyid":surveyId}
    psReq = requests.put(psUrl,data=psData,cookies=createQ["editor"].cookies)
    return createQ

def auditSurvey(sapass,orgname,adminname,adminpass,editorname,editorpass,surveyname,surveytype):
    proposeReq = proposeSurvey(sapass,orgname,adminname,adminpass,editorname,editorpass,surveyname,surveytype)
    surveyId = json.loads(proposeReq["survey"].content)["body"]
    hash = hashlib.md5()
    hash.update(adminpass)
    sloginUrl = urlHeader + "/admin/login"
    sloginData = {"password":hash.hexdigest(),"username":adminname}
    salRequest = requests.post(sloginUrl,data=sloginData)
    
    audsUrl = urlHeader + "/admin/survey/audit"
    audsData = {"surveyid":surveyId,"status":"surveynormal"}
    audsReq = requests.put(audsUrl,data=audsData,cookies = salRequest.cookies)
    return proposeReq

def assignSurvey(superAdminPass,orgName,adminName,adminPass,editorName,editorPassword,surveyName,surveyType,investigatorName,investigatorPassword):
    createSurvey = auditSurvey(superAdminPass,orgName,adminName,adminPass,editorName,editorPassword,surveyName,surveyType)
    surveyId = json.loads(createSurvey["survey"].content)["body"]

    hash = hashlib.md5()
    hash.update(adminPass)
    sloginUrl = urlHeader + "/admin/login"
    sloginData = {"password":hash.hexdigest(),"username":adminName}
    salRequest = requests.post(sloginUrl,data=sloginData)

    invHash = hashlib.md5()
    invHash.update(investigatorPassword)
    asUrl = urlHeader+"/admin/staff/add"
    asData = {"name":investigatorName,"role":"investigator","password":invHash.hexdigest()}
    asReq = requests.post(asUrl,data=asData,cookies=salRequest.cookies)

    investigatorId = json.loads(asReq.content)["body"]
    asignUrl = urlHeader + "/admin/survey/assign"
    asignData = {"surveyid":surveyId,"staffid":investigatorId}
    asignReq = requests.put(asignUrl,data=asignData,cookies=salRequest.cookies)
    return asignReq