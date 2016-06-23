#-*- coding:utf-8 -*-
import re,pymongo,json,urllib2,time,math
from scrapy import Selector
from ..items import brandItem
from scrapy.spiders import Spider

def getUrl():

    urlList = []
    client = pymongo.MongoClient()
    db = client["smartinsight"]
    link = db['flipkartData'].find({'reviewHref':{'$exists':True}},{'_id':0,'dataPid':1,'reviewNum':1,'reviewHref':1})
    for l in link:
        dataPid = l['dataPid']
        href = l['reviewHref']
        num = int(l['reviewNum'])

        i = 0
        while 10*i<num:
            urlList.append('http://www.flipkart.com'+href+'&start='+str(10*i))
            i+=1

    return urlList

class brandSpider(Spider):
    name = "reviewspider"

    #爬去静态地址列表的数据
    start_urls = getUrl();

    def parse(self,response):
        item = brandItem()
        oldurl=response.url

        dataPid = str(oldurl).split("?pid=")[1].split("&")[0]
        print dataPid
        infos = []

        sel = Selector(response)

        reviewList = sel.xpath('//div[@class="review-list"]/div')
        print len(reviewList)
        if len(reviewList)>0:
            for review in reviewList:
                reviewId = review.xpath('@review-id').extract()[0].strip()
                score = review.xpath('div[1]/div[1]/div/@title').extract()[0].strip()
                score = score[:1]

                name=''
                nameData = review.xpath('div[1]/div[2]/a')
                if len(nameData)>0:
                    name = nameData.xpath('text()').extract()[0].strip()
                else:
                    name = review.xpath('div[1]/div[2]/span/text()').extract()[0].strip()
                reviewTime = review.xpath('div[1]/div[3]/text()').extract()[0].strip()

                title = review.xpath('div[2]/div[1]/strong/text()').extract()[0].strip()
                contentData = review.xpath('div[2]/p/span')
                content = contentData.xpath('string(.)').extract()[0].strip()
                content = content.replace('\\n',' ')
                helpfulRate = review.xpath('div[2]/div[3]/div[1]/strong[1]/text()').extract()[0].strip()
                helpfulCount = review.xpath('div[2]/div[3]/div[1]/strong[2]/text()').extract()[0].strip()

                info = {'reviewId':reviewId,'dataPid':dataPid,'score':int(score),'name':name,'reviewTime':reviewTime,'title':title,'content':content,'helpfulRate':helpfulRate,'helpfulCount':int(helpfulCount)}
                print info
                infos.append(info)

        item['infos'] = infos

        yield item