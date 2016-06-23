# coding:utf-8
import urllib2,json,pymongo,math,time,datetime
from scrapy import Selector

#client = pymongo.MongoClient("192.168.1.188",27017)
client = pymongo.MongoClient()
db = client["flipkart"]


def getBrandNum():
    brandList = []
    url = 'http://www.flipkart.com/mobiles/pr?sid=tyy,4io&otracker=ch_vn_mobile_filter_Top%20Brands_All'
    headers = {'User-Agent':'Mozilla/5.0 (X11; U; Linux i686)Gecko/20071127 Firefox/2.0.0.11'}
    req = urllib2.Request(url,headers=headers)
    response = urllib2.urlopen(req,None,10)
    print response.read()
    a = response.read().css("#brand>li>a>span::text")[0].extract().strip()
    print a

    sel = Selector(response)
    sites = sel.xpath('//ul[@id="brand"]/li')
    for site in sites:
        text = site.xpath('a/span[1]/text()')[0].extract().strip()
        print text
        brandList.append(text)


#getBrandNum()
