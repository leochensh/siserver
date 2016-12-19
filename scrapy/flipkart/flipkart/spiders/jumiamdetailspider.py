#-*- coding:utf-8 -*-
import re,pymongo,json,urllib2,time,math
from scrapy import Selector
from ..items import brandItem
from scrapy.spiders import Spider
from scrapy_splash import SplashRequest
import re
import requests



class snapDealModelDetailSpider(Spider):
    name = "jumiamdetailspider"

    baseUrl = "https://www.jumia.com"

    rc = re.compile("[0-9,]+")

    urlMap = {}

    def __init__(self):
        self.req = requests.get("http://localhost:8080/sadmin/activeid/jumia")
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

        price = 0
        priceSelector = response.xpath('//span[contains(@class,"price-box")]/span[contains(@class,"price")]/span[contains(@dir,"ltr")]/@data-price')
        if len(priceSelector)>0:
            tmpprice = priceSelector[0].extract().strip()
            pricen = self.rc.search(tmpprice)
            if pricen:
                price = int(pricen.group(0).replace(',', ''))

        keyfeature = ""

        keyFeatureSelector = response.xpath('//div[contains(@class,"detail-features")]/div[contains(@class,"list") and contains(@class,"-features")]/ul/li/text()')
        if len(keyFeatureSelector)>0:
            for keyF in keyFeatureSelector:
                kfstr = keyF.extract().strip()
                keyfeature += kfstr + "|"


        screen = ""
        color = ""
        ROM = ""
        RAM = ""
        EXT = ""
        os = ""
        processor = ""
        pcamera = ""
        scamera = ""
        productDetailSel = response.xpath(
            '//div[contains(@id,"product-details")]/div[contains(@class,"list") and contains(@class,"-features")]/ul/li/text()')
        if len(productDetailSel)>0:
            for keyF in productDetailSel:
                kfstr = keyF.extract().strip()
                screenma = re.search("Screen:(.*)", kfstr)
                if screenma:
                    screen = screenma.group(1).strip()
                colorma = re.search("Colour:(.*)", kfstr)
                if colorma:
                    color = colorma.group(1).strip()
                memoryma = re.search("Memory:[^0-9]*([0-9]+)\s*(GB|MB)[^0-9]*([0-9]+)\s*(GB|MB)[^0-9]*([0-9]+)\s*(GB|MB)",
                                     kfstr)
                if memoryma:
                    RAM = memoryma.group(1) + memoryma.group(2)
                    ROM = memoryma.group(3) + memoryma.group(4)
                    EXT = memoryma.group(5) + memoryma.group(6)
                ramma = re.search("([0-9]+)\s*(GB|MB)\s*RAM",kfstr)
                if ramma:
                    RAM = ramma.group(1)+ramma.group(2)

                romma = re.search("([0-9]+)\s*(GB|MB)\s*ROM",kfstr)
                if romma:
                    ROM = romma.group(1)+romma.group(2)

                ramma2 = re.search("RAM:\s*([0-9]+)\s*(GB|MB)",kfstr)
                if ramma2:
                    RAM = ramma2.group(1) + ramma2.group(2)

                romma2 = re.search("Internal\s*Memory\s*:\s*([0-9]+)\s*(GB|MB)",kfstr)
                if romma2:
                    ROM = romma2.group(1) + romma2.group(2)

                osma = re.search("Operating\s*System:(.*)",kfstr)
                if osma:
                    os = osma.group(1).strip()

                osma2 = re.search("Platform:(.*)",kfstr)
                if osma2:
                    os = osma2.group(1).strip()

                osma3 = re.search("OS:(.*)", kfstr)
                if osma3:
                    os = osma3.group(1).strip()

                processorMa = re.search("(Processor|CPU):(.*)", kfstr)
                if processorMa:
                    processor = processorMa.group(2).strip()

                camerama = re.search("(Camera|camera)[^0-9]*([0-9.]+\s*MP)[^0-9]*([0-9.]+\s*MP)",kfstr)
                if camerama:
                    pcamera = camerama.group(2)
                    scamera = camerama.group(3)

                pcameraMa = re.search("Back\s*Camera[^0-9]*([0-9.]+\s*MP)",kfstr)
                if pcameraMa:
                    pcamera = pcameraMa.group(1)

                scameraMa = re.search("Front\s*Camera[^0-9]*([0-9.]+\s*MP)",kfstr)
                if scameraMa:
                    scamera = scameraMa.group(1)



        rating = 0
        ratingSelector = response.xpath(
            '//div[contains(@id,"ratingReviews")]/section[contains(@class,"summary")]/article[contains(@class,"avg")]/footer/text()')
        if len(ratingSelector)>0:
            tmprating = ratingSelector[0].extract().strip()
            ratingn = self.rc.search(tmprating)
            if ratingn:
                rating = int(ratingn.group(0).replace(',', ''))

        reviewNum = rating

        avgrate = ""
        avgrateSel = response.xpath(
            '//div[contains(@id,"ratingReviews")]/section[contains(@class,"summary")]/article[contains(@class,"avg")]/div/span/text()')
        if len(avgrateSel)>0:
            avgrate = avgrateSel[0].extract().strip().replace(",",".")

        dfeaturemap = {
            "featureTag":[["Colour"]
                          ],
            "displayTag":["color"
                          ],
            "value":[""
                     ]
        }

        for fi,ff in enumerate(dfeaturemap["featureTag"]):
            # fselector = response.xpath('//li[contains(div/text(),"'+ff+'")]')
            fselector = response.xpath('//div[contains(@class,"osh-table")]/div'+self.buildXpathContainList('div/text()',ff))
            if len(fselector)>0:
                dfeaturemap["value"][fi] = fselector.xpath('div/text()')[1].extract().strip()
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
        info["spiderid"] = self.spiderid
        info["screen"] = screen
        if "color" not in info:
            info["color"] = color
        info["ROM"] = ROM
        info["RAM"] = RAM
        info["EXT"] = EXT
        info["os"] = os
        info["processor"] = processor
        info["pcamera"] = pcamera
        info["scamera"] = scamera

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

