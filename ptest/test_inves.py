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

class TestInves(unittest.TestCase):
    def setUp(self):
        helpfunc.cleanDb()

    def tearDown(self):
        helpfunc.cleanDb()

    def test_getsurlist(self):
        assignSurvey = helpfunc.assignSurvey(superAdminPass,orgName,adminName,adminPass,editorName,editorPassword,surveyName,surveyType,investigatorName,investigatorPassword)
        # assignSurvey.close()
        invHash = hashlib.md5()
        invHash.update(investigatorPassword)
        eloginUrl = urlHeader+"/staff/login"
        eloginData = {"username":investigatorName,"password":invHash.hexdigest()}
        eloginReq = requests.post(eloginUrl,data=eloginData)
        self.assertEqual(eloginReq.status_code,200)

        surlistUrl = urlHeader + "/investigator/survey/list"
        surlistReq = requests.get(surlistUrl,cookies=eloginReq.cookies)
        self.assertEqual(surlistReq.status_code,200)

        sList = json.loads(surlistReq.content)["body"]
        self.assertEqual(sList[0]["name"],surveyName)

        sdeataiUrl = urlHeader + "/investigator/survey/detail/"
        sdid = sList[0]["surveyid"]
        sdeataiUrl += sdid


        sdeataiReq = requests.get(sdeataiUrl,cookies = eloginReq.cookies)
        self.assertEqual(sdeataiReq.status_code,200)

        answerUrl = urlHeader + "/investigator/survey/answer/add"
        answerData = survey.Answer
        answerData["surveyid"] = sList[0]["surveyid"]
        answerReq = requests.post(answerUrl,json=answerData,cookies=eloginReq.cookies)
        self.assertEqual(answerReq.status_code,200)

        answerListUrl = urlHeader + "/investigator/survey/answer/list/5/0"
        answerListReq = requests.get(answerListUrl,cookies = eloginReq.cookies)
        self.assertEqual(answerListReq.status_code,200)


        answerId = json.loads(answerListReq.content)["body"][0]["_id"]
        answerDetailUrl = urlHeader + "/investigator/survey/answer/detail/" + answerId

        answerDetailReq = requests.get(answerDetailUrl,cookies = eloginReq.cookies)
        self.assertEqual(answerDetailReq.status_code,200)

        uploadImageUrl = urlHeader + "/staff/upload/image"
        uploadReqFiles = {'file':("image.png",open('ptest/figure_1.png','rb'),"image/png")}
        uploadImageReq = requests.post(uploadImageUrl,files=uploadReqFiles,cookies=eloginReq.cookies)
        self.assertEqual(uploadImageReq.status_code,200)

        uploadAudioUrl = urlHeader + "/staff/upload/audio"
        uploadReqFiles = {'file':open('ptest/test.amr','rb')}
        uploadAudioReq = requests.post(uploadAudioUrl,files=uploadReqFiles,cookies=eloginReq.cookies)
        self.assertEqual(uploadAudioReq.status_code,200)

        getVersionUrl = urlHeader + "/investigator/version/get/android"
        getVersionReq = requests.get(getVersionUrl,cookies = eloginReq.cookies)
        self.assertEqual(getVersionReq.status_code,200)

        getadUrl = urlHeader + "/investigator/ad/get"
        getadReq = requests.get(getadUrl,cookies = eloginReq.cookies)
        self.assertEqual(getadReq.status_code,200)
        print getadReq.content

if __name__ == '__main__':
    unittest.main()
