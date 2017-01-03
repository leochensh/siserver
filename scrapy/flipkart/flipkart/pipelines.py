# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: http://doc.scrapy.org/en/latest/topics/item-pipeline.html
import pymongo
import requests
import json
import re
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

class parktelMSpiderPipeline(object):
    collection_name = "model"

    def __init__(self, mongo_db):
        self.mongo_db = mongo_db
        self.req = requests.get("http://localhost:8080/sadmin/activeid/parktel")
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
        if spider.name=="parktelmspider":
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

class parktelDetailSpiderPipeline(object):
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
        if spider.name=="parktelmdetailspider":
            # self.db[self.collection_name].remove({})
            infos = item['infos']
            for info in infos:
                self.db[self.collection_name].update({"_id":ObjectId(info["modleid"])},{"$set":info},False,True)
            return item
        else:
            return item


nbrandInfoArray = [
    {"re":"(Xiaomi|xiaomi)","brand":"Xiaomi"},
    {"re":"(Nokia|nokia)","brand":"Nokia"},
    {"re": "(Tecno|tecno)", "brand": "Tecno"},
    {"re": "(Sony|sony|Xperia)", "brand": "Sony"},
    {"re": "(Gionee|gionee)", "brand": "Gionee"},
    {"re": "(Samsung|Galaxy)", "brand": "Samsung"},
    {"re": "(Infinix|infinix)", "brand": "Infinix"},
    {"re": "(Blackberry)", "brand": "Blackberry"},
    {"re": "(HTC)", "brand": "HTC"},
    {"re":"Motorola","brand":"Motorola"},
    {"re":"Lenovo","brand":"Lenovo"}
]

class nairalandMSpiderPipeline(object):
    collection_name = "model"

    def __init__(self, mongo_db):
        self.mongo_db = mongo_db
        self.req = requests.get("http://localhost:8080/sadmin/activeid/nairaland")
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
        if spider.name=="nairlandmspider":
            # self.db[self.collection_name].remove({})
            infos = item['infos']
            for info in infos:
                for bi in nbrandInfoArray:
                    if re.search(bi["re"],info["title"]):
                        bone = self.db["brand"].find_one({"spiderid": self.spiderid, "name": bi["brand"]})
                        brandId = None
                        if not bone:
                            insertResult = self.db["brand"].insert({
                                "spiderid": self.spiderid,
                                "name": bi["brand"]
                            })
                            brandId = str(insertResult)
                        else:
                            brandId = str(bone["_id"]);
                        info["spiderid"] = self.spiderid
                        info["brandid"] = brandId
                        self.db[self.collection_name].insert(info)
                        break
            return item
        else:
            return item

class nairalandDetailSpiderPipeline(object):
    collection_name = "keyword"

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
        if spider.name=="nairalandmdetailspider":
            # self.db[self.collection_name].remove({})
            infos = item['infos']
            for info in infos:
                bone = self.db[self.collection_name].find_one({"spiderid": info["spiderid"], "brandid": info["brandid"],"word":info["word"]})
                if bone:
                    bone["count"] = bone["count"]+1
                    self.db[self.collection_name].update({"_id":ObjectId(bone["_id"])},{"$set":bone},False,True)
                else:
                    bone = {
                        "brandid":info["brandid"],
                        "spiderid":info["spiderid"],
                        "word":info["word"],
                        "count":1
                    }
                    self.db[self.collection_name].insert(bone)
            return item
        else:
            return item