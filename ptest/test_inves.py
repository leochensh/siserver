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
        print surlistReq.content

if __name__ == '__main__':
    unittest.main()
