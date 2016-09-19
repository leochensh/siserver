#-*- coding:utf-8 -*-
import re,pymongo,json,urllib2,time,math

def count():
    count = 0
    client = pymongo.MongoClient()
    db = client["flipkart"]
    brandInfo = db['brand'].find({},{'_id':0})
    for bi in brandInfo:
        count+=bi['num']

    print count

count()

def count1():
    count1 = 0
    client = pymongo.MongoClient()
    db = client["flipkart"]
    flipkartData = db['flipkartData'].find({},{'_id':0,'reviewNum':1})
    for fd in flipkartData:
        count1+=fd['reviewNum']

    print count1

count1()