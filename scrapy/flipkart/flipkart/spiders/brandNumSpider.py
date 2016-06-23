#-*- coding:utf-8 -*-
import re,pymongo,json,urllib2,time,math
from scrapy import Selector
from ..items import brandItem
from scrapy.spiders import Spider

def getUrl():
    urlList = []
    client = pymongo.MongoClient()
    db = client["smartinsight"]
    brandInfo = db['brand'].find({},{'_id':0})
    for bi in brandInfo:
        urlList.append('http://www.flipkart.com/mobiles/pr?p[]=facets.brand%255B%255D%3D'+bi['brand']+'&sid=tyy%2C4io&filterNone=true')

    return urlList

class brandSpider(Spider):
    name = "brandNumspider"

    #爬去静态地址列表的数据
    start_urls = getUrl();

    def parse(self,response):
        item = brandItem()
        oldurl=response.url
        infos = []

        sel = Selector(response)
        brandName = sel.xpath('//div[@id="selectedFilters"]/div/a/text()')[0].extract().strip()
        brandNum = sel.xpath('//div[@id="searchCount"]/span[@class="items"]/text()')[0].extract().strip()


        item['infos'] = {'brand':brandName,'num':int(brandNum)}

        yield item