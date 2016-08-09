# coding:utf-8
import grequests
import time
import json

urlHeader = "http://localhost:8080"
investigatorName = "Tina"
investigatorPassword = "123456"

# readTestUrl = "http://www.ouresa.com/si/public/#/quest/571047bf2b23546f13c3c323"
# writeTestUrl = "http://www.ouresa.com/si/anonymous/survey/answer/add"

readTestUrl = "http://localhost:8080/public/#/quest/571047bf2b23546f13c3c323"
writeTestUrl = "http://localhost:8080/anonymous/survey/answer/add"

jsonData = '{"surveyid":"571047bf2b23546f13c3c323","begintime":"2016-08-09T07:13:22.447Z","answerlist":[{"questionid":"571047c02b23546f13c3c325","selectindexlist":[],"scorelist":[{"index":"0","score":"3"}],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c02b23546f13c3c327","selectindexlist":[],"scorelist":[{"index":"0","score":"5"}],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c12b23546f13c3c329","selectindexlist":[],"scorelist":[{"index":"0","score":"6"}],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c12b23546f13c3c32b","selectindexlist":[],"scorelist":[{"index":"0","score":"7"}],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c12b23546f13c3c32d","selectindexlist":["1","2"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c12b23546f13c3c32f","selectindexlist":[],"scorelist":[{"index":"0","score":"9"}],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c22b23546f13c3c331","selectindexlist":[],"scorelist":[{"index":"0","score":"5"}],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c22b23546f13c3c333","selectindexlist":[],"scorelist":[{"index":"0","score":"6"}],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c22b23546f13c3c335","selectindexlist":[],"scorelist":[{"index":"0","score":"7"}],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c22b23546f13c3c337","selectindexlist":[],"scorelist":[{"index":"0","score":"6"}],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c32b23546f13c3c339","selectindexlist":["1","2"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c32b23546f13c3c33b","selectindexlist":["1"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c32b23546f13c3c33d","selectindexlist":[],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c32b23546f13c3c33f","selectindexlist":["0"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c42b23546f13c3c341","selectindexlist":["1"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c42b23546f13c3c343","selectindexlist":["0"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c42b23546f13c3c345","selectindexlist":["16"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c52b23546f13c3c347","selectindexlist":["2"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c52b23546f13c3c349","selectindexlist":["3"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c52b23546f13c3c34b","selectindexlist":["0"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c52b23546f13c3c34d","selectindexlist":["1"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c62b23546f13c3c34f","selectindexlist":[],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c62b23546f13c3c351","selectindexlist":["2"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c62b23546f13c3c353","selectindexlist":[],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c62b23546f13c3c355","selectindexlist":["3"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c72b23546f13c3c357","selectindexlist":[],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c72b23546f13c3c359","selectindexlist":[],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c72b23546f13c3c35b","selectindexlist":["3"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c72b23546f13c3c35d","selectindexlist":["4"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c82b23546f13c3c35f","selectindexlist":["1"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""},{"questionid":"571047c82b23546f13c3c361","selectindexlist":["3"],"scorelist":[],"sortlist":[],"selectextra":[],"text":"","image":"","audio":""}],"endtime":"2016-08-09T07:20:06.001Z","name":"TECNO DroiPad 7 Satisfaction Survey Questionnaire20160408-anonymous-2016-08-09T07:20:06.001Z-none-none-none"}'
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
