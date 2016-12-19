# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: http://doc.scrapy.org/en/latest/topics/item-pipeline.html
import pymongo
import requests
import json
from bson.objectid import ObjectId


class modelSpiderPipeline(object):
    collection_name = "model"

    def __init__(self, mongo_db):
        self.mongo_db = mongo_db
        self.req = requests.get("http://localhost:8080/sadmin/activeid/flipkart")
        self.spiderid = json.loads(self.req.text)


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
        if spider.name=="modelspider":
            # self.db[self.collection_name].remove({})
            infos = item['infos']
            for info in infos:
                bone = self.db["brand"].find_one({"spiderid":self.spiderid,"name":info["brand"]})
                brandId = None
                if not bone:
                    insertResult = self.db["brand"].insert({
                        "spiderid":self.spiderid,
                        "name":info["brand"] 
                    })
                    brandId = str(insertResult)
                else:
                    brandId = str(bone["_id"]);

                info["spiderid"] = self.spiderid
                info["brandid"] = brandId
                self.db[self.collection_name].insert(info)
            return item
        else:
            return item

class modelDetailSpiderPipeline(object):
    collection_name = "model"

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
        if spider.name=="modeldetailspider":
            # self.db[self.collection_name].remove({})
            infos = item['infos']
            for info in infos:
                self.db[self.collection_name].update({"_id":ObjectId(info["modleid"])},{"$set":info},False,True)
            return item
        else:
            return item

   

class amazonIndiamodelSpiderPipeline(object):
    collection_name = "model"

    def __init__(self, mongo_db):
        self.mongo_db = mongo_db
        self.req = requests.get("http://localhost:8080/sadmin/activeid/amazonindia")
        self.spiderid = json.loads(self.req.text)


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
        if spider.name=="ainmodelspider":
            # self.db[self.collection_name].remove({})
            infos = item['infos']
            for info in infos:
                bone = self.db["brand"].find_one({"spiderid":self.spiderid,"name":info["brand"]})
                brandId = None
                if not bone:
                    insertResult = self.db["brand"].insert({
                        "spiderid":self.spiderid,
                        "name":info["brand"] 
                    })
                    brandId = str(insertResult)
                else:
                    brandId = str(bone["_id"]);

                info["spiderid"] = self.spiderid
                info["brandid"] = brandId

                productFind = self.db[self.collection_name].find_one({"spiderid":self.spiderid,"title":info["title"]})
                if not productFind:
                    self.db[self.collection_name].insert(info)
            return item
        else:
            return item

class ainModelDetailSpiderPipeline(object):
    collection_name = "model"

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
        if spider.name=="ainmodeldetailspider":
            # self.db[self.collection_name].remove({})
            infos = item['infos']
            for info in infos:
                self.db[self.collection_name].update({"_id":ObjectId(info["modleid"])},{"$set":info},False,True)
            return item
        else:
            return item

class snapDealMSpiderPipeline(object):
    collection_name = "model"

    def __init__(self, mongo_db):
        self.mongo_db = mongo_db
        self.req = requests.get("http://localhost:8080/sadmin/activeid/snapdeal")
        self.spiderid = json.loads(self.req.text)


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
        if spider.name=="snapdealmspider":
            # self.db[self.collection_name].remove({})
            infos = item['infos']
            for info in infos:
                info["spiderid"] = self.spiderid
                self.db[self.collection_name].insert(info)
            return item
        else:
            return item

class snapDealmDetailSpiderPipeline(object):
    collection_name = "model"

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
        if spider.name=="snapdealmdetailspider":
            # self.db[self.collection_name].remove({})
            infos = item['infos']
            for info in infos:
                bone = self.db["brand"].find_one({"spiderid": info["spiderid"], "name": info["brand"]})
                brandId = None
                if not bone:
                    insertResult = self.db["brand"].insert({
                        "spiderid": info["spiderid"],
                        "name": info["brand"]
                    })
                    brandId = str(insertResult)
                else:
                    brandId = str(bone["_id"]);

                info["brandid"] = brandId
                self.db[self.collection_name].update({"_id":ObjectId(info["modleid"])},{"$set":info},False,True)
            return item
        else:
            return item


class jumiaMSpiderPipeline(object):
    collection_name = "model"

    def __init__(self, mongo_db):
        self.mongo_db = mongo_db
        self.req = requests.get("http://localhost:8080/sadmin/activeid/jumia")
        self.spiderid = json.loads(self.req.text)


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
        if spider.name=="jumiamspider":
            # self.db[self.collection_name].remove({})
            infos = item['infos']
            for info in infos:
                bone = self.db["brand"].find_one({"spiderid": self.spiderid, "name": info["brand"]})
                brandId = None
                if not bone:
                    insertResult = self.db["brand"].insert({
                        "spiderid": self.spiderid,
                        "name": info["brand"]
                    })
                    brandId = str(insertResult)
                else:
                    brandId = str(bone["_id"]);

                info["spiderid"] = self.spiderid
                info["brandid"] = brandId
                self.db[self.collection_name].insert(info)
            return item
        else:
            return item

class jumialDetailSpiderPipeline(object):
    collection_name = "model"

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
        if spider.name=="jumiamdetailspider":
            # self.db[self.collection_name].remove({})
            infos = item['infos']
            for info in infos:
                self.db[self.collection_name].update({"_id":ObjectId(info["modleid"])},{"$set":info},False,True)
            return item
        else:
            return item
