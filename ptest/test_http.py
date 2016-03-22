#-*- coding:utf-8 -*-

import requests
import unittest
import json

import hashlib
import helpfunc

urlHeader = helpfunc.urlHeader

superAdminPass = "123456"
orgName = "neworg"
adminName = "orgadmin"
adminPass = "123456"
adminNewPass = "654321"

personalName = "leo"
personalPass = "123456"


class TestSuperAdmin(unittest.TestCase):
    
    def setUp(self):
        helpfunc.cleanDb()

    def tearDown(self):
        helpfunc.cleanDb()
        
    def test_create(self):
        self.csaUrl = urlHeader + "/createsuperadmin"
        self.csaData = {"password":superAdminPass}
        self.csaRequest = requests.post(self.csaUrl)       
        self.assertEqual(self.csaRequest.status_code,406)
        self.csaRequest = requests.post(self.csaUrl,data=self.csaData)
        self.assertEqual(self.csaRequest.status_code,200)       
        self.csaRequest = requests.post(self.csaUrl,data=self.csaData)        
        self.assertEqual(self.csaRequest.status_code,409)
        
    def test_login(self):
        helpfunc.createSuperAdmin(superAdminPass)
        self.hash = hashlib.md5()
        self.hash.update(superAdminPass)
        self.salUrl = urlHeader + "/admin/login"
        self.salData = {"password":self.hash.hexdigest(),"username":"superadmin"}
        self.salRequest = requests.post(self.salUrl,data=self.salData)       
        self.assertEqual(self.salRequest.status_code,200)                
        self.salData = {"password":superAdminPass,"username":"superadmin"}
        self.salRequest = requests.post(self.salUrl,data=self.salData)       
        self.assertEqual(self.salRequest.status_code,400)        
        self.salRequest = requests.post(self.salUrl)       
        self.assertEqual(self.salRequest.status_code,406)
        
    def test_org(self):
        self.sloginRequest = helpfunc.sadminLogin(superAdminPass)              
        self.coUrl = urlHeader + "/sadmin/org/create"
        self.coData = {"name":orgName}
        self.coRequest = requests.post(self.coUrl,data=self.coData,cookies=self.sloginRequest.cookies)
        self.assertEqual(self.coRequest.status_code,200)
        
        
        self.coRequest = requests.post(self.coUrl,data=self.coData,cookies=self.sloginRequest.cookies)
        self.assertEqual(self.coRequest.status_code,409)
        self.coRequest = requests.post(self.coUrl,data=self.coData)
        self.assertEqual(self.coRequest.status_code,500)
    
    def test_createadmin(self):
        self.hash = hashlib.md5()
        self.hash.update(superAdminPass)
        self.coRequest = helpfunc.createOrg(superAdminPass,orgName)
        self.orgId = json.loads(self.coRequest["org"].content)["body"]
        self.coaUrl = urlHeader + "/sadmin/org/admin/add"
        self.coaData = {"orgid":self.orgId,"name":adminName,"password":self.hash.hexdigest()}
        self.coaRequest = requests.post(self.coaUrl,data=self.coaData,cookies=self.coRequest["sadmin"].cookies)
        self.assertEqual(self.coaRequest.status_code,200)

    def test_createpersonal(self):
        self.sloginRequest = helpfunc.sadminLogin(superAdminPass)
        self.coUrl = urlHeader + "/sadmin/personal/add"
        self.hash = hashlib.md5()
        self.hash.update(personalPass)
        self.coData = {"name":personalName,"password":self.hash.hexdigest()}
        self.coRequest = requests.post(self.coUrl,data=self.coData,cookies=self.sloginRequest.cookies)
        self.assertEqual(self.coRequest.status_code,200)

        getListUrl = urlHeader+"/sadmin/personal/list"
        getListReq = requests.get(getListUrl,cookies=self.sloginRequest.cookies)
        self.assertEqual(getListReq.status_code,200)
        data = json.loads(getListReq.content)
        self.assertEqual(len(data["body"]),1)
        self.assertEqual(data["body"][0]["name"],personalName)


    def test_resetAdminPass(self):
        
        self.newhash = hashlib.md5()
        self.newhash.update("654321")
        
        self.coaRequest = helpfunc.createAdmin(superAdminPass,orgName,adminName,adminPass)
        self.adminId = json.loads(self.coaRequest["admin"].content)["body"]
 
        self.arestUrl = urlHeader + "/sadmin/org/admin/resetpass"
        self.arestData = {"adminid":self.adminId,"password":self.newhash.hexdigest()}
        self.arestRequest = requests.put(self.arestUrl,data=self.arestData,cookies=self.coaRequest["sadmin"].cookies)
        
        self.assertEqual(self.arestRequest.status_code,200)
        
        self.arestRequest = requests.put(self.arestUrl,data=self.arestData)
        self.assertEqual(self.arestRequest.status_code,500)
        self.arestRequest = requests.put(self.arestUrl,cookies=self.coaRequest["sadmin"].cookies)
        self.assertEqual(self.arestRequest.status_code,406)
        


if __name__ == '__main__':
    unittest.main()
