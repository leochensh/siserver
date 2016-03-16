#-*- coding:utf-8 -*-

import requests
import unittest
import json

import hashlib
import helpfunc
import survey

urlHeader = helpfunc.urlHeader

superAdminPass = "123456"
orgName = "neworg"
adminName = "orgadmin"
adminPass = "123456"
adminNewPass = "654321"

editorName = "myeditor"
editorPassword = "123456"
editorNewPassword = "654321"

investigatorName = "myinvestigator"
investigatorPassword = "123456"

surveyName = "mysurvey"
surveyType = "survey"

class TestAdmin(unittest.TestCase):
    def setUp(self):
        helpfunc.cleanDb()
    def tearDown(self):
        helpfunc.cleanDb()   
    def test_changepass(self):
        self.adminLoginReq = helpfunc.adminLogin(superAdminPass,orgName,adminName,adminPass)
        self.oldhash = hashlib.md5()
        self.oldhash.update(adminPass)

        self.newhash = hashlib.md5()
        self.newhash.update(adminNewPass)
                
        self.acpUrl = urlHeader + "/admin/pass/change"
        self.acpData = {"oldpassword":self.oldhash.hexdigest(),"newpassword":self.newhash.hexdigest()}
        self.acpRequest = requests.put(self.acpUrl,data=self.acpData,cookies=self.adminLoginReq.cookies)
        
        self.assertEqual(self.acpRequest.status_code,200)
    
    def test_addstaff(self):
        self.adminLoginReq = helpfunc.adminLogin(superAdminPass,orgName,adminName,adminPass)
        self.newhash = hashlib.md5()
        self.newhash.update(editorPassword)
        
        self.asUrl = urlHeader+"/admin/staff/add"
        self.asData = {"name":editorName,"role":"editor","password":self.newhash.hexdigest()}
        self.asReq = requests.post(self.asUrl,data=self.asData,cookies=self.adminLoginReq.cookies)
        self.assertEqual(self.asReq.status_code,200)
        
        self.asReq = requests.post(self.asUrl,data=self.asData,cookies=self.adminLoginReq.cookies)
        self.assertEqual(self.asReq.status_code,409)

    def test_adminresetstaffpass(self):
        self.createStaff = helpfunc.createEditor(superAdminPass,orgName,adminName,adminPass,editorName,editorPassword)
        self.newhash = hashlib.md5()
        self.newhash.update(editorNewPassword)
        
        self.editorId = json.loads(self.createStaff["editor"].content)["body"]
        self.arpUrl = urlHeader+"/admin/staff/resetpass"
        self.arpData = {"staffid":self.editorId,"password":self.newhash.hexdigest()}
        self.arpReq = requests.put(self.arpUrl,data=self.arpData,cookies=self.createStaff["admin"].cookies)
        self.assertEqual(self.arpReq.status_code,200)
        self.arpReq = requests.put(self.arpUrl,data=self.arpData)
        self.assertEqual(self.arpReq.status_code,500)
        self.arpReq = requests.put(self.arpUrl,cookies=self.createStaff["admin"].cookies)
        self.assertEqual(self.arpReq.status_code,406)

