#-*- coding:utf-8 -*-
import re,pymongo,json,urllib2,time,math
from scrapy import Selector
from ..items import brandItem
from scrapy.spiders import Spider
from scrapy_splash import SplashRequest
import re


class modelSpider(Spider):
    name = "modelspider"

    # baseUrl = "http://www.flipkart.com/lc/pr/pv1/spotList1/spot1/productList?sid=tyy,4io&filterNone=true&acamp=false&plaOffset=0&start="
    baseUrl = "https://www.flipkart.com/mobiles/pr?otracker=categorytree&page="
    # tailUrl = "&ajax=true&_=1473814010323"
    tailUrl = "&sid=tyy%2C4io"
    currentStart = 1
    parseStep = 1
    rc = re.compile("[0-9,]+")

    colorRe = re.compile("\(([^()]*(Gold|White|Black|Grey|Silver|Blue|Orange|Champagne|Yellow|Red|Carbon|Green|Mint|Midnight|Cyan|Brown)[^()]*)\)")

    def start_requests(self):
        yield SplashRequest(self.baseUrl+str(self.currentStart)+self.tailUrl, self.parse, args={'wait': 10,'timeout':180})

    def parse(self,response):
        item = brandItem()
        oldurl=response.url
        infos = []

        # productList = response.xpath('//div[contains(@class,"gd-row")]/div[contains(@class,"gd-col")]/div[contains(@class,"product-unit")]/div[contains(@class,"pu-details")]')
        productList = response.xpath('//div[contains(@class,"col") and contains(@class,"zZCdz4")]')

        for product in productList:


            # productTitleSel = product.xpath('div[contains(@class,"pu-title")]/a[contains(@class,"fk-display-block")]')
            productTitleSel = product.xpath('a/div/div/div[contains(@class,"_3wU53n")]/text()')
            productHrefSel = product.xpath('a[contains(@class,"_1UoZlX")]/@href')

            # productRatingSel = product.xpath('div[contains(@class,"pu-rating")]/text()')
            productRatingSel = product.xpath('a/div/div/div/span[contains(@class,"_38sUEc")]/span/span/text()')

            # productPriceSel = product.xpath('div[contains(@class,"pu-price")]/div/div/span[contains(@class,"fk-font-17")]/text()')
            productPriceSel = product.xpath('a/div/div/div/div/div[contains(@class,"_1vC4OE")]/text()')
            # keyfeaturelist = product.xpath('div[contains(@class,"pu-border-top")]/ul[contains(@class,"pu-usp")]/li/span/text()')

            avgrateSel = product.xpath('a/div/div/div/span/div/span/text()')

            featureListSel = product.xpath('a/div/div/div/ul[contains(@class,"vFw0gD")]/li[contains(@class,"tVe95H")]/text()')


            brand = ""
            realnum = 0
            reviewNum = 0
            ptitle = ""
            color = ""
            phref = ""
            price = 0
            avgrate = ""
            ram = ""
            rom = ""
            ext = ""
            screen = ""
            main = ""
            front = ""
            battery = ""
            processor = ""

            if len(productTitleSel)>0:
                # print productTitleSel[0].extract().strip()
                tmptitle = productTitleSel[0].extract().strip()
                ptitle = tmptitle
                brand = tmptitle.split(" ")[0].strip()
                tmatch = self.colorRe.search(tmptitle)
                if tmatch:
                    color = tmatch.group(1).split(',')[0].strip()

            if len(productHrefSel)>0:
                # print productHrefSel[0].extract().strip()
                phref = productHrefSel[0].extract().strip()

            if len(productRatingSel)>0:
                # print productRatingSel[0].extract().strip() #rating number
                tmprating = productRatingSel[0].extract().strip()
                ratingnumber = self.rc.search(tmprating)
                if ratingnumber:
                    realnum = int(ratingnumber.group(0).replace(',',''))


            if len(productRatingSel)>=3:
                # print productRatingSel[2].extract().strip() #reviewNum
                tmprating = productRatingSel[2].extract().strip()
                reviewn = self.rc.search(tmprating)
                if reviewn:
                    reviewNum = int(reviewn.group(0).replace(',',''))

            if len(productPriceSel)>=2:
                tmpprice = productPriceSel[1].extract().strip()
                pricen = self.rc.search(tmpprice)
                if pricen:
                    price = int(pricen.group(0).replace(',',''))

            if len(avgrateSel)>0:
                avgrate =  avgrateSel[0].extract().strip()

            for featureItem in featureListSel:
                fstr = featureItem.extract().strip()
                stroragema = re.search("(ROM|RAM)",fstr)
                screenma = re.search("\d+\.{0,1}\d*\s*inch",fstr)
                camerama = re.search("Camera",fstr)
                batteryma = re.search("[0-9.]+\s*mAh",fstr)
                processorma = re.search(".*Processor",fstr)
                if stroragema:
                    rammatch = re.search("([0-9.]+\s*GB)\s*RAM",fstr)
                    if rammatch:
                        ram = rammatch.group(1).strip()
                    rommatch = re.search("([0-9.]+\s*GB)\s*ROM",fstr)
                    if rommatch:
                        rom = rommatch.group(1).strip()
                    extmatch = re.search("Expandable[^|0-9]*([0-9.]+\s*GB)",fstr)    
                    if extmatch:
                        ext = extmatch.group(1).strip()
                elif screenma:
                    screen = screenma.group(0)
                elif camerama:
                    fcma = re.search("([0-9.]+\s*MP)\s*Primary",fstr)
                    if fcma:
                        main = fcma.group(1)
                    bcma = re.search("([0-9.]+\s*MP)\s*Front",fstr)
                    if bcma:
                        front = bcma.group(1)
                elif batteryma:
                    battery = batteryma.group(0)
                elif processorma:
                    processor = processorma.group(0).strip()

            info = {
                "brand":brand,
                "title":ptitle,
                "color":color,
                "href":phref,
                "rating":realnum,
                "avgrate":avgrate,
                "reviewNum":reviewNum,
                "RAM":ram,
                "ROM":rom,
                "EXT":ext,
                "screen":screen,
                "pcamera":main,
                "scamera":front,
                "battery":battery,
                "processor":processor,
                "price":price
            }
            infos.append(info)
 
        if len(infos) == 0:
            return
        else:
            item['infos'] = infos
            yield item
            self.currentStart+=self.parseStep
            print "++++++++++++++++++++++++++++++"
            print "current page is "+str(self.currentStart)
            print "++++++++++++++++++++++++++++++"
            yield SplashRequest(self.baseUrl+str(self.currentStart)+self.tailUrl, self.parse, args={'wait': 10,'timeout':180})

