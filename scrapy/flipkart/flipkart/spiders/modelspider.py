#-*- coding:utf-8 -*-
import re,pymongo,json,urllib2,time,math
from scrapy import Selector
from ..items import brandItem
from scrapy.spiders import Spider
from scrapy_splash import SplashRequest
import re


class modelSpider(Spider):
    name = "modelspider"

    baseUrl = "http://www.flipkart.com/lc/pr/pv1/spotList1/spot1/productList?sid=tyy,4io&filterNone=true&acamp=false&plaOffset=0&start="
    tailUrl = "&ajax=true&_=1473814010323"
    currentStart = 1
    parseStep = 20
    rc = re.compile("[0-9,]+")

    colorRe = re.compile("\(([^()]*(Gold|White|Black|Grey|Silver|Blue|Orange|Champagne|Yellow|Red|Carbon|Green|Mint|Midnight|Cyan|Brown)[^()]*)\)")

    def start_requests(self):
        yield SplashRequest(self.baseUrl+str(self.currentStart)+self.tailUrl, self.parse, args={'wait': 10,'timeout':180})

    def parse(self,response):
        item = brandItem()
        oldurl=response.url
        infos = []

        productList = response.xpath('//div[contains(@class,"gd-row")]/div[contains(@class,"gd-col")]/div[contains(@class,"product-unit")]/div[contains(@class,"pu-details")]')

        for product in productList:


            productTitleSel = product.xpath('div[contains(@class,"pu-title")]/a[contains(@class,"fk-display-block")]')
            productRatingSel = product.xpath('div[contains(@class,"pu-rating")]/text()')
            productPriceSel = product.xpath('div[contains(@class,"pu-price")]/div/div/span[contains(@class,"fk-font-17")]/text()')
            keyfeaturelist = product.xpath('div[contains(@class,"pu-border-top")]/ul[contains(@class,"pu-usp")]/li/span/text()')

            featureStr = ""
            flist = []
            for feature in keyfeaturelist:
                flist.append(feature.extract().strip())
            featureStr = ";".join(flist)


            ptitle = productTitleSel.xpath('@title')
            phref = productTitleSel.xpath('@href')

            for pindex,title in enumerate(ptitle):
                if pindex<len(phref) and len(productRatingSel)>=2 and pindex<len(productPriceSel):
                    rnum = self.rc.search(productRatingSel[1].extract().strip())
                    price = self.rc.search(productPriceSel[pindex].extract().strip())
                    if rnum and price:
                        realnum = int(rnum.group(0).replace(',',""))
                        realprice = int(price.group(0).replace(',',''))
                        titleText = title.extract().strip();

                        color = ""

                        tmatch = self.colorRe.search(titleText)

                        brand = ""

                        tarray = titleText.split(" ")
                        if len(tarray)>0:
                            brand = tarray[0].strip()

                        if tmatch:
                            mtxt = tmatch.group(1)
                            mtxtList = mtxt.split(",")
                            color = mtxtList[0].strip()

                        info = {
                            'brand':brand,
                            'title':titleText,
                            'href':phref[pindex].extract().strip(),
                            'rating': realnum,
                            'price': realprice,
                            "keyfeature":featureStr,
                            "color":color
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

