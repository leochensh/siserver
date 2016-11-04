#-*- coding:utf-8 -*-
import re,pymongo,json,urllib2,time,math
from scrapy import Selector
from ..items import brandItem
from scrapy.spiders import Spider
from scrapy_splash import SplashRequest
import re
import requests
from scrapy.utils.response import open_in_browser



class amazonIndiaModelDetailSpider(Spider):
    name = "ainmodeldetailspider"

    rc = re.compile("[0-9,]+")

    urlMap = {}

    def __init__(self):
        self.req = requests.get("http://localhost:8080/sadmin/activeid/amazonindia")
        self.spiderid = json.loads(self.req.text)


    def start_requests(self):
        client = pymongo.MongoClient()
        db = client["smartinsight"]

        modelList = db["model"].find({"spiderid":self.spiderid})
        for model in modelList:
            if "href" in model:
                # self.urlMap[model["href"]] = model;
                trueHref = model["href"]
                if trueHref and trueHref[0:4]!= "http":
                    trueHref = "http://www.amazon.in"+trueHref
                self.urlMap[trueHref] = model;
                yield SplashRequest(trueHref, self.parse, args={'wait': 1,'timeout':180})

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

        dfeaturemap = {
            "featureTag":[["OS"],["RAM"],["Connectivity","technologies"],
                          ["Special", "features"],["Other", "camera","features"],["Colour"],
                          ["Battery", "Power","Rating"],["Item","model","number"]],
            "displayTag":["os","RAM","network",
                          "specialfeature","Camera","color",
                          "battery","modelnumber"],
            "value":["","","",
                     "","","",
                     "",""]
        }

        for fi,ff in enumerate(dfeaturemap["featureTag"]): 
            # fselector = response.xpath('//li[contains(div/text(),"'+ff+'")]')
            fselector = response.xpath('//div[contains(@class,"pdTab")]/table/tbody/tr'+self.buildXpathContainList('td/text()',ff))
            if len(fselector)>0:
                dfeaturemap["value"][fi] = fselector.xpath('td/text()')[1].extract()
            else:
                pass
                #open_in_browser(response)
        
        info = {
            "modleid":str(self.urlMap[oldurl]["_id"])
        }

        for fi,fd in enumerate(dfeaturemap["displayTag"]):
            info[fd] = dfeaturemap["value"][fi].strip()

        featureBulletList = response.xpath('//div[contains(@id,"feature-bullets")]/ul/li/text()')
        ftbList = []
        for fb in featureBulletList:
            print "____________________________________"
            print fb
            fstr = fb.extract().strip()
            if fstr:
                ftbList.append(fstr)

        info["keyfeature"] = "|".join(ftbList)

        if len(info["os"]) == 0 and len(info["RAM"]) ==0 and len(info["network"])==0 and len(info["color"]) == 0 :
            yield SplashRequest(oldurl,self.parse,args={"wait":1,"timeout":180})
        else:
            infos.append(info)
            item["infos"] = infos
            yield item

