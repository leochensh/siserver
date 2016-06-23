#-*- coding:utf-8 -*-
import re,pymongo,json,urllib2,time,math
from scrapy import Selector
from ..items import brandItem
from scrapy.spiders import Spider

def getUrl():

    urlList = []
    client = pymongo.MongoClient()
    db = client["smartinsight"]
    link = db['link'].find({},{'_id':0})
    for l in link:
        dataPid = l['dataPid']
        href = l['href']

        urlList.append('http://www.flipkart.com'+href)

    return urlList

class brandSpider(Spider):
    name = "infospider"

    #爬去静态地址列表的数据
    start_urls = getUrl();

    def parse(self,response):
        item = brandItem()
        print "++++++++++++++++++++++++++++++++"
        print response.url
        oldurl=response.url
        infos = {
            'rate1':0,
            'rate2':0,
            'rate3':0,
            'rate4':0,
            'rate5':0,
            'rate':0,
            'reviewNum':0
        }

        sel = Selector(response)

        # nameLi = sel.xpath('//li[@class="fk-inline-block"]')
        # size = len(nameLi)
        # print size
        # if size>0:
        #     name = nameLi[size-1].xpath('strong/text()')[0].extract().strip()
        #     infos['name'] = name

        name = sel.css("h1.title::text").extract()[0]
        infos['name'] = name

        priceInfo = []

        sellerList = sel.xpath('//div[@class="seller-list-info fk-hidden"]/div')
        print 'sellerList:'+str(len(sellerList))
        if len(sellerList)>0:
            for seller in sellerList:
                storeName = seller.xpath('div[@class="seller-info-wrap"]/a/text()')[0].extract().strip()
                storeScore = seller.xpath('div[@class="rating-info-wrap"]/span/text()')[0].extract().strip()
                price = seller.xpath('div[@class="pricing-info-wrap"]/div/meta[@itemprop="price"]/@content')[0].extract().strip()
                price = price.replace(',', '')
                print 'aaPrice:'+price
                priceInfo.append({'price':int(price),'storeName':storeName,'storeScore':storeScore})

        else:
            priceSpan = sel.xpath('//span[@class="selling-price omniture-field"]')
            price = 0
            if len(priceSpan)>0:
                price = priceSpan[0].xpath('text()').extract()[0].strip()
                price = price[4:].replace(',','')
                print 'price:'+price
            else:
                print '未找到价格'

            storeName = sel.xpath('//div[@class="seller-badge omniture-field"]/a/text()')[0].extract().strip()
            storeScore = sel.xpath('//div[@class="seller-badge omniture-field"]/span/text()')[0].extract().strip()
            priceInfo.append({'price':int(price),'storeName':storeName,'storeScore':storeScore})

        infos['priceInfo'] = priceInfo

        # tableList = sel.xpath('//table[@class="specTable"]')
        # print 'tableList:'+str(len(tableList))
        #
        # for table in tableList:
        #     key = table.xpath('tr[1]/th/text()')[0].extract().strip()
        #     if key == 'Important Note':
        #         val = table.xpath('tr[2]/td/text()')[0].extract().strip()
        #         infos[key] = val
        #     else:
        #         trs = table.xpath('tr')
        #         tinfo = {}
        #         for tr in trs:
        #             tds = tr.xpath('td')
        #             if len(tds)>0:
        #                 k1 = tds[0].xpath('text()')[0].extract().strip()
        #                 v1 = tds[1].xpath('text()')[0].extract().strip()
        #                 tinfo[k1] = v1
        #         infos[key] = tinfo

        fkGiveStar = sel.xpath('//ul[@class="fk-give-star"]')
        if len(fkGiveStar)>0:
            rate = fkGiveStar[0].xpath('@data-rating-count').extract()[0].strip()
            rate = rate.replace(',', '')
            infos['rate'] = int(rate)

        ratings = sel.xpath('//ul[@class="ratingsDistribution"]')
        if len(ratings)>0:
            rate5 = ratings[0].xpath('li[1]/a/div/div/text()')[0].extract().strip()
            rate5 = rate5.replace(',', '')
            infos['rate5'] = int(rate5)
            rate4 = ratings[0].xpath('li[2]/a/div/div/text()')[0].extract().strip()
            rate4 = rate4.replace(',', '')
            infos['rate4'] = int(rate4)
            rate3 = ratings[0].xpath('li[3]/a/div/div/text()')[0].extract().strip()
            rate3 = rate3.replace(',', '')
            infos['rate3'] = int(rate3)
            rate2 = ratings[0].xpath('li[4]/a/div/div/text()')[0].extract().strip()
            rate2 = rate2.replace(',', '')
            infos['rate2'] = int(rate2)
            rate1 = ratings[0].xpath('li[5]/a/div/div/text()')[0].extract().strip()
            rate1 = rate1.replace(',', '')
            infos['rate1'] = int(rate1)

        helpfulReviews = sel.xpath('//div[@class="helpfulReviews"]')

        if len(helpfulReviews)>0:
            reviews = helpfulReviews[0].xpath('a')
            if len(reviews)>0:
                review = reviews[0].xpath('text()')[0].extract().strip()
                reviewNum = review.split('(')[1].split(')')[0].replace(',', '')
                infos['reviewNum'] = int(reviewNum)
            else:
                bigReviews = sel.xpath('//div[@class="review bigReview"]')
                infos['reviewNum'] = len(bigReviews)

            reviewLink = helpfulReviews[0].xpath('div[@class="subLine"]/p/a')
            if len(reviewLink)>0:
                reviewHref = reviewLink[0].xpath('@href').extract()[0].strip()
                infos['reviewHref'] = reviewHref

        dataPid = sel.xpath('//div[@id="reco-module-wrapper"]/@data-pid')[0].extract().strip()
        infos['dataPid'] = dataPid

        item['infos'] = infos

        yield item