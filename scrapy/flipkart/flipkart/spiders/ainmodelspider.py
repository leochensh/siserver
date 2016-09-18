#-*- coding:utf-8 -*-
import re,pymongo,json,urllib2,time,math
from scrapy import Selector
from ..items import brandItem
from scrapy.spiders import Spider
from scrapy_splash import SplashRequest
import re


class amazonInmodelSpider(Spider):
    name = "ainmodelspider"

    baseUrl = "http://www.amazon.in/s/ref=lp_1805560031_pg_2?rh=n%3A976419031%2Cn%3A!976420031%2Cn%3A1389401031%2Cn%3A1389432031%2Cn%3A1805560031&page="
    tailUrl = "&ie=UTF8&qid=1474030412"
    currentStart = 1
    parseStep = 1
    rc = re.compile("[0-9,]+")

    avgre = re.compile("([0-9.]+).*out.*stars")

    colorRe = re.compile("\(([^()]*(Gold|White|Black|Grey|Silver|Blue|Orange|Champagne|Yellow|Red|Carbon|Green|Mint|Midnight|Cyan|Brown)[^()]*)\)")

    def start_requests(self):
        yield SplashRequest(self.baseUrl+str(self.currentStart)+self.tailUrl, self.parse, args={'wait': 10,'timeout':180})

    def parse(self,response):
        item = brandItem()
        oldurl=response.url
        infos = []

        productList = response.xpath('//ul[contains(@class,"s-result-list")]/li[contains(@class,"s-result-item")]/div[contains(@class,"s-item-container")]')

        # productList = response.xpath('//div[contains(@class,"a-row") and contains(@class,"a-spacing-mini") and contains(div/@class,"a-row") and contains(div/@class,"a-spacing-none") and contains(div/a/@class,"a-link-normal") and contains(div/a/@class,"s-access-detail-page") and contains(div/a/@class,"a-text-normal")]')

        for product in productList:


            productTitleSel = product.xpath('div[contains(@class,"a-row") and contains(@class,"a-spacing-mini")]/div[contains(@class,"a-row") and contains(@class,"a-spacing-none")]')
            hrefSel = productTitleSel.xpath('a/@href')
            titleSel = productTitleSel.xpath('a/h2/text()')

            brandSel = productTitleSel.xpath('span[contains(@class,"a-size-small")]/text()')

            priceSel = productTitleSel.xpath('a/span[contains(@class,"a-color-price")]/text()')

            ratingSel = product.xpath('div[contains(@class,"a-row") and contains(@class,"a-spacing-none")]/span/span/a/i/span/text()')

            reviewsSel = product.xpath('div[contains(@class,"a-row") and contains(@class,"a-spacing-none")]/a/text()')


            productTitle = ""
            productHref = ""
            brand = ""
            price = ""
            avgRate = ""
            reviewNum = 0

            if len(titleSel)>0:
                productTitle = titleSel[0].extract().strip()

            if len(hrefSel) > 0:
                productHref = hrefSel[0].extract().strip()

            if len(brandSel) >= 2:
                brand = brandSel[1].extract().strip()

            if len(priceSel) >=1:
                priceStr = priceSel[0].extract().strip()
                priceMatch = self.rc.search(priceStr)
                if priceMatch:
                    price = int(priceMatch.group(0).replace(",",""))
            if len(ratingSel)>0:
                avgRateStr = ratingSel[0].extract().strip()
                avgmatch = self.avgre.search(avgRateStr)
                if avgmatch:
                    avgRate = avgmatch.group(1)

            if len(reviewsSel)>0:
                reviewStr = reviewsSel[0].extract().strip()
                reviewmatch = self.rc.search(reviewStr)
                if reviewmatch:
                    reviewNum = int(reviewmatch.group(0).replace(",",""))
            info = {
                'title':productTitle,
                'href': productHref,
                'brand':brand,
                'price':price,
                'avgrate':avgRate,
                'reviewNum':reviewNum
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