class TestEdtor(unittest.TestCase):
    def setUp(self):
        helpfunc.cleanDb()

    def tearDown(self):
        helpfunc.cleanDb()

    def test_editorlogin(self):
        self.createStaff = helpfunc.createEditor(superAdminPass,orgName,adminName,adminPass,editorName,editorPassword)
        self.hash = hashlib.md5()
        self.hash.update(editorPassword)
        self.eloginUrl = urlHeader+"/staff/login"
        self.eloginData = {"username":editorName,"password":self.hash.hexdigest()}
        self.eloginReq = requests.post(self.eloginUrl,data=self.eloginData)
        self.assertEqual(self.eloginReq.status_code,200)
        self.eloginData["password"] = editorPassword
        self.eloginReq = requests.post(self.eloginUrl,data=self.eloginData)
        self.assertEqual(self.eloginReq.status_code,400)
        self.eloginReq = requests.post(self.eloginUrl)
        self.assertEqual(self.eloginReq.status_code,406)

    def test_createsurvey(self):
        self.createStaff = helpfunc.editorLogin(superAdminPass,orgName,adminName,adminPass,editorName,editorPassword)

        self.csUrl = urlHeader + "/editor/survey/create"
        self.csData = {"name":surveyName,"type":surveyType}
        self.csReq = requests.post(self.csUrl,data=self.csData,cookies=self.createStaff.cookies)
        self.assertEqual(self.csReq.status_code,200)

    def test_createquestion(self):
        self.createSurvey = helpfunc.createSurvey(superAdminPass,orgName,adminName,adminPass,editorName,editorPassword,surveyName,surveyType)
        self.surveyId = json.loads(self.createSurvey["survey"].content)["body"]
        self.cqUrl = urlHeader + "/editor/survey/question/add"
        self.cqJson = survey.QList[0]
        self.cqJson["surveyid"] = self.surveyId
        self.cqReq = requests.post(self.cqUrl,json=self.cqJson,cookies=self.createSurvey["editor"].cookies)
        self.assertEqual(self.cqReq.status_code,200)

        self.cqJson2 = survey.QList[1]
        self.cqJson2["surveyid"] = self.surveyId
        self.cqReq2 = requests.post(self.cqUrl,json=self.cqJson2,cookies=self.createSurvey["editor"].cookies)
        self.assertEqual(self.cqReq2.status_code,200)

    def test_deletequesion(self):
        self.createQlist = helpfunc.createQuestions(superAdminPass,orgName,adminName,adminPass,editorName,editorPassword,surveyName,surveyType)
        self.qlist = self.createQlist["questions"]
        self.qid1 = json.loads(self.qlist[0].content)["body"]

        self.deletequrl = urlHeader + "/editor/survey/question/delete"
        self.deleteqdata = {"questionid":self.qid1}
        self.deleteqreq = requests.delete(self.deletequrl,data=self.deleteqdata,cookies=self.createQlist["editor"].cookies)
        self.assertEqual(self.deleteqreq.status_code,200)

    def test_proposesurvey(self):
        self.createQlist = helpfunc.createQuestions(superAdminPass,orgName,adminName,adminPass,editorName,editorPassword,surveyName,surveyType)
        self.surveyId = json.loads(self.createQlist["survey"].content)["body"]
        self.psUrl = urlHeader + "/editor/survey/rfp"
        self.psData = {"surveyid":"56e552450d8b79d0286e0ad6"}
        self.psReq = requests.put(self.psUrl,data=self.psData,cookies=self.createQlist["editor"].cookies)
        self.assertEqual(self.psReq.status_code,404)
        self.psData = {"surveyid":self.surveyId}
        self.psReq = requests.put(self.psUrl,data=self.psData,cookies=self.createQlist["editor"].cookies)
        self.assertEqual(self.psReq.status_code,200)

    def test_auditsurvey(self):
        proposeReq = helpfunc.proposeSurvey(superAdminPass,orgName,adminName,adminPass,editorName,editorPassword,surveyName,surveyType)
        surveyId = json.loads(proposeReq["survey"].content)["body"]
        hash = hashlib.md5()
        hash.update(adminPass)
        sloginUrl = urlHeader + "/admin/login"
        sloginData = {"password":hash.hexdigest(),"username":adminName}
        salRequest = requests.post(sloginUrl,data=sloginData)

        audsUrl = urlHeader + "/admin/survey/audit"
        audsData = {"surveyid":surveyId,"status":"surveynormal"}
        audsReq = requests.put(audsUrl,data=audsData,cookies = salRequest.cookies)
        self.assertEqual(audsReq.status_code,200)
        audsReq = requests.put(audsUrl,data=audsData)
        self.assertEqual(audsReq.status_code,500)
        audsData = {"surveyid":"123","status":"surveynormal"}
        audsReq = requests.put(audsUrl,data=audsData,cookies = salRequest.cookies)
        self.assertEqual(audsReq.status_code,406)

    def test_assignsurvey(self):
        createSurvey = helpfunc.auditSurvey(superAdminPass,orgName,adminName,adminPass,editorName,editorPassword,surveyName,surveyType)
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
        self.assertEqual(asReq.status_code,200)

        investigatorId = json.loads(asReq.content)["body"]
        asignUrl = urlHeader + "/admin/survey/assign"
        asignData = {"surveyid":surveyId,"staffid":investigatorId}
        asignReq = requests.put(asignUrl,data=asignData,cookies=salRequest.cookies)
        self.assertEqual(asignReq.status_code,200)

        addVersionUrl = urlHeader + "/admin/version/add"
        addVersionData = {
            "platform":"android",
            "versionnum":"231",
            "fileurl":"test.apk"
        }
        versionReq = requests.post(addVersionUrl,data=addVersionData,cookies=salRequest.cookies);
        self.assertEqual(versionReq.status_code,200)

        addAdUrl = urlHeader + "/admin/ad/add"
        addAdData = {
            "title":"this is a ad",
            "image":"test.jpg",
            "link":"http://www.baidu.com"
        }
        adReq = requests.post(addAdUrl,data=addAdData,cookies=salRequest.cookies);
        self.assertEqual(adReq.status_code,200)


if __name__ == '__main__':
    unittest.main()