#-*- coding:utf-8 -*-
import re,pymongo,json,urllib2,time,math
from scrapy import Selector
from ..items import brandItem
from scrapy.spiders import Spider
from scrapy_splash import SplashRequest
import re
import requests



class modelDetailSpider(Spider):
    name = "modeldetailspider"

    baseUrl = "http://www.flipkart.com"

    rc = re.compile("[0-9,]+")

    urlMap = {}

    def __init__(self):
        self.req = requests.get("http://localhost:8080/sadmin/activeid/flipkart")
        self.spiderid = json.loads(self.req.text)


    def start_requests(self):
        client = pymongo.MongoClient()
        db = client["smartinsight"]
        modelList = db["model"].find({"spiderid":self.spiderid})
        print "+++++++++++++++++++++++++++++++++++++++++++++"
        print self.spiderid
        print modelList
        for model in modelList:
            if "href" in model:
                self.urlMap[self.baseUrl+model["href"]] = model;
                yield SplashRequest(self.baseUrl+model["href"], self.parse, args={'wait': 1,'timeout':180})

    def buildXpathContainList(self,key,flist):
        rstr = '['
        for findex,fitem in enumerate(flist):
            rstr += 'contains(' + key +',"' + fitem + '")'
            if findex < len(flist)-1:
                rstr += ' and '
        rstr += ']'
        return rstr

    def parse(self,response):
        item = brandItem()
        oldurl=response.url
        infos = []

        reviews = response.xpath('//div[contains(@class,"reviews")]/a[contains(@class,"review")]/span/text()')

        avgratingsel = response.xpath('//div[contains(@class,"col-12-12")]/div[contains(@class,"_1i0wk8")]/text()')


        dfeaturemap = {
            "featureTag":[["SIM","Type"],["Operating","System"],["Operating","System","Version","Name"],
                          ["Operating", "System", "Version", "Number"],["Internal", "Storage"],["RAM"],
                          ["Network", "Type"],["Primary", "Camera"],["Secondary", "Camera", "Megapixel"],
                          ["Battery", "Capacity"],["Display", "Size"],["Resolution"]],
            "displayTag":["simtype","os","osversionname",
                          "osversionnum","ROM","RAM",
                          "network","pcamera","scamera",
                          "battery","screen","Resolution"],
            "value":["","","",
                     "","","",
                     "","","",
                     "","",""]
        }

        for fi,ff in enumerate(dfeaturemap["featureTag"]): 
            # fselector = response.xpath('//li[contains(div/text(),"'+ff+'")]')
            fselector = response.xpath('//li'+self.buildXpathContainList('div/text()',ff))
            if len(fselector)>0:
                dfeaturemap["value"][fi] = fselector.xpath('ul/li/text()')[0].extract()
            else:
                # fselector = response.xpath('//tr[contains(td/text(),"'+ff+'")]')
                fselector = response.xpath('//tr'+self.buildXpathContainList('td/text()',ff))
                if len(fselector) > 0:
                    dfeaturemap["value"][fi] = fselector.xpath('td[contains(@class,"specsValue")]/text()')[0].extract()

        reviewLink = "0"
        if len(reviews)>0:
            reviewLink = reviews[0].extract()
        else:
            nreviews = response.xpath('//div[contains(@class,"_1dlNCg")]/div[contains(@class,"niH0FQ")]/span[contains(@class,"_38sUEc")]/span/span/text()')
            if len(nreviews)>=3:
                reviewLink = nreviews[2].extract()

        avgRate = ""
        if len(avgratingsel)>0:
            avgRate = avgratingsel[0].extract().strip()
        else:
            avgratingsel = response.xpath('//div[contains(@class,"avgWrapper")]/div[contains(@class,"bigStar")]/text()')
            if len(avgratingsel)>0:
                avgRate = avgratingsel[0].extract().strip()
        rmatch = self.rc.search(reviewLink)
        
        info = {
            "reviewNum":int(rmatch.group(0).replace(",","")),
            "avgrate":avgRate,
            "modleid":str(self.urlMap[oldurl]["_id"])
        }

        for fi,fd in enumerate(dfeaturemap["displayTag"]):
            info[fd] = dfeaturemap["value"][fi].strip()

        infos.append(info)

        item["infos"] = infos
        yield item
