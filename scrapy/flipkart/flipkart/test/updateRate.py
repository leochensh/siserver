#-*- coding:utf-8 -*-
import re,pymongo,json,urllib2,time,math

def count():
    client = pymongo.MongoClient()
    db = client["flipkart"]
    flipkartData = db['flipkartData'].find({'rate':0})
    for fd in flipkartData:
        rate = fd["rate1"]+fd["rate2"]+fd["rate3"]+fd["rate4"]+fd["rate5"]
        db['flipkartData'].update({ "_id":fd["_id"] } ,{ '$set' : { "rate" : rate} },False,True)

#count()

def count1():
    client = pymongo.MongoClient()
    db = client["flipkart"]
    flipkartData = db['flipkartData'].find({})
    for fd in flipkartData:
        allRate = fd["rate1"]+fd["rate2"]*2+fd["rate3"]*3+fd["rate4"]*4+fd["rate5"]*5
        rate = fd["rate"]
        if rate>0:
            db['flipkartData'].update({ "_id":fd["_id"] } ,{ '$set' : { "rating" : round(float(allRate)/rate, 1)} },False,True)

count1()