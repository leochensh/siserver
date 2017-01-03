#-*- coding:utf-8 -*-
import re,pymongo,json,urllib2,time,math
from scrapy import Selector
from ..items import brandItem
from scrapy.spiders import Spider
from scrapy_splash import SplashRequest
import re
import requests



class nairalandModelDetailSpider(Spider):
    name = "nairalandmdetailspider"

    baseUrl = "http://www.nairaland.com"

    rc = re.compile("[0-9,]+")

    urlMap = {}

    def __init__(self):
        self.req = requests.get("http://localhost:8080/sadmin/activeid/nairaland")
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
                self.urlMap[self.baseUrl+model["href"]] = model
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
        model = self.urlMap[oldurl]


        wordlistSelector = response.xpath('//div[contains(@class,"narrow")]/text()')
        for w in wordlistSelector:
            wt = w.extract().strip()
            wt = wt.replace(","," ")
            wt = wt.replace("."," ")
            wt = wt.replace("?"," ")
            wtliwt = wt.split(" ")
            for word in wtliwt:
                word = word.strip()
                if word:
                    info = {
                        "brandid": model["brandid"],
                        "spiderid":model["spiderid"],
                        "word":word
                    }
                    infos.append(info)

        item["infos"] = infos
        yield item

