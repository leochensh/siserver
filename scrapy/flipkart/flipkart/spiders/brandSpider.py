#-*- coding:utf-8 -*-
import re,pymongo,json,urllib2,time,math
from scrapy import Selector
from ..items import brandItem
from scrapy.spiders import Spider

def getUrl():

    urlList = ['http://www.flipkart.com/mobiles/pr?sid=tyy,4io&otracker=ch_vn_mobile_filter_Top%20Brands_All']

    return urlList

class brandSpider(Spider):
    name = "brandspider"

    #爬去静态地址列表的数据
    start_urls = getUrl();

    def parse(self,response):
        item = brandItem()
        oldurl=response.url
        infos = []

        sel = Selector(response)
        sites = sel.xpath('//ul[@id="brand"]/li')
        for site in sites:
            text = site.xpath('a/span[1]/text()')[0].extract().strip()
            # print text
            info = {'brand':text,'num':0}
            infos.append(info)

        item['infos'] = infos

        yield item