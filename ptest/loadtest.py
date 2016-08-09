# coding:utf-8
import grequests
import time
import json

urlHeader = "http://localhost:8080"
investigatorName = "Tina"
investigatorPassword = "123456"

# readTestUrl = "http://www.ouresa.com/si/public/#/quest/57a8588342b3f00e6c8cbea4"
# writeTestUrl = "http://www.ouresa.com/si/anonymous/survey/answer/add"

readTestUrl = "http://localhost:8080/public/#/quest/57a8588342b3f00e6c8cbea4"
writeTestUrl = "http://localhost:8080/si/anonymous/survey/answer/add"

jsonData = '{"surveyid":"57a8588342b3f00e6c8cbea4","begintime":"2016-08-09T03:07:23.092Z","answerlist":[{"questionid":"57a8588442b3f00e6c8cbea6","selectindexlist":[],"scorelist":[{"index":"0","score":"3"}],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588542b3f00e6c8cbea8","selectindexlist":[],"scorelist":[{"index":"0","score":"6"}],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588542b3f00e6c8cbeaa","selectindexlist":[],"scorelist":[{"index":"0","score":"8"}],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588642b3f00e6c8cbeac","selectindexlist":[],"scorelist":[{"index":"0","score":"9"}],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588642b3f00e6c8cbeae","selectindexlist":[],"scorelist":[{"index":"0","score":"6"}],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588742b3f00e6c8cbeb0","selectindexlist":[],"scorelist":[{"index":"0","score":"6"}],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588742b3f00e6c8cbeb2","selectindexlist":[],"scorelist":[{"index":"0","score":"8"}],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588842b3f00e6c8cbeb4","selectindexlist":[],"scorelist":[{"index":"0","score":"8"}],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588842b3f00e6c8cbeb6","selectindexlist":[],"scorelist":[{"index":"0","score":"5"}],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588942b3f00e6c8cbeb8","selectindexlist":["1"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588a42b3f00e6c8cbeba","selectindexlist":["1"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588a42b3f00e6c8cbebc","selectindexlist":[],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588b42b3f00e6c8cbebe","selectindexlist":["1","2"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588b42b3f00e6c8cbec0","selectindexlist":["3"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588c42b3f00e6c8cbec2","selectindexlist":["3","4"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588c42b3f00e6c8cbec4","selectindexlist":["3"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588d42b3f00e6c8cbec6","selectindexlist":["1"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588d42b3f00e6c8cbec8","selectindexlist":["4"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588e42b3f00e6c8cbeca","selectindexlist":["8","7"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588e42b3f00e6c8cbecc","selectindexlist":["0"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588e42b3f00e6c8cbece","selectindexlist":["0"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588f42b3f00e6c8cbed0","selectindexlist":[],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8588f42b3f00e6c8cbed2","selectindexlist":["1"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8589042b3f00e6c8cbed4","selectindexlist":["0"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8589042b3f00e6c8cbed6","selectindexlist":["0"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8589142b3f00e6c8cbed8","selectindexlist":["0"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8589142b3f00e6c8cbeda","selectindexlist":["0","1"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8589142b3f00e6c8cbedc","selectindexlist":["25","26"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8589242b3f00e6c8cbede","selectindexlist":["24","23"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8589242b3f00e6c8cbee0","selectindexlist":["1"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8589342b3f00e6c8cbee2","selectindexlist":[],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8589342b3f00e6c8cbee4","selectindexlist":["1","2"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8589342b3f00e6c8cbee6","selectindexlist":["1"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8589442b3f00e6c8cbee8","selectindexlist":["3"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8589442b3f00e6c8cbeea","selectindexlist":["4"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8589542b3f00e6c8cbeec","selectindexlist":["1"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8589542b3f00e6c8cbeee","selectindexlist":["1"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"57a8589642b3f00e6c8cbef0","selectindexlist":["4"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""}],"endtime":"2016-08-09T03:18:12.712Z","name":"TECNO WinPad 10 Satisfaction Survey Questionnaire 20160808-anonymous-2016-08-09T03:18:12.712Z-none-none-none"}'

def testRead():
    getUrls = []
    for i in range(500):
        getUrls.append(grequests.get(readTestUrl))
    start = time.time()
    print grequests.map(getUrls)
    end = time.time()
    print "duration is " + str(end - start) + " seconds."

def testWrite():
    postRequest = []
    jdata = json.loads(jsonData)
    for i in range(500):
        postRequest.append(grequests.post(writeTestUrl,json=jdata))
    start = time.time()
    print grequests.map(postRequest)
    end = time.time()
    print "duration is "+str(end-start) + " seconds."

if __name__ == "__main__":
    testRead()
    testWrite()
