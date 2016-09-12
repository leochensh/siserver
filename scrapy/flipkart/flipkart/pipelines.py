# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: http://doc.scrapy.org/en/latest/topics/item-pipeline.html
import pymongo
import requests
import json

req = requests.get("http://localhost:8080/sadmin/activeid/flipkart")
spiderid = json.loads(req.text)

class brandPipeline(object):
    collection_name = "brand"

    def __init__(self, mongo_db):
        self.mongo_db = mongo_db

    @classmethod
    def from_crawler(cls, crawler):
        return cls(
        mongo_db=crawler.settings.get('MONGO_DATABASE')
        )

    def open_spider(self, spider):
        #self.client = pymongo.MongoClient("192.168.1.188",27017)
        self.client = pymongo.MongoClient()
        self.db = self.client[self.mongo_db]
        print spiderid
        self.db[self.collection_name].remove({"spiderid":spiderid})

    def close_spider(self, spider):
        self.client.close()

    def process_item(self, item, spider):
        if spider.name=="brandspider":
            # self.db[self.collection_name].remove({})
            infos = item['infos']
            for info in infos:
                info["spiderid"] = spiderid
                self.db[self.collection_name].insert(info)
            return item
        else:
            return item


class brandNumPipeline(object):
    collection_name = "brand"

    def __init__(self, mongo_db):
        self.mongo_db = mongo_db

    @classmethod
    def from_crawler(cls, crawler):
        return cls(
        mongo_db=crawler.settings.get('MONGO_DATABASE')
        )

    def open_spider(self, spider):
        #self.client = pymongo.MongoClient("192.168.1.188",27017)
        self.client = pymongo.MongoClient()
        self.db = self.client[self.mongo_db]

    def close_spider(self, spider):
        self.client.close()

    def process_item(self, item, spider):
        if spider.name=="brandNumspider":
            infos = item['infos']
            self.db[self.collection_name].update( { "brand" : infos["brand"],"spiderid":spiderid} ,{ '$set' : { "num" : infos["num"]} },False,True );
            return item
        else:
            return item


class offerLinkPipeline(object):
    collection_name = "link"

    def __init__(self, mongo_db):
        self.mongo_db = mongo_db

    @classmethod
    def from_crawler(cls, crawler):
        return cls(
        mongo_db=crawler.settings.get('MONGO_DATABASE')
        )

    def open_spider(self, spider):
        #self.client = pymongo.MongoClient("192.168.1.188",27017)
        self.client = pymongo.MongoClient()
        self.db = self.client[self.mongo_db]
        self.db[self.collection_name].remove({"spiderid": spiderid})

    def close_spider(self, spider):
        self.client.close()

    def process_item(self, item, spider):
        if spider.name=="linkspider":
            infos = item['infos']
            for info in infos:
                # existI = self.db[self.collection_name].find_one({"dataPid":info["dataPid"]})
                # if existI:
                #     self.db[self.collection_name].remove({"dataPid":info["dataPid"]})
                info["spiderid"] = spiderid
                self.db[self.collection_name].insert(info)
            return item
        else:
            return item

class offerInfoPipeline(object):
    collection_name = "flipkartData"

    def __init__(self, mongo_db):
        self.mongo_db = mongo_db

    @classmethod
    def from_crawler(cls, crawler):
        return cls(
        mongo_db=crawler.settings.get('MONGO_DATABASE')
        )

    def open_spider(self, spider):
        #self.client = pymongo.MongoClient("192.168.1.188",27017)
        self.client = pymongo.MongoClient()
        self.db = self.client[self.mongo_db]

    def close_spider(self, spider):
        self.client.close()

    def process_item(self, item, spider):
        if spider.name=="infospider":
            infos = item['infos']
            existI = self.db[self.collection_name].find_one({"dataPid":infos["dataPid"]})
            if existI:
                self.db[self.collection_name].remove({"dataPid":infos["dataPid"]})
            self.db[self.collection_name].insert(infos)
            return item
        else:
            return item



class reviewPipeline(object):
    collection_name = "review"

    def __init__(self, mongo_db):
        self.mongo_db = mongo_db

    @classmethod
    def from_crawler(cls, crawler):
        return cls(
        mongo_db=crawler.settings.get('MONGO_DATABASE')
        )

    def open_spider(self, spider):
        #self.client = pymongo.MongoClient("192.168.1.188",27017)
        self.client = pymongo.MongoClient()
        self.db = self.client[self.mongo_db]

    def close_spider(self, spider):
        self.client.close()

    def process_item(self, item, spider):
        if spider.name=="reviewspider":
            infos = item['infos']
            for info in infos:
                existI = self.db[self.collection_name].find_one({"dataPid":info["dataPid"],"reviewId":info["reviewId"]})
                if existI:
                    self.db[self.collection_name].remove({"dataPid":info["dataPid"],"reviewId":info["reviewId"]})
                self.db[self.collection_name].insert(info)
            return item
        else:
            return item