#-*- coding:utf-8 -*-
import re,pymongo,json,urllib2,time,math
from scrapy import Selector
from ..items import brandItem
from scrapy.spiders import Spider
from scrapy_splash import SplashRequest
import re
import requests



class snapDealModelDetailSpider(Spider):
    name = "snapdealmdetailspider"

    baseUrl = "https://www.snapdeal.com"

    rc = re.compile("[0-9,]+")

    urlMap = {}

    def __init__(self):
        self.req = requests.get("http://localhost:8080/sadmin/activeid/snapdeal")
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
                self.urlMap[model["href"]] = model
                yield SplashRequest(model["href"], self.parse, args={'wait': 1,'timeout':180})

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

        # reviews = response.xpath('//div[contains(@class,"reviews")]/a[contains(@class,"review")]/span/text()')

        # avgratingsel = response.xpath('//div[contains(@class,"col-12-12")]/div[contains(@class,"_1i0wk8")]/text()')


        price = 0
        priceSelector = response.xpath('//span[contains(@class,"pdp-final-price")]/span[contains(@class,"payBlkBig")]/text()')
        if len(priceSelector)>0:
            tmpprice = priceSelector[0].extract().strip()
            pricen = self.rc.search(tmpprice)
            if pricen:
                price = int(pricen.group(0).replace(',', ''))

        keyfeature = ""
        keyFeatureSelector = response.xpath('//div[contains(@class,"p-keyfeatures")]/ul/li/span[contains(@class,"h-content")]/text()')
        if len(keyFeatureSelector)>0:
            for keyF in keyFeatureSelector:
                keyfeature += keyF.extract().strip() + "|"

        rating = 0
        ratingSelector = response.xpath('//span[contains(@class,"total-rating")]/text()')
        if len(ratingSelector)>0:
            tmprating = ratingSelector[0].extract().strip()
            ratingn = self.rc.search(tmprating)
            if ratingn:
                rating = int(ratingn.group(0).replace(',', ''))

        avgrate = ""
        avgrateSel = response.xpath('//span[contains(@class,"avrg-rating")]/text()')
        if len(avgrateSel)>0:
            avgrate = avgrateSel[0].extract().strip().replace("(","").replace(")","")

        reviewNum = 0
        reviewnumsel = response.xpath('//span[contains(@class,"numbr-review")]/a/text()')
        if len(reviewnumsel)>0:
            tmprev = reviewnumsel[0].extract().strip()
            revn = self.rc.search(tmprev)
            if revn:
                price = int(revn.group(0).replace(',', ''))

        dfeaturemap = {
            "featureTag":[["Brand"],["SIMs"],["Operating","System"],["Model"],
                          ["Form"],["Processor","Speed"],
                          ["Display","Resolution"],["Model"],["Colour"],
                          ["Processor","Brand"],["RAM"],["Internal","Memory"],
                          ["Expandable","Memory"],["Screen","Size"],["Rear","Camera"],
                          ["Front","Camera"],["Battery","Capacity"]
                          ],
            "displayTag":["brand","simtype","os","modelnumber",
                          "browsetype","processorclock",
                          "Resolution","modelname","color",
                          "processor","RAM","ROM",
                          "EXT","screen","pcamera",
                          "scamera","battery"
                          ],
            "value":["","","","",
                     "","",
                     "","","",
                     "","","",
                     "","","",
                     "",""
                     ]
        }

        for fi,ff in enumerate(dfeaturemap["featureTag"]):
            # fselector = response.xpath('//li[contains(div/text(),"'+ff+'")]')
            fselector = response.xpath('//tr'+self.buildXpathContainList('td/text()',ff))
            if len(fselector)>0:
                dfeaturemap["value"][fi] = fselector.xpath('td/text()')[1].extract().strip()
            # else:
            #     # fselector = response.xpath('//tr[contains(td/text(),"'+ff+'")]')
            #     fselector = response.xpath('//tr'+self.buildXpathContainList('td/text()',ff))
            #     if len(fselector) > 0:
            #         dfeaturemap["value"][fi] = fselector.xpath('td[contains(@class,"specsValue")]/text()')[0].extract()

        # reviewLink = "0"
        # if len(reviews)>0:
        #     reviewLink = reviews[0].extract()
        # else:
        #     nreviews = response.xpath('//div[contains(@class,"_1dlNCg")]/div[contains(@class,"niH0FQ")]/span[contains(@class,"_38sUEc")]/span/span/text()')
        #     if len(nreviews)>=3:
        #         reviewLink = nreviews[2].extract()

        # avgRate = ""
        # if len(avgratingsel)>0:
        #     avgRate = avgratingsel[0].extract().strip()
        # else:
        #     avgratingsel = response.xpath('//div[contains(@class,"avgWrapper")]/div[contains(@class,"bigStar")]/text()')
        #     if len(avgratingsel)>0:
        #         avgRate = avgratingsel[0].extract().strip()
        # rmatch = self.rc.search(reviewLink)
        info = {
            "modleid":str(self.urlMap[oldurl]["_id"])
        }

        # brandSelector = response.xpath('//div[contains(@class,"_1joEet")]/div[contains(@class,"_1HEvv0")]/a[contains(@class,"_1KHd47")]/text()')
        # if len(brandSelector)>=4:
        #     brandStr = brandSelector[3].extract().strip()
        #     if brandStr:
        #         info["brand"] = brandStr
        for fi,fd in enumerate(dfeaturemap["displayTag"]):
            tempValue = dfeaturemap["value"][fi].strip()
            if tempValue:
                info[fd] = dfeaturemap["value"][fi].strip()

        info["keyfeature"] = keyfeature
        info["price"] = price
        info["rating"] = rating
        info["avgrate"] = avgrate
        info["reviewNum"] = reviewNum

        if "Resolution" in info:
            screenResStr = info["Resolution"]
            resoRe = re.search("(\d+)[^0-9]*(\d+)",screenResStr)
            if resoRe:
                v1 = int(resoRe.group(1))
                v2 = int(resoRe.group(2))
                if v1>=v2:
                    info["Resolution"] = str(v1)+"*"+str(v2)
                else:
                    info["Resolution"] = str(v2)+"*"+str(v1)

        infos.append(info)

        item["infos"] = infos
        yield item

