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
        num = bi['num']
        brand = bi['brand']
        i = 0
        while 20*i<num:
            urlList.append('http://www.flipkart.com/lc/pr/pv1/spotList1/spot1/productList?p[]=facets.brand%255B%255D%3D'+brand+'&sid=tyy%2C4io&filterNone=true&start='+str(20*i+1))
            i+=1

    return urlList

class brandSpider(Spider):
    name = "linkspider"

    #爬去静态地址列表的数据
    start_urls = getUrl();

    def parse(self,response):
        item = brandItem()
        oldurl=response.url

        print "++++++++++++++++"
        print response.url

        currentBrand = ""
        m = re.search("%255B%255D%3D(.*)&sid=",response.url)
        if(m):
            currentBrand = m.group(1)

        infos = []

        sel = Selector(response)
        sites = sel.xpath('//div[@data-ctrl="ProductUnitController"]')
        for site in sites:
            dataPid = site.xpath('@data-pid')[0].extract().strip()
            print dataPid
            href = site.xpath('div[1]/a[1]/@href')[0].extract().strip()
            print href
            info = {'dataPid':dataPid,'href':href,'brand':currentBrand}
            infos.append(info)

        item['infos'] = infos

        yield item