# -*- coding:utf-8 -*-
import re, pymongo, json, urllib2, time, math
from scrapy import Selector
from ..items import brandItem
from scrapy.spiders import Spider
from scrapy_splash import SplashRequest
import re


class nairalandMSpider(Spider):
    name = "nairlandmspider"

    # baseUrl = "http://www.flipkart.com/lc/pr/pv1/spotList1/spot1/productList?sid=tyy,4io&filterNone=true&acamp=false&plaOffset=0&start="
    baseUrl = "http://www.nairaland.com/phones/"
    # tailUrl = "&ajax=true&_=1473814010323"
    tailUrl = ""
    currentStart = 0
    parseStep = 1
    # rc = re.compile("[0-9,]+")
    #
    # colorRe = re.compile(
    #     "\(([^()]*(Gold|White|Black|Grey|Silver|Blue|Orange|Champagne|Yellow|Red|Carbon|Green|Mint|Midnight|Cyan|Brown)[^()]*)\)")

    def start_requests(self):
        yield SplashRequest(self.baseUrl + str(self.currentStart) + self.tailUrl, self.parse,
                            args={'wait': 10, 'timeout': 180})

    def parse(self, response):
        item = brandItem()
        oldurl = response.url
        infos = []

        # productList = response.xpath('//div[contains(@class,"gd-row")]/div[contains(@class,"gd-col")]/div[contains(@class,"product-unit")]/div[contains(@class,"pu-details")]')
        productList = response.xpath('//td/b/a')

        for product in productList:

            # productTitleSel = product.xpath('div[contains(@class,"pu-title")]/a[contains(@class,"fk-display-block")]')
            productTitleSel = product.xpath('text()')
            productHrefSel = product.xpath('@href')


            ptitle = ""
            phref = ""

            if len(productTitleSel) > 0:
                tmptitle = productTitleSel[0].extract().strip()
                ptitle = tmptitle


            if len(productHrefSel) > 0:
                phref = productHrefSel[0].extract().strip()

            info = {
                "title": ptitle,
                "href": phref,
            }
            infos.append(info)


        if len(infos) == 0:
        # if self.currentStart >= 2:
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

