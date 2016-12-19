# -*- coding:utf-8 -*-
import re, pymongo, json, urllib2, time, math
from scrapy import Selector
from ..items import brandItem
from scrapy.spiders import Spider
from scrapy_splash import SplashRequest
import re


class parktelMSpider(Spider):
    name = "parktelmspider"

    def __init__(self):
        self.brandList = [
            ["Apple","https://parktelonline.com/apple.html"],
            ["Blackberry","https://parktelonline.com/blackberry.html"],
            ["HTC","https://parktelonline.com/htc.html"],
            ["Huawei","https://parktelonline.com/huawei.html"],
            ["Infinix","https://parktelonline.com/infinix.html"],
            ["LG","https://parktelonline.com/lg.html"],
            ["Microsoft","https://parktelonline.com/microsoft.html"],
            ["Nokia","https://parktelonline.com/nokia.html"],
            ["Samsung","https://parktelonline.com/samsung.html"],
            ["Sony","https://parktelonline.com/sony.html"],
            ["Tecno","https://parktelonline.com/tecno.html"],
            ["Power Bank","https://parktelonline.com/power-banks.html"]
        ]

        self.currentBrandIndex = 0

        self.baseUrl = self.brandList[self.currentBrandIndex][1]+"?p="
        self.tailUrl = ""
        self.currentStart = 1
        self.parseStep = 1

    def start_requests(self):
        yield SplashRequest(self.baseUrl + str(self.currentStart) + self.tailUrl, self.parse,
                            args={'wait': 10, 'timeout': 180})

    def parse(self, response):
        item = brandItem()
        oldurl = response.url
        infos = []

        # productList = response.xpath('//div[contains(@class,"gd-row")]/div[contains(@class,"gd-col")]/div[contains(@class,"product-unit")]/div[contains(@class,"pu-details")]')
        productList = response.xpath('//div[contains(@class,"category-products")]/ol/li/div/div/h2[contains(@class,"product-name")]')
        maxPage = self.currentStart
        for product in productList:

            # productTitleSel = product.xpath('div[contains(@class,"pu-title")]/a[contains(@class,"fk-display-block")]')
            productTitleSel = product.xpath('a/@title')
            # productBrandSel = product.xpath(
            #     'a[contains(@class,"link")]/h2[contains(@class,"title")]/span[contains(@class,"brand")]/text()')
            productHrefSel = product.xpath('a/@href')

            # productRatingSel = product.xpath('div[contains(@class,"pu-rating")]/text()')
            # productRatingSel = product.xpath('a/div/div/div/span[contains(@class,"_38sUEc")]/span/span/text()')

            # productPriceSel = product.xpath('div[contains(@class,"pu-price")]/div/div/span[contains(@class,"fk-font-17")]/text()')
            # productPriceSel = product.xpath('a/div/div/div/div/div[contains(@class,"_1vC4OE")]/text()')
            # keyfeaturelist = product.xpath('div[contains(@class,"pu-border-top")]/ul[contains(@class,"pu-usp")]/li/span/text()')

            # avgrateSel = product.xpath('a/div/div/div/span/div/span/text()')

            # featureListSel = product.xpath(
            #     'a/div/div/div/ul[contains(@class,"vFw0gD")]/li[contains(@class,"tVe95H")]/text()')

            brand = self.brandList[self.currentBrandIndex][0]
            # realnum = 0
            # reviewNum = 0
            ptitle = ""
            # color = ""
            phref = ""
            # price = 0
            # avgrate = ""
            # ram = ""
            # rom = ""
            # ext = ""
            # screen = ""
            # main = ""
            # front = ""
            # battery = ""
            # processor = ""

            if len(productTitleSel) > 0:
                tmptitle = productTitleSel[0].extract().strip()
                ptitle = tmptitle

            if len(productHrefSel) > 0:
                phref = productHrefSel[0].extract().strip()



            pageSel = response.xpath('//div[contains(@class,"pages")]/ol/li/a/text()')
            if len(pageSel)>0:
                pstr = pageSel[len(pageSel)-1].extract().strip()
                print "++++++++++++++++++++++++++++"
                print pstr
                try:
                    intpstr = int(pstr)
                    maxPage = intpstr
                except ValueError:
                    npstr = pageSel[len(pageSel)-2].extract().strip()
                    print "___________________________________"
                    print npstr
                    maxPage = int(npstr)


            info = {
                "brand": brand,
                "title": ptitle,
                "href": phref,
            }
            infos.append(info)

        if self.currentStart+self.parseStep>maxPage:
            if self.currentBrandIndex<len(self.brandList)-1:
                self.currentBrandIndex += 1
                self.currentStart = 1
                self.baseUrl = self.brandList[self.currentBrandIndex][1] + "?p="
                yield SplashRequest(self.baseUrl + str(self.currentStart) + self.tailUrl, self.parse,
                                    args={'wait': 10, 'timeout': 180})
            else:
                return
        else:
            item['infos'] = infos
            yield item
            self.currentStart += self.parseStep
            print "++++++++++++++++++++++++++++++"
            print "current page is " + str(self.currentStart)
            print "++++++++++++++++++++++++++++++"
            yield SplashRequest(self.baseUrl + str(self.currentStart) + self.tailUrl, self.parse,
                                args={'wait': 10, 'timeout': 180})

